---
author: Gihwan-dev
pubDatetime: 2024-05-24T10:55:04.108Z
title: 위젯을 붙여넣을 그리드 패널을 구현해 보았습니다. - 1편
slug: widget-grid-panel-implement
featured: true
draft: false
tags:
  - development
  - monorepo
  - project
description: 위젯을 붙여넣을 그리드 패널을 구현하며 배우고 느낀점을 적었습니다.
---

사이드 프로젝트로 깃허브 대시보드를 개발하고 있습니다. 이번에 가장 어려운 요구사항 중 하나인 위젯 붙여넣기를 구현하고 있는데 이 작업을 진행하면서 있었던 일들을 공유해보려 합니다.

## Table of contents

## 요구사항

이 앱의 요구사항은 다음과 같았습니다.

```md
# 요구사항 명세서

## 기능 요구사항

### 기본 기능

- **깃허브 잔디 조회:** 사용자는 일일, 주간, 월간 단위로 깃허브 잔디(커밋 기록)를 조회할 수 있어야 한다.(위젯)
- **빈 잔디 심기:** 사용자는 빈 잔디(커밋 누락)를 손쉽게 심을 수 있어야 한다.
- **활동 비교 기능:** PR, 이슈 등의 개수를 비교하여 보여줄 수 있어야 한다.(위젯)
- **리포지토리 리스트 조회:** 사용자는 자신의 리포지토리 리스트를 조회할 수 있어야 한다.(위젯)

### 사용자 개인화 및 설정

- **테마 설정:** 사용자는 대시보드의 테마를 밝은 모드와 어두운 모드 중에서 선택할 수 있어야 한다.
- **리포지토리 선호도 설정:** 사용자는 관심 있는 리포지토리를 선호도에 따라 정렬하여 볼 수 있어야 한다.(보류))
- **대시보드 커스터마이즈:** 사용자는 대시보드 위젯을 자신의 필요에 맞게 배열하고 크기를 조절할 수 있어야 한다.

### 활동 통계 및 알림

- **커밋 활동 패턴 분석:** 사용자의 커밋 활동 패턴(예: 가장 활동적인 시간대, 요일)을 분석하여 보여줄 수 있어야 한다.(위젯)
- **맞춤형 알림:** 사용자는 GitHub 활동에 기반한 맞춤형 알림을 설정할 수 있어야 한다(예: 일정 기간 동안 활동이 없을 때, 새로운 이슈나 PR이 생성될 때 등).

### 확장성 및 사용자 인터페이스

- **위젯 기반 구조:** 각 기능은 독립적인 위젯 형태로 구현되어야 하며, 이를 통해 앱의 확장성을 보장한다.
- **위젯 드래그 앤 드롭:** 사용자는 위젯을 드래그 앤 드롭을 통해 간단하게 화면에 추가할 수 있어야 한다.
- **그리드 기반 디스플레이:** 각 위젯을 드래그 앤 드롭 할 때 그리드 레이아웃을 기반으로 붙여넣을 수 있다.
```

## 아키텍쳐 분석하기

위 내용을 토대로 추상화된 아키텍쳐를 구상해 보았습니다. 그리고 그 결과는 다음과 같았습니다.

