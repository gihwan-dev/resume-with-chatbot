"use client"

import { SectionNav, type SectionNavItem, type SectionNavVariant } from "./section-nav"
import { ThemeToggle } from "./theme-toggle"

interface DesktopNavProps {
  sections: readonly SectionNavItem[]
  ariaLabel: string
  sectionTitle?: string
  sectionVariant?: SectionNavVariant
}

export function DesktopNav({
  sections,
  ariaLabel,
  sectionTitle,
  sectionVariant = "default",
}: DesktopNavProps) {
  return (
    <div
      className="fixed left-1/2 top-1/2 -translate-y-1/2 translate-x-[calc(448px+2rem)] z-[var(--layer-nav)] print:hidden"
      data-slot="desktop-nav-root"
    >
      <div className="bg-resume-card-bg border border-resume-border rounded-xl shadow-resume-shadow p-4 flex flex-col gap-4 transition-colors duration-100">
        <fieldset>
          <legend className="sr-only">테마 설정</legend>
          <ThemeToggle />
        </fieldset>
        <div className="border-t border-resume-border pt-4 transition-colors duration-100">
          {sectionTitle && (
            <span className="text-xs font-medium uppercase text-resume-text-muted tracking-wider mb-2 block">
              {sectionTitle}
            </span>
          )}
          <SectionNav sections={sections} ariaLabel={ariaLabel} variant={sectionVariant} />
        </div>
      </div>
    </div>
  )
}
