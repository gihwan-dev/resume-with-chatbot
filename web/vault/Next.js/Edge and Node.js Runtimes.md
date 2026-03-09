Next.js에서 runtime이란 코드가 실행되는 동안 사용가능한 기능들과 API, 라이브러리들의 집합을 의미한다.

Next.js 는 다음 두 서버 런타임을 가진다.

- **Node.js Runtime**
- **Edge Runtime**

각각의 런타임은 자신들만의 API들을 가지고 있다. 두 런타임 모두 개발 인프라에 따라 streaming을 지원할 수 있다.

기본적으로, **app** 디렉터리는 Node.js 런타임을 사용한다. 하지만 라우트 마다 다른 런타임을 설정해줄 수 있다.

---

## Runtime Differences

런타임을 선택할 때 만은 고려사항들이 있다. 아래 표는 주요한 차이점을 보여준다.

![[Pasted image 20230914222132.png]]

## Edge Runtime

Next.js 에서 Edge 런타임은 사용 가능한 Node.js API들의 서브셋이다.

엣지 런타임은 동적이고 개인적인 컨텐츠를 적은 레이턴시로 전달하고자 할 때 가장 이상적이다. 엣지 런타임은 자원의 사용을 최소화하기 때문에 빠르다. 하지만 제한 사항이 많다.

예를들어 Vercel의 엣지 런타임에서 실행되는 코드는 1 ~ 4MB 를 초과할 수 없다. 이러한 제한은 패키지를 불러오는 것과, 폰트, 파일, 개발 인프라에 따라 다양하다.

## Node.js Runtime

Node.js 런타임을 사용하면 모든 Node.js API들을 사용할 수 있으며, 그것들에 의존하는 Npm 패키지들도 사용할 수 있다. 하지만 엣지 런타임만큼 빠르지 않다.

Next.js 앱을 Node.js 서버에 배포하는 것은 인프라를 설정하고, 관리하는 등의 추가적인 작업들을 요구한다. 대신 Vercel과 같은 서버리스 앱에 배포하면 이러한 작업을 대신해주게 된다.

## Serverless Node.js

서버리스는 엣지 런타임보다 더 복잡한 연산의 load가 다루어질 필요가 있고, 확장성 있는 런타임이 필요한 경우 이상적이다.

단점은 엣지 런타임 보다는 느리다는 것이다.

---

## Examples

### Segment Runtime Option

Next.js 앱에서 각 라우트 세그먼트에 알맞는 런타임을 지정해줄 수 있다. 그렇게 하기 위해서 `runtime` 이라는 이름의 변수를 선언하고 export 해주면 된다. 변수는 문자열을 값으로 가져야 하고 `'nodejs'` 또는 `'edge'` 둘 중 하나의 값을 가져야 한다.

다음 예제는 `'edge'` 런타임 변수를 export 하는 라우트 세그먼트 페이지를 보여준다:

```tsx
// app/page.tsx
export const runtime = 'edge'; // 'nodejs' (default) | 'edge'
```

만약 런타임 변수가 설정되지 않는다면 기본으로 `nodejs` 런타임이 사용된다.

#Nextjs 