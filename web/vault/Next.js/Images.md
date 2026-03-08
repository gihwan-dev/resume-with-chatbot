## Image Optimization

이미지는 웹사이트의 페이지 무게에 아주 많은 부분을 차지한다. 또한 웹사이트의 LCP 퍼포먼스에 큰 영향을 줄 수 있다.

- LCP란?
    
    Largest Contentful Paint 의 약어로 뷰포트에 가장 큰 블록의 컨텐츠가 표시되기까지 걸리는 시간을 의미한다.
    

Next.js의 이미지 컴포넌트는 `<img>` 태그를 기반으로 하며 다음과 같은 이미지 최적화를 제공한다:

- **Size Optimization**: WebP 나 AVIF과 같은 현대 이미지 형식을 사용하여 각 디바이스를 위한 자동 이미지 크기 조정을 제공한다.
- **Visual Stability**: 이미지가 로딩될 때 자동으로 레이아웃이 변경되는 것을 방지해준다.
- **Faster Page Loads**: 브라우저의 lazy loading을 사용하여 뷰포트에 들어갔을 때 이미지가 load된다. 선택적 blur-up placeholder도 제공된다.
- **Asset Flexibility**: 이미지가 외부 서버에서 수집되더라도 On-demand 이미지 resizing을 지원한다.

---

## Usage

```tsx
import Image from "next/image"
```

이후 Image 컴포넌트의 `src` 를 정의해주면 된다.

## Local Images

로컬 이미지를 사용하기 위해서, `.jpg` , `.png` 또는 `.webp` 이미지 파일을 불러와라.

Next.js가 import 된 파일에 기반해 자동적으로 `width` 와 `height` 를 정의해줄 것이다. 이 값은 이미가 로딩될 때 **Cumulative Layout Shift** 를 방지하기 위해 사용된다.

- Cumulative Layout Shift 란?
    
    **Cumulative Layout Shift (CLS)** metric이란 사이트의 전체적 안정성을 측정한 것이다. 사이트의 예측하지 못한 변경은 유저가 예상치 못한 에러를 발생 시키도록 할 수 있고 혼란을 준다.
    

```tsx
import Image from 'next/image'
import profilePic from './me.png'
 
export default function Page() {
  return (
    <Image
      src={profilePic}
      alt="Picture of the author"
      // width={500} automatically provided
      // height={500} automatically provided
      // blurDataURL="data:..." automatically provided
      // placeholder="blur" // Optional blur-up while loading
    />
  )
}
```

- **Warning**: 동적 `await import()` 와 `require()` 는 지원되지 않는다. `import` 는 반드시 정적 이여야 한다. 그래야 빌드 타임에 평가될 수 있다.

## Remote Images

외부 이미지를 사용하기 위해서, `src` 프로퍼티는 URL 문자열이여야 한다.

Next.js는 build time 과정에 외부 파일에 대한 접근 권한이 없기 때문에, `width` 와 `height` 그리고 선택점으로 `blurDataURL` 프로퍼티를 수동적으로 정의해주어야 한다.

`width` 와 `height` 속성은 이미지의 정확한 비율을 추론하기 위해 사용되며 이미지지를 로딩할 때 레이아웃이 변경되는것을 피하기위해 사용된다. `width` 와 `height` 는 이미지 파일의 render되는 사이즈를 결정하지 않는다.

```tsx
import Image from 'next/image'
 
export default function Page() {
  return (
    <Image
      src="<https://s3.amazonaws.com/my-bucket/profile.png>"
      alt="Picture of the author"
      width={500}
      height={500}
    />
  )
}
```

안전하게 이미지를 최적화하기 우해서, `next.config.js` 파일에 URL 패턴의 리스트를 정의해라. 고의적인 사용을 방지하기 위해 가능한 자세하게 설정해야 한다. 예를들어, 아래 설정은 오직 AWS S3 에서 오는 이미지만 허용한다.

```tsx
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        port: '',
        pathname: '/my-bucket/**',
      },
    ],
  },
}
```

## Domains

때때로 외부 이미지를 Next.js built-in 이미지 최적화 API를 사용해서 최적화 하고 싶을 수 있다. 이를 위해서 `loader` 를 기본 설정으로 두고 절대 경로를 이미지 `src` 프로퍼티에 전달해라.

유저의 악의적인 앱 사용을 방지하기 위해서, 외부 호스트 들의 리스트를 정의해야 한다.

