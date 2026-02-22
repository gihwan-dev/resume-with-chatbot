# 프로젝트 개발 마일스톤

> 기반 문서: docs/PRD.md
> 실행 라벨: `[SEQUENTIAL]`(순차), `[PARALLEL:PG-n]`(같은 그룹끼리 병렬)
> 분해 기준: 컨텍스트 윈도우 친화 단위(한 번에 구현/검증 가능한 크기)

## Phase 1. [SEQUENTIAL] Story Thread 데이터 계약 확정
- [x] **스토리텔링 상세 페이지 스키마 정의**
  - 목표: Hook First, Context, Story Threads, Retrospective를 안정적으로 렌더링할 수 있는 데이터 계약을 확정합니다.
  - 검증:
    - `impacts`, `threads`, `thoughtProcess`, `lessonsLearned`의 필수/옵션 규칙이 정의됩니다.
    - 기존 Problem/Decision/Result 본문을 새 구조로 매핑하는 규칙이 합의됩니다.
    - 스키마 검증 실패 시 오류 기준(누락/타입 불일치/빈 배열)이 명확해집니다.

- [x] **마이그레이션 스파이크(대표 케이스 1건)**
  - 목표: 기존 케이스를 새 스키마로 전환할 때의 난이도와 누락 리스크를 사전에 제거합니다.
  - 검증:
    - 대표 케이스 1건이 신규 구조로 시범 변환됩니다.
    - 변환 체크리스트(수치 근거, 전환 문장, 이슈-액션 페어링)가 작성됩니다.
    - 변환 불가 항목의 보완 원칙(요약/삭제/추가 작성)이 정리됩니다.

## Phase 2. [PARALLEL:PG-1] 콘텐츠 마이그레이션 배치 A
- [x] **핵심 케이스 2건 Story Thread 리라이팅**
  - 목표: 스캔 친화성과 인과관계가 드러나는 서사 구조로 프로젝트를 전환합니다.
  - 검증:
    - 각 케이스에 Impact 2~3개가 수치 기반으로 채워집니다.
    - 각 케이스에 이슈 스레드 2~3개(Problem→Thought→Action→Result)가 완성됩니다.
    - Retrospective 문단이 배운 점 중심으로 정리됩니다.

## Phase 3. [PARALLEL:PG-1] 콘텐츠 마이그레이션 배치 B
- [x] **잔여 케이스 Story Thread 리라이팅 및 품질 정합화**
  - 목표: 나머지 프로젝트를 동일한 톤/깊이/형식으로 마이그레이션해 전체 일관성을 확보합니다.
  - 검증:
    - 잔여 케이스가 동일 스키마로 전환됩니다.
    - 용어/문장 톤/성과 지표 단위 표기가 통일됩니다.
    - 누락된 사고 과정(전환 문장) 없는 상태가 됩니다.

## Phase 4. [PARALLEL:PG-1] 핵심 UI 컴포넌트 구축
- [x] **Impact Badge 카드 컴포넌트 구현 (상단 전용)**
  - 목표: Hero 영역에서 핵심 성과를 즉시 인지할 수 있는 강조형 카드 UI를 구현합니다.
  - 검증: 카드가 수치, 레이블, 설명을 렌더링하며, 시각적 강조가 본문보다 우선 노출되도록 설계됩니다.

- [x] **Story Thread 끊김 없는 타임라인 컴포넌트 구현 (본문 전용)**
  - 목표: 박스(Card) 형태를 배제하고, 여백과 타임라인 라인만으로 Problem-Thought-Action-Result를 물 흐르듯 읽히게 만듭니다.
  - 검증: 
    - 닫힌 테두리(박스) 없이 좌측 연결 라인만으로 서사의 연속성이 표현됩니다.
    - Thought Process 인용구의 옅은 배경색이 시각적 환기(Transition) 역할을 수행합니다.

## Phase 5. [SEQUENTIAL] 상세 페이지 통합 및 내비게이션 정합성
- [x] **Top-to-Bottom 내러티브 페이지 조립**
  - 목표: Hero → Context → Story Threads → Retrospective 순서로 상세 페이지를 재구성합니다.
  - 검증:
    - 첫 화면에서 프로젝트 가치와 임팩트가 즉시 확인됩니다.
    - Context 이후 스레드가 자연스럽게 이어져 읽기 흐름이 유지됩니다.
    - 회고 섹션이 페이지 결말로 일관되게 배치됩니다.

- [x] **목차/딥링크/섹션 활성화 동작 갱신**
  - 목표: 새 섹션 구조에서도 TOC, 해시 이동, active state가 정확히 동작하도록 맞춥니다.
  - 검증:
    - 해시 링크 진입 시 올바른 섹션이 표시됩니다.
    - 스크롤 스파이 활성 상태가 새 구조와 일치합니다.
    - 잘못된 해시 진입 시 안전한 기본 섹션으로 복구됩니다.

