---
author: Gihwan-dev
pubDatetime: 2024-07-01T11:05:28.776Z
title: Web API 총 정리 해보기!
slug: web-api-total-summary
featured: true
draft: false
tags:
  - development
  - web
  - cheatsheet
description: 갑자기 궁금해진 Web API에 대해서 총 정리 해봤습니다!
---

각 세부 사항에 대해 깊게 다루진 않았습니다. 다만 이러한 API 가 있다 라는걸 인덱싱 해둘 용도로 정리했습니다. 추후 사용하게 된다면 깊게 공부해 적용하는 방식이 효율적이라 생각했습니다. 간단하게 이런게 있구나 하고 봐주시면 감사하겠습니다! What(무엇인지), When(언제 사용할 수 있는지) 를 중심으로 요약했습니다.

## Table of contents

## Specifications

### Attribution Reporting API (experiment)

#### What?

**Attribution Reporting API**는 *전환*을 측정할 수 있게 해준다. 예를들어 내 웹사이트에 광고가 있다고 하자. 유저가 이 광고를 클릭해 판매자의 사이트에서 구매를 진행했다. 이 경우에 광고를 클릭해 판매자 사이트로 이동된 *전환*을 리포팅 한다. 이때 써드 파티 트래킹 쿠키를 사용하지 않는다.

> 써드 파티 트래킹 쿠키는 사용자가 방문한 웹사이트가 아닌 다른 도메인에서 발행한 쿠키다. 주로 광고나 분석 목적으로 사용자의 온라인 활동을 추적하고, 사용자 정보를 수집하여 타겟 광고를 제공하는 데 사용된다.

#### When?

얼마나 많은 유저가 광고를 보고 구매까지 이어졌는지를 측정하는데 사용할 수 있습니다.

### Audio Output Devices API (experiment)

#### What?

**Audio Output Devices API**는 웹앱이 유저에게 어떤 스피커를 통해 오디오를 출력할 것 인지 물어볼 수 있도록 해준다.

#### When?

**What**에 설명된 대로 어떤 스피커를 통해 출력할지 물어볼 때 사용할 수 있습니다.

### Background Fetch API (experiment)

#### What?

소프트웨어, 영화와 같이 용량이 커 다운로드에 오랜 시간이 걸리는 것들의 다운로드를 관리할 수 있는 메서드를 제공해준다.

#### When?

유저가 큰 용량의 파일을 다운로드할 때 연결을 유지하기 위해 다운로드가 완료될 때 까지 페이지에 머물러야 하는 불편함이 있다. `fetch`를 백그라운드에서 수행하도록 해 페이지를 이탈하더라도 다운로드가 중단되지 않으며, 다운로드 상태를 확인하거나 다운로드를 취소할 수 있는 메서드를 제공한다.

> **Background Synchronization API** 를 사용해 유저가 연결될 때 까지 다운로드를 연기할 수 있지만 이는 긴 시간 작업이 소요되는 다운로드와 같은 곳에서는 사용할 수 없다고 한다.

### Badging API

#### What?

document 나 application 에 Badge 를 설정할 수 있는 메서드를 제공한다. 앱 아이콘에 뱃지를 통해 새로운 메시지가 도착했다는 것을 알려주는 형태로 많이 사용된다.

#### When?

- 브라우저 탭에 나타나는 페이지 아이콘에 뱃지를 설정하고 싶은 경우
- 설치된 웹앱의 아이콘에 뱃지를 설정하고 싶은 경우

### Beacon API

#### What?

**Beacon API** 는 응답을 기대하지 않는 비동기의 논-블로킹 요청을 보낼 때 사용된다. 브라우저는 이 요청이 페이지가 언로드 되기 전에 초기화 및 완료되도록 한다.

#### When?

클라이언트 사이드에서 발생한 이벤트나, 서버로 전송되는 세션에 대한 *analytics*를 전송하는데 사용할 수 있다. `XMLHttpRequest`를 사용하면 페이지가 언로드될 때 요청도 취소된다. `Beacon API` 를 사용하면 이러한 경우에도 요청이 완료 되도록 보장할 수 있다.

### Background Synchronization API

#### What?

