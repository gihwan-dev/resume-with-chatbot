## **RAC (Real Application Clusters)**
**정의:**
- Oracle의 **클러스터링 기술**
- 여러 서버(노드)가 하나의 데이터베이스를 공유하는 구조
- Active-Active 구성 (모든 노드가 동시에 읽기/쓰기 가능)

**특징:**
```
   Node 1          Node 2          Node 3
     ↓               ↓               ↓
   SGA             SGA             SGA
     ↓               ↓               ↓
     └───────────────┴───────────────┘
              Cache Fusion
                    ↓
           Shared Storage (ASM)
```

- **Cache Fusion**: 노드 간 메모리 블록을 고속 네트워크(Interconnect)로 공유
- 고가용성 + 확장성 동시 제공