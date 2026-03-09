> [원문](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)

프로그래밍에서 _inheritance_(상속)는 부모로부터 자식에게 특성을 전달하여 새로운 코드가 기존 코드의 기능을 재사용하고 확장할 수 있게 하는 것을 의미합니다. JavaScript는 객체를 사용하여 상속을 구현합니다. 각 객체는 _prototype_(프로토타입)이라 불리는 다른 객체에 대한 내부 링크를 가지고 있습니다. 이 프로토타입 객체도 자신만의 프로토타입을 가지며, 이는 `null`을 프로토타입으로 가진 객체에 도달할 때까지 계속됩니다. 정의에 따르면, `null`은 프로토타입을 가지지 않으며 이 **prototype chain**(프로토타입 체인)의 최종 링크 역할을 합니다. 프로토타입 체인의 어떤 멤버든 변경하거나 심지어 런타임에 프로토타입을 교체하는 것도 가능하므로, 정적 디스패칭(static dispatching)과 같은 개념은 JavaScript에 존재하지 않습니다.

JavaScript는 동적이며 정적 타입이 없기 때문에 Java나 C++과 같은 클래스 기반 언어에 익숙한 개발자들에게는 다소 혼란스러울 수 있습니다. 이러한 혼란은 종종 JavaScript의 약점으로 여겨지지만, 프로토타입 기반 상속 모델 자체는 사실 고전적인 모델보다 더 강력합니다. 예를 들어, 프로토타입 모델 위에 고전적인 모델을 구축하는 것은 상당히 간단한데, 이것이 바로 클래스가 구현되는 방식입니다.

비록 클래스가 이제 널리 채택되고 JavaScript에서 새로운 패러다임이 되었지만, 클래스는 새로운 상속 패턴을 가져오지 않습니다. 클래스는 대부분의 프로토타입 메커니즘을 추상화하지만, 프로토타입이 내부적으로 어떻게 작동하는지 이해하는 것은 여전히 유용합니다.

## 프로토타입 체인을 통한 상속


### 프로퍼티 상속하기
JavaScript 객체는 속성들의 동적인 "가방"입니다(이를 **own properties**(자체 속성)라고 합니다). JavaScript 객체는 프로토타입 객체에 대한 링크를 가지고 있습니다. 객체의 속성에 접근하려고 할 때, 해당 속성은 객체 자체뿐만 아니라 객체의 프로토타입, 프로토타입의 프로토타입 등에서도 찾게 됩니다. 이는 일치하는 이름의 속성을 찾거나 프로토타입 체인의 끝에 도달할 때까지 계속됩니다.

> [!Note] 참고
> ECMAScript 표준에 따르면, `someObject.[[Prototype]]` 표기법은 `someObject`의 프로토타입을 지정하는 데 사용됩니다. `[[Prototype]]` 내부 슬롯은 각각 `Object.getPrototypeOf()`와 `Object.setPrototypeOf()` 함수를 통해 접근하고 수정할 수 있습니다. 이는 JavaScript 접근자 `__proto__`와 동등한데, 이는 비표준이지만 많은 JavaScript 엔진에서 실질적으로 구현되어 있습니다. 혼란을 방지하면서도 간결하게 유지하기 위해, 우리의 표기법에서는 `obj.__proto__`를 사용하지 않고 대신 `obj.[[Prototype]]`을 사용할 것입니다. 이는 `Object.getPrototypeOf(obj)`에 해당합니다.
> 
> 이는 함수의 `func.prototype` 속성과 혼동되어서는 안 됩니다. `func.prototype`은 생성자로 사용될 때 해당 함수로 생성된 모든 _인스턴스_ 객체에 할당될 `[[Prototype]]`을 지정합니다. 생성자 함수의 `prototype` 속성에 대해서는 나중 섹션에서 논의할 것입니다.

객체의 `[[Prototype]]`을 지정하는 방법은 여러 가지가 있으며, 이는 나중 섹션에서 설명됩니다. 지금은 설명을 위해 `__proto__` 구문을 사용하겠습니다. `{ __proto__: ... }` 구문이 `obj.__proto__` 접근자와 다르다는 점을 기억해둘 필요가 있습니다. 전자는 표준이며 폐지되지 않았습니다.

객체 리터럴에서 `{ a: 1, b: 2, __proto__: c }`와 같은 경우, 값 `c`(이는 `null`이거나 다른 객체여야 함)는 해당 리터럴로 표현된 객체의 `[[Prototype]]`이 되고, `a`와 `b`와 같은 다른 키들은 객체의 _own properties_(자체 속성)가 됩니다. 이 구문은 `[[Prototype]]`이 단지 객체의 "내부 속성"이기 때문에 매우 자연스럽게 읽힙니다.

