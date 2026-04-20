let editTargetId = null; // 수정 모드 판별용 변수

// 1. 업체 리스트 불러오기 (Read)
async function loadCompanyList() {
    if (typeof supabase === 'undefined') return; // UI 테스트 중 에러 방지
    
    const listBody = document.getElementById('company-list-body');
    listBody.innerHTML = "<tr><td colspan='4'>데이터를 불러오는 중...</td></tr>";

    const { data: companies, error } = await supabase
        .from('companies')
        .select(`*, api_keys(*)`)
        .order('created_at', { ascending: false });

    if (error) {
        listBody.innerHTML = `<tr><td colspan='4'>오류: ${error.message}</td></tr>`;
        return;
    }

    listBody.innerHTML = "";
    
    if (companies.length === 0) {
        listBody.innerHTML = "<tr><td colspan='4'>등록된 업체가 없습니다.</td></tr>";
        return;
    }

    companies.forEach(company => {
        const activeMalls = [];
        if (company.api_keys && company.api_keys.length > 0) {
            const keys = company.api_keys[0];
            if (keys.naver) activeMalls.push("네이버");
            if (keys.coupang) activeMalls.push("쿠팡");
            if (keys.qoo10) activeMalls.push("큐텐");
            if (keys.shopee) activeMalls.push("쇼피");
            if (keys.lazada) activeMalls.push("라자다");
        }

        listBody.innerHTML += `
            <tr>
                <td><b>${company.name}</b></td>
                <td><small>/${company.slug}</small></td>
                <td>${activeMalls.length > 0 ? activeMalls.join(', ') : '<span style="color:#a0aec0;">없음</span>'}</td>
                <td>
                    <button class="btn-edit" onclick="prepareEdit('${company.id}')">수정</button>
                    <button class="btn-delete" onclick="deleteCompany('${company.id}', '${company.name}')">삭제</button>
                </td>
            </tr>
        `;
    });
}

// 2. 업체 삭제 로직 (Delete)
async function deleteCompany(id, name) {
    if (!confirm(`[${name}] 업체를 정말 삭제하시겠습니까?\n모든 설정이 영구 삭제됩니다.`)) return;

    // API 키 먼저 삭제 (외래키 제약조건)
    await supabase.from('api_keys').delete().eq('company_id', id);
    // 업체 삭제
    const { error } = await supabase.from('companies').delete().eq('id', id);

    if (error) {
        alert("삭제 실패: " + error.message);
    } else {
        alert(`${name} 업체가 삭제되었습니다.`);
        loadCompanyList();
    }
}

// 3. 업체 수정 준비 (데이터 폼에 띄우기)
async function prepareEdit(id) {
    const { data: company, error } = await supabase
        .from('companies')
        .select(`*, api_keys(*)`)
        .eq('id', id)
        .single();
    
    if (error || !company) return;

    editTargetId = id; // 수정 모드 ON
    
    document.getElementById('new-company-name').value = company.name;
    document.getElementById('new-company-slug').value = company.slug;
    document.getElementById('new-company-pwd').value = company.password;
    
    if (company.api_keys && company.api_keys.length > 0) {
        const keys = company.api_keys[0];
        document.getElementById('api-naver').value = keys.naver || '';
        document.getElementById('api-coupang').value = keys.coupang || '';
        document.getElementById('api-qoo10').value = keys.qoo10 || '';
        document.getElementById('api-shopee').value = keys.shopee || '';
        document.getElementById('api-lazada').value = keys.lazada || '';
    }

    // UI 변경 (버튼 이름 및 테두리 강조)
    const btnSubmit = document.getElementById('btn-submit');
    btnSubmit.innerText = "업체 정보 업데이트";
    btnSubmit.style.backgroundColor = "#d69e2e"; // 경고성(수정) 노란색 톤
    
    // 첫 번째 마스터 카드에 강조 테두리 추가
    document.querySelector('.master-card').classList.add('edit-mode');
    
    // 화면 맨 위로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 4. 업체 세팅 완료 및 업데이트 (Create / Update)
async function setupNewCompany() {
    if (typeof supabase === 'undefined') {
        alert("DB 연동 대기 중입니다. (테스트 환경)");
        return;
    }

    const name = document.getElementById('new-company-name').value;
    const slug = document.getElementById('new-company-slug').value;
    const pwd = document.getElementById('new-company-pwd').value;
    const logArea = document.getElementById('master-log');

    if(!name || !slug || !pwd) {
        alert("업체 기본 정보를 모두 입력해주세요.");
        return;
    }

    logArea.innerHTML = "<p>⏳ 처리 중...</p>";

    const apiData = {
        naver: document.getElementById('api-naver').value || null,
        coupang: document.getElementById('api-coupang').value || null,
        qoo10: document.getElementById('api-qoo10').value || null,
        shopee: document.getElementById('api-shopee').value || null,
        lazada: document.getElementById('api-lazada').value || null
    };

    try {
        if (editTargetId) {
            // [업데이트 모드]
            await supabase.from('companies').update({ name, slug, password: pwd }).eq('id', editTargetId);
            await supabase.from('api_keys').update(apiData).eq('company_id', editTargetId);
            
            alert(`[${name}] 정보가 업데이트 되었습니다.`);
            location.reload(); // 폼 초기화를 위해 새로고침
        } else {
            // [신규 생성 모드]
            const { data: newCompany, error: compError } = await supabase
                .from('companies')
                .insert([{ name, slug, password: pwd }])
                .select().single();

            if (compError) throw compError;

            apiData.company_id = newCompany.id;
            const { error: keyError } = await supabase.from('api_keys').insert([apiData]);
            
            if (keyError) throw keyError;

            logArea.innerHTML = `<p style="color: green;">✅ <b>${name}</b> 세팅이 완료되었습니다!</p>`;
            
            // 입력 폼 비우기
            document.querySelectorAll('input').forEach(input => input.value = '');
            loadCompanyList(); // 리스트 갱신
        }
    } catch (err) {
        logArea.innerHTML = `<p style="color: red;">❌ 오류 발생: ${err.message}</p>`;
    }
}
