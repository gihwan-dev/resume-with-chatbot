## 서버 컴포넌트란?

서버 컴포넌트란 서버 사이드에서 렌더링 되는 리액트 컴포넌트이다. 이를 이용하면 서버 인프라구조에 이점을 가져올 수 있다. 클라이언트 사이드에서의 SEO 저하 문제를 해결할 수 있도록 해주며 클라이언트 컴포넌트와 서버 컴포넌트를 섞어 사용하면 각 렌더링의 장단점에 따라 다양한 구성을 할 수 있게 된다.

## 클라이언트 컴포넌트

클라이언트 컴포넌트는 앱에 클라이언트 사이드 반응성을 추가할 수 있도록 해준다. 클라이언트 컴포넌트는 서버에서 pre-render 된 후 클라이언트에서 **hydrate**된다.

### `'use client'`

`'use client'` 는 서버 컴포넌트와 클라이언트 컴포넌트 모듈의 경계를 선언하기 위해 사용되는 convention이다.

```tsx
'use client'

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
  <div>
		<p>You clicked {count} times</p>
		<button>Click me</button>
	</ div>
	);
)
```

`use client` 는 클라이언트와 server-only 코드 사이의 경계를 나누는 역할을 한다. 파일의 최상단, imports 위에 위치하며 server-only 파트와 클라이언트 파트를 나누는 경계의 역할을 한다. `'use client'`가 파일에 선언되면 그 파일에 포함된 모든 import 되는 모듈과 자식 컴포넌트는 클라이언트 번들의 한 요소로 고려된다.

서버 컴포넌트가 기본이기 때문에 `use client` 를 사용하지 않은 모든 컴포넌트는 서버 컴포넌트로 고려된다.

`use client`는 모든 파일에서 정의될 필요가 없고 클라이언트 컴포넌트가 되어야 하는 모듈의 ‘entry point’에 딱 한 번 정의해주면 된다. 그러나 내생각엔 client component가 될 모든 파일에 정의하는것이 좋아보인다.

---

## When to use Sever and Client Components?

Next.js 공식문서에서는 클라이언트 컴포넌트가 꼭 필요한 상황이 아니라면 서버 컴포넌트를 사용할것을 권장하고 있다.

아래 표는 서버와 클라이언트 컴포넌트의 차이점을 요약해둔 표다.

|어떤 기능이 필요한가?|서버 컴포넌트|클라이언트 컴포넌트|
|---|---|---|
|Fetch data|O|X|
|백엔드 자원에 직접적으로 접근|O|X|
|서버에 민감한 정보 저장|O|X|
|서버에 의존성을 가질 때|O|X|
|반응성과 이벤트 리스터를 추가할 때|X|O|
|상태를 사용하거나 생명주기를 사용할 때|X|O|
|브라우저 API를 사용할 때|X|O|
|커스텀 훅을 사용할 때|X|O|
|Class 컴포넌트를 사용할 때|X|O|

---

## Pattern

### 클라이언트 컴포넌트는 leaf에 위치 시켜라

클라이언트 컴포넌트는 가능하다면 컴포넌트 트리의 leaf에 위치시키도록 해라.

예를들어 어떠한 컴포넌트를 만들 때 전체 Layout을 클라이언트 컴포넌트로 만들지 말고 반응성을 가지거나 반드시 클라이언트 컴포넌트여야 하는것만 클라이언트 컴포넌트로 만들어라.

### 클라이언트와 서버 컴포넌트 구성하기

서버와 클라이언트 컴포너트는 같은 컴포넌트 트리에 구성될 수 있다.

Behind 에서 리액트는 다음과 같이 렌더링을 진행한다:

- 서버에서 모든 서버 컴포너트를 먼저 렌더링한다: 이 과정에 클라이언트 컴포넌트에 nest된 서버 컴포넌트도 포함된다. 클라이언트 컴포넌트는 렌더링 되지 않고 스킵된다.
- 클라이언트에서, 리액트는 클라이언트 컴포넌트를 랜더링하고 서버 컴포넌트의 랜더링 된 결과에 삽입하여 서버와 클라이언트의 작업이 끝나면 합친다. 만약 클라이언트 컴포넌트안에 nest된 서버 컴포넌트가 있다면, 그러한 컴포넌트는 클라이언트 컴포넌트안에 제대로 위치하게 된다.

