## `React.memo`를 사용한 메모화
- 메모화(memoization)는 컴퓨터 과학에서 이전에 계산된 결과를 캐싱해 함수의 성능을 최적화하는 기법
- 메모화는 함수의 순수성을 필요로함. 함수가 주어진 입력에 동일한 출력을 예측 가능하게 반환해야함.
- 네트워크 통신 같은 부작용에 의존한다면 메모화할 수 없다는 의미임
- `React.memo` 함수에서 반환하는 새 컴포넌트는 프롭이 변경되었을 때만 다시 렌더링함. '렌더링한다'는 말은 곧 함수를 다시 호출한다는 의미
- 리액트 컴포넌트는 재조정을 위해 호출되는 함수임. 함수 컴포넌트를 프롭과 함께 재귀적으로 호출해서 가상 DOM 트리를 생성하고, 생성된 가상 DOM 트리를 기반으로 재조정에 사용되는 두 개의 파이버 트리를 만듬
- 컴포넌트에서 상태 변경이 발생하면 재조정 과정에서 하위 트리에 있는 모든 함수 컴포넌트가 다시 호출되는 것은 리액트 작동 원리의 핵심임
- 다만 `React.memo`를 감싸면, 프롭이 변경된 경우에만 해당 컴포넌트를 다시 렌더링함

### `React.memo`에 능숙해지기
- 업데이트가 발생하면 리액트는 컴포넌트를 이전 렌더링에서 반환된 가상 DOM 경과와 비교함
	- 예를들어 프롭이 변경되어 비교 결과가 다르다면, 재조정자는 엘리먼트가 호스트 환경에 이미 존재하는 경우 업데이트 효과를 실행하고, 그렇지 않은 경우 배치 효과를 실행함
	- 프롭이 동일하더라도 컴포넌트는 다시 렌더링되고, DOM도 업데이트될 수 있음
- 이때 `React.memo`를 활용하면 각 렌더링 사이에 프롭이 동일한 경우 불필요한 렌더링을 피할 수 있음
- 그렇다면 얼마나 자주 메모화 해야할까? 모든 컴포넌트를 메모화 해야하나?

### 리렌더링되는 메모화된 컴포넌트
- `React.memo`는 얕은 비교를 수행해 프롭의 변경 여부를 확인함
- 문제는 스칼라 타입은 매우 정확하게 비교할 수 있지만, 스칼라가 아닌 타입은 그렇지 않다는 점임

#### 스칼라(원시 타입)
- 기본 자료형을 의미함. 숫자, 문자열, 불리언, `Symbol`, `BigInt`, `undefined`, `null` 등이 있음

#### 스칼라가 아닌 타입(참조 타입)
- 데이터 자체가 아니라 메모리에 저장된 위치에 대한 참조 또는 포인터를 저장함
- 참조 타입을 비교할 때는 내용이나 값이 아닌 메모리 참조를 기준으로함
- 이러한 특성 때문에 `React.memo`를 사용하기 까다로울 수 있음
- `React.memo`는 프롭을 얕게 비교하기 때문에 새 배열 인스턴스를 이전 렌더링에서 사용한 배열과 다른 프롭으로 간주해 불필요하게 다시 렌더링할 수 있음
- 참조 비교에 대한 이해가 없다면 최적화는 커녕 의도하지 않은 성능 문제를 일으킬 수 있음

### 강제가 아닌 권장 사항
- 리액트는 `React.memo`를 재조정자에 대한 힌트로 사용해 컴포넌트의 프롭이 동일하게 유지되면 다시 렌더링하지 않도록 함
- `React.memo`의 동작은 부모로부터 전파되는 리렌더링을 피하기 위해 만들어졌음
- 컴포넌트 트리의 변경, 앱의 전역 상태 변경, `memo`가 적용된 함수 내부 상태 변경 등등으로 인해 메모화된 컴포넌트를 다시 렌더링할 수 있으므로 항상 리렌더링을 방지하는 것은 아님
- 아래는 리액트 소소의 일부 코드임

```jsx
function memo(type, compare) {
  return {
    $$typeof: REACT_MEMO_TYPE,
    type,
    compare: compare === undefined ? null : compare,
  }
}
```

