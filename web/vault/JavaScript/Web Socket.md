웹소켓을 사용하면 서버와 브라우저 간연결을 유지한 상태로 데이터를 교환할 수 있다. 데이터는 패킷 형태로 전달되며, 전송은 커넥션 중단과 추가 `HTTP` 요청 없이 양방향으로 이루어진다.

이런 특징 때문에 웹소켓은 온라인 게임이나 주식 트레이딩 시스템 같이 데이터 교환이 지속적으로 이뤄져야 하는 서비스에 아주 적합하다.

## 간단한 예시

웹 소켓 커넥션을 만들려면 `new WebSocker`을 호출하면 된다. 이때 ws라는 특수 프로토콜을 사용한다.

```jsx
let socket = new WebSocket("ws://javascript.info");
```

`ws` 이외에 `wss://` 라는 프로토콜도 있다. 이 두 프로토콜의 관계는 `HTTP`와 `HTTPS`의 관계와 유사하다.

<aside> ℹ️ **항상 `wss://`를 사용하자** `wss`는 보안 이외에도 신뢰성 측명에서 좀 더 신뢰할만한 프로토콜이다.

`ws`는 암호화 되지 않기 때문에 전송시에 데이터가 그대로 노출된다. 아주 오래된 프록시 서버는 웹소켓을 인식하지 못하고 이상한 헤더가 붙은 요청이라 판단해 연결을 끊어버린다.

`wss`는 `TSL`이라는 보안 계층을 통과해 전달되므로 데이터가 암호화되고, 복호화는 수신자 측에서 이뤄지게 된다. 따라서 데이터가 담긴 패킷이 암호화된 상태로 프록시 서버를 통과하므로 프록시 서버는 패킷 내부를 볼 수 없게 된다.

</aside>

소켓이 정상적으로 만들어지면 아래 네 개의 이벤트를 사용할 수 있게 된다.

- `open` - 커넥션이 제대로 만들어 졌을 때 발생
- `message` - 데이터를 수신하였을 때 발생
- `error` - 에러가 생겼을 때 발생
- `close` - 커넥션이 종료 되었을 때 발생

커넥션이 만들어진 상태에서 데이터를 보내려면 `socket.send(data)`를 사용하면 된다:

```jsx
let socket = new WebSocket("wss://javascript.info/article/websocket/demo/hello");

socket.onopen = function(e) {
	socket.send("데이터");
}

socket.onmessage = function(event) {
	console.log("서버에서 받은 데이터: ", event.data);
}

socket.onclose = function(event) {
	if (event.wasClean) {
		console.log(`커넥션이 종료되었습니다. code=${event.code} reason=${event.reason}`);
	} else {
		// 프로세스가 죽거나 네트워크에 장애가 있는 경우
		// event.coderk 1006이 된다.
	}
}

socket.onerror = function(error) { ... };
```

## 웹소켓 핸드셰이크

`new WebSocket(url)`을 호출해 소켓을 생성하면 즉시 연결이 시작된다.

커넥션이 유지되는 동안, 브라우저는 서버에 ‘웹소켓을 지원하나요?’ 라고 물어본다. 이에 서버가 ‘네’ 라는 응답을 하면 서버-브라우저 통신은 `HTTP`가 아닌 웹 소켓 프로토콜을 사용해 진행된다.