```md
# 개발 기능 명세서

## 로그인 페이지

- Github 로그인이 가능한 UI가 있어야 한다.
- Github 로그인이 가능해야 한다.
- 로그인 실패시 에러 다이얼로그를 보여준다.
- 로그인 성공시 메인 페이지로 리디렉션 한다.

## 메인 페이지

### 사이드바

- 사이드바에서 위젯 목록을 보여줄 수 있어야 한다.
- 테마 버튼을 통해 테마를 변경할 수 있어야 한다.

### 위젯

- 위젯을 드래그 앤 드롭 할 수 있어야 한다.
- 위젯의 위치를 알려줄 수 있어야 한다.
- 드래그 앤 드롭 시 위젯의 실제 사이즈 형태가 투명하게 보여야 한다.
- 사이드바에서 위젯은 이미지와 타이틀로 이루어져 있다.
- 호버시 자세한 설명을 볼 수 있어야 한다.

### 앱바

- 테마 변경 버튼을 통해 다크모드 와 라이트모드를 스위칭 할 수 있어야 한다.
- 로고를 보여줄 수 있어야 한다.

### 그리드 패널

- 12 x 12의 그리드 패널을 볼 수 있어야 한다.
- 그리드를 점선으로 표현할 수 있어야 한다.
- 패널의 기본 크기가 존재하며 크기를 수정할 수 있어야 한다.
- 더하기 버튼을 통해 패널 사이즈를 추가할 수 있어야 한다.
- 위젯의 위치와 크기를 토대로 어떤 그리드 패널에 놓일지 계산할 수 있어야 한다.
- 계산된 값을 토대로 위젯이 놓여질 패널이 어디인지 알려줄 수 있어야 한다.
- 위젯을 드랍 했을 때 활성화된 위치에 그 크기만큼의 위젯이 위치해야 한다.
- 붙여넣은 위젯들의 위치를 수정할 수 있어야 한다.
- 수정시에도 추가할 때의 드래그 앤 드랍할 때와 똑같이 동작해야 한다.

## 개발시 주의 사항

- 에러, 로딩 상태를 어디서 관리할 것인지에 대해서 계속 고민한다.
- 액션, 계산, 데이터를 생각하며 개발한다.
- TDD를 적용해서 개발한다.
```

## 개발 진행

위 요구 사항을 토대로 개발을 진행했습니다. 우선 존재하는 위젯들의 정보에 대한 리스트가 필요했습니다. 위젯에 대해 필요한 정보는 다음과 같습니다.

- **이름**: 사이드바 위젯 리스트에 표시될 위젯 이름
- **설명**: 사이드바의 위젯을 호버 했을 때 나타날 위젯에 대한 설명
- **너비, 높이**: 위젯의 너비와 높이
- **컴포넌트**: 드래그 되고 있는 컴포넌트에 대한 정보

### 리스트 정보 선언

해당 리스트에 대한 정보를 `features/widget/index.ts` 에서 `export` 해줍니다.

```ts
export const widgetList = [
  {
    width: 3,
    height: 3,
    name: "TestItem1",
    description: "some description",
    component: TestItem,
  },
  {
    width: 2,
    height: 1,
    name: "TestItem2",
    description: "some description",
    component: TestItem,
  },
  {
    width: 5,
    height: 5,
    name: "TestItem3",
    description: "some description",
    component: TestItem,
  },
];
```

이제 해당 정보를 이용해 사이드바에 리스트 시킵니다. 해당 코드는 간단한 동작이라 생각되어 생략했습니다.

### 드래그와 관련된 처리를 하는 커스텀 훅 구현

이제 드래그와 관련된 처리를 진행할 커스텀 훅을 만듭니다. 앱 전체에서 사용될 훅으로 예상되어 `hooks/useDrag.ts` 로 만들어 줍니다. 이후 다음 3가지 함수를 선언합니다.

```ts
export default function useDrag() {
  const onDragStart = (
    e: React.DragEvent,
    size: { width: number; height: number }
  ) => {
    // TODO: 드래그 시작시 동작 구현
  };

  const onDrag = (e: React.DragEvent) => {
    // TODO: 드래그 동작 구현
  };

  const onDragEnd = () => {
    // TODO: 드래그 끝났을 때 동작 구현
  };

  return {
    onDragStart,
    onDrag,
    onDragEnd,
  };
}
```

각 `onDrag`, `onDragStart`, `onDragEnd` 함수에서 어떤 동작을 해야 하는지 살펴보자.

- `onDragStart`: 드래그를 시작하는 컴포넌트에 대한 정보를 설정 해줘야 하며 드래그 시작 위치에 대한 정보를 설정해야 한다.
- `onDrag`: 드래그 되고 있는 위젯의 위치에 대해서 계속해서 업데이트 해줘야 한다.
- `onDragEnd`: 드래그를 끝냈음에 대한 설정을 해줘야 한다.

위 정보를 토대로 함수를 작성해야 한다. 드래그에 대한 정보는 전역 상태로 관리하며 이 상태에 필요한 정보는 다음과 같다.