## Loaders

loader는 이미지를 위한 URL들을 발생시켜주는 함수다. 제공된 `src` 를 수정하고 다른 사이즈들의 여러 이미지 요청에 대한 URL들을 생성한다. 이 여러개의 URL들은 `srcset` 을 자동으로 생성하기 위해사용되고, 사이트의 방문자는 뷰포트의 사이즈에 적합한 이미지를 받게 된다.

Next.js의 기본 loader는 built-in 최적화 API를 사용하여 어떤 웹에서 이미지가 오더라도 최적화 하고, Next.js 서버에서 직접적으로 제공한다. 만약 이미지를 CDN으로 부터 또는 이미지 서보로부터 제공하고 싶다면 자바스크립트 몇 줄 적으면 된다.

`loader` 프로퍼티를 통해 이미지 마다 loader를 정의해줄 수 있고 `loaderFile` 설정을 통해 앱 레벨에서 설정해 줄 수 있다.

---

## Priority

각 페이지마다 존재하는 **Largest Contentful Paint (LCP) element** 에 `priority` 프로퍼티를 추가해주어야 한다. 그렇게 함으로써 Next.js는 이미지 로딩을 우선순위화하고, 이는 의미있는 LCP의 상승을 갖온다.

LCP 요소는 주로 페이지의 뷰포트에 보이는 가장 큰 이미지 또는 text 블록이다. `next dev` 를 실행시킬 때, LCP 요소에 `priority` 프로퍼티가 없다면 console에서 경고하는 것을 볼 수 있을거다.

LCP 이미지를 특정하고 나면, 프로퍼티를 다음과 같이 추가할 수 있다.

```tsx
import Image from "next/image";
import profilePic from "../public/me.png"

export default function Page() {
  return <Image src={profilePic} alt="Picture of the author" priority />
}
```

---

## Image Sizing

이미지가 퍼포먼스가 부정적인 영향을 주는 가장 은한 경우는 layout shift다. 이미지가 load되면서 주변에 있는 요소들을 밀어 내면서 생긴다. 이러한 성능 문제는 유저에게 아주 짜증나는 문제이기에, **Cumulative Layout Shift** 라 불리는 Core Web Vital이 있다. 이미지에 기반한 레이아웃 변경을 피하는 방법은 항상 이미지의 사이즈를 정해두는 것이다. 이는 브라우저가 이미지가 불러와지기 전에 적절한 사이즈를 차지하도록 한다.

- **Core Web Vital**이란?
    
    구글에서 제안한 웹사이트의 사용자 경험을 측정하는 새로운 메트릭스다. 이들은 웹 페이지의 성능과 사용자 경험을 측정하는 데 중요하며, 느린 웹사이트를 개선하는 데 도움이 될 수 있다. Core Web Vitals는 다음의 세 가지 메트릭스로 구성된다.
    
    1. **Largest Contentful Paint(LCP)**: LCP는 페이지 로딩 성능을 측정한다. 이는 사용자가 페이지에 접속 했을 때 가장 큰 콘텐츠가 화면에 표시되는데 걸리는 시간을 의미한다. 좋은 LCP 점수를 얻기 위해서는 페이지의 주요 콘텐츠가 2.5초 이내에 로드되어야 한다.
    2. **First Input Delay (FID)**: FID는 페이지의 상호작용성을 측정한다. 즉, 사용자가 페이지에서 어떤 작업을 수행하려 할 때 페이지가 그 작업에 얼마나 빠르게 반응하는지를 측정하는 것이다. 좋은 FID 점수를 얻기 위해서는 페이지가 사용자의 첫 번째 입력에 100밀리초 이내에 반응해야 한다.
    3. **Cumulative Layout Shift (CLS)**: CLS는 페이지의 시각적 안정성을 측정한다. 이는 페이지의 요소가 얼마나 자주 레이아웃이 변경되는지(즉, “밀리는” 지)를 측정하는 것이다. 좋은 CLS 점수를 얻기 위해서는 페이지의 레이아웃 이동이 가능한 적어야 한다.
    
    이 세 가지 메트릭스는 사용자 경험을 중심으로 하고 있으며, Google은 이들을 검색 엔진 최적화(SEO)에 중요한 요소로 고려하고 있다. 즉, 이 메트릭스를 개선함으로써 웹사이트의 검색 엔진 순위를 향상시킬 수 있다.
    

