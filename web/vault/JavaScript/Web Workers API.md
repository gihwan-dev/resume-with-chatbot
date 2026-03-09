웹 워커는 스크립트 연산을 **웹 어플리케이션의 메인 스레드와 분리된 별도의 백그라운드 스레드**에서 실행할 수 있는 기술이다.

## 웹 워커의 개념과 활용법

워커는 자바스크립트 파일을 구동하는 객체로서 Worker() 등의 **생성자로 생성**한다. 해당 파일은 **window와는 다른 전역 맥락에서 동작하는 워커 스레드에서 실행**된다. 이 때, 전역 맥락은 전용 워커의 경우 `DedicatedWorkerGlobalScope` 객체이고, 공유 워커의 경우 `SharedWorkerGlobalScope` 객체 이다.

워커와 메인 스레드 간의 데이터 교환은 메세지 시스템을 사용한다. `postMessage()` 메서드를 사용해 전송하고, `onmessae` 이벤트 처리기를 사용해 수신한다. 전송하는 데이터는 복사하며 공유하지 않는다.

워커 역시 워커를 생성할 수 있다. 단, 생성하려는 워커가 부모 페이지와 동일한 출처에 호스팅 되어야 한다. 추가로, 워커는 `XMLHttpRequest`를 사용해 네트워크 입출력을 할 수 있지만 `responseXML`과 `channel` 특성은 항상 null을 반환한다.

전용 워커 이외의 워커는 다음과 같은 유형이 존재한다:

- 공유 워커: 워커와 도메인이 같다면, 창, Iframe 등등 여러 곳에서 작동 중인 다수의 스크립트 사용 가능한 워커이다.
- 서비스 워커: 웹 응용 프로그램, 브라우저, 네트워크 사이의 프록시 서버 역할을 한다.
- 오디오 워커: 웹 워커 컨텍스트 내에서 스크립트를 통한 직접적인 오디오 처리 능력을 제공한다.

### AbstractWorker

`AbstractWorker`는 모든 종류의 워커에 공통적인 속성과 메서드를 추상화 한다.

**프로퍼티**

- `EventTarget`: `addEvnetListenr`, `dispatchEvnet`, `removeEventListener` 같은 메서드를 가지고 있음

**메서드**

- `postMessage`: 워커의 내부 스코프로 메시지를 보낸다.
- `terminate`: 워커를 종료 시킨다. `ServiceWorker` 인스턴스는 이 메서드를 지원하지 않는다.

**이벤트**

- `error`: 워커에서 에러가 발생했을 때
- `message`: 워커의 부모로 부터 메시지를 받았을 때
- `messageerror`: 직렬화 될 수 없는 메시지를 받았을 때

## 전용 워커(Dedicated workers)

전용 워커는 워커를 생성한 자바스크립트에서만 접근 가능하다.

### 워커 사용 가능 여부 탐지하기

더 체계적인 오류 처리와 하위 호환성을 위해, worker 접근 코드를 아래처럼 래핑하는게 좋다.

```jsx
if (window.Worker) {
	// ...
}
```

### 전용 워커 스폰(Spawning)하기

새로운 워커를 만드는 것은 간단하다. Worker() 생성자를 호출하고 실행할 스크립트의 URI를 특정해 주면 된다.

```jsx
const myWorker = new Worker("worker.js");
```

<aside> ℹ️

**Note:** Webpack, Vite 같은 번들러들은 아래와 같이 `import.meta.url` 경로에 대해 상대적인 경로를 Worker() 생성자에 전달하는 것을 추천한다. 예를들어:

```jsx
const myWorker = new Worker(new URL("worker.js", import.meta.url));
```

이렇게 하면 HTML 페이지가 아닌 스크립트에 대해 상대적인 경로를 가지게 되고, 번들러가 최적화를 안전하게 할 수 있게 된다(파일 이름을 변경하는 것과 같은).

