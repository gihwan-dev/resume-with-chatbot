const WIKI_LINK_PATTERN = /(!?)\[\[([^[\]\n]+?)(?:\|([^[\]\n]+?))?\]\]/g
const IMAGE_EXTENSION_PATTERN = /\.(png|jpe?g|gif|svg|webp|bmp|avif)$/i

export function parseWikiLinks(content) {
  if (typeof content !== "string" || content.length === 0) {
    return { outLinks: [], imageLinks: [] }
  }

  const outLinks = []
  const imageLinks = []

  for (const match of content.matchAll(WIKI_LINK_PATTERN)) {
    const [, embedMark, rawTarget, alias] = match
    const embed = embedMark === "!"
    const normalizedTarget = stripAnchorsAndBlocks(rawTarget).trim()
    if (!normalizedTarget) continue

    const entry = {
      target: normalizedTarget,
      display: typeof alias === "string" ? alias.trim() : undefined,
    }

    if (embed && IMAGE_EXTENSION_PATTERN.test(normalizedTarget)) {
      imageLinks.push(entry)
    } else if (!embed) {
      outLinks.push(entry)
    }
  }

  return { outLinks, imageLinks }
}

function stripAnchorsAndBlocks(raw) {
  if (typeof raw !== "string") return ""
  return raw.split("#")[0].split("^")[0]
}

export function buildDocIndex(documents) {
  const pathMap = new Map()
  const titleMap = new Map()
  const basenameMap = new Map()

  for (const doc of documents) {
    const lowerPath = doc.path.toLowerCase()
    const pathWithoutExt = lowerPath.replace(/\.md$/i, "")
    if (!pathMap.has(pathWithoutExt)) pathMap.set(pathWithoutExt, doc.id)
    if (!pathMap.has(lowerPath)) pathMap.set(lowerPath, doc.id)

    const lowerTitle = doc.title.toLowerCase()
    pushUnique(titleMap, lowerTitle, doc.id)

    const basename = doc.path.split("/").pop() ?? doc.title
    const lowerBasename = basename.replace(/\.md$/i, "").toLowerCase()
    pushUnique(basenameMap, lowerBasename, doc.id)
  }

  return { pathMap, titleMap, basenameMap }
}

function pushUnique(map, key, value) {
  const existing = map.get(key)
  if (!existing) {
    map.set(key, [value])
    return
  }
  if (!existing.includes(value)) existing.push(value)
}

export function resolveWikiTarget(rawTarget, docIndex, context = {}) {
  if (!rawTarget) return null
  const target = String(rawTarget).trim()
  if (!target) return null

  const lowerTarget = target.toLowerCase()
  const normalizedPathTarget = lowerTarget.replace(/\.md$/i, "")

  if (target.includes("/")) {
    const hit = docIndex.pathMap.get(normalizedPathTarget) ?? docIndex.pathMap.get(lowerTarget)
    if (hit) return hit
  }

  const titleHits = docIndex.titleMap.get(lowerTarget)
  if (titleHits && titleHits.length > 0) {
    return pickBestCandidate(titleHits, context, target)
  }

  const basenameHits = docIndex.basenameMap.get(normalizedPathTarget)
  if (basenameHits && basenameHits.length > 0) {
    return pickBestCandidate(basenameHits, context, target)
  }

  return null
}

function pickBestCandidate(candidates, context, target) {
  if (candidates.length === 1) return candidates[0]

  if (context?.sourceCategory && context?.catalog) {
    const sameCategory = candidates.find((id) => {
      const doc = context.catalog.get(id)
      return doc && doc.category === context.sourceCategory
    })
    if (sameCategory) return sameCategory
  }

  if (context?.onAmbiguous) {
    context.onAmbiguous(target, candidates)
  }

  return candidates[0]
}
