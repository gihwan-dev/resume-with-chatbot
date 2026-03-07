import type { PortfolioSectionDefinition, ResumePortfolioContentItem } from "./contracts"

const LEGACY_CASE_SECTIONS: readonly PortfolioSectionDefinition[] = [
  { id: "tldr", heading: "TL;DR" },
  { id: "problem-definition", heading: "왜 이 문제를 먼저 풀어야 했나" },
  { id: "key-decisions", heading: "핵심 설계 판단" },
  { id: "implementation-highlights", heading: "어떻게 운영 판단 흐름을 다시 설계했나" },
  { id: "validation-impact", heading: "무엇이 달라졌나" },
  { id: "learned", heading: "What I Learned" },
] as const

const DATA_GRID_CASE_SECTIONS: readonly PortfolioSectionDefinition[] = [
  { id: "tldr", heading: "TL;DR" },
  { id: "problem-definition", heading: "문제 정의" },
  { id: "key-decisions", heading: "핵심 의사결정" },
  { id: "implementation-highlights", heading: "구현 전략" },
  { id: "validation-impact", heading: "검증 및 결과" },
  { id: "learned", heading: "What I Learned" },
] as const

const DX_CASE_SECTIONS: readonly PortfolioSectionDefinition[] = [
  { id: "tldr", heading: "TL;DR" },
  { id: "problem-definition", heading: "문제 정의" },
  { id: "key-decisions", heading: "핵심 의사결정" },
  { id: "implementation-highlights", heading: "구현 전략" },
  { id: "validation-impact", heading: "검증 및 결과" },
  { id: "learned", heading: "What I Learned" },
] as const

const NEW_GENERATION_CASE_SECTIONS: readonly PortfolioSectionDefinition[] = [
  { id: "tldr", heading: "TL;DR" },
  {
    id: "shared-tension",
    heading: "왜 이 문제를 먼저 풀어야 했나",
    legacyAliases: ["problem-definition"],
  },
  {
    id: "complexity-axes",
    heading: "내가 해결한 복잡성은 세 가지였다",
    legacyAliases: ["key-decisions"],
  },
  {
    id: "chart-extensibility",
    heading: "주제 1. 차트 추가 비용을 줄이기 위한 구조 정리",
    legacyAliases: ["implementation-highlights"],
  },
  { id: "state-lifecycle", heading: "주제 2. 상태 생성과 초기화를 한 패턴으로 맞추기" },
  { id: "sql-analysis-ux", heading: "주제 3. 복잡한 SQL 분석을 실제로 탐색 가능한 UX로 만들기" },
  { id: "overall-change", heading: "그래서 전체적으로 무엇이 달라졌나" },
  {
    id: "verification",
    heading: "어떻게 확인했나",
    legacyAliases: ["validation-impact"],
  },
  { id: "learned", heading: "What I Learned" },
] as const

export const DEFAULT_PORTFOLIO_SECTIONS: readonly PortfolioSectionDefinition[] =
  DATA_GRID_CASE_SECTIONS

