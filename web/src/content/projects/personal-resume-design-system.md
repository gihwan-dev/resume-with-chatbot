---
companyId: "personal-projects"
title: "Resume Design System 구축"
techStack: ["React 19", "TypeScript", "Vite", "Zustand", "Emotion", "@dnd-kit", "IndexedDB"]
dateStart: 2026-05-01
priority: 1
variants: ["frontend"]
summary: "React 19와 Vite 기반으로 A4 이력서를 블록 단위로 편집하는 개인용 디자인 시스템을 구축했습니다. 블록 registry, IndexedDB 저장·스냅샷, `@media print`와 `window.print()` 기반 PDF 출력, JSON 복사·붙여넣기와 URL 공유용 읽기 전용 프리뷰를 연결해 작성·검증·공유 흐름을 하나의 도구로 묶었습니다."
accomplishments:
  - "Header, Positioning, Core Impact, Career, Case Study, Skills 등 12개 이력서 블록을 자가 등록 registry 패턴으로 구성해 새 블록 추가가 독립적인 폴더 단위 변경으로 끝나도록 설계했습니다."
  - "A4 캔버스와 PDF 출력이 같은 디자인 토큰과 print CSS를 공유하도록 정리하고, 페이지 크기 고정·여러 페이지 출력·오버플로우 경고를 붙여 화면 미리보기와 출력 결과의 차이를 줄였습니다."
  - "Zustand와 Immer 기반 상태 모델에 IndexedDB 저장, 스냅샷, 자동 백업, 저장 상태 표시를 연결해 로컬 작성 도구에서도 데이터 손실과 편집 흐름 끊김을 줄였습니다."
  - "@dnd-kit 기반 블록 드롭·재정렬, 다중 블록 선택·이동, bulk removal을 구현해 이력서 내용을 코드 수정 없이 화면에서 재구성할 수 있게 했습니다."
  - "링크 alias·favicon 칩, 헤더 연락처 자동 감지, JSON copy/paste, 압축 URL 기반 read-only A4 preview를 추가해 이력서 버전 재사용과 공유 흐름을 확장했습니다."
---
