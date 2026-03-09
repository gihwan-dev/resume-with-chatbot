# React Context 동작방식과 valueStack 정리

## Context API 기본 개념

React의 Context API는 컴포넌트 트리를 통해 데이터를 명시적인 props 전달 없이 공유할 수 있게 해주는 메커니즘입니다.

- **Context 객체 생성**: `React.createContext(defaultValue)`로 Context 객체를 생성합니다.
- **Provider**: Context 값을 제공하는 컴포넌트입니다.
- **Consumer/useContext**: Context 값을 소비하는 방법입니다.

## valueStack의 개념과 역할

valueStack은 React 내부에서 Context 값을 관리하는 데이터 구조입니다:

1. **정의**: 각 Context 타입마다 존재하는 스택 구조로, Context 값들을 계층적으로 관리합니다.
    
2. **목적**: 컴포넌트 트리에서 특정 위치에 있는 컴포넌트가 접근해야 할 올바른 Context 값을 결정합니다.
    
3. **구조**: 스택 형태로 중첩된 Provider의 값들을 저장합니다. 가장 가까운(내부) Provider의 값이 스택의 최상단에 위치합니다.
    

## valueStack의 생명주기

valueStack의 값은 컴포넌트 생명주기에 따라 관리됩니다:

1. **마운트 단계**:
    
    - Provider 컴포넌트가 마운트될 때 해당 Context 값이 valueStack에 push됩니다.
    - 이 시점에서 해당 Provider의 자식 컴포넌트들은 이 새로운 값에 접근할 수 있게 됩니다.
2. **업데이트 단계**:
    
    - Provider의 값이 변경되면 valueStack의 해당 entry가 직접 업데이트됩니다.
    - pop 후 새 값을 push하는 방식이 아니라, 스택의 해당 위치에서 값이 갱신됩니다.
    - 이 업데이트는 해당 Provider를 구독하는 모든 컴포넌트의 리렌더링을 트리거할 수 있습니다.
3. **언마운트 단계**:
    
    - Provider 컴포넌트가 언마운트될 때 해당 값이 valueStack에서 제거(pop)됩니다.
    - 이후 해당 위치의 컴포넌트들은 상위 레벨의 Provider 값이나 defaultValue에 접근하게 됩니다.

## 중첩된 Provider 처리

동일한 Context에 대해 여러 Provider가 중첩될 때:

1. **스택 구조**: 각 Provider는 자신의 값을 valueStack에 추가합니다. 이는 컴포넌트 트리 구조를 반영합니다.
    
2. **값 검색**: 컴포넌트가 Context 값을 요청할 때, React는 해당 컴포넌트의 위치에서 가장 가까운 Provider의 값(valueStack의 최상단 값)을 반환합니다.
    
3. **계층적 오버라이드**: 내부에 있는 Provider의 값이 외부 Provider의 값을 오버라이드합니다.
    

## 성능 최적화와 valueStack

valueStack은 Context 시스템의 성능 최적화에도 중요한 역할을 합니다:

1. **선택적 리렌더링**: React는 valueStack의 값이 실제로 변경되었는지 확인하여 필요한 컴포넌트만 리렌더링합니다.
    
2. **참조 비교**: Context 값의 변경을 감지하기 위해 참조 동일성을 사용합니다. 이는 Context Provider에 제공하는 값의 참조 동일성이 중요한 이유입니다.
    

## 중요한 구현 세부사항

1. **디스패처 연결**: valueStack은 React의 디스패처 시스템과 연결되어 있어 Context 값의 변경이 적절한 컴포넌트에 전파됩니다.
    
2. **렌더 페이즈와 커밋 페이즈**: Provider는 렌더 페이즈에서 값을 valueStack에 등록하고, 이 값은 Provider가 트리에 존재하는 동안 유지됩니다.
    
3. **useContext 작동방식**: useContext Hook은 내부적으로 현재 컴포넌트 위치에서 valueStack을 검색하여 적절한 Context 값을 반환합니다.
    

이러한 메커니즘을 통해 React의 Context API는 컴포넌트 간에 효율적으로 데이터를 공유하고, valueStack은 이 과정에서 정확한 값을 적절한 컴포넌트에 제공하는 핵심 역할을 수행합니다.