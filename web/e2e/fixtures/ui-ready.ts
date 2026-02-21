import { expect, type Page } from "@playwright/test"

const UI_READY_TIMEOUT_MS = 20_000
const FAB_SELECTOR = ".aui-modal-button"

export async function waitForUiReady(page: Page) {
  await page.waitForFunction(
    () => {
      const resumeWindow = window as Window & {
        __resumeUiReady?: {
          chatWidget?: boolean
          navigation?: boolean
        }
      }

      return Boolean(
        resumeWindow.__resumeUiReady?.chatWidget && resumeWindow.__resumeUiReady?.navigation
      )
    },
    undefined,
    { timeout: UI_READY_TIMEOUT_MS }
  )

  await expect(page.locator(FAB_SELECTOR)).toBeVisible()
}
