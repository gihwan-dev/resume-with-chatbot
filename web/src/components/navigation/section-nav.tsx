"use client"

import { Award, Briefcase, FileText, type LucideIcon, Trophy, User } from "lucide-react"
import type { MouseEvent } from "react"
import { useMemo } from "react"
import { useActiveSection } from "@/hooks/use-active-section"
import { cn } from "@/lib/utils"

export interface SectionNavItem {
  id: string
  label: string
  icon?: LucideIcon
}

export type SectionNavVariant = "default" | "toc"

interface SectionNavProps {
  sections: readonly SectionNavItem[]
  onNavigate?: () => void
  className?: string
  ariaLabel?: string
  variant?: SectionNavVariant
}

export const RESUME_SECTION_NAV_ITEMS: readonly SectionNavItem[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "blog", label: "Technical Writing", icon: FileText },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "awards", label: "Awards", icon: Trophy },
]

export function SectionNav({
  sections,
  onNavigate,
  className,
  ariaLabel = "이력서 섹션 이동",
  variant = "default",
}: SectionNavProps) {
  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections])
  const activeSection = useActiveSection(sectionIds)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const element = document.getElementById(id)
    if (element) {
      event.preventDefault()
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      window.history.pushState(window.history.state, "", `#${id}`)
    }

    onNavigate?.()
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(variant === "toc" ? "toc-list space-y-4" : "flex flex-col gap-1", className)}
    >
      {sections.map((section) => {
        const isActive = activeSection === section.id
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            data-section-id={section.id}
            onClick={(event) => handleClick(event, section.id)}
            aria-current={isActive ? "location" : undefined}
            className={cn(
              variant === "toc"
                ? "toc-link block text-sm transition-colors py-1 border-l-2 pl-4"
                : "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              variant === "toc"
                ? isActive
                  ? "text-resume-primary border-resume-primary font-bold"
                  : "text-resume-text-muted hover:text-resume-text-heading border-transparent font-medium"
                : isActive
                  ? "text-resume-text-main bg-resume-highlight font-medium"
                  : "text-resume-text-muted hover:text-resume-text-main hover:bg-resume-highlight"
            )}
          >
            {variant === "default" && section.icon && (
              <section.icon className={cn("size-4", isActive && "text-resume-primary")} />
            )}
            <span>{section.label}</span>
          </a>
        )
      })}
    </nav>
  )
}
