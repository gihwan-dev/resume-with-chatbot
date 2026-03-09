## 리서치
https://g.co/gemini/share/e7ddecc97bf1
https://claude.ai/public/artifacts/fcb23a54-a9ae-48a8-b3f3-b75fcf3283bb
### 요약
## 문제점
- 핵사고날 아키텍처에서 제시하는 포트 어댑터를 정의하고 사용하는 패턴 자체가 기본적으로 현재 너무 복잡하며 보일러 플레이트가 많습니다.
- *   1대1 대응되는 어댑터가 결국 백엔드랑 강결합 관계를 만들어 냅니다. 그렇다 보니 이 어댑터가 실질적으로 코드 수정 범위를 줄여주는 본연의 역할을 하지 못하고 오히려 수정 범위를 늘리기만 합니다.
*   재사용되거나 의존성이 높은 엔드포인트에만 선별적으로 어댑터 패턴을 도입하는 것이 훨씬 더 현명하고 효율적인 접근 방식이지 않을까 하는 생각이듭니다.
    *   예를들어 auth, me, instance 등등이 있을거 같습니다.

현재 `revisionHistory`의 `InstanceRevision` 관련 쿼리를 예로 들면 아래와 같은 코드를 작성해야 합니다:

### 1. 타입 정의
```ts
// model/types.ts

interface RevisionHistory {
  modifiedTime: string;
  modifiedByUserId: number;
  modifiedByUserName: string;
  before: string;
  after: string;
}

export interface InstanceRevisionHistory extends RevisionHistory {
  instanceName: string;
}
```

### 2. 어댑터 정의
```ts
// lib/adapter.ts
import {
  InstanceRevisionHistoryDto,
} from '@/widgets/revisionHistory/model/types';

const Inport = {
  convertToGetInstanceResponse: (response: InstanceRevisionHistoryDto) =>
    response as InstanceRevisionHistory,
};

export { Inport };
```

### 3. api에서 사용
```ts
// api/instanceApi.ts

const getInstancesRevisionHistoryApi = async (
  instanceId: string,
  pageNum: number,
  pageSize: number = 10,
): Promise<InstanceRevisionHistoryResponse> => {
  const response = await v1ApiInstance.get<PagingDataApiResponse<InstanceRevisionHistoryDto[]>>(
    'config/instances/revision-history',
    {
      params: {
        instanceId,
        pageNum,
        pageSize,
      },
    },
  );

  // 페이지 정보와 함께 데이터 반환
  return {
    data: response.data.data.map(Inport.convertToGetInstanceResponse),
    totalCount: response.data.page.totalRow,
    currentPage: response.data.page.pageNum,
    totalPages: response.data.page.pages,
    pageSize: response.data.page.pageSize,
  };
};
```

### 4. query 커스텀 훅 정의
```ts
// model/useInstanceRevisionHistoryQuery
export const useInstanceRevisionHistoryQuery = () => {
  return useQuery({
    queryKey: getInstancesRevisionHistoryApi.queryKey,
    queryFn: getInstancesRevisionHistoryApi,
  });
};
```

### 5. 필요한 곳에서 사용
```ts
const { data: historyResponse } = useInstanceRevisionHistoryQuery();
```

현재 상황에서 만약 백엔드 변경 사항이 발생했을 때 변경해야 하는 범위는 2가지 파일입니다:
- model/types.ts 의 타입
- lib/adapter.ts 의 변환 로직

문제는 현재 이 API의 사용이 단 하나의 컴포넌트 밖에 없다는 것입니다. 그렇다 보니 차라리 사용하지 않았을 때 보다 어댑터를 사용했을 때 수정하는 범위가 더 커지게 됩니다.

다른 하나의 문제는 만약 새로운 쿼리를 추가한다고 하면 현재 3가지 각기 다른 폴더에 위치한 4가지 파일을 수정해야 한다는 점입니다. 서로 연관된 모듈들이 파편화된 상태로 존재해 수정 범위가 큽니다:
- model/types.ts 에 타입 추가
- lib/adapter.ts 에 변환 함수 추가
- api/ 폴더에 api 호출 함수 정의
- model/ 에 쿼리 커스텀훅 추가

### 1대1 대응되는 어댑터가 실질적으로 유용할까?
결국 어댑터의 사용 이유가 API 변경시 수정될 부분들을 줄이기 위함 입니다. API가 변경 되었을 때 수정되어야 하는 범위에 대해서 시각화 해보면

#### 어댑터가 적용된 경우
![[Pasted image 20251125085908.png]]

#### 사용하지 않는 경우
![[Pasted image 20251125085950.png]]

실질적으로 1대1로 매핑되며 단일 컴포넌트에서 사용되는 경우에는 크게 변경 부위를 줄여주지 못합니다.

다만 아래처럼 여러 컴포넌트에서 사용되는 API에서는 효과를 발휘할 수 있습니다:
![[Pasted image 20251125090227.png]]

