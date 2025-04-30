from flask import Flask, jsonify
from flask_cors import CORS
from ml_service.model import RecommendationModel

app = Flask(__name__)
CORS(app)  # allow requests from your React dev server
rec = RecommendationModel()

@app.route("/recommendations/<user_id>", methods=["GET"])
def recommend(user_id):
    return jsonify(rec.get_recommendations(user_id))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)