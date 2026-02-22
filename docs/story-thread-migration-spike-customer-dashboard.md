# Story Thread 마이그레이션 스파이크 (exem-customer-dashboard)

> 기준 문서: `docs/PRD.md`, `docs/resume-portfolio-contract.md`
> 작성일: 2026-02-21
> 대상: `web/src/content/projects/exem-customer-dashboard.md`

## 1) 스파이크 목표

- 기존 `Problem / Decision / Result / Retrospective` 본문을 Story Thread 구조로 시범 전환한다.
- 변환 난이도와 누락 리스크를 식별해 Phase 2/3 대량 리라이팅 기준을 확정한다.

## 2) 변환 체크리스트

- [x] 수치 근거(Impact):
  - 장애 인지 시간 `10초 -> 3초`
  - 인터랙션 지연 `73~82% 개선`
  - 렌더링 DOM `20%+ 감소`
- [x] 전환 문장(Thought Process):
  - 각 이슈별로 "왜 해당 결정을 했는지"를 단문으로 명시
- [x] 이슈-액션 페어링:
  - 이슈 1: 분산 폴링 규칙 -> Polling Manager/TanStack Query/렌더 우선순위 제어
  - 이슈 2: 카드형 UI 밀도 한계 -> 그리드 중심 레이아웃 전환
  - 이슈 3: 대규모 렌더링 경합 -> 구조 단순화 + Playwright 회귀 게이트

## 3) 매핑 기준

- `problem` 불릿 -> 각 thread의 `problems`
- `decision` 설명 -> `thoughtProcess` + `actions`
- `result` 불릿 -> `result` + 상단 `impacts`
- `retrospective` 문단 -> `lessonsLearned`

## 4) 변환 불가/애매 항목 보완 원칙

- 요약:
  - 세부 구현 디테일이 과도한 경우 `actions`는 2~3개로 압축한다.
- 삭제:
  - Story Thread 인과 설명에 기여하지 않는 반복 문장/중복 수식은 제거한다.
- 추가 작성:
  - 기존 본문에 "의사결정 이유"가 없으면 `thoughtProcess`를 새로 작성한다.
  - 수치가 없는 결과는 측정 가능 지표 또는 관측 가능한 변화로 치환한다.

## 5) 후속 Phase 영향

- Phase 2에서는 같은 매핑 기준으로 `exem-data-grid` + 1건을 우선 변환한다.
- Phase 4 UI 전환 전까지는 legacy 본문을 유지해 렌더 호환성을 지킨다.
