---
companyId: "ai-automation"
title: "GitLab AI 자동화 플랫폼 구축"
techStack: ["LangGraph.js", "Deep Agents SDK", "Fastify", "Piscina", "PostgreSQL", "Langfuse", "Sentry", "OpenTelemetry", "Docker", "Kubernetes"]
dateStart: 2024-11-01
priority: 1
variants: ["ai-agent"]
summary: "MR 코멘트 슬래시 커맨드(/mr, /review, /ai, /graph)에서 시작해, 이슈 자동 해결과 @autobot 멘션 시스템까지 갖춘 종합 GitLab AI 자동화 플랫폼을 구축했습니다. n8n 프로토타입(Phase 1)에서 LangGraph.js 기반 상태 보존 아키텍처(Phase 2)로 전환하며 장기 실행 안정성과 LLM 관측성을 확보했습니다."
accomplishments:
  - "Phase 1: 슬래시 커맨드 4종을 설계하고 anti-hallucination 규칙으로 실제 diff 범위 외 추측을 제한했습니다."
  - "Phase 1: React Clean Code Scorecard 5개 지표 기반 정량 리포트를 자동 생성하도록 구성했습니다."
  - "Phase 2: LangGraph durable execution으로 전환해, AI 에이전트가 사람 승인을 기다리거나 중단되더라도 PostgreSQL 체크포인트에서 재개할 수 있는 구조를 구축했습니다."
  - "Phase 2: automation 라벨이 붙은 이슈를 triage→clarification→work→publish 4단계로 자동 해결하고, @autobot 멘션 시 의도를 분류해 적합한 전문가 에이전트로 라우팅하는 시스템을 구축했습니다."
  - "Phase 2: 웹훅 동시 처리를 Piscina 워커 풀로 병렬화하고, Langfuse(LLM 트레이싱)·Sentry·OpenTelemetry를 통합해 에이전트 동작의 추적·디버깅 경로를 확보했습니다."
---
