// @ts-check
import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"
import vercel from "@astrojs/vercel"
import sentry from "@sentry/astro"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"

const tailwindPlugin = /** @type {any} */ (tailwindcss())

// https://astro.build/config
export default defineConfig({
  site: "https://resume-with-ai.gihwan-dev.com",
  adapter: vercel(),
  integrations: [
    react(),
    mdx(),
    sitemap(),
    sentry({
      sourceMapsUploadOptions: {
        enabled: !!process.env.SENTRY_AUTH_TOKEN,
        org: "gihwan",
        project: "resume-with-ai",
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    }),
  ],

  vite: {
    plugins: [tailwindPlugin],
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    define: {
      __SENTRY_DEBUG__: false,
      __SENTRY_TRACING__: false,
    },
  },
})
