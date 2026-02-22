# Phase 2 콘텐츠/스키마 계약 확정 (2026-02-22)

## 1) 목적

- 목표: Hero/Core Strength/Story Thread의 확장 필드를 optional로 도입해 하위 호환을 유지하면서, Phase 3~8 구현의 계약 기반을 고정한다.
- 기준 문서:
  - `/Users/choegihwan/Documents/Projects/resume-with-ai/docs/resume-hiring-optimization-direction-2026-02-22.md`
  - `/Users/choegihwan/Documents/Projects/resume-with-ai/docs/resume-engineering-guide-2025.md`

## 2) 계약 확정 범위

1. `/Users/choegihwan/Documents/Projects/resume-with-ai/web/src/content.config.ts`
2. `/Users/choegihwan/Documents/Projects/resume-with-ai/web/src/lib/resume-portfolio/contracts.ts`
3. `/Users/choegihwan/Documents/Projects/resume-with-ai/web/src/lib/resume-portfolio/story-thread-schema.ts`

## 3) 확정된 필드 계약

### 3.1 Basics 컬렉션

- `heroMetrics?: HeroMetric[]`
- `HeroMetric`
  - `value: string` (필수)
  - `label: string` (필수)
  - `description?: string` (선택)
- 제약:
  - 배열 길이 `1..4`
  - 문자열은 trim 후 빈 문자열 불가

### 3.2 Skills 컬렉션

- `coreStrengths?: CoreStrength[]`
- `CoreStrength`
  - `title: string` (필수)
  - `summary: string` (필수)
- 제약:
  - 배열 길이 `1..4`
  - 문자열은 trim 후 빈 문자열 불가

### 3.3 Story Thread 계약

- `ProjectStoryThread.architectureSummary?: string`
- `ProjectStoryThread.measurementMethod?: string`
- `StoryThreadItem.tradeOff?: string`
- 제약:
  - 기존 필수 필드 규칙 유지
  - 신규 optional 필드가 존재하면 trim 후 빈 문자열 불가

## 4) 하위 호환 정책

1. 신규 필드는 모두 optional이다.
2. 신규 필드가 없는 기존 콘텐츠는 기존 검증/렌더 경로를 그대로 유지한다.
3. 기존 해시 계약(`hook/context/threads/retrospective`)과 포트폴리오 매핑 계약은 변경하지 않는다.

## 5) 검증 케이스(Phase 2 반영)

1. `story-thread-schema` 유효 입력
- 신규 optional 필드 포함 입력: 통과
- 신규 optional 필드 미포함 입력: 통과

2. `story-thread-schema` 무효 입력
- `architectureSummary = "   "`: 실패(`invalid_value`)
- `measurementMethod = "   "`: 실패(`invalid_value`)
- `tradeOff = "   "`: 실패(`invalid_value`)

3. 적용 테스트 파일
- `/Users/choegihwan/Documents/Projects/resume-with-ai/web/tests/lib/resume-portfolio/story-thread-schema.test.ts`

## 6) 비범위

1. 메인 섹션 순서 재배치 및 UI 노출 변경
2. Hero/Core Strength 실제 카피 리라이팅
3. 포트폴리오 상세의 신규 필드 시각 노출 변경

위 항목은 Phase 3+에서 진행한다.