다음은 속성에 접근하려고 할 때 발생하는 일입니다:
```js
const o = {
  a: 1,
  b: 2,
  // __proto__는 [[Prototype]]을 설정합니다. 여기서는
  // 다른 객체 리터럴로 지정됩니다.
  __proto__: {
    b: 3,
    c: 4,
  },
};

// o.[[Prototype]]은 속성 b와 c를 가지고 있습니다.
// o.[[Prototype]].[[Prototype]]은 Object.prototype입니다(이것이
// 무엇을 의미하는지는 나중에 설명하겠습니다).
// 마지막으로, o.[[Prototype]].[[Prototype]].[[Prototype]]은 null입니다.
// 이것이 프로토타입 체인의 끝입니다. null은 
// 정의에 따라 [[Prototype]]을 가지지 않기 때문입니다.
// 따라서, 전체 프로토타입 체인은 다음과 같습니다:
// { a: 1, b: 2 } ---> { b: 3, c: 4 } ---> Object.prototype ---> null

console.log(o.a); // 1
// o에 'a'라는 자체 속성이 있나요? 네, 그 값은 1입니다.

console.log(o.b); // 2
// o에 'b'라는 자체 속성이 있나요? 네, 그 값은 2입니다.
// 프로토타입도 'b' 속성을 가지고 있지만, 방문되지 않습니다.
// 이를 속성 섀도잉(Property Shadowing)이라고 합니다.

console.log(o.c); // 4
// o에 'c'라는 자체 속성이 있나요? 아니오, 프로토타입을 확인합니다.
// o.[[Prototype]]에 'c'라는 자체 속성이 있나요? 네, 그 값은 4입니다.

console.log(o.d); // undefined
// o에 'd'라는 자체 속성이 있나요? 아니오, 프로토타입을 확인합니다.
// o.[[Prototype]]에 'd'라는 자체 속성이 있나요? 아니오, 프로토타입을 확인합니다.
// o.[[Prototype]].[[Prototype]]은 Object.prototype이고
// 기본적으로 'd' 속성이 없으므로, 프로토타입을 확인합니다.
// o.[[Prototype]].[[Prototype]].[[Prototype]]은 null이므로, 검색을 중단하고,
// 속성을 찾지 못했으므로 undefined를 반환합니다.
```

객체에 속성을 설정하면 자체 속성이 생성됩니다. 게터(getter)나 세터(setter)에 의해 가로채지는 경우를 제외하면, 속성 가져오기와 설정하기 동작 규칙에는 예외가 없습니다.

비슷하게, 더 긴 프로토타입 체인을 생성할 수 있으며, 속성은 이 모든 체인에서 찾게 됩니다.

```js
const o = {
  a: 1,
  b: 2,
  // __proto__는 [[Prototype]]을 설정합니다. 여기서는
  // 다른 객체 리터럴로 지정됩니다.
  __proto__: {
    b: 3,
    c: 4,
    __proto__: {
      d: 5,
    },
  },
};

// { a: 1, b: 2 } ---> { b: 3, c: 4 } ---> { d: 5 } ---> Object.prototype ---> null

console.log(o.d); // 5
```

### "메서드" 상속하기

JavaScript는 클래스 기반 언어가 정의하는 형태의 "메서드"를 가지고 있지 않습니다. JavaScript에서는 어떤 함수든 속성 형태로 객체에 추가될 수 있습니다. 상속된 함수는 다른 속성과 마찬가지로 작동하며, 위에서 보여준 속성 섀도잉(이 경우는 _메서드 오버라이딩_의 한 형태)도 포함됩니다.

상속된 함수가 실행될 때, `this`의 값은 함수가 자체 속성으로 있는 프로토타입 객체가 아니라 상속받는 객체를 가리킵니다.

```js
const parent = {
  value: 2,
  method() {
    return this.value + 1;
  },
};

console.log(parent.method()); // 3
// 이 경우 parent.method를 호출할 때, 'this'는 parent를 가리킵니다.

// child는 parent를 상속받는 객체입니다.
const child = {
  __proto__: parent,
};
console.log(child.method()); // 3
// child.method가 호출될 때, 'this'는 child를 가리킵니다.
// 따라서 child가 parent의 메서드를 상속받을 때,
// 'value' 속성은 child에서 찾게 됩니다. 그러나 child는
// 'value'라는 자체 속성이 없으므로, 이 속성은
// [[Prototype]]에서 찾게 되며, 이는 parent.value입니다.

child.value = 4; // child의 'value' 속성에 값 4를 할당합니다.
// 이는 parent의 'value' 속성을 섀도잉합니다.
// child 객체는 이제 다음과 같이 보입니다:
// { value: 4, __proto__: { value: 2, method: [Function] } }
console.log(child.method()); // 5
// child가 이제 'value' 속성을 가지고 있으므로, 'this.value'는
// parent.value 대신 child.value를 의미합니다.
```

## 생성자
프로토타입의 강력한 점은 모든 인스턴스에 존재해야 하는 속성 집합(특히 메서드)을 재사용할 수 있다는 것입니다. 각 상자가 `getValue` 함수를 통해 접근할 수 있는 값을 포함하는 일련의 상자들을 생성한다고 가정해 봅시다. 단순한 구현 방식은 다음과 같을 것입니다:

```js
const boxes = [
  { value: 1, getValue() { return this.value; } },
  { value: 2, getValue() { return this.value; } },
  { value: 3, getValue() { return this.value; } },
];
```

