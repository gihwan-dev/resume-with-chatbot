`error.js` 파일 convention은 nest 된 라우트들의 런타임 에러를 관리할 수 있도록 해준다.

- 자동으로 라우트 세그먼트들을 감싸고 자식 요소들을 React Error Boundary로 감싼다.
    
- 특정한 세그먼트들을 위한 맞춤 제작된 에러 UI를 생성할 수 있다.
    
- 세그머트에 영향을 주는 에러를 독립시키고 앱의 기능은 유지시킨다.
    
- 모든 페이지를 새로 불러올 필요 없이 에러로부터 앱의 기능을 회복시키는 기능을 추가한다.
    
`error.js` 파일에 에러 UI를 추가시키고 리액트 컴포넌트를 export한다.

![[Pasted image 20230914221119.png]]

```tsx
'use client'; // Error components must be Client Components
 
import { useEffect } from 'react';
 
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);
 
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
```

### How `error.js` Works

![[Pasted image 20230914221133.png]]

- `error.js` 는 자동으로 React Error Boundary를 생성하여 상속된 자식 세그먼트 또는 `page.js` 컴포넌트를 감싼다.
- `error.js` 파일에서 export 된 리액트 컴포넌트는 컴포넌트의 **fallback** 으로 사용된다.
- error 바운더리 안에서 에러가 발생하면, fallback 컴포넌트가 렌더된다.
- 에러 컴포넌트가 활성화되면, 에러 바운더리 상위에 존재하는 레이아웃들은 여전히 상태를 유지하고 반응형인채로 남아있는다. 그리고 에러 컴포넌트는 에러로부터 회복하기 위한 기능을 포함할 수 있다.

### Recovering From Errors
때때로 에러의 발생은 일시적 현상일 수 있다. 이러한 경우에 재시도 해보는게 문제를 해결할 수 있는 방법일 수 있다.

에러 컴포넌트는 `reset()` 함수를 사용해 에러로부터 컴포넌트를 회복시킬 수 있다. 이 함수를 실행하면 함수는 에러 바운더리의 content를 re-render 할 것이다. 만약 성공적이면, 에러 컴포넌트는 re-render의 결과로 교체될 것이다.

```tsx
'use client';
 
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

## Nested Routes

특별한 파일로 생성된 리액트 컴포넌트는 특정한 계층 구조를 가진 채 nest 되어 render 된다.

예를들어, `layout.js` 파일과 `error.js` 파일을 가지고 있는 두 세그먼트를 가지는 하나의 nest된 라우트는 다음의 컴포넌트 계층 구조를 가진 채 render 된다.

![[Pasted image 20230914221153.png]]

중접된 컴포넌트 계층 구조는 중첩된 라우트 전반에서 `error.js` 파일의 동작에 영향을 끼치니다.

- 에러는 가장 가까운 부모 오류 바운더리로 bubble up 한다. 이것은 `error.js` 파일이 모든 중첩된 자식 세그먼트들의 에러를 다룬다는 의미다. 한 라우트의 다른 레벨에 `error.js` 파일을 위치시킴으로써 섬세한 에러 UI를 얻어낼 수 있다.
- `error.js` 파일은 같은 세그먼트의 `layout.js` 파일이 발생시키는 에러에 대해서는 동작하지 않는다. 에러 바운더리는 레이아웃 컴포넌트 안에 중첩되기 때문이다.

## Handling Errors in Layouts
**`error.js` 바운더리는 `layout.js` 또는 `template.js` 안에서 던져진 에러는 잡지 않는다.** 이러한 의도적으로 설계된 계층 구조는 공유되는 중요한 UI가 형제 라우트들 사이에서 에러가 발생하더라도 여전히 볼 수 있고 기능할 수 있도록 해준다.

특정한 레이아웃 또는 템플릿에서 에러를 다루기 위해서는 부모 세그먼트에 `error.js` 파일을 위치시키면 된다.

루트 레이아웃 또는 템플릿에서 발생하는 에러를 다루기 위해서는, `error.js` 파일의 변형인 `global-error.js` 파일을 사용하면 된다.

## Hanlding Errors in Root Layouts

루트 `app/error.js` 바운더리는 `app/layout.js` 또는 `app/template.js` 파일에서 발생하는 에러를 잡아주지 않는다.

이러한 루트 컴포넌트에서 발생하는 에러를 다루기 위해서 `app/global-error.js` 파일을 사용해라.

`error.js` 파일과 다르게 `global-error.js` 에러 바운더리는 **전체** 앱을 감싸고, fallback 컴포넌트는 루트 레이아웃을 대체하게 된다. 이것때문에, `global-error.js` 파일은 **반드시** `<html>` 과 `<body>` 를 정의해야 한다.

`global-error.js` 는 전체 앱에서 발생하는 에러를 모두 잡아내는 에러 UI다. 보통 루트 레이아웃은 동적이지 않기 때문에 발생할 가능성이 적다. 보통 `error.js` 파일이 대부분의 에러를 잡아낼거다.

`global-error.js` 파일을 정의하더라도, 루트 `error.js` 파일의 정의하는 것이 추천된다.

```tsx
'use client';

const GlobalError = ({ error, reset }: { error: Error; reset: () => void }) => {
  return (
    <html>
      <body>
        <h2>Some thing went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
};

export default GlobalError;
```

## Handling Server Errors
만약 에러가 서버 컴포넌트 또는 data fetching 동안에 발생한다면, Next.js 는 `Error` 객체를 가장 가까운 `error.js` 파일에 `error` 프로퍼티로 전달할 것이다.

`next dev` 를 실행할 때 `error` 는 직렬화 되어 서버 컴포넌트에서 클라이언트 `error.js` 파일로 전달 될 것이다. 하지만 프로덕션에서는 에러 메세지가 `.digets(에러 메시지의 hash를 포함하는)` 와 함께 `error` 에 전달 될 것이다.

#Nextjs 