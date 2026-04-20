// adapters/interface.ts
export interface MallAdapter {
    // 1. 재고 동기화 (현재)
    updateStock: (apiKey: string, productId: string, newStock: number) => Promise<boolean>;
    
    // 2. 신규 상품 등록 (나중에 추가할 때 여기에 명시)
    // uploadProduct: (apiKey: string, productData: any) => Promise<boolean>;
    
    // 3. 상품 판매상태(품절/판매중) 변경 
    // changeStatus: (apiKey: string, productId: string, status: string) => Promise<boolean>;
}
