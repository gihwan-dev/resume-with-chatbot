---
title: "고객 특화 DB 모니터링 대시보드 개발"
company: "Exem"
description: "고객별 모니터링 요구를 단일 제품 구조에서 수용하도록 대시보드 아키텍처를 재설계하고 운영 대응 속도를 개선"
dateStart: 2025-01-01
updatedAt: 2026-02-15
techStack: ["React", "TypeScript", "TanStack Table", "React Grid Layout", "Zustand", "Vite", "Playwright"]
priority: 1
---

#### 모니터링 대시보드 아키텍처 개편 및 React 마이그레이션 (Monitoring Dashboard Re-architecture & React Migration)

**Problem**

* 카드형 사용자 인터페이스(UI)에서 300개 이상 이기종 DB 상태를 동시에 렌더링할 때 DOM 노드가 23,315개까지 증가했고, `Layouts/sec 61.4`, `Style recalcs/sec 83.4`가 발생해 메인 스레드 점유로 INP가 약 280ms까지 상승했습니다.
* 고객사별 분기 로직과 전역 의존이 화면 계층에 누적되어 API 명세 변경 시 수정 범위가 대시보드 전반으로 확산됐고, 회귀 영향 분석 비용이 지속적으로 증가했습니다.

**Action**

* `React Grid Layout`의 `x/y/w/h` 좌표 모델로 위젯 배치를 재설계하고 카드형 화면을 그리드 중심 구조로 전환해, 단일 화면의 데이터 밀도를 높였습니다.
* `Zustand` 선택 구독(selector) 패턴으로 상태 소비 범위를 위젯 단위로 분리해, 폴링 데이터 갱신이 전체 트리 리렌더로 전파되지 않도록 구조를 정리했습니다.
* React 마이그레이션 과정에서 Playwright 회귀 시나리오를 배포 게이트로 운영해 핵심 사용자 인터페이스 동등성을 검증했습니다.

**Result**

* 장애 인지 시간이 10초에서 3초로 70% 단축되어 초기 대응 속도를 높였습니다.
* 레거시 API 의존 제거와 회귀 게이트 정착으로 명세 변경 대응성과 릴리즈 안정성을 함께 확보했습니다.

---

#### 실시간 데이터 폴링 아키텍처 표준화 및 네트워크 최적화 (Polling Standardization & Network Optimization)

**Problem**

* 화면별로 폴링 주기와 재실행 규칙이 분산되어 동일한 운영 시나리오에서도 동작이 달랐고, 페이지 이탈 후 잔류 요청이 누적되어 백그라운드 트래픽이 증가했습니다.
* 폴링과 리사이즈가 경합할 때 `onLayoutChange`가 54~70회 연쇄 호출되고 DOM mutation이 4127~6063까지 급증해 렌더링 일관성이 깨졌습니다.

**Action**

* 중앙 폴링 관리자(Polling Manager) 모듈에서 호출 등록·해제·즉시 재실행 규칙을 통합해 화면별 타이머 구현을 제거했습니다.
* `TanStack Query` 정책을 표준화해 `staleTime`을 폴링 주기와 정렬하고, 인터랙션 중 `refetchInterval: false`로 중지한 뒤 종료 시 재개하도록 구성했습니다.
* `useDeferredValue`로 렌더링 우선순위를 조정하고 Playwright + MutationObserver 기반 시나리오 검증을 적용해 경합 경로를 지속 점검했습니다.

**Result**

* 화면 전환과 필터 조작 시 네트워크 동작이 일관되게 유지되고 페이지 이탈 후 잔류 요청이 감소해 운영 예측 가능성이 높아졌습니다.
* 원인 경로 7개와 검증 시나리오 32개를 회귀 기준으로 고정해 성능 이슈 재발을 조기에 감지할 수 있게 했습니다.