export const RESUME_PORTFOLIO_CONTENT_V2: ResumePortfolioContentItem[] = [
  {
    projectId: "exem-customer-dashboard",
    resumeItemId: "project-exem-customer-dashboard",
    resumeSummary:
      "운영 대시보드의 병목을 갱신 구조, 허브 UX, 인터랙션 안정성 관점에서 동시에 정리해 300~3,000대 인스턴스를 한 흐름에서 판단하고 대응할 수 있게 만들었습니다.",
    accomplishments: [
      "화면마다 흩어진 폴링 타이머를 객체 추상화(`restart/add/stop`)로 묶고, 필터/조회 상태를 중앙화해 갱신 규칙과 상태 생성 흐름을 일관되게 정리했습니다.",
      "API 전면 교체 시점에 Vue 연장을 멈추고 React + 사내 디자인 시스템 재구축을 선택해 구조 부채를 줄이고 허브 제품 기준의 확장 구조를 다시 잡았습니다.",
      "카드형 UI를 고밀도 그리드와 1단계 이동 동선으로 바꿔 한 화면에서 비교·판단·이동·대응 흐름이 끊기지 않도록 설계했습니다.",
      "알림 기능은 통합 테스트로 스펙을 먼저 고정한 뒤 마이그레이션하고, 인터랙션 중 상태 반영 유예와 렌더 우선순위 조정으로 조작 지연 73~82% 개선과 이상 징후 인지 시간 10초→3초 단축을 만들었습니다.",
    ],
    hasPortfolio: true,
    ctaLabel: "상세 케이스 스터디 보기",
    defaultSectionId: "tldr",
    sections: [...LEGACY_CASE_SECTIONS],
  },
  {
    projectId: "exem-data-grid",
    resumeItemId: "project-exem-data-grid",
    resumeSummary:
      "공용 그리드의 구조 충돌을 레이아웃 재설계와 제약 규칙화로 해결해, 대규모 데이터 화면에서 성능과 기능 조합 확장성을 동시에 확보했습니다.",
    accomplishments: [
      "table 기반 구조에서 virtualization·고정 컬럼·그룹 헤더·리사이즈 조합 충돌을 확인하고, 리팩토링 전후 동작을 통합 테스트로 먼저 고정한 뒤 div 기반 렌더링으로 전환했습니다.",
      "리사이즈 스펙 변경에 맞춰 Cell absolute 1차 구조에서 Row absolute + Cell flex 2차 구조로 재설계해 열 조작 동작과 레이아웃 제약을 일치시켰습니다.",
      "빈 공간 최소화, 영향 방향, 리프 헤더 핸들, 그룹 헤더 합산 등 제약 조건을 규칙으로 명시하고 예외 시나리오는 별도 테스트로 관리해 조합 회귀를 줄였습니다.",
      "Core - State - UI 분리와 호환표 기반 검증 체계를 운영해 DOM 노드 90% 감소, 리사이즈 처리 22ms→0.5ms 개선을 확인했습니다.",
    ],
    hasPortfolio: true,
    ctaLabel: "상세 케이스 스터디 보기",
    defaultSectionId: "tldr",
    sections: [...DATA_GRID_CASE_SECTIONS],
  },
  {
    projectId: "exem-new-generation",
    resumeItemId: "project-exem-new-generation",
    resumeSummary:
      "차세대 DB 모니터링 제품의 복잡성을 확장 구조, 상태 생명주기, 분석 UX 세 축으로 정리해 기능이 늘어나도 유지 가능한 기반을 만들었습니다.",
    accomplishments: [
      "신규 차트 추가 때마다 공통 Builder 수정 범위가 커지던 문제를 `visualization` 기준 registry + Zod 판별 유니온 + preview adapter로 분리해 차트 확장 복잡성을 줄였습니다.",
      "상세 진입과 새 탭 진입마다 달랐던 상태 생성·초기화 흐름을 `storeFactory` 패턴으로 통일하고, 20개 스토어의 초기값 주입 기준을 맞춰 생명주기 복잡성을 정리했습니다.",
      "SQL 분석 화면은 실행계획 비교·원문 확인·메타데이터 탐색을 분절 기능이 아닌 탐색 흐름으로 재설계해 Best/Worst 비교, drag-and-drop 전환, 바인드 변수 하이라이팅, 병렬 조회 기반 UX를 구현했습니다.",
      "Widget Builder, store 생성 패턴, SQL 분석 핵심 상호작용을 Story/VRT 시나리오와 구현 코드 기준으로 검증해 신규 차트 추가 비용과 초기화 관련 버그 위험을 함께 낮췄습니다.",
    ],
    hasPortfolio: true,
    ctaLabel: "상세 케이스 스터디 보기",
    defaultSectionId: "tldr",
    sections: [...NEW_GENERATION_CASE_SECTIONS],
  },
  {
    projectId: "exem-dx-improvement",
    resumeItemId: "project-exem-dx-improvement",
    resumeSummary:
      "레거시 FE의 진단 가능성 부족 문제를 암묵 규칙 명시화와 진단 도구 공용화로 정리해 원인 추적 진입 비용을 낮췄습니다.",
    accomplishments: [
      "전역 `WS`·`IMXWS` 통신 규칙과 Oracle bind 치환 규칙을 JSDoc/공용 헬퍼로 명시화해 추측 기반 수정이 반복되던 구조를 줄였습니다.",
      "ExtJS 이벤트 콜백의 `this` 문맥 유실 지점을 추적해 arrow function으로 고정하면서 상태 판별 오동작 범위를 줄였습니다.",
      "팀 공용 Sencha 진단 도구를 구축해 `console.log` 삽입 없이 SQL 응답 확인과 컴포넌트 추적이 가능하도록 바꿨습니다.",
      "레포·리소스·실행 절차를 스타터킷으로 중앙화해 수 시간 걸리던 환경 진입 부담을 완화했습니다.",
    ],
    hasPortfolio: true,
    ctaLabel: "상세 케이스 스터디 보기",
    defaultSectionId: "tldr",
    sections: [...DX_CASE_SECTIONS],
  },
]

export function findPortfolioSectionsByCaseId(
  caseId: string
): readonly PortfolioSectionDefinition[] | null {
  const contentItem = RESUME_PORTFOLIO_CONTENT_V2.find((item) => item.projectId === caseId)
  return contentItem?.sections ?? null
}
