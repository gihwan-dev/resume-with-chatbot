/**
 * Vitest Setup File
 *
 * Global mocks and setup for all tests.
 */

import { vi, beforeEach, afterEach } from "vitest"

// Mock Firebase Admin Firestore
vi.mock("firebase-admin/firestore", () => ({
  FieldValue: {
    vector: vi.fn((arr: number[]) => ({ type: "vector", value: arr })),
  },
}))

// Mock firebase.server module
vi.mock("@/lib/firebase.server", () => ({
  db: {
    collection: vi.fn(() => ({
      findNearest: vi.fn(() => ({
        get: vi.fn(() =>
          Promise.resolve({
            forEach: vi.fn((callback: (doc: MockDoc) => void) => {
              // Mock document for testing
              const mockDoc: MockDoc = {
                id: "test-doc-1",
                data: () => ({
                  title: "테스트 프로젝트",
                  content: "React와 TypeScript를 사용한 웹 프로젝트 개발 경험",
                  category: "project",
                  skills: ["리더십", "협업"],
                  techStack: ["react", "typescript"],
                  projectType: "web",
                  vector_distance: 0.2,
                }),
              }
              callback(mockDoc)
            }),
          })
        ),
      })),
    })),
  },
}))

interface MockDoc {
  id: string
  data: () => {
    title: string
    content: string
    category: string
    skills: string[]
    techStack: string[]
    projectType: string
    vector_distance: number
  }
}

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
