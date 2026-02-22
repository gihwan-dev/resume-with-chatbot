import type { ResumePortfolioContentItem } from "./contracts"

export const RESUME_PORTFOLIO_CONTENT_V2: ResumePortfolioContentItem[] = [
  {
    projectId: "exem-customer-dashboard",
    resumeItemId: "project-exem-customer-dashboard",
    resumeSummary: "장애 인지 시간을 70% 단축하며(10초 → 3초) 운영 대응 속도를 개선했습니다.",
    accomplishments: [
      "카드형 유지 vs 데이터 밀도 중심 그리드 전환을 비교한 끝에 후자를 선택해 운영자의 탐색 경로를 단순화했습니다.",
      "분산된 폴링 구조를 중앙화하고 렌더 우선순위를 제어해 인터랙션 경합을 줄였습니다.",
      "→ 인터랙션 지연 73~82% 개선",
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
    resumeSummary: "DOM 병목을 제거하고 리사이즈 성능을 44배 개선했습니다. (22ms → 0.5ms)",
    accomplishments: [
      "테이블 유지 vs div 기반 가상화 전환을 비교한 끝에 구조 전환을 선택하고 TanStack Virtual 기반 공용 그리드로 재설계했습니다.",
      "렌더링 경계를 재정의하고 상태 관리 범위를 축소해 대규모 데이터 화면의 안정성을 확보했습니다.",
      "→ React Profiler 동일 시나리오 30회 평균 기준 DOM 90% 감소",
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
    resumeSummary: "신규 기능 확장 비용을 구조적으로 낮춘 도메인 기반 폼 아키텍처를 설계했습니다.",
    accomplishments: [
      "차트 유형별 독립 스키마와 Zustand 기반 상태 지역화 패턴을 도입해 도메인 단위 결합도를 낮췄습니다.",
      "기능 추가 시 기존 구조 변경 없이 확장 가능한 설계로 제품 확장성과 유지보수성을 개선했습니다.",
      "→ 런타임 제약 검증 강화로 초기 결함 가능성 감소",
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
    resumeSummary: "온보딩 시간을 수 시간 → 5분 이내로 단축했습니다.",
    accomplishments: [
      "폐쇄망 환경 제약을 반영한 리포트·온보딩 자동화 파이프라인을 설계·구축했습니다.",
      "테스트·배포 흐름을 구조화해 반복 작업을 줄이고 팀의 피드백 루프를 개선했습니다.",
      "→ 고객 레포트 접근 시간 97% 개선",
    ],
    hasPortfolio: true,
    ctaLabel: "상세 케이스 스터디 보기",
    defaultSectionId: "hook",
    sections: ["hook", "context", "threads", "retrospective"],
    evidenceIds: ["ACH-20260128-001"],
  },
]
