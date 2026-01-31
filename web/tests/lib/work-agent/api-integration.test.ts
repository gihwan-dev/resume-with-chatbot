/**
 * Work Agent API Integration Tests
 * 실제 API 호출로 검색 품질 확인
 *
 * 실행: DEBUG=true pnpm test api-integration --reporter=verbose
 *
 * 주의: 이 테스트는 실제 API를 호출하므로 환경 변수 설정 필요
 * - NOTION_API_TOKEN
 * - CLICKUP_API_TOKEN
 * - CLICKUP_TEAM_ID
 * - CLICKUP_WORKSPACE_ID
 * - CLICKUP_USER_ID
 *
 * @vitest-environment node
 */

import * as dotenv from "dotenv"
import path from "path"
import { beforeAll, describe, expect, it } from "vitest"

// 환경변수 로드 (테스트 전용)
dotenv.config({ path: path.resolve(__dirname, "../../../.env") })

import { searchClickUpDocs, searchClickUpTasks } from "../../../src/lib/work-agent/clickup.server"
// 실제 API 클라이언트 import (mock 없음)
import { getNotionPageContent, searchNotionPages } from "../../../src/lib/work-agent/notion.server"

// ============================================
// Notion 검색 품질 테스트
// ============================================
describe("Notion 검색 품질 테스트", () => {
  beforeAll(() => {
    const hasToken = !!import.meta.env.NOTION_API_TOKEN
    if (!hasToken) {
      console.warn("⚠️ NOTION_API_TOKEN이 설정되지 않음 - Notion 테스트 스킵됨")
    }
  })

  it("TanStack Virtual 검색", async () => {
    const result = await searchNotionPages({
      query: "TanStack Virtual",
      pageSize: 20,
    })
    console.log("Notion 검색 결과 (TanStack Virtual):", JSON.stringify(result, null, 2))
    expect(result).toBeDefined()
    console.log(`✅ 검색 결과 수: ${result.pages.length}`)
  })

  it("데이터 그리드 검색", async () => {
    const result = await searchNotionPages({
      query: "데이터 그리드",
      pageSize: 20,
    })
    console.log("Notion 검색 결과 (데이터 그리드):", JSON.stringify(result, null, 2))
    expect(result).toBeDefined()
    console.log(`✅ 검색 결과 수: ${result.pages.length}`)
  })

  it("고성능 그리드 검색", async () => {
    const result = await searchNotionPages({
      query: "고성능 그리드",
      pageSize: 20,
    })
    console.log("Notion 검색 결과 (고성능 그리드):", JSON.stringify(result, null, 2))
    expect(result).toBeDefined()
    console.log(`✅ 검색 결과 수: ${result.pages.length}`)
  })

  it("빈 쿼리로 전체 페이지 확인", async () => {
    const result = await searchNotionPages({ query: "", pageSize: 100 })
    console.log("Notion 전체 페이지 수:", result.pages.length)
    console.log(
      "페이지 목록:",
      result.pages.map((p) => p.title)
    )
    expect(result).toBeDefined()
    console.log(`✅ 전체 페이지 수: ${result.pages.length}`)
  })

  it("특정 페이지 콘텐츠 확인", async () => {
    // 먼저 페이지 목록을 가져옴
    const searchResult = await searchNotionPages({ query: "", pageSize: 5 })

    if (searchResult.pages.length > 0) {
      const firstPage = searchResult.pages[0]
      console.log(`📄 페이지 조회: ${firstPage.title} (${firstPage.id})`)

      const content = await getNotionPageContent(firstPage.id)
      console.log("페이지 콘텐츠:", JSON.stringify(content, null, 2))
      expect(content).toBeDefined()
      console.log(`✅ 블록 수: ${content.blocks.length}`)
    } else {
      console.log("⚠️ 검색된 페이지가 없음")
    }
  })
})

