"use client"

import { DesktopNav } from "./desktop-nav"
import { MobileNav } from "./mobile-nav"
import { ThemeProvider } from "./theme-provider"

export function Navigation() {
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