- `isDragging`: 드래그 되고 있는지를 나타내는 `boolean`값
- `offsetX`: 위젯 위치에 대한 X축 좌표
- `offsetY`: 위젯 위치에 대한 Y축 좌표
- `widgetName`: 위젯 이름
- `widgetSize`: `width`와 `height`를 가지는 객체

이제 `zustand` 스토어를 생성해 보자. 생성된 `store`의 코드는 다음과 같다.

```ts
import { create } from "zustand";

interface DragStoreState {
  isDragging: boolean;
  offsetX: number;
  offsetY: number;
  widgetSize: { width: number; height: number };

  resetDragState: () => void;
  setOffset: (offsetX: number, offsetY: number) => void;
  setIsDragging: (isDragging: boolean) => void;
  setWidgetSize: (width: number, height: number) => void;
}

export const useDragStore = create<DragStoreState>()(set => ({
  isDragging: false,
  offsetX: 0,
  offsetY: 0,
  widgetName: "",
  widgetSize: {
    height: 0,
    width: 0,
  },

  resetDragState: () => {
    set(_ => ({ isDragging: false, offsetX: 0, offsetY: 0, widgetName: "" }));
  },
  setOffset: (offsetX, offsetY) => {
    set(_ => ({ offsetX, offsetY }));
  },
  setIsDragging: isDragging => {
    set(_ => ({ isDragging }));
  },
  setWidgetSize: (width, height) => {
    set(_ => ({ widgetSize: { width, height } }));
  },
}));
```

이제 `onDragStart`를 구현해보자.

#### onDragStart

대단한 동작은 없다. 드래그 되는 위젯에 대한 정보를 넘겨주면 된다.

```ts
const onDragStart = (
  e: React.DragEvent,
  size: { width: number; height: number }
) => {
  setIsDragging(true);
  setOffset(e.clientX, e.clientY);
  setWidgetSize(size.width, size.height);
};
```

#### onDrag

드래그 되고 있는 위젯의 위치에 대한 정보를 넘겨준다.

```ts
const onDrag = (e: React.DragEvent) => {
  setOffset(e.clientX, e.clientY);
};
```

#### onDragEnd

아직 덜 구현된 상태 수정 되어야 한다. 그러나 지금은 그리드 드래그 앤 드랍의 정보를 기록하고 그리드 패널에서 이 정보를 해석하는 것까지가 목표이기 때문에 이대로 한다. 간단하게 그냥 `reset`을 현재는 수행하고 있다.

```ts
const onDragEnd = () => {
  resetDragState();
};
```

이제 여기서 `onDrag` 함수에 `throttle`을 적용해서 특정 시간 단위로만 호출되게 하자. 그렇지 않으면 너무 많이 호출 된다. `lodash`를 사용했고 완성된 코드는 다음과 같다.

```ts
import type React from "react";
import { useCallback } from "react";
import _ from "lodash";
import { useDragStore } from "~/stores/useDragStore";

export default function useDrag() {
  const { setIsDragging, setOffset, resetDragState, setWidgetSize } =
    useDragStore();

  const onDragStart = (
    e: React.DragEvent,
    size: { width: number; height: number }
  ) => {
    setIsDragging(true);
    setOffset(e.clientX, e.clientY);
    setWidgetSize(size.width, size.height);
  };

  const onDrag = (e: React.DragEvent) => {
    setOffset(e.clientX, e.clientY);
  };

  const onDragEnd = () => {
    resetDragState();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- for performance optimization
  const throttledOnDrag = useCallback(_.throttle(onDrag, 100), []);

  return {
    onDragStart,
    onDrag: throttledOnDrag,
    onDragEnd,
  };
}
```

이렇게 정보를 넘겨주는 과정은 끝이 났다. 이제는 그리드 패널에서 이 정보를 해석하는 작업을 해보자.

### 그리드 패널과 관련된 드래그 정보를 처리하는 커스텀 훅 구현

이 훅은 그리드 패널에서만 사용하는 훅이기에 `features/panel/hooks/usePanelState.ts`로 만들어 준다.

