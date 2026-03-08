---
companyId: "exem"
title: "레거시 프론트엔드 안정화 및 진단 구조 개선"
techStack: ["ExtJS", "Sencha", "TypeScript", "Oracle", "WebSocket", "Node.js"]
dateStart: 2025-02-01
priority: 4
summary: "레거시 FE의 진단 가능성 부족 문제를 암묵 규칙 명시화와 진단 도구 공용화로 정리해 원인 추적 진입 비용을 낮췄습니다."
accomplishments:
  - "전역 `WS`·`IMXWS` 통신 규칙과 Oracle bind 치환 규칙을 JSDoc/공용 헬퍼로 명시화해 추측 기반 수정이 반복되던 구조를 줄였습니다."
  - "ExtJS 이벤트 콜백의 `this` 문맥 유실 지점을 추적해 arrow function으로 고정하면서 상태 판별 오동작 범위를 줄였습니다."
  - "팀 공용 Sencha 진단 도구를 구축해 `console.log` 삽입 없이 SQL 응답 확인과 컴포넌트 추적이 가능하도록 바꿨습니다."
  - "레포·리소스·실행 절차를 스타터킷으로 중앙화해 수 시간 걸리던 환경 진입 부담을 완화했습니다."
---
