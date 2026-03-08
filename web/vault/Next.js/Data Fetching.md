- **Good to know:**
    
    - 새로운 데이터 페칭 모델은 현재 리액트 팀에 의해 개발중이다.
<center><iframe width="500" height="400" src="https://github.com/acdlite/rfcs/blob/first-class-promises/text/0000-first-class-support-for-promises.md"></iframe></center>

    위 링크에서 새로운 **use()** 훅과 **async** , **await** 를 소개하고 있다. 위 자료를 읽는것을 추천한다. 아직 안정화 버전은 아니다.

Next.js 13은 데이터를 관리하는 새로운 방법을 소개한다. 새로운 데이터 페칭은 `app` 디렉터리에서 동작하고 `fetch()` 웹 API를 기반으로 만들어졌다.

`fetch()` 는 **프로마이스를 반환하는** 웹 API이다. 리액트는 `fetch` 를 자동 중복 제거 하도록 확장하고 Next.js 는 `fetch` 의 옵션 객체에 캐싱과 재검증 옵션을 설정할 수 있도록 확장했다.

---

## `async` 와 `await` (서버 컴포넌트)

**React RFC 제안을 통해**, 서버 컴포넌트에서 `async` `await` 를 사용해 데이터를 Fetch 할 수 있다.

```tsx
async function getData() {
  const res = await fetch('<https://api.example.com/>...');
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
 
  // Recommendation: handle errors
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
 
  return res.json();
}
 
export default async function Page() {
  const data = await getData();
 
  return <main></main>;
}
```

- **Async Server Component TypeScript Error**
    
    타입스크립트에서 서버 컴포넌트에 `async` 를 사용하는 것은 에러를 발생시킬 수 있는데, 현재 이를 해결할 수 있는 임시적인 방안은 `{/* @ts-expect-error Async Server Component */}` 를 서버 컴포넌트위에 위치시켜 타입 체킹을 diable 하는 것이다.
    

## Server Component Functions

Next.js 는 서버 컴포넌트에서 데이터를 fetching할 때 필요할 수 있는 서버 함수를 제공한다.

- `cookies()`
- `headers()`

---

## `use` (클라이언트 컴포넌트)

`use` 는 `Promise` 를 입력받는 새로운 리액트 함수다.(`await` 와 유사함)

<center>
<iframe width="500px" height="400px" src="https://github.com/acdlite/rfcs/blob/first-class-promises/text/0000-first-class-support-for-promises.md#usepromise">
</iframe>
</center>

위 링크에서 자세한 사항을 확인할 수 있다.

`fetch` 를 `use` 로 감싸는 것은 현재는 추천되지 않는다. 의도하지 않은 re-render를 발생시킬 수 있기 때문이다. 그렇기에 현재는 데이터를 fetch하고 싶다면 **SWR** 이나 **React Query** 를 사용하는것을 추천한다.

---

## Static Data Fetching

기본적으로, `fetch` 는 자동적으로 fetch 하고 cache 한다.

`fetch('https://...');` cache: ‘force-cache’ 가 기본 설정이다.

## Revalidation Data

캐시된 데이터를 일정한 시간 간격으로 재검증하기 위해서, `next.revalidate` 옵션을사용할 수 있다.

```tsx

fetch('https://...', { next: { revalidate: 10 } });
```

- **NOTE**: 페치 레벨에서 캐시되는 데이터들은 공유된다. 유저에게 민감한 데이터를 저장하는것을 피해야 한다.(`cookies()`, `header()` 등)

---

## Dynamice Data Fetching

`cahe: 'no-store'` 옵션을 통해 매번 `fetch` 요청에 쿠키를 사용하지 않고 최신의 데이터를 받아볼 수 있도록 할 수 있다.

---

## Data Fetching Patterns

### Parallel Data Fetching

클라이언트 서버의 누수를 최소화하기 위해서, 데이터를 parallel 하게 fetcht 하는것을 추천한다:

```tsx
import Albums from './albums';
 
async function getArtist(username: string) {
  const res = await fetch(`https://api.example.com/artist/${username}`);
  return res.json();
}
 
async function getArtistAlbums(username: string) {
  const res = await fetch(`https://api.example.com/artist/${username}/albums`);
  return res.json();
}
 
export default async function Page({
  params: { username },
}: {
  params: { username: string };
}) {
  // Initiate both requests in parallel
  const artistData = getArtist(username);
  const albumsData = getArtistAlbums(username);
 
  // Wait for the promises to resolve
  const [artist, albums] = await Promise.all([artistData, albumsData]);
 
  return (
    <>
      <h1>{artist.name}</h1>
      <Albums list={albums}></Albums>
    </>
  );
}
```

서버 컴포넌트에서 각 요청을 `await` 하기 전에 실행시킴으로써 동시에 `fetch` 요청을 실행히킬 수 있다. 이를 통해 누수를 피할 수 있다.

두 요청을 동시에 평형하게 초기화 시킴으로써 시간을 단축시킬 수 있지만, 유저는 두 promise가 resolve 될 때 까지 결과를 볼 수 없다.

사용자 경험을 개선하기 위해서 `suspense boundary` 를 사용해 렌더링 작업을 다음의 형태로 분리하고 먼저 완료된 결과를 보여주도록 할 수 있다:

```tsx
import { getArtist, getArtistAlbums, type Album } from './api';
 
