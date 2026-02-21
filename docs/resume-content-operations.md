# Resume/Portfolio 콘텐츠 운영 가이드 (Phase 7)

> 기준: `docs/PRD.md`, `docs/resume-engineering-guide-2025.md`, `docs/resume-portfolio-contract.md`
> 적용일: 2026-02-21

## 1. 목적

- 이력서 요약(Resume)과 포트폴리오 상세(Portfolio)를 하나의 콘텐츠 스키마에서 파생해 정합성을 유지한다.
- 자동 업데이트와 수동 보정 모두 동일한 검증 게이트를 통과하도록 운영한다.

## 2. 책임 경계

### UI 트랙 (Gemini)

- 대상: 레이아웃, 타이포, 시각 스타일, 섹션 배치, 상호작용 UI.
- 입력 계약:
  - `summaryBlocks` (이력서 프로젝트 요약 렌더링)
  - `cases` (포트폴리오 목차/케이스 카드 순서)
- 금지:
  - `resume-portfolio/content.ts`의 데이터 의미 변경
  - `resumeItemId`, `projectId`, `defaultSectionId` 규칙 변경

### 기능 트랙 (Codex)

- 대상: 콘텐츠 스키마, 계약 파생 로직, 검증 규칙, 테스트 게이트.
- 입력 계약:
  - `web/src/lib/resume-portfolio/content.ts`
  - `web/src/lib/resume-portfolio/derive.ts`
  - `web/src/lib/resume-portfolio/validation.ts`
- 책임:
  - 딥링크 규칙(`/portfolio/<caseId>#<sectionId>`) 유지
  - `hasPortfolio=true` 항목의 근거 ID(`evidenceIds`) 필수 강제

## 3. 데이터 변경 규칙

변경 대상은 아래 두 종류로 제한한다.

1. 스키마 원본:
- `web/src/lib/resume-portfolio/content.ts`

2. 상세 본문:
- `web/src/content/projects/*.md|*.mdx`

원칙:

- `projectId`는 `web/src/content/projects` 슬러그와 반드시 1:1로 일치한다.
- `resumeItemId`는 중복되면 안 된다.
- `defaultSectionId`는 `sections`에 반드시 포함되어야 한다.
- `hasPortfolio=true`이면 `evidenceIds`는 1개 이상이어야 하며 중복되면 안 된다.

## 4. 자동 업데이트 규칙

- 자동화가 요약 문장 또는 성과 불릿을 갱신할 때는 `content.ts`만 수정한다.
- 자동화가 상세 케이스 스터디를 갱신할 때는 대응하는 `projects` 콘텐츠 파일만 수정한다.
- 자동화 결과로 `projectId`/`resumeItemId`/딥링크 규칙이 깨지면 병합하지 않는다.

## 5. 수동 보정 규칙

수동 보정은 다음 순서로 진행한다.

1. `content.ts`의 요약/불릿/근거 ID 업데이트
2. 필요 시 대응 프로젝트 상세 본문 업데이트
3. 검증 명령 실행
4. PR 체크리스트 확인

## 6. 검증 게이트

필수 명령:

```bash
pnpm -C web run typecheck
pnpm -C web run lint
pnpm -C web exec vitest run tests/lib/resume-portfolio/validation.test.ts tests/lib/resume-portfolio/content-schema.test.ts
pnpm -C web exec playwright test e2e/portfolio-deep-link.spec.ts e2e/resume-portfolio-print-flow.spec.ts e2e/portfolio-toc-and-print.spec.ts --project=chromium
```

실패 기준:

- 단위 테스트에서 아래 항목 중 하나라도 실패하면 배포 차단
  - projectId 미존재
  - resumeItemId 중복
  - ctaHref/caseId/sectionId 불일치
  - evidenceIds 누락/중복

## 7. 실패 대응

- `projectId` 미존재: `content.ts`의 `projectId` 또는 프로젝트 파일 슬러그를 맞춘다.
- `evidenceIds` 실패: 빈 값 제거 후 유효 근거 ID를 추가한다.
- 딥링크 실패: `defaultSectionId`, `sections`, `ctaHref` 파생 규칙을 확인한다.
- 회귀 테스트 실패: 최근 변경된 UI 클래스/앵커 ID를 먼저 점검한다.

## 8. PR 체크리스트

- [ ] `content.ts` 변경이 프로젝트 4건 범위를 넘지 않았는가
- [ ] `projectId`가 프로젝트 슬러그와 1:1로 일치하는가
- [ ] `hasPortfolio=true` 항목의 `evidenceIds`가 비어 있지 않은가
- [ ] `typecheck`, `lint`, resume-portfolio 단위 테스트가 통과했는가
- [ ] 딥링크/목차/인쇄 E2E 회귀가 통과했는가
- [ ] 변경 의도와 근거를 PR 설명에 기록했는가
