미들웨어는 요청이 완료되기 전에 코드를 실행할 수 있도록 해준다. 그렇게하면, 들어오는 요청에 대해 응답을 수정하거나, request 또는 response 의 헤더를 수정하거나, 또는 바로 응답을 해버릴수도 있다.

미들웨어는 content 가 캐쉬되고 매치되기 전에 실행된다.

---

## Convention

`middleware.ts` 파일을 프로젝트의 루트에 정의해서 미들웨어를 사용할 수 있다.

---

## Example

```tsx
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  return NextResponse.redirect(new URL('/home', req.url));
}

export const config = {
  matcher: '/about/:path*',
};
```

---

## Matching Paths

미들웨어는 프로젝트의 모든 라우트에 동작한다. 다음은 실행 순서다:

1. `next.config.js` 의 `headers`
2. `next.config.js` 의 `redirects`
3. 미들웨어( `rewrites`, `redirects`, etc.)
4. `next.config.js` 의 `beforeFiles` (`rewrites`)
5. 파일 시스템 라우트 (`public/`, `_next/static/`, `pages/` , `app/`, etc.)
6. `next.config.js 의 afterFiles` (`rewrites`)
7. 동적 라우트(`/blog/[slug]`)
8. `falback` (`rewrites`) from `next.config.js`

어떤 경로에 미들웨어를 실행하지를 설정하는 방법은 다음과 같이 두가지가 있다:

1. Custom matcher config
2. Conditional statements

## Matcher

`matcher` 은 특정한 경로에 미들웨어가 실행될 수 있도록 해준다.

```tsx
export const config = {
  matcher: '/about/:path*',
};
```

하나 또는 그 이상의 경로를 배열 문법을 통해 정의할 수 있다:

```tsx
export const config = {
  matcher: ['/about/:path*', '/dashboard/:path*']
};
```

`matcher` 는 정규표현식을 허용한다. 다음과 같이 사용할 수 있다.

```tsx
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

- Note: `matcher` 의 값은 상수여야 빌드 타임에 정적으로 평가될 수 있다. 동적인 값은 무시된다.

Configured machers:

1. MUST start with `/`
2. named parameters를 포함할 수 있다: `/about/:path` 는 `/about/a` 와 `/about/b` 와 매치하지만 `/about/a/c` 와는 매치하지 않는다.
3. named marameters에 modifiers를 가질 수 있다: `/about/:path*` 은 `/about/a/b/c` 와 매치할 수 있다. `*` 가 0 또는 그 이상을 의미하기 때문이다. ? 는 0또는 하나 그리고 `+` 는 하나 또는 그 이상을 의미한다.
4. 정규표현식을 괄호로 감싸 사용할 수 있다: `/about/(.*)` 는 `/about/:path*` 와 같다.

## Conditional Statements

```tsx
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
 
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/about')) {
    return NextResponse.rewrite(new URL('/about-2', request.url));
  }
 
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.rewrite(new URL('/dashboard/user', request.url));
  }
}
```

---

## NextResponse

`NextResponse` API 는 다음을 허용한다:

- `redirect`
- `rewrite` the response.
- API Routes, `getServerSideProps`, `rewrite` destinations 의 요청 헤더를 설정할 수 있도록 해준다.
- 응답 쿠키를 설정할 수 있다.
- 응답 헤더를 설정한다.

미들웨어에서 응답을 생성하려면 다음과 같이 할 수 있다:

1. 응답을 생성하는 라우트(Page or Edge API Route) 를 `rewrite` 한다.
2. `NextResponse` 를 반환한다.

---

## Using Cookies

쿠키는 일반 헤더다. `Request` 에 `Cookie` 헤더에 저장된다. `Response` 에 `Set-Cookie` 헤더안에 존재한다. Next.js는 `NextRequest` 와 `NextResponse` 를 통해 이 쿠키를 간편하게 조작할 수 있도록 해준다.

1. 들어오는 요청을 위해 `cookies` 는 다음과 같은 메소드를 동반한다: `get`, `getAll`, `set` , `delete` . 현재 존재하는 쿠키를 확인하기 위해 `has` 를 사용할 수 있고 또는 `clear` 를 통해 제거할 수 있다.
2. 나가는 응답을 위해, `cookies` 는 다음과 같은 메서드를 동반한다: `get`, `getAll`, `set`, `delete`.

```tsx
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  let cookie = req.cookies.get('nextjs')?.value;
  console.log(cookie);
  const allCookies = req.cookies.getAll();
  console.log(allCookies);

  req.cookies.has('nextjs');
  req.cookies.delete('nextjs');
  req.cookies.has('nextjs');

  const response = NextResponse.next();
  response.cookies.set('vercel', 'fase');
  response.cookies.set({
    name: 'vercel',
    value: 'fast',
    path: '/test',
  });
  return response;
}

export const config = {
  matcher: ['/about/:path*', '/dashboard/:path*'],
};
```

---

## Setting Headers

`NextResponse` 를 사용해서 요청, 응답 헤더를 설정할 수 있다.

```tsx
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-hello-from-middleware1', 'hello');

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  return response;
}

export const config = {
  matcher: ['/about/:path*', '/dashboard/:path*'],
};
```

---

## Producing a Response

`Response` 또는 `NextResponse` 를 반환해 미들웨어에서 바로 응답을 보낼 수 있다.

```tsx
import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@lib/auth';
 
// Limit the middleware to paths starting with `/api/`
export const config = {
  matcher: '/api/:function*',
};
 
export function middleware(request: NextRequest) {
  // Call our authentication function to check the request
  if (!isAuthenticated(request)) {
    // Respond with JSON indicating an error message
    return new NextResponse(
      JSON.stringify({ success: false, message: 'authentication failed' }),
      { status: 401, headers: { 'content-type': 'application/json' } },
    );
  }
}
```

---

## Advanced Middleware Flags

`v13.1` 에서 두가지 새로운 미들웨어 flag가 소개되었다. `skipMiddlewareUrlNomarlize` 와 `skipTrailingSlashRedirect` 이다.

`skipTrailingSlashRedirect` 는 미들웨어 내에서 특정한 경로에는 후행 슬래쉬를 유지하고 다른 경로에는 그렇게 하지 않게 하여 incremental migration을 더 쉽게 만들어 준다.

```tsx
// next.config.js
module.exports = {
  skipTrailingSlashRedirect: true,
};
```

```tsx
const legacyPrefixes = ['/docs', '/blog'];
 
export default async function middleware(req) {
  const { pathname } = req.nextUrl;
 
  if (legacyPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }
 
  // apply trailing slash handling
  if (
    !pathname.endsWith('/') &&
    !pathname.match(/((?!\\.well-known(?:\\/.*)?)(?:[^/]+\\/)*[^/]+\\.\\w+)/)
  ) {
    req.nextUrl.pathname += '/';
    return NextResponse.redirect(req.nextUrl);
  }
}
```

`skipMiddlewareUrlNomalize` 를 사용하면 Next.js가 수행하는 URL 정규화를 비활성화하여 직접 방문과 클라이언트 전환을 동일하게 처리할 수 있다. 원본 URL을 사용하여 완전한 제어가 필요한 고급 사례가 있는데, 이 기능을 사용하면 잠금이 해제된다.

```tsx
module.exports = {
  skipMiddlewareUrlNormalize: true,
};
```

```tsx
export default async function middleware(req) {
  const { pathname } = req.nextUrl;
 
  // GET /_next/data/build-id/hello.json
 
  console.log(pathname);
  // with the flag this now /_next/data/build-id/hello.json
  // without the flag this would be normalized to /hello
}
```

---

#Nextjs 