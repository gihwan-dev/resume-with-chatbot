## ANSI 표준
### 1. **ANSI란?**

**ANSI (American National Standards Institute):**
- 미국 국가 표준 협회
- 여기서는 **ANSI SQL 표준**을 의미
- 모든 데이터베이스가 따라야 할 SQL 규칙 정의

**목적:**
- 데이터베이스 간 호환성
- 일관된 동작 보장
- 표준화된 SQL 문법

---
## 2. **Fetch Across Commit이란?**
### **개념:**
```sql
-- 커서 열기
DECLARE CURSOR c1 IS SELECT * FROM emp;
OPEN c1;

-- 데이터 가져오기
FETCH c1 INTO ...;
FETCH c1 INTO ...;

-- 여기서 COMMIT! ⚠️
COMMIT;

-- 계속 가져오기 (fetch across commit)
FETCH c1 INTO ...;  -- 문제 발생 가능!
FETCH c1 INTO ...;

CLOSE c1;
```

**의미:**
- 커서로 데이터를 읽는 **도중에 COMMIT을 수행**
- 커밋 후에도 **계속 FETCH를 시도**

---
## 3. **ANSI 표준의 규칙**
### **ANSI SQL 표준:**
```
커서 동작 원칙:
COMMIT 실행 시 → 모든 커서 자동 닫힘 (CLOSE)
```

**이유:**
- 트랜잭션 경계를 명확히
- 읽기 일관성 보장
- 예측 가능한 동작
### **Oracle의 동작 (비표준):**

```
Oracle 기본 동작:
COMMIT 실행 → 커서는 그대로 열려있음 ✅
→ "Hold Cursor Across Commit"
```

**Oracle이 허용하는 이유:**
- 편의성 (개발자 친화적)
- 유연성
- 레거시 호환성

---
## 4. **왜 문제가 되는가?**
### **문제 시나리오:**
```sql
-- 10:00 - 커서 열기 (100만 건 조회)
OPEN c1;

-- 10:01 - 일부 fetch (1만 건)
FETCH c1 INTO ...;  -- SCN 1000 시점 기준

-- 10:02 - 중간에 커밋
COMMIT;

-- 10:03~10:30 - 계속 fetch
FETCH c1 INTO ...;  -- 여전히 SCN 1000 기준으로 읽어야 함!

-- 문제: SCN 1000의 Undo가 이미 재사용됨! ❌
-- 결과: ORA-01555 (Snapshot too old)
```

### **왜 위험한가?**
```
커서는 열린 시점의 SCN을 유지
    ↓
COMMIT 후 시간이 오래 경과
    ↓
Undo 블록이 재사용됨 (앞서 설명!)
    ↓
읽기 일관성 유지 불가
    ↓
ORA-01555 에러 발생 💥
```

---
## 5. **구체적인 문제점**
### **Problem 1: Undo 보존 문제**
```
[Timeline]
t0: 커서 오픈 (SCN=1000, Undo 필요)
t1: COMMIT
t2: 다른 트랜잭션들이 Undo 공간 사용
t3: Undo Retention 시간 경과
t4: Undo 블록 재사용
t5: 커서가 FETCH 시도 → Undo 없음! → 에러
```
### **Problem 2: 리소스 낭비**
```
장시간 열린 커서
    ↓
Undo 세그먼트 계속 점유
    ↓
다른 트랜잭션에 영향
    ↓
시스템 전체 성능 저하
```

---
## 6. **올바른 패턴**
### **ANSI 표준 준수 (권장):**
```sql
-- 패턴 1: 커서 작업 완료 후 커밋
OPEN c1;
LOOP
    FETCH c1 INTO ...;
    EXIT WHEN c1%NOTFOUND;
    -- 데이터 처리
END LOOP;
CLOSE c1;

COMMIT;  -- 모든 작업 완료 후 커밋 ✅
```

