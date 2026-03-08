## 참조
`var` 사용을 피하고 모든 참조는 `const`를 사용해라.

참조를 재 할당 해야한다면 `var` 대신 `let`을 사용해라.

## 오브젝트
오브젝트를 작성할때는, 리터럴 구문을 사용해라.
```js
// bad
const item = new Object();

// good
const item = {};
```

코드가 브라우저상의 스크립트로 실행될 때 **예약어**를 키로 이용하지 마라. IE8에서 작동하지 않는다. 
```js
// bad
const superman = {
	default: { clar: 'kent' },
	private: true,
}

// good
const superman = {
	defaults: { clark: 'kent' },
	hidden: true,
}
```

예약어 대신 알기쉬운 동의어를 사용해라
```js
// bad
const superman = {
	class: 'alien',
};

// bad
const superman = {
	klass: 'alien',
};

// good
const superman = {
	type: 'alien',
};
```

동적 프로퍼티명을 갖는 오브젝트를 작성할 때, 계산된 프로퍼티명을 이용해라.
```js
function getKey(k) {
	return a `key named ${k}`;
}

// bad
const obj = {
	id: 5,
	name: 'San Francisco',
};
obj[getKey('enabled')] = true;

// good
const obj = {
	id: 5,
	name: 'San Francisco',
	[getKey('enabled')]: true,
};
```

메소드의 단축구문을 이용해라.
```js
// bad
const atom = {
	value: 1,
	addValue: function (value) {
		return atom.value + value;
	},
};

// good
const atom = {
	value: 1,

	addValue(value) {
		return atom.value + value;
	}
}
```

프로퍼티의 단축구문을 이용해라.
```js
const lukeSkywalker = 'Luke Skywalker';

// bad
const obj = {
	lukeSkywalker: lukeSkywalker,
};

// good
const obj = {
	lukeSkywalker,
};
```

프로퍼티의 단축구문은 오브젝트 선언의 시작부분에 그룹화해라.
```js
const anakinSkywalker = 'Anakin Skywalker';
const lukeSkywalker = 'Luke Skywalker';

// bad
const obj = {
	episodeOne: 1,
	twoJediwalkeInto: 2,
	lukeSkywalker,
	episodeThree: 3,
	ankinSkywalker
};

// good
const obj = {
	lukeSkywalker,
	anakinSkywalker,
	episodeOne: 1,
	episodeTwo: 2,
	...
}
```

## 배열(Arrays)
배열을 작성 할 때는 리터럴 구문을 사용해라.
```js
// bad
const items = new Array();

// good
const items = [];
```

직접 배열에 항목을 대입하지 말고, Array#push를 이용해라.
```js
const someStack = [];

// bad
someStack[someStack.length] = 'abracadabra';

// good
someStack.push('abracadabra');
```

배열을 복사할때는 배열의 확장연산자 `...`를 이용해라.
```js
// bad
const len = items.length;
const itemsCopy = [];
let i;

for (i = 0; i < len; i ++) {
	itemsCopy[i] = items[i];
}

// good
const itemsCopy = [...items];
```

array-like 오브젝트를 배열로 변환하는 경우는 Array#from을 이용해라.
```js
const foo = document.querySelectorAll('.foo');
const node = Array.from(foo);
```

## 구조화대입(Destructuring)
하나의 오브젝트에서 복수의 프로퍼티에 엑세스 할 때는 object destructuring 을 이용해라.
```js
// bad
function getFullName(user) {
	const firstName = user.firstName;
	const lastName = user.lastName;
	return `${firstName} ${lastName}`;
}

// good
function getFullName(obj) {
	const { firstName, lastName } = obj;
	return `${firstName} ${lastName}`;
}

// best
function getFullName({ firstName, lastName }) {
	return `${firstName} ${lastName}`;
}
```

배열의 destructuring을 이용해라.
```js
const arr = [1, 2, 3, 4];

// bad
const first = arr[0];
const second = arr[1];

// good
const [first, second] = arr;
```

