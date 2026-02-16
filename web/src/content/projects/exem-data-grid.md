---
title: "데이터 그리드 개발"
company: "Exem"
description: "차세대 대시보드를 위한 고성능 데이터 그리드 아키텍처를 재설계해 성능과 확장성을 동시에 개선"
dateStart: 2025-07-01
updatedAt: 2026-02-15
techStack: ["React", "TanStack Table", "TanStack Virtual", "Vitest"]
priority: 2
---

#### 고성능 데이터 그리드 라이브러리 아키텍처 개선 (High-performance Data Grid Architecture)

**[TanStack Table 기반 데이터 그리드 개선기](https://velog.io/@koreanthuglife/Tanstack-Table-%EA%B8%B0%EB%B0%98-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EA%B7%B8%EB%A6%AC%EB%93%9C-%EA%B0%9C%EC%84%A0%ED%95%98%EA%B8%B0)**

**Problem**

* `<table>` 기반 레이아웃으로는 9분할(고정 행·열)과 가상 스크롤을 동시에 만족하기 어려워, 기능 결합 시 리플로우 비용과 DOM 복잡도가 급격히 증가했습니다.
* 셀 위치 계산에서 `column.getStart()` 누적 합산이 반복되어 열 수에 비례한 `O(n)` 비용이 발생했고, 컨테이너 리사이즈 처리에도 약 22ms가 소요됐습니다.

**Action**

* `TanStack Virtual`의 `useVirtualizer`로 행 가상화를 적용하고, Row `position: absolute` / Cell `display: flex` 구조로 렌더링 경계를 재구성했습니다.
* 셀 배치에서 `left`·`width` 직접 계산을 제거하고 `flex` 기반 폭 정책(고정폭/자동폭)으로 전환해 레이아웃 계산 책임을 브라우저 엔진으로 이관했습니다.
* `column.getStart()` 호출 경로와 `ResizeObserver + 3-pass` 리사이즈 로직을 제거해 복잡한 보정 계층을 단순화했습니다.

**Result**

* 대규모 데이터 환경에서 렌더링 성능을 90% 개선해 고밀도 모니터링 화면의 체감 반응성을 높였습니다.
* 컨테이너 리사이즈 처리 시간을 22ms에서 0.5ms로 단축해 약 44배 개선했습니다.
* 600개 이상 통합 테스트를 품질 게이트로 유지해 고난도 기능 조합 회귀를 조기에 차단했습니다.
