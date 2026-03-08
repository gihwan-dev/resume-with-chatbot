# Milestone (Resume-only 전환 완료 기준)

## 상태

- 현재 활성 milestone은 resume-only 전환 완료 상태를 기준으로 관리한다.
- 과거 portfolio/case-study 구현 플랜은 historical 기록이며 현재 실행 계획으로 사용하지 않는다.

## 완료된 전환 범위

- `/portfolio` 상세 기능 제거 및 홈 이력서 중심 구조로 전환
- `resume-portfolio` 계층 제거
- 이력서/PDF/chat 데이터 소스를 resume-only 프로젝트 frontmatter로 단순화

## 현재 검증 기준 (활성)

```bash
pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run typecheck
pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run lint
pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run test:run
CI=1 pnpm -C /Users/choegihwan/Documents/Projects/resume-with-ai/web run test:e2e
```

## 운영 메모

- `pnpm -C web run build`의 `@sentry/opentelemetry` ENOENT 이슈는 현재 resume-only 전환 범위 밖의 별도 인프라 문제로 분리 관리한다.
