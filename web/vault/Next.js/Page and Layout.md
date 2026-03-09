Next.js 13은 쉽게 pages, shared layouts, templates을 만들 수 있는 새로운 파일 컨벤션을 소개했다. 이 페이지에서는 Next.js 앱에서 이 특별한 파일들을 어떻게 사용하는지에 대해 알려준다.

---

## Pages

`page` 는 한 라우트의 유니크한 UI이다. `page.js` 파일의 컴포넌트를 export 함으로서 page를 정의할 수 있다. 폴더를 nest해서 라우트를 정의하고 `page.js` 파일을 추가해서 라우트를 public하게 접근할 수 있도록 만들 수 있다.

---

## Layouts

layout UI 는 여러개의 페이지들 사이에서 공유될 수 있는 UI이다. 네비게이션 하는 동안, 레이아웃은 상태를 유지하고, 상호작용이 가능하며, **re-render 하지 않는다.**

`layout.js` 파일의 리액트 컴포넌트를 `default` 로 export하여 layout을 정의할 수 있다. 컴포넌트는 `children` 을 받아야 한다.

![[Pasted image 20230919143113.png]]

```tsx
export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* Include shared UI here e.g. a header or sidebar */}
      <nav></nav>
 
      {children}
    </section>
  );
}
```

- Good to know:
    - 가장 상위의 레이아웃을 루트 레이아웃이라 한다. 앱의 모든 페이지간에 레이아웃을 공유하기 위해 반드시 요구되는 레이아웃이다. `html` 과 `body` 태그를 반드시 포함해야 한다.
    - 어떤 라우트 세그먼트든 선택적으로 자신만의 layout을 정의할 수 있다. 이 layout은 세그먼트 안의 모든 페이지들간에 공유된다.
    - 라우트의 레이아웃은 default로 nest된다. 부모 layout은 자식 layout을 `children` 프로퍼티를 통해 감싼다.
    - **Route Groups** 를 사용하여 특정 라우트 세그먼트를 공유 레이아웃에 포함시키거나 제외시킬 수 있다.
    - 레이아웃은 서버 컴포넌트가 기본이며 클라이언트 컴포넌트로 설정할 수 있다.
    - 레이아웃은 data fetching을 할 수 있다.
    - 부모 레이아웃에서 자식으로 data를 전달하는것은 불가능하다. 하지만 한 라우트에서 같은 데이터를 여러번 fetching 하면 리액트가 자동으로 성능에 영향을 미치지 않으면서 요청을 자동으로 중복 제거한다.
    - 레이아웃은 현제 라우트 세그먼트에 대한 접근 권한이 없다. 라우트 세그먼트에 접근하기 위해서 `useSelectedLayoutSegment` 또는 `useSelectedLayoutSegments` 를 클라이언트 컴포넌트 안에서 사용하면 된다.
    - `layout.js` 와 `page.js` 파일은 같은 폴더에서 정의될 수 있다. 레이아웃 파일이 페이지 파일을 감싸게 될것이다.

## Root Layout (Required)

루트 레이아웃은 `app` 디렉터리의 최상위에 정의되어 모든 라우트에 적용된다. 이 레이아웃은 서버로부터 반환되는 초기 HTML을 수정할 수 있도록 한다.

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- Good to know:
    - `app` 디렉터리는 반드시 루트 레이아웃을 포함해야 한다.
    - 루트 레이아웃은 반드시 `html` 과 `body` 가 정의되어야 한다.
    - `head` HTML 요소를 관리하기 위해 **built-in SEO support를 사용할 수 있다.**
    - 여러 루트 레이아웃을 생성하기 위해 **route groups을** 사용할 수 있다.
    - 루트 레이아웃은 서버 컴포넌트가 기본이며, 클라이언트 컴포넌트로 설정할 수 없다.

## Nesting Layouts

한 폴더 안에 정의된 레이아웃은 특정한 라우트 세그먼트에 적용되고 해당 세그먼트가 활성화되면 렌더링 된다. 기본적으로 파일 계층구조 안의 레이아웃들은 nest 된다.

![[Pasted image 20230919143103.png]]

```tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
```

위 이미지 안의 두 레이아웃을 합치면 루트 레이아웃 (`app/layout.js`)은 대쉬보드 레이아웃(`app/dashboard/layou.js` )을 감싼다.

두 레이아웃은 다음과 같이 nest 된다:

![[Pasted image 20230919143054.png]]

**[[Route Groups]]** 을 사용해서 특정한 라우트를 공유 레이아웃에 포함시키거나 제외시킬 수 있다.

---

## Templates

템플릿은 각각의 페이지 또는 레이아웃을 감싼다는 점에서 비슷하다. 하지만 레이아웃은 네비게이션 할 때 상태를 유지하지만 **템플릿은 새로운 인스턴스를 생성**한다. 이것은 유저가 한 템플릿을 공유하는 라우트들 사이를 네비게이트 할 때 **컴포넌트의 새로운 인스턴스가 마운트**되고, **DOM elements가 재생성**되며, 상태가 보존되지 않고, effects 는 재동기화 된다는것을 의미한다.

이런 특정한 동작이 필요한 케이스가 있을 수 있다. 그러한 경우 템플릿은 레이아웃보다 더 적합한 옵션이 될것이다. 예를들어:
- CSS 또는 animation 라이브러리를 사용해서 Enter/exit 애니메이션을 구현할 때
- `useEffect` 또는 `useState` 에 의존하는 수치를 다룰때.(a per-page feedback form)
- 기본 프레임워크 동작을 변경하기 위해서. 예를들어, 레이아웃 안의 Suspense Boundaries는 레이아웃이 load될 때 한 번 fallback을 보여주고 페이지를 바꿀때는 보여주지 않는다. 템플릿에서는 매번 네비게이션 할 때 마다 보여준다.
- Recommendation: 이런 특정한 동작이 꼭 필요한 경우가 아니라면 레이아웃을 사용하는것을 권장한다.

템플릿은 `template.js` 파일에서 리액트 컴포넌트를 default로 export 함으로써 정의할 수 있다. 컴포넌트는 `children` 프로퍼티를 받아야 한다.

![[Pasted image 20230919143042.png]]

```tsx
export default function Template({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
```

레이아웃과 템플릿이 렌더링 되는 결과는 다음과 같은 구조를 가지게 된다.

```tsx
<Layout>
  {/* Note that the template is given a unique key. */}
  <Template key={routeParam}>{children}</Template>
</Layout>
```

---

## Modifying `<head>`

`app` 디렉터리에서 **built-in SEO support** 를 사용해서 `title` 또는 `meta` 와 같은 `<head>` HTML elements를 수정할 수 있다.

메타데이터는 `layout.js` 또는 `page.js` 파일에서 `generateMetadata` 함수 또는 `metadata` 객체를 export함으로서 정의할 수 있다.

```tsx
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Next.js',
};
 
export default function Page() {
  return '...';
}
```

- **Good to know:**
    
    루트 레이아웃에 `<title>` 또는 `<meta>` 와 같은 `<head>` 태그를 수동으로 추가해서는 안된다. 대신에 **Metadata API** 를 사용해서 다루어야 한다.

#Nextjs 