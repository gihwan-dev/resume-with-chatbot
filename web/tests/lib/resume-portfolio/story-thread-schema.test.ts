import { describe, expect, it } from "vitest"
import { projectStoryThreadSchema, validateProjectStoryThread } from "@/lib/resume-portfolio"

const VALID_STORY_THREAD = {
  context: "레거시 폴링 구조와 고밀도 렌더링 경합 문제를 동시에 해결해야 했습니다.",
  impacts: [
    {
      value: "10초 -> 3초",
      label: "장애 인지 시간 단축",
      description: "초기 대응 시간을 줄였습니다.",
    },
    {
      value: "73~82%",
      label: "인터랙션 지연 개선",
      description: "조작 중 버벅임을 완화했습니다.",
    },
  ],
  threads: [
    {
      issueTitle: "분산된 폴링 규칙",
      problems: ["화면마다 폴링 제어 규칙이 달랐습니다."],
      thoughtProcess: "폴링 정책을 중앙화해야 회귀와 편차를 줄일 수 있다고 판단했습니다.",
      actions: ["Polling Manager 도입", "TanStack Query 전환"],
      result: "네트워크 동작 일관성과 인터랙션 안정성을 확보했습니다.",
    },
    {
      issueTitle: "고밀도 렌더링 경합",
      problems: ["DOM 과다 생성으로 렌더링 비용이 급증했습니다."],
      thoughtProcess: "화면 구조를 재구성해야 성능 개선이 유지된다고 판단했습니다.",
      actions: ["그리드 구조로 전환", "회귀 E2E 테스트 추가"],
      result: "렌더링 부담과 회귀 위험을 함께 줄였습니다.",
    },
  ],
  lessonsLearned: "구조 개선과 검증 자동화는 함께 설계해야 효과가 유지됩니다.",
}

describe("projectStoryThreadSchema", () => {
  it("유효 입력: 스키마 검증을 통과한다", () => {
    const parsed = projectStoryThreadSchema.safeParse(VALID_STORY_THREAD)
    expect(parsed.success).toBe(true)

    const result = validateProjectStoryThread(VALID_STORY_THREAD)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it("누락 입력: 필수 필드 누락을 missing으로 분류한다", () => {
    const missingImpacts = {
      ...VALID_STORY_THREAD,
      impacts: undefined,
    }

    const result = validateProjectStoryThread(missingImpacts)
    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing",
          path: "storyThread.impacts",
        }),
      ])
    )
  })

  it("타입 불일치: 배열 필드 타입 오류를 type_mismatch로 분류한다", () => {
    const invalidType = {
      ...VALID_STORY_THREAD,
      threads: "invalid-threads",
    }

    const result = validateProjectStoryThread(invalidType)
    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "type_mismatch",
          path: "storyThread.threads",
        }),
      ])
    )
  })

  it("빈 배열: 배열이 비어 있으면 empty_array로 분류한다", () => {
    const emptyArrayInput = {
      ...VALID_STORY_THREAD,
      threads: [],
    }

    const result = validateProjectStoryThread(emptyArrayInput)
    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "empty_array",
          path: "storyThread.threads",
        }),
      ])
    )
  })

  it("빈 문자열: 문자열 제약 위반을 invalid_value로 분류한다", () => {
    const emptyStringInput = {
      ...VALID_STORY_THREAD,
      lessonsLearned: "   ",
    }

    const result = validateProjectStoryThread(emptyStringInput)
    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid_value",
          path: "storyThread.lessonsLearned",
        }),
      ])
    )
  })
})
