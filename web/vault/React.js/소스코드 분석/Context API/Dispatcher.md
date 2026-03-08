## HooksDiapatcherOnMount

```ts
const HooksDispatcherOnMount: Dispatcher = {
  readContext,

  use,
  useCallback: mountCallback,
  useContext: readContext,
  useEffect: mountEffect,
  useImperativeHandle: mountImperativeHandle,
  useLayoutEffect: mountLayoutEffect,
  useInsertionEffect: mountInsertionEffect,
  useMemo: mountMemo,
  useReducer: mountReducer,
  useRef: mountRef,
  useState: mountState,
  useDebugValue: mountDebugValue,
  useDeferredValue: mountDeferredValue,
  useTransition: mountTransition,
  useSyncExternalStore: mountSyncExternalStore,
  useId: mountId,
  useHostTransitionStatus: useHostTransitionStatus,
  useFormState: mountActionState,
  useActionState: mountActionState,
  useOptimistic: mountOptimistic,
  useMemoCache,
  useCacheRefresh: mountRefresh,
};
```

`HooksDispatcherOnMount`는 React의 훅 시스템에서 컴포넌트가 처음 마운트될 때 사용되는 dispatcher다. 주요 특징과 역할을 설명하겠다.


**주요 특징**:
- 모든 훅의 `mount` 버전 구현을 포함
- 컴포넌트가 처음 렌더링될 때만 사용됨
- 초기 상태 설정과 메모이제이션을 담당

3. **주요 훅들의 마운트 동작**
- `useState`: 초기 상태값 설정
- `useEffect`: 이펙트 등록
- `useMemo`: 초기 메모이제이션 값 계산
- `useCallback`: 초기 콜백 메모이제이션
- `useRef`: 초기 ref 객체 생성

**컨텍스트 처리**:
 - `readContext` 함수를 통해 컨텍스트 값 읽기
 - `useContext` 훅의 기반이 됨

**최적화 관련**:
 - `useDeferredValue`: 지연된 값 처리
 - `useTransition`: 전환 상태 관리
 - `useSyncExternalStore`: 외부 스토어 동기화

**폼 상태 관리**:
 - `useFormState`/`useActionState`: 폼 상태 관리
 - `useOptimistic`: 낙관적 업데이트 처리

**캐시 관련**:
 - `useMemoCache`: 메모이제이션 캐시 관리
 - `useCacheRefresh`: 캐시 새로고침

이 dispatcher는 React의 훅 시스템에서 매우 중요한 역할을 합니다:
1. 컴포넌트의 초기 상태 설정
2. 훅의 첫 번째 호출 시 필요한 초기화 작업 수행
3. 메모이제이션과 이펙트의 초기 등록
4. 컨텍스트와 외부 스토어의 초기 연결

이 dispatcher는 컴포넌트가 처음 마운트될 때만 사용되며, 이후 업데이트에서는 `HooksDispatcherOnUpdate`가 사용됩니다. 이는 React가 훅의 상태를 효율적으로 관리하고, 렌더링 성능을 최적화하는 데 중요한 역할을 합니다.

## HooksDispatcherOnUpdate

```ts
const HooksDispatcherOnUpdate: Dispatcher = {
  readContext,

  use,
  useCallback: updateCallback,
  useContext: readContext,
  useEffect: updateEffect,
  useImperativeHandle: updateImperativeHandle,
  useInsertionEffect: updateInsertionEffect,
  useLayoutEffect: updateLayoutEffect,
  useMemo: updateMemo,
  useReducer: updateReducer,
  useRef: updateRef,
  useState: updateState,
  useDebugValue: updateDebugValue,
  useDeferredValue: updateDeferredValue,
  useTransition: updateTransition,
  useSyncExternalStore: updateSyncExternalStore,
  useId: updateId,
  useHostTransitionStatus: useHostTransitionStatus,
  useFormState: updateActionState,
  useActionState: updateActionState,
  useOptimistic: updateOptimistic,
  useMemoCache,
  useCacheRefresh: updateRefresh,
};
```

`HooksDispatcherOnUpdate`는 React의 훅 시스템에서 컴포넌트가 업데이트될 때 사용되는 dispatcher다. 주요 특징과 역할을 설명하겠다:

**주요 특징**:
 - 모든 훅의 `update` 버전 구현을 포함
 - 컴포넌트가 리렌더링될 때 사용됨
 - 이전 상태와의 비교 및 업데이트 로직을 담당

**주요 훅들의 업데이트 동작**:
 - `useState`: 상태 업데이트 처리
 - `useEffect`: 의존성 변경 감지 및 이펙트 재실행
 - `useMemo`: 의존성 변경 시 메모이제이션 재계산
 - `useCallback`: 의존성 변경 시 콜백 재생성
 - `useRef`: ref 객체 업데이트

**업데이트 최적화**:
 - `updateMemo`: 메모이제이션 값 재계산
 - `updateCallback`: 콜백 함수 재생성
 - `updateEffect`: 이펙트 의존성 비교

**상태 관리**:
 - `updateState`: 상태 업데이트 처리
 - `updateReducer`: 리듀서 기반 상태 업데이트
 - `updateActionState`: 액션 기반 상태 업데이트