`next/image` 는 좋은 성능 겨로가를 보장하도록 설계 되었기 때문에, 레이아웃 변경을 일으키는 방법으로는 사용될 수 없다, 또한 다음과 같은 세 방식 중 하나의 방법으로 크기를 설정해주어야 한다:

1. 자동적: static import 를 사용한다.
2. 명식적: `width` 와 `height` 를 포함한다.
3. 절대적: **fill**을 사용해 이미지가 부모 요소를 채울 때 까지 확장하도록 한다.

- **만약 사이즈의 이미지를 모른다면?**
    
    만약 이미지의 사이즈에 대한 정보가 없다면 다음과 같은 방식을 취할 수 있다: **Use `fill`**
    
    `fill` 프로퍼티는 부모 요소의 사이즈를 채우도록 한다. CSS를 사용해 페이지에 `sizes` 프로퍼티를 이용해 이미지의 부모 요소의 공간을 부여해라. `object-fill` 의 값을 `fill`, `contain`, `cover` , `object-position` 을 사용해 해당 공간을 이미지가 어떻게 차지 할 것인지에 대해 결정할 수 있다.
    
    **Normalize your images**
    
    만약 컨트롤 할 수 있는 소스로부터 이미지를 전달받고 있다면, 이미지의 파이프라인을 변경해 이미지를 특정한 사이즈로 normalize 해라.
    
    **Modify your API calls**
    
    만약 API 를 호출해 이미지를 전달받고 있다면, API 의 설정을 통해 이미지의 사이즈를 조정할 수 있을 것이다.
    

이 모든 방법들이 제대로 동작하지 않는다면, `<img>` 태그를 사용하면 된다.

---

## Styling

이미지 컴포넌트를 스타일링 하는것은 평범한 `<img>` 요소를 스타일링 하는것과 유사하지만, 중요한 가이드라인 몇가지가 있다:

- `styled-jsx` 가 아닌 `className`, `style` 을 사용해라.
    - 대부분의 경우 `className` 을 사용하는 것을 추천한다.
    - 인라인 스타일을 적용하기 위해 `style` 을 사용할 수 있다.
    - **styled-jsx**는 현재 컴포넌트에만 스코프가 맞춰지기 때문에 사용할 수 없다.
- `fill` 을 사용할 때, 부모 요소는 반드시 `position: relative` 를 가져야 한다.
    - 이는 이미지를 적절하게 렌더링하기 위해 필수적인 요소다.
- `fill`을 사용할 때, 부모 요소는 반드시 `display: block` 를 가져야 한다.
    - 이는 `<div>` 태그의 디폴트 설정이지만, 그렇지 않으면 반드시 설정해줘야 한다.

---

## Examples

### Responsive

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/42fb3bb3-37d5-4587-a4fd-bda9c0cf259b/Untitled.png)

```tsx
import Image from 'next/image'
import mountains from '../public/mountains.jpg'
 
export default function Responsive() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Image
        alt="Mountains"
        // Importing an image will
        // automatically set the width and height
        src={mountains}
        sizes="100vw"
        // Make the image display full width
        style={{
          width: '100%',
          height: 'auto',
        }}
      />
    </div>
  )
}
```

### Fill Container

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/88771086-dc52-4412-aaf7-7f84a16d7409/Untitled.png)

```tsx
import Image from 'next/image'
import mountains from '../public/mountains.jpg'
 
export default function Fill() {
  return (
    <div
      style={{
        display: 'grid',
        gridGap: '8px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, auto))',
      }}
    >
      <div style={{ position: 'relative', height: '400px' }}>
        <Image
          alt="Mountains"
          src={mountains}
          fill
          sizes="(min-width: 808px) 50vw, 100vw"
          style={{
            objectFit: 'cover', // cover, contain, none
          }}
        />
      </div>
      {/* And more images in the grid... */}
    </div>
  )
}
```

### Background Image

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/786727ee-c787-4c1d-8211-a30081931f69/Untitled.png)

```tsx
import Image from 'next/image'
import mountains from '../public/mountains.jpg'
 
export default function Background() {
  return (
    <Image
      alt="Mountains"
      src={mountains}
      placeholder="blur"
      quality={100}
      fill
      sizes="100vw"
      style={{
        objectFit: 'cover',
      }}
    />
  )
}
```

---

#Nextjs 