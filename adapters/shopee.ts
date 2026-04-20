import { MallAdapter } from './interface.ts';

export const shopeeAdapter: MallAdapter = {
    updateStock: async (apiKey, productId, newStock) => {
        try {
            // apiKey에 Partner ID와 Shop ID, API Key를 모두 조합해서 저장해두었다고 가정
            const [partnerId, shopId, secretKey] = apiKey.split(':');
            
            const timestamp = Math.floor(Date.now() / 1000);
            const path = '/api/v2/product/update_stock';
            // 쇼피 규격에 맞춘 서명 생성 로직 필요
            // const sign = hmacSha256(partnerId + path + timestamp, secretKey);

            const url = `https://partner.shopeemobile.com${path}?partner_id=${partnerId}&timestamp=${timestamp}&shop_id=${shopId}&sign=...`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_id: parseInt(productId),
                    stock_list: [{ model_id: 0, normal_stock: newStock }]
                })
            });

            if (!response.ok) throw new Error('쇼피 재고 업데이트 에러');
            console.log(`[Shopee] 상품 ${productId} 재고 ${newStock}개로 동기화 완료`);
            return true;
        } catch (error) {
            console.error(`[Shopee] 실패:`, error);
            return false;
        }
    }
};
