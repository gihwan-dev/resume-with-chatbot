---
companyId: "exem"
title: "레거시 프론트엔드 안정화 및 진단 구조 개선"
techStack: ["ExtJS", "Sencha", "TypeScript", "Oracle", "WebSocket", "Node.js"]
dateStart: 2025-02-01
priority: 4
summary: "레거시 ExtJS FE에서 암묵적 통신 규칙과 수동 추적 흐름을 정리하고, 브라우저 진단 도구와 스타터킷을 공용화해 원인 추적·환경 진입 비용을 낮췄습니다."
accomplishments:
  - "팀 공용 브라우저 진단 도구를 구축해 `console.log` 없이 SQL 응답을 실시간으로 확인하고 컴포넌트를 IDE로 바로 추적할 수 있게 해, 레거시 ExtJS 이슈의 원인 추적 진입 비용을 낮췄습니다."
  - "전역 `WS`·`IMXWS` 공통 모듈에 JSDoc과 사용 예시 링크를 추가해 호출 규칙과 응답 해석 기준을 문서화하면서, 화면별 추측에 의존하던 통신 로직 분석 비용을 줄였습니다."
  - "ExtJS 이벤트 콜백에서 `function` 문맥으로 `this`가 깨지던 지점을 추적해 arrow function으로 고정하고, 인스턴스 트리 선택 시 RTS 상태 검증이 잘못되던 문제를 바로잡았습니다."
  - "`mfo_v5_starter`에 레포·서브모듈·환경 감지·`config.json` 생성·실행 절차를 중앙화해, 수 시간 걸리던 레거시 환경 셋업을 몇 분 내 시작 가능한 흐름으로 줄였습니다."
---
