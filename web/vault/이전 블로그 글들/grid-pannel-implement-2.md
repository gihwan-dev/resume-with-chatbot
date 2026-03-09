---
author: Gihwan-dev
pubDatetime: 2024-05-26T08:01:35.146Z
title: 위젯을 붙여넣을 그리드 패널을 구현해 보았습니다. - 2편
slug: widget-grid-panel-implement-2
featured: true
draft: false
tags:
  - development
  - monorepo
  - project
description: 위젯을 붙여넣을 그리드 패널을 구현하며 배우고 느낀점을 적었습니다.
---

지난 포스트에서 위젯을 드래그 앤 드롭 할때 그리드 패널에서 붙여 넣어질 영역에 대해 색상을 통해 알려주는 작업을 진행했습니다. 이번에는 실제로 붙여넣는 기능을 구현했고 이 과정에서 만난 문제와 해결책을 공유해 보겠습니다. 우선 최종 결과물에 대해서 미리 공유 드리겠습니다.

<img src="https://yjyu5vmwl6r2b5yt.public.blob.vercel-storage.com/blog/panel-drag-and-drop-ZhwtcXuZbowe4ln7ZwjOCRKtiT5EdK.gif" alt="drag-and-drop-result" />

## Table of contents

## 기능요구사항

- 그리드 패널의 활성화된 부분에 위젯을 붙여넣을 수 있어야 한다.

## 현재 진행사항 까지의 문제점

현재 드래그 앤 드롭을 진행하는 컴포넌트는 붙여 넣어질 컴포넌트와 다른 컴포넌트다. 사이드바에서 어떤 위젯에 대한 정보를 간략하게 제공하는 위젯 컴포넌트일 뿐이다.

### drag 관련 이벤트를 오버라이드 하기 힘들다

초기에 `dragStart` 함수를 먼저 오버라이드 했다. `dragStart` 이벤트가 시작되면 붙여 넣어져야 하는 **컴포넌트가 커서 위치에 등장**하게 했다. 여기서 생긴 문제는 다음과 같았다.

> drag 이벤트 핸들러의 `event` 인자를 통해 `event.preventDefault()`를 하게되면 이후 `onDrag()` 이벤트가 호출되지 않는다.

그렇기에 HTML5에서 제공하는 `drag`이벤트가 아닌 `onMouseDown`, `onMouseMove`, `onMouseUp` 이벤트를 통해 커스텀 드래그 이벤트를 구현하기로 했다.

각 이벤트 핸들러에서 어떤 요구사항을 충족시켜야 하는지 정리해보자.

## onMouseDown

마우스를 클릭했을때의 동작이다. 지금 내가 구현하려는 동작에서 중요한점이 있다.

1. 드래그를 시작하게 되는 컴포넌트는 사이드바에 존재하는 위젯 컴포넌트다. `mouse down`이벤트는 이 컴포넌트에 추가되어야 한다.
2. 드래그되어 드롭이 되는 컴포넌트는 실제 위젯 컴포넌트다. 그렇기에 `mouse move`, `mouse up` 이벤트는 함수의 인자로 받고있는 이 컴포넌트에 추가되어야 한다.

이제 어떤 기능이 구현되어야 하는지 정리해보자.

1. 사이드바 위젯을 클릭했을 때 실제 위젯 컴포넌트가 반투명한 배경으로 화면에 나타나야 한다.
2. 실제 위젯 컴포넌트에 `mouse move`, `mouse up` 이벤트를 등록해줘야 한다.

### onMouseDown 실제 구현 코드

실제 코드를 살펴보자.

```ts
const onMouseDown = (
  e: React.MouseEvent<HTMLDivElement>,
  size: { width: number; height: number },
  component: React.FC
) => {
  e.preventDefault();
  const dragWidgetContainer = getDragWidgetContainer({
    gridItemWidth,
    gridItemHeight,
    widgetSize: size,
  });

  const targetElement = createRoot(dragWidgetContainer);

  const targetComponent = createElement(component);

  const dragLayerElement = getDragLayerElement();

  targetElement.render(targetComponent);

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

  addMouseUpEvent({
    widgetContainer: dragWidgetContainer,
    resetDragState,
    resetPanelState,
    size,
  });

  setOffset(e.clientX, e.clientY);
  setWidgetSize(size.width, size.height);
};
```

1. 드래그 되는 위젯의 컨테이너 요소를 만들어 준다.
2. 컨테이너 위젯에 리액트 컴포넌트를 렌더링 시켜 준다.
3. 실제 `DOM`에 마운트 되어있는 `div` 요소에 자식으로 추가 해준다. (`dragLayer`는 드래그를 위해 `HTML`에 추가한 id로 `drag-layer`를 가지는 `div`요소 입니다.)
4. 컨테이너 요소에 스타일을 추가한다.

