import { MallAdapter } from './interface.ts';

export const lazadaAdapter: MallAdapter = {
    updateStock: async (apiKey, productId, newStock) => {
        try {
            // accessToken과 appKey, appSecret을 함께 사용
            const [accessToken, appKey, appSecret] = apiKey.split(':');
            const timestamp = new Date().getTime();

            // 라자다 API 엔드포인트 및 서명 생성 (예시)
            const url = `https://api.lazada.co.id/rest/product/price_quantity/update`;
            
            const payload = `
                <Request>
                    <Product>
                        <Skus>
                            <Sku>
                                <SellerSku>${productId}</SellerSku>
                                <Quantity>${newStock}</Quantity>
                            </Sku>
                        </Skus>
                    </Product>
                </Request>
            `;

            const response = await fetch(url + `?access_token=${accessToken}&app_key=${appKey}&timestamp=${timestamp}&sign=...`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/xml' },
                body: payload
            });

            if (!response.ok) throw new Error('라자다 재고 업데이트 에러');
            console.log(`[Lazada] 상품 ${productId} 재고 ${newStock}개로 동기화 완료`);
            return true;
        } catch (error) {
            console.error(`[Lazada] 실패:`, error);
            return false;
        }
    }
};
