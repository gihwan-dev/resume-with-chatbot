---
author: Gihwan-dev
pubDatetime: 2024-05-23T13:40:01.293Z
title: bookSailor | 귀에 쏙쏙 들어오는 함수형 프로그래밍 Chapter11
slug: bookSailor-fp-chapter11
featured: false
draft: false
tags:
  - bookSailor
  - fp
  - study
description: 현재 진행중인 귀에 쏙쏙 들어오는 함수형 프로그래밍 북 스터디 Chapter11 요약본입니다.
---

## Table of contents

## 리팩터링 요약

- 함수 이름에 있는 암묵적 인자 드러내기
- 함수 본문을 콜백으로 바꿔 암묵적 인자 드러내기

## 함수를 리턴하는 함수

예제

```js
function wrapLogging(f) {
  try {
    f();
  } catch (e) {
    sendLogToSomeWhere(e);
  }
}
```

이런식으로 함수를 래핑하는 함수(팩토리)를 생성해 재사용할 수 있다.

## 결론

일급 값, 일급 함수, 고차 함수를 배웠다. 사실 뭐 내용이 크게 뭔가 있진 않았다. 어쨌든 늘 뭔가 해왔던 동작들에 대해서 명확하게 개념을 글로 정리한 느낌? 이라 머리가 트이는 것 같긴 하다.
