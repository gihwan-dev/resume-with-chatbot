---
author: Gihwan-dev
pubDatetime: 2024-05-23T13:43:01.293Z
title: bookSailor | 귀에 쏙쏙 들어오는 함수형 프로그래밍 Chapter14
slug: bookSailor-fp-chapter14
featured: false
draft: false
tags:
  - bookSailor
  - fp
  - study
description: 현재 진행중인 귀에 쏙쏙 들어오는 함수형 프로그래밍 북 스터디 Chapter14 요약본입니다.
---

## Table of contents

객체를 다룰 수 있는 함수형 도구를 살펴본다. 객체는 해시 맵을 대신해 사용하고 있다.

## 필드명을 명시적으로 만들기

**함수 이름에 있는 암묵적 인자** 냄새가 나는 부분을 추출한다. 암묵적 인자로 표현되는 부분을 매개변수로 선언해 인자로 받을 수 있도록 하고 함수 시그니처를 수정했다.

```js
function incrementQuantity(item) {
  var quantity = item["quantity"];
  var newQuantity = quantity + 1;
  // -- 생략 --
}
```

의 코드를

```js
function incrementField(item, field) {
  var value = item[field];
  var newValue = value + 1;
}
```

로 수정했다.

## 함수 시그니처에 있는 동작을 인자로 드러내기

`function doubleField` 나 `function incrementField` 같은 함수는 함수 시그니처에 동작이 있다. 이걸 `callback`을 사용해 인자로 드러냈다.

## 함수형 도구: `update()`

`update()`는 객체를 다루는 함수형 도구다.

```js
function update(object, key, modify) {
  var value = object[key];
  var newValue = modify(value);
  var newObject = objectSet(object, key, newValue);
  return newObject;
}
```

이 update 함수를 사용해 조회, 변경, 설정을 한 번에 할 수 있다. 다양한 코드에서 나는 냄새를 대체할 수 있다.

중첩된 객체에 대해서는 재귀적으로 호출해 해결할 수 있다. 근데 그거보단 그냥 `lodash` 라이브러리에서 제공되는 함수를 사용하는게 좋을것 같다.
