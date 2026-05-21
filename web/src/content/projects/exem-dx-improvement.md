---
companyId: "exem"
title: "프론트엔드 개발 생산성 및 진단 구조 개선"
techStack: ["ExtJS", "Sencha", "React", "TypeScript", "Vite", "Oracle", "WebSocket", "Node.js", "Playwright"]
dateStart: 2025-02-01
priority: 4
summary: "레거시 ExtJS 코드베이스와 차세대 제품 개발 흐름에서 수동 추적·환경 준비·페이지 제작 검증을 정리하고, 진단 도구와 하네스를 공용화해 초기 환경 셋업 3시간을 1분 이내로 단축했습니다."
accomplishments:
  - "`mfo_v5_starter`에 레포·서브모듈·환경 감지·`config.json` 생성·실행 절차를 중앙화해, 초기 셋업 3시간이 걸리던 레거시 개발 환경을 1분 이내에 시작 가능한 흐름으로 줄였습니다."
  - "팀 공용 브라우저 진단 도구를 구축해 `console.log` 없이 SQL 응답을 실시간으로 확인하고 컴포넌트를 IDE로 바로 추적할 수 있게 해, 레거시 ExtJS 이슈의 원인 추적 비용을 낮췄습니다."
  - "레거시 SQL 참조·실행 payload를 Oracle/PostgreSQL 기준으로 점검하는 `sql:report`와 `sql:lint-runtime` 흐름을 만들고, 오류·경고·DB 분기·소스 경로별로 필터링 가능한 브라우저 리포트 UI까지 연결했습니다."
  - "Mock DB 기반 E2E를 기능 영역별 스위트와 MR 전용 scenario/resolver 레이어로 재구성하고, 250개 MR 후보를 브라우저 경로·REST/WS ledger clean gate·리포트 아티팩트로 추적하는 회귀 하네스를 정비했습니다."
  - "Design Studio 템플릿에 page/i18n/screen-spec/policy 문서 스캐폴딩·검증, pageOnlyCommit 변경 범위 가드, iframe 미리보기·SNB 라우팅·App/Page 모드 전환을 연결해 기획자 자연어 요구를 페이지 단위 산출물로 검증하는 하네스를 구축했습니다."
  - "WebSocket 공통 모듈에 JSDoc과 사용 예시를 추가해 호출 규칙과 응답 해석 기준을 문서화하고, 화면별 추측에 의존하던 통신 로직 분석 부담을 줄였습니다."
  - "브라우저 기반 검증 중 발견된 RTM 프레임 초기화 순서, SQL Elapsed Time 필터 값 shape, 설정 화면의 빈 선택 상태 예외를 추적해 초기화 순서 보정과 입력 정규화로 레거시 ExtJS 런타임 오류를 줄였습니다."
---
