import pandas as pd
import random
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

os.makedirs("data", exist_ok=True)
os.makedirs("models", exist_ok=True)

skills = ["javascript", "react", "python", "nodejs"]

data = []

# Generate synthetic dataset aligned with 3-tier competency engine
for _ in range(1000):
    row = {}
    for skill in skills:
        score = random.randint(0, 100) / 100.0  # normalized float 0.0 - 1.0
        row[skill] = score

        # 3-tier classification: beginner (<0.50), intermediate (0.50-0.79), legend (>=0.80)
        if score < 0.50:
            row[f"{skill}_level"] = 0
        elif score < 0.80:
            row[f"{skill}_level"] = 1
        else:
            row[f"{skill}_level"] = 2

    data.append(row)

df = pd.DataFrame(data)
df.to_csv("data/students.csv", index=False)

X = df[["javascript", "react", "python", "nodejs"]]
y = df[["javascript_level", "react_level", "python_level", "nodejs_level"]]

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

joblib.dump(model, "models/model.pkl")
print("[OK] Model trained and saved successfully with 3-tier classification (beginner, intermediate, legend).")