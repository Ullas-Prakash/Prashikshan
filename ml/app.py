from flask import Flask, request, jsonify
import joblib
import os

app = Flask(__name__)

# Load model if present, otherwise set None (graceful fallback)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "model.pkl")
model = None
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
    except Exception as e:
        print(f"Warning: Could not load model: {e}")

LEVEL_MAP = {0: "beginner", 1: "intermediate", 2: "legend"}
POSITIONAL_FEATURES = ["javascript", "react", "python", "nodejs"]
ALIAS_MAP = {
    "js": "javascript",
    "node": "nodejs",
    "node.js": "nodejs",
}

def normalize_skill_name(name):
    clean = str(name).strip().lower()
    return ALIAS_MAP.get(clean, clean)

def rule_based_tier(score):
    if score >= 0.80:
        return "legend"
    elif score >= 0.50:
        return "intermediate"
    return "beginner"

@app.route("/")
def home():
    return jsonify({"status": "ok", "service": "prashikshan-ml", "model_loaded": model is not None})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json() or {}

        # 1. Handle flexible "skills" dictionary input
        if "skills" in data and isinstance(data["skills"], dict):
            raw_skills = data["skills"]
            normalized_skills = {}
            for k, v in raw_skills.items():
                try:
                    val = float(v)
                    # Handle 0-100 scale inputs vs 0-1 scale inputs
                    val = val / 100.0 if val > 1.0 else val
                except (ValueError, TypeError):
                    val = 0.0
                normalized_skills[normalize_skill_name(k)] = val

            # Extract 4 positional feature values
            feature_vector = [normalized_skills.get(feat, 0.0) for feat in POSITIONAL_FEATURES]

            levels_result = {}
            if model is not None:
                try:
                    pred = model.predict([feature_vector])[0]
                    for idx, feat in enumerate(POSITIONAL_FEATURES):
                        # pred[idx] may be int, float, or string depending on joblib version
                        raw_label = pred[idx] if idx < len(pred) else 0
                        try:
                            label_int = int(float(raw_label))
                        except (ValueError, TypeError):
                            label_int = -1
                        levels_result[feat] = LEVEL_MAP.get(label_int, rule_based_tier(feature_vector[idx]))
                except Exception as model_err:
                    print(f"[ML] Model predict failed ({model_err}), using rule-based fallback.")
                    for feat in POSITIONAL_FEATURES:
                        levels_result[feat] = rule_based_tier(normalized_skills.get(feat, 0.0))
            else:
                for feat in POSITIONAL_FEATURES:
                    levels_result[feat] = rule_based_tier(normalized_skills.get(feat, 0.0))

            # Include any extra skills provided in request
            for skill_name, score in normalized_skills.items():
                if skill_name not in levels_result:
                    levels_result[skill_name] = rule_based_tier(score)

            return jsonify({"levels": levels_result})

        # 2. Legacy array format support
        elif "scores" in data and isinstance(data["scores"], list):
            scores = [float(s) / 100.0 if float(s) > 1.0 else float(s) for s in data["scores"]]
            while len(scores) < 4:
                scores.append(0.0)
            scores = scores[:4]

            if model is not None:
                pred = model.predict([scores])[0]
                levels = [LEVEL_MAP.get(int(p), rule_based_tier(scores[i])) for i, p in enumerate(pred)]
            else:
                levels = [rule_based_tier(s) for s in scores]

            levels_result = {feat: levels[i] for i, feat in enumerate(POSITIONAL_FEATURES)}
            return jsonify({"levels": levels_result})

        else:
            return jsonify({"error": "Provide a 'skills' dictionary e.g. {'skills': {'javascript': 0.8, 'react': 0.4}} or 'scores' array"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=8000, host="0.0.0.0")