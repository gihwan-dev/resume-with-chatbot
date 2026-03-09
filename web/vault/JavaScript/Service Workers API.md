# 서비스 워커 사용하기

서비스 워커를 어떻게 사용할 수 있고, 어떤 아키텍쳐로 구성되어 있는지 등에 대해 알아보자.

## 서비스 워커의 전제

웹 사용자들이 수년간 겪어온 가장 큰 문제 중 하나는 연결 끊김 현상이다. 아무리 뛰어난 웹 앱이라도 다운로드 할 수 없다면 UX에 큰 영향을 끼치게 된다.

많은 부분에서 개선되어 오고 있지만 가장 큰 문제는 애셋 캐싱과 커스텀 네트워크 요청을 위한 전반적인 매커니즘의 부재다.

서비스 워커는 이러한 문제를 해결한다. 서비스 워커를 사용하면 앱이 먼저 캐시된 애셋을 사용하도록 할 수 있다. 그렇게 하면 오프라인 상태에서도 기본적인 경험을 제공하고, 이후 더 많은 데이터를 가져오도록 할 수 있다(이를 “오프라인 퍼스트”라고 한다).

서비스 워커는 프록시 서버처럼 작동하여 요청과 응답을 수정하고 자체 캐시의 항목으로 대체할 수 있게 해준다.

## 서비스 워커를 사용하기 위한 설정

모든 현대 브라우저에서는 기본적으로 서비스워커를 사용할 수 있다. 서비스 워커를 실행하려면 기본적으로 `HTTPS` 환경이어야 한다. 개발 환경을 위해 브라우저는 `localhost`도 안전한 출처로 간주한다.

## 기본 구조

서비스 워커에서 주로 다음 단계가 기본 셋업이다:

1. 서비스 워커 코드가 `fetch`되고 `serviceWorkerContainer.register()`를 이용해 등록된다. 만약 성공적이라면, 서비스 워커는 `ServiceWorkerGloblScope` 환경에서 실행된다. 이제 서비스 워커는 이벤트를 처리할 수 있다.
2. 설치 단계가 시작된다. `install` 이벤트는 항상 서비스 워커에 전송되는 첫 번째 이벤트다. 이 단계에서 앱은 오프라인 사용을 위해 필요한 모든 것들을 준비한다.
3. `install` 이벤트 핸들러 작업이 완료되면 서비스 워커가 설치된 것으로 간주한다. 이전 버전의 서비스 워커가 활성화 되고 페이지를 연다. 새로운 버전의 서비스 워커는 활성화 되지 않는다.
4. 이전 버전의 서비스 워커가 제어하던 모든 페이지가 닫히면, 이전 버전을 제거해도 안전해지고 새로 설치된 서비스 워커는 `activate` 이벤트를 받는다.
    1. `activate`의 주요 용도는 이전 버전의 서비스 워커에서 사용된 리소스를 정리하는 것이다.
    2. 새 서비스 워커는 `skipWaiting()`을 호출해 열린 페이지들이 닫히기를 기다리지 않고 즉시 활성화되도록 요청할 수 있다.
    3. 그러면 새 서비스 워커는 즉시 `activate` 이벤트를 받고 열린 페이지들을 제어하게 된다.
5. 활성화 된 후, 서비스 워커는 페이지들을 제어하게 되지만, `register()`가 성공한 후에 열린 페이지들만 해당된다. 즉, 문서는 서비스 워커의 유무와 함께 시작되어 그 상태를 수명이 다할 때까지 유지하므로, 실제로 제어되기 위해서는 문서를 다시 로드해야 한다.
6. 새 버전의 서비스 워커가 가져와질 때 마다 이 주기가 다시 발생하며, 이전 버전의 잔여물은 새 버전의 활성화 중에 정리된다.

![[Pasted image 20250103093951.png]]

사용 가능한 서비스 워커 이벤트 들:

- `install`
- `activate`
- `message`
- Functional events
    - `fetch`
    - `sync`
    - `push`

## 데모

직접 간단한 서비스 워커를 작성해보자.

### 워커 등록하기

다음 코드는 서비스 워커를 등록하는 코드다.

```jsx
const registerServiceWorker = async () => {
	if ("serviceWorker" in navigator) {
		try {
			const registration = await navigator.serviceSorker.register("/sw.js", {
				scope: "/",
			});
			
			if (registration.installing) {...}
			if (registration.waiting) {...}
			if (registration.active) {...}
		} catch (error) {
			...
		}
	}
};

registerServiceWorker();
```

1. `if`문에서 등록 상태를 체크할 수 있다.
2. `register()`를 호출하면 이 사이트를 위한 서비스 워커를 등록한다. 이 파일의 `URL`은 출처에 대해 상대적 경로여야 한다. 이를 호출하는 `JS` 파일이 아니라.
3. `scope` 파라미터를 통해 서비스 워커가 제어할 수 있는 컨텐츠를 좁혀줄 수 있다. “/”는 모든 컨텐츠를 말한다. 만약 비워둔다면, 이 값이 기본값으로 사용된다.

하나의 서비스 워커는 여러 페이지를 제어할 수 있다. 서비스 워커의 범위 내에서 페이지가 로드될 때마다, 서비스 워커가 해당 페이지에 대해 설치되고 작동하게 된다.

따라서 서비스 워커 스크립트에서 전역 변수를 사용할 때는 주의해야 한다. 각 페이지마다 고유한 워커가 할당되는 것이 아니기 때문이다.

### 왜 서비스 워커 등록이 실패하는 걸까?

