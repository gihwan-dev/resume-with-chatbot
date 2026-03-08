createPortal은 어떻게 동작할까? `createPortal`의 주요 특징은 다음과 같다:

1. `Portal`을 통핸 렌더링된 컴포넌트는 DOM 상에서는 다른 위치에 있더라도, React 트리에서는 원래 위치의 컨텍스트와 이벤트 버블링을 유지한다.
2. 부모 컴포넌트의 스타일링이나 오버레이의 영향을 받지 않고 독립적으로 렌더링할 수 있다.

createPortal의 세부 구현을 보자:
```tsx
export function createPortal(
  children: ReactNodeList,
  containerInfo: any,
  // TODO: figure out the API for cross-renderer implementation.
  implementation: any,
  key: ?string = null,
): ReactPortal {
  if (__DEV__) {
    checkKeyStringCoercion(key);
  }
  return {
    // This tag allow us to uniquely identify this as a React Portal
    $$typeof: REACT_PORTAL_TYPE,
    key: key == null ? null : '' + key,
    children,
    containerInfo,
    implementation,
  };
}
```

`type`이 `REACT_PORTAL_TYPE`인 리액트 노드를 생성해 반환하는 단순한 형태의 함수라는걸 알 수 있다. 그렇다면 `REACT_PORTAL_TYPE`을 어떻게 처리하는 이 객체를 처리하는 함수를 찾아봤다.

`type`에 대한 처리는 `beginWork` 함수에서 일어난다. `beginWork`는 `React Fiber` 아키텍처의 핵심 함수 중 하나다. 주요 역할은 다음과 같다:

1. Fiber 노드의 작업을 시작하고 해당 노드의 자식들을 처리하는 첫 단계다.
2. 컴포넌트 타입에 따라 적절한 처리를 수행한다(함수형 컴포넌트, 클래스 컴포넌트, Portal 등).
3. 변경사항이 있는지 확인하고 필요한 경우에만 작업을 수행한다.

주요한 특징은 다음과 같다:

1. 재귀적으로 동작해 전체 `Fiber` 트리를 순회한다.
2. 각 노드에서 필요한 업데이트를 식별하고 처리한다.
3. 성능 최적화를 위해 불필요한 작업을 건너뛰는 로직이 포함되어 있다.
4. 렌더 단계의 일부로, 이 단계에서 실제 `DOM` 업데이트는 일어나지 않는다.

이 함수는 `React`의 재조정(Reconciliation) 프로세스의 중요한 부분이며, 효율적인 UI 업데이트를 가능하게 한다. 그렇다면 세부 구현을 간략하게 알아보자:

```tsx
// 단순화된 beginWork 구현
function beginWork(current, workInProgress, renderLanes) {
  // 1. 변경사항 체크 (최적화)
  if (current !== null) {
    // 이전 props와 현재 props 비교
    const oldProps = current.memoizedProps;
    const newProps = workInProgress.pendingProps;
    
    if (oldProps === newProps && !hasContextChanged()) {
      // 변경사항이 없으면 작업을 건너뛸 수 있음
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
    }
  }

  // 2. 컴포넌트 타입에 따른 처리
  switch (workInProgress.tag) {
    case FunctionComponent:
      return updateFunctionComponent(current, workInProgress, renderLanes);
    case ClassComponent:
      return updateClassComponent(current, workInProgress, renderLanes);
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes);
    case PortalComponent:
      return updatePortalComponent(current, workInProgress, renderLanes);
    // ... 다른 타입들
  }
}
```

이처럼 `type`에 따라 적절한 `update` 함수를 호출하는 모습을 볼 수 있다. `createPortal`을 통해 생성된 `REACT_PORTAL_TYPE` 타입의 컴포넌트는 `updatePortalComponent`를 통해 처리된다. `updatePortalComponent`는 `Portal` 타입의 `Fiber` 노드를 처리하는 함수다. 주요 역할은 다음과 같다:

1. `Portal`의 `children`을 재조정(reconcile) 한다.
2. `Portal`의 `container` 정보를 관리한다.
3. `Portal`의 자식들이 올바르게 렌더링되도록 준비한다.

