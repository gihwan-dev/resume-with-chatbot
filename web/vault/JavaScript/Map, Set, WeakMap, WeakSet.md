## 맵(Map)

맵은 키가 있는 데이터를 저장한다는 점에서 객체와 유사하다. 다만 맵은 키에 다양한 자료형을 허용한다.

맵에는 다음과 같은 주요 메서드와 프로퍼티가 있다.

- `set(key, value)` - key를 이용해 value를 저장한다.
- `get(key)` - key에 해당하는 값을 반환한다. 값이 없다면 undefined를 반환한다.
- `has(key)` - key가 존재하면 true, 존재하지 않으면 false를 반환한다.
- `delete(key)` - key에 해당하는 값을 삭제한다.
- `clear()` - 맵 안의 모든 요소를 제거한다.
- `size` - 요소의 개수를 반환한다.

예시:

```jsx
let map = new Map();

map.set('1', 'str1');
map.set(1, 'num1');
map.set(true, 'bool1');

// 객체는 키를 문자형으로 변환하지만, 맵은 키의 타입을 변형시키지 않고 그대로 유지한다.
map.get(1); // 'num1'
map.get('1'); // 'str1'
```

맵은 키로 객체를 허용한다:

```jsx
let john = { name: "John" };

let visitsCountMap = new Map();

visitsCountMap.set(john, 123);

visitsCountMap.get(john); // 123
```

> [!Note] **체이닝**
> `map.set`을 호출하면 맵 자신이 반환된다. 이를 이용하면 체이닝을 할 수 있다.
> ```js
> map.set('1', 'str1')
	> .set(1, 'num1')
	> .set(true, 'bool1');
> ``` 

### 맵 요소에 반복 작업

다음 세가지 메서드를 사용해 맵의 각 요소에 반복 작업을 할 수 있다.

- `map.keys()` - 요소의 키를 모은 이터러블 객체를 반환환다.
- `map.values()` - 요소의 값을 모은 이터러블 객체를 반환한다.
- `map.entries()` - 요소의 [키, 값]을 한 쌍으로 하는 이터러블 객체를 반환한다.

예시:

```jsx
let recipeMap = new Map([
  ['cucumber', 500],
  ['tomatoes', 350],
  ['onion',    50]
]);

// 키(vegetable)를 대상으로 순회합니다.
for (let vegetable of recipeMap.keys()) {
  alert(vegetable); // cucumber, tomatoes, onion
}

// 값(amount)을 대상으로 순회합니다.
for (let amount of recipeMap.values()) {
  alert(amount); // 500, 350, 50
}

// [키, 값] 쌍을 대상으로 순회합니다.
for (let entry of recipeMap) { // recipeMap.entries()와 동일합니다.
  alert(entry); // cucumber,500 ...
}
```

> [!Note] **맵은 삽입 순서를 기억한다.**
> 맵은 값이 삽입된 순서대로 순회를 실시한다. 객체가 프로퍼티 순서를 기억하지 못하는 것과는 다르다.

맵은 배열과 유사하게 내장 메서드 `forEach`도 지원한다.

```jsx
recipeMap.forEach((value, key, map) => {...});
```

### `Object.entries`: 객체를 맵으로 바꾸기

[키-값] 쌍의 배열이나 이터러블 객체를 맵에 전달해 초기화 시켜 새로운 맵을 만들 수 있다:

```jsx
let map = new Map([
	['1', 'str1'],
	[1, 'num1'],
	[true, 'bool1']
]);

map.get('1'); // str1
```

일반적인 객체를 사용해 맵을 만드는 방식은 다음과 같다:

```jsx
let obj = {
	name: "John",
	age: 30
};

let map = new Map(Object.entries(obj));
```

### `Object.fromEntries`: 맵을 객체로 바꾸기

반대로 맵을 객체로 바꿀수도 있다. `Object.fromEntries`를 사용할 수 있다:

```jsx
let prices = Object.fromEntries([
	['banana', 1],
	['orange', 2],
	['meat', 4]
]);
```

서드파티 코드에서 자료를 객체형태로 넘겨받길 원할 때 이 방법을 사용할 수 있다.

```jsx
let map = new Map();
map.set('banana', 1);
map.set('orange', 2);
map.set('meat', 4);

let obj = Object.fromEntries(map.entries());
```

`Object.fromEntries`는 이터러블을 인수로 받는다. 따라서 다음과 같이 간단하게도 할 수 있다.

```jsx
let obj = Object.fromEntries(map);
```

## 셋(Set)

Set은 중복을 허용하지 않는 값을 모아놓은 특별한 컬렉션이다. 키가 없는 값이 저장되며 다음과 같은 메서드를 가지고 있다.

- `add(value)` - 값을 추가하고 Set 자신을 반환한다.
- `delete(value)` - 값을 제거한다. 제거에 성공하면 `true` 아니면 `false`를 반환한다.
- `has(value)` - Set내에 값이 존재하면 `true`를 아니면 `false`를 반환한다.
- `clear()` - Set을 비운다.
- `size` - 몇 개의 값이 있는지를 반환한다.

다음과 같은 상황에 유용하다.