그래서 제안 하는 방식은 아래와 같습니다:
1. 기본적으로 어댑터를 사용하지 않습니다.
2. 재사용 되는 엔드포인트 호출(인스턴스 정보 요청)을 커스텀 훅으로 분리해 재사용 합니다.
3. 백엔드 변경 사항이 발생하면? select를 통해 변환해 대응합니다.

> [!Note] useQuery의 select를 사용하는 이유
> - **Structural Sharing**: select 결과가 자동으로 메모이제이션되어 참조 동일성 유지
> - **구독 최적화**: select된 데이터만 변경되었을 때만 리렌더링 트리거 (전체 응답이 바뀌어도 select 결과가 같으면 리렌더링 안 됨)
> - **캐시 분리**: 원본 응답은 캐시에 보존, 변환된 데이터만 컴포넌트에 전달
> - **선택적 재실행**: queryFn 재실행 없이 캐시된 데이터에서 select만 다시 실행 가능

예시를 들면 아래와 같습니다:
### 1. 기본적으로 그냥 어댑터 없이 정의 및 사용
**단일 사용 케이스 - RevisionHistory**

```ts
// api/revisionHistoryApi.ts
interface InstanceRevisionHistoryDto {
  modifiedTime: string;
  modifiedByUserId: number;
  modifiedByUserName: string;
  before: string;
  after: string;
  instanceName: string;
}

const getInstancesRevisionHistory = async (
  instanceId: string,
  pageNum: number,
  pageSize: number = 10,
) => {
  const response = await v1ApiInstance.get<PagingDataApiResponse<InstanceRevisionHistoryDto[]>>(
    'config/instances/revision-history',
    {
      params: { instanceId, pageNum, pageSize },
    },
  );

  return {
    data: response.data.data,
    totalCount: response.data.page.totalRow,
    currentPage: response.data.page.pageNum,
    totalPages: response.data.page.pages,
    pageSize: response.data.page.pageSize,
  };
};

// 사용처 컴포넌트에서 직접 사용
const { data: historyResponse } = useQuery({
  queryKey: ['instanceRevisionHistory', instanceId, pageNum],
  queryFn: () => getInstancesRevisionHistory(instanceId, pageNum),
});
```

---
### 2. 재사용되는 엔드포인트는 커스텀 훅으로 분리
**공통 사용 케이스 - Instance 정보 조회**

```ts
// entitiy/instance/model/useInstanceQuery.ts
interface InstanceDto {
  instanceId: string;
  instanceName: string;
  status: string;
  // ... 기타 필드
}

export const useInstanceQuery = (instanceId: string) => {
  return useQuery({
    queryKey: ['instance', instanceId],
    queryFn: async () => {
      const response = await v1ApiInstance.get<InstanceDto>(
        `config/instances/${instanceId}`
      );
      return response.data;
    },
  });
};

// 여러 컴포넌트에서 재사용
// ComponentA.tsx
const { data: instance } = useInstanceQuery(instanceId);

// ComponentB.tsx
const { data: instance } = useInstanceQuery(instanceId);
```

---
### 3. 백엔드 변경사항 대응 - select로 처리

**백엔드 응답 형식 변경 시나리오**
```ts
// hooks/useInstanceQuery.ts
interface InstanceDto {
  instance_id: string;      // 백엔드가 snake_case로 변경
  instance_name: string;
  status_code: number;      // 백엔드가 문자열 → 숫자로 변경
}

export const useInstanceQuery = (instanceId: string) => {
  return useQuery({
    queryKey: ['instance', instanceId],
    queryFn: async () => {
      const response = await v1ApiInstance.get<InstanceDto>(
        `config/instances/${instanceId}`
      );
      return response.data;
    },
    // select로 프론트엔드에서 원하는 형태로 변환
    select: (data) => ({
      instanceId: data.instance_id,
      instanceName: data.instance_name,
      status: data.status_code === 1 ? 'active' : 'inactive',
    }),
  });
};

// 사용처에서는 변경 없이 동일하게 사용
const { data: instance } = useInstanceQuery(instanceId);
// instance.instanceId, instance.instanceName, instance.status 사용
```

## 추가적으로 정의부를 왜 분리해야 하나
아래처럼 BE의 변경과 FE의 변경을 자동화 하기 위함 입니다:
![[Pasted image 20251125090530.png]]

어차피 Open API Generator나 Orval을 사용해 요청 함수 생성 자동화를 진행하게 되었을 때의 형태와 유사하게 만드려 했습니다. 당시에 OAG를 사용하지 못한다는 얘기를 들어서 그렇게 진행했고, 사실상 OAG, Orval 둘 중 하나를 사용해 자동화 하는게 가장 좋다고 생각합니다.

page 계층 안에 API 호출 함수들이 들어가게 되면 이러한 자동화를 적용할 수 없습니다.

## 참고
https://javascript.plainenglish.io/how-i-use-adapter-pattern-in-reactjs-cb331e9bef0c?gi=6c6eb950c120
https://tkdodo.eu/blog/practical-react-query