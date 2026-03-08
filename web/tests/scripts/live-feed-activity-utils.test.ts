import { beforeAll, describe, expect, it } from "vitest"

let buildPathActivityMapFromGitLog: (
  rawGitLog: string,
  options?: {
    ignoredCommitHashes?: string[]
  }
) => Map<string, string>
let shouldIncludeFeedActivityPath: (relativePath: string) => boolean
let BULK_IMPORT_COMMIT_HASH: string

beforeAll(async () => {
  const modulePath = "../../../scripts/live-feed-activity-utils.mjs"
  const module = (await import(modulePath)) as {
    buildPathActivityMapFromGitLog: typeof buildPathActivityMapFromGitLog
    shouldIncludeFeedActivityPath: typeof shouldIncludeFeedActivityPath
    BULK_IMPORT_COMMIT_HASH: string
  }

  buildPathActivityMapFromGitLog = module.buildPathActivityMapFromGitLog
  shouldIncludeFeedActivityPath = module.shouldIncludeFeedActivityPath
  BULK_IMPORT_COMMIT_HASH = module.BULK_IMPORT_COMMIT_HASH
})

describe("shouldIncludeFeedActivityPath", () => {
  it("프로젝트/템플릿/아카이브/README/TODO/.excalidraw를 제외한다", () => {
    expect(shouldIncludeFeedActivityPath("AI/Claude Code Meetup.md")).toBe(true)
    expect(shouldIncludeFeedActivityPath("Exem/02-Daily/회의록/26.01.27.md")).toBe(true)

    expect(shouldIncludeFeedActivityPath("Exem/01-Projects/sample.md")).toBe(false)
    expect(shouldIncludeFeedActivityPath("Exem/05-Templates/sample.md")).toBe(false)
    expect(shouldIncludeFeedActivityPath("Exem/06-Archive/sample.md")).toBe(false)
    expect(shouldIncludeFeedActivityPath("AI/README.md")).toBe(false)
    expect(shouldIncludeFeedActivityPath("AI/TODO.md")).toBe(false)
    expect(shouldIncludeFeedActivityPath("AI/note.excalidraw.md")).toBe(false)
  })
})

describe("buildPathActivityMapFromGitLog", () => {
  it("bulk import 커밋을 무시하고 그 다음 의미 있는 커밋 시간을 사용한다", () => {
    const rawGitLog = `__COMMIT__
ee2e5b1f\t2026-03-08T12:00:00+09:00
vault/AI/Claude Code Meetup.md
vault/Exem/01-Projects/sample.md
vault/AI/README.md
__COMMIT__
a1b2c3d4\t2026-03-05T09:00:00+09:00
vault/AI/Claude Code Meetup.md
vault/AI/Useful Note.md
vault/Exem/05-Templates/sample.md
vault/Exem/02-Daily/회의록/26.01.27.md
`

    const activityMap = buildPathActivityMapFromGitLog(rawGitLog, {
      ignoredCommitHashes: [BULK_IMPORT_COMMIT_HASH],
    })

    expect(activityMap.get("AI/Claude Code Meetup.md")).toBe("2026-03-05T09:00:00+09:00")
    expect(activityMap.get("AI/Useful Note.md")).toBe("2026-03-05T09:00:00+09:00")
    expect(activityMap.get("Exem/02-Daily/회의록/26.01.27.md")).toBe("2026-03-05T09:00:00+09:00")

    expect(activityMap.has("Exem/01-Projects/sample.md")).toBe(false)
    expect(activityMap.has("AI/README.md")).toBe(false)
    expect(activityMap.has("Exem/05-Templates/sample.md")).toBe(false)
  })

  it("같은 파일이 여러 커밋에 있으면 최신 커밋 시간을 유지한다", () => {
    const rawGitLog = `__COMMIT__
f0f0f0f0\t2026-03-08T11:00:00+09:00
vault/AI/Chain.md
__COMMIT__
0f0f0f0f\t2026-03-07T10:00:00+09:00
vault/AI/Chain.md
`

    const activityMap = buildPathActivityMapFromGitLog(rawGitLog)
    expect(activityMap.get("AI/Chain.md")).toBe("2026-03-08T11:00:00+09:00")
  })
})
