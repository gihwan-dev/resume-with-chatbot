---
name: issue-create
description: Obsidian 이슈 노트 생성. 정해진 구조로 Resume with AI 프로젝트의 새 이슈를 생성하고 TODO에 링크를 추가한다. "이슈 만들어", "이슈 생성", "새 이슈" 등의 요청 시 사용
disable-model-invocation: false
argument-hint: "[이슈 제목 또는 설명] (생략 시 대화 컨텍스트에서 추론)"
---

# 워크플로우: 이슈 노트 생성

**목표**: 정해진 구조로 Resume with AI 프로젝트의 새 이슈 노트를 Obsidian에 생성하고, 메인 TODO에 링크를 추가한다.

## 경로 정보

- **TODO 파일**: `/Users/choegihwan/Documents/Projects/Obsidian-frontend-journey/Project/Resume with AI/개선 TODO.md`
- **이슈 노트 디렉토리**: `/Users/choegihwan/Documents/Projects/Obsidian-frontend-journey/Project/Resume with AI/`

## 1단계: 이슈 정보 수집

인자 또는 대화 컨텍스트에서 이슈 정보를 파악한다. 부족한 정보는 `AskUserQuestion`으로 보충한다.

필요한 정보:
- **제목**: 간결하고 명확한 이슈 제목
- **우선순위**: 즉시 / 단기 / 중기 / 장기
- **카테고리 태그**: 성능, 보안, UX, 정보구조, AI, 접근성, 인프라, SEO 등

## 2단계: 이슈 노트 작성

아래 템플릿으로 이슈 노트를 생성한다.

### 템플릿

```markdown
# {이슈 제목}

#resume-with-ai #{우선순위} #{카테고리태그}

## 요약
{한 줄 요약}

## 왜?
- {이유 1}
- {이유 2}

## 어떻게?
{구현 접근 방법. 구체적인 단계가 있으면 번호 목록으로.}

## 예상 효과
- {효과 1}

## 작업 로그
```

**파일명 규칙:**
- 파일명 = 이슈 제목 그대로 사용 (공백 허용, Obsidian wikilink와 일치시키기 위함)
- 예: `Rate Limiting 구현.md`

## 3단계: TODO에 링크 추가

`개선 TODO.md`를 읽어서 해당 우선순위 섹션에 새 이슈 링크를 추가한다.

**우선순위별 섹션 매핑:**
- 즉시 → `## 🔴 즉시 (Quick Wins)` 섹션의 마지막 `- [ ]` 아래
- 단기 → `## 🟡 단기 (1~2주)` 섹션의 적절한 하위 카테고리 아래
- 중기 → `## 🟢 중기 (1~2개월)` 섹션의 마지막 `- [ ]` 아래
- 장기 → `## 🔵 장기 (선택적)` 섹션의 마지막 `- [ ]` 아래

추가 형식: `- [ ] [[{이슈 제목}]]`

**하위 카테고리 판단 (🟡 단기):**
- 보안 관련 → `### 보안 기초` 아래
- 정보구조 관련 → `### 정보 구조 개선` 아래
- AI 관련 → `### AI 경험 강화` 아래
- 기타 → 가장 적절한 하위 카테고리 아래, 없으면 새 하위 카테고리 생성

## 4단계: 결과 보고

생성된 이슈 정보를 사용자에게 보고한다:
- 생성된 노트 파일명
- TODO에 추가된 위치
- 바로 작업을 시작하려면 `/issue-start` 안내