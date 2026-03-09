이 문서는 MaxGauge-VI (React/Vite) 기준으로 WebEnv 및 localStorage에 영속화되는 모든 데이터를 요약합니다.

## Overview

WebEnv는 서버 사이드 key-value 저장소로, `PATCH /api/v1/config/web-env` 엔드포인트를 통해 접근합니다. 클라이언트에서는 두 가지 경로로 사용됩니다:

1. **Zustand persist 스토리지 어댑터** — `createWebEnvStorage()`가 Zustand `StateStorage` 인터페이스를 구현하여, 스토어 상태가 변경되면 자동으로 WebEnv에 직렬화 (`src/shared/webEnv/stores/webEnvStorage.ts`)
2. **React Query 훅** — `useWebEnvQuery()` / `useWebEnvMutation()`으로 개별 키를 직접 CRUD (`src/shared/webEnv/stores/useWebEnvQueries.ts`)

저장 시 200ms 디바운스가 적용되며 (`category_envKey` 단위), 조회 시 값 파싱은 JSON → number → boolean → string 순으로 시도됩니다 (`src/shared/webEnv/utils/parser.ts`).

## Structure

| 저장소 | Scope | 접근 방식 |
| --- | --- | --- |
| WebEnv (서버) | `userId` + `category` + `envKey` + `instanceId` 조합으로 식별 | Zustand persist 어댑터 또는 React Query 훅 |
| localStorage (브라우저) | 키 문자열로 식별, 기기/브라우저별 | Zustand persist + `createJSONStorage(() => localStorage)` |

## Categories

`src/shared/webEnv/constants/categories.ts`에 정의된 카테고리입니다.

| Name | Value | 현재 사용 여부 | 설명 |
| --- | --- | --- | --- |
| `DASHBOARD` | `'DASHBOARD'` | **사용 중** | 대시보드 전체 상태 (Zustand persist) |
| `FAVORITE` | `'FAVORITE'` | **사용 중** | 즐겨찾기 메뉴/SQL (Zustand persist) |
| `USER` | `'USER'` | **사용 중** | 사용자별 설정 (React Query 훅) |
| `CONFIG` | `'CONFIG'` | 예약됨 | 미사용 |
| `BACKOFFICE` | `'BACKOFFICE'` | 예약됨 | 미사용 |
| `ORACLE` | `'ORACLE'` | 예약됨 | 미사용 |
| `DASHBOARD_DETAIL` | `'DASHBOARD_DETAIL'` | 예약됨 | 미사용 |

## WebEnv 키 — Zustand Persist 스토어

### `dashboardStore` (Category: `DASHBOARD`)

대시보드 관련 모든 데이터가 이 단일 키에 JSON 직렬화됩니다.

- **스토어 정의**: `src/entities/dashboard/model/useDashboardEnvStore.ts`
- **타입 정의**: `src/entities/dashboard/model/dashboard.type.ts`, `src/entities/dashboard/model/widget.type.ts`
- **Provider**: `DashboardEnvProviderStore` (앱 루트에서 제공)

#### 직렬화 구조

```jsonc
{
  "state": {
    "dashboardListInfo": { /* Record<ID, DashboardListInfo> */ },
    "dashboardWidgetInfo": { /* Record<ID, DashboardWidgetInfo> */ },
    "dashboardWidgetStateInfo": { /* Record<ID, DashboardWidgetStateInfo> */ },
    "widgetTemplates": [ /* WidgetTemplate[] */ ]
  },
  "version": 0
}
```

#### Slice 1: `dashboardListInfo`

대시보드 메타데이터 목록. `Record<dashboardId, DashboardListInfo>` 형태.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `dashboardId` | `string` | 대시보드 식별자 |
| `name` | `string` | 대시보드 이름 |
| `note` | `string` | 설명/메모 |
| `creator` | `string` | 생성자 이름 |
| `databaseType` | `string` | DB 유형 (예: `'oracle'`) |
| `createdTime` | `string` | 생성 시각 |
| `lastModified` | `string` | 마지막 수정 시각 |
| `instanceIds` | `number[]` | 연결된 인스턴스 ID 배열 |
| `selectedInstanceRows` | `any` | 선택된 인스턴스 전체 객체 (타입 미정의) |
| `copy?` | `string` | 복제 원본 ID |
| `favorite?` | `boolean` | 즐겨찾기 여부 |
| `imageUrl?` | `string` | 썸네일 이미지 |
| `isNew?` | `boolean` | 신규 여부 |
| `hasPermission?` | `boolean` | 접근 권한 (생성 시 `true` 고정) |

