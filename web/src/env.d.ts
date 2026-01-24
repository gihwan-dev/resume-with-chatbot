/// <reference types="astro/client" />

interface ImportMetaEnv {
  // Google AI
  readonly GOOGLE_GENERATIVE_AI_API_KEY: string

  // Firebase
  readonly FIREBASE_PRIVATE_KEY: string
  readonly FIREBASE_CLIENT_EMAIL: string
  readonly PUBLIC_FIREBASE_PROJECT_ID: string
  readonly PUBLIC_FIREBASE_DATABASE_ID?: string

  // Notion
  readonly NOTION_API_TOKEN: string

  // ClickUp
  readonly CLICKUP_API_TOKEN: string
  readonly CLICKUP_TEAM_ID: string
  readonly CLICKUP_WORKSPACE_ID: string
  readonly CLICKUP_USER_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
