# 이력서/포트폴리오 계약서 (Phase 1)

> 기준 문서: `docs/PRD.md`, `milestone.md`
> 버전: `v1.1` (2026-02-21)
> 상태: 점진 도입(legacy section 계약 유지 + Story Thread 스키마 optional 추가)

## 1) 역할과 책임 분리

| 영역 | 페이지 | 책임 |
| --- | --- | --- |
| Resume | `/` | 1~2분 스캔용 요약 정보, 임팩트 불릿, CTA 노출 |
| Portfolio | `/portfolio` | 케이스 스터디 본문(배경/의사결정/결과/회고), 목차/딥링크 소비 |
| Story Thread Data | `src/content/projects/*` frontmatter | Hook First + Context + Threads + Retrospective 렌더링용 구조 데이터 소스 |

## 2) 라우트/딥링크 계약(v1 유지)

- 기본 라우트:
  - `Resume`: `/`
  - `Portfolio`: `/portfolio`
- 딥링크 규칙:
  - 형식: `/portfolio/<caseId>#<sectionId>`
  - 예시: `/portfolio/exem-data-grid#problem`
- 문법:
  - `caseId`: 소문자 영문/숫자/하이픈만 허용 (`^[a-z0-9]+(?:-[a-z0-9]+)*$`)
  - `sectionId`: `overview | problem | decision | result | retrospective`
- 주의:
  - Phase 1에서는 `PortfolioSectionId`를 변경하지 않는다.
  - Story Thread 도입은 데이터 계약에 한정하며 해시 규칙은 유지한다.

## 3) Story Thread 데이터 계약(v1.1 추가)

Story Thread 데이터는 `projects` 컬렉션 frontmatter의 `storyThread`(optional)로 관리한다.

```yaml
storyThread:
  context: string
  impacts:
    - value: string
      label: string
      description: string
  threads:
    - issueTitle: string
      problems: string[]
      thoughtProcess: string
      actions: string[]
      result: string
  lessonsLearned: string
```

필수/옵션 규칙:

- `storyThread`는 optional이다(점진 도입).
- `storyThread`가 존재하면 내부 필드는 모두 required이다.
- `impacts`: 2~3개.
- `threads`: 2~3개.
- 각 thread의 `problems`, `actions`: 최소 1개 이상.
- `context`, `thoughtProcess`, `result`, `lessonsLearned`: 빈 문자열 불가.

## 4) 스키마 검증 실패 기준

`validateProjectStoryThread(input)`는 오류를 아래 코드로 분류한다.

- `missing`: 필수 필드 누락
- `type_mismatch`: 타입 불일치
- `empty_array`: 배열 필드가 빈 배열
- `invalid_value`: 길이 제약 위반/빈 문자열 등 값 제약 실패

## 5) 레거시 본문 매핑 규칙

기존 본문 구조(`problem`, `decision`, `result`, `retrospective`)는 Phase 1에서 유지한다.

- `problem` 목록 → 각 thread의 `problems`
- `decision` 핵심 전개 → `thoughtProcess` + `actions`
- `result` 문단 → 각 thread의 `result` 및 상단 `impacts` 근거
- `retrospective` 문단 → `lessonsLearned`

## 6) CTA 규칙(v1 유지)

- Resume의 각 프로젝트 요약 카드에는 CTA를 1개 배치한다.
- CTA 텍스트 기본값: `상세 케이스 스터디 보기`
- CTA href는 반드시 `/portfolio/<caseId>#<sectionId>` 형식을 따른다.
- 기본 섹션 이동값은 `overview`를 사용한다.

## 7) V1 매핑 표 (프로젝트 카드 단위 1:1)

| resumeItemId | resumeTitle | portfolioCaseId | defaultSectionId | ctaHref |
| --- | --- | --- | --- | --- |
| `project-exem-customer-dashboard` | 고객 특화 DB 모니터링 대시보드 개발 | `exem-customer-dashboard` | `overview` | `/portfolio/exem-customer-dashboard#overview` |
| `project-exem-data-grid` | 데이터 그리드 개발 | `exem-data-grid` | `overview` | `/portfolio/exem-data-grid#overview` |
| `project-exem-new-generation` | 차세대 데이터베이스 성능 모니터링 제품 개발 | `exem-new-generation` | `overview` | `/portfolio/exem-new-generation#overview` |
| `project-exem-dx-improvement` | 개발 생산성 향상 및 자동화 인프라 구축 | `exem-dx-improvement` | `overview` | `/portfolio/exem-dx-improvement#overview` |

## 8) 실패/폴백 규칙(v1 유지)

- `caseId`가 없거나 유효하지 않으면 `/portfolio` 상단으로 폴백한다.
- `sectionId`가 유효하지 않으면 해당 케이스의 `overview`로 폴백한다 (`/portfolio/<caseId>#overview`).
- 레거시 해시 포맷(`/portfolio#<caseId>.<sectionId>`)은 신규 구현에서 지원하지 않는다.
- 매핑 검증에서 `hasPortfolio=true` 항목의 누락/중복/깨진 링크는 배포 전 실패로 처리한다.
- `hasPortfolio=false` 항목의 매핑 누락은 경고로 처리한다.

## 9) UI-기능 경계 데이터 계약

아래 타입 계약은 `web/src/lib/resume-portfolio/contracts.ts`에서 소스 오브 트루스로 관리한다.

- `PortfolioSectionId`
- `PortfolioAnchor`
- `ResumeSummaryBlock`
- `ResumePortfolioMappingEntry`
- `ResumeItemContract`
- `PortfolioCaseContract`
- `ImpactItem`
- `StoryThreadItem`
- `ProjectStoryThread`

검증 API:

- `validateResumePortfolioMapping(input)` -> `{ isValid, errors, warnings }`
- `validateProjectStoryThread(input)` -> `{ isValid, errors }`