- **슬라이스 구현**: `src/entities/dashboard/model/slices/dashboardListSlice.ts`

#### Slice 2: `dashboardWidgetInfo`

대시보드별 위젯 레이아웃. `Record<dashboardId, DashboardWidgetInfo>` 형태.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `dashboardId` | `string` | 대시보드 식별자 |
| `name` | `string` | 대시보드 이름 |
| `widgets` | `Widget[]` | 위젯 배열 |

**Widget 구조:**

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `widgetId` | `string` | 위젯 식별자 |
| `widgetType` | `WidgetType` | 위젯 유형 (`'alert'` \| `'sqlScatter'` \| `'maxgaugeInsight'` \| `'metricChart'` \| `'sessionBoard'`) |
| `title` | `string` | 위젯 제목 |
| `x`, `y`, `w`, `h` | `number` | 그리드 위치/크기 |
| `foldedInfo?` | `{ isFolded, originalHeight }` | 접힘 상태 |
| `childWidgets?` | `Widget[]` | 중첩 위젯 (widgetGroup용) |

- **슬라이스 구현**: `src/entities/dashboard/model/slices/dashboardWidgetSlice.ts`

#### Slice 3: `dashboardWidgetStateInfo`

위젯 런타임 상태. `Record<dashboardId, DashboardWidgetStateInfo>` 형태.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `dashboardId` | `string` | 대시보드 식별자 |
| `name` | `string` | 대시보드 이름 |
| `showLegend` | `boolean` | 범례 표시 여부 |
| `widgetState` | `Record<widgetId, WidgetStateValue>` | 위젯별 상태 |

**WidgetStateValue (공통):**

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `widgetId` | `string` | 위젯 식별자 |
| `widgetType` | `WidgetType` | 위젯 유형 |
| `instanceList` | `Instance[]` | 인스턴스 전체 객체 배열 |

**WidgetStateValue (metricChart 추가 필드):**

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `title` | `string` | 차트 제목 |
| `metricName` | `string` | 메트릭 이름 (예: `'cpu'`) |
| `unit` | `'count'` \| `'sec'` \| `'ms'` \| `'%'` | 단위 |
| `type` | `'LAST'` \| `'AVG'` \| `'MIN'` \| `'MAX'` \| `'DELTA'` \| `'SUM'` | 집계 타입 |
| `category` | `'STAT'` \| `'OS'` \| `'EVENT'` | 메트릭 카테고리 |

**Instance 객체 구조** (`src/services/oracle/entities/instance/model/instance.type.ts`):

| 필드 | 타입 |
| --- | --- |
| `instanceId` | `number` |
| `instanceKey` | `string` |
| `instanceName` | `string` |
| `businessName` | `string` |
| `status` | `'RUNNING'` \| `'SHUTDOWN'` \| `'UNKNOWN'` |
| `dbType` | `'ORACLE'` \| `'TIBERO'` \| ... |
| `dbVersion` | `string` |
| `osType` | `'WINDOWS'` \| `'LINUX'` |
| `port` | `number` |
| `sid` | `string?` |
| `serviceName` | `string?` |
| `rac` | `string[]` |
| `pdb` | `string[]` |
| `instanceGroupIds` | `number[]` |
| `dbUser` | `string?` |
| `service` | `boolean` |
| `host` | `string?` |
| `hostName` | `string?` |

- **슬라이스 구현**: `src/entities/dashboard/model/slices/dashboardWidgetStateSlice.ts`

#### Slice 4: `widgetTemplates`

사용자 저장 위젯 템플릿. `WidgetTemplate[]` 배열.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `templateId` | `string` | 템플릿 식별자 |
| `title` | `string` | 템플릿 제목 |
| `description?` | `string` | 설명 |
| `tags` | `string[]` | 태그 배열 |
| `source` | `'system'` \| `'user'` | 출처 |
| `payload.widgetType` | `WidgetType` | 위젯 유형 |
| `payload.widgetTitle` | `string` | 위젯 제목 |
| `payload.widgetLayout` | `{ w, h }` | 기본 크기 |
| `payload.widgetState` | `WidgetStatePayload` | 위젯 상태 (instanceList 포함) |

- **슬라이스 구현**: `src/entities/dashboard/model/slices/dashboardWidgetTemplateSlice.ts`

---

### `favoriteStore` (Category: `FAVORITE`)

즐겨찾기 데이터가 이 키에 JSON 직렬화됩니다.

