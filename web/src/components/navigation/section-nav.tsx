"use client"

import { Award, Briefcase, FolderKanban, Trophy, User } from "lucide-react"
import type { MouseEvent } from "react"
import { type SectionId, useActiveSection } from "@/hooks/use-active-section"
import { cn } from "@/lib/utils"

interface SectionNavProps {
  onNavigate?: () => void
  className?: string
  ariaLabel?: string
}

const sections: { id: SectionId; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "awards", label: "Awards", icon: Trophy },
]

export function SectionNav({
  onNavigate,
  className,
  ariaLabel = "이력서 섹션 이동",
}: SectionNavProps) {
  const activeSection = useActiveSection()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: SectionId) => {
    const element = document.getElementById(id)
    if (!element) return

    event.preventDefault()
    element.scrollIntoView({ behavior: "smooth", block: "start" })
    window.history.pushState(null, "", `#${id}`)
    onNavigate?.()
  }

  return (
    <nav aria-label={ariaLabel} className={cn("flex flex-col gap-1", className)}>
      {sections.map((section) => {
        const isActive = activeSection === section.id
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(event) => handleClick(event, section.id)}
            aria-current={isActive ? "location" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "text-resume-text-main bg-resume-highlight font-medium"
                : "text-resume-text-muted hover:text-resume-text-main hover:bg-resume-highlight"
            )}
          >
            <section.icon className={cn("size-4", isActive && "text-resume-primary")} />
            <span>{section.label}</span>
          </a>
        )
      })}
    </nav>
  )
}
