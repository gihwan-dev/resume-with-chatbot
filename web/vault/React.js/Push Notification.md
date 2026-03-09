
현재 PWA 로 프로젝트 하나를 진행하고 있다. 진행하면서 `push notifaction`을 사용해야 할 일이 생겨 정리해두고자 한다.

`PWA` 빌드 방법은 따로 설명하지 않겠다.

## 서비스 워커에 등록한다.
웹앱에서 서비스 워커는 푸시 알림을 가능하게 해는 중요한 부분이다. 백그라운드에서 동작하며 네트워크 요청을 인터셉트할 수 있다. 이는 푸쉬 알림을 할 수 있도록 해준다.

`public` 폴더에 `sw.js` 파일을 추가하고 다음 코드를 추가 해준다.\

기존의 `service-worker.js` 파일이 있다면 삭제해도 된다. `index.tsx` 파일에 있는 서비스 워커 관련 코드도 모두 삭제 해준다.

```js
/* eslint-disable no-restricted-globals */

const CACHE_NAME = "my-cache";

self.addEventListener("install", (e) => {
  console.log("installing service worker!!");
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache
        .addAll([`/`, `/index.html`, `static/js/bundle.js`])
        .then(() => self.skipWaiting());
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("activate service worker!!");
  event.waitUntil(self.clients.claim());
});

/* self.addEventListener("fetch", function (event) {
  if (navigator.onLine) {
    var fetchRequest = event.request.clone();
    return fetch(fetchRequest).then(function (response) {
      if (!response || response.status !== 200 || response.type !== "basic") {
        return response;
      }
      var responseToCache = response.clone();

      caches.open(CACHE_NAME).then(function (cache) {
        cache.put(event.request, responseToCache);
      });
      return response;
    });
  } else {
    event.respondWith(
      caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        }
      })
    );
  }
});
*/

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("push", (event) => {
  const options = {
    body: event.data.text(),
    icon: "/public/logo.png",
    lang: "ko",
    renotify: true,
    requireInteraction: true,
    vibrate: [100, 50, 100],
  };
  event.waitUntil(
    self.registration.showNotification("태성환경연구소 모니터링앱", options)
  );
});


```
위 코드는 내가 `캐싱` 및 `푸쉬 알림` 동작을 하기 위해 정의한 코드다.
> 웹 소켓을 구현했는데 서비스워커의 fetch를 캐시하는 코드 때문에 에러가 계속 발생했다. 어차피 실시간 통신이 중요하고 오프라인에서 동작해야하는 앱이 아니므로 캐시 기능은 과감하게 삭제했다.

## 서비스워커를 등록한다.
`public/index.html` 파일에 서비스 워커를 등록하기 위해 다음과 같이 코드를 작성한다.
```html
<script>
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then((registration) => {
      console.log(
        "ServiceWorker registration successful with scope: ",
        registration.scope
      );
    })
    .catch((error) => {
      console.log("ServiceWorker registration failed: ", error);
    });
}
</script>

```
이 코드는 브라우저가 서비스워커를 지원하는지 확인하고 서비스 워크를 등록하는 역할을 한다.
## 파이어베이스 클라우스 메시징을 설정한다.
파이어 베이스에 프로젝트를 우선 셋업한다.

이후 파이어베이스 프로젝트의 프로젝트 설정 > 클라우드 메시징
에서 `Sender ID` 와 `Server key` 값을 복사한다.
이 값들은 이후에 필요하다.

> 프로젝트 개요 옆의 톱니바퀴 버튼을 눌러 프로젝트 설정에 들어간다.
> 이후 클라우드 메시징에 들어가자
> 발신자 ID는 바로 나와있다.
> 서버키는 Cloue Messaging API 옆에 동그라미 세로로 세개 있는거 클릭해서 구글 클라우드 콘솔로 이동한 뒤 사용 버튼을 눌러 활성화 해준다.
> 이후 돌아와서 새로고침 하면 서버 키가 발급 받아져 있을거다.

## 파이어베이스를 설치하고 FCM설정을 한다.
```bash
npm install firebase
```
를 통해 파이어 베이스를 설치한다.

이제 파이어베이스 설정 파일은 만든다. `src`폴더에 `firebase.js` 파일을 만들고 다음 코드를 작성한다.
```ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { API_URL } from "./const";

const firebaseConfig = {
 ...
};

const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

```

## 권한 요청을 하고 토클을 받는다.
나는 해당 코드를 `useEffect`훅을 통해 `App.tsx` 파일에 정의했다.
```js
Notification.requestPermission().then((permission) => {
  if (permission === "granted") {
    getToken(messaging, {
      vapidKey: ""
    }).then((currentToken) => {
      if (currentToken) {
        fetch(`${API_URL}/auth/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: currentToken,
          }),
        }).then((res) => {
          console.log(res);
        });
      } else {
        console.log(
          "No registration token available. Request permission to generate one."
        );
      }
    });
  }
});
```

## 백그라운드에서 실행되기 위해서는 firebase-messaging-sw.js 파일이 필요하다!
`public` 폴더에 `firebase-messaging-sw.js` 파일을 만들어 줘야한다. 그렇지 않으면 에러가 난다! 알아본 바에 따르면 백그라운드에서 실행되기 위해서 필요하다고 한다!

```js
// firebase-messaging-sw.js
/* eslint-disable no-undef */
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js"
);

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
// eslint-disable-next-line no-undef
firebase.initializeApp({
	...
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = "Background Message Title";
  const notificationOptions = {
    body: "Background Message body.",
    icon: "/firebase-logo.png",
  };

  // eslint-disable-next-line no-restricted-globals
  self.registration.showNotification(notificationTitle, notificationOptions);
});

```
`onBackgroundMessage`의 `payload` 매개변수에 내가 서버에서 보내준 푸쉬 알림의 `title` 과 `body`가 있다!

## 서버에서 푸쉬 알림을 보내보자!
어떤 데이터를 수신하다가 데이터의 값이 임계값을 넘기면 푸쉬 알림을 보내는 동작을 구현하고자 했다.

## serviceAccountKey.json 파일을 받아준다
파이어베이스 프로젝트 설정에서 서비스 계정으로 들어간다.

 새 비공개 키 생성 버튼을 누르면 `json`파일이 다운받아 진다.

해당 파일을 서버 코드의 루트나 원하는곳 어디든 `serviceAccountKey.json` 이라는 이름으로 넣는다.

`firebase-admin` 패키지를 설치하고 다음과 같이 객체 인스턴스를 생성한다. 나는 `nestJs`를 사용중이라 `Providers`를 만들어 의존성을 주입시키는 형태로 하려 했는데 잘 안되어서 그냥 일단 프로퍼티로 만들어 버렸다. 추후에 `Providers`로 만들어볼 생각이다.

```js
import * as serviceAccount from "./serviceAccountKey.json";
import * as admin from "firebase-admin";
import { Message } from "firebase-admin/lib/messaging/messaging-api";

@Injectable()
export class NotificationService {
  #app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
  });
```

`express`를 사용하고 있다면 글로벌 싱글톤 패턴을 사용하거나 하면 될 것 같다!

이후에 다음처럼 사용하면 된다

```js
async pushNotificationTest(ip: string) {
    const userDevice = await this.prisma.user_device.findUnique({
      where: {
        ip: ip,
      },
    });

    const token = userDevice.token;

    const message: Message = {
      data: {
        title: "테스트 알림",
        body: "테스트 알립 입니다.",
      },
      token,
    };
    const result = await this.#app.messaging().send(message);
}

```

