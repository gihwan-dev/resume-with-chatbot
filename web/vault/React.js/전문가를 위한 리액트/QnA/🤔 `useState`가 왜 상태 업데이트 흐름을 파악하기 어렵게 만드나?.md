
이 주장 역시 간단한 컴포넌트에서는 잘 와닿지 않습니다. 오히려 `setCount(count + 1)`이 훨씬 직관적이고 예측하기 쉽죠. 하지만 **상태가 복잡해지고 여러 상태가 서로 얽히기 시작하면** 얘기가 달라집니다.

`useState`가 흐름 파악을 어렵게 만든다고 주장하는 이유는 **상태 업데이트 로직이 컴포넌트 곳곳에 흩어질 수 있기 때문**입니다.

간단한 예시를 들어보겠습니다. "데이터를 불러오는" 로직이 있다고 상상해 보세요.

#### `useState`를 사용하는 경우
하나의 기능을 위해 3개의 상태가 필요합니다.
```JavaScript
function DataFetcher() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true); // 1. 로딩 시작
    setError(null);     // 2. 에러 상태 초기화

    try {
      const response = await api.fetch();
      setData(response.data); // 3. 성공 시 데이터 설정
    } catch (e) {
      setError(e);          // 4. 실패 시 에러 설정
    } finally {
      setIsLoading(false);  // 5. 로딩 종료
    }
  };

  // ...
}
```

`fetchData`라는 하나의 로직 흐름을 이해하기 위해 `setIsLoading`, `setError`, `setData` 등 여러 `set` 함수 호출을 순서대로 따라가야 합니다. 만약 컴포넌트가 더 복잡해져서 다른 `useEffect`나 콜백 함수에서도 이 상태들을 변경한다면, 전체적인 흐름을 추적하기가 점점 더 어려워집니다.

#### `useReducer`를 사용하는 경우
상태 업데이트 로직이 `reducer` 한 곳에 모여 있습니다.

```JavaScript
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
};

function DataFetcher() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchData = async () => {
    dispatch({ type: 'FETCH_START' }); // "불러오기 시작"

    try {
      const response = await api.fetch();
      dispatch({ type: 'FETCH_SUCCESS', payload: response.data }); // "성공"
    } catch (e) {
      dispatch({ type: 'FETCH_ERROR', payload: e }); // "실패"
    }
  };

  // ...
}
```

`fetchData` 함수는 이제 **"무슨 일이 일어났는지"**만 `dispatch`를 통해 알립니다. 실제 상태가 어떻게 변하는지는 `reducer` 함수만 보면 한눈에 파악할 수 있습니다. `FETCH_START` 액션이 일어나면 `isLoading`과 `error`가 어떻게 변하는지, `FETCH_SUCCESS`가 일어나면 `isLoading`과 `data`가 어떻게 변하는지 모든 규칙이 한곳에 정의되어 있죠.

💡 **결론적으로,** `useState`는 상태 변경 로직이 **사용되는 곳(event handler, useEffect 등)**에 흩어져 있고, `useReducer`는 상태 변경 로직이 **한 곳(`reducer` 함수)**에 모여 있습니다. 컴포넌트가 복잡해질수록 로직이 흩어져 있는 `useState` 방식이 전체적인 상태 변경 흐름을 파악하기 어렵게 만들 수 있다는 것이 이런 주장의 핵심 근거입니다.