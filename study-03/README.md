# 🧠 상식 퀴즈 게임

한국사·과학·지리·일반상식 4개 카테고리, 총 40문제 스피드 퀴즈 게임입니다.  
스피드 보너스, 연속 정답 콤보, 만점 보너스로 최고 점수에 도전하세요!

## 배포 링크

**[▶ 게임 플레이하기](https://fnsrbs.github.io/quiz-game/)**

## 스크린샷

| 홈 화면 | 퀴즈 화면 | 결과 화면 | 랭킹 화면 |
|--------|---------|---------|---------|
| 카테고리 선택 카드 | 원형 타이머 + 문제 | 점수·별점·오답 복습 | 탭별 TOP 10 |

## 주요 기능

- **4개 카테고리**: 한국사 / 과학 / 지리 / 일반상식 (각 10문제)
- **전체 도전**: 40문제 랜덤 셔플
- **원형 타이머**: 문제당 30초
- **점수 시스템**
  - 정답: +10점
  - 스피드 보너스 (10초 이내): +5점
  - 3연속 콤보: +10점
  - 카테고리 만점: +20점
- **랭킹**: localStorage 저장, 카테고리별 TOP 10
- **키보드 단축키**: `1/2/3/4`로 보기 선택, `Enter`로 다음 문제

## 기술 스택

- React 18 + TypeScript + Vite 6
- Tailwind CSS v3 (커스텀 애니메이션 포함)
- Zustand v5 (persist 미들웨어)
- React Router v6

## 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173/quiz-game/)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

## GitHub Pages 배포

```bash
# gh-pages 브랜치로 자동 배포
npm run deploy
```

> **사전 조건**: GitHub 저장소의 Settings → Pages에서 Source를 `gh-pages` 브랜치로 설정해야 합니다.

## 프로젝트 구조

```
src/
├── components/   # CircularTimer, ProgressBar, Toast
├── data/         # questions.ts (40문제 데이터)
├── hooks/        # useTimer, useScore
├── pages/        # HomePage, QuizPage, ResultPage, RankingPage, NotFoundPage
├── store/        # quizStore.ts (Zustand)
└── types/        # quiz.ts
```
