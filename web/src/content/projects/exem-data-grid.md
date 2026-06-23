---
companyId: "exem"
title: "대규모 데이터 화면용 공용 데이터 그리드 개발"
techStack: ["React", "TanStack Table", "TanStack Virtual", "Vitest", "Storybook", "Turborepo", "Biome", "TailwindCSS"]
dateStart: 2025-07-01
priority: 2
summary: "팀 내 기여 1위(95건 이슈 처리)로 주도한 공용 데이터 그리드입니다. table 태그의 레이아웃 한계로 고정 컬럼·가상화·리사이즈 조합이 불가능해지자 div 기반 헤드리스 구조로 전면 재설계했고, descriptor 하나만 등록하면 기능이 확장되는 파이프라인으로 20+ 기능을 안정적으로 운영 중입니다."
accomplishments:
  - "통합 테스트로 기존 동작을 고정한 뒤 table 태그에서 div 기반 렌더링으로 마이그레이션했습니다. 셀 배치를 absolute에서 Row absolute + Cell flex 구조로 재설계해 열 조작과 레이아웃이 일치하도록 맞췄습니다."
  - "행 가상화, 이벤트 위임, `React.memo` 적용 후 10,000행 데모에서 폴링 갱신 CPU 피크 58%→28%, JS 힙 138MB→98MB 개선을 측정했습니다."
  - "행 가상화로 실제 DOM 마운트를 뷰포트 범위로 제한하고, React.memo에 값 기반 비교 함수를 적용해 스크롤 중 불필요한 리렌더를 억제했습니다."
  - "셀·행마다 개별 핸들러를 붙이는 대신 테이블 레벨 이벤트 위임을 적용해 핸들러 수와 상호작용 처리 비용을 낮췄습니다."
  - "검색·정렬·페이지네이션 옵션을 query 상태 모델로 정규화하는 기반을 만들고, 컬럼 가시성 변경·고정 컬럼 재마운트·행 DnD 모드 조합에서 상태가 어긋나지 않도록 단위 테스트와 브라우저 테스트로 회귀 조건을 고정했습니다."
  - "컬럼 편집 모달을 표시/숨김 transfer-list로 재구성하고, 검색·순서 이동·pin 고정·미저장 변경 확인 흐름을 분리했습니다. column edit 상태·적용·reorder 단위 테스트와 ColumnEditing Storybook 브라우저·VRT 테스트로 컬럼 편집 회귀를 고정했습니다."
  - "내장 TableFilter를 TanStack Table feature로 추가해 문자열·숫자 컬럼 조건, AND/OR 조합, 내부·외부 facet 값 추천, 필터 태그 UI를 지원하고, 상태 모델 단위 테스트와 Storybook 브라우저 테스트로 필터 추가·조합·추천값 회귀를 고정했습니다."
  - "Table.Toolbar/Content/Footer 컴파운드 API를 추가해 제목·검색·페이지네이션·컬럼 편집·내보내기·복사 위젯을 JSX 슬롯으로 조합하도록 열고, 기존 options 경로와 우선순위·검색 동기화·액션 트리거를 Compound Storybook 브라우저 테스트로 고정했습니다."
  - "medium/small Table Size 옵션을 SSoT 토큰으로 분리해 행·헤더·푸터 높이와 built-in 셀 포맷 밀도를 함께 동기화하고, Size 브라우저 테스트와 검색 필터 memo 경계 테스트로 디자인 밀도·검색 조합 회귀를 고정했습니다."
  - "CodeText 셀 포맷을 `copyText`·`href`·`onCopy`·`onNavigate` 액션 모델로 확장해 SQL·명령어 셀의 텍스트 복사와 상세 이동을 분리하고, CellFormats·RowClick 브라우저 테스트로 행 클릭과 셀 액션 충돌을 고정했습니다."
  - "셀 툴팁을 브라우저 `title` 속성에서 `@exem-ui/react` Tooltip 합성으로 전환해 hover 지연·최대 폭·긴 문자열 줄바꿈을 일관화하고, TooltipMaxLength 브라우저 테스트로 잘림/무제한 노출과 폭 제한 회귀를 고정했습니다."
  - "UI와 로직을 헤드리스 구조로 분리하고, 기능별 descriptor와 columnContract 컴파일 단계로 데이터·그룹·유틸리티 컬럼의 검색·필터·정렬·DnD 대상 여부를 표준화했습니다. Storybook 시나리오, 단위 테스트, 브라우저 통합 테스트로 컬럼 가시성·복사·Excel export·DnD 조합 회귀를 관리했습니다."
  - "PR마다 복잡도·코드 중복·함수 길이 등 7개 품질 지표를 CI에서 자동 검사해 리뷰 전 품질 기준선을 보장하는 게이트를 구축했습니다."
  - "TailwindCSS v4, Vite 8, Storybook 10.3 전환과 npm 스코프 마이그레이션을 병행했습니다. 이후 Atlaskit DnD 의존성을 제거하고 자체 Pointer Events 기반 DnD 엔진으로 열·행 재정렬 흐름을 통합했습니다."
---
