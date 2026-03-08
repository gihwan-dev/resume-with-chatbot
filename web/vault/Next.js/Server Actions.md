**Server Actions** 는 Next.js의 **alpha** 버전 기능이다. React **Actions**를 기반으로 하고 있다. 서버 사이드 데이터 변경을 할 수 있도록 해주고, 클라이언트 사이드 자바스크립트를 줄여주며, 점진적으로 개선된 양식을 활성화 해준다. 다음과 같은 방식으로 서버 컴포넌트 또는 클라이언트 컴포넌트에서 사용될 수있다:

### With Server Components:

```tsx
import { cookies } from 'next/headers'
 
// Server action defined inside a Server Component
export default function AddToCart({ productId }) {
  async function addItem(data) {
    'use server'
 
    const cartId = cookies().get('cartId')?.value
    await saveToDb({ cartId, data })
  }
 
  return (
    <form action={addItem}>
      <button type="submit">Add to Cart</button>
    </form>
  )
}
```

### With Client Components:

```tsx
'use server'
 
async function addItem(data) {
  const cartId = cookies().get('cartId')?.value
  await saveToDb({ cartId, data })
}
```

```tsx
'use client'
 
import { addItem } from './actions.js'
 
// Server Action being called inside a Client Component
export default function AddToCart({ productId }) {
  return (
    <form action={addItem}>
      <button type="submit">Add to Cart</button>
    </form>
  )
}
```

---

## Convention

`experimental serverActions` flag를 true로 하여 server actions를 사용할 수 있다.

```tsx
module.exports = {
  experimental: {
    serverActions: true,
  },
}
```

## Creation

Server Actions는 다음과 같이 두 장소에서 정의될 수 있다:

- 컴포넌트 안 (서버 컴포넌트에서만 사용 가능)
- 분리된 파일(클라이언트와 서버 콤포넌트). 하나의 파일 안에 여러개의 Server Actions를 정의할 수 있다.

## With Server Components

“use server” 선언을 함수 몸체에 선언해서 비동기 서버 액션을 생성할 수 있다. 이 함수는 **직렬화 가능한 인수**를 가지여 하며, **직렬화 가능한 값을 반환**해야 한다.

```tsx
export default function ServerComponent() {
  async function myAction() {
    'use server'
    // ...
  }
}
```

## With Client Components

만약 클라이언트 컴포넌트에서 Server Actions를 사용하고자 한다면, 분리된 파일에 actions를 만들고 “use server” 선언을 추가해주면 된다. 이후, Server Actions를 클라이언트 컴포넌트에서 호출하면 된다.

```tsx
'use server'
 
export async function myAction() {
  // ...
}
```

```tsx
'use client'
 
import { myAction } from './actions'
 
export default function ClientComponent() {
  return (
    <form action={myAction}>
      <button type="submit">Add to Cart</button>
    </form>
  )
}
```

- **Note**: `"use server"` 를 선언하게 되면, 아래에 위치한 모든 export들은 Server Actions로 간주된다. 따라서 한 파일에 여러개의 Server Actions를 정의할 수 있다.

## Invocation

다음과 같은 method를 통해 Server Actions를 발생시킬 수 있다.:

- `action`: 리액트의 `action` 프로퍼티는 `<form>` 엘리먼트에서 Server Action을 발생시킬 수 있도록 해준다.
- `formAction`: 리액트의 `formAction` 는 `<button>`, `<input type="submit">`, `<input type="image">` (`<form>` 안의) 들을 다룰 수 있도록 해준다.
- `startTransition`: `action` 또는 `formAction` 을 사용하지 않고 서버 액션을 발생시킨다. 이 method는 **Progressive Enhancement**를 비활성화 시킨다.

`actions`

Server Action을 발생시키기 위해 `form` element에서 `action` 을 사용할 수 있다. `action` 프로퍼티로 전달된 Server Actions는 사용자 상호작용에 응답하는 비동기 사이드 이펙트 처럼 동작한다.