</aside>

### 전용 워커(Dedicated Worker)와 메시지 주고 받기

`postMessage` 메서드와 `onmessage` 이벤트 핸들러를 사용해 전용 워커와 메시지를 주고 받을 수 있다.

```jsx
first.onchange = () => {
	myWorker.postMessage([first.value, second.value]);
	console.log("워커에게 메세지를 보냈습니다.");
}

second.onchange = () => {
	myWorker.postMessage([first.value, second.value]);
	console.log("워커에게 메세지를 보냈습니다.");
}
```

위 코드는 `onchange` 이벤트가 발생하면 first와 second의 value가 워커에게 배열의 형태로 전달되게 된다. 워커에서는 이벤트 핸들러를 통해 메세지를 전달받을 수 있다:

```jsx
onmessage = (e) => {
	console.log("메인 스크립트에서 메세지를 받았습니다.");
	const 결과 = `결과: ${e.data[0]}, ${e.data[1]}`;
	console.log("메시지를 다시 메인 스크립트로 보냅니다.");
	postMessage(결과);
}
```

이 메시지 역시 `onmessage` 이벤트를 통해 수신할 수 있다:

```jsx
내_워커.onmessage = (e) => {
	result.textContent = e.data;
	console.log("워커로 부터 메세지를 전달 받았습니다.");
}
```

<aside> ℹ️

**Note**: `onmessage`와 `postMessage`는 메인 스레드에서 사용 될때는 `Worker` 인스턴스의 메서드를 사용해야 하고, 워커 스크립트에서는 그럴 필요가 없다. 워커가 전역 스코프이기 때문이다.

</aside>

<aside> ℹ️

**Note**: 메세지가 워커와 스레드를 오갈 때 복사되어 전송된다. 공유되지 않는다.

</aside>

### 워커 종료하기

메인 스레드에서 워커를 즉시 종료해야 하는 상황이라면 `terminate` 메서드를 사용할 수 있다:

```jsx
myWorker.terminate();
```

### 에러 핸들링

워커에서 런타임 에러가 발생하면 `onerror` 이벤트 핸들러가 호출된다. `ErrorEvent` 인터페이스를 가지는 `error`를 인자로 받는다.

이벤트는 버블링되지 않고, 취소할 수 있다. 기본 동작이 실행되는 것을 막으려면 `preventDefault()` 메서드를 호출하면 된다.

오류 이벤트는 다음과 같은 세 가지 주요 필드가 있다:

- `message`: 사람이 읽을 수 있는 오류 메시지
- `filename`: 오류가 발생한 스크립트 파일의 이름
- `lineno`: 오류가 발생한 스크립트 파일의 줄 번호

### 서브워커 스폰하기(Spawning)

워커가 워커(서브 워커)를 생성할 수 있다. 이러한 서브워커는 부모 페이지와 동일한 원본에서 생성되어야 한다. 또한, 서브워커의 URI는 부모 워커 위치에 상대적 경로여야 한다. 이는 워커들간의 종속성을 추적하기도 쉽게 해준다.

### 스크립트와 라이브러리 임포트하기

워커 스레드에서 스크립트를 불러오기 위해 전역 함수인 `importScripts()`를 사용할 수 있다. 0개 이상의 `URI` 문자열을 입력으로 받는다.

```jsx
importScripts(); /* imports nothing */
importScripts("foo.js"); /* imports just "foo.js" */
importScripts("foo.js", "bar.js"); /* imports two scripts */
importScripts(
  "//example.com/hello.js",
); /* You can import scripts from other origins */
```

브라우저는 각 스크립트를 불러와서 실행시킨다. 실행 결과로 생성된 전역 객체는 워커에 의해 사용될 수 있다.

만약 스크립트를 불러올 수 없다면 `NETWORK_ERROR`를 던지고, 이후 존재하는 코드들은 실행되지 않는다.

