import type { ResumePortfolioContentItem } from "./contracts"

export const RESUME_PORTFOLIO_CONTENT_V2: ResumePortfolioContentItem[] = [
  {
    projectId: "exem-customer-dashboard",
    resumeItemId: "project-exem-customer-dashboard",
    resumeSummary:
      "300+ DB 인스턴스를 다루는 레거시 관제 화면을 React + TypeScript 기반으로 재설계하고 중앙 폴링을 표준화해 장애 인지 시간을 70% 단축했습니다.",
    accomplishments: [
      "→ 장애 인지 시간 10초 -> 3초 (기준: 동일 알람 시나리오 30회 측정 평균·p95)",
      "→ 인터랙션 지연 73~82% 개선 (기준: 동일 조작 시나리오 Performance API 비교)",
    ],
    hasPortfolio: true,
    ctaLabel: "상세 케이스 스터디 보기",
    defaultSectionId: "tldr",
    sections: [
      "tldr",
      "problem-definition",
      "key-decisions",
      "implementation-highlights",
      "validation-impact",
      "learned",
    ],
  },
  {
    projectId: "exem-data-grid",
    resumeItemId: "project-exem-data-grid",
    resumeSummary:
      "TanStack Table 기반 공용 그리드를 div + virtualization 구조로 전환해 대규모 데이터 화면의 렌더·조작 병목을 제거했습니다.",
    accomplishments: [
      "→ DOM 노드 90% 감소 (기준: 동일 데이터셋·동일 브라우저 30회 벤치마크)",
      "→ 리사이즈 처리 22ms -> 0.5ms, 44배 개선 (기준: 동일 열 조작 시나리오 평균값)",
    ],
    hasPortfolio: true,
    ctaLabel: "상세 케이스 스터디 보기",
    defaultSectionId: "tldr",
    sections: [
      "tldr",
      "problem-definition",
      "key-decisions",
      "implementation-highlights",
      "validation-impact",
      "learned",
    ],
  },
  {
    projectId: "exem-new-generation",
    resumeItemId: "project-exem-new-generation",
    resumeSummary:
      "차세대 폼 아키텍처에 어댑터 패턴과 Zustand 스토어 팩토리를 적용해 기능 확장 시 변경 범위를 도메인 단위로 국소화했습니다.",
    accomplishments: [
      "→ 차트 타입 5종을 핵심 로직 변경 없이 확장 (기준: line/bar/area/scatter/table 동일 인터페이스 적용)",
      "→ 보일러플레이트 약 70% 감소 (기준: 동일 기능 추가 시 평균 코드 라인 수 비교)",
    ],
    hasPortfolio: true,
    ctaLabel: "상세 케이스 스터디 보기",
    defaultSectionId: "tldr",
    sections: [
      "tldr",
      "problem-definition",
      "key-decisions",
      "implementation-highlights",
      "validation-impact",
      "learned",
    ],
  },
  {
    projectId: "exem-dx-improvement",
    resumeItemId: "project-exem-dx-improvement",
    resumeSummary:
      "폐쇄망 환경에서 TypeScript 기반 CI/CD 리포트 뷰어와 온보딩 CLI를 자동화해 검증·온보딩 병목을 줄였습니다.",
    accomplishments: [
      "→ 리포트 접근 3분 -> 5초, 97% 단축 (기준: 동일 검증 시나리오 30회 측정)",
      "→ 온보딩 수 시간 -> 5분 (기준: 사내 표준 체크리스트 5회 완료 시간)",
    ],
    hasPortfolio: true,
    ctaLabel: "상세 케이스 스터디 보기",
    defaultSectionId: "tldr",
    sections: [
      "tldr",
      "problem-definition",
      "key-decisions",
      "implementation-highlights",
      "validation-impact",
      "learned",
    ],
  },
]