세부 구현을 보자:

```ts
function updatePortalComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
) {
  // Portal 컴포넌트의 containerInfo를 현재 작업 중인 Fiber의 context로 설정
  // 이를 통해 Portal 내부의 컴포넌트들이 올바른 container context에서 렌더링됨
  pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);

  // Portal의 children을 가져옴 (createPortal에서 전달된 children)
  const nextChildren = workInProgress.pendingProps;

  if (current === null) {
    // 최초 마운트 시
    // 일반적인 React 컴포넌트들은 마운트 단계에서 DOM에 추가되지만,
    // Portal은 특별한 케이스로 commit 단계에서 DOM에 추가됨
    // 이는 root가 null child로 시작하는 것과는 다른 방식
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      null,           // 이전 자식이 없으므로 null
      nextChildren,   // 새로운 자식들
      renderLanes,
    );
  } else {
    // 업데이트 시
    // 이전 Fiber(current)와 새로운 props(nextChildren)를 비교하여
    // 필요한 변경사항을 계산하고 자식 Fiber들을 재조정
    reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  }

  // 처리된 자식 Fiber를 반환
  // 이 자식들은 나중에 commit 단계에서 실제 container에 마운트됨
  return workInProgress.child;
}
```

여기서 중요한 포인트는 다음과 같다:

1. `Portal`은 `React` 트리 구조에서는 원래 위치에 존재하지만, `DOM`에서는 다른 위치에 렌더링된다.
2. `pushHostContainer`를 통해 `Portal`의 `container context`를 설정해 자식 컴포넌트들이 올바른 `context`에서 렌더링 되도록 한다.
3. 마운트와 업데이트 시의 처리가 다른데, 이는 `Portal`의 특별한 마운팅 방식 때문이다.
4. 실제 `DOM` 조작은 이후의 `commit` 단계에서 이루어진다.

`reconcileChildren`, `reconcileChildFibers` 함수는 새로운 `children`과 이전 `children`을 비교해 필요한 변경사항을 계산하고 새로운 `Fiber` 트리를 구성하는 함수다.

그렇다면 `pushHostContainer`는 무엇일까?

```ts
function pushHostContainer(fiber: Fiber, nextRootInstance: Container): void {
  // 1. root 인스턴스를 스택에 푸시
  // Portal이 팝될 때 root를 리셋할 수 있도록 함
  push(rootInstanceStackCursor, nextRootInstance, fiber);

  // 2. context를 제공한 Fiber를 추적
  // 유니크한 context를 제공하는 Fiber만 팝하기 위함
  push(contextFiberStackCursor, fiber, fiber);

  // 3. host context 처리
  // 에러 처리를 위해 먼저 빈 값을 푸시
  push(contextStackCursor, null, fiber);
  
  // 4. root context 가져오기
  const nextRootContext = getRootHostContext(nextRootInstance);
  
  // 5. 임시로 넣었던 null 값을 실제 context로 교체
  pop(contextStackCursor, fiber);
  push(contextStackCursor, nextRootContext, fiber);
}
```

주요 포인트는 다음과 같다:
1. `Portal`은 다른 `DOM` 트리에 렌더링되므로, 새로운 `container context`가 필요하다.
2. 이를 위해 3개의 스택을 관리한다:
   - `rootInstanceStackCursor`: `container` 인스턴스 추적
   - `contextFiberStackCursor`: `context` 제공 `Fiber` 추적
   - `contextStackCursor`: 실제 `host context` 관리
3. 에러 처리를 위해 임시로 `null`을 푸시했다가 실제 `context`로 교체하는 안전장치가 있다.
4. 이 함수는 Portal이 자신만의 독립적인 렌더링 context를 가질 수 있게 해주는 중요한 역할을 한다.

지금까지의 살펴본 내용을 요약하면 다음과 같다:

1. `createPortal`을 호출하면 `Portal` 타입의 컴포넌트를 생성한다.
2. `beginWorks`에서 `type`이 `Portal`인 컴포넌트는 `updatePortalComponent`를 통해 처리된다.
3. `updatePortalComponent`에서는 `Portal` 컴포넌트의 재조정을 실행하고 `pushHostContainer`를 통해 해당 `Portal` 컴포넌트에 필요한 컨텍스트를 저장한다.

여기까지가 렌더링 단계에서의 `Portal` 처리에 대한 전체적인 흐름이다. 그렇다면 커밋 단계에서의 처리에 대해 살펴보자. 이에 대한 처리는 `commitMutationEffectsOnFiber` 함수에서 일어난다:

```ts
function commitMutationEffectsOnFiber(finishedWork: Fiber, root: FiberRoot, lanes: Lanes) {
  // ... 다른 케이스들 ...

  case HostPortal: {
    if (supportsResources) {
      // 리소스 지원시 hoistable root 처리
      const previousHoistableRoot = currentHoistableRoot;
      currentHoistableRoot = getHoistableRoot(
        finishedWork.stateNode.containerInfo,
      );
      recursivelyTraverseMutationEffects(root, finishedWork, lanes);
      commitReconciliationEffects(finishedWork, lanes);
      currentHoistableRoot = previousHoistableRoot;
    } else {
      // 일반적인 경우
      recursivelyTraverseMutationEffects(root, finishedWork, lanes);
      commitReconciliationEffects(finishedWork, lanes);
    }

    // Update 플래그가 있는 경우
    if (flags & Update) {
      if (supportsPersistence) {
        // Portal의 자식들을 container에 커밋
        commitHostPortalContainerChildren(
          finishedWork.stateNode,
          finishedWork,
          finishedWork.stateNode.pendingChildren,
        );
      }
    }
    break;
  }
}
```

이 함수의 실행 순서와 각 단계의 역할이 매우 중요하다:

1. `recursivelyTraverseMutationEffects`: Portal의 자식들에 대한 mutation 효과를 재귀적으로 처리한다. 이 함수에서는 삭제(Deletion) 처리를 하며, 전체 Fiber 트리를 순회하면서 mutation 관련 플래그를 확인한다.
2. `commitReconciliationEffects`: 이 함수에서는 삽입(Placement) 처리가 진행된다. 새로운 노드를 DOM 트리의 올바른 위치에 배치하는 작업을 수행한다.
3. `Update` 플래그가 있는 경우:
   - `commitHostPortalContainerChildren`을 통해 Portal 컴포넌트의 container에 대한 업데이트(Update) 처리가 진행된다.
   - 이 함수는 Portal의 자식들을 실제 container에 마운트하는 최종 단계를 담당한다.

이해가 가지 않는 변수들이 있다. 하나하나 알아보자.

**1. 리소스 지원 (supportsResources)**
- React의 새로운 기능인 Resources와 관련된 것으로, 주로 서버 컴포넌트와 관련이 있다.
- hoistable elements(예: `<script>`, `<style>` 등)를 특별히 처리할 수 있게 해주는 기능이다.
- `currentHoistableRoot`를 통해 이러한 요소들이 어디에 배치되어야 하는지 추적된다.
- 서버 컴포넌트에서 클라이언트로 전환될 때 필요한 리소스를 효율적으로 관리한다.

**2. Mutation 처리 (recursivelyTraverseMutationEffects)**
- DOM에 실제 변경사항을 적용하는 단계이다.
- 주요 mutation 타입:
```ts
// 예시적인 mutation 타입들
const Placement = /*     */ 0b0000000000000000010; // 새로운 노드 삽입
const Update = /*        */ 0b0000000000000000100; // 노드 업데이트
const Deletion = /*      */ 0b0000000000000001000; // 노드 삭제
```
- `recursivelyTraverseMutationEffects`는 Fiber 트리를 순회하면서 이러한 mutation 효과들을 실행한다.
- 자식 노드들의 mutation을 먼저 처리한 후, 부모 노드의 mutation을 처리하는 것이 중요하다.

