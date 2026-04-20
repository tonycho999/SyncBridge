// core/webhook-receiver.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
    // 1. 쇼핑몰에서 온 주문 알림 데이터 파싱
    const orderData = await req.json();
    const { company_id, product_id, ordered_qty } = orderData;

    // Supabase DB 연결
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 2. 중앙 DB 재고 차감 (마이너스 방지를 위한 트랜잭션 RPC 호출)
    const { data: newStock, error } = await supabase
        .rpc('decrement_stock', { p_product_id: product_id, p_qty: ordered_qty });

    if (error) return new Response("재고 차감 실패", { status: 500 });

    // 3. 재고가 무사히 깎였다면, 다른 쇼핑몰로 전파하는 엔진(stock-syncer) 호출
    // Edge Function 내부에서 다른 함수를 비동기로 찔러주고 바로 응답을 마칩니다 (0.1초 컷)
    supabase.functions.invoke('stock-syncer', {
        body: { company_id, product_id, new_stock: newStock }
    });

    return new Response("주문 수신 및 재고 차감 완료", { status: 200 });
});
