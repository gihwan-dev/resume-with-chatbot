const OBSIDIAN_PUBLISH_SLUG = "gihwan-dev"
const OBSIDIAN_PUBLISH_ORIGIN = "https://publish.obsidian.md"
const BLOG_PATH_PREFIX = "50-Blog/"
const BLOG_README_PATH = `${BLOG_PATH_PREFIX}README.md`
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const DEFAULT_LIMIT = 5

export const OBSIDIAN_BLOG_SECTION_URL = `${OBSIDIAN_PUBLISH_ORIGIN}/${OBSIDIAN_PUBLISH_SLUG}/50-Blog`

export interface ObsidianBlogPost {
  title: string
  url: string
  publishedAt: string
  summary?: string
}

interface CachedObsidianBlogPosts {
  fetchedAt: number
  posts: ObsidianBlogPost[]
}

interface PublishSiteInfo {
  host: string
  uid: string
}

interface BlogFrontmatter {
  type?: unknown
  title?: unknown
  description?: unknown
  draft?: unknown
  published?: unknown
  pubDatetime?: unknown
  updated?: unknown
}

interface PublishCacheEntry {
  frontmatter?: BlogFrontmatter
}

let cache: CachedObsidianBlogPosts | null = null
let inflightRequest: Promise<ObsidianBlogPost[]> | null = null

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readText(value: unknown): string {
  if (typeof value !== "string") return ""
  return value.trim()
}

function normalizeLimit(limit: number | undefined): number {
  if (limit === undefined) return DEFAULT_LIMIT
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT
  if (limit <= 0) return 0
  return Math.floor(limit)
}

function toPublishedAt(frontmatter: BlogFrontmatter): string | null {
  const candidates = [frontmatter.published, frontmatter.pubDatetime, frontmatter.updated]

  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue
    const timestamp = Date.parse(candidate)
    if (Number.isNaN(timestamp)) continue
    return new Date(timestamp).toISOString()
  }

  return null
}

function buildPostUrl(path: string): string {
  const withoutExtension = path.replace(/\.md$/, "")
  const encodedPath = withoutExtension
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")

  return `${OBSIDIAN_PUBLISH_ORIGIN}/${OBSIDIAN_PUBLISH_SLUG}/${encodedPath}`
}

function parseSiteInfo(pageHtml: string): PublishSiteInfo | null {
  const match = pageHtml.match(/window\.siteInfo\s*=\s*(\{[\s\S]*?\});/)
  if (!match?.[1]) return null

  try {
    const parsed = JSON.parse(match[1]) as { host?: unknown; uid?: unknown }
    const host = readText(parsed.host)
    const uid = readText(parsed.uid)

    if (!host || !uid) return null

    return { host, uid }
  } catch {
    return null
  }
}

function parsePosts(cacheData: unknown): ObsidianBlogPost[] {
  if (!isObject(cacheData)) return []

  const posts: ObsidianBlogPost[] = []

  for (const [path, value] of Object.entries(cacheData)) {
    if (!path.startsWith(BLOG_PATH_PREFIX)) continue
    if (!path.endsWith(".md")) continue
    if (path === BLOG_README_PATH) continue
    if (!isObject(value)) continue

    const frontmatter = (value as PublishCacheEntry).frontmatter
    if (!frontmatter || !isObject(frontmatter)) continue
    if (readText(frontmatter.type) !== "blog-post") continue
    if (frontmatter.draft === true) continue

    const title = readText(frontmatter.title)
    const publishedAt = toPublishedAt(frontmatter)
    if (!title || !publishedAt) continue

    const summary = readText(frontmatter.description) || undefined
    posts.push({
      title,
      url: buildPostUrl(path),
      publishedAt,
      summary,
    })
  }

  posts.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
  return posts
}

async function resolveSiteInfo(): Promise<PublishSiteInfo> {
  const pageResponse = await fetch(OBSIDIAN_BLOG_SECTION_URL, { cache: "no-store" })

  if (!pageResponse.ok) {
    throw new Error(`Failed to fetch Obsidian blog section: ${pageResponse.status}`)
  }

  const pageHtml = await pageResponse.text()
  const siteInfo = parseSiteInfo(pageHtml)

  if (!siteInfo) {
    throw new Error("Failed to parse Obsidian publish site info.")
  }

  return siteInfo
}

function buildCacheUrl(siteInfo: PublishSiteInfo): string {
  const host = siteInfo.host.replace(/^https?:\/\//, "")
  return `https://${host}/cache/${siteInfo.uid}`
}

async function fetchObsidianBlogPosts(): Promise<ObsidianBlogPost[]> {
  const siteInfo = await resolveSiteInfo()
  const cacheResponse = await fetch(buildCacheUrl(siteInfo), { cache: "no-store" })

  if (!cacheResponse.ok) {
    throw new Error(`Failed to fetch Obsidian publish cache: ${cacheResponse.status}`)
  }

  const cacheData = (await cacheResponse.json()) as unknown
  return parsePosts(cacheData)
}

export async function getObsidianBlogPosts(
  options: { limit?: number } = {}
): Promise<ObsidianBlogPost[]> {
  const limit = normalizeLimit(options.limit)
  const now = Date.now()

  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.posts.slice(0, limit)
  }

  if (!inflightRequest) {
    inflightRequest = fetchObsidianBlogPosts()
      .then((posts) => {
        cache = {
          fetchedAt: Date.now(),
          posts,
        }
        return posts
      })
      .catch((error) => {
        console.error("[obsidian-blog] Fetch failed.", error)
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
