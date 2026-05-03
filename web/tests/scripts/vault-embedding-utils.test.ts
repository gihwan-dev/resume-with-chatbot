import { beforeAll, describe, expect, it, vi } from "vitest"

type VaultDocument = {
  id: string
  title: string
  content: string
}

type GenerateEmbeddings = (input: {
  documents: VaultDocument[]
  cache: Record<string, unknown>
  embedMany: (input: { model: unknown; values: string[] }) => Promise<{ embeddings: number[][] }>
  model: unknown
  batchSize?: number
  maxBatchInputChars?: number
}) => Promise<{
  embeddings: Map<string, number[]>
  regenerated: number
  failed: number
}>

let generateEmbeddings: GenerateEmbeddings

beforeAll(async () => {
  const modulePath = "../../../scripts/vault-embedding-utils.mjs"
  const module = (await import(modulePath)) as {
    generateEmbeddings: GenerateEmbeddings
  }
  generateEmbeddings = module.generateEmbeddings
})

describe("generateEmbeddings", () => {
  it("임베딩 요청을 전체 입력 크기 기준으로 분할한다", async () => {
    const documents = Array.from({ length: 4 }, (_, index) => ({
      id: `doc-${index}`,
      title: `Document ${index}`,
      content: "abcd ".repeat(1000),
    }))
    const calls: string[][] = []
    const embedMany = vi.fn(async ({ values }: { model: unknown; values: string[] }) => {
      calls.push(values)
      return {
        embeddings: values.map((_, index) => [index + 1, index + 2]),
      }
    })

    const result = await generateEmbeddings({
      documents,
      cache: {},
      embedMany,
      model: {},
      batchSize: 100,
      maxBatchInputChars: 12000,
    })

    expect(embedMany).toHaveBeenCalledTimes(2)
    expect(calls.every((values) => values.join("").length <= 12000)).toBe(true)
    expect(result.regenerated).toBe(4)
    expect(result.failed).toBe(0)
    expect(result.embeddings.size).toBe(4)
  })
})
