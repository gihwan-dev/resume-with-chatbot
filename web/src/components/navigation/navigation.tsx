"use client"

import { useEffect, useState } from "react"
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

function isSameSectionSet(left: readonly SectionNavItem[], right: readonly SectionNavItem[]) {
  if (left.length !== right.length) return false

  return left.every((section, index) => section.id === right[index]?.id)
}

export function Navigation() {
  const [navigationState, setNavigationState] = useState<NavigationState>(() => {
    if (typeof window === "undefined" || !isPortfolioDetailPathname(window.location.pathname)) {
      return {
        mode: "resume",
        sections: RESUME_SECTION_NAV_ITEMS,
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
            sections: RESUME_SECTION_NAV_ITEMS,
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
      <div className="xl:hidden">
        <MobileNav
          sections={navigationState.sections}
          ariaLabel={mobileAriaLabel}
          sectionTitle={isPortfolioDetailMode ? "목차" : "Sections"}
          sectionVariant={sectionVariant}
        />
      </div>
      <div className="hidden xl:block">
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
