/**
 * Vitest Setup File
 *
 * Global mocks and setup for all tests.
 */

import { afterEach, beforeEach, vi } from "vitest"

// Mock Sentry to prevent initialization in tests
vi.mock("@sentry/astro", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  init: vi.fn(),
}))
vi.mock("@sentry/react", () => ({
  captureReactException: vi.fn(),
  captureException: vi.fn(),
}))

// Mock console for cleaner test output
const originalConsoleLog = console.log
const originalConsoleError = console.error

beforeEach(() => {
  // Suppress console.log during tests unless DEBUG env is set
  if (!process.env.DEBUG) {
    console.log = vi.fn()
  }
})

afterEach(() => {
  console.log = originalConsoleLog
  console.error = originalConsoleError
})
