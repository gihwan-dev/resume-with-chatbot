Next.js 는 기본적으로 매 요청에 기반한(recomended) 또는 전체 라우트 세그먼트를 위한 데이터 캐싱을 지원한다.

![[Pasted image 20230914222912.png]]

---

## Per-request Caching

### `fetch()`

기본적으로 모든 `fetch()` 요청은 자동으로 캐시되고 중복제거된다. 이는 만약 같은 요청을 두번 하게 된다면, 두 번째 요청은 첫번째 요청의 결과를 재사용한다는 의미이다.

```tsx
async function getComments() {
  const res = await fetch('https://...') // The result is cached
  return res.json()
}
 
// This function is called twice, but the result is only fetched once
const comments = await getComments() // cache MISS
 
// The second call could be anywhere in your application
const comments = await getComments() // cache HIT
```

요청은 다음과 같은 경우에 캐쉬되지 않을 수 있다:

- 동적 메소드(`next/headers`, `export const POST`, 또는 유사한것) 가 사용되거나 fetch가 `POST` 요청인경우( 또는 `Authorization` 또는 `cookie` 헤더를 사용하는 경우).
- `fetchCache` 가 기본적으로 캐시를 건너뛰도록 설정된 경우.
- `revalidate: 0` 또는 `cache: 'no-store'` 가 설정된 경우

요청의 재검증 주기를 제어하기 위해서 `fetch` 의 `revalidate` 옵션을 설정해줄 수 있다.

```tsx
export default async function Page() {
  const res = await fetch('https://....', { next: { revalidate: 10 } })
  const data = res.json();
  // ...
}
```

## React `cache()`

리액트에서 `cache()` 함수를 통해 감싸진 함수의 호출 결과를 기억하고 중복제거할 수 있다. 같은 인수를 통해 호출된 함수는 함수를 재실행하지 않고 캐시된 값을 재사용 할것이다.

```tsx
import { cache } from 'react'

export const getUser = cache(async (id: string) => {
  const user = await db.user.findUnique({ id })
  return user
})
```

```tsx
import { getUser } from '@utils/getUser'
 
export default async function UserLayout({ params: { id } }) {
  const user = await getUser(id)
  // ...
}
```

```tsx
import { getUser } from '@utils/getUser'
 
export default async function Page({
  params: { id },
}: {
  params: { id: string }
}) {
  const user = await getUser(id)
  // ...
}
```

`getUser()` 함수가 두 번 호출되었지만 데이터베이스 쿼리 문은 한번만 만들어진다. `getUser()` 함수가 `cache()` 함수로 감싸졌기 때문인데, 이를 통해 두번째 요청은 첫번째 요청의 결과를 재사용할 수 있게 된다.

- **Good to know:**
    - `fetch()` 는 요청을 자동적으로 캐싱하기 때문에, 함수를 감싸줄 필요는 없다.
    - 이러한 새로운 모델을 통해, **데이터를 필요로 하는 컴포넌트에서 직접적으로 데이터를 fetching하는것을 추천한다**. 컴포넌트 사이에서 프로퍼티를 전달하기 보단, 여러 컴포넌트에서 같은 요청을 발생시키더라도 그렇게 하는것이 좋다.
    - 클라이언트에서 서버 데이터 fetching이 사용되지 않도록 `server-only package` 를 사용하는 것을 권장한다.
        - `npm install server-only`
        - 이후 서버 컴포넌트 위에 `import server-only` 를 작성해주면된다. 이렇게 하면 해당 모듈 안의 함수를 사용하는 클라이언트 컴포넌트는 에러를 발생시키게 된다.

## `POST` 요청과 `cache()`

`POST` 요청은 `fetch` 를 사용할 때 자동적으로 중복제거된다-`POST` 라우트 핸들러 안에 위치하거나 `headers() / cookies()` 뒤에 오는 경우는 예외다.

```tsx
import { cache } from 'react'
 
export const getUser = cache(async (id: string) => {
  const res = await fetch('...', { method: 'POST', body: '...' })
  // ...
})
```

## Preload pattern with `cache()`

하나의 패턴으로, data를 fetching하는 유틸리티 또는 컴포넌트에서 `preload()` 선택적으로 노출 시키는것을 제안한다.

```tsx
import { getUser } from '@utils/getUser'
 
export const preload = (id: string) => {
  // void evaluates the given expression and returns undefined
  // <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void>
  void getUser(id)
}
export default async function User({ id }: { id: string }) {
  const result = await getUser(id)
  // ...
}
```

`preload` 를 호출하면 필요한 데이터를 바로 가져올 수 있다.

```tsx
import User, { preload } from '@components/User'
 
export default async function Page({
  params: { id },
}: {
  params: { id: string }
}) {
  preload(id) // starting loading the user data now
  const condition = await fetchCondition()
  return condition ? <User id={id} /> : null
}
```

부연 설명을 붙이자면 이는 API 가 아니라 하나의 패턴이라고 한다. 자동으로 중복제거하는 방식을 통해서 상위 컴포넌트에서 미리 호출해서 값을 캐싱해둔 뒤, 하위 컴포넌트에서 이를 fetch할 때 같은 요청을 중복으로 만들어 내지않고 캐시된 값을 이용하게 만드는 패턴이라고 생각된다.

- **Good to know:**
    - `preload()` 함수의 이름은 어떤것이든 될 수 있다.
    - 이 패턴은 선택적으로 적용하면 된다. 이 패턴은 **parallel data fetching** 을 기반으로 하고 있다. 그러나 이제 우리는 promises를 프로퍼티로 전해줄 필요 없이 preload 패턴에 의존해 사용할 수 있다.

## Combining `cache`, `preload`, and `server-only`

앱 전체에서 사용될 data fetching 함수를 위 세 방식을 합쳐 만들어 줄 수 있다.

```tsx
import { cache } from 'react'
import 'server-only'
 
export const preload = (id: string) => {
  void getUser(id)
}
 
export const getUser = cache(async (id: string) => {
  // ...
})
```

이러한 접근법을 통해 응답을 캐시하고, 데이터를 적극적으로 가져오고, 이러한 데이터 fetching이 서버에서만 일어나도록 보장할 수 있다.

`getUser.ts` 로부터 exports 된 코드들은 페이지, 레이아웃, 또는 유저의 데이터가 fetch 되는 컴포넌트 등에서 사용될 수 있다.

---

## Segment-level Caching

- **Note**: 캐싱에 대한 세분성과 제어를 개선하려면 요청별 캐싱을 사용하는 것이 좋다.

세그먼트-레벨 캐싱은 라우트 세그먼트에서 사용되는 데이터를 캐시하고 재검증할 수 있도록 해준다.

이러한 메커니즘은 다른 경로의 세그먼트가 전체 라우트의 캐시 생명주기를 제어할 수 있도록 해준다.

각각의 `page.tsx` 와 `layout.tsx` 는 `revalidate` 값을 export 하여 라우트의 revalidation time을 설정할 수 있다.

```tsx
export const revalidate = 60 // revalidate this segment every 60 seconds
```

- **Good to know:**
    - page, layout과 컴포넌트 안에서 이루어지는 요청이 모두 `revalidate` 주기가 설정된 상태라면, 세가지 중 가장 작은 값이 사용된다.
    - Advanced: `fetchCache` 를 `only-cache` 또는 `force-cache` 로 설정하여 모든 `fetch` 요청에 대한 캐시 설정을 할 수 있다.

#Nextjs 
