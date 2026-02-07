import * as Sentry from "@sentry/astro"

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  enabled: import.meta.env.PROD,
  integrations: [],
  beforeSend(event) {
    if (event.exception?.values?.some((e) => e.value?.includes("ResizeObserver"))) return null
    return event
  },
})
