---
title: "개발 생산성 향상 및 자동화 인프라 구축"
company: "Exem"
description: "폐쇄망 환경과 10년 이상 된 레거시 시스템으로 인해 저하된 개발팀의 워크플로우를 혁신하기 위한 데브옵스 및 AI 파이프라인 구축"
dateStart: 2024-11-01
techStack: ["Nest.js", "TypeScript", "TanStack Query", "MinIO", "Docker"]
---

#### CI/CD Report Hub

**Problem** 기존에는 **GitLab Artifacts**를 다운로드해야만 테스트 결과를 확인할 수 있어 피드백 루프가 느림.

**Action** **Nest.js**와 **MinIO**를 연동하여 Zip 파일 내부 리소스를 다운로드 없이 스트리밍하는 뷰어 구축. Runner에서 생성된 리포트를 CLI 명령어 한 줄로 쉽게 업로드할 수 있도록 **Docker 기반의 CI SDK** 배포. 별도의 DB 없이 파일 시스템과 아티팩트 내 JSON 메타데이터만을 활용해 운영 복잡도를 최소화.

**Result** 리포트 접근 시간을 <mark>3분에서 5초 내외로 단축</mark>하고 즉각적인 피드백 루프 형성.

---

#### GitLab AI Ops

**Problem** 코드 리뷰 시 AI의 도움을 받기 위해 외부 툴로 컨텍스트를 복사/붙여넣기 해야 하는 **비효율 발생**.

**Action** **N8N**과 **GitLab Webhook**을 연동하여 MR 댓글에서 즉시 실행 가능한 Slash Command 시스템 구축. `/ai <질문>`(질의응답), `/mr`(MR 본문 자동 생성), `/graph`(변경 사항 시각화) 기능을 제공하여 팀원들이 리뷰 컨텍스트 내에서 AI와 협업하도록 유도.

**Result** 코드 리뷰 단계에서 문맥 전환 없이 AI 활용이 가능해져 <mark>리뷰 품질 및 속도 향상</mark>.

---

#### Legacy Tooling

**Problem** **ExtJS 기반 레거시 시스템**의 복잡한 구조로 디버깅이 어렵고, 로컬 개발 환경 세팅에 반나절 이상 소요되어 신규 입사자 온보딩 비용 과다.

**Action** **Chrome Extension**으로 `postMessage`를 사용해 실시간 ExtJS 전역 객체 상태 변경 추적, SQL 실행 실시간 추적, 컴포넌트 트리 시각화 기능을 가진 디버깅 도구 개발. **Starter Kit**으로 분산된 소스를 **Git Submodule**로 통합하고, 대화형 CLI를 통해 환경 설정을 자동화.

**Result** 신규 입사자 환경 세팅 시간을 <mark>수 시간에서 5분으로 획기적 단축</mark>.
