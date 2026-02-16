---
title: "고객 특화 DB 모니터링 대시보드 개발"
company: "Exem"
description: "고객별 모니터링 요구를 단일 제품 구조에서 수용하도록 대시보드 아키텍처를 재설계하고 장애 인지 속도를 70% 개선"
dateStart: 2025-01-01
updatedAt: 2026-02-16
techStack: ["React", "TypeScript", "TanStack Table", "TanStack Query", "React Grid Layout", "Zustand", "Vite", "Playwright"]
priority: 1
---

> 대시보드 코어 레이아웃·상태 관리·폴링 아키텍처 설계 및 구현 주도

#### 고객 특화 모니터링 대시보드 아키텍처 재설계

**Problem**

* Vue 기반 레거시 대시보드에서 폴링 주기·재실행 규칙이 화면별로 분산되어 동일 운영 시나리오에서도 네트워크 동작이 달랐습니다.
* 카드형 UI의 데이터 밀도 한계로 대규모 인스턴스 모니터링 효율이 낮았습니다.
* **300개 이상** 이기종 DB 상태 동시 렌더링 시 **DOM 23,315개**, `Layouts/sec 61.4`, `Style recalcs/sec 83.4`가 발생해 **INP 280ms**까지 상승했습니다.

**Action**

* Vue 레거시 단계에서 중앙 Polling Manager를 도입해 화면별로 분산된 폴링 등록·해제·재실행 규칙을 통합했고, React 마이그레이션을 진행하며 TanStack Query로 전환해 폴링을 선언적으로 관리하도록 개선했습니다.
* `React Grid Layout`의 `x/y/w/h` 좌표 모델로 카드형 화면을 그리드 중심 구조로 전환해 단일 화면 데이터 밀도를 높였습니다.
* Playwright E2E 테스트로 알람 등 핵심 기능의 통합 테스트를 작성해, 동일 스펙을 유지한 채 안전하게 마이그레이션했습니다.
* `useFrozenData`로 인터랙션 중 폴링 데이터를 동결해 리렌더를 차단하고, `useDeferredValue`로 렌더링 우선순위를 추가 조정해 드래그·리사이즈 시 폴링에 의한 버벅임을 제거했습니다.

**Result**

* 장애 인지 시간 **10초 → 3초**(70% 단축)로 운영 대응 속도를 개선했습니다.
* 그리드 재구성으로 **DOM 20% 이상 감소**, **인터랙션 지연 73-82% 개선**을 달성했습니다.
* `useFrozenData` + `useDeferredValue` 조합으로 폴링을 유지하면서도 인터랙션 중 렌더 경합을 해소해 조작 응답성을 안정화했습니다.
* Playwright E2E 게이트로 마이그레이션 안전성을 확보하고 릴리즈 안정성을 높였습니다.
