import type { ResumePortfolioContentItem } from "./contracts"

export const RESUME_PORTFOLIO_CONTENT_V2: ResumePortfolioContentItem[] = [
  {
    projectId: "exem-customer-dashboard",
    resumeItemId: "project-exem-customer-dashboard",
    resumeSummary:
      "분산된 폴링을 중앙화하고 카드형 UI를 고밀도 그리드로 전환해 장애 인지 시간을 70% 단축했습니다.",
    accomplishments: ["→ 10초 -> 3초 (30회 평균·p95 기준)", "→ 인터랙션 지연 73~82% 개선"],
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
      "table 구조를 div 기반 가상화 아키텍처로 전환해 대규모 데이터 화면의 렌더링 병목을 제거했습니다.",
    accomplishments: ["→ DOM 90% 감소", "→ 리사이즈 22ms -> 0.5ms (44배 향상)"],
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
      "도메인 기반 폼 아키텍처와 상태 지역화 패턴을 설계해 기능 추가 시 구조 변경 없이 확장 가능하도록 개선했습니다.",
    accomplishments: ["→ 차트 5종 구조 변경 없이 확장", "→ 보일러플레이트 약 70% 감소"],
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
      "폐쇄망 환경에서 리포트·온보딩 자동화 파이프라인을 구축해 온보딩 시간을 대폭 단축했습니다.",
    accomplishments: ["→ 온보딩 수 시간 -> 5분", "→ 리포트 접근 3분 -> 5초 (97% 개선)"],
    hasPortfolio: true,
    ctaLabel: "상세 케이스 스터디 보기",
    defaultSectionId: "hook",
    sections: ["hook", "context", "threads", "retrospective"],
    evidenceIds: ["ACH-20260128-001"],
  },
]
