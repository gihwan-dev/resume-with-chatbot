Next.js는 특정한 정적 라우트를 **전체 페이지를 rebuild 하지 않고** 업데이트 할 수 있도록 해준다. Revalidation(aka. Incremental Static Regeneration) 는 페이지들의 규모가 커지더라고 static의 이점을 얻을 수 있도록 해준다.

Next.js는 다음 두 타입의 revalidation이 있다:

- **Background**: 특정한 시간 간격으로 데이터를 Revalidate한다.
- **On-demand**: 업데이트와 같은 이벤트에 기반에서 Revalidate한다.

---

## Background Revalidation

특정한 시간 간격으로 캐시된 데이터를 재검증 하려면, `next.revalidate` 옵션을 사용할 수 있다.

```tsx
fetch('https://...', { next: { revalidate: 60 } });
```

만약 `fetch` 를 사용하지 않는 데이터를 재검증하고싶다면(i.e. 외부 패키지 또는 쿼리 빌더), **route segment config** 를 사용할 수 있다.

```tsx
export const revalidate = 60 // 이 페이지를 60초마다 재검증
```

`fetch` 이외에도 `cache` 를 사용해서 재검증 할 수 있다.

### How it works

1. 빌드타임에 정적으로 렌더되는 라우트에 요청이 만들어졌을 때, 먼저 캐시된 데이터를 보여준다.
2. 최초 요청 이후 60초 이전의 경로에 대한 모든 요청도 캐시되어 즉시 처리된다.
3. 60초가 지난 후에도 다음 요청에는 캐시된(오래된) 데이터가 계속 표시된다.
4. Next.js 가 백그라운드에서 데이터를 재생성한다.
5. 라우트가 성공적으로 생성되면, Next.js는 캐시를 무효화하고 업데이트된 라우트를 보여준다. 만약 백그라운드 재생성이 실패한다면, 오래된 데이터가 그대로 표시된다.

아직 생성되지 않은 라우트에 대한 요청이 만들어진다면, Next.js는 첫 요청에 대해서 라우터를 동적으로 렌더링한다. 이후의 정적 라우트 세그먼트에 대한 요청들은 캐시로부터 사용될 것이다.

- **Note**:
    
    Check if your upstream data provider has caching enabled by default. You might need to disable (e.g. `useCdn: false`), otherwise a revalidation won't be able to pull fresh data to update the ISR cache. Caching can occur at a CDN (for an endpoint being requested) when it returns the `Cache-Control` header. ISR on Vercel [persists the cache globally and handles rollbacks](https://vercel.com/docs/concepts/incremental-static-regeneration/overview).
    

---

## On-demand Revalidation

만약 `revalidate` 를 60으로 설정했다면, 모든 사용자들은 일 분마다 갱신되는 같은 버전의 사이트를 보게 될것이다. 캐시를 무효화 하는 유일한 방법은 일분이 지난 뒤 다음 일분이 오기 전에 다른 누군가가 페이지를 방문하는 것이다.

Next.js 앱 라우터는 라우트 또는 캐시 태그를 기반으로 on-demand 컨텐츠 재검증을 지원한다. 이는 Next.js 캐시를 특정한 fetche에 제거할 수 있또록 하여 다음과 같은 상황에 사이트를 업데이트하는것을 더 쉽게 만들어준다:

- Headless CMS가 생성하거나 업데이트한 컨텐츠
    
    - Headless CMS란?
        
        우선 CMS 란 CMS(Content Management System)의 약자로 웹 콘텐츠 관리를 돕는 시스템이다. 웹 사이트의 컨텐츠를 생성, 편집, 조직화하고 출판하는 것을 단순화하는 데 도움을 준다. Headless CMS란 CMS와 유사하게 콘텐츠를 생성하고 관리하는 기능을 제공하지만, 컨텐츠를 프론트엔드에서 직접 전달하는 대신 API를 통해 콘텐츠를 제공한다.
        
- Ecommerce의 메타데이터의 변화(price, description ,category, reviews, etc).
    

## Using On-Demand Revalidation

데이터는 경로(**revalidatePath**) 또는 캐시 태그(**revalidateTag**)에 의해서 on-demand로 재검증 될 수 있다.

예를들어, 다음은 `fetch` 에 `collection` 캐시 태그를 더하는 예제이다:

```tsx
export default async function Page() {
  const res = await fetch("https://...", { next: { tags: ['collection'] } })
  const data =await res.json()
  // ...
}
```

이 캐시된 데이터는 라우트 핸들러에서 `revalidateTag` 를 호풀함으로써 on-demand로 재검증 될 수 있다.

```tsx
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get('tag');
  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, now: Date.now() })
}
```

---

## Error Handling and Revalidation

만약 데이터를 재검증하는 도중에 에러가 발생했다면, 마지막으로 성공적으로 생성된 데이터가 캐시로부터 재공될 것이다. 다음 요청에 Next.js는 데이터 재검증을 재시도 할 것이다.

---

#Nextjs 