
**WebEnv**
이 문서는 `svc/www/MAXGAUGE` 기준으로 webEnv에 저장되는 값들을 요약합니다. webEnv는 UI 설정/레이아웃/사용자 옵션 등을 저장하며 `common/WebEnv.js`에서 관리됩니다.

**Overview**
`common/WebEnv.js`에서 `window.EXEM.webEnv`를 생성하고, 저장된 값을 로딩해 캐시합니다. `common/WebEnv.js`의 `defaultWebEnv`에 정의된 기본 키는 누락 시 자동 삽입됩니다.

**Structure**

| Field | Scope | Stored Object |
| --- | --- | --- |
| `EXEM.webEnv.common` | 모든 유저, 모든 인스턴스 공통 | `{ value, category, isUser, isJSON }` |
| `EXEM.webEnv.user` | 특정 유저 공통(인스턴스 무관) | `{ value, category, isUser, isJSON }` |
| `EXEM.webEnv.instance` | 특정 인스턴스별 | `{ [instanceId]: { [key]: { value, category, isUser, isJSON } } }` |
| `EXEM.webEnv.map` | 키 메타 정보 | `{ [key]: { type, count, instanceId? } }` |

**Categories**

| Name | Value | Meaning |
| --- | --- | --- |
| `COMMON` | 0 | 모든 유저/인스턴스 공통 |
| `USER` | 1 | 유저 공통 |
| `INSTANCE` | 2 | 인스턴스 공통 |
| `RTM` | 3 | RTM 전용(유저 또는 인스턴스) |
| `PA` | 4 | PA 전용(유저 또는 인스턴스) |
| `CONFIG` | 5 | 설정 화면 메뉴/정책 |
| `IMAGE` | 6 | 이미지 저장용 |

**Default Keys - Common**
`common/WebEnv.js`의 `defaultWebEnv.common` 기준입니다.

| Key                              | Category | Value/Usage                           |
| -------------------------------- | -------- | ------------------------------------- |
| `CONFIG_SUPER_ADMIN_MENU`        | `CONFIG` | 슈퍼 관리자 설정 메뉴 JSON                     |
| `CONFIG_ADMIN_MENU`              | `CONFIG` | 관리자 설정 메뉴 JSON                        |
| `CONFIG_COMMON_MENU`             | `CONFIG` | 일반 사용자 설정 메뉴 JSON                     |
| `CONFIG_DAEMON_UPDATE_POLICY`    | `CONFIG` | 데몬 업데이트 정책 JSON (기본 `{ use: false }`) |
| `VERSION`                        | `COMMON` | 빌드 번호 (`window.BuildNumber`)          |
| `JSON_DEFAULT_WHITE_STYLE_en`    | `COMMON` | 기본 스타일 JSON (White, EN)               |
| `JSON_DEFAULT_GRAY_STYLE_en`     | `COMMON` | 기본 스타일 JSON (Gray, EN)                |
| `JSON_DEFAULT_BLACK_STYLE_en`    | `COMMON` | 기본 스타일 JSON (Black, EN)               |
| `JSON_DEFAULT_WHITE_STYLE_ko`    | `COMMON` | 기본 스타일 JSON (White, KO)               |
| `JSON_DEFAULT_GRAY_STYLE_ko`     | `COMMON` | 기본 스타일 JSON (Gray, KO)                |
| `JSON_DEFAULT_BLACK_STYLE_ko`    | `COMMON` | 기본 스타일 JSON (Black, KO)               |
| `JSON_DEFAULT_WHITE_STYLE_ja`    | `COMMON` | 기본 스타일 JSON (White, JA)               |
| `JSON_DEFAULT_GRAY_STYLE_ja`     | `COMMON` | 기본 스타일 JSON (Gray, JA)                |
| `JSON_DEFAULT_BLACK_STYLE_ja`    | `COMMON` | 기본 스타일 JSON (Black, JA)               |
| `JSON_DEFAULT_WHITE_STYLE_zh-CN` | `COMMON` | 기본 스타일 JSON (White, ZH-CN)            |
| `JSON_DEFAULT_GRAY_STYLE_zh-CN`  | `COMMON` | 기본 스타일 JSON (Gray, ZH-CN)             |
| `JSON_DEFAULT_BLACK_STYLE_zh-CN` | `COMMON` | 기본 스타일 JSON (Black, ZH-CN)            |
| `RTM_TOPSTAT`                    | `COMMON` | RTM Top Stat 기본 목록(파이프 구분 문자열)        |
| `JSON_ALERT_TIME_RANGE`          | `COMMON` | 알람 시간대 설정 JSON                        |

**Default Keys - User**
`common/WebEnv.js`의 `defaultWebEnv.user` 기준입니다.

