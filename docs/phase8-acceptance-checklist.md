# Phase 8 Acceptance Checklist

- 기준 문서: `docs/PRD.md`, `milestone.md`
- 마지막 갱신: 2026-02-22
- 상태: 자동 검증 PASS, 팀 리뷰 합의 대기

## 1) PRD 요구사항 ↔ 자동 검증 매핑

| PRD 수용 기준 | 자동 검증 범위 | 증빙 테스트/검증 | 상태 |
| --- | --- | --- | --- |
| Hook First 구조(Hero + Impact 2~3개) | 상세 페이지 `#hook`, 임팩트 카드 수 | `web/e2e/portfolio-prd-acceptance.spec.ts` | [x] |
| Story Thread 구조(2~3개 이슈) | `#threads` 스레드 개수/구조 | `web/e2e/portfolio-prd-acceptance.spec.ts` | [x] |
| 전환 문장(Thought Process) | 각 스레드의 thought blockquote 존재 | `web/e2e/portfolio-prd-acceptance.spec.ts` | [x] |
| Before & After 요구 | 케이스별 비교 블록 1개 이상 | `web/e2e/portfolio-prd-acceptance.spec.ts` | [x] |
| Retrospective 섹션 | `#retrospective` 텍스트 존재 | `web/e2e/portfolio-prd-acceptance.spec.ts` | [x] |
| 데이터 스키마 필수 요구 필드 | storyThread/해시/매핑 검증 | `web/tests/lib/resume-portfolio/story-thread-schema.test.ts`, `web/tests/lib/resume-portfolio/hash.test.ts`, `web/tests/lib/resume-portfolio/validation.test.ts` | [x] |
| 핵심 사용자 흐름 회귀 | Resume CTA -> 상세 -> 복귀(+스크롤) | `web/e2e/portfolio-resume-return-flow.spec.ts`, `web/e2e/resume-portfolio-print-flow.spec.ts` | [x] |
| 딥링크/목차/인쇄 회귀 | canonical hash, toc active, print | `web/e2e/portfolio-deep-link.spec.ts`, `web/e2e/portfolio-toc-and-print.spec.ts`, `web/e2e/portfolio-before-after.spec.ts` | [x] |
| 접근성(critical/serious 없음) | 홈/챗봇/모바일/포트폴리오 상세 | `web/e2e/accessibility.spec.ts` | [x] |

## 2) 검증 실행 명령

```bash
pnpm -C web run typecheck
pnpm -C web run lint
pnpm -C web exec vitest run tests/lib/resume-portfolio/story-thread-schema.test.ts tests/lib/resume-portfolio/hash.test.ts tests/lib/resume-portfolio/validation.test.ts
CI=1 pnpm -C web exec playwright test e2e/portfolio-deep-link.spec.ts e2e/portfolio-toc-and-print.spec.ts e2e/portfolio-before-after.spec.ts e2e/resume-portfolio-print-flow.spec.ts e2e/accessibility.spec.ts e2e/portfolio-resume-return-flow.spec.ts e2e/portfolio-prd-acceptance.spec.ts --project=chromium
pnpm -C web run phase8:verify
```

## 3) 실행 결과 기록

| 실행 일시 | 실행자 | 명령 묶음 | 결과 | 비고 |
| --- | --- | --- | --- | --- |
| 2026-02-22 | Codex | typecheck/lint/vitest/playwright/phase8:verify | PASS | 팀 리뷰 합의 전까지 AC는 최종 완료 처리하지 않음 |

## 4) 팀 리뷰 합의 템플릿 (필수)

- 정책: 아래 서명란이 채워지기 전까지 `PRD 수용 기준(AC) 최종 확인` 항목은 `완료`로 전환하지 않습니다.

| 리뷰 일시 | 참여자 | 결론 | 확인 이슈/후속 조치 |
| --- | --- | --- | --- |
| YYYY-MM-DD | 이름1, 이름2 | 승인 / 보류 | 이슈 번호 또는 조치 내용 |

## 5) 팀 리뷰 메모

- 스캔 시나리오 기준(수십 초):
  - 첫 화면에서 임팩트 인지 가능 여부
  - Context -> Threads 전개의 인과관계 이해 가능 여부
  - Before/After 증거 블록으로 변화 근거 파악 가능 여부
- 결과:
  - (팀 리뷰 후 기록)
