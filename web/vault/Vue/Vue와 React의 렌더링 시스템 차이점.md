> 나: Vue3에 대해서 알아보고 있는데, 리액트에서는 Fiber 트리를 이용해서 Diff 연산을 수행하면서 달라진 부분들을 반영하잖아? setState 같은 dispatch를 호출하면 루트부터의 리렌더링을 호출하는거고?
> Vue3는 이런 리액트의 렌더링 원리와 비교했을 때 어떤 부분이 다른거야?

React와 Vue3의 렌더링 원리에는 몇 가지 중요한 차이점이 있습니다. 하나씩 살펴보면서 Vue3의 특징적인 부분들을 이해해보겠습니다.

먼저 말씀하신 것처럼 React는 Fiber 트리를 사용해 가상 DOM을 관리하고, setState 등이 호출되면 해당 컴포넌트부터 시작해서 루트까지 올라가며 리렌더링을 시도합니다. 이 과정에서 전체 하위 트리를 다시 렌더링하게 되죠.

반면 Vue3는 다음과 같은 차별화된 접근 방식을 가지고 있습니다:

1. 반응성 시스템 (Fine-grained Reactivity)
Vue3는 Proxy를 기반으로 한 반응성 시스템을 사용합니다. 각 상태 변수들이 개별적으로 추적되며, 특정 상태를 사용하는 컴포넌트나 계산된 속성들만 다시 계산됩니다. 예를 들어:

```javascript
const state = reactive({
  count: 0,
  name: 'Vue'
})

// 이 컴포넌트는 count가 변경될 때만 리렌더링됨
const Component = {
  template: `<div>{{ count }}</div>`,
  setup() {
    return { count: state.count }
  }
}
```

2. 컴파일 시점 최적화
Vue3의 템플릿 컴파일러는 정적인 부분과 동적인 부분을 컴파일 시점에 미리 구분합니다. 예를 들어:

```html
<div>
  <h1>Hello World</h1> <!-- 정적 노드로 표시됨 -->
  <p>Count: {{ count }}</p> <!-- 동적 노드로 표시됨 -->
</div>
```

이렇게 되면 실제 런타임에서는 변경이 필요한 동적 노드만 확인하면 되므로, React의 가상 DOM 비교보다 더 효율적일 수 있습니다.

1. 의존성 추적
Vue3는 컴포넌트가 사용하는 반응형 상태들을 자동으로 추적합니다. 이는 React의 메모이제이션(useMemo, useCallback 등)과 다르게, 명시적으로 의존성 배열을 지정할 필요가 없다는 것을 의미합니다:

```javascript
// Vue3
const double = computed(() => count.value * 2) // 자동으로 count 의존성 추적

// React
const double = useMemo(() => count * 2, [count]) // 의존성 명시 필요
```

2. 렌더링 최적화
Vue3는 컴포넌트 단위가 아닌 노드 단위로 업데이트를 수행할 수 있습니다. 즉, 컴포넌트 내의 특정 부분만 변경되었다면 해당 노드만 업데이트하며, React처럼 전체 컴포넌트를 다시 렌더링하지 않습니다.

이러한 차이점들로 인해 Vue3는 특히 다음과 같은 상황에서 장점을 가질 수 있습니다:

- 대규모 상태 관리가 필요한 애플리케이션
- 빈번한 상태 업데이트가 발생하는 상황
- 정적 콘텐츠가 많은 페이지

물론 이것이 Vue3가 항상 React보다 좋다는 의미는 아닙니다. 각각의 프레임워크는 자신만의 장단점을 가지고 있으며, 프로젝트의 요구사항에 따라 적절한 선택을 하는 것이 중요합니다.

> 나: 상태 관리 측면과 리렌더링의 측며에서 조금 더 자세히 얘기해줄래? 리액트는 내가 자세히 알고 있다고 자부하거든? 리액트에서는 Fiber노드를 탐색하면서 달라진 부분이 있으면 해당 DOM의 부분에도 반영하는 거잖아? 그러니까 가상 돔 트리를 탐색하면서 돔 트리도 실제로 같이 탐색하는걸로 알고있어 Fiber에서는 각 Fiber 노드가 ref를 유지하는걸로 알고있고.
>
> 그런데 Vue에서는 여전히 잘 감이 안잡혀 그러니까 Proxy를 사용해서 반응형을 이용한다는건 알겠거든? 그럼 get, set이 호출될 때 어떤 함수를 실행시키겠거니 감이 잡혀. 그런데 어떤 함수를 실행해서, 어떻게 실제 DOM에 반영이 되는지 그걸 자세히 알고싶어

