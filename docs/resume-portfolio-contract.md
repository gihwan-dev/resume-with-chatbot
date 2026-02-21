# 이력서/포트폴리오 계약서 (Phase 1)

> 기준 문서: `docs/PRD.md`, `docs/milestone.md`
> 버전: `v1` (2026-02-21)

## 1) 역할과 책임 분리

| 영역 | 페이지 | 책임 |
| --- | --- | --- |
| Resume | `/` | 1~2분 스캔용 요약 정보, 임팩트 불릿, CTA 노출 |
| Portfolio | `/portfolio` | 케이스 스터디 본문(배경/의사결정/결과/회고), 목차/딥링크 소비 |

## 2) 라우트 및 딥링크 규칙

- 기본 라우트:
  - `Resume`: `/`
  - `Portfolio`: `/portfolio`
- 딥링크 규칙:
  - 형식: `/portfolio#<caseId>.<sectionId>`
  - 예시: `/portfolio#exem-data-grid.problem`
- 문법:
  - `caseId`: 소문자 영문/숫자/하이픈만 허용 (`^[a-z0-9]+(?:-[a-z0-9]+)*$`)
  - `sectionId`: `overview | problem | decision | result | retrospective`

## 3) 앵커 네이밍 규칙

- 포맷: `#<caseId>.<sectionId>`
- `caseId`는 콘텐츠 식별자(`projects/*.md`의 파일 슬러그)를 기준으로 고정한다.
- `sectionId`는 계약 enum의 허용값만 사용한다.

## 4) CTA 규칙

- Resume의 각 프로젝트 요약 카드에는 CTA를 1개 배치한다.
- CTA 텍스트 기본값: `상세 케이스 스터디 보기`
- CTA href는 반드시 `/portfolio#<caseId>.<sectionId>` 형식을 따른다.
- 기본 섹션 이동값은 `overview`를 사용한다.

## 5) V1 매핑 표 (프로젝트 카드 단위 1:1)

| resumeItemId | resumeTitle | portfolioCaseId | defaultSectionId | ctaHref |
| --- | --- | --- | --- | --- |
| `project-exem-customer-dashboard` | 고객 특화 DB 모니터링 대시보드 개발 | `exem-customer-dashboard` | `overview` | `/portfolio#exem-customer-dashboard.overview` |
| `project-exem-data-grid` | 데이터 그리드 개발 | `exem-data-grid` | `overview` | `/portfolio#exem-data-grid.overview` |
| `project-exem-new-generation` | 차세대 데이터베이스 성능 모니터링 제품 개발 | `exem-new-generation` | `overview` | `/portfolio#exem-new-generation.overview` |
| `project-exem-dx-improvement` | 개발 생산성 향상 및 자동화 인프라 구축 | `exem-dx-improvement` | `overview` | `/portfolio#exem-dx-improvement.overview` |

## 6) 실패/폴백 규칙

- `caseId`가 없거나 유효하지 않으면 `/portfolio` 상단으로 폴백한다.
- `sectionId`가 유효하지 않으면 해당 케이스의 `overview`로 폴백한다.
- 매핑 검증에서 `hasPortfolio=true` 항목의 누락/중복/깨진 링크는 배포 전 실패로 처리한다.
- `hasPortfolio=false` 항목의 매핑 누락은 경고로 처리한다.

## 7) UI-기능 경계 데이터 계약

아래 타입 계약은 `web/src/lib/resume-portfolio/contracts.ts`에서 소스 오브 트루스로 관리한다.

- `PortfolioSectionId`
- `PortfolioAnchor`
- `ImpactMetric`
- `ResumeSummaryBlock`
- `ResumePortfolioMappingEntry`
- `ResumeItemContract`
- `PortfolioCaseContract`

검증 API는 `validateResumePortfolioMapping(input)`를 사용하고 결과 형식은 `{ isValid, errors, warnings }`로 고정한다.
