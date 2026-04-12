---
companyId: "exem"
title: "인스턴스 통합 모니터링 대시보드 개발"
techStack: ["React", "TypeScript", "TanStack Table", "TanStack Query", "React Grid Layout", "Zustand", "Vite", "Playwright"]
dateStart: 2025-01-01
priority: 1
summary: "300대 인스턴스를 실시간 폴링하며 리사이즈·드래그가 동시에 발생하는 환경에서 렌더 총량 96.7%(150회→5회) 감소, INP 400ms대→100ms대 안정화를 달성했습니다. 카드형 2-depth 구조를 고밀도 그리드 1-depth 허브로 재설계해 한 화면 비교와 즉시 RTM/PA 이동 흐름을 확보했습니다."
accomplishments:
  - "`useFrozenData`로 폴링 중 데이터 스냅샷을 고정하고, `useDeferredValue`로 리사이즈 렌더를 저우선 처리하며, 핵심 셀에 memo를 적용해 폴링·리사이즈가 겹치는 구간의 렌더 총량을 150회에서 5회로 줄였습니다."
  - "`restart/start/stop` 인터페이스의 PollingManager로 화면별 타이머를 묶어 선언적으로 폴링 주기를 제어하도록 일원화했습니다."
  - "서로 영향을 주는 필터·조회 상태와 반복되던 저장/복원 로직을 중앙 저장소와 버전 기반 마이그레이션으로 정리해 수정 범위를 국소화했습니다."
  - "API 전면 교체 시점에 Vue 연장 대신 React와 사내 디자인 시스템 기반으로 재구축해 구조 부채 누적을 줄였습니다."
  - "Feature Flag 기반으로 대시보드 변경을 고객사별로 격리해 배포 영향 범위를 제어했습니다."
---
