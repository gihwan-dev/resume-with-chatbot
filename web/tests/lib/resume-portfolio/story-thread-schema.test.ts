import { describe, expect, it } from "vitest"
import { projectStoryThreadSchema, validateProjectStoryThread } from "@/lib/resume-portfolio"

const VALID_STORY_THREAD = {
  tldrSummary: "핵심 병목을 구조 전환으로 해결했습니다.",
  keyMetrics: [
    {
      value: "10초 -> 3초",
      label: "장애 인지 시간 단축",
      description: "초기 대응 시간을 줄였습니다.",
    },
    {
      value: "73~82%",
      label: "인터랙션 지연 개선",
      description: "조작 버벅임을 완화했습니다.",
    },
    {
      value: "20%+",
      label: "DOM 감소",
      description: "렌더링 비용을 줄였습니다.",
    },
  ],
  coreApproach: "정책 통합과 화면 구조 전환, 회귀 자동화를 결합 설계했습니다.",
  problemDefinition: "분산된 정책과 화면 밀도 한계가 운영 대응 속도를 떨어뜨렸습니다.",
  problemPoints: [
    "화면마다 정책이 달랐습니다.",
    "인터랙션 중 리렌더가 겹쳤습니다.",
    "수동 회귀 검증 비용이 높았습니다.",
  ],
  decisions: [
    {
      title: "중앙 정책 통합",
      whyThisChoice: "운영 일관성을 확보해야 했습니다.",
      alternative: "A안: 분산 유지 / B안: 통합",
      tradeOff: "복잡도는 늘지만 재현성과 회귀 안정성이 높아집니다.",
    },
    {
      title: "그리드 전환",
      whyThisChoice: "대량 비교 속도가 핵심이었습니다.",
      alternative: "A안: 카드 유지 / B안: 그리드",
      tradeOff: "적응 비용이 늘지만 판단 속도가 빨라집니다.",
    },
  ],
  implementationHighlights: [
    "정책 통합 아키텍처를 정의했습니다.",
    "고밀도 화면 동선을 재설계했습니다.",
    "회귀 게이트를 릴리즈 표준으로 정착시켰습니다.",
  ],
  implementationGroups: [
    {
      title: "Vue 단계",
      items: ["폴링 객체 추상화", "상태 중앙화/버전 관리"],
    },
    {
      title: "React 단계",
      items: ["고밀도 그리드 전환", "알림 테스트 선행 마이그레이션"],
    },
  ],
  validationImpact: {
    measurementMethod: "Profiler와 Performance API로 동일 시나리오를 30회 반복 측정했습니다.",
    metrics: ["장애 인지 시간: 10초 -> 3초", "인터랙션 지연: 73~82% 감소"],
    operationalImpact: "조작 중 멈춤 없이 대응 절차를 이어갈 수 있게 됐습니다.",
  },
  lessonsLearned:
    "성능 개선은 단일 최적화로 유지되지 않습니다.\n구조와 검증 체계를 함께 설계해야 지속됩니다.",
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
    const input = {
      ...VALID_STORY_THREAD,
      keyMetrics: undefined,
    }

    const result = validateProjectStoryThread(input)
    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing",
          path: "storyThread.keyMetrics",
        }),
      ])
    )
  })

  it("타입 불일치: 배열 필드 타입 오류를 type_mismatch로 분류한다", () => {
    const input = {
      ...VALID_STORY_THREAD,
      decisions: "invalid-decisions",
    }

    const result = validateProjectStoryThread(input)
    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "type_mismatch",
          path: "storyThread.decisions",
        }),
      ])
    )
  })

  it("빈 배열: implementationHighlights가 비어 있으면 empty_array로 분류한다", () => {
    const input = {
      ...VALID_STORY_THREAD,
      implementationHighlights: [],
    }

    const result = validateProjectStoryThread(input)
    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "empty_array",
          path: "storyThread.implementationHighlights",
        }),
      ])
    )
  })

  it("제약 검증: keyMetrics는 정확히 3개여야 한다", () => {
    const input = {
      ...VALID_STORY_THREAD,
      keyMetrics: VALID_STORY_THREAD.keyMetrics.slice(0, 2),
    }

    const result = validateProjectStoryThread(input)
    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid_value",
          path: "storyThread.keyMetrics",
        }),
      ])
    )
  })

  it("제약 검증: decisions는 2~4개여야 한다", () => {
    const input = {
      ...VALID_STORY_THREAD,
      decisions: [VALID_STORY_THREAD.decisions[0]],
    }

    const result = validateProjectStoryThread(input)
    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid_value",
          path: "storyThread.decisions",
        }),
      ])
    )
  })

  it("제약 검증: decisions가 5개면 invalid다", () => {
    const input = {
      ...VALID_STORY_THREAD,
      decisions: [
        ...VALID_STORY_THREAD.decisions,
        {
          title: "추가 의사결정 1",
          whyThisChoice: "확장 시나리오 검증",
          alternative: "A안 / B안",
          tradeOff: "장단점 비교",
        },
        {
          title: "추가 의사결정 2",
          whyThisChoice: "상한 검증",
          alternative: "A안 / B안",
          tradeOff: "장단점 비교",
        },
        {
          title: "추가 의사결정 3",
          whyThisChoice: "최대치 초과",
          alternative: "A안 / B안",
          tradeOff: "장단점 비교",
        },
      ],
    }

    const result = validateProjectStoryThread(input)
    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid_value",
          path: "storyThread.decisions",
        }),
      ])
    )
  })

  it("제약 검증: implementationHighlights는 3~4개여야 한다", () => {
    const input = {
      ...VALID_STORY_THREAD,
      implementationHighlights: VALID_STORY_THREAD.implementationHighlights.slice(0, 2),
    }

    const result = validateProjectStoryThread(input)
    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid_value",
          path: "storyThread.implementationHighlights",
        }),
      ])
    )
  })

  it("제약 검증: problemPoints는 3~7개여야 한다", () => {
    const input = {
      ...VALID_STORY_THREAD,
      problemPoints: VALID_STORY_THREAD.problemPoints.slice(0, 2),
    }

    const result = validateProjectStoryThread(input)
    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid_value",
          path: "storyThread.problemPoints",
        }),
      ])
    )
  })

  it("제약 검증: problemPoints가 8개면 invalid다", () => {
    const input = {
      ...VALID_STORY_THREAD,
      problemPoints: [
        ...VALID_STORY_THREAD.problemPoints,
        "문제 4",
        "문제 5",
        "문제 6",
        "문제 7",
        "문제 8",
      ],
    }

    const result = validateProjectStoryThread(input)
    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid_value",
          path: "storyThread.problemPoints",
        }),
      ])
    )
  })

  it("제약 검증: validationImpact.metrics는 최대 3개여야 한다", () => {
    const input = {
      ...VALID_STORY_THREAD,
      validationImpact: {
        ...VALID_STORY_THREAD.validationImpact,
        metrics: [
          ...VALID_STORY_THREAD.validationImpact.metrics,
          "DOM 감소: 20%+",
          "추가 지표: 10%",
        ],
      },
    }

    const result = validateProjectStoryThread(input)
    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid_value",
          path: "storyThread.validationImpact.metrics",
        }),
      ])
    )
  })

  it("제약 검증: lessonsLearned는 최대 3줄까지 허용한다", () => {
    const input = {
      ...VALID_STORY_THREAD,
      lessonsLearned: "1줄\n2줄\n3줄\n4줄",
    }

    const result = validateProjectStoryThread(input)
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

  it("optional 필드: implementationGroups가 없어도 유효하다", () => {
    const input = {
      ...VALID_STORY_THREAD,
      implementationGroups: undefined,
    }

    const result = validateProjectStoryThread(input)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it("제약 검증: implementationGroups는 최대 2개여야 한다", () => {
    const input = {
      ...VALID_STORY_THREAD,
      implementationGroups: [
        ...(VALID_STORY_THREAD.implementationGroups ?? []),
        {
          title: "추가 단계",
          items: ["상한 초과 검증"],
        },
      ],
    }

    const result = validateProjectStoryThread(input)
    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid_value",
          path: "storyThread.implementationGroups",
        }),
      ])
    )
  })
})
