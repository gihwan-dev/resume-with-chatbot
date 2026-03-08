Proxy는 특정 객체를 감싸 프로퍼티 읽기, 쓰기와 같은 객체에 가해지는 작업을 중간에서 가로채는 객체로, 가로채진 작업은 Proxy 자체에서 처리되기도 하고, 원래 객체가 처리하도록 그대로 전달하기도 한다.

## Proxy

문법:

```jsx
let proxy = new Proxy(target, handler);
```

- `target` - 감싸게 될 객체로, 함수를 포함한 모든 객체가 가능하다.
- `handler` - 동작을 가로채는 메서드인 트랩이 담긴 객체로, 여기서 프록시를 설정한다(get 트랩은 프로퍼티를 읽을 때, set 트랩은 target의 프로퍼티를 쓸 때 활성화 됨).

트랩이 없는 프록시는 다음과 같이 동작한다.

```jsx
let target = {};
let proxy = new Proxy(target, {});

proxy.test = 5;
alert(target.test); // 5

alert(proxy.test); // 5

for (let key in proxy) alert(key); // test
```

1. `proxy.test=`을 이용해 값을 쓰면 `target`에 새로운 값이 설정된다.
2. `proxy.test`를 이용해 값을 읽으면 `target`에서 값을 읽어온다.

이처럼 트랩이 없으면 `proxy`는 `target`을 감싸는 투명한 래퍼가 된다.

![[Pasted image 20250103092504.png]]

Proxy는 특수 객체다. 프로퍼티가 없다. `handler`가 비어있으면 `Proxy`에 가해지는 작업은 `target`에 곧바로 전달된다. 트랩을 추가해보기 전에 가로챌 수 있는 작업이 무엇이 있는지 알아보자.

객체에 어떤 작업을 할 땐 자바스크립트 명세에 정의된 내부 메서드가 깊숙한 곳에서 관여한다. 프로퍼티를 읽을 땐 `[[Get]]` 이라는 내부 메서드가, 쓸 땐 `[[Set]]` 이라는 내부 메서드가 관여하게 된다.

모든 내부 메서드엔 대응하는 트랩이 있다. `new Proxy`의 `handler`에 매개변수로 추가할 수 있는 메서드 이름은 다음 표에 있다:

|내부 메서드|핸들러 메서드|작동 시점|
|---|---|---|
|`[[Get]]`|`get`|프로퍼티를 읽을 때|
|`[[Set]]`|`set`|프로퍼티에 쓸 때|
|`[[HasProperty]]`|`has`|`in` 연산자가 동작할 때|
|`[[Delete]]`|`deleteProperty`|`delete` 연산자가 동작할 때|
|`[[Call]]`|`apply`|함수를 호출할 때|
|`[[Construct]]`|`construct`|`new` 연산자가 동작할 때|
|`[[GetPrototypeOf]]`|`getPrototypeOf`|[Object.getPrototypeOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf)|
|`[[SetPrototypeOf]]`|`setPrototypeOf`|[Object.setPrototypeOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf)|
|`[[IsExtensible]]`|`isExtensible`|[Object.isExtensible](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isExtensible)|
|`[[PreventExtensions]]`|`preventExtensions`|[Object.preventExtensions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions)|
|`[[DefineOwnProperty]]`|`defineProperty`|[Object.defineProperty](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty), [Object.defineProperties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties)|
|`[[GetOwnProperty]]`|`getOwnPropertyDescriptor`|[Object.getOwnPropertyDescriptor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor), `for..in`, `Object.keys/values/entries`|
|`[[OwnPropertyKeys]]`|`ownKeys`|[Object.getOwnPropertyNames](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames), [Object.getOwnPropertySymbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertySymbols), `for..in`, `Object/keys/values/entries`|

> [!Note] 규칙
>
> **규칙**
>
내부 메서드나 트랩을 쓸 땐 자바스크립트에서 정한 규칙을 따라야 한다. 대부분의 규칙은 반환 값과 관련이 있다.
>
> - 값을 쓰는게 성공적 이라면 `set`은 반드시 `true`를 반환해야 한다.
> - 지우는게 성공적 이라면, `deleteProperty`는 반드시 `true`를 반환해야 한다.
>
규칙의 목록은 [명세서](https://tc39.es/ecma262/#sec-proxy-object-internal-methods-and-internal-slots)에서 확인할 수 있다.
> 

## get 트랩으로 프로퍼티 기본값 설정하기

`get`을 활용해 객체에 기본값을 설정해 보자.

```jsx
let numbers = [0, 1, 2];

numbers = new Proxy(numbers, {
	get(target, prop) {
		if (prop in target) {
			return target[prop]
		} else {
			return 0; // 기본값
		}
	}
});

console.log(numbers[1]); // 1
console.log(numbers[123]); // 0
```

실행 결과:

![[Pasted image 20250103092523.png]]

위 예제에서 프록시 객체가 기본 변수를 덮어쓰도록 했다. 그렇지 않으면 부수 효과를 일으킬 가능성이 높기 때문이다.

## set 트랩으로 프로퍼티 값 검증하기

숫자만 저장할 수 있는 배열을 만든다 가정하자. 숫자형이 아닌 값을 추가하려 하면 에러가 발생해야 한다. 이를 `set` 트랩으로 구현해보자.

```jsx
let numbers = [];

numbers = new Proxy(numbers, {
	set(target, prop, val) {
		if (typeof val === "number") {
			target[prop] = val;
			return true;
		} else {
			return false;
		}
	}
});

numbers.push(1); // 성공
numbers.push(2); // 성공

numbers.push("test"); // Error: 'set' on proxy
```

실행 결과:

![[Pasted image 20250103092538.png]]

## Proxy와 Refelct를 사용한 구독 발행 패턴

Zustand와 같은 상태 관리 라이브러리는 구독/발행 패턴을 통해 동작한다. 매커니즘은 다음과 같다:

- 상태 변경을 구독하는 listeners Set이 있다.
- 상태가 변경되면 모든 구독자에게 알림을 보낸다.

구독 / 발행 패턴은 다음과 같이 구현할 수 있다:

```jsx
let listener = new Set();
let currentCallback;
let store = new WeakMap();

const 구독 = (fn) => {
  listener.add(fn);
  return fn;
};

const 발행기관 = (obj) => {
  const newObject = new Proxy(obj, {
    set: function (target, p, value, receiver) {
      target[p] = value;
      listener.forEach((cb) => {
        cb();
      });
      return true;
    },

    get: function (target, p, receiver) {
      return target[p];
    },
  });

  store.set(obj, newObject);

  return newObject;
};

const cb1 = 구독(() => console.log(1));
const cb2 = 구독(() => console.log(2));

const someObj = 발행기관({ name: "some" });
someObj.name = "thing"; // 1, 2를 로깅
```

실행 결과:

![[Pasted image 20250103092552.png]]