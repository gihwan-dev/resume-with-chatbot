---
author: Gihwan-dev
pubDatetime: 2024-10-01T05:58:52.972Z
title: 웹 프론트엔드 성능 지표 개선하기
slug: web-frontend-performance-improve
featured: true
draft: false
tags:
  - web
  - frontend
  - optimization
description: 웹 프론트엔드 성능 지표를 개선 일기 입니다.
---

현재 진행중인 [Blooming](https://dnd-11th-8-frontend.vercel.app/)의 MVP 개발이 거의 완료되었다. QA를 진행하며 Lighthouse 성능 지표를 개선하며 겪은 일들에 대한 글이다.

## Table of contents

## 초기 성능 지표와 원인 파악

초기 성능 지표는 68점으로 그리 좋은 점수는 아니였다.

![initial performance](initial-performance.png)

이에 대한 원인을 파악해 보았고 파악한 원인은 다음과 같았다.

1. 외부 스크립트의 로드가 렌더링을 블로킹 한다.
2. svg와 이미지에 최적화가 적용되지 않아, 불러오는 비용이 컸다.
3. 폰트 사이즈가 컸으며, 폰트의 로딩과 적용이 렌더링을 블로킹했다.
4. 자바스크립트의 사이즈가 컸다.
5. 데이터 로딩 시간에 의한 LCP의 저하가 있었다.

이 문제들을 어떻게 해결해 나갔는지 확인해보자.

## 외부 스크립트의 로드가 렌더링을 블로킹

애플 로그인 기능을 구현하기 위해 `apple auth`와 관련된 외부 스크립트가 존재했는데, 이 외부 스크립트가 렌더링을 블로킹 하는 문제가 있었다. 이에 대한 해결책은 두 가지였다.

1. `script` 태그에 `async` 애트리뷰트 사용하기.
2. `script` 태그에 `defer` 애트리뷰트 사용하기.

### `async` 애트리뷰트 사용

- 백그라운드에서 `script`를 로드하고 실행한다. HTML 페이지는 스크립트가 로드되고 실행되는 것을 기다리지 않고 콘텐츠를 출력하고 처리한다.
- HTML과 완전히 독립적으로 처리되기 때문에 `DOMContentLoaded` 이벤트와 완전히 별개로 동작한다.

### `defer` 애트리뷰트 사용

- `script`를 백그라운드에서 로드한다. 이때 HTML을 파싱하고 렌더링 하는 일은 멈추지 않는다.
- `async`와의 차이점은 `defer`의 실행은 페이지 구성이 끝나면 발생한다.

즉, 정리하자면 `async`는 **비동기적**으로 다운로드 하고 실행한다. `defer`는 **비동기적**으로 다운로드 하지만 실행을 HTML 구성이 끝난 이후로 **연기** 한다.

`apple auth` 스크립트의 경우 `HTML`이 파싱되기를 기다릴 필요가 없으며, 실행 순서가 보장되지 않더라도 상관없었다. 그래서 `async` 태그를 사용해 렌더링을 블로킹하는것을 해결했다.

## SVG 아이콘 및 이미지 최적화

프로젝트에 포함된 다양한 svg 확장자의 아이콘과, 이미지들이 압축되어 있지 않아 불러오는 비용이 컸다. `Vite image optimizer` 플러그인을 사용해 압축을 진행했으며 문제를 해결할 수 있었다. 다음과 같은 형태로 간편하게 사용할 수 있다.

```jsx
// vite.config.ts
export default definedConfig({
  plugins: [
    ...ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
      exclude: undefined,
      include: undefined,
      includePublic: true,
      logStats: true,
      ansiColors: true,
      svg: {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                cleanupNumericValues: false,
                removeViewBox: false, // https://github.com/svg/svgo/issues/1128
              },
            },
          },
          "sortAttrs",
          {
            name: "addAttributesToSVGElement",
            params: {
              attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
            },
          },
        ],
      },
      png: {
        // https://sharp.pixelplumbing.com/api-output#png
        quality: 100,
      },
      jpeg: {
        // https://sharp.pixelplumbing.com/api-output#jpeg
        quality: 100,
      },
      jpg: {
        // https://sharp.pixelplumbing.com/api-output#jpeg
        quality: 100,
      },
      tiff: {
        // https://sharp.pixelplumbing.com/api-output#tiff
        quality: 100,
      },
      // gif does not support lossless compression
      // https://sharp.pixelplumbing.com/api-output#gif
      gif: {},
      webp: {
        // https://sharp.pixelplumbing.com/api-output#webp
        lossless: true,
      },
      avif: {
        // https://sharp.pixelplumbing.com/api-output#avif
        lossless: true,
      },
      cache: false,
      cacheLocation: undefined,
    }),
  ],
});
```

public 폴더에 존재하는 다양한 앱 아이콘들도 최적화를 진행하기 위해서 includePublic 옵션을 `true`로 설정했고, 품질 유지를 위해 `quality`는 100의 값을 `lossless` 값을 `true`로 설정했다. 이렇게 빌드시 이미지 및 아이콘의 최적화를 진행했고, 다음과 같은 결과를 얻을 수 있었다.

![image optimize result](image-optimize-result.png)

## 폰트 사이즈 최적화

불러오는 폰트의 초기 사이즈는 다음과 같았다.

![initial font size](initial-font-size.png)

이를 해결한 방법은 다음 세 가지였다.

1. 압축률이 큰 `woff2` 확장자의 폰트를 사용한다.
2. 서브셋 폰트를 사용한다.
3. `swap` 옵션을 사용해서 폰트 로딩이 렌더링을 막지 않도록 한다.

우선 서브셋 폰트란 폰트 파일에서 사용하는 글자만 뽑아내 만들어낸 폰트 파일이다. 즉, `궭` 과 같은 글자는 폰트 파일에서 제거하는 것이다.

`swap` 옵션은 글꼴이 다운로드 되기 전가지 시스템 기본 글꼴을 사용하다 폰트가 로드 되고나면 글꼴을 교체 하게하는 옵션이다.

`swap` 옵션은 다음과 같이 사용할 수 있다.

```css
@font-face {
  font-family: "Pretendard";
  font-style: normal;
  font-weight: 400;
  src: url("./assets/fonts/Pretendard-Regular.subset.woff2") format("woff2");
  font-display: swap;
}
```

## 자바스크립트의 사이즈가 컸다

기존에 불러오던 앱의 실행을 위해 필요한 자바스크립트의 번들 사이즈는 `398kB` 였다. 해당 문제를 해결하기 위해 다음과 같은 작업을 진행했다. 첫 번째로 코드 스플리팅을 적용했다. 초기 페이지를 렌더링하는데 필요하지 않은 다른 페이지 컴포넌트들에 `lazy` 로딩을 사용했다.

### lazy 로딩

```jsx
const AddPlantPage = lazy(() => import("./pages/AddPlantPage"));
const MyPlantPage = lazy(() => import("./pages/MyPlant"));
const MyPlantDetailPage = lazy(() => import("@/pages/MyPlantDetail.tsx"));
const GuideDetailPage = lazy(() => import("./pages/GuideDetails"));
```

다만 여기서 리액트의 `lazy` 로드를 적용한 경우 해당 페이지 컴포넌트는 필요할 때 동적으로 로딩된다. 이 말은 초기 페이지 렌더링 시간은 단축되었지만, 다음 페이지로 이동되는 시간이 증가했다는 의미이다. 이게 UX의 저하를 가져온다고 생각했고, 다음 페이지로의 이동 시간을 단축하고자 했다. 이를 위한 해결책은 `react query`의 `prefetch`를 사용하는 것이었다.

```tsx
useEffect(() => {
  void queryClient.prefetchQuery({
    queryKey: keyStore.myPlant.getMyAllPlant.queryKey,
  });
}, []);
```

이처럼 다음으로 이동될 페이지에 필요한 데이터를 미리 받아와 캐싱하게끔 해서, 다음 페이지로의 이동 시간을 단축시켰다.

사실 이 부분에서 최적화 해야할 요소는 더 많다. `lazy` 로딩을 적용한 페이지와 적용하지 않은 페이지에서 동일한 컴포넌트를 사용하면 이 컴포넌트가 중복 포함되게 된다. 이 문제는 차차 해결하기로 했다... 어쨌든 큰 문제는 아니라 생각하고, 인지했다는게 중요하다고 생각하고 있다.

### 텍스트 압축 적용

두 번째로 텍스트 압축도 적용했다. 텍스트 기반의 HTML, CSS, JS 파일의 전송에 있어 GZIP은 최적의 성능을 낸다고 알려져 있다. 대부분의 최신 브라우저들은 GZIP 압축을 지원하고, 이를 자동으로 요청한다. `vite compression 2` 플러그인을 사용해서 압축을 진행했다.

사용은 아주 간단하다. 설치 후 다음과 같이 `vite.config.ts` 파일에 추가하기만 하면 된다.

```ts
export default defineConfig({
  plugins: [...compress()],
});
```

### 롤업 빌드시 청킹 옵션 사용

여기서 좀 더 할 수 있는 최적화가 없나? 고민하다, 라이브러리를 메뉴얼하게 청킹해서 스플리팅 할 수 있다는걸 알게 되었다. 초기에는 그럼 라이브러리를 전부 분리해보자, 그러면 작아지지 않을까? 였고 그렇게 했다.

그 결과 오히려 LCP 점수가 떨어지는걸 발견했다. 즉, 자바스크립트의 번들 사이즈도 중요하지만 이렇게 스플리팅 했을 때 네트워크 요청 빈도가 늘어나면서 오히려 초기 페이지 렌더링 성능에 저하를 불러오는 것이다.

그래서 초기 페이지 로딩에 필요하지 않은 라이브러리를 청킹해서 분리하도록 했고, 메인페이지 로딩에 필요한 라이브러리는 그러지 않도록 했다.

```ts
export default defineConfig({
  ...
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          jotai: ['jotai'],
          markdown: ['react-markdown'],
          utils: ['es-toolkit'],
          form: ['react-hook-form', 'zod', '@hookform/resolvers'],
          icons: ['lucide-react', 'react-icons'],
        },
      },
    },
  },
})
```

위와 같이 초기 페이지 렌더링에 필요하지 않은 라이브러리 들을 특정 도메인 단위로 청킹했다. `form`과 관련된 라이브러리 같은 경우 식물 등록 페이지에서만 필요하기 때문에 `zod`, `react-hook-form`, `'@hookform/resolvers` 라이브러리를 함께 청킹하도록 했다. 다른 청킹도 유사하게 내 판단에 근거해 분리했다.

그 결과 다음과 같이 기존 `398 kB` 에서 `285 kB`로 약 28% 정도 번들 사이즈를 줄이는데 성공했다.

![optimize javascript result](optimizs-javascript-result.png)

## LCP 성능 개선

LCP 성능 저하중 가장 큰 문제중 하나는 메인 페이지 접속시 해당 페이지에서 필요한 데이터 요청을 하게 되는데 이 데이터 요청 동안 콘텐츠가 보여지지 않아 발생했다. RSC를 사용해 네트워크 요청 `water fall`을 없애면 해결 되지 않을까? 하는 고민도 했으나 이는 리소스 낭비가 너무 심하다는 판단이 들었고, 조금이라도 이 속도를 개선할 방법을 찾아 보고자 했다. 그러다 `preconnect` 라는 애트리뷰트가 있다는걸 발견하게 되었다.

연결 설정 시간의 대부분은 데이터 교환이 아닌 기다리는데 사용 된다고 한다. preconnect를 사용하면 이러한 시간을 단축할 수 있다.

```html
<link href="name-to-domain" rel="preconnect" />
```

## 결론

다양한 방식으로 성능 최적화를 시도했고 그 결과는 다음과 같다.

![optimization result](optimization-result.png)

성능 최적화를 통해 이정도 수준까지 웹사이트 성능을 개선할 수 있구나.... 를 느꼈다. 물론 기존에 최적화가 전혀 되어있지 않아 이정도로 차이가 발생한거라 생각한다.

최근 다양한 컨퍼런스를 보면서 느낀점은, 프론트엔드 개발자는 화면을 개발하는 개발자가 아니라 그러한 작업을 포함해서 프론트엔드 생태계에서 발생하는 문제를 해결하는 거구나 였다.

그런데, 실제 서비스를 운영해보지 않으면 이런 문제를 경험하기가 쉽지 않다. 그래서 이번에 의도적으로 이런 상황을 만들어 유사하게 겪어보려 했다. 취준할때는 의도적으로 문제를 만들어 해결하는 습관이 중요하다 라는걸 느끼는것 같다.

다음 게시글은 PWA를 PlayStore에 배포하는 방법, React와 관련된 세부 동작 방식에 대한 질문과 답 등등에 대한 게시글을 작성해야겠다.
