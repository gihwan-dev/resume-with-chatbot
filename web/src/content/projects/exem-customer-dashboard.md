---
companyId: "exem"
title: "인스턴스 통합 모니터링 대시보드 개발"
techStack: ["React", "TypeScript", "TanStack Table", "TanStack Query", "React Grid Layout", "Zustand", "Vite", "Playwright"]
dateStart: 2025-01-01
priority: 1
summary: "카드형 2-depth 흐름을 고밀도 그리드 기반 1-depth 허브로 재설계해 한 화면 비교와 즉시 RTM/PA 이동이 가능하도록 바꿨습니다. `useFrozenData`, `useDeferredValue`, memo 최적화로 폴링·리사이즈가 겹치는 구간의 렌더 총량을 150회에서 5회로 96.7% 줄이고, INP를 400ms대에서 100ms대로 안정화했습니다."
accomplishments:
  - "`restart/start/stop` 인터페이스의 PollingManager로 화면별 타이머를 묶어 선언적으로 폴링 주기를 제어하도록 일원화했습니다."
  - "서로 영향을 주는 필터·조회 상태와 반복되던 저장/복원 로직을 중앙 저장소와 버전 기반 마이그레이션으로 정리해 수정 범위를 국소화했습니다."
  - "API 전면 교체 시점에 Vue 연장 대신 React와 사내 디자인 시스템 기반으로 재구축해 구조 부채 누적을 줄였습니다."
  - "카드형 2-depth 구조를 고밀도 그리드 1-depth 허브로 바꿔 한 화면 비교와 즉시 RTM/PA 이동 흐름을 확보했습니다."
  - "`useFrozenData` 기반 데이터 스냅샷 유지, `useDeferredValue` 저우선 렌더, memo 최적화로 렌더 총량을 96.7% 줄이고 INP를 안정화했습니다."
---
