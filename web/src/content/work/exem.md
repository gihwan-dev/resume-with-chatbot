---
company: "주식회사엑셈"
role: "프론트엔드 개발자"
dateStart: 2024-11-01
updatedAt: 2026-02-16
isCurrent: true
summary: "성능 모니터링(APM) 솔루션의 실시간 관제·분석 대시보드 프론트엔드 코어를 개발하고 있습니다. 테이블 컴포넌트를 TanStack Table + Flexbox 선언형 구조로 재설계해 셀 렌더링 시간을 1.7배 단축하고, AI 생성 UI의 시각적 회귀 테스트 파이프라인을 구축해 수동 QA 부담을 줄였습니다."
location: "Seoul, Korea"
---

**주요 성과**

- 실시간 대시보드에서 DOM 23,000+개·이벤트 리스너 12,000+개·INP 280ms로 렌더링 병목이 발생해, TanStack Virtual 가상화·이벤트 위임·폴링 최적화(인터랙션 기반 일시정지, staleTime/gcTime 정규화)를 적용하고 렌더링 파이프라인을 재설계했습니다.
- position absolute + ResizeObserver 3-pass 알고리즘 기반 테이블의 셀 렌더링이 ~22ms/프레임으로 병목이 되어, TanStack Table + CSS Flexbox 선언형 구조로 전환하고 ResizeObserver를 제거(~340줄 삭제, 번들 ~4KB 감소)해 셀 렌더링 시간을 22ms→12ms(1.7배)로 개선했습니다.
- AI 생성 UI 산출물의 수동 시각 검증 부담을 줄이기 위해, pixelmatch(정량) + Claude 시각 분석(정성)을 조합한 시각적 회귀 테스트(Visual Regression) 파이프라인을 구축했습니다. Figma REST API와 Playwright 스크린샷을 비교하고, Storybook 통합을 통해 이슈 심각도별(Critical/Major/Minor/Nitpick) 리포트를 자동 생성합니다.
- 운영자가 장애 인지 후 제품 간 연계 분석까지 3뎁스 탐색이 필요했던 구조를 1뎁스로 단축해, 장애 원인 파악 속도를 개선했습니다.
