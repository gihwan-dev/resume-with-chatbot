---
companyId: "ai-automation"
title: "API 스펙 파싱 및 변경 감지 자동화"
techStack: ["Node.js", "Swagger 2.0", "OpenAPI 3.0.x"]
dateStart: 2024-11-01
priority: 2
variants: ["ai-agent"]
summary: "API 변경 대응 업무를 AI 에이전트가 자동으로 처리하는 내부 도구입니다. 기존에는 개발자가 Swagger 문서를 직접 읽고 변경을 판단하는 수동 흐름이었지만, 이 도구 도입 후 API 명세 변경 감지부터 breaking/non-breaking 분류까지 거의 100% AI 영역으로 전환했습니다."
accomplishments:
  - "Swagger 2.0 / OpenAPI 3.0.x 문서를 파싱해 구조화된 스키마 정보를 반환하는 도구를 구현했습니다. 초기에는 MCP 서버로 운영했으나, 프로젝트 내장 스킬(.agents/skills/)로 전환해 외부 의존성을 제거하고 개발 환경에 직접 통합했습니다."
  - "전체 스펙을 매번 조회하는 방식에서 스냅샷 기반 diff 비교로 전환하고, 포맷 차이를 정규화해 실질적인 API 변경(breaking/non-breaking)만 자동 분류하도록 개선했습니다."
  - "AI 에이전트가 API 명세 변경을 자동 감지하고 영향 범위를 분석해 대응하는 흐름을 구축함으로써, 변경 대응에 드는 수동 작업을 제거했습니다."
---