에러 이전까지 실행된 코드와, `importScripts()` 이후에 선언된 함수(함수 객체는 코드 실행 이전 평가 단계에서 생성되기 때문)들 또한 여전히 유지된다.

<aside> ℹ️

**Note**: 스크립트의 **다운로드 순서는 보장되지 않는다.** 다만 실행 순서는 `importScripts()`에 **나열된 파일 경로의 순서대로 보장**된다. 이 실행들은 동기적으로 일어난다. 매개변수에 있는 모든 스크립트가 다운로드 되고 실행되기 전까지 `importScripts`는 아무것도 반환하지 않는다.

</aside>

## 공유 워커

공유 워커는 여러 스크립트에서 접근할 수 있다. 심지어 다른 윈도우, iframe, 워커 등에서도 접근할 수 있다. 전용 워커(Dedicated Worker)와 비슷하게 사용할 수 있지만, 다른 차이점이 있다.

공유 워커와 전용 워커의 차이점에 대해 집중하며 살펴보자. 아래 예제에서는 두 HTML 페이지와 하나의 동일한 자바스크립트 워커 파일을 적용한다.

<aside> ℹ️

**Note**: 어떤 공유 워커를 여러 브라우저 컨텍스트에서 이용하기 위해서는, 브라우저 컨텍스트들이 똑같은 원본을 가지고 있어야 한다(같은 프로토콜, 호스트, 포트).

</aside>

<aside> ℹ️

**Note**: 파이어폭스에서, private과 non-private 윈도우끼리 공유 워커를 공유할 수 없다.

</aside>

### 공유 워커 스폰하기(Spawning)

공유 워커를 생성하는 것은 전용 워커와 비슷하다. 다만 생성자 명이 다를 뿐이다.

```jsx
const myWorker = new SharedWorker("worker.js");
```

하나의 큰 차이점은 공유 워커에서는 `port` 객체를 통해 통신해야 한다는 점이다. 스크립트가 공유 워커와 통신하기 위해서는 **명시적으로 포트를 열어야 한다(전용 워커에서는 이 과정이 암시적으로 이루어진다).**

메시지를 주고받기 전에 포트 연결을 시작해야 하는데, 이는 `onmessage` 이벤트 핸들러를 사용하여 암시적으로 하거나 `start()` 메서드를 통해 명시적으로 할 수 있다.

`start()` 메서드 호출이 필요한 경우는 `addEventListener()` 메서드를 통해 `message` 이벤트를 연결했을 때 뿐이다.

<aside> ℹ️

**Note:** 포트 연결을 위해 `start()` 메서드를 호출할 때, 만약 양방향 통신이 필요하다면 부모와 자식 워커 모두에서 `start()`를 호출해줘야 한다.

</aside>

### 공유 워커와 메세지 주고받기

`port` 객체를 사용해 `postMessage` 메서드를 호출하면 메세지를 워커에게 보낼 수 있다.

```jsx
어떤_요소.onchange = () => {
	제곱_연산_수행_공유워커.port.postMessage([어떤_요소.value, 어떤_요소.value]);
	console.log("공유워커에 메세지를 보냈습니다.");
}
```

이제 워커에서 메세지를 받아보자. 전용 워커보단 조금 복잡하다.

```jsx
onconnect = (e) => {
	const 포트 = e.ports[0];
	
	포트.onmessage = (e) => {
		const 결과 = `결과: ${e.data[0] * e.data[1]}`;
		포트.postMessage(결과);
	}
}
```

첫번째로, 포트가 연결되면 발생되는 핸들러를 `onconnect` 이벤트에 등록한다(부모에서 `onmessage` 이벤트 핸들러를 등록한 경우 또는 부모에서 start() 메서드가 호출된 경우).

이벤트 객체의 `port` 프로퍼티를 사용해 만들어진 포트를 사용할 수 있다.

