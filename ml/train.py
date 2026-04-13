import pandas as pd
import random
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# Create folders if not exist
os.makedirs("data", exist_ok=True)
os.makedirs("models", exist_ok=True)

skills = ["JS", "React", "Python", "Node"]

data = []

# Generate dataset
for _ in range(1000):
    row = {}

    for skill in skills:
        score = random.randint(0, 10)
        row[skill] = score / 10  # normalize

        # assign level
        if score < 4:
            row[f"{skill}_level"] = 0
        elif score < 7:
            row[f"{skill}_level"] = 1
        else:
            row[f"{skill}_level"] = 2

    data.append(row)

df = pd.DataFrame(data)

# Save dataset
df.to_csv("data/students.csv", index=False)

# Features
X = df[["JS", "React", "Python", "Node"]]

# Multi-output targets
y = df[["JS_level", "React_level", "Python_level", "Node_level"]]

# Train model
model = RandomForestClassifier()
model.fit(X, y)

# Save model
joblib.dump(model, "models/model.pkl")

print("✅ Model trained and saved successfully")