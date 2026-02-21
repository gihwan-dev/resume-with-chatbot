"use client"

import { useEffect } from "react"
import { NAVIGATION_READY_EVENT } from "@/lib/layer-events"
import { DesktopNav } from "./desktop-nav"
import { MobileNav } from "./mobile-nav"
import { ThemeProvider } from "./theme-provider"

export function Navigation() {
  useEffect(() => {
    const resumeWindow = window as Window & {
      __resumeUiReady?: {
        chatWidget?: boolean
        navigation?: boolean
      }
    }

    resumeWindow.__resumeUiReady = {
      ...(resumeWindow.__resumeUiReady ?? {}),
      navigation: true,
    }
    window.dispatchEvent(new Event(NAVIGATION_READY_EVENT))
  }, [])

  return (
    <ThemeProvider>
      <div className="xl:hidden">
        <MobileNav />
      </div>
      <div className="hidden xl:block">
        <DesktopNav />
      </div>
    </ThemeProvider>
  )
}
