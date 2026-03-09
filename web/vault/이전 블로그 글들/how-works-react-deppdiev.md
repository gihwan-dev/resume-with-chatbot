---
author: Gihwan-dev
pubDatetime: 2024-10-04T11:00:40.050Z
title: 리액트는 어떻게 동작할까? - chapter 1
slug: how-works-react-deep-dive
featured: true
draft: false
tags:
  - react
  - deep
  - development
description: 항해 플러스 3기 매니저 과정을 진행하며 과제를 풀어 보았습니다. 그 과정에서 알게된 내용을 정리해보았습니다.
---

리액트의 동작은 추상적으로 이해하고 있습니다다. 가상 돔을 사용해서 필요한 부분만 업데이트 하는것. 그러면 이걸 리액트는 세부적으로 어떻게 구현했을까요? 이 과정에서 직접 리액트를 구현하며 이에 대해 알아봤습니다.

## Table of contents

## Virtual DOM이란?

Virtual DOM (VDOM)은 UI의 이상적인 또는 “가상”적인 표현을 메모리에 저장하고 ReactDOM과 같은 라이브러리에 의해 “실제” DOM과 동기화하는 프로그래밍 개념입니다. 이 과정을 [재조정](https://ko.legacy.reactjs.org/docs/reconciliation.html)이라고 합니다.

이 접근방식이 React의 선언적 API를 가능하게 합니다. React에게 원하는 UI의 상태를 알려주면 DOM이 그 상태와 일치하도록 합니다. 이러한 방식은 앱 구축에 사용해야 하는 어트리뷰트 조작, 이벤트 처리, 수동 DOM 업데이트를 추상화합니다.

간단하게 설명하면 다이어트된 DOM 입니다.

![virtual dom image](virtual-dom-image.png)

리액트는 이 가상 DOM을 조작해 렌더링을 최적화 합니다. 그렇다면 어떻게 가상 DOM을 사용해서 렌더링 비용을 최적화 할까요?

## diffing 알고리즘

리액트에서 두 가상 돔을(기존의 가상 돔과 새로 만든 가상 돔) 비교할 때 사용하는 알고리즘 입니다. 두 트리 형태의 자료구조를 비교할 때 가장 좋은 알고리즘을 사용해도 O(N^3)의 복잡도를 가집니다. 1000개의 컴포넌트를 비교한다면 최악의 경우 100억 번의 비교 절차가 필요하게 됩니다.

이를 해결하기 위해 리액트 팀에서는 하나의 휴리스틱 알고리즘을 제안했습니다.
리액트 팀에서 제안한 휴리스틱 알고리즘은 다음 두 가지 가정을 기반으로 O(N)의 복잡도로 트리를 비교할 수 있습니다.

1. 다른 타입을 가지는 두 요소는 다른 트리를 생성합니다.
2. 렌더링 할 때 개발자가 key 프로퍼티를 사용해 어떤 자식 요소들이 안정적으로 유지될 수 있는지에 대한 힌트를 줄 수 있습니다.

두 트리를 비교할 때 리액트에서는 먼저 루트 요소부터 비교를 시작한다. 루트 요소의 타입에 따라 동작은달라집니다.

### 요소의 타입이 다른 경우

기존에 있던 노드는 제거되고 새로운 노드가 그 위치에 삽입됩니다. 컴포넌트가 제거될 때 `componentWillUnmount()` 가 호출됩니다. 새로운 노드가 삽입될 때 `UNSAFE_componentWillMount()` 이 호출되고 이후 `componentDidMount()` 가 호출됩니다.

해당 루트 아래에 있는 모든 요소들은 자신이 가진 상태를 잃게 됩니다.

### 요소의 타입이 같은 경우

타입이 같은 경우 우선 `attributes` 부터 업데이트 합니다. 두 노드의 `attributes`를 살펴보고 달라진 부분에 맞게 업데이트 합니다. `style` 태그를 업데이트 할 때도 리액트는 달라진 부분만 업데이트 합니다. 이후 자식 요소에 대해 diff 알고리즘의 적용을 재귀적으로 반복합니다.

### 자식 요소를 재귀할 때

키 값이 있는 경우 리액트에서는 기본적으로 두 노드(구버전, 신버전)의 자식들을 동시에 순회하고 변경사항이 있다면 변경합니다. 자식 노드들의 길이가 다른 경우에는 순회 하다 짧은 경우 제거하고, 긴 경우 추가합니다. (Map 자료구조를 사용해서 키 값의 순서 이동이나, 변경, 삭제를 확인 한다고 합니다)

## 합성 이벤트

브라우저에서는 다음과 같이 이벤트를 처리합니다.

```html
<button onclick="someFunction()" />
```

리액트에서는 약간 다릅니다.

```jsx
<button onClick={someFunction} />
```

과 같은 형태입니다. 또 다른 차이점으로 리액트에서는 false를 반환해도 기본 동작을 방지할 수 없습니다.

```html
<form onsubmit="submit()" return false />
```

반드시 preventDefault() 를 호출해야 합니다.

리액트는 브라우저마다 다른 이벤트를 동일하게 처리하기 위해 native 이벤트를 Synthetic 이벤트로 warpping한 이벤트 객체를 사용하는데, 이를 합성 이벤트라고 합니다.

## 설계하기

리액트의 동작을 최소한으로 구현하기 위해 필요한 부품들을 생각해보겠습니다.

1. 바벨을 사용해 변환된 JSX 컴포넌트를 `{ type, props, ...children }` 형태로 가공해야 한다. (`createVNode`)
2. 가공된 JSX 컴포넌트를 렌더링 가능한 형태로 재가공 해야한다. (`processVNode`);
3. 재가공된 데이터를 사용해 `DOM` 노드를 생성할 수 있어야 한다. (`createElement`)
4. 가상돔을 비교해 `DOM`을 업데이트 할 수 있어야 한다. (`updateElement`)
5. 최상위 호출 함수인 `render`를 사용해 리액트 앱을 렌더링 할 수 있어야 한다. (`render`)

큰 틀은 이렇습니다. 이제 세부 구현을 해보겠습니다.

## JSX 컴포넌트 변환해 렌더링 가능한 형태로 만들기

바벨의 JSX를 사용하면 다음과 같이 컴포넌트를 변환해 특정 함수를 실행시킵니다.

```jsx
/** @jsx createVNode */
import { createVNode } from "../lib";
const SomeComponent = ({ name }) => {
  return <div>{name}</div>;
};

// ----- 아래 형태로 변환됨 ------

createVNode("div", { name: "john" }, "john");
```

이 반환값은 다음의 형태여야 합니다.

```jsx
{
  type: "div",
  props: { name: "john" },
  children: [ "john" ]
}
```

`createVNode` 함수를 작성해보겠습니다. 예외 처리 로직이나 `Falsy` 값 처리 등도 할 수 있지만 최대한 간단하게 진행하기 위해 생략했습니다.

```js
export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children,
  };
}
```

이제 컴포넌트를 가상돔으로 만들어 낼 수 있게 되었습니다. 이제 이 가상돔 트리를 렌더링 가능한 형태의 객체로 재가공 해보겠습니다.

```js
function processVNode(vNode) {
  // null, undefined, true, false 값을 가지만 FalsyDom 입니다
  if (isFalsyDom(vNode)) {
    return "";
  }

  // 숫자 또는 문자열인 경우 문자열로 변환해 반환한다.
  if (typeof vNode === "number" || typeof vNode === "string") return vNode + "";

  // type이 함수라면 함수형 컴포넌트 임을 의미이므로
  // props를 매개변수로 함수를 호출해 { type, props, children } 형태로 만들어 줍니다.
  if (typeof vNode.type === "function") {
    return processVNode(vNode.type(vNode.props));
  }

  // 배열이라면 배열 요소들을 순회하며 호출
  if (Array.isArray(vNode.children)) {
    vNode.children = vNode.children.map(processVNode);
  }

  return vNode;
}
```

## 재가공된 데이터를 기반으로 DOM 트리 생성하기

변환된 가상돔의 각 노드는 문자열이거나 `{ type, props, children }` 형태의 객체입니다. 이를 사용해 실제 DOM 트리를 생성하는 함수를 구현해 보겠습니다.

```js
export function createElement(vNode) {
  // 문자열인 경우 텍스트 노드를 생성합니다.
  if (typeof vNode === "string") return document.createTextNode(vNode + "");

  // 배열인 경우 Fragment를 생성해서 요소들을 생성해 추가해줍니다.
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();

    vNode.forEach(childNode => {
      fragment.appendChild(createElement(childNode));
    });

    return fragment;
  }

  // { type, props, children } 형태라면 돔 노드를 생성하고 애트리뷰트를 등록해줍니다.
  const domNode = document.createElement(vNode.type);

  // 애트리뷰트가 아닌 props는 렌더링 되는데 소모 되었으므로, 남은 값은 애트리뷰트 값입니다.
  // 이를 domNode에 등록해줍니다.
  Object.entries(vNode.props ?? {}).forEach(([key, value]) => {
    // on으로 시작하는 경우 이벤트 등록을 해줍니다.
    // 이벤트 위임을 사용해 이벤트 관리를 최적화 합니다. addEvent 함수는 추후 알아보겠습니다.
    if (key.startsWith("on")) {
      addEvent(domNode, key, value);
    }

    // data 애트리 뷰트는 setAttribute 메서드를 통해 등록합니다.
    if (key.includes("data-")) {
      domNode.setAttribute(key, value);
    }

    // 나머지의 경우 그냥 등록합니다.
    domNode[key] = value;
  });

  // 자식들에 대해 재귀적으로 호출하며 부모 돔 노드에 추가합니다.
  const children = vNode.children ?? [];

  children.forEach(child => {
    domNode.appendChild(createElement(child));
  });

  return domNode;
}
```

이제 요소를 생성할 수 있게 되었습니다.

## 가상돔을 비교해 필요한 부분만 업데이트 하기

초기 렌더링 시에는 `createElement`를 사용해 렌더링 할 수 있습니다. 그러나 리렌더링이 발생했을 경우 어떻게 해야할까요? 두 가상돔을 비교해 필요한 부분만 업데이트 해야합니다. 이를 위한 `diff` 알고리즘을 구현해 보겠습니다. 기본적으로 3개의 DOM 트리를 순회하며 노드들을 비교하고 업데이트 한다고 생각하면 됩니다..

1. 실제 DOM
2. 이전 버전의 가상 DOM
3. 새로 만들어진 DOM

이 3가지 트리의 각 노드를 순회합니다. 실제 DOM과 이전 버전의 가상 DOM은 동일한 트리 모양을 가지고 있습니다.

```jsx
// 가상 돔을 사용해 필요한 DOM의 노드만 업데이트 하는 함수입니다.
function updateElement(domNode, newVNode, oldVNode, parentNode) {
  // oldVNode는 있지만 newVNode는 없다면 대응되는 domNode를 제거합니다.
  if (oldVNode && !newVNode) {
    domNode.remove();
    return;
  }

  // newVNode는 있지만 oldVNode가 없다면 대응되는 노드의 부모에 새로운 노드를 추가합니다.
  if (newVNode && !oldVNode) {
    parentNode.appendChild(createElement__v2(newVNode));
    return;
  }

  // newVNode와 oldVNode가 문자열 또는 숫자이지만 같은 값을 가지지 않는다면
  // 대응되는 노드의 텍스트 값을 변경합니다.
  if (
    isTypeIn(typeof newVNode, ["number", "string"]) &&
    isTypeIn(typeof oldVNode, ["number", "string"])
  ) {
    if (newVNode !== oldVNode) {
      domNode.textContent = newVNode;
    }
    return;
  }

  // 두 노드의 타입이 다르다면 newVNode를 루트로 하는 새로운 돔 트리를 생성해
  // 대응되는 노드를 교체합니다.
  if (newVNode.type !== oldVNode.type) {
    domNode.replaceWith(createElement__v2(newVNode));
    return;
  }

  // 이후 부터는 oldVNode와 newVNode의 타입이 같은 경우이기 때문에 attribute를 업데이트 해줍니다.
  updateAttributes(domNode, newVNode, oldVNode);

  // oldVNode와 newVNode의 자식의 길이 중 더 긴 값을 통해 순회를 진행합니다.
  const oldChildren = oldVNode?.children ?? [];
  const newChildren = newVNode?.children ?? [];

  const max = Math.max(newChildren.length, oldChildren.length);

  // 자식들을 순회하며 재귀적으로 updateElement를 호출합니다.
  for (let i = 0; i < max; i++) {
    updateElement(
      domNode.childNodes[i],
      newVNode?.children?.[i],
      oldVNode?.children?.[i],
      domNode
    );
  }

  // newVNode의 자식 길이가 더 짧은 경우 필요없는 자식들을 제거합니다.
  if (newChildren.length < oldChildren.length) {
    for (let i = newChildren.length; i < oldChildren.length; i++) {
      domNode.childNodes[i].remove();
    }
  }
}
```

원래 `key`값을 통한 렌더링 최적화도 진행되어야 하지만... 이 알고리즘은 추후 내용을 추가하겠습니다.

이제 `updateAttributes` 함수를 살펴보겠습니다.

```jsx
function updateAttributes(domNode, newNode, oldNode) {
  const oldProps = oldNode.props ?? {};
  const newProps = newNode.props ?? {};

  for (const key of Object.keys(oldProps)) {
    // 특정 key의 props가 제거되었다면 제거합니다.
    if (isRemoved(newProps, key)) {
      // 이벤트는 합성 이벤트를 통해 관리되므로 removeElement 함수를 통해 처리합니다.
      if (key.startsWith("on")) {
        removeEvent(domNode, key, oldProps[key]);
      }

      domNode?.removeAttribute(key);
      continue;
    }

    // 값이 변경되었다면
    if (isChanged(oldProps, newProps, key)) {
      // 이벤트 함수가 변경되었다면
      // 제거하고 다시 추가합니다.
      if (key.startsWith("on")) {
        removeEvent(domNode, key, oldProps[key]);
        addEvent(domNode, key, newProps[key]);
        // 스타일이 변경되었다면
      } else if (key === "style") {
        // 변경된 스타일만 업데이트 합니다.
        updateOnlyChanged(domNode.style, oldProps[key], newProps[key]);
      } else if (key === "className") {
        // 클래스명이 변경되었다면
        domNode.className = newProps[key];
      } else {
        // 나머지 경우
        domNode.setAttribute(key, newProps[key]);
      }
      continue;
    }

    // 추가된 경우
    if (isAdded(oldProps, newProps, key)) {
      // 이벤트의 경우 addEvent 함수를 통해 처리합니다.
      if (key.startsWith("on")) {
        addEvent(domNode, key, newProps[key]);
      }

      domNode[key] = newProps[key];
    }
  }
}
```

## render 함수 만들기

렌더 함수에서는 리렌더링 인지, 초기 렌더링인지 판단하고 적절히 함수를 호출합니다. 또한 이벤트 합성 및 위임 처리를 위한 함수를 호출합니다.

```jsx
export function renderElement(vNode, container) {
  let newRoot = processVNode(vNode);
  const oldRoot = container.vNode;

  if (!oldRoot) {
    container.appendChild(createElement__v2(newRoot));
    setupEventListeners(container);
  } else {
    updateElement(container.childNodes[0], newRoot, oldRoot, container);
  }

  container.vNode = newRoot;

  setupEventListeners(container);
}
```

## 이벤트 합성 및 위임 하기

리액트에서는 브라우저간의 이벤트를 통일화 하고, 이벤트 관리를 효율적으로 하기 위해 이벤트 위임과 합성 이벤트를 사용합니다.

```jsx
import {
  reactNamesToTopLevelEvents,
  topLevelEventsToReactNames,
} from "./DomEventProperties.js";

// 이벤트 핸들러를 저장하기 위한 맵 자료구조 입니다.
const eventMap = new Map();

// 이벤트 위임을 위해 사용될 루트 요소 입니다.
let rootElement = null;

// 이벤트 리스너를 셋업합니다.
export function setupEventListeners(root) {
  // 루트 요소를 저장합니다.
  rootElement = root;

  // 이벤트 맵에 등록된 이벤트 타입을 토대로 handleEvent 함수를 제거합니다. (혹시나 남아있을 경우를 위한 제거 처리 입니다.)
  // handleEvent 함수는 이벤트 위임을 처리하기 위해 사용되는 이벤트 핸들러 입니다.
  eventMap.forEach((handlers, eventType) => {
    rootElement.removeEventListener(eventType, handleEvent, true);
  });

  // 이벤트 맵에 등록된 이벤트 타입을 토대로 handleEvent 함수를 등록합니다.
  // 모든 이벤트에 handleEvent 함수가 호출되며 이 함수를 사용해 모든 이벤트를 처리합니다.
  eventMap.forEach((handlers, eventType) => {
    rootElement.addEventListener(
      reactNamesToTopLevelEvents.get(eventType),
      handleEvent,
      true
    );
  });
}

// 모든 이벤트는 이 함수를 통해 처리됩니다.
function handleEvent(event) {
  // 이벤트의 타겟을 추출합니다.
  let target = event.target;

  // 타겟이 존재하고 타겟이 루트 엘리먼트가 아니라면 계속해서 순회합니다.
  while (target && target !== rootElement) {
    // 네이티브 이벤트 타입을 리액트 이벤트 타입으로 변환합니다. (ex. click => onClick)
    const eventType = topLevelEventsToReactNames.get(event.type);

    // 해당 타입에 등록된 핸들러들을 모두 꺼내옵니다.
    const handlers = eventMap.get(eventType);

    // 없으면 넘어갑니다.
    if (!handlers) return;

    // 있다면
    for (const { element, handler } of handlers) {
      // element 가 target 이라면 handler를 실행시킵니다.
      // 원래는 이 event가 Synthetic 이벤트로 래핑되어 호출됩니다.
      element === target ? handler?.(event) : null;
    }

    // 현재 타겟을 부모 노드로 변경해 줍니다.
    // tip: 아래에서부터 위로 올라가는 버블링을 상상하시면 좋습니다.
    target = target.parentNode;
  }
}

// 이벤트를 추가하는 함수 입니다. 이전 updateElement, createElement 함수에서 호출되는걸 보셨을겁니다.
export function addEvent(element, eventType, handler) {
  // 특정 이벤트 타입에 대해 기존에 존재하는 배열이 있는지 확인합니다.
  const existing = eventMap.get(eventType);

  // 해당 이벤트 타입의 값 배열에 { element, handler } 객체를 추가해줍니다.
  eventMap.set(eventType, [...(existing ?? []), { element, handler }]);

  // 이벤트 타입이 네이티브 - 리액트 이벤트 상관 관계를 저장하는 객체에 저장되지 않은 경우
  // 이벤트를 추가해 줍니다.
  if (!reactNamesToTopLevelEvents.has(eventType)) {
    rootElement.addEventListener(eventType, handleEvent, true);
  }
}

// 이벤트를 제거하는 함수 입니다.
export function removeEvent(element, eventType, handler) {
  // 이벤트 타입에 대한 값의 배열을 받아옵니다.
  const handlers = eventMap.get(eventType);

  // 핸들러 배열이 없으면, eventMap에서 제거하고, 루트 요소에서 이벤트를 제거합니다.
  // 이를 통해 메모리 유수를 방지할 수 있습니다.
  if (!handlers || handlers?.length === 0) {
    eventMap.delete(eventType);
    rootElement.removeEventListener(eventType, handleEvent, true);
    return;
  }

  // 요소의 이벤트를 제거합니다.
  eventMap.set(
    eventType,
    handlers.filter(
      ({ element: el, handler: h }) => el !== element || h !== handler
    )
  );
}
```

이러한 방식처럼, 이벤트 위임을 통해 이벤트를 처리하고 이를 `Synthetic` 이벤트로 래핑해 제공하는 방식으로 리액트에서는 이벤트 처리를 최적화 합니다.

### 참고

리액트 이벤트와 네이티브 이벤트의 상관 관계를 만들어내는 함수는 리액트 소스코드에서 `DomEventProperties` 에서 참고했습니다.

```jsx
export const topLevelEventsToReactNames = new Map();

export const reactNamesToTopLevelEvents = new Map();

export const simpleEventPluginEvents = [
  "abort",
  "auxClick",
  "beforeToggle",
  "cancel",
  "canPlay",
  "canPlayThrough",
  "click",
  "close",
  "contextMenu",
  "copy",
  "cut",
  "drag",
  "dragEnd",
  "dragEnter",
  "dragExit",
  "dragLeave",
  "dragOver",
  "dragStart",
  "drop",
  "durationChange",
  "emptied",
  "encrypted",
  "ended",
  "error",
  "gotPointerCapture",
  "input",
  "invalid",
  "keyDown",
  "keyPress",
  "keyUp",
  "load",
  "loadedData",
  "loadedMetadata",
  "loadStart",
  "lostPointerCapture",
  "mouseDown",
  "mouseMove",
  "mouseOut",
  "mouseOver",
  "mouseUp",
  "paste",
  "pause",
  "play",
  "playing",
  "pointerCancel",
  "pointerDown",
  "pointerMove",
  "pointerOut",
  "pointerOver",
  "pointerUp",
  "progress",
  "rateChange",
  "reset",
  "resize",
  "seeked",
  "seeking",
  "stalled",
  "submit",
  "suspend",
  "timeUpdate",
  "touchCancel",
  "touchEnd",
  "touchStart",
  "volumeChange",
  "scroll",
  "scrollEnd",
  "toggle",
  "touchMove",
  "waiting",
  "wheel",
];

function registerSimpleEvent(domEventName, reactName) {
  topLevelEventsToReactNames.set(domEventName, reactName);
  reactNamesToTopLevelEvents.set(reactName, domEventName);
}

export function registerSimpleEvents() {
  for (let i = 0; i < simpleEventPluginEvents.length; i++) {
    const eventName = simpleEventPluginEvents[i];
    const domEventName = eventName.toLowerCase();
    const capitalizedEvent = eventName[0].toUpperCase() + eventName.slice(1);
    registerSimpleEvent(domEventName, "on" + capitalizedEvent);
  }
}

registerSimpleEvents();
```

## 결론

리액트를 간소하게 구현해보며 동작 원리에 대해 파악해 보았습니다. 리액트에서 합성 이벤트와 위임 처리를 구현해보는건 처음이었기에 많이 배울 수 있었습니다.
