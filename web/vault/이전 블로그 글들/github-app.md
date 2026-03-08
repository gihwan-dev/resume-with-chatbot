---
author: Gihwan-dev
pubDatetime: 2024-05-15T13:45:12.615Z
title: Github App 개발하기
slug: github-app-1
featured: false
draft: false
tags:
  - development
  - github
  - auth
description: 이번 개인 프로젝트에 `GraphQL`과 `Relay`를 적용하기 위해 개념을 공부했던 내용을 정리했습니다.
---

깃허브에서 인증을 하는 방식은 `Github App` 과 `Github OAuth` 가 있다. 이 포스팅에서는 특히 `Github App`에 대해서 알아보도록 하겠다.

## Table of contents

## Github App

`Github App`은 `Github`의 기능과 상호 작용하고 확장하기 위해 사용할 수 있다. `Github App`의 일반적인 사용 사례는 다음과 같다.

- 작업 또는 백그라운드 프로세스 자동화
- 사용자가 `Github` 계정으로 로그인할 수 있는 `Sign in with Github` 지원
- `Github` 작업을 수행하는 앱을 개발할 수 있다.
- 외부 서비스를 `Github`와 통합할 수 있다.

`Github App`은 `OAuth`와 달리 사용자와 독립적으로 작동할 수 있다.

## Github 앱 구축

`Github App`을 개발하려면 우선 `Github App`을 등록해야 한다.

### Github App 등록

1. `Github` 페이지의 오른쪽 상단에서 프로필 사진을 클린한다.
2. 계정 설정으로 이동한다.
   - 설정을 클릭한다.
3. 개발자 설정을 클릭한다.
4. `Github App`을 클릭한다.
5. 새 `Github App`을 클릭한다.
6. "Github 앱 이름" 아래에 앱 이름을 입력한다. 명확하고 짧은 이름을 입력해라. 앱이 작업을 수행할 때 앱 이름이 사용자 인터페이스에 표시된다. 또한 앱 이름은 `Github` 전체에서 고유해야 한다.
7. 선택적으로 '설명' 아래에 앱에 대한 설명을 입력한다. 사용자 또는 조직은 앱을 설치할 때 이 설명을 보게 된다.
8. '홈페이지 URL' 아래에 앱 웹사이트의 전체 URL을 입력한다.
9. '콜백 URL' 아래에 사용자가 설치를 승인한 후 리디렉션할 전체 URL을 입력한다.
10. 선택적으로 사용자 액세스 토큰이 만료되는 것을 방지하려면 **사용자 인증 토큰 만료**를 선택 취소 하면 된다.
11. 앱을 설치할 때 앱을 인증하라는 메시지를 표시하려면 설치 중 사용자 인증 요청을 선택 해라.
12. 선택적으로 장치 흐름을 사용하여 사용자 액세스 토큰을 생성하려면 장치 흐름 활성화를 선택한다.
13. 설정 URL 아래에 사용자가 앱을 설치한 후 리디렉션할 URL을 입력한다. 설치 후 추가 설정이 필요한 경우 이 URL을 사용해 사용자에게 설치 후 수행할 단계를 알려줄 수 있다.
14. 설치를 업데이트한 후 사용자를 설정 URL로 리디렉현 하려면 **업데이트 시 리디렉션**을 선택한다.
15. 앱이 웹훅 이벤트를 수신하지 않도록 하려면 Active 를 선택 취소해라.
16. 웹훅 이벤트를 활성화 한 경우 "웹훅 URL"아래에 Github가 웹훅 이벤트를 보내야 하는 URL을 입력해라.
17. 웹훅을 활성화 한 경우 토큰을 입력해 웹훅을 보호해라.
18. 웹훅 URL을 입력한 경우 SSL 확인 활성화 여부를 선택해라.
19. 권한에서 앱에 필요한 권한을 선택해라.
20. 웹훅을 활성화 한 경우 앱이 수신할 웹훅 이벤트를 선택해라.
21. 앱을 어디에 설치할 수 있을지 정해라.
22. 앱 만들기를 클릭해 만들 수 있다.

## Github App 액세스 토큰 생성하기

[Generating a user access token for a Github App](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app)

유저를 특정 URL로 파라미터와 함께 이동시킨다. 기본 URL은 다음과 같다.

`https://github.com/login/oauth/authorize`

`client_id` 파라미터는 필수 파라미터다. 이외의 파라미터는 위 링크에서 확인할 수 있다.

이후 콜백 URL로 `code`라는 서치 파라미터와 함께 이동된다.

이 `code`값과 `clientId`, `clientSecret` 값을 사용해서 `access_token`을 발급받을 수 있다.
