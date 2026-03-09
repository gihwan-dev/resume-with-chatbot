---
author: Gihwan-dev
pubDatetime: 2024-06-24T04:43:18.010Z
title: ErrorBoundary가 비동기 콜백, 이벤트 핸들러에서 발생하는 에러를 잡지 못하는 이유
slug: deep-dive-into-react-error-boundary
featured: true
draft: false
tags:
  - study
  - deep-dive
  - react
description: 에러바운더리가 비동기, 이벤트 핸들러에서 에러를 잡지 못하는 이유에 대해 deep dive 해보았습니다.
---

## Table of contents

## ErrorBoundary 란?

`ErrorBoundary` 는 리액트에서 컴포넌트의 렌더링 과정 중 발생한 에러를 잡아 `fallback`을 보여주는 고차 컴포넌트다. 그런데 이 `ErrorBoundary` 에서는 비동기 함수나, 이벤트 핸들러에서 발생한 에러를 잡지 못한다. 그 이유에 대해서 깊게 탐색해 보기로 했다.

## ErrorBoundary 내부

`ErrorBoundary`의 내부를 살펴보자. 다음과 같은 형태로 되어있다:

```tsx
class ErrorBoundary extends Components {
  // -- 생략 --

  // 하위 구성요소의 렌더링 중 에러가 발생하면 호출되는 메서드
  static getDerivedStateFromError(error: Error) {
    return { didCatch: true, error };
  }

  resetErrorBoundary(...args: any[]) {
    const { error } = this.state;

    if (error !== null) {
      this.props.onReset?.({
        args,
        reason: "imperative-api",
      });

      this.setState(initialState);
    }
  }

  // 하위 구성 요소의 렌더링 과정 중 에러가 발생하게 되면 이 메서드가 호출됨.
  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(
    prevProps: ErrorBoundaryProps,
    prevState: ErrorBoundaryState
  ) {
    const { didCatch } = this.state;
    const { resetKeys } = this.props;

    if (
      didCatch &&
      prevState.error !== null &&
      hasArrayChanged(prevProps.resetKeys, resetKeys)
    ) {
      this.props.onReset?.({
        next: resetKeys,
        prev: prevProps.resetKeys,
        reason: "keys",
      });

      this.setState(initialState);
    }
  }

  render() {
    const { children, fallbackRender, FallbackComponent, fallback } =
      this.props;
    const { didCatch, error } = this.state;

    let childToRender = children;

    if (didCatch) {
      const props: FallbackProps = {
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      };

      if (typeof fallbackRender === "function") {
        childToRender = fallbackRender(props);
      } else if (FallbackComponent) {
        childToRender = createElement(FallbackComponent, props);
      } else if (fallback === null || isValidElement(fallback)) {
        childToRender = fallback;
      } else {
        if (isDevelopment) {
          console.error(
            "react-error-boundary requires either a fallback, fallbackRender, or FallbackComponent prop"
          );
        }

        throw error;
      }
    }

    return childToRender;
  }

  // -- 생략 --
}
```

위 처럼 컴포넌트를 렌더링 하는 과정에서 에러가 발생하면 `componentDidCatch` 와 `getDerivedStateFromError` 를 호출한다. `componentDidCatch` 가 호출되면 `this.state.onError` 메서드가 실행되고 `getDerivedStateFromError` 는 `didCatch`, `error` 상태를 업데이트 한다.

여전히 왜 비동기 함수, 이벤트 핸들러에서 발생하는 에러를 잡지 못하는지 이해가 가지 않는다. 리액트에서 렌더링 과정 중에 어떻게 에러를 포착하고 처리하는지 자세히 알아보자.

## ReactFiberWorkLoop

`ReactFiberWorkLoop` 내부에는 렌더링을 실행하는 두 가지 함수가 있다.

- `renderRootSync`: 동기적으로 렌더링을 실행하는 함수다.
- `renderRootConcurrent`: 비 동기적으로 렌더링을 실행한다.

이 두 함수에서 다음 두 가지 함수를 호출한다.

