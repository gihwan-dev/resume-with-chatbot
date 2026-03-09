## `innerHTML`의 문제점

대부분 `innerHTML`을 많이 사용해 봤을거다.

```js
function createCard(title, body) {
	container.innerHTML = `
		<article class="card">
			<h2 class="card-title">${title}</h2>
			<p class="card-body">${body}</p>
		</article>
	`;
}
```

다들 이렇게 많이 사용하지만 이는 성능에 문제가 있다.

## `<template>` 태그

```html
<template id="card-template">
	<article class="card">
		<h2 class="card-title"></h2>
		<p class="card-body"></p>
	</article>
</template>

<script>
	function createCardComponent(title, body) {
		const template = document.getElementById('card-template');
		
		const card = template.content.cloneNode(true).firstElementChild;
		
		const cardTitle = card.querySelector('.card-title');
		const cardBody = card.querySelector('.card-body');
		
		cardTitle.textContent = title;
		cardBody.textContent = body;
	
		return card;
	}

	const container = document.querySelector('.container');
	container.appendChild(createCardComponent('Hello', 'World'));
</script>
```

## 왜 이 방법이 더 좋은 방법일까?

1. **파싱 오버헤드가 없다**: `innerHTML`과 달리 `template`는 한 번만 파싱되고 **재사용**된다.
2. **메모리 효율적**: `template`는 가볍고 돔 트리에 존재하지 않는다.
3. **필요할 때 까지 리플로우가 발생하지 않는다**: 돔이 아닌 **메모리**에서 변경사항이 발생한다.
4. **XSS-Safe**: 문자열 보간을 사용하지 않기 때문에 **보안성이 우수하다**.
5. **재사용성**: 한 번만 만들고 **여러번 복사해서 사용할 수 있다**

## `template` 동작 방식

`template.content`는 **DocumentFragment**다. 이를 메모리에만 존재하는 돔 트리라고 생각할 수 있다.

- 리플로우 없이 수정할 수 있다.
- 효과적으로 복사할 수 있다.
- 돔 쿼리로 부터 독립적이다.
- 반복되는 요소들의 청사진으로 사용할 수 있다.

## 성능 딥 다이브

### `innterHTML` 접근 방식

1. HTML 문자열을 파싱한다.
2. 돔 요소를 생성한다.
3. 리플로우를 발생시킨다.
4. 돔을 업데이트한다.

### `template` 접근 방식

1. 파싱된 템플릿을 복사한다.
2. 메모리에서 내용을 업데이트한다.
3. 돔에 삽입한다.

## 사용 방식

### 1. HTML에 템플릿을 위치시킨다.

```html
<head>
	<template id="card-template">
	...
	</template>
</head>
```

### 2. 복사한다.

```html
<script>
	// true로 설정시 deep cloning을 한다.
	template.content.cloneNode(true)
</script>
```

### 3. 컴포넌트 안에서 쿼리한다.

```html
<script>
card.querySelector('.title'); // document.querySelector가 아니다.
// 복사한 요소에서 쿼리를 진행해야 한다.
```

## 참고
https://javascript.plainenglish.io/stop-using-innerhtml-heres-the-secret-technique-netflix-engineers-use-for-dom-manipulation-5a53df44ba9e