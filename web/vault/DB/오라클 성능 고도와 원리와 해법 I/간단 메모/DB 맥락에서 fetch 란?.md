## Fetch란?
### 1. **기본 개념**

**Fetch = 데이터를 "가져오다"**
```
데이터베이스 (디스크/버퍼 캐시)
         ↓
      커서 (Cursor)
         ↓
    FETCH 명령 ← 한 줄씩 또는 여러 줄씩 가져오기
         ↓
   애플리케이션 메모리
```

**비유:**
```
식당 뷔페를 생각해보세요:
- SELECT = 어떤 음식을 먹을지 결정 (쿼리 실행)
- Cursor = 접시 (결과 집합을 담는 도구)
- FETCH = 접시에서 한 입씩 떠먹기 (한 행씩 가져오기)
```

---
## 2. **Cursor와 Fetch의 관계**
### **전체 프로세스:**
```sql
-- 1단계: 커서 선언 (레시피 정의)
DECLARE 
    CURSOR emp_cursor IS 
    SELECT empno, ename, sal FROM emp;
    
-- 2단계: 커서 열기 (쿼리 실행)
OPEN emp_cursor;
-- → 결과 집합 준비 완료 (100건이라고 가정)

-- 3단계: FETCH (한 행씩 가져오기)
FETCH emp_cursor INTO v_empno, v_ename, v_sal;  
-- → 1번째 행 가져옴

FETCH emp_cursor INTO v_empno, v_ename, v_sal;  
-- → 2번째 행 가져옴

FETCH emp_cursor INTO v_empno, v_ename, v_sal;  
-- → 3번째 행 가져옴
-- ... 100번 반복

-- 4단계: 커서 닫기
CLOSE emp_cursor;
```

---
## 3. **Fetch의 동작 원리**
### **메모리 관점:**
```
[데이터베이스 서버]
┌──────────────────────┐
│ 버퍼 캐시            │
│  [Row 1] [Row 2]     │ ← SELECT 실행 결과
│  [Row 3] [Row 4]     │
│  ...                 │
└──────────────────────┘
         ↓ FETCH
┌──────────────────────┐
│ 세션 메모리          │
│  Cursor Area         │
│   → 현재 위치: Row 3 │ ← 포인터
└──────────────────────┘
         ↓ FETCH
┌──────────────────────┐
│ 애플리케이션 메모리   │
│  v_empno = 100       │ ← 가져온 데이터
│  v_ename = 'KING'    │
│  v_sal = 5000        │
└──────────────────────┘
```
### **포인터 이동:**
```
결과 집합: [Row1] [Row2] [Row3] [Row4] [Row5]
            ↑
          포인터 (현재 위치)

FETCH 실행 → Row1 가져옴
             [Row1] [Row2] [Row3] [Row4] [Row5]
                     ↑
                   포인터 이동

FETCH 실행 → Row2 가져옴
             [Row1] [Row2] [Row3] [Row4] [Row5]
                             ↑
                           포인터 이동
```

---
## 4. **실제 코드 예시**
### **PL/SQL:**
```sql
DECLARE
    CURSOR emp_cursor IS 
        SELECT empno, ename, sal FROM emp;
    
    v_empno emp.empno%TYPE;
    v_ename emp.ename%TYPE;
    v_sal   emp.sal%TYPE;
BEGIN
    OPEN emp_cursor;
    
    LOOP
        -- FETCH: 한 행씩 가져오기
        FETCH emp_cursor INTO v_empno, v_ename, v_sal;
        
        -- 더 이상 가져올 행이 없으면 종료
        EXIT WHEN emp_cursor%NOTFOUND;
        
        -- 가져온 데이터 처리
        DBMS_OUTPUT.PUT_LINE(v_ename || ': ' || v_sal);
    END LOOP;
    
    CLOSE emp_cursor;
END;
```
### **자바 JDBC:**
```java
// SELECT 실행 (커서 자동 생성)
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery("SELECT empno, ename, sal FROM emp");

// FETCH: next()가 내부적으로 FETCH 수행
while (rs.next()) {  // ← 이게 FETCH!
    int empno = rs.getInt("empno");
    String ename = rs.getString("ename");
    int sal = rs.getInt("sal");
    
    System.out.println(ename + ": " + sal);
}

rs.close();  // 커서 닫기
```

**중요:**
- `rs.next()`를 호출할 때마다 DB에서 한 행을 **FETCH**
- 결과 집합 전체가 한 번에 오는 게 아님!

---
## 5. **Fetch 방식의 종류**
### **Single Row Fetch:**
```sql
-- 한 번에 1개 행
FETCH emp_cursor INTO v_empno, v_ename;
```
### **Array Fetch (Bulk Fetch):**
```sql
-- 한 번에 100개 행 (성능 향상)
FETCH emp_cursor BULK COLLECT INTO 
    emp_array LIMIT 100;
```

**성능 비교:**
```
Single Row Fetch:
100,000건 조회 → 100,000번 왕복 🐌

Array Fetch (100건씩):
100,000건 조회 → 1,000번 왕복 🚀
```