- `handleThrow`: `try catch` 내부에서 실행된다.
- `throwAndUnwindWorkLoop`: 루프 내에서 렌더링 과정 중에 실행된다.

그럼 이 두 함수에 대해 더 자세히 알아보겠다.

### throwAndUnwindWorkLoop

이 함수의 동작에 대해서 설명해 보겠다:

#### 1.`resetSuspendedWorkLoopOnUnwind`을 호출한다

`resetContextDependencies`: 를 호출해 `currentlyRenderingFiber`, `lastContextDependency`, `lastFullyObservedContext` 라는 전역 변수를 `null` 값으로 초기화한다.

- `currentlyRenderingFiber`: 현재 렌더링을 진행하고 있는 `Fiber`에 대한 전역 변수 값이다. 이전 값이 저장되어 있으므로 이를 `null` 값으로 초기화한다.
- `lastContextDependency`: 현재의 컴포넌트 노드가 마지막으로 의존하고 있는 컨텍스트의 의존성에 대한 값을 저장하는 전역 변수다. 마지막으로 의존하는 값인 이유는 **효율성**을 위해서다. 리액트에서는 컴포넌트의 컨텍스트 의존성을 연결 리스트로 관리한다. 새로운 컨텍스트 의존성에 대한 추가가 간편하고 끝에서 역추적하며 의존하는 컨텍스트에 변경을 확인할 수 있다. 그렇기에 마지막으로 의존하는 값만 있으면 의존하는 모든 컨텍스트의 의존성을 확인할 수 있다.
- `lastFullyObservedContext`: 마지막으로 완전히 관찰한 컨텍스트를 의미한다.
  여기서도 "마지막" 인 이유는 링크드 리스트 형식이기 때문이다. 역추적하며 컨텍스트의 값을 가져오기 위함이다.

#### 2. throwException 함수 호출

기존 컨텍스트를 모두 초기화 하고 `throwException` 함수를 호출한다. 이 함수 내부를 살펴보자.

```tsx
  root: FiberRoot,
  returnFiber: Fiber | null,
  sourceFiber: Fiber,
  value: mixed,
  rootRenderLanes: Lanes,
```

인자로 받는 값들이다.

```tsx
const suspenseBoundary = getSuspenseHandler();
switch (suspenseBoundary.tag) {
  case SuspenseComponent: {
    // If this suspense boundary is not already showing a fallback, mark
    // the in-progress render as suspended. We try to perform this logic
    // as soon as soon as possible during the render phase, so the work
    // loop can know things like whether it's OK to switch to other tasks,
    // or whether it can wait for data to resolve before continuing.
    // TODO: Most of these checks are already performed when entering a
    // Suspense boundary. We should track the information on the stack so
    // we don't have to recompute it on demand. This would also allow us
    // to unify with `use` which needs to perform this logic even sooner,
    // before `throwException` is called.
    if (disableLegacyMode || sourceFiber.mode & ConcurrentMode) {
      if (getShellBoundary() === null) {
        // Suspended in the "shell" of the app. This is an undesirable
        // loading state. We should avoid committing this tree.
        renderDidSuspendDelayIfPossible();
      } else {
        // If we suspended deeper than the shell, we don't need to delay
        // the commmit. However, we still call renderDidSuspend if this is
        // a new boundary, to tell the work loop that a new fallback has
        // appeared during this render.
        // TODO: Theoretically we should be able to delete this branch.
        // It's currently used for two things: 1) to throttle the
        // appearance of successive loading states, and 2) in
        // SuspenseList, to determine whether the children include any
        // pending fallbacks. For 1, we should apply throttling to all
        // retries, not just ones that render an additional fallback. For
        // 2, we should check subtreeFlags instead. Then we can delete
        // this branch.
        const current = suspenseBoundary.alternate;
        if (current === null) {
          renderDidSuspend();
        }
      }
    }
    // --생략--
  }
}
```

`Suspense Boundary` 를 처리하는 모습이다. 리액트에서는 `Suspense` 와 `Error` 를 함께 처리한다. `throw` 된 값이 `Promise` 인지 `Error` 인지에 따라 처리한다고 한다. 다음 코드를 보자:

