`Array.prototype.sort` 메서드는 배열을 in-place로 변경하며 동작한다. 기본 정렬 순서는 문자열의 유니코드 코드 포인트를 따른다.

문법:

```jsx
const months = ['March', 'Jan', 'Feb', 'Dec'];
months.sort();
console.log(months);
// Expected output: Array ["Dec", "Feb", "Jan", "March"]

const array1 = [1, 30, 4, 21, 100000];
array1.sort();
console.log(array1);
// Expected output: Array [1, 100000, 21, 30, 4]
```

`Array.prototype.sort`는 다음과 같은 매개변수를 가진다.

```jsx
arr.sort(compareFunction);
```

- `compareFunction` - 정렬 순서를 정의하는 함수. 생략하면 각 요소의 문자열 변환에 따라 유니코드 포인트 값을 기준으로 정렬된다.

예를들어 “banana”는 “cherry” 앞에 온다. 하지만 숫자 정렬에서 9가 80보다 앞에 오지만 숫자는 문자열로 변환되기 때문에 “80”은 “9”보다 앞에 온다.

`compareFuncion(a, b)`의 반환값에 따라 다음과 같이 동작한다.

- 0보다 작은 경우: a를 b보다 낮은 색인으로 정렬한다.
- 0을 반환하는 경우: a와 b를 서로에 대해 변경하지 않고 다른 요소에 대해 정렬한다(ECMAScript 표준은 이러한 동작을 보장하지 않음).
- 0보다 큰 경우: a를 b보다 높은 색인으로 정렬한다.

간단한 숫자 비교 함수는 다음과 같을 수 있다.

```jsx
const numbers = [4, 2, 5, 1, 3];
numbers.sort((a, b) => a - b);

console.log(numbers); // 1, 2, 3, 4, 5
```

### 예제

**비 ASCII 문자 정렬**

ASCII 이외의 문자, 즉 악센트 부호가 있는 문자가 있는 문자열을 정렬 하려면 `String.localeCompare`를 사용할 수 있다.

```jsx
var items = ["réservé", "premier", "cliché", "communiqué", "café", "adieu"];
items.sort(function (a, b) {
  return a.localeCompare(b);
});

// items is ['adieu', 'café', 'cliché', 'communiqué', 'premier', 'réservé']
```

**`map`을 사용한 정렬**

`compareFunction`은 배열 내의 요소마다 여러 번 호출될 수 있다. 이런 `compareFunction`의 성질에 따라, 높은 오버헤드가 발생할 수 있다. 비교 함수가 복잡해지고, 정렬할 요소가 많아질 경우 `map`을 사용해 다음과 같이 할 수 있다.

```jsx
const list = ["Delta", "alpha", "CHARLIE", "bravo"];

// 위치 및 정렬에 사용할 값이 담긴 객체를 보유하는 배열을 생성
const mapped = list.map((el, id) => ({ index: i, value: el.toLowerCase() }));

mapped.sort((a, b) => {
	return +(a.value > b.value) || +(a.value === b.value) - 1;
});

const result = mapped.map((el) => list[el.index]);
```

![[Pasted image 20250103093208.png]]

**`Array.prototype.toSorted`**

ECMA2023에 새롭게 추가된 메서드 중 하나다.

`sort`와 유사하지만 한가지 다른 차이점이 있다. `toSorted` 메서드는 복사된 새로운 배열을 생성해 낸다.

```jsx
const months = ["Mar", "Jan", "Feb", "Dec"];
const sortedMonths = months.toSorted();
console.log(sortedMonths); // ['Dec', 'Feb', 'Jan', 'Mar']
console.log(months); // ['Mar', 'Jan', 'Feb', 'Dec']

const values = [1, 10, 21, 2];
const sortedValues = values.toSorted((a, b) => a - b);
console.log(sortedValues); // [1, 2, 10, 21]
console.log(values); // [1, 10, 21, 2]
```

`undefined`를 정리하기 위해 다음과 같이 사용할 수 있다:

```jsx
console.log(["a", "c", undefined, "b"].toSorted()); // ['a', 'b', 'c', undefined]
console.log([, undefined, "a", "b"].toSorted()); // ["a", "b", undefined, undefined]
```

배열이 아닌 객체에서도 사용할 수 있다.

`toSorted()` 메서드는 `this` 의 `length` 프로퍼티를 읽는다. 그리고 객체에 있는 모든 `0 ~ this.length - 1` 의 키를 가진 요소들을 정렬해 새로운 배열을 만들어낸다.

```jsx
const arrayLike = {
	length: 3,
	unrelated: "foo",
	0: 5,
	2: 4,
	3: 3, // length가 3이기 때문에 이 요소는 toSorted에서 무시된다.
}

console.log(Array.prototype.toSorted.call(arrayLike));
```