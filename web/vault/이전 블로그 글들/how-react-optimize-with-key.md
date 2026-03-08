---
author: Gihwan-dev
pubDatetime: 2024-11-09T03:10:32.385Z
title: 리액트는 어떻게 key값으로 렌더링을 최적화 할까?
slug: how-react-optimize-with-key
featured: true
draft: false
tags:
  - react
  - programming
description: 리액트는 어떻게 key값으로 렌더링을 최적화 하는지 궁금해 분석해본 글입니다.
---

## Table of contents

## 리액트의 diffing 알고리즘

리액트에서는 다른 두 가지 버전의 가상 돔을 비교해 필요한 부분만 업데이트 하도록 해 렌더링을 최적화 한다. 가상 돔은 트리 구조의 자료구조인데, 두 트리를 비교하는 알고리즘은 O(N^3)이 걸린다고 한다.

리액트에서는 다음 두 가지를 전제로 하는 휴리스틱 알고리즘을 사용해 트리 비교 알고리즘의 시간 복잡도를 O(N^3) 에서 O(N) 으로 개선했다.

1. 타입이 다를 경우 새로운 트리를 생성한다.
2. 개발자가 `key`를 사용해 요소의 변경에 대한 힌트를 줄 수 있다.

리액트 렌더링 시스템을 자바스크립트로 간단하게 구현한 적이 있다. `Babel`을 사용해 가상돔을 만들고, 이 가상 돔을 비교하며 필요한 부분만 변경 시키는 렌더링 시스템을 구현했다. 이 시스템을 구현하며 생겼던 궁금증이 하나 있는데, 바로 리액트에서는 `key` 값을 어떻게 사용해서 렌더링을 최적화 하는지 였다. 이 게시글 에서는 그에 대한 부분을 다뤄보고자 한다.

## 리액트 소스코드 뜯어보기

key 값과 관련된 소스코드들을 알아보자.

리액트의 key를 활용한 최적화는 크게 세 가지 주요 함수로 이루어진다 (내가 찾아 봤을 땐...):

- updateFromMap: Map을 사용해 key로 요소를 찾는다
- updateSlot: 현재 위치에서 key 일치 여부를 확인한다
- reconcileChildrenArray: 전체적인 비교 로직을 조율한다

이제 각 함수를 자세히 살펴보자.

### updateFromMap과 updateSlot

리액트의 reconciliation 과정에서 핵심이 되는 두 함수다. `updateFromMap`은 Map을 사용해 key로 요소를 찾고, `updateSlot`은 현재 위치에서 key가 일치하는지 확인한다.

#### updateFromMap

이 함수는 Map에서 key를 사용해 일치하는 요소를 찾아 업데이트한다. 텍스트 노드처럼 key가 없는 경우는 index를 기준으로 처리한다.

```tsx
function updateFromMap(
  existingChildren: Map<string | number, Fiber>,
  returnFiber: Fiber,
  newIdx: number, // 텍스트 노드처럼 key가 없는 경우를 위한 인덱스
  newChild: any,
  lanes: Lanes
): Fiber | null {
  // 텍스트, 숫자, bigint 타입 처리
  if (
    (typeof newChild === "string" && newChild !== "") ||
    typeof newChild === "number" ||
    typeof newChild === "bigint"
  ) {
    // 텍스트 노드는 key가 없으므로 index로 찾음
    const matchedFiber = existingChildren.get(newIdx) || null;
    return updateTextNode(returnFiber, matchedFiber, "" + newChild, lanes);
  }

  // 리액트 엘리먼트 처리
  if (typeof newChild === "object" && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        // key가 있으면 key로, 없으면 index로 요소를 찾음
        const matchedFiber =
          existingChildren.get(newChild.key === null ? newIdx : newChild.key) ||
          null;
        // 찾은 요소를 사용해 업데이트
        return updateElement(returnFiber, matchedFiber, newChild, lanes);
      }
    }
  }
}
```

#### updateSlot

이 함수는 현재 위치에서 key 값을 비교해 일치하는지 확인한다. key가 일치하면 해당 요소를 업데이트하고, 불일치하면 null을 반환해 Map을 사용한 처리가 필요함을 알린다.