```tsx
do {
  switch (workInProgress.tag) {
    case ClassComponent:
      // Capture and retry
      const ctor = workInProgress.type;
      const instance = workInProgress.stateNode;
      if (
        (workInProgress.flags & DidCapture) === NoFlags &&
        (typeof ctor.getDerivedStateFromError === "function" ||
          (instance !== null &&
            typeof instance.componentDidCatch === "function" &&
            !isAlreadyFailedLegacyErrorBoundary(instance)))
      ) {
        workInProgress.flags |= ShouldCapture;
        const lane = pickArbitraryLane(rootRenderLanes);
        workInProgress.lanes = mergeLanes(workInProgress.lanes, lane);
        // Schedule the error boundary to re-render using updated state

        // --------------------- 이부분 ---------------------
        const update = createClassErrorUpdate(lane);
        // --------------------- 이부분 ---------------------
        initializeClassErrorUpdate(update, root, workInProgress, errorInfo);
        // --------------------- 이부분 ---------------------

        enqueueCapturedUpdate(workInProgress, update);
        return false;
      }
      break;
    default:
      break;
  }
} while (workInProgress !== null);
```

`createClassErrorUpdate`, `initializeClassErrorUpdate` 부분을 살펴보면 에러를 처리하는 자세한 로직을 볼 수 있을 것 같다.

```tsx
function initializeClassErrorUpdate(
  update: Update<mixed>,
  root: FiberRoot,
  fiber: Fiber,
  errorInfo: CapturedValue<mixed>
): void {
  const getDerivedStateFromError = fiber.type.getDerivedStateFromError;
  if (typeof getDerivedStateFromError === "function") {
    const error = errorInfo.value;
    update.payload = () => {
      return getDerivedStateFromError(error);
    };
  }
}
```

이외에도 `initializeClassErrorUpdate` 함수에서 다음과 같은 코드를 찾을 수 있었다.

```tsx
const error = errorInfo.value;
const stack = errorInfo.stack;
this.componentDidCatch(error, {
  componentStack: stack !== null ? stack : "",
});
```

이 함수는 `captureCommitPhaseError` 함수와 `updateClassComponent` 함수에서 호출된다.

`captureCommitPhaseError` 는 커밋 페이즈 `updateClassComponent` 는 렌더링 페이즈에 호출되는 함수다. 즉, 이 두 단계에서 throw 된 에러를 잡아 `ErrorComponent` 가 가진 메서드를 호출해 에러를 적절히 처리하는 거다. 커밋 페이즈와 렌더링 페이즈에서.

즉, 리액트의 라이프 사이클의 주기를 돌며 그 과정에서 에러를 마킹하고 처리하기 때문에 *이벤트 루프*에서 처리되는 비동기 함수나 이벤트 핸들러의 에러는 잡아내 마킹할 수 없는거다.

이벤트 핸들러나 비동기 함수의 에러를 잡아 `ErrorBoundary`에서 해결할 수 있는 방법이 없는건 아니다.

```tsx
const useErrorBoundary() {
  const [error, setError] = useState<ErrorType extends Error | null>(null);

  useEffect(() => {
    if (error !== null) {
      setError(() => {
        throw error;
      })
    }
  }, [error])

  return setError;
}

const throwError = useErrorBoundary();

throwError(new Error("비동기 함수, 이벤트 핸들러에서 던져도 ErrorBoundary에서 잡힘"));
```

이런 방식으로 `dispatch` 함수에서 에러를 `throw` 할 수 있도록 하면 리액트의 렌더링 및 커밋 과정에서 이 에러를 잡아 처리할 수 있게 된다.

## 결론

사실 이렇게까지 할 필요가 있었나 싶긴 하다. 다만 그래도 이 과정에서 얻은게 많다고 느껴지긴한다. 계속해서 다른 사람의 코드를 읽다보니 이제 점점 라이브러리 읽는게 익숙해지는 기분도 든다.
