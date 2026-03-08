---
author: Gihwan-dev
pubDatetime: 2024-05-21T09:11:54.130Z
title: 로딩, 에러 바운더리와 useSearchParams
slug: error-resolve
featured: true
draft: false
tags:
  - development
  - error
  - daily
description: 이번 앱을 개발하며 에러 바운더리와 서스펜스 바운더리에 대해 깊게 고민하며 설정을 했습니다! 그러던 중 만난 문제점들에 대해서 적어 보았습니다
---

이번에 깃허브 대시보드 앱을 개발하기로 마음먹었고, 내가 가진 역량을 모두 쏟아 내보자고 생각하게 되었다. 그 중에서도 에러, 로딩 상태를 확실하게 관리하기로 했고 `ErrorBoundary` 와 `SuspenseBoundary`를 적극 활용 해봤다.

## Table of contents

## ErrorBoundary

`error.js`를 통해 에러 관리를 할 수 있겠지만, 각 컴포넌트에 맞게 에러를 좀 더 세부적으로 관리하고 싶었다.

오늘 개발은 깃허브 `OAuth`를 통해 권한을 인증하면 `callback url`로 `code` 파라미터와 함께 리디렉션 된다.

이 `code` 파라미터를 통해 `access_token`을 발급 받아야 한다. 그래서 다음과 같은 흐름으로 제어하기로 했다.

1. 로그인 버튼을 누른다.
2. 깃허브 `OAuth` 페이지에서 권한을 허용한다.
3. 로그인 성공 페이지로 리디렉션 된다.
4. 로그인 성공 페이지의 버튼을 클릭해 `access_token`을 받는다.
5. 토큰 발급에 성공하면 메인 페이지로 이동한다.

로그인 페이지에서 버튼을 누르는 동작이나, 깃허브 페이지에서 `Authorize` 버튼을 누르는것은 특별한 에러 바운더리가 필요 없다고 생각했다.

로그인 페이지의 버튼은 링크 버튼일 뿐이고 깃허브 페이지는 내가 제어할 수 없는 페이지기 때문이다.

로그인 성공 페이지에서 에러 관리를 시도했고 내가 선택한 방법은 다음과 같았다.

특정한 액션을 하는 훅이나 컴포넌트에서 발생한 에러를 `rethrow` 하여 부모 컴포넌트에서 처리하는 것이다.

### 리액트 쿼리는 기본적으로 에러 관리를 한다

리액트 쿼리는 에러가 발생하면 `isError` 와 `error` 값을 통해 에러를 관리해 준다.

나는 이 동작이 불필요했다. 차라리 에러가 발생하면 이를 `throw` 해주는 동작이 필요했다.

다행히도 `react query`는 기본 설정을 덮어쓸 수 있다.

```ts
"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface ReactQueryProviderProps {
  children: ReactNode;
}

export default function ReactQueryProvider({
  children,
}: ReactQueryProviderProps) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
        throwOnError: true,
      },
      mutations: {
        retry: 0,
        throwOnError: true,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

```

이로써 에러가 발생하면 에러를 `throw` 할 수 있게 되었다.

그리고 다음처럼 에러 바운더리를 통해 감싸주어 에러를 적절한 위치의 부모에서 처리하도록 했다.

```ts
import { Suspense } from "react";
import { SignInSuccess } from "~/features/sign-success";
import LottieLoading from "~/components/LottieLoading";

export default function SignInSuccessPage() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  return (
    <SignInSuccess.Layout>
      <SignInSuccess.Error>
        <Suspense fallback={<LottieLoading />}>
          <SignInSuccess.Provider
            clientId={clientId}
            clientSecret={clientSecret}
          >
            <SignInSuccess.Title />
            <SignInSuccess.Button />
          </SignInSuccess.Provider>
        </Suspense>
      </SignInSuccess.Error>
    </SignInSuccess.Layout>
  );
}
```

## SuspenseBoundary

사실 로딩 상태는 `react-query`를 사용해서 잘 관리되고 있었다. 그런데 문제는 `useSearchParams` 로 인해서 발생하는 것이었다.

`Next.js` 공식 문서를 읽어보면 다음과 같이 적혀 있다.

> suspenseBoundary 없이 `useSearchParams`를 사용해 매개변수에 접근하면 전체 페이지를 클라이언트 사이드 렌더링 하게 된다. 이는 페이지의 자바스크립트 파일을 받아오기 전까지 빈 화면을 보여주게 만든다.

그런 이유로 `useSearchParams`를 `SuspenseBoundary`로 감싸주지 않으면 `build` 단계에서 에러를 발생시키게 된다.

## 배운점

에러, 로딩 상태를 관리하면서 많은걸 배운것 같다. 어디서 에러를 어떻게 처리해야 할지 고민해야 했고 로딩 상태를 어떻게 어느 지점에서 관리할지도 고민해야 했다. 오늘도 한걸음 성장했다는 기분이 든다.
