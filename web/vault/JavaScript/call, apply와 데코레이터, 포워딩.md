자바스크립트는 함수를 다룰 때 탁월한 유연성을 제공한다. 이곳저곳 전달될 수 있고, 객체로도 사용될 수 있다. 함수 간에 호출을 어떻게 포워딩 하는지, 어떻게 데코레이팅 하는지에 대해 알아보자.

## 코드 변경 없이 캐싱 기능 추가하기

무겁지만 안정적인 함수 `slow(x)`가 있다고 가정해보자. `slow(x)`가 자주 호출된다면, 결과를 어딘가에 저장해 재연산에 걸리는 시간을 줄이고 싶을거다. 아래처럼 래퍼 함수를 구현해 처리할 수 있다.

```jsx
function slow(x) {
	alert(`slow(${x})을/를 호출함`);
	return x;
}

function cachingDecorator(func) {
	let cache = new Map();
	
	return function(x) {
		if (cache.has(x)) {
			return cache.get(x);
		}
		
		let result = func(x);
		
		cache.set(x, result);
		return result;
	};
}

slow = cachingDecorator(slow);

alert( slow(1) );
alert( slow(1) ); // 캐싱된 값 사용
```

이처럼 인수로 받은 함수의 행동을 변경시켜주는 함수를 데코레이터 라고 부른다.

## ‘func.call’를 사용해 컨텍스트 지정하기

위에서 구현한 캐싱 데코레이터는 객체 메서드에 사용하기엔 적합하지 않다. 이는 `this`가 래핑 이후`undefined`가 되기 때문이다. 이러한 문제를 `func.call(context, ...args)` 함수를 사용해 해결할 수 있다.

문법은 다음과 같다:

```jsx
func.call(context, arg1, arg2, ...);
```

메서드를 호출하면 첫 번째 인수가 `this`가 되고, 이어지는 인수가 func의 인수가 된다:

```jsx
function sayHi() {
	alert(this.name);
}

let user = { name: "John" };
let admin = { name: "Admin" };

sayHi.call(user); // this.name = John
sayHi.call(admin); // this.name = Admin
```

이렇게 func.call을 적용한 코드는 다음과 같다.

```jsx
let worker = {
  someMethod() {
    return 1;
  },

  slow(x) {
    alert(`slow(${x})을/를 호출함`);
    return x * this.someMethod(); // (*)
  }
};

function cachingDecorator(func) {
  let cache = new Map();
  return function(x) {
    if (cache.has(x)) {
      return cache.get(x);
    }
    let result = func.call(this, x); // 이젠 'this'가 제대로 전달됩니다.
    cache.set(x, result);
    return result;
  };
}

worker.slow = cachingDecorator(worker.slow); // 캐싱 데코레이터 적용

alert( worker.slow(2) ); // 제대로 동작합니다.
alert( worker.slow(2) ); // 제대로 동작합니다. 다만, 원본 함수가 호출되지 않고 캐시 된 값이 출력됩니다.
```

명확한 이해를 위해 `this`가 어떤 과정을 거쳐 전달되는지 자세히 살펴보자.

1. 데코레이터를 적용한 후 `worker.slow`는 래퍼 `funcion (x) { ... }`가 된다.
2. `worker.slow(2)` 를 실행하면 래퍼는 2를 인수로 받고, `this = worker` 가 된다.
3. 캐시되지 않은 상황이라면 `func.call(this, x);`에서 현재 `this(=worker`)와 인수를 원본 메서드에 전달한다.

## 여러 인수 전달하기

데코레이터를 좀 더 다채롭게 해보자. 지금은 인수가 하나뿐인 함수에만 적용할 수 있다. 복수 인수를 가진 메서드를 캐싱하려면 어떻게 해야할까?

```jsx
let worker = {
	slow(min, max) {
		return min + max; // CPU를 아주 많이 쓰는 작업이라고 가정
	}
};

// 동일한 인수를 전달했을 때 호출 결과를 기억할 수 있어야 한다.
worker.slow = cachingDecorator(worker.slow);
```

다음과 같은 방법으로 해결할 수 있다.

```jsx
let worker = {
  slow(min, max) {
    alert(`slow(${min},${max})을/를 호출함`);
    return min + max;
  }
};

function cachingDecorator(func, hash) {
  let cache = new Map();
  return function() {
    let key = hash(arguments); // (*)
    if (cache.has(key)) {
      return cache.get(key);
    }

    let result = func.call(this, ...arguments); // (**)

    cache.set(key, result);
    return result;
  };
}

function hash(args) {
  return args[0] + ',' + args[1];
}

worker.slow = cachingDecorator(worker.slow, hash);

alert( worker.slow(3, 5) ); // 제대로 동작합니다.
alert( "다시 호출: " + worker.slow(3, 5) ); // 동일한 결과 출력(캐시된 결과)
```

## func.apply

`func.call(this, …arguments)` 대신 `func.apply(this, arguments)`를 사용해도 된다. 내장 메서드 `func.apply` 의 문법은 다음과 같다:

```jsx
func.apply(context, args);
```

apply는 func의 this를 context로 고정해주고, 유사 배열 객체인 args를 인수로 사용할 수 있게 해준다. call과 apply의 문법적 차이는 call은 복수 인수를 따로따로 받는 대신 apply는 유사 배열 객체로 받는다는 점이다.

```jsx
func.call(context, ...args);
func.apply(context, args);
```

인수가 이터러블 이면 call을, 유사 배열 형태라면 apply를 사용하면 된다. 대부분의 자바스크립트 엔진은 내부에서 apply를 최적화 하기 때문에 apply가 조금 더 빠르긴 하다.

이렇게 컨텍스트와 함께 인수 전체를 다른 함수에 전달하는 것을 콜 포워딩 이라고 한다.

## 메서드 빌리기

위에서 구현한 해싱 함수를 개선할 수 있다.

```jsx
function hash(args) {
	return args[0] + ',' + args[1];
}
```

지금 상태에선 인수 두 개만 다룰 수 있다. 아래와 같이 배열 메서드를 빌려 사용해 `join`을 사용할 수 있다.

```jsx
function hash() {
	return [].join.call(arguments);
}
```