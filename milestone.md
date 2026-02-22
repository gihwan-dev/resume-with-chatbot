# 이력서 합격확률 최적화 마일스톤 (성능·아키텍처 FE)

> 기반 문서: `/Users/choegihwan/Documents/Projects/resume-with-ai/docs/resume-hiring-optimization-direction-2026-02-22.md`, `/Users/choegihwan/Documents/Projects/resume-with-ai/docs/resume-engineering-guide-2025.md`, `/Users/choegihwan/Documents/Projects/resume-with-ai/docs/PRD.md`, 사용자 피드백(2026-02-22)
> 실행 라벨: `[SEQUENTIAL]`(순차), `[PARALLEL:PG-n]`(같은 그룹끼리 병렬)
> 분해 기준: 컨텍스트 윈도우 친화 단위(한 번의 구현/검증 세션에서 완료 가능한 크기)
> 범위: 웹 섹션 구조 + 콘텐츠 리라이팅 + AI 추천 질문 + PDF 동기화 + 품질 게이트

## Phase 1. [SEQUENTIAL] 기준선 스냅샷 및 수용 기준 정의

- [x] **현행 구조/문구/지표 기준선 기록**
  - 목표: 리라이팅 전후 비교 기준을 명확히 고정한다.
  - 검증:
    - 현재 메인 섹션 순서, 대표 문구, 핵심 수치가 문서로 기록된다.
    - 현행 AI 추천 질문 목록이 스냅샷으로 남는다.
    - 검증 커맨드 기준선(typecheck/lint/unit/e2e)이 정리된다.

- [x] **수용 기준(AC) 선언**
  - 목표: "30초 스캔 적합성"을 릴리즈 판단 가능한 기준으로 만든다.
  - 검증:
    - Hero/Core Strength/Experience 통합 기준이 정의된다.
    - 주도성/트레이드오프/측정 방식 문장 기준이 정의된다.
    - 문서 품질 게이트와 구현 검증 게이트가 분리된다.

## Phase 2. [SEQUENTIAL] 콘텐츠·스키마 계약 확정

- [x] **콘텐츠 확장 필드 계약 정의**
  - 목표: 신규 필드를 optional로 도입해 하위 호환을 유지한다.
  - 검증:
    - `basics.heroMetrics[]`, `skills.coreStrengths[]` 확장안이 문서화된다.
    - `ProjectStoryThread.architectureSummary?`, `ProjectStoryThread.measurementMethod?`, `StoryThreadItem.tradeOff?` 확장안이 문서화된다.
    - 신규 필드 미존재 시 기존 렌더 유지 정책이 확정된다.

- [x] **PDF 직렬화 동기화 규칙 확정**
  - 목표: 웹 섹션 우선순위가 PDF에도 일관되게 반영되도록 계약을 고정한다.
  - 검증:
    - `web/src/lib/pdf/types.ts` 확장 원칙이 정의된다.
    - `web/src/lib/pdf/serialize-resume.ts` 매핑 우선순위가 정의된다.
    - 역호환 처리 기준(신규 필드 없는 데이터)까지 명시된다.

## Phase 3. [PARALLEL:PG-1] Hero + Core Strength 재작성

- [x] **Hero 정체성/신뢰 지표 재작성**
  - 목표: 첫 화면 10초 내 정체성과 신뢰를 전달한다.
  - 검증:
    - 성능·아키텍처 FE 포지셔닝 문구가 반영된다.
    - 수치 지표 3~4개가 근거 기반으로 배치된다.
    - 요약 문장이 문제-해결-영향 관점으로 정리된다.

- [x] **Core Strength 4축 섹션 신설**
  - 목표: 스택보다 능력 프레임이 먼저 읽히도록 구조를 바꾼다.
  - 검증:
    - 대규모 렌더링 아키텍처/성능 최적화/아키텍처 설계/DX 자동화 4축이 고정된다.
    - 각 축에 근거 기반 설명이 1~2문장으로 배치된다.
    - 기존 Skills는 보조 정보로 순서가 뒤로 이동한다.

## Phase 4. [PARALLEL:PG-1] Experience-Projects 통합 설계

- [x] **Experience 중심 케이스 통합**
  - 목표: Experience/Projects 이원 구조의 중복 인상을 제거한다.
  - 검증:
    - 대표 프로젝트 4건이 Experience 컨텍스트 안에서 연결된다.
    - 스캔 동선이 "회사 경험 -> 대표 케이스" 단일 경로로 단순화된다.
    - 링크/CTA가 상세 포트폴리오와 일관되게 유지된다.

