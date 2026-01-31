import { Font } from "@react-pdf/renderer"

const CDN_BASE =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static"

let registered = false

export function registerFonts() {
  if (registered) return
  registered = true

  Font.register({
    family: "Pretendard",
    fonts: [
      { src: `${CDN_BASE}/Pretendard-Regular.otf`, fontWeight: 400 },
      { src: `${CDN_BASE}/Pretendard-SemiBold.otf`, fontWeight: 600 },
      { src: `${CDN_BASE}/Pretendard-Bold.otf`, fontWeight: 700 },
    ],
  })

  Font.registerHyphenationCallback((word) => [word])
}
