"use client"

import { SectionNav } from "./section-nav"
import { ThemeToggle } from "./theme-toggle"

export function DesktopNav() {
  return (
    <div
      className="fixed left-1/2 top-1/2 -translate-y-1/2 translate-x-[calc(448px+2rem)] z-[var(--layer-nav)]"
      data-slot="desktop-nav-root"
    >
      <div className="bg-resume-card-bg border border-resume-border rounded-xl shadow-resume-shadow p-4 flex flex-col gap-4 transition-colors duration-100">
        <fieldset>
          <legend className="sr-only">테마 설정</legend>
          <ThemeToggle />
        </fieldset>
        <div className="border-t border-resume-border pt-4 transition-colors duration-100">
          <SectionNav ariaLabel="데스크톱 이력서 섹션 이동" />
        </div>
      </div>
    </div>
  )
}