- [x] **Technical Writing 섹션 재정의**
  - 목표: 블로그를 "사고 수준 증명" 섹션으로 격상한다.
  - 검증:
    - 설계 의사결정 중심 소개문이 추가된다.
    - 글 목록 노출 규칙(최신/대표 주제)이 정의된다.
    - 기존 Blog 링크 동작과 analytics 이벤트가 유지된다.

## Phase 5. [PARALLEL:PG-1] 프로젝트 4건 리라이팅

- [x] **케이스 스터디 템플릿 일괄 적용**
  - 목표: 4개 프로젝트를 동일한 의사결정 중심 구조로 리라이팅한다.
  - 검증:
    - `TL;DR/문제정의/핵심의사결정/구현전략/검증&결과/What I Learned`가 4건 모두 반영된다.
    - 핵심 수치 3개와 코어 접근 방식이 TL;DR에서 즉시 스캔 가능하다.
    - 결과 문장에 측정 방식 + 수치 + 운영 영향이 함께 표기된다.

- [x] **문장 품질 규칙 적용**
  - 목표: 주도성/트레이드오프/측정 신뢰도를 시니어 기준으로 끌어올린다.
  - 검증:
    - 핵심 액션 문장에 `설계·제안·주도` 표현이 반영된다.
    - `A vs B` 트레이드오프 문단이 각 케이스에 포함된다.
    - 측정 도구 + 반복 횟수 + 기준값 표기가 포함된다.

## Phase 6. [SEQUENTIAL] 랜딩 섹션·내비게이션 정합성

- [ ] **메인 섹션 순서 및 앵커 재정렬**
  - 목표: 목표 정보 구조(Hero -> Core Strength -> Experience -> Technical Writing -> Awards & Certificates -> AI Assistant)를 실제 화면에 반영한다.
  - 검증:
    - 섹션 ID 및 내비게이션 활성 상태가 새 순서와 일치한다.
    - 스크롤 스파이/해시 이동이 회귀 없이 동작한다.
    - analytics `section_view`가 새 섹션 ID로 정상 집계된다.

## Phase 7. [PARALLEL:PG-2] AI 추천 질문 개편

- [ ] **추천 질문 4개 교체**
  - 목표: 채용 담당자가 질문 없이도 핵심 역량을 탐색할 수 있게 만든다.
  - 검증:
    - 아키텍처/성능/트레이드오프/테스트 전략 질문 4개가 반영된다.
    - 버튼 클릭 시 사용자 메시지 append 흐름이 유지된다.
    - `chat_message` 이벤트 로깅이 유지된다.

## Phase 8. [PARALLEL:PG-2] PDF 동기화

- [ ] **웹- PDF 섹션 우선순위 동기화**
  - 목표: PDF도 웹과 동일한 메시지 우선순위를 갖게 만든다.
  - 검증:
    - Hero 지표/Core Strength/통합 Experience 핵심 문구가 반영된다.
    - PDF 출력에서 텍스트 밀도와 가독성이 유지된다.
    - 기존 PDF 다운로드/파일명/응답 헤더 동작이 회귀하지 않는다.

## Phase 9. [SEQUENTIAL] 품질 게이트 및 수용 검증

- [ ] **자동 검증 게이트 통과**
  - 목표: 구조 개편 후 기능/접근성/인쇄/딥링크 안정성을 보장한다.
  - 검증:
    - typecheck/lint/unit/e2e/print/a11y가 모두 통과한다.
    - `portfolio` 상세 딥링크, TOC, resume 복귀 흐름 회귀가 없다.
    - 심각도 높은 접근성 이슈(critical/serious)가 없다.

- [ ] **수용 시나리오 리뷰 완료**
  - 목표: 30초 스캔 관점의 채용 시나리오를 최종 검증한다.
  - 검증:
    - 1차 스캔에서 포지셔닝과 대표 수치가 즉시 인지된다.
    - 2차 검토에서 트레이드오프/측정 방식/주도성이 확인된다.
    - AI 추천 질문 경로로 핵심 사례 탐색이 가능하다.

---

## Public API/인터페이스/타입 변경 제안

아래 변경은 **제안 스펙**이며, 실제 적용 시 Phase 2에서 확정한다.