**동시성 기능**:
 - `updateTransition`: 전환 상태 업데이트
 - `updateDeferredValue`: 지연된 값 업데이트
 - `updateSyncExternalStore`: 외부 스토어 동기화

**폼 및 낙관적 업데이트**:
 - `updateActionState`: 폼 상태 업데이트
 - `updateOptimistic`: 낙관적 업데이트 처리

이 dispatcher의 주요 역할은:
1. 이전 상태와 새로운 상태의 비교
2. 의존성 변경 감지
3. 필요한 경우에만 상태 업데이트 및 이펙트 재실행
4. 메모이제이션 값의 재계산
5. 동시성 기능 지원

`HooksDispatcherOnUpdate`는 `HooksDispatcherOnMount`와 함께 React의 훅 시스템의 핵심을 이루며, 컴포넌트의 업데이트 과정에서 효율적인 상태 관리와 렌더링 최적화를 담당한. 특히 의존성 비교와 메모이제이션을 통해 불필요한 리렌더링을 방지하는 중요한 역할을 한다.

## HooksDispatcherOnRerender

```ts
const HooksDispatcherOnRerender: Dispatcher = {
  readContext,

  use,
  useCallback: updateCallback,
  useContext: readContext,
  useEffect: updateEffect,
  useImperativeHandle: updateImperativeHandle,
  useInsertionEffect: updateInsertionEffect,
  useLayoutEffect: updateLayoutEffect,
  useMemo: updateMemo,
  useReducer: rerenderReducer,
  useRef: updateRef,
  useState: rerenderState,
  useDebugValue: updateDebugValue,
  useDeferredValue: rerenderDeferredValue,
  useTransition: rerenderTransition,
  useSyncExternalStore: updateSyncExternalStore,
  useId: updateId,
  useHostTransitionStatus: useHostTransitionStatus,
  useFormState: rerenderActionState,
  useActionState: rerenderActionState,
  useOptimistic: rerenderOptimistic,
  useMemoCache,
  useCacheRefresh: updateRefresh,
};
```

- 리렌더링 중에 특별히 사용되는 디스패처다
- 주로 상태 업데이트의 우선순위나 처리 방식이 다른 경우에 활용된다

## HooksDispatcher가 라이프사이클에 따라 분리된 이유

Dispatcher를 Mount와 Update로 분리한 이유는 크게 세 가지 측면에서 설명할 수 있다:

1. **초기화와 업데이트의 본질적 차이**:
   - **Mount 시점**:
     ```javascript
     // 초기 상태 설정
     function mountState(initialState) {
       const hook = mountWorkInProgressHook();
       if (typeof initialState === 'function') {
         initialState = initialState();
       }
       hook.memoizedState = hook.baseState = initialState;
       // ... 초기화 로직
     }
     ```
     - 초기 상태를 설정
     - 메모이제이션 값의 초기 계산
     - 이펙트의 첫 등록
     - ref 객체의 초기 생성

   - **Update 시점**:
     ```javascript
     // 상태 업데이트 처리
     function updateState(initialState) {
       const hook = updateWorkInProgressHook();
       // 이전 상태와 비교
       if (areHookInputsEqual(nextDeps, prevDeps)) {
         return prevState;
       }
       // ... 업데이트 로직
     }
     ```
     - 이전 상태와의 비교
     - 의존성 변경 감지
     - 조건부 업데이트 처리

2. **성능 최적화**:
   - Mount 시점은 한 번만 실행되므로 초기화에 집중
   - Update 시점은 자주 실행되므로 비교와 최적화에 집중
   - 각 시점별로 필요한 최적화 로직만 포함하여 불필요한 코드 실행 방지

3. **코드 구조와 유지보수**:
   - 각 생명주기별로 명확한 책임 분리
   - 디버깅과 문제 해결이 용이
   - 코드의 가독성과 유지보수성 향상

예를 들어, `useEffect`의 경우:
```javascript
// Mount 시점
function mountEffect(create, deps) {
  return mountEffectImpl(
    PassiveEffect | PassiveStaticEffect,
    HookPassive,
    create,
    deps
  );
}

// Update 시점
function updateEffect(create, deps) {
  return updateEffectImpl(
    PassiveEffect,
    HookPassive,
    create,
    deps
  );
}
```

Mount에서는:
- 이펙트의 초기 등록
- 클린업 함수 설정
- 의존성 배열 초기화

Update에서는:
- 이전 의존성과 새로운 의존성 비교
- 변경된 경우에만 이펙트 재실행
- 이전 클린업 함수 실행

이렇게 분리함으로써:
1. 각 생명주기별로 필요한 로직만 실행
2. 불필요한 비교나 계산 방지
3. 코드의 의도가 명확해짐
4. 성능 최적화가 용이해짐

이러한 분리는 React의 핵심 원칙인 "선언적 UI"와 "효율적인 업데이트"를 구현하는 데 중요한 역할을 한다.

## Update vs Rerender

React의 Dispatcher 시스템에서 `HooksDispatcherOnUpdate`와 `HooksDispatcherOnRerender`의 주요 차이점에 대해 설명해 하겠다.