```tsx
function updateSlot(
  returnFiber: Fiber,
  oldFiber: Fiber | null,
  newChild: any,
  lanes: Lanes
): Fiber | null {
  // 이전 요소의 key 값 확인
  const key = oldFiber !== null ? oldFiber.key : null;

  // 텍스트, 숫자, bigint 타입 처리
  if (
    (typeof newChild === "string" && newChild !== "") ||
    typeof newChild === "number" ||
    typeof newChild === "bigint"
  ) {
    // 이전 요소에 key가 있었다면 매칭 실패
    if (key !== null) {
      return null;
    }
    // 텍스트 노드 업데이트
    return updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
  }

  // 리액트 엘리먼트 처리
  if (typeof newChild === "object" && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        // key가 일치하면 업데이트, 불일치하면 null 반환
        if (newChild.key === key) {
          return updateElement(returnFiber, oldFiber, newChild, lanes);
        } else {
          return null;
        }
      }
    }
  }
}
```

두 함수는 서로 다른 상황에서 호출된다:

- `updateSlot`: 첫 번째 패스에서 순서대로 비교할 때 사용
- `updateFromMap`: 두 번째 패스에서 순서가 변경된 요소를 찾을 때 사용

이런 이중 패스 방식으로 리액트는 요소의 순서 변경을 효율적으로 처리할 수 있다.

### reconcileChildrenArray

이 함수는 리액트가 children을 업데이트 하는 핵심 로직을 담당한다. 함수는 크게 세 단계로 동작한다:

1. 첫 번째 패스: 순서대로 순회하며 key가 일치하는 요소들을 업데이트
2. newChildren이나 oldFiber가 끝난 경우의 처리 (나머지 요소들을 추가하거나 제거)
3. 두 번째 패스: Map을 사용해 순서가 변경된 요소들을 처리

이런 방식으로 리액트는 요소들의 순서 변경을 효율적으로 처리할 수 있다.

```tsx
function reconcileChildrenArray(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChildren: Array<any>,
  lanes: Lanes
): Fiber | null {
  let resultingFirstChild: Fiber | null = null;
  let previousNewFiber: Fiber | null = null;

  let oldFiber = currentFirstChild;
  let lastPlacedIndex = 0;
  let newIdx = 0;
  let nextOldFiber = null;

  // 첫 번째 패스: key가 일치하는 요소들을 순서대로 처리
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    if (oldFiber.index > newIdx) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }

    // key 값을 비교해 일치하면 새로운 Fiber를, 불일치하면 null을 반환
    const newFiber = updateSlot(
      returnFiber,
      oldFiber,
      newChildren[newIdx],
      lanes
    );

    // key가 불일치하면 첫 번째 패스를 종료하고 Map을 사용한 처리로 넘어간다
    if (newFiber === null) {
      if (oldFiber === null) {
        oldFiber = nextOldFiber;
      }
      break;
    }

    if (shouldTrackSideEffects) {
      if (oldFiber && newFiber.alternate === null) {
        // Fiber는 매칭됐지만 재사용은 하지 않는 경우 기존 요소를 제거
        deleteChild(returnFiber, oldFiber);
      }
    }

    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
    previousNewFiber = newFiber;
    oldFiber = nextOldFiber;
  }

  // 새로운 children을 모두 처리한 경우
  if (newIdx === newChildren.length) {
    // 남은 이전 요소들을 모두 제거
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }

  // 이전 요소들을 모두 처리한 경우
  if (oldFiber === null) {
    // 남은 새로운 요소들을 모두 추가
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
      if (newFiber === null) {
        continue;
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      previousNewFiber = newFiber;
    }
    return resultingFirstChild;
  }

  // 두 번째 패스: 순서가 변경된 요소들을 Map을 사용해 처리
  const existingChildren = mapRemainingChildren(oldFiber);

  // Map을 사용해 남은 요소들의 위치를 찾아 처리
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChildren[newIdx],
      lanes
    );
    if (newFiber !== null) {
      if (shouldTrackSideEffects) {
        if (newFiber.alternate !== null) {
          // Fiber를 재사용한 경우 Map에서 제거
          existingChildren.delete(
            newFiber.key === null ? newIdx : newFiber.key
          );
        }
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
  }

  if (shouldTrackSideEffects) {
    // Map에 남아있는 요소들은 더 이상 필요없으므로 제거
    existingChildren.forEach(child => deleteChild(returnFiber, child));
  }

  return resultingFirstChild;
}
```

React의 reconciliation 과정에서 `updateSlot`이 `null`을 반환하는건 중요한 최적화 전략이다. 이 로직이 어떻게 동작하는지 살펴보자.

1. 첫 번째 패스에서 하는 일:

```javascript
// key 값이 일치하는지 확인하고 새로운 Fiber를 생성하거나 null을 반환
const newFiber = updateSlot(
  returnFiber,
  oldFiber,
  newChildren[newIdx],
  lanes,
);

if (newFiber === null) {
  // key가 매칭되지 않으면 첫 번째 패스를 중단하고
  // 두 번째 패스로 넘어간다
  break;
}
```

2. 두 번째 패스에서 하는 일:

```javascript
// 남은 모든 이전 요소들을 key를 기준으로 맵에 저장
const existingChildren = mapRemainingChildren(oldFiber);

// 맵을 사용해 남은 새로운 요소들 처리
for (; newIdx < newChildren.length; newIdx++) {
  const newFiber = updateFromMap(
    existingChildren,
    returnFiber,
    newIdx,
    newChildren[newIdx],
    lanes
  );
  // ...
}
```

이렇게 동작하는 이유는 다음과 같다:

1. **최적화를 위한 2단계 처리**

   - 첫 번째 패스: 순서가 변경되지 않은 요소들을 빠르게 처리한다
   - 두 번째 패스: 순서가 변경된 요소들을 Map을 사용해 처리한다

2. **효율적인 순서 변경 감지**

```javascript
   // before
   <div>A B C D</div>

   // after
   <div>B A D C</div>
```

- 첫 번째 패스에서 'A'와 'B'가 매칭되지 않으면 (`null` 반환)
- 두 번째 패스에서 Map을 사용해 재배치된 요소들을 찾는다

3. **불필요한 순회 방지**

- key가 매칭되지 않는 순간 첫 번째 패스를 중단한다
- 이는 O(n^2) 또는 O(n^3)의 복잡도를 피하기 위함이다

정리하면:

```javascript
// 1. key가 매칭되면: 새로운 Fiber 반환
// -> 해당 위치의 요소가 재사용 가능하다는 의미

// 2. key가 매칭되지 않으면: null 반환
// -> 순서가 변경되었을 수 있으니 Map을 사용한
//    두 번째 패스로 넘어가야 한다는 의미
```

이런 방식으로 React는:

1. 순서가 변경되지 않은 요소들은 빠르게 처리하고
2. 순서가 변경된 요소들은 Map을 사용해 효율적으로 처리하며
3. 불필요한 DOM 조작을 최소화

할 수 있게 된다.

## 정리

중복되는 내용이 꽤 보이네요. 특히 코드 설명 후 반복되는 내용과 정리 부분이 대부분 중복됩니다. 다음과 같이 개선하면 좋을 것 같습니다:

1. 각 코드 설명 바로 다음의 동작 설명 부분을 제거하고, 대신 코드 내 주석을 더 상세하게 작성

2. 마지막 정리 부분을 다음과 같이 실용적인 내용으로 교체:

````markdown
## 정리

지금까지 리액트가 key를 어떻게 사용해 렌더링을 최적화하는지 살펴봤다. 이를 통해 우리가 실제 개발할 때 고려해야 할 점들을 정리해보자.

### key 사용 시 주의사항

1. **index를 key로 사용하지 않기**

```jsx
// Bad
{
  items.map((item, index) => <Item key={index} {...item} />);
}

// Good
{
  items.map(item => <Item key={item.id} {...item} />);
}
```
````

index를 key로 사용하면 항목 순서가 바뀌었을 때 리액트가 효율적으로 처리할 수 없다.

2. **key값의 안정성 확보**

```jsx
   // Bad: 매 렌더링마다 새로운 key 생성
   <Item key={Math.random()} />

   // Good: 고유하고 안정적인 key 사용
   <Item key={`item-${id}`} />
```

key값은 항상 동일한 항목에 대해 동일한 값을 가져야 한다.

### key를 활용한 최적화 팁

1. **컴포넌트 재사용 강제하기**

```jsx
// 상태 초기화가 필요할 때
<Dialog key={`dialog-${id}`} />
```

key가 변경되면 컴포넌트가 완전히 새로 생성되는 점을 활용할 수 있다.

2. **리스트 최적화하기**

```jsx
// 리스트 항목의 위치가 자주 바뀌는 경우
const stableKey = useMemo(
  () => `${item.type}-${item.id}`,
  [item.type, item.id]
);
```

복잡한 리스트에서는 안정적인 key 생성 로직을 구현하는 것이 중요하다.

이러한 최적화 전략을 잘 활용하면 불필요한 리렌더링을 줄이고, 애플리케이션의 성능을 크게 개선할 수 있다. 특히 리스트 형태의 UI를 다룰 때 key를 어떻게 설정하느냐에 따라 성능 차이가 크게 날 수 있으니 주의하자.
