## Button
### Spec
버튼은 4가지 타입으로 구성됨:

#### Button
보통의 버튼을 의미한다:
![[Pasted image 20250508193654.png]]

#### Split button
Split button은 사용자가 여러 관련 작업 중 하나를 선택할 수 있게 해준다. 주요 작업은 버튼 레이블에 표시되고, 추가 작업들은 메뉴에 숨겨진다. 주요 작업은 메뉴 내에서 중복되어서는 안된다.
![[Pasted image 20250508193648.png]]

#### Menu button
메뉴 버튼은 옵션 메뉴를 토글할 수 있는 버튼이다. 스플릿 버튼과 다르게 메뉴 버튼은 주요 액션을 드러내지 않는다.
![[Pasted image 20250508193643.png]]

#### Compound button
Compound button은 주요 제목과 그 제목에 대한 추가 설명을 포함한다. 더 자세한 내용을 포함하는 것이 도움이 될 때 사용한다.
![[Pasted image 20250508193635.png]]

버튼의 동작에 대한 설명이 있고, 토글 버튼에 대해서만 명시해 두었다. 아래와 같이 설명하고 있다:

> 토글 버튼은 on, off 상태를 표현하는 버튼이다. 버튼과 컴파운드 버튼은 토글 상태를 가질 수 있다. 버튼의 rest 상태는 'off' 상태를 의미하며 selected는 'on' 상태를 의미한다.
> 
> 토글 동작을 보여주기 위해 버튼의 state 프로퍼티를 조작해라. 코드에서는 ToggleButton 컴포넌트를 사용하고 checked prop을 전달해라.

우선 명세는 피그마, 코드 모두를 문서화 하는 것이라 보인다.

디자인 시스템에서 피그마와, 코드 3개의 일치율이 100%에 가까울수록 이상적이라고 많이들 얘기한다. Fluent2 디자인 시스템에서는 다르다. 피그마에서는 state를 통해 토글 상태가 정의되지만, 코드에서는 ToggleButton을 이용하며 상태 또한 checked를 통해 관리된다.

state와 style은 분리되어 있음. state는 브라우저 네이티브 상태를 의미하는걸로 보임. 그런데 또 Focus는 별도 토글 상태로 분리되어 있음. selected, disabled의 경우 Focus와 동시에 존재할 수 있기 때문으로 보임.

### 일반 버튼 프로퍼티 비교
#### 피그마
- style: Primary, Secondary, Outline, Subtle, Transparent
- state: Rest, Hover, Pressed, Selected, Disabled
- focus: true, false (Rest인 상태에서만 동작함)
- Icon: true, false (무조건 왼쪽에 등장함)
- Menu button: true, false
- 20x Outline: Icon 위치에 들어가는 Slot을 결정함
- Placeholder - Theme: Regular, Filled (아이콘의 모양 테마)
- Placeholder - Size: 정수 (아이콘의 사이즈)
- Label: 버튼의 텍스트
- Layout: Icon only, Icon with text

#### 스토리북
- icon: `children`의 앞 또는 뒤에 보여지는 아이콘
- as: "a" 또는 "button"
- disabledFocusable: disabled 되어도 Focus 가능하게 할지에 대한 값으로 true, false
- appearance: Primary, Secondary(Default), Outline, Subtle, Transparent
- iconPosition: before, after 값으로 `children`의 어디에 보여지는가를 의미
- shape: round 정도를 의미하며 circular, rounded, square
- size: 버튼의 사이즈로 small, medium, large

### 메뉴 버튼 프로퍼티 비교
#### 피그마
기본 Button으로 만들어짐
#### 스토리북
기존 버튼 컴포넌트로 만들지 않은것으로 보임. 완전 별개의 컴포넌트 같음.

- icon: 아이콘. `children`의 좌측에 보여짐
- menuIcon: 메뉴 아이콘
- disabledFocusable: 동일함
- size: 동일함
- appearance: 동일함
- shape: 동일함

메뉴 컴포넌트의 경우 컴파운드 패턴으로 구현됨:

```tsx
import * as React from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from "@fluentui/react-components";

export const Default = () => (
  <Menu>
    <MenuTrigger disableButtonEnhancement>
      <MenuButton>Example</MenuButton>
    </MenuTrigger>

    <MenuPopover>
      <MenuList>
        <MenuItem>Item a</MenuItem>
        <MenuItem>Item b</MenuItem>
      </MenuList>
    </MenuPopover>
  </Menu>
);
```

메뉴 컴포넌트는 버튼과 별개로 구현되어 있음.
## 결론
100% 동기화는 불가능해 보인다. 디자인 툴과 코드 사이의 거리는 분명히 존재한다. 메뉴 버튼만 보더라도 디자인 툴에서와 코드에서의 인터페이스가 다르고, 구현 방식이 다르다. 100% 동일한 인터페이스가 이상적이라는 생각은 들지 않는다. 코드로 할 수 있는것과 디자인 툴에서 할 수 있는게 다르기 때문이다. 각자의 툴에 적합한 최선의 방식으로 서로의 합의점을 맞춰 최대한 동기율을 높여 나가는게 옳바른 방향 아닐까 하는 생각이 든다.

피그마는 추상화된 도구다. 코드처럼 로우 레벨의 도구가 아니다. 그렇기에 코드와 피그마는 100% 동일한 인터페이스를 가질 수 없다. 그 차이를 인정하고, 각자의 툴에서 최선의 방식으로 최대한 유사한 인터페이스의 합의점을 찾아내는게 중요해 보인다.