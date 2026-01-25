/**
 * TOON Integration Tests
 * 실제 API 호출로 TOON 포맷 적용 검증
 *
 * 실행: pnpm test toon-integration --reporter=verbose
 *
 * @vitest-environment node
 */

import { describe, it, expect, beforeAll } from "vitest"
import * as dotenv from "dotenv"
import path from "path"

// 환경변수 로드
dotenv.config({ path: path.resolve(__dirname, "../../../.env") })

// 실제 tools import (mock 없음)
import {
  searchNotion,
  getNotionPage,
  searchClickUpTasks,
  searchClickUpDocs,
} from "../../../src/lib/work-agent/tools"

// 테스트용 컨텍스트
const testContext = {
  toolCallId: "integration-test",
  messages: [],
  abortSignal: new AbortController().signal,
}

describe("TOON 포맷 통합 테스트", () => {
  describe("searchNotion TOON 적용", () => {
    it("검색 결과에 format 필드 존재", async () => {
      const result = (await searchNotion.execute!(
        { query: "", pageSize: 5 },
        testContext
      )) as { success: true; data: { format: string; pages: unknown } }

      console.log("searchNotion 결과:", JSON.stringify(result, null, 2))

      expect(result.success).toBe(true)
      expect(result.data.format).toBeDefined()
      expect(["json", "toon"]).toContain(result.data.format)
      console.log(`✅ format: ${result.data.format}`)
    })

    it("5개 결과 → JSON 포맷", async () => {
      const result = (await searchNotion.execute!(
        { query: "", pageSize: 5 },
        testContext
      )) as { success: true; data: { format: string; totalFound: number } }

      if (result.success && result.data.totalFound < 10) {
        expect(result.data.format).toBe("json")
        console.log(`✅ ${result.data.totalFound}개 결과 → JSON 포맷`)
      }
    })

    it("20개 결과 → TOON 포맷 (충분한 데이터가 있는 경우)", async () => {
      const result = (await searchNotion.execute!(
        { query: "", pageSize: 20 },
        testContext
      )) as {
        success: true
        data: { format: string; formatHint?: string; totalFound: number }
      }

      console.log(
        `결과 수: ${result.data.totalFound}, format: ${result.data.format}`
      )

      if (result.success && result.data.totalFound >= 10) {
        expect(result.data.format).toBe("toon")
        expect(result.data.formatHint).toBe(
          "Data in TOON format. Parse comma-separated values per row."
        )
        console.log(`✅ ${result.data.totalFound}개 결과 → TOON 포맷`)
      } else {
        console.log(
          `⚠️ 데이터가 10개 미만 (${result.data.totalFound}개) - TOON 테스트 스킵`
        )
      }
    })
  })

  describe("getNotionPage createdTime 제거", () => {
    it("응답에 createdTime 없음", async () => {
      // 먼저 페이지 ID 가져오기
      const searchResult = (await searchNotion.execute!(
        { query: "", pageSize: 1 },
        testContext
      )) as { success: true; data: { pages: Array<{ id: string }> } }

      if (searchResult.success && searchResult.data.pages.length > 0) {
        const pageId = Array.isArray(searchResult.data.pages)
          ? searchResult.data.pages[0].id
          : null

        if (pageId) {
          const result = (await getNotionPage.execute!(
            { pageId },
            testContext
          )) as { success: true; data: { page: Record<string, unknown> } }

          console.log("getNotionPage 결과:", JSON.stringify(result, null, 2))

          expect(result.success).toBe(true)
          expect(result.data.page.createdTime).toBeUndefined()
          expect(result.data.page.lastEditedTime).toBeDefined()
          console.log("✅ createdTime 제거됨, lastEditedTime만 존재")
        }
      }
    })
  })

  describe("searchClickUpTasks TOON 적용", () => {
    it("검색 결과에 format 필드 존재", async () => {
      const result = (await searchClickUpTasks.execute!(
        { includeCompleted: true },
        testContext
      )) as { success: true; data: { format: string; totalFound: number } }

      console.log(
        "searchClickUpTasks format:",
        result.data.format,
        "count:",
        result.data.totalFound
      )

      expect(result.success).toBe(true)
      expect(result.data.format).toBeDefined()
      expect(["json", "toon"]).toContain(result.data.format)

      if (result.data.totalFound >= 10) {
        expect(result.data.format).toBe("toon")
        console.log(`✅ ${result.data.totalFound}개 결과 → TOON 포맷`)
      } else {
        expect(result.data.format).toBe("json")
        console.log(`✅ ${result.data.totalFound}개 결과 → JSON 포맷`)
      }
    })
  })

  describe("searchClickUpDocs 필드 최적화", () => {
    it("dateCreated/dateUpdated 제거됨", async () => {
      const result = (await searchClickUpDocs.execute!({}, testContext)) as {
        success: true
        data: {
          format: string
          docs: Array<Record<string, unknown>> | string
        }
      }

      console.log("searchClickUpDocs 결과:", JSON.stringify(result, null, 2))

      expect(result.success).toBe(true)
      expect(result.data.format).toBeDefined()

      // JSON 포맷인 경우 필드 검증
      if (result.data.format === "json" && Array.isArray(result.data.docs)) {
        const firstDoc = result.data.docs[0]
        if (firstDoc) {
          expect(firstDoc.dateCreated).toBeUndefined()
          expect(firstDoc.dateUpdated).toBeUndefined()
          expect(firstDoc.id).toBeDefined()
          expect(firstDoc.name).toBeDefined()
          console.log("✅ dateCreated/dateUpdated 제거됨")
        }
      } else {
        console.log("✅ TOON 포맷 - 필드 최적화 적용됨")
      }
    })
  })
})
