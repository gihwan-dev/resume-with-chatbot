# Font Optimization

`next/font` 는 자동적으로 폰트를 최적화 해주며 (커스텀 폰트 포함) 개인 정보 보호 와 성능을 위해 외부 네트워크 요청을 제거해준다.

`next/font` 는 **built-in automatic self-hosting** 을 지원한다. 이는 CSS `size-adjust` 프로퍼티를 사용해 레이아웃의 변경 없이 웹 폰트를 선택적으로 불러올 수 있다는 것을 의미한다.

이 새로운 폰트 시스템을 사용하면 성능과 개인 정보 보호를 염두에 두고 모든 구글 폰트를 편리하게 사용할 수 있다. CSS 와 폰트 파일이 빌드 타임에 다운로드 되며 다른 정적 자산(assets)과 함께 self-host 된다. **브라우저로부터 구글에게 어떤 요청도 보내지 않는다.**

---

## Google Fonts

자동적으로 어떤 구글 폰트든 self-host 한다. 폰트는 배포에 포함되며 배포 환경과 같은 도메인에서 제공된다. **브라우저에서 구글로 어떤 요청도 보내지 않는다.**

시작하기 위해서 우선 `next/font/google` 에서 함수의 형태로 폰트를 불러 온다. 유연성과 성능을 위해 변수형 폰트를 사용하는것을 추천한다.

```tsx
import { Inter } from 'next/font/google'
 
// If loading a variable font, you don't need to specify the font weight
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

만약 변수형 폰트를 사용할 수 없다면, **weight 를 특정해주면 해결될 수 있다.**

```tsx
import { Roboto } from 'next/font/google'
 
const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={roboto.className}>
      <body>{children}</body>
    </html>
  )
}
```

배열을 사용해서 다음과 같이 다양한 스타일과 weight 를 특정해줄 수 있다:

```tsx
const roboto = Roboto({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})
```

- **Good to know**
    
    여러 단어로 명명된 폰트를 위해 underscore(_)를 사용해라.
    

## Specifying a subset

구글 폰트는 자동적으로 하위 집합이다. 이는 폰트 파일의 사이즈를 줄여주고 성능을 향상 시켜 준다. 어떤 하위집합을 preload 할지를 정의 해야 한다. 그렇지 않으면 `preload` 가 `true` 의 값을 가진다면 경고를 보여주게 된다.

```tsx
const inter = Inter({ subsets: ['latin'] })
```

## Using Multiple Fonts

#Nextjs 