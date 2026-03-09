`app` 폴더의 계층 구조는 URL 경로에 직접적으로 적용된다. **route group** 를 사용해서 이러한 패턴에서 벗어날 수 있다. Route groups는 다음과 같이 사용될 수 있다:

- URL 구조에 영향을 주지 않고 라우트를 조직하기
- 특정 라우트 세그먼트를 한 레이아웃에 Opting-in 하기
- 앱을 분할함으로써 여러개의 root layout을 만들기

---
## Convention
Route groups 은 폴더명을 괄호로 감싸서 만들 수 있다: `(folderName)`

---
## Examples
### URL 경로에 영향을 주지 않고 라우트를 조직하기
연관된 라우트들을 모아 그룹을 만들어 구성한다. 괄호로 삼싼 폴더는 URL에서 생략 된다.

![[Pasted image 20230914220044.png]]

`(marketing)` 과 `(shop)` 이 같은 URL 계층을 공유한다고 하더라도 `layout.js` 파일을 통해 다른 레이아웃을 각 그룹에 적용할 수있다.

![[Pasted image 20230914220059.png]]

### Opting specific segments into a layout
특정 라우트들을 한 레이아웃안에 포함시키려면, 같은 레이아웃을 공유하는 경로들을 그룹으로 옯기면 된다. 그룹 밖의 라우트들은 레이아웃을 공유하지 않을것이다.

![[Pasted image 20230914220114.png]]

### Creating multiple root layouts
여러개의 루트 레이아웃을 만들기 위해, 최 상위에 위치한 `layout.js` 파일을 제거하고 각 그룹에 `layout.js` 파일을 추가한다. 앱을 완전히 다른 UI/UX를 가지는 부분들로 나눌 때 유용하다. `<html>` 과 `<body>` 태그가 각 `layout.js` 파일에 추가되어야 한다.

![[Pasted image 20230914220132.png]]

위 예제에서 `(marketing)` 과 `(shop)` 둘 다 자신만의 루트 레이아웃을 가진다.

- Good to know:
    - 그룹 라우트 폴더의 폴더 명은 그룹의 이름을 통해 조직화 한다는 것 이외에는 큰 의미를 가지지 않는다.
    - 라우트 그룹 안의 라우트는 같은 URL 경로를 가지면 안된다.
    - 여러 루트 레이아웃으로의 navigating은 full page load를 동반한다. 물론 여러 루트 레이아웃들 사이의 navigating에게만 적용된다.

#Nextjs 