"""
Handwritten Digit Recognizer
-----------------------------
Trains an SVM classifier on sklearn's built-in digits dataset (8x8 grayscale images).
Provides a tkinter GUI where users draw a digit with the mouse, then click Predict
to get the model's classification and per-class confidence scores.
"""

import tkinter as tk
import numpy as np
import matplotlib
matplotlib.use("TkAgg")
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from PIL import Image, ImageDraw, ImageTk
from sklearn import datasets
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score


CANVAS_SIZE = 280   # drawing canvas side length in pixels
BRUSH_RADIUS = 13   # half-width of the drawing brush
IMG_SIZE = 8        # target size that matches the training images


class DigitRecognizer:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.accuracy = 0.0
        self._train()
        self._build_gui()

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def _train(self):
        print("Loading dataset and training model ...")
        digits = datasets.load_digits()          # 1797 samples of 8x8 digits
        X, y = digits.data, digits.target        # pixel values 0-16, labels 0-9

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        self.scaler = StandardScaler()
        X_train_s = self.scaler.fit_transform(X_train)
        X_test_s  = self.scaler.transform(X_test)

        # RBF-SVM with probability calibration enabled for confidence scores
        self.model = SVC(kernel="rbf", C=10, gamma=0.001, probability=True)
        self.model.fit(X_train_s, y_train)

        self.accuracy = accuracy_score(y_test, self.model.predict(X_test_s))
        print(f"Training complete - test accuracy: {self.accuracy:.2%}")

    # ------------------------------------------------------------------
    # GUI
    # ------------------------------------------------------------------

    def _build_gui(self):
        self.root = tk.Tk()
        self.root.title("Handwritten Digit Recognizer")
        self.root.resizable(False, False)
        self.root.configure(bg="#1e1e2e")

        # ── Header ──────────────────────────────────────────────────────
        tk.Label(
            self.root, text="Handwritten Digit Recognizer",
            font=("Helvetica", 18, "bold"), fg="white", bg="#1e1e2e"
        ).pack(pady=(14, 2))

        tk.Label(
            self.root,
            text=f"SVM (RBF kernel)  |  Dataset: sklearn digits  |  Accuracy: {self.accuracy:.2%}",
            font=("Helvetica", 10), fg="#a0a0b0", bg="#1e1e2e"
        ).pack(pady=(0, 10))

        # ── Main two-column layout ───────────────────────────────────────
        main = tk.Frame(self.root, bg="#1e1e2e")
        main.pack(padx=20, pady=5)

        self._build_left_panel(main)
        self._build_right_panel(main)

        # ── Off-screen PIL image (same pixel buffer as the canvas) ───────
        self.pil_img  = Image.new("L", (CANVAS_SIZE, CANVAS_SIZE), 0)
        self.pil_draw = ImageDraw.Draw(self.pil_img)

        self.root.mainloop()

    def _build_left_panel(self, parent):
        frame = tk.Frame(parent, bg="#1e1e2e")
        frame.pack(side="left", padx=(0, 15))

        tk.Label(
            frame, text="Draw a digit (0 – 9) :",
            font=("Helvetica", 12), fg="white", bg="#1e1e2e"
        ).pack(anchor="w")

        # Drawing canvas
        self.canvas = tk.Canvas(
            frame, width=CANVAS_SIZE, height=CANVAS_SIZE,
            bg="black", cursor="crosshair",
            highlightthickness=2, highlightbackground="#555577"
        )
        self.canvas.pack(pady=6)
        self.canvas.bind("<B1-Motion>",       self._on_draw)
        self.canvas.bind("<ButtonRelease-1>", lambda _e: None)

        # Buttons
        btn_row = tk.Frame(frame, bg="#1e1e2e")
        btn_row.pack()

        tk.Button(
            btn_row, text="  Predict  ", command=self._predict,
            font=("Helvetica", 12, "bold"),
            bg="#4ade80", fg="#1e1e2e", relief="flat",
            padx=12, pady=8, cursor="hand2"
        ).pack(side="left", padx=6)

        tk.Button(
            btn_row, text="  Clear  ", command=self._clear,
            font=("Helvetica", 12),
            bg="#f87171", fg="white", relief="flat",
            padx=12, pady=8, cursor="hand2"
        ).pack(side="left", padx=6)

        # Big prediction display
        self.pred_label = tk.Label(
            frame, text="?",
            font=("Helvetica", 90, "bold"),
            fg="#4ade80", bg="#1e1e2e", width=2
        )
        self.pred_label.pack(pady=8)

    def _build_right_panel(self, parent):
        frame = tk.Frame(parent, bg="#1e1e2e")
        frame.pack(side="left")

        tk.Label(
            frame, text="Confidence per digit :",
            font=("Helvetica", 12), fg="white", bg="#1e1e2e"
        ).pack(anchor="w")

        # Matplotlib bar chart
        plt.style.use("dark_background")
        self.fig, self.ax = plt.subplots(figsize=(4.2, 3.6))
        self.fig.patch.set_facecolor("#1e1e2e")
        self.ax.set_facecolor("#2a2a3e")
        self._draw_empty_chart()

        self.mpl_canvas = FigureCanvasTkAgg(self.fig, master=frame)
        self.mpl_canvas.draw()
        self.mpl_canvas.get_tk_widget().pack(pady=4)

        # 8×8 thumbnail preview
        tk.Label(
            frame, text="8 × 8 input sent to model :",
            font=("Helvetica", 10), fg="#a0a0b0", bg="#1e1e2e"
        ).pack()

        self.preview_lbl = tk.Label(frame, bg="#1e1e2e")
        self.preview_lbl.pack(pady=4)

    # ------------------------------------------------------------------
    # Chart helpers
    # ------------------------------------------------------------------

    def _draw_empty_chart(self):
        self.ax.clear()
        self.ax.barh(range(10), [0] * 10, color="#60a5fa")
        self.ax.set_yticks(range(10))
        self.ax.set_yticklabels([str(i) for i in range(10)], color="white", fontsize=11)
        self.ax.set_xlim(0, 1)
        self.ax.set_xlabel("Probability", color="#a0a0b0")
        self.ax.set_title("Draw and click Predict", color="#a0a0b0", fontsize=9)
        self.ax.tick_params(colors="#a0a0b0")
        self.fig.tight_layout()

    def _update_chart(self, proba, pred):
        self.ax.clear()
        colors = ["#4ade80" if i == pred else "#60a5fa" for i in range(10)]
        self.ax.barh(range(10), proba, color=colors)
        self.ax.set_yticks(range(10))
        self.ax.set_yticklabels([str(i) for i in range(10)], color="white", fontsize=11)
        self.ax.set_xlim(0, 1)
        self.ax.set_xlabel("Probability", color="#a0a0b0")
        self.ax.set_title(
            f"Predicted: {pred}  ({proba[pred]:.1%} confidence)",
            color="#4ade80", fontsize=11, fontweight="bold"
        )
        self.ax.tick_params(colors="#a0a0b0")
        self.fig.tight_layout()
        self.mpl_canvas.draw()

    # ------------------------------------------------------------------
    # Event handlers
    # ------------------------------------------------------------------

    def _on_draw(self, event):
        x, y = event.x, event.y
        r = BRUSH_RADIUS
        self.canvas.create_oval(x - r, y - r, x + r, y + r,
                                fill="white", outline="white")
        self.pil_draw.ellipse([x - r, y - r, x + r, y + r], fill=255)

    def _predict(self):
        # Resize drawing to 8x8 to match the training image size
        small = self.pil_img.resize((IMG_SIZE, IMG_SIZE), Image.LANCZOS)

        # Convert pixel range 0-255 → 0-16 (the range used by the digits dataset)
        arr = np.array(small, dtype=float) / 255.0 * 16.0
        flat = arr.flatten().reshape(1, -1)
        flat_scaled = self.scaler.transform(flat)

        pred  = self.model.predict(flat_scaled)[0]
        proba = self.model.predict_proba(flat_scaled)[0]

        self.pred_label.config(text=str(pred))
        self._update_chart(proba, pred)
        self._show_preview(small)

    def _show_preview(self, small_img):
        # Scale the 8x8 thumbnail up so it is visible next to the chart
        big = small_img.resize((72, 72), Image.NEAREST)
        photo = ImageTk.PhotoImage(big)
        self.preview_lbl.config(image=photo)
        self.preview_lbl.image = photo   # keep reference to prevent GC

    def _clear(self):
        self.canvas.delete("all")
        self.pil_img  = Image.new("L", (CANVAS_SIZE, CANVAS_SIZE), 0)
        self.pil_draw = ImageDraw.Draw(self.pil_img)
        self.pred_label.config(text="?")
        self.preview_lbl.config(image="")
        self.preview_lbl.image = None
        self._draw_empty_chart()
        self.mpl_canvas.draw()


# ------------------------------------------------------------------
# Entry point
# ------------------------------------------------------------------

if __name__ == "__main__":
    DigitRecognizer()
