# Phase 1 기준선 스냅샷 (2026-02-22)

## 1) 스냅샷 메타데이터

| 항목 | 값 |
| --- | --- |
| 작성일 | 2026-02-22 |
| 대상 Phase | Phase 1. 기준선 스냅샷 및 수용 기준 정의 |
| 브랜치 | `codex/이력서-포트폴리오-구조-개선` |
| 기준 커밋 | `8e232d91ff44f537a29a6b5cea6411c9dcef6aff` |
| 기준 문서 | `docs/resume-hiring-optimization-direction-2026-02-22.md`, `docs/resume-engineering-guide-2025.md` |
| 참고 PRD | `docs/PRD.md` 파일은 현재 저장소에서 확인되지 않음 |

## 2) 수집 규칙

- 코드/콘텐츠에 실제 존재하는 값만 기록한다.
- 추정 수치, 신규 문장, 가설은 포함하지 않는다.
- 모든 스냅샷 항목에 파일 경로와 라인 근거를 남긴다.

## 3) 현행 구조 기준선

### 3.1 메인 렌더 순서 (실제 화면 렌더 기준)

근거: `web/src/pages/index.astro:66`, `web/src/pages/index.astro:93`, `web/src/pages/index.astro:97`, `web/src/pages/index.astro:101`, `web/src/pages/index.astro:105`, `web/src/pages/index.astro:109`, `web/src/pages/index.astro:113`

1. `profile` (Hero)
2. `skills` (조건부 렌더)
3. `experience`
4. `projects`
5. `blog`
6. `certificates`
7. `awards`

### 3.2 내비게이션 순서 (SectionNav 기준)

근거: `web/src/components/navigation/section-nav.tsx:33`

1. `profile`
2. `experience`
3. `projects`
4. `blog`
5. `certificates`
6. `awards`

### 3.3 `section_view` 집계 섹션 ID

근거: `web/src/pages/index.astro:162`

- `#profile`
- `#skills`
- `#experience`
- `#projects`
- `#blog`
- `#certificates`
- `#awards`

### 3.4 구조 관찰 요약

- 렌더 순서에는 `skills`가 포함되지만, 기본 내비게이션에는 `skills`가 없다.
- `section_view` 집계에는 `skills`가 포함된다.
- 현재 구조는 방향 문서의 목표 구조(`Hero -> Core Strength -> Experience -> Technical Writing -> Awards & Certificates -> AI Assistant`)와 다르다.
  - 목표 구조 근거: `docs/resume-hiring-optimization-direction-2026-02-22.md:39`

## 4) 대표 문구 기준선 (Hero/Projects 중심)

### 4.1 Hero 프로필 문구

근거: `web/src/content/basics/profile.json:2`, `web/src/content/basics/profile.json:3`, `web/src/content/basics/profile.json:5`

- 이름: `최기환`
- 라벨: `Frontend Developer`
- 요약: `제품의 복잡도를 낮추는 아키텍처와 자동화 도구로 비즈니스 임팩트를 만듭니다. 복잡한 문제를 단순화하고, 비효율적인 프로세스를 자동화하는 것을 좋아합니다.`

### 4.2 Projects 요약 문구 (`RESUME_PORTFOLIO_CONTENT_V2`)

근거: `web/src/lib/resume-portfolio/content.ts:7`, `web/src/lib/resume-portfolio/content.ts:22`, `web/src/lib/resume-portfolio/content.ts:37`, `web/src/lib/resume-portfolio/content.ts:52`

- `exem-customer-dashboard`: `React 기반 대시보드 아키텍처 재설계로 장애 인지 시간을 10초에서 3초로 단축하고 인터랙션 지연을 개선했습니다.`
- `exem-data-grid`: `공용 그리드를 div 기반 가상화 구조로 전환해 렌더링 병목을 제거하고 대규모 데이터 화면의 성능 안정성을 확보했습니다.`
- `exem-new-generation`: `차트 유형별 도메인 폼 아키텍처와 상태 지역화 패턴으로 제품 확장성과 운영 안정성을 동시에 개선했습니다.`
- `exem-dx-improvement`: `폐쇄망 환경 제약을 반영한 리포트/온보딩 자동화 인프라를 구축해 팀 피드백 루프와 입사자 적응 속도를 개선했습니다.`

## 5) 핵심 수치 기준선 (프로젝트별)

### 5.1 고객 특화 대시보드 (`exem-customer-dashboard`)

근거: `web/src/content/projects/exem-customer-dashboard.md:13`, `web/src/content/projects/exem-customer-dashboard.md:16`, `web/src/content/projects/exem-customer-dashboard.md:19`

