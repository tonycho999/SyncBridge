// core/stock-syncer.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 만들어둔 어댑터들 임포트
import { naverAdapter } from '../adapters/naver.ts';
import { coupangAdapter } from '../adapters/coupang.ts';
// import { amazonAdapter } from '../adapters/amazon.ts'; // 나중에 추가할 때 주석만 풀면 됨

serve(async (req) => {
    const { company_id, product_id, new_stock } = await req.json();
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // 1. 이 업체의 활성화된 API 키 목록을 가져옴
    const { data: apiKeys } = await supabase
        .from('api_keys')
        .select('*')
        .eq('company_id', company_id)
        .single();

    if (!apiKeys) return new Response("API 키 없음", { status: 400 });

    const syncTasks = [];

    // 2. 값이 존재하는(활성화된) 몰의 어댑터만 배열에 추가
    if (apiKeys.naver) {
        syncTasks.push(naverAdapter.updateStock(apiKeys.naver, product_id, new_stock));
    }
    if (apiKeys.coupang) {
        syncTasks.push(coupangAdapter.updateStock(apiKeys.coupang, product_id, new_stock));
    }
    // 나중에 아마존이 추가되면 아래 세 줄만 추가하면 코어 엔진 수정 끝
    // if (apiKeys.amazon) {
    //     syncTasks.push(amazonAdapter.updateStock(apiKeys.amazon, product_id, new_stock));
    // }

    // 3. 모든 쇼핑몰에 동시에(Parallel) 통신 쏘기 (속도 극대화)
    await Promise.all(syncTasks);

    return new Response("타 쇼핑몰 재고 동기화 완료", { status: 200 });
});
