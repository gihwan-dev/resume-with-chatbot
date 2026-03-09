Next.js 라우터는 서버 중심 라우팅과 클라이언트 사이드 네비게이션을 사용한다. 이것은 instant loading states 와 동시 렌더링을 지원한다. 즉, 네비게이션이 클라이언트 측 상태를 유지하고, 비용이 많이 드는 re-rendering 을 피하며, 중단 가능하고, 경쟁 조건을 발생시키지 않는다는 것을 의미한다.

라우트들 사이를 네비게이트 하는 방법은 다음과 같이 두 가지가 있다:

- `<Link>` 컴포넌트
- `useRouter` 훅

이 페이지에서는 `<Link>`, `useRouter()` 를 사용하는 방법에 대해서 알아보고 그것들이 어떻게 동작하는 지에 대해 깊게 알아 볼 것이다.

---

## The `<Link>` 컴포넌트
`<Link>` 는 라우트 사이에서 클라이언트 사이드 네비게이션과 prefetching 을 제공하는 HTML `<a>` 태그의 확장형이다.

`<Link>` 사용하기 위해서 `next/link` 에서 import 해야하고 `href` 프로퍼티에 값을 전해줘야 한다.

```tsx
import Link from 'next/link';

export default function Page() {
  return <Link href='/dashboard'>Dashboard</Link>;
}
```

`<Link>` 컴포넌트에는 선택적으로 값을 전달할 수 있는 프로퍼티들이 있다. 자세한건 공식 문서를 확인하길 바란다.

---

## Examples
### Linking to Dynamic Segments
dynamic segments/[[Dynamic Routes]]로 링킹할 때 템플릿 리터럴과 보간을 사용해 링크의 리스트를 발생시킬 수 있다. 예를들어 블로그 포스트의 리스트를 발생시키는 방법은 다음과 같다:

```tsx
import Link from 'next/link';
 
export default function PostList({ posts }) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  );
}
```

### Checking Active Links
링크가 활성화된 상태인지 확인하기 위해 `usePathname()` 을 사용할 수 있다. 예를들어 활성화된 링크에 클래스를 추가하기 위해 현제 `pathname` 이 `href` 와 일치한 지 확인해 볼 수 있다:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../styles/app.module.scss';

interface NavigationProps {
  pathname: string;
  title: string;
}

