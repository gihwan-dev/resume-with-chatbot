## 요소 움직이기

요소를 움직이기 위해서 `translate`와 `rotation` 키워드를 사용해라.

```css
.animate {
  animation: slide-in 0.7s both;
}

@keyframes slide-in {
  0% {
    transform: translateY(-1000px);
  }
  100% {
    transform: translateY(0);
  }
}
```

```css
.animate {
  animation: rotate 0.7s ease-in-out both;
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

## 요소 리사이즈

```css
.animate {
  animation: scale 1.5s both;
}

@keyframes scale {
  50% {
    transform: scale(0.5);
  }
  100% {
    transform: scale(1);
  }
}
```

## 요소의 가시성 변경하기

```css
.animate {
  animation: opacity 2.5s both;
}

@keyframes opacity {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
```

## 레이아웃 또는 페인트를 유발하는 프로퍼티 사용 피하기

`transform`과 `opacity`가 아닌 다른 요소를 애니메이션을 위해 사용할 때 렌더링 파이프라인에 미치는 영향에 대해 알아봐라.

## 레이어 생성 강제하기

요소를 새로운 레이어에 위치시키게 되면 다른 레이아웃에 영향 없이 필요한 부분만 리페인트 할 수 있다.

브라우저는 알아서 어떤 아이템을 새로운 레이어에 둘지 결정할 수 있다. 하지만 `will-change` 옵션을 사용해서 이걸 강제할 수 있다.

하지만 명세에는 변경될 가능성이 있는 요소에 한해서 적용해라고 한다. 사이드 바와 같은 예시가 있다.

#레이어 #컴포지터