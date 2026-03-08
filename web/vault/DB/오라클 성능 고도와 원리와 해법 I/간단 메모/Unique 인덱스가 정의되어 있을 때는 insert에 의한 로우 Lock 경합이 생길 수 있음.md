Unique 인덱스가 있을 때 insert 시 Lock 경합이 발생하는 이유는 바로 **동시성 제어를 통해 Unique 제약조건을 보장하기 위해서**입니다.

## 구체적인 시나리오

```sql
-- 테이블: USERS (ID가 Unique 인덱스)
-- 시나리오: 두 트랜잭션이 동시에 같은 ID 값으로 insert 시도

-- 트랜잭션 T1 (10:00:00.100)
INSERT INTO USERS VALUES (100, 'Alice');
-- 아직 커밋 안함

-- 트랜잭션 T2 (10:00:00.150)  
INSERT INTO USERS VALUES (100, 'Bob');
-- ⏸️ 여기서 대기 발생! (Lock 경합)
```

## 왜 Lock이 필요한가?

말씀하신 것처럼, **Unique 제약조건의 무결성을 보장**하기 위해서입니다:

1. **Lock이 없다면?**
    
    - T1과 T2 모두 같은 키 값(100)으로 insert 성공
    - 둘 다 커밋되면 → Unique 제약조건 위반!
    - 데이터 무결성 깨짐
2. **Lock이 있으면?**
    
    - T1이 insert 시 해당 인덱스 키에 대한 Lock 획득
    - T2는 T1이 끝날 때까지 **대기** (이게 바로 Lock 경합)
    - T1 커밋 → T2는 Unique 제약조건 위반 에러
    - T1 롤백 → T2는 insert 진행 가능

## 일반 인덱스와의 차이

```plaintext
일반 인덱스:
  트랜잭션들이 같은 값을 동시에 insert → ✅ 문제없음 (중복 허용)

Unique 인덱스:
  트랜잭션들이 같은 값을 동시에 insert → ⚠️ Lock 경합 발생 (중복 불가)
```

## 모니터링 관점에서의 중요성

이런 Lock 경합을 모니터링 UI에서 표현할 때 고려할 점:

**1. Lock Wait 이벤트 추적**

```javascript
// Unique constraint 관련 Lock Wait 필터링
const uniqueIndexLockWaits = lockEvents.filter(event => 
  event.wait_event === 'enq: TX - row lock contention' &&
  event.object_type === 'INDEX' &&
  event.is_unique === true
);
```

**2. 시각화 시 표시할 정보**

- 어떤 Unique 인덱스에서 경합이 발생했는지
- 대기 중인 트랜잭션 수
- 평균 대기 시간
- 어떤 키 값에서 충돌이 잦은지 (핫스팟 분석)

**3. 성능 영향**

- 배치 작업에서 Unique 제약조건이 있는 테이블에 대량 insert 시 특히 주의
- 이런 경합이 많다면 → 응용 프로그램 로직 개선 필요 (중복 체크 선행 등)

**4. Alert 설정 기준**

```javascript
// Unique 인덱스 Lock Wait이 특정 임계값 초과 시 알림
if (uniqueLockWaitTime > threshold && uniqueLockWaitCount > 10) {
  alertDBA({
    severity: 'WARNING',
    message: `Unique constraint lock contention detected on ${indexName}`,
    recommendation: 'Check for duplicate key insertion patterns'
  });
}
```

이런 정보를 대시보드에서 명확히 보여주면 DBA가 애플리케이션 측 문제(중복 키 insert 시도 패턴)를 빠르게 파악할 수 있겠죠!