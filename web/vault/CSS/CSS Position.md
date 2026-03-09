---

---
----

`posision` 프로퍼티는 어떤 요소의 position 종류를 정의하기 위해 사용된다(static, relative, fixed, absolute or sticky).

----
## The position Property
`position` 프로퍼티는 요소의 positioning을 정의한다.
5가지 position 값이 있다:
- `static`
- `relative`
- `fixed`
- `absolute`
- `sticky`
이후 요소는 top, bottom, left, right 프로퍼티를 통해 위치하게 된다. 하지만, 이 속성들은 `position` 이 설정되어있지 않으면 동작하지 않는다. 또한 position 값에 따라 다르게 동작한다.

----
## position: static;
HTML 요소는 기본적으로 static으로 위치한다.

Static은 left, top, bottom, right 에 의해 영향을 받지 않는다.

`position: static;` 을 가지는 요소는 평범한 flow에 따라 페이지에 위치한다.

---
## position: relative;
`position: relative;` 를 가지는 요소는 일반적인 위치를 기준으로 상대적으로 위치하게 된다.

top, right, bottom, left 속성을 조정하게 되면, 일반 위치(즉 원래라면 놓여야 하는 위치)를 기준으로 재조정 된다.

---
## position: fixed;
`position: fixed;` 을 속성으로 가지는 요소는 뷰포트에 대해 상대적으로 위치하게 된다. 즉,  스크롤이 변하더라도 항상 같은 위치에 존재하게 된다는 뜻이다.

---
## position: absolute;
`position: absolute;` 를 속성으로 가지는 요소는 가장 가까운 positioning 된 조상을 기준으로 배치된다.
하지만, 만약 그러한 요소가 없다면 문서의 body를 사용하며 페이지 스크롤과 함께 움직인다.

> [!note] 절대위치 지정된 요소는 일반적인 흐름에서 제외된다. 다른 요소를 덮어쓸 수 있다.

---
## position: sticky;
`position: sticky;` 를 가지는 요소는 유저의 스크롤에 기반해 위치한다.

스크롤에 반응하여 그 위치를 변경하는 특별한 종류의 위치 지정 방식이다. sticky 요소는 초기에는 `position: relative;`처럼 동작하여 일반적인 문서 흐름에 따라 위치한다. 그러나 사용자가 페이지를 스크롤하면서 해당 요소가 지정된 오프셋 (예: `top: 10px;`)에 도달하면, 요소는 뷰포트 내에서 그 위치에 "고정"되어 `position: fixed;` 처럼 동작하게 된다.

#CSS