## map

```js
let products = [
	{ name: "hat", price: 1000 },
	{ name: "clothes", price: 2000 },
	{ name: "shoes", price: 3000 }
]

const map = (f, iter) => {
	let res = [];
	for (const p of iter) {
		res.push(f(p));
	}
	return res;
}

console.log(map((a) => a.name, products));

console.log(map(e => e.nodeName), document.querySelectorAll('*')); // 가능

console.log(document.querySelectorAll('*').map(e => e.nodeName)); // 불가능
```

빌트인 `map`함수는 배열에만 구현되어 있다. 따라서 모든 이터러블에 동작하지 않는다. 그렇기에 직접 구현해서 사용한다.

하지만 위에서 구현한 `map`함수는 모든 이터러블에 적용할 수 있다. 즉 다음과 같은 코드에서도 사용할 수 있다.

```js
let products = [
	{ name: "hat", price: 1000 },
	{ name: "clothes", price: 2000 },
	{ name: "shoes", price: 3000 }
]

const map = (f, iter) => {
	let res = [];
	for (const p of iter) {
		res.push(f(p));
	}
	return res;
}

function *gen() {
	yield 1;
	yield 2;
	yield 3;
}

let m = new Map();

m.set('a', 10);
m.set('b', 20);

console.log(new Map(map(([k ,v]) => [k, v * 2], m)))

console.log(map(a => a * a, gen()));
```

기존 `map` 함수보다 훨씬 더 다형성이 높고 사용성이 좋다.

## filter
```js
let products = [
	{ name: "hat", price: 10000 },
	{ name: "pants", price: 20100 },
	{ name: "clothes", price: 30000 }
]

const filter = (f, iter) => {
	let res = [];
	for (const a of iter) {
		if (f(a)) res.push(a);
	}
	return res;
}

console.log(filter(p => p.price >= 20000, products));
```

## reduce
```js
let products = [
	{ name: "hat", price: 10000 },
	{ name: "pants", price: 20100 },
	{ name: "clothes", price: 30000 }
]

const reduce = (f, acc, iter) => {
	for (const a of iter) {
		acc = f(acc, a);
	}
	return acc;
}

console.log(reduce((a,b) => a + b, 0, [1, 2, 3, 4, 5]));

console.log(reduce((price, product) => price + product.price, 0, products))
```