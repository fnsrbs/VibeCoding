# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

```powershell
pip install -r requirements.txt
python app.py
# → http://localhost:5000
```

## File Structure

```
web_version/
├── app.py                  # Flask server (training + /predict endpoint)
├── requirements.txt
├── templates/
│   └── index.html          # Jinja2 template (passes accuracy from server)
└── static/
    ├── css/style.css       # Dark theme
    └── js/main.js          # Canvas drawing + fetch + Chart.js rendering
```

## Architecture

**Backend (`app.py`)**

- Trains `StandardScaler` + RBF-SVM at import time (module-level `_train()` call), storing `_model` and `_scaler` as module globals.
- `GET /` — renders `index.html`, injects `accuracy` string via Jinja2.
- `POST /predict` — receives `{ "image": "<data URL>" }`, decodes the PNG, resizes to 8×8 with PIL (LANCZOS), rescales pixels 0–255 → 0–16, runs inference, returns `{ "prediction": int, "probabilities": [float × 10] }`.

**Frontend (`static/js/main.js`)**

- Drawing: mouse and touch events paint white circles (radius 13 px) onto a 280×280 `<canvas>`.
- Predict: calls `canvas.toDataURL("image/png")`, POSTs to `/predict`, updates the Chart.js horizontal bar chart and scales the 8×8 offscreen canvas up to 72×72 for the thumbnail preview.
- The Chart.js instance is created once on page load; `chart.update()` is called after each prediction.

**Key pixel-range detail**: the backend converts 0–255 → 0–16 before inference because sklearn's digits dataset uses a 0–16 range. This same conversion is done in the desktop version.