1. `/Users/choegihwan/Documents/Projects/resume-with-ai/web/src/content.config.ts`
  - `basics.heroMetrics[]` optional
  - `skills.coreStrengths[]` optional

2. `/Users/choegihwan/Documents/Projects/resume-with-ai/web/src/lib/resume-portfolio/contracts.ts`
  - `PORTFOLIO_SECTION_IDS`를 `tldr/problem-definition/key-decisions/implementation-highlights/validation-impact/learned`로 전환
  - `ProjectStoryThread`를 `tldrSummary/keyMetrics/coreApproach/problemDefinition/problemPoints/decisions/implementationHighlights/validationImpact/lessonsLearned` 구조로 전환
  - `DecisionItem` 및 `ValidationImpact` 타입 추가

3. `/Users/choegihwan/Documents/Projects/resume-with-ai/web/src/lib/pdf/types.ts`
  - Hero/Core Strength/통합 Experience 대응 optional 직렬화 필드 확장

4. `/Users/choegihwan/Documents/Projects/resume-with-ai/web/src/lib/pdf/serialize-resume.ts`
  - `coreApproach -> architectureSummary`, `validationImpact.measurementMethod -> measurementMethod`, `decisions[].tradeOff -> tradeOffs` 파생 규칙 적용

5. 하위 호환 기본값
  - 신규 필드 미존재 시 기존 렌더링 유지
  - 기본 딥링크 해시를 `#tldr`로 전환하고 레거시 해시는 `invalid`와 동일하게 폴백 처리

---

## 테스트 케이스 및 시나리오

1. 스키마/타입 단위 테스트
  - `story-thread-schema`, `validation`, `serialize-resume`에 optional 필드 케이스 추가

2. UI 회귀 테스트
  - 메인 섹션 순서, Experience 통합 노출, 앵커/스크롤 스파이 정합성 검증

3. 포트폴리오 상세 테스트
  - TL;DR/문제정의/핵심의사결정/구현전략/검증결과/What I Learned 6섹션 구조 검증

4. AI 추천 질문 테스트
  - 4개 질문 노출, 클릭 시 append, 이벤트 유지 확인

5. PDF/인쇄 테스트
  - Hero 지표/Core Strength/통합 Experience 반영 및 print-flow 안정성 검증

6. 접근성 테스트
  - 키보드 내비게이션, heading 계층, 대비, 모달 접근성 회귀 없음 확인

### 실행 커맨드 기준

```bash
pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run typecheck
pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run lint
pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec vitest run tests/lib/resume-portfolio/story-thread-schema.test.ts tests/lib/resume-portfolio/validation.test.ts tests/lib/pdf/serialize-resume.test.ts
CI=1 pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec playwright test e2e/portfolio-deep-link.spec.ts e2e/portfolio-toc-and-print.spec.ts e2e/portfolio-prd-acceptance.spec.ts e2e/resume-portfolio-print-flow.spec.ts e2e/accessibility.spec.ts --project=chromium
```

---

## 가정과 기본값

- 문서는 한국어로 작성한다.
- 기존 `/Users/choegihwan/Documents/Projects/resume-with-ai/milestone.md`는 유지하고 덮어쓰지 않는다.
- 포지셔닝은 `성능·아키텍처 FE` 단일 전략으로 고정한다.
- 기업 유형별 분기 전략(대기업/스타트업/외국계)은 이번 범위에서 제외한다.
- 이번 산출물은 문서 2개 생성에 집중하고, 코드 변경은 후속 구현 단계로 분리한다.

---

## Session Notes

### 2026-02-22 — Phase 1 실행 (검증 실패로 완료 보류)

- 생성 문서:
  - `/Users/choegihwan/Documents/Projects/resume-with-ai/docs/resume-phase1-baseline-snapshot-2026-02-22.md`
  - `/Users/choegihwan/Documents/Projects/resume-with-ai/docs/resume-phase1-acceptance-criteria-30s-scan-2026-02-22.md`

- 기준선 핵심 관찰:
  - 렌더 순서는 `Hero -> Skills -> Experience -> Projects -> Blog -> Certificates -> Awards`이며, 기본 내비게이션 항목에는 `skills`가 없다.
  - AI 추천 질문은 5개이며, 방향 문서의 고정 4문항(아키텍처/성능/트레이드오프/회귀 테스트)과 불일치한다.
  - 프로젝트 핵심 수치(10초→3초, DOM 90%, 3분→5초 등)와 근거 라인을 문서에 고정했다.

