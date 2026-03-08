---
companyId: "ai-automation"
title: "RAG 기반 내부 문서 챗봇 개발"
techStack: ["FastAPI", "Elasticsearch", "OpenAI Embeddings", "n8n", "MCP"]
dateStart: 2024-11-01
priority: 2
variants: ["ai-agent"]
summary: "사내 위키 문서를 대상으로 Git 동기화 기반 인덱싱과 RAG 질의 파이프라인을 구성해 내부 문서 탐색 자동화를 구현했습니다."
accomplishments:
  - "Git 동기화 -> Markdown 파싱 -> 임베딩 생성 -> 벡터 인덱싱 배치를 구성해 150개 문서를 주기적으로 반영했습니다."
  - "Top-K 10 기반 검색 경로를 운영해 벡터 검색 응답을 100ms 이하로 유지했습니다."
  - "세션 문맥 25개 메시지를 유지하고, 한국어/영어/일본어 3개 언어 질의를 지원하도록 API를 설계했습니다."
  - "ClickUp 문서 오전 자동 동기화와 주간 리포트 자동 발행을 추가해 운영 편의성을 높였습니다."
---
