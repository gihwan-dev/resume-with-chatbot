```tsx
export function createContext<T>(defaultValue: T): ReactContext<T> {
  // TODO: 두 번째 인자로 사용되던 선택적 'calculateChangedBits' 함수에 대한 경고를 
  // 미래 사용을 위해 예약해두어야 할까?

  const context: ReactContext<T> = {
    $$typeof: REACT_CONTEXT_TYPE,
    // 여러 동시 렌더러를 지원하기 위한 해결책으로,
    // 일부 렌더러를 primary(주)로, 나머지를 secondary(부)로 분류합니다.
    // 최대 두 개의 동시 렌더러만 예상됩니다:
    // - React Native(주)와 Fabric(부)
    // - React DOM(주)와 React ART(부)
    // 부 렌더러들은 context 값을 별도의 필드에 저장합니다.
    _currentValue: defaultValue,
    _currentValue2: defaultValue,
    // 단일 렌더러 내에서 현재 context가 지원하는 동시 렌더러 수를 추적합니다.
    // 예: 병렬 서버 렌더링
    _threadCount: 0,
    // 순환 참조를 위한 필드들
    Provider: (null: any),
    Consumer: (null: any),
  };

  if (enableRenderableContext) {
    context.Provider = context;
    context.Consumer = {
      $$typeof: REACT_CONSUMER_TYPE,
      _context: context,
    };
  } else {
    (context: any).Provider = {
      $$typeof: REACT_PROVIDER_TYPE,
      _context: context,
    };
    (context: any).Consumer = context;
  }
  
  return context;
}
```

주요 포인트:
1. Context는 여러 렌더러(예: React Native와 Fabric)를 동시에 지원하기 위해 설계되었습니다.
2. 각 렌더러는 primary(주) 또는 secondary(부)로 분류됩니다.
3. 부 렌더러는 context 값을 별도의 필드(_currentValue2)에 저장합니다.
4. _threadCount는 병렬 렌더링을 지원하기 위한 추적 메커니즘입니다.

[[enableRenderableContext]] 플래그의 역할과 의미: