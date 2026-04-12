---
companyId: "exem"
title: "차세대 데이터베이스 성능 모니터링 제품 개발"
techStack: ["React", "TypeScript", "Zustand", "Vite", "TanStack Query", "ECharts", "TanStack Router", "Storybook", "MSW", "Playwright", "Biome"]
dateStart: 2025-01-01
priority: 3
summary: "차세대 DB 모니터링 제품에서 위젯 빌더, 상태 관리, 저장소 추상화, SQL 분석 UX를 담당했습니다. 전역 스토어 20개를 지역 스토어로 전환해 초기화 리렌더 50% 감소·보일러플레이트 70% 감소를 달성하고, 저장 엔진 추상화로 레이아웃 저장 방식을 DB 영구 저장으로 하루 만에 마이그레이션했습니다."
accomplishments:
  - "전역 Zustand 스토어 20개를 Context API 기반 지역 스토어로 전환하고, 스토어 생성을 팩토리 함수로 추상화했습니다. 초기화 리렌더 50% 감소, 전역 상태 사이드 이펙트 제거, 보일러플레이트 70% 감소 효과를 이끌었습니다."
  - "Zustand persist 미들웨어의 저장 엔진을 인터페이스로 추상화해, 기존 로직을 유지한 채 로컬 스토리지 기반 레이아웃 저장을 DB 영구 저장으로 하루 만에 마이그레이션했습니다."
  - "line·area·bar·scatter·table 5개 차트 타입을 어댑터/레지스트리 구조로 묶어, 신규 위젯 추가 시 공통 빌더를 건드리지 않고 해당 타입 모듈만 확장하도록 재설계했습니다."
  - "`One SQL Detail`, `Plan Change`, `SQL Scatter`, Monaco 기반 SQL 에디터 등 SQL 분석 핵심 화면을 구현해 실행 계획 비교, diff 시트, 바인드 변수 하이라이팅·값 치환, 드릴다운 같은 분석 UX를 제품 기능으로 연결했습니다."
  - "SQL Detail·Text/Plan/Bind·Object Detail·Search SQL·Parallel Session 등 SQL Analysis 전체 화면군을 레거시에서 차세대 FSD 구조로 전담 마이그레이션했습니다."
  - "보안 취약점 자동 분석(Secret Detection), 테스트 커버리지 리포트, MR별 Storybook 프리뷰 환경을 포함한 GitLab CI/CD 파이프라인을 구축했습니다."
  - "MSW 기반 API 모킹 환경을 도입해 백엔드 의존 없는 개발 테스트 흐름을 체계화하고, Sentry 에러 모니터링을 통합했습니다."
---
