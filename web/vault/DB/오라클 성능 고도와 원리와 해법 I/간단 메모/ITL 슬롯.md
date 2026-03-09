## ITL (Interested Transaction List) 슬롯

ITL은 **Oracle 데이터 블록 헤더에 있는 트랜잭션 슬롯**으로, 해당 블록의 로우를 수정하고 있는 트랜잭션들의 정보를 저장하는 공간입니다.

### 블록 구조에서의 위치

```
┌───────────────────────────────────┐
│ Block Header                      │
│  - Block Type, SCN 등             │
├───────────────────────────────────┤
│ ITL Slots (Transaction Entries)   │  ← 여기!
│  - ITL #1: TX ID, Lock Byte, SCN  │
│  - ITL #2: TX ID, Lock Byte, SCN  │
│  - ITL #3: ...                    │
├───────────────────────────────────┤
│ Row Directory                     │
├───────────────────────────────────┤
│ Free Space                        │
├───────────────────────────────────┤
│ Row Data                          │
└───────────────────────────────────┘
```

### ITL 슬롯의 역할

**각 ITL 엔트리는 다음 정보를 포함:**

```
- Transaction ID (XID): 어떤 트랜잭션인지
- Lock Byte: 해당 트랜잭션이 Lock한 로우들의 비트맵
- SCN: 트랜잭션의 커밋 SCN (커밋 후)
- Undo Block Address: 롤백을 위한 Undo 정보 위치
```

**동작 방식:**

```sql
-- Session 1
UPDATE emp SET sal = 5000 WHERE empno = 100;  -- ITL #1 사용

-- Session 2 (같은 블록의 다른 로우)
UPDATE emp SET sal = 6000 WHERE empno = 101;  -- ITL #2 사용

-- Session 3 (같은 블록의 또 다른 로우)
UPDATE emp SET sal = 7000 WHERE empno = 102;  -- ITL #3 사용
```

### ITL 슬롯 부족 문제

**기본 설정:**

- `INITRANS`: 블록 생성 시 초기 ITL 슬롯 개수 (기본값 1~2)
- `MAXTRANS`: 동적으로 확장 가능한 최대 ITL 개수 (Oracle 10g부터 자동 관리)

**ITL 부족 시 발생하는 현상:**

```
블록 내 빈 ITL 슬롯이 없는 상황:
┌───────────────────────────────┐
│ ITL #1: [사용중 - TX A]         │
│ ITL #2: [사용중 - TX B]         │  ← 슬롯 풀
│ ITL #3: [사용중 - TX C]         │
├───────────────────────────────┤
│ Row Data (많은 공간 남음)        │
└───────────────────────────────┘

새로운 트랜잭션이 같은 블록의 다른 로우를 수정하려고 함
→ ITL 슬롯 부족!
```

**결과:**

1. **대기 이벤트 발생**: `enq: TX - allocate ITL entry`
2. **동적 확장 시도**: Free Space에서 ITL 슬롯 추가 할당
3. **Free Space 부족 시**: 기존 트랜잭션이 커밋될 때까지 대기

### 성능 영향

**High Concurrency 환경에서:**

```
수백 개의 로우가 한 블록에 있고
수십 개의 트랜잭션이 동시에 각기 다른 로우를 수정하려 함
→ ITL 슬롯 경합 심각
→ 블록 레벨 병목
```

**특히 문제가 되는 케이스:**

- `PCTFREE`가 낮게 설정되어 Free Space 부족
- 작은 로우 크기로 한 블록에 많은 로우 존재
- 높은 동시 DML 발생

### 모니터링 관점에서의 중요성

**대시보드에 표시해야 할 정보:**

1. **대기 이벤트 감지**
    
    ```
    Wait Event: enq: TX - allocate ITL entry
    → ITL 슬롯 부족 문제 발생 중
    ```
    
2. **관련 메트릭**
    
    ```sql
    -- ITL 대기 통계
    SELECT name, value 
    FROM v$sysstat 
    WHERE name LIKE '%ITL%';
    
    -- ITL waits
    -- ITL slots allocated
    ```
    
3. **문제 테이블 식별**
    
    ```
    어떤 테이블/블록에서 ITL 경합이 자주 발생하는가?
    → INITRANS 값 조정 필요성 판단
    ```
    
4. **권장 액션 제시**
    
    ```
    ITL 경합이 감지되면:
    - INITRANS 값 증가 권고
    - PCTFREE 값 증가 권고 (동적 확장 공간 확보)
    - 테이블 재구성 고려
    ```
    

**시각화 예시:**

```
📊 Block Contention Analysis
┌─────────────────────────────────────┐
│ Table: ORDERS                       │
│ ITL Wait Events: 1,234 (⚠️ High)   │
│ Current INITRANS: 2                 │
│ Recommended: 5                      │
│                                     │
│ Block Distribution:                 │
│ ████████░░ 80% blocks < 3 ITL used │
│ ██████████ 20% blocks 3+ ITL used  │
│                                     │
│ 💡 Suggestion: Increase INITRANS    │
└─────────────────────────────────────┘
```

### 해결 방법

```sql
-- 테이블 재생성 시 INITRANS 조정
ALTER TABLE orders MOVE INITRANS 5;

-- 인덱스도 조정 필요
ALTER INDEX orders_idx REBUILD INITRANS 5;

-- PCTFREE도 함께 고려
ALTER TABLE orders MOVE INITRANS 5 PCTFREE 20;
```

ITL 슬롯은 **블록 레벨의 동시성을 제어하는 핵심 메커니즘**입니다. 로우 Lock과는 다른 차원의 경합이며, 모니터링 UI에서 이를 명확히 구분하여 표시하면 DBA가 정확한 튜닝 방향을 잡을 수 있습니다.