---
companyId: "exem"
title: "프론트엔드 개발 생산성 및 진단 구조 개선"
techStack: ["ExtJS", "Sencha", "React", "TypeScript", "Vite", "Oracle", "Docker", "WebSocket", "Node.js", "Playwright"]
dateStart: 2025-02-01
priority: 4
summary: "레거시 ExtJS 코드베이스와 차세대 제품 개발 흐름에서 수동 추적·환경 준비·페이지 제작 검증을 정리하고, 로컬 풀스택 실행 흐름과 페이지 검증 하네스를 공용화해 반복 확인 지점을 코드와 테스트로 고정했습니다."
accomplishments:
  - "`mfo_v5_starter`에 레포·서브모듈·환경 감지·`config.json` 생성·실행 절차를 중앙화하고, PJS/RTS/Colima/Jetty 호환성 이슈를 코드로 고정해 레거시 개발 환경을 `pnpm run dev` 중심의 재현 가능한 로컬 풀스택 흐름으로 정리했습니다."
  - "Chrome DevTools 기반 Sencha/ExtJS 진단 확장의 MV3 스캐폴드와 frame/runtime probe, panel shell까지 구현하고, 실제 SQL monitor·IDE 연계는 후속 범위로 분리했습니다."
  - "레거시 SQL 참조·실행 payload를 Oracle/PostgreSQL 기준으로 점검하는 `sql:report`와 `sql:lint-runtime` 흐름을 만들고, 오류·경고·DB 분기·소스 경로별로 필터링 가능한 브라우저 리포트 UI까지 연결했습니다."
  - "Mock DB 기반 E2E를 기능 영역별 스위트와 MR 전용 scenario/resolver 레이어로 재구성하고, 250개 MR 후보를 브라우저 경로·REST/WS ledger clean gate·리포트 아티팩트로 추적하는 회귀 하네스를 정비했습니다."
  - "`@exem/design-studio` 코어 패키지와 Design Studio 템플릿에 멀티 프로젝트 워크스페이스, page/i18n/screen-spec/policy 문서 스캐폴딩·검증, pageOnlyCommit 가드, iframe 미리보기·SNB 라우팅을 묶어 실제 프로젝트에서 dependency로 재사용 가능한 페이지 단위 검증 하네스로 공용화했습니다."
  - "Vitest Browser와 Playwright 기반 통합 테스트로 preview shell bridge, same-origin iframe navigation, page 파라미터 정규화, 디자인 인스펙터 속성 탐색·드래그/리사이즈 핸들, 디자이너 노트 handoff와 JSX source-line 매핑을 고정해 Design Studio 미리보기·핸드오프 회귀를 코드 레벨에서 추적했습니다."
  - "WebSocket 공통 모듈에 JSDoc과 사용 예시를 추가해 호출 규칙과 응답 해석 기준을 문서화하고, 화면별 추측에 의존하던 통신 로직 분석 부담을 줄였습니다."
  - "브라우저 기반 검증 중 발견된 RTM 프레임 초기화 순서, SQL Elapsed Time 필터 값 shape, 설정 화면의 빈 선택 상태 예외를 추적해 초기화 순서 보정과 입력 정규화로 레거시 ExtJS 런타임 오류를 줄였습니다."
---