복수의 값을 반환하는 경우 배열이 아닌 오브젝트의 destructuring을 이용해라.
```js
// bad
function processInput(input) {
	return [left, right, top, bottom];
}

const [left, __, top] = processInput(input); // 순서를 고려해야함

// good
function processInput(input) {
	return { left, right, top, bottom };
}

const { left, right } = processInput(input);
```

## 문자열(Strings)
문자열에는 single quotes `''`을 사용해라
```js
// bad
const name = "Capt. Janeway";

// good
const name = 'Capt. Janeway';
```

100문자 이상의 문자열은 문자열연결을 사용해서 복수행에 걸쳐 기술할 필요가 있다.
주의: 문자연결을 과용하면 성능에 영향을 미칠 수 있다.
```js
// bad
const errorMessage = 'This is a super long error tha......';

// bad
const errorMessage = 'this .... \ When .... \ blahblah';

// good
const errorMessage = 'This is a super ... ' +
	  'When you stop ....' +
	  'with this .... ';
```

프로그램에서 문자열을 생성하는 경우는 template strings을 이용해라.
```js
// bad
function sayHi(name) {
	return 'How are you, ' + name + '?';
}

// bad
function sayHi(name) {
	return ['How are you, ', name, '?'].join();
}

// good
function sayHi(name) {
	return `How are you, ${name}?`;
}
```

절대로 `eval()`을 이용하지 마라. 많은 취약점을 만든다.

## 함수(Functions);
함수식 보다 함수선언을 이용해라.
```js
// bad
const foo = functino() {};

// good
function foo() {}
```

함수이외의 블록 안에서 함수를 선언하지 마라.

절대 파라메터에 `arguments` 를 지정하지 마라. 함수스코프에 전해지는 `arguments`오브젝트의 참조를 덮어써 버린다.
```js
// bad
function nope(name, options, arguments) {
	// ...stuff...
}

// good
function yup(name, options, args) {
	// ...stuff...
}
```

절대 `arguments`를 이용하지 마라. 대신 `rest syntax ...`을 이용해라.
```js
// bad
function concatenateAll() {
	const args = Array.prototype.slice.call(arguments);
	return args.join('');
}

// good
function concatenateAll(...args) {
	return args.join('');
}
```

함수의 파라메터를 변이시키는 것보다 defafult 파라메터를 이용해라.
```js
// really bad
function handleThings(opts) {

	opts = opts || {};
	//...
}

// still bad
function handleThings(opt) {
	if (opts === void 0) {
		opts = {};
	}
	// ...
}

// good
function handleThings(opts = {}) {
	// ...
}
```

side effect가 있을 default 파라메터의 이용은 피해라.
```js
var b = 1;
// bad
function count(a = b++) {
	console.log(a);
}
count(); // 1
count(); // 2
count(3); // 3
count(); // 3
```

항상 default 파라메터는 뒤쪽에 둬라.
```js
// bad
function handleThings(opts = {}, name) {
	// ...
}

// good
function handleThings(name, opts = {}) {
	// ...
}
```

절대 새 함수를 작성하기 위해 Funciton constructor를 이용하지 마라.
##  Arrow함수(Arrow Functions)
함수식을 이용하는 경우 arrow함수 표기를 이용해라.
```js
// bad
[1, 2, 3].map(function (x) {
const y = x + 1;
return x * y;
});

// good
[1, 2, 3].map((x) => {
	const y = x + 1;
	return x * y;
});
```

함수의 본체가 하나의 식으로 구성된 경우에는 중괄호({})를 생략하고 암시적 return을 이용하는것이 가능하다. 그 외에는 `return`문을 이용해라.
```js
// good
[1, 2, 3].map(number => `Astring container the ${number}`);

// bad
[1, 2, 3].map(number => {
	const nextNumber = number + 1;
	`A string containing the ${nextNumber}.`;
});

// good
[1, 2, 3].map(number => {
	const nextNumber = number + 1;
	return `A string containing the ${nextNumber}.`;
});
```

식이 복수행에 걸쳐있을 경우는 가독성을 더욱 좋게하기 위해 소괄호()로 감싸라.
```js
[1, 2, 3].map(number => (`As time went by, the string container the ${nmumber}` + 
						'longer. So we needed to break it over multiple lines.'))
```

