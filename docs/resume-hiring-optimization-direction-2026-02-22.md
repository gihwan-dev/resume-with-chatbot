# 이력서 합격확률 최적화 수정 방향서 (성능·아키텍처 FE)

> 기준 문서: `/Users/choegihwan/Documents/Projects/resume-with-ai/docs/resume-engineering-guide-2025.md`, `/Users/choegihwan/Documents/Projects/resume-with-ai/docs/PRD.md`, 사용자 피드백(2026-02-22)
> 현재 구조 기준: `Hero -> Skills -> Experience -> Projects -> Blog -> Certificates -> Awards`
> 적용 범위: 문서/콘텐츠/섹션 구조/AI 질문/PDF/검증 전략
> 비범위: 기업 유형별 분기 버전(대기업/스타트업/외국계)

## 1. 목표와 독자

### 최상위 목표

- 채용 담당자가 **30초 이내 스캔**으로 "이 사람은 대규모 데이터/성능 문제를 구조적으로 해결할 수 있다"라고 판단할 수 있게 만든다.

### 핵심 독자

- 1차: 채용 담당자/리쿠르터(짧은 스캔, 포지션 적합성 판단)
- 2차: 시니어 FE/엔지니어링 매니저(기술 의사결정 깊이 검증)

## 2. 현황 진단

### 현재 정보 구조(구현 기준)

- 메인 페이지는 `/Users/choegihwan/Documents/Projects/resume-with-ai/web/src/pages/index.astro`에서 `Hero -> Skills -> Experience -> Projects -> Blog` 순으로 렌더링한다.
- `Skills`와 `Projects`는 기술/성과를 분리해 노출하고 있어, "문제 해결 능력 프레임"이 첫 스캔에 잘 드러나지 않는다.
- 포트폴리오 상세의 Story Thread 구조는 구축되어 있으나, 메인 이력서 스캔 경로와 완전히 결합되지 않았다.

### 결손 지점

1. 주도성 표현 약함: "도입/전환" 중심 문장으로 개인의 설계/제안/주도 역할이 약하게 보인다.
2. 트레이드오프 노출 부족: A/B 선택 기준과 리스크 보완 방식이 빠져 시니어 판단 근거가 약하다.
3. 측정 신뢰도 부족: 수치는 있으나 측정 도구/반복 횟수/기준 시나리오가 불명확하다.
4. 약한 수치 맥락 부족: `20%` 같은 수치가 왜 중요한지 운영/사용자 맥락 연결이 부족하다.
5. 구조적 사고 문장 배치 약함: "미세 최적화 vs 구조 전환" 같은 핵심 사고 문장이 상단 신호로 활용되지 않는다.

## 3. 목표 정보 구조

다음 순서를 기본 구조로 고정한다.

1. **Hero (정체성 + 숫자 신뢰)**
2. **Experience (대표 임팩트 케이스 통합)**
3. **Technical Writing**
4. **Awards & Certificates**
5. **AI Assistant**

### 섹션별 목적

| 섹션 | 스캔 시 전달할 메시지 | 최소 포함 요소 |
| --- | --- | --- |
| Hero | 어떤 문제를 잘 푸는 FE인지 | 포지셔닝 한 줄 + 핵심 수치 3~4개 |
| Experience | 실제 문제 해결 사례와 영향 범위 | 대표 케이스 통합, 주도성 문장 |
| Technical Writing | 설계 사고 언어화 능력 | 설계 주제별 글 큐레이션 |
| Awards & Certificates | 학습/성과의 검증 신호 | 실무 연결 문장 |
| AI Assistant | 질문 없이 탐색 가능한 인터페이스 | 추천 질문 4개 고정 |

## 4. 문장 리라이팅 규칙

### 4.1 주도성 표현(의무)

- 모든 핵심 액션 문장에는 아래 동사를 최소 1개 포함한다.
- `설계`, `제안`, `주도`, `정의`, `표준화`

예시 변환:

- Before: `Polling Manager를 도입했습니다.`
- After: `분산 폴링 병목을 근본적으로 해결하기 위해 Polling Manager 아키텍처를 제안하고 설계·도입을 주도했습니다.`

### 4.2 트레이드오프 문단(의무)

- 케이스마다 `선택지 A vs B`, `리스크`, `완화 전략`을 1문단으로 작성한다.
- 형식:
  - `A를 선택하면 X 장점이 있으나 Y 리스크가 있었다.`
  - `이를 보완하기 위해 Z 정책/UX/검증 전략을 함께 설계했다.`

### 4.3 측정 방식 표기(의무)

- 성능 수치에는 아래 3요소를 반드시 함께 적는다.
1. 측정 도구: 예) `React Profiler`, `Performance API`, `RUM`, `Web Vitals`
2. 반복 횟수: 예) `동일 시나리오 30회`
3. 기준값: 예) `평균값`, `p95`

### 4.4 약한 수치 맥락 보강 템플릿

- 수치 단독 금지, 운영 맥락을 함께 적는다.
- 템플릿:
  - `기존 [기준값]에서 [개선폭] 개선해 [사용자/운영 영향]을 확보했다.`

### 4.5 구조적 사고 문장 우선 배치

