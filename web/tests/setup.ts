/**
 * Vitest Setup File
 *
 * Global mocks and setup for all tests.
 */

import { vi, beforeEach, afterEach } from "vitest"

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
