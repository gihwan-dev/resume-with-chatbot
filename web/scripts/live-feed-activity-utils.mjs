const COMMIT_MARKER = "__COMMIT__"
const VAULT_PREFIX = "vault/"

export const BULK_IMPORT_COMMIT_HASH = "ee2e5b1f"

function normalizePath(pathText) {
  return String(pathText ?? "")
    .trim()
    .replace(/\\/g, "/")
}

function normalizeCommitHash(hash) {
  return String(hash ?? "")
    .trim()
    .toLowerCase()
}

function normalizeVaultRelativePath(gitPath) {
  const normalizedPath = normalizePath(gitPath)
  if (normalizedPath.startsWith(VAULT_PREFIX)) {
    return normalizedPath.slice(VAULT_PREFIX.length)
  }
  return normalizedPath
}

function isExcludedByDirectory(relativePath) {
  return (
    relativePath.startsWith("Exem/01-Projects/") ||
    relativePath.startsWith("Exem/05-Templates/") ||
    relativePath.startsWith("Exem/06-Archive/")
  )
}

export function shouldIncludeFeedActivityPath(relativePath) {
  const normalizedPath = normalizePath(relativePath)
  if (!normalizedPath || !normalizedPath.endsWith(".md")) return false
  if (isExcludedByDirectory(normalizedPath)) return false
  if (normalizedPath.endsWith(".excalidraw.md")) return false

  const fileName = normalizedPath.split("/").at(-1) ?? ""
  if (fileName === "README.md" || fileName === "TODO.md") return false

  return true
}

export function buildPathActivityMapFromGitLog(
  rawGitLog,
  options = {
    ignoredCommitHashes: [],
  }
) {
  const ignoredHashes = new Set(
    (options.ignoredCommitHashes ?? []).flatMap((hash) => {
      const normalized = normalizeCommitHash(hash)
      if (!normalized) return []
      return [normalized, normalized.slice(0, 8)]
    })
  )

  const lines = String(rawGitLog ?? "").split(/\r?\n/)
  const pathActivityMap = new Map()

  let currentCommitHash = ""
  let currentCommittedAt = ""
  let isCurrentCommitIgnored = true

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    if (line === COMMIT_MARKER) {
      currentCommitHash = ""
      currentCommittedAt = ""
      isCurrentCommitIgnored = true
      continue
    }

    if (!currentCommitHash) {
      const [hash, committedAt] = line.split("\t")
      if (!hash || !committedAt) continue

      currentCommitHash = normalizeCommitHash(hash)
      currentCommittedAt = committedAt.trim()
      isCurrentCommitIgnored =
        ignoredHashes.has(currentCommitHash) || ignoredHashes.has(currentCommitHash.slice(0, 8))
      continue
    }

    if (isCurrentCommitIgnored) continue
    if (!currentCommittedAt || Number.isNaN(Date.parse(currentCommittedAt))) continue

    const relativePath = normalizeVaultRelativePath(line)
    if (!relativePath) continue
    if (!shouldIncludeFeedActivityPath(relativePath)) continue
    if (pathActivityMap.has(relativePath)) continue

    pathActivityMap.set(relativePath, currentCommittedAt)
  }

  return pathActivityMap
}
