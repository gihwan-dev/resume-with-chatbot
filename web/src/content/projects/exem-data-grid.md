---
companyId: "exem"
title: "대규모 데이터 화면용 공용 데이터 그리드 개발"
techStack: ["React", "TanStack Table", "TanStack Virtual", "Vitest"]
dateStart: 2025-07-01
priority: 2
summary: "공용 그리드에서 table 태그 기반 구조의 한계를 넘기 위해 div + virtualization 렌더링으로 전환하고, 테이블 레벨 이벤트 위임과 `React.memo`의 값 기반 comparator(`areTableRowPropsEqual`)로 불필요한 리렌더를 줄였습니다. 그 결과 DOM 노드 90% 감소와 리사이즈 처리 22ms→0.5ms 개선을 확인했습니다."
accomplishments:
  - "table 태그 기반 구조는 virtualization, 고정 컬럼, 그룹 헤더, 리사이즈 조합에서 레이아웃 제약이 커 통합 테스트로 기존 동작을 고정한 뒤 div 기반 렌더링으로 마이그레이션했습니다."
  - "Cell absolute 1차 구조에서 Row absolute + Cell flex 2차 구조로 재설계해 열 조작 동작과 레이아웃 제약을 일치시켰고, DOM 노드 90% 감소와 리사이즈 처리 22ms→0.5ms 개선을 확인했습니다."
  - "행 가상화(`virtualization`)로 DOM 마운트 범위를 뷰포트 중심으로 제한하고, `React.memo` + `areTableRowPropsEqual` 비교 함수로 `VirtualItem`을 참조가 아닌 `index/start/size` 값으로 비교해 불필요한 리렌더를 줄였습니다."
  - "`columnSizing`은 안정적으로 전달하고 셀·행 개별 상호작용 대신 테이블 레벨 이벤트 위임을 적용해 핸들러 수와 상호작용 처리 비용을 낮췄습니다."
  - "Core - State - UI 계층 분리와 기능 호환표를 기준으로 Storybook 시나리오, 브라우저 통합 테스트, 회귀 타깃 문서를 함께 운영해 기능 조합 회귀를 관리했습니다."
---
