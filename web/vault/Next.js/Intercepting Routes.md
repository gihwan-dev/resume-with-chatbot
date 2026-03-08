Intercepting routes 는 현 라우트의 context 를 유지하면서 라우트를 현 레이아웃에 load 할 수 있도록 해준다. 이 라우티 패러다이즘은 다른 라우트에서 특정한 라우트를 intercept 하기를 원할 때 유용하다.

예를들어, 피드 안에서 한 사진을 클릭할 때 모달이 피드 위에 떠서 사진을 포여준다고 가정하자. 이러한 경우에 Next.js는 `/feed` 라우트를 인터셉트하고 URL을 ‘masks’ 해서 `/photo/123` 을 보여준다.

![[Pasted image 20230914221714.png]]

하지만, 페이지를 refresh 하거나 URL 을 클릭하여 사진으로 직접적으로 네비게이팅 할 때 전체적은 사진 페이지가 모달 대신 Render되어야 한다. 즉, 라우트 인터셉션이 발생하면 안된다.

![[Pasted image 20230914221722.png]]

---

## Convention

인터셉팅 라우트는 `(..)` 을 통해 정의될 수 있다. 상대 경로 convention인 `../` 과 비슷하지만 이것은 세그먼트를 위한 것이다.

다음과 같이 사용할 수 있다:

- `(.)` 는 **같은 레벨** 의 세그먼트와 일치한다.
- `(..)` **한 단계 위**의 세그먼트와 일치한다.
- `(..)(..)` **두 단계 위**의 세그머트와 일치한다.
- `(...)` 루트 `app` 디렉터리의 세그먼트와 일치한다.

예를들어, `feed` 세그먼트에서 `pthoto` 세그먼트를 `(..)photo` 를 통해서 인터셉트할 수 있다.

![[Pasted image 20230914221732.png]]

- `(..)` convention은 라우트 세그먼트에 기반해서 동작하지 파일 시스템에 기반해서 동작하는 것은 아니다.

---

## Examples

### Modals

라우트 인터셉트는 Parallel Routes 와 함께 사용되어 모들을 생성하는데 사용할 수 있다.

이러한 모달을 만드는 패턴은 모달에 대한 어떠한 작업을 할 때 만날 수 있는 흔한 문제를 극복할 수 있도록 해준다:

- URL을 통해 공유할 수 있는 모달을 만들 수 있도록 해준다.
- 새로고침할 때 모달을 닫지 않고 현재의 context를 유지할 수 있도록 해준다.
- 이전 경로로 이동하지 않고 뒤로 이동시 모달을 닫을 수 있다.
- 앞으로 가기를 실행하면 모달을 재 오픈 할 수 있다.

![[Pasted image 20230914221741.png]]

즉 내가 만약 `/photo` 를 방문하게 되면 밑의 photo 의 `page.js` 파일을 렌더링 하게 되고, 내가 만약 `feed` 안에서 `photo` 를 방문하게 되면 Modal 의 형식을 가진 Photo를 렌더링하게 된다.

즉 다음과 같이 동작한다.

현재 다음과 같은 폴더 라우트 구조를 가지고 있다고 가정하자:

![[Pasted image 20230914221752.png]]

`@modal` 은 sibling 세그먼트 이며 안에 photo 라우트를 인터셉트하는 `(.)photos` 를 가지고 있다. 그 안에는 photo에 관한 정보를 모달창으로 띄우는 리액트 컴포넌트가 export 되고 있다.

`photos` 에는 photo에 관한 정보를 페이지 형식으로 표현하는 리액트 컴포넌트가 위치해 있다.

그리고 루트 레이아웃 파일은 다음과 같다:

```tsx
import '../styles/globals.css';

export const metadata = {
  title: 'My App',
  description: 'My App',
};

const Layout = ({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) => {
  return (
    <html>
      <body>
        <h1>Here is Layout</h1>

        {children}
        {modal}
      </body>
    </html>
  );
};

export default Layout;
```

`modal` 이 sibling 라우트 이므로 위 처럼 prop으로 인자를 받아 body에 띄워줘야한다.

링크를 만들어 `/` 라우트에서 `photo` 를 방문하면 다음과 같이 화면에 나타난다.

![[Pasted image 20230914221804.png]]

하지만 `/photo/[id]` 를 직접 방문하거나 새로고침을 하게 되면

![[Pasted image 20230914221814.png]]

위 화면을 보게 된다.

#Nextjs 