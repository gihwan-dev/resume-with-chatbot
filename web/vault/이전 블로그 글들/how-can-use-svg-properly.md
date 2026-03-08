---
author: Gihwan-dev
pubDatetime: 2024-09-17T07:25:40.973Z
title: 아이콘을 적절하게 다뤄보자!
slug: how-can-i-use-svg-properly
featured: true
draft: false
tags:
  - react
  - svg
  - optimization
description: 프로젝트를 진행하며 만난 다양한 아이콘 관련 문제를 해결하며 작성한 글입니다.
---

프로젝트 개발이 끝나고 QA를 진행하면서 아이콘이 사용된 UI에서 레이아웃 시프팅이 발생하는걸 확인했다. 확인해보니 팀원분이 svg 아이콘을 img 태그의 src로 받아오는데 width 와 height를 설정하지 않아 발생한 문제였다. 모든 아이콘 사용을 현재는 svgr을 통해 사용하고 있는 상황이며 추후에 최적화를 적용해보려 한다.

문제는 해결 되었는데 svg를 어떻게 사용해야 적절하게 사용할 수 있을까? 하는 고민이 들었다. 그래서 한 번 알아봤다.

## Table of contents

## SVG란?

Scalable Vector Graphic의 약어로 XML 문법에 기반한 벡터 그래픽 이미지다. 90년대 후반에 개발되었고 2016년가지는 제대로 지원되지 않았다.

## 왜 SVG를 사용해야 할까?

1. 가장 큰 장점은 **확장성 및 해상도**이다. SVG는 다른 이미지처럼 픽셀과 그리드 대신 모양, 숫자 및 좌표를 사용한다. 이를 통해 이미지 품질을 잃지 않고 확대 및 축소할 수 있다.
2. 다른 파일 형식에 피해 더 작고 쉽게 압축할 수 있다.
3. SVG 이미지는 크기가 작기 때문에 빠르게 렌더링 할 수 있다. SVG 이미지를 렌더링 하는 것은 텍스트를 읽고 렌더링 하는것과 다르지 않다. 또한 인라인에서 SVG를 사용하면 네트워크 요청도 할 필요가 없다. 다만 복잡한 SVG가 포함되는 경우 시간과 성능이 떨어질 수 있다. 그런 경우 Png 나 Jpg를 사용하는게 적합하다.
4. DOM의 요소처럼 스타일을 프로그래머틱하게 수정할 수 있다.
5. 애니메이션이 가능하다.

그렇다면 이런 SVG를 어떤 방식으로 사용할 수 있을까?

## SVG를 사용하는 방법

SVG를 사용하는 방법에는 다양한 방법이 있다. 어떤 방법들이 존재하는지 알아보고, 어떤 장단점이 있는지 알아보자.

SVG를 HTML 문서에 렌더링할 때 `object`, `embed`, `iframe`, `img` 태그를 사용할 수 있으며, 각 방법마다 고유한 장점과 단점이 있습니다. 아래에서는 각 태그를 사용하여 SVG를 포함하는 방법과 그에 따른 장단점을 설명하겠습니다.

## 1. `img` 태그

```html
<img src="image.svg" alt="SVG Image" />
```

### **장점:**

- **간단한 사용법**: 이미지 파일을 포함하듯이 쉽게 사용 가능하다.
- **넓은 브라우저 지원**: 대부분의 현대 브라우저에서 지원된다.
- **대체 텍스트 제공**: `alt` 속성을 통해 접근성을 향상시킬 수 있다.
- **CSS 스타일 적용**: `width`, `height` 등 이미지 관련 CSS 속성을 적용할 수 있다.
- **캐싱**: SVG 이미지는 캐싱되어 재사용될 수 있다.

### **단점:**

- **인터랙티브 기능 제한**: SVG 내부의 스크립트나 애니메이션이 작동하지 않는다.
- **DOM 접근 불가**: 포함된 SVG의 내부 요소에 JavaScript로 접근하거나 조작할 수 없다.
- **외부 리소스 제한**: SVG가 외부 스타일시트나 스크립트를 참조할 경우, `img` 태그로는 이를 로드할 수 없다.
- **추가적인 네트워크 요청**: SVG를 불러오기 위해 추가적인 네트워크 요청이 발생한다.

## 2. `object` 태그

```html
<object type="image/svg+xml" data="image.svg"></object>
```

### **장점:**

- **인터랙티브 SVG 지원**: SVG 내부의 스크립트, 애니메이션, 이벤트 등이 정상적으로 작동한다.
- **DOM 접근 가능**: 부모 문서에서 `contentDocument`를 통해 SVG의 DOM에 접근할 수 있다.
- **대체 콘텐츠 제공**: `<object>` 태그 내에 대체 콘텐츠를 추가하여 SVG 로드 실패 시 표시할 수 있다.

### **단점:**

- **일부 브라우저 이슈**: 특정 브라우저나 오래된 버전에서 호환성 문제가 발생할 수 있다.
- **크기 지정 필요**: SVG의 크기를 명시적으로 지정하지 않으면 예상치 못한 레이아웃이 나올 수 있다.
- **외부 리소스 제한**: `object`로 포함된 SVG가 외부 리소스를 로드할 때 보안 제한이 있을 수 있다.

## 3. `embed` 태그

```html
<embed type="image/svg+xml" src="image.svg" />
```

### **장점:**

- **간편한 임베딩**: `embed` 태그로 간단히 SVG를 포함할 수 있다.
- **인터랙티브 SVG 지원**: `object` 태그와 마찬가지로 SVG의 인터랙티브 요소가 작동한다.

### **단점:**

