---
companyId: "ai-automation"
title: "Ontology 기반 Code Intelligence Agent 구축"
techStack: ["Python", "FastAPI", "PostgreSQL", "pgvector", "React", "Vite", "GraphRAG", "GitLab API", "ClickUp API", "WeasyPrint"]
dateStart: 2026-04-01
priority: 2
variants: ["ai-agent"]
summary: "코드, Git 이력, 이슈, 문서 데이터를 온톨로지와 GraphRAG 파이프라인으로 연결해 개발자가 변경 이유와 근거를 추적할 수 있는 Code Intelligence Agent를 구축했습니다. 벡터 검색만으로는 놓치기 쉬운 literal token 질의와 관계형 근거를 SQL·lexical·semantic 채널로 나누고, trace 화면에서 점수·rerank·source 경로와 GraphRAG 인용·그래프를 확인할 수 있게 했습니다."
accomplishments:
  - "이슈·MR·배포·문서 근거를 SQL rollup으로 집계하는 broad-list 질의 경로를 추가하고, dispatch·manifest·federated search 테스트로 라우팅 계약을 검증했습니다."
  - "검색 응답 row별 score와 rerank/diversify keep·drop reason을 trace에 기록해, 검색 품질 문제를 결과 테이블에서 판단 근거까지 따라갈 수 있도록 만들었습니다."
  - "trace에서 발견한 품질 이슈를 재현 케이스로 승격하는 API와 UI를 추가해, 일회성 디버깅을 회귀 테스트 후보로 전환할 수 있는 흐름을 마련했습니다."
  - "TaskAnalyzer 채팅에서 GraphRAG 응답(answer·citations·graph·trace_events·tool_calls)을 SSE 이벤트로 정규화하고, 근거가 있는 답변은 별도 LLM 재작성 없이 인용·그래프·도구 실행 상태와 함께 렌더링하도록 테스트로 고정했습니다."
---