이는 최적이 아닙니다. 각 인스턴스가 동일한 기능을 수행하는 자체 함수 속성을 가지고 있어 중복되고 불필요하기 때문입니다. 대신, 모든 상자들의 `[[Prototype]]`으로 `getValue`를 이동시킬 수 있습니다:

```js
const boxPrototype = {
  getValue() {
    return this.value;
  },
};

const boxes = [
  { value: 1, __proto__: boxPrototype },
  { value: 2, __proto__: boxPrototype },
  { value: 3, __proto__: boxPrototype },
];
```

이런 방식으로, 모든 상자의 `getValue` 메서드는 동일한 함수를 참조하게 되어 메모리 사용량이 줄어듭니다. 하지만 객체를 생성할 때마다 수동으로 `__proto__`를 바인딩하는 것은 여전히 매우 불편합니다. 이때 _constructor_(생성자) 함수를 사용하게 되는데, 이는 제조되는 모든 객체에 대해 자동으로 `[[Prototype]]`을 설정합니다. 생성자는 `new`와 함께 호출되는 함수입니다.

```js
// 생성자 함수
function Box(value) {
  this.value = value;
}

// Box() 생성자로부터 생성된 모든 상자들이 가질
// 속성들
Box.prototype.getValue = function () {
  return this.value;
};

const boxes = [new Box(1), new Box(2), new Box(3)];
```

`new Box(1)`는 `Box` 생성자 함수로부터 생성된 _instance_(인스턴스)라고 말합니다. `Box.prototype`은 이전에 생성한 `boxPrototype` 객체와 크게 다르지 않습니다 — 그저 평범한 객체일 뿐입니다. 생성자 함수로부터 생성된 모든 인스턴스는 자동으로 생성자의 `prototype` 속성을 자신의 `[[Prototype]]`으로 가집니다 — 즉, `Object.getPrototypeOf(new Box()) === Box.prototype`입니다. `Constructor.prototype`은 기본적으로 하나의 자체 속성인 `constructor`를 가지며, 이는 생성자 함수 자체를 참조합니다 — 즉, `Box.prototype.constructor === Box`입니다. 이를 통해 어떤 인스턴스에서든 원래의 생성자에 접근할 수 있습니다.

> [!Note] 참고
> 생성자 함수에서 비원시 값(non-primitive)이 반환되면, 그 값이 `new` 표현식의 결과가 됩니다. 이 경우 `[[Prototype]]`이 올바르게 바인딩되지 않을 수 있습니다 — 하지만 실제로는 이런 일이 많이 발생하지 않습니다.

위의 생성자 함수는 클래스를 사용하여 다음과 같이 다시 작성할 수 있습니다:

```js
class Box {
  constructor(value) {
    this.value = value;
  }

  // 메서드는 Box.prototype에 생성됩니다
  getValue() {
    return this.value;
  }
}
```

클래스는 생성자 함수에 대한 문법적 설탕(syntax sugar)으로, 여전히 `Box.prototype`을 조작하여 모든 인스턴스의 동작을 변경할 수 있습니다. 그러나 클래스는 기본 프로토타입 메커니즘에 대한 추상화로 설계되었기 때문에, 이 튜토리얼에서는 프로토타입이 어떻게 작동하는지 완전히 보여주기 위해 더 가벼운 생성자 함수 구문을 사용할 것입니다.

`Box.prototype`은 모든 인스턴스의 `[[Prototype]]`과 동일한 객체를 참조하기 때문에, `Box.prototype`을 변경하여 모든 인스턴스의 동작을 변경할 수 있습니다.

```js
function Box(value) {
  this.value = value;
}
Box.prototype.getValue = function () {
  return this.value;
};
const box = new Box(1);

// 인스턴스가 이미 생성된 후에 Box.prototype 변경하기
Box.prototype.getValue = function () {
  return this.value + 1;
};
box.getValue(); // 2
```

따라서, `Constructor.prototype`을 재할당(`Constructor.prototype = ...`)하는 것은 두 가지 이유로 좋지 않은 아이디어입니다:

- 재할당 전에 생성된 인스턴스의 `[[Prototype]]`은 이제 재할당 후에 생성된 인스턴스의 `[[Prototype]]`과 다른 객체를 참조하게 됩니다 — 하나의 `[[Prototype]]`을 변경해도 다른 것은 변경되지 않습니다.
- `constructor` 속성을 수동으로 다시 설정하지 않는 한, 생성자 함수는 더 이상 `instance.constructor`로부터 추적될 수 없으며, 이는 사용자의 기대를 깨뜨릴 수 있습니다. 일부 내장 연산은 `constructor` 속성을 읽기도 하는데, 이 속성이 설정되지 않으면 예상대로 작동하지 않을 수 있습니다.

`Constructor.prototype`은 인스턴스를 생성할 때만 유용합니다. 이는 생성자 함수의 _자체_ 프로토타입인 `Constructor.[[Prototype]]`과는 관련이 없으며, 이는 `Function.prototype`입니다 — 즉, `Object.getPrototypeOf(Constructor) === Function.prototype`입니다.