- **스토어 정의**: `src/services/oracle/features/favorite/model/useFavoriteProviderStore.tsx`
- **Provider**: `FavoriteProviderStore` (앱 루트에서 제공)

#### 직렬화 구조

```jsonc
{
  "state": {
    "menuList": ["oracle/analysis/top-sql", "oracle/analysis/plan-change"],
    "sqlIdList": [{ "sqlId": "abc123", "instanceId": 1 }]
  },
  "version": 0
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `menuList` | `string[]` | 즐겨찾기한 메뉴 경로 배열 |
| `sqlIdList` | `Array<{ sqlId: string, instanceId: number }>` | 즐겨찾기한 SQL ID + 인스턴스 ID |

---

## WebEnv 키 — React Query 훅

### `RECENT_MENU_ITEMS` (Category: `USER`)

최근 방문 페이지 기록. `useWebEnvQuery` / `useWebEnvMutation`으로 직접 관리.

- **훅 정의**: `src/shared/webEnv/hooks/usePageNavigation.ts`
- **스코프**: 사용자별 (`userId` 포함)

#### 저장 구조

```jsonc
[
  { "path": "/oracle/dashboard", "visitedTime": 1706900000000 },
  { "path": "/oracle/analysis/sql", "visitedTime": 1706899000000 }
]
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `path` | `string` | 페이지 경로 |
| `visitedTime` | `number` | 방문 시각 (Unix timestamp ms) |

- 최대 15개 유지, 최신 항목이 앞에 추가
- 타입: `History[]` (`src/shared/types/page.type.ts`)

---

## localStorage 키

WebEnv가 아닌 브라우저 localStorage에 저장되는 데이터입니다. 키 상수는 `src/shared/define/index.ts`에 정의됩니다.

### `ui-theme` (ThemeStore)

- **스토어 정의**: `src/shared/store/useThemeStore.ts`
- **글로벌**: Provider 없이 전역 사용

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `theme` | `'light'` \| `'dark'` \| `'system'` | UI 테마 |

### `userStore` (UserStore)

- **스토어 정의**: `src/shared/store/useUserStore.ts`
- **글로벌**: Provider 없이 전역 사용

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `roleTier` | `string` | 사용자 역할 등급 |

### `backoffice-auth`

- `src/shared/define/index.ts`에 키 정의만 존재 (`LOCAL_STORAGE_KEY.BACKOFFICE_AUTH`)
- 현재 직접 참조하는 Zustand 스토어는 확인되지 않음

---

## 전체 요약 테이블

| envKey | 저장소 | Category | 접근 방식 | 저장 데이터 | 스코프 |
| --- | --- | --- | --- | --- | --- |
| `dashboardStore` | WebEnv | `DASHBOARD` | Zustand persist | 대시보드 목록 + 위젯 레이아웃 + 위젯 상태 + 템플릿 | 사용자별 |
| `favoriteStore` | WebEnv | `FAVORITE` | Zustand persist | 메뉴 즐겨찾기 + SQL 즐겨찾기 | 사용자별 |
| `RECENT_MENU_ITEMS` | WebEnv | `USER` | React Query 훅 | 최근 방문 페이지 (최대 15개) | 사용자별 |
| `ui-theme` | localStorage | — | Zustand persist | UI 테마 설정 | 기기/브라우저별 |
| `userStore` | localStorage | — | Zustand persist | 사용자 역할 등급 | 기기/브라우저별 |

## Notes

- Zustand persist 스토어는 `version` / `migrate` 옵션을 사용하지 않음 (현재 `version: 0` 고정)
- WebEnv 저장 시 `saveWebEnv()`에 200ms 디바운스가 `category_envKey` 조합 단위로 적용됨
- `createWebEnvStorage`는 `userId` 변경을 감지하여, 사용자 전환 시 이전 사용자 데이터 덮어쓰기를 방지함
- `dashboardStore`는 4개 슬라이스가 단일 키에 직렬화되므로, 위젯 하나 변경에도 전체 페이로드가 전송됨
- `Instance` 객체가 `dashboardListInfo.selectedInstanceRows`, `widgetState.instanceList`, `widgetTemplates.payload.widgetState.instanceList` 세 곳에 중복 저장됨
- `CONFIG`, `BACKOFFICE`, `ORACLE`, `DASHBOARD_DETAIL` 카테고리는 코드에 상수 정의만 존재하며 실제 저장/조회 로직 없음
- MSW 목 핸들러에는 `NOTIFICATION`, `ANALYSIS` 카테고리가 추가로 정의되어 있으나 프로덕션 코드에서 사용하지 않음 (`msw/config/web-env/handler.ts`)
