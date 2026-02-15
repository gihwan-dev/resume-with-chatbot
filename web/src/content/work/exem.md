---
company: "주식회사엑셈"
role: "프론트엔드 개발자"
dateStart: 2024-11-01
updatedAt: 2026-02-15
isCurrent: true
summary: "성능 모니터링 솔루션의 프론트엔드 개발을 담당하고 있습니다. ExtJS 레거시 유지보수와 React 기반 차세대 시스템 구축을 병행하며, AI 파이프라인 도입과 개발 도구 개선을 통해 팀 생산성 향상에 기여하고 있습니다."
location: "Seoul, Korea"
---

- 성능 모니터링 대시보드(MaxGauge-VI)의 Table 컴포넌트 아키텍처 리팩토링 — 중복 코드 176줄 제거, 컴포넌트 수 5→4 통합, 743개 테스트 무회귀 달성
- Table 9분할 구조에서 컬럼 리사이즈 정책을 `우측 캐스케이드 + Flex Basis`로 전환하고, 우측 고정 컬럼 리사이즈 규칙(핸들러 우선 처리·이벤트 전파 차단)을 정리해 스크롤 동기화 이슈를 스토리·브라우저 테스트로 재현-수정했습니다.
  <!-- evidence: Daily Notes/2026-02-11.md | Daily Notes/2026-02-12.md | Exem/01-Projects/Table 컴포넌트/설계/아키텍쳐 변경 - 20260213.md | Exem/01-Projects/Table 컴포넌트/설계/Table 컬럼 리사이즈 모델 전환 (우측 캐스케이드 + Flex Basis).md -->
- Alert Log 모듈을 상태 슬라이스 → Split View 모달 → 3단 레이아웃 순으로 재구성해 운영자 탐색 동선과 장애 분석 속도를 개선하고 있습니다.
  <!-- evidence: Daily Notes/2026-02-11.md | Daily Notes/2026-02-12.md | Exem/01-Projects/DPM 대시보드/TODO.md -->
- Figma ↔ React 디자인 검증 자동화 파이프라인 구축 — Figma REST API, Playwright, pixelmatch, Claude Vision을 연동한 7단계 워크플로우
- WebEnv(클라이언트 상태 저장소) 구조적 문제 분석 및 개선 방향 설계 — 데이터 삼중화, 캐스케이드 누락, 동시성 문제 등 6가지 아키텍처 이슈 도출
- SK하이닉스 오라클 라이센스 대시보드 기능 개발 — Site/Fab/Instance 3계층 필터링 UI 구현, 백엔드 API 변경 대응
