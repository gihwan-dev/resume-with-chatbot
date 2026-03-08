> [원문](https://feature-sliced.design/docs/reference/public-api#public-api-for-cross-imports)

public API는 슬라이스와 같은 모듈 그룹과 그것을 사용하는 코드 사이의 *계약*이다. 또한 이것은 게이트 역할을 하여, 특정 객체들에 대한 접근을 오직 해당 public API를 통해서만 허용합니다.

실제로는, 보통 재 내보내기(re-exports)를 포함한 인덱스 파일로 구현된다:

```js
// pages/auth/index.js

export { LoginPage } from "./ui/LoginPage";
export { RegisterPage } from "./ui/RegisterPage";
```

## 좋은 public API란 무엇인가?
좋은 publicAPI는 슬라이스를 다른 코드에서 사용하고 통합하는 것을 편리하고 안정적으로 만든다. 이는 다음 세 가지 목표를 설정함으로써 달성할 수 있다:
1. 리팩토링과 같은 이유로 인한 슬라이스의 구조적 변경으로부터 애플리케이션의 나머지 부분이 보호되어야 한다.
2. 이전 코드의 동작을 크게 변경하는 변경은 public API의 변경을 유발해야 한다.
3. 슬라이스의 필요한 부분만 노출되어야 한다.

마지막 목표는 몇 가지 중요한 실질적인 의미를 가진다. 특히 슬라이스의 초기 개발 단계에서, 파일에서 내보내는 모든 새로운 객체들이 슬라이스에서도 자동으로 내보니지기 때문에 모든 것을 와일드카드로 재내보내기 하고 싶은 유혹이 있을 수 있다:
```js
// ❌ 안좋은 코드 예시
// features/comments/index.js

export * from "./ui/Comment";
export * from "./model/comments";
```

이는 슬라이스의 인터페이스가 무엇인지 쉽게 알 수 없기 때문에 슬라이스의 발견 가능성을 해친다. 인터페이스를 모른다는 것은 슬라이스를 어떻게 통합해야 하는지 이해하기 위해 코드를 깊이 파고들아 한다는 것을 의미한다. 또 다른 문제는 모듈의 내부를 실수로 노출할 수 있다는 것이다. 이는 누군가가 그것들에 의존하기 시작하면 리팩토링을 어렵게 만들것이라는걸 의미한다.

## Public API 순환 임포트
교차 임포트는 한 슬라이스가 같은 계층의 다른 슬라이스로부터 임포트 하는 상황이다. 일반적으로 이는 계층의 임포트 규칙에 의해 금지되지만, 종종 교차 임포트를 해야 할 정당한 이유가 있다. 예를들어, 비즈니스 엔티티들은 실제 세계에서 종종 서로를 참조하며, 이러한 관계를 우회하는 대신 코드에 반영하는 것이 가장 좋다.

이를 위해 `@x` 표기법이라고도 알려진 특별한 종류의 public API가 있다. 만약 엔티티 A와 B가 있고, 엔티티 B가 A로부터 임포트해야 한다면, 엔티티 A는 엔티티 B만을 위한 별도의 public API를 선언할 수 있다.

`📂 entities`

- `📂 A`
    - `📂 @x`
        - `📄 B.ts` — `entities/B/` 내부의 코드를 위한 특별한 public API
    - `📄 index.ts` — 일반적인 public API

그러면 `entities/B/` 내부의 코드는 `entities/A/@x/B`로부터 임포트할 수 있다.

```ts
import type { EntityA } from "entities/A/@x/B";
```

`A/@x/B` 표기법은 "B가 A에 의존함을 명시하고 제한된 접근을 제공하는 특별 API"를 의미한다.

> [! Note]
> 교차 임포트를 최소한으로 유지하고, 교차 임포트를 제거하는 것이 종종 비합리적인 **Entities 계층에서만 이 표기법을 사용**하도록 해라.

## 인덱스 파일에서의 문제
`index.js`파일과 같은 인덱스 파일(배럴 파일이라고도 함)은 public API를 정의하는 가장 일반적인 방법이다. 만들기 간단하지만, 특정 프레임워크나 번들러에서 문제를 발생시킬 수 있다.

### 순환 임포트
순환 임포트는 둘 또는 그 이상의 파일들이 서로를 순환하며 임포트하는 것을 의미한다.
![[Pasted image 20250215144304.png]]

이런 상황은 종종 번들러가 해결하기 힘들 수 있고, 특정한 경우에는 디버깅 하기 힘든 런타임 에러를 발생시킬 수 있따.

순환 임포트 에러는 인덱스 파일에서만 일어나는것은 아니지만, 인덱스 파일을 가지게 되면 순환 임포트를 만들 확률이 높아지는 것은 분명하다. 아래와 같이 슬라이스의 두 객체가 public API를 통해 드러나는 경우 흔히 일어난다:
```jsx
// pages/home/ui/HomePage.jsx
import { loadUserStatistics } from "../"; // importing from pages/home/index.js

export function HomePage() { /* … */ }
```

```js
// paes/home/index.js
export { HomePage } from "./ui/HomePage";
export { loadUserStatistics } from "./api/loadUserStatistics";
```

![[Pasted image 20250215145441.png]]

이런 문제를 해결하려면 다음 두 가지 원칙을 고려해야 한다. 만약 두 파일을 가지고 있고, 한 곳에서 다른 하나를 임포트 해야 한다면:
- 같은 슬라이스에 있다면, *상대적 경로*를 사용해서 임포트 한다.
- 다른 슬라이스에 있다면, 항상 *절대 경로*를 사용해 임포트 한다.

## Shared에서의 큰 번들과 깨진 트리 쉐이킹

모든 것을 재내보내기하는 인덱스 파일이 있을 때, 일부 번들러는 트리 쉐이킹(임포트되지 않은 코드 제거)을 수행하는 데 어려움을 겪을 수 있다.

일반적으로 이는 public API에서는 문제가 되지 않는다. 모듈의 내용들은 보통 매우 밀접하게 연관되어 있어서, 하나만 임포트하고 다른 것은 트리 쉐이킹하는 경우가 거의 없기 때문다. 하지만 FSD의 일반적인 public API 규칙이 문제를 일으킬 수 있는 매우 일반적인 두 가지 경우가 있다 — `shared/ui`와 `shared/lib`이다.

이 두 폴더는 모두 서로 관련이 없는 것들의 모음이며, 한 곳에서 모두 필요한 경우가 거의 없다. 예를 들어, `shared/ui`는 UI 라이브러리의 모든 컴포넌트에 대한 모듈을 가질 수 있다:

* `📂 shared/ui/`
   * `📁 button`
   * `📁 text-field`
   * `📁 carousel`
   * `📁 accordion`

이 문제는 이러한 모듈 중 하나가 구문 강조기나 드래그 앤 드롭 라이브러리와 같은 무거운 의존성을 가질 때 더 악화됩니다. 예를 들어 버튼과 같이 `shared/ui`의 무언가를 사용하는 모든 페이지에 그러한 것들을 가져오고 싶지는 않을 것이다.

`shared/ui` 또는 `shared/lib`의 단일 public API로 인해 번들이 원치 않게 커진다면, 대신 각 컴포넌트나 라이브러리마다 별도의 인덱스 파일을 갖는 것이 권장된다:

* `📂 shared/ui/`
   * `📂 button`
      * `📄 index.js`
   * `📂 text-field`
      * `📄 index.js`

그러면 이러한 컴포넌트들의 사용자는 다음과 같이 직접 임포트할 수 있다:

**pages/sign-in/ui/SignInPage.jsx**
```
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
```

## public API 우회에 대한 실질적인 보호 장치가 없음
슬라이스에 대한 인덱스 파일을 만들 때, 실제로는 누군가가 그것을 사용하지 않고 직접 임포트하는 것을 금지하지는 않는다. 이는 특히 자동 임포트에서 문제가 발생한다. 객체를 임포트 할 수 있는 여러 곳이 있어서 IDE가 대신 결정해야 하기 때문이다. 때로는 IDE가 직접 임포트하는 것을 선택할 수 있어서, 슬라이스의 public API 규칙을 위반하게 된다.

이러한 문제들을 자동으로 잡아내기 위해, Feature-Sliced Design을 위한 규칙 세트가 있는 아키텍처 린터인 Steiger를 사용하는 것을 권장한다.

## 큰 프로젝트에서의 번들러 성능 저하
TkDodo가 그의 글 "Please Stop Using Barrel Files"에서 언급했듯이, 프로젝트에 많은 수의 인덱스 파일이 있으면 개발 서버의 속도가 느려질 수 있다. 이 문제를 해결하기 위해 할 수 있는 몇 가지 방법이 있다:

1. "Shared에서의 큰 번들과 깨진 트리 쉐이킹" 문제와 같은 조언 — `shared/ui`와 `shared/lib`에서 하나의 큰 인덱스 파일 대신 각 컴포넌트/라이브러리마다 별도의 인덱스 파일을 가져라.
2. 슬라이스가 있는 계층의 세그먼트에서 인덱스 파일을 만드는 것을 피해라. 예를 들어, "comments" 기능에 대한 인덱스 `📄 features/comments/index.js`가 있다면, 해당 기능의 `ui` 세그먼트에 대한 또 다른 인덱스 `📄 features/comments/ui/index.js`를 가질 이유가 없다.
3. 매우 큰 프로젝트가 있다면, 애플리케이션을 여러 개의 큰 청크로 분할할 수 있는 좋은 기회가 있다. 예를 들어, Google Docs는 문서 편집기와 파일 브라우저에 대해 매우 다른 책임을 가지고 있다. 각 패키지가 자체 계층 세트를 가진 별도의 FSD 루트인 모노레포 설정을 만들 수 있다. 일부 패키지는 Shared와 Entities 계층만 가질 수 있고, 다른 패키지는 Pages와 App만 가질 수 있으며, 또 다른 패키지는 자체적인 작은 Shared를 포함하면서도 다른 패키지의 큰 Shared도 사용할 수 있다.