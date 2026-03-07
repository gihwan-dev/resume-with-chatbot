import { describe, expect, it } from "vitest"
import { parsePortfolioCaseBody } from "@/lib/resume-portfolio/portfolio-case-body"

const VALID_BODY = `
## TL;DR
**핵심 병목**을 구조 전환으로 해결했습니다.

추가 문단입니다.

## 문제 정의
운영 환경에서 응답 지연과 변경 영향 범위가 동시에 문제였습니다.

- 정책 편차
- 렌더 경합

## 핵심 의사결정
1. 중앙 정책 통합
2. 그리드 구조 전환

## 구현 전략
### 단계별 구현
- 테스트 선행 정비
- 구조 전환

## 검증 및 결과
- 인지 시간: 10초 -> 3초
- 인터랙션 지연: 73~82% 감소

## What I Learned
구조와 검증 자동화는 함께 설계해야 유지보수가 쉬워집니다.
`.trim()

describe("parsePortfolioCaseBody", () => {
  it("정상 케이스: 6개 섹션을 파싱하고 TL;DR 첫 문단을 summary로 추출한다", () => {
    const result = parsePortfolioCaseBody(VALID_BODY, { caseId: "exem-data-grid" })

    expect(result.sections).toHaveLength(6)
    expect(result.sections.map((section) => section.id)).toEqual([
      "tldr",
      "problem-definition",
      "key-decisions",
      "implementation-highlights",
      "validation-impact",
      "learned",
    ])
    expect(result.summary).toBe("핵심 병목을 구조 전환으로 해결했습니다.")
  })

  it("실패 케이스: 섹션 순서가 바뀌면 예외를 던진다", () => {
    const invalidBody = `
## TL;DR
요약

## 핵심 의사결정
의사결정

## 문제 정의
문제 정의

## 구현 전략
구현

## 검증 및 결과
검증

## What I Learned
회고
`.trim()

    expect(() => parsePortfolioCaseBody(invalidBody)).toThrow("Invalid section order")
  })

  it("실패 케이스: 추가 H2가 있으면 예외를 던진다", () => {
    const invalidBody = `${VALID_BODY}\n\n## 부록\n추가 내용`

    expect(() => parsePortfolioCaseBody(invalidBody)).toThrow('Unexpected H2 heading "부록"')
  })

  it("실패 케이스: 필수 섹션이 누락되면 예외를 던진다", () => {
    const invalidBody = VALID_BODY.replace(
      "## What I Learned\n구조와 검증 자동화는 함께 설계해야 유지보수가 쉬워집니다.",
      ""
    )

    expect(() => parsePortfolioCaseBody(invalidBody)).toThrow("Missing required sections")
  })

  it("실패 케이스: TL;DR 본문이 비어있으면 예외를 던진다", () => {
    const invalidBody = VALID_BODY.replace(
      "**핵심 병목**을 구조 전환으로 해결했습니다.\n\n추가 문단입니다.",
      ""
    )

    expect(() => parsePortfolioCaseBody(invalidBody)).toThrow('Section "TL;DR" must contain')
  })

  it("정상 케이스: TL;DR 첫 번째 문단만 summary로 추출한다", () => {
    const bodyWithLeadHeading = `
## TL;DR
### 요약 배경
**첫 문단 요약**입니다.

- 이 bullet 은 summary에 포함되지 않아야 합니다.

## 문제 정의
문제 정의

## 핵심 의사결정
의사결정

## 구현 전략
구현

## 검증 및 결과
검증

## What I Learned
회고
`.trim()

    const result = parsePortfolioCaseBody(bodyWithLeadHeading)

    expect(result.summary).toBe("첫 문단 요약입니다.")
  })

  it("정상 케이스: 코드 펜스 내부의 H2는 섹션 구분으로 처리하지 않는다", () => {
    const bodyWithFence = `
## TL;DR
핵심 요약

## 문제 정의
\`\`\`md
## 가짜 제목
코드 블록 내부
\`\`\`

문제 정의 본문

## 핵심 의사결정
의사결정

## 구현 전략
구현

## 검증 및 결과
검증

## What I Learned
회고
`.trim()

    const result = parsePortfolioCaseBody(bodyWithFence)

    expect(result.sections[1]?.markdown).toContain("## 가짜 제목")
    expect(result.sections).toHaveLength(6)
  })
})