- `React.memo`는 메모호된 컴포넌트를 나타내는 새 객체를 반환함
	- `$$typeof`: 메모화된 컴포넌트를 식별하는 속성
	- `type`: 원본 컴포넌트(함수)에 대한 참조
	- `compare`: 메모화에 사용할 비교 함수를 설정하는 속성
- [`updateMemoComponent`](https://github.com/facebook/react/blob/d91d28c8ba6fe7c96e651f82fc47c9d5481bf5f9/packages/react-reconciler/src/ReactFiberBeginWork.js#L472-L539) 라는 함수(재조정자에서 `memo`를 처리하는 함수)의 동작 방식:
	1. **초기 점검**
		- 현재 파이버, 작업 중인 파이버, 컴포넌트, 새 프롭, 업데이트의 우선순와 타이밍을 나타내는 렌더 레인 등 여러 인수를 받음
		- 초기 검사(`if (current === null)`)를 통해 현재 작업이 컴포넌트의 초기 렌더링인지 아닌지를 결정함
		- `current`가 `null`이면 컴포넌트가 처음 마운트된 것
	2. **타입 및 빠른 경로 최적화**
		- `Component.compare`와 `Component.defaultProps`를 확인해 컴포넌트가 단순 함수 컴포넌트이고 빠른 경로 업데이트가 가능한지 확인
		- 조건이 충족되면 진행 중인 파이버의 태그를 더 단순한 컴포넌트를 가리키는 `SimpleMemoComponent`로 설정
	3. **개발 모드 확인**
		- 이 함수는 개발 모드(`__DEV__`)에서 프롭 타입에 유효성 검사를 수행하고 추가 검사를 통해 사용되지 않는 기능에 경고를 표시
		- 예를 들어 함수 컴포넌트에 `defaultProps`를 설정하는 경우 경고 메시지를 표시
	4. **새로운 파이버 생성**
		- 최초 렌더링인 경우 `createFiberFromTypeAndProps`를 사용해 새 파이버를 생성
		- 이 파이버는 리액트 렌더러를 위한 작업 단위를 의미함
		- 참조를 설정하고 자식(새 파이버)를 반환함
	5. **기존 파이버 업데이트**
		- 컴포넌트가 업데이트 중(`current !== null`)인 경우 개발 모드 검사화 유사한 동작을 수행함
		- 이후 얕은 비교(`shallowEqual`) 또는 사용자 정의 비교 기능(제공된 경우)으로 이전 프롭과 새 프롭을 비교해 컴포넌트에 업데이트가 필요한지 확인
	6. **업데이트 종료**
		- 프롭이 동일하고 참조가 변경되지 않은 경우 `bailoutOnAlreadyFinishedWork`를 사용해 업데이트 작업에서 벗어날 수 있음
		- 작업에서 벗어난 컴포넌트에는 렌더링 작업을 더 진행하지 않음
	7. **작업용 파이버 업데이트**
		- 업데이트가 필요한 경우 작업용 파이버에 `PerformedWork` 플래그를 설정
		- 그리고 현재 자식을 기반으로 하되 새로운 프롭이 포함된 새로운 작업용 자식 파이버를 생성
- `updateMemoComponent` 요약:
	- 메모화된 컴포넌트(`React.memo`로 래핑된 컴포넌트)를 업데이트해야 하는지 아니면 성능 최적화를 위해 업데이트를 건너뛸 수 있는지 판단하는 역할
	- 최초 렌더링과 업데이트를 모두 처리, 새 파이버를 생성해야 하는지 아니면 기존 파이버를 업데이트해야 하는지에 따라 다른 작업을 수행함
	- 아래는 함수의 각 부분에 대한 설명. `React.memo` 컴포넌트가 리렌더링 되는 조건과 그렇지 않은 조건에 대해 알 수있음:
		- **이전 렌더링 없음(최초 마운트)**
			- `current === null`인 경우 컴포넌트가 처음 마운트되는 것이므로 렌더링을 건너뛸 수 없음
		- **단순 함수 컴포넌트 최적화**
			- 컴포넌트가 (기본 프롭이 없고 사용자 정의 비교 함수가 없는) 단순 함수인 경우 `SimpleMemoComponent`로 최적화
			- 프롭 외의 의존성은 없다고 가정하고 얕은 비교만으로 업데이트 여부를 결정할 수 있으며, 업데이트에 빠른 경로를 사용할 수 있음
		- **비교 함수**
			- 이전 렌더링이 있는 경우 비교 함수가 `false`를 반환할 때만 컴포넌트가 업데이트됨
			- 이 비교 함수는 사용자가 설정할 수 있으며, 기본값으로 얕은 비교(`shallowEqual`)가 사용됨
			- 비교 함수가 새 프롭이 이전 프롭과 동등하며 `ref`가 동일하다고 판단하면, 컴포넌트는 다시 렌더링되지 않으며 함수는 렌더링 프로세스에서 벗어남
		- **개발 모드에서 기본 프롭과 프롭 타입**
			- 개발 모드(`__DEV__`) 에서는 `defaultProps`와 `propTypes`에 검사를 수행
			- 향후 버전의 리액트는 함수 컴포넌트에서 `defaultProps`를 더 이상 지원하지 않을 계획이기 때문에 `defaultProps`를 사용하면 개발 모드에서 경고 메시지가 나타남
			- `propTypes`에 대한 검사는 유효성을 확인하기 위해 실행됨
		- **빠른 종료 조건**
			- 예정된 업데이트 또는 콘텍스트 변경이 없는 경우(`hasScheduledUpdateOrContext가 false`), 비교 함수는 이전 프롭과 새 프롭이 동일하다고 간주하고 `ref`가 변경되지 않으면 `bailoutOnAlreadyFinishedWork` 결과를 반환해 리렌더링을 효과적으로 생략
			- 예정된 컨텍스트 업데이트가 있는 경우 프롭이 변경되지 않았더라더 컴포넌트를 다시 리렌더링. 콘텍스트 업데이트가 컴포넌트 프롭의 범위 바깥에 있는 것으로 간주되기 때문
			- 상태 변경, 콘텍스트 변경, 예정된 업데이트도 모두 렌더링을 일으킬 수 있음

> [!Note] QnA:
> - [[🤔 ref는 객체 참조인가요, 다른 의미인가요?]]
> - [[🤔 hasScheduledUpdateOrContext의 '콘텍스트'는 createContext가 맞나요?]]
> - [[🤔 "콘텍스트 업데이트가 프롭의 범위 바깥에 있다"는 말의 의미]]
## 5.2 `useMemo`를 사용한 메모화
- `React.memo`와 `useMemo` 모두 메모화를 위한 도구지만 용도가 매우 다름
- `React.memo`는 전체 컴포넌트를 메모화해 렌더링을 최적화
- `useMemo`는 컴포넌트 내부의 특정 계산을 메모화해 재계산을 피하교 결과에 대한 일관된 참조를 유지함
### `useMemo`의 나쁜 사례
- `useMemo`는 계산 비용이 많이 드는 연산을 메모화하거나 객체와 배열에 대한 안정적인 참조를 유지하는데 특히 유용함. 스칼라 값은 대체로 `useMemo`를 사용할 필요가 없음
- 아래 컴포넌트에서 `onClick` 핸들러가 렌더링 마다 다시 생성되는데 정말 문제가 될까?

```tsx
const MyComponent = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>카운트: {count}</p>
      <p>2x 카운트: {count * 2}</p>
      <button onClick={() => setCount((oldCount) => oldCount + 1)}>
        증가
      </button>
    </div>
  );
};
```

- 일각에서는 `onClick` 핸들러를 `useCallback`으로 메모화해야 한다고 말함
- `<button>` 은 브라우저 네이티브 엘리먼트이므로, `onClick` 함수를 메모화 해서 얻는 이점이 없음(네이티브 이기 때문에 리렌더링의 대상이 아님). 게다가 이 버튼 엘리먼트에는 자식 컴포넌트도 없음.
- 리액트에서 내장 컴포넌트 또는 '호스트'컴포넌트 (`div`, `button`, `input` 등)는 함수 프롭등의 프롭을 사용자 정의 컴포넌트와 조금 다르게 취급함
	- **직접 전달**
		- 함수 프롭(`onClick` 등)을 내장 컴포넌트에 전달하면, 리액트는 이를 실제 `DOM`에 직접 전달함. 이러한 함수에 래퍼 생성 등의 추가 작업을 수행하지 않음
		- 특히 `onClick` 같은 이벤트 기반 프롭의 경우, 리액트는 이벤트 핸들러를 `DOM` 엘리먼트에 직접 추가하는 대신 이벤트 위임을 사용해 이벤트를 처리함
		- 다시 말해 `onClick` 핸들러를 `<button>` 같은 내장 컴포넌트에 설정하면, 최상위 수준에 한 개의 이벤트 리스너를 추가하고 여기서 모든 이벤트를 수신함
		- 최상위 이벤트 리스너는 문서의 루트에 첨부되며, 이벤트 버블링을 사용해 개별 엘리먼트에서 발생하는 이벤트를 포착
	- **렌더링 동작**
		- 내장 컴포넌트는 리렌더링된 상위 컴포넌트의 일부가 아니라면, 함수 프롭의 변경에 의해서 리렌더링되지 않음
		- 예를들어 부모 컴포넌트가 리렌더링해서 내장 컴포는트에 새로운 함수를 프롭으로 전달하는 경우, 내장 컴포넌트는 프롭이 변경되었기 때문에 리렌더링됨
		- 그러나 이때의 리렌더링은 일반적으로 빠르기 때문에, 성능에 문제가 된다고 판명되지 않는 한 최적화할 필요가 없음
	- **함수에 대한 가상 DOM 비교하지 않음**
		- 내장 컴포넌트에 대한 가상 DOM 비교는 함수 프롭의 동일성을 기반으로 함
		- 인라인 함수(`onClick={() => domSomething()}`)를 전달하면 컴포넌트가 렌더링될 때마다 새로운 함수가 되지만, 리액트는 변경 사항을 감지하기 위해 함수에 대한 깊은 비교를 수행하지 않음. 단순히 새 함수는 DOM 엘리먼트에 설정된 기존 함수를 대체하게 되며, 덕분에 내장 컴포넌트에서 성능을 절약하게 됨
	- **이벤트 풀링**
		- 리액트는 이벤트 핸들러에 이벤트 풀링을 사용해 메모리 부하를 줄임
		- 이벤트 핸들러에 전달되는 이벤트 객체는 풀링된 합성 이벤트인데, 여러 이벤트 핸들러에 재사용됨으로써 가비지 컬렉션 부하를 줄임

- 사용자 정의 컴포넌트의 경우, 새 함수를 메모화없이 프롭으로 전달하면 리렌더링 문제가 발생할 수 있음
- 그러나 내장 컴포넌트라면 대부분의 경우 메모화로 이득 없이 부하만 추가됨
- `useCallback`의 좋은 사용 사례는 무엇일까?
- `useCallback`은 자주 리렌더링할 가능성이 있는 컴포넌트가 있고, 하위 컴포넌트에 콜백을 전달할 때, 특히 하위 컴포넌트가 `React.memo` 또는 `shouldComponentUpdate`로 최적화된 경우 매우 유용함

### 모두 잊고 포겟하세요
- 리액트 컴파일러는 리액트 애플리케이션에 메모화를 자동화하기 위한 새로운 도구
- 리액트 컴파일러는 리액트 리렌더링 동작의 객체 동일성 비교를 깊은 비교 없는 시맨틱 값 비교로 변환해 성능을 향상시킴
- `React Conf 2021`에서 `React Forget`의 이름으로 소개되었으며, 내부적으로 '기대 이상의 성과'를 거두고 있음

## 지연 로딩
- `lazy` 함수와 `Suspense`를 사용해 동적으로 필요할 때 모듈을 불러올 수 있음
- `Suspense`는 프라미스가 해결되기 전까지, 폴백 컴포넌트를 표시할 수 있는 컴포넌트

### `Suspense`를 통한 더 나은 UI 제어
- `Suspense`는 `try/catch` 블록처럼 작동함
- `Suspense`로 감싼 컴포넌트 트리 어디든 지연 로드되고 비동기로 읽어들이는 요소를 두면, `Suspense`의 폴백이 보여짐

## `useState`와 `useReducer`
- 리액트에는 상태 관리를 위한 두 개의 훅으로 `useState`와 `useReducer`가 있음
- 이 둘은 모두 컴포넌트의 상태를 관리하는 데 사용함
- `useState`는 단일 상태를 관리하는데 적합하고, `useReducer`는 복잡한 상태를 관리한다는 점에서 다름

```jsx
const MyComponent = () => {
  const [state, setState] = useState({
    count: 0,
    name: "Tejumma",
    age: 30,
  });
  
  return (
	// ... 다른 UI 요소들
    <button onClick={() => setState({ ...state, count: state.count + 1 })}>
      증가
    </button>
  )
}
```

- 위에서는 `count`, `name`, `age` 라는 속성이 있음. 버튼을 클릭하면 `count`를 증가시킴
- 자세히 보면 이전 상태와 속성이 같은 **새로운 객체**로 생성하되 `count`를 1 만큼 증가시킨 것임
- 매우 일반적인 패턴이지만 버그가 발생할 가능성이 높다는 문제가 있음. 이전 상태를 주의 깊게 전개하지 않으면 실수로 상태의 일부 속성을 덮어쓸 수 있음
- 재밌는 사실은 `useState`가 내부적으로 `useReducer`를 사용한다는 점임
- `useState`는 `useReducer`의 상위 추상화라고 볼 수 있음
- `useState` 대신 `useReducer`를 사용해도 된다는 의미임. 아래처럼 작성 할 수 있음

```jsx
function useState(initialState) {
  const [state, dispatch] = useReducer(
    (state, newValue) => newValue,
    initialState
  );
  
  return [state, dispatch];
}
```

- 첫 예시를 `useReducer`로 아래와 같이 구현할 수 있음

```jsx
const initialState = {
  count: 0,
  name: "Tejumma",
  age: 30,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + 1 };
    default:
      return state;
  }
};

const MyComponent = () => {
  const [state, dispatch] = reducer, initialState);
  
  return (
    // ... 다른 UI 요소들
    <button onClick={() => dispatch({ type: "increment" })}>
      증가
    </button>
  );
};
```

- `useReducer`가 `useState` 보다 장황하다고 말하는 이도 있고, 이 말에 많은 사람이 동의하겠지만, 추상화 계층에서 한 단계 아래로 내려갈수록 코드가 장황해지는 것은 당연함
- `useState`로 `useReducer`와 동일한 작업을 수행할 수 있으니 더 간단한 `useState`만 사용해도 되지 않나? 하는 질문에 `useReducer`를 사용할 때 얻는 이점 세가지를 알려줌
	- 상태 업데이트 로직을 컴포넌트에서 분리할 수 있음. `reducer` 함수는 단독으로 테스트하고 다른 컴포넌트에서도 재사용이 가능함. 이 방법은 컴포넌트를 깔끔하고 단순하게 유지하고 **단일 책임 원칙**을 따르기에 좋음
	- 상태와 상태 변경은 항상 명시적으로 `useReducer`와 함께 사용됨. 어떤 이들은 `useState`가 `JSX` 트리 계층을 통한 컴포넌트 상태 업데이트의 전반적인 흐름을 파악하기 어렵게 만든다고 주장하기도 함
	- `useReducer`는 **이벤트 소스** 모델임. 즉, 애플리케이션에서 발생하는 이벤트를 모델링해서 일종의 진단 로그를 추적하는데 사용할 수 있다는 의미.
- `useReducer`는 도구 상자에 담아 두면 좋지만 항상 필요하지는 않음. 대부분의 사용 사례에서 지나친 경우가 많음.

> [!Note] QnA
> - [[🤔 "상태와 상태 변경은 명시적으로 `useReducer`와 함께 사용됨" 이라는 말의 의미]]
> - [[🤔 `useState`가 왜 상태 업데이트 흐름을 파악하기 어렵게 만드나?]]

### `Immer`와 편의성
- `Immer`는 복잡한 상태 관리를 처리할 때 유용함
- 상태가 중첩되거나 복잡한 형태라면, 기존에 사용하던 상태 업데이트 방식은 장황하고 오류가 발생하기 쉬움
- `Immer`는 변경 가능한 초안 상태로 작업하고, 한 번 생성된 상태는 변경 불가로 만들어 복잡성을 관리할 수 있도록 도와줌
- `useState`는 단순한 상태에 적합하고 `useReducer`는 복잡한 상태 관리에 적합한데, 복잡한 상태 관리야말로 `Immer`가 가장 빛을 발하는 부분임
- `useReducer`로 작업할 때 제공하는 리듀서 함수는 항상 순수해야 하며, 항상 새 상태 객체를 반환해야함. 하지만 `use-immer`라이버ㄹ리의 `useImmerReducer`를 사용해 `Immer`와 `useReducer`를 통합하면, 더 단순하고 직관적인 리듀서 함수를 작성할 수 있음

```jsx
const initialState = {
  user: {
    name: "John Doe",
    age: 28,
    address: {
      city: "New York",
      country: "USA",
    },
  },
};

const reducer = (draft, action) => {
  switch (action.type) {
    case "updateName":
      draft.user.name = action.payload;
      break;
    case "updateCity":
      draft.user.address.city = action.payload;
      break;
    default:
      break;
  }
};

const MyComponent = () => {
  const [state, dispatch] = useImmerReducer(reducer, initialState);
  
  // ...
};
```

- 이처럼 `Immer` 를 사용해 중첩 객체에 대한 상태 변경 로직을 단순화 할 수 있음
- `produce` 함수를 사용해서 `useState`에서도 사용할 수 있음

```jsx
const MyComponent = () => {
  const [state, setState] = useState(initialState);
  
  const updateName = (nweName) => {
    setState(
      produce((draft) => {
        draft.user.name = newName;
      })
    );
  };
  // ...
};
```

## 강력한 패턴
- 디자인 패턴은 소프트웨어 개발에서 반복되는 문제에 주로 사용되는 해결책
- 디자인 패턴은 여러 이유로 중요함
	- **재사용성**
		- 흔히 겪는 문제에 대한 재사용 가능한 해결책을 제공해 소프트웨어 개발 시간과 노력을 절약할 수 있음
	- **표준화**
		- 문제를 해결하는 표준 방법을 제공해 개발자끼리 서로 더 잘 이해하고 소통할 수 있음
	- **유지 보수성**
		- 유지 보수 및  수정이 쉬운 코드로 구조화하는 방법을 지원해 소프트웨어 시스템의 수명을 향상시킬 수 있음
	- **효율성**
		- 일반적인 문제에 효율적인 해결책을 제공해 소프트웨어 시스템의 성능을 개선할 수 있음
- 어떤 패턴이 다른 패턴에 비해 근본적으로 더 좋거나 나쁘지 않고 각자 나름의 역할이 있음
- 대부분의 패턴은 이상적인 추상화 수준을 도출해 내는 데 유용함
- 가독성이 덜어지거나 유지 보수가 불가능할 정도로 상태와 설정이 과도하게 증가하는 것을 방지하고, 대신 오래도록 잘 유지되게 코드를 작성하는 법을 찾는 데 도움이 됨
- 이 때문에 디자인 패턴을 선택할 때 대체로 제어(control)를 고려하게 됨

### 프레젠테이션/컨테이너 컴포넌트
- 프레젠테이션 컴포넌트는 UI를 렌더링하고, 컨테이너 컴포넌트는 UI의 상태를 처리함

```jsx
const PresentationalCounter = (props) => {
  return (
    <section>
      <button onClick={props.increment}>+</button>
      <button onClick={props.decrement}>-</button>
      <button onClick={props.reset}>재설정</button>
      <h1>현재 카운트: {props.count}</h1>
    </section>
  );
};

const ContainerCounter = () => {
  const [count, setCount] = useState(0);
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);
  
  return (
    <PresentationalCounter
      count={count}
      increment={increment}
      decrement={decrement}
      reset={reset}
    />
  );
};
```

- 이 패턴은 단일 책임 원칙 때문에 매우 유용하며, 애플리케이션에서 관심사를 분리해 모듈화, 재사용, 테스트를 가능케 함으로써 더 나은 확장을 실현함
- 다만 요즘은 훅으로 대체할 수 있음

### 고차 컴포넌트
- `JSX` 세계에서 고차 컴포넌트는 다른 컴포넌트를 인수로 받아 두 컴포넌트의 합성 결과인 새로운 컴포넌트를 반환하는 컴포넌트임
- 고차 컴포넌트는 **여러 컴포넌트에서 공유하는 동작을 반복 작성하고 싶지 않을 때** 유용함
- 아래와 같은 `withAsync` 고차 컴포넌트가 있다면 비동기 상태 관리를 아주 간편하게 할 수 있음

```jsx
const withAsync = (Component) => (props) => {
  if (props.loading) {
    return "로딩 중...";
  }
  
  if (props.error) {
      return error.message;
   }

  return (
    <Component
      {...props}
    />
  );
};
```

- 이제 `Component`가 `withAsync`에 전달되면, 프롭에 따라 적절한 렌더링을 진행함

### 렌더 프롭
- 컴포넌트의 상태를 전달받는 함수를 프롭으로 사용하는 패턴

```jsx
<WindowSize
  render={({ width, height }) => (
   <div>
     창 크기: {width} x {height}px
   </div>
  )}
/>

const WindowSize = (props) => {
  const [size, setSize] = useState({ width: -1, height: -1 });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handlerResize);
  }, []);
  
  return props.render(size);
};
```


- `WindowSize`는 이벤트 리스너를 사용해 크기가 조정될 때마다 상태에 일부 데이터를 저장하지만 이 컴포넌트 자체는 헤드리스
- UI를 표현하는 방법을 명시하지 않고, 자신을 렌더링하는 부모 컴포넌트로부터 전달받은 **렌더 프롭**을 호출해 렌더링 작업에 대한 제어를 부모에게 넘겨 제어를 역전함
- 다만 이제는 훅으로 대체되었음

### 자식 함수
- `render` 프롭의 이름을 아예 삭제하고 `children`만 사용하는 것도 선호하는 사람도 있음

```jsx
<WindowSize>
  {({ width, height }) => (
    <div>
      창 크기: {width}x{height}px
    </div>
  )}
</WindowSize>
```

- 이도 마찬가지로 훅 등장 이후로 잘 사용되는 패턴은 아님

### 제어 프롭
- 제어 프롭 패턴은 상태 관리에 대한 전략적 접근 방식으로, 제어 컴포넌트의 개념을 확장한것
- 제어 컴포넌트는 내부에 자체 상태를 유지하지 않는 컴포넌트
- 이들의 현재값은 부모 컴포넌트에서 전달한 프롭에 의해 결정되며 부모 컴포넌트가 단일 정보 출처의 역할을 함
- 상태를 관리하고 제어 컴포넌트의 값을 업데이트하는 책임은 모두 부모 컴포넌트에 있게 됨
- 아래의 `<input>` 태그는 제어 컴포넌트임

```jsx
function Form() {
  const [inputValue, setInputValue] = React.useState("");
  
  return <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
}
```

- 제어 프롭 패턴은 제어 컴포넌트의 원리를 확장함. 컴포넌트는 외부에서 프롭으로 제어될 수도 있고 내부적으로 자체 상태를 관리하면서 선택적으로 외부 제어를 가능하게 함
- 이 패턴을 따르는 컴포넌트는 **상탯값** 그리고 **상태를 업데이트하는 함수 두 가지**를 프롭으로 받음
- 아래는 토글 버튼 예제임

```jsx
function Toggle({ on, onToggle }) {
  // 1. 내부 상태는 비제어 모드를 위해 항상 존재
  const [isOn, setIsOn] = useState(false);

  // 2. '제어 모드'인지 명확히 변수로 확인
  const isControlled = on !== undefined;

  // 3. 실제 화면에 표시되고, 다음 상태를 결정할 기준이 되는 현재 값
  const currentValue = isControlled ? on : isOn;

  const handleToggle = () => {
    // 4. 다음 상태는 언제나 현재 값의 반대
    const nextState = !currentValue;

    // 5. 비제어 모드일 때만 내부 상태를 직접 업데이트
    if (!isControlled) {
      setIsOn(nextState);
    }

    // 6. onToggle 콜백이 있다면 항상 호출해서 상태 변경을 알림
    if (onToggle) {
      onToggle(nextState);
    }
  };

  return <button onClick={handleToggle}>
    {currentValue ? "On" : "Off"}
  </button>;
}
```

> [!Note] 알면 좋을 내용
> [[Tanstack Table의 제어-비제어 철학]]

### 프롭 컬렉션
- 여러 개의 프롭을 함께 묶어야 하는 경우도 이따금 발생함
- 드래그 앤 드롭 기능에는 다양한 프롭이 필요함
	- `onDragStart`: 드래그를 시작할 때
	- `onDragOver`: 드롭존을 식별할 때
	- `onDrop`: 드롭했을 때
	- `onDragEnd`: 드래그가 완료 되었을 때
- 기본적으로 데이터나 엘리멘트는 다른 엘리먼트에 드롭할 수 없음
- 한 엘리먼트를 드래그해서 다른 엘리먼트에 드래그 하려면 엘리먼트에서 기본 동작을 방지하도록 해야함
- 이 작업을 위해서는 드롭존에 발생한 `onDragOver` 이벤트의 핸들러에서 `event.preventDefault`를 실행해야함

> [!Note] 참고
> [[DropZone에서 발생한 onDrag에서 preventDefault를 호출해야 하는 이유]]

- 즉 위 프롭의 집합들은 대부분 함께 사용하며 `onDragOver`의 기본값은 일반적으로 `event => { event.prevetDefault(); moreStuff(); }` 이므로 이러한 프롭을 한데 모아두면 다양한 컴포넌트에서 재사용할 수 있음

```js
export const droppableProps = {
  onDragOver: (event) => {
    event.preventDefault();
  },
  onDrop: (event) => {},
};

export const draggableProps = {
  onDragStart: (event) => {},
  onDragEnd: (event) => {},
}
```

- 드롭존으로 동작할 리액트 컴포넌트에는 아래와 같이 사용할 수 있음

```jsx
<Dropzone {...droppableProps} />
```

> [!Note] 참고
> [[그래서 DropZone의 역할은?]]

- 아래처럼 프롭 컬렉션을 덮어 씌우면 프롭 컬렉션의 함수에서 제공한 `event.preventDefault` 호출이 사라질 수 있음

```jsx
<Dropzone
  {...drappableProps}
  onDragOver={() => {
    alert("Dragged");
  }}
/>
```

### 프롭 게터
- 프롭 게터는 사용자 정의 프롭을 프롭 컬렉션에 조합하고 병합함
- `droppableProps` 컬렉션을 우선 프롭 게터로 변경함

```js
export const getDroppableProps = () => {
  return {
    onDragOvewr: (event) => {
      event.preventDefault();
    },
    onDrop: (event) => {},
  };
};
```

- 아래와 같은 조합 함수를 만들어 사용할 수 있음

```js
const compose = 
  (...functions) => 
  (...args) =>
    functions.forEach((fn) => fn?.(...args));

export const getDrappableProps = ({
  onDragOver: replacementOnDragOver,
  ...replacementProps
}) => {
  const defaultOnDragOver = (event) => {
    event.preventDefault();
  };
  
  return {
    onDragOver: compose(replacementOnDragOver, defaultOnDragOver),
    onDrop: (event) => {},
    ...replacementProps,
  };
};
```

- 이를 게터 패턴 이라고 함
### 복합 컴포넌트
- 복합 컴포넌트는 서로 연결되고 상태를 공유하면서도 독립적으로 렌더링되는 컴포넌트를 한데 묶어 엘리먼트 트리를 더 세밀하게 제어하게 해줌
- `Context API` 혹은 `createElement`를 사용해 구현할 수 있음

### 상태 리듀서
- 외부에서 `reducer` 상태를 제어할 수 있도록 하는 패턴