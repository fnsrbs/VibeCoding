# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드 (tsc + vite)
npm run preview  # 빌드 결과물 미리보기
npm run lint     # ESLint 실행
```

## Tech Stack

- **React 18 + TypeScript + Vite 6**
- **Tailwind CSS v3** — `tailwind.config.js`, `postcss.config.js`
- **Zustand v5** — `persist` 미들웨어로 랭킹 데이터를 `localStorage`에 저장 (최대 100개)
- **React Router v6** — BrowserRouter 기반

## Architecture

### 라우팅 구조

```
/                   → HomePage     (홈, 카테고리 카드 + 전체 도전 + 랭킹 버튼)
/quiz/:category     → QuizPage     (문제 풀이, :category는 인코딩된 카테고리명 또는 'all')
/result             → ResultPage   (결과 + 별점 + 오답 목록 + 랭킹 저장)
/ranking            → RankingPage  (탭별 랭킹, 최대 10위)
```

### 상태 관리 (`src/store/quizStore.ts`)

`QuizState` 타입의 Zustand 스토어 하나로 전체 게임 상태를 관리.

- `session`: 진행 중인 퀴즈 세션 (`QuizSession | null`)
- `rankings`: 랭킹 목록 (`RankingEntry[]`) — localStorage에 persist됨
- `lastSavedAt`: 마지막 랭킹 저장 타임스탬프 — RankingPage에서 내 기록 하이라이트에 사용

주요 액션 흐름: `startQuiz(category)` → `answerQuestion(index)` → `nextQuestion()` → `finishQuiz()` → `saveRanking(nickname)` → `resetQuiz()`

- `startQuiz('all')` 시 전체 40문제 랜덤 셔플, 카테고리 지정 시 해당 카테고리 10문제
- `finishQuiz()` 는 전체 정답 시 +20점 보너스 적용 후 `/result`로 이동 전에 반드시 호출

### 점수 계산 규칙

`calcPoints()` 함수 (store 내부):
- 정답: +10점
- 스피드 보너스 (10초 이내 정답): +5점
- 3연속 정답 콤보: +10점 (newComboCount >= 3 기준)
- 카테고리 전체 정답 (만점): +20점 (`finishQuiz`에서 적용)

### 타입 (`src/types/quiz.ts`)

- `Category` = `'한국사' | '과학' | '지리' | '일반상식'`
- `CategoryFilter` = `Category | 'all'` — `startQuiz` 인자 및 `QuizSession.category`에 사용
- `QuizSession.answers`: 시간 초과 시 `null` 유지 (store의 `answerQuestion`을 호출하지 않음)

### 커스텀 훅

- `useTimer(durationSeconds, onExpire)` — key 기반 reset 패턴, `remaining`과 `reset` 반환. `reset()` 호출 시 내부 resetKey 증가 → effect 재실행으로 타이머 재시작
- `useScore()` — 세션에서 `score`, `comboCount`, `correctCount` 읽기 + `getStarCount(correct, total)` 별점 계산 유틸 제공

### 문제 데이터 (`src/data/questions.ts`)

카테고리별 10문제씩 총 40문제. 새 문제 추가 시 `Question` 타입에 맞게 `questions` 배열에 추가.

### 퀴즈 문제 교차 검증 가이드라인

모든 문제 작성 시 확인 사항

1. 정답이 하나뿐인가?
    - 다른 해석 가능 시 조건 명시 (예: 면적 기준, 2024년 기준)
2. 최상급 표현에 기준이 있는가?
    - '가장 큰', '최초의' 등 표현에 측정 기준 명시
3. 시간과 범위가 명확한가?
    - 변할 수 있는 정보는 시점 명시
    - 지리적, 분류적 범위 한정
4. 교차 검증했는가?
    - 의심스러운 정보는 2개 이상 출처 확인
    - 논란 있는 내용은 주류 학설 기준
