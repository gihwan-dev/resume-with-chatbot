import { XMLParser } from "fast-xml-parser"

const VELOG_USERNAME = "koreanthuglife"
const VELOG_POSTS_URL = `https://velog.io/@${VELOG_USERNAME}/posts`
const VELOG_RSS_URL = `https://v2.velog.io/rss/${VELOG_USERNAME}`
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const DEFAULT_LIMIT = 5

export interface VelogPost {
  title: string
  url: string
  publishedAt: string
  summary?: string
}

interface CachedVelogPosts {
  fetchedAt: number
  posts: VelogPost[]
}

interface VelogRssItem {
  title?: unknown
  link?: unknown
  pubDate?: unknown
  description?: unknown
}

interface VelogRssDocument {
  rss?: {
    channel?: {
      item?: VelogRssItem | VelogRssItem[]
    }
  }
}

let cache: CachedVelogPosts | null = null
let inflightRequest: Promise<VelogPost[]> | null = null

function toArray<T>(value: T | T[] | undefined): T[] {
  if (Array.isArray(value)) return value
  if (value === undefined) return []
  return [value]
}

function readRssText(value: unknown): string {
  if (typeof value === "string") return value.trim()
  if (!value || typeof value !== "object") return ""

  const cdataValue = (value as Record<string, unknown>)["#cdata"]
  if (typeof cdataValue === "string") {
    return cdataValue.trim()
  }

  return ""
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function summarize(description: string): string | undefined {
  const cleaned = stripHtml(description)
  if (!cleaned) return undefined
  if (cleaned.length <= 180) return cleaned
  return `${cleaned.slice(0, 177)}...`
}

function parseRss(xml: string): VelogPost[] {
  const parser = new XMLParser({
    trimValues: true,
    ignoreAttributes: true,
    parseTagValue: false,
    cdataPropName: "#cdata",
  })

  const parsed = parser.parse(xml) as VelogRssDocument
  const items = toArray(parsed.rss?.channel?.item)
  const posts: VelogPost[] = []

  for (const item of items) {
    const title = readRssText(item.title)
    const url = readRssText(item.link)
    const pubDateRaw = readRssText(item.pubDate)
    const summaryRaw = readRssText(item.description)
    const publishedAtUnix = Date.parse(pubDateRaw)

    if (!title || !url || Number.isNaN(publishedAtUnix)) {
      continue
    }

    posts.push({
      title,
      url,
      publishedAt: new Date(publishedAtUnix).toISOString(),
      summary: summarize(summaryRaw),
    })
  }

  posts.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
  return posts
}

async function fetchVelogPosts(): Promise<VelogPost[]> {
  const response = await fetch(VELOG_RSS_URL, {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch Velog RSS: ${response.status}`)
  }

  const xml = await response.text()
  return parseRss(xml)
}

function normalizeLimit(limit: number | undefined): number {
  if (limit === undefined) return DEFAULT_LIMIT
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT
  if (limit <= 0) return 0
  return Math.floor(limit)
}

export async function getVelogPosts(options: { limit?: number } = {}): Promise<VelogPost[]> {
  const limit = normalizeLimit(options.limit)
  const now = Date.now()

  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.posts.slice(0, limit)
  }

  if (!inflightRequest) {
    inflightRequest = fetchVelogPosts()
      .then((posts) => {
        cache = {
          fetchedAt: Date.now(),
          posts,
        }
        return posts
      })
      .catch((error) => {
        console.error("[velog] RSS fetch failed.", error)
        if (cache) {
          return cache.posts
        }
        return []
      })
      .finally(() => {
        inflightRequest = null
      })
  }

  const posts = await inflightRequest
  return posts.slice(0, limit)
}

export const VELOG_POSTS_PAGE_URL = VELOG_POSTS_URL
