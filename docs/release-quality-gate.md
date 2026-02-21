# Phase 6 Release Quality Gate

- Last updated: 2026-02-21T14:19:49.998Z
- Scope: Phase 6 (`사용자 흐름 E2E 검증`, `비기능 품질 게이트`)

## Verification Commands

```bash
pnpm -C web run typecheck
pnpm -C web run lint
pnpm -C web run test:run
pnpm -C web exec playwright test e2e/resume-portfolio-print-flow.spec.ts e2e/portfolio-deep-link.spec.ts e2e/portfolio-toc-and-print.spec.ts e2e/chat-fab.spec.ts e2e/accessibility.spec.ts --project=chromium
pnpm -C web run perf:gate
pnpm -C web run quality:sync-issues
```

## Checklist

- [x] 이력서 -> 포트폴리오 -> 인쇄 저장 흐름 E2E 통과
- [x] 접근성(axe critical/serious) 검증 통과
- [x] Lighthouse 성능(`desktop/mobile`) 90점 이상
- [x] 실패 항목 문서화 및 GitHub 이슈 분리 완료

## Performance Gate Auto Report

<!-- PERF_GATE_SUMMARY:START -->
- Generated at: 2026-02-21T14:19:49.998Z
- Threshold: 90
- Overall: PASS

| Route | Form Factor | Score | Threshold | Status | Issue |
| --- | --- | ---: | ---: | --- | --- |
| `/` | desktop | 100 | 90 | PASS | - |
| `/` | mobile | 99 | 90 | PASS | - |
| `/portfolio/exem-data-grid#overview` | desktop | 100 | 90 | PASS | - |
| `/portfolio/exem-data-grid#overview` | mobile | 99 | 90 | PASS | - |
<!-- PERF_GATE_SUMMARY:END -->
