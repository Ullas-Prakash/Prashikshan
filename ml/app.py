from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

# Load trained model
model = joblib.load("models/model.pkl")

# Map levels
level_map = ["beginner", "intermediate", "advanced"]

@app.route("/")
def home():
    return "ML API Running 🚀"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        if "scores" not in data:
            return jsonify({"error": "Missing 'scores' field"}), 400

        scores = data["scores"]

        if len(scores) != 4:
            return jsonify({"error": "Exactly 4 scores required"}), 400

        # Predict
        prediction = model.predict([scores])[0]

        # Convert to labels
        levels = [level_map[int(p)] for p in prediction]

        return jsonify({"levels": levels})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=8000)