import sys
import joblib

SKILLS = ['javascript', 'react', 'python', 'node']
LEVEL_MAP = {0: 'beginner', 1: 'intermediate', 2: 'advanced'}

def predict(scores: list) -> list:
    """
    scores: [js_score, react_score, python_score, node_score]
    returns: ['beginner', 'intermediate', ...] one per skill
    """
    models = joblib.load('models/model.pkl')
    return [LEVEL_MAP[int(models[skill].predict([[score]])[0])]
            for skill, score in zip(SKILLS, scores)]

if __name__ == '__main__':
    # Usage: python predict.py 7 3 8 5
    scores = [float(x) for x in sys.argv[1:]] if len(sys.argv) == 5 else [5.0, 3.0, 8.0, 4.0]

    levels = predict(scores)
    for skill, level in zip(SKILLS, levels):
        print(f"{skill}: {level}")
