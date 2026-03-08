---
companyId: "exem"
title: "차세대 데이터베이스 성능 모니터링 제품 개발"
techStack: ["React", "TypeScript", "Zustand", "Vite", "TanStack Query"]
dateStart: 2025-01-01
priority: 3
summary: "차세대 DB 모니터링 제품에서 위젯 빌더, 상태 관리, 저장소 추상화, SQL 분석 UX를 확장 가능한 구조로 재설계했습니다. 5개 차트 타입의 설정·검증·미리보기를 어댑터/레지스트리 구조로 분리하고, 전역 스토어 20개를 Context API 기반 지역 스토어로 전환했으며, `persist` 저장 엔진 교체만으로 로컬 스토리지 기반 레이아웃 저장을 DB 영구 저장으로 하루 만에 마이그레이션했습니다."
accomplishments:
  - "`line/area/bar/scatter/table` 5개 차트 타입을 어댑터/레지스트리 구조로 묶고, 설정 폼·`zod` 검증 스키마·미리보기 컴포넌트를 타입별 모듈로 분리해 신규 위젯 추가 시 공통 빌더가 아니라 해당 타입만 확장하도록 재설계했습니다."
  - "불필요한 전역 Zustand 스토어 20개를 Context API 기반 지역 스토어로 전환하고 `storeFactory` 로 `Provider`, selector hook, store API, persist/global 옵션을 단일 규약으로 추상화해 초기화 리렌더 50% 감소, 전역 상태 사이드 이펙트 제거, 보일러플레이트 70% 감소를 이끌었습니다."
  - "`webEnv` 를 `StateStorage(getItem/setItem/removeItem)` 인터페이스로 추상화해 Zustand `persist` 미들웨어의 저장 엔진만 교체할 수 있게 만들었고, 기존 저장 로직을 유지한 채 로컬 스토리지 기반 대시보드 레이아웃 저장을 DB 영구 저장으로 하루 만에 마이그레이션했습니다."
  - "`One SQL Detail`, `Plan Change`, `SQL Scatter`, Monaco 기반 SQL 에디터 등 SQL 분석 핵심 화면을 구현해 실행 계획 비교, diff 시트, 바인드 변수 하이라이팅·값 치환, 드릴다운 같은 분석 UX를 제품 기능으로 연결했습니다."
---