- 장애 인지 시간: `10초 → 3초`
- 인터랙션 지연: `73~82%` 개선
- 렌더링 DOM: `20%+` 감소

### 5.2 데이터 그리드 (`exem-data-grid`)

근거: `web/src/content/projects/exem-data-grid.mdx:13`, `web/src/content/projects/exem-data-grid.mdx:16`, `web/src/content/projects/exem-data-grid.mdx:19`

- 동시 렌더링 DOM: `90%` 감소
- 리사이즈 처리: `22ms -> 0.5ms` (44배 개선)
- 인터랙션 지연: `110ms -> 20~30ms`

### 5.3 차세대 제품 (`exem-new-generation`)

근거: `web/src/content/projects/exem-new-generation.md:13`, `web/src/content/projects/exem-new-generation.md:16`, `web/src/content/projects/exem-new-generation.md:19`

- 차트 타입: `5종` 확장 구조
- 스토어 보일러플레이트: `약 70%` 감소
- i18n 키 누락 런타임 장애: `0건`

### 5.4 DX/자동화 인프라 (`exem-dx-improvement`)

근거: `web/src/content/projects/exem-dx-improvement.md:13`, `web/src/content/projects/exem-dx-improvement.md:16`, `web/src/content/projects/exem-dx-improvement.md:19`

- 리포트 접근 시간: `3분 -> 5초` (97% 개선)
- 리뷰 중 외부 도구 이동: `0회`
- 신규 인원 온보딩: `수 시간 -> 5분`

## 6) 현행 AI 추천 질문 기준선

### 6.1 질문 목록과 개수

근거: `web/src/lib/chat-utils.ts:4`

- 총 5개
- `accessibility-wcag`: `접근성(WCAG) 작업 경험이 있나요?`
- `typescript-quality`: `TypeScript 안정성과 품질을 어떻게 개선했나요?`
- `ai-tools`: `실무에서 AI 도구를 어떻게 활용했나요?`
- `design-system`: `디자인 시스템과 컴포넌트 설계 경험을 알려주세요.`
- `meta-framework`: `메타 프레임워크/SSR/서버리스 경험이 있나요?`

### 6.2 클릭 시 동작 및 이벤트

근거: `web/src/components/assistant-ui/thread.tsx:115`, `web/src/components/assistant-ui/thread.tsx:130`, `web/src/components/assistant-ui/thread.tsx:131`

- 추천 질문은 `SUGGESTED_QUESTIONS`를 순회 렌더링한다.
- 클릭 시 `chat_message` 이벤트(`method: suggestion`)를 전송한다.
- 클릭 시 사용자 메시지를 `aui.thread().append`로 즉시 추가한다.

## 7) 검증 커맨드 기준선 (균형형 세트)

실행 기준:

1. `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run typecheck`
2. `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run lint`
3. `pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec vitest run tests/lib/chat-utils.test.ts tests/lib/resume-portfolio/story-thread-schema.test.ts tests/lib/resume-portfolio/validation.test.ts tests/lib/pdf/serialize-resume.test.ts`
4. `CI=1 pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec playwright test e2e/portfolio-deep-link.spec.ts e2e/portfolio-toc-and-print.spec.ts e2e/resume-portfolio-print-flow.spec.ts e2e/accessibility.spec.ts --project=chromium`

스크립트 근거: `web/package.json:11`, `web/package.json:14`, `web/package.json:16`, `web/package.json:18`, `web/package.json:19`

## 8) 기준선 관찰(Phase 1 종료 시점 기록용)

1. 구조 관점
- 현재는 `Hero -> Skills -> Experience -> Projects -> Blog -> Certificates -> Awards` 구성이다.
- 목표 구조 대비 `Core Strength`와 `Technical Writing` 명시적 구조가 비어 있다.

2. 문장 관점
- 방향 문서가 요구하는 `주도성 동사`, `A vs B 트레이드오프`, `측정 도구/반복 횟수/기준값` 표기 기준은 아직 데이터 계약으로 고정되지 않았다.
  - 근거: `docs/resume-hiring-optimization-direction-2026-02-22.md:61`, `docs/resume-hiring-optimization-direction-2026-02-22.md:71`, `docs/resume-hiring-optimization-direction-2026-02-22.md:78`

3. AI 질문 관점
- 현재 5개 질문은 존재하지만, 방향 문서의 고정 4문항(아키텍처/성능 병목/트레이드오프/회귀 테스트)과는 불일치한다.
  - 근거: `docs/resume-hiring-optimization-direction-2026-02-22.md:172`
