학생 랭킹 데이터를 `teacher-data/rankings.json` 파일로 가져오는 작업을 수행해줘.

---

## 사전 확인

`src/store/quizStore.ts`를 읽어서 localStorage 키 이름(`name` 필드)과 `RankingEntry` 구조를 확인해줘.
파일 읽기에 실패하면 즉시 중단하고 오류를 보고해.

---

## 데이터 소스 판별

`$ARGUMENTS` 처리 규칙:

**케이스 A — `$ARGUMENTS`에 JSON이 있는 경우**
- 아래 "데이터 검증" 단계로 바로 이동

**케이스 B — `$ARGUMENTS`가 비어 있는 경우**
- `teacher-data/rankings.json` 파일이 이미 존재하는지 확인
  - 존재하면 → "✅ 기존 데이터 파일 발견" 출력 후 "데이터 검증" 단계로 이동
  - 존재하지 않으면 → 아래 내보내기 안내를 출력하고 종료

```
======================================
  선생님 모드 — 데이터 가져오기 안내
======================================

학생들의 성적 데이터는 브라우저 localStorage에 저장되어 있습니다.
아래 순서로 데이터를 내보낸 뒤, 다시 이 명령을 실행하세요.

[방법 1] 브라우저 콘솔에서 직접 복사
  1. 퀴즈 앱이 열린 브라우저 탭에서 F12 → 콘솔 탭 열기
  2. 아래 명령어 입력 후 Enter:
       copy(localStorage.getItem('quiz-storage'))
  3. 클립보드에 복사된 JSON을 아래 경로에 저장:
       teacher-data/rankings.json

[방법 2] 명령어에 JSON 직접 붙여넣기
  /teacher-import {"state":{"rankings":[...]}}

======================================
```

---

## 데이터 검증

가져온 JSON(파일 또는 `$ARGUMENTS`)을 파싱해서 아래 항목을 검사해줘.

1. **JSON 파싱 가능 여부** — 파싱 실패 시 즉시 중단
2. **구조 확인** — `state.rankings` 배열이 존재하는지
3. **각 항목 타입 검증** — `nickname(string)`, `score(number)`, `category(string)`, `date(string)`, `savedAt(number)` 필드 존재 여부
4. **유효한 category 값** — `한국사`, `과학`, `지리`, `일반상식`, `all` 중 하나인지
5. **score 범위** — 음수이거나 비현실적으로 큰 값(1000 초과)이 있으면 ⚠️ 경고

검증 결과 출력:
```
전체 항목 수: {n}개
유효 항목 수: {n}개
오류 항목 수: {n}개
```
오류가 있으면 해당 항목의 index와 내용을 목록으로 출력.
오류 항목이 전체의 50%를 초과하면 즉시 중단.

---

## 파일 저장

`teacher-data/` 폴더가 없으면 생성하고, 아래 형식으로 `teacher-data/rankings.json`에 저장해줘.

```json
{
  "exportedAt": "{ISO 8601 형식의 현재 날짜시간}",
  "totalCount": {n},
  "rankings": [ ...유효한 항목만... ]
}
```

저장 완료 후:
- 파일이 실제로 생성/업데이트되었는지 확인
- 저장된 항목 수가 의도한 수와 일치하는지 확인
- 불일치 시 즉시 중단

---

## 완료 보고

```
======================================
  데이터 가져오기 완료
  저장 경로: teacher-data/rankings.json
  저장 일시: {날짜시간}
  총 학생 기록: {n}개
  참여 학생 수: {고유 닉네임 수}명
======================================
다음 명령어로 분석을 시작하세요:
  /teacher-overview  — 전체 성적 현황
  /teacher-compare   — 학생 비교
  /teacher-weak      — 취약 카테고리 분석
  /teacher-progress  — 성적 추이
  /teacher-mode      — 전체 통합 리포트
```
