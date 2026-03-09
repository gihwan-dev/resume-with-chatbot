
## 1. 현재 아키텍처 요약

- WebEnv는 key-value 기반 문자열 저장소 (서버 API)
- `createWebEnvStorage`가 Zustand `StateStorage` 인터페이스를 구현하여 커스텀 스토리지 엔진으로 동작
  - `src/shared/webEnv/stores/webEnvStorage.ts`
- 4개 슬라이스가 단일 envKey(`dashboardStore`)에 JSON 직렬화되어 저장
  - `dashboardListInfo` — 대시보드 메타데이터 + 인스턴스 ID
  - `dashboardWidgetInfo` — 위젯 레이아웃/설정
  - `dashboardWidgetStateInfo` — 위젯 런타임 상태
  - `widgetTemplates` — 사용자 위젯 템플릿
  - `src/entities/dashboard/model/useDashboardEnvStore.ts:40-46`
- 엔터티 간 관계(대시보드↔인스턴스, 위젯↔인스턴스)가 DB 레벨이 아닌 클라이언트 JSON 내부에서만 표현됨

---

## 2. 식별된 문제점

### 2-1. 인스턴스 삭제 시 캐스케이드 부재

- `useDeleteInstances`는 서버 삭제 후 TanStack Query 캐시만 무효화
- 대시보드 스토어의 `instanceIds`, `selectedInstanceRows`, `widgetState.instanceList`에 남아 있는 삭제된 인스턴스 참조를 정리하지 않음
- 결과: 삭제된 인스턴스가 대시보드에 유령 데이터로 잔존
- 관련 코드:
  - `src/services/oracle/features/instance/api/useInstanceMutations.ts:59-67`
  - `src/entities/dashboard/model/slices/dashboardListSlice.ts`

### 2-2. 인스턴스 데이터 3중 복제

- 동일한 인스턴스 정보가 3곳에 중복 저장:
  - `dashboardListInfo[id].instanceIds` — ID 배열 (`dashboard.type.ts:18`)
  - `dashboardListInfo[id].selectedInstanceRows` — 전체 인스턴스 객체, `any` 타입 (`dashboard.type.ts:20`)
  - `dashboardWidgetStateInfo[widgetId].instanceList` — 전체 Instance 객체 (`widget.type.ts:26`)
- 대시보드 생성 시 세 곳 모두에 동일 데이터를 복사
  - `src/pages/dashboard/createDashboard/model/useCreateDashboardForm.ts:29-39`
- 결과: 데이터 정합성 보장 없이 페이로드 크기 증가, 타입 안정성 부재(`any`)

### 2-3. 스키마 버전 관리 없음

- Zustand persist의 `version`/`migrate` 옵션 미사용
- `createPersistedStore` 호출 시 마이그레이션 설정 없음
  - `src/entities/dashboard/model/useDashboardEnvStore.ts:32-47`
  - `src/shared/react/storeFactory/persist.ts:33`
- 결과: 스키마 변경 시 기존 사용자 데이터 hydration 실패 또는 무음 손실 위험

### 2-4. 단일 키 All-or-Nothing 직렬화

- 4개 슬라이스 전체가 하나의 envKey에 직렬화
- 위젯 하나의 상태 변경에도 전체 스토어가 직렬화 → 네트워크 전송
- `saveWebEnv`에 200ms 디바운스가 있으나 페이로드 크기 자체는 제어 불가
  - `src/shared/webEnv/api/webEnvApi.ts:46-81`
- 결과: 대시보드/위젯 수 증가 시 페이로드 선형 증가, 저장 지연

### 2-5. hasPermission 정적 설정

- 대시보드 생성 시 `hasPermission: true`로 고정
  - `src/pages/dashboard/createDashboard/model/useCreateDashboardForm.ts:52`
- 이후 권한 변경(사용자 역할 변경, 인스턴스 접근 권한 회수 등)에 대한 재평가 로직 없음
- 결과: 권한이 회수되어도 클라이언트에서는 여전히 접근 가능한 것으로 표시

### 2-6. 동시성 제어 부재

- last-write-wins 방식, 별도의 낙관적 잠금이나 버전 비교 없음
- 다중 탭에서 동일 대시보드 편집 시 마지막 저장이 이전 변경 덮어씀
- `createWebEnvStorage`에 사용자 전환 감지는 있으나 동일 사용자 다중 세션 충돌 처리 없음
  - `src/shared/webEnv/stores/webEnvStorage.ts`
- 결과: 다중 탭/기기에서 데이터 유실 가능

---

## 3. 향후 리스크

- **스키마 진화**: 버전 관리 부재로 필드 추가/변경 시 기존 데이터 호환성 깨짐
- **페이로드 크기**: 대시보드/위젯 수 증가 → 단일 키 직렬화 크기 무한 증가
- **권한 모델 확장**: 정적 `hasPermission`으로는 역할 기반·인스턴스 기반 세분화 불가
- **인스턴스 라이프사이클**: 인스턴스 추가/삭제/변경이 대시보드에 자동 반영되지 않음
- **다중 기기/탭**: 동시 편집 시 데이터 유실, 사용자 경험 저하