export default async function Page({
  params: { username },
}: {
  params: { username: string };
}) {
  // Initiate both requests in parallel
  const artistData = getArtist(username);
  const albumData = getArtistAlbums(username);
 
  // Wait for the artist's promise to resolve first
  const artist = await artistData;
 
  return (
    <>
      <h1>{artist.name}</h1>
      {/* Send the artist information first,
          and wrap albums in a suspense boundary */}
      <Suspense fallback={<div>Loading...</div>}>
        {/* @ts-expect-error Async Server Component */}
        <Albums promise={albumData} />
      </Suspense>
    </>
  );
}
 
// Albums Component
async function Albums({ promise }: { promise: Promise<Album[]> }) {
  // Wait for the albums promise to resolve
  const albums = await promise;
 
  return (
    <ul>
      {albums.map((album) => (
        <li key={album.id}>{album.name}</li>
      ))}
    </ul>
  );
}
```

컴포넌트 구조를 좀 더 개선 시키기 위해서 다음 링크를 참고하길 바란다.

<center>
<iframe width="500px" height="400px" src="https://nextjs.org/docs/app/building-your-application/data-fetching/caching#preload-pattern-with-cache"></iframe>
</center>

### Sequential Data Fetching

연속적으로 데이터를 fetch하기 위해서, `fetch` 를 필요로하는 각 컴포넌트에서 직접적으로 `fetch` 와 `await` 를 함께 호출할 수 있다:

```tsx
// ...
 
async function Playlists({ artistID }: { artistID: string }) {
  // Wait for the playlists
  const playlists = await getArtistPlaylists(artistID);
 
  return (
    <ul>
      {playlists.map((playlist) => (
        <li key={playlist.id}>{playlist.name}</li>
      ))}
    </ul>
  );
}
 
export default async function Page({
  params: { username },
}: {
  params: { username: string };
}) {
  // Wait for the artist
  const artist = await getArtist(username);
 
  return (
    <>
      <h1>{artist.name}</h1>
      <Suspense fallback={<div>Loading...</div>}>
        {/* @ts-expect-error Async Server Component */}
        <Playlists artistID={artist.id} />
      </Suspense>
    </>
  );
}

```

각 컴포넌트에서 필요한 데이터를 직접적으로 호출하고 있다.

컴포넌트 안에서 데이터를 fetching 함으로써 각 fetch 요청과 종속된 세그먼트의 라우터는 이전의 작업 또는 세그먼트가 완료되기전까지 data를 요청하고 렌더링할 수 없다.

### Blocking Rendering in a Route

레이아웃에서 데이터를 fetching하게되면, 레이아웃 아래에 위치하는 모든 라우트 세그먼트는 데이터의 로딩이 끝나야만 렌더링될 수 있게 된다.

`pages` 폴더에서는 `getServerSideProps` 의 결과가 완료될 때 까지 loading spinner를 보여준다. 이를 “전부 아니면 전무” 데이터 가져오기라고 설명할 수 있다. 페이지에 대한 전체 데이터가 있거나 전혀 없을 수 있다.

`app` 디렉터리에는 찾아볼 수 있는 추가적인 옵션들이 있다:

1. data fetching 함수로부터 결과를 받아오는 동안 `loading.js` 를 통해 인스턴트 로딩 state를 보여줄 수 있다.
2. 데이터가 필요한 컴포넌트에서만 data fetching을 함으로써 데이터를 fetching하는 페이지의 부분들만 bloking 되게 할 수 있다. 예를 들어 루트 레이아웃에서 data 를 fetching하기보다 특정한 컴포넌트 단위로 data를 fetching하는 것이다.

가능하면 데이터를 사용하는 컴포넌트에서 data를 fetch 해라. 전체 페이지가 로딩되는 모습이 아닌 페이지의 특정한 부분만 로딩 상태를 보여줄 수 있도록 할 수 있다.

---

## Data Fetching without `fetch()`

Database client 또는 ORM 과 같은 서드 파티 라이브러리를 사용하고 있다면, `fetch` 를 바로 사용할 수 없을 수 있다.

`fetch` 를 사용할 수 없지만 여전히 캐싱 또는 revalidation 동작을 제어하고 싶다면, **default caching behavior** 또는 **segment cache configuration**을 사용할 수 있다.

## Default Caching Behavior

`fetch` 를 직접적으로 사용하지 않는 어떠한 라이브러리도 라우트의 캐싱에 영향을 주지 않는다.

만약 세그먼트가 정적(default)이라면, 요청의 결과가 나머지 세그먼트와 함께 캐시되고 재검증된다(설정된경우). 세그먼트가 동적인 경우 요청의 출력은 캐시되지 않으며 세그먼트가 렌더링 될 때 마다 요청을 re-fetch 하게 된다.

- **Good to know**: `cookies()` 또는 `headers()` 와 같은 동적 함수들은 라우트 세그먼트를 동적으로 만든다.

## Segment Cache Configuration

임시방편으로, 서드 파티 라이브러리의 캐시 동작이 설정 가능할 수 있을때 까지 전체 세그먼트의 캐시 동작을 customize 하기 위해서 **segment configuration** 을 사용할 수 있다.

```tsx
import prisma from './lib/prisma'
 
export const revalidate = 3600 // revalidate every hour
 
async function getPosts() {
  const posts = await prisma.post.findMany()
  return posts
}
 
export default async function Page() {
  const posts = await getPosts()
  // ...
}
```

---
#Nextjs 