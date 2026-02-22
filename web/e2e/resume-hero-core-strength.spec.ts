import { expect, test } from "@playwright/test"
import { mockApiRoutes } from "./fixtures/mock-api"
import { waitForUiReady } from "./fixtures/ui-ready"

test.describe("Resume hero and core strength", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await page.goto("/")
    await waitForUiReady(page)
  })

  test("Hero는 포지셔닝 소개를 유지하고 PAR/메트릭 카드는 노출하지 않는다", async ({ page }) => {
    await expect(page.locator("#profile")).toContainText("성능·아키텍처 Frontend Engineer")
    await expect(page.locator("[data-hero-metric-item]")).toHaveCount(0)
    await expect(page.getByText("Problem · Action · Result")).toHaveCount(0)
  })

  test("Core Strength 섹션에 4축 카드가 노출된다", async ({ page }) => {
    const coreStrengthSection = page.locator("#core-strength")
    await expect(coreStrengthSection).toBeVisible()
    await expect(coreStrengthSection.locator("[data-core-strength-item]")).toHaveCount(4)

    await expect(coreStrengthSection).toContainText("대규모 렌더링 아키텍처")
    await expect(coreStrengthSection).toContainText("계측 기반 성능 개선 전략")
    await expect(coreStrengthSection).toContainText("트레이드오프 중심 아키텍처 의사결정")
    await expect(coreStrengthSection).toContainText("DX 자동화 및 생산성 인프라")
  })

  test("섹션 순서가 core-strength -> experience -> blog -> awards -> certificates -> skills를 따른다", async ({
    page,
  }) => {
    const offsets = await page.evaluate(() => {
      const byId = (id: string) => {
        const element = document.getElementById(id)
        if (!element) return null
        return element.getBoundingClientRect().top + window.scrollY
      }

      return {
        coreStrength: byId("core-strength"),
        experience: byId("experience"),
        blog: byId("blog"),
        awards: byId("awards"),
        certificates: byId("certificates"),
        skills: byId("skills"),
      }
    })

    expect(offsets.coreStrength).not.toBeNull()
    expect(offsets.experience).not.toBeNull()
    expect(offsets.blog).not.toBeNull()
    expect(offsets.awards).not.toBeNull()
    expect(offsets.certificates).not.toBeNull()
    expect(offsets.skills).not.toBeNull()
    expect((offsets.coreStrength ?? 0) < (offsets.experience ?? 0)).toBe(true)
    expect((offsets.experience ?? 0) < (offsets.blog ?? 0)).toBe(true)
    expect((offsets.blog ?? 0) < (offsets.awards ?? 0)).toBe(true)
    expect((offsets.awards ?? 0) < (offsets.certificates ?? 0)).toBe(true)
    expect((offsets.certificates ?? 0) < (offsets.skills ?? 0)).toBe(true)
  })
})