- 각 케이스 상단에 다음 형태의 문장을 배치한다.
- 템플릿:
  - `문제를 미세 최적화가 아닌 구조 전환 + 회귀 검증 체계 문제로 정의하고 접근했다.`

## 5. 프로젝트별 적용 가이드 (4건)

## 5.0 공통 템플릿 (고정)

모든 대표 케이스는 아래 순서로 작성한다.

1. TL;DR (한 화면 요약)
2. 문제 정의 (Why This Was Hard 통합)
3. 핵심 의사결정 (2~3개, A vs B + Trade-off)
4. 구현 전략 (Implementation Highlights)
5. 검증 및 결과 (Validation & Impact)
6. What I Learned

### 5.1 고객 특화 대시보드 (`exem-customer-dashboard`)

- 포지셔닝: 운영자 탐색 UX를 구조적으로 재설계한 케이스
- 강조:
  - 장애 인지 시간 단축(10초 -> 3초)
  - 인터랙션 지연 개선(73~82%)
  - 중앙 폴링 정책 통합

Architecture Summary 예시:

- 중앙 폴링 정책 통합
- 고밀도 그리드 전환
- 렌더 우선순위 제어
- 회귀 자동화 검증

### 5.2 데이터 그리드 (`exem-data-grid`)

- 포지셔닝: 대규모 데이터 렌더링 아키텍처 카드(최우선 배치)
- 강조:
  - DOM 90% 감소
  - 리사이즈 44배 향상
  - 접근성/성능 트레이드오프 처리

Architecture Summary 예시:

- `table -> div + virtualization` 구조 전환
- 계산 경로 단순화
- 이벤트 모델 경량화
- 성능 회귀 게이트 구축

### 5.3 차세대 제품 (`exem-new-generation`)

- 포지셔닝: 확장성 설계 능력 검증 케이스
- 강조:
  - 도메인 폼 아키텍처
  - 상태 지역화 패턴
  - 검증 시점 전진(개발/빌드 단계)

Architecture Summary 예시:

- 도메인 경계 명확화
- 스키마 기반 검증
- 상태 수명과 UI 수명 정렬
- 기능 추가 비용 절감

### 5.4 DX/자동화 인프라 (`exem-dx-improvement`)

- 포지셔닝: 조직 영향력/시스템 사고 카드
- 강조:
  - 폐쇄망 제약 분석 기반 자동화 설계
  - 온보딩 5분화
  - 피드백 루프 단축

Architecture Summary 예시:

- 폐쇄망 제약 기반 파이프라인 설계
- 브라우저 중심 검증 경로 전환
- 협업 흐름 내 AI 통합
- 표준 운영 가이드 문서화

## 6. AI Assistant 개편 방향

### 추천 질문 4개(고정)

1. `이 개발자의 아키텍처 설계 철학은 무엇인가요?`
2. `대규모 데이터 성능 병목을 어떤 순서로 해결했나요?`
3. `가장 어려웠던 트레이드오프와 선택 근거는 무엇인가요?`
4. `회귀를 막기 위한 테스트 전략은 어떻게 설계했나요?`

### 반영 위치

- `/Users/choegihwan/Documents/Projects/resume-with-ai/web/src/lib/chat-utils.ts`의 `SUGGESTED_QUESTIONS` 교체
- 클릭 -> 사용자 메시지 append 및 analytics 이벤트(`chat_message`) 유지

## 7. 누락 역량 보강 기준

아래 항목은 "새 경험 생성"이 아니라 **기존 근거 연결** 방식으로만 추가한다.

1. Web Vitals 측정 경험
2. 번들 최적화 경험
3. 접근성 대응 경험
4. 디자인 협업 방식
5. 코드 리뷰 문화 기여

작성 원칙:

- 근거 문서/로그/측정값이 없는 항목은 "측정/검증 필요"로 남긴다.
- 허위 수치, 추정 성과는 추가하지 않는다.

## 8. 완료 기준

## 8.1 문서 품질 게이트

- [ ] 목표 정보 구조가 문서 내에서 고정 순서로 정의되었는가
- [ ] 4개 프로젝트 모두 공통 템플릿을 충족하는가
- [ ] 주도성/트레이드오프/측정 방식 규칙이 명문화되었는가
- [ ] 누락 역량 5개에 대한 반영 기준이 정의되었는가

## 8.2 구현 검증 게이트(후속 구현 단계)

```bash
pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run typecheck
pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run lint
pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec vitest run tests/lib/resume-portfolio/story-thread-schema.test.ts tests/lib/resume-portfolio/validation.test.ts tests/lib/pdf/serialize-resume.test.ts
CI=1 pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web exec playwright test e2e/portfolio-deep-link.spec.ts e2e/portfolio-toc-and-print.spec.ts e2e/resume-portfolio-print-flow.spec.ts e2e/accessibility.spec.ts --project=chromium
```

## 9. 기본 가정

- 포지셔닝은 `성능·아키텍처 FE` 단일 전략으로 유지한다.
- 기존 `/Users/choegihwan/Documents/Projects/resume-with-ai/milestone.md`는 보존한다.
- 이번 단계는 문서 산출물 2개 생성까지 수행하고, 실제 코드 변경은 다음 세션에서 진행한다.