- **DOM 접근 제한**: 부모 문서에서 SVG의 DOM에 직접 접근하기 어렵다.
- **브라우저 지원 제한**: 모든 브라우저에서 일관되게 동작하지 않을 수 있다.
- **대체 콘텐츠 제공 불가**: 로드 실패 시 대체 콘텐츠를 제공할 수 없다.

## 4. `iframe` 태그

```html
<iframe src="image.svg"></iframe>
```

### **장점:**

- **완전한 독립성**: SVG가 별도의 문서로 로드되며, 자체적인 스크립트와 스타일을 가질 수 있다.
- **인터랙티브 SVG 지원**: SVG의 모든 기능이 완전히 지원된다.
- **보안 격리**: 부모 문서와의 상호 작용이 제한되어 보안 측면에서 유리하다.

### **단점:**

- **복잡성 증가**: 단순한 SVG 임베딩에 비해 불필요하게 복잡할 수 있다.
- **DOM 접근 제한**: 부모와 iframe 사이의 상호 작용이 Same-Origin Policy에 의해 제한된다.
- **레이아웃 제어 어려움**: iframe의 크기와 스크롤바 등이 자동으로 조절되지 않을 수 있다.

## Vite에서 수많은 아이콘 스토리북 작성하기

레이아웃 시프팅은 해결했다. 그런데 이 문제를 해결하며 중복된 아이콘이 많다는 문제를 발견했다. 사용되는 아이콘이 많았고, 어떤 아이콘이 현재 프로젝트에 존재하는지 확인하기도 어려웠다. 그렇다고 이 모든 아이콘의 스토리북을 작성하자니 그건 또 리소스 낭비가 심했다. 그래서 아이콘의 스토리북 작성을 자동화 해보고자 했다.

이를 위해 필요한 준비물은 Vite의 `import.meta.glob` 이다.

모든 아이콘들은 `assets/icons` 폴더에 있기에 이를 이용해 다음과 같이 스토리북을 자동화 하려 했다.

1. `svg` 또는 `tsx`의 확장자를 가지는 모듈들을 `icons` 폴더에서 전부 불러온다.
2. glob를 통해 불러온 모듈들은 키값을 path로 가지는 객체다. 또한 값은 해당 컴포넌트가 svg 인 경우 string 타입을 가지며 리액트 컴포넌트인 경우 컴포넌트 객체를 값으로 가지게 된다. 파일 명에서 확장자를 분리해 이를 아이콘의 이름을 나타내는 변수에 담고, 값을 렌더링하게될 컴포넌트 라는 변수에 담는다.
3. 이 컴포넌트 라는 변수의 타입에 따라 `img` 태그 혹은 `createElement` 를 사용해 렌더링한다.

### Glob Import

vite 에서는 `import.meta.glob` 메서드를 사용해 여러 모듈을 한 번에 가져올 수 있다. 이때 `Glob` 패턴을 사용한다.

```jsx
const modules = import.meta.glob("./dir/*.js");
```

위와 같은 형식인데 이를 이용해 아이콘들을 전부 불러온다. 여기서 중요한건 `Icon.stories.tsx` 파일이 `assets/icons` 폴더에 위치해야 한다. 즉, 아이콘들이 있는 폴더와 동일한 위치에 존재해야 한다.

```tsx
const modules = import.meta.glob("./*.{svg,tsx}", {
  eager: true,
  import: "default",
});
```

### 모듈을 사용하기 적합한 현태로 파싱하기

`glob`를 통해 불러온 모듈들은 `key` 값으로 경로를, `value` 값으로 `svg` 인 경우 `string`을 `tsx` 인 경우 리액트 컴포넌트 객체의 값을 가진다. 아이콘의 이름을 표현하기 위해 `name` 변수와 렌더링 방식을 결정하기 위한 `component` 값을 추출해 객체 형식으로 만든다.

```tsx
let count = 0;

// 아이콘 목록 생성
const icons = Object.keys(modules).map(filePath => {
  const nameMatch = filePath.match(/\/([A-Za-z0-9_-]+)\.(svg|tsx)$/);
  const name = nameMatch ? nameMatch[1] : "Unknown" + count++;
  const component = modules[filePath] as string | ComponentType;
  return { name, component };
});
```

### 렌더링 하기

`component` 변수의 값에 따라 이를 렌더링 해보자.

```tsx
const AllIcons = ({ width, height }: { width: number; height: number }) => (
  <div className={"flex flex-row flex-wrap gap-1"}>
    {icons.map(icon => {
      if (typeof icon.component === "string") {
        return (
          <div
            key={icon.name}
            className={
              "flex flex-col items-center justify-center gap-3 border border-black p-2 whitespace-pre-wrap"
            }
          >
            <img
              src={icon.component}
              alt={icon.name}
              width={width}
              height={height}
            />
            <p>{icon.name}</p>
          </div>
        );
      }

      return (
        <div
          key={icon.name}
          className={
            "flex flex-col items-center gap-3 border border-black p-2 justify-center whitespace-pre-wrap"
          }
        >
          {createElement(icon.component)}
          <span>{parseIconName(icon.name)}</span>
        </div>
      );
    })}
  </div>
);

function parseIconName(name: string) {
  return name
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}
```

### 이제 이를 스토리북으로 만들어 준다

```tsx
const meta: Meta = {
  title: "아이콘 리스트",
  component: AllIcons,
};

export default meta;

export type Story = StoryObj<typeof AllIcons>;

export const Default: Story = {
  render: () => <AllIcons width={50} height={50} />,
};
```

이제 끝났다.

화면을 확인해 보자.

![storybook-svg-automation-result](svg-storybook.png)
