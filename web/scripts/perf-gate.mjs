import { spawn, spawnSync } from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"
import { createServer as createNetServer } from "node:net"
import path from "node:path"
import process from "node:process"

const HOST = "127.0.0.1"
const DEFAULT_PORT = 4321
const THRESHOLD = Number.parseInt(process.env.PERF_GATE_THRESHOLD ?? "90", 10)
const LIGHTHOUSE_DIR = path.resolve(process.cwd(), "lighthouse")
const SUMMARY_PATH = path.join(LIGHTHOUSE_DIR, "performance-gate-summary.json")

const TARGETS = [
  { routeId: "home", routePath: "/" },
  { routeId: "portfolio_exem_data_grid", routePath: "/portfolio/exem-data-grid#overview" },
]

const FORM_FACTORS = [{ id: "desktop", preset: "desktop" }, { id: "mobile" }]

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf-8",
    maxBuffer: 50 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  })

  if (result.status !== 0) {
    const stderr = result.stderr?.trim() ?? ""
    const stdout = result.stdout?.trim() ?? ""
    const reason = [stderr, stdout].filter(Boolean).join("\n")
    throw new Error(`Command failed: ${command} ${args.join(" ")}\n${reason}`)
  }

  return result.stdout ?? ""
}

function parseJsonFromOutput(output) {
  const start = output.indexOf("{")
  const end = output.lastIndexOf("}")
  if (start < 0 || end < 0 || end <= start) {
    throw new Error("Lighthouse output does not contain valid JSON.")
  }

  return JSON.parse(output.slice(start, end + 1))
}

async function waitForServer(url, timeoutMs = 30_000) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // retry until timeout
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  throw new Error(`Preview server did not become ready within ${timeoutMs}ms (${url}).`)
}

async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const probe = createNetServer()
    probe.once("error", () => resolve(false))
    probe.listen(port, HOST, () => {
      probe.close(() => resolve(true))
    })
  })
}

async function findAvailablePort(startPort, maxOffset = 20) {
  for (let offset = 0; offset <= maxOffset; offset += 1) {
    const candidate = startPort + offset
    // eslint-disable-next-line no-await-in-loop
    if (await isPortAvailable(candidate)) {
      return candidate
    }
  }

  throw new Error(`No available port in range ${startPort}..${startPort + maxOffset}`)
}

function runLighthouse(url, formFactor) {
  const args = [
    "exec",
    "lighthouse",
    url,
    "--only-categories=performance",
    "--output=json",
    "--quiet",
    "--chrome-flags=--headless=new --no-sandbox",
  ]

  if (formFactor.preset) {
    args.push(`--preset=${formFactor.preset}`)
  }

  const output = runCommand("pnpm", args)
  return parseJsonFromOutput(output)
}

function extractMetrics(result) {
  return {
    fcp: result.audits["first-contentful-paint"]?.displayValue ?? "",
    lcp: result.audits["largest-contentful-paint"]?.displayValue ?? "",
    tbt: result.audits["total-blocking-time"]?.displayValue ?? "",
    cls: result.audits["cumulative-layout-shift"]?.displayValue ?? "",
  }
}

function startStaticServer(port) {
  return spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "preview",
      "--host",
      HOST,
      "--port",
      String(port),
      "--strictPort",
      "--outDir",
      "dist/client",
    ],
    {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
    }
  )
}

async function main() {
  if (!Number.isFinite(THRESHOLD) || THRESHOLD < 0 || THRESHOLD > 100) {
    throw new Error(`Invalid PERF_GATE_THRESHOLD: ${THRESHOLD}`)
  }

  console.log("[perf-gate] building production bundle...")
  runCommand("pnpm", ["run", "build"], { stdio: "inherit" })

  const port = await findAvailablePort(DEFAULT_PORT)
  if (port !== DEFAULT_PORT) {
    console.warn(`[perf-gate] port ${DEFAULT_PORT} in use; using ${port} instead`)
  }

  console.log("[perf-gate] starting static preview server...")
  const preview = startStaticServer(port)

  const cleanup = () => {
    if (!preview.killed) {
      preview.kill("SIGTERM")
    }
  }

  process.on("exit", cleanup)
  process.on("SIGINT", () => {
    cleanup()
    process.exit(130)
  })
  process.on("SIGTERM", () => {
    cleanup()
    process.exit(143)
  })

  preview.stderr.on("data", (chunk) => {
    const message = chunk.toString().trim()
    if (message) {
      console.warn(`[preview] ${message}`)
    }
  })

  await waitForServer(`http://${HOST}:${port}`)

  const reports = []

  for (const target of TARGETS) {
    for (const formFactor of FORM_FACTORS) {
      const url = `http://${HOST}:${port}${target.routePath}`
      console.log(`[perf-gate] measuring ${formFactor.id}: ${target.routePath}`)
      const lighthouseResult = runLighthouse(url, formFactor)
      const score = Math.round((lighthouseResult.categories.performance?.score ?? 0) * 100)

      reports.push({
        routeId: target.routeId,
        routePath: target.routePath,
        formFactor: formFactor.id,
        url,
        score,
        threshold: THRESHOLD,
        pass: score >= THRESHOLD,
        metrics: extractMetrics(lighthouseResult),
      })
    }
  }

  cleanup()

  const summary = {
    generatedAt: new Date().toISOString(),
    threshold: THRESHOLD,
    preview: {
      host: HOST,
      port,
    },
    targets: reports,
    passAll: reports.every((report) => report.pass),
  }

  await mkdir(LIGHTHOUSE_DIR, { recursive: true })
  await writeFile(SUMMARY_PATH, `${JSON.stringify(summary, null, 2)}\n`, "utf-8")

  console.log("[perf-gate] summary written to lighthouse/performance-gate-summary.json")
  for (const report of reports) {
    const status = report.pass ? "PASS" : "FAIL"
    console.log(
      `- [${status}] ${report.formFactor} ${report.routePath}: ${report.score} (threshold ${THRESHOLD})`
    )
  }

  if (!summary.passAll) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error("[perf-gate] failed:", error)
  process.exit(1)
})
