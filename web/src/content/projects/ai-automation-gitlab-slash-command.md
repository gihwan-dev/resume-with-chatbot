---
companyId: "ai-automation"
title: "GitLab AI 자동화 플랫폼 구축"
techStack: ["LangGraph.js", "Deep Agents SDK", "Fastify", "Piscina", "PostgreSQL", "Langfuse", "Sentry", "OpenTelemetry", "Docker", "Kubernetes"]
dateStart: 2024-11-01
priority: 1
variants: ["ai-agent"]
summary: "GitLab 이슈 자동 해결과 @autobot 멘션 라우팅을 갖춘 종합 AI 자동화 플랫폼을 LangGraph.js 기반으로 구축했습니다. PostgreSQL 체크포인트 기반 durable execution으로 장기 실행 안정성을 확보하고, 슬래시 커맨드와 멘션 트리거로 다양한 자동화 시나리오를 지원합니다."
accomplishments:
  - "LangGraph durable execution과 PostgreSQL 체크포인트를 적용해, 에이전트가 사람 승인 대기나 서버 중단 후에도 상태를 보존하고 재개할 수 있는 구조를 구축했습니다."
  - "automation 라벨이 붙은 이슈를 triage → clarification → work → publish 4단계로 자동 해결하는 상태 머신 기반 파이프라인을 설계했습니다."
  - "@autobot 멘션 시 의도를 분류해 코드 리뷰, QA, 문서화 등 적합한 전문가 에이전트로 라우팅하는 멀티에이전트 시스템을 구현했습니다."
  - "웹훅 동시 처리를 Piscina 워커 풀로 병렬화하고, Langfuse(LLM 트레이싱) · Sentry · OpenTelemetry를 통합해 에이전트 동작 전반의 추적·디버깅 경로를 확보했습니다."
---