스타일 추가 코드:

```ts
export const addStyleForDragContainer = ({
  offsetX,
  offsetY,
  containerWidget,
}: AddStyleForDragContainerState) => {
  const width = containerWidget.offsetWidth;
  const height = containerWidget.offsetHeight;

  containerWidget.style.position = "fixed";
  containerWidget.style.zIndex = "1000";
  containerWidget.style.left = `${offsetX - width / 2}px`;
  containerWidget.style.top = `${offsetY - height / 2}px`;
  containerWidget.style.opacity = "0.7";
};
```

## onMouseMove

`onMouseMove` 이벤트는 위 코드에서 보이는것 처럼 실제 위젯 컴포넌트가 `DOM`에 추가될 때 등록해줘야 한다.

코드를 살펴보자.

### onMouseMove 실제 구현 코드

```ts
export const addMouseMoveEvent = ({
  widgetContainer,
  setOffset,
}: AddMouseMoveEventState) => {
  widgetContainer.addEventListener("mousemove", e => {
    const clientX = e.clientX;
    const clientY = e.clientY;
    setOffset(clientX, clientY);
    const width = widgetContainer.offsetWidth;
    const height = widgetContainer.offsetHeight;
    widgetContainer.style.left = `${clientX - width / 2}px`;
    widgetContainer.style.top = `${clientY - height / 2}px`;
  });
};
```

간단한 구현이다. 현재 드래그 앤 드롭 되는 `DOM`요소의 `left`, `top` 값을 `e.clientX`, `e.clientY`로 변경해주면 된다. 다만 중요한 점은 `left`와 `top`은 요소의 왼쪽 상단 꼭짓점이 기준이기 때문에 요소의 중앙 위치와 커서의 위치를 맞춰줘야 한다는 점이다.

## onMouseUp

가장 구현이 어려웠다. 실제 그리드 패널에 붙여 넣어야 하기 때문이다. 이 구현은 다음과 같이 진행하기로 했다.

1. 실제 보여지는 그리드 패널 위에 가상의 그리드 패널을 추가한다.
2. 가상의 그리드 패널에 `grid-area` 스타일을 이용해서 행과 열의 시작과 끝 값으로 위젯을 정해진 위치에 추가한다.

[`grid-area`에 대한 정보](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-area)

### 가상 그리드 패널 추가

다음과 같이 가상의 그리드 패널을 추가했다.

```tsx
export default function PanelGridContainer() {
  const itemAmount = 12 * 12;

  return (
    <>
      <ul className="grid h-full w-full grid-cols-12 grid-rows-12">
        {Array.from({ length: itemAmount }, (v, k) => k).map((value, index) => (
          <PanelGridItem index={index} key={`panel-grid-item-${value}`} />
        ))}
      </ul>
      <ul
        className="absolute left-0 top-0 z-50 grid h-full w-full grid-cols-12 grid-rows-12"
        id="virtual-grid"
      />
    </>
  );
}
```

### 그리드 패널에서 활성화된 영역의 column, row에 대한 정보 얻기

지난번까지 활성화된 영역의 배경색을 변경하는 작업을 했었다. 거기서 힌트를 얻어 다음과 같이 구현했다.

```ts
useEffect(() => {
  if (gridItemRef.current) {
    const rect = gridItemRef.current.getBoundingClientRect();
    const area = getArea({
      offsetX,
      offsetY,
      elementWidth: rect.width,
      elementHeight: rect.height,
      size: widgetSize,
    });
    setArea(area);
    const elementInArea = isElementInArea({
      elementLeft: rect.left,
      elementTop: rect.top,
      elementWidth: rect.width,
      elementHeight: rect.height,
      ...area,
    });

    if (elementInArea) {
      gridItemRef.current.className = `${basicClassName} bg-gray-200 grid-active-item`;
    } else {
      gridItemRef.current.className = basicClassName;
    }
  }
}, [offsetX, offsetY, widgetSize, currentIndex, setArea]);
```

간단하게 활성화된 그리드 요소에 `grid-active-item`이라는 클래스 명을 추가해준다. 그리고 이 클래스 명을 가지는 요소들을 다음과 같이 받아온다. 그리고 다음과 같이 각 그리드 요소가 `index`를 `id`로 가지도록 했다.

