---
companyId: "ai-automation"
title: "API 스펙 파싱 및 변경 감지 자동화"
techStack: ["Node.js", "Swagger 2.0", "OpenAPI 3.0.x"]
dateStart: 2024-11-01
priority: 2
variants: ["ai-agent"]
summary: "Swagger 2.0 / OpenAPI 3.0.x 스펙을 파싱해 AI 에이전트가 API 명세를 자동 해석하는 도구를 개발했습니다. MCP 서버로 시작해 npm에 배포한 뒤, 프로젝트 내장 스킬로 전환하며 외부 의존성을 제거하고 스냅샷 기반 변경 감지를 추가했습니다."
accomplishments:
  - "OpenAPI 문서를 파싱해 구조화된 스키마 정보를 반환하는 도구를 구현하고, 초기에는 MCP 서버로 npm에 배포해 운영했습니다."
  - "이후 프로젝트 내장 스킬(.agents/skills/)로 전환해 불필요한 외부 의존성을 제거하고 개발 환경에 직접 통합했습니다."
  - "전체 스펙을 매번 조회하는 방식에서 스냅샷 기반 diff 비교로 전환하고, 포맷 차이를 정규화해 실질적인 API 변경(breaking/non-breaking)만 자동 분류하도록 개선했습니다."
---
