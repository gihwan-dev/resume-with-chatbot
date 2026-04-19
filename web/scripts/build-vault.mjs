/**
 * Obsidian 볼트 데이터 사전 빌드 스크립트
 * 볼트 디렉토리를 스캔하여 vault-data.json 생성
 * Vercel 서버리스 함수에서 런타임 파일시스템 스캔 없이 동작하도록 함
 */

import "dotenv/config"
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { createVertex } from "@ai-sdk/google-vertex"
import { embedMany } from "ai"
import MiniSearch from "minisearch"
import {
  buildPathActivityMapFromGitLog,
  detectInitialVaultCommitHash,
} from "./live-feed-activity-utils.mjs"
import { extractVaultDateMeta } from "./vault-date-utils.mjs"
import {
  generateEmbeddings,
  loadEmbeddingCache,
  saveEmbeddingCache,
} from "./vault-embedding-utils.mjs"
import { buildDocIndex, parseWikiLinks, resolveWikiTarget } from "./vault-wiki-link-utils.mjs"

const VAULT_PATH = path.join(process.cwd(), "vault")
const OUTPUT_PATH = path.join(process.cwd(), "src", "generated", "vault-data.json")
const SEARCH_INDEX_PATH = path.join(process.cwd(), "src", "generated", "search-index.json")
const EMBEDDINGS_PATH = path.join(process.cwd(), "src", "generated", "vault-embeddings.json")
const EMBEDDING_CACHE_PATH = path.join(
  process.cwd(),
  "scripts",
  "cache",
  "vault-embedding-cache.json"
)
const EMBEDDING_MODEL_ID = "text-embedding-005"

function resolveGitRoot() {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: process.cwd(),
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim()
  } catch {
    return ""
  }
}

function resolveVaultPathSpec(gitRoot) {
  if (!gitRoot) return "vault"
  const relative = path.relative(gitRoot, VAULT_PATH).split(path.sep).join("/")
  return relative || "vault"
}

const EXCLUDED_DIRS = new Set([".obsidian", ".vscode", "Excalidraw", "이미지저장소", ".git"])
const EXCLUDED_FILES = new Set(["콜아웃 리스트.md", "프롬프트.md"])

function createDocumentId(relativePath) {
  return relativePath.replace(/\.md$/, "").replace(/[/\\]/g, "--").replace(/\s+/g, "-")
}

function stripFrontmatter(content) {
  if (!content.startsWith("---")) return content
  const endIndex = content.indexOf("\n---", 3)
  if (endIndex === -1) return content
  return content.slice(endIndex + 4).trimStart()
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

function getVaultGitLogOutput(gitRoot, vaultPathSpec) {
  try {
    return execFileSync(
      "git",
      ["log", "--format=__COMMIT__%n%H%x09%cI", "--name-only", "--", vaultPathSpec],
      {
        cwd: gitRoot || process.cwd(),
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      }
    )
  } catch {
    return ""
  }
}

function getPathActivityMap() {
  const gitRoot = resolveGitRoot()
  const vaultPathSpec = resolveVaultPathSpec(gitRoot)
  const rawGitLog = getVaultGitLogOutput(gitRoot, vaultPathSpec)
  if (!rawGitLog) return new Map()

  const initialCommitHash = detectInitialVaultCommitHash(rawGitLog)
  const ignoredCommitHashes = initialCommitHash ? [initialCommitHash] : []

  return buildPathActivityMapFromGitLog(rawGitLog, { ignoredCommitHashes })
}

function normalizeRelativePath(relativePath) {
  return relativePath.split(path.sep).join("/")
}

function scanVault(dir, pathActivityMap) {
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
      documents.push(...scanVault(fullPath, pathActivityMap))
    } else if (entry.name.endsWith(".md")) {
      if (EXCLUDED_FILES.has(entry.name)) continue

      const relativePath = path.relative(VAULT_PATH, fullPath)
      const normalizedRelativePath = normalizeRelativePath(relativePath)
      const parts = normalizedRelativePath.split("/")
      const filename = parts[parts.length - 1].replace(/\.md$/, "")
      const category = parts.length > 1 ? parts[0] : "Root"
      const tags = parts.slice(0, -1).filter(Boolean)

      let rawContent = ""
      let content = ""
      let summary = ""
      try {
        rawContent = fs.readFileSync(fullPath, "utf-8")
        content = stripFrontmatter(rawContent)
        summary = extractSummary(content)
      } catch {
        // 읽기 실패 시 빈 값
      }

      const { eventDate, updatedAt } = extractVaultDateMeta(rawContent, normalizedRelativePath)
      const activityAt = pathActivityMap.get(normalizedRelativePath)
      const { outLinks: outLinksRaw, imageLinks: imageLinksRaw } = parseWikiLinks(content)

      documents.push({
        id: createDocumentId(normalizedRelativePath),
        title: filename,
        category,
        path: normalizedRelativePath,
        summary,
        tags,
        content,
        eventDate,
        updatedAt,
        activityAt,
        outLinksRaw,
        imageLinks: imageLinksRaw.map((link) => link.target),
      })
    }
  }

  return documents
}

// 볼트 존재 확인
if (!fs.existsSync(VAULT_PATH)) {
  console.error(`[build-vault] Vault not found at: ${VAULT_PATH}`)
  console.error("[build-vault] Ensure web/vault directory exists in repository.")
  process.exit(1)
}

const pathActivityMap = getPathActivityMap()
const documents = scanVault(VAULT_PATH, pathActivityMap)
const feedCandidates = documents.filter((document) => document.summary && document.activityAt)

