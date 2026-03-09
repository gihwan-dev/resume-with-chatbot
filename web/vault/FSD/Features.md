Features를 쇼핑몰 예시로 자세히 설명한다.

Features는 **재사용 가능한 비즈니스 로직**이. 쉽게 말해 "우리 프로그램에서 실제로 일을 하는 부분"이라고 볼 수 있다.

예를 들어 '장바구니' Feature를 보자:

```typescript
// features/cart/
export class CartFeature {
    // 장바구니에 상품 추가
    async addToCart(productId: string, quantity: number) {
        // 1. 재고 확인
        const product = await this.checkStock(productId);
        if (!product.hasStock(quantity)) {
            throw new Error('재고가 부족합니다');
        }

        // 2. 장바구니에 추가
        const cartItem = {
            productId,
            quantity,
            price: product.price
        };

        // 3. 장바구니 업데이트
        await this.updateCart(cartItem);

        // 4. 이벤트 발송 (예: 장바구니 아이콘 뱃지 업데이트)
        this.notifyCartUpdated();
    }

    // 장바구니 목록 조회
    async getCartItems() {
        // DB나 API에서 장바구니 정보 가져오기
    }

    // 장바구니 상품 수량 변경
    async updateQuantity() {
        // 수량 업데이트 로직
    }
}
```

다른 예시로 '인증' Feature도 보자:
```typescript
// features/auth/
export class AuthFeature {
    // 로그인
    async login(email: string, password: string) {
        // 1. 입력값 검증
        if (!this.validateEmail(email)) {
            throw new Error('잘못된 이메일 형식입니다');
        }

        // 2. API 호출
        const response = await this.api.login(email, password);

        // 3. 토큰 저장
        this.storage.setToken(response.token);

        // 4. 사용자 정보 저장
        this.storage.setUser(response.user);
    }

    // 로그아웃
    async logout() {
        // 토큰 삭제, 상태 초기화 등
    }

    // 회원가입
    async register() {
        // 회원가입 로직
    }
}
```

Features의 특징을 정리하면:
1. **독립적**: 다른 기능들과 독립적으로 동작할 수 있어야 한다
2. **재사용 가능**: 여러 곳에서 사용될 수 있어야 한다
3. **비즈니스 로직 포함**: 실제 작업을 수행하는 코드가 있어야 한다
4. **Entity 사용**: Entity를 기반으로 동작한다 (예: User, Product Entity 사용)

실제 사용 예시를 보면:
```typescript
// 장바구니 Feature 사용 예시
const cartFeature = new CartFeature();

// Widget이나 Page에서 이렇게 사용할 수 있어요
async function handleAddToCart(productId: string) {
    try {
        await cartFeature.addToCart(productId, 1);
        showSuccessMessage('장바구니에 추가되었습니다');
    } catch (error) {
        showErrorMessage(error.message);
    }
}
```

이렇게 Features는 프로그램의 실제 동작을 담당하는 '기능 모음'이라고 이해하면 된다! Entity가 '데이터'를 다룬다면, Features는 그 데이터로 '무언가를 하는' 부분이다.