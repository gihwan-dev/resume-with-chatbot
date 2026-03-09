---
author: Gihwan-dev
pubDatetime: 2024-05-23T13:41:01.293Z
title: bookSailor | 귀에 쏙쏙 들어오는 함수형 프로그래밍 Chapter12
slug: bookSailor-fp-chapter12
featured: false
draft: false
tags:
  - bookSailor
  - fp
  - study
description: 현재 진행중인 귀에 쏙쏙 들어오는 함수형 프로그래밍 북 스터디 Chapter12 요약본입니다.
---

## Table of contents

이번 장에서는 함수형 도구 `reduce`, `map`, `filter` 에 대해서 배웠다.

## map

자바스크립트에서는 배열 메서드인 `map` 을 사용할 수 있다. 그러나 이를 이터러블 자료구조 에서는 사용할 수 없다. 그렇기에 `map` 함수를 이터러블에 사용할 수 있게 정의해 사용하면 편리하다.

```js
function map(iter, callback) {
  const result = [];

  for (const item in iter) {
    result.push(callback(item));
  }

  return result;
}
```

와 같은 형식으로 사용할 수 있다.

## filter

`filter` 역시 마찬가지로 이터러블에 사용할 수 있도록 구현할 수 있다.

```js
function filter(iter, callback) {
  let result = [];

  for (const item in iter) {
    if (callback(item)) {
      result.push(item);
    }
  }

  return result;
}
```

## reduce

`reduce` 도 마찬가지로 이터러블 형식으로 만들 수 있다.

```js
function reduce(init, iter, callback) {
  let acc = init;

  for (const cur in iter) {
    acc = callback(acc, cur);
  }

  return acc;
}
```

## 결론

사실 이번장 내용은 빠르게 넘어갔다... 크게 얻을게 없던 장이였다. 항상 생각하지만 이런 기술적인 책을 읽을 때 중요한 포인트는 어떤 부분을 깊게 읽고 어떤 부분은 키워드 중심의 정보만 인덱싱 하고 넘어갈 것인지를 정하는거 라고 생각한다. 모든 부분을 깊게 이해하려 하면 학습의 효율성이 많이 떨어진다.

중요한 부분과, 그렇지 않은 부분 / 알고 있는 부분, 모르는 부분 을 잘 구별해서 학습의 효율을 높이자.
