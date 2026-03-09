# 프로젝트 마일스톤: 디자인 검증 자동화 (Design Check System)  
  
> Figma 디자인 vs 실제 구현 컴포넌트를 자동으로 비교하는 3-SKILL 시스템  
  
---  
  
## Phase 1. 기반 인프라 구축 (Foundation)  
  
스크립트와 환경 설정 — 이후 모든 SKILL이 의존하는 핵심 기반  
  
- [x] **Storybook 컴포넌트 스크린샷 캡처 스크립트 구현**  
    - 목표: Story ID를 입력받아 Storybook iframe에서 컴포넌트를 Playwright로 캡처하여 PNG 저장  
  - 포함: Storybook 포트 체크 및 자동 실행, Playwright headless 캡처, `#storybook-root > *` 요소 캡처, 뷰포트 크기 지정(Figma 프레임 크기 맞춤)  
  - 파일: `scripts/capture-screenshot.ts`  
    - 검증: 기존 Story 하나를 대상으로 캡처 실행 → PNG 파일 정상 생성 확인  
  
- [x] **픽셀 비교 스크립트 구현**  
    - 목표: 두 PNG 파일을 pixelmatch로 비교하여 diff 이미지 및 수치 결과(diffRatio) 생성  
  - 포함: 크기 불일치 시 확장 후 비교, diff PNG 생성, Pass/Fail 판정 (5% 임계값)  
  - 파일: `scripts/compare-screenshots.ts`  
    - 검증: 동일 이미지 비교 → diffRatio 0%, 서로 다른 이미지 비교 → diff PNG 생성 및 수치 출력  
  
- [x] **Storybook 설정 및 프로젝트 환경 수정**  
    - 목표: `__screenshots__/` 디렉토리의 Story 파일을 Storybook이 인식하도록 설정  
  - 포함: `.storybook/main.ts`에 stories 경로 추가, `.gitignore`에 `artifacts/` 추가  
  - 검증: `__screenshots__/` 에 테스트 Story 생성 후 Storybook에서 정상 렌더링 확인  
  
---  
  
## Phase 2. SKILL 개발 — 개별 자동화 (Core Features)  
  
각 SKILL이 독립적으로 동작하는 단위 기능 완성  
  
- [x] **story-generator SKILL 작성**  
    - 목표: `/story-gen <컴포넌트 경로>` 명령으로 스크린샷용 Story 파일 자동 생성  
  - 포함: 컴포넌트 props 타입 분석, 기존 Story args 참조, Figma 상태와 1:1 매칭 args 구성, MSW/Provider 자동 래핑 지시  
  - 파일: `.claude/skills/story-generator/SKILL.md`  
    - 검증: 실제 프로젝트 컴포넌트에 `/story-gen` 실행 → Story 파일 생성 → Storybook 렌더링 성공  
  
- [x] **component-screenshot SKILL 작성**  
    - 목표: `/screenshot <Story 파일 경로>` 명령으로 컴포넌트 스크린샷 자동 캡처  
  - 포함: Story title → story ID 변환, Figma 프레임 크기 뷰포트 설정, `capture-screenshot.ts` 호출, Storybook 자동 실행 처리  
  - 파일: `.claude/skills/component-screenshot/SKILL.md`  
    - 검증: Phase 1에서 생성한 테스트 Story에 `/screenshot` 실행 → PNG 파일 정상 저장  
  
---  
  
## Phase 3. SKILL 통합 — 디자인 검증 오케스트레이션 (Integration)  
  
개별 SKILL과 Figma MCP를 조합하여 전체 워크플로우 완성  
  
- [x] **design-check SKILL 작성 (오케스트레이션)**  
    - 목표: `/design-check <Figma URL> <컴포넌트 경로>` 한 번의 명령으로 전체 디자인 검증 수행  
  - 포함:  
      - Figma URL에서 node ID 추출 → MCP로 스크린샷/디자인 컨텍스트/토큰 수집  
      - story-generator 로직으로 Story 생성  
      - component-screenshot 로직으로 구현 캡처  
      - pixelmatch 정량 비교 + Claude 시각 정성 비교  
      - Markdown 보고서 생성 (`artifacts/design-check/{ComponentName}-report.md`)  
  - 파일: `.claude/skills/design-check/SKILL.md`  
    - 검증: 실제 Figma 프레임 URL + 대응 컴포넌트로 `/design-check` 실행 → 보고서 파일 생성, 정량/정성 비교 결과 모두 포함 확인  
  
---  
  
## 참고 노트  
  
**[2026-01-28] Phase 1 완료 세션 요약**:  
- 아키텍처 결정: `compare-screenshots.ts`는 동기 `fs` API 사용 (단일 파일 비교라 async 불필요), `capture-screenshot.ts`는 async 사용 (Playwright/네트워크 의존)  
- 다음 페이즈 영향: `capture-screenshot.ts`의 Story ID 형식은 Storybook 표준 (`shared-card--common`)이므로, Phase 2 `component-screenshot` SKILL에서 Story title → ID 변환 로직 필요 (`encodeURIComponent` 적용됨)  
- 다음 페이즈 영향: `compare-screenshots.ts`의 기본 threshold는 `0.05` (5%)이며, `design-check` SKILL에서 이 값을 조정 가능하도록 `--threshold` 옵션 지원  
- 다음 페이즈 영향: `capture-screenshot.ts`는 `#storybook-root > *` 첫 번째 자식을 캡처하므로, `story-generator`에서 생성하는 Story는 단일 루트 래퍼를 사용해야 함  
  
