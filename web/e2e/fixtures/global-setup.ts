import fs from "node:fs/promises"
import path from "node:path"

export default async function globalSetup() {
  const generatedDirPath = path.join(process.cwd(), "src", "generated")
  const vaultDataPath = path.join(generatedDirPath, "vault-data.json")

  await fs.mkdir(generatedDirPath, { recursive: true })

  try {
    await fs.access(vaultDataPath)
    return
  } catch {
    // no-op
  }

  const fallbackVaultData = {
    documents: [
      {
        id: "Exem--Projects--live-feed-sample",
        title: "라이브 피드 샘플 업데이트",
        category: "Exem",
        path: "Exem/Projects/live-feed-sample.md",
        summary: "실시간 업데이트 피드 테스트용 데이터입니다.",
        tags: ["Exem", "Projects"],
        content: "실시간 업데이트 피드 테스트용 데이터입니다.",
        eventDate: "2026-03-08",
        updatedAt: "2026-03-08",
      },
    ],
  }

  await fs.writeFile(vaultDataPath, JSON.stringify(fallbackVaultData), "utf-8")
}
