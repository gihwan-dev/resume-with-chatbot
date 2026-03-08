`display` 프로퍼티는 CSS의 레이아웃을 조정하기 위해 사용되는 가장 중요한 프로퍼티중 하나이다.
## The display Property
`display` 프로퍼티는 요소가 어떻게 디스플레이 될지를 결정한다.

모든 HTML 요소는 default display 값을 가지고 있다. 대부분의 요소들은 `block` 와 `inlin` 을 가진다.

---
## Block-level Elements
block-level 요소는 항상 새 라인을 가지며 full width를 사용한다.

block-level 요소의 예:
- `<div>`
- `<h1> - <h6>`
- `<p>`
- `<form>`
- `<header>`
- `<footer>`
- `<section>`
----
## Inline Elements
inline 요소는 필요한 만큼만의 너비를 차지한다.
inline 요소의 예:
- `<span>`
- `<a>`
- `<img>`
----
## Display: none;
`display: none;` 은 자바스크립트와 함께 사용되어 어떤 요소를 삭제하거나 다시 만드는일 없이 숨기기 위해서 사용된다.
`<script>` 태그는 `display: none;` 을 default로 가진다.

`visibility: none;` 또한 요소를 숨긴다.
하지만, 요소는 여전히 공간을 차지하게 된다. 요소는 숨겨지지만 여전히 레이아웃에 영향을 준다.

----

#CSS