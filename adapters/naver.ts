// adapters/naver.ts
import { MallAdapter } from './interface.ts';

export const naverAdapter: MallAdapter = {
    updateStock: async (apiKey, productId, newStock) => {
        try {
            // 네이버 스마트스토어 API 엔드포인트 호출
            const response = await fetch(`https://api.commerce.naver.com/external/v1/products/${productId}/stock`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ stockQuantity: newStock })
            });

            if (!response.ok) throw new Error('네이버 API 에러');
            console.log(`[네이버] 상품 ${productId} 재고 ${newStock}개로 업데이트 완료`);
            return true;

        } catch (error) {
            console.error(`[네이버] 재고 업데이트 실패:`, error);
            return false;
        }
    }
};
