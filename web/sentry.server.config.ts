import * as Sentry from "@sentry/astro"

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  enabled: import.meta.env.PROD,
  tracesSampleRate: 0,
})
