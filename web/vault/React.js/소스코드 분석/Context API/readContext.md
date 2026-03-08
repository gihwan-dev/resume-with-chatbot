초기 마운트 시에는 `useContext`에 `readContext`가 할당된다. 

```ts
export function readContext<T>(context: ReactContext<T>): T {
  return readContextForConsumer(currentlyRenderingFiber, context);
}
```

`readContext` 함수는 `context`를 입력받아 현재 렌더링 중인 `Fiber`와 컨텍스트를 가지고 `readContextForConsumer`를 호출한다.

## readContextForConsumer
```ts
function readContextForConsumer<T>(
  consumer: Fiber | null,
  context: ReactContext<T>,
): T {
  // 현재 렌더러에 따라 적절한 컨텍스트 값을 가져옵니다
  const value = isPrimaryRenderer
    ? context._currentValue
    : context._currentValue2;

  // 컨텍스트 의존성 정보를 생성합니다
  const contextItem = {
    context: ((context: any): ReactContext<mixed>),
    memoizedValue: value,
    next: null,
  };

  if (lastContextDependency === null) {
    // 렌더링 중이 아닌 경우 에러를 발생시킵니다
    if (consumer === null) {
      throw new Error(
        'Context는 React가 렌더링 중일 때만 읽을 수 있습니다. ' +
          '클래스 컴포넌트에서는 render 메서드나 getDerivedStateFromProps에서 읽을 수 있습니다. ' +
          '함수 컴포넌트에서는 함수 본문에서 직접 읽을 수 있지만, ' +
          'useReducer()나 useMemo()와 같은 Hooks 내부에서는 읽을 수 없습니다.',
      );
    }

    // 첫 번째 의존성인 경우 새로운 리스트를 생성합니다
    lastContextDependency = contextItem;
    consumer.dependencies = {
      lanes: NoLanes,
      firstContext: contextItem,
    };
    consumer.flags |= NeedsPropagation;
  } else {
    // 기존 의존성 리스트에 새로운 컨텍스트 항목을 추가합니다
    lastContextDependency = lastContextDependency.next = contextItem;
  }
  return value;
}
```

1. 현재 렌더러에 따라 적절한 컨텍스트 값을 가져다.
2. 컨텍스트 의존성 정보를 생성한다.
3. 첫 번째 의존성인 경우 새로운 리스트를 생성하고, 그렇지 않은 경우 기존 리스트에 추가한다.
4. 컨텍스트 값이 변경되었을 때 필요한 업데이트를 위해 NeedsPropagation 플래그를 설정한다.

이 함수는 `React`의 `Context API`가 내부적으로 어떻게 동작하는지 보여주는 중요한 부분다. 컴포넌트가 컨텍스트를 구독할 때 이 함수를 통해 의존성 정보를 관리하고, 컨텍스트 값이 변경될 때 적절한 업데이트를 트리거하는 역할을 한다.

### contextItem 변수의 next 필드
이 부분은 React의 Context 시스템에서 의존성 관리를 위한 링크드 리스트(Linked List) 구조를 구현하는 부분입니다. 각 필드에 대해 자세히 설명하겠다:

`next`는 링크드 리스트의 다음 노드를 가리키는 포인터이다. 이 필드를 통해 여러 Context 의존성을 연결할 수 있다.

이 구조가 사용되는 방식은 다음과 같다:

```javascript
// 첫 번째 Context 의존성 추가
lastContextDependency = contextItem;
consumer.dependencies = {
  lanes: NoLanes,
  firstContext: contextItem,  // 첫 번째 의존성
};

// 두 번째 Context 의존성 추가
lastContextDependency = lastContextDependency.next = contextItem2;
// 이제 firstContext -> contextItem -> contextItem2 순서로 연결됨
```

이렇게 링크드 리스트 구조를 사용하는 이유는:
1. 컴포넌트가 여러 Context를 구독할 수 있기 때문이다
2. 동적으로 의존성을 추가/제거할 수 있어야 하기 때문이다
3. 메모리 효율적으로 의존성을 관리할 수 있기 때문이다

예를 들어, 다음과 같은 컴포넌트가 있다고 가정해보겠다:
```jsx
function MyComponent() {
  const theme = useContext(ThemeContext);
  const user = useContext(UserContext);
  const locale = useContext(LocaleContext);
  // ...
}
```

이 경우 `MyComponent`의 Fiber 노드에는 세 개의 Context 의존성이 링크드 리스트로 연결되어 저장된다. 이렇게 하면 Context 값이 변경되었을 때 어떤 컴포넌트를 업데이트해야 하는지 효율적으로 추적할 수 있다.
이 부분은 React의 Context 시스템에서 의존성 관리를 위한 링크드 리스트(Linked List) 구조를 구현하는 부분이다. 각 필드에 대해 자세히 설명하겠다:

1. `context`: 현재 구독하고 있는 Context 객체를 참조한다. TypeScript 타입 캐스팅을 통해 `ReactContext<mixed>` 타입으로 변환한다.

2. `memoizedValue`: 현재 Context의 값을 저장한다. 이 값은 나중에 Context가 변경되었는지 비교하는 데 사용된다.

3. `next`: 링크드 리스트의 다음 노드를 가리키는 포인터다. 이 필드를 통해 여러 Context 의존성을 연결할 수 있다.

이 구조가 사용되는 방식은 다음과 같습니다:

```javascript
// 첫 번째 Context 의존성 추가
lastContextDependency = contextItem;
consumer.dependencies = {
  lanes: NoLanes,
  firstContext: contextItem,  // 첫 번째 의존성
};

// 두 번째 Context 의존성 추가
lastContextDependency = lastContextDependency.next = contextItem2;
// 이제 firstContext -> contextItem -> contextItem2 순서로 연결됨
```

이렇게 링크드 리스트 구조를 사용하는 이유는:
1. 컴포넌트가 여러 Context를 구독할 수 있기 때문이다
2. 동적으로 의존성을 추가/제거할 수 있어야 하기 때문이다
3. 메모리 효율적으로 의존성을 관리할 수 있기 때문이다

예를 들어, 다음과 같은 컴포넌트가 있다고 가정해보겠다:
```jsx
function MyComponent() {
  const theme = useContext(ThemeContext);
  const user = useContext(UserContext);
  const locale = useContext(LocaleContext);
  // ...
}
```

이 경우 `MyComponent`의 Fiber 노드에는 세 개의 Context 의존성이 링크드 리스트로 연결되어 저장된다. 이렇게 하면 Context 값이 변경되었을 때 어떤 컴포넌트를 업데이트해야 하는지 효율적으로 추적할 수 있다.

`next` 필드는 컴포넌트의 Fiber 노드에 저장되는 Context 의존성들을 순서대로 연결하는 데 사용된다. 

구체적인 예시를 통해 설명해보겠다:

```jsx
function MyComponent() {
  const theme = useContext(ThemeContext);    // 첫 번째 호출
  const user = useContext(UserContext);      // 두 번째 호출
  const locale = useContext(LocaleContext);  // 세 번째 호출
  
  return <div>{/* ... */}</div>;
}
```

이 컴포넌트가 렌더링될 때 다음과 같은 과정이 일어난다:

1. 첫 번째 `useContext(ThemeContext)` 호출:
```javascript
// ThemeContext 의존성 생성
const themeContextItem = {
  context: ThemeContext,
  memoizedValue: themeValue,
  next: null
};

// Fiber 노드의 dependencies에 저장
consumer.dependencies = {
  firstContext: themeContextItem
};
lastContextDependency = themeContextItem;
```

2. 두 번째 `useContext(UserContext)` 호출:
```javascript
// UserContext 의존성 생성
const userContextItem = {
  context: UserContext,
  memoizedValue: userValue,
  next: null
};

// 이전 의존성의 next에 연결
lastContextDependency.next = userContextItem;
lastContextDependency = userContextItem;
```

3. 세 번째 `useContext(LocaleContext)` 호출:
```javascript
// LocaleContext 의존성 생성
const localeContextItem = {
  context: LocaleContext,
  memoizedValue: localeValue,
  next: null
};

// 이전 의존성의 next에 연결
lastContextDependency.next = localeContextItem;
lastContextDependency = localeContextItem;
```

최종적으로 Fiber 노드의 의존성 구조는 다음과 같다:
```
fiber.dependencies.firstContext -> ThemeContext 의존성
                              -> next -> UserContext 의존성
                                    -> next -> LocaleContext 의존성
```

이렇게 링크드 리스트로 관리하는 이유는:

1. **순서 보장**: Context 호출 순서가 중요합니다. React는 훅 호출 순서에 의존하기 때문에, Context 의존성도 같은 순서로 저장되어야 한다.

2. **효율적인 업데이트**: Context 값이 변경되었을 때, React는 이 링크드 리스트를 순회하면서 어떤 Context가 변경되었는지 확인하고, 필요한 컴포넌트만 업데이트한다.

3. **메모리 효율성**: 컴포넌트가 구독하는 Context의 수가 동적으로 변할 수 있기 때문에, 링크드 리스트는 메모리를 효율적으로 사용할 수 있다.

예를 들어, Context 값이 변경되었을 때 React는 다음과 같이 동작합니다:
```javascript
function checkIfContextChanged(dependencies) {
  let current = dependencies.firstContext;
  while (current !== null) {
    if (current.context._currentValue !== current.memoizedValue) {
      return true; // Context 값이 변경됨
    }
    current = current.next; // 다음 의존성 확인
  }
  return false;
}
```

이렇게 `next` 필드를 통해 의존성들을 연결함으로써, React는 컴포넌트가 구독하는 모든 Context를 효율적으로 관리하고 업데이트할 수 있다.