```jsx
let set = new Set();

let john = { name: "John" };
let pete = { name: "Pete" };
let mary = { name: "Mary" };

// 어떤 고객(john, mary)은 여러 번 방문할 수 있습니다.
set.add(john);
set.add(pete);
set.add(mary);
set.add(john);
set.add(mary);

// 셋에는 유일무이한 값만 저장됩니다.
alert( set.size ); // 3

for (let user of set) {
  alert(user.name); // // John, Pete, Mary 순으로 출력됩니다.
}
```

### Set의 값 순회하기

`for...of`나 `forEach`를 사용하면 Set의 값을 순회할 수 있다.

```jsx
let set = new Set(["oranges", "apples", "bananas"]);

for (let value of set) alert(value);

// forEach를 사용해도 동일하게 동작합니다.
set.forEach((value, valueAgain, set) => {
  alert(value);
});
```

Map과 마찬가지로 이터러블을 생성하는 메서드가 있다.

- `keys()` - 모든 값을 포함하는 이터러블 객체를 반환한다.
- `values()` - keys와 동일한 역할을 한다. Map과의 호환성을 위해 만들어졌다.
- `entries()` - `[value, value]` 배열을 포함하는 이터러블을 반환한다. Map과의 호환성을 위해 만들어졌다.

### Set 집합 연산

`Set` 객체는 수학 연산과 같이 집합을 구성할 수 있는 몇 가지 메서드를 제공한다:

![[Pasted image 20250103093638.png]]
![[Pasted image 20250103093658.png]]

### 유사 Set 객체(Set-like objects)

모든 Set 구성 메서드는 `this`가 실제 `Set` 인스턴스여야 하지만, 인자는 Set과 유사하면 된다. 유사 Set 객체는 다음을 제공하는 객체이다.

- 숫자값을 제공하는 `size` 속성
- 요소를 취하고 부울값을 반환하는 `has()` 메서드
- Set의 요소에 대한 반복자를 반환하는 `keys()` 메서드

Map의 경우 `size`, `has()`, `keys()`도 가지고 있기 때문에 아래처럼 잘 동작 한다:

```jsx
const a = new Set([1, 2, 3]);
const b = new Map([
  [1, "one"],
  [2, "two"],
  [4, "four"],
]);
console.log(a.union(b)); // Set(4) {1, 2, 3, 4}
```

배열은 `has()`, `size`가 없고 `keys()`가 요소가 아닌 인덱스를 생성하기 때문에 유사 Set이 아니다. WeakSet 역시 `keys()`가 없기 때문에 아니다.

다음은 Set처럼 동작하는 웹 API 인터페이스 목록이다.

읽기전용:

- [`GPUSupportedFeatures`](https://developer.mozilla.org/en-US/docs/Web/API/GPUSupportedFeatures)
- [`XRAnchorSet`](https://developer.mozilla.org/en-US/docs/Web/API/XRAnchorSet)

쓰기가능:

- [`CustomStateSet`](https://developer.mozilla.org/en-US/docs/Web/API/CustomStateSet)
- [`FontFaceSet`](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet)
- [`Highlight`](https://developer.mozilla.org/en-US/docs/Web/API/Highlight)

## WeakMap

키/값 쌍의 모음이며, 키는 반드시 객체 또는 등록되지 않은 심볼 이여야 한다. WeakMap은 강력한 참조를 생성하지 않기 때문에 WeakMap의 키에 포함되더라도 가비지 컬렉션의 대상이 된다.

예를 들어 Map에서는:

```jsx
let john = { name: "John" };

let map = new Map();

map.set(john, "...");
```

이렇게 객체가 key로 할당되면 Map이 메모리에 남아 있는 한 객체도 메모리에 남아 가비지 컬렉션의 대상이 되지 않는다.

반면에 WeakMap에서는:

```jsx
let john = { name: "John" };

let map = new WeakMap();
map.set(john, "...");

john = null; // 참조를 덮어씀
```

이렇게 될 경우 john 객체는 WeakMap의 키로 사용되고 있더라도 가비지 컬렉터의 대상이 되고 메모리와 위크맵에서 자동으로 삭제된다.

Map과 WeakMap의 또 다른 차이점은 WeakMap은 순회와 `keys()`, `values()`, `entries()` 메서드를 지원하지 않는다는 점이다. WeakMap의 메서드는 다음과 같다:

- `get(key)`
- `set(key, value)`
- `delete(key)`
- `has(key)`

이렇게 적은 메서드를 제공하는 이유는 가비지 컬렉션의 동작 방식 때문이다. 가비지 컬렉션의 동작 시점은 정확히 알 수 없다. 자바스크립트 엔진만이 알고 있다.

그렇기에 WeakMap에 현재 요소가 몇 개 있는지 정확히 파악하는것 조차 불가능하다. 가비지 컬렉터가 한 번에 메모리를 지울 수 있고, 부분적으로 지울수도 있기 때문이다. 그래서 WeakMap의 요소 전체(키/값)를 대상으로 무언가를 하는 메서드는 동작 자체가 불가능하다.

### Use Case: 추가 데이터

WeakMap은 부차적인 데이터를 저장할 곳이 필요할 때 사용하기 좋다. 예를들어 서드파티 라이브러리와 같은 외부 코드에 속한 객체를 가지고 있다고 가정하자. 이 객체에 서드파티 라이브러리 데이터를 추가해 줘야 하는데, 이는 객체가 살아있는 동안에만 유효하다. 이럴때 WeakMap을 사용할 수 있다.

```jsx
weakMap.set(내_객체, 서드파티_라이브러리_데이터);
// 내_객체가 사망하면 서드파티_라이브러리_데이터도 자동으로 파기된다.
```

또다른 예시를 보자:

```jsx
// 📁 visitsCount.js
let visitsCountMap = new Map(); // 맵에 사용자의 방문 횟수를 저장함

// 사용자가 방문하면 방문 횟수를 늘려줍니다.
function countUser(user) {
  let count = visitsCountMap.get(user) || 0;
  visitsCountMap.set(user, count + 1);
}

// 📁 main.js
let john = { name: "John" };

countUser(john); // John의 방문 횟수를 증가시킵니다.

// John의 방문 횟수를 셀 필요가 없어지면 아래와 같이 john을 null로 덮어씁니다.
john = null;
```

이런 경우 사용자를 나타내는 객체가 필요없게 되면 손수 카운트를 지워주어야 한다. 애플리케이션 구조가 복잡하면, 쓸모 없는 데이터를 수동으로 비우는게 골치아픈 일이다. 반면에 WeakMap을 사용하면:

```jsx
// 📁 visitsCount.js
let visitsCountMap = new WeakMap(); // 위크맵에 사용자의 방문 횟수를 저장함

// 사용자가 방문하면 방문 횟수를 늘려줍니다.
function countUser(user) {
  let count = visitsCountMap.get(user) || 0;
  visitsCountMap.set(user, count + 1);
}
```

유저에 대한 방문 횟수를 수동으로 청소할 필요가 없다. 객체가 가비지 컬렉션 되면 대응하는 방문 횟수도 자동으로 가비지 컬렉션 대상이 되기 때문이다.

### Use Case: 캐싱

WeakMap은 캐싱이 필요할 때 유용하다. 아래 예시처럼 어떤 함수의 연산 결과를 Map에 저장하고 있다고 생각해보자:

```jsx
let cache = new Map();

function process(obj) {
	if (!cache.has(obj)) {
		let result = 무거운연산(obj);
		
		cache.set(obj, result);
	}
	
	return cache.get(obj);
}

let obj = { ... };

let result1 = process(obj);
let result2 = process(obj); // 캐시된 값 반환

obj = null;

console.log(cache.size); // 1 여전히 캐시는 남아있다.
```

이처럼 특정 객체가 더이상 필요하지 않아도 캐시가 남아있게 되고 이를 수동으로 청소해야 한다. WeakMap을 사용하면 예방할 수 있다.

```jsx
let cache = new WeakMap();

function process(obj) {
	if (!cache.has(obj)) {
		let result = 무거운연산(obj);
		
		cache.set(obj, result);
	}
	
	return cache.get(obj);
}

let obj = { ... };

let result1 = process(obj);
let result2 = process(obj); // 캐시된 값 반환

obj = null;

console.log(cache.size); // 1 => 여전히 캐시는 남아있다.
```

`obj`가 `null`이되어 도달불가능한 객체가 되면 가비지 컬렉터의 대상이되고, 자바스크립트 엔진에 의해 가비지컬렉션 되면 상응하는 캐시도 사라지게 된다.

## WeakSet

WeakSet은 Set과 유사하지만 객체만 저장할 수 있다. 객체는 도달 가능할 때만 메모리에서 유지된다. 또한 지원되는 메서드는 `add`, `has`, `delete`가 끝이다.

WeakMap과 마찬가지로 부차적인 데이터를 저장할 때 사용할 수 있다. 다만, 복잡한 데이터를 저장하지 않고 존재 여부 정도의 확인에만 사용된다.

다음은 사용자의 사이트 방문 여부를 추적하는 요도로 WeakSet을 사용하는 예제이다.

```jsx
let visitedSet = new WeakSet();

let john = { name: "John" };
let pete = { name: "Pete" };
let mary = { name: "Mary" };

visitedSet.add(john); // John이 사이트를 방문합니다.
visitedSet.add(pete); // 이어서 Pete가 사이트를 방문합니다.
visitedSet.add(john); // 이어서 John이 다시 사이트를 방문합니다.

// visitedSet엔 두 명의 사용자가 저장될 겁니다.

// John의 방문 여부를 확인해보겠습니다.
alert(visitedSet.has(john)); // true

// Mary의 방문 여부를 확인해보겠습니다.
alert(visitedSet.has(mary)); // false

john = null;

// visitedSet에서 john을 나타내는 객체가 자동으로 삭제됩니다.
```

WeakMap과 WeakSet의 가장 큰 단점은 순회가 불가능하다는 점이다. 그래서 객체엔 ‘주요’자료를 WeakMap과 WeakSet에는 ‘부수적인’ 자료를 저장하는 형태로 활용할 수 있다.