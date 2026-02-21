import type {
  PortfolioCaseContract,
  ResumeItemContract,
  ResumePortfolioMappingEntry,
  ResumeSummaryBlock,
} from "./contracts"
import { buildPortfolioCtaHref } from "./hash"

export const RESUME_ITEMS_V1: ResumeItemContract[] = [
  {
    resumeItemId: "project-exem-customer-dashboard",
    hasPortfolio: true,
  },
  {
    resumeItemId: "project-exem-data-grid",
    hasPortfolio: true,
  },
  {
    resumeItemId: "project-exem-new-generation",
    hasPortfolio: true,
  },
  {
    resumeItemId: "project-exem-dx-improvement",
    hasPortfolio: true,
  },
]

export const RESUME_ITEM_IDS_V1 = RESUME_ITEMS_V1.map((item) => item.resumeItemId)

export const PORTFOLIO_CASES_V1: PortfolioCaseContract[] = [
  {
    caseId: "exem-customer-dashboard",
    routePath: "/portfolio",
    title: "고객 특화 DB 모니터링 대시보드 개발",
    sections: ["overview", "problem", "decision", "result", "retrospective"],
    ctaLabel: "상세 케이스 스터디 보기",
  },
  {
    caseId: "exem-data-grid",
    routePath: "/portfolio",
    title: "데이터 그리드 개발",
    sections: ["overview", "problem", "decision", "result", "retrospective"],
    ctaLabel: "상세 케이스 스터디 보기",
  },
  {
    caseId: "exem-new-generation",
    routePath: "/portfolio",
    title: "차세대 데이터베이스 성능 모니터링 제품 개발",
    sections: ["overview", "problem", "decision", "result", "retrospective"],
    ctaLabel: "상세 케이스 스터디 보기",
  },
  {
    caseId: "exem-dx-improvement",
    routePath: "/portfolio",
    title: "개발 생산성 향상 및 자동화 인프라 구축",
    sections: ["overview", "problem", "decision", "result", "retrospective"],
    ctaLabel: "상세 케이스 스터디 보기",
  },
]

export const RESUME_PORTFOLIO_MAPPING_V1: ResumePortfolioMappingEntry[] = [
  {
    resumeItemId: "project-exem-customer-dashboard",
    portfolioCaseId: "exem-customer-dashboard",
    defaultSectionId: "overview",
  },
  {
    resumeItemId: "project-exem-data-grid",
    portfolioCaseId: "exem-data-grid",
    defaultSectionId: "overview",
  },
  {
    resumeItemId: "project-exem-new-generation",
    portfolioCaseId: "exem-new-generation",
    defaultSectionId: "overview",
  },
  {
    resumeItemId: "project-exem-dx-improvement",
    portfolioCaseId: "exem-dx-improvement",
    defaultSectionId: "overview",
  },
]

export const RESUME_SUMMARY_BLOCKS_V1: ResumeSummaryBlock[] = [
  {
    resumeItemId: "project-exem-customer-dashboard",
    title: "고객 특화 DB 모니터링 대시보드 개발",
    summary:
      "React 기반 대시보드 아키텍처 재설계로 장애 인지 시간을 10초에서 3초로 단축하고 인터랙션 지연을 개선했습니다.",
    hasPortfolio: true,
    technologies: ["React", "TypeScript", "TanStack Query", "Zustand", "Playwright"],
    accomplishments: [
      "**React, TanStack Query** 기반의 대시보드 아키텍처를 재설계하여 대규모 데이터 렌더링 병목 현상을 해결했습니다.",
      "**장애 인지 시간 70% 단축** (10초 → 3초) 및 **인터랙션 지연 73~82% 개선**으로 사용자의 체감 응답성을 크게 높였습니다.",
    ],
    ctaLabel: "상세 케이스 스터디 보기",
    ctaHref: buildPortfolioCtaHref("exem-customer-dashboard", "overview"),
  },
  {
    resumeItemId: "project-exem-data-grid",
    title: "데이터 그리드 개발",
    summary:
      "공용 그리드를 div 기반 가상화 구조로 전환해 렌더링 병목을 제거하고 대규모 데이터 화면의 성능 안정성을 확보했습니다.",
    hasPortfolio: true,
    technologies: ["React", "TanStack Table", "TanStack Virtual", "Vitest"],
    accomplishments: [
      "**TanStack Virtual**을 활용해 공용 그리드를 `div` 기반 가상화 구조로 자체 구축하고 범용 컴포넌트화했습니다.",
      "동시 렌더링 **DOM 노드 수 90% 감소** 및 리사이즈 처리 속도 **44배 향상** (22ms → 0.5ms)을 달성하여 대용량 화면의 성능을 확보했습니다.",
    ],
    ctaLabel: "상세 케이스 스터디 보기",
    ctaHref: buildPortfolioCtaHref("exem-data-grid", "overview"),
  },
  {
    resumeItemId: "project-exem-new-generation",
    title: "차세대 데이터베이스 성능 모니터링 제품 개발",
    summary:
      "차트 유형별 도메인 폼 아키텍처와 상태 지역화 패턴으로 제품 확장성과 운영 안정성을 동시에 개선했습니다.",
    hasPortfolio: true,
    technologies: ["React", "TypeScript", "Zustand", "Vite", "TanStack Query"],
    accomplishments: [
      "**Zustand**를 활용한 상태 지역화와 차트 유형별 독립 스키마를 통해 도메인 폼 아키텍처를 설계했습니다.",
      "도메인 제약 기반의 철저한 런타임 검증을 통해 시스템의 **초기 결함율을 낮추고 제품의 확장성과 운영 안정성을 확보**했습니다.",
    ],
    ctaLabel: "상세 케이스 스터디 보기",
    ctaHref: buildPortfolioCtaHref("exem-new-generation", "overview"),
  },
  {
    resumeItemId: "project-exem-dx-improvement",
    title: "개발 생산성 향상 및 자동화 인프라 구축",
    summary:
      "폐쇄망 환경 제약을 반영한 리포트/온보딩 자동화 인프라를 구축해 팀 피드백 루프와 입사자 적응 속도를 개선했습니다.",
    hasPortfolio: true,
    technologies: ["Nest.js", "TypeScript", "React", "MinIO", "N8N", "Docker"],
    accomplishments: [
      "**Nest.js, Docker** 등을 활용해 폐쇄망 환경의 제약을 우회하는 리포트 및 온보딩 자동화 파이프라인을 구축했습니다.",
      "신규 입사자 온보딩 소요 시간을 **수 시간에서 5분 이내로 단축**하고, 고객 레포트 접근 시간을 **97% 개선**하여 팀 생산성을 극대화했습니다.",
    ],
    ctaLabel: "상세 케이스 스터디 보기",
    ctaHref: buildPortfolioCtaHref("exem-dx-improvement", "overview"),
  },
]
