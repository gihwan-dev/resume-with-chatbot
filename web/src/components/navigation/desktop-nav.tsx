"use client"

import { SectionNav } from "./section-nav"
import { ThemeToggle } from "./theme-toggle"

export function DesktopNav() {
  return (
    <div className="fixed left-1/2 top-1/2 -translate-y-1/2 translate-x-[calc(448px+2rem)] z-100">
      <div className="bg-resume-card-bg border border-resume-border rounded-xl shadow-resume-shadow p-4 flex flex-col gap-4">
        <ThemeToggle />
        <div className="border-t border-resume-border pt-4">
          <SectionNav />
        </div>
      </div>
    </div>
  )
}
