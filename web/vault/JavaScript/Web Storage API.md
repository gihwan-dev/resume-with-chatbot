Web Storage API는 브라우저에서 키/값 쌍을 쿠키보다 훨씬 직관적으로 저장할 수 있는 방법을 제공한다.

## `localStorage`와 `sessionStorage`

이 둘을 사용하면 페이지를 새로고침하고 다시 실행해도 데이터가 사라지지 않고 남이있도록 할 수 있다. 또 다른 데이터 저장 방법인 쿠키와 차이점은 다음과 같다:

- **네트워크 요청시 서버로 전송되지 않는다.** 그렇기에 더 많은 데이터를 저장할 수 있다. 거의 대부분 2MB 이상을 지원한다.
- **서버가 HTTP 헤더를 통해 스토리지 객체를 조작할 수 없다.** 모두 자바스크립트 내에서 수행된다.
- 프로토콜과 서브도메인이 다르면 데이터에 접근할 수 없다.

두 객체는 동일한 메서드와 프로퍼티를 제공한다.

- `setItem(key, value)` - 키/값 쌍을 보관한다.
- `getItem(key)` - 키에 해당하는 값을 받아온다.
- `removeItem(key)` - 키와 해당 값을 받아온다.
- `removeItem(key)` - 키와 해당 값을 삭제한다.
- `clear()` - 모든 것을 삭제한다.
- `key(index)` - 인덱스에 해당하는 키를 받아온다.
- `length` - 저장된 항목의 개수를 얻는다.

### localStorage

localStorage의 주요 기능은 다음과 같다.

- 오리진이 같은 데이터는 모든 탭과 창에서 공유된다.
- 브라우저나 OS가 재시작하더라도 데이터가 파기되지 않는다.

**키 순회하기**

localStorage는 배열처럼 다룰 수 있다.

```jsx
for (let i = 0; i < localStorage.length; i++) {
	let key = localStorage.key(i);
	console.log(localStorage.getItem(key));
}
```

아래 같은 방법도 가능하다.

```jsx
const keys = Object.keys(localStorage);
for (let key of keys) {
	console.log(localStorage.getItem(key));
}
```

### sessionStorage

sessionStorage는 localStorage에 비해 제한적이다.

- 현재 떠있는 탭 내에서만 유지된다.
- 하나의 탭에 여러 개의 iframe이 있는 경우엔 sessionStorage가 공유된다.
- 페이지를 새로고침 할 때 데이터가 사라지지 않는다. 탭을 닫고 새로 열 때 사라진다.

### storage 이벤트

localStorage나 sessionStorage의 데이터가 갱신될 때, storage 이벤트가 실행된다. 해당 이벤트는 다음과 같은 프로퍼티가 있다.

- `key` - 변경된 데이터의 키
- `oldValue` - 이전 값
- `newValue` - 새로운 값
- `url` - 갱신이 일어난 문서의 url
- `storageArea` - 갱신이 일어난 스토리지 객체

중요한 점은 storage 이벤트가 이벤트를 발생시킨 스토리지를 제외하고 접근 가능한 `window` 객체 전부에서 일어난다는 사실이다.

```jsx
// 문서는 다르지만, 갱신은 같은 스토리지에 반영됩니다.
window.onstorage = event => { // window.addEventListener('storage', () => {와 같습니다.
  if (event.key != 'now') return;
  alert(event.key + ':' + event.newValue + " at " + event.url);
};

localStorage.setItem('now', Date.now());
```

그렇기에 같은 사이트를 여러군데 띄워둔 후 이벤트를 등록시키고 localStorage를 한 탭에서 수정하면 다음과 같이 다른 탭에서 메시지를 수신할 수 있다:

![[Pasted image 20250103093815.png]]
![[Pasted image 20250103093806.png]]

또한 `event.storageArea`에 무언가를 설저해 ‘응답’이 가능하도록 할 수 있다. 이런 특징을 활용하면 **출처가 같은 창끼리 메시지를 교환**하게 할 수 있다.

모던 브라우저는 오리진이 같은 창끼리 통신할 수 있도록 해주는 Broadcast Channel API를 지원하지만, 아직 많은 곳에서 지원하지 않는다는 단점이 있다. 이런 단점을 극복하게 해주는 폴리필들이 localStorage에 기반하고 있다.