## 리터럴의 암시적 생성자
JavaScript의 일부 리터럴 구문은 암시적으로 `[[Prototype]]`을 설정하는 인스턴스를 생성합니다. 예를 들어:

```js
// 객체 리터럴(`__proto__` 키가 없는)은 자동으로
// `Object.prototype`을 자신의 `[[Prototype]]`으로 가집니다
const object = { a: 1 };
Object.getPrototypeOf(object) === Object.prototype; // true

// 배열 리터럴은 자동으로 `Array.prototype`을 자신의 `[[Prototype]]`으로 가집니다
const array = [1, 2, 3];
Object.getPrototypeOf(array) === Array.prototype; // true

// 정규식 리터럴은 자동으로 `RegExp.prototype`을 자신의 `[[Prototype]]`으로 가집니다
const regexp = /abc/;
Object.getPrototypeOf(regexp) === RegExp.prototype; // true
```

이들을 생성자 형태로 "디슈가(de-sugar)"할 수 있습니다.

```js
const array = new Array(1, 2, 3);
const regexp = new RegExp("abc");
```

예를 들어, `map()`과 같은 "배열 메서드"는 단순히 `Array.prototype`에 정의된 메서드이며, 이것이 모든 배열 인스턴스에서 자동으로 사용할 수 있는 이유입니다.

> [!danger] Warning
> 과거에 널리 사용되었던 하나의 잘못된 기능이 있습니다 — `Object.prototype` 또는 다른 내장 프로토타입을 확장하는 것입니다. 이런 잘못된 기능의 예로는 `Array.prototype.myMethod = function () {...}`를 정의한 다음 모든 배열 인스턴스에서 `myMethod`를 사용하는 것이 있습니다.
>
> 이 잘못된 기능은 _monkey patching_(몽키 패칭)이라고 불립니다. 몽키 패칭을 하면 미래 호환성에 위험이 생길 수 있습니다. 왜냐하면 만약 언어가 미래에 다른 시그니처로 이 메서드를 추가한다면, 여러분의 코드가 깨질 것이기 때문입니다. 이로 인해 SmooshGate와 같은 사건이 발생했으며, JavaScript가 "웹을 깨뜨리지 않으려고" 노력하기 때문에 언어 발전에 큰 방해가 될 수 있습니다.
>
> 내장 프로토타입을 확장하는 **유일하게** 좋은 이유는 `Array.prototype.forEach`와 같은 새로운 JavaScript 엔진의 기능을 백포트(backport)하기 위해서입니다.

역사적인 이유로 일부 내장 생성자의 `prototype` 속성이 그 자체로 인스턴스라는 점은 흥미롭게 알아둘 만합니다. 예를 들어, `Number.prototype`은 숫자 0이고, `Array.prototype`은 빈 배열이며, `RegExp.prototype`은 `/(?:)/`입니다.

```js
Number.prototype + 1; // 1
Array.prototype.map((x) => x + 1); // []
String.prototype + "a"; // "a"
RegExp.prototype.source; // "(?:)"
Function.prototype(); // Function.prototype은 그 자체로 아무 작업도 하지 않는 함수입니다
```

그러나 이는 사용자 정의 생성자나 `Map`과 같은 현대적인 생성자의 경우에는 그렇지 않습니다.

```js
Map.prototype.get(1);
// Uncaught TypeError: get method called on incompatible Map.prototype
```

## 더 긴 상속 체인 구축하기

`Constructor.prototype` 속성은 `Constructor.prototype`의 자체 `[[Prototype]]`을 포함하여 있는 그대로 생성자의 인스턴스들의 `[[Prototype]]`이 됩니다. 기본적으로 `Constructor.prototype`은 _plain object_(일반 객체)입니다 — 즉, `Object.getPrototypeOf(Constructor.prototype) === Object.prototype`입니다. 유일한 예외는 `Object.prototype` 자체로, 그것의 `[[Prototype]]`은 `null`입니다 — 즉, `Object.getPrototypeOf(Object.prototype) === null`입니다. 따라서 일반적인 생성자는 다음과 같은 프로토타입 체인을 구축합니다:

```js
function Constructor() {}

const obj = new Constructor();
// obj ---> Constructor.prototype ---> Object.prototype ---> null
```

더 긴 프로토타입 체인을 구축하기 위해, `Object.setPrototypeOf()` 함수를 통해 `Constructor.prototype`의 `[[Prototype]]`을 설정할 수 있습니다.

```js
function Base() {}
function Derived() {}
// `Derived.prototype`의 `[[Prototype]]`을
// `Base.prototype`으로 설정합니다
Object.setPrototypeOf(Derived.prototype, Base.prototype);

const obj = new Derived();
// obj ---> Derived.prototype ---> Base.prototype ---> Object.prototype ---> null
```

클래스 용어로는, 이는 `extends` 구문을 사용하는 것과 동등합니다.

```js
class Base {}
class Derived extends Base {}

const obj = new Derived();
// obj ---> Derived.prototype ---> Base.prototype ---> Object.prototype ---> null
```

