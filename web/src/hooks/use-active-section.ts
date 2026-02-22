"use client"

import { useEffect, useRef, useState } from "react"

const SCROLL_EDGE_THRESHOLD_PX = 10

function readHashSectionId() {
  if (!window.location.hash) return null

  try {
    const decoded = decodeURIComponent(window.location.hash.slice(1))
    return decoded || null
  } catch {
    return null
  }
}

export function useActiveSection(sectionIds: readonly string[]): string | null {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const sectionRatiosRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    if (sectionIds.length === 0) {
      setActiveSection(null)
      return
    }

    sectionRatiosRef.current.clear()
    const sectionIdSet = new Set(sectionIds)
    const firstSectionId = sectionIds[0]
    const lastSectionId = sectionIds[sectionIds.length - 1]

    const updateActiveSection = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight

      // Keep top and bottom activation deterministic across nav modes.
      if (scrollTop <= SCROLL_EDGE_THRESHOLD_PX) {
        setActiveSection(firstSectionId)
        return
      }

      if (scrollTop + clientHeight >= scrollHeight - SCROLL_EDGE_THRESHOLD_PX) {
        setActiveSection(lastSectionId)
        return
      }

      let maxRatio = 0
      let maxSection: string | null = null

      sectionRatiosRef.current.forEach((ratio, id) => {
        if (ratio > maxRatio) {
          maxRatio = ratio
          maxSection = id
        }
      })

      if (maxSection && maxRatio > 0) {
        setActiveSection(maxSection)
      }
    }

    const observerCallback: IntersectionObserverCallback = (
      entries: IntersectionObserverEntry[]
    ) => {
      entries.forEach((entry) => {
        const id = entry.target.id
        if (sectionIdSet.has(id)) {
          sectionRatiosRef.current.set(id, entry.intersectionRatio)
        }
      })

      updateActiveSection()
    }

    const observer = new IntersectionObserver(observerCallback, {
      threshold: [0, 0.25, 0.5, 0.75, 1],
      rootMargin: "-10% 0px -10% 0px",
    })

    sectionIds.forEach((id) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    const syncHashSection = () => {
      const hashSectionId = readHashSectionId()
      if (!hashSectionId || !sectionIdSet.has(hashSectionId)) return

      setActiveSection(hashSectionId)
    }

    syncHashSection()

    window.addEventListener("hashchange", syncHashSection)
    window.addEventListener("scroll", updateActiveSection, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener("hashchange", syncHashSection)
      window.removeEventListener("scroll", updateActiveSection)
    }
  }, [sectionIds])

  return activeSection
}
