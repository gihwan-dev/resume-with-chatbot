Next.js는 여러 언어를 통한 컨텐트의 렌더링과 라우팅을 설정할 수 있도록 해준다.

---

## 용어

- **Locale**: 언어와 formatting preferences 의 set를 위한 식별자. 이는 주로 유저의 선호하는 언어와 그들의 지리학적 위치를 포함한다.
    - `en-US`: english - United States.
    - `nl-NL`: Dutch - Netherlands.
    - `nl`: Dutch, no region

---

## Routing Overview

어떤 locale 를 선택할지 고르기 위해 브라우저에서 유저의 언어 선호도를 사용하는것은 좋은 예제다. 선호되는 언어를 변경하면 들어오는 `Accept-Language` 가 변경될 것이다.

예를들어 다음과 같은 라이브러리를 사용하면, `Headers` 를 통해 어떤 locale을 선택할지 확인하기 위해 `Request` 를 살펴볼 수 있다. 그것을 통해 어떤 locale 을 선택하고 지원할지에 대해서 설정할 수 있게 된다.

```tsx
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
 
let headers = { 'Accept-Language': 'en-US,en;q=0.5' };
let languages = new Negotiator(headers).languages();
let locales = ['en-US', 'nl-NL', 'nl'];
let defaultLocale = 'en-US';
 
match(languages, locales, defaultLocale); // -> 'en-US'
```

라우팅은 하위 경로(`/fr/products` 또는 도메인 `my-site.fc/products` 을 통해 국제화 될 수 있다. 이제 이 정보를 사용하여 미들웨어 내부의 locale에 따라 사용자를 리디렉션할 수 있다.

```tsx
import { NextResponse } from 'next/server'
 
let locales = ['en-US', 'nl-NL', 'nl']
 
// Get the preferred locale, similar to above or using a library
function getLocale(request) { ... }
 
export function middleware(request) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )
 
  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
 
    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return NextResponse.redirect(
      new URL(`/${locale}/${pathname}`, request.url)
    )
  }
}
 
export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
}
```

마지막으로, `app/` 의 모든 예약 파일들이 `app/[lang]` 안에 중첩되도록 한다. 이것은 Next.js 라우터가 동적으로 다른 Locale을 다룰 수 있도록 해준다. 그리고 모든 레이아웃과 페이지로 `lang` 파라미터를 전해준다.

```tsx
// You now have access to the current locale
// e.g. /en-US/products -> `lang` is "en-US"
export default async function Page({ params: { lang } }) {
  return ...
}
```

---

## Localization

표시되는 컨텐츠를 유저의 Locale에 따라 다르게 할 수 있다. 아래에 설명되는 패턴은 모든 웹 앱에서 동일하게 동작할 것이다.

우리가 영어와 한국어를 앱에서 지원하고 싶다고 가정하자. 우리는 다음과 같이 다른 두 개의 ‘딕셔너리’를 관리할 수 있다:

```tsx
{
  "products": {
    "cart": "Add to Cart"
  }
}
```

```tsx
{
	"products": {
		"cart": "장바구니에 추가하기"
	}
}
```

우리는 `getDictionary` 함수를 생성해서 locale에 알맞는 딕셔너리를 가져올 수 있다:

```tsx
import 'server-only';
 
const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  nl: () => import('./dictionaries/nl.json').then((module) => module.default),
};
 
export const getDictionary = async (locale) => dictionaries[locale]();
```

이후 현재 선택된 언어에 기반한 딕셔너리를 레이아웃 또는 페이지에 전달하면 된다.

```tsx
import { getDictionary } from './dictionaries';
 
export default async function Page({ params: { lang } }) {
  const dict = await getDictionary(lang); // en
  return <button>{dict.products.cart}</button>; // Add to Cart
}
```

`app/` 의 레이아웃과 페이지들은 기본적으로 서버 컴포넌트이기 때문에 이러한 변환 과정이 자바스크립트 번들의 사이즈를 키울까봐 걱정할 필요가 없다. 이 코드는 오직 **서버에서만 실행** 된다.

---

## Static Generation

주어진 locale에 따라 정적 라우트를 생성하기 위해서, `generateStaticParams` 를 사용할 수 있다. 예를들어 루트 레이아웃에서:

```tsx
export async function generateStaticParams() {
  return [{ lang: 'en-US' }, { lang: 'de' }];
}
 
export default function Root({ children, params }) {
  return (
    <html lang={params.lang}>
      <body>{children}</body>
    </html>
  );
}
```

#Nextjs 