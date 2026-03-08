> 원문: https://codewiki.google/github.com/tanstack/table
## 테이블 코어 아키텍처
- 코어가 있고 어댑터가 있음. 어댑터는 코어에서 관리되는 UI를 그리는데 필요한 테이블 데이터를 다양한 프레임 워크의 "상태"와 연결 시켜줌
- 커스터 마이징 가능한 데이터그리드를 구축하기 위한 프레임워크 독립적인 핵심 기능을 제공함. 이 기능은 `packages/table-core` 디렉토리에 존재함. 프레임워크와 관계 없이 모든 테이블 작업을 뒷받침하는 기분 구조와 메커니즘을 정의함
- 5가지 핵심 객체를 중심으로 아키텍처가 구성됨
	- Table, Column, Row, Cell, Header
- `packages/table-core/src/core/table.ts` 에 있는 `createTable` 함수는 `Table` 인스턴스를 생성하는 공장 역할을 함
- Table 인스턴스는 중앙 허브로 동작하며 전체적인 테이블 상태를 관리하며 구성 요소들에 대한 접근을 제공함. 또한 내장 기능과 확장 기능을 통합함
- Column 객체는 createColumn을 통해 인스턴스화 되며, 속성, 데이터 접근 함수, 계층적 관계를 처리함.
- Row는 `packages/table-core/src/core/row.ts`의 `createRow`에 의해 관리되며, 행별 데이터와 하위 행 계층 구조를 설정함.
- createCell로 Cell을 생성. 개별 데이터 포인트가 Cell 객체에 캡슐화되어, 값 검색 및 렌더링 컨텍스트를 위한 메서드를 제공함
- Header 객체와 헤더 그룹은 createHeader와 buildHeaderGroups 알고리즘에 의해 관리됨
- TableFeature 라는 모듈식 객체를 통해 다양한 기능(정렬, 필터링, 그룹화, 페이지네이션)이 구현 되어있음
- 이 기능들은 `packages/table-core/src/features`에 정의되어 있으며, Table, Column, Row, Cell 객체에 연결되어 그 기능이 확장됨
- 필터링, 정렬, 페이진네이션 등등의 연산은 "row models"라 불리는 다양한 getter 메서드로 처리됨. 예를 들어 `getCoreRowModel`, `getFilteredRowModel`, `getSortedRowModel` 등이 있음. `packages/table-core/src/utils` 에서 확인할 수 있음
- 집계, 필터링, 정렬을 위한 사전 정의된 함수 모음을 포함
	- `sum`과 `min` 같은 `aggregationFns`는 `packages/table-core/src/aggregationFns.ts`에서 사용할 수 있고, `includesString`과 같은 `filterFns`는 `packages/table-core/src/filterFns.ts`에, 그리고 `alphanumeric`과 같은 `sortingFns`는 `packages/table-core/src/sortingFns.ts`에 있음
- 개발자 경험을 향상시키고 타입 안정성을 보장하기 위해, `packages/table-core/src/columnHelper.ts`에 위치한 `createColumnHelper` 유틸리티는 컬럼 구성을 정의하기 위한 강력한 API를 제공

### 테이블 코어 객체와 계층 구조
![[Pasted image 20251119075803.png]]

- Table, Column, Row, Cell, Header 의 코어 객체들로 테이블이 만들어짐. 각 객체는 테이블 데이터를 그리는데 필요한 데이터 및 연산을 수행할 수 있음
- `Table`
	- `createTable` 함수로 생성됨
	- 중앙 오케스트레이터 역할을 함
	- 다양한 옵션 설정과 모듈식 기능 시스템, 외부 기능(정렬, 필터링)을 통합함
	- 행과 열들이 어떻게 식별되고 구조화 되는지를 정의하기도 함
- `Column`
	- `createColumn` 함수로 생성됨
	- `Row`에서 데이터를 추출하기 위한 `id`, `accessorFn` 함수를 가짐
	- `depth`, `parent`를 통해 계층적 구조를 관리함
	- 칼럼은 그룹화 될 수 있고, 중첩 구조를 가질 수 있음. 그리고 `Table`은 이러한 중첩 구조를 순회할 수 있는 메서드와, 리프만 있는 플랫한 칼럼 리스트를 반환하는 메서드를 가지고 있음
- `Row`
	- `createRow` 함수로 생성됨
	- 각 `Row`는 `original`  이라 불리는 원본 데이터를 가지고 있음
	- `getValue`를 통해서 특정 칼럼의 데이터를 가져올 수 있음
	- `subRows`를 통해 계층적 구조를 가질 수 있음
	- 내부적으로 최적화를 우해 메모이제이션을 사용함
- `Cell`
	- 테이블의 각 데이터 포인트는 `Cell` 객체로 표현됨
	- `createCell` 함수로 생성됨
	- `Row`와 `Column`  객체에 대한 참조를 가지고 있음
	- `getValue`로 값을 얻거나 `getContext` 함수로 연관된 `table`, `column`, `row` 정보가 담긴 객체를 얻을 수 있음