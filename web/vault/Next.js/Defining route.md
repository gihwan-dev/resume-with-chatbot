이 페이지에서는 Next.js 앱에서 어떻게 라우트를 조직하고 정의하는지에 배운다.

---

## Creating Routes

app 디렉터리 안에 위치하는 폴더들은 라우트를 정의하기 위해 사용된다.

각 폴더들은 한 라우트 세그먼트를 대표하고 **URL** 세그먼트로 매핑된다. nested route를 생성하기 위해서, 각 폴더 안에 nest 폴더를 만들어 nest할 수 있다.

![[Pasted image 20230914215437.png]]
`page.js`파일은 public하게 접근가능한 라우트를 만드는데 사용된다.
![[Pasted image 20230914215444.png]]

이 예제에서, `/dashboard/analytics` URL 경로는 public하게 접근할 수 없다. `page.js` 파일을 가지고 있지 않기 때문이다. 이 폴더는 컴포넌트를 저장하거나, style, image등을 파일들을 위치시키는 용도로 사용될 수 있다.

---

## Creating UI

Special file conventions 은 각 라우트 세그먼트의 UI를 생성하기위해 사용된다. 가장 흔한것은 한 라우트의 유니크한 UI를 보여주기 위한 `page` 파일과 여러 라우트에서 공유할 UI를 위한 `layout` 파일이다.[[Page and Layout]]

예를들어 `app` 디렉터리에 `page.js` 파일을 추가하고 리액트 컴포넌트를 export 한다:

```tsx
export default function Page() {
  return <h1>Hello, Next.js!</h1>;
}
```

#Nextjs 