Vue3의 반응형 시스템과 DOM 업데이트 과정을 자세히 설명해드리겠습니다. React의 Fiber 구조와 비교하면서 설명하면 이해하기 쉬울 것 같네요.

먼저 Vue3의 반응형 시스템의 핵심 구성요소들을 살펴보겠습니다:

3. 반응형 객체 생성과 추적
```javascript
// 내부적으로 이런 방식으로 동작합니다
function reactive(target) {
  return new Proxy(target, {
    get(target, key) {
      const value = target[key]
      // 현재 실행 중인 effect를 추적
      track(target, key)
      return value
    },
    set(target, key, value) {
      target[key] = value
      // 해당 키에 의존하는 모든 effect들을 트리거
      trigger(target, key)
      return true
    }
  })
}
```

여기서 중요한 것은 `track`과 `trigger` 함수입니다. Vue3는 내부적으로 의존성 그래프를 유지합니다. 이 그래프는 각 반응형 속성(예: state.count)이 어떤 효과(렌더링 함수, computed 등)에 사용되는지 추적합니다.

4. 의존성 추적 시스템
```javascript
// 의존성 맵 구조
const targetMap = new WeakMap()

function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
      depsMap.set(key, (dep = new Set()))
    }
    dep.add(activeEffect)
  }
}
```

이 구조에서 각 반응형 객체(target)는 자신의 속성(key)별로 의존하는 효과들의 집합(dep)을 가지고 있습니다.

5. DOM 업데이트 프로세스
Vue3의 DOM 업데이트는 다음과 같은 단계로 이루어집니다:

```javascript
// 컴포넌트의 렌더 효과
const componentEffect = effect(() => {
  // 1. 새로운 가상 DOM 트리 생성
  const vnode = component.render()
  
  // 2. 패치 작업 수행
  patch(prevVNode, vnode, container)
}, {
  scheduler: queueJob // 업데이트를 다음 틱으로 예약
})
```

React의 Fiber와 다른 중요한 점은:

6. 리액트는 setState가 호출되면 해당 컴포넌트부터 시작해서 전체 Fiber 트리를 순회하면서 업데이트가 필요한 부분을 체크합니다. 반면 Vue3는 실제로 변경된 상태를 사용하는 컴포넌트들만 정확히 알고 있어서, 불필요한 비교 작업을 하지 않습니다.

7. 렌더링 단계에서도 차이가 있습니다:
```javascript
// Vue3의 패치 알고리즘 (단순화된 버전)
function patch(n1, n2, container) {
  if (n1 && !isSameVNodeType(n1, n2)) {
    unmount(n1)
    n1 = null
  }

  const { type } = n2
  if (type === Text) {
    // 텍스트 노드 처리
  } else if (type === Fragment) {
    // Fragment 처리
  } else if (typeof type === 'object') {
    // 컴포넌트 처리
    processComponent(n1, n2, container)
  } else if (typeof type === 'string') {
    // 일반 엘리먼트 처리
    processElement(n1, n2, container)
  }
}
```

Vue3는 컴파일 시점에서 정적인 부분과 동적인 부분을 미리 구분해둡니다. 그래서 런타임에서는 동적인 부분만 비교하면 됩니다. 이는 React의 전체 트리 비교 방식과는 다른 접근법입니다.

마지막으로, 실제 DOM 업데이트는 다음과 같이 이루어집니다:
```javascript
function processElement(n1, n2, container) {
  if (n1 == null) {
    // 마운트
    mountElement(n2, container)
  } else {
    // 패치
    patchElement(n1, n2)
  }
}

function patchElement(n1, n2) {
  const el = (n2.el = n1.el)
  const oldProps = n1.props || {}
  const newProps = n2.props || {}

  // 1. 프롭스 업데이트
  patchProps(el, oldProps, newProps)
  
  // 2. 자식 노드들 업데이트
  patchChildren(n1, n2, el)
}
```

이러한 방식으로 Vue3는 반응형 시스템을 통해 정확히 어떤 부분이 변경되었는지 알고 있기 때문에, 필요한 최소한의 DOM 업데이트만 수행할 수 있습니다. React의 Fiber처럼 전체 트리를 순회하면서 비교할 필요가 없는 것이죠.

