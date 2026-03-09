---
author: Gihwan-dev
pubDatetime: 2024-05-23T13:42:01.293Z
title: bookSailor | 귀에 쏙쏙 들어오는 함수형 프로그래밍 Chapter13
slug: bookSailor-fp-chapter13
featured: false
draft: false
tags:
  - bookSailor
  - fp
  - study
description: 현재 진행중인 귀에 쏙쏙 들어오는 함수형 프로그래밍 북 스터디 Chapter13 요약본입니다.
---

## Table of contents

## 체인 만들기

사실 나는 기본적으로 `map`, `reduce`, `filter`를 사용해왔다. 적어도 배열에 있어서는. 그렇기에 최근 배우는 챕터들은 간단하게 넘어가는 중이다. 다만 오늘 **체인 만들기**는 제법 신선했다. 어떤 기능을 구현하는 절차를 엿볼 수 있었던거 같다. 이 책에서는 체인을 명확히 만드는데 두 가지 방법을 제안한다.

1. 단계에 이름을 붙인다. 단계에 이름을 붙이고 각 함수 내부에서 함수형 도구를 사용한다.
2. 콜백에 이름을 붙인다. 함수형 도구를 바로 사용하고 콜백에 이름을 붙여 넣어준다.

나는 2번의 방법이 좀 더 보기 좋았다. 재사용 하기 좋고, 명확하다.

## 스트림 결합

이 체이닝은 비효율적으로 보일 수 있다. 그래도 현대의 가비지 컬렉터는 굉장히 빠르게 동작하기 때문에 걱정할 필요는 없다. 그러나 비효율적인 경우가 있을 수 있다. `map`, `filter`, `reduce` 체인을 최적화하는 것을 **스트림 결합**이라고 한다. 다음 코드를 보자.

**값 하나에 `map` 두 번 사용**

```js
let names = map(customers, getFullName);
let nameLengths = map(names, stringLength);
```

이 단계는 다음과 같이 합칠 수 있다.

```js
let nameLengths = map(customers, function (customer) {
  return stringLength(getFullName(customer));
});
```

**값 하나에 `filter` 두 번 사용**

```js
let withAddresses = filter(customers, function (customer) {
  return isGoodCustomer(customer) && hasAddress(customer);
});
```

`reduce`도 크게 다르지 않은 방식이다. 명심해야 할 것은 지금 하는 일은 최적화다. 보통은 그냥 하나씩 체이닝 하는게 좋다.

## 체이닝 디버깅을 위한 팁

### 구체적인 것을 유지하기

데이터를 처리하는 과정에서 데이터의 구조를 잊어버리기 쉽다. 각 단계에서 어떤 것을 하고 있는지 알기 쉽게 이름을 잘 지어야 한다. 의미를 기억하기 쉽게 이름을 붙여라.

### 출력해보기

각 단계 사이에 print 구문을 넣어 코드를 돌려봐라.

### 타입을 따라가 보기

각 단계를 지나는 값의 타입을 따라가 봐라. `map`은 새로운 배열을 리턴한다. 어떤 값인지 몰라도 콜백이 리턴하는 타입의 값이 들어 있을 것이다.

이런식으로 각 단계에서 만들어지는 값의 타입을 따라가면서 단계를 살펴볼 수 있다.

## 다양한 함수형 도구

### pluck()

`map()`으로 특정 필드값을 가져오기 위해 콜백을 매번 작성하는 것은 번거롭다. `pluck()`를 사용하면 매번 작성하지 않아도 된다.

```js
function pluck(array, field) {
  return map(array, function(object)) {
      return object[field];
  }
}
```

### etc

이외에도 `concat()` 이나 `frequenciesBy()`, `groupBy()`등이 있다.

## 다양한 함수형 도구를 찾을 수 있는 곳

### Lodash

자바스크립트에 빠진 표준 라이브러리를 채워준다. 데이터를 다루는 추상화된 기능이 많이 포함되어 있다.

## 결론

**체인**이라고 부르는 방법으로 여러 단계를 조합했다. 체인의 각 단계는 원하는 결과에 가까워지도록 데이터를 한 단계씩 변환하는 단순한 동작이다. 함수형 프로그래머는 이런 도구를 자주 사용한다. 기본적으로 함수형 프로그래머는 계산을 데이터 변환으로 생각한다.