`port`객체의 `onmessage` 핸들러를 사용해 데이터를 전달받고 어떤 연산을 수행할 수 있다. `onmessage` 이벤트를 등록하면 `start()` 메서드가 암묵적으로 호출된다.

그리고 `port`의 `postMessage`를 사용해 부모 스레드에 데이터를 전달할 수 있다.

마지막으로 메인 스크립트에서 자식 공유 워커가 보내는 메세지를 다음과 같이 받을 수 있다:

```jsx
myWorker.port.onmessage = (e) => {
	result2.textContent = e.data;
	console.log("공유워커로부터 메세지를 전달받았습니다.");
}
```

## 스레드 안정성

워커 인터페이스는 실제 OS 수준의 스레드를 생성하기 때문에, 코드에서 동시성으로 인한 “예기치 않은” 영향이 발생할 수 있다는 점을 걱정할 수 있다.

하지만 웹 워커는 **다른 스레드와의 통신 지점이 세심하게 통제**되기 때문에, **동시성 문제를 일으키기는 매우 어렵다.** 스레드는 안전하지 않은 컴포넌트나 DOM에 대한 접근이 불가능하며, 스레드 간에 데이터를 주고받을 때는 반드시 직렬화 되어야 한다.

## 컨텐츠 보안 정책

워커는 문서화 구별된 **자기들 만의 실행 컨텍스트를 가진다.** 그렇기에 워커들은 **문서로 부터 생성된 컨텐츠 보안 정책의 영향을 받지 않는다.** 예를들어 문서가 다음과 같은 헤더와 함께 제공되었다고 하면:

```jsx
Content-Security-Policy: script-src 'self'
```

포함된 스크립트가 `eval()`을 사용하는 것을 방지한다. 하지만 이 스크립트가 워커를 실행하면, 해당 워커에서는 `eval()`을 사용할 수 있다.

워커의 보안 정책을 설정하고 싶다면, 워커의 스크립트 파일을 서버에서 제공할 때 응답에 `Content-Security-Policy` 헤더를 포함시켜야 한다.

예외적인 경우는 워커 스크립트의 출처가 전역적으로 고유한 식별자일 때이다(예: `URL`의 스키마가 `data`나 `blob`인 경우). 이 경우 워커가 자신을 생성한 문서나 워커의 `CSP`를 상속받는다.

## 워커와 데이터 주고 받기: 세부 사항

워커와 페이지의 데이터 전송은 공유되지 않고 복사된다. 객체는 워커에게 전달될 때 직렬화 되고, 수신측에서 다시 역직렬화 된다.

페이지와 워커는 동일한 인스턴스를 공유하지 않기 때문에 결국엔 각각의 끝단에서 복제본이 생성된다. 대부분의 브라우저는 이 기능을 **구조적 복제(structured cloning)로 구현**하고 있다.

이를 설명하기 위해, 워커에서 메인 페이지로 혹은 그 반대로 전달되는 과정에서 공유되지 않고 복제되는 값의 동작을 시물레이션하는 `emulateMessage()`라는 함수를 만들어보자.

```jsx
function emulateMessage(vVal) {
  return eval(`(${JSON.stringify(vVal)})`);
}

// Tests

// test #1
const example1 = new Number(3);
console.log(typeof example1); // object
console.log(typeof emulateMessage(example1)); // number

// test #2
const example2 = true;
console.log(typeof example2); // boolean
console.log(typeof emulateMessage(example2)); // boolean

// test #3
const example3 = new String("Hello World");
console.log(typeof example3); // object
console.log(typeof emulateMessage(example3)); // string

// test #4
const example4 = {
  name: "Carina Anand",
  age: 43,
};
console.log(typeof example4); // object
console.log(typeof emulateMessage(example4)); // object

// test #5
function Animal(type, age) {
  this.type = type;
  this.age = age;
}
const example5 = new Animal("Cat", 3);
alert(example5.constructor); // Animal
alert(emulateMessage(example5).constructor); // Object
```

