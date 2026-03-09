---
author: Gihwan-dev
pubDatetime: 2024-05-22T15:28:10.247Z
title: 제네레이터, 이레이터 그리고 이터러블
slug: generator-iterator-iterable
featured: true
draft: false
tags:
  - development
  - fp
  - ps
description: 유인동님의 함수형 프로그래밍 강의를 보고 배운 이터레이터, 제네레이터, 이터러블을 알고리즘 풀이에 적용해 보았습니다!
---

[유인동님의 유튜브 영상](https://www.youtube.com/watch?v=4VPeriS5XWo&list=PLIa4-DYeLtn1I7pQEMbYITbl8SYm2AqXX&index=3)에서 이터레이터, 제네레이터, 이터러블을 이용해 안전하게 순회하며 프로그래밍 하는 모습을 보고 `LeetCode` 문제를 해결하는데 적용했습니다. 각 개념과 어떻게 풀었는지 공유해 보도록 하겠습니다!

## Table of contents

## 이터레이터, 제네레이터 그리고 이터러블

### 이터러블

`Symbol.iterator`메서드를 직접 구현하거나 상속받은 객체를 의미한다.

### 이터레이터

이터레이터 프로토콜은 `next()` 메서드를 소유하며 `next()`를 통해 이터러블을 순회하면 `{ value, done }` 값의 객체를 반환한다. `iterator`는 이터러블의 `Symbol.iterator`를 통해 반환될 수 있다.

```js
const arr = [1, 2, 3, 4, 5];

const iterator = arr[Symbol.iterator];

iterator.next(); // { value: 1, done: false } 를 반환
```

### 제네레이터

이터레이터를 생성하는 함수다. 특이한 점은 코드 블록을 한 번에 실행시키지 않고 멈췄다가 다시 실행할 수 있다는 점이다.

```js
function* generator() {
  yield 1;
  console.log("first");

  yield 2;
  console.log("second");

  yield 3;
  console.log("third");
}

generator().next(); // first, return { value: 1, done: false }

generator().next(); // second, return { value: 2, done: false }

generator().next(); // third, return { value: 3, done: false }

generator().next(); // "", return { value: undefined, done: true }
```

위 코드에서 보는 것 처럼 `function*` 키워드를 통해 생성하며 `yield`를 사용해 값을 반환한다.

## 이터레이터를 활용해 문제 풀기

이터레이터를 활용해 `LeetCode` 문제를 풀어 보았다. 앞으로는 `for`문을 이용한 순회가 아닌 `iterator`를 활용한 순회를 통해 문제를 푸는걸 습관화 하려고 한다.

### Chunk Array

주어진 배열 `arr`을 `size` 길이만큼의 청크로 분리하는 문제다.

```js
function* take(length, iterable) {
  const iterator = iterable[Symbol.iterator]();

  while (length-- > 0) {
    const { value, done } = iterator.next();

    if (done) break;

    yield value;
  }
}
```

우선 위 코드는 `arr`과 `length`를 입력받아 `length` 길이 만큼의 값을 반환하는 제네레이터 함수다. 다만 `done`이 `true`인 경우 `break`를 해서 입력된 배열을 통해 생성한 이터레이터의 순회가 끝난 경우엔 더이상 `while`문을 돌지 않도록 한다.

```js
function* getChunkedArray(size, iterable) {
  const iterator = iterable[Symbol.iterator]();

  while (true) {
    const arr = [
      ...take(size, {
        [Symbol.iterator]() {
          return iterator;
        },
      }),
    ];

    if (arr.length) yield arr;

    if (arr.length < size) break;
  }
}
```

위 함수는 `size`와 `iterable`을 인자로 받아 `size`만큼 길이로 분리된 배열을 반환하는 제네레이터 함수다. `take`함수를 통해 부분 배열을 반환받고 `arr.length`가 `true`값을 가진다면 `arr`을 `yield` 해준다.

```js
/**
 * @param {Array} arr
 * @param {number} size
 * @return {Array}
 */
var chunk = function (arr, size) {
  return [...getChunkedArray(size, arr)];
};
```

위 함수는 단순히 `getChunkedArray`함수를 호출해서 반환받은 제네레이터 값을 배열로 반환해주는 함수다. 아마 `getChunkedArray`는 제네레이터일 필요는 없다고 생각이 될 수 있는데 그렇게 할 경우 `chunked`된 배열을 담을 배열과 거기에 매번 `push`해서 반환해줘야 하기 때문에 지금이 좀 더 아름다운 코드라고 생각한다.

### Group by

이 문제는 `fn` 콜백을 입력받고 이 `fn`의 결과값을 토대로 배열의 모든 원소를 그룹핑 해 객체의 형태로 반환하는 문제다. 예제 입출력은 다음과 같다.

```text
Input:

array = [
  {"id":"1"},
  {"id":"1"},
  {"id":"2"}
],
fn = function (item) {
  return item.id;
}

Output:

{
  "1": [{"id": "1"}, {"id": "1"}],
  "2": [{"id": "2"}]
}
```

코드를 보며 설명하겠다.

```js
function addNewValue(existingValue, newValue) {
  if (existingValue) {
    return [...existingValue, newValue];
  }

  return [newValue];
}
```

위 코드는 기존 객체에 값이 있다면 새 값을 추가해서 반환하고, 아니라면 새로운 배열에 새 값을 담아 반환하는 함수다.

```js
function getGroupedValue(arr, fn) {
  let map = {};
  const iterator = arr[Symbol.iterator]();

  while (true) {
    const { value, done } = iterator.next();

    if (done) break;

    const key = fn(value);

    map[key] = addNewValue(map[key], value);
  }
  return map;
}
```

위 코드는 `iterator`를 통해 순회하며 키와 값을 통해 원소를 그룹화 하는 함수다.

```js
Array.prototype.groupBy = function (fn) {
  return { ...getGroupedValue(this, fn) };
};
```

위 코드는 단순히 그룹화 하는 함수의 값을 다시 반환해주는 함수다.

## 느낀점

`iterator`를 사용하면서 느낀점은 내가 기존 `for`문의 순회에 많이 익숙해져 적응이 힘들다는 것이었다. 생각하는 방식에 차이를 둬야 한다는 생각이 들었다. `iterator`는 배열의 길이를 통해 무언가를 하는게 아니라 **길이를 모른채 무한히 순회**하며 배열의 요소에 대한 정보를 토대로 어떤 동작을 처리해야 한다는 접근법으로 가야할 것 같다.

안전하게 코딩할 수 있는 방법이라고 생각된다. 요소의 정보에 대한 처리를 적절하게 해주면 되고 배열의 길이에 대한 정보를 또 다시 처리하지 않아도 된다는게 신기했다.

`chunk`라는 함수를 구현할 때 `for`문으로 구현하게 되면 필연적으로 입력받은 배열의 길이와 `size`간의 관계에 대한 에러 처리나 연산을 해줘야 한다. 그러나 `iterator`를 사용하니 요소의 정보 `{ value, done }`, `arr.length`에 대한 간단한 처리만 해주니 간편했다.

앞으로도 이러한 방식으로 안전하게 코딩할 수 있도록 많이 배워야 겠다.

## 출처

[개발자 가상 면접 3/6 - 명령형으로 동시성을 다루다 서버도 터지고 눈물샘도 터지는.. (수요코딩회 ep.1)](https://www.youtube.com/watch?v=4VPeriS5XWo&list=PLIa4-DYeLtn1I7pQEMbYITbl8SYm2AqXX&index=3)

> 방송 해주셔서 감사합니다! 열심히 배우겠습니다!
