import type { ResumePortfolioContentItem } from "./contracts"

export const RESUME_PORTFOLIO_CONTENT_V2: ResumePortfolioContentItem[] = [
  {
    projectId: "exem-customer-dashboard",
    resumeItemId: "project-exem-customer-dashboard",
    resumeSummary:
      "300~3,000대 규모 인스턴스를 대상으로, **실시간 상태를 한 화면에서 모니터링하는 대시보드**와 **그룹 단위 일·월·연 추세 분석 제품**을 개발했습니다.",
    accomplishments: [
      "Vue2 레거시 대시보드에서 화면마다 흩어진 타이머 폴링을 **객체로 추상화**하고, `restart`·`add`·`stop` 등의 선언적 메서드를 중심으로 갱신 주기를 일관되게 제어할 수 있는 구조로 정리했습니다.",
      "로컬 스토리지에 분산돼 있던 **연관된 필터/조회 상태를 중앙화**해 흩어져 있던 로직의 **응집도를 높였으며**, **버전 관리 기반 구조**로 개편해 확장 가능성을 확보했습니다.",
      "JSDoc 타입 시스템을 도입해 런타임 오류를 줄이고 리팩토링 안정성을 높였습니다.",
      "API 전면 교체 시점에 트레이드 오프를 비교해 전역 객체 의존이 큰 Vue 구조를 계속 확장하지 않고, **React와 사내 디자인 시스템 기반으로 대시보드를 재구축**했습니다.",
      "허브 제품 특성에 맞게 카드형 UI를 **고밀도 그리드**로 전환하고 제품 간 이동 동선을 **1단계 진입**으로 줄여, 300개 이상 인스턴스 상태를 빠르게 비교하고 필요한 제품으로 즉시 이동할 수 있게 했습니다.",
      "복잡한 알림 기능은 통합 테스트로 스펙을 먼저 고정한 뒤 마이그레이션했습니다.",
      "인터랙션 중 상태 반영 유예와 렌더 우선순위 조정으로 **조작 지연 73~82% 개선**, **이상 징후 인지 시간 10초→3초 단축**을 만들었습니다.",
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
      "대규모 데이터 조회와 빈번한 열 조작이 동시에 일어나는 화면을 위해, **20+ 기능을 지원하는 공용 데이터 그리드**를 재설계했습니다. 초기 table 기반 구조의 제약을 넘기 위해 렌더링 모델과 리사이즈 제약 규칙을 다시 정의하고, 호환표 기반 검증 체계를 함께 정리했습니다.",
    accomplishments: [
      "초기 table 기반 구현에서 virtualization·고정 컬럼·그룹 헤더·리사이즈 조합의 구조 한계를 확인했고, 리팩토링 전후 동작을 통합 테스트로 먼저 고정한 뒤 div 기반 구조로 전환했습니다.",
      "초기에는 셀 단위 absolute positioning으로 렌더링했지만, 칼럼 너비 조정 시 인접 칼럼이 함께 재분배되는 스펙 변경에 맞춰 **Row는 absolute, Cell은 flex 기반**으로 다시 설계했습니다.",
      "기본 정책상 빈 공간을 최소화하는 리사이즈, 좌·우 영향 방향, 리프 헤더 리사이즈, 그룹 헤더 너비 합산 같은 제약 조건을 규칙으로 정리하고 예외 시나리오는 별도 규칙/테스트로 관리했습니다.",
      "컨테이너를 상·중·하 / 좌·중·우 영역으로 분리하고, 제어·비제어를 모두 지원하는 일관된 인터페이스를 설계해 다양한 화면 요구사항에 대응했습니다.",
      "[TanStack Table Custom Features](https://tanstack.com/table/latest/docs/guide/custom-features) 기반으로 **Core - State - UI 계층**을 분리해 기능 확장 시 변경 범위를 줄였고, 이후 다른 프레임워크 기반 테이블에도 재사용할 수 있도록 구조를 다듬고 있습니다.",
      "기능 호환표를 기준으로 Storybook 문서와 테스트 코드를 함께 관리하고, TDD 기반 버그 수정 프로세스로 커버리지와 회귀 안정성을 지속적으로 높였습니다.",
      "동일 데이터셋·동일 브라우저 기준 30회 벤치마크에서 **DOM 노드 90% 감소**, **열 리사이즈 처리 22ms→0.5ms(44배 개선)**를 확인했습니다.",
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
