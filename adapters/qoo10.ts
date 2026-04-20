import { MallAdapter } from './interface.ts';

export const qoo10Adapter: MallAdapter = {
    updateStock: async (apiKey, productId, newStock) => {
        try {
            // 일본(.jp)이 아닌 한국/글로벌 큐텐(.com)의 QSM API 엔드포인트로 변경
            const url = 'https://api.qoo10.com/GMKT.INC.Front.QAPIService/Qapi.asmx'; 
            
            // 큐텐은 보통 폼 데이터(URLSearchParams) 형식을 요구합니다.
            const params = new URLSearchParams();
            params.append('key', apiKey);
            params.append('ItemCode', productId);
            params.append('Qty', newStock.toString());

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });

            if (!response.ok) throw new Error('한국 큐텐 재고 업데이트 에러');
            console.log(`[Qoo10 Korea] 상품 ${productId} 재고 ${newStock}개로 동기화 완료`);
            return true;
            
        } catch (error) {
            console.error(`[Qoo10 Korea] 실패:`, error);
            return false;
        }
    }
};
