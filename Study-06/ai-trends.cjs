const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "AI 기술 트렌드 2025";

const slide = pres.addSlide();

// ── 팔레트 ──────────────────────────────────────────
const BG        = "0A0F1E";   // 딥 네이비 (배경)
const TEAL      = "00C2A8";   // 민트 틸 (포인트)
const TEAL_DIM  = "007A6B";   // 어두운 틸 (카드 배경)
const CARD_BG   = "111827";   // 카드 배경
const WHITE     = "FFFFFF";
const GRAY      = "94A3B8";   // 보조 텍스트
const ORANGE    = "F97316";   // 보조 포인트

// ── 배경 ────────────────────────────────────────────
slide.background = { color: BG };

// 좌측 세로 틸 바 (브랜딩)
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 0.22, h: 5.625,
  fill: { color: TEAL }, line: { color: TEAL }
});

// 헤더 구분선
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0.22, y: 0, w: 9.78, h: 0.85,
  fill: { color: "0D1628" }, line: { color: "0D1628" }
});

// 헤더 아래 틸 얇은 선
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0.22, y: 0.85, w: 9.78, h: 0.025,
  fill: { color: TEAL }, line: { color: TEAL }
});

// ── 타이틀 ──────────────────────────────────────────
slide.addText("AI 기술 트렌드 2025", {
  x: 0.42, y: 0.08, w: 6, h: 0.6,
  fontSize: 26, bold: true, color: WHITE,
  fontFace: "Arial Black", margin: 0
});

slide.addText("KEY TECHNOLOGY TRENDS  |  2025 GLOBAL OUTLOOK", {
  x: 0.42, y: 0.6, w: 8, h: 0.22,
  fontSize: 8.5, color: TEAL, charSpacing: 2,
  fontFace: "Arial", margin: 0
});

// 날짜 태그
slide.addText("2025.05", {
  x: 8.8, y: 0.28, w: 1.1, h: 0.3,
  fontSize: 8.5, color: BG, bold: true,
  fontFace: "Arial", align: "center", valign: "middle", margin: 0,
  fill: { color: TEAL }
});

// ── 좌측 상단 대형 스탯 3개 ────────────────────────
const stats = [
  { val: "$1.3T", label: "2030년 시장 규모 전망", note: "2024년 $67B → 19x 성장" },
  { val: "73%",   label: "글로벌 기업 AI 도입률", note: "2024 McKinsey 글로벌 서베이" },
  { val: "69M",   label: "2027년 AI 일자리 창출", note: "WEF 미래일자리 보고서" },
];

stats.forEach((s, i) => {
  const x = 0.38 + i * 3.12;
  // 카드 배경
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y: 0.98, w: 2.85, h: 0.95,
    fill: { color: CARD_BG },
    shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.3 }
  });
  // 좌측 틸 포인트
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y: 0.98, w: 0.06, h: 0.95,
    fill: { color: i === 0 ? TEAL : i === 1 ? ORANGE : "A78BFA" },
    line: { color: i === 0 ? TEAL : i === 1 ? ORANGE : "A78BFA" }
  });
  // 수치
  slide.addText(s.val, {
    x: x + 0.14, y: 1.02, w: 2.6, h: 0.42,
    fontSize: 22, bold: true,
    color: i === 0 ? TEAL : i === 1 ? ORANGE : "A78BFA",
    fontFace: "Arial Black", margin: 0
  });
  // 레이블
  slide.addText(s.label, {
    x: x + 0.14, y: 1.46, w: 2.6, h: 0.24,
    fontSize: 8, color: WHITE, fontFace: "Arial", margin: 0
  });
  // 출처
  slide.addText(s.note, {
    x: x + 0.14, y: 1.7, w: 2.6, h: 0.18,
    fontSize: 6.5, color: GRAY, fontFace: "Arial", margin: 0, italic: true
  });
});