```ts
export default function PanelGridItem({ index }: PanelGridItemProps) {
  const { ref, setCurrentIndex } = usePanelState();

  useEffect(() => {
    setCurrentIndex(index);
  }, [setCurrentIndex, index]);

  return <li id={`grid-item-${index}`} ref={ref} />;
}
```

```ts
const getActiveGridItem = () => {
  return document.querySelector(".grid-active-item");
};
```

이렇게 하면 `DOM`에서 `grid-active-item`을 클래스명으로 가지는 요소를 알 수 있고, 이 요소의 `id`를 통해 그리드 요소의 `index`를 알 수 있다. 이제 `size`값만 있다면 그리드 `column`과 `row`의 시작 끝에 대해서 계산할 수 있다. `size` 값은 `zustand`의 스토어를 통해 저장되어 있으니 이 정보를 토대로 다음과 같이 `column`의 시작과 끝 `row`의 시작과 끝을 얻는다.

```ts
const getGridArea = ({ startIndex, size }: GridAreaState) => {
  const startElementIndex = startIndex;
  const columnStart = Math.floor(startElementIndex % 12) + 1;
  const rowStart = Math.floor(startElementIndex / 12) + 1;

  return {
    gridArea: `${rowStart} / ${columnStart} / ${rowStart + size.height} / ${columnStart + size.width}`,
  };
};
```

이제 붙여넣기 위해 필요한 일들은 끝났다. 단순하게 붙여 넣기만 하면 된다.

### 붙여넣기

`onMouseUp`이벤트를 구현해보자.

```ts
export const addMouseUpEvent = ({
  widgetContainer,
  resetDragState,
  resetPanelState,
  size,
}: AddMouseUpEventState) => {
  widgetContainer.addEventListener("mouseup", () => {
    const activeGridItem = getActiveGridItem();

    if (!activeGridItem) {
      // TODO: 에러 처리
      return;
    }

    const startIndex = Number(activeGridItem.id.split("-")[2]);

    const { gridArea } = getGridArea({
      startIndex,
      size,
    });

    const virtualGrid = getVirtualGrid();

    const newContainer = document.createElement("div");
    const children = widgetContainer.childNodes[0];

    newContainer.style.gridArea = gridArea;

    newContainer.style.position = "relative";
    newContainer.style.zIndex = "0";
    newContainer.style.left = "0";
    newContainer.style.top = "0";

    if (children) {
      newContainer.appendChild(children);
    }

    virtualGrid.appendChild(newContainer);

    widgetContainer.remove();
    resetDragState();
    resetPanelState();
  });
};
```

1. `getActiveItem`를 통해 활성화된 그리드 요소 중 가장 첫번째 요소를 가져온다.
2. 가져온 요소의 `id`값에서 `index` 값을 추출한다.
3. `getGridArea`를 통해 `gridArea` 스타일 값을 받아온다.
4. 가상 그리드 패널을 가져온다.
5. 새로운 요소 컨테이너를 생성한다.
6. 현재 드래그 되고 있던 컨테이너에서 자식 요소를 받아온다.
7. 새 컨테이너에 스타일을 적용한다.
8. 새 컨테이너에 위젯을 자식으로 추가해준다.
9. 가상 그리드 패널에 새 컨테이너를 추가한다.
10. 기존 드래그와 관련된 모든 상태를 초기화 시킨다.

## 완성

이렇게 하면 다음처럼 동작하는 드래그 앤 드랍 위젯과 패널이 나온다!

<img src="https://yjyu5vmwl6r2b5yt.public.blob.vercel-storage.com/blog/panel-drag-and-drop-ZhwtcXuZbowe4ln7ZwjOCRKtiT5EdK.gif" alt="drag-and-drop-result" />

## 배운점

### 설계에 대한 고민

이번에 앱을 진행하기 전에 아키텍쳐를 정리하기 위해 고민을 많이 했다.

- `useDrag`: 드래그와 관련된 로직을 수행한다.
- `usePanelState`: 그리드 패널에 관련된 로직을 수행한다.

컴포넌트 내부에는 렌더링만 실시하고 비즈니스 로직은 전부 커스텀 훅에서 처리하도록 했다.

어쨌든 완벽하지 않지만 이렇게 관심사를 분리하고 진행하니 어디에서 내가 코드를 수정해야 하는지 명확한 느낌이 들었다.

### 컴포넌트를 동적으로 렌더링해 DOM에 추가하기

이전에 이렇게 해야할 일이 잘 없었던 것 같다. 어떻게 함수의 인자로 받은 요소를 `DOM`에 추가할 수 있지? 라는 고민을 많이 했고 `createRoot`와 `render`를 통해 생성해서 `DOM Api`로 추가할 수 있다는걸 알았다.