---
## 6. **왜 Fetch를 사용하는가?**
### **이유 1: 메모리 효율**
```
나쁜 예 (전체 로드):
SELECT * FROM big_table;  -- 1억 건
→ 메모리 부족! 💥

좋은 예 (Fetch):
OPEN cursor;
LOOP
    FETCH cursor;  -- 1건씩 또는 100건씩
    처리...
END LOOP;
→ 일정한 메모리 사용 ✅
```
### **이유 2: 네트워크 효율**
```
클라이언트 ←────네트워크────→ DB 서버

방법 1: 전체 전송
100만 건 전부 전송 → 네트워크 폭주 ❌

방법 2: Fetch로 나눠서
100건 fetch → 처리 → 100건 fetch → 처리
→ 안정적 ✅
```
### **이유 3: 조기 종료 가능**
```sql
LOOP
    FETCH emp_cursor INTO v_empno, v_sal;
    EXIT WHEN emp_cursor%NOTFOUND;
    
    -- 조건 만족 시 중단
    IF v_sal > 10000 THEN
        EXIT;  -- 나머지는 fetch 안 함! 효율적
    END IF;
END LOOP;
```

---
## 7. **MFO 모니터링 관점**
### **Fetch 관련 성능 지표:**

**통계 정보:**
```sql
-- 세션별 Fetch 통계
SELECT 
    sid,
    sql_id,
    fetches,                    -- 총 fetch 횟수
    rows_processed,             -- 처리된 행 수
    rows_processed / fetches    -- fetch당 행 수
FROM v$sql
WHERE fetches > 0;
```

**분석:**
```
fetch당 행 수 = 1  → Single Row Fetch (느림) ⚠️
fetch당 행 수 = 100+ → Array Fetch (빠름) ✅
```
### **UI 표시 요소:**

**SQL 상세 정보:**
```javascript
{
  sqlId: "abc123xyz",
  query: "SELECT * FROM orders...",
  executions: 1000,
  fetches: 100000,        // ← 총 fetch 횟수
  rowsProcessed: 100000,
  
  // 계산된 지표
  fetchesPerExec: 100,    // 실행당 fetch 수
  rowsPerFetch: 1,        // ⚠️ fetch당 1행 = 비효율
  
  recommendation: "Array Fetch 사용 권장 (100-1000행)"
}
```

**대시보드:**
```
[비효율적 Fetch 패턴 Top 10]
┌────────────┬──────────┬──────────────┬──────────┐
│ SQL_ID     │ Fetches  │ Rows/Fetch   │ 권장     │
├────────────┼──────────┼──────────────┼──────────┤
│ abc123     │ 1,000,000│ 1 ⚠️         │ 튜닝필요 │
│ def456     │ 500,000  │ 1 ⚠️         │ 튜닝필요 │
│ ghi789     │ 100,000  │ 100 ✅       │ 양호     │
└────────────┴──────────┴──────────────┴──────────┘
```

---
## 8. **Fetch vs SELECT 차이**
### **혼동하기 쉬운 개념:**
```sql
-- SELECT: 쿼리 실행 (결과 집합 준비)
SELECT * FROM emp WHERE deptno = 10;
-- → 버퍼 캐시에 데이터 준비
-- → 아직 애플리케이션으로 전송 안 됨!

-- FETCH: 실제 데이터 가져오기
FETCH cursor INTO variables;
-- → 애플리케이션 메모리로 데이터 복사
```

**타임라인:**
```
t1: SELECT 실행 (0.1초)
    → 쿼리 파싱, 실행 계획, 데이터 읽기
    
t2: FETCH 1 (0.001초)
    → 1번째 행 전송
    
t3: FETCH 2 (0.001초)
    → 2번째 행 전송
    
... (반복)

총 시간 = SELECT 시간 + (FETCH 시간 × N)
```

---
## 9. **Fetch Across Commit 다시 이해**

이제 앞의 개념을 다시 보면:
```sql
OPEN cursor;           -- 결과 집합 준비 (SCN 고정)

FETCH cursor;          -- 1~1000번째 행 가져옴
FETCH cursor;          -- 1001~2000번째 행 가져옴

COMMIT;                -- ⚠️ 커밋 (여기가 문제!)

FETCH cursor;          -- 2001~3000번째 행 가져오려고 시도
                       -- → Undo 필요한데 재사용됨
                       -- → ORA-01555 가능!
CLOSE cursor;
```

**문제의 핵심:**
- FETCH는 **커서가 열린 시점의 SCN 기준**으로 데이터를 가져옴
- 중간에 COMMIT → 시간 경과 → Undo 재사용
- 나중에 FETCH → 과거 SCN 데이터 복원 불가

---
## 요약
**Fetch = 결과 집합에서 행을 가져오는 작업**
```
SELECT  → 쿼리 실행 (데이터 준비)
OPEN    → 커서 열기 (포인터 준비)
FETCH   → 한 행씩 가져오기 (포인터 이동)
CLOSE   → 커서 닫기 (리소스 해제)
```

**핵심:**
- 전체를 한 번에 가져오는 게 아님
- 필요한 만큼만 순차적으로 가져옴
- 메모리/네트워크 효율적
- Array Fetch로 성능 최적화 가능

**모니터링 포인트:**
- Fetch 횟수 vs 처리 행 수
- Single row fetch 패턴 감지
- 장시간 fetch (fetch across commit 위험)