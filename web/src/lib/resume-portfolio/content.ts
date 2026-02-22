import type { ResumePortfolioContentItem } from "./contracts"

export const RESUME_PORTFOLIO_CONTENT_V2: ResumePortfolioContentItem[] = [
  {
    projectId: "exem-customer-dashboard",
    resumeItemId: "project-exem-customer-dashboard",
    resumeSummary:
      "중앙 폴링 정책과 그리드 전환 아키텍처를 설계해 장애 인지 시간을 70% 단축했습니다. (10초 -> 3초)",
    accomplishments: [
      "화면별 개별 폴링 유지(A)와 중앙 정책 통합(B)을 비교한 뒤 B를 선택해 정책 편차를 제거하도록 아키텍처 전환을 주도했습니다.",
      "렌더 우선순위 전략을 정의하고 고밀도 그리드 구조를 표준화해 인터랙션 지연을 73~82% 개선했습니다.",
      "→ React Profiler/Performance API 동일 시나리오 30회 평균·p95 기준 장애 인지 10초 -> 3초, DOM 20%+ 감소",
    ],
    hasPortfolio: true,
    ctaLabel: "상세 케이스 스터디 보기",
    defaultSectionId: "hook",
    sections: ["hook", "context", "threads", "retrospective"],
    evidenceIds: ["ACH-20260206-001"],
  },
  {
    projectId: "exem-data-grid",
    resumeItemId: "project-exem-data-grid",
    resumeSummary:
      "table 구조를 div + virtualization으로 재설계해 DOM 90% 감소와 리사이즈 44배 개선을 달성했습니다.",
    accomplishments: [
      "table 유지(A)와 div 전환(B)의 트레이드오프를 비교해 확장성과 성능 기준을 정의하고 B안 전환을 제안·설계했습니다.",
      "계산 경로 단순화와 이벤트 위임 표준화를 주도해 리사이즈 22ms -> 0.5ms, 인터랙션 지연 110ms -> 20~30ms를 달성했습니다.",
      "→ React Profiler/Performance API 30회 평균·p95 기준 DOM 90% 감소, 600+ 회귀 게이트 운영",
    ],
    hasPortfolio: true,
    ctaLabel: "상세 케이스 스터디 보기",
    defaultSectionId: "hook",
    sections: ["hook", "context", "threads", "retrospective"],
    evidenceIds: ["ACH-20260213-001"],
  },
  {
    projectId: "exem-new-generation",
    resumeItemId: "project-exem-new-generation",
    resumeSummary:
      "도메인 기반 폼 아키텍처와 상태 지역화 패턴을 설계해 확장 속도와 운영 안정성을 동시에 확보했습니다.",
    accomplishments: [
      "단일 스키마 유지(A)와 도메인 분리(B)를 비교해 B안을 선택하고 차트 타입별 경계를 정의하는 설계를 주도했습니다.",
      "상태 수명 정렬 규칙을 표준화하고 i18n 검증을 빌드 단계로 전진시켜 보일러플레이트 약 70% 감소와 런타임 누락 0건을 유지했습니다.",
      "→ Vitest/Playwright 회귀 20회 평균 처리 시간·실패율 기준 차트 5종 확장 구조 안정화",
    ],
    hasPortfolio: true,
    ctaLabel: "상세 케이스 스터디 보기",
    defaultSectionId: "hook",
    sections: ["hook", "context", "threads", "retrospective"],
    evidenceIds: ["ACH-20260211-001"],
  },
  {
    projectId: "exem-dx-improvement",
    resumeItemId: "project-exem-dx-improvement",
    resumeSummary:
      "폐쇄망 제약 환경에서 검증/리뷰/온보딩 병목을 자동화해 리포트 접근 시간을 3분에서 5초로 단축했습니다.",
    accomplishments: [
      "다운로드 중심 흐름(A)과 스트리밍 허브(B)를 비교해 B안을 설계·주도하고 리포트 접근 계약을 표준화했습니다.",
      "GitLab 내부 AI 협업 워크플로를 정의하고 디버깅/온보딩 자동화를 제안해 외부 도구 이동 0회와 온보딩 5분화를 달성했습니다.",
      "→ Chrome DevTools/접근 로그 30회 평균·p95 기준 리포트 접근 97% 개선, 신규 인원 5회 반복 기준 온보딩 수 시간 -> 5분",
    ],
    hasPortfolio: true,
    ctaLabel: "상세 케이스 스터디 보기",
    defaultSectionId: "hook",
    sections: ["hook", "context", "threads", "retrospective"],
    evidenceIds: ["ACH-20260128-001"],
  },
]