상속 체인을 구축하기 위해 `Object.create()`를 사용하는 레거시 코드를 볼 수도 있습니다. 그러나 이 방식은 `prototype` 속성을 재할당하고 `constructor` 속성을 제거하기 때문에 오류가 발생하기 쉬울 수 있으며, 생성자가 아직 인스턴스를 생성하지 않았다면 성능 향상이 명확하지 않을 수 있습니다.

> [!danger]
> ```js
function Base() {}
function Derived() {}
// `Derived.prototype`을 `Base.prototype`을 `[[Prototype]]`으로 하는
// 새 객체로 재할당합니다
// 이렇게 하지 마세요 — 대신 Object.setPrototypeOf를 사용하여 변형하세요
Derived.prototype = Object.create(Base.prototype);
> ```

## 프로토타입 검사하기: 더 깊은 탐구

이제 더 자세하게 뒤에서 무슨 일이 일어나는지 살펴보겠습니다.

JavaScript에서 위에서 언급했듯이, 함수는 속성을 가질 수 있습니다. 모든 함수는 `prototype`이라는 특별한 속성을 가지고 있습니다. 아래 코드는 독립적으로 실행됩니다(웹페이지에 아래 코드 외에 다른 JavaScript가 없다고 가정해도 됩니다). 가장 좋은 학습 경험을 위해, 콘솔을 열고 "console" 탭으로 이동한 다음, 아래 JavaScript 코드를 복사하여 붙여넣고 Enter/Return 키를 눌러 실행하는 것이 좋습니다. (콘솔은 대부분의 웹 브라우저의 개발자 도구에 포함되어 있습니다. Firefox 개발자 도구, Chrome 개발자 도구 및 Edge 개발자 도구에 대한 자세한 정보를 확인할 수 있습니다.)

```js
function doSomething() {}
console.log(doSomething.prototype);
// 함수를 어떻게 선언하든 상관없이 JavaScript의 함수는
// 항상 기본 prototype 속성을 가집니다 — 한 가지 예외가 있습니다:
// 화살표 함수는 기본 prototype 속성을 가지지 않습니다:
const doSomethingFromArrowFunction = () => {};
console.log(doSomethingFromArrowFunction.prototype);
```

위에서 볼 수 있듯이, `doSomething()`은 콘솔에서 보여준 것처럼 기본 `prototype` 속성을 가지고 있습니다. 이 코드를 실행한 후, 콘솔은 다음과 비슷한 객체를 표시했을 것입니다.

```
{
  constructor: ƒ doSomething(),
  [[Prototype]]: {
    constructor: ƒ Object(),
    hasOwnProperty: ƒ hasOwnProperty(),
    isPrototypeOf: ƒ isPrototypeOf(),
    propertyIsEnumerable: ƒ propertyIsEnumerable(),
    toLocaleString: ƒ toLocaleString(),
    toString: ƒ toString(),
    valueOf: ƒ valueOf()
  }
}
```

> [!Note] 참고
> Chrome 콘솔은 명세의 용어를 따라 객체의 프로토타입을 표시할 때 `[[Prototype]]`을 사용합니다; Firefox는 `<prototype>`을 사용합니다. 일관성을 위해 우리는 `[[Prototype]]`을 사용할 것입니다.

`doSomething()` 함수의 프로토타입에 아래와 같이 속성을 추가할 수 있습니다.

```js
function doSomething() {}
doSomething.prototype.foo = "bar";
console.log(doSomething.prototype);
```

결과는 다음과 같습니다:

```
{
  foo: "bar",
  constructor: ƒ doSomething(),
  [[Prototype]]: {
    constructor: ƒ Object(),
    hasOwnProperty: ƒ hasOwnProperty(),
    isPrototypeOf: ƒ isPrototypeOf(),
    propertyIsEnumerable: ƒ propertyIsEnumerable(),
    toLocaleString: ƒ toLocaleString(),
    toString: ƒ toString(),
    valueOf: ƒ valueOf()
  }
}
```

이제 `new` 연산자를 사용하여 이 프로토타입을 기반으로 `doSomething()`의 인스턴스를 생성할 수 있습니다. `new` 연산자를 사용하려면 함수를 평소처럼 호출하되 앞에 `new`를 붙이면 됩니다. `new` 연산자로 함수를 호출하면 해당 함수의 인스턴스인 객체가 반환됩니다. 그런 다음 이 객체에 속성을 추가할 수 있습니다.

다음 코드를 시도해 보세요:

```js
function doSomething() {}
doSomething.prototype.foo = "bar"; // 프로토타입에 속성 추가하기
const doSomeInstancing = new doSomething();
doSomeInstancing.prop = "some value"; // 객체에 속성 추가하기
console.log(doSomeInstancing);
```

이는 다음과 유사한 출력을 생성합니다:

```
{
  prop: "some value",
  [[Prototype]]: {
    foo: "bar",
    constructor: ƒ doSomething(),
    [[Prototype]]: {
      constructor: ƒ Object(),
      hasOwnProperty: ƒ hasOwnProperty(),
      isPrototypeOf: ƒ isPrototypeOf(),
      propertyIsEnumerable: ƒ propertyIsEnumerable(),
      toLocaleString: ƒ toLocaleString(),
      toString: ƒ toString(),
      valueOf: ƒ valueOf()
    }
  }
}
```