**[2026-01-28] Phase 2 완료 세션 요약**:  
- 완료 항목: `story-generator` SKILL, `component-screenshot` SKILL 작성 완료  
- 아키텍처 결정: SKILL에 `argument-hint` frontmatter와 `argument: $1` 패턴 적용 (기존 `survey` SKILL 패턴 참조)  
- 아키텍처 결정: story-generator는 3가지 패턴 분류 (Simple / MSW-dependent / Provider-dependent)  
- 아키텍처 결정: component-screenshot의 Story ID 변환은 Storybook 표준 규칙 따름 (title lowercase → `/`→`-` → `--` + kebab-case export)  
- 발견된 이슈: `.claude/skills/` 디렉토리가 `.gitignore`에 포함되어 있어 git에 추적되지 않음. 필요시 `.gitignore` 수정 필요  
- 다음 페이즈 영향: Phase 3 `design-check` SKILL에서 두 SKILL의 로직을 오케스트레이션할 때, Story ID 변환 규칙과 캡처 스크립트 CLI 옵션을 참조해야 함  
  
**[2026-01-28] Phase 3 완료 세션 요약**:  
- 완료 항목: `design-check` SKILL 작성 완료 (`.claude/skills/design-check/SKILL.md`)  
- 아키텍처 결정: story-generator와 component-screenshot의 로직을 별도 SKILL 호출이 아닌 단일 SKILL 내 7단계 워크플로우로 내장 (오케스트레이션 안정성 확보)  
- 아키텍처 결정: MCP Figma Desktop 도구 3종 활용 — `get_screenshot`, `get_design_context`, `get_variable_defs`  
- 아키텍처 결정: 새 Story 생성 시 `--rebuild` 플래그 자동 적용 (기존 Storybook 빌드에 미포함된 Story 대응)  
- 아키텍처 결정: 정성 비교 severity 4단계 분류 (Critical/Major/Minor/Nitpick)  
- 발견된 이슈: 없음  
- 다음 영향: 전체 3-Phase 마일스톤 완료. 실제 Figma URL + 컴포넌트로 `/design-check` 실행하여 E2E 검증 필요  
  
**[2026-01-28] Figma MCP 인라인 이미지 문제 해결 세션 요약**:  
- 발견된 이슈: `mcp__figma-desktop__get_screenshot`이 이미지를 인라인(content block)으로 반환하여 파일로 저장 불가 → Phase 5(pixelmatch 비교) 동작 불가  
- 아키텍처 결정: Figma REST API(`/v1/images/:fileKey`)를 사용하는 `scripts/capture-figma-screenshot.ts` 스크립트 신규 생성하여 PNG 파일 직접 저장 방식으로 전환  
- 아키텍처 결정: `FIGMA_TOKEN`은 `.env.local`에 저장 (`*.local`이 `.gitignore`에 포함되어 시크릿 보호)  
- 아키텍처 결정: `dotenv.config({ path: ['.env.local', '.env'] })` 패턴으로 두 파일 모두 로드  
- 변경 파일: `scripts/capture-figma-screenshot.ts` (신규), `.claude/skills/design-check/SKILL.md` (Phase 1, 2-1, 6-1, 에러 처리 테이블 수정)  
- 검증: 실제 Figma URL로 스크립트 실행 → PNG 정상 생성 (1264x96, 7.1KB) 확인  
- 다음 영향: design-check SKILL의 Phase 2-1이 MCP 대신 REST API 스크립트 사용, Phase 2-2/2-3(get_design_context, get_variable_defs)은 여전히 MCP 사용

**[2026-01-28] 크기 동기화 파이프라인 구현 세션 요약**:
- 발견된 이슈: Figma 노드의 CSS 크기(예: 632px)와 Storybook wrapper의 크기(예: 480px)가 불일치하여 캡처된 PNG 크기가 달라져 비교 정확도 저하
- 핵심 원칙: Figma가 생성한 비트맵의 물리적 크기를 절대 기준으로 삼고, Storybook 환경을 이에 맞춤
- 변경 파일 요약:
  - `capture-figma-screenshot.ts`: bbox 조회 + PNG 크기 읽기 + `.meta.json` 저장 + 4096px 경고
  - `capture-screenshot.ts`: `--container-width` 옵션 + CSS 주입 + 폰트 로딩 대기
  - `compare-screenshots.ts`: 크기 불일치 시 경고 로그 추가
- 아키텍처 결정: `.meta.json` 파일에 `bbox`(CSS px), `image`(실제 픽셀), `scale` 저장
- 아키텍처 결정: width만 주입, height는 주입하지 않음 — height 차이는 실제 구현 차이이므로 diff로 잡혀야 함
- 아키텍처 결정: `document.fonts.ready` 대기 + `requestAnimationFrame` 리플로우 보장
- 다음 영향: design-check SKILL에서 Figma 캡처 후 `.meta.json`의 `bbox.width`를 `--container-width`로 전달