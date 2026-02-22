import type { ObsidianBlogPost } from "./obsidian-publish"

const FEATURED_KEYWORDS: ReadonlyArray<{ keyword: string; weight: number }> = [
  { keyword: "아키텍처", weight: 4 },
  { keyword: "architecture", weight: 4 },
  { keyword: "설계", weight: 4 },
  { keyword: "decision", weight: 3 },
  { keyword: "의사결정", weight: 3 },
  { keyword: "trade-off", weight: 3 },
  { keyword: "트레이드오프", weight: 3 },
  { keyword: "성능", weight: 3 },
  { keyword: "performance", weight: 3 },
  { keyword: "테스트", weight: 2 },
  { keyword: "test", weight: 2 },
  { keyword: "회귀", weight: 2 },
  { keyword: "응집도", weight: 2 },
  { keyword: "결합도", weight: 2 },
  { keyword: "개선", weight: 1 },
  { keyword: "개선기", weight: 1 },
]

const LATEST_POST_COUNT = 4

export interface CuratedTechnicalWritingPosts {
  featuredPost: ObsidianBlogPost | null
  latestPosts: ObsidianBlogPost[]
}

function toPublishedTime(publishedAt: string): number {
  const parsed = Date.parse(publishedAt)
  return Number.isNaN(parsed) ? 0 : parsed
}

function sortByLatest(posts: readonly ObsidianBlogPost[]): ObsidianBlogPost[] {
  return [...posts].sort(
    (left, right) => toPublishedTime(right.publishedAt) - toPublishedTime(left.publishedAt)
  )
}

function scoreFeaturedPost(post: ObsidianBlogPost): number {
  const searchableText = `${post.title} ${post.summary ?? ""}`.toLowerCase()

  return FEATURED_KEYWORDS.reduce((score, { keyword, weight }) => {
    return searchableText.includes(keyword.toLowerCase()) ? score + weight : score
  }, 0)
}

export function curateTechnicalWritingPosts(
  posts: readonly ObsidianBlogPost[]
): CuratedTechnicalWritingPosts {
  const latestOrderedPosts = sortByLatest(posts)
  if (latestOrderedPosts.length === 0) {
    return {
      featuredPost: null,
      latestPosts: [],
    }
  }

  const scoredCandidates = latestOrderedPosts
    .map((post) => ({
      post,
      score: scoreFeaturedPost(post),
      publishedTime: toPublishedTime(post.publishedAt),
    }))
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score
      }
      if (left.publishedTime !== right.publishedTime) {
        return right.publishedTime - left.publishedTime
      }
      return left.post.title.localeCompare(right.post.title)
    })

  const topCandidate = scoredCandidates[0]
  const featuredPost = topCandidate.score > 0 ? topCandidate.post : latestOrderedPosts[0]
  const latestPosts = latestOrderedPosts
    .filter((post) => post.url !== featuredPost.url)
    .slice(0, LATEST_POST_COUNT)

  return {
    featuredPost,
    latestPosts,
  }
}