두 Dispatcher의 핵심적인 차이는 컴포넌트가 **업데이트되는 방식**과 관련이 있다:

1. **HooksDispatcherOnUpdate**:
    - 일반적인 업데이트 주기에서 사용된다 (props 변경, 상위 컴포넌트 리렌더링 등으로 인한 업데이트)
    - 컴포넌트의 첫 번째 렌더링 이후에 일어나는 일반적인 업데이트를 처리한다
2. **HooksDispatcherOnRerender**:
    - 리렌더링 중에 특별히 사용되는 디스패처다
    - 주로 상태 업데이트의 우선순위나 처리 방식이 다른 경우에 활용된다

코드에서 볼 수 있듯이, 대부분의 훅은 두 디스패처에서 동일한 구현을 사용하지만, 다음 훅들은 다른 구현을 가지고 있다:

- `useReducer`: `updateReducer` vs `rerenderReducer`
- `useState`: `updateState` vs `rerenderState`
- `useDeferredValue`: `updateDeferredValue` vs `rerenderDeferredValue`
- `useTransition`: `updateTransition` vs `rerenderTransition`
- `useFormState`/`useActionState`: `updateActionState` vs `rerenderActionState`
- `useOptimistic`: `updateOptimistic` vs `rerenderOptimistic`

이러한 차이는 React의 조정(reconciliation) 프로세스와 관련이 있다. 일반 업데이트의 경우 상태 변경을 처리하는 방식이 다르고, 리렌더링의 경우에는 이미 시작된 렌더링 작업의 컨텍스트에서 상태를 처리하는 방식이 다르다.

주요 차이점은 내부적으로 다음과 같다:

- 업데이트 시: 새로운 렌더링 사이클을 시작할 수 있음
- 리렌더링 시: 이미 진행 중인 렌더링 작업의 일부로 처리됨

이런 구조는 React의 Concurrent Mode 및 Suspense와 같은 고급 기능들의 구현을 위해 특히 중요히다.

## Update와 Rerender의 차이
React의 라이프사이클과 연관지어 `update`와 `rerender`의 차이점을 설명하겠다.
### React 라이프사이클 관점에서의 차이

#### Update (업데이트)

- **언제 발생하는가**:
    - 컴포넌트의 props가 변경될 때
    - 부모 컴포넌트가 리렌더링될 때
    - `setState` 또는 `dispatch`를 사용하여 상태를 직접 변경할 때
- **특징**:
    - 새로운 렌더링 사이클을 시작합니다
    - 컴포넌트 트리의 일부분에 대한 완전한 렌더링 과정을 시작
    - React가 변경된 상태/props를 사용하여 컴포넌트를 평가

#### Rerender (재렌더링)

- **언제 발생하는가**:
    - 이미 렌더링 중인 컴포넌트에서 상태 업데이트가 발생할 때 (예: 렌더링 중 `setState` 호출)
    - 렌더링 과정에서 추가적인 상태 업데이트가 필요한 경우
    - 주로 Concurrent Mode나 Suspense와 같은 고급 기능 사용 시
- **특징**:
    - 이미 진행 중인 렌더링 작업의 일부로 처리
    - 별도의 완전한 렌더링 사이클을 시작하지 않
    - 렌더링 중에 발생한 상태 업데이트를 처리하기 위한 특수 과정

### 실질적인 예시와 차이점

예를 들어, 다음과 같은 코드가 있다고 가정해보겠다:

```jsx
function MyComponent() {
  const [count, setCount] = useState(0);
  
  // 일반적인 업데이트 - HooksDispatcherOnUpdate 사용
  useEffect(() => {
    setCount(count + 1);
  }, [someValue]);
  
  // 렌더링 과정에서의 상태 변경 - 아래와 같은 패턴이 있을 때
  // HooksDispatcherOnRerender가 관여할 수 있음
  if (someCondition) {
    // 이런 패턴은 일반적으로 권장되지 않지만, 
    // React 18+ 에서는 Concurrent Mode와 함께 특정 상황에서 발생할 수 있음
    const newValue = computeExpensiveValue();
    setCount(newValue); // 렌더링 중 상태 업데이트
  }
  
  return <div>{count}</div>;
}
```

## 구체적인 내부 메커니즘 차이

1. **상태 큐 처리 방식**:
    - `updateState`: 상태 업데이트를 큐에 추가하고 일반적인 React 라이프사이클을 따른다
    - `rerenderState`: 이미 진행 중인 렌더링에서 상태 업데이트를 처리한다
2. **실행 컨텍스트**:
    - `updateXXX` 함수들: 일반적인 렌더링 사이클에서 실행된다
    - `rerenderXXX` 함수들: 이미 렌더링 중인 컴포넌트의 컨텍스트에서 실행된다

이러한 구분은 React가 복잡한 상태 업데이트 시나리오를 효율적으로 처리하고, Concurrent Mode와 같은 고급 기능을 지원하기 위해 필요하다. 두 Dispatcher는 같은 기능을 하지만, 렌더링 사이클 내에서 다른 시점과 컨텍스트에서 작동하는 것이다.