> 그럼 이 trigger 라는 함수가 실행되면 의존하는 모든 effect들을 트리거 한다는게 연관된 Proxy 객체들의 trigger 함수들이 연쇄적으로 호출되는건가?

trigger 함수의 동작 방식을 자세히 설명해드리겠습니다.

trigger 함수가 호출되면 직접적으로 연쇄적인 trigger 호출이 발생하지는 않습니다. 대신, 해당 속성에 의존하는 모든 effect들이 실행 큐에 추가됩니다. 이 과정을 코드로 살펴보면 이해가 더 쉬울 것 같네요:

```javascript
function trigger(target, key) {
  // 해당 target의 key에 의존하는 effect들의 집합을 가져옴
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  
  const dep = depsMap.get(key)
  if (!dep) return

  // 효과들을 실행 큐에 추가
  const effects = new Set(dep)
  effects.forEach(effect => {
    // 현재 실행 중인 effect와 같은 경우 무한 루프 방지
    if (effect !== activeEffect) {
      // effect를 직접 실행하지 않고 스케줄러에 추가
      if (effect.scheduler) {
        effect.scheduler()
      } else {
        queueJob(effect)
      }
    }
  })
}

// 작업 큐 관리
const queue = new Set()
let isFlushing = false
let isFlushPending = false

function queueJob(effect) {
  queue.add(effect)
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true
    // 다음 마이크로태스크에서 큐 처리
    Promise.resolve().then(flushJobs)
  }
}
```

이런 방식으로 작동하는 이유를 설명드리면:

1. 상태 변경의 전파
예를 들어 다음과 같은 코드가 있다고 가정해보겠습니다:

```javascript
const state = reactive({
  count: 0,
  doubled: computed(() => state.count * 2),
  message: computed(() => `Count is ${state.count}`)
})

// effect 1
watchEffect(() => console.log(state.doubled))
// effect 2
watchEffect(() => console.log(state.message))
```

state.count가 변경되면:
- count 속성의 set이 호출되어 trigger 실행
- doubled와 message computed 속성의 effect들이 큐에 추가됨
- 다음 마이크로태스크에서 이 effect들이 순차적으로 실행됨

2. 렌더링 최적화
Vue 컴포넌트의 경우:

```javascript
const MyComponent = {
  setup() {
    const state = reactive({ count: 0 })
    return { count: state.count }
  },
  template: `<div>{{ count }}</div>`
}
```

이 컴포넌트의 렌더 effect는 state.count에 의존하게 되고, count가 변경되면:
- 렌더 effect가 큐에 추가됨
- 여러 상태 변경이 동시에 발생하더라도 컴포넌트는 한 번만 리렌더링됨
- 실제 DOM 업데이트는 다음 마이크로태스크에서 일괄 처리됨

이러한 방식은 React의 batching과 비슷한 최적화를 제공하지만, 더 세밀한 수준에서 이루어집니다. React가 setState 호출을 배치로 처리한다면, Vue는 개별 속성의 변경과 그에 따른 효과들을 더 정확하게 추적하고 최적화할 수 있는 것이죠.

따라서 trigger는 연쇄적인 Proxy 호출이 아닌, 의존성 그래프를 따라 필요한 effect들을 실행 큐에 추가하는 역할을 합니다. 이렇게 큐를 사용하는 방식은 성능 최적화와 상태 일관성 유지에 매우 중요한 역할을 합니다.

> 그럼 이 effect 라는게 watch, compute와 같이 반응형 객체의 수정에 따라 동작하는 그런 함수들을 의미하는 거지? 마치 리액트의 useEffect나, useMemo와 같은 동작을 하는애들? 이렇게 동작하기에 의존성이라는게 필요없는거고?

네, 정확히 이해하셨습니다! Vue3의 effect는 개념적으로 React의 useEffect, useMemo와 비슷한 역할을 하지만, 구현 방식이 매우 다릅니다. 이 차이점을 자세히 살펴보면서 설명해드리겠습니다.

Vue3에서 effect는 반응형 상태의 변화에 반응해야 하는 모든 종류의 부수 효과(side effect)를 포함합니다. 예를 들어보겠습니다:

