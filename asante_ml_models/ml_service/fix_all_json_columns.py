import psycopg2
import re
import json
import ast

def fix_json_string(s):
    if not s or s.strip() == '[]':
        return '[]'
    try:
        return json.dumps(json.loads(s))
    except json.JSONDecodeError:
        try:
            s_fixed = re.sub(r'([{,\[]\s*)(\w+)(\s*:)', r'\1"\2"\3', s.replace("'", '"'))
            s_fixed = re.sub(r'(:\s*)(\w+)([,\}])', r'\1"\2"\3', s_fixed)
            return json.dumps(json.loads(s_fixed))
        except Exception:
            try:
                return json.dumps(ast.literal_eval(s))
            except Exception:
                return '[]'

def main():
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password="ASANTe@cu",
        host="asante-postgres",
        port="5432"
    )
    cur = conn.cursor()
    cur.execute("SELECT user_id, browsing_behavior, transaction_history, nonprofits_donations_history FROM asante_customers;")
    rows = cur.fetchall()

    updated_count = 0
    for user_id, browsing, transaction, donations in rows:
        fixed_b = fix_json_string(browsing)
        fixed_t = fix_json_string(transaction)
        fixed_n = fix_json_string(donations)

        cur.execute("""
            UPDATE asante_customers 
            SET browsing_behavior = %s,
                transaction_history = %s,
                nonprofits_donations_history = %s
            WHERE user_id = %s;
        """, (fixed_b, fixed_t, fixed_n, user_id))
        updated_count += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"✅ Fixed and updated {updated_count} users.")

if __name__ == "__main__":
    main()