```tsx
export default function AddToCart({ productId }) {
  async function addItem(data) {
    'use server'
 
    const cartId = cookies().get('cartId')?.value
    await saveToDb({ cartId, data })
  }
 
  return (
    <form action={addItem}>
      <button type="submit">Add to Cart</button>
    </form>
  )
}
```

`formAction`

`button`, `input type="submit"`, `input type="image"` 등의 **Form Actions**를 다루기 위해서 `form Action` 을 사용할 수 있다. `formAction` 프로퍼티는 form 의 `action` 보다 우선순위를 가진다.

```tsx
export default function Form() {
  async function handleSubmit() {
    'use server'
    // ...
  }
 
  async function submitImage() {
    'use server'
    // ...
  }
 
  return (
    <form action={handleSubmit}>
      <input type="text" name="name" />
      <input type="image" formAction={submitImage} />
      <button type="submit">Submit</button>
    </form>
  )
}
```

## Custom invocation using `startTransition`

`action` 또는 `formAction` 을 사용해서 Server Actions를 발생시킬 수 있다. `useTransition` 훅 에서 제공되는 `startTransition` 을 사용하여 할 수 있다. forms, buttons, inputs 이외의 곳에서 Server Actions를 사용하기를 원한다면 유용하다.

```tsx
// app/components/example-client-component.js
'use client'
 
import { useTransition } from 'react'
import { addItem } from '../actions'
 
function ExampleClientComponent({ id }) {
  let [isPending, startTransition] = useTransition()
 
  return (
    <button onClick={() => startTransition(() => addItem(id))}>
      Add To Cart
    </button>
  )
}
```

```tsx
// app/actions.js
'use server'
 
export async function addItem(id) {
  await addItemToDb(id)
  // Marks all product pages for revalidating
  revalidatePath('/product/[id]')
}
```

## Custom invocation without `startTransition`

만약 Server Mutations을 하고 있지 않다면, 함수를 프로퍼티로 직접적으로 전달해줄 수 있다.

```tsx
import kv from '@vercel/kv'
import LikeButton from './like-button'
 
export default function Page({ params }: { params: { id: string } }) {
  async function increment() {
    'use server'
    await kv.incr(`post:id:${params.id}`)
  }
 
  return <LikeButton increment={increment} />
}
```

```tsx
'use client'
 
export default function LikeButton({
  increment,
}: {
  increment: () => Promise<void>
}) {
  return (
    <button
      onClick={async () => {
        await increment()
      }}
    >
      Like
    </button>
  )
}
```

## Enhancements

실험적인 기능은 `useOptimistic` 훅은 앱에 Optimistic update를 설치하는 하나의 방법을 제공한다. Optimistic update란 사용자 인터페이스에서 네트워크 연산의 반응성을 향상시키는 패턴이다. 이 패턴에서, 사용자가 어떤 액션을 수행하면, 애플리케이션은 서버의 응답을 기다리지 않고 즉시 UI를 업데이트한다. Optimistic updates는 사용자 경험을 향상시켜준다.

Server Action이 발생되면, 즉시 예측되는 결과값을 반영하여 UI를 업데이트 한다.

```tsx
// app/thread.js
'use client'
 
import { experimental_useOptimistic as useOptimistic } from 'react'
import { send } from './actions.js'
 
export function Thread({ messages }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, { message: newMessage, sending: true }]
  )
  const formRef = useRef()
 
  return (
    <div>
      {optimisticMessages.map((m) => (
        <div>
          {m.message}
          {m.sending ? 'Sending...' : ''}
        </div>
      ))}
      <form
        action={async (formData) => {
          const message = formData.get('message')
          formRef.current.reset()
          addOptimisticMessage(message)
          await send(message)
        }}
        ref={formRef}
      >
        <input type="text" name="message" />
      </form>
    </div>
  )
}
```

### Experimental `useFormStatus`

**실험직인 기능**인 `useFromStatus` 훅은 Form 액션에서 사용될 수 있으며, `pending` 프로퍼티를 제공할 수 있다.