## Nesting Server Components inside Client Components

클라이언트 컴포넌트에서 서버 컴포넌트를 불러오는데는 제한이 있다.

### 지원되지 않는 패턴

```tsx
'use client';
 
// This pattern will **not** work!
// You cannot import a Server Component into a Client Component.
import ExampleServerComponent from './example-server-component';
 
export default function ExampleClientComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [count, setCount] = useState(0);
 
  return (
    <>
      <button onClick={() => setCount(count + 1)}>{count}</button>
 
      <ExampleServerComponent />
    </>
  );
}
```

### 추천되는 패턴: 서버 컴포넌트를 Props로써 클라이언트에게 전달하기

서버 컴포넌트가 위치해야하는 `hole`를 표현하기 위해 리액트 Props를 사용해라.

서버 컴포넌트가 서버에서 랜더링 되고, 클라이언트에서 클라이언트 컴포넌트가 랜더링 될 때 `hole` 은 서버 컴포넌트의 랜더링된 결과로 채워질거다.

흔한 패턴은 React `children` 을 사용하여 `hole'을 만드는 방법이다. 다음과 같이 할 수 있다:

```tsx
'use client';
 
import { useState } from 'react';
 
export default function ExampleClientComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [count, setCount] = useState(0);
 
  return (
    <>
      <button onClick={() => setCount(count + 1)}>{count}</button>
 
      {children}
    </>
  );
}
```

이제 위 컴포넌트는 `children` 이 무엇인지에 대해서 모른다. 서버 컴포넌트의 렌더링 결과로 채워진다는것에 대한것도 모른다.

단 하나의 책임은 무엇이 되었든 `children` 이 결국 채워질 것이라는걸 아는 것이다.

부모 서버 컴포넌트에서 클라이언트 컴포넌트와 서버 컴포넌트를 불러와 서버 컴포넌트를 props로 전해주면 된다.

```tsx
// This pattern works:
// You can pass a Server Component as a child or prop of a
// Client Component.
import ExampleClientComponent from './example-client-component';
import ExampleServerComponent from './example-server-component';
 
// Pages in Next.js are Server Components by default
export default function Page() {
  return (
    <ExampleClientComponent>
      <ExampleServerComponent />
    </ExampleClientComponent>
  );
}
```

- Good to know
    - 이러한 패턴은 layouts 과 pages에 이미 적용되어 있다. 따라서 추가적인 wrapper 컴포넌트를 만들 필요가 없다. Layout과 pages 에 대한 설명은 [[Defining route]] 에 있다.
### 서버에서 클라이언트 컴포넌트로 props 전달하기(Serialization)

서버에서 클라이언트 컴포넌트로 props를 전달하기 위해서는 props가 serializable해야 한다. 이 말은 functions, Dates 등등의 데이터는 클라이언트 컴포넌트로 직접적으로 전달될 수 없다는 의미다.

### Server-Only 코드를 클라이언트 컴포넌트 밖에 위치 시키기

자바스크립트 모듈을 서로간에 공유할 수 있기 때문에 서버에서만 실행되기를 의도했던 코드가 클라이언트에서 실행될 수 있다.

예를들어 다음과 같은 코드를 살펴보자:

```tsx
export async function getData() {
  const res = await fetch('<https://external-service.com/data>', {
    headers: {
      authorization: process.env.API_KEY,
    },
  });
 
  return res.json();
}
```

`get Data` 함수는 클라이언트와 서버 모두에서 동작할 수 있다. 하지만 환경 변수인 `API_KEY` 는 서버에서만 접근할 수 있는 private 변수다. Next.js는 이러한 private변수를 빈 문자열로 바꾸어 중요한 정보의 유출을 막는다.

그 결과로 `getData()` 가 실행되더라도 예상한데로 동작하지 않게 된다. 클라이언트 사이드 코드에서 public 변수를 만든다 해도 이러한 행동은 민감한 정보를 유출하는 결과를 낳게될 수 있다.

그렇기에 위 함수는 서버에서만 실행되어야 한다.

### The “server-only” package

이러한 의도되지 않은 클라이언트에서의 서버 코드 사용을 방지하기 위해서 `server-only` 패키지를 사용할 수 있다. 이 패키지는 의도치 않게 클라이언트 컴포넌트에서 이 모듈을 불러오게되면 빌드타임 에러를 발생시킨다.

`server-only` 패키지를 사용하기 위해서 우선 설치 해줘야 한다.

`npm install server-only` 를 실행한다.

이후 server-only code에 이 모듈을 import 한다:

```tsx
import 'server-only';
 
