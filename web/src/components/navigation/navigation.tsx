"use client"

import { useEffect, useRef, useState } from "react"
import { NAVIGATION_READY_EVENT } from "@/lib/layer-events"
import { DesktopNav } from "./desktop-nav"
import { MobileNav } from "./mobile-nav"
import { RESUME_SECTION_NAV_ITEMS, type SectionNavItem } from "./section-nav"
import { ThemeProvider } from "./theme-provider"

const DEFAULT_RESUME_SECTION_ITEMS: readonly SectionNavItem[] = RESUME_SECTION_NAV_ITEMS

interface NavigationProps {
  initialPathname?: string
}

function getResumeSectionsFromDocument() {
  const visibleSections = DEFAULT_RESUME_SECTION_ITEMS.filter((section) =>
    Boolean(document.getElementById(section.id))
  )

  return visibleSections.length > 0 ? visibleSections : DEFAULT_RESUME_SECTION_ITEMS
}

function isSameSectionSet(left: readonly SectionNavItem[], right: readonly SectionNavItem[]) {
  if (left.length !== right.length) return false
  return left.every((section, index) => section.id === right[index]?.id)
}

export function Navigation({ initialPathname = "/" }: NavigationProps) {
  const mobileWrapperRef = useRef<HTMLDivElement>(null)
  const desktopWrapperRef = useRef<HTMLDivElement>(null)
  const [sections, setSections] = useState<readonly SectionNavItem[]>(() =>
    initialPathname === "/" ? DEFAULT_RESUME_SECTION_ITEMS : []
  )

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

  useEffect(() => {
    const syncSections = () => {
      const nextSections = window.location.pathname === "/" ? getResumeSectionsFromDocument() : []
      setSections((currentSections) => {
        if (isSameSectionSet(currentSections, nextSections)) {
          return currentSections
        }
        return nextSections
      })
    }

    document.addEventListener("astro:page-load", syncSections)
    window.addEventListener("popstate", syncSections)
    syncSections()

    return () => {
      document.removeEventListener("astro:page-load", syncSections)
      window.removeEventListener("popstate", syncSections)
    }
  }, [])

  useEffect(() => {
    const desktopRootSelector = '[data-slot="desktop-nav-root"]'
    const mobileRootSelector = '[data-slot="mobile-nav-root"]'

    const setVisible = (element: HTMLElement | null, visible: boolean) => {
      if (!element) {
        return
      }

      element.style.setProperty("display", visible ? "block" : "none", "important")
      element.style.setProperty("visibility", visible ? "visible" : "hidden", "important")
      element.style.setProperty("opacity", visible ? "1" : "0", "important")
    }

    const clearGuard = (element: HTMLElement | null) => {
      if (!element) {
        return
      }

      element.style.removeProperty("display")
      element.style.removeProperty("visibility")
      element.style.removeProperty("opacity")
    }

    const applyVisibilityGuard = () => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches
      const desktopRoot = document.querySelector<HTMLElement>(desktopRootSelector)
      const mobileRoot = document.querySelector<HTMLElement>(mobileRootSelector)

      setVisible(desktopWrapperRef.current, isDesktop)
      setVisible(mobileWrapperRef.current, !isDesktop)
      setVisible(desktopRoot, isDesktop)
      setVisible(mobileRoot, !isDesktop)
    }

    const clearVisibilityGuard = () => {
      clearGuard(desktopWrapperRef.current)
      clearGuard(mobileWrapperRef.current)
      clearGuard(document.querySelector<HTMLElement>(desktopRootSelector))
      clearGuard(document.querySelector<HTMLElement>(mobileRootSelector))
    }

    const printMediaQuery = window.matchMedia("print")
    const handleResize = () => {
      if (printMediaQuery.matches) {
        return
      }

      applyVisibilityGuard()
    }
    const handlePrintMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        clearVisibilityGuard()
        return
      }

      applyVisibilityGuard()
    }

    applyVisibilityGuard()
    window.addEventListener("resize", handleResize)
    printMediaQuery.addEventListener("change", handlePrintMediaChange)

    return () => {
      window.removeEventListener("resize", handleResize)
      printMediaQuery.removeEventListener("change", handlePrintMediaChange)
      clearVisibilityGuard()
    }
  }, [])

  return (
    <ThemeProvider>
      <div ref={mobileWrapperRef} className="lg:hidden">
        <MobileNav
          sections={sections}
          ariaLabel="모바일 이력서 섹션 이동"
          sectionTitle="Sections"
        />
      </div>
      <div ref={desktopWrapperRef} className="hidden lg:block">
        <DesktopNav sections={sections} ariaLabel="데스크톱 이력서 섹션 이동" />
      </div>
    </ThemeProvider>
  )
}
