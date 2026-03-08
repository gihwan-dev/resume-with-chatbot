## **OPS (Oracle Parallel Server)**

**정의:**
- RAC의 **이전 버전** (Oracle 8i 이전)
- RAC의 전신이지만 성능이 훨씬 떨어졌음

**RAC와의 차이:**

| OPS             | RAC                   |
| --------------- | --------------------- |
| 디스크 기반 락 관리     | Cache Fusion (메모리 기반) |
| Ping/Pong 문제 심각 | 최소화됨                  |
| 느린 블록 전송        | 고속 Interconnect       |

> 💡 현재는 거의 사용 안 함. 문서에서 OPS 언급은 "레거시 환경" 맥락