"use client"

import { DesktopNav } from "./DesktopNav"
import { MobileNav } from "./MobileNav"
import { ThemeProvider } from "./ThemeProvider"

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
