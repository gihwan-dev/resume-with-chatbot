Entity를 쇼핑몰 예시로 자세히 설명한다.

Entity는 우리 프로그램에서 다루는 '실제 대상'을 코드로 표현한 것이다. 쇼핑몰에서는 이런 것들이 Entity가 될 수 있다:

1. **User (사용자) Entity**
```typescript
interface User {
    id: string;
    name: string;
    email: string;
    address: string;
    phoneNumber: string;
    orderHistory: Order[];  // 주문 내역
    cart: CartItem[];      // 장바구니
}
```

2. **Product (상품) Entity**
```typescript
interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    stock: number;         // 재고
    images: string[];      // 상품 이미지들
    reviews: Review[];     // 상품 리뷰
}
```

3. **Order (주문) Entity**
```typescript
interface Order {
    id: string;
    userId: string;        // 주문한 사용자
    products: Product[];   // 주문한 상품들
    totalPrice: number;    // 총 금액
    status: OrderStatus;   // 주문상태 (배송준비중/배송중/배송완료)
    orderDate: Date;       // 주문 날짜
}
```

이런 Entity들은:
- Features나 Widgets에서 필요한 데이터의 구조를 정의한다
- 다른 Entity들과 연결될 수 있다 (예: User는 Order를 가지고 있고, Order는 Product를 가지고 있다)
- 비즈니스 규칙을 포함할 수 있다 (예: "재고가 0이면 주문할 수 없다" 같은 규칙)

실제 사용 예시를 들자면:
```typescript
// Entity를 사용하는 예시
const newUser: User = {
    id: "user123",
    name: "김철수",
    email: "kim@example.com",
    address: "서울시 강남구",
    phoneNumber: "010-1234-5678",
    orderHistory: [],
    cart: []
};

// 상품을 장바구니에 담기
function addToCart(user: User, product: Product) {
    if (product.stock > 0) {  // Entity의 비즈니스 규칙 체크
        user.cart.push({ product, quantity: 1 });
        product.stock--;
    }
}
```

이렇게 Entity는 우리 프로그램의 '실제 데이터'와 '규칙'을 담고 있는 가장 기본적인 구성 요소라고 볼 수 있다