- 검증 결과:
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run typecheck` 통과
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run lint` 통과
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec vitest run tests/lib/chat-utils.test.ts tests/lib/resume-portfolio/story-thread-schema.test.ts tests/lib/resume-portfolio/validation.test.ts tests/lib/pdf/serialize-resume.test.ts` 통과 (4 files, 25 tests)
  - `CI=1 ... playwright ...` 실패: `http://localhost:4321 is already used`
  - `playwright ...`(CI 미설정 재시도) 실패: 30개 중 21개 실패
    - 주요 실패: `portfolio-deep-link`의 `#overview -> #hook` 정규화 불일치
    - 주요 실패: 모바일 접근성 시나리오에서 `axe` serious 위반(`color-contrast`, `scrollable-region-focusable`)
    - 주요 실패: 다수 시나리오에서 `ERR_CONNECTION_REFUSED`

- 실패 정책 적용:
  - 검증 실패가 존재하므로 Phase 1 체크박스(`[ ]`)는 완료 처리하지 않음.

### 2026-02-22 — Phase 1 재검증 및 완료

- 재검증 전 조치:
  - `e2e/portfolio-toc-and-print.spec.ts` 정렬 테스트 실패를 재현하고,
    `web/src/components/portfolio/story-thread-timeline.astro`의
    `data-thread-line` 시작 오프셋을 `top-3`(sm: `top-4`)로 조정해
    첫 마커 중심과 라인이 연결되도록 수정.

- 재검증 결과:
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run typecheck` 통과
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run lint` 통과
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec vitest run tests/lib/chat-utils.test.ts tests/lib/resume-portfolio/story-thread-schema.test.ts tests/lib/resume-portfolio/validation.test.ts tests/lib/pdf/serialize-resume.test.ts` 통과 (4 files, 25 tests)
  - `CI=1 pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec playwright test e2e/portfolio-deep-link.spec.ts e2e/portfolio-toc-and-print.spec.ts e2e/resume-portfolio-print-flow.spec.ts e2e/accessibility.spec.ts --project=chromium` 통과
    - 1차 실행: flaky 1건(`accessibility` dark 포트폴리오 axe) 재시도로 통과, exit 0
    - 2차 재실행: 30/30 통과

- 완료 처리:
  - Phase 1의 두 체크박스를 `[x]`로 업데이트.

### 2026-02-22 — Phase 2 실행 및 완료

- 생성 문서:
  - `/Users/choegihwan/Documents/Projects/resume-with-ai/docs/resume-phase2-content-schema-contract-2026-02-22.md`
  - `/Users/choegihwan/Documents/Projects/resume-with-ai/docs/resume-phase2-pdf-serialization-rules-2026-02-22.md`

- 코드 계약 확정:
  - `web/src/content.config.ts`에 `basics.heroMetrics[]`, `skills.coreStrengths[]` optional 스키마(1~4개) 추가
  - `web/src/lib/resume-portfolio/contracts.ts`에 `architectureSummary?`, `measurementMethod?`, `tradeOff?` 추가
  - `web/src/lib/resume-portfolio/story-thread-schema.ts`에 신규 optional 필드 검증 규칙(빈 문자열 금지) 추가
  - `web/src/lib/pdf/types.ts`에 Hero/Core Strength/Project 확장 직렬화 타입 추가
  - `web/src/lib/pdf/serialize-resume.ts`에 `resumeItemId -> projectId` 매핑 기반 신규 필드 직렬화 추가

- 테스트 확장:
  - `web/tests/lib/resume-portfolio/story-thread-schema.test.ts`
    - 신규 optional 필드 유효 입력 통과 케이스 추가
    - `architectureSummary/measurementMethod/tradeOff` 빈 문자열 실패 케이스 추가
  - `web/tests/lib/pdf/serialize-resume.test.ts`
    - 신규 필드 미존재(역호환) 시나리오 검증 추가
    - 신규 필드 존재 시 매핑/중복 제거(`tradeOffs`) 시나리오 검증 추가

- 검증 결과:
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run typecheck` 통과 (0 error, 0 warning, hint 2개)
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run lint` 통과
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec vitest run tests/lib/resume-portfolio/story-thread-schema.test.ts tests/lib/resume-portfolio/validation.test.ts tests/lib/pdf/serialize-resume.test.ts` 통과 (3 files, 27 tests)