함수의 인수가 하나인 경우 소괄호()를 생략하는게 가능한다.
```js
// good
[1, 2, 3].map(x => x * x);

// good
[1, 2, 3].reduce((y, x) => x + y);
```
## Classes & Constructors
`prototype`을 직접 조작하는것을 피하고 항상 `class`를 이용해라.
```js
// bad
function Queue(contents = []) {
	this._queue = [...contents];
}

Queue.prototype.pop = function() {
	const value = this._queue[0];
	this._queue.splice(0, 1);
	return value;
}

// good
class Queue {
	constructor(contents = []) {
		this._queue = [...contents];
	}
	pop() {
		const value = this._queue[0];
		this._queue.splice(0, 1);
		return value;
	}
}
```

상속은 `extends`를 이용해라.
```js
// good
class PeekableQueue extends Queue {
	peek () {
		return this._queue[0];
	}
}
```

메소드의 반환값으로 `this`를 반환하는 것으로 메소드채이닝을 할 수 있다.
```js
// bad
Jedi.prototype.jump = function() {
	this.jumping = true;
	return true;
};

Jedi.prototype.setHeight = function(height) {
	this.height = height;
};

const luke = new Jedi();
luke.jump(); // => true
luke.setHeight(20); // => undefined

// good
class Jedi {
	jump() {
		this.jumping = true;
		return this;
	}

	setHeight(height) {
		this.height = height;
		return this;
	}
}

const luke = new Jedi();

luke.jump().setHeight(20);
```

custom `toString()`을 작성하는 것은 허용되지만 올바르게 동작하는지와 `side effect`가 없는지 확인해라.
```js
class Jedi {
	constructor(options = {}) {
		this.name = options.name || 'no name';
	}

	getName() {
		return this.name;
	}

	toString() {
		return `Jedi - ${this.getName()}`;
	}
}
```
## 모듈(Modules)
비표준 모듈시스템이 아닌 항상 `( import / export )`를 이용해라. 이렇게 함으로써 선호하는 모듈시스템에 언제라도 옮겨가는게 가능해진다.
```js
// bad
const AirbnbStyleGuide = require('./AirbnbStyleGuide');
module.exports = AirbnbStyleGuide.es6;

// ok
import AirbnbStyleGuide from './AirbnbStyleGuide';
export default AirbnbStyleGuide.es6;

// best
import { es6 } from './AirbnbStyleGuide';
export default es6;
```

wildcard import 는 이용하지 마라.
```js
// bad
import * as AirbnbStyleGuide from './AirbnbStyleGuide';

// good
import AirbnbStyleGuide from './AirbnbStyleGuide';
```

import 문으로부터 직접 export 하는 것은 하지말아 주십시오.
```js
// bad
// filename es6.js
export { es6 as default } from './airbnbStyleGuide';

// good
// filename es6.js
import { es6 } from './AirbnbStyleGuide';
export default es6;
```

## 이터레이터와 제네레이터(Iterators and Generators)
`iterators`를 이용하지 마라. `for-of` 루프 대신에 `map()`과 `reduce()` 와 같은 JavaScript 고급함수(higher-order functions)를 이용해라.
```js
const number = [1, 2, 3, 4, 5];

// bad
let sum = 0;
for (let num of numbers) {
	sum += num;
}

sum === 15;

// good
let sum = 0;
numbers.forEach((num) => sum += num);
sum === 15;

// best (use the functional force)
const sum = numbers.reduce((total, num) => total + num, 0);
sum === 15;
```

현시점에서는 generators는 이용하지 마라.
## 프로퍼티(Properties)
프로퍼티에 엑세스하는 경우 `.`을 사용해라.
```js
const luke = {
	jedi: true,
	age: 28,
};

// bad
const isJedi = luke['jedi'];

// good
const isJedi = luke.jedi;
```

변수를 사용해 프로퍼티에 엑세스하는 경우는 대괄호 `[]`를 사용해라.
```js
const luke = {
	jedi: true,
	age: 28,
};

function getProp(prop) {
	return luke[prop];
}

const isJedi = getProp('jedi');
```
## 변수(Variables)
변수를 선언 할 때는 항상 `const`를 사용해라. 
```js
const superPoser = new SuperPower();
```