복제되고 공유되지 않는 값을 메시지라고 한다. 메시지는 `postMessage()` 메서드를 사용해 메인 스레드와 주고받을 수 있으며, `message` 이벤트의 `data` 속성에는 워커로부터 전달받은 데이터가 포함된다.

## 데이터 전송 예제

### 예제 1: 고급 `JSON` 데이터 전달 기법과 스위칭 시스템 만들기

메인페이지와 워커 사이에서 복잡한 데이터를 전달하고, 다른 여러 함수들을 호출해야 하는 경우, 모든 것을 하나로 묶는 시스템을 만들 수 있다.

먼저 워커의 `URL`, 기본 리스너, 오류 핸들러를 받는 `QueryableWorker` 클래스를 만든다. 이 클래스는 리스너들의 목록을 관리하고 워커와의 통신을 도와줄 것이다.

```jsx
function QueryableWorker(url, defaultListener, onError) {
	const instance = this;
	const worker = new Worker(url);
	const listeners = {};
	
	this.defaultListener = defaultListener ?? (() => {});
	
	if (onError) {
		worker.onerror = onError;
	}
	
	this.postMessage = (message) => {
		worker.postMessage(message);
	};
	
	this.terminate = () => {
		worker.terminate();
	};
}
```

이제 리스너를 추가/제거 하는 메서드를 추가한다.

```jsx
this.addListeners = (name, listener) => {
	listeners[name] = listener;
};

this.removeListeners = (name) => {
	delete listeners[name];
};
```

설명을 위해 워커가 두 가지 간단한 작업을 처리하도록 하자:

- 두 숫자의 차이를 구하는 것
- 3초 후에 알림을 표시하는 것

이를 구현하기 위해 먼저 워커가 우리가 원하는 작업을 수행할 수 있는 메서드를 실제로 가지고 있는지 확인하는 `sendQuery` 메서드를 구현한다.

```jsx
this.sendQuery = (queryMethod, ...queryMethodArguments) => {
	if (!queryMethod) {
		throw new TypeError(
			"QueryWorker.sendQuery는 최소 하나의 인수를 입력받아야 합니다."
		);
	}
	worker.postMessage({
		queryMethod,
		queryMethodArguments,
	})
}
```

`QueryableWorker`를 이제 `onmessage` 메서드로 마무리하자. 만약 워커가 우리가 요청한 해당 메서드를 가지고 있다면, 그에 맞는 리스너의 이름과 필요한 인자들을 반환해야 한다. 우리는 단지 `listeneres`에서 이를 찾기만 하면 된다:

```jsx
worker.onmessage = (event) => {
	if (
		event.data instanceof Object &&
		Object.hasOwn(event.data, "queryMethodListener") &&
		Object.hasOwn(event.data, "queryMethodArguments")
	) {
		listeners[event.data.queryMethodListener].apply(
			instance,
			event.data.queryMethodArguments,
		);
	} else {
		this.defaultListener.call(instance, event.data);
	}
}
```

이제 워커로 가보자. 우선 지금 우리는 간단한 연산을 하는 메서드가 필요하다:

```jsx
const queryableFunctions = {
	getDifference(a, b) {
		reply("printStuff", a - v);
	},
	waitSomeTime() {
		setTimeout(() => {
			reply("doAlert", 3, "seconds");
		}, 3000);
	},
};

function reply(queryMethodListener, ...queryMethodArguments) {
	if (!queryMethodListener) {
		throw new TypeError("reply - takes at least one argument");
	}
	postMessage({
		queryMethodListener,
		queryMethodArguments,
	});
}

function defaultReply(message) {
	// do something
}
```

`onmessage` 메서드는 다음과 같이 작성할 수 있다:

```jsx
onmessage = (event) => {
	if (
		event.data instanceof Object &&
		Object.hasOwn(event.data, "queryMethod") &&
		Object.hasOwn(event.data, "queryMethodArguments")
	) {
		queryableFuntions[event.data.queryMethod].apply(
			self,
			event.data.queryMethodArguments,
		)
	} else {
		defaultReply(event.data);
	}
}
```

전체 코드

**main.js**

```html
// main.js
<!doctype html>
<html lang="en-US">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>MDN Example - Queryable worker</title>
    <script type="text/javascript">
      function QueryableWorker(url, defaultListener, onError) {
        const instance = this;
        const worker = new Worker(url);
        const listeners = {};

        this.defaultListener = defaultListener ?? (() => {});

        if (onError) {
          worker.onerror = onError;
        }

        this.postMessage = (message) => {
          worker.postMessage(message);
        };

        this.terminate = () => {
          worker.terminate();
        };

        this.addListener = (name, listener) => {
          listeners[name] = listener;
        };

        this.removeListener = (name) => {
          delete listeners[name];
        };

        // This functions takes at least one argument, the method name we want to query.
        // Then we can pass in the arguments that the method needs.
        this.sendQuery = (queryMethod, ...queryMethodArguments) => {
          if (!queryMethod) {
            throw new TypeError(
              "QueryableWorker.sendQuery takes at least one argument",
            );
          }
          worker.postMessage({
            queryMethod,
            queryMethodArguments,
          });
        };

        worker.onmessage = (event) => {
          if (
            event.data instanceof Object &&
            Object.hasOwn(event.data, "queryMethodListener") &&
            Object.hasOwn(event.data, "queryMethodArguments")
          ) {
            listeners[event.data.queryMethodListener].apply(
              instance,
              event.data.queryMethodArguments,
            );
          } else {
            this.defaultListener.call(instance, event.data);
          }
        };
      }

      const myTask = new QueryableWorker("my_task.js");

      myTask.addListener("printStuff", (result) => {
        document
          .getElementById("firstLink")
          .parentNode.appendChild(
            document.createTextNode(`The difference is ${result}!`),
          );
      });

      myTask.addListener("doAlert", (time, unit) => {
        alert(`Worker waited for ${time} ${unit} :-)`);
      });
    </script>
  </head>
  <body>
    <ul>
      <li>
        <a
          id="firstLink"
          href="javascript:myTask.sendQuery('getDifference', 5, 3);"
          >What is the difference between 5 and 3?</a
        >
      </li>
      <li>
        <a href="javascript:myTask.sendQuery('waitSomeTime');"
          >Wait 3 seconds</a
        >
      </li>
      <li>
        <a href="javascript:myTask.terminate();">terminate() the Worker</a>
      </li>
    </ul>
  </body>
</html>

```

**my_task.js**(worker)

```jsx
const queryableFunctions = {
  // example #1: get the difference between two numbers:
  getDifference(minuend, subtrahend) {
    reply("printStuff", minuend - subtrahend);
  },

  // example #2: wait three seconds
  waitSomeTime() {
    setTimeout(() => {
      reply("doAlert", 3, "seconds");
    }, 3000);
  },
};

// system functions

function defaultReply(message) {
  // your default PUBLIC function executed only when main page calls the queryableWorker.postMessage() method directly
  // do something
}

function reply(queryMethodListener, ...queryMethodArguments) {
  if (!queryMethodListener) {
    throw new TypeError("reply - not enough arguments");
  }
  postMessage({
    queryMethodListener,
    queryMethodArguments,
  });
}

onmessage = (event) => {
  if (
    event.data instanceof Object &&
    Object.hasOwn(event.data, "queryMethod") &&
    Object.hasOwn(event.data, "queryMethodArguments")
  ) {
    queryableFunctions[event.data.queryMethod].apply(
      self,
      event.data.queryMethodArguments,
    );
  } else {
    defaultReply(event.data);
  }
};

```

