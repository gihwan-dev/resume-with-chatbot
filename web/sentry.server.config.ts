import * as Sentry from "@sentry/astro"

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  enabled: import.meta.env.PROD,
  tracesSampleRate: 0,
  beforeSend(event) {
    const error = event.exception?.values?.[0]
    if (error?.type === "WorkAgentError") {
      event.tags = { ...event.tags, "work_agent.error_code": error.value?.split(":")[0] }
      event.fingerprint = ["work-agent", error.value?.split(":")[0] ?? "unknown"]
    }
    return event
  },
})
