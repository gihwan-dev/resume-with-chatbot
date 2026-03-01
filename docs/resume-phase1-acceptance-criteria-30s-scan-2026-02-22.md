# Phase 1 수용 기준(AC) 고정: 30초 스캔 적합성 (2026-02-22)

## 1) 목적과 독자

- 목적: 채용 담당자/리쿠르터가 30초 내에 `성능·아키텍처 FE` 포지셔닝을 판단하고, 시니어 리뷰어가 2차 검토에서 의사결정 깊이를 확인할 수 있는 판정 기준을 고정한다.
- 1차 독자: 채용 담당자, 리쿠르터
- 2차 독자: 시니어 FE, 엔지니어링 매니저

근거:
- `docs/resume-hiring-optimization-direction-2026-02-22.md:12`
- `docs/resume-hiring-optimization-direction-2026-02-22.md:16`

## 2) 판정 방법(30초 시나리오)

### 2.1 시나리오 정의

1. T+0~10초: 상단 스캔
- 포지셔닝 문장 1개와 핵심 수치 3~4개를 인지할 수 있어야 한다.

2. T+10~30초: 대표 사례 스캔
- Experience 중심 사례에서 트레이드오프와 측정 근거를 최소 1개 이상 확인할 수 있어야 한다.

### 2.2 판정 등급

- `PASS`: MUST 조건 100% 충족
- `CONDITIONAL PASS`: MUST 충족 + SHOULD 일부 미충족(릴리즈 가능, 후속 개선 필요)
- `FAIL`: MUST 미충족 또는 블로커 발생

## 3) 구조 AC (Structure Acceptance Criteria)

### AC-STR-01 Hero 신호

- MUST:
1. Hero 영역에서 역할 포지셔닝 1문장과 근거 수치 3~4개가 한 화면 내에서 연결되어 보여야 한다.
- 근거 기준:
  - 목표 구조/요건: `docs/resume-hiring-optimization-direction-2026-02-22.md:39`, `docs/resume-hiring-optimization-direction-2026-02-22.md:50`

### AC-STR-2 강점 4축

- MUST:
1. `Architecture/Performance/DX/협업` 4축이 Skills보다 앞에서 독립 섹션으로 노출되어야 한다.
- 근거 기준:
  - 4축 요구: `docs/resume-hiring-optimization-direction-2026-02-22.md:51`

### AC-STR-03 Experience 중심 통합

- MUST:
1. 대표 프로젝트 4건이 Experience 컨텍스트 안에서 단일 스캔 동선으로 연결되어야 한다.
2. Experience와 Projects가 중복 인상을 주지 않도록 역할이 분리되어야 한다.
- 근거 기준:
  - 목표 구조: `docs/resume-hiring-optimization-direction-2026-02-22.md:41`
  - Experience/Projects 역할 분리 원칙: `docs/resume-engineering-guide-2025.md:84`

### AC-STR-04 Technical Writing 명확화

- MUST:
1. Blog는 설계 의사결정 탐색 섹션으로 재정의되어야 하며, 최신/대표 글 노출 규칙이 있어야 한다.
- 근거 기준:
  - 섹션 목적: `docs/resume-hiring-optimization-direction-2026-02-22.md:53`

### AC-STR-05 Awards & Certificates 순서 정합

- MUST:
1. Awards/Certificates가 목표 정보 구조에 맞는 우선순위로 배치되어야 한다.

### AC-STR-06 AI Assistant 진입성

- MUST:
1. 추천 질문 4개가 고정되어 노출되어야 한다.
2. 추천 질문 클릭 시 사용자 메시지 append 흐름과 `chat_message` 이벤트가 유지되어야 한다.
- 근거 기준:
  - 질문 4개 요구: `docs/resume-hiring-optimization-direction-2026-02-22.md:172`
  - 기존 이벤트/append 동작 기준선: `web/src/components/assistant-ui/thread.tsx:130`

## 4) 문장 AC (Content Acceptance Criteria)

### AC-CNT-01 주도성 동사

- MUST:
1. 각 핵심 액션 문장에 `설계`, `제안`, `주도`, `정의`, `표준화` 중 최소 1개가 포함되어야 한다.
- 근거 기준: `docs/resume-hiring-optimization-direction-2026-02-22.md:61`

### AC-CNT-02 트레이드오프 문단

- MUST:
1. 각 대표 케이스에 `A vs B`, `리스크`, `완화 전략`이 1문단 이상 포함되어야 한다.
- 근거 기준: `docs/resume-hiring-optimization-direction-2026-02-22.md:71`

### AC-CNT-03 측정 근거 3요소

- MUST:
1. 성능 수치에는 `측정 도구`, `반복 횟수`, `기준값`이 함께 표기되어야 한다.
- 근거 기준: `docs/resume-hiring-optimization-direction-2026-02-22.md:78`