// ── 트렌드 카드 4개 ──────────────────────────────────
const trends = [
  {
    emoji: "🧠", title: "대형 언어 모델 (LLM)",
    desc: "GPT-4o·Claude 3.5·Gemini 1.5 — 추론·코딩·창작 능력 급성장. 멀티스텝 에이전트 기반으로 진화 중",
    badge: "Core", badgeColor: TEAL
  },
  {
    emoji: "👁", title: "멀티모달 AI",
    desc: "텍스트·이미지·음성·영상을 하나의 모델로 통합 처리. Sora·Gemini·GPT-4V가 이끄는 시각지능 혁명",
    badge: "Rising", badgeColor: ORANGE
  },
  {
    emoji: "🤖", title: "AI 에이전트",
    desc: "브라우저 조작·코드 실행·API 호출을 스스로 수행. AutoGPT·Devin·Claude Code 등 자율 작업 시스템",
    badge: "Hot", badgeColor: "F43F5E"
  },
  {
    emoji: "📱", title: "온디바이스 AI",
    desc: "스마트폰·PC에서 직접 모델 실행. Apple Intelligence·Gemini Nano 등 프라이버시·저지연 AI 가속",
    badge: "Emerging", badgeColor: "A78BFA"
  },
];

trends.forEach((t, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.38 + col * 4.85;
  const y = 2.08 + row * 1.5;
  const W = 4.55;
  const H = 1.37;

  // 카드
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w: W, h: H,
    fill: { color: CARD_BG },
    shadow: { type: "outer", color: "000000", blur: 10, offset: 3, angle: 135, opacity: 0.25 }
  });
  // 하단 포인트 바
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y: y + H - 0.06, w: W, h: 0.06,
    fill: { color: t.badgeColor }, line: { color: t.badgeColor }
  });

  // 이모지
  slide.addText(t.emoji, {
    x: x + 0.15, y: y + 0.1, w: 0.45, h: 0.45,
    fontSize: 20, margin: 0
  });

  // 배지
  slide.addShape(pres.shapes.RECTANGLE, {
    x: x + W - 1.0, y: y + 0.12, w: 0.82, h: 0.26,
    fill: { color: t.badgeColor },
    shadow: { type: "outer", color: "000000", blur: 2, offset: 1, angle: 135, opacity: 0.2 }
  });
  slide.addText(t.badge, {
    x: x + W - 1.0, y: y + 0.12, w: 0.82, h: 0.26,
    fontSize: 7.5, bold: true, color: BG, align: "center", valign: "middle",
    fontFace: "Arial Black", margin: 0
  });

  // 제목
  slide.addText(t.title, {
    x: x + 0.15, y: y + 0.52, w: W - 0.25, h: 0.3,
    fontSize: 11, bold: true, color: WHITE, fontFace: "Arial", margin: 0
  });

  // 설명
  slide.addText(t.desc, {
    x: x + 0.15, y: y + 0.8, w: W - 0.25, h: 0.5,
    fontSize: 8, color: GRAY, fontFace: "Arial", margin: 0,
    paraSpaceAfter: 0
  });
});

// ── 하단 바 차트 (시장 성장) 교체 → 우측 스탯 패널 ──
// 실제로는 바 차트 대신 성장률 바 시각화

// 차트 타이틀 (차트 위에 배치)
slide.addText("생성형 AI 시장 성장 전망 (단위: $B)", {
  x: 0.38, y: 4.97, w: 6, h: 0.14,
  fontSize: 7.5, color: GRAY, fontFace: "Arial", margin: 0
});

const chartData = [{
  name: "시장 규모",
  labels: ["2022", "2023", "2024", "2025E", "2026E"],
  values: [11, 28, 67, 140, 250]
}];

slide.addChart(pres.charts.BAR, chartData, {
  x: 0.3, y: 5.12, w: 9.4, h: 0.42,
  barDir: "col",
  chartColors: [TEAL_DIM, TEAL_DIM, TEAL, TEAL_DIM, TEAL_DIM],
  chartArea: { fill: { color: BG } },
  plotArea: { fill: { color: BG } },
  catAxisLabelColor: GRAY,
  valAxisLabelColor: GRAY,
  valGridLine: { style: "none" },
  catGridLine: { style: "none" },
  showValue: true,
  dataLabelColor: WHITE,
  dataLabelFontSize: 6.5,
  showLegend: false,
  catAxisLineShow: false,
  valAxisLineShow: false,
});

pres.writeFile({ fileName: "AI-트렌드-2025.pptx" }).then(() => {
  console.log("✅ AI-트렌드-2025.pptx 생성 완료");
});
