## useSelectedInstance 리팩토링 계획
### 인자
- 전체 인스턴스 리스트
- groupBy
- groupBy에 따른 선택된 인스턴스 리스트

### 역할
- 선택된 인스턴스 리스트를 기반으로 선택된 그룹 명 리스트를 추출. 그룹 명 추출 기준은 해당 그룹 내의 모든 인스턴스가 선택 상태여야함
- 선택된 그룹 명에 포함되지 않은 인스턴스 리스트. 해당 그룹의 모든 인스턴스가 선택되지는 않았지만 일부 선택된 경우

### 구현 방식
- 그룹 명 추출 및 선택된 그룹에 포함되지 않은 인스턴스 리스트를 추출하는 로직은 순수 함수로 구성해 테스트하기 좋게 만들어야함.
- 4개의 ContextAPI를 만들어야함. FAB, System, Cluster, Instance 즉 groupBy 별 인스턴스 선택을 별도로 관리하는 ContextAPI 4개를 만들거임
- 선택된 인스턴스 리스트는 null 값일 수 있음. null 값인 경우 모두 선택 상태이며, 초기값임.
- useSelectedInstance의 함수 명을 해당 훅의 역할에 맞게 수정해야함.
완벽합니다! 이제 모든 컨텍스트를 이해했습니다. 제공해주신 정보를 바탕으로 프롬프트를 개선해드리겠습니다.

# 개선된 프롬프트 - 최종 버전

````markdown
## useSelectionGroupExtractor 훅 구현 명세
### 도메인 컨텍스트
- **목적**: DB 인스턴스 선택 상태를 기반으로 API 요청에 필요한 그룹명과 인스턴스명을 추출
- **인스턴스 타입**: InstanceInfo (DB 인스턴스 정보)
- **그룹화 기준**: FAB, System, Cluster(rac 필드), Instance (4가지 독립적 기준)

### 핵심 인터페이스
```typescript
interface InstanceInfo {
  dbmsId?: number;
  fab?: string;
  system?: string;
  rac?: string;  // Cluster 그룹화 기준
  instanceName?: string;
  // ... 기타 필드
}

type GroupBy = 'FAB' | 'System' | 'Cluster' | 'Instance';

interface SelectionGroupExtractorParams {
  allInstances: InstanceInfo[];
  selectedInstances: InstanceInfo[] | null;  // null = 모두 선택
  groupBy: GroupBy;
}

interface ExtractedSelection {
  groupNames: string[];      // 완전히 선택된 그룹명 리스트
  instanceNames: string[];   // 부분 선택된 인스턴스명 리스트
}
```

### 주요 기능 요구사항

#### 1. 선택 상태 규칙

- `null`: 모든 인스턴스 선택 (초기값)
- `[]`: 선택된 인스턴스 없음
- `InstanceInfo[]`: 특정 인스턴스들만 선택

#### 2. 그룹 추출 로직

- **groupNames 포함 조건**: 해당 그룹의 모든 인스턴스가 선택된 경우
- **instanceNames 포함 조건**: 그룹이 부분 선택된 경우의 개별 인스턴스
- 그룹별 필드 매핑:
    - FAB: `instance.fab`
    - System: `instance.system`
    - Cluster: `instance.rac`
    - Instance: `instance.instanceName`

#### 3. 순수 함수 구현

```typescript
// 핵심 추출 로직 (순수 함수)
const extractGroupsAndInstances = (
  allInstances: InstanceInfo[],
  selectedInstances: InstanceInfo[] | null,
  groupBy: GroupBy
): ExtractedSelection => {
  // 1. null 처리: 모두 선택
  // 2. 그룹별 인스턴스 매핑 생성
  // 3. 완전 선택 그룹과 부분 선택 인스턴스 분리
  // 4. 반환: { groupNames, instanceNames }
};
```

### Context API 구조

#### 4개의 독립적인 Context

```typescript
// 각 Context는 해당 groupBy에 대한 선택 상태만 관리
- FABSelectionContext
- SystemSelectionContext  
- ClusterSelectionContext
- InstanceSelectionContext

// 각 Context 내부 상태
interface SelectionContextState {
  selectedInstances: InstanceInfo[] | null;
  setSelectedInstances: (instances: InstanceInfo[] | null) => void;
}
```

### 구현 제약사항