위에서 볼 수 있듯이, `doSomeInstancing`의 `[[Prototype]]`은 `doSomething.prototype`입니다. 하지만, 이것이 무엇을 의미할까요? `doSomeInstancing`의 속성에 접근할 때, 런타임은 먼저 `doSomeInstancing`이 해당 속성을 가지고 있는지 확인합니다.

만약 `doSomeInstancing`이 해당 속성을 가지고 있지 않다면, 런타임은 `doSomeInstancing.[[Prototype]]`(즉, `doSomething.prototype`)에서 해당 속성을 찾습니다. 만약 `doSomeInstancing.[[Prototype]]`이 찾고 있는 속성을 가지고 있다면, `doSomeInstancing.[[Prototype]]`의 해당 속성이 사용됩니다.

그렇지 않고, `doSomeInstancing.[[Prototype]]`이 해당 속성을 가지고 있지 않다면, `doSomeInstancing.[[Prototype]].[[Prototype]]`에서 해당 속성을 확인합니다. 기본적으로, 모든 함수의 `prototype` 속성의 `[[Prototype]]`은 `Object.prototype`입니다. 따라서, `doSomeInstancing.[[Prototype]].[[Prototype]]`(즉, `doSomething.prototype.[[Prototype]]`(즉, `Object.prototype`))에서 찾고 있는 속성을 검색합니다.

만약 속성이 `doSomeInstancing.[[Prototype]].[[Prototype]]`에서 발견되지 않으면, `doSomeInstancing.[[Prototype]].[[Prototype]].[[Prototype]]`을 찾습니다. 그러나 문제가 있습니다: `doSomeInstancing.[[Prototype]].[[Prototype]].[[Prototype]]`은 존재하지 않습니다. 왜냐하면 `Object.prototype.[[Prototype]]`은 `null`이기 때문입니다. 그렇게 `[[Prototype]]`의 전체 프로토타입 체인을 검색한 후에야 런타임은 해당 속성이 존재하지 않는다고 판단하고 해당 속성의 값이 `undefined`라고 결론짓습니다.

콘솔에 더 많은 코드를 입력해 봅시다:

```js
function doSomething() {}
doSomething.prototype.foo = "bar";
const doSomeInstancing = new doSomething();
doSomeInstancing.prop = "some value";
console.log("doSomeInstancing.prop:     ", doSomeInstancing.prop);
console.log("doSomeInstancing.foo:      ", doSomeInstancing.foo);
console.log("doSomething.prop:          ", doSomething.prop);
console.log("doSomething.foo:           ", doSomething.foo);
console.log("doSomething.prototype.prop:", doSomething.prototype.prop);
console.log("doSomething.prototype.foo: ", doSomething.prototype.foo);
```

결과는 다음과 같습니다:

```
doSomeInstancing.prop:      some value
doSomeInstancing.foo:       bar
doSomething.prop:           undefined
doSomething.foo:            undefined
doSomething.prototype.prop: undefined
doSomething.prototype.foo:  bar
```

## 다양한 프로토타입 체인 생성 및 변경 방법

우리는 객체를 생성하고 프로토타입 체인을 변경하는 여러 방법을 접했습니다. 각 접근 방식의 장단점을 비교하며 다양한 방법을 체계적으로 요약해 보겠습니다.

### 구문 구조로 생성된 객체

```js
const o = { a: 1 };
// 새로 생성된 객체 o는 Object.prototype을 [[Prototype]]으로 가집니다
// Object.prototype은 null을 [[Prototype]]으로 가집니다.
// o ---> Object.prototype ---> null

const b = ["yo", "sup", "?"];
// 배열은 Array.prototype에서 상속받습니다
// (indexOf, forEach 등의 메서드를 가지고 있음)
// 프로토타입 체인은 다음과 같습니다:
// b ---> Array.prototype ---> Object.prototype ---> null

function f() {
  return 2;
}
// 함수는 Function.prototype에서 상속받습니다
// (call, bind 등의 메서드를 가지고 있음)
// f ---> Function.prototype ---> Object.prototype ---> null

const p = { b: 2, __proto__: o };
// 새로 생성된 객체의 [[Prototype]]을 __proto__ 리터럴 속성을 통해
// 다른 객체로 지정하는 것이 가능합니다. (Object.prototype.__proto__ 접근자와 혼동하지 마세요)
// p ---> o ---> Object.prototype ---> null
```

객체 초기화에서 `__proto__` 키를 사용할 때, `__proto__` 키를 객체가 아닌 것으로 지정하면 예외를 발생시키지 않고 조용히 실패합니다. `Object.prototype.__proto__` 세터와 달리, 객체 리터럴 초기화에서의 `__proto__`는 표준화되고 최적화되어 있으며, 심지어 `Object.create`보다 더 성능이 좋을 수 있습니다. 객체 생성 시 추가 자체 속성을 선언하는 것이 `Object.create`보다 더 인체공학적입니다.

### 생성자 함수 사용

