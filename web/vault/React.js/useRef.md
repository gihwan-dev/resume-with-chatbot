`useRef`는 `React`의 훅중 하나로 1. DOM 요소에 직접 접근하기 위한 방법 2. 렌더링 사이에 변하지 않는 값을 참조하기 위한 용도 로 사용된다.

## DOM 요소에 접근하기
`useRef` 는 getElementById` 와 같은 `querySelector` 와 유사하게 동작하지만 선언적 패러다임인 `react`에 보다 적절한 방식이다.

```jsx
export default function SomeComponent() {
	const someRef = useRef(null);
	return <div ref={someRef}>some tag </div>
}
```

위와 같은 방식으로 참조를 얻어낸 후 `querySelector`로 얻어낸 요소와 유사한 방식으로 사용할 수 있다.

## 렌더링 사이에도 지속되는 데이터 보관
`useRef`는 렌더링 하는 동안 값이 유지되는 데이터를 저장하기 위해서도 사용된다. 이때 중요한 점은 `useRef`로 저장된 값이 변경 되더라도 렌더링이 일어나지 않는다는 점이다.

```jsx
export default function SomeComponent() {
	const renderCount = useRef(0);

	renderCount.current = renderCount.current + 1;

	return <div>{renderCount.current}</div>
}
```
위 처럼 사용할 수 있다. 이때 주의할점은 `useRef`의 값이 변경 되더라도 렌더링은 일어나지 않으며 변경된 값이 `DOM`에 적용되지 않는다는 점이다.