```javascript
// Vue3의 computed
const count = ref(0)
const doubled = computed(() => count.value * 2)

// 내부적으로 이렇게 구현됩니다
function computed(getter) {
  // computed 값 자체도 ref입니다
  const result = ref()
  
  // getter를 effect로 래핑합니다
  effect(() => {
    result.value = getter()
  }, {
    // computed는 lazy하게 동작해야 하므로 스케줄러를 사용합니다
    scheduler: () => {
      // 값이 실제로 필요할 때까지 계산을 지연시킵니다
      trigger(result, 'value')
    }
  })
  
  return result
}
```

Vue3의 watch도 비슷한 방식으로 effect를 사용합니다:

```javascript
// Vue3의 watch
const count = ref(0)
watch(count, (newValue, oldValue) => {
  console.log(`Count changed from ${oldValue} to ${newValue}`)
})

// 내부적으로 이런 식으로 구현됩니다
function watch(source, callback) {
  effect(() => {
    // source를 읽음으로써 의존성이 자동으로 추적됩니다
    const newValue = source.value
    callback(newValue, oldValue)
    oldValue = newValue
  })
}
```

React와의 핵심적인 차이점은 의존성 추적 방식입니다:

React에서는:
```javascript
// React - 의존성을 명시적으로 선언해야 합니다
useEffect(() => {
  console.log(`Count is ${count}`)
}, [count]) // 의존성 배열 필요

const doubled = useMemo(() => count * 2, [count]) // 여기도 의존성 배열 필요
```

Vue3에서는:
```javascript
// Vue3 - 의존성이 자동으로 추적됩니다
watchEffect(() => {
  console.log(`Count is ${count.value}`)
}) // 의존성 배열이 필요 없음

const doubled = computed(() => count.value * 2) // 의존성 배열이 필요 없음
```

이렇게 자동으로 의존성을 추적할 수 있는 이유는 Vue3의 Proxy 기반 반응형 시스템 때문입니다. 어떤 effect가 실행될 때, 그 안에서 접근하는 모든 반응형 속성들이 자동으로 추적됩니다. 이것은 마치 자바스크립트 엔진이 코드를 실행하면서 변수 접근을 추적하는 것과 비슷한 개념입니다.

컴포넌트의 렌더링 함수도 내부적으로는 하나의 effect입니다:
```javascript
// 컴포넌트 렌더링도 effect입니다
effect(() => {
  // 렌더링 중에 접근하는 모든 반응형 상태가 자동으로 추적됩니다
  const vnode = component.render()
  // 변경사항을 DOM에 적용
  patch(prevVNode, vnode)
})
```

이러한 설계는 개발자 경험을 크게 개선합니다. React에서 종종 발생하는 의존성 배열 누락이나 잘못된 의존성 선언으로 인한 버그를 원천적으로 방지할 수 있기 때문입니다. 또한 반응형 시스템이 정확히 어떤 효과가 어떤 상태에 의존하는지 알고 있어서, 불필요한 재계산이나 리렌더링을 더 효과적으로 방지할 수 있습니다.

> 근데 이 반응형 객체로 만들면 종속된, 네스팅된 값들까지 반응형이 되는거야? 얘를들어 a라는 반응형객체가 있는데, 이 a객체의 b 프로퍼티를 c라는 변수에 할당한다고 생각하면, b 프로퍼티가 네스팅된 객체이면 b 프로퍼티도 반응형이 되는거야?

Vue3의 반응형 시스템에서 네스팅된 객체의 동작을 이해하기 위해, 단계별로 살펴보겠습니다.

먼저 기본적인 예시를 통해 확인해보겠습니다:

```javascript
const original = {
  a: 1,
  b: {
    c: 2,
    d: {
      e: 3
    }
  }
}

// reactive로 반응형 객체 생성
const state = reactive(original)

// b 프로퍼티를 다른 변수에 할당
const extracted = state.b
console.log(isReactive(extracted)) // true가 출력됩니다!
```

Vue3의 reactive()는 깊은(deep) 변환을 수행합니다. 이는 객체의 모든 중첩된 속성들도 자동으로 반응형이 된다는 의미입니다. 이것이 어떻게 동작하는지 내부 구현을 살펴보면:

```javascript
function reactive(target) {
  // 이미 반응형인 객체는 그대로 반환
  if (isReactive(target)) {
    return target
  }

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      // 특별한 내부 플래그를 확인하는 부분
      if (key === '__v_isReactive') {
        return true
      }

      const value = Reflect.get(target, key, receiver)
      
      // 의존성 추적
      track(target, key)
      
      // 중요! 반환하기 전에 값이 객체인 경우 reactive로 감싸줍니다
      return value && typeof value === 'object' 
        ? reactive(value) 
        : value
    },
    // ... 다른 핸들러들
  })

  return proxy
}
```

하지만 여기서 주의할 점이 있습니다. ref나 reactive로 만든 반응형 객체의 속성을 구조 분해 할당하면 반응성을 잃게 됩니다:

```javascript
const state = reactive({
  b: {
    c: 2
  }
})

// 이렇게 하면 반응성이 유지됩니다
const extracted = state.b

// 하지만 이렇게 하면 반응성을 잃습니다!
const { b } = state
console.log(isReactive(b)) // false가 출력됩니다

// 이것도 반응성을 잃습니다!
const { c } = state.b
```

이러한 동작의 이유는 자바스크립트의 참조 방식과 관련이 있습니다. 반응형 객체의 프로퍼티에 접근할 때는 Proxy의 get 트랩이 동작하여 중첩된 객체도 반응형으로 만들어주지만, 구조 분해 할당은 값을 복사하기 때문에 Proxy와의 연결이 끊어지게 됩니다.

이런 문제를 해결하기 위해 Vue3는 toRef와 toRefs라는 유틸리티를 제공합니다:

```javascript
const state = reactive({
  b: {
    c: 2
  }
})

// toRef를 사용하면 반응성을 유지한 채로 속성을 추출할 수 있습니다
const bRef = toRef(state, 'b')
// 또는 모든 속성을 한번에 변환
const stateRefs = toRefs(state)

// 이제 구조 분해 할당을 해도 반응성이 유지됩니다
const { b } = stateRefs
```

이러한 설계는 Vue3가 반응형 시스템을 통해 데이터의 변화를 정확하게 추적하면서도, 자바스크립트의 일반적인 사용 패턴을 자연스럽게 지원할 수 있게 해줍니다. 복잡한 객체 구조에서도 반응성이 끊어지지 않고 유지되므로, 개발자가 데이터의 변화를 더 쉽게 관리할 수 있게 됩니다.

  
> ref는 ref 자체가 반응형이라 괜찮은거지? ref.value에 할당된 값들이 계속해서 변해도 ref 자체가 프록시 인거 같은데. 만약 이 ref.value가 아닌 ref 자체를 변경하는 할당이 일어나면 이거는 반응성을 잃게 되는거지?

네, 정확히 이해하셨습니다! ref의 동작 원리를 자세히 살펴보면서 설명해드리겠습니다.

ref는 내부적으로 이런 구조로 구현되어 있습니다:

```javascript
function ref(value) {
  // ref 객체가 이미 주어진 경우 그대로 반환
  if (isRef(value)) {
    return value
  }

  // ref는 내부적으로 단일 value 속성을 가진 객체입니다
  const r = {
    __v_isRef: true, // ref 여부를 판단하는 플래그
    get value() {
      track(r, 'value') // value 읽기 추적
      return value
    },
    set value(newVal) {
      // 값이 변경된 경우에만 트리거
      if (hasChanged(value, newVal)) {
        value = newVal
        trigger(r, 'value')
      }
    }
  }

  return r
}
```

이제 여러 시나리오를 살펴보겠습니다:

1. ref.value 변경 - 반응성 유지
```javascript
const count = ref(0)
const double = computed(() => count.value * 2)

// 이 경우 반응성이 정상적으로 동작합니다
count.value = 1 // double은 자동으로 2가 됩니다
```

2. ref 자체를 재할당 - 반응성 상실
```javascript
let count = ref(0)
const double = computed(() => count.value * 2)

// ref 자체를 재할당하면 반응성 연결이 끊어집니다
count = ref(1) // double은 업데이트되지 않습니다!
```

이것이 발생하는 이유는 자바스크립트의 변수 할당 방식 때문입니다. ref 객체를 가리키던 참조가 새로운 ref 객체로 바뀌어버리기 때문에, 이전에 설정된 의존성 관계가 모두 끊어지게 됩니다.

이를 시각적으로 표현하면:

