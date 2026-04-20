// 업체 로그인 처리
async function loginCompany() {
    const slug = window.currentSlug;
    const pwd = document.getElementById('company-password').value;

    // Supabase DB에서 해당 업체의 접속 정보 확인 (보안을 위해 실제론 Edge Function 사용 권장)
    const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', slug)
        .eq('password', pwd) // 실제 환경에서는 비밀번호 해싱 필수
        .single();

    if (company) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard-screen').classList.remove('hidden');
        document.getElementById('dash-company-name').innerText = company.name;
        
        // 로그인 성공 시 동적 UI 로드
        loadDynamicUI(company.id);
    } else {
        alert("비밀번호가 일치하지 않거나 존재하지 않는 업체입니다.");
    }
}

// 활성 쇼핑몰 기반 동적 UI 렌더링
async function loadDynamicUI(companyId) {
    // 해당 업체의 API 키 정보 가져오기
    const { data: apiKeys } = await supabase
        .from('api_keys')
        .select('*')
        .eq('company_id', companyId)
        .single();

    const menuContainer = document.getElementById('dynamic-menu');
    const contentContainer = document.getElementById('dashboard-content');
    
    // 쇼핑몰 맵핑 정보 (이름과 표시될 라벨)
    const mallMap = {
        naver: "네이버 스마트스토어",
        coupang: "쿠팡 Wing",
        qoo10: "큐텐 재팬",
        shopee: "쇼피 (Shopee)",
        lazada: "라자다 (Lazada)"
    };

    menuContainer.innerHTML = `<li style="background: var(--accent-color);">전체 통합 대시보드</li>`;
    contentContainer.innerHTML = '';

    // apiKeys 객체를 순회하며 값이 있는(활성화된) 몰만 화면에 추가
    for (const [mallKey, keyValue] of Object.entries(apiKeys || {})) {
        if (mallMap[mallKey] && keyValue) { // 값이 존재하면 활성화된 몰로 간주
            // 1. 사이드바 메뉴 추가
            menuContainer.innerHTML += `<li>🛒 ${mallMap[mallKey]}</li>`;
            
            // 2. 대시보드 위젯 추가
            contentContainer.innerHTML += `
                <div class="widget">
                    <h4 style="margin-top:0; color: var(--text-muted);">${mallMap[mallKey]}</h4>
                    <h2 style="margin: 10px 0;">활성화 됨</h2>
                    <p style="font-size: 12px; color: green;">● 실시간 동기화 중</p>
                </div>
            `;
        }
    }

    if (contentContainer.innerHTML === '') {
        contentContainer.innerHTML = `<p>연동된 쇼핑몰이 없습니다. 관리자에게 세팅을 요청하세요.</p>`;
    }
}

function logout() {
    window.location.reload();
}