```tsx
// app/form.js
'use client'
 
import { experimental_useFormStatus as useFormStatus } from 'react-dom'
 
function Submit() {
  const { pending } = useFormStatus()
 
  return (
    <input
      type="submit"
      className={pending ? 'button-pending' : 'button-normal'}
      disabled={pending}
    >
      Submit
    </input>
  )
}
```

## Progressive Enhancement

Progressive Enhancement(웹 개발 방법론 중 하나)는 `<form>` 이 자바 스크립트 없이 또는 자바스크립트가 비활성화 되더라도 정상적으로 동작할 수 있도록 해준다. 이는 form을 위한 자바스크립트가 load 되지 못했거나 load하는데 실패했더라도 유저가 form을 작성하고 데이터를 보낼 수 있도록 해준다.

- Progressive Enghancement 란?
    
    웹 개발 방법론 중 하나로, 모든 사용자에게 기본적인 기능과 콘텐츠를 제공하면서 점진적으로 더 향상된 기능과 경험을 제공하는 것을 의미한다. 기본적으로 다음과 같은 원칙을 따른다:
    
    1. 기본 기능 제공: 가장 중요한 콘텐츠와 기능은 모든 사용자에게 제공된다. 이는 모든 기기, 브라우저 및 네트워크 상황에서 작동해야 함을 의미한다.
    2. 향상된 기능 추가: 향상된 브라우저나 기기를 사용하는 사용자에게 추가적인 기능과 경험을 제공한다. 이는 모던 브라우저의 지원 기능을 활용하여 사용자 경험을 향상시킨다.

Server From Actions 와 Client Form Actions 는 모두 Progressive Enhancement를 지원한다:

- **Server Action**이 `<form>` 에 직접적으로 전달된다면, **자바스크립트가 비활성화 되더라도** 폼은 활성화 상태로 존재하게 된다.
- **Client Action** 이 `<form>` 에 직접적으로 전달되면, form은 활성화 된 상태이지만 form이 hydrated 될 때 까지 action은 queue에 위치하게 된다. `<form>` 선택적 hydration에서 우선순위를 가지기 때문에 빠르게 진행된다.

```tsx
'use client'
 
import { useState } from 'react'
import { handleSubmit } from './actions.js'
 
export default function ExampleClientComponent({ myAction }) {
  const [input, setInput] = useState()
 
  return (
    <form action={handleSubmit} onChange={(e) => setInput(e.target.value)}>
      {/* ... */}
    </form>
  )
}
```

둘 모두의 경우에 hydration이 발생하기 전부터 form은 interactive하다. 서버 액션은 클라이언트 자바스크립트에 의존하지 않기 때문에 추가적인 이점을 제공한다. interactivity를 희생하지 않고 원하는 추가적인 클라이언트 액션을 구성할 수 있다.

---

## Examples

### Usage with Client Components

**Import**

서버 액션은 클라이언트 컴포넌트에 정의될 수 없지만, import될 수 있다. 파일의 최 상단부에 `"use server"` directive를 정의한 파일의 action을 import하여 클라이언트 컴포넌트에서 서버 액션을 사용할 수 있다.

```tsx
"use server";

export async function addItem() {}
```

```tsx
"use client";

import { useTransition } from "react";
import { addItem } from "../actions";

function ExampleClientComponent({ id }) {
  let [isPending, startTransition ] = useTransition();

  return (
  <button onClick={() => startTransition(() => addItem(id))}>
    Add To Cart
  </button>
  );
}
```

**Props**

서버액션을 **import** 하는 것이 추천되는 방식이지만, 종종 서버액션을 클라이언트 컴포넌트에 프로퍼티로써 전달하고 싶을 수 있다.

예를들어, 액션에서 동적으로 발생되는 값을 사용하고 싶을 수 있다. 이러한 경우에, 서버 액션을 프로퍼티고 전달하는 방법이 해결책으로 사용될 수 있다.

