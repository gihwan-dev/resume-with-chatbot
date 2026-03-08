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
    heading: "내가 해결한 복잡성은 네 가지였다",
    legacyAliases: ["key-decisions"],
  },
  {
    id: "chart-extensibility",
    heading: "주제 1. 위젯 추가 비용을 줄이기 위한 구조 정리",
    legacyAliases: ["implementation-highlights"],
  },
  { id: "state-lifecycle", heading: "주제 2. 상태 생성과 초기화를 한 패턴으로 맞추기" },
  { id: "storage-migration", heading: "주제 3. 대시보드 레이아웃 저장 방식을 영구 저장 구조로 바꾸기" },
  { id: "sql-analysis-ux", heading: "주제 4. SQL 분석 화면 공통 컴포넌트와 핵심 상호작용 구현" },
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
      "카드형 2-depth 흐름을 고밀도 그리드 기반 1-depth 허브로 재설계해 한 화면 비교와 즉시 RTM/PA 이동이 가능하도록 바꿨습니다. `useFrozenData`, `useDeferredValue`, memo 최적화로 폴링·리사이즈가 겹치는 구간의 렌더 총량을 150회에서 5회로 96.7% 줄이고, INP를 400ms대에서 100ms대로 안정화했습니다.",
    accomplishments: [
      "`restart/start/stop` 인터페이스의 PollingManager로 화면별 타이머를 묶어 선언적으로 폴링 주기를 제어하도록 일원화했습니다.",
      "서로 영향을 주는 필터·조회 상태와 반복되던 저장/복원 로직을 중앙 저장소와 버전 기반 마이그레이션으로 정리해 수정 범위를 국소화했습니다.",
      "API 전면 교체 시점에 Vue 연장 대신 React와 사내 디자인 시스템 기반으로 재구축해 구조 부채 누적을 줄였습니다.",
      "카드형 2-depth 구조를 고밀도 그리드 1-depth 허브로 바꿔 한 화면 비교와 즉시 RTM/PA 이동 흐름을 확보했습니다.",
      "`useFrozenData` 기반 데이터 스냅샷 유지, `useDeferredValue` 저우선 렌더, memo 최적화로 렌더 총량을 96.7% 줄이고 INP를 안정화했습니다.",
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
      "공용 그리드에서 table 태그 기반 구조의 한계를 넘기 위해 div + virtualization 렌더링으로 전환하고, 테이블 레벨 이벤트 위임과 `React.memo`의 값 기반 comparator(`areTableRowPropsEqual`)로 불필요한 리렌더를 줄였습니다. 그 결과 DOM 노드 90% 감소와 리사이즈 처리 22ms→0.5ms 개선을 확인했습니다.",
    accomplishments: [
      "table 태그 기반 구조는 virtualization, 고정 컬럼, 그룹 헤더, 리사이즈 조합에서 레이아웃 제약이 커 통합 테스트로 기존 동작을 고정한 뒤 div 기반 렌더링으로 마이그레이션했습니다.",
      "Cell absolute 1차 구조에서 Row absolute + Cell flex 2차 구조로 재설계해 열 조작 동작과 레이아웃 제약을 일치시켰고, DOM 노드 90% 감소와 리사이즈 처리 22ms→0.5ms 개선을 확인했습니다.",
      "행 가상화(`virtualization`)로 DOM 마운트 범위를 뷰포트 중심으로 제한하고, `React.memo` + `areTableRowPropsEqual` 비교 함수로 `VirtualItem`을 참조가 아닌 `index/start/size` 값으로 비교해 불필요한 리렌더를 줄였습니다.",
      "`columnSizing`은 안정적으로 전달하고 셀·행 개별 상호작용 대신 테이블 레벨 이벤트 위임을 적용해 핸들러 수와 상호작용 처리 비용을 낮췄습니다.",
      "Core - State - UI 계층 분리와 기능 호환표를 기준으로 Storybook 시나리오, 브라우저 통합 테스트, 회귀 타깃 문서를 함께 운영해 기능 조합 회귀를 관리했습니다.",
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
      "차세대 DB 모니터링 제품에서 위젯 빌더 구조를 정리해 신규 위젯 추가 시 수정 범위를 줄였습니다. 불필요한 전역 스토어 20개를 지역 상태로 전환했습니다. 대시보드 레이아웃 저장을 DB 영구 저장 구조로 하루 만에 옮겼습니다.",
    accomplishments: [
      "위젯별 설정·검증·미리보기 로직을 분리해 신규 위젯 추가 시 수정 범위를 줄였습니다.",
      "불필요한 전역 스토어 20개를 지역 상태로 전환해 상태 범위를 줄였습니다.",
      "스토어 생성·초기화 절차를 공통화해 초기값 주입 기준을 맞췄습니다.",
      "브라우저 저장소와 같은 형태로 저장 API를 정리했습니다.",
      "기존 저장 로직은 유지한 채 저장 대상만 교체해 하루 만에 마이그레이션했습니다.",
      "SQL 분석 공통 컴포넌트를 추출해 페이지 재사용 기준을 맞췄습니다.",
      "핵심 시나리오 점검으로 위젯 빌더, 지역 상태 전환, SQL 공통 컴포넌트 동작을 확인했습니다.",
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
