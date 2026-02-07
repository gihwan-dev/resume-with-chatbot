/// <reference types="astro/client" />

interface ImportMetaEnv {
  // Google AI
  readonly GOOGLE_GENERATIVE_AI_API_KEY: string

  // Firebase
  readonly FIREBASE_PRIVATE_KEY: string
  readonly FIREBASE_CLIENT_EMAIL: string
  readonly PUBLIC_FIREBASE_PROJECT_ID: string
  readonly PUBLIC_FIREBASE_DATABASE_ID?: string

  // Google Analytics
  readonly PUBLIC_GA_MEASUREMENT_ID?: string

  // Sentry
  readonly PUBLIC_SENTRY_DSN: string
  readonly SENTRY_AUTH_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
