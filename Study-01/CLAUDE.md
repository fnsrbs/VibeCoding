# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

```
Study-01/
├── desktop_version/   # tkinter + sklearn + matplotlib (standalone app)
└── web_version/       # Flask backend + HTML canvas + Chart.js (browser app)
```

Each subfolder has its own `CLAUDE.md` with version-specific run commands, dependencies, and architecture details.

## Shared Design Decisions

Both versions use the same ML pipeline:

- **Model**: RBF-SVM (`sklearn.svm.SVC`, `C=10`, `gamma=0.001`, `probability=True`)
- **Dataset**: `sklearn.datasets.load_digits()` — 1797 samples, 8×8 images, pixel range 0–16
- **Preprocessing**: `StandardScaler` fit on the training split only
- **Train/test split**: 80/20, `stratify=y`, `random_state=42`
- **Pixel rescaling at inference**: user drawing (0–255) → 0–16 before scaling, to match the training distribution
- **Canvas → model input**: the 280×280 drawing is downsampled to 8×8 via LANCZOS before inference
