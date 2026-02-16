import path from "node:path"
import { loadEnv } from "vite"
import { defineConfig } from "vitest/config"

export default defineConfig(({ mode }) => {
  // .env 파일 로드 (모든 환경 변수, VITE_ 접두사 없이도 로드)
  const env = loadEnv(mode, process.cwd(), "")

  return {
    test: {
      globals: true,
      environment: "happy-dom",
      setupFiles: ["./tests/setup.ts"],
      include: ["tests/**/*.test.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        include: ["src/lib/rag-agent/**/*.ts"],
        exclude: ["src/lib/rag-agent/types.ts"],
      },
      // 환경 변수를 import.meta.env에 주입
      env,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "astro:content": path.resolve(__dirname, "./tests/mocks/astro-content.ts"),
      },
    },
  }
})
