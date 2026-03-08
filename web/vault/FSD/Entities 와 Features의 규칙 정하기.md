어떤 코드를 Entities에 둘것인지, Features에 둘것인지는 실제로 많은 개발자들이 고민하는 부분이다.

일반적인 규칙으로는:

**Entities에 들어가는 비즈니스 규칙:**
- 데이터 자체의 유효성과 관련된 규칙
- 단일 Entity 내에서 검증 가능한 규칙
```typescript
class Product {
    stock: number;

    hasStock(quantity: number): boolean {
        return this.stock >= quantity;  // "재고 체크" - 상품 자체의 규칙
    }
}
```

**Features에 들어가는 비즈니스 규칙:**
- 여러 Entity 간의 상호작용이 필요한 규칙
- 외부 시스템(API, DB 등)과의 통신이 필요한 규칙
```typescript
class CartFeature {
    async addToCart(productId: string, quantity: number) {
        const product = await this.productsRepo.findById(productId);
        if (!product) {
            throw new Error("상품이 존재하지 않습니다");  // 여러 Entity 관련 규칙
        }

        if (!product.hasStock(quantity)) {  // Entity의 규칙 활용
            throw new Error("재고가 부족합니다");
        }

        // ... 장바구니 추가 로직
    }
}
```

즉, "상품의 재고가 0개면 안 된다"는 Product Entity의 규칙이 될 수 있고, "재고가 없는 상품은 장바구니에 담을 수 없다"는 CartFeature의 규칙이 될 수 있다.

가장 중요한 것은 **일관성**이다. 팀에서 이러한 규칙을 어디에 둘지 결정하고 그 패턴을 일관되게 유지하는 것이 좋다.

### 🎯 비즈니스 규칙 배치 가이드라인

**1. Entity에 들어가는 규칙**
- 단일 Entity의 데이터 유효성 검사
- 변경되지 않는 비즈니스 규칙
- 외부 의존성이 필요 없는 규칙

```typescript
class Product {
    name: string;
    price: number;
    stock: number;
    category: string;

    // ✅ Entity 규칙의 좋은 예시들
    isValidPrice(): boolean {
        return this.price > 0;  // 가격은 항상 양수여야 함
    }

    hasStock(quantity: number): boolean {
        return this.stock >= quantity;  // 재고 확인
    }

    isValidName(): boolean {
        return this.name.length >= 2;  // 상품명은 최소 2글자
    }
}
```

**2. Feature에 들어가는 규칙**
- 여러 Entity 간의 상호작용이 필요한 규칙
- 외부 서비스나 API 호출이 필요한 규칙
- 상태 변경이 필요한 비즈니스 로직

```typescript
class OrderFeature {
    // ✅ Feature 규칙의 좋은 예시들
    async createOrder(userId: string, items: CartItem[]) {
        // 1. 여러 Entity 상호작용
        const user = await this.userRepo.findById(userId);
        if (!user.isVerified()) {
            throw new Error("인증된 사용자만 주문할 수 있습니다");
        }

        // 2. 복합 규칙 검증
        for (const item of items) {
            const product = await this.productRepo.findById(item.productId);
            
            // Entity의 규칙 활용
            if (!product.hasStock(item.quantity)) {
                throw new Error(`${product.name}의 재고가 부족합니다`);
            }

            // Feature 수준의 규칙
            if (item.quantity > 10) {
                throw new Error("한 상품당 최대 10개까지만 주문 가능합니다");
            }
        }

        // 3. 외부 서비스 호출
        const paymentResult = await this.paymentService.process(
            user.paymentInfo,
            this.calculateTotal(items)
        );

        // 4. 상태 변경
        if (paymentResult.success) {
            await this.updateProductStock(items);
            await this.createOrderHistory(user, items);
        }
    }
}
```

### 📋 결정 기준표

이 표를 보고 각 규칙을 어디에 배치할지 결정할 수 있다:

```typescript
// 규칙 배치 결정 예시
const rulePlacementGuide = {
    entityRules: [
        "데이터 타입 검증 (예: 가격이 음수인가)",
        "단일 필드 유효성 (예: 이메일 형식 검사)",
        "불변 비즈니스 규칙 (예: 상품명 최소 길이)",
        "계산 가능한 속성 (예: 총 주문 금액)"
    ],
    
    featureRules: [
        "여러 Entity 검증 (예: 주문 시 재고/사용자/결제 확인)",
        "상태 변경 필요 (예: 주문 후 재고 감소)",
        "외부 서비스 호출 (예: 결제 처리)",
        "복잡한 비즈니스 로직 (예: 할인 정책 적용)"
    ]
};
```

이렇게 명확한 기준을 세우면 팀원들이 일관된 방식으로 코드를 작성할 수 있다