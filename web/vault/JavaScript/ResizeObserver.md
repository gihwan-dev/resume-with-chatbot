문서에 resize 이벤트 핸들러를 등록하면 문서의 뷰포트가 변경될 때 이 핸들러가 호출된다. ResizeObserver는 요소에 resize 이벤트 핸들러를 등록하는 것과 유사하다. 관찰하는 요소들의 사이즈 변경을 감지하고 이를 보고한다. 이후 우리는 콜백을 통해 동작을 수행할 수 있게 된다.

```jsx
const observer = new ResizeObserver(entries => {
	for (let entry of entries) {
		const { contentRect } = entry;
		console.log(entry.target, contentRect);
	}
});

// 하나 또는 그 이상이 될 수 있다.
observer.observe(someElement);
```

## 디테일: 무엇이 리포트 될까?

ResizeObserverEntry는 contentRect라는 프로퍼티를 통해 content box를 리포트한다. content box는 패딩 안쪽의 요소가 놓일 수 있는 공간을 의미한다.

![[Pasted image 20250103094130.png]]

주목할 점은 ResizeObserver는 contentRect와 패딩 값 모두를 보고하지만, 실제로 관찰 하는 것은 contentRect 뿐이라는 점이다. contentRect와 Border Box를 혼동하지 말아야 한다. getBoundingClientRect()로 보고하는 BorderBox는 전체 요소와 그 하위 요소들을 포함하는 상자다. SVG는 이 규칙의 예외로, Border Box의 크기를 보고한다.

## 언제 보고 되는지

사양에 따르면 `ResizeObserver`는 레이아웃 이후, 페인트 이전에 모든 리사이즈 이벤트를 처리해야 한다. 이는 `ResizeObserver`의 콜백이 페이지 레이아웃을 변경하기에 이상적인 위치라는 것을 의미한다. `ResizeObserver` 처리가 레이아웃과 페인트 사이에 발생하기 때문에, 레이아웃만 무효화되고 페인트는 무효화되지 않는다.

### 주의사항:

`ResizeObserver` 콜백 내에서 관찰 중인 요소의 크기를 변경하면 어떻게 될까? 이는 즉시 또 다른 콜백 호출을 유발한다. 다행히도 `ResizeObserver`는 무한 콜백 루프와 순환 종속성을 방지하는 메커니즘을 가지고 있다. 크기가 조정된 요소가 이전 콜백에서 처리된 _가장 얕은_ 요소보다 DOM 트리에서 더 깊은 위치에 있는 경우에만 같은 프레임에서 변경사항이 처리된다. 그렇지 않으면 다음 프레임으로 처리가 연기된다.

## 응용

**1. 요소별 미디어 쿼리 구현**`ResizeObserver`를 통해 개별 요소에 대한 미디어 쿼리를 구현할 수 있다. 예를 들어, 요소의 너비에 따라 테두리 반경을 동적으로 조정할 수 있다:

```jsx
const ro = new ResizeObserver(entries => {
  for (let entry of entries) {
    entry.target.style.borderRadius =
        Math.max(0, 250 - entry.contentRect.width) + 'px';
  }
});
// 두 번째 박스만 관찰
ro.observe(document.querySelector('.box:nth-child(2)'));

```

**2. 채팅 창 스크롤 위치 관리** 채팅 창에서 발생하는 일반적인 문제는 스크롤 위치 관리다. 다음과 같은 상황에서 스크롤이 최신 메시지를 표시해야 한다:

- 새 메시지 도착 시
- 화면 방향 전환 시

`ResizeObserver`를 사용하면 이 두 가지 상황을 단일 코드로 처리할 수 있다:

```jsx
const ro = new ResizeObserver(entries => {
  document.scrollingElement.scrollTop =
    document.scrollingElement.scrollHeight;
});

// 창 크기 조정을 위한 scrollingElement 관찰
ro.observe(document.scrollingElement);

// 새 메시지 처리를 위한 타임라인 관찰
ro.observe(timeline);

```

<video controls autoplay="true" src="https://web.dev/static/articles/resize-observer/video/webfundamentals-assets/resizeobserver/chat_vp8.webm" />

**3. 커스텀 요소의 레이아웃 관리**`ResizeObserver` 이전에는 커스텀 요소의 크기 변경을 감지하여 하위 요소들의 레이아웃을 다시 조정하는 신뢰할 만한 방법이 없었다.

**INP(Interaction to Next Paint)에 미치는 영향** 성능 최적화를 위해 다음 사항들을 고려해야 한다:

- CSS 선택자를 최대한 단순화하여 스타일 재계산 작업을 최소화
- 강제 리플로우를 유발하는 작업 피하기
- DOM 요소가 많을수록 레이아웃 업데이트 시간이 증가함을 인지

`ResizeObserver`는 강력한 API이지만, 렌더링 지연을 최소화하도록 주의하여 사용해야 한다.