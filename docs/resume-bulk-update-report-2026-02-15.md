# Resume Bulk Update Report - 2026-02-15

## 1) Parameters
- RUN_DATE: 2026-02-15
- THEME: BULK_REFRESH
- BULK_LOOKBACK_DAYS: 3650
- BULK_MAX_CARDS_CONSIDER: 400
- BULK_MAX_CARDS_USE: 60
- BULK_MAX_FILES_EDIT: 6
- BULK_MAX_BULLETS_CHANGED: 25
- BULK_LENGTH_INCREASE_MAX: 0.03
- BULK_SCORE_DELTA_MIN: 6

## 2) Score
- SCORE_BEFORE: 18/30
- SCORE_AFTER: 24/30
- DELTA: +6

### Score Detail (0~5)
- Evidence Verifiability: 2 -> 4
- Business Impact Clarity: 3 -> 4
- Technical Depth: 3 -> 5
- Brevity/Readability: 3 -> 4
- Differentiation: 3 -> 4
- Consistency/Tone: 4 -> 3

## 3) Files Modified
- web/src/content/work/exem.md
- docs/resume-bulk-update-report-2026-02-15.md
- docs/resume-daily-scorecard.md

## 4) Change Volume
- Resume content files edited: 1
- Bullets changed: 6
- Net bullet delta (work): 0

## 5) Cards Used
- ACH-20260206-001
- ACH-20260128-001
- ACH-20260128-002
- ACH-20260213-001

## 6) Bullet Mapping (Bullet -> ACH -> Sources)
1. Table 렌더러 분리 + splitRows 중앙화 + 91/743 무회귀
- ACH: ACH-20260206-001
- Sources:
  - /Users/choegihwan/Documents/Projects/Obsidian-frontend-journey/Exem/01-Projects/Table 컴포넌트/개발/2차 리팩토링/마일스톤.md

2. Phase 2를 4개 커밋으로 분할, bisect 가능한 검증 흐름
- ACH: ACH-20260206-001
- Sources:
  - /Users/choegihwan/Documents/Projects/Obsidian-frontend-journey/Exem/01-Projects/Table 컴포넌트/개발/2차 리팩토링/마일스톤.md

3. Alert Log 모듈 재구성으로 탐색/분석 흐름 개선
- ACH: (resume 기존 근거 재작성)
- Sources:
  - /Users/choegihwan/Documents/Projects/Obsidian-frontend-journey/Daily Notes/2026-02-11.md

4. MCP 인라인 병목 -> REST API 전환, PNG(1264x96, 7.1KB) 복구
- ACH: ACH-20260128-002
- Sources:
  - /Users/choegihwan/Documents/Projects/Obsidian-frontend-journey/Exem/01-Projects/디자인-검증-자동화/기획/milestone.md

5. /design-check 단일 명령 오케스트레이션 표준화
- ACH: ACH-20260128-001
- Sources:
  - /Users/choegihwan/Documents/Projects/Obsidian-frontend-journey/Exem/01-Projects/디자인-검증-자동화/기획/milestone.md

6. ColumnResizePolicy 분리 + TableHeaderResizeMeta 도입
- ACH: ACH-20260213-001
- Sources:
  - /Users/choegihwan/Documents/Projects/Obsidian-frontend-journey/Exem/01-Projects/Table 컴포넌트/설계/아키텍쳐 변경 - 20260213.md

## 7) Skipped Cards Summary
- ACH-20260211-001: company=Personal, 본 런의 회사 일치 정책(Exem/Kmong)으로 제외
- ACH-20260211-002: company=Personal, 본 런의 회사 일치 정책(Exem/Kmong)으로 제외
- ACH-20260213-002: company=Personal, 본 런의 회사 일치 정책(Exem/Kmong)으로 제외

## 8) Open Questions
- 디자인 QA 자동화(`/design-check`) 도입 전/후 수동 검수 시간 절감률을 계측할 수 있는가?
- ColumnResizePolicy 분리 후 리사이즈 실패율/재현율 변화 지표를 추적할 수 있는가?
- Alert Log 재구성 이후 운영자 탐색 시간 또는 장애 분석 lead time 지표를 수집할 수 있는가?
