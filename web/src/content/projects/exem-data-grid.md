---
companyId: "exem"
title: "대규모 데이터 화면용 공용 데이터 그리드 개발"
techStack: ["React", "TanStack Table", "TanStack Virtual", "Vitest", "Storybook", "Turborepo", "Biome", "TailwindCSS"]
dateStart: 2025-07-01
priority: 2
summary: "팀 내 기여 1위(95건 이슈 처리)로 주도한 공용 데이터 그리드입니다. table 태그의 레이아웃 한계로 고정 컬럼·가상화·리사이즈 조합이 불가능해지자 div 기반 헤드리스 구조로 전면 재설계했고, descriptor 하나만 등록하면 기능이 확장되는 파이프라인으로 20+ 기능을 안정적으로 운영 중입니다."
accomplishments:
  - "통합 테스트로 기존 동작을 고정한 뒤 table 태그에서 div 기반 렌더링으로 마이그레이션했습니다. 셀 배치를 absolute에서 Row absolute + Cell flex 구조로 재설계해 열 조작과 레이아웃이 일치하도록 맞췄습니다."
  - "재설계로 DOM 노드 90% 감소, 리사이즈 처리 22ms→0.5ms를 달성했습니다."
  - "행 가상화로 실제 DOM 마운트를 뷰포트 범위로 제한하고, React.memo에 값 기반 비교 함수를 적용해 스크롤 중 불필요한 리렌더를 억제했습니다."
  - "셀·행마다 개별 핸들러를 붙이는 대신 테이블 레벨 이벤트 위임을 적용해 핸들러 수와 상호작용 처리 비용을 낮췄습니다."
  - "UI와 로직을 헤드리스 구조로 분리하고, 기능별 descriptor 하나만 등록하면 테이블에 새 기능이 붙는 파이프라인을 설계했습니다. Core - State - UI 계층 분리와 기능 호환표 기준으로 Storybook 시나리오, 브라우저 통합 테스트, 회귀 타깃 문서를 함께 운영해 기능 조합 회귀를 관리했습니다."
  - "PR마다 복잡도·코드 중복·함수 길이 등 7개 품질 지표를 CI에서 자동 검사해 리뷰 전 품질 기준선을 보장하는 게이트를 구축했습니다."
  - "TailwindCSS v4, Vite 8, Storybook 10.3 전환과 npm 스코프 마이그레이션을 병행했습니다. 이후 Atlaskit DnD 의존성을 제거하고 자체 Pointer Events 기반 DnD 엔진으로 열·행 재정렬 흐름을 통합했습니다."
---
