---
companyId: "exem"
title: "차세대 데이터베이스 성능 모니터링 제품 개발"
company: "Exem"
description: "금융·공공·제조 77개+ 엔터프라이즈 고객이 사용하는 차세대 DB 모니터링 제품에서 Widget Builder 확장 구조와 Zustand storeFactory를 설계하고, Oracle SQL 성능 분석 화면에서는 실행계획 비교, SQL 전문 탐색, 오브젝트 메타데이터 조회를 분석형 UI로 구현한 사례"
dateStart: 2025-01-01
techStack: ["React", "TypeScript", "Zustand", "Vite", "TanStack Query"]
priority: 3
storyThread:
  tldrSummary: "77개+ 엔터프라이즈 고객 대상 차세대 DB 모니터링 제품에서 Widget Builder 확장 구조와 Zustand storeFactory를 설계하고, Oracle SQL 성능 분석 영역에서는 긴 상세 페이지 정보 구조, 계층형 실행계획 비교 UI, Monaco 기반 SQL 전문 뷰어, 오브젝트 메타데이터 탐색 화면을 구현했습니다."
  keyMetrics:
    - value: "5종"
      label: "차트 타입 확장 구조 정립"
      description: "line/bar/area/scatter/table을 빌더 셸 대규모 수정 없이 확장할 수 있는 구조를 정리했습니다."
    - value: "20개"
      label: "스토어 규약 표준화"
      description: "Provider-local/global/persist를 단일 인터페이스로 묶고 생성 시점 초기화를 통일했습니다."
    - value: "4축"
      label: "분석형 SQL UI 구성"
      description: "긴 상세 페이지, 실행계획 비교, SQL 전문 뷰어, 메타데이터 탐색 화면을 연결했습니다."
  coreApproach: "공통화보다 변경 범위 격리와 정보 구조 설계를 우선해, 신규 시각화와 화면 상태는 규약 안에서 확장하고 Oracle SQL 분석 영역은 비교·탐색·연결 경험 단위로 구성했습니다."
  problemDefinition: "차세대 제품에서는 차트 타입 추가로 중앙 폼·검증 로직이 흔들리지 않아야 했고, 상세/새 탭 흐름에서 상태 수명이 예측 가능해야 했으며, Oracle SQL 분석 영역에서는 긴 상세 페이지, 계층형 실행계획 비교, SQL 전문 뷰어, 오브젝트 메타데이터 탐색을 하나의 흐름으로 읽히게 만들어야 했습니다."
  problemPoints:
    - "단일 공통 스키마에 차트 타입 요구사항이 누적돼 새 시각화 추가 때마다 빌더 셸 수정 범위가 커졌습니다."
    - "화면 상태가 전역처럼 남아 상세 진입, 새 탭 진입, 영속 상태 처리마다 초기화 규약이 흔들렸습니다."
    - "Oracle SQL 분석 영역은 긴 상세 페이지, 실행계획 비교, SQL 전문 탐색, 오브젝트 메타데이터 조회를 각각 따로 구현하는 대신 공통 파라미터와 탐색 흐름 안에서 함께 설계해야 했습니다."
  decisions:
    - title: "단일 공통 폼 대신 visualization 기준 도메인 분리"
      whyThisChoice: "확장 병목을 줄이려면 차트 타입별 차이를 공통 스키마 안에 누적하기보다 registry와 schema 경계 밖으로 분리해야 했습니다."
      alternative: "단일 공통 스키마를 유지하는 대신 visualization 기준 registry + schema 분리"
      tradeOff: "공통 스키마는 초반 이해가 쉽지만 새 시각화가 늘수록 중앙 변경 범위가 커지고, 도메인 분리는 초기 설계 비용이 들더라도 차트별 변경을 국소화할 수 있어 분리 구조를 선택했습니다."
    - title: "전역 singleton 대신 storeFactory 기반 상태 수명 정렬"
      whyThisChoice: "상태 품질 문제는 API보다 수명 설계 불일치에서 커져 화면 생명주기와 store 생성 시점을 함께 설계해야 했습니다."
      alternative: "전역 상태를 유지하는 대신 Provider-local/global/persist를 단일 인터페이스로 통합"
      tradeOff: "전역 상태는 단기 구현이 빠르지만 수동 초기화와 누수 위험이 커지고, storeFactory는 초기 전환 비용이 있어도 생성·정리 규약을 예측 가능하게 만들 수 있어 채택했습니다."
    - title: "개별 화면 나열 대신 분석형 UI 패턴 중심 구성"
      whyThisChoice: "SQL 분석 영역의 핵심은 화면 개수보다 비교·탐색·연결 경험이어서 긴 상세 페이지와 세부 인터랙션을 하나의 흐름으로 설계해야 했습니다."
      alternative: "개별 화면별 독립 설계를 유지하는 대신 공통 파라미터와 분석 흐름 기준으로 묶기"
      tradeOff: "개별 설계는 구현 분리가 쉽지만 탐색 맥락이 끊기고, 흐름 중심 구성은 초기 정보 구조 비용이 있어도 계층형 비교 UI, 텍스트 뷰어, 메타데이터 화면을 일관된 경험으로 연결할 수 있어 선택했습니다."
  implementationHighlights:
    - "visualization registry, Zod 판별 유니온, preview adapter를 연결해 차트별 폼·검증·미리보기 구성을 메인 셸 밖으로 분리했습니다."
    - "storeFactory로 Provider-local/global/persist를 단일 인터페이스로 통합하고, initialState 생성 시점 주입으로 20개 스토어의 생성 규약을 표준화했습니다."
    - "Oracle SQL 상세 분석 페이지를 공통 파라미터, anchor navigation, 새 탭 컨텍스트 기준으로 구성해 긴 분석형 화면의 탐색 흐름을 설계했습니다."
    - "계층형 실행계획 비교 UI, Monaco 기반 SQL 전문 뷰어, 오브젝트 메타데이터 탐색 화면을 구현해 비교·텍스트 읽기·메타데이터 조회를 각각 독립된 분석 도구로 풀었습니다."
  implementationGroups:
    - title: "구조 설계"
      items:
        - "하나의 Widget Builder에 line·area·bar·scatter·table 요구사항이 누적되던 병목을 줄이기 위해, `visualization` 기준 registry + Zod 판별 유니온 + preview adapter 구조를 설계해 차트별 폼·검증·미리보기 변경 범위를 메인 셸 밖으로 격리했습니다."
        - "화면 단위 상태가 전역처럼 남고 초기화 보일러플레이트가 반복되던 문제를 해결하기 위해 `storeFactory`를 설계해 Provider-local/global/persist를 단일 인터페이스로 통합하고, `initialState` 생성 시점 주입으로 20개 스토어의 생성 규약을 표준화했습니다."
    - title: "분석형 UI"
      items:
        - "Oracle SQL 상세 분석 페이지를 설계해 공통 파라미터와 anchor navigation을 기준으로 여러 차트·테이블 섹션을 연결하고, 긴 화면에서도 탐색 흐름이 끊기지 않도록 구성했습니다."
        - "계층형 실행계획 비교 UI를 구현해 Best/Worst 자동 비교, drag-and-drop 전환, 좌우 스크롤 동기화, diff highlighting, 세부 조건 drill-down을 지원했습니다."
        - "Monaco 기반 SQL 전문 뷰어를 개발해 SQL 포맷팅, 복사, 새 탭/Full Sheet 탐색, 바인드 변수 하이라이팅과 값 치환을 한 화면에서 지원했습니다."
        - "오브젝트 메타데이터 탐색 화면을 구현해 table/index/partition 정보를 병렬 조회하고, 가변 컬럼과 파생 태그 기반 UI로 구조화했습니다."
  validationImpact:
    measurementMethod: "Widget Builder, storeFactory, Oracle SQL 분석 화면 구현 코드와 Story/VRT 시나리오를 기준으로 확장 구조와 상호작용 일관성을 검증했습니다."
    metrics:
      - "차트 타입: 5종(line/bar/area/scatter/table) 확장 구조 정립"
      - "스토어 규약: 20개 생성 패턴 표준화"
      - "분석형 SQL UI: 긴 상세 페이지 + 실행계획 비교 + SQL 전문 뷰어 + 메타데이터 탐색 구성"
    operationalImpact: "신규 시각화와 상태 규약은 메인 셸 밖에서 관리할 수 있게 됐고, Oracle SQL 분석 영역에서는 계층형 비교 UI, 에디터 기반 뷰어, 동적 컬럼 메타데이터 화면을 공통 파라미터와 탐색 흐름 안에서 일관되게 제공하는 기반을 만들었습니다."
  lessonsLearned: "데이터 집약형 B2B 화면은 화면 수보다 비교·탐색·연결이라는 상호작용 패턴으로 설계해야 재사용 가능한 역량으로 남습니다.\n프론트엔드 복잡도는 상태 수명과 정보 구조를 먼저 고정할 때 예측 가능해집니다."
