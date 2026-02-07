# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered interactive resume site. An Astro + React SPA where a chat widget answers visitor questions about the owner's career by searching a local Obsidian vault via tool-calling agents (Gemini 2.5 Pro). Deployed on Vercel.

## Commands

All commands run from `web/`:

```bash
pnpm dev              # Astro dev server
pnpm build            # build-vault.mjs + astro build
pnpm build:vault      # Rebuild vault-data.json only
pnpm lint             # Biome check
pnpm lint:fix         # Biome check --write
pnpm format           # Biome format --write
pnpm test             # Vitest watch mode
pnpm test:run         # Vitest single run
pnpm test:run -- tests/lib/work-agent/tools.test.ts  # Run single test file
```

## Architecture

### Repo Layout

Monorepo root with `web/` containing the Astro app. `web/vault/` is a git submodule pointing to an Obsidian vault. `web/scripts/build-vault.mjs` pre-builds the vault into `src/generated/vault-data.json` (Vercel serverless can't scan filesystem at runtime).

### Tech Stack

- **Astro 5 + React 19** with `client:load` hydration
- **Vercel AI SDK** (`ai` package) — `streamText`, `convertToModelMessages`, tool calling
- **Google Vertex AI** — Gemini 2.5 Pro (chat), Gemini 2.0 Flash (followup)
- **@assistant-ui/react** — Chat modal/thread primitives (wraps Radix Popover)
- **TailwindCSS 4**, **Zustand**, **Zod**
- **Biome** for linting/formatting (not ESLint), **Vitest** for tests
- **Sentry** for error monitoring, **GA4** for analytics

### Chat Agent System (`src/lib/work-agent/`)

The core AI logic follows a multi-phase agent pattern:

1. **Intent classification** (`prompts.ts`) — categorizes user question → `career_inquiry | technical_inquiry | contact_inquiry | general_chat`
2. **Dynamic system prompt** — customizes persona and search strategy per intent
3. **Agentic tool loop** (`pages/api/chat.ts`) — `streamText` with `prepareStep` callback controlling tool availability per step:
   - Step 0: search tools only (`toolChoice: "required"`)
   - Step 1+: analyzes tool call patterns, enforces minimum search counts per intent, applies reflexion (excludes tool after 3+ consecutive same-tool calls)
   - Loop ends on `hasToolCall("answer")` or `stepCountIs(15)`
4. **Source validation** (`source-tracker.ts`) — `SearchContext` tracks all retrieved document IDs; `createAnswerTool` validates answer sources match actual search results to prevent hallucination

Key modules:
- `obsidian.server.ts` — searchDocuments, readDocument, buildCatalogSummary
- `tools.ts` — AI SDK tool definitions (searchDocuments, readDocument, answer)
- `prompts.ts` — classifyIntent, buildDynamicSystemPrompt, analyzeToolCallPattern, shouldAllowAnswer
- `source-tracker.ts` — createSearchContext, buildSearchContextFromSteps, validateSources

### API Routes

- `POST /api/chat` — Main chat endpoint. Returns UI Message Stream Protocol (SSE: `data: {JSON}\n\n`, terminated by `data: [DONE]\n\n`). Headers: `content-type: text/event-stream`, `x-vercel-ai-ui-message-stream: v1`.
- `POST /api/followup` — Generates follow-up question suggestions via Gemini 2.0 Flash text stream.

### Content Collections

Resume data (`src/content/`) uses Astro Content Collections with typed Zod schemas: `work/`, `projects/`, `education/`, `certificates/`, `awards/`, `basics/`.

### React Hydration

`client:load` components have a 2-3 second delay between SSR DOM render and React hydration. For E2E tests, use Playwright's `expect().toPass({ timeout })` retry pattern — `waitForSelector` alone is insufficient since elements exist in SSR HTML before event handlers attach.

## Code Style

- **Biome** (not ESLint/Prettier): 2-space indent, double quotes, no semicolons (ASI), trailing commas (ES5), LF line endings, 100 char line width
- `.astro` files have relaxed unused variable/import rules
- `src/components/ui/**` (Shadcn) has relaxed a11y rules
- Path alias: `@/` → `src/`

## Testing

- **Framework**: Vitest with happy-dom environment
- **Setup**: `tests/setup.ts` mocks Sentry and suppresses console noise
- **Location**: `web/tests/` mirroring `src/` structure
- **Coverage**: targets `src/lib/rag-agent/**/*.ts` (configured in vitest.config.ts, note: config says `rag-agent` but actual code is `work-agent`)
- **Env vars**: `vitest.config.ts` loads all `.env` vars into `import.meta.env` via `loadEnv`

## Environment Variables

Required for runtime:
- `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, `PUBLIC_FIREBASE_PROJECT_ID` — Vertex AI auth
- `PUBLIC_SENTRY_DSN` — Error tracking (prod only)
- `PUBLIC_GA_MEASUREMENT_ID` — Analytics

## Key Patterns

- **Vertex AI lazy init**: `getVertex()` creates the client per-request to avoid connection pooling issues in serverless
- **TOON format**: `@toon-format/toon` applies 38% token compression for large (10+) array results
- **Token optimization**: Slim types filter response data to remove unused fields before sending to LLM
- **Vault pre-build**: `build-vault.mjs` runs before `astro build` to serialize Obsidian vault into JSON for serverless compatibility