export async function getData() {
  const res = await fetch('<https://external-service.com/data>', {
    headers: {
      authorization: process.env.API_KEY,
    },
  });
 
  return res.json();
}
```

이제 `getData()`를 호출하는 모든 클라이언트 사이드 코드는 빌드 타임 에러를 받게 된다.

그에 상응하는 패키지로 `client-only` 가 있다. 클라이언트 사이드에서만 실행되어야 하는 모듈에 포함될 수 있는데 예를 들면 `window` 객체로의 접근 등이 있다.

### [[Data Fetching]]

클라이언트 컴포넌트에서 데이터를 fetching할 수 있지만 서버 컴포넌트에서 데이터를 fetching하는것을 추천한다. 서버 컴포넌트에서 데이터를 fetching하는것은 퍼포먼스를 향상시켜주고 UX 상승에도 도움을 준다.

### Third-party packages

서버 컴포넌트는 새로운 기능이기 때문에 third-party 패키지(ex: `useState`, `useEffect`, `createContext` )를 사용하고 싶다면 `'use client'` 를 추가해야 한다.

지금은 많은 `npm` 패키지들에 `use client` 가 추가되어 있지 않다. 이러한 서드 파티 패키지는 `use client` 를 추가해 클라이언트 컴포넌트에서 사용해야 예상한대로 동작한다.

서버 컴포넌트에서 이러한 서드 파티 라이브러리를 사용하면 오류를 발생시키는데, 이러한 경우 다음과 같이 서드 파티 컴포넌트를 외부로 빼서 `use client` 를 추가해 export 해주면 된다.

```tsx
'use client';
 
import { AcmeCarousel } from 'acme-carousel';
 
export default AcmeCarousel;
```

클라이언트 컴포넌트 안에서만 사용하면 되기 때문에 대부분의 경우 위처럼 할 필요가 없지만 예외가 있다면 provider 컴포넌트다. provider 컴포넌트는 리액트 state와 context에 의존하기 때문에 주로 root에 위치시킬 필요가 있다. 이러한 경우에 사용할 수 있다.

---

## Context

대부분의 리액트 프로젝트들이 `createContext` 를 사용하거나 그렇지 않다면 써드 파티 라이브러리를 통해 `context` 에 의존하고 있다.

Next.js 13에서는 클라이언트 컴포넌트에서의 `context` 사용을 지원한다. 하지만 서버 컴포넌트에서는 사용할 수 없다.

서버 컴포넌트에서 데이터를 공유하기 위한 대안에 대해서 알아 볼것이지만 지금은 먼저 클라이언트 컴포넌트에서 `context` 를 사용하는 방법에 대해서 먼저 알아보자.

### Using context in Client Components

모든 context APi 는 클라이언트 컴포넌트에서 사용할 수 있다.

```tsx
'use client';
 
import { createContext, useContext, useState } from 'react';
 
const SidebarContext = createContext();
 
export function Sidebar() {
  const [isOpen, setIsOpen] = useState();
 
  return (
    <SidebarContext.Provider value={{ isOpen }}>
      <SidebarNav />
    </SidebarContext.Provider>
  );
}
 
function SidebarNav() {
  let { isOpen } = useContext(SidebarContext);
 
  return (
    <div>
      <p>Home</p>
 
      {isOpen && <Subnav />}
    </div>
  );
}
```

하지만 보통 context provider는 주로 루트에서 사용되기 때문에 서버 컴포넌트인 root에서 이를 사용하는것은 에러를 발생시킨다:

```tsx
import { createContext } from 'react';
 
//  createContext is not supported in Server Components
export const ThemeContext = createContext({});
 
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>
      </body>
    </html>
  );
}
```

이러한 문제를 해결하려면 context를 클라이언트 컴포넌트에서 만들어야 한다.

```tsx
'use client';
 
import { createContext } from 'react';
 
