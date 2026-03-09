---
author: Gihwan-dev
pubDatetime: 2024-06-19T08:34:47.244Z
title: 여러 이미지 압축해서 병렬적으로 요청 보내기
slug: multiple-image-compression
featured: true
draft: false
tags:
  - development
  - error
  - promise
description: 개인 포트폴리오 웹사이트에서 여러 이미지 업로드시 발생하는 문제에 대해 수정해 봤습니다.
---

개인 포트폴리오 웹사이트의 어드민 페이지에서 프로젝트에 대한 게시물을 쓸 수 있습니다. 프로젝트의 화면 사진을 업로드 할 수 있는 기능이 있는데 여기서 발견한 문제를 어떻게 해결했는지에 대해 작성해 봤습니다.

## Table of contents

## 발견한 문제

이전에 개인 포트폴리오 웹사이트에서 이미지 여러개를 업로드 할 수 있도록 기능을 구현했습니다. `chunk` 함수를 구현해 `chunk(iterable, size)`의 형태로 `iterable`을 원하는 `size`로 분리할 수 있도록 했고 이 나눠진 청크들을 `Promises.all` 메서드를 사용해 병렬적으로 요청을 처리했습니다.

```ts
function* take<T>(iter: Iterable<T>, n: number) {
  const iterator = iter[Symbol.iterator]();
  while (n--) {
    const { value, done } = iterator.next();

    if (done) break;

    yield value;
  }
}

export function* chunk<T>(iter: Iterable<T>, size: number) {
  const iterator = iter[Symbol.iterator]();

  while (true) {
    const arr = [
      ...take(
        {
          [Symbol.iterator]: () => iterator,
        },
        size
      ),
    ];

    if (arr.length) yield arr;

    if (arr.length < size) break;
  }
}
```

위 코드가 `chunk` 함수이고 다음은 이를 사용해 요청을 병렬적으로 해결하는 코드 입니다.

```ts
const chunkedFiles = [...chunk(files, 3)];

const promises = files.map(chunkedFileList =>
  upLoadFiles({
    chunkedFileList,
    type,
    documentId,
    callback: () => setSuccessCount(prev => prev + chunkedFileList.length),
  })
);

await Promise.all(promises);
```

다만 문제점은 이미지 하나의 사이즈가 클 경우에 있습니다. `chunk` 함수를 사용해 적절한 길이로 쪼갤 뿐 해당 길이 안의 파일들 용량의 총 합이 커지면 에러를 발생시키는 상황이 발생했습니다.

`chunk` 함수를 리팩토링해 `size`가 길이가 아닌 용량을 기반으로 나누게끔 하면 가능하지만 그렇게 하면 너무 많은 코드 베이스를 수정해야 했습니다.

## 차선책

`chunk` 함수는 그대로 두고 이미지 압축을 통해 해결하고자 했습니다. 물론 이대로 버려두겠다는건 절대 아니며, 일단 문제를 해결해두고 `chunk`함수를 수정할 예정입니다.

`compressor.js` 라이브러리를 사용해 이미지를 압축했습니다.

```ts
new Compressor(file, {
  convertSize: 2000000,
  error: _ => {
    reject("Failed to compress image");
  },
  success: result => {
    if (result instanceof Blob) {
      const compressedFile = convertBlobToFile(result, file.name);
      resolve(compressedFile);
    } else {
      resolve(result);
    }
  },
});
```

다만 위 코드는 문제가 있었습니다. 바로 **new Compressor()** 생성자를 통해 전달된 파일을 통해 이미지를 압축하게 되는데 이 내부 로직들이 비동기적으로 실행된다는 것입니다. `Promise`를 반환하지 않기에 `await`를 사용할 수 없습니다.

다음과 같은 코드를 사용해 해결했습니다.

```ts
const newFiles = await new Promise((resolve, reject) => {
  new Compressor(file, {
    convertSize: 2000000,
    error: _ => {
      reject("Failed to compress image");
    },
    success: result => {
      if (result instanceof Blob) {
        const compressedFile = convertBlobToFile(result, file.name);
        resolve(compressedFile);
      } else {
        resolve(result);
      }
    },
  });
});
```

`new Promise()` 메서드를 사용한 뒤 `success` 에서 파일을 `resolve` 하도록 했습니다.

## 느낀점

보통 `async`, `await`를 사용하면 대부분의 문제가 해결되어 왔습니다. 이번에 `Promise`의 `resolve`와 `reject`를 사용했는데, 이 `Promise`의 콜백이 생각보다 많이 유용하다는걸 깨달았습니다. 더 많은 활용 가능한 범위가 있을거라는 생각이 들었습니다.
