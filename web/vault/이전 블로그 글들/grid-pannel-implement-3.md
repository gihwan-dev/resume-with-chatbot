---
author: Gihwan-dev
pubDatetime: 2024-06-12T12:10:11.729Z
title: 내가 최근에 하는 일
slug: recent-my-daily-2024-06-12
featured: true
draft: false
tags:
  - daily
  - rust
  - career
description: 최근 바쁜 일상을 공유하고 회고하기 위해 작성하는 글입니다.
---

정신없는 하루 하루를 보내는 요즘인것 같다. 최근엔 나는 어떤 개발자가 되어야 할까? 하는 고민을 많이 하는것 같다.

## Table of contents

## 지난 2주간 내가 한 일들

2주간 정말 많은 일들을 했다. 고민도 많이 했고 개발도 적당히 했다.

### 그리드 패널 버그 수정하기

그리드 패널에 버그가 있었다. 마우스를 빠르게 움직이면 컴포넌트가 마우스를 못따라 가는 문제가 있었다. 이벤트가 발생하고 컴포넌트의 위치가 **수정되는 속도보다 마우스의 이동 속도가 빠르면** 마우스가 컴포넌트 내부를 벗어나며 생기는 문제였다.

그래서 그냥 `mouse down` 되는 순간 `mouse move` 이벤트를 `document`에 붙였다. 해당 `mouse move` 이벤트에서 하는 동작은 동일하다.

**[커스텀 훅]**

```ts
const onMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    size: { width: number; height: number },
    component: React.FC,
  ) => {
    e.preventDefault();
    const dragWidgetContainer = getDragWidgetContainer({
      gridItemWidth,
      gridItemHeight,
      widgetSize: size,
    });

    const widgetRoot = createRoot(dragWidgetContainer);

    const targetComponent = createElement(component);

    const dragLayerElement = getDragLayerElement();

    widgetRoot.render(targetComponent);

    dragLayerElement.appendChild(dragWidgetContainer);

    addStyleForDragContainer({
      offsetX: e.clientX,
      offsetY: e.clientY,
      containerWidget: dragWidgetContainer,
    });

    addMouseMoveEvent({
      widgetContainer: dragWidgetContainer,
      setOffset: throttledSetOffset,
    });
    // -- 생략 --
```

**[`addMouseMoveEvent` 함수 내부]**

```ts
export const addMouseMoveEvent = ({
  widgetContainer,
  setOffset,
}: AddMouseMoveEventState) => {
  const { width, height } = getElementWidthAndHeight(widgetContainer);

  const mouseMoveHandler: EventListenerOrEventListenerObject = e => {
    const { x, y } = getMousePosition(e as MouseEvent);

    addStyleToDomNode({
      target: widgetContainer,
      style: {
        left: `${x - width / 2}px`,
        top: `${y - height / 2}px`,
      },
    });

    setOffset(x, y);
  };

  document.addEventListener("mousemove", mouseMoveHandler);

  listener.set(widgetContainer, mouseMoveHandler);
};
```

`listener`는 `WeakMap<HTMLElement, EventHandler>` 의 키, 값 쌍을 가지는 데이터 구조다. `MouseUp` 이벤트에서 `document`의 이벤트를 제거하는데 사용된다.

이렇게 하니 잘 해결 되었다.

### `Rust` 공부

이력서 열심히 넣고 있고, 새삼 경기가 안좋다는걸 몸소 느끼는 하루하루다... 그러던 중에 우연찮게 `Rust` 기반 `wasm` 프론트엔드 개발자 공고에 서류가 붙었고 코딩테스트를 치게 되었다.

근데... 평소 함수형 프로그래밍에 관심이 있었고 `Rust`를 여기저기서 자주 들어봤던지라.... 흥미가 생겼다. 마음에 불이 붙었고 합격을 목표로 최대한 열심히 해보기로 했다.

러스트 `The book` 이라는 책을 샀다. 하루에 거의 100페이지? 넘게 읽었던 것 같다. 1주일이 지난 지금은 `chapter 18`을 읽고 있고 어제부턴 `Rust`로 알고리즘 문제를 푸는데 집중하는 중이다.

`Rust`가 생각보다 재밌는 언어였다. 그리고 `JavaScript`가 얼마나 유연하지만 안전하지 않은 언어인지도 알게 됐다. 내가 에러를 핸들링 하는데 얼마나 신경써야 하는지도 자연스럽게 배우게 되더라...

일단 계속 `Rust`를 사용 해보려 한다. 이번 코딩 테스트, 면접이 좋지 않은 결과로 나오더라도 너무 프론트엔드에만 집중하지 않기로 했다. 무엇이든 될 수 있는 소프트웨어 엔지니어가 되기로 했다. 전문성을 유지하되 가능성을 너무 좁히진 않으려 한다.

### 토스 서류 합격...?

예상치도 못했다. 항해99 플러스 프론트엔드 1기 수료했고, 제법 열심히 했다. 상위 1퍼센트라는 검은색 뱃지도 받았으니 열심히 한거 아닐까?

어쨌든 항해99 플러스 프론트엔드 매니저님이 몇명 토스뱅크랑 채용 연계 해준다고 이력서 제출하라 하셨어서 했었는데 솔직히 안될거라 생각했다. 원티드 사람인 이력서 총합 50개 가까이 제출하고 겨우 2개 붙는 중인데 붙일리가 없다고 생각하긴 했다.

실제로 임팩트있는 프로젝트가 부족해서 다른 부트캠프도 열심히 지원하는 중이였다.

그런데 오늘 붙었다는 연락이 왔다. 왜 붙은거지 싶긴 하다. 일단 열심히 준비해보려 한다.

### 1년 중 절반 밖에 안지났다

좀 더 열심히 하고 싶다. 다만 쉽지 않다. 잠을 줄이거나 운동을 하지 않으면 2시간 정도는 더 할 수 있을 것 같다. 다만 그래서는 오래 하지 못할거라 생각된다. 아직 6개월이나 더 남았다. 조급해 하지 않고 남은 6개월은 뭘 하든 최선을 다해서 이력서 가장 앞부분에 추가될 프로젝트를 하나 더 하거나, 취업 하거나 둘 중 하나는 반드시 해야겠다.

> 열심히 살자!
