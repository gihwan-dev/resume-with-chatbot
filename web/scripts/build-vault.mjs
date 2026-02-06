/**
 * Obsidian 볼트 데이터 사전 빌드 스크립트
 * 볼트 디렉토리를 스캔하여 vault-data.json 생성
 * Vercel 서버리스 함수에서 런타임 파일시스템 스캔 없이 동작하도록 함
 */

import fs from "node:fs"
import path from "node:path"

const VAULT_PATH = path.join(process.cwd(), "vault")
const OUTPUT_PATH = path.join(process.cwd(), "src", "generated", "vault-data.json")

const EXCLUDED_DIRS = new Set([".obsidian", ".vscode", "Excalidraw", "이미지저장소", ".git"])
const EXCLUDED_FILES = new Set(["콜아웃 리스트.md", "프롬프트.md"])

function createDocumentId(relativePath) {
  return relativePath.replace(/\.md$/, "").replace(/[/\\]/g, "--").replace(/\s+/g, "-")
}

function extractSummary(content) {
  const lines = content.split("\n")
  for (const line of lines) {
    const trimmed = line.trim()
    if (
      !trimmed ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("---") ||
      trimmed.startsWith("```") ||
      trimmed.startsWith("![[") ||
      trimmed.startsWith("![") ||
      trimmed.startsWith("```mermaid")
    ) {
      continue
    }
    return trimmed.substring(0, 200)
  }
  return ""
}

function scanVault(dir) {
  const documents = []

  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    console.warn(`[build-vault] Cannot read directory: ${dir}`)
    return documents
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".obsidian") {
      if (entry.isFile()) continue
    }

    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue
      documents.push(...scanVault(fullPath))
    } else if (entry.name.endsWith(".md")) {
      if (EXCLUDED_FILES.has(entry.name)) continue

      const relativePath = path.relative(VAULT_PATH, fullPath)
      const parts = relativePath.split(path.sep)
      const filename = parts[parts.length - 1].replace(/\.md$/, "")
      const category = parts.length > 1 ? parts[0] : "Root"
      const tags = parts.slice(0, -1).filter(Boolean)

      let content = ""
      let summary = ""
      try {
        content = fs.readFileSync(fullPath, "utf-8")
        summary = extractSummary(content)
      } catch {
        // 읽기 실패 시 빈 값
      }

      documents.push({
        id: createDocumentId(relativePath),
        title: filename,
        category,
        path: relativePath,
        summary,
        tags,
        content,
      })
    }
  }

  return documents
}

// 볼트 존재 확인
if (!fs.existsSync(VAULT_PATH)) {
  console.error(`[build-vault] Vault not found at: ${VAULT_PATH}`)
  console.error("[build-vault] Run: git submodule update --init --recursive")
  process.exit(1)
}

const documents = scanVault(VAULT_PATH)

// 출력 디렉토리 생성
fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })

// JSON 파일 생성
fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ documents }, null, 0))

const sizeKB = (fs.statSync(OUTPUT_PATH).size / 1024).toFixed(1)
console.log(`[build-vault] Built vault data: ${documents.length} documents (${sizeKB} KB)`)
