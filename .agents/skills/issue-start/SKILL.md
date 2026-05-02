---
name: issue-start
description: 이슈 선택 후 작업 시작. Obsidian TODO에서 우선순위 높은 미완료 이슈를 추려서 선택하게 하고, 선택된 이슈의 상세 노트를 읽어 작업 컨텍스트를 설정한다. "이슈 시작", "작업 시작", "다음 작업" 등의 요청 시 사용
disable-model-invocation: false
---

# 워크플로우: 이슈 선택 및 작업 시작

**목표**: Obsidian의 Resume with AI TODO에서 우선순위 높은 미완료 이슈를 추려 사용자에게 선택지를 제시하고, 선택된 이슈의 컨텍스트를 로드하여 작업을 시작한다.

## 경로 정보

- **TODO 파일**: `/Users/choegihwan/Documents/Projects/Obsidian-frontend-journey/Project/Resume with AI/개선 TODO.md`
- **이슈 노트 디렉토리**: `/Users/choegihwan/Documents/Projects/Obsidian-frontend-journey/Project/Resume with AI/`
- **프로젝트 루트**: `/Users/choegihwan/Documents/Projects/resume-with-ai/web/`

## 1단계: TODO 파일 읽기

`개선 TODO.md`를 읽어 현재 미완료(`- [ ]`) 이슈 목록을 파악한다.

## 2단계: 우선순위 필터링

TODO 파일의 섹션 순서가 곧 우선순위이다:
1. 🔴 즉시 (Quick Wins) — 최우선
2. 🟡 단기 (1~2주) — 높음
3. 🟢 중기 (1~2개월) — 보통
4. 🔵 장기 (선택적) — 낮음

**필터링 규칙:**
- 미완료(`- [ ]`) 이슈만 추출한다.
- 🔴 즉시 섹션에 미완료가 있으면 그것들만 선택지로 제시한다.
- 🔴가 모두 완료되었으면 🟡 단기 섹션의 미완료를 제시한다.
- 이하 동일한 패턴으로 진행한다.
- 최대 4개까지만 선택지로 제시한다 (AskUserQuestion 제한).

## 3단계: 사용자에게 질문

`AskUserQuestion` 도구를 사용하여 어떤 이슈를 진행할지 물어본다.

- **question**: "어떤 이슈를 진행하시겠어요?"
- **header**: "이슈 선택"
- **options**: 필터링된 이슈 목록 (label: 이슈 제목, description: 이슈가 속한 카테고리)
- 사용자가 "Other"로 직접 입력할 수도 있다.

## 4단계: 이슈 노트 로드

사용자가 선택한 이슈의 개별 노트 파일을 읽는다.

- TODO의 `[[wikilink]]`에서 파일명을 추출한다.
- 해당 `.md` 파일을 이슈 노트 디렉토리에서 읽는다.
- 파일이 없으면 사용자에게 알리고 `/issue-create`로 먼저 생성하도록 안내한다.

## 5단계: 작업 컨텍스트 설정

이슈 노트의 내용을 기반으로 작업 컨텍스트를 사용자에게 요약한다:

```
## 🎯 작업 시작: {이슈 제목}

**요약**: {이슈 요약}
**왜**: {이슈 이유 핵심}
**접근 방법**: {어떻게 섹션 요약}

작업을 시작하겠습니다.
```

그리고 바로 구현에 착수한다. 이슈 노트의 "어떻게?" 섹션을 참고하여 실제 코드를 구현한다.

## 6단계: 작업 완료 시

작업이 완료되면 사용자에게 `/issue-update`를 실행하도록 안내한다.