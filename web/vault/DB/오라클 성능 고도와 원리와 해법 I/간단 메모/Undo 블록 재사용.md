## Undo 블록 재사용 개념
### 1. **기본 원리**

**Undo Tablespace는 순환 구조:**
```
[Block 1] → [Block 2] → [Block 3] → ... → [Block N]
   ↑                                          ↓
   └──────────────← 다시 처음으로 ←─────────────┘
```

**핵심:**
- Undo Tablespace는 **무한정 커지지 않음**
- 고정된 공간을 **빙글빙글 돌면서 재사용**
- 오래된 Undo 데이터를 **새로운 Undo 데이터로 덮어씀**

---
## 2. **재사용 가능 조건**

Undo 블록을 덮어써도 되는 경우:
```
✅ 재사용 가능한 Undo:
1. 트랜잭션이 이미 커밋됨
2. Undo Retention 시간이 지남
3. 어떤 쿼리도 이 Undo를 필요로 하지 않음

❌ 재사용 불가능한 Undo:
1. 아직 커밋되지 않은 Active 트랜잭션
2. 장시간 실행 중인 쿼리가 읽기 일관성을 위해 필요
3. Flashback 쿼리가 사용 중
```

---
## 3. **동작 예시**
### **정상 시나리오:**
```
시간 순서:
10:00 - 트랜잭션 A 실행 → Undo Block 1에 저장
10:01 - 트랜잭션 A 커밋
10:15 - Undo Retention(15분) 경과
10:16 - 새 트랜잭션 B → Block 1 재사용 ✅
```

### **문제 시나리오 (ORA-01555):**
```
10:00 - 트랜잭션 A 실행 → Undo Block 1에 저장
10:01 - 트랜잭션 A 커밋
10:02 - 장시간 쿼리 시작 (이 Undo 필요)
10:03 - Undo 공간 부족 → Block 1 재사용 강제 ❌
10:10 - 쿼리가 Block 1 필요 → "Snapshot too old" 에러!
```

---
## 4. **Undo Retention**

**보존 기간 설정:**
```sql
-- Undo 최소 보존 시간 (초)
ALTER SYSTEM SET undo_retention = 900;  -- 15분
```

**의미:**
- 커밋된 Undo도 이 시간 동안은 보존 시도
- 공간이 충분하면 더 오래 보존 가능
- 공간 부족 시 강제로 재사용 → ORA-01555 위험

---
## 5. **MFO 모니터링 관점**
### **핵심 지표**

**Undo Tablespace 사용률:**
```javascript
{
  total: "10GB",
  used: "7GB",
  free: "3GB",
  usagePercent: 70  // 85% 이상 시 Alert
}
```

**Undo 재사용 관련 메트릭:**
```sql
-- Active 트랜잭션 수
SELECT count(*) FROM v$transaction;

-- Undo Retention 준수 여부
SELECT tuned_undoretention FROM v$undostat;

-- Snapshot too old 에러 발생 횟수
SELECT ssolderrcnt FROM v$undostat;
```

### **UI 표시 요소**

**실시간 대시보드:**
```
[Undo Tablespace 사용률]  ████████░░ 80%

[Active Transactions]     15개
[Longest Query Duration]  45분 ⚠️
[Undo Retention]          900초 (15분)
[Snapshot Too Old Count]  3 ⚠️
```

**Alert 조건:**
```javascript
{
  undoUsage: {
    warning: 85,   // 85% 이상
    critical: 95   // 95% 이상
  },
  longQuery: {
    warning: 1800,  // 30분 이상 쿼리
    critical: 3600  // 1시간 이상
  }
}
```

---

## 6. **실무 문제 해결**
### **Case: ORA-01555 빈번 발생**

**증상:**
```
에러: ORA-01555: snapshot too old
원인: Undo 블록이 너무 빨리 재사용됨
```

**해결 방안:**
```sql
-- 1. Undo Retention 증가
ALTER SYSTEM SET undo_retention = 3600;  -- 1시간

-- 2. Undo Tablespace 확장
ALTER DATABASE DATAFILE '/path/to/undotbs01.dbf' 
  RESIZE 20G;

-- 3. Autoextend 활성화
ALTER DATABASE DATAFILE '/path/to/undotbs01.dbf' 
  AUTOEXTEND ON MAXSIZE 50G;
```

---

## 요약

**Undo 블록 재사용 = 순환 큐(Circular Queue)**
```
커밋된 Undo → 보존 기간 경과 → 덮어쓰기 가능
                ↓
         새 트랜잭션이 재사용
```

**핵심:**
- 고정된 공간을 계속 돌려씀
- 필요없는 Undo는 덮어써도 OK
- 필요한 Undo를 덮어쓰면 → ORA-01555 에러