---

## TL;DR

77개+ 엔터프라이즈 고객 대상 차세대 DB 모니터링 제품에서 Widget Builder 확장 구조와 Zustand `storeFactory`를 설계하고, Oracle SQL 성능 분석 영역에서는 긴 상세 페이지 정보 구조, 계층형 실행계획 비교 UI, Monaco 기반 SQL 전문 뷰어, 오브젝트 메타데이터 탐색 화면을 구현했습니다.

## 문제 정의

차세대 제품에서는 차트 타입 추가로 중앙 폼·검증 로직이 흔들리지 않아야 했고, 상세/새 탭 흐름에서 상태 수명이 예측 가능해야 했으며, Oracle SQL 분석 영역에서는 긴 상세 페이지, 계층형 실행계획 비교, SQL 전문 뷰어, 오브젝트 메타데이터 탐색을 하나의 흐름으로 읽히게 만들어야 했습니다.

## 핵심 의사결정

`visualization` 기준 도메인 분리와 `storeFactory`로 변경 범위를 먼저 줄이고, SQL 분석 영역은 개별 화면명보다 공통 파라미터와 비교·탐색 패턴 중심으로 설계했습니다.

## 구현 전략

Widget Builder와 상태 생성 규약은 메인 셸 바깥으로 분리하고, SQL 분석 영역은 공통 파라미터와 anchor navigation을 축으로 실행계획 비교, SQL 전문 탐색, 오브젝트 메타데이터 조회를 이어 붙였습니다.

## 검증 및 결과

5종 차트 타입과 20개 스토어 규약을 각각 독립적으로 유지하면서, Oracle SQL 분석 영역에서는 긴 상세 페이지, 계층형 비교 UI, Monaco 기반 뷰어, 동적 컬럼 메타데이터 화면을 한 흐름 안에서 제공할 수 있는 구조를 만들었습니다.

## What I Learned

데이터 집약형 B2B 화면은 화면 개수보다 비교·탐색·연결이라는 상호작용 패턴으로 설명될 때 더 강한 구현 역량으로 남고, 프론트엔드 복잡도는 상태 수명과 정보 구조를 먼저 고정할 때 예측 가능해집니다.