이제 메인페이지 → 워커와 워커 → 메인 페이지 사이에서 주고 받는 각 메시지의 내용을 스위치 할 수 있다.

### 소유권 이전을 통한 데이터 전달 (전송 가능 객체)

최신 브라우저들은 특정 유형의 객체를 워커와 주고받을 때 고성능으로 처리할 수 있는 추가적인 방법을 제공한다.

전송 가능 객체는 **복사 없이 한 컨텍스트에서 다른 컨텍스트로 이전**되며, 이는 대용량 데이터 세트를 전송할 때 큰 성능 향상을 가져온다.

예를들어, 메인 앱에서 워커 스크립트로 `ArrayBuffer`를 전송할 때, 원본 `ArrayBuffer`는 비워지고 더 이상 사용할 수 없게 된다. 그 내용은 워커 컨텍스트로 이전된다.

```jsx
// 32MB 크기의 파일 생성
const uInt8Array = new Unit8Array(1024 * 1024 * 32).map((v, i) => i);
worker.postMessage(uInt8Array.buffer, [uInt8Array.buffer]);
```

## 임베디드 워커

웹 페이지 내에 워커의 코드를 일반 스크립트의 `<script>` 요소처럼 포함시키는 “공식적인” 방법은 없다.

하지만 `src` 속성이 없고 실행 가능한 `MIME` 타입이 아닌 `type` 속성을 가진 `<script>` 요소는 자바스크립트가 사용할 수 있는 데이터 블록 요소로 간주될 수 있다.

“데이터 블록”은 어떤 텍스트 형태의 데이터도 포함할 수 있는 `HTML`의 일반적인 기능이다. 따라서 워커는 다음과 같이 임베디드 될 수 있다:

```html
<html>
	<head>
		...
		<script type="text/js-worker">
			// 이 스크립트는 JS 엔진에 의해 파싱되지 않음. MIME타입이 text/js-worker라서
			const myVar = "Hello World";
			
			onmessage = (vent) => {
				postMessage(myVar);
			}
		</script>
		<script>
			const blob = new Blob(
				Array.prototype.map.call(
					document.querySelectorAll("script[type='text\\/js-worker']"),
					(script) => script.textContent,
				),
				{ type: "text/javascript" },
			);
			
			document.worker = new Worker(window.URL.createObjectURL(blob));
			
			document.worker.onmessage = (event) => {
				...
			}
			
			window.onload = () => {
				document.worker.postMessage("");
			};
		</script>
	</head>
</html>
```

또는 함수를 `Blob`으로 변환한 다음 해당 `blob`에서 객체 `URL`을 생성할수도 있다:

```jsx
function fn2workerURL(fn) {
	const blob = new Blob([`(${fn.toString()})()`], { type: "text/javascript" });
	return URL.createObjectURL(blob);
}
```

## 추가적인 사용 예시

이 예제에 서는 웹 워커의 사용에 대한 더 많은 예시를 제공한다.

### 백그라운드에서 연산 처리하기

워커는 독립적인 스레드를 사용하기에 메인 스레드를 점유하지 않는다. 그렇기에 렌더링을 블로킹 하지 않아, 메인 스레드를 긴 시간 블로킹 할 수 있는 무거운 연산을 수행하는데 적합하다.

### 작업들을 여러개의 워커로 나누어 처리하기

멀티코어 기기의 보급이 일반적이어졌다. 따라서 복잡하고 무거운 연산을 여러개의 워커로 나누어 처리하는 것은 매우 유용하다.

## 워커에서 사용할 수 있는 인터페이스와 함수들

대부분의 자바스크립트 기능들을 워커에서 사용할 수 있다:

- `Navigator`
- `fetch`
- `Array`, `Date`, `Math`, `String`
- `setTimeout`과 `setInterval`

할 수 없는 것을 주로 부모 페이지에 영향을 주는 작업이다. `DOM` 조작이나 부모 페이지의 객체를 조작하는 것들이 있다.