# Accessibility Report

- Date: 2026-02-15
- Scope: Issue #50 (`접근성(WCAG) 및 키보드 내비게이션 개선`)
- Target: Resume main page + chat modal + mobile sheet

## Validation Commands

```bash
pnpm -C web lint
pnpm -C web run a11y:axe
pnpm -C web exec playwright test e2e/chat-fab.spec.ts --project=chromium
```

Lighthouse was measured against a local server (`http://localhost:4321/`) with both form factors:

```bash
pnpm -C web run a11y:lighthouse
pnpm -C web exec lighthouse http://localhost:4321 --only-categories=accessibility --preset=desktop --output=html --output=json --output-path=./lighthouse/accessibility-desktop --quiet --chrome-flags='--headless=new --no-sandbox'
pnpm -C web exec lighthouse http://localhost:4321 --only-categories=accessibility --output=html --output=json --output-path=./lighthouse/accessibility-mobile --quiet --chrome-flags='--headless=new --no-sandbox'
```

## Results

### Playwright + axe

- `web/e2e/accessibility.spec.ts`: 10 passed
- `critical`: 0
- `serious`: 0

### Regression Check

- `web/e2e/chat-fab.spec.ts`: 7 passed

### Lighthouse Accessibility

- Mobile (`web/lighthouse/accessibility-mobile.report.json`)
  - fetchTime: `2026-02-15T07:26:43.612Z`
  - score: `1.00` (100/100)
- Desktop (`web/lighthouse/accessibility-desktop.report.json`)
  - fetchTime: `2026-02-15T07:26:43.675Z`
  - score: `1.00` (100/100)

## Key Improvements Implemented

- Added skip link and keyboard-focusable main target (`#main-content`).
- Improved global focus-visible outline and skip-link visibility styles.
- Converted section navigation to semantic hash anchors with keyboard support and fallback behavior.
- Added explicit modal accessible name/description and deterministic focus behavior for chat modal open/close.
- Added keyboard close handling (`Escape`) and focus return for chat trigger.
- Improved mobile sheet keyboard flow with focus loop and Escape close handling.
- Added accessible names for icon-only controls (carousel arrows, theme switch).
- Fixed chat welcome text contrast issue detected by axe.
- Added automated accessibility test suite (`Playwright + axe`) and npm scripts.

## Remaining Issues

- No critical or serious violations detected in current automated scope.
- Manual screen-reader pass (NVDA/VoiceOver narration quality) can be added as a follow-up qualitative check.
