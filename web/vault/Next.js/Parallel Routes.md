Parallel Routing은 하나 또는 그 이상의 페이지를 동시에 또는 조건적으로 같은 레이아웃 안에서 render 할 수 있도록 해준다. 소셜 사이트의 피드나 대쉬보드와 같은 앱의 동적인 부분에서, parallel routing 을 통해 복잡한 라우팅 패턴을 구현할 수 있다.

예를들어, 동시에 팀과 analytics 페이지를 render 할 수 있다.

![[Pasted image 20230914221236.png]]

Parallel Routing은 각 라우트가 독립적으로 stream 되도록 하여, 각각의 라우트를 위한 로딩 과 에러 state를 정의할 수 있도록 해준다.

![[Pasted image 20230914221255.png]]

Parallel Routing은 또한 한 슬롯에 대해 특정한 조건에 기반해 render 할 수 있도록 해준다. 이는 같은 URL에 대해 완전히 분리된 코드를 작성할 수 있도록 해준다.

![[Pasted image 20230914221315.png]]

---
## Convention

Parallel route는 named slot 을 통해 생성될 수 있다. Slot은 `@folder` 와 같이 정의 되며, 같은 level의 레이아웃에 prop으로서 전달된다.

- slot은 라우트 세그먼트가 아니므로 URL 구조에 영향을 주지 않는다.

예를 들어, 다음의 파일 구조는 두개의 slot을 정의한다: `@analytics` 와 `@team` .

![[Pasted image 20230914221333.png]]

위 폴더 구조는 `app.layout.js` 의 컴포넌트의 props 에 `@anlytics` 와 `@team` slot 전달되며 `children` 프로퍼티와 같이 사용될 수 있다는 의미다.

```tsx
export default function Layout(props: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <>
      {props.children}
      {props.team}
      {props.analytics}
    </>
  );
}
```

- `children` 은 폴더에 map 할 필요 없는 명확한 slot 이다. 즉 `app/page.js` 는 `app/@children/page.js` 와 같다는 의미다.

---
## Unmatched Routes

기본적으로 content는 현 URL에 일치하는 slot 안에 render된다.

일치하지 않는 slot의 경우에는 라우팅 기술과 폴더 구조에 따라 다르게 render한다.

### `default.js`
현 URL에 맞는 슬롯의 활성화 상태를 복구할 수 없을때 Next.js는 `defualt.js` 파일 render한다.

다음과 같은 폴더 구조를 생각해보자. `@team` slot은 `settings` 를 가진다. 하지만 `@analytics` 는 가지고 있지 않다.

![[Pasted image 20230914221348.png]]

만약 루트 `/` 에서 `/settings` 로 네비게이트 한다면, render 되는 content는 네비게이션의 타입과 `default.js` 파일의 사용 가능성에 따라 다르다.

![[Pasted image 20230914221402.png]]
### Soft Navigation
Soft navigation - Next.js 는 slot의 이전 활성화 상태를 Render 한다. 현 URL과 일치하지 않더라도 그렇게 한다.

### Hard Navigation
Hard navigation - full page reload 를 요구하는 네비게이션의 경우에 Next.js 는 부합하지 않는 slot에 `defualt.js` 파일을 render 하는것을 시도한다. 만약 할 수 없다면 404가 render 된다.

이해를 위해 따로 코드를 실행해 보았다. 일단 다음과 같은 폴더 구조를 가진다고 가정해본다:

![[Pasted image 20230914221417.png]]

`@analytics` 와 `@team` 이 sibling 구조를 가진다 즉 app 과 `@analytics` 와 `@team` 은 parallel 라우트 이다. `/` 경로를 방문하면 세 개의 페이지가 분활되어 표시 되는데 만약 `/setting` 을 방문하게 되면 이때부터 문제가 생기게 된다.

우선 `app` 과 `analytics` 와 `team` 은 모두 `/` 의 루트 라우트 경로를 가진다 하지만 `/setting` 로 방문하게 되면 app 과 team 은 layout.tsx 파일에서 정의했기에 렌더링 해야 하지만 URL에 매치하지 않기 때문에 404 페이지를 띄우게 된다.

이러한 경우에 URL에 매치하지 않는 경우를 위해 defualt.tsx 파일에 매치하지 않을 때 띄울 UI를 정의하면 URL에 매치하지 않는 페이지들이 default로 설정된 페이지를 띄워주게 된다.

즉 다음과 같은 화면을 띄우게 된다 다음은 `/setting` 을 방문한 페이지의 렌더링 화면이다.

![[Pasted image 20230914221432.png]]

---

## `useSelectedLayoutSegment(s)`

`useSelectedLayoutSegment` 와 `useSelectedLayoutSegments` 는 `parallelRoutesKey` 를 인자로 받는다, 현재 활성화된 slot이 뭔지 알 수 있도록 해준다.

```tsx
'use client';
import { useSelectedLayoutSegment } from 'next/navigation';
 
export default async function Layout(props: {
  //...
  authModal: React.ReactNode;
}) {
  const loginSegments = useSelectedLayoutSegment('authModal');
  // ...
}
```

유저가 `@authModal/login` 으로 즉 `/login` 으로 네비게이트 하면, `loginSegments` 는 문자열 `"login"` 을 값으로 가지게 된다.

---
## Examples

### Modals
Parallel Routing 은 모달창을 띄우기 위해 사용될 수 있다.

![[Pasted image 20230914221458.png]]

`@authModal` 슬롯은 `<Modal>` 컴포넌트를 렌더한다. `/login` 라우트로 접근시에 렌더를 실시한다.

```tsx
// app/layout.tsx
export default async function Layout(props: {
  // ...
  authModal: React.ReactNode;
}) {
  return (
    <>
      {/* ... */}
      {props.authModal}
    </>
  );
}
```

```tsx
// app/@authModal/login/page.tsx
import { Modal } from 'components/modal';
 
export default function Login() {
  return (
    <Modal>
      <h1>Login</h1>
      {/* ... */}
    </Modal>
  );
}
```

모달의 내용이 활성화 되지 않았을 때 표시되지 않게 하기 위해 `defallt.tsx` 파일에 null 값을 리턴해주면 된다.

```tsx
export default function Default() {
  return null;
}
```

### Dismissing a modal
만약 모달이 클라이언트 네비게이션을 통해 초기화 되었다면 ex) `<Link href='/login'>`, `router.back()` 를 호출해서 모달창을 닫을 수 있다. 또는 `Link` 컴포넌트를 사용해도 된다.

```tsx
'use client';
import { useRouter } from 'next/navigation';
import { Modal } from 'components/modal';
 
export default async function Login() {
  const router = useRouter();
  return (
    <Modal>
      <span onClick={() => router.back()}>Close modal</span>
      <h1>Login</h1>
      ...
    </Modal>
  );
}
```

만약 다른 곳으로 네비게이트 하고 싶거나 모달을 무시하고 싶다면, catch-all 라우트를 사용할 수 있다.
![[Pasted image 20230914221525.png]]


```tsx
export default function CatchAll() {
  return null;
}
```

- Catch-all 라우트는 `default.js` 보다 우선시 된다.

## Conditional Routes

Parallel Routes 는 조건부로 라우팅을 하기 위해서 사용될 수 있다. 예를들어, `@dashboard` 또는 `@login` 라우트를 authentication 상태에 따라 render 할 수 있다.

```tsx
import { getUser } from '@/lib/auth';
 
export default function Layout({ params, dashboard, login }) {
  const isLoggedIn = getUser();
  return isLoggedIn ? dashboard : login;
}
```

![[Pasted image 20230914221549.png]]

---

#Nextjs 