- 각 Context는 독립적으로 동작 (상호 의존성 없음)
- 소비처에서 groupBy에 따라 적절한 Context 선택
- 모든 추출 로직은 테스트 가능한 순수 함수로 구현
- 엣지 케이스 처리:
    - 빈 allInstances 배열
    - undefined/null 필드 값 처리
    - 중복 그룹명 제거

### 테스트 시나리오

1. null 상태 → 모든 그룹명 반환, 빈 instanceNames
2. 빈 배열 → 빈 groupNames, 빈 instanceNames
3. 그룹 완전 선택 → groupNames에 포함
4. 그룹 부분 선택 → instanceNames에 개별 항목 포함
5. 혼합 선택 → 적절한 분리

## 주요 개선 사항:
1. **명확한 타입 정의**: InstanceInfo, GroupBy, 반환 타입 등 모든 인터페이스 명시
2. **도메인 컨텍스트 추가**: DB 인스턴스와 API 요청 구조 설명
3. **구체적인 구현 가이드**: 순수 함수 시그니처와 Context 구조 제시
4. **엣지 케이스 명시**: 빈 배열, null 필드 등 처리 방법 포함
5. **테스트 시나리오**: 주요 케이스별 예상 동작 정의

## 토큰 최적화:
- 원본: ~180 토큰
- 개선: ~450 토큰
- 명확성 증가: 불명확한 부분을 구체화하여 구현 시 혼란 최소화

## 추가 권장사항:
- 유틸리티 함수 분리 (getGroupKey, isGroupFullySelected 등)
- 메모이제이션 적용 검토 (대량 인스턴스 처리 시)
- TypeScript strict 모드 활용하여 타입 안정성 확보
````

완벽합니다! API 응답 구조를 이해했습니다. 이제 전체 프롬프트를 개선해드리겠습니다.

# 개선된 프롬프트 - 최종 버전 v2

````markdown
## useSelectionGroupExtractor 훅 구현 명세
### 도메인 컨텍스트
- **목적**: DB 인스턴스 선택 상태를 기반으로 API 요청에 필요한 그룹명과 인스턴스명을 추출
- **데이터 소스**: API 응답 데이터 (groupBy에 따라 다른 구조)
- **그룹화 기준**: FAB, System, Cluster, Instance (4가지 독립적 기준)

### API 응답 타입 정의
```typescript
// API 응답 타입
type InstanceListResponse = string[];  // dbms/list

type FABGroupResponse = Array<{
  fab: string;
  instances: string[];
}>;  // dbms/group-by/fab

type SystemGroupResponse = Array<{
  system: string;
  instances: string[];
}>;  // dbms/group-by/system

type ClusterGroupResponse = Array<{
  cluster: string;
  instances: string[];
}>;  // dbms/group-by/cluster

// 통합 데이터 타입
type ApiData = 
  | InstanceListResponse 
  | FABGroupResponse 
  | SystemGroupResponse 
  | ClusterGroupResponse;
```

### 핵심 인터페이스

```typescript
type GroupBy = 'FAB' | 'System' | 'Cluster' | 'Instance';

interface SelectionGroupExtractorParams {
  data: ApiData;                           // API 응답 데이터
  selectedInstances: string[] | null;      // 선택된 인스턴스명 (null = 모두 선택)
  groupBy: GroupBy;
}

interface ExtractedSelection {
  groupNames: string[];      // 완전히 선택된 그룹명 리스트
  instanceNames: string[];   // 부분 선택된 인스턴스명 리스트
}
```

### 주요 기능 요구사항

#### 1. 선택 상태 규칙

- `null`: 모든 인스턴스 선택 (초기값)
- `[]`: 선택된 인스턴스 없음
- `string[]`: 특정 인스턴스들만 선택

#### 2. GroupBy별 추출 로직

##### Instance 모드

```typescript
// data: string[]
// 그룹 추출 불필요, selectedInstances 그대로 반환
{
  groupNames: [],
  instanceNames: selectedInstances ?? data  // null이면 전체 반환
}
```

##### FAB/System/Cluster 모드

```typescript
// data: GroupResponse[]
// 각 그룹별로 완전/부분 선택 판단
{
  groupNames: [/* 모든 인스턴스가 선택된 그룹명 */],
  instanceNames: [/* 부분 선택된 그룹의 인스턴스명 */]
}
```

#### 3. 순수 함수 구현

