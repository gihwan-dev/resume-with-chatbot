**Call 시점**과 **Response 시점**은 데이터베이스 성능 측정의 시작점과 끝점이에요.

## 시점의 정의

### Call 시점 (요청 시작)

- **클라이언트 또는 애플리케이션이 데이터베이스에 요청을 보낸 순간**
- Parse Call, Execute Call, Fetch Call 각각에 대해 기록됨
- 타이머 시작 지점

### Response 시점 (응답 완료)

- **데이터베이스가 해당 작업을 완료하고 응답을 반환한 순간**
- 클라이언트가 결과를 받은 시점
- 타이머 종료 지점

## 타임라인 예시

```
[Parse Call]
    ↓ Call 시점 (10:00:00.000)
    ├─ SQL 문법 검사 (CPU 사용)
    ├─ 실행계획 생성 (CPU 사용)  
    ├─ 라이브러리 캐시 대기 (Wait)
    ↓ Response 시점 (10:00:00.015)
    Elapsed Time = 15ms
    
[Execute Call]  
    ↓ Call 시점 (10:00:00.015)
    ├─ 인덱스 스캔 (CPU + I/O)
    ├─ 디스크 읽기 대기 (Wait)
    ├─ 버퍼 캐시 접근 (CPU)
    ↓ Response 시점 (10:00:00.115)
    Elapsed Time = 100ms
    
[Fetch Call]
    ↓ Call 시점 (10:00:00.115)
    ├─ 결과 조립 (CPU)
    ├─ 네트워크 전송 (Wait)
    ↓ Response 시점 (10:00:00.125)
    Elapsed Time = 10ms
```

## 성능 공식의 의미

```
Elapsed Time = CPU Time + Wait Time
             = Response 시점 - Call 시점
```

### 분해하면:

**CPU Time**: 실제로 CPU를 사용해서 작업한 시간

- SQL 파싱
- 실행계획 생성
- 데이터 정렬, 조인 연산
- 결과 조립

**Wait Time**: CPU를 사용하지 않고 대기한 시간

- 디스크 I/O 대기
- 락(Lock) 대기
- 네트워크 대기
- 래치(Latch) 대기

## DBA 관점에서의 중요성

### 1. 병목 진단

```
Case 1: CPU Time 높음 (90% 이상)
→ SQL 튜닝 필요 (비효율적인 조인, 정렬 등)

Case 2: Wait Time 높음 (70% 이상)
→ 시스템 리소스 문제 (I/O, Lock 경합 등)
```

### 2. 각 Call별 분석

```
Parse Call
- Elapsed: 50ms
- CPU: 5ms
- Wait: 45ms → 라이브러리 캐시 경합! (Shared Pool 부족)

Execute Call  
- Elapsed: 500ms
- CPU: 50ms
- Wait: 450ms → 디스크 I/O 대기! (인덱스 필요)

Fetch Call
- Elapsed: 100ms
- CPU: 10ms  
- Wait: 90ms → 네트워크 지연! (결과 건수 제한 필요)
```

## 모니터링 UI 구현 제안

기환님이 구현하실 때 이렇게 시각화하면 DBA가 한눈에 파악할 수 있어요:

```typescript
// 타임라인 차트
┌─────────────────────────────────────┐
│ Parse    [■■    ]  15ms             │
│          CPU: 10ms | Wait: 5ms      │
├─────────────────────────────────────┤
│ Execute  [■■■■■■■■] 100ms           │
│          CPU: 20ms | Wait: 80ms ⚠️  │
├─────────────────────────────────────┤
│ Fetch    [■■      ]  10ms            │
│          CPU: 8ms  | Wait: 2ms      │
└─────────────────────────────────────┘

Total Elapsed: 125ms
Total CPU:     38ms (30.4%)
Total Wait:    87ms (69.6%) ← 병목!
```

### 시각화 포인트:

1. **이중 바 차트**: CPU Time(파란색) + Wait Time(빨간색)
2. **Wait Time이 70% 초과 시 경고 표시**
3. **각 Call 단계별 구분된 섹션**
4. **마우스 오버 시 상세 Wait Event 표시**
    - "db file sequential read: 60ms"
    - "latch free: 15ms"
    - "log file sync: 12ms"

이렇게 하면 DBA가 "Call부터 Response까지 무슨 일이 일어났는지" 즉시 파악할 수 있어요!