```javascript
// 초기 상태
let count = ref(0)
// 메모리: count -> Ref{value: 0} <- (computed effect가 이 ref를 추적 중)

// ref 재할당 후
count = ref(1)
// 메모리: count -> Ref{value: 1} (새로운 ref, 아무도 추적하지 않음)
//        이전 Ref{value: 0} <- (computed effect는 여전히 이전 ref를 보고 있음)
```

이러한 문제를 피하기 위한 몇 가지 패턴이 있습니다:

1. ref를 항상 const로 선언하기
```javascript
const count = ref(0) // 이제 ref 자체는 재할당할 수 없습니다
```

2. 객체 내부에 ref를 넣어서 사용하기
```javascript
const state = reactive({
  count: ref(0)
})

// 이제 state.count는 반응형을 유지합니다
// state 자체가 반응형이기 때문에 내부의 ref도 추적됩니다
```

Vue의 컴포지션 API에서는 일반적으로 setup 함수 내에서 ref를 선언하고 반환하는 패턴을 사용합니다:

```javascript
export default {
  setup() {
    const count = ref(0)
    
    // count ref를 반환하면 템플릿에서 자동으로 언래핑됩니다
    return { count }
  }
}
```

이러한 설계는 Vue가 반응형 값을 안전하게 관리하면서도, 필요할 때 값을 쉽게 변경할 수 있도록 해줍니다. ref.value를 통한 접근은 약간 장황해 보일 수 있지만, 이는 의도적인 설계로, 반응형 값의 변경을 명시적으로 만들어 코드의 예측 가능성을 높여줍니다.

> 만약에 ref.value.a.b를 computed로 감싸면 어떻게 되는거야? 이 경우 반응형으로 동작하지 못할거 같은데?

아주 좋은 질문입니다! ref.value.a.b와 같은 중첩된 참조를 computed로 감싸는 경우를 자세히 살펴보겠습니다.

먼저 예시 코드로 상황을 만들어보겠습니다:

```javascript
const data = ref({
  a: {
    b: 1
  }
})

// computed로 중첩된 값 참조
const computedB = computed(() => data.value.a.b)
```

이 경우 실제로는 반응형이 정상적으로 동작합니다! 그 이유를 단계별로 설명해드리겠습니다:

1. ref의 내부 동작
```javascript
const data = ref({...})
// 이때 ref 내부에서는 다음과 같은 일이 일어납니다:
// 1. value getter가 호출될 때 track(data, 'value') 실행
// 2. value 프로퍼티가 객체일 경우 reactive()로 자동 래핑됨
```

2. computed의 실행 과정
```javascript
computed(() => {
  // 1. data.value 접근 시 ref의 track 동작
  // 2. value가 반환될 때 이미 reactive로 래핑된 객체가 반환됨
  // 3. .a.b 접근 시 reactive 객체의 get 트랩이 동작하여 각각 추적됨
  return data.value.a.b
})
```

이것이 동작하는 구체적인 예시를 보겠습니다:

```javascript
const data = ref({
  a: {
    b: 1
  }
})

const computedB = computed(() => data.value.a.b)

// 이런 모든 변경사항이 computedB에 반영됩니다
data.value.a.b = 2  // 동작함
data.value.a = { b: 3 }  // 동작함
data.value = { a: { b: 4 } }  // 동작함

// 반응형이 동작하지 않는 경우는:
let extracted = data.value.a
extracted.b = 5  // 이렇게 하면 반응형 연결이 끊어집니다
```

하지만 주의해야 할 몇 가지 엣지 케이스가 있습니다:

1. 구조 분해 할당을 사용할 경우:
```javascript
const data = ref({
  a: {
    b: 1
  }
})

// 이렇게 하면 반응형이 깨집니다!
const { a } = data.value
const computedB = computed(() => a.b)  // 반응형 동작 안 함
```

2. 중간 참조를 변수에 저장할 경우:
```javascript
const data = ref({
  a: {
    b: 1
  }
})

// 이것도 반응형이 깨집니다!
const aObj = data.value.a
const computedB = computed(() => aObj.b)  // 반응형 동작 안 함
```

이러한 문제를 해결하기 위한 안전한 패턴들이 있습니다:

1. 전체 참조 경로를 computed 내에서 유지하기:
```javascript
// 안전한 방법
const computedB = computed(() => data.value.a.b)
```

2. toRef를 사용하여 특정 경로를 참조하기:
```javascript
// 이것도 안전합니다
const bRef = toRef(() => data.value.a.b)
const computedB = computed(() => bRef.value)
```

