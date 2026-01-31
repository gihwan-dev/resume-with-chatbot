"use client"

import { Award, Briefcase, FolderKanban, Trophy, User } from "lucide-react"
import { type SectionId, useActiveSection } from "@/hooks/use-active-section"
import { cn } from "@/lib/utils"

interface SectionNavProps {
  onNavigate?: () => void
  className?: string
}

const sections: { id: SectionId; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "awards", label: "Awards", icon: Trophy },
]

export function SectionNav({ onNavigate, className }: SectionNavProps) {
  const activeSection = useActiveSection()

  const handleClick = (id: SectionId) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      onNavigate?.()
    }
  }

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {sections.map((section) => {
        const isActive = activeSection === section.id
        return (
          <button
            type="button"
            key={section.id}
            onClick={() => handleClick(section.id)}
            aria-current={isActive ? "location" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
              isActive
                ? "text-resume-text-main bg-resume-highlight font-medium"
                : "text-resume-text-muted hover:text-resume-text-main hover:bg-resume-highlight"
            )}
          >
            <section.icon className={cn("size-4", isActive && "text-resume-primary")} />
            <span>{section.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