```tsx
import { ExampleClientComponent } from './components/example-client-component.js'
 
function ExampleServerComponent({ id }) {
  async function updateItem(data) {
    'use server'
    modifyItem({ id, data })
  }
 
  return <ExampleClientComponent updateItem={updateItem} />
}
```

```tsx
'use client'
 
function ExampleClientComponent({ updateItem }) {
  async function action(formData: FormData) {
    await updateItem(formData)
  }
 
  return (
    <form action={action}>
      <input type="text" name="name" />
      <button type="submit">Update Item</button>
    </form>
  )
}
```

### On-demand Revalidation

`revalidatePath` 또는 `revalidateTag` 를 사용해서 on-demand 형식으로 데이터를 revalidate할 수 있다.

```tsx
import { revalidateTag } from "next/cache"

async function revalidate() {
  "use server"
  revalidateTag("blog-posts");
}
```

## Validation

서버 액션에 전달된 데이터는 액션을 호출하기전에 유효성을 검사하거나 위생 처리할 수 있다. 예를들어, wrapper 함수를 만들어 인수로 액션을 받고, 그 액션이 유효하다면 액션을 발생시키는 방식으로 할 수 있다.

```tsx
"use server"

import { withValidate } from "lib/form-validation";

export const action = withValidate((data) => {
  // ...
});
```

```tsx
export function withValidate(action) {
  return async (formData: FormData) => {
  "use server";

  const isValidData = verifyData(formData);

  if (!isValidData) {
    throw new Error("Invalid input");
  }

  const data = process(formData);
  return action(data);
  }
}
```

## Using headers

`cookies` 나 `headers` 와 같은 요청의 헤더들을 Server Action에서 읽을 수 있다.

```tsx
import { cookies } from "next/headers";

async function addItem(data) {
  "use server";
  const cartId = cookies().get("cartId")?.value;

  await saveToDb({ cartId, data });
}
```

추가적으로, 서버 액션에서 쿠키를 수정할 수 있다.

```tsx
import { cookies } from "next/headers"

async function create(data) {
	'use server';
	
	const cart = await createCart():
	cookies().set('cartId', cart.id)
	// 또는
	cookies().set({
		name: 'cartId',
		value: cart.id,
		httpOnly: true,
		path: '/'
	})
}
```

---

## Glossary

## Actions

Actions는 리액트의 실험적인 기능이며, 유저의 반응에 `async` 코드를 실행할 수 있도록 한다.

액선은 Next.js 또는 리액트 서버 컴포넌트에서만 동작하는것은 아니다. 하지만 리액트 안정화 버전에서는 사용할 수 없다. Next.js에서 Actions를 사용한다면 리액트의 `exprimental` 설정을 사용하는 것이다.

Actions는 엘리먼트의 `action` 프로퍼티를 통해 정의된다. 주로 HTML forms를 작성할 때 `action` 프로퍼트에 URL을 전달할 수 있다. Actions를 사용하면 리액트에서 함수를 직접적으로 전달할 수 있게 된다.

리액트는 또한 Actions의 최적화 업데이트를 위한 빌트인 솔루션을 제공한다. 추후에 더 많은 패턴과 API들이 추가될 예정이다.

## Form Actions

**Actions**는 웹 표준 `<form>` API에 통합되며, 즉시 사용 가능한 점진적 향상 및 로딩 상태를 지원한다. HTML 기본 폼액션과 유사하다.

## Server Functions

서버에서 실행되는 함수 이지만, 클라이언트에서 호출될 수 있다.

## Server Actions

액션으로처 호출되는 서버 함수이다.

서버 액션은 `form` 요소의 `action` 프로퍼티에 전달되어 점진적으로 향상될 수 있다. 서버 액션을 사용하는 form은 클라이언트 사이트 자바스크립트가 load되기 전에도 interactive하다. 이는 리액트의 hydration이 필요하지 않다는 것을 의미한다.

## Server Mutations

`redirect`, `revalidatePate`, 또는 `revalidateTag` 를 호출하거나 데이터를 변형시키는 서버 액션을 의미한다.

#Nextjs 