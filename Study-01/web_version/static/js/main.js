(() => {
  const BRUSH_RADIUS = 13;

  const drawCanvas   = document.getElementById("drawCanvas");
  const previewCanvas = document.getElementById("previewCanvas");
  const predLabel    = document.getElementById("prediction");
  const ctx          = drawCanvas.getContext("2d");
  const previewCtx   = previewCanvas.getContext("2d");

  let isDrawing = false;

  // ── Chart.js setup ──────────────────────────────────────────────────
  const chart = new Chart(document.getElementById("chartCanvas"), {
    type: "bar",
    data: {
      labels: ["0","1","2","3","4","5","6","7","8","9"],
      datasets: [{
        data: new Array(10).fill(0),
        backgroundColor: new Array(10).fill("#60a5fa"),
        borderWidth: 0,
      }],
    },
    options: {
      indexAxis: "y",
      responsive: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Draw and click Predict",
          color: "#a0a0b0",
          font: { size: 12 },
        },
      },
      scales: {
        x: { min: 0, max: 1, ticks: { color: "#a0a0b0" }, grid: { color: "#333" } },
        y: { ticks: { color: "#fff", font: { size: 13 } }, grid: { color: "#333" } },
      },
    },
  });

  // ── Drawing ──────────────────────────────────────────────────────────
  function getPos(e) {
    const rect = drawCanvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }

  function paint(e) {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }

  drawCanvas.addEventListener("mousedown",  (e) => { isDrawing = true; paint(e); });
  drawCanvas.addEventListener("mousemove",  paint);
  drawCanvas.addEventListener("mouseup",    () => { isDrawing = false; });
  drawCanvas.addEventListener("mouseleave", () => { isDrawing = false; });
  drawCanvas.addEventListener("touchstart", (e) => { e.preventDefault(); isDrawing = true; paint(e); }, { passive: false });
  drawCanvas.addEventListener("touchmove",  (e) => { e.preventDefault(); paint(e); }, { passive: false });
  drawCanvas.addEventListener("touchend",   () => { isDrawing = false; });

  // ── Predict ──────────────────────────────────────────────────────────
  document.getElementById("btnPredict").addEventListener("click", async () => {
    const image = drawCanvas.toDataURL("image/png");

    const res  = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });
    const { prediction, probabilities } = await res.json();

    predLabel.textContent = prediction;

    // Update chart colours: green for predicted digit, blue for others
    chart.data.datasets[0].data = probabilities;
    chart.data.datasets[0].backgroundColor = probabilities.map((_, i) =>
      i === prediction ? "#4ade80" : "#60a5fa"
    );
    chart.options.plugins.title.text =
      `Predicted: ${prediction}  (${(probabilities[prediction] * 100).toFixed(1)}% confidence)`;
    chart.options.plugins.title.color = "#4ade80";
    chart.update();

    // Show 8×8 preview scaled up to 72×72
    const offscreen = document.createElement("canvas");
    offscreen.width  = 8;
    offscreen.height = 8;
    const offCtx = offscreen.getContext("2d");
    offCtx.drawImage(drawCanvas, 0, 0, 8, 8);
    previewCtx.imageSmoothingEnabled = false;
    previewCtx.drawImage(offscreen, 0, 0, 72, 72);
  });

  // ── Clear ────────────────────────────────────────────────────────────
  document.getElementById("btnClear").addEventListener("click", () => {
    ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    predLabel.textContent = "?";

    chart.data.datasets[0].data = new Array(10).fill(0);
    chart.data.datasets[0].backgroundColor = new Array(10).fill("#60a5fa");
    chart.options.plugins.title.text  = "Draw and click Predict";
    chart.options.plugins.title.color = "#a0a0b0";
    chart.update();

    previewCtx.clearRect(0, 0, 72, 72);
  });
})();
