# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

```powershell
# With console output (training progress visible)
python digit_recognizer.py

# Without console window
digit_recognizer.bat
```

## Dependencies

```powershell
pip install scikit-learn pillow matplotlib numpy
```

tkinter ships with the standard Python installer on Windows — no separate install needed.

## Architecture

Single file (`digit_recognizer.py`), single class (`DigitRecognizer`):

| Phase | Methods | Notes |
|---|---|---|
| Training | `_train` | Runs at `__init__`; fits `StandardScaler` + RBF-SVM on sklearn's 8×8 digits dataset (pixel range 0–16). Stores `self.scaler` and `self.model`. |
| GUI layout | `_build_gui`, `_build_left_panel`, `_build_right_panel` | Dark-themed tkinter window. Left: 280×280 drawing canvas + buttons + large digit label. Right: matplotlib bar chart embedded via `FigureCanvasTkAgg` + 72×72 thumbnail. |
| Drawing | `_on_draw` | Simultaneously paints to the tk `Canvas` (visual) and a PIL `ImageDraw` off-screen buffer (pixel data used for inference). |
| Inference | `_predict` | Resizes PIL buffer 280×280 → 8×8 (LANCZOS), rescales 0–255 → 0–16, applies stored scaler, calls `model.predict` + `model.predict_proba`. |

**Key constants** (top of file): `CANVAS_SIZE = 280`, `BRUSH_RADIUS = 13`, `IMG_SIZE = 8`.
