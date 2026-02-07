type GtagCommand = "config" | "event" | "set"

interface GtagEventParams {
  [key: string]: string | number | boolean | undefined
}

declare global {
  interface Window {
    gtag: (command: GtagCommand, targetOrEvent: string, params?: GtagEventParams) => void
    dataLayer: unknown[]
  }
}

export function trackEvent(eventName: string, params?: GtagEventParams) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params)
  }
}
