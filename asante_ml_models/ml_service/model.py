import os
import json
import re
import psycopg2
import pandas as pd
import numpy as np
from scipy.sparse import csr_matrix
from sklearn.neighbors import NearestNeighbors
from implicit.als import AlternatingLeastSquares
from lightfm import LightFM
import logging

# Initialize logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RecommendationModel:
    def __init__(self):
        # Use the module-level logger
        logger.info("Initializing RecommendationModel...")
        # DB connection setup
        self.conn = psycopg2.connect(
            dbname=os.getenv("DB_NAME", "postgres"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "ASANTe@cu"),
            host=os.getenv("DB_HOST", "asante-postgres"),
            port=os.getenv("DB_PORT", "5432")
        )

        self._load_data()
        self._train_models()

    def _parse_json_column(self, df, column_name):
        import ast
        error_count = 0
        max_errors_to_log = 5

        def try_fix_json(x):
            nonlocal error_count
            if pd.isna(x) or str(x).strip() == "[]":
                return []

            try:
                return json.loads(x)
            except json.JSONDecodeError:
                try:
                    # Fix unquoted keys and values, and ensure booleans are lowercase
                    x_fixed = x.replace("true", "true").replace("false", "false")
                    x_fixed = re.sub(r'([{,\[]\s*)(\w+)(\s*:)', r'\1"\2"\3', x_fixed)
                    x_fixed = re.sub(r'(:\s*)([^"\[\{][^,\}\]]*)', lambda m: f': "{m.group(2).strip()}"', x_fixed)
                    return json.loads(x_fixed)
                except Exception:
                    try:
                        return ast.literal_eval(x)
                    except Exception:
                        if error_count < max_errors_to_log:
                            logger.warning(f"⚠️ JSON parse failed in '{column_name}': {x}")
                            error_count += 1
                        return []

    def _load_data(self):
        self.products = pd.read_sql("SELECT product_id, current_price_usd, rating, sales_volume FROM asante_products;", self.conn)
        self.businesses = pd.read_sql("SELECT * FROM asante_business;", self.conn)
        self.nonprofits = pd.read_sql("SELECT ein, category AS cause, revenue_amt FROM asante_nonprofits;", self.conn)
        self.transactions = pd.read_sql("SELECT * FROM asante_transactions;", self.conn)
        self.customers = pd.read_sql("SELECT * FROM asante_customers;", self.conn)

        self._parse_json_column(self.customers, 'browsing_behavior')
        self._parse_json_column(self.customers, 'transaction_history')
        self._parse_json_column(self.customers, 'nonprofits_donations_history')

    def _train_models(self):
        X = self.products[['current_price_usd','rating','sales_volume']].fillna(0)
        self.prod_knn = NearestNeighbors(n_neighbors=5).fit(X)

        ub = self.transactions.pivot_table(index='user_id', columns='business_id', values='transaction_total_price', fill_value=0)
        self.als_user_index = list(ub.index)
        self.als_business_index = list(ub.columns)
        self.user_business_matrix = csr_matrix(ub.values, dtype=np.float32)
        self.als = AlternatingLeastSquares(factors=20)
        self.als.fit(self.user_business_matrix)

        up = self.transactions.pivot_table(index='user_id', columns='product_id', values='transaction_total_price', fill_value=0)
        self.lfm_user_index = list(up.index)
        self.lfm_product_index = list(up.columns)
        self.user_product_matrix = csr_matrix(up.values, dtype=np.float32)
        self.lfm = LightFM(loss='warp')
        self.lfm.fit(self.user_product_matrix, epochs=10, num_threads=4)

    def get_recommendations(self, user_id: str):
        user_tr = self.transactions[self.transactions.user_id == user_id]
        customer_row = self.customers[self.customers.user_id == user_id]

        if customer_row.empty:
            return {'product_ids': [], 'business_ids': [], 'nonprofit_ids': []}

        # Extract browsing behavior
        browsing = customer_row['browsing_behavior'].values[0]

        # Handle cases where browsing is a list (due to fixed JSON structure)
        if isinstance(browsing, list):
            browsing = browsing[0] if browsing else {}

        elif not isinstance(browsing, dict):
            browsing = {}

        viewed_products = browsing.get('viewed_products', [])
        search_terms = browsing.get('search_history', [])

        # --- Content-based product recommendations ---
        cb_recs = []
        if not user_tr.empty:
            last_pid = user_tr.sort_values('transaction_date').iloc[-1].product_id
            product_match = self.products[self.products['product_id'] == last_pid]
            if not product_match.empty:
                idx = product_match.index[0]
                query_vec = self.products[['current_price_usd','rating','sales_volume']].iloc[idx].values.reshape(1, -1)
                distances, indices = self.prod_knn.kneighbors(query_vec)
                cb_recs = self.products.iloc[indices[0]]['product_id'].astype(str).tolist()

        # --- LightFM product recommendations ---
        lfm_recs = []
        if user_id in self.lfm_user_index:
            uidx = self.lfm_user_index.index(user_id)
            scores = self.lfm.predict(uidx, np.arange(len(self.lfm_product_index)))
            top_idx = np.argsort(-scores)[:5]
            lfm_recs = [str(self.lfm_product_index[i]) for i in top_idx]

        # --- Viewed products boost ---
        viewed_recs = [pid for pid in viewed_products if pid in self.products.product_id.values][:5]
        prod_ids = list(dict.fromkeys(cb_recs + lfm_recs + viewed_recs))

        # --- ALS business recommendations ---
        biz_recs = []
        if user_id in self.als_user_index:
            uidx = self.als_user_index.index(user_id)
            biz_indices, _ = self.als.recommend(uidx, self.user_business_matrix[uidx], N=5)
            biz_recs = [str(self.als_business_index[i]) for i in biz_indices]
            # Replace print statements with logger
            logger.info("ALS Recommendations biz_indices: %s", biz_indices)
            logger.info("ALS Recommendations biz_recs: %s", biz_recs)

        # --- Nonprofit recommendations ---
        donation_history = customer_row['nonprofits_donations_history'].values[0]
        donated_eins = [str(entry.get("nonprofit_id")) for entry in donation_history] if isinstance(donation_history, list) else []

        prefs_raw = customer_row['cause_preferences'].values[0]
        prefs = [c.strip() for c in prefs_raw.split(',')] if pd.notna(prefs_raw) else []

        # Prioritize matches by donation history and cause alignment
        match_from_donations = self.nonprofits[self.nonprofits.ein.astype(str).isin(donated_eins)]
        match_from_prefs = self.nonprofits[self.nonprofits.cause.isin(prefs)]

        # Combine and rank by revenue_amt
        all_matches = pd.concat([match_from_donations, match_from_prefs]).drop_duplicates(subset="ein")
        np_recs = all_matches.sort_values('revenue_amt', ascending=False).ein.astype(str).head(5).tolist()

        print("CAUSE PREFERENCES:", prefs)
        print("DONATED EINs:", donated_eins)
        print("MATCHED NONPROFITS:", all_matches[['ein', 'cause', 'revenue_amt']])
        print("RECOMMENDED NONPROFITS:", np_recs)

        return {
            "product_ids": prod_ids,
            "business_ids": biz_recs,
            "nonprofit_ids": np_recs or []
        }