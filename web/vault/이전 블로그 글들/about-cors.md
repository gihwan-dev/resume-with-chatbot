---
author: Gihwan-dev
pubDatetime: 2024-05-20T07:29:07.121Z
title: CORS 문제 해결하기
slug: about-cors
featured: true
draft: false
tags:
  - development
  - cors
  - http
description: Github OAuth를 진행하며 CORS 이슈를 만났는데 어떻게 해결했는 지에 대해 적어봤습니다!
---

Github OAuth를 사용해 인증을 하는 도중 `CORS` 이슈를 만나게 되었습니다. 늘 만나 왔던 에러이지만 제대로 정리해 본 경험이 없다는 생각이 들어 제대로 한 번 정리해보자 생각해 포스팅 하게 되었습니다.

## Table of contents

## 동일 출처 정책(Same-Origin Policy)

동일 출처 정책은 웹 브라우저가 악의적인 웹 페이지가 다른 도메인에서 임의의 데이터를 가져오는 것을 방지하기 위해 도입된 보안 정책입니다. 동일 출처란 다음 세 가지 요소가 모두 일치하는 경우를 말합니다.

1. **프로토콜** (예: http, https)
2. **호스트** (예: example.com)
3. **포트** (예: 80, 443)

## CORS (Cross-Origin Resource Sharing)

CORS는 동일 출처 정책의 제한을 완화하여, 한 출처에서 실행 중인 웹 애플리케이션이 다른 출처의 리소스에 접근할 수 있도록 허용하는 메커니즘입니다.

## CORS 에러가 발생하는 이유

1. **서버가 CORS를 지원하지 않음**: 요청한 리소스의 서버가 CORS를 지원하지 않는 경우, 브라우저는 요청을 차단합니다.
2. **허용되지 않은 도메인**: 서버가 요청을 허용하도록 설정되지 않은 도메인에서 요청을 보낸 경우 요청을 차단합니다..
3. **프리플라이트 요청 실패**: 프리플라이트 요청은 실제 요청을 보내기 전에 CORS를 허용하는지 확인하기 위해 보내는 HTTP 요청 입니다. 브라우저가 실제 요청을 보내기 전에 CORS 설정을 허용하는지 확인하기 위해 OPTIONS 요청(프리플라이트 요청)을 보내고, 서버가 이를 제대로 처리하지 못한 경우 요청을 차단합니다.

## 해결 방법

우선 클라이언트의 요청에서는 CORS 헤더를 설정할 수 없다. 그 이유는 다음과 같다:

1. **보안 이유**

   - 클라이언트가 CORS 설정을 자유롭게 변경할 수 있다면 악성 웹 페이지가 사용자의 브라우저를 통해 다른 서버로 요청을 보내고 받을 수 있다.

2. **서버의 권한**

   - CORS 정책은 서버가 특정 도메인에서의 요청을 허용할지 여부를 결정하는 권한을 서버에게 부여한다. 서버는 응답 헤더를 통해 허용된 도메인을 명시한다.

3. **정책 통제**

   - CORS 정책은 서버 측에서 중앙 집중식으로 통제되어야 한다. 클라이언트가 이를 통제할 수 있다면 일관된 보안 정책을 유지하기 어렵다.

### 서버 측에서 CORS 설정

클라이언트에서 서버로 요청을 보내고 서버에서 CORS 헤더 설정을 해서 Github OAuth 요청을 보낸다. 그리고 이 응답을 클라이언트에 반환한다.

### 프록시 서버 사용

프록시 서버는 클라이언트와 서버 사이에 위치하여 클라이언트의 요청을 대신 처리하고 서버의 응답을 클라이언트로 전달하는 중간 서버다. 이 프록시 서버를 적절하게 설정해 요청을 보낸다.

### Next.js 서버를 사용해 해결

1. 클라이언트에서 서버로 요청을 보낸다.
2. 서버에서 요청을 받아 이를 Github OAuth 에 전달한다.
3. 전달할 때 CORS 설정을 헤더에 추가하여 보낸다.
4. 응답을 받아 반환한다.

#### CORS 설정은 Next Config 설정을 통해 간편하게 할 수 있다

```ts
/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ["@repo/ui"],
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
};
```

#### 서버에서 요청을 받아 Github OAuth로 전달한다

```ts
export const githubOAuthHandler = async ({
  code,
  clientId,
  clientSecret,
}: GithubOAuthHandlerParams) => {
  const url = addUrlSearchParams(githubAuthUrl, {
    code,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await postFetcher({
    url: url.href,
    options: {},
    body: {},
  });

  if (!response.ok) {
    throw new Error("Failed to fetch access token");
  }
  const textResponse = await response.text();

  const params = new URLSearchParams(textResponse);

  return {
    access_token: params.get("access_token"),
    scope: params.get("scope"),
    token_type: params.get("token_type"),
  };
};
```

### 만난 문제

### 1. 깃허브 응답 형식은 JSON 형식이 아니다

- Github OAuth 엔드포인트는 `application/x-www-form-urlencoded` 형식으로 응답을 반환한다.
- 그렇기에 응답을 텍스트로 읽고 URLSearchParams로 파싱하여 필요한 값을 추출해야 한다.

### 2. utility 함수로 제작한 fetcher 함수에 body 에 대한 예외 처리를 하지 않아 빈 객체를 문자열화 하고 이를 parse 할 때 에러가 생김

- 빈 객체를 문자열화 하고 이를 다시 파싱 하면 에러를 발생시킨다.

## 배운점

늘 `JSON` 형식의 응답을 주고받다 보니 다른 형식으로 응답 받을 수 있다는걸 생각하지 못했다. 깃허브 공식 문서를 잘 읽지 않아 생긴 문제라 생각하고 날린 시간이 아깝기도 하다. 그래도 이 경험이 피가되고 살이되어 오늘 하루도 성장했다 생각한다.
