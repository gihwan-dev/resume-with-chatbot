`loading.js` 파일은 의미있는 로딩 UI를 만드는것을 도와준다. 이 convention을 사용하면 라우트 세그먼트가 load 되는 동안 서버로부터 instant loading state를 보여줄 수 있다. 새로운 컨텐츠는 렌더링이 완료되는 순간 자동으로 변경된다.
![[Pasted image 20230914220716.png]]

---
## Instant Loading States
instant loading state는 네비게이션 즉시 보여지는 fallback UI이다. 후에 표시될 스크린에 의미있는 부분을 pre-render 할 수 있다. 이것은 유저가 앱이 응답하고 있다는 것을 알게하고, 더 나은 UX를 경험하게 해준다.

폴더 안에 `loading.js` 파일을 추가함으로써 loading state를 만들 수 있다.

![[Pasted image 20230914220747.png]]

```tsx
const Loading = () => {
  return <LadingSkelton />;
}
export default Loading;
```

같은 폴더 안에서, `loading.js` 은 `layout.js` 안에 nest된다. `page.js` 파일과 `<Suspense>` 바운더리 아래에 있는 모든 자식요소를 감싼다.

![[Pasted image 20230914220804.png]]

>  **Good to know:**
    - 서버 중심 라우팅이라 하더라도 navigation은 즉시 일어난다.
    - navigation은 중단 가능하다. 즉, 현재 로딩 중인 라우트의 컨텐츠가 모두 load 될 때 까지 기다릴 필요 없이 다른 라우트로 navigation 가능하다는 의미이다.
    - 공유된 레이아웃은 새로운 세그먼트가 load 되는 동안에도 반응형으로 유지된다.

---
## Streaming with Suspense
`loading.js` 에 더해서, 수동적으로 UI 컴포넌트만의 Suspense 바운더리를 만들 수 있다. App 라우터는 Suspense 와 Node.js, Edge runtimes를 위한 스트리밍을 지원한다.

## What is Streaming?
React와 Next.js 에서 스트리밍이 동작하는 방식을 알기 위해서 **서버 사이드 렌더링(SSR)** 과 그 한계에 대해 이해하는것은 도움이 된다.

SSR에서 유저가 페이지를 보고 반응할 수 있도록 되기 전에 몇가지 일련의 과정이 완료되어야 한다.
1. 서버에서 모든 데이터가 fetch 되어야 한다.
2. 서버가 페이지를 위한 HTML을 render 해야 한다.
3. HTML, CSS, JavaScript가 클라이언트에게 보내져야 한다.
4. 정적인 인터페이스가 HTML, CSS 를통해 생성되어 유저에게 보여진다.
5. 마지막으로 리액트가 hydrates 해서 반응형으로 만든다.

![[Pasted image 20230914220824.png]]

모든 과정은 blocking 방식으로 연속적으로 일어난다. 즉 모든 data가 fetch 되어야 서버가 HTML을 render할 수 있다는 의미다. 또한 리액트는 UI를 위한 모든 컴포넌트가 다운로드 되어야 hydrate할 수 있다.

리액트와 Next.js를 활용한 SSR은 유저에게 정적인 페이지를 최대한 빨리 보여줌으로써 체감 로딩 성능을 향상시키는데 도움을 준다.

![[Pasted image 20230914220958.png]]

하지만, 유저에게 페이지가 보여지기 위해서는 모든 데이터를 fetch 해야 하므로 여전히 느릴 수 있다.

**Streaming** 은 페이지의 HTML을 작은 덩어리로 나누어서 서버에서 클라이언트에게 점진적으로 그러한 덩어리들을 보낼 수 있도록 한다.

![[Pasted image 20230914220942.png]]

UI가 render될 수 있도록 모든 데이터를 기다리지 않고 페이지의 일부분을 더 빨리 보여줄 수 있도록 해준다.

Streaming은 리액트의 컴포넌트와 잘 동작한다. 각 컴포넌트가 하나의 덩어리로 고려될 수 있기 때문이다. 더 높은 우선순위를 가지는 컴포넌트나, 데이터에 의존하지 않는 컴포넌트가 먼저 보내질 수 있고, 리액트는 더 빠르게 hydration을 시작할 수 있다. 낮은 우선순위를 가지는 컴포넌트는 data가 fetch 되고 나서 전달될 수 있다.

![[Pasted image 20230914220912.png]]

Streming은 특히 **Time To First Byte(TTFB)** 와 **First Contentful Paint(FCP)** 를 줄여줌으로서 페이지가 렌더링 되는것을 막는 긴 데이터 요청을 방지하길 원할 때 유용하다. 또한 느린 디바이스에서 **Time to Interactive(TTI)** 를 향상시키는데도 도움을 준다.

## Example
`<Suspense>` 는 동기적인 액션을 취하는 컴포넌트를 감싸므로서 동작한다. 비동기 작업이 진행되는 동안 fallback UI를 보여주고 작업이 완료되면 컴포넌트를 보여준다.[[Suspense]]

```tsx
import { Suspense } from 'react';
import { PostFeed, Weather } from './Components';
 
export default function Posts() {
  return (
    <section>
      <Suspense fallback={<p>Loading feed...</p>}>
        <PostFeed />
      </Suspense>
      <Suspense fallback={<p>Loading weather...</p>}>
        <Weather />
      </Suspense>
    </section>
  );
}
```

Suspense를 사용함으로써 다음과 같은 이익을 얻을 수 있다:

1. **Streaming Server Rendering** - 서버에서 컴포넌트로 HTML을 점진적으로 render할 수 있도록 해준다.
2. **Selective Hydration** - 유저 반응에 따라 어떤 컴포넌트를 먼저 hydrate해야하는지 우선순위를 정한다.

## SEO
- Next.js는 클라리언트에게 streaming UI를 시작하기 전에 `generateMetadata` 안의 data fetching이 완료되기를 기다릴 것이다. **이것은 스트리밍된 반응의 첫번째 부분이 `<head>` 태그가 될 수 있도록 보장해준다.**
    
- 스트리밍은 server-rendered 이기 때문에 SEO에 영향을 끼치지 않는다. Mobile Friendly Test 툴을 사용해서 구글의 웹 크롤러에 어떻게 페이지가 나타나는지 보고 직렬화된 HTML를 확인할 수 있다.
    
- 직렬화된 HTML 이란?
    HTML 문서를 문자열 형태로 변환한 것을 의미한다. Serialization은 데이터 구조나 객체 상태를 동일하거나 다른 컴퓨터 환경에서 사요할 수 있도록 byte stream 또는 문자열 형태로 변환하는 과정을 말한다.

#Nextjs 