- 완료 처리:
  - Phase 2의 두 체크박스를 `[x]`로 업데이트.
  - 다음 미완료 Phase는 `Phase 3. [PARALLEL:PG-1] Hero + Core Strength 재작성`.

### 2026-02-22 — Phase 3 실행 및 완료

- 구현 파일:
  - `web/src/content/basics/profile.json`
    - 포지셔닝 라벨을 `성능·아키텍처 Frontend Engineer`로 갱신
    - Hero summary를 문제 정의/구조 전환/영향 관점으로 리라이팅
    - 근거 기반 지표 4개(`10초→3초`, `DOM 90%`, `22ms→0.5ms`, `3분→5초`) 추가
  - `web/src/content/skills/skills.json`
    - `coreStrengths` 4축(대규모 렌더링 아키텍처/성능 최적화/아키텍처 설계/DX 자동화·협업) 추가
  - `web/src/pages/_sections/hero-section.astro`
    - `heroMetrics` optional 렌더링 추가
    - Problem/Action/Result 요약 블록 추가
  - `web/src/pages/_sections/core-strength-section.astro` 신규 생성
    - Core Strength 4축 카드형 섹션 신설
  - `web/src/pages/_sections/skills-section.astro`
    - 섹션 제목/설명을 보조 정보 톤으로 조정
  - `web/src/pages/index.astro`
    - 섹션 순서를 `Hero -> Core Strength -> Experience -> Skills -> Projects -> Blog -> Certificates -> Awards`로 재배치
    - `section_view` 대상 ID 집계 로직은 변경하지 않음(Phase 6 이관)
  - `web/e2e/resume-hero-core-strength.spec.ts` 신규 생성
    - Hero 지표 4개, Core Strength 4축, 섹션 순서(코어스트렝스/익스피리언스/스킬) 수용 테스트 추가

- 검증 결과:
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run typecheck` 통과 (3회 게이트 확인, 0 error)
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run lint` 통과
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec vitest run tests/lib/chat-utils.test.ts tests/lib/resume-portfolio/story-thread-schema.test.ts tests/lib/resume-portfolio/validation.test.ts tests/lib/pdf/serialize-resume.test.ts` 통과 (4 files, 30 tests)
  - `CI=1 pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec playwright test e2e/portfolio-deep-link.spec.ts e2e/portfolio-toc-and-print.spec.ts e2e/resume-portfolio-print-flow.spec.ts e2e/accessibility.spec.ts --project=chromium` 통과 (30 passed)
    - 1차 실행 시 `http://localhost:4321 is already used`로 실패 후 포트 점유 프로세스 정리 후 재실행 통과
  - `CI=1 pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec playwright test e2e/resume-hero-core-strength.spec.ts --project=chromium` 통과 (3 passed)

- Phase 6 이관 항목:
  - Navigation(`web/src/components/navigation/section-nav.tsx`) 항목 정합성 변경
  - analytics `section_view` 집계 섹션 ID 재정렬

- 완료 처리:
  - Phase 3의 두 체크박스를 `[x]`로 업데이트.
  - 다음 미완료 Phase는 `Phase 4. [PARALLEL:PG-1] Experience-Projects 통합 설계`.

### 2026-02-22 — Phase 3 후속 조정 (사용자 피드백 반영)

- 반영 내용:
  - Hero 영역의 `Problem·Action·Result` 카드 제거
  - Hero 영역의 `Key Metrics` 카드 UI 제거
  - `web/e2e/resume-hero-core-strength.spec.ts`를 최신 요구사항 기준(카드 미노출)으로 갱신

- 검증 결과:
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run typecheck` 통과
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run lint` 통과
  - `CI=1 pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec playwright test e2e/resume-hero-core-strength.spec.ts --project=chromium` 통과 (3 passed)

### 2026-02-22 — Phase 4 실행 및 완료

- 실행 방식 (Layer):
  - Layer 1: `technical-writing-curation` 유틸/테스트 추가 + Experience 카드 UI 확장
  - Layer 2: index 데이터 주입/Projects 섹션 제거 + Technical Writing 섹션 재정의 + nav/analytics 정합 반영
  - Layer 3: 접근성/복귀 플로우 E2E 기대값 갱신 및 회귀 검증