우선 알아야 할 정보에 대해서 설명하겠다. 그리드 패널은 차지할 수 있는 모든 너비와 높이를 차지한다. 그리고 해당 패널 내부에는 144개의 그리드 아이템이 존재한다. 즉 UI로 보자면 다음과 같다.

![panel ui](panel.png)

필요한 동작은 각 그리드 요소들이 위젯 사이즈 만큼의 영역 만큼 active 상태로 변경되어야 한다. 즉 위젯이 어디에 놓을지 각 그리드 요소의 색상을 통해 나타내주는 것이다.

필요한 작업에 대해 정리해보자. 다음과 같은 로직이 필요하다.

- 위젯의 드래그 정보를 토대로 현 위젯이 활성화 되어야 하는지 그렇지 않은지에 대해 알려줄 수 있어야 한다.

위 동작을 구현하기 위해 추가적으로 필요한 데이터는 뭐가 있을까? 다음과 같다.

- 그리드 요소의 X, Y축 좌표
- 그리드 요소의 너비, 높이

필요한건 커서의 위치를 토대로 드래그의 좌표가 들어오므로 커서 위치에서 어느정도 크기의 영역이 생성되는지 계산할 수 있어야 한다. 다음 그림을 보자

![panel-drag-info](panel-drag-info.png)

즉 위처럼 포인터를 기준으로 위젯의 너비, 높이를 기준으로 영역이 생기고 해당 영역에 중심점이 들어와있는 위젯은 `active` 상태가 되어야 한다.

요소가 영역에 들어와있는지 확인하는 유틸리티 함수인 `isElementInArea` 함수를 작성해보자. 다음과 같은 코드가 나온다.

```ts
interface Index {
  offsetX: number;
  offsetY: number;

  elementLeft: number;
  elementTop: number;
  elementWidth: number;
  elementHeight: number;
  size: {
    width: number;
    height: number;
  };
}

export function isElementInArea({
  elementLeft,
  elementTop,
  elementWidth,
  elementHeight,
  offsetX,
  offsetY,
  size,
}: Index) {
  const areaLeft = offsetX - (size.width / 2) * elementWidth;
  const areaRight = offsetX + (size.width / 2) * elementWidth;
  const areaTop = offsetY - (size.height / 2) * elementHeight;
  const areaBottom = offsetY + (size.height / 2) * elementHeight;

  const elementCenterX = elementLeft + elementWidth / 2;

  const elementCenterY = elementTop + elementHeight / 2;

  return (
    elementCenterX >= areaLeft &&
    elementCenterX <= areaRight &&
    elementCenterY >= areaTop &&
    elementCenterY <= areaBottom
  );
}
```

이제 이를 `usePanelState` 커스텀 훅에서 이를 사용해보자.

```ts
import { useEffect, useRef } from "react";
import { useDragStore } from "~/stores/useDragStore";
import { isElementInArea } from "~/features/panel/utils";

const basicClassName = "border transition-all duration-200";

export default function usePanelState() {
  const { offsetX, offsetY, widgetSize } = useDragStore();
  const gridItemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (gridItemRef.current) {
      const rect = gridItemRef.current.getBoundingClientRect();
      const elementInArea = isElementInArea({
        offsetX,
        offsetY,
        elementLeft: rect.left,
        elementTop: rect.top,
        elementWidth: rect.width,
        elementHeight: rect.height,
        size: widgetSize,
      });

      if (elementInArea) {
        gridItemRef.current.className = `${basicClassName} bg-blue-200`;
      } else {
        gridItemRef.current.className = basicClassName;
      }
    }
  }, [offsetX, offsetY, widgetSize]);

  return {
    ref: gridItemRef,
  };
}
```

`useRef`를 사용해서 각 요소의 위치에 대한 정보를 알아내고 이 정보를 토대로 요소가 영역 안에 있는지 확인한다. 그리고 영역 내부에 있는지 여부에 따라 `className`을 업데이트 한다. 이렇게 하면 다음과 같이 동작하는 앱을 완성할 수 있다.

<img alt="panel-play-gif" src="https://yjyu5vmwl6r2b5yt.public.blob.vercel-storage.com/panel-play-OfenfIe3iurYHYWFrZUqgGtOUjETiS.gif">