export const ThemeContext = createContext({});
 
export default function ThemeProvider({ children }) {
  return <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>;
}
```

서버 컴포넌트는 이제 provider를 직접적으로 렌더링 할 수 없게 된다.

```tsx
import ThemeProvider from './theme-provider';
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

이제 모든 클라이언트 컴포넌트는 context를 사용할 수 있게 된다.

## Rendering third-party context providers in Server Components

서드 파티 라이브러리 또한 root 에서 provider를 포함할 필요가 있다. 위처럼 `use client` 를 추가해주면 된다.

```tsx
'use client';
 
import { ThemeProvider } from 'acme-theme';
import { AuthProvider } from 'acme-auth';
 
export function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
```

```tsx
import { Providers } from './providers';
 
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

다만 위의 경우는 서드 파티 라이브러리에 아직 `use client` 가 추가되어있지 않기 때문이고 만약 서드 파티 라이브러리에 자체적으로 `use client` 가 추가되어 있다면 이러한 작업이 필요하지 않다.

## Sharing data between Server Components

서버 컴포넌트는 반응성이 없기 때문에 리액트로부터 상태를 읽지 않고, context의 데이터 공유 기능을 전적으로 사용할 필요가 없다. 여러 서버 컴포넌트가 접근해야 하는 평범한 종류의 데이터가 있다면 모듈에서 native JavaScript 패턴(global singletons)를 사용할 수 있다.

- Global singletons란?
    
    소프트웨어 디자인 패턴 중 하나로, 특정 클래스에 대해 오직 하나의 인스턴스만 조재하도록 보장하고, 이 인스턴스에 대한 글로벌한 접근점을 제공하는 것이다. 전역 변수를 사용하는 것과 유사한 효과를 가지지만, 인스턴스 생성을 제어할 수 있는 추가적인 유연성을 제공한다.
    
    ```tsx
    var Singleton = (function () {
        var instance;
     
        function createInstance() {
            var object = new Object("I am the instance");
            return object;
        }
     
        return {
            getInstance: function () {
                if (!instance) {
                    instance = createInstance();
                }
                return instance;
            }
        };
    })();
     
    function run() {
        var instance1 = Singleton.getInstance();
        var instance2 = Singleton.getInstance();
     
        console.log("Same instance? " + (instance1 === instance2));  
    }
     
    run();
    ```
    
    위 예제가 바로 그 글로벌 싱글톤의 사용 예제다. Singtone 객체는 IIFE(Immediately Invoked Function Expression)을 통해 생성된다. 이 객체는 `getInstance` 메서드를 통해 접근할 수 있는 `instance` 를 포함하고 있다. 만약 `intance` 가 이미 존재한다면 그것을 반환하고, 그렇지 않다면 새로 생성하여 반환한다.
    
    이 패턴은 공유 리소스에 대한 접근 제어, 로깅, 드라이버 객체, 캐싱 등의 상황에서 유용하게 사용될 수 있다. 하지만 오용하면 상태 관리가 복잡해지고, 테스트와 유지보수가 어려워지는 등의 문제를 야기할 수 있다.
    

예를들어, 한 모듈이 여러 컴포넌트에서 데이터베이스 연결을 공유하기 위해 사용될 수 있다:

```tsx
export const db = new DatabaseConnection();
```

```tsx
import { db } from '@utils/database';
 
export async function UsersLayout() {
  let users = await db.query();
  // ...
}
```

```tsx
import { db } from '@utils/database';
 
export async function DashboardPage() {
  let user = await db.query();
  // ...
}
```

### Sharing fetch requests between Server Components

데이터를 fetching할 때 그 결과를 페이지나 레이아웃 또는 자식 컴포넌트에 공유할 수 있다. 하지만 이러한 불필요한 coupling은 `props` 를 위 아래로 전달해 불필요한 chain을 만들 수 있다.

대신 데이터를 소비하는 컴포넌트마다 데이터 fetching 을 위치시키는것을 추천한다. 서버 컴포넌트에서는 fetch 요청의 중복이 자동으로 제거되므로, 각 루트 세그먼트는 중복없이 정확히 필요한 데이터만 요청할 수 있다. Next.js는 `fetch` 캐쉬로부터 같은 값을 읽는다.([[Caching Data]])

#Nextjs 