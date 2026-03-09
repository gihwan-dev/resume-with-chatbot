---
author: Gihwan-dev
pubDatetime: 2024-06-02T01:52:03.135Z
title: 사소한줄 알았던 버그의 날갯짓이 태풍이 되어 돌아왔다.
slug: small-error-become-fatal
featured: true
draft: false
tags:
  - development
  - error
  - zustand
description: 사소한줄 알았던 작은 버그가 치명적인 에러가 되어 발견되었습니다... 이 경험을 하며 느낀점들을 적어 봤습니다.
---

사소한줄 알았던 작은 버그가 치명적인 에러가 되어 발견되었습니다... 이 경험을 하며 느낀점들을 적어 봤습니다.

## Table of contents

## 별로 중요하지 않은 버그라 생각했다

[포트폴리오 웹사이트](https://portfolio.gihwan-dev.com/projects)를 개발해서 프로젝트 포트폴리오를 해당 웹사이트에서 작성하고 있었다. 관리자 페이지에서 글을 작성하던 중 에러를 발견하게 되었다.

다음 이미지는 관리자 페이지의 게시글 작성 화면이다.

![portfolio-editor-screen](portfolio-editor.png)

에러가 발생한 부분은 왼쪽의 `textarea`였다. 다음 코드를 보자.

```ts
useEffect(() => {
  console.log(model);
  if (documentId && model === "") {
    change(document?.content ?? "");
  }
}, [change, document?.content, documentId, model]);
```

위와 같은 코드를 통해서 에디터의 `textarea`에 기본값을 할당하고 있었다. `documentId`는 현재 수정하고 있는 게시글의 `id`값이고 이 값으로 현재 수정중인 문서에 대한 값을 다음과 같이 받아온다.

```ts
const documentId = params.id as string;

const { model, change, initializeState } = useEditorStore(state => state);

const { mutate } = api.document.updateContent.useMutation();

const {
  data: document,
  isLoading,
  isError,
} = api.document.getOneDocument.useQuery({
  documentId: +documentId,
});
```

이렇게 특정 문서의 `content`값으로 수정된 `model`은 `textarea`의 `value` 프로퍼티값에 할당된다.

## Zustand Store는 전역 변수다

다음은 공식 문서의 내용의 일부다.

> _Keep in mind that Zustand store is a global variable (AKA module state) making it optional to use a Context_
>
> We have these general recommendations for the appropriate use of Zustand:
>
> - No global stores - Because the store should not be shared across requests, it should not be defined as a global variable. Instead, the store should be created per request.
> - React Server Components should not read from or write to the store - RSCs cannot use hooks or context. They aren't meant to be stateful. Having an RSC read from or write values to a global store violates the architecture of Next.js.

요약하자면 다음과 같았다. `Zustand`는 전역 변수다. 생각해 보면 `Context Api`의 `Provider`를 사용해서 상태를 주입 시키지 않았다. 즉 `Zustand`는 리액트 앱의 라이프사이클과는 전혀 무관하고 리액트 프레임워크의 제어권 밖에 존재한다는 의미다.

## URL이 변경되도 이동해도 Zustand의 값은 메모리에 존재한다

`Next.js`에서 페이지를 이동하더라도 `Zustand`의 상태값은 바뀌지 않는다. 즉 `Zustand`의 스토어는 `SSR`, `CSR`로 리렌더링 된다해도 초기화 되지 않는다.

여기서 문제가 생겼다. `Zustand`로 관리하는 값인 `model`전역변수가 페이지 이동에도 초기화 되지 않았고 다른 문서를 수정하려 했을 때 `model`이 빈 문자열이 아님으로 새로운 문서의 내용으로 업데이트 되지 않고 기존 내용이 그대로 남아있게 된다.

```ts
useEffect(() => {
  if (documentId && model === "") {
    change(document?.content ?? "");
    a;
  }
}, [change, document?.content, documentId, model]);
```

## 사소한 버그인줄 알았다... 조져지기 전까진

사소한 에러라 그냥 수정 안하고 있었다. 다른 부분에서 수정할 부분이 많았고 추가할 기능도 많았다. 이정도 에러는 그냥 작업에 추가해두고 나중에 수정하자 라고 생각했다.

그런데 문제가 있었다. 게시글이 `onChange` 이벤트마다 저장되다는 거다.

이전 문서를 수정하고 다음 문서를 수정하러 들어갔을 때 스페이스바를 한 번... 딱 한 번 눌렀는데 저장이 됐다! 이전 문서의 내용으로! 공들여 작성했던 내용이 날아갔고 다시 작성했다.

## Next.js에서 Zustand를 사용하는 Best Practice

`Zustand`의 공식문서 설명을 다시 가져오자.

> - No global stores - Because the store should not be shared across requests, it should not be defined as a global variable. Instead, the store should be created per request.
> - React Server Components should not read from or write to the store - RSCs cannot use hooks or context. They aren't meant to be stateful. Having an RSC read from or write values to a global store violates the architecture of Next.js.

전역 변수로 사용하지 말고, 요청마다 새로운 `store`를 생성하는 것을 추천하고 있다.

어떻게 이런 동작을 하게끔 구현할 수 있을까?

## createStore vs store

`createStore`함수와 `store`함수의 차이점을 살펴보자.

### store

내가 `store`를 생성하는데 기존에 사용하고 있던 함수다.

이 함수는 빠르게 상태와 액션을 포함하는 `store`를 생성할 수 있게 해준다.

어떤 컴포넌트에서도 바로 호출해서 사용할 수 있다. 다음처럼 사용한다.

```tsx
function SomeComponent() {
  const store = useSomeStore((state) => state);

  return <div>{store.someValue}</div>
}

interface SomeStoreState {
  value: string;

  someAction: (newValue: string) => void;
}

const useSomeStore = create<SomeStoreState>()(({ set }) => ({
  value: '';

  someAction: (newValue) => set((state) => ({
    value: newValue,
  })),
}));
```

이렇게 아무 컴포넌트에서나 간단하게 호출해 사용할 수 있다.

### createStore

`createStore`는 훅을 반환하는 대신 `store`객체 그자체를 반환한다. 그렇기에 `Context API`와 결합해 사용한다.

`create`에서 `createStore`로 변경되었으므로 내 코드를 보며 사용 방법을 설명하겠다.

```ts
export interface EditorState {
  model: string;
}

export interface EditorActions {
  change: (model: string) => void;
  initializeState: () => void;
}

export type EditorStore = EditorState & EditorActions;

const defaultInitState: EditorState = {
  model: "",
};

export const createEditorStore = (initialState = defaultInitState) =>
  createStore<EditorStore>()(set => ({
    ...initialState,
    change: (value: string) => set(_ => ({ model: value })),
    initializeState: () => set(_ => ({ model: "" })),
  }));
```

이런식으로 코드를 작성하면 `createEditorStore`를 호출했을 때 `StoreApi`라 불리는 객체를 반환하게 된다. 해당 객체는 다음과 같은 형태다.

```ts
export interface StoreApi<T> {
  setState: SetStateInternal<T>;
  getState: () => T;
  getInitialState: () => T;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
  destroy: () => void;
}
```

상태값을 관리해주는 `Api`객체라고 생각된다. 이 `Api`를 `Context API`를 통해서 주입시킬 수 있도록 해준다.

이제 `Provider`를 생성해주자.

```ts
export const CounterStoreContext = createContext<StoreApi<EditorStore> | null>(
  null,
);

export function EditorStoreProvider({ children }: ChildrenProps) {
  const storeRef = useRef<StoreApi<EditorStore>>();

  if (!storeRef.current) {
    storeRef.current = createEditorStore();
  }
  return (
    <CounterStoreContext.Provider value={storeRef.current}>
      {children}
    </CounterStoreContext.Provider>
  );
}

export const useEditorStore = <T,>(selector: (state: EditorStore) => T): T => {
  const editorStoreContext = useContext(CounterStoreContext);

  if (!editorStoreContext) {
    throw Error('useEditorStore must be used within a EditorStoreProvider');
  }

  return useStore(editorStoreContext, selector);
};
```

`useRef`에 저장된 값은 변경되어도 컴포넌트가 리렌더링 되지 않는다. 또한 리렌더링시에도 값이 계속 유지된다. `ref`의 `current`값에 `StoreApi`를 저장해 렌더링마다 재생성 되는것을 방지한다.

`current`가 `Null`값이라면 `createEditorStore`를 통해 `StoreApi`를 생성해 할당해준다. 이후 이 `Api`객체를 `Provider`를 전달한다.

`useEditorStore`라는 커스텀 훅을 정의해 `CounterStoreContext`의 값을 전달 받아 값의 여부를 확인해 `Error`를 던지고 그렇지 않다면 `selector`로 선택된 값을 반환하게 해 `useStore`를 `wrapping`한다.

원하는 페이지를 `Provider`로 감싸준 뒤 훅을 사용하면 된다. 훅의 사용은 변함없이 똑같은 형태로 사용가능하다.

```ts
const DocumentEditPage = () => {
  return (
    <EditorStoreProvider>
      <AddNewRoot />
    </EditorStoreProvider>
  );
};
```

```ts
const { model, change, initializeState } = useEditorStore(state => state);
```

## 결론

이렇게 버그는 해결됐다. 사소하다 생각해 방치한 버그가 이렇게 치명적인 버그로 나타나게 될거라곤 상상도 못했다. 버그를 대하는 자세를 다시 생각해보는 계기가 된거 같다. 이 일을 계기로 버그가 생겼을 때 다음과 같은 프로세스를 밟기로 했다.

1. 버그가 생긴 즉시 원인을 파악해 문서화하고 수정한다.
2. 수정이 어렵다면 버그가 가지는 영향력을 파악한다. 어떤 경우에 어떤 악영향을 줄 수 있을지 예측해본다.
3. 영향력이 크다면 수정한다. 그렇지 않다면 버그에 관한 문서를 따로 관리한다.
4. 기능 추가 수정이 있을 때 마다 버그 리포트를 확인하고 기능을 추가하게 됐을 때 추가되는 기능이 존재하는 버그와 관계가 있을지 없을지 파악한다.
5. 틈틈이 수정한다.

사실 이런 과정이 오버 엔지니어링 아닐까? 하는 생각도 든다. 그런데 일단 해보려 한다...

> 다시는 버그를 방치하지 않겠다...
