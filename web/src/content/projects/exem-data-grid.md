---
companyId: "exem"
title: "대규모 데이터 화면용 공용 데이터 그리드 개발"
techStack: ["React", "TanStack Table", "TanStack Virtual", "Vitest", "Storybook", "Turborepo", "Biome", "TailwindCSS"]
dateStart: 2025-07-01
priority: 2
summary: "table 태그의 레이아웃 한계를 넘기 위해 div + 가상화 렌더링으로 전환하고, UI와 로직을 헤드리스 구조로 분리해 DOM 노드 90% 감소, 리사이즈 처리 22ms→0.5ms 개선을 달성했습니다. 기능별 descriptor만 추가하면 테이블이 확장되는 파이프라인을 설계해 20+ 기능을 안정적으로 조합·운영하고 있습니다."
accomplishments:
  - "table 태그 기반 구조는 virtualization, 고정 컬럼, 그룹 헤더, 리사이즈 조합에서 레이아웃 제약이 커 통합 테스트로 기존 동작을 고정한 뒤 div 기반 렌더링으로 마이그레이션했습니다."
  - "셀 배치를 absolute에서 Row absolute + Cell flex 구조로 재설계해 열 조작과 레이아웃이 일치하도록 맞추고, DOM 노드 90% 감소와 리사이즈 처리 22ms→0.5ms 개선을 확인했습니다."
  - "행 가상화로 실제 DOM 마운트를 뷰포트 범위로 제한하고, React.memo에 값 기반 비교 함수를 적용해 스크롤 중 불필요한 리렌더를 억제했습니다."
  - "셀·행마다 개별 핸들러를 붙이는 대신 테이블 레벨 이벤트 위임을 적용해 핸들러 수와 상호작용 처리 비용을 낮췄습니다."
  - "Core - State - UI 계층 분리와 기능 호환표를 기준으로 Storybook 시나리오, 브라우저 통합 테스트, 회귀 타깃 문서를 함께 운영해 기능 조합 회귀를 관리했습니다."
  - "UI와 로직을 헤드리스 구조로 분리하고, 기능별 descriptor 하나만 등록하면 테이블에 새 기능이 붙는 파이프라인을 설계해 기능 추가 시 수정 범위를 최소화했습니다."
  - "TailwindCSS v4, Vite 8, Storybook 10.3, DnD 라이브러리(Atlaskit Pragmatic DnD) 전환을 무중단으로 완료하고, npm 스코프 마이그레이션을 병행했습니다."
  - "팀 내 기여 1위로 95건의 이슈를 처리하며, PR마다 복잡도·코드 중복·함수 길이 등 7개 품질 지표를 CI에서 자동 검사해 리뷰 전 품질 기준선을 보장하는 게이트를 구축했습니다."
---
