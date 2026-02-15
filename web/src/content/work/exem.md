---
company: "주식회사엑셈"
role: "프론트엔드 개발자"
dateStart: 2024-11-01
updatedAt: 2026-02-15
isCurrent: true
summary: "성능 모니터링 솔루션의 프론트엔드 개발을 담당하고 있습니다. ExtJS 레거시 유지보수와 React 기반 차세대 시스템 구축을 병행하며, AI 파이프라인 도입과 개발 도구 개선을 통해 팀 생산성 향상에 기여하고 있습니다."
location: "Seoul, Korea"
---

- Table 렌더러를 Pinned/Virtual 분리와 splitRows 중앙화로 재구성해 91 suites/743 tests 무회귀를 유지했습니다.
- Phase 2 리팩토링을 4개 커밋으로 분할해 변경 경계를 명확히 하고 bisect 가능한 검증 흐름을 확보했습니다.
- Alert Log 모듈을 상태 슬라이스·Split View 모달·3단 레이아웃으로 재구성해 운영자 탐색 동선과 장애 분석 흐름을 개선했습니다.
- Figma 캡처 병목을 MCP 인라인 경로에서 REST API 스크립트로 전환해 실제 URL 기준 PNG(1264x96, 7.1KB) 생성까지 복구했습니다.
- `/design-check` 단일 명령으로 Story 생성·구현 캡처·pixel diff·시각 분석·Markdown 보고서 생성을 오케스트레이션해 디자인 QA 흐름을 표준화했습니다.
- 컬럼 리사이즈를 UI 핸들러와 ColumnResizePolicy로 분리하고 TableHeaderResizeMeta 계층을 도입해 다단 그룹 헤더 조작 일관성과 테스트 가능성을 높였습니다.