```js
function Graph() {
  this.vertices = [];
  this.edges = [];
}

Graph.prototype.addVertex = function (v) {
  this.vertices.push(v);
};

const g = new Graph();
// g는 'vertices'와 'edges'라는 자체 속성을 가진 객체입니다.
// g.[[Prototype]]은 new Graph()가 실행될 때 Graph.prototype의 값입니다.
```

생성자 함수는 초기 JavaScript부터 사용 가능했습니다. 따라서 매우 빠르고, 매우 표준적이며, JIT 최적화가 매우 잘 됩니다. 그러나 이런 방식으로 추가된 메서드는 기본적으로 열거 가능하기 때문에, 클래스 구문이나 내장 메서드의 동작 방식과 일치하지 않아 "올바르게 수행하기" 어렵습니다. 또한 앞서 설명한 대로 더 긴 상속 체인을 만드는 것도 오류가 발생하기 쉽습니다.

### Object.create() 사용하기

`Object.create()`를 호출하면 새 객체가 생성됩니다. 이 객체의 `[[Prototype]]`은 함수의 첫 번째 인수입니다:

```js
const a = { a: 1 };
// a ---> Object.prototype ---> null

const b = Object.create(a);
// b ---> a ---> Object.prototype ---> null
console.log(b.a); // 1 (상속됨)

const c = Object.create(b);
// c ---> b ---> a ---> Object.prototype ---> null

const d = Object.create(null);
// d ---> null (d는 null을 직접 프로토타입으로 가지는 객체)
console.log(d.hasOwnProperty);
// undefined, d가 Object.prototype에서 상속받지 않기 때문입니다
```

객체 초기화에서의 `__proto__` 키와 유사하게, `Object.create()`는 객체 생성 시 프로토타입을 직접 설정할 수 있게 해주어 런타임이 객체를 더 최적화할 수 있게 합니다. 또한 `Object.create(null)`을 사용하여 `null` 프로토타입을 가진 객체를 생성할 수 있습니다. `Object.create()`의 두 번째 매개변수를 사용하면 새 객체의 각 속성의 특성을 정확하게 지정할 수 있는데, 이는 양날의 검이 될 수 있습니다:

- 객체 생성 중에 열거 불가능한 속성 등을 생성할 수 있게 해주는데, 이는 객체 리터럴로는 불가능합니다.
- 객체 리터럴보다 훨씬 더 장황하고 오류가 발생하기 쉽습니다.
- 특히 많은 속성을 생성할 때 객체 리터럴보다 느릴 수 있습니다.

### 클래스 사용하기

```js
class Rectangle {
  constructor(height, width) {
    this.name = "Rectangle";
    this.height = height;
    this.width = width;
  }
}

class FilledRectangle extends Rectangle {
  constructor(height, width, color) {
    super(height, width);
    this.name = "Filled rectangle";
    this.color = color;
  }
}

const filledRectangle = new FilledRectangle(5, 10, "blue");
// filledRectangle ---> FilledRectangle.prototype ---> Rectangle.prototype ---> Object.prototype ---> null
```

클래스는 복잡한 상속 구조를 정의할 때 가장 높은 가독성과 유지보수성을 제공합니다. 프라이빗 속성은 프로토타입 상속에서 간단한 대체물이 없는 기능입니다. 그러나 클래스는 전통적인 생성자 함수보다 덜 최적화되어 있으며 오래된 환경에서는 지원되지 않습니다.

### Object.setPrototypeOf() 사용하기

위의 모든 방법이 객체 생성 시점에 프로토타입 체인을 설정하는 반면, `Object.setPrototypeOf()`는 기존 객체의 `[[Prototype]]` 내부 속성을 변경할 수 있게 합니다. 심지어 `Object.create(null)`로 생성된 프로토타입이 없는 객체에 프로토타입을 강제로 적용하거나, 객체의 프로토타입을 `null`로 설정하여 제거할 수도 있습니다.

```js
const obj = { a: 1 };
const anotherObj = { b: 2 };
Object.setPrototypeOf(obj, anotherObj);
// obj ---> anotherObj ---> Object.prototype ---> null
```

그러나 가능하다면 생성 중에 프로토타입을 설정해야 합니다. 프로토타입을 동적으로 설정하면 엔진이 프로토타입 체인에 대해 만든 모든 최적화가 중단되기 때문입니다. 이로 인해 일부 엔진에서는 명세에 따라 작동하도록 코드를 재컴파일하여 최적화를 해제해야 할 수도 있습니다.

### **proto** 접근자 사용하기

모든 객체는 `Object.prototype.__proto__` 세터를 상속받습니다. 이를 사용하여 기존 객체의 `[[Prototype]]`을 설정할 수 있습니다(객체에서 `__proto__` 키가 재정의되지 않은 경우).

**경고:** `Object.prototype.__proto__` 접근자는 **비표준**이며 사용이 권장되지 않습니다. 거의 항상 대신 `Object.setPrototypeOf`를 사용해야 합니다.

```js
const obj = {};
// 이것을 사용하지 마세요: 예시용입니다.
obj.__proto__ = { barProp: "bar val" };
obj.__proto__.__proto__ = { fooProp: "foo val" };
console.log(obj.fooProp);
console.log(obj.barProp);
```

