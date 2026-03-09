
말씀하신 대로 `useState` 역시 `[state, setState]` 형태로 상태와 변경 함수를 명시적으로 선언하기 때문에, 이 문장만 보면 `useState`와 다를 게 없어 보입니다.

여기서 말하는 '명시적'이라는 것은 **"상태 변경의 원인(What happened)"을 코드로 명시**한다는 의미에 가깝습니다.

- **`useState`** `setState(count + 1)` 이나 `setState({ ...state, name: 'newName' })` 같은 코드는 상태가 **"어떻게(How)"** 변해야 하는지에 대한 로직을 직접 전달합니다. 즉, 상태 변경의 **구현** 그 자체를 호출하는 방식입니다.
- **`useReducer`** `dispatch({ type: 'INCREMENT' })` 나 `dispatch({ type: 'CHANGE_NAME', payload: 'newName' })` 같은 코드는 **"무슨 일이 일어났는지(What)"**를 설명하는 **액션(Action)**을 전달합니다. 상태가 구체적으로 어떻게 변할지에 대한 로직은 `reducer` 함수 내부에 캡슐화되어 있습니다.
    

`useReducer`가 더 '명시적'이라고 주장하는 이유는 바로 이 지점입니다. 상태를 변경시키는 코드를 볼 때, `useState`는 그저 '값을 1 더한다'는 구현만 보이지만, `useReducer`는 **'증가(INCREMENT)라는 행동이 발생했다'**는 의도를 명확하게 보여줍니다. 상태 변경 로직과 그 원인을 분리함으로써 코드의 가독성과 의도를 더 명확(explicit)하게 만든다는 것이죠.