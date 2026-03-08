`Hisgory API`는 `history global object`를 통해  브라우저의 세션 history에 접근을 제공한다. 다양한 프로퍼티와 `method`를 제공하며 유저의 `history`를 통해 `back, forth navigation`과 `history stack`의 콘텐츠를 조작할 수 있도록 해준다.

> [!info] **Note**: 이 API는 메인 스레드에서만 사용 가능하다(`Window`). `Worker` 또는 `Worklet` 컨텍스트에서 접근할 수 없다.

### **속성**

1. `length` (읽기 전용)
    - 현재 페이지를 포함한 세션 히스토리의 총 항목 수
    - 새 탭의 경우 1을 반환
2. `scrollRestoration`
    - 히스토리 탐색 시 스크롤 복원 동작 설정
    - 'auto' 또는 'manual' 값 지정 가능
3. `state` (읽기 전용)
    - 히스토리 스택 최상단의 상태 값
    - popstate 이벤트 없이 상태 확인 가능

### **메서드**

1. 페이지 탐색
    - `back()`: 이전 페이지로 이동 (`history.go(-1)`와 동일)
    - `forward()`: 다음 페이지로 이동 (`history.go(1)`와 동일)
    - `go(n)`: 상대적 위치의 페이지로 이동
        - n이 양수: 앞으로 n페이지
        - n이 음수: 뒤로 n페이지
        - n이 0 또는 생략: 현재 페이지 새로고침
2. 상태 관리
    - `pushState(data, title, url?)`
        - 새로운 히스토리 항목 추가
        - **현재 URL을 변경하지만 페이지는 다시 로드하지 않음**
    - `replaceState(data, title, url?)`
        - 현재 히스토리 항목 수정
        - 새 항목을 만들지 않고 현재 항목 업데이트

### **주의사항**

- Safari를 제외한 대부분의 브라우저는 title 파라미터를 무시
- pushState/replaceState의 data는 직렬화 가능한 JavaScript 객체여야 함
- 범위를 벗어난 탐색(존재하지 않는 페이지)은 조용히 무시됨

## 개념과 사용
### 앞으로가기, 뒤로가기
```js
history.back();

history.forward();
```
### 히스토리에서 특정 포인트로 이동
```javascript
history.go(-1);

history.go(1);
```

 아래처럼 활용하면 현재 페이지를 새로고침 한다.
 ```js
history.go();

history.go(0);
```

또한 `history stack`에 몇 개의 페이지가 있는지 `length` 프로퍼티를 통해 확인할 수 있다.
```js
const numberOfEntries = history.length;
```

## 예제
```js

window.addEventListener("popstate", (event) => {
  alert(
    `location: ${document.location}, state: ${JSON.stringify(event.state)}`,
  );
});

history.pushState({ page: 1 }, "title 1", "?page=1");
history.pushState({ page: 2 }, "title 2", "?page=2");
history.replaceState({ page: 3 }, "title 3", "?page=3");
history.back(); // alerts "location: http://example.com/example.html?page=1, state: {"page":1}"
history.back(); // alerts "location: http://example.com/example.html, state: null"
history.go(2); // alerts "location: http://example.com/example.html?page=3, state: {"page":3}"

```

