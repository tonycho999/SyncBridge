async function setupNewCompany() {
    const name = document.getElementById('new-company-name').value;
    const slug = document.getElementById('new-company-slug').value;
    const pwd = document.getElementById('new-company-pwd').value;
    const logArea = document.getElementById('master-log');

    if(!name || !slug || !pwd) {
        alert("업체 기본 정보를 모두 입력해주세요.");
        return;
    }

    logArea.innerHTML = "<p>⏳ 업체 세팅 중...</p>";

    try {
        // 1. companies 테이블에 업체 생성
        const { data: newCompany, error: compError } = await supabase
            .from('companies')
            .insert([{ name: name, slug: slug, password: pwd }])
            .select()
            .single();

        if (compError) throw compError;

        // 2. 입력된 API 키 수집 (빈 칸은 null 처리)
        const keys = {
            company_id: newCompany.id,
            naver: document.getElementById('api-naver').value || null,
            coupang: document.getElementById('api-coupang').value || null,
            qoo10: document.getElementById('api-qoo10').value || null,
            shopee: document.getElementById('api-shopee').value || null,
            lazada: document.getElementById('api-lazada').value || null
        };

        // 3. api_keys 테이블에 암호화 저장 (실제 환경에선 Supabase Vault 플러그인 사용)
        const { error: keyError } = await supabase
            .from('api_keys')
            .insert([keys]);

        if (keyError) throw keyError;

        // 4. 구글 시트 복사 등 자동화 로직 호출 (Edge Function 트리거)
        // await supabase.functions.invoke('create-google-sheets', { body: { companyId: newCompany.id } });

        logArea.innerHTML = `<p style="color: green;">✅ <b>${name}</b> 세팅이 완료되었습니다!<br>
        접속 URL: syncbridge.pages.dev/${slug}</p>`;
        
    } catch (err) {
        logArea.innerHTML = `<p style="color: red;">❌ 오류 발생: ${err.message}</p>`;
    }
}
