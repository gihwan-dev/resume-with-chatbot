# Phase 2 PDF 직렬화 동기화 규칙 확정 (2026-02-22)

## 1) 목적

- 목표: 웹 정보 우선순위(Hero/Experience 맥락)를 PDF 직렬화 계약에 반영하고, 신규 필드 미존재 시 기존 출력과의 호환성을 유지한다.
- 적용 범위:
  - `/Users/choegihwan/Documents/Projects/resume-with-ai/web/src/lib/pdf/types.ts`
  - `/Users/choegihwan/Documents/Projects/resume-with-ai/web/src/lib/pdf/serialize-resume.ts`

## 2) 타입 확장 원칙

### 2.1 Profile 직렬화 타입

- `SerializedProfile.heroMetrics?: SerializedHeroMetric[]`
- `SerializedHeroMetric`
  - `value: string`
  - `label: string`
  - `description?: string`

### 2.2 Project 직렬화 타입

- `SerializedProject.architectureSummary?: string`
- `SerializedProject.measurementMethod?: string`
- `SerializedProject.tradeOffs?: string[]`

## 3) 매핑 우선순위 규칙

### 3.1 Hero 지표

1. 소스: `basics[0].data.heroMetrics`
2. 직렬화 경로: `result.profile.heroMetrics`
3. 미존재 시: `undefined`

### 3.2 Project 확장 필드

1. `buildResumePortfolioContracts(projects)`에서 `mappings` 획득
2. `resumeItemId -> portfolioCaseId(projectId)` 매핑 구성
3. 원본 `projects` 컬렉션의 `storyThread`를 caseId 기준으로 조회
4. 매핑:
  - `storyThread.architectureSummary -> SerializedProject.architectureSummary`
  - `storyThread.measurementMethod -> SerializedProject.measurementMethod`
  - `storyThread.threads[].tradeOff -> SerializedProject.tradeOffs`
5. `tradeOffs` 규칙:
  - trim 후 빈 값 제거
  - 중복 제거(순서 유지)
  - 결과가 비면 `undefined`

## 4) 역호환 규칙

1. 신규 필드 미존재 시 기존 필드(`summary/accomplishments/evidenceIds/cta`) 파생 로직은 변경하지 않는다.
2. 신규 필드만 `undefined`로 유지하며 기존 PDF 다운로드 경로, 파일명, 응답 헤더 계약은 유지한다.
3. 신규 필드 추가로 기존 콘텐츠 파일 수정을 강제하지 않는다.

## 5) 검증 시나리오(Phase 2 반영)

1. 필드 미존재 시나리오
- `profile.heroMetrics`, `projects[].architectureSummary/measurementMethod/tradeOffs`는 `undefined`
- 기존 프로젝트/경력 직렬화 결과 유지

2. 필드 존재 시나리오
- `heroMetrics`가 그대로 직렬화된다.
- `resumeItemId` 매핑을 통해 프로젝트별 확장 필드가 반영된다.
- 동일 tradeOff 중복 입력 시 단일 값으로 직렬화된다.

3. 적용 테스트 파일
- `/Users/choegihwan/Documents/Projects/resume-with-ai/web/tests/lib/pdf/serialize-resume.test.ts`

## 6) 참고

- Phase 2는 계약/직렬화 확정 단계이며 PDF 문서의 시각적 레이아웃 변경은 수행하지 않는다.