const Navigation: React.FC<{ path: NavigationProps[] }> = props => {
  const pathname = usePathname();

  return (
    <div>
      <h1>Navigation is here</h1>
      <ul>
        {props.path.map((item, index) => {
          const isActive = pathname === item.pathname;
          return (
            <li>
              <Link
                key={item.title}
                className={isActive ? styles['text-blue'] : styles['text-black']}
                href={item.pathname}>
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Navigation;
```

### Scrolling to an `id`
`<Link>` 의 기본 동작은 변경된 세그먼트의 가장 위로 스크롤 하는것이다. `href` 에 `id` 가 정의된다면 평범한 `<a>` 태그처럼 특정한 `id` 로 이동할 것이다.

```tsx
import Link from 'next/link';
import { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Gihwan-dev next.js practice',
};

const HomePage = () => {
  return (
    <div>
      <h1>The Home Page</h1>
      <h1>
        <Link href="about">to about page</Link>
      </h1>
      <nav>
        <ul>
          <li>
            <Link href="#section1">to section1</Link>
          </li>
          <li>
            <Link href="#section2">to section2</Link>
          </li>
          <li>
            <Link href="#section3">to section3</Link>
          </li>
          <li>
            <Link href="#section4">to section4</Link>
          </li>
        </ul>
      </nav>
      <div id="section1"></div>
      <div id="section2"></div>
      <div id="section3"></div>
      <div id="section4"></div>
    </div>
  );
};

export default HomePage;
```

---

## The `useRouter()` 훅
`useRouter` 훅은 프로그래믹한 방식으로 클라이언트 컴포넌트 안에서 라우트를 변경하도록 해준다.

`useRouter()` 훅을 사용하기 위해서 `next/navigation` 을 import 하고 클라이언트 컴포넌트 안에서 hook을 호출하면 된다:

```tsx
'use client';
 
import { useRouter } from 'next/navigation';
 
export default function Page() {
  const router = useRouter();
 
  return (
    <button type="button" onClick={() => router.push('/dashboard')}>
      Dashboard
    </button>
  );
}
```

`useRouter` 는 `push()` 나 `refresh()` 와 같은 메서드를 제공한다.

- Recommendation:
    
    `useRouter()` 가 특별하게 요구되는 상황이 아니라면 `<Link>` 컴포넌트를 사용해라
    

---

## How Navigation Works
- 라우트 전환은 `<Link>` 또는 `router.push()` 를 사용함으로써 초기화된다.
- 라우터가 브라우저 주소창의 주소를 업데이트한다.
- 클라이언트 사이드 캐쉬로부터 공유 레이아웃과 같은 변경되지 않은 세그먼트를 재사용 함으로써 불필요한 작업을 피한다. partial rendering 이라고도 불린다.
- soft navigation의 조건이 부합하면 서버에서 fetch를 하지 않고 캐쉬로부터 새로운 새그먼트를 fetch한다. 그렇지 않다면 라우터는 hard navigation을 수행하고 서버로부터 서버 컴포넌트를 fetch한다.
- 생성된다면 payload가 fetch 되는 동안 loading UI를 보여준다.
- 라우터는 캐쉬 되거나 또는 새로운 payload를 사용해 클라이언트에게 렌더링 해준다.

## Client-side Caching of Rendered [[Server Component]]
새로운 라우터는 in-memory client-side cache 를 가지며 그것은 서버 컴포넌트의 렌더링 결과를 저장한다. 이 캐쉬는 라우트 새그먼트로 분리되어 유효성 검사를 할 수 있도록 해주고 동시 렌더링 전반에 걸쳐 일관성을 보장해준다.

유저가 앱을 네비게이트하면, 라우터는 이전에 fetch된 세그먼트의 payload를 저장하고 캐쉬에서 세그먼트를 prefetch 한다.

이것은 특정한 상황에, 서버에 새로운 요청을 보내지 않고 캐쉬를 재사용할 수 있다는 것을 의미한다. 이것은 불필요한 컴포넌트의 re-rendering 과 re-fetching을 피함으로써 성능을 향상시켜준다.

## Invalidating the Cache
Server Actions은 path( `revalidatePath` ) 또는 cache tag( `revalidateTag` ) 를 사용해 요구중인 data를 재검증 할 수 있다.

## Prefethching
Prefetching 은 한 라우트를 방문하기 전에 백그라운드에서 preload하는 방법이다. 렌더링된 결과는 라우터의 client-side cache에 추가된다. 이 방법은 prefetched된 라우트로의 네비게이팅이 거의 즉시 일어날 수 있도록 해준다.

기본적으로 `<Link>` 컴포넌트가 뷰포트에 보여지는 순간 라우트는 prefetch 된다. 이것은 페이지가 처음 load 되었을 때 또는 스크롤링 하면서 발생할 수 있다. 또한 라우트는 `prefetch` 메소드의 `useRouter()` 훅을 사용해 프로그래믹하게 prefetch 될 수 있다.

### Static and Dynamic Routes:

- 만약 라우트가 정적이면 , 모든 서버 컴포넌트의 payloads는 prefetched 된다.
- 라우트가 동적이면, 첫번째 `loading.js` 파일이 prefetched 될 때 까지 첫번째 공유 레이아웃의 payload가 다운된다.
- Good to know:
    - prefetching은 프로덕션에서만 사용 가능하다.
    - prefetching은 `prefetch={false}` 를 통해 사용하지 않을 수 있다.

## Hard Navigation
네비게이션이 일어날 때, 캐쉬는 검증되고 서버는 데이터를 refetche 하고 변경된 세그먼트를 re-render 한다.

## Soft Navigation
네비게이션이 일어날 때, 변경된 세그먼트를 위한 캐쉬는 재사용되고, 새로운 요청이 발생하지 않는다.

### Conditions for Soft Navigation
네비게이션시에, Next.js 는 네비게이팅 하고있는 라우트가 prefetch 되었고 동적 세그먼트를 포함하지 않거나 또는 현 라우트와 동일한 동적 파라미터를 가지고 있다면 soft navigation을 사용할 것이다.

예를들어 `/dashboard/team-red/*` 에서 `/dashboard/team-red/*` 로의 네비게이션에는 soft navigation이 사용된다. `/dashboard/team-red/*` 에서 `/dashboard/team-blue/*` 로의 네비게이션에는 hard navigation이 사용된다.

## Back/Forward Navigation
앞으로가기 또는 뒤로가기의 네비게이션은 soft navigation 동작을 수행한다. 이것은 클라이언트 사이드 캐쉬가 재사용되고 즉시 이동된다는 의미다.

## Focus and Scroll Management
기본적으로 Next.js 는 네비게이션에서 변경된 세그먼트를 보여주기위해 스크롤된다.

#Nextjs 