// ============================================
// ClickUp Tasks 검색 품질 테스트
// ============================================
describe("ClickUp Tasks 검색 품질 테스트", () => {
  beforeAll(() => {
    const hasToken = !!import.meta.env.CLICKUP_API_TOKEN
    if (!hasToken) {
      console.warn("⚠️ CLICKUP_API_TOKEN이 설정되지 않음 - ClickUp 테스트 스킵됨")
    }
  })

  it("전체 태스크 확인 (쿼리 없이)", async () => {
    const result = await searchClickUpTasks({ includeCompleted: true })
    console.log("전체 태스크 수:", result.tasks.length)
    console.log(
      "태스크 목록:",
      result.tasks.map((t) => ({ name: t.name, status: t.status.status }))
    )
    expect(result).toBeDefined()
    console.log(`✅ 전체 태스크 수: ${result.tasks.length}`)
  })

  it("TanStack 검색", async () => {
    const result = await searchClickUpTasks({
      query: "TanStack",
      includeCompleted: true,
    })
    console.log("ClickUp Tasks 검색 결과 (TanStack):", JSON.stringify(result, null, 2))
    expect(result).toBeDefined()
    console.log(`✅ 검색 결과 수: ${result.tasks.length}`)
  })

  it("그리드 검색", async () => {
    const result = await searchClickUpTasks({
      query: "그리드",
      includeCompleted: true,
    })
    console.log("ClickUp Tasks 검색 결과 (그리드):", JSON.stringify(result, null, 2))
    expect(result).toBeDefined()
    console.log(`✅ 검색 결과 수: ${result.tasks.length}`)
  })

  it("Virtual 검색", async () => {
    const result = await searchClickUpTasks({
      query: "Virtual",
      includeCompleted: true,
    })
    console.log("ClickUp Tasks 검색 결과 (Virtual):", JSON.stringify(result, null, 2))
    expect(result).toBeDefined()
    console.log(`✅ 검색 결과 수: ${result.tasks.length}`)
  })
})

// ============================================
// ClickUp Docs 검색 품질 테스트
// ============================================
describe("ClickUp Docs 검색 품질 테스트", () => {
  beforeAll(() => {
    const hasToken = !!import.meta.env.CLICKUP_API_TOKEN
    if (!hasToken) {
      console.warn("⚠️ CLICKUP_API_TOKEN이 설정되지 않음 - ClickUp 테스트 스킵됨")
    }
  })

  it("전체 문서 확인 (쿼리 없이)", async () => {
    const result = await searchClickUpDocs({})
    console.log("전체 문서 수:", result.docs.length)
    console.log(
      "문서 목록:",
      result.docs.map((d) => d.name)
    )
    expect(result).toBeDefined()
    console.log(`✅ 전체 문서 수: ${result.docs.length}`)
  })

  it("TanStack 검색", async () => {
    const result = await searchClickUpDocs({ query: "TanStack" })
    console.log("ClickUp Docs 검색 결과 (TanStack):", JSON.stringify(result, null, 2))
    expect(result).toBeDefined()
    console.log(`✅ 검색 결과 수: ${result.docs.length}`)
  })

  it("Virtual 검색", async () => {
    const result = await searchClickUpDocs({ query: "Virtual" })
    console.log("ClickUp Docs 검색 결과 (Virtual):", JSON.stringify(result, null, 2))
    expect(result).toBeDefined()
    console.log(`✅ 검색 결과 수: ${result.docs.length}`)
  })

  it("그리드 검색", async () => {
    const result = await searchClickUpDocs({ query: "그리드" })
    console.log("ClickUp Docs 검색 결과 (그리드):", JSON.stringify(result, null, 2))
    expect(result).toBeDefined()
    console.log(`✅ 검색 결과 수: ${result.docs.length}`)
  })

  it("고성능 검색", async () => {
    const result = await searchClickUpDocs({ query: "고성능" })
    console.log("ClickUp Docs 검색 결과 (고성능):", JSON.stringify(result, null, 2))
    expect(result).toBeDefined()
    console.log(`✅ 검색 결과 수: ${result.docs.length}`)
  })
})
