"use client"

import { useEffect, useRef, useState } from "react"

export type SectionId = "profile" | "experience" | "projects" | "certificates" | "awards"

const SECTION_IDS: SectionId[] = ["profile", "experience", "projects", "certificates", "awards"]

export function useActiveSection(): SectionId | null {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)
  const sectionRatiosRef = useRef<Map<SectionId, number>>(new Map())

  useEffect(() => {
    const updateActiveSection = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight

      // 맨 위에 있으면 Profile
      if (scrollTop <= 10) {
        setActiveSection("profile")
        return
      }

      // 맨 아래에 있으면 Awards
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setActiveSection("awards")
        return
      }

      // intersectionRatio가 가장 높은 섹션 찾기
      let maxRatio = 0
      let maxSection: SectionId | null = null

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

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id as SectionId
        if (SECTION_IDS.includes(id)) {
          sectionRatiosRef.current.set(id, entry.intersectionRatio)
        }
      })

      updateActiveSection()
    }

    const observer = new IntersectionObserver(observerCallback, {
      threshold: [0, 0.25, 0.5, 0.75, 1],
      rootMargin: "-10% 0px -10% 0px",
    })

    SECTION_IDS.forEach((id) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    // 스크롤 이벤트로 맨 위/아래 체크
    window.addEventListener("scroll", updateActiveSection, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", updateActiveSection)
    }
  }, [])

  return activeSection
}
