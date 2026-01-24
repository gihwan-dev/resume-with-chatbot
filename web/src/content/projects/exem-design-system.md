---
title: "Design System Migration"
company: "Exem"
description: "전사 공통 디자인 시스템 구축 및 레거시 코드의 디자인 토큰 마이그레이션 자동화"
dateStart: 2025-07-01
techStack: ["React", "TypeScript", "Storybook", "Radix UI", "jscodeshift"]
---

#### 컴포넌트 구현 방식 통일

**Problem** 작업자마다 상이한 컴포넌트 구현 방식으로 인해 협업 비효율 및 유지보수 복잡도 증가.

**Action** Compound Component 패턴과 CVA를 도입하여 팀 내 컴포넌트 구현 방식을 통일하고 확장성 확보.

**Result** 일관된 컴포넌트 API로 팀 내 협업 효율성 향상 및 유지보수 복잡도 감소.

---

#### 디자인 토큰 마이그레이션

**Problem** 코드베이스 전반에 하드코딩된 원시 값이 산재하여 테마 적용 불가능.

**Action** `jscodeshift`를 활용해 원시 값을 의미론적 토큰으로 일괄 변환(AST)하고, ESLint 커스텀 룰을 적용해 원시 값 사용을 컴파일 단계에 감지해 에러를 발생시켜 안전하게 이관.

**Result** 원시 토큰 기반으로 작성된 모든 코드를 의미론적 토큰 기반으로 마이그레이션. ESLint 기반의 강제성 부여로 디자인 토큰 누락률 0% 유지.

---

#### Storybook 자동화

**Problem** Storybook 작성에 많은 시간이 소요되며, 작성자에 따라 산출물의 품질과 양식이 달라지는 문제.

**Action** Storybook 작성을 위한 공통 프롬프트 규칙을 정립하여 입력값에 따른 비결정성을 제거하고 일관된 문서 생성 유도.

**Result** Storybook 작성 시간을 수 시간에서 10분 내외로 90% 이상 단축하고 문서 품질 표준화.