이러한 이해를 바탕으로, Vue3에서 복잡한 중첩 구조를 다룰 때는 다음과 같은 원칙을 따르는 것이 좋습니다:

1. 가능한 한 전체 참조 경로를 유지하기
2. 중간 참조를 저장해야 할 경우 toRef나 computed를 사용하기
3. 구조 분해 할당이 필요한 경우 toRefs를 사용하기

이렇게 하면 반응형 시스템의 모든 이점을 안전하게 활용할 수 있습니다.

> 만약에 그럼 다음과 같은 경우는?
> 
> A 컴포넌트에서 B 컴포넌트로 ref.a.b를 전달함 B 컴포넌트에서 전달받은 props를 computed로 감쌈
> 
> 이 경우도 정상 동작하나?

아주 좋은 질문입니다! props로 전달되는 ref의 동작을 이해하기 위해, 구체적인 예시를 통해 살펴보겠습니다. 여러 가지 시나리오를 단계별로 분석해보겠습니다.

먼저 기본적인 컴포넌트 구조를 살펴보겠습니다:

```javascript
// ParentComponent.vue
const data = ref({
  a: {
    b: 1
  }
})

<template>
  <ChildComponent :propB="data.a.b" />
  <!-- 또는 -->
  <ChildComponent :propData="data" />
</template>

// ChildComponent.vue
const props = defineProps(['propB'])
// 또는
const props = defineProps(['propData'])

const computedValue = computed(() => props.propB)
// 또는
const computedValue = computed(() => props.propData.a.b)
```

여기서 중요한 점은 Vue의 props 시스템이 어떻게 동작하는지 이해하는 것입니다. Vue는 props를 전달할 때 다음과 같은 규칙을 따릅니다:

1. 단순 값(primitive) 전달의 경우:
```javascript
// ParentComponent.vue
<ChildComponent :propB="data.a.b" />

// ChildComponent.vue
const computedValue = computed(() => props.propB)
```
이 경우, props는 단순히 값을 복사하여 전달하므로 반응형이 유지되지 않습니다. 부모 컴포넌트에서 data.a.b가 변경되면 props는 새로운 값을 받지만, 자식 컴포넌트의 computed는 props 자체의 변화만 감지할 수 있습니다.

2. 객체나 ref 전체를 전달하는 경우:
```javascript
// ParentComponent.vue
<ChildComponent :propData="data" />

// ChildComponent.vue
const computedValue = computed(() => props.propData.value.a.b)
```
이 경우는 반응형이 정상적으로 유지됩니다. 참조가 전달되므로 원본 ref의 반응형 시스템이 그대로 동작합니다.

만약 안전하게 props의 반응형을 유지하고 싶다면, 다음과 같은 패턴을 사용할 수 있습니다:

```javascript
// ParentComponent.vue
const data = ref({
  a: {
    b: 1
  }
})

// toRef를 사용하여 특정 경로에 대한 ref를 생성
const bRef = toRef(() => data.value.a.b)

<template>
  <ChildComponent :propB="bRef" />
</template>

// ChildComponent.vue
const props = defineProps(['propB'])
const computedValue = computed(() => props.propB.value)
```

또는 더 현대적인 방식으로 컴포지션 API를 활용할 수 있습니다:

```javascript
// ParentComponent.vue
const data = ref({
  a: {
    b: 1
  }
})

// ChildComponent.vue
// props를 defineProps 대신 withDefaults를 사용하여 타입 안전성 확보
const props = withDefaults(defineProps<{
  propData: Ref<{ a: { b: number } }>
}>(), {})

// computed 대신 toRef를 사용하여 더 안전하게 참조
const bValue = toRef(() => props.propData.value.a.b)
```

실제 개발 시에는 다음과 같은 점들을 고려하는 것이 좋습니다:

1. 가능하면 전체 ref 객체를 전달하고, 자식 컴포넌트에서 필요한 부분을 참조하는 것이 안전합니다.
2. 특정 중첩된 값만 전달해야 할 경우, toRef를 사용하여 반응형 참조를 만들어 전달합니다.
3. props로 받은 값을 computed로 변환할 때는, 원본 데이터의 반응형이 유지되는지 항상 확인해야 합니다.

이러한 패턴을 따르면 컴포넌트 간의 데이터 전달에서도 반응형을 안전하게 유지할 수 있습니다.