웹앱에서 어떤 작업을 연기할 수 있도록 해준다. 연기된 작업은 유저의 네트워크가 연결되면 `Service Worker` 에서 재개된다.

#### When?

예를 들어 이메일 전송 앱에서 유저가 네트워크에 연결되어 있지 않더라도 이메일을 작성하고 보낼 수 있도록 할 수 있다.

### Barcode Detection API (experiment)

#### What?

이미지의 바코드를 인식할 수 있게 해준다.

#### When?

바코드를 인식해야할 필요가 있을 때 사용할 수 있다.

### Web Bluetooth API (experiment)

#### What?

블루투스 연결을 할 수 있도록 해준다.

#### When?

블루투스 연결이 필요할 때 사용할 수 있다.

### Background Tasks API

#### What?

작업을 `queue`에 넣고 유휴시간에 실행할 수 있도록 해준다. `requestIdleCallback`, `requestAnimationFrame` 등이 있다.

#### When?

이벤트를 핸들링 하고 스크린을 업데이트 하는 것은 유저 상호작용의 대부분의 요소다. 그렇기에 이러한 작업은 중단되지 않아야 한다. 이 작업을 중단시킬 수 있는 무거운 작업은 유휴시간에 실행되는게 좋다.

이 무거운 작업이 `DOM`을 업데이트 하는 경우에는 `requestAnimationFrame`을 사용하자.

그렇지 않다면 `requestIdleCallback`을 사용하면 된다.

### Battery API

#### What?

배터리 충전 상태를 알려주며 이 상태가 변경되면 사용자가 알 수 있도록 알림을 준다.

#### When?

배터리 상태에 따라 어떤 작업을 수행하고 싶을 때 유용하다.

### Broadcast Channel API

#### What?

같은 origin을 가지고 있는 브라우저의 윈도우, 탭, 프레임, iframe 간에 소통이 가능하도록 해준다.

#### When?

오리진이 같지만 다른 탭에 있는 유저의 인터랙션을 감지해야하는 상황과 같은 경우 사용할 수 있다.

### CSS Custom Highlight API

#### What?

문서에서 임의의 텍스트 범위를 스타일링 할 수 있는 메커니즘을 제공한다.

#### When?

동적으로 텍스트에 대해 하이라이팅을 적용해야 한다면 사용할 수 있다.

### CSS Font Loading API

#### What?

폰트를 동적으로 로딩할 수 있도록 해준다.

#### When?

스타일 시트에 `@font-face` 와 `font-family`를 사용해서 폰트를 설정하고 받아올 수 있다. 다만 이렇게 사용할 경우 대부분 처음 필요로 할 때 폰트를 로드 한다. 이는 웹 페이지 로딩에 지연을 줄 수 있다.

이를 극복하기 위해 `CSS Font Loading API`를 사용할 수 있다. 동적으로 원할 때 폰트를 로드할 수 있도록 해준다.

### CSS Painting API (experiment)

#### What?

요소의 background, border, content를 그릴 수 있는 자바스크립트 함수를 작성할 수 있게 해준다.

#### When?

복잡한 background, border, content를 프로그래밍 한 방식으로 그릴 수 있게 해준다.

### CSS Properties and Values API

#### What?

CSS 커스텀 프로퍼티를 정의할 수 있게 해준다.

#### When?

_복잡한 CSS 스타일링 시나리오에서 유연성과 관리성을 높이는 데 큰 도움을 줍니다. 이를 통해 CSS를 더 강력하게 사용하고, 보다 유지보수 가능한 코드를 작성할 수 있습니다_. (gpt 피셜)

### CSS Typed Object Model API

#### What?

CSS 프로퍼티 조작을 `type safe` 하게 할 수 있게 해준다. CSS 조작을 간편하게 해줄 뿐만 아니라, `HTMLElement.style` 에 비해 부정적인 영향이 적다.

#### When?

CSS 프로퍼티를 조작할 대 사용할 수 있다.

### CSS Object Model (CSSOM)

#### What?

자바스크립트에서 CSS 를 조작할 수 있도록 해주는 API들의 모음 이다.

#### When?

CSS 를 조작해야 한다면 사용할 수 있다.

### Canvas API

#### What?