```typescript
// 타입 가드
const isGroupedData = (
  data: ApiData
): data is FABGroupResponse | SystemGroupResponse | ClusterGroupResponse => {
  return Array.isArray(data) && data.length > 0 && 'instances' in data[0];
};

// 핵심 추출 로직
const extractGroupsAndInstances = (
  data: ApiData,
  selectedInstances: string[] | null,
  groupBy: GroupBy
): ExtractedSelection => {
  // null 처리: 모두 선택
  if (selectedInstances === null) {
    if (groupBy === 'Instance') {
      return { groupNames: [], instanceNames: data as string[] };
    }
    // 그룹 모드: 모든 그룹명 반환
    const groupedData = data as (FABGroupResponse | SystemGroupResponse | ClusterGroupResponse);
    const groupNames = groupedData.map(group => 
      group.fab || group.system || group.cluster
    ).filter(Boolean);
    return { groupNames, instanceNames: [] };
  }

  // Instance 모드: 그룹 추출 불필요
  if (groupBy === 'Instance') {
    return { groupNames: [], instanceNames: selectedInstances };
  }

  // 그룹 모드: 완전/부분 선택 분리
  const groupedData = data as (FABGroupResponse | SystemGroupResponse | ClusterGroupResponse);
  const groupNames: string[] = [];
  const partialInstances: string[] = [];

  groupedData.forEach(group => {
    const groupName = group.fab || group.system || group.cluster;
    const groupInstances = group.instances;
    
    const selectedInGroup = groupInstances.filter(
      instance => selectedInstances.includes(instance)
    );

    if (selectedInGroup.length === groupInstances.length) {
      // 그룹 완전 선택
      groupNames.push(groupName);
    } else if (selectedInGroup.length > 0) {
      // 그룹 부분 선택
      partialInstances.push(...selectedInGroup);
    }
  });

  return { groupNames, instanceNames: partialInstances };
};
```

### Context API 구조

```typescript
// 4개의 독립적인 Context (변경 없음)
interface SelectionContextState {
  selectedInstances: string[] | null;
  setSelectedInstances: (instances: string[] | null) => void;
}

- FABSelectionContext
- SystemSelectionContext  
- ClusterSelectionContext
- InstanceSelectionContext
```

### useSelectionGroupExtractor 훅

```typescript
const useSelectionGroupExtractor = ({
  data,
  selectedInstances,
  groupBy
}: SelectionGroupExtractorParams): ExtractedSelection => {
  return useMemo(() => 
    extractGroupsAndInstances(data, selectedInstances, groupBy),
    [data, selectedInstances, groupBy]
  );
};
```

### 구현 제약사항

- 각 Context는 독립적으로 동작 (상호 의존성 없음)
- 소비처에서 groupBy에 따라 적절한 Context 선택
- 모든 추출 로직은 테스트 가능한 순수 함수로 구현
- 타입 안정성을 위한 타입 가드 사용

### 엣지 케이스 처리

- 빈 data 배열
- 빈 instances 배열을 가진 그룹
- 중복 인스턴스명 처리
- undefined/null 그룹명 방어

### 테스트 시나리오

1. **Instance 모드**
    
    - null → 전체 인스턴스 반환
    - 특정 선택 → 선택된 인스턴스만 반환
2. **그룹 모드 (FAB/System/Cluster)**
    
    - null → 모든 그룹명 반환, 빈 instanceNames
    - 그룹 완전 선택 → groupNames에 포함
    - 그룹 부분 선택 → instanceNames에 개별 항목
    - 혼합 선택 → 적절한 분리
    - 빈 그룹 → 무시

### 사용 예시

```typescript
// API 호출 후
const apiResponse = await fetchGroupedInstances(groupBy);

// Context에서 선택 상태 가져오기
const { selectedInstances } = useContext(getCurrentContext(groupBy));

// 추출
const { groupNames, instanceNames } = useSelectionGroupExtractor({
  data: apiResponse,
  selectedInstances,
  groupBy
});

// API 요청 body 구성
const requestBody = { groupNames, instanceNames };
```

```

## 주요 개선 사항:
1. **API 응답 구조 반영**: 실제 API 응답 타입에 맞춘 데이터 구조 정의
2. **타입 안정성 강화**: 타입 가드와 명확한 타입 정의 추가
3. **로직 단순화**: Instance 모드와 그룹 모드 명확히 분리
4. **구체적인 구현 예시**: 실제 코드에 가까운 구현 제공
5. **사용 플로우 명시**: API 호출부터 추출까지 전체 플로우 설명

## 추가 권장사항:
- 성능 최적화를 위한 Set 자료구조 활용 검토
````