- 구현 파일:
  - `web/src/lib/blog/technical-writing-curation.ts` 신규
    - 대표 글 + 최신 글 큐레이션(`대표 1 + 최신 4`) 규칙 추가
    - 제목/요약 키워드 점수 기반 대표 글 선택 + 0점 fallback(최신 글)
  - `web/tests/lib/blog/technical-writing-curation.test.ts` 신규
    - 대표 글 점수 선택, 중복 제거, fallback, 5개 미만 시나리오 검증 추가
  - `web/src/pages/_sections/experience-section.astro`
    - Experience 내부에 대표 케이스 카드(제목/요약/핵심 불렛/CTA) 통합 렌더링
    - 기존 CTA(`상세 케이스 스터디 보기`) 및 `project_portfolio_click` 이벤트 유지
    - 프로젝트가 없는 경력은 highlights fallback 유지
  - `web/src/pages/index.astro`
    - `summaryBlocks + mappings` 기반 케이스 데이터를 ExperienceSection에 주입
    - 분리된 `ProjectSection` 렌더 제거
    - analytics `section_view` 관찰 대상에서 `#projects` 제거
  - `web/src/pages/_sections/blog-section.astro`
    - 섹션 타이틀/설명을 `Technical Writing` 관점으로 재정의
    - 대표 1개 카드 + 최신 4개 리스트 구성(중복 제외), `id="blog"` 유지
    - 기존 Blog 링크 동작 및 `blog_post_click`, `blog_all_posts_click` 이벤트 유지
  - `web/src/components/navigation/section-nav.tsx`
    - Resume 네비에서 `projects` 항목 제거
    - `blog` 라벨을 `Technical Writing`으로 변경
  - `web/e2e/accessibility.spec.ts`
    - 키보드 섹션 내비게이션 기대값을 `Technical Writing`/`#blog`로 갱신
  - `web/e2e/portfolio-resume-return-flow.spec.ts`
    - 스크롤 기준 섹션을 `#projects` -> `#experience`로 갱신

- 검증 결과:
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run typecheck` 통과 (0 error, 0 warning, hint 2개)
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run lint` 통과
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec vitest run tests/lib/blog/technical-writing-curation.test.ts tests/lib/experience/company-projects.test.ts tests/lib/resume-portfolio/validation.test.ts tests/lib/pdf/serialize-resume.test.ts` 통과 (4 files, 22 tests)
  - `CI=1 pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec playwright test e2e/accessibility.spec.ts e2e/portfolio-resume-return-flow.spec.ts e2e/portfolio-deep-link.spec.ts e2e/resume-portfolio-print-flow.spec.ts --project=chromium` 통과 (21 passed)

- 완료 처리:
  - Phase 4의 두 체크박스를 `[x]`로 업데이트.
  - 다음 미완료 Phase는 `Phase 5. [PARALLEL:PG-1] 프로젝트 4건 리라이팅`.

### 2026-02-22 — Phase 5 실행 및 완료

- 실행 방식 (Layer):
  - Layer 1-A: 4개 프로젝트 콘텐츠(`storyThread + 본문 템플릿`)와 Experience 요약 계약(`resume-portfolio/content`) 동시 리라이팅
  - Layer 1-B: 포트폴리오 상세 UI에 `Architecture Summary`, `Measurement Method`, `Trade-off` 노출 추가
  - Layer 2: 포트폴리오 PRD 수용 E2E를 템플릿 요소 검증(Problem/Why Hard/Decision/Implementation/Result/Learned)으로 확장
  - Layer 3: typecheck/lint/vitest/playwright 품질 게이트 실행

- 구현 파일:
  - `web/src/content/projects/exem-customer-dashboard.md`
  - `web/src/content/projects/exem-data-grid.mdx`
  - `web/src/content/projects/exem-new-generation.md`
  - `web/src/content/projects/exem-dx-improvement.md`
  - `web/src/lib/resume-portfolio/content.ts`
  - `web/src/components/portfolio/case-study-section.astro`
  - `web/src/components/portfolio/story-thread-timeline.astro`
  - `web/e2e/portfolio-prd-acceptance.spec.ts`
  - `web/e2e/portfolio-before-after.spec.ts`
  - `web/e2e/portfolio-toc-and-print.spec.ts`

- 핵심 반영:
  - 4개 케이스 모두 `architectureSummary`(4줄), `measurementMethod`(도구+반복+기준), `threads[].tradeOff`를 채움
  - 액션 문장에 `설계/제안/주도/정의/표준화` 동사를 반영하고 결과 문장을 수치+운영 영향 중심으로 리라이팅
  - 본문을 `Architecture Summary -> Context -> Problem -> Why It Was Hard -> Architecture Decision -> Implementation Strategy -> Result -> What I Learned` 템플릿으로 통일
  - 상세 페이지 `hook` 섹션에 `Architecture Summary`/`Measurement Method`를 optional 노출하고, `threads`에 `Architecture Decision (Trade-off)`/`Implementation Strategy` 표현을 명시
  - 상세 마지막 섹션 헤딩을 `What I Learned`로 정렬(섹션 ID `retrospective`는 유지)

- 검증 결과:
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run typecheck` 통과 (0 error, 0 warning, hint 2개)
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run lint` 1차 포맷 오류(`e2e/portfolio-prd-acceptance.spec.ts`) 수정 후 통과
  - `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec vitest run tests/lib/resume-portfolio/story-thread-schema.test.ts tests/lib/resume-portfolio/validation.test.ts tests/lib/pdf/serialize-resume.test.ts` 1차 기대값 불일치 수정 후 통과 (3 files, 27 tests)
  - `CI=1 pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec playwright test e2e/portfolio-prd-acceptance.spec.ts e2e/portfolio-deep-link.spec.ts e2e/portfolio-toc-and-print.spec.ts e2e/portfolio-before-after.spec.ts --project=chromium` 통과 (20 passed)
    - 1차 실행: `http://localhost:4321 is already used` 실패, 포트 점유 프로세스 종료 후 재실행 통과