if (documents.length === 0) {
  console.error("[build-vault] No markdown documents were discovered in web/vault.")
  process.exit(1)
}

if (feedCandidates.length === 0) {
  console.warn(
    "[build-vault] No activity documents were produced for Live Resume Feed. Check vault git history."
  )
}

// Wiki 링크 해석 + 역링크 인덱스
const catalogForIndex = new Map(
  documents.map((doc) => [doc.id, { id: doc.id, category: doc.category, title: doc.title }])
)
const docIndex = buildDocIndex(documents)

const ambiguousLinkTargets = new Set()
for (const doc of documents) {
  const resolvedOutLinks = []
  const seen = new Set()
  for (const link of doc.outLinksRaw ?? []) {
    const resolvedId = resolveWikiTarget(link.target, docIndex, {
      sourceCategory: doc.category,
      catalog: catalogForIndex,
      onAmbiguous: (target) => ambiguousLinkTargets.add(target),
    })
    if (!resolvedId || resolvedId === doc.id || seen.has(resolvedId)) continue
    seen.add(resolvedId)
    resolvedOutLinks.push(resolvedId)
  }
  doc.outLinks = resolvedOutLinks
  delete doc.outLinksRaw
}

const inLinksMap = new Map()
for (const doc of documents) {
  for (const targetId of doc.outLinks) {
    const existing = inLinksMap.get(targetId)
    if (existing) {
      existing.add(doc.id)
    } else {
      inLinksMap.set(targetId, new Set([doc.id]))
    }
  }
}
for (const doc of documents) {
  doc.inLinks = Array.from(inLinksMap.get(doc.id) ?? [])
}

if (ambiguousLinkTargets.size > 0) {
  console.warn(
    `[build-vault] Ambiguous wiki targets resolved by first match: ${Array.from(
      ambiguousLinkTargets
    )
      .slice(0, 10)
      .join(
        ", "
      )}${ambiguousLinkTargets.size > 10 ? ` (+${ambiguousLinkTargets.size - 10} more)` : ""}`
  )
}

const totalOutLinks = documents.reduce((sum, doc) => sum + doc.outLinks.length, 0)
console.log(
  `[build-vault] Wiki graph: ${totalOutLinks} out-links across ${documents.length} documents`
)

// 임베딩 생성
const embeddingCache = loadEmbeddingCache(EMBEDDING_CACHE_PATH)
const embeddingsMap = await buildEmbeddingMap(documents, embeddingCache)

// 출력 디렉토리 생성
fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })

// vault-data.json (메타 + 본문 + 링크 그래프, 임베딩은 별도 파일)
fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ documents }, null, 0))

const sizeKB = (fs.statSync(OUTPUT_PATH).size / 1024).toFixed(1)
console.log(`[build-vault] Built vault data: ${documents.length} documents (${sizeKB} KB)`)
console.log(`[build-vault] Live Resume Feed candidates: ${feedCandidates.length}`)

// 임베딩 JSON (없으면 빈 객체 — 런타임에서 BM25로 fallback)
const embeddingsObject = {}
for (const [docId, vector] of embeddingsMap) embeddingsObject[docId] = vector
fs.writeFileSync(EMBEDDINGS_PATH, JSON.stringify(embeddingsObject))
const embeddingsSizeKB = (fs.statSync(EMBEDDINGS_PATH).size / 1024).toFixed(1)
console.log(
  `[build-vault] Built embeddings: ${Object.keys(embeddingsObject).length} vectors (${embeddingsSizeKB} KB)`
)

// MiniSearch 인덱스 빌드
const miniSearch = new MiniSearch({
  fields: ["title", "category", "tagsText", "summary", "content"],
  storeFields: [
    "title",
    "category",
    "path",
    "summary",
    "tags",
    "eventDate",
    "updatedAt",
    "activityAt",
  ],
  searchOptions: {
    boost: { title: 3, category: 2, tagsText: 2, summary: 1.5, content: 1 },
    prefix: true,
    fuzzy: 0.2,
    combineWith: "OR",
  },
})

const indexDocs = documents.map((doc) => ({
  ...doc,
  tagsText: doc.tags.join(" "),
}))

miniSearch.addAll(indexDocs)

fs.writeFileSync(SEARCH_INDEX_PATH, JSON.stringify(miniSearch))

const indexSizeKB = (fs.statSync(SEARCH_INDEX_PATH).size / 1024).toFixed(1)
console.log(`[build-vault] Built search index: ${documents.length} documents (${indexSizeKB} KB)`)

async function buildEmbeddingMap(docs, cache) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const projectId = process.env.PUBLIC_FIREBASE_PROJECT_ID

  if (!privateKey || !clientEmail || !projectId) {
    console.warn(
      "[embedding] Missing FIREBASE_* env vars. Skipping embeddings — BM25 fallback will be used at runtime."
    )
    return new Map()
  }

  const vertex = createVertex({
    project: projectId,
    location: "global",
    googleAuthOptions: {
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
    },
  })
  const model = vertex.textEmbeddingModel(EMBEDDING_MODEL_ID)

  const {
    embeddings,
    cache: updatedCache,
    regenerated,
    failed,
  } = await generateEmbeddings({
    documents: docs,
    cache,
    embedMany,
    model,
  })

  saveEmbeddingCache(EMBEDDING_CACHE_PATH, updatedCache)
  console.log(
    `[embedding] ${embeddings.size} vectors ready (regenerated ${regenerated}, failed ${failed})`
  )
  return embeddings
}
