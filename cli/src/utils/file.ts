import * as fs from "node:fs"
import * as path from "node:path"
import * as readline from "node:readline"
import { z } from "zod"

/**
 * Read a JSONL file line by line and parse each line with the provided schema
 */
export async function* readJsonlFile<T>(
  filePath: string,
  schema: z.ZodSchema<T>
): AsyncGenerator<{ data: T; lineNumber: number } | { error: Error; lineNumber: number; raw: string }> {
  if (!fs.existsSync(filePath)) {
    return
  }

  const fileStream = fs.createReadStream(filePath, { encoding: "utf-8" })
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Number.POSITIVE_INFINITY,
  })

  let lineNumber = 0

  for await (const line of rl) {
    lineNumber++
    const trimmed = line.trim()
    if (!trimmed) continue

    try {
      const parsed = JSON.parse(trimmed)
      const validated = schema.parse(parsed)
      yield { data: validated, lineNumber }
    } catch (err) {
      yield { error: err instanceof Error ? err : new Error(String(err)), lineNumber, raw: trimmed }
    }
  }
}

/**
 * Get all JSONL files in a directory recursively
 */
export async function getJsonlFiles(dirPath: string): Promise<string[]> {
  const files: string[] = []

  if (!fs.existsSync(dirPath)) {
    return files
  }

  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      const subFiles = await getJsonlFiles(fullPath)
      files.push(...subFiles)
    } else if (entry.isFile() && entry.name.endsWith(".jsonl")) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Write JSON to a file with pretty printing
 */
export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  const dir = path.dirname(filePath)
  await fs.promises.mkdir(dir, { recursive: true })
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8")
}

/**
 * Get the home directory path
 */
export function getHomeDir(): string {
  return process.env.HOME || process.env.USERPROFILE || "~"
}

/**
 * Resolve path with home directory expansion
 */
export function resolvePath(inputPath: string): string {
  if (inputPath.startsWith("~")) {
    return path.join(getHomeDir(), inputPath.slice(1))
  }
  return path.resolve(inputPath)
}

/**
 * Extract project name from path
 */
export function extractProjectName(projectPath: string): string {
  // Remove trailing slashes and get the last part
  const normalized = projectPath.replace(/\/+$/, "")
  const parts = normalized.split("/")
  return parts[parts.length - 1] || "unknown"
}

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath)
}
