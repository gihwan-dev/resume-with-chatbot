"use client"

import { useEffect, useRef, useState } from "react"
import { NAVIGATION_READY_EVENT } from "@/lib/layer-events"
import { PORTFOLIO_SECTION_IDS, type PortfolioSectionId } from "@/lib/resume-portfolio/contracts"
import { DesktopNav } from "./desktop-nav"
import { MobileNav } from "./mobile-nav"
import {
  RESUME_SECTION_NAV_ITEMS,
  type SectionNavItem,
  type SectionNavVariant,
} from "./section-nav"
import { ThemeProvider } from "./theme-provider"

const PORTFOLIO_SECTION_LABELS: Record<PortfolioSectionId, string> = {
  tldr: "TL;DR",
  "problem-definition": "문제 정의",
  "key-decisions": "핵심 의사결정",
  "implementation-highlights": "구현 전략",
  "validation-impact": "검증 및 결과",
  learned: "회고",
}

const DEFAULT_PORTFOLIO_SECTION_ITEMS: readonly SectionNavItem[] = PORTFOLIO_SECTION_IDS.map(
  (sectionId) => ({
    id: sectionId,
    label: PORTFOLIO_SECTION_LABELS[sectionId],
  })
)
const DEFAULT_RESUME_SECTION_ITEMS: readonly SectionNavItem[] = RESUME_SECTION_NAV_ITEMS

type NavigationMode = "resume" | "portfolio-detail"

interface NavigationState {
  mode: NavigationMode
  sections: readonly SectionNavItem[]
}

function isPortfolioDetailPathname(pathname: string) {
  return /^\/portfolio\/[^/]+\/?$/.test(pathname)
}

function getPortfolioSectionsFromDocument() {
  const visibleSections = DEFAULT_PORTFOLIO_SECTION_ITEMS.filter((section) =>
    Boolean(document.getElementById(section.id))
  )

  return visibleSections.length > 0 ? visibleSections : DEFAULT_PORTFOLIO_SECTION_ITEMS
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

export function Navigation() {
  const mobileWrapperRef = useRef<HTMLDivElement>(null)
  const desktopWrapperRef = useRef<HTMLDivElement>(null)
  const [navigationState, setNavigationState] = useState<NavigationState>(() => {
    if (typeof window === "undefined") {
      return {
        mode: "resume",
        sections: DEFAULT_RESUME_SECTION_ITEMS,
      }
    }

    if (!isPortfolioDetailPathname(window.location.pathname)) {
      return {
        mode: "resume",
        sections: getResumeSectionsFromDocument(),
      }
    }

    return {
      mode: "portfolio-detail",
      sections: getPortfolioSectionsFromDocument(),
    }
  })

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
    const syncNavigationState = () => {
      const pathname = window.location.pathname
      const nextState: NavigationState = isPortfolioDetailPathname(pathname)
        ? {
            mode: "portfolio-detail",
            sections: getPortfolioSectionsFromDocument(),
          }
        : {
            mode: "resume",
            sections: getResumeSectionsFromDocument(),
          }

      setNavigationState((currentState) => {
        if (
          currentState.mode === nextState.mode &&
          isSameSectionSet(currentState.sections, nextState.sections)
        ) {
          return currentState
        }

        return nextState
      })
    }

    document.addEventListener("astro:page-load", syncNavigationState)
    window.addEventListener("popstate", syncNavigationState)
    syncNavigationState()

    return () => {
      document.removeEventListener("astro:page-load", syncNavigationState)
      window.removeEventListener("popstate", syncNavigationState)
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

  const isPortfolioDetailMode = navigationState.mode === "portfolio-detail"
  const sectionVariant: SectionNavVariant = isPortfolioDetailMode ? "toc" : "default"
  const desktopAriaLabel = isPortfolioDetailMode
    ? "데스크톱 포트폴리오 목차 이동"
    : "데스크톱 이력서 섹션 이동"
  const mobileAriaLabel = isPortfolioDetailMode
    ? "모바일 포트폴리오 목차 이동"
    : "모바일 이력서 섹션 이동"

  return (
    <ThemeProvider>
      <div ref={mobileWrapperRef} className="lg:hidden">
        <MobileNav
          sections={navigationState.sections}
          ariaLabel={mobileAriaLabel}
          sectionTitle={isPortfolioDetailMode ? "목차" : "Sections"}
          sectionVariant={sectionVariant}
        />
      </div>
      <div ref={desktopWrapperRef} className="hidden lg:block">
        <DesktopNav
          sections={navigationState.sections}
          ariaLabel={desktopAriaLabel}
          sectionTitle={isPortfolioDetailMode ? "목차" : undefined}
          sectionVariant={sectionVariant}
        />
      </div>
    </ThemeProvider>
  )
}
