import { spawnSync } from "node:child_process"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"

const SUMMARY_PATH = path.resolve(process.cwd(), "lighthouse", "performance-gate-summary.json")
const DOC_PATH = path.resolve(process.cwd(), "..", "docs", "release-quality-gate.md")
const MARKER_START = "<!-- PERF_GATE_SUMMARY:START -->"
const MARKER_END = "<!-- PERF_GATE_SUMMARY:END -->"

const DEFAULT_DOC_TEMPLATE = `# Phase 6 Release Quality Gate

- Last updated: TBD
- Scope: Phase 6 (통합 검증 및 품질 게이트)

## Verification Commands

\`\`\`bash
pnpm -C web run typecheck
pnpm -C web run lint
pnpm -C web run test:run
pnpm -C web exec playwright test e2e/resume-portfolio-print-flow.spec.ts e2e/portfolio-deep-link.spec.ts e2e/portfolio-toc-and-print.spec.ts e2e/chat-fab.spec.ts e2e/accessibility.spec.ts --project=chromium
pnpm -C web run perf:gate
\`\`\`

## Checklist

- [ ] Resume -> Portfolio -> Print 흐름 E2E 통과
- [ ] 접근성(axe critical/serious) 통과
- [ ] Lighthouse desktop/mobile 성능 >= 90
- [ ] 실패 항목 문서화 + GitHub 이슈 분리

## Performance Gate Auto Report

${MARKER_START}
_pending_
${MARKER_END}
`

function runGh(args) {
  const result = spawnSync("gh", args, {
    cwd: path.resolve(process.cwd(), ".."),
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
  })

  if (result.status !== 0) {
    const reason = [result.stderr?.trim(), result.stdout?.trim()].filter(Boolean).join("\n")
    throw new Error(`gh ${args.join(" ")} failed\n${reason}`)
  }

  return result.stdout.trim()
}

function findOpenIssueByTitle(title) {
  const query = `"${title}" in:title`
  const output = runGh([
    "issue",
    "list",
    "--state",
    "open",
    "--search",
    query,
    "--limit",
    "20",
    "--json",
    "number,title,url",
  ])

  const issues = JSON.parse(output)
  return issues.find((issue) => issue.title === title) ?? null
}

function createIssue(title, body) {
  const output = runGh(["issue", "create", "--title", title, "--body", body, "--label", "bug"])
  const url = output.split("\n").find((line) => line.startsWith("http")) ?? output
  const numberMatch = url.match(/\/issues\/(\d+)$/)
  return {
    number: numberMatch ? Number.parseInt(numberMatch[1], 10) : null,
    url,
  }
}

function getFailureTitle(target, threshold) {
  return `[Phase 6][Quality Gate] Performance ${target.routeId} (${target.formFactor}) < ${threshold}`
}

function buildIssueBody(target, threshold, generatedAt) {
  return [
    "## Summary",
    `- Route: \`${target.routePath}\``,
    `- Form factor: \`${target.formFactor}\``,
    `- Score: \`${target.score}\``,
    `- Threshold: \`${threshold}\``,
    `- Generated at: \`${generatedAt}\``,
    "",
    "## Metrics",
    `- FCP: ${target.metrics.fcp}`,
    `- LCP: ${target.metrics.lcp}`,
    `- TBT: ${target.metrics.tbt}`,
    `- CLS: ${target.metrics.cls}`,
    "",
    "## Action Items",
    "- [ ] 원인 분석 및 병목 구간 식별",
    "- [ ] 성능 개선 적용",
    "- [ ] perf:gate 재측정 후 90점 이상 확인",
  ].join("\n")
}

function renderAutoSection(summary, issueByKey) {
  const lines = []
  lines.push(`- Generated at: ${summary.generatedAt}`)
  lines.push(`- Threshold: ${summary.threshold}`)
  lines.push(`- Overall: ${summary.passAll ? "PASS" : "FAIL"}`)
  lines.push("")
  lines.push("| Route | Form Factor | Score | Threshold | Status | Issue |")
  lines.push("| --- | --- | ---: | ---: | --- | --- |")

  for (const target of summary.targets) {
    const key = `${target.routeId}:${target.formFactor}`
    const issue = issueByKey.get(key)
    const issueCell = issue ? `[#${issue.number}](${issue.url})` : "-"
    lines.push(
      `| \`${target.routePath}\` | ${target.formFactor} | ${target.score} | ${summary.threshold} | ${
        target.pass ? "PASS" : "FAIL"
      } | ${issueCell} |`
    )
  }

  return lines.join("\n")
}

function upsertAutoSection(doc, section) {
  const block = `${MARKER_START}\n${section}\n${MARKER_END}`

  if (!doc.includes(MARKER_START) || !doc.includes(MARKER_END)) {
    return `${doc.trimEnd()}\n\n## Performance Gate Auto Report\n\n${block}\n`
  }

  const pattern = new RegExp(`${MARKER_START}[\\s\\S]*?${MARKER_END}`, "g")
  return doc.replace(pattern, block)
}

async function main() {
  const summaryRaw = await readFile(SUMMARY_PATH, "utf-8")
  const summary = JSON.parse(summaryRaw)

  const issueByKey = new Map()

  for (const target of summary.targets.filter((item) => !item.pass)) {
    const title = getFailureTitle(target, summary.threshold)
    const existing = findOpenIssueByTitle(title)
    const issue =
      existing ?? createIssue(title, buildIssueBody(target, summary.threshold, summary.generatedAt))
    issueByKey.set(`${target.routeId}:${target.formFactor}`, issue)
  }

  let doc
  try {
    doc = await readFile(DOC_PATH, "utf-8")
  } catch {
    doc = DEFAULT_DOC_TEMPLATE
  }

  const updatedAtLine = `- Last updated: ${summary.generatedAt}`
  const withUpdatedAt = doc.match(/^- Last updated:.*$/m)
    ? doc.replace(/^- Last updated:.*$/m, updatedAtLine)
    : `${updatedAtLine}\n${doc}`

  const autoSection = renderAutoSection(summary, issueByKey)
  const nextDoc = upsertAutoSection(withUpdatedAt, autoSection)

  await writeFile(DOC_PATH, nextDoc, "utf-8")

  if (issueByKey.size > 0) {
    console.log(`[quality-issue-sync] linked ${issueByKey.size} performance issue(s)`)
  } else {
    console.log("[quality-issue-sync] no failing performance target, no issue created")
  }
}

main().catch((error) => {
  console.error("[quality-issue-sync] failed:", error)
  process.exit(1)
})