### AC-CNT-04 수치 맥락 연결

- SHOULD:
1. 약한 수치(예: % 단독 수치)는 운영/사용자 영향 문장과 함께 제시한다.
- 근거 기준: `docs/resume-hiring-optimization-direction-2026-02-22.md:85`

### AC-CNT-05 PAR 구조 일관성

- MUST:
1. 주요 경력/프로젝트 불렛은 `Problem -> Action -> Result` 구조를 유지해야 한다.
- 근거 기준: `docs/resume-engineering-guide-2025.md:65`

## 5) 게이트 분리

## 5.1 문서 품질 게이트 (DQ-*)

### DQ-MUST

1. DQ-01: 목표 정보 구조가 명시적 순서로 문서에 고정되어 있다.
2. DQ-02: 대표 케이스 4건 모두 공통 템플릿 기준(TL;DR~What I Learned)을 갖는다.
3. DQ-03: 주도성/트레이드오프/측정 방식 규칙이 문서에 명문화되어 있다.
4. DQ-04: 허위 수치/허위 역할/허위 경험 추가 금지 원칙을 준수한다.
5. DQ-05: 기준선 스냅샷은 코드/콘텐츠 근거 라인과 매핑된다.

### DQ-SHOULD

1. DQ-06: 핵심 성과 3개 이상이 상단 절반에서 스캔 가능하다.
2. DQ-07: 협업/검증 문화(코드리뷰, 회귀 자동화) 신호가 포함된다.
3. DQ-08: 약한 수치에 운영 맥락을 연결한다.

근거:
- `docs/resume-hiring-optimization-direction-2026-02-22.md:201`
- `docs/resume-engineering-guide-2025.md:154`

## 5.2 구현 검증 게이트 (IV-*)

### IV-MUST

1. IV-01: Typecheck 통과
2. IV-02: Lint 통과
3. IV-03: 핵심 단위 테스트 통과
4. IV-04: 핵심 E2E/print/a11y 통과

실행 커맨드:

1. `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run typecheck`
2. `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run lint`
3. `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec vitest run tests/lib/chat-utils.test.ts tests/lib/resume-portfolio/story-thread-schema.test.ts tests/lib/resume-portfolio/validation.test.ts tests/lib/pdf/serialize-resume.test.ts`
4. `CI=1 pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec playwright test e2e/portfolio-deep-link.spec.ts e2e/portfolio-toc-and-print.spec.ts e2e/resume-portfolio-print-flow.spec.ts e2e/accessibility.spec.ts --project=chromium`

## 6) 릴리즈 판정 규칙

### 6.1 MUST 규칙

1. DQ-MUST 전체 충족
2. IV-MUST 전체 통과
3. 블로커 0건

### 6.2 블로커 정의

1. 구조 AC 중 하나라도 미충족
2. 핵심 수치에 근거 경로를 제시할 수 없음
3. 추천 질문 클릭 시 append/analytics 회귀 발생
4. typecheck/lint/unit/e2e 중 1개라도 실패

### 6.3 실패 처리 기본값

- 검증 실패(기존 회귀 포함) 시 Phase 완료 체크를 보류하고, 실패 원인/로그를 Session Note에 기록한다.

## 7) 후속 Phase 매핑 (Phase 2~9)

| Phase | 충족해야 할 AC 초점 | 완료 판정 포인트 |
| --- | --- | --- |
| Phase 2 | AC-STR-01, AC-STR-2, AC-CNT-03 기반 데이터 계약 확정 | optional 필드와 역호환 규칙 문서화 |
| Phase 3 | AC-STR-01, AC-STR-2 | Hero/강점 4축 실제 노출 및 문구 반영 |
| Phase 4 | AC-STR-03, AC-STR-04 | Experience 중심 단일 동선 + Technical Writing 재정의 |
| Phase 5 | AC-CNT-01, AC-CNT-02, AC-CNT-03, AC-CNT-05 | 4개 케이스 템플릿/문장 규칙 충족 |
| Phase 6 | AC-STR-01~06의 UI 정합 | 섹션 ID/내비/scroll spy/analytics 정합성 확보 |
| Phase 7 | AC-STR-06 | 추천 질문 4개 + append/event 유지 |
| Phase 8 | AC-STR-01~05의 PDF 반영 | 웹- PDF 메시지 우선순위 일치 |
| Phase 9 | DQ/IV 전체 | 품질 게이트 통과 및 30초 수용 리뷰 완료 |

## 8) Public API / 타입 변경 원칙

- Phase 1에서는 Public API, 런타임 인터페이스, 타입 계약을 변경하지 않는다.
- 타입/스키마 변경은 Phase 2에서 별도 확정한다.