`Object.setPrototypeOf`와 비교하여, `__proto__`를 객체가 아닌 것으로 설정하면 예외를 발생시키지 않고 조용히 실패합니다. 또한 브라우저 지원이 약간 더 좋습니다. 그러나 비표준이며 사용이 권장되지 않습니다. 거의 항상 대신 `Object.setPrototypeOf`를 사용해야 합니다.

## 성능

프로토타입 체인 상위에 있는 속성의 조회 시간은 성능에 부정적인 영향을 미칠 수 있으며, 성능이 중요한 코드에서는 이것이 중요할 수 있습니다. 또한, 존재하지 않는 속성에 접근하려고 할 때는 항상 전체 프로토타입 체인을 탐색합니다.

또한, 객체의 속성을 반복할 때, 프로토타입 체인에 있는 **모든** 열거 가능한 속성이 열거됩니다. 객체가 자신의 프로토타입 체인이 아닌 _자체_에 정의된 속성을 가지고 있는지 확인하려면, `hasOwnProperty` 또는 `Object.hasOwn` 메서드를 사용해야 합니다. `[[Prototype]]`이 `null`인 객체를 제외한 모든 객체는 `Object.prototype`으로부터 `hasOwnProperty`를 상속받습니다 — 프로토타입 체인 아래쪽에서 재정의되지 않는 한 말입니다. 구체적인 예를 들기 위해, 위의 그래프 예제 코드를 사용하여 설명해 보겠습니다:

```js
function Graph() {
  this.vertices = [];
  this.edges = [];
}

Graph.prototype.addVertex = function (v) {
  this.vertices.push(v);
};

const g = new Graph();
// g ---> Graph.prototype ---> Object.prototype ---> null

g.hasOwnProperty("vertices"); // true
Object.hasOwn(g, "vertices"); // true

g.hasOwnProperty("nope"); // false
Object.hasOwn(g, "nope"); // false

g.hasOwnProperty("addVertex"); // false
Object.hasOwn(g, "addVertex"); // false

Object.getPrototypeOf(g).hasOwnProperty("addVertex"); // true
```

> [!Note] 참고
> 속성이 `undefined`인지 확인하는 것만으로는 **충분하지 않습니다**. 속성이 실제로 존재하지만 그 값이 우연히 `undefined`로 설정되어 있을 수 있습니다.

## 결론

JavaScript는 모든 것이 동적이고, 모든 것이 런타임에 결정되며, 정적 타입이 전혀 없기 때문에 Java나 C++에서 온 개발자들에게는 다소 혼란스러울 수 있습니다. 모든 것은 객체(인스턴스)이거나 함수(생성자)이며, 함수 자체도 `Function` 생성자의 인스턴스입니다. 심지어 문법 구조로서의 "클래스"도 런타임에는 단지 생성자 함수일 뿐입니다.

JavaScript의 모든 생성자 함수는 `prototype`이라는 특별한 속성을 가지고 있으며, 이는 `new` 연산자와 함께 작동합니다. 프로토타입 객체에 대한 참조는 새 인스턴스의 내부 `[[Prototype]]` 속성에 복사됩니다. 예를 들어, `const a1 = new A()`를 수행할 때, JavaScript(메모리에 객체를 생성하고 `this`가 정의된 함수 `A()`를 실행하기 전에) `a1.[[Prototype]] = A.prototype`을 설정합니다. 그런 다음 인스턴스의 속성에 접근할 때, JavaScript는 먼저 해당 객체에 직접 존재하는지 확인하고, 그렇지 않으면 `[[Prototype]]`에서 찾습니다. `[[Prototype]]`은 _재귀적으로_ 조회됩니다. 즉, `a1.doSomething`, `Object.getPrototypeOf(a1).doSomething`, `Object.getPrototypeOf(Object.getPrototypeOf(a1)).doSomething` 등의 순서로 속성이 발견되거나 `Object.getPrototypeOf`가 `null`을 반환할 때까지 찾습니다. 이는 `prototype`에 정의된 모든 속성이 사실상 모든 인스턴스에서 공유된다는 것을 의미하며, 나중에 `prototype`의 일부를 변경하고 그 변경 사항이 모든 기존 인스턴스에 나타나게 할 수도 있습니다.

위의 예에서, `const a1 = new A(); const a2 = new A();`를 수행하면, `a1.doSomething`은 실제로 `Object.getPrototypeOf(a1).doSomething`을 참조하게 됩니다 — 이는 당신이 정의한 `A.prototype.doSomething`과 동일합니다. 즉, `Object.getPrototypeOf(a1).doSomething === Object.getPrototypeOf(a2).doSomething === A.prototype.doSomething`입니다.

프로토타입 상속 모델을 사용하는 복잡한 코드를 작성하기 전에 이 모델을 이해하는 것이 필수적입니다. 또한, 코드에서 프로토타입 체인의 길이를 인식하고 필요한 경우 이를 분리하여 가능한 성능 문제를 방지해야 합니다. 더불어, 네이티브 프로토타입은 새로운 JavaScript 기능과의 호환성을 위한 경우가 아니라면 **절대로** 확장되어서는 안 됩니다.