## Phase 6. [PARALLEL:PG-2] 인터랙티브 증거 블록 고도화
- [x] **Before & After 토글을 Story Thread에 표준 삽입**
  - 목표: 글만으로 어려운 구조 변화는 비교 UI로 증명할 수 있게 만듭니다.
  - 검증:
    - 토글이 Action 컨텍스트 안에서 자연스럽게 표시됩니다.
    - Before/After 콘텐츠 길이 차이가 커도 레이아웃이 깨지지 않습니다.
    - 키보드 및 스크린리더 접근이 가능합니다.

## Phase 7. [PARALLEL:PG-2] 반응형 및 인쇄 최적화
- [x] **모바일/데스크톱 반응형 완성**
  - 목표: 빠른 스캔 사용자를 위해 화면 크기별 정보 우선순위와 가독성을 최적화합니다.
  - 검증:
    - 모바일에서 Hero→Thread 순서와 간격이 읽기 친화적으로 유지됩니다.
    - 데스크톱에서 타임라인/본문 정렬이 안정적으로 유지됩니다.
    - 줄바꿈/카드 높이 차이에도 시각적 균형이 유지됩니다.

- [x] **`@media print` 인쇄 품질 개선**
  - 목표: PDF 출력 시 타임라인 라인과 배경 표현이 깔끔하게 보이도록 최적화합니다.
  - 검증:
    - 인쇄물에서 텍스트 대비와 섹션 경계가 명확합니다.
    - 불필요한 배경/장식 요소가 출력 품질을 해치지 않습니다.
    - 페이지 분할 시 스레드 단위 가독성이 유지됩니다.

## Phase 8. [SEQUENTIAL] 품질 검증 및 완료 기준 충족
- [x] **회귀 테스트 및 접근성 점검**
  - 목표: 개편 후 기존 핵심 사용자 흐름과 접근성 품질을 유지합니다.
  - 검증:
    - 포트폴리오 딥링크/목차/프린트 관련 자동화 테스트가 통과합니다.
    - 주요 사용자 흐름(목록→상세→복귀)이 회귀 없이 동작합니다.
    - 심각도 높은 접근성 이슈(critical/serious)가 없는 상태입니다.

- [ ] **PRD 수용 기준(AC) 최종 확인**
  - 목표: 문서 요구사항과 구현 결과를 일치시켜 릴리즈 판단 가능 상태로 만듭니다.
  - 검증:
    - Hook First, Story Thread, 전환 문장, Before/After 요구가 모두 충족됩니다.
    - 데이터 스키마 요구 필드가 모든 대상 케이스에서 누락 없이 채워집니다.
    - 팀 리뷰에서 “수십 초 스캔” 시나리오 기준으로 이해 가능하다는 합의를 얻습니다.

---

## 참고 노트

**[2026-02-21] 세션 요약**:
- 발견된 이슈: `index.ts` export 정렬/포맷 이슈 2건(린트 단계에서 즉시 수정).
- 아키텍처 결정: Story Thread 스키마를 `projects` frontmatter optional 필드로 점진 도입하고, v1 딥링크/섹션 계약은 유지.
- 다음 페이즈 영향: Phase 2에서 동일 매핑 규칙으로 핵심 케이스 2건을 Story Thread 구조로 리라이팅 가능.

**[2026-02-22] 세션 요약**:
- 발견된 이슈: 신규 수치 생성 없이 기존 본문의 검증 가능한 수치만 Impact로 구성해야 함.
- 아키텍처 결정: `storyThread`는 frontmatter 데이터로만 추가하고, legacy 본문/섹션/딥링크 계약은 유지.
- 다음 페이즈 영향: Phase 3에서 `exem-dx-improvement`를 동일 규칙으로 전환하고 톤/단위 정합화를 진행.

**[2026-02-22] Phase 3 완료 요약**:
- 완료 사항: 잔여 1건(`exem-dx-improvement`)에 Story Thread(`context`, `impacts`, `threads`, `lessonsLearned`) 전환을 완료.
- 품질 기준: Impact/Result 수치는 기존 본문의 검증 가능한 수치만 재사용하고 신규 추정 수치는 추가하지 않음.
- 다음 페이즈 영향: 다음 미완료 페이즈는 Phase 4(핵심 UI 컴포넌트 구축)이며, 데이터 커버리지 4/4 기준으로 UI 통합 작업에 착수 가능.

