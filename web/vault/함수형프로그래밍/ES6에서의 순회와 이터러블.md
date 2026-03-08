## 기존과 달라진 ES6에서의 리스트 순회

### 기존 순회 방식
- for i++
- for of

```js
const list = [1, 2, 3];

for (var i = 0; i < list.length; i++) {
	console.log(list[i]);
}

const str = 'abc';

for (var i = 0; i < str.lenght; i++) {
	console.log(str[i]);
}
```

### ES6 이후

```js
const list = [1, 2, 3];

for (const a of list) {
	console.log(a);
}
```

보다 선언적으로 순회할 수 있게 되었다. 이는 조금 간결하게 만든것 이상의 의미를 가지고 있다.

### Array를 통해 알아보기

```js
const arr = [1, 2, 3];

for (const a of arr) console.log(a);
```

### Set을 통해 알아보기
``
```js
const set = new Set([1, 2, 3]);

for (const a of set) console.log(a);
```

`set`은 리스트가 아니다. `index`를 통해서 접근할 수 없다.

### Map을 통해 알아보기

```js
const map = new Map([['1', 1], ['2', 2], ['3', 3]]);

for (const a of map) console.log(a);
```

`map`도 마찬가지다. 어떻게 그런데 순회할 수 있을까?

### Symbol.iterator

`Symbol`은 어떤 값의 `key`로 사용될 수 있다. 다음 처럼 해보자.

```js
const arr = [1, 2, 3];

arr[Symbol.iterator] = null;

for (const a of arr) console.log(a);
```

실행시켜보면 알겠지만 순회가 갑자기 안되게 된다. 즉 `Symbol.iterator`와 순회 사이에 어떤 관계가 있다는 거다.

## 이터러블/이터레이터 프로토콜

- 이터러블: 이터레이터를  리턴하는 `[Symbol.iterator]`를 값으로 가지는 값
- 이터레이터: `{ value, done }` 객체를 리턴하는 `next()`를 가진 값
- 이터러블/이터레이터 프로토콜: 이터러블을 `for...of`, 전개 연산자 등과 함께 동작하도록한 규약

```js
const arr = [1, 2, 3];

const iterator = arr[Symbol.iterator]();

console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());

const set = new Set([1, 2, 3]);

const setIterator = set[Symbol.iterator]();

console.log(setIterator.next());
console.log(setIterator.next());
console.log(setIterator.next());
console.log(setIterator.next());
console.log(setIterator.next());

const map = new Map([['a', 1], ['b', 2], ['c', 3]]);

const mapIterator = map[Symbol.iterator]();
const keyIterator = map.keys();

console.log(mapIterator.next());
console.log(mapIterator.next());
console.log(mapIterator.next());
console.log(mapIterator.next());
console.log(mapIterator.next());

console.log(keyIterator.next());
console.log(keyIterator.next());
console.log(keyIterator.next());
console.log(keyIterator.next());
console.log(keyIterator.next());

class CanIterate { // 클래스는 순회할 수 없다.
	value1 = 1;
	value2 = 2;
	value3 = 3;
}

const instance = new CanIterate();

const intanceIterator = instance[Symbol.iterator]();

console.log(instanceIterator.next());
console.log(instanceIterator.next());
console.log(instanceIterator.next());
console.log(instanceIterator.next());
console.log(instanceIterator.next());

```

### 사용자 정의 이터러블을 통해 알아보자

```js
const iterable = {
	[Symbol.iterator]() {
		let i = 3;
		return {
			next() {
				return i=== 0 ? { done: true } : { value: i--, done: false };
			}
			[Symbol.iterator]() { return this; }
		}
	}
}

const iterator = iterable[Symbol.iterator]();

console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());

for (const a of iterable) console.log(a);

const arr2 = [1, 2, 3];

let iter2 = arr2[Symbol.iterator]();
iter2.next();

console.log(iter2[Symbol.iterator]() === iter2)

console.log("====");

for (const a of iter2) console.log(a);

```

**잘 구성된 사용자 정의 이터레이터란?**
이터레이터에 `Symbol.iterator`메서드를 실행했을 때 자기 자신을 반환해야 한다. 이를 통해서 하나를 실행하고 나서 나중에 나머지를 실행하는 것과 같은 로직을 구현할 수 있게 된다.

대부분의 순회할 수 있는 자료구조들은 이 이터레이터/이터러블 프로토콜을 따르고 있는 추세다.