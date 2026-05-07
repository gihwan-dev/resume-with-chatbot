---
companyId: "ai-automation"
title: "GitLab AI 자동화 플랫폼 구축"
techStack: ["LangGraph.js", "Deep Agents SDK", "Fastify", "Piscina", "PostgreSQL", "Langfuse", "Sentry", "OpenTelemetry", "Docker", "Kubernetes"]
dateStart: 2024-11-01
priority: 1
variants: ["ai-agent"]
summary: "팀 10명이 실제 업무에 사용 중인 GitLab AI 자동화 플랫폼입니다. 기존에는 로컬에서 AI를 쓰고 결과를 복붙하는 단절된 흐름이었다면, 이제 GitLab MR 커멘트에서 @autobot을 멘션하는 것만으로 코드 리뷰·QA·문서화를 처리하고 코드 수정까지 바로 적용할 수 있어 리뷰 사이클이 크게 단축됐습니다."
accomplishments:
  - "LangGraph durable execution과 PostgreSQL 체크포인트를 적용해, 에이전트가 사람 승인 대기나 서버 중단 후에도 상태를 보존하고 재개할 수 있는 구조를 구축했습니다."
  - "automation 라벨이 붙은 이슈를 triage → clarification → work → publish 4단계로 자동 해결하는 상태 머신 기반 파이프라인을 설계했습니다."
  - "@autobot 멘션 시 의도를 분류해 코드 리뷰, QA, 문서화 등 적합한 전문가 에이전트로 라우팅하는 멀티에이전트 시스템을 구현했습니다."
  - "MR 단위 공유 메모리와 discussion 단위 체크포인트를 분리해, 이전 처리 결과는 같은 MR 안에서 재사용하면서 승인·재개 신호는 원래 discussion에서만 처리되도록 만들었습니다."
  - "Work agent가 실행 계획의 target files와 진단 단계의 suspicious files를 벗어나 수정하지 않도록 Plan Adherence 미들웨어를 추가하고, 범위 밖 파일 편집과 위험한 shell command 차단을 테스트로 고정했습니다."
  - "웹훅 동시 처리를 Piscina 워커 풀로 병렬화하고, Langfuse(LLM 트레이싱) · Sentry · OpenTelemetry를 통합해 에이전트 동작 전반의 추적·디버깅 경로를 확보했습니다."
---
