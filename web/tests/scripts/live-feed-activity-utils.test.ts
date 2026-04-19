import { beforeAll, describe, expect, it } from "vitest"

let buildPathActivityMapFromGitLog: (
  rawGitLog: string,
  options?: {
    ignoredCommitHashes?: string[]
  }
) => Map<string, string>
let shouldIncludeFeedActivityPath: (relativePath: string) => boolean
let detectInitialVaultCommitHash: (rawGitLog: string) => string

beforeAll(async () => {
  const modulePath = "../../../scripts/live-feed-activity-utils.mjs"
  const module = (await import(modulePath)) as {
    buildPathActivityMapFromGitLog: typeof buildPathActivityMapFromGitLog
    shouldIncludeFeedActivityPath: typeof shouldIncludeFeedActivityPath
    detectInitialVaultCommitHash: typeof detectInitialVaultCommitHash
  }

  buildPathActivityMapFromGitLog = module.buildPathActivityMapFromGitLog
  shouldIncludeFeedActivityPath = module.shouldIncludeFeedActivityPath
  detectInitialVaultCommitHash = module.detectInitialVaultCommitHash
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

describe("detectInitialVaultCommitHash", () => {
  it("git log 출력에서 가장 오래된(마지막) 커밋 해시를 반환한다", () => {
    const rawGitLog = `__COMMIT__
f0f0f0f0aaaa\t2026-03-09T20:47:20+09:00
web/vault/AI/Note.md
__COMMIT__
3ca0596690f0\t2026-02-06T11:52:26+00:00
web/vault/AI/Seed.md
web/vault/Algorithm/Old.md
`

    expect(detectInitialVaultCommitHash(rawGitLog)).toBe("3ca0596690f0")
  })

  it("빈 입력은 빈 문자열을 반환한다", () => {
    expect(detectInitialVaultCommitHash("")).toBe("")
    expect(detectInitialVaultCommitHash(undefined as unknown as string)).toBe("")
  })
})

describe("buildPathActivityMapFromGitLog", () => {
  it("bulk import 커밋을 무시하고 그 다음 의미 있는 커밋 시간을 사용한다", () => {
    const rawGitLog = `__COMMIT__
ee2e5b1f\t2026-03-08T12:00:00+09:00
web/vault/AI/Claude Code Meetup.md
web/vault/Exem/01-Projects/sample.md
web/vault/AI/README.md
__COMMIT__
a1b2c3d4\t2026-03-05T09:00:00+09:00
web/vault/AI/Claude Code Meetup.md
web/vault/AI/Useful Note.md
web/vault/Exem/05-Templates/sample.md
web/vault/Exem/02-Daily/회의록/26.01.27.md
`

    const activityMap = buildPathActivityMapFromGitLog(rawGitLog, {
      ignoredCommitHashes: ["ee2e5b1f"],
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
web/vault/AI/Chain.md
__COMMIT__
0f0f0f0f\t2026-03-07T10:00:00+09:00
web/vault/AI/Chain.md
`

    const activityMap = buildPathActivityMapFromGitLog(rawGitLog)
    expect(activityMap.get("AI/Chain.md")).toBe("2026-03-08T11:00:00+09:00")
  })

  it("vault 외부 경로(web/vault/ 접두사 없음)는 무시한다", () => {
    const rawGitLog = `__COMMIT__
aaaaaaaa\t2026-03-08T11:00:00+09:00
web/vault/AI/Inside.md
web/src/components/Outside.tsx
vault/AI/LegacyFormat.md
`

    const activityMap = buildPathActivityMapFromGitLog(rawGitLog)
    expect(activityMap.get("AI/Inside.md")).toBe("2026-03-08T11:00:00+09:00")
    expect(activityMap.has("AI/LegacyFormat.md")).toBe(false)
    expect(activityMap.has("src/components/Outside.tsx")).toBe(false)
  })
})
