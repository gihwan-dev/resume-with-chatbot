# 이터러블

이터러블 객체는 배열을 일반화한 객체이다. 이터러블이라는 개념을 사용하면 어떤 객체에든 `for...of` 반복문을 적용할 수 있다.

배열은 대표적인 이터러블이다. 배열이 아닌 객체도 순회할 수 있는데, 이에 대해 알아보자.

## Symbol.iterator

직접 이터러블 객체를 만들어 이터러블이라는 개념을 이해해 보도록 하자.

예시의 객체 range는 숫자 간격을 나타내고 있다.

```jsx
let range = {
	from: 1,
	to: 5,
}

// 아래처럼 for...of가 동작할 수 있도록 하는게 목표다.
// for(let num of range) ... num = 1, 2, 3, 4, 5
```

이 `range`를 이터러블로 만들려면 객체에 `Symbol.iterator` 라는 메서드를 추가해 아래와 같은 일이 벌어지도록 해야한다.

1. `for...of`가 시작되자마자 `for...of`는 `Symbol.iterator`를 호출한다. `Symbol.iterator`는 반드시 이터레이터를 반환해야 한다.
2. `for...of`는 반환된 객체(이터레이터)만을 대상으로 동작한다.
3. `for...of`에 다음 값이 필요하면 이터레이터의 `next` 메서드를 호출한다.
4. `next()` 반환 값은 `{ done: Boolean, value: any }`와 같은 형태여야 한다. `done=true` 는 반복이 종료되었음을 의미한다. `done=false` 일땐 `value` 에 다음 값이 저장된다.

```jsx
let range = {
	from: 1,
	to: 5,
}

range[Symbol.iterator] = function() {
	return {
		current: this.from,
		last: this.to,
		
		next() {
			if (this.current <= this.last) {
			  return { done: false, value: this.current++ };
			} else {
				return { done: true }
			}
		}
	}
}

for (let num of range) {
	console.log(num); // 1, 2, 3, 4, 5
}
```

실행화면:

![[Pasted image 20250103092748.png]]

더 단순하게 range 자체를 이터레이터로 만들수도 있다.

```jsx
let range = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    this.current = this.from;
    return this;
  },

  next() {
    if (this.current <= this.to) {
      return { done: false, value: this.current++ };
    } else {
      return { done: true };
    }
  }
};

for (let num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}
```

이터레이터란 시퀀스를 정의하고 종료시와 반환값을 잠재적으로 정의하는 객체다. 두 개의 속성( `value`, `done` )을 반환하는 next() 메서드를 사용해 [이터레이터 프로토콜](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterator_protocol)을 구현해야 한다.

## 다양한 순회 방식의 차이점

이전에 가장 빠른 순회문은 무엇일까?에 대해 궁금증이 생겨 적은 글이다. 속도에 대한 부분 뿐만 아니라, 각 루프의 차이에 대해서 기술해 두었다.

<iframe width="100%" height="800px" src="https://velog.io/@koreanthuglife/%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8%EC%97%90%EC%84%9C-%EA%B0%80%EC%9E%A5-%EB%B9%A0%EB%A5%B8-%EB%B0%98%EB%B3%B5%EB%AC%B8-feat.-for...of-for...in-forEach-for"/>