**3. Update 플래그**
```ts
// React Fiber flags
const Update = 0b0000000000000000100; // 2진수 표현
```
- 이 플래그는 해당 Fiber 노드의 props나 state가 변경되어 업데이트가 필요함을 나타낸다.
- Portal의 경우:
  - container의 내용물이 변경되었을 때 설정된다.
  - 이 플래그가 있으면 `commitHostPortalContainerChildren`을 통해 변경된 자식들을 container에 반영한다.
  - 초기에는 Update가 아닌 Placement의 플래그를 가지며, `commitReconciliationEffects`가 실행된다.

**4. Persistence 지원 (supportsPersistence)**
- React의 서버 컴포넌트와 관련된 기능으로, 서버에서 렌더링된 컴포넌트의 상태를 클라이언트에서 유지하는 것을 지원한다.
- Portal의 경우, 서버에서 렌더링된 Portal의 내용이 클라이언트에서도 올바르게 유지되도록 보장한다.

전반적인 흐름을 다시 요약해보자.

**렌더링 페이즈**
1. `createPortal`을 호출하면 `Portal` 타입의 컴포넌트를 생성한다.
2. `beginWorks`에서 `type`이 `Portal`인 컴포넌트는 `updatePortalComponent`를 통해 처리된다.
3. `updatePortalComponent`에서는 `Portal` 컴포넌트의 재조정을 실행하고 `pushHostContainer`를 통해 해당 `Portal` 컴포넌트에 필요한 컨텍스트를 저장한다.

```mermaid
graph TD
    A[createPortal 호출] --> B[Portal 타입 컴포넌트 생성]
    B --> C[beginWork]
    
    C --> D{type 체크}
    D -->|Portal 타입| E[updatePortalComponent]
    
    E --> F[pushHostContainer]
    F --> G[container context 설정]
    
    E --> H[reconcileChildFibers]
    H --> I[자식 Fiber 생성/업데이트]
    
    subgraph "Portal 처리 과정"
        F --> J[containerInfo 저장]
        F --> K[contextFiberStackCursor 관리]
        F --> L[contextStackCursor 관리]
    end
    
    subgraph "재조정 과정"
        H --> M[이전 자식과 비교]
        M --> N[필요한 변경사항 계산]
        N --> O[새로운 Fiber 트리 구성]
    end
```

**커밋 페이즈**
1. `commitMutationEffects`가 호출되면, `recursivelyTraverseMutationEffects`를 통해 Fiber 트리를 재귀적으로 순회하면서 각 노드의 mutation effect를 처리한다.
2. `Portal` 컴포넌트에 도달하면:
   - `recursivelyTraverseMutationEffects`를 통해 자식 노드들의 mutation effect를 먼저 처리한다.
   - `commitReconciliationEffects`를 통해 `Portal` 자체의 Placement 효과를 처리한다.
   - `Update` 플래그가 있는 경우 `commitHostPortalContainerChildren`을 통해 `Portal`의 자식들을 지정된 `container`에 실제로 DOM 업데이트를 수행한다.
3. 삭제(Deletion)가 필요한 경우:
   - `recursivelyTraverseDeletionEffects`를 통해 삭제될 노드의 자식들에 대한 cleanup을 재귀적으로 처리한다.
   - `commitDeletionEffects`를 통해 실제 DOM에서 노드를 제거하고 cleanup effect를 실행한다.

```mermaid
graph TD
    A[commitMutationEffects] --> B[recursivelyTraverseMutationEffects]
    B --> C[commitMutationEffectsOnFiber]
    
    C --> D{Check Flags}
    D -->|Placement| E[commitReconciliationEffects]
    D -->|Update| F[commitHostComponentUpdate]
    D -->|Deletion| G[commitDeletionEffects]
    
    G --> H[recursivelyTraverseDeletionEffects]
    H --> I[commitDeletionEffectsOnFiber]
    
    E --> J[commitHostPlacement]
    
    subgraph "Recursive Tree Traversal"
        B --> K[Child Fiber]
        K --> B
        C --> L[Child Fiber]
        L --> C
        H --> M[Child Fiber]
        M --> H
    end
```
