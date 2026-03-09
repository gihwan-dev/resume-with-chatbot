## Location

`Location` 인터페이스는 자신이 연결된 객체의 위치(URL)를 나타낸다. 이 인터페이스에 가해진 변경사항은 연관된 객체에 반영된다. `Document`와 `Window` 인터페이스는 모두 이러한 연결된 `Location`을 가지고 있으며, 각각 `Document.location`과 `Window.location`을 통해 접근할 수 있다.

`https://example.org:8080/foo/bar?q=baz#bang` 이라는 주소가 있다고 하면

- protocol: https
- hostname: [example.org](http://example.org)
- host: [example.org:8080](http://example.org:8080)
- port: 8080
- pathname: /foo/bar
- search: ?q=baz
- hash: #bang
- href: [https://example.org:8080/foo/bar?q=baz#bang](https://example.org:8080/foo/bar?q=baz#bang)

가된다.

### 인스턴스 프로퍼티

Location의 속성과 메서드를 체계적으로 정리해보자:

**읽기 전용 속성**

- `ancestorOrigins`: 현재 문서와 연관된 Location 객체의 모든 상위 브라우징 컨텍스트의 출처를 역순으로 포함하는 DOMStringList
- `origin`: 특정 위치의 정규화된 출처 문자열 반환

**읽기/쓰기 가능한 속성**

1. URL 전체
    - `href`: 전체 URL을 포함하는 문자열. 변경 시 새 페이지로 이동
2. URL 구성 요소
    - `protocol`: 프로토콜 스키마 (`:` 포함)
    - `host`: 호스트네임과 포트를 포함 (`hostname:port`)
    - `hostname`: 도메인
    - `port`: 포트 번호
    - `pathname`: 경로 (`/`로 시작, 쿼리스트링과 프래그먼트 제외)
    - `search`: 쿼리스트링 (`?`로 시작)
    - `hash`: 프래그먼트 식별자 (`#`로 시작)

**메서드**

1. 페이지 이동 관련
    - `assign(url)`: 제공된 URL의 리소스 로드
    - `replace(url)`: 현재 리소스를 제공된 URL의 리소스로 대체 (세션 히스토리에 저장되지 않음)
    - `reload()`: 현재 URL 새로고침
2. 문자열 변환
    - `toString()`: 전체 URL 반환 (`href`와 동일하나 수정 불가)

**주의사항**

- `replace()`는 `assign()`이나 `href` 설정과 달리 브라우저의 세션 히스토리에 저장되지 않아 뒤로 가기가 불가능
- 최신 브라우저는 쿼리스트링 파싱을 위해 `URLSearchParams`와 `URL.searchParams` 제공