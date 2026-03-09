라우트 핸들러는 주어진 라우트에 대한 웹 Req, Res API 를 만들 수 있도록 해준다

![[Pasted image 20230914221915.png]]

---

## Convention

라우트 핸들러는 `app` 디렉터리의 `route.js|ts` 파일 안에 정의할 수 있다.

```tsx
// app/api/route.ts
export async function GET(request: Request) {}
```

라우트 핸들러는 `app` 디렉터리 안에 중첩될 수 있다. 하지만 `route.js` 파일은 `page.js` 파일과 같은 라우트 세그먼트 레벨에 있어서는 안된다.

### Supported HTTP Methods

`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS` 가 지원된다.

## Extended `NextRequest` and `NextResponse` APIs

naive Request 와 Response 에 추가로 Next.js는 `NextRequest` 와 `NextResponse` 를 제공한다.

---

## Behavior

### Static Route Handlers

라우트 핸들러는 `GET` method를 `Response` 와 함께 사용할 때 기본적으로 정적으로 평가된다.

```tsx
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  const res = await fetch('<https://jsonplaceholder.typicode.com/todos/1>', {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();

  return NextResponse.json({ data });
}
```

### Dynamic Route Handlers

라우트 핸들러는 다음과 같이 사용할 때 동적으로 평가된다:

- `GET` method와 함께 `Request` 객체를 사용할 때.
- `GET` 이외의 다른 HTTP 메서드를 사용할 때.
- `cookies` 나 `headers` 같이 동적 함수를 사용할 때.
- 동적 모드를 수동으로 설정할 때.

예를들어:

```tsx
import { NextResponse } from 'next/server';
 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const res = await fetch(`https://data.mongodb-api.com/product/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'API-Key': process.env.DATA_API_KEY,
    },
  });
  const product = await res.json();
 
  return NextResponse.json({ product });
}
```

유사하게 `POST` method는 라우트 핸들러가 동적으로 평가되도록 한다.

```tsx
import { NextResponse } from 'next/server';
 
export async function POST() {
  const res = await fetch('<https://data.mongodb-api.com/>...', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-Key': process.env.DATA_API_KEY,
    },
    body: JSON.stringify({ time: new Date().toISOString() }),
  });
 
  const data = await res.json();
 
  return NextResponse.json(data);
}
```

## Route Resolution

`route` 를 가장 낮은 레벨의 primitive 로 생각할 수 있다.

- `page` 와 같은 클라이언트 사이드 네비게이션 이나 레이아웃에서는 동작하지 않는다.
- `page.js` 파일과 같은 경로를 가지는 `route.js` 파일이 있어서는 안된다.

![[Pasted image 20230914221926.png]]

---

## Exmaples

다음의 예제들은 어떻게 라우트 핸들러를 다른 Next.js API 특징들과 결합하는지에 대해서 보여준다.

### Revalidating Static Data

`next.revalidate` 옵션을 사용해서 정적 데이터의 유효성을 재검증 할 수 있다:

```tsx
import { NextResponse } from 'next/server';
 
export async function GET() {
  const res = await fetch('<https://data.mongodb-api.com/>...', {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });
  const data = await res.json();
 
  return NextResponse.json(data);
}
```

### Dynamic Functions

라우트 핸들러는 `cookies` 나 `headers` 같이 Next.js 에서 제공하는 동적 함수를 통해 사용될 수 있다.

**Cookies**

```tsx
import { cookies } from 'next/headers';
 
export async function GET(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
 
  return new Response('Hello, Next.js!', {
    status: 200,
    headers: { 'Set-Cookie': `token=${token}` },
  });
}
```

**Headers**

`next/headers` 의 `headers` 로 부터 헤더를 읽을 수 있다. 이 서버 함수는 라우트 핸들러에서 직접적으로 호출될 수 있고 또는 다른 함수에 안에 중첩될 수 있다.

이 `headers` 인스턴스는 읽기전용이다. 헤더를 설정하기 위해서는 새로운 `Response` 와 새로운 `headers` 를 반환해 줘야 한다.

```tsx
import { headers } from 'next/headers';
 
export async function GET(request: Request) {
  const headersList = headers();
  const referer = headersList.get('referer');
 
  return new Response('Hello, Next.js!', {
    status: 200,
    headers: { referer: referer },
  });
}
```

**Redirects**

```tsx
import { redirect } from 'next/navigation';
 
export async function GET(request: Request) {
  redirect('<https://nextjs.org/>');
}
```

### Dynamic Route Segments

라우트 핸들러는 동적으로 사용될 수 있다.

```tsx
// app/items/[slug]/route.js
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { slug: string };
  },
) {
  const slug = params.slug; // 'a', 'b', or 'c'
}
```

![[Pasted image 20230914221936.png]]
### Streaming

```tsx
// <https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#convert_async_iterator_to_stream>
function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
 
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}
 
function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
 
const encoder = new TextEncoder();
 
async function* makeIterator() {
  yield encoder.encode('<p>One</p>');
  await sleep(200);
  yield encoder.encode('<p>Two</p>');
  await sleep(200);
  yield encoder.encode('<p>Three</p>');
}
 
export async function GET() {
  const iterator = makeIterator();
  const stream = iteratorToStream(iterator);
 
  return new Response(stream);
}
```

### Request Body

`Request` body를 읽을 수 있다:

```tsx
import { NextResponse } from 'next/server';
 
export async function POST(request: Request) {
  const res = await request.json();
  return NextResponse.json({ res });
}
```

### CORS

CORS 헤더를 설정할 수 있다:

```tsx
export async function GET(request: Request) {
  return new Response('Hello, Next.js!', {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

### Edge and Node.js Runtimes

라우트 핸들러는 isomorphic 웹 API 를 지원하기 때문에 Edge 와 Node.js 런타임 모두 지원한다. 또한 스트리밍 또한 지원한다. 라우트 핸들러는 layout 과 page 와 같이 라우트 세그먼트 설정을 사용하기 때문에 범용 목적의 재생성된 라우트 핸들러와 같은 오래 기다려왔던 특징들을 지원한다.

`runtime` 을 사용해서 runtime 옵션을 특정할 수 있다:

```tsx
export const runtime = 'edge'; // 'nodejs' is the defualt
```

### Non-UI Responses

non-UI 컨텐츠를 반환하기 위해 라우트 핸들러를 사용할 수 있다. `sitemap.xml`, `robots.txt`, `app icons` 와 open graph images 는 모두 빌트인으로 지원한다.

```tsx
export async function GET() {
  return new Response(`<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
 
<channel>
  <title>Next.js Documentation</title>
  <link><https://nextjs.org/docs></link>
  <description>The React Framework for the Web</description>
</channel>
 
</rss>`);
}
```

### Segment Config Options

라우트 핸들러는 앞서 말했듯이 페이지 또는 레이아웃과 같은 라우트 세그먼트 설정을 사용한다.

```tsx
export const dynamic = 'auto';
export const dynamicParams = true;
export const revalidate = false;
export const fetchCache = 'auto';
export const runtime = 'nodejs';
export const preferredRegion = 'auto';
```


#Nextjs 