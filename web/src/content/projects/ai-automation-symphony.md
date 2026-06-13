---
companyId: "ai-automation"
title: "Symphony 이슈 기반 Codex 오케스트레이션 데몬"
techStack: ["Elixir", "OTP", "Linear GraphQL API", "Codex app-server", "JSON-RPC", "ExUnit", "Solid", "YAML"]
dateStart: 2026-06-08
priority: 4
variants: ["ai-agent"]
summary: "Linear 이슈를 작업 단위로 읽고, 이슈별 워크스페이스를 준비한 뒤 Codex app-server 턴을 실행하는 Elixir/OTP 데몬을 구축했습니다. 워크플로우 설정과 프롬프트를 `WORKFLOW.md`로 분리해, 트래커·워크스페이스·Codex 실행 계약을 코드와 테스트로 고정했습니다."
accomplishments:
  - "Linear GraphQL 페이지네이션, 프로젝트 slug 목록, 선택적 assignee, 필수 라벨, blocker, active/terminal state 필터를 조합해 실행 후보 이슈를 정규화하는 트래커 어댑터를 구현했습니다."
  - "GenServer 오케스트레이터가 이슈 claim, 상태별 동시성 제한, worker monitor, retry backoff, running issue reconciliation, stall 감지, 완료 워크스페이스 정리를 한 곳에서 조정하도록 설계했습니다."
  - "워크플로우 설정의 필수 라벨·terminal state·sandbox policy 검증과 max turns 종료·retry queue 보존 경로를 ExUnit 테스트로 고정해 잘못된 입력이나 장기 실행 이슈가 오케스트레이터 상태를 흐리지 않도록 했습니다."
  - "이슈 식별자를 sanitize한 워크스페이스를 만들고, `after_create`·`before_run`·`after_run`·`before_remove` hook의 fatal/best-effort 동작을 분리해 워크스페이스 준비 책임을 설정 파일로 위임했습니다."
  - "Codex app-server JSON-RPC adapter가 session/turn 요청과 비동기 이벤트를 매핑하고, session id·turn count·token usage·rate limit 이벤트를 오케스트레이터 snapshot에 반영하도록 ExUnit 테스트로 고정했습니다."
---
