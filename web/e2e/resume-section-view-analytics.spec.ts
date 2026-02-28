import { expect, test } from "@playwright/test"
import { mockApiRoutes } from "./fixtures/mock-api"
import { waitForUiReady } from "./fixtures/ui-ready"

const TRACKED_SECTION_IDS = ["profile", "experience", "blog", "awards", "certificates"] as const

async function prepareTrackedPage(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const trackedEvents: Array<{
      eventName: string
      params?: Record<string, string | number | boolean | undefined>
    }> = []
    const trackedWindow = window as Window & {
      __trackedGtagEvents?: typeof trackedEvents
      dataLayer?: unknown[]
      gtag?: (
        command: string,
        eventName: string,
        params?: Record<string, string | number | boolean | undefined>
      ) => void
    }

    trackedWindow.__trackedGtagEvents = trackedEvents
    trackedWindow.dataLayer = []
    trackedWindow.gtag = (
      command: string,
      eventName: string,
      params?: Record<string, string | number | boolean | undefined>
    ) => {
      if (command !== "event") return
      trackedEvents.push({ eventName, params })
    }
  })

  await mockApiRoutes(page)
  await page.goto("/")
  await waitForUiReady(page)
}

test.describe("Resume section_view analytics", () => {
  test("section_view가 새 섹션 계약만 집계하고 skills는 제외한다", async ({ page }) => {
    await prepareTrackedPage(page)

    await page.evaluate(
      async (sectionIds: string[]) => {
        for (const sectionId of sectionIds) {
          const section = document.getElementById(sectionId)
          if (!section) continue
          section.scrollIntoView({ behavior: "auto", block: "start" })
          await new Promise((resolve) => setTimeout(resolve, 200))
        }

        document.getElementById("skills")?.scrollIntoView({ behavior: "auto", block: "start" })
        await new Promise((resolve) => setTimeout(resolve, 200))
      },
      [...TRACKED_SECTION_IDS]
    )

    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const trackedEvents = (
              window as Window & {
                __trackedGtagEvents?: Array<{
                  eventName: string
                  params?: { section_name?: string }
                }>
              }
            ).__trackedGtagEvents

            const viewedSections = new Set(
              (trackedEvents ?? [])
                .filter((event) => event.eventName === "section_view")
                .map((event) => event.params?.section_name)
                .filter((sectionName): sectionName is string => Boolean(sectionName))
            )

            return [...viewedSections]
          }),
        { message: "Expected all tracked resume sections to emit section_view events" }
      )
      .toEqual(expect.arrayContaining([...TRACKED_SECTION_IDS]))

    const viewedSections = await page.evaluate(() => {
      const trackedEvents = (
        window as Window & {
          __trackedGtagEvents?: Array<{
            eventName: string
            params?: { section_name?: string }
          }>
        }
      ).__trackedGtagEvents

      const viewedSections = new Set(
        (trackedEvents ?? [])
          .filter((event) => event.eventName === "section_view")
          .map((event) => event.params?.section_name)
          .filter((sectionName): sectionName is string => Boolean(sectionName))
      )

      return [...viewedSections]
    })

    expect(viewedSections).not.toContain("skills")
  })
})