![https://ko.javascript.info/article/websocket/websocket-handshake.svg](https://ko.javascript.info/article/websocket/websocket-handshake.svg)

`new WebSocket("wss://javascriptinfo/chat")` 을 호출해 최초 요청을 전송했다고 가정하고, 이때의 요청 헤더를 살펴보자.

```
GET /chat
Host: javascript.info
Origin: <https://javascript.info> --> 클라이언트 오리진. 웹소켓은 교차 출처를 지원
Connection: Upgrade --> 클라이언트 측에서 프로토콜을 바꾸고 싶다는 신호를 보냄
Upgrade: websocket --> 요청한 프로토콜이 웹소켓 이라는걸 의미
Sec-WebSocket-Key: Iv8io/9s+lYFgZWcXczP8Q== --> 서버가 웹 소켓을 지원하는지 확인에 사용
Sec-WebSocket-Version: 13 --> 웹 소켓 프로토콜 버전
```

<aside> ℹ️ **웹소켓 핸드셰이크는 모방이 불가능하다.** 
바닐라 자바스크립트로 헤더를 설정하는 건 기본적으로 막혀있다. 위와 유사한 헤더를 가진 HTTP 요청을 만들 수 없다.
</aside>

서버는 클라이언트 측에서 보낸 웹소켓 통신 요청을 최초로 받고 이에 동의하면, 상태 코드 101이 담긴 응답을 클라이언트에 전송한다.

```
101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: hsBlbuDTkk24srzEOTBUlZAlC2g=
```

`Sec-WebSocket-Accept` 값은 특별한 알고리즘을 통해 만든 키값이다. 이 값을 통해 브라우저는 서버가 진짜 웹소켓 프로토콜을 지원하는지 확인한다.

이렇게 핸드셰이크가 끝나면 `HTTP` 프로토콜이 아닌 웹소켓 프로토콜을 사용해 데이터가 전송되기 시작한다.

## Extensions와 Subprotocols 헤더

웹 소켓 통신은 `Sec-WebSocket-Extensions`와 `Sec-WebSocket-Protocol` 헤더를 지원한다. 두 헤더는 각각 웹소켓 프로토콜 기능을 확장할 때와 서브 프로토콜을 사용해 데이터를 전송할 때 사용한다.

- `Sec-WebSocket-Extensions: deflate-frame:` 이 헤더는 브라우저에서 데이터 압축을 지원한다는 것을 의미한다. 브라우저에 의해 자동 생성 되는데, 그 값에 데이터 전송과 관련된 무언가나 웹 소켓 프로토콜 기능 확장과 관련된 무언가가 나열된다.
    
- `Sec-WebSocket-Protocal`: `soap`, `wamp`: 이렇게 헤더가 설정되면 평범한 데이터가 아닌 `SOAP`나 `WAMP(WebSocket Application Messaging Protocol)` 프로토콜을 준수하는 데이터를 전송하겠다는 것을 의미하게 된다. 웹 소켓에서 지원하는 서브 프로토콜 목록은 [IANA 카탈로그](https://www.iana.org/assignments/websocket/websocket.xml)에서 확인할 수 있다. 개발자는 이 헤더를 보고 앞으로 사용하게 될 데이터 포맷을 확인할 수 있다.
    
- **SOAP, WAMP란**
    
    ### SOAP
    
    **SOAP**(Simple Object Access Protocol)은 일반적으로 널리 알려진 [HTTP](https://ko.wikipedia.org/wiki/HTTP), [HTTPS](https://ko.wikipedia.org/wiki/HTTPS), [SMTP](https://ko.wikipedia.org/wiki/SMTP) 등을 통해 [XML](https://ko.wikipedia.org/wiki/XML) 기반의 메시지를 컴퓨터 네트워크 상에서 교환하는 [프로토콜](https://ko.wikipedia.org/wiki/%ED%86%B5%EC%8B%A0_%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C)이다.
    
    ### WAMP(WebSocket Application Messaging Protocol)
    
    - **WAMP(Web Application Messaging Protocol)**는 라우팅 기반 프로토콜이며, 모든 컴포넌트들은 WAMP 라우터에 연결된다. 해당 라우터는 다음의 두 가지 메시징 패턴을 웹 프로토콜로 제공한다:
    
    1. **발행과 구독 (PubSub)**
        - 구독자(Subscriber)는 라우터에게 특정 주제에 대한 정보 수신을 요청한다
        - 발행자(Publisher)가 해당 주제에 대한 정보를 발행하면
        - 라우터는 등록된 모든 구독자들에게 해당 정보를 배포한다
    2. **라우팅된 원격 프로시저 호출 (rRPC)**
        - 제공자(Callee)는 라우터에게 특정 기능의 제공 가능 여부를 등록한다
        - 호출자(Caller)로부터 해당 기능에 대한 요청이 발생하면
        - 라우터는 중개자로서 제공자의 기능을 실행하고 그 결과를 호출자에게 전달한다
    
    본 프로토콜의 주목할 만한 특징은 기존 클라이언트-서버 RPC와는 달리, WAMP에서는 라우터가 중앙 통신 관리자로서의 역할을 수행한다는 점이다. 이는 우편 시스템에서 우체국이 발신인과 수신인 사이의 통신을 중계하는 방식과 유사한 구조를 지닌다.
    

두 헤더는 다음과 같이 WebSocket 생성자의 두 번째 인수를 통해 설정할 수 있다:

```jsx
let socket = new WebSocket("wss://javascript.info/chat", ["soap", "wamp"]);
```

## 데이터 전송

웹 소켓 통신은 ‘프레임’이라 불리는 데이터 조각을 사용해 이뤄진다. 양측 모두에서 보낼 수 있고 다음과 같이 분류된다:

- 텍스트 프레임: 텍스트 데이터가 담긴 프레임
- 이진 데이터 프레임: 이진 데이터가 담긴 프레임
- 핑-퐁 프레임 - 커넥션 유지 확인해 사용하는 프레임. 서버/브라우저에서 자동으로 생성해 보냄
- 커넥션 종료 프레임 등 다양한 프레임이 있음

브라우저 환경에서 개발자는 텍스트나 이진 프레임만 다루게 된다. `WebSocket.send` 메서드는 텍스트나 이진 데이터만 보낼 수 있기 때문이다.

데이터를 받을 때 텍스트는 문자열로 온다. 이진 데이터를 받을 때는 `Blob`이나 `ArrayBuffer` 포맷 둘 중 하나를 고를 수 있다.

`socket.binryType` 프로퍼티를 사용하면 `blob`이나 `arrayBuffer` 포맷 둘 중 하나를 고를 수 있는데, 기본값은 “blob”이다.

`Blob`은 고차원 이진 객체인데, `<a>`나 `<img>` 등의 태그와 바로 통합할 수 있어서 기본값으로 적절하다.

```jsx
socket.binaryType = "arraybuffer";
```

## 전송 제한

데이터 전송량이 상당한 앱을 개발하고 있다고 가정해보자. 그런데 우리 앱의 사용자는 네트워크 속도가 느린 곳에서 사용하고 있다.

앱 쪽에서 `socket.send(data)`를 계속해서 호출할 순 있다. 하지만 이렇게 하면 데이터가 메모리에 쌓일 테고 네트워크 속도가 데이터를 송신하기 충분할 때만 송신될거다.

`socket.bufferedAmount` 프로퍼티는 송신 대기 중인 버퍼가 얼마나 메모리에 쌓여있는지 바이트 단위로 보여준다. 따라서 이를 통해 다음과 같이 사용할 수 있다.

```jsx
// 100ms마다 소켓을 확인해 쌓여있는 바이트가 없는 경우에만
// 데이터를 추가 전송합니다.
setInterval(() => {
  if (socket.bufferedAmount == 0) {
    socket.send(moreData());
  }
}, 100);
```

## 커넥션 닫기

연결 주체(브라우저나 서버) 중 한쪽에서 커넥션 닫기를 원하는 경우 보통 숫자로 된 코드와 문자로 된 사유가 담긴 ‘커넥션 종료 프레임’을 전송하게 된다.

```jsx
socket.close(code, reason);
```

- `code`: 커넥션을 닫을 때 사용하는 특수 코드
- `reason`: 커넥션 닫기 사유를 설명하는 문자열

다른 한쪽에선 `close` 이벤트 핸들러를 사용해 코드와 사유를 확인할 수 있다.

```jsx
// 닫기를 요청한 주체:
socket.close(1000, "Work complete");

// 다른 주체:
socket.onclose = event => {
	// event.code === 1000
	// event.reason === "Work compelete"
};
```

가장 많이 사용하는 코드는 다음과 같다:

- 1000: 정상 종료를 의미함(code 값이 없을 때 기본 값)
- 1006 - 1000 같은 코드를 수동을 설정할 수 없을 때 사용, 커넥션이 유실 되었음을 의미함

이외에는:

- 1001: 연결 주체 중 한쪽이 떠남
- 1009: 메시지가 너무 커서 처리하지 못함
- 1011: 서버 측에서 비 정상적인 에러 발생

더 많은 목록은 [RFC6455, §7.4.1](https://tools.ietf.org/html/rfc6455#section-7.4.1)에서 확인할 수 있다. 1000보다 더 작은 숫자를 사용하면 에러가 발생한다.

## 커넥션 상태

커넥션 상태를 알고 싶다면 `socket.readState` 프로퍼티의 값을 확인하면 된다.

- 0: 연결중
- 1: 연결이 성립되고 통신 중
- 2: 커넥션 종료 중
- 3: 커넥션이 종료 됨