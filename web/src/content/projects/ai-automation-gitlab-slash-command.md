---
companyId: "ai-automation"
title: "GitLab AI 슬래시 커맨드 시스템 구축"
techStack: ["n8n", "Claude API", "GitLab API", "MCP"]
dateStart: 2024-11-01
priority: 1
variants: ["ai-agent"]
summary: "MR 코멘트에서 동작하는 AI 슬래시 커맨드(/mr, /review, /ai, /graph) 4종을 설계·구현해 변경사항 요약과 코드 품질 리포트 자동화 파이프라인을 구축했습니다."
accomplishments:
  - "GitLab Webhook -> n8n 워크플로우 -> MCP 기반 diff 수집 -> AI Agent -> GitLab API 포스팅 흐름으로 자동화했습니다."
  - "/review 커맨드에 React Clean Code Scorecard 5개 지표(CC, LoC, Props, Drilling, Hooks)를 반영해 정량 리포트를 생성하도록 구성했습니다."
  - "실제 diff 범위를 벗어난 추측을 제한하는 anti-hallucination 규칙을 적용해 결과 신뢰성을 관리했습니다."
  - "반복적인 MR 문서 작성과 리뷰 보조 작업을 줄이는 것을 운영 목표로 두고 단계적으로 확장하고 있습니다."
---