- 완료 처리:
  - Phase 5의 두 체크박스를 `[x]`로 업데이트.
  - 다음 미완료 Phase는 `Phase 6. [SEQUENTIAL] 랜딩 섹션·내비게이션 정합성`.

### 2026-02-22 — 케이스 스터디 V2 템플릿 일괄 전환

- 변경 범위:
  - 상세 케이스 4건의 `storyThread`를 V2 구조(`tldrSummary/keyMetrics/coreApproach/problemDefinition/problemPoints/decisions/implementationHighlights/validationImpact/lessonsLearned`)로 전환
  - 포트폴리오 섹션 계약을 `tldr/problem-definition/key-decisions/implementation-highlights/validation-impact/learned`로 교체
  - 딥링크 기본 앵커를 `#tldr`로 전환하고 레거시 해시는 canonical 변환 없이 기본 섹션으로 폴백

- 구현 파일:
  - `web/src/lib/resume-portfolio/contracts.ts`
  - `web/src/lib/resume-portfolio/story-thread-schema.ts`
  - `web/src/lib/resume-portfolio/content.ts`
  - `web/src/lib/resume-portfolio/hash.ts`
  - `web/src/pages/portfolio/[slug].astro`
  - `web/src/components/portfolio/case-study-section.astro`
  - `web/src/components/navigation/navigation.tsx`
  - `web/src/lib/pdf/serialize-resume.ts`
  - `web/src/content/projects/exem-customer-dashboard.md`
  - `web/src/content/projects/exem-data-grid.mdx`
  - `web/src/content/projects/exem-new-generation.md`
  - `web/src/content/projects/exem-dx-improvement.md`
  - `web/tests/lib/resume-portfolio/story-thread-schema.test.ts`
  - `web/tests/lib/resume-portfolio/hash.test.ts`
  - `web/tests/lib/resume-portfolio/content-schema.test.ts`
  - `web/tests/lib/resume-portfolio/validation.test.ts`
  - `web/tests/lib/pdf/serialize-resume.test.ts`
  - `web/e2e/portfolio-deep-link.spec.ts`
  - `web/e2e/portfolio-toc-and-print.spec.ts`
  - `web/e2e/portfolio-prd-acceptance.spec.ts`
  - `web/e2e/portfolio-before-after.spec.ts`
  - `web/e2e/resume-portfolio-print-flow.spec.ts`
  - `web/e2e/portfolio-resume-return-flow.spec.ts`
  - `web/e2e/accessibility.spec.ts`

- 문서 동기화:
  - `docs/resume-hiring-optimization-direction-2026-02-22.md` 공통 템플릿을 V2 순서로 갱신
  - `docs/resume-phase1-acceptance-criteria-30s-scan-2026-02-22.md` DQ-02 템플릿 기준을 V2 명칭으로 갱신