```sql
-- 패턴 2: 배치 단위 처리
LOOP
    OPEN c1;
    FOR i IN 1..1000 LOOP  -- 1000건씩
        FETCH c1 INTO ...;
        EXIT WHEN c1%NOTFOUND;
        -- 처리
    END LOOP;
    CLOSE c1;
    
    COMMIT;  -- 배치마다 커밋 ✅
END LOOP;
```

### **피해야 할 패턴:**
```sql
-- ❌ 안티패턴
OPEN c1;
LOOP
    FETCH c1 INTO ...;
    -- 처리
    
    IF mod(counter, 1000) = 0 THEN
        COMMIT;  -- fetch 도중 커밋! 위험!
    END IF;
END LOOP;
CLOSE c1;
```

---
## 7. **MFO 모니터링 관점**
### **감지해야 할 지표:**

**장시간 열린 커서 감지:**
```sql
SELECT 
    sid,
    sql_id,
    cursor_type,
    (SYSDATE - sql_exec_start) * 24 * 60 as minutes_open,
    user_name
FROM v$open_cursor oc
JOIN v$session s ON oc.sid = s.sid
WHERE (SYSDATE - sql_exec_start) * 24 * 60 > 30  -- 30분 이상
ORDER BY minutes_open DESC;
```

**Snapshot too old 관련:**
```sql
SELECT 
    begin_time,
    ssolderrcnt,  -- Snapshot too old 에러 카운트
    maxquerylen,  -- 최장 쿼리 실행 시간
    tuned_undoretention
FROM v$undostat
WHERE ssolderrcnt > 0
ORDER BY begin_time DESC;
```
### **UI 경고 표시:**
```javascript
// Alert 조건
{
  longRunningCursor: {
    warning: 1800,   // 30분 이상 열린 커서
    critical: 3600,  // 1시간 이상
    message: "장시간 열린 커서 감지. Fetch across commit 패턴 확인 필요"
  },
  
  snapshotTooOld: {
    threshold: 5,    // 에러 발생 횟수
    message: "ORA-01555 발생. Undo Retention 또는 커서 사용 패턴 점검"
  }
}
```

**대시보드 구성:**
```
[장시간 실행 커서 Top 10]
┌──────┬──────────┬─────────────┬──────────────┐
│ SID  │ SQL_ID   │ Open Time   │ User         │
├──────┼──────────┼─────────────┼──────────────┤
│ 1234 │ abc123   │ 45분 ⚠️     │ batch_user   │
│ 5678 │ def456   │ 32분 ⚠️     │ report_user  │
└──────┴──────────┴─────────────┴──────────────┘

권장: Fetch across commit 패턴 개선 필요
```

---
## 8. **다른 DB와의 차이**
### **DB별 동작:**

|DB|COMMIT 시 커서 동작|ANSI 준수|
|---|---|---|
|**Oracle**|열린 상태 유지 (기본)|❌ 비표준|
|**PostgreSQL**|자동 닫힘|✅ 표준 준수|
|**MySQL**|자동 닫힘|✅ 표준 준수|
|**DB2**|설정에 따라 다름|⚠️ 선택 가능|

**Oracle에서 표준 동작 강제:**
```sql
-- 커서가 자동으로 닫히도록 설정
ALTER SESSION SET cursor_sharing = EXACT;
-- 또는 애플리케이션에서 명시적으로 관리
```

---
## 요약
**ANSI 표준 in Fetch Across Commit:**
```
ANSI SQL 표준: 
COMMIT → 모든 커서 자동 닫힘

Oracle 기본 동작:
COMMIT → 커서 유지 (비표준)

문제:
장시간 커서 유지 → Undo 재사용 → ORA-01555
```

**권장 패턴:**
```
1. 커서 작업 완료 후 커밋
2. 배치 단위로 커서 열고 닫기
3. COMMIT 전에 CLOSE 명시적 호출
```

**모니터링 포인트:**
- 장시간 열린 커서 감지
- ORA-01555 에러 추적
- Undo Retention vs 쿼리 실행 시간 비교