자바스크립트에서 그래픽을 그릴 수 있도록 해준다. 애니메이션, 게임 그래픽, 데이터 시각화, 사진 조작, 실시간 비디오 처리 등에 사용될 수 있다.

#### When?

다양한 그래픽 작업이 필요할 때 사용할 수 있다.

### Channel Messaging API

#### What?

한 문서에 있는 두개의 다른 컨텍스트를 가진 문서들이 메세지를 주고 받을 수 있도록 해준다.

#### When?

서로 다른 컨텍스트의 문서들 간에 데이터를 주고 받아야 하는 경우 사용할 수 있다.

### Clipboard API

#### What?

클립보드를 조작할 수 있도록 해준다.

#### When?

클립보드를 조작해야 하는 경우 사용할 수 있다.

### Compression Streams API

#### What?

`gzip` 이나 `deflate` 형식으로 데이터의 스트림을 압축하거나 압축 해제 할 수 있도록 해준다.

#### When?

압축과 관련된 작업을 해야 한다면 사용할 수 있다.

### Compute Pressure API (experimental)

#### What?

CPU와 같은 시스템 리소스의 압력을 관찰할 수 있게 해준다.

#### When?

CPU 상태를 보고 작업을 할당할 수 있게 하는 등의 작업을 할 수 있게 해준다.

### Contact Picker API (experimental)

#### What?

연락처 목록을 받아올 수 있도록 해준다.

#### When?

연락처 목록을 받아와 어떤 작업을 진행해야 하는 경우 사용할 수 있다.

### Content Index API (experimental)

#### What?

개발자가 오프라인 지원 콘텐츠를 브라우저에 등록할 수 있도록 해준다.

#### When?

웹의 오프라인 컨텐츠는 유저가 발견하기 쉽지 않다. `Content Indexing` 은 브라우저에게 어떤 컨텐츠가 오프라인인지 알려줄 수 있게 한다.

### Cookie Store API

#### What?

cookie를 비동기적으로 다룰 수 있도록 해준다.

#### When?

`document.cookie` 메서드는 동기적으로 일어난다. 이는 쿠키에 대한 작업이 완료될 때 까지 기다려야 한다는 의미다. Cookie Store는 쿠키에 대한 작업을 비동기적으로 할 수 있도록 해준다.

### Credential Management API

#### What?

웹사이트에서 자격 증명을 생성, 저장 및 검색할 수 있다. 자격 증명은 시스템에서 인증 결정을 내릴 수 있도록 하는 항목으로, 사용자를 계정에 로그인할지 여부를 결정하는데 사용될 수 있다.

### Document Object Model

**DOM**은 문서의 구조를 나타내어 프로그래밍 언어 또는 스크립트와 웹 페이지를 연결시켜 준다. **DOM**은 논리적 트리를 통해 문서를 나타낸다. **DOM**의 메서드는 트리에 프로그래밍적인 방식으로 접슨할 수 있도록 해준다. 이를 사용해서 문서의 구조, 스타일, 내용을 변경할 수 있다.

### Device Memory API

이 기능은 HTTPS에서만 사용할 수 있다. 디바이스의 수용능력은 사용 가능한 RAM의 크기에 깊게 의존한다. 자바스크립트 API를 사용해서 이 기기의 메모리 크기를 대략정으로 얻어낼 수 있다.

```js
const RAM = navigator.deviceMemory;
```

### Device orientation events

Device orientation events는 디바이스의 물리적 방향을 알아내는데 도움을 준다.

### Document Picture-in-Picture API

이 API는 실험적 API다. HTTPS에서만 사용 가능하다. 이 API는 사용자 지정 컨트롤이 있는 동영상이나 화상 회의 통화 참가자를 보여주는 일련의 스트리 등 임의의 HTML 콘텐츠로 채워질 수 있는 상시 상단의 창을 열 수 있다. `<video>` 태그를 사용하면 이 API가 내장되어 있다.

### EditContext API

이 API는 실험적 API다. 이 API는 rich text editors를 개발할 때 사용될 수 있다.

### Encoding API

이 API는 다양한 문자 인코딩 매커니즘을 제공한다.

### Encrypted Media Extensions API

이 API는 HTTPS에서만 사용할 수 있다.
