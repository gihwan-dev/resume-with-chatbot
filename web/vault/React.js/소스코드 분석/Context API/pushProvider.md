```tsx
export function pushProvider<T>(
  providerFiber: Fiber,
  context: ReactContext<T>,
  nextValue: T,
): void {
  if (isPrimaryRenderer) {
    push(valueCursor, context._currentValue, providerFiber);
    context._currentValue = nextValue;
  } else {
    push(valueCursor, context._currentValue2, providerFiber);
    context._currentValue2 = nextValue;
  }
}
```
## 함수의 목적
`pushProvider`는 Context Provider 컴포넌트가 새로운 값을 설정할 때 호출되는 내부 함수다. 이는 React의 Context 시스템에서 Provider의 값을 스택에 저장하고 새로운 값을 설정하는 역할을 한다.
## 파라미터
```typescript
pushProvider<T>(
  providerFiber: Fiber,    // Provider 컴포넌트의 Fiber 노드
  context: ReactContext<T>, // Context 객체
  nextValue: T,            // 설정할 새로운 값
): void
```
## 주요 동작
1. **렌더러 구분**
   - `isPrimaryRenderer` 플래그를 통해 현재 렌더러가 주 렌더러인지 확인한다.
   - React는 때때로 여러 렌더러를 사용할 수 있다 (예: 서버 사이드 렌더링).
2. **값 저장 및 업데이트**
   - 주 렌더러인 경우:
```typescript
push(valueCursor, context._currentValue, providerFiber);
context._currentValue = nextValue;
```
   - 보조 렌더러인 경우:
```typescript
push(valueCursor, context._currentValue2, providerFiber);
context._currentValue2 = nextValue;
```
## 작동 방식
1. **스택 기반 관리**
   - [[push]] 함수를 사용하여 이전 값을 스택에 저장한다.
   - 이는 Provider가 중첩되어 있을 때 이전 값을 보존하기 위함이다.
2. **값 업데이트**
   - 현재 Context의 값을 새로운 값으로 업데이트한다.
   - 이는 Consumer 컴포넌트들이 새로운 값을 받을 수 있게 한다.
## 1. 스택의 기본 구조

React는 `ReactFiberStack.js`에서 스택 관리의 기본 구조를 정의한다:

```typescript
const valueStack: Array<any> = [];
let fiberStack: Array<Fiber | null>;
let index = -1;
```

이 구조는 다음과 같은 특징을 가진다:
- `valueStack`: 실제 값들을 저장하는 배열
- `fiberStack`: 각 값에 해당하는 Fiber 노드를 저장하는 배열 (개발 모드에서만 사용)
- `index`: 현재 스택의 위치를 추적하는 인덱스
## 2. 스택 조작 함수들
### push 함수
```typescript
function push<T>(cursor: StackCursor<T>, value: T, fiber: Fiber): void {
  index++;
  valueStack[index] = cursor.current;
  if (__DEV__) {
    fiberStack[index] = fiber;
  }
  cursor.current = value;
}
```
### pop 함수
```typescript
function pop<T>(cursor: StackCursor<T>, fiber: Fiber): void {
  if (index < 0) {
    if (__DEV__) {
      console.error('Unexpected pop.');
    }
    return;
  }
  cursor.current = valueStack[index];
  valueStack[index] = null;
  if (__DEV__) {
    fiberStack[index] = null;
  }
  index--;
}
```
## 3. Context Provider에서의 스택 사용
`pushProvider` 함수에서 스택이 어떻게 사용되는지 살펴보겠다:
```typescript
export function pushProvider<T>(
  providerFiber: Fiber,
  context: ReactContext<T>,
  nextValue: T,
): void {
  if (isPrimaryRenderer) {
    push(valueCursor, context._currentValue, providerFiber);
    context._currentValue = nextValue;
  } else {
    push(valueCursor, context._currentValue2, providerFiber);
    context._currentValue2 = nextValue;
  }
}
```

이 과정은 다음과 같이 작동한다:
1. **스택에 이전 값 저장**
   - 현재 Context의 값을 스택에 저장다.
   - `isPrimaryRenderer`에 따라 `_currentValue` 또는 `_currentValue2`를 사용한다.

2. **새로운 값 설정**
   - Context의 현재 값을 새로운 값으로 업데이트한다.

3. **스택 복원**
   - Provider가 언마운트되거나 업데이트가 완료되면 `popProvider`가 호출되어 스택에서 이전 값을 복원한다.

## 4. 실제 사용 예시
```jsx
// 예시 코드
const MyContext = React.createContext();

function App() {
  return (
    <MyContext.Provider value="first">
      <MyContext.Provider value="second">
        <Child />
      </MyContext.Provider>
    </MyContext.Provider>
  );
}
```

이 코드가 실행될 때 스택은 다음과 같이 동작한다:

1. 첫 번째 Provider 렌더링:
   - 스택에 `null` 저장 (초기값)
   - `_currentValue`를 "first"로 설정

2. 두 번째 Provider 렌더링:
   - 스택에 "first" 저장
   - `_currentValue`를 "second"로 설정

3. 언마운트 시:
   - 스택에서 "first" 복원
   - `_currentValue`를 "first"로 복원
   - 스택에서 `null` 복원
   - `_currentValue`를 `null`로 복원

이러한 스택 기반의 관리 방식은 다음과 같은 이점을 제공한다:

1. **중첩된 Context 처리**: 여러 Provider가 중첩되어 있을 때 각각의 값을 올바르게 관리할 수 있다.
2. **렌더링 최적화**: 불필요한 리렌더링을 방지할 수 있다.
3. **메모리 관리**: Provider가 언마운트될 때 이전 상태를 정확하게 복원할 수 있다.
4. **디버깅 용이성**: 개발 모드에서 Fiber 노드와 함께 스택을 추적할 수 있다.
