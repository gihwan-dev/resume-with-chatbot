---
author: Gihwan-dev
pubDatetime: 2024-05-23T13:37:01.293Z
title: bookSailor | 귀에 쏙쏙 들어오는 함수형 프로그래밍 Chapter7
slug: bookSailor-fp-chapter7
featured: false
draft: false
tags:
  - bookSailor
  - fp
  - study
description: 현재 진행중인 귀에 쏙쏙 들어오는 함수형 프로그래밍 북 스터디 Chapter7 요약본입니다.
---

북 스터디에서 진행중인 `귀에 쏙쏙 들어오는 함수형 프로그래밍`을 읽고 정리한 후 느낀점을 간략하게 적어 보았습니다.

## Table of contents

## 방어적 복사

신뢰할 수 없는 코드와 데이터를 주고받는 방법이다. 들어오는 데이터에 깊을 복사를 하고 나가는 데이터에도 깊을 복사를 한 후 반환한다.

이 방식을 통해 안전지대를 벗어난 코드에서 발생할 수 있는 부수효과를 예방할 수 있다.

## 규칙

1. 데이터가 안전한 코드에서 나갈 대 복사를 한다.
2. 안전한 코드로 데이터가 들어올 때 복사를 진행한다.

즉 다음과 같다.

```js
var cart_copy = deepCopy(cart);

black_friday_promotion(cart_copy);

return deepCopy(cart_copy);
```

중요한 점은 깊은 복사를 진행하는 것이다.

## 방어적 복사 방법

1. `Lodash`라이브러리를 사용한다.
2. `JSON.stringify` 이후 `JSON.parse`를 사용해도 구현할 수 있다.
3. `structureClone` 글로벌 메서드를 사용한다. 최신 브라우저에서 등장한 메서드다. 다른 방법들보다 효율적인 방법이라고 한다.

`structureClone` 메서드의 브라우저 호환성은 다음과 같다.

(![alt text](structureClone.png))

## 느낀점

안전하지 않은 코드에 대해서 생각하고 깊은 복사를 진행한다는 점이 뭔가... 새로운 인사이트였다. 앞으로 신뢰할 수 없는 코드에 내 데이터를 전달할 때 이 방어적 복사를 사용해 봐야겠다.