| Key | Category | Value/Usage |
| --- | --- | --- |
| `LANGUAGE` | `USER` | UI 언어 코드 |
| `THEME` | `USER` | UI 테마 이름 |
| `JSON_AUTO_SAVE_FRAME_OPTION_INFO` | `USER` | 프레임 옵션 자동 저장 설정 JSON |
| `JSON_RTM_ALARM_POPUP_OPTION` | `USER` | 알람 팝업 옵션 JSON |
| `JSON_RTM_NAVIGATION_POPUP_OPTION` | `USER` | 네비게이션 팝업 옵션 JSON |
| `JSON_RTM_DOCKING_POPUP_OPTION` | `USER` | 도킹 팝업 옵션 JSON |
| `JSON_DEFAULT_MY_WHITE_STYLE_en` | `USER` | 사용자 스타일 JSON (White, EN) |
| `JSON_DEFAULT_MY_GRAY_STYLE_en` | `USER` | 사용자 스타일 JSON (Gray, EN) |
| `JSON_DEFAULT_MY_BLACK_STYLE_en` | `USER` | 사용자 스타일 JSON (Black, EN) |
| `JSON_DEFAULT_MY_WHITE_STYLE_ko` | `USER` | 사용자 스타일 JSON (White, KO) |
| `JSON_DEFAULT_MY_GRAY_STYLE_ko` | `USER` | 사용자 스타일 JSON (Gray, KO) |
| `JSON_DEFAULT_MY_BLACK_STYLE_ko` | `USER` | 사용자 스타일 JSON (Black, KO) |
| `JSON_DEFAULT_MY_WHITE_STYLE_ja` | `USER` | 사용자 스타일 JSON (White, JA) |
| `JSON_DEFAULT_MY_GRAY_STYLE_ja` | `USER` | 사용자 스타일 JSON (Gray, JA) |
| `JSON_DEFAULT_MY_BLACK_STYLE_ja` | `USER` | 사용자 스타일 JSON (Black, JA) |
| `JSON_DEFAULT_MY_WHITE_STYLE_zh-CN` | `USER` | 사용자 스타일 JSON (White, ZH-CN) |
| `JSON_DEFAULT_MY_GRAY_STYLE_zh-CN` | `USER` | 사용자 스타일 JSON (Gray, ZH-CN) |
| `JSON_DEFAULT_MY_BLACK_STYLE_zh-CN` | `USER` | 사용자 스타일 JSON (Black, ZH-CN) |
| `JSON_RTM_VIEW.TRENDVIEW_LAYER_0` | `RTM` | TrendView 기본 레이아웃 JSON |
| `JSON_RTM_VIEW.TRENDVIEW_LAYER_1` | `RTM` | TrendView 레이아웃 JSON (대안) |
| `RTM_VIEW.TRENDVIEW_LAYER_INDEX` | `RTM` | TrendView 레이아웃 선택 인덱스 |
| `JSON_RTM_VIEW.RACVIEW_LAYER_0` | `RTM` | RACView 기본 레이아웃 JSON |
| `RTM_VIEW.RACVIEW_LAYER_INDEX` | `RTM` | RACView 레이아웃 선택 인덱스 |
| `JSON_RTM_VIEW.SINGLEVIEW_LAYER_0` | `RTM` | SingleView 기본 레이아웃 JSON |
| `RTM_VIEW.SINGLEVIEW_LAYER_INDEX` | `RTM` | SingleView 레이아웃 선택 인덱스 |
| `RTM_VIEW_LAST_TAB` | `RTM` | 마지막 선택 RTM 뷰 클래스 |
| `JSON_RTM_VIEW.EXAVIEW_LAYER_0` | `RTM` | ExaView 레이아웃 JSON (quarter rack) |
| `JSON_RTM_VIEW.EXAVIEW_LAYER_1` | `RTM` | ExaView 레이아웃 JSON (full rack container) |
| `JSON_RTM_VIEW.EXAVIEW_LAYER_3` | `RTM` | ExaView 레이아웃 JSON (full rack detail) |
| `RTM_VIEW.EXAVIEW_LAYER_INDEX` | `RTM` | ExaView 레이아웃 선택 인덱스 |
| `JSON_RTM_FRAME.TRENDCHARTFRAME_DEFAULT_OPTOIN` | `RTM` | TrendChart 기본 옵션 JSON |

**Default Keys - Instance**
`common/WebEnv.js`의 `defaultWebEnv.instance` 기준입니다.

| Key                              | Category   | Value/Usage          |
| -------------------------------- | ---------- | -------------------- |
| `ACTIVE_SESSION_CNT`             | `INSTANCE` | 인스턴스 레벨 숫자 옵션(기본 30) |
| `CELL_SERVER_ACTIVE_SESSION_CNT` | `INSTANCE` | 인스턴스 레벨 숫자 옵션(기본 30) |
| `CACHE_PIN_LOCK`                 | `INSTANCE` | 인스턴스 레벨 숫자 옵션(기본 0)  |

**Additional Keys (Feature-Specific)**
기본 값 외에 기능별로 저장되는 키들입니다.

