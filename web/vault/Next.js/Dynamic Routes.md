정확한 세그먼트 명을 미리 알 수 없고 동적인 데이터에 반응하는 라우트를 만들고 싶다면, Dynamic Segments를 사용할 수 있다. 동적 세그먼트는 빌트 타임에 prerender 되거나 요청 타임에 채워진다.

---

## Convention

각진 괄호(대괄호) 안에 폴더 이름을 위치시킴으로써 동적 세그먼트를 생성할 수 있다. 예를들어 `[id]` 또는 `[slug]` 이다.

동적 세그먼트는 `layout`, `page`, `route`, `generateMetadata 함수` 에 `params` 로서 전달된다.

---

## Example

예를들어, 한 블로그가 다음과 같은 라우트를 가질 수 있다: `app/blog/[slug]/page.js` `[slug]` 는 다이나믹 세그먼트다.

```tsx
export default function Page({ params }) {
  return <div>My Post</div>;
}
```

|Route|Example URL|params|
|---|---|---|
|app/blog/[slug]/page.js|/blog/a|{ slug: 'a' }|
|app/blog/[slug]/page.js|/blog/b|{ slug: 'b' }|
|app/blog/[id]/page.js|/blog/c|{ id: 'c' }|

위처럼 파라미터에 접근 할 수 있다.

---

## Generating Static Params

`generateStaticParmas` 함수는 다이나믹 라우트 세그먼트와 조합해 사용해서 빌드타임에 정적으로 라우트를 생성하는데 사용될 수 있다.

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetch('https://.../posts').then((res) => res.json());
 
  return posts.map((post) => ({
    slug: post.slug,
  }));
}
```

`generateStaticParams` 함수의 주요한 이점은 데이터를 영리하게 수집한다는 점이다. 만약 `generateStaticParams` 함수에서 `fetch` 요청을 보낸다면, 요청이 중복제거된다. 즉, 여러 레이아웃, 페이지, `generateStaticParams` 에서 같은 인수를 통한 `fetch` 요청은 오직 한 번만 진행되고, 이는 빌드 타임을 감소시켜 준다.

---

다이나믹 세그먼트는 줄임표를 각진 괄호(대괄호) 안에 다음처럼 표기함으로써 모든 연속되는 세그먼트를 잡아낼 수 있다: `[...folderName]`.

예를들어, `app/shop/[...slug]/page.js` 는 `/shop/clothes` 와 `/shop/clothes/tops`, `/shop/clothes/tops/t-sirts` 모두와 매치된다.

![[Pasted image 20230914220303.png]]

---

## Optional Catch-all Segments
Catch-all 세그먼트는 다음과 같은 표기법을 통해 선택적으로 만들어질 수 있다.: `[[...folderName]]` .

예를들어 `app/shop/[[...slug]]/page.js` 는 `/shop` 뿐만 아니라 `/shop/clothes` , `/shop/clothes/tops` 등과 매치한다.

**optional catch-all** 과 **catch-all** 의 차이점은 옵셔널은 파라미터가 없는 라우트도 매치한다는 점이다.

![[Pasted image 20230914220350.png]]

---

## TypeScript

라우트 세그먼트 설정에 따라 타입을 추가할 수 있다.

```tsx
export default function Page({ params }: { params: { slug: string } }) {
  return <h1>My Page</h1>;
}
```

![[Pasted image 20230914220406.png]]
> [!note] 추후에 TypeScript plugin을 통해 자동으로 완료될 수 있다.

#Nextjs 