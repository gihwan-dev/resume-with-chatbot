"use client"

import { Menu } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CHAT_MODAL_OPENED_EVENT, MOBILE_NAV_OPENED_EVENT } from "@/lib/layer-events"
import { cn } from "@/lib/utils"
import { SectionNav, type SectionNavItem, type SectionNavVariant } from "./section-nav"
import { ThemeToggle } from "./theme-toggle"

interface MobileNavProps {
  sections: readonly SectionNavItem[]
  ariaLabel: string
  sectionTitle: string
  sectionVariant?: SectionNavVariant
}

export function MobileNav({
  sections,
  ariaLabel,
  sectionTitle,
  sectionVariant = "default",
}: MobileNavProps) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const closeMobileNavWhenChatOpens = () => {
      setOpen(false)
    }

    window.addEventListener(CHAT_MODAL_OPENED_EVENT, closeMobileNavWhenChatOpens)
    return () => {
      window.removeEventListener(CHAT_MODAL_OPENED_EVENT, closeMobileNavWhenChatOpens)
    }
  }, [])

  React.useEffect(() => {
    if (!open) {
      return
    }

    const getSheetContent = () => document.querySelector<HTMLElement>('[data-slot="sheet-content"]')

    const getFocusableElements = (container: HTMLElement) =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute("disabled"))

    requestAnimationFrame(() => {
      const content = getSheetContent()
      if (!content) return

      const focusableElements = getFocusableElements(content)
      focusableElements[0]?.focus()
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        return
      }

      if (event.key !== "Tab") {
        return
      }

      const content = getSheetContent()
      if (!content) {
        return
      }

      const focusableElements = getFocusableElements(content)
      if (focusableElements.length === 0) {
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const currentElement = document.activeElement as HTMLElement | null

      if (event.shiftKey && currentElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && currentElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (nextOpen) {
      window.dispatchEvent(new Event(MOBILE_NAV_OPENED_EVENT))
    }
  }

  return (
    <div
      className="fixed top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-[var(--layer-nav)] print:hidden"
      data-slot="mobile-nav-root"
    >
      <Sheet open={open} onOpenChange={handleOpenChange} modal={false}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Open menu"
            className={cn(
              "bg-resume-card-bg border-resume-border shadow-resume-shadow",
              open && "hidden"
            )}
          >
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          overlayClassName="pointer-events-none"
          className="w-64 bg-resume-card-bg transition-colors duration-100"
        >
          <SheetHeader>
            <SheetTitle className="text-resume-text-heading">Menu</SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex flex-col gap-6 px-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-resume-text-muted">Theme</span>
              <ThemeToggle />
            </div>
            <div className="border-t border-resume-border pt-4 transition-colors duration-100">
              <span className="text-xs font-medium uppercase text-resume-text-muted tracking-wider mb-2 block">
                {sectionTitle}
              </span>
              <SectionNav
                sections={sections}
                onNavigate={() => setOpen(false)}
                ariaLabel={ariaLabel}
                variant={sectionVariant}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