**[2026-02-22] Phase 4 완료 요약**:
- 완료 사항: `Impact Badge` 카드와 `Story Thread` 타임라인 컴포넌트를 구현하고 상세 페이지를 `Hook -> Context -> Threads -> Retrospective` 구조로 즉시 전환.
- 아키텍처 결정: canonical 해시를 `hook/context/threads/retrospective`로 전환하고 legacy 해시(`overview/problem/decision/result/retrospective`)는 자동 매핑으로 호환 유지.
- 신규 해시 계약 선반영(Phase 5 일부 앞당김): TOC 활성 상태, 딥링크 정규화, 모바일 목차 이동, 인쇄 흐름 테스트를 새 섹션 계약 기준으로 갱신.

**[2026-02-22] Phase 5-6 완료 요약**:
- 완료 사항: Phase 5 기준(Top-to-Bottom 구조, TOC/딥링크/active state 정합성)을 기존 구현/회귀 테스트로 재검증해 완료 처리하고, Phase 6로 `storyThread` frontmatter 기반 `comparison` 계약을 추가해 Before/After 토글을 4개 대표 스레드에 표준 삽입.
- 접근성/구현 결정: `CompareToggle`을 탭 패턴(`tablist/tab/tabpanel`)으로 리팩터링하고 키보드 탐색(`Arrow`, `Home/End`, `Enter/Space`) 및 ARIA 연결(`aria-controls`, `aria-labelledby`)을 적용.
- 검증 결과: `pnpm -C web run typecheck`, `pnpm -C web run lint`, `pnpm -C web exec vitest run tests/lib/resume-portfolio/story-thread-schema.test.ts tests/lib/resume-portfolio/hash.test.ts tests/lib/resume-portfolio/validation.test.ts`, `pnpm -C web exec playwright test e2e/portfolio-before-after.spec.ts e2e/portfolio-deep-link.spec.ts e2e/portfolio-toc-and-print.spec.ts --project=chromium` 모두 통과.
- 다음 페이즈 영향: 다음 미완료 페이즈는 Phase 7(반응형 및 인쇄 최적화)이며, 새 비교 블록이 포함된 Story Thread를 기준으로 모바일/프린트 균형 조정이 필요.

**[2026-02-22] Phase 7 완료 요약**:
- 완료 사항: 상세 페이지 반응형을 모바일 우선으로 조정(Impact grid 1/2/3열, 타임라인 라인/마커 정렬 안정화, 섹션 타이포/간격/줄바꿈 보정)하고, `@media print` 기반 인쇄 품질 개선(라이트 토큰 강제, 보조 UI 숨김, 스레드/비교 블록 대비 및 분할 안정화)을 완료.
- 테스트/검증 결정: `portfolio-toc-and-print` 시나리오에 모바일 수평 오버플로 및 섹션 순서, 데스크톱 타임라인 정렬, 다크 테마 상태 인쇄 라이트 규칙/보조 UI 숨김 검증을 추가.
- 검증 결과: `pnpm -C web run typecheck`, `pnpm -C web run lint`, `CI=1 pnpm -C web exec playwright test e2e/portfolio-deep-link.spec.ts e2e/resume-portfolio-print-flow.spec.ts e2e/portfolio-toc-and-print.spec.ts --project=chromium` 통과.
- 다음 페이즈 영향: 다음 미완료 페이즈는 Phase 8(품질 검증 및 완료 기준 충족)이며, 회귀 테스트/접근성 점검과 PRD 수용 기준 최종 확인으로 진행.

**[2026-02-22] Phase 8 진행 요약**:
- 완료 사항: 포트폴리오 상세 UI에 안정 셀렉터(`data-*`) 계약을 추가하고, 회귀 흐름(`resume -> portfolio detail -> resume return + scroll restore`) 및 PRD AC 자동 증빙 E2E를 신규 구축했으며, 접근성 스펙에 포트폴리오 상세(데스크톱/모바일 목차 오픈 상태) axe 검증을 확장.
- 문서/엔트리포인트: `docs/phase8-acceptance-checklist.md`를 추가하고 `web/package.json`에 `phase8:verify` 스크립트를 신설.
- 검증 결과: `pnpm -C web run typecheck`, `pnpm -C web run lint`, `pnpm -C web exec vitest run tests/lib/resume-portfolio/story-thread-schema.test.ts tests/lib/resume-portfolio/hash.test.ts tests/lib/resume-portfolio/validation.test.ts`, `CI=1 pnpm -C web exec playwright test e2e/portfolio-deep-link.spec.ts e2e/portfolio-toc-and-print.spec.ts e2e/portfolio-before-after.spec.ts e2e/resume-portfolio-print-flow.spec.ts e2e/accessibility.spec.ts e2e/portfolio-resume-return-flow.spec.ts e2e/portfolio-prd-acceptance.spec.ts --project=chromium`, `pnpm -C web run phase8:verify` 모두 통과.
- AC 상태: 자동 검증 항목은 충족되었고, `PRD 수용 기준(AC) 최종 확인`은 팀 리뷰 합의 서명 전까지 대기 상태(`[ ]`)로 유지.
