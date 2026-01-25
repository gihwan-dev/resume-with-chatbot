/**
 * TOON Format Encoder
 * 10개 이상 결과 시 토큰 절감을 위한 TOON 포맷 인코딩
 */

import { encode } from "@toon-format/toon"

const TOON_THRESHOLD = 10

export type FormatType = "json" | "toon"

export interface EncodedResult<T> {
  format: FormatType
  data: string | T[]
  count: number
}

/**
 * 배열 결과를 TOON 포맷으로 인코딩
 * 10개 이상일 경우 TOON 포맷 적용, 미만이면 JSON 유지
 */
export function encodeArrayResult<T>(items: T[]): EncodedResult<T> {
  if (items.length >= TOON_THRESHOLD) {
    try {
      return { format: "toon", data: encode(items), count: items.length }
    } catch {
      // 인코딩 실패 시 JSON 폴백
    }
  }
  return { format: "json", data: items, count: items.length }
}

/**
 * TOON 포맷 힌트 생성
 * LLM에게 파싱 힌트 제공
 */
export function createFormatHint(format: FormatType): string | undefined {
  return format === "toon"
    ? "Data in TOON format. Parse comma-separated values per row."
    : undefined
}
