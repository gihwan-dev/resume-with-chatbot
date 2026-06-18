---
companyId: "exem"
title: "인스턴스 통합 모니터링 대시보드 개발"
techStack: ["React", "TypeScript", "TanStack Table", "TanStack Query", "React Grid Layout", "Zustand", "Vite", "Playwright"]
dateStart: 2025-01-01
priority: 1
summary: "300대 인스턴스를 실시간 폴링하는 대시보드에서 드래그 30틱 기준 위젯 누적 리렌더를 150회에서 5회로 줄였습니다. 카드형 다중 뷰 흐름을 고밀도 그리드 허브로 재구성해 한 화면 비교와 즉시 RTM/PA 이동 흐름을 확보했습니다."
accomplishments:
  - "`useBufferedSnapshot`으로 인터랙션 중 라이브 스냅샷을 고정하고, `useFrozenLayout`과 `startTransition`으로 레이아웃·갱신 우선순위를 분리해 드래그 30틱 기준 위젯 누적 리렌더를 150회에서 5회로 줄였습니다."
  - "`restart/start/stop` 인터페이스의 PollingManager로 화면별 타이머를 묶어 선언적으로 폴링 주기를 제어하도록 일원화했습니다."
  - "서로 영향을 주는 필터·조회 상태와 반복되던 저장/복원 로직을 중앙 저장소와 버전 기반 마이그레이션으로 정리해 수정 범위를 국소화했습니다."
  - "API 전면 교체 시점에 Vue 연장 대신 React와 사내 디자인 시스템 기반으로 재구축해 구조 부채 누적을 줄였습니다."
  - "위젯 빌더를 line/area/bar/stackedBar/lineBar/scatter/pie/scoreboard/table/text/image 11개 시각화 플러그인과 공통 step/schema 흐름으로 재구성해 대상 인스턴스 선택, 메트릭 입력, 시각화 전환의 확장 지점을 코드화했습니다."
  - "SQL·Object·Session 상세 화면을 `PageLayout` detail 타입과 `DetailShell` 헤더 흐름으로 재구성해 앵커 탭, 접힘 사이드바, 상세 식별자 표시를 공통 레이아웃 계약으로 묶었습니다."
  - "Feature Flag 기반으로 대시보드 변경을 고객사별로 격리해 배포 영향 범위를 제어했습니다."
---
