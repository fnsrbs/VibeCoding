"""
Handwritten Digit Recognizer - Web Version
Flask backend: trains an RBF-SVM on sklearn's digits dataset at startup,
then serves the browser UI and a /predict JSON endpoint.
"""

import io
import base64
import numpy as np
from flask import Flask, request, jsonify, render_template
from PIL import Image
from sklearn import datasets
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score

app = Flask(__name__)

_model = None
_scaler = None
_accuracy = 0.0


def _train():
    global _model, _scaler, _accuracy
    print("Training model ...")
    digits = datasets.load_digits()
    X, y = digits.data, digits.target

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    _scaler = StandardScaler()
    X_train_s = _scaler.fit_transform(X_train)
    X_test_s  = _scaler.transform(X_test)

    _model = SVC(kernel="rbf", C=10, gamma=0.001, probability=True)
    _model.fit(X_train_s, y_train)

    _accuracy = accuracy_score(y_test, _model.predict(X_test_s))
    print(f"Training complete - test accuracy: {_accuracy:.2%}")


@app.route("/")
def index():
    return render_template("index.html", accuracy=f"{_accuracy:.2%}")


@app.route("/predict", methods=["POST"])
def predict():
    data_url = request.json["image"]           # "data:image/png;base64,..."
    img_bytes = base64.b64decode(data_url.split(",")[1])

    img = Image.open(io.BytesIO(img_bytes)).convert("L")
    img = img.resize((8, 8), Image.LANCZOS)

    # 0-255 → 0-16 to match the training pixel range
    arr  = np.array(img, dtype=float) / 255.0 * 16.0
    flat = arr.flatten().reshape(1, -1)
    flat_s = _scaler.transform(flat)

    pred  = int(_model.predict(flat_s)[0])
    proba = _model.predict_proba(flat_s)[0].tolist()

    return jsonify({"prediction": pred, "probabilities": proba})


_train()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