| Key | Category | Usage / Source |
| --- | --- | --- |
| `SOUND` | `USER` | 알람 사운드 설정 (`config/view/config_myoptions.js`, `common/RTMDataManager.js`) |
| `JSON_RTM_ALARM_PUSH_OPTION` | `USER` | 알람 푸시 옵션 (`config/view/config_myoptions.js`) |
| `JSON_RTM_REFRESH_LOCKTREE` | `USER` | Lock Tree 갱신 옵션 (`config/view/config_myoptions.js`) |
| `RTM_JUMP_PA_VIEW` | `USER` | RTM에서 PA로 점프 옵션 (`config/view/config_myoptions.js`) |
| `RTM_CLICK_CHANGE_VIEW` | `USER` | 클릭 시 뷰 변경 옵션 (`config/view/config_myoptions.js`) |
| `PA_MAINTAIN_SEARCH_OPTION` | `USER` | PA 검색 유지 옵션 (`config/view/config_myoptions.js`) |
| `RTM_ALERT_SERVER_OPTION` | `USER` | 서버 알람 옵션 (`config/view/config_myoptions.js`) |
| `JSON_RTM_VIEW.TASK_LABEL` | `USER` | 작업 라벨 설정 (`config/view/config_myoptions.js`) |
| `JSON_USER_COLORS` | `USER` | 사용자 컬러 팔레트 (`RTM/Frame/ChartConfig.js`) |
| `JSON_USER_RATIO_LIST` | `RTM` | 사용자 Ratio 리스트 (`common/Stat.js`) |
| `JSON_RTM_FRAME.TRENDCHARTFRAME_OPTOIN` | `RTM` | TrendChart 인스턴스별 옵션 (`common/RTMDataManager.js`, `RTM/Frame/ChartConfig.js`) |
| `JSON_RTM_DEFAULT_TREND_CHART` | `RTM` | TrendChart 저장 옵션 (`common/RTMDataManager.js`) |
| `RTM_GROUPNAME_TYPE` | `RTM` | 그룹명 타입 설정 (`RTM/Frame/GroupNavStatus.js`) |
| `JSON_RTM_CONNECTION_LIST` | `RTM` | 인스턴스 트리 상태 저장 (`RTM/Frame/DatabaseList.js`) |
| `JSON_SCRIPT_MANAGER_RTM` | `RTM` | Script Manager 개인 스크립트 (`RTM/tools/ScriptManagerNew.js`) |
| `JSON_SCRIPT_MANAGER_RTM_COMMON` | `RTM` | Script Manager 공용 스크립트 (`RTM/tools/ScriptManagerNew.js`) |
| `RTM_STAT_FAV_LIST` | `RTM` | RTM 통계 즐겨찾기 (`Exem/EditStatFavList.js`) |
| `PA_STAT_FAV_LIST` | `PA` | PA 통계 즐겨찾기 (`Exem/EditStatFavListPA.js`) |
| `JSON_PA_DAILY_ENVIR` | `PA` | PA 일간 트렌드 설정 (`PA/view/src/LongTermTrendSrc.js`) |
| `JSON_PA_COMPARISON_TREND_INFO` | `PA` | PA 비교 트렌드 설정 (`PA/view/src/ComparisonTrendOneMinSrc.js`, `PA/view/src/ComparisonTrendTenMinSrc.js`) |
| `JSON_PA_EXA_TEN_MIN_TREND` | `PA` | Exa 10분 트렌드 설정 (`PA/view/racExa/performanceTrend/exa/tenMin/index.js`) |
| `USE_DOMAIN_INDEX` | `COMMON` | SQL List 도메인 인덱스 사용 여부 (`PA/view/src/SQLListSrc.js`) |
| `ACCESS_PRIVILEGE_INFO` | `COMMON` | 사용자별 RTM/PA 접근 권한 (`Exem/config/CommonUserFrame.js`, `common/DataModule.js`) |

**Dynamic Key Patterns**
고정 키 외에 런타임에 생성되는 패턴입니다.

| Pattern | Category | Description | Source |
| --- | --- | --- | --- |
| `JSON_RTM_<ClassName>_LAYER_<index>` | `RTM` | 도킹 뷰 레이아웃 JSON | `Exem/DockContainer.js` |
| `RTM_<ClassName>_LAYER_INDEX` | `RTM` | 도킹 뷰 레이아웃 선택 인덱스 | `Exem/DockContainer.js` |
| `RTM_IMG_<VIEWCLASS>_<index>` | `IMAGE` | 저장 이미지 데이터 | `RTM/view/BaseView.js` |
| `RTM_SAVE_TITLE_<VIEWCLASS>_<index>` | `IMAGE` | 저장 이미지 제목 | `RTM/view/BaseView.js` |
| `<gridName>` | `RTM` or `PA` | 그리드 컬럼 레이아웃 | `Exem/BaseGrid.js` |
| `<gridName>_FILTER` | `RTM` or `PA` | 그리드 필터 상태 | `Exem/BaseGrid.js` |

**Notes**
`JSON_` 접두사는 JSON 문자열을 의미하며, `common/WebEnv.js`에서 파싱되어 `isJSON: true`로 저장됩니다. `RTM`/`PA` 카테고리는 `db_id`가 있으면 인스턴스 범위로, 없으면 유저 범위로 저장됩니다.