- `HTTPS`가 아닌 경우
- 서비스 워커에 대한 경로가 정확하지 않은 경우 - 예를들어 [`https://abs.com/sw.js`에](https://abs.com/sw.js%EC%97%90) 서비스 워커가 있다면, `https://abs.com/` 이 앱의 루트다. 이 경우 `/sw.js` 로 작성되어야 한다
- 다른 출처의 서비스 워커를 등록하는 경우
- 서비스 워커의 스코프 내에서 클라이언트가 요청을 하지 않는 경우
- 서비스 워커의 최대 스코프는 서비스 워커가 존재하는 위치다. 만약 `/js/sw.js` 에 존재한다면, `/js` 가 최대 스코프가 된다
- 파이어 폭스에서 유저가 `private` 모드에 있다면 서비스 워커를 사용할 수 없다
- 크롬에서, “Block all cookies (not recomended)” 옵션이 활성화 되어 있다면, 서비스 워커의 등록이 실패한다

### 설치와 활성화: 캐시 채우기

서비스 워커가 등록되고 나면, 브라우저는 페이지/사이트를 위한 서비스 워커를 설치하고 활성화 하려고 한다.

서비스 워커의 설치 또는 업데이트에 `install` 이벤트가 먼저 발생한다. 주로 오프라인에서 앱을 실행하기 위해 필요한 캐시들을 채우기 위해 사용한다. 이를 위해, 서비스 워커의 스토리지 API인 `cache` 전역 객체를 사용할 수 있다.

`install` 이벤트를 다루는 예제다:

```jsx
const addResourcesToCache = async (resources) => {
	const cache = await cache.open("v1");
	await cache.addAll(resources);
}

self.addEventListener("install", (event) => {
	event.waitUntil(
		addResourcesToCache([
			"/",
			"/index.html",
			"/style.css",
			"/app.js",
			"/image-list.js",
			"/star-wars-logo.jpg",
			"/gallery/bountyHunters.jpg",
			"/gallery/myLittleVader.jpg",
			"/gallery/snowTroopers.jpg",
		]),
	);
});
```

1. `install` 이벤트 리스너를 서비스 워커에 등록하고 있다. 그리고 `ExtendableEvent.waitUntil()` 메서드를 호출하고 있다. 이는 `waitUntil()` 내부의 호출이 성공적으로 완료될 때 까지 서비스워커를 설치하지 않는다.
2. `addResourcesToCache()` 함수에서 `caches.open()` 메서드를 사용하고 있다. 이는 `v1`이라고 불리는 새로운 `cache`를 생성한다. 이는 리소스의 첫 번째 버전이 된다. 그리고 `addAll` 메서드를 호출하는데 캐싱 하고 싶은 리소스들의 `URL`들을 배열로 입력 받아 캐싱한다.
3. 만약 `Promise`가 `reject` 되면(즉, 설치가 실패하면) 워커는 아무것도 하지 않는다. 이는 괜찮다. 코드를 고치고 다음 기회가 있다.
4. 설치가 성공적으로 끝나면, 서비스 워커가 활성화된다. 첫 설치/활성화 때는 특별한 의미가 없지만, 서비스 워커를 업데이트 할 때 중요해진다.

### 요청에 대한 사용자 정의 응답

이제 사이트의 애셋을 캐시했다. 이제 서비스 워커에게 캐시된 컨텐츠로 무언갈 하라고 얘기해야 한다. 이는 `fetch` 이벤트를 통해 일어난다.

1. `fetch` 이벤트는 서비스 워커에 의해 제어되는 리소스가 `fetch` 될 때 마다 일어난다.
    
2. 서비스 워커에서 `fetch` 이벤트 리스너를 등록할 수 있다. 그리고 `respondWith()` 메서드를 사용해 `HTTP` 응답을 인터셉트 할 수 있다.
    
    ```jsx
    self.addEventListener("fetch", (event) => {
    	event.respondWith(/*커스텀 컨텐츠*/);
    });
    ```
    
3. 이를 사용해 아래와 같이 `URL`을 기반으로 캐시된 데이터를 반환하게 할 수 있다:
    
    ```jsx
    self.addEventListener("fetch", (event) => {
    	event.respondWith(caches.match(event.request));
    });
    ```
    

`caches.match(event.request)`는 각 리소스의 네트워크 요청이 캐시되어 있는지 확인하고, 캐시된 값을 사용하도록 해준다. 이 확인 절차는 `URL`과 다양한 헤더들을 통해 이루어지고, 응답은 일반적인 `HTTP`와 같은 방식으로 동작한다.

![[Pasted image 20250103094005.png]]
### 실패한 요청 리커버리 하기

만약 매치된 요청이 없다면 어떻게 해야할까? 일반적인 요청을 시도하게 되돌릴 수 있다:

```jsx
const cacheFirst = async (request) => {
	const responseFromCache = await caches.match(request);
	if (responseFromCache) {
		return responseFromCache;
	}
	return fetch(request);
};

self.addEventListener("fetch", (event) => {
	event.respondWith(cacheFirst(event.request));
});
```

조금 더 전략적으로, 캐시가 없으면 요청을 하고 그 값을 다시 캐싱 할수도 있다:

```jsx
const putInCache = async (request, response) => {
	const cache = await caches.open("v1");
	await cache.put(request, resposne);
};

const cacheFirst = async (request) => {
	const responseFromCache = await caches.match(request);
	if (responseFromCache) {
		return responseFromCache;
	}
	const responseFromNetwork = await fetch(request);
	putInCache(request, responseFromNetwork.clone());
	return responseFromNetwork;
};

self.addEventListener("fetch", (event) => {
	event.respondWith(cacheFirst(event.request));
});
```

네트워크 응답은 딱 한번만 읽을 수 있기 때문에 복사 하는게 필수다. 그리고 `putInCache`의 경우 `await` 하고있지 않은데, 이는 굳이 기다릴 필요가 없기 때문이다.

이제 남은건 캐시에도 없고, 네트워크 요청도 실패하는 경우다. 이런 경우를 위해 기본으로 사용되는 값을 추가해보자. 최소한 유저가 무언가를 받기라도 하도록 할 수 있다:

```jsx
const putInCache = async (request, response) => {
	const cache = await caches.open("v1");
	await cache.put(request, response);
};

const cacheFirst = async ({ request, fallbackUrl }) => {
	const responseFromCache = await caches.match(request);
	if (responseFromCache) {
		return responesFromCache;
	}
	
	try {
		const responseFromNetwork = await fetch(request);
		
		putInCache(request, responseFromNetwork.clone());
		return responseFromNetwork;
	} catch (error) {
		const fallbackResponse = await caches.match(fallbackUrl);
		if (fallbackResponse) {
			return fallbackResponse;
		}
		
		return new Response("Network error happened", {
			status: 408,
			headers: { "Content-Type": "text/plain" },
		});
	}
};

self.addEventListener("fetch", (event) => {
	event.respondWith(
		cacheFirst({
			request: event.request,
			fallbackUrl: "/gallery/myLittleVader.jpg",
		});
	);
});
```

## 서비스 워커 네이게이션 프리로드(preload)

네비게이션 프리로드 기능이 활성화되면, 서비스 워커 활성화와 동시에 병렬적으로 리소스 다운로드를 시작한다. 이는 페이지에 네비게이션 하자마자 다운로드가 시작 되도록 해준다. 즉 페이지의 렌더링이 서비스 워커의 활성화를 기다리지 않는다.

다음과 같이 활성화 할 수 있다:

```jsx
self.addEventListener("activate", (event) => {
	event.waitUntil(self.registration?.navigationPreload.enable());
});
```

위 기능을 예제에 추가해보자. 캐시 체크 이후와 네트워크 요청 사이에 `preload` 리소스 요청을 확인하고 반환하는 코드를 추가하자.

```jsx
const putInCache = async (request, response) => {
	const cache = await caches.open("v1");
	await cache.put(request, response);
};

const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
	const responseFromCache = await caches.match(request);
	if (responseFromCache) {
		return responesFromCache;
	}
	
	// ---------------추가된 부분---------------
	const preloadResponse = await preloadResponsePromise;
	
	if (preloadResponse) {
		putInCache(request, preloadResponse.clone());
		return preloadResponse;
	}
	// ---------------추가된 부분---------------
	
	try {
		const responseFromNetwork = await fetch(request);
		
		putInCache(request, responseFromNetwork.clone());
		return responseFromNetwork;
	} catch (error) {
		const fallbackResponse = await caches.match(fallbackUrl);
		if (fallbackResponse) {
			return fallbackResponse;
		}
		
		return new Response("Network error happened", {
			status: 408,
			headers: { "Content-Type": "text/plain" },
		});
	}
};

self.addEventListener("fetch", (event) => {
	event.respondWith(
		cacheFirst({
			request: event.request,
			preloadResponsePromise: event.preloadResponse,
			fallbackUrl: "/gallery/myLittleVader.jpg",
		});
	);
});
```

## 서비스워커 업데이트 하기

만약 서비스 워커가 설치된 이후, 새로고침과 같은 이유로 새로운 버전의 워커가 생성 되었다면 기존의 캐시를 업데이트 하고 싶을 수 있다.

```jsx
const addResourcesToCache = async (resources) => {
  const cache = await caches.open("v2");
  await cache.addAll(resources);
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    addResourcesToCache([
      "/",
      "/index.html",
      "/style.css",
      "/app.js",
      "/image-list.js",

      // …

      // include other new resources for the new version…
    ]),
  );
});

```

### 오래된 캐시 삭제하기

서비스 우커를 업데이트하면 새로운 버전의 캐시가 생성된다. 하지만 이전 버전의 서비스 워커가 실행중인 페이지들이 있을 수 있어서, 그 페이지들이 사용하는 이전 캐시도 당장은 필요하다.

새 버전이 `activate`될 때 이전 캐시들을 안전하게 정리할 수 있다.

```jsx
const deleteCache = async (key) => {
  await caches.delete(key);
};

const deleteOldCaches = async () => {
  const cacheKeepList = ["v2"];
  const keyList = await caches.keys();
  const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
  await Promise.all(cachesToDelete.map(deleteCache));
};

self.addEventListener("activate", (event) => {
  event.waitUntil(deleteOldCaches());
});

```

중요한 점:

- `waitUntil()`에 전달된 프로미스가 완료될 때까지 다른 이벤트들이 차단
- 따라서 새 서비스 워커가 첫 `fetch` 이벤트를 받기 전에 정리 작업이 완료됨이 보장
- `cacheKeepList`에 유지하고 싶은 캐시 버전을 명시하면, 그 외의 캐시들은 모두 삭제