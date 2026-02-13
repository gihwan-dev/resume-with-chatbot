---
title: "데이터 그리드 개발"
company: "Exem"
description: "MaxGauge 차세대 대시보드용 고성능 데이터 그리드 라이브러리 자체 개발"
dateStart: 2025-07-01
updatedAt: 2026-02-13
techStack: ["React", "TanStack Table", "TanStack Virtual", "Vitest"]
priority: 2
---

#### 고성능 데이터 그리드 라이브러리 아키텍처 개선

**[TanStack Table 기반 데이터 그리드 개선기](https://velog.io/@koreanthuglife/Tanstack-Table-%EA%B8%B0%EB%B0%98-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EA%B7%B8%EB%A6%AC%EB%93%9C-%EA%B0%9C%EC%84%A0%ED%95%98%EA%B8%B0)**

**Problem**

* `<table>` 태그의 경직된 계층 구조로 인해 가상화, 컬럼 리사이징, 드래그 앤 드롭 구현 시 **불필요한 DOM 복잡도** 및 레이아웃 리플로우 발생.
* 외부-컴포넌트-인스턴스로 이어지는 **3계층 상태 구조**로 인해 **무분별한 `useEffect` 동기화 로직**이 남발되어 무한 루프 및 디버깅 난도 상승.
* 제어/비제어 패턴이 혼재되어 예측 불가능한 컴포넌트 동작 및 낮은 재사용성 문제 발생.

**Action**

* `<table>`을 폐기하고 **`div` + Absolute Positioning** 기반의 그리드 시스템으로 전면 교체. 9분할 영역 구조를 통해 행/열 고정(Sticky) 및 가상 스크롤 환경에서 독립적인 레이아웃 격리 확보.
* 컴포넌트 내부의 불필요한 중간 상태를 완전히 삭제하고 외부 상태를 TanStack Table 인스턴스에 직접 주입하는 구조로 개편. 이를 통해 상태 동기화 목적의 **`useEffect` 100% 제거**.
* TanStack Table의 철학을 계승하여 모든 기능(정렬, 필터, 페이지네이션 등)에 대해 일관된 제어/비제어 인터페이스(initialState vs state)를 제공하도록 API 리팩토링.
* **ARIA** 속성을 수동 적용하여 시각적 그리드의 접근성을 보완하고, 기능 간 간섭 방지를 위해 **기능 호환성 매트릭스** 도입.
* 컬럼 리사이즈 정책을 양방향 가변에서 `우측 캐스케이드 + Flex Basis` 단방향 모델로 재정의해 변경 전파 규칙을 단순화했습니다.
  <!-- evidence: Daily Notes/2026-02-11.md | Daily Notes/2026-02-12.md | Exem/01-Projects/Table 컴포넌트/설계/Table 컬럼 리사이즈 모델 전환 (우측 캐스케이드 + Flex Basis).md -->
* 9분할 영역별 폭 계산 경계를 통일하고 고정행/가상 스크롤 동기화 깨짐 케이스를 기준 스토리로 표준화했습니다.
  <!-- evidence: Daily Notes/2026-02-11.md | Daily Notes/2026-02-12.md | Exem/01-Projects/Table 컴포넌트/설계/아키텍쳐 변경 - 20260213.md -->

**Result**

* 레이아웃 격리 및 메모이제이션 최적화를 통해 대규모 데이터 환경 내 **렌더링 성능 90% 개선**.
* 가상화, 셀 병합, 트리 구조 등 20개 이상의 고난도 기능 조합에 대해 **600개 이상의 통합 테스트**를 작성하여 **회귀 버그 원천 차단**.
* 일관된 API 구조 도입으로 내부 구현 파악 없이도 사용 가능한 선언적 컴포넌트 환경 구축 및 신규 기능 확장성 확보.
* 리사이즈 관련 회귀를 브라우저 테스트 체크포인트로 고정해 디버깅 소요를 줄이고 릴리즈 예측 가능성을 높였습니다.
  <!-- evidence: Daily Notes/2026-02-11.md | Daily Notes/2026-02-12.md | Exem/01-Projects/Table 컴포넌트/설계/아키텍쳐 변경 - 20260213.md -->
