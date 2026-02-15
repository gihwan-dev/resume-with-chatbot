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

* `<table>` 기반 구조 한계로 가상 스크롤·고정 영역·리사이즈를 함께 구현할 때 레이아웃 리플로우와 DOM 복잡도가 커져 성능 비용이 증가했습니다.
* 상태 동기화가 여러 계층에 분산되어 제어 동작 예측이 어려웠고, 기능 조합이 늘수록 재사용성과 안정성이 떨어졌습니다.

**Action**

* 시각 구조를 `div` 기반 그리드로 전환하고 영역별 레이아웃 경계를 분리해, 고정 행·열과 가상 스크롤이 공존하는 렌더링 모델로 재설계했습니다.
* 중간 상태를 줄이고 API를 일관된 제어 패턴으로 정리해, 기능 확장 시 동일한 사용 규칙을 적용할 수 있게 표준화했습니다.

**Result**

* 대규모 데이터 환경에서 렌더링 성능을 90% 개선해, 고밀도 모니터링 화면의 체감 반응성을 높였습니다 (Improved rendering performance by 90%).
* 600개 이상 통합 테스트로 고난도 기능 조합 회귀를 조기 차단해, 디버깅 소요를 줄이고 릴리즈 예측 가능성을 높였습니다.
