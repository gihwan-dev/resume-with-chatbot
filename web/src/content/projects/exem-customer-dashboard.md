---
title: "Customer Specific Dashboard"
company: "Exem"
description: "MaxGauge 고객 맞춤형 대시보드 제품군 개발 (고밀도 데이터 그리드)"
dateStart: 2025-11-01
techStack: ["React", "TypeScript", "TanStack Query"]
---

#### UI 아키텍처 개편

**Problem** 기존의 카드형 UI는 정보 밀도가 낮아, Oracle, Tibero 등 이기종 DB의 다수 인스턴스 상태를 한눈에 파악하고 제품(MaxGauge)으로 연계하려는 고객의 니즈를 충족시키기 어려움.

**Action** 정보 밀도가 높은 데이터 그리드 기반 뷰로 전면 개편하고, 사내 디자인 시스템을 적용하여 UI 일관성 확보 및 가독성 개선. 통합 테스트를 선행 작성하여 레거시 기능의 안전한 마이그레이션 보장.

**Result** 수십 개의 인스턴스 상태를 한눈에 관제 가능한 환경 구현으로 고객 만족도 증대.

---

#### 데이터 관리 표준화

**Problem** 분산된 폴링 로직과 레거시 API 간의 강한 결합으로 인해 네트워크 비효율 발생 및 유지보수 난이도 상승.

**Action** TanStack Query 기반의 아키텍처를 적용하여 비동기 데이터 관리를 표준화 및 복잡한 폴링 로직 제거.

**Result** 선언적인 데이터 페칭 구조 도입으로 코드 복잡도 최소화 및 유지보수성 향상.
