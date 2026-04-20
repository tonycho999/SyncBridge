import { MallAdapter } from './interface.ts';

export const naverAdapter: MallAdapter = {
    updateStock: async (apiKey, productId, newStock) => {
        try {
            const response = await fetch(`https://api.commerce.naver.com/external/v1/products/${productId}/stock`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ stockQuantity: newStock })
            });

            if (!response.ok) throw new Error('네이버 재고 업데이트 에러');
            console.log(`[Naver] 상품 ${productId} 재고 ${newStock}개로 동기화 완료`);
            return true;
        } catch (error) {
            console.error(`[Naver] 실패:`, error);
            return false;
        }
    }
};
