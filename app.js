const products=[
["갤럭시 Z Fold7","Samsung","모바일","2026.07",98,"↑ 1","+12.4%"],
["UGREEN Nexode 500W 6포트 GaN","UGREEN","충전·배터리","인기",95,"NEW","+38.6%"],
["Anker Nano Power Bank A1638","Anker","충전·배터리","2026",94,"↑ 4","+31.2%"],
["UGREEN MagFlow PB773 Qi2 25W","UGREEN","충전·배터리","2026",90,"↑ 3","+18.7%"],
["Insta360 Link 2 AI 4K","Insta360","카메라","2026",88,"↑ 2","+15.1%"],
["키크론 Q1 HE","Keychron","키보드·마우스","2026",86,"↓ 1","-1.8%"],
["Sony WH-1000 시리즈","Sony","오디오","2026",84,"NEW","+11.3%"],
["Aqara Hub M4","Aqara","스마트홈","2026",80,"↑ 3","+9.9%"],
["LG 스타일러","LG","생활가전","2026",77,"↓ 1","-2.5%"],
["Galaxy Watch 시리즈","Samsung","웨어러블","2026",74,"↓ 4","-8.9%"]
];
const ranking=document.querySelector("#ranking");
function draw(list=products){ranking.innerHTML=list.map((p,i)=>`<article class="card" data-i="${products.indexOf(p)}"><div class="rank ${i<3?"top":""}">${i+1}</div><div><div class="name">${p[0]}</div><div class="meta">${p[1]} · ${p[2]} · ${p[3]}</div><div class="bar"><i style="width:${p[4]}%"></i></div></div><div class="spark ${p[6][0]=="-"?"down":"up"}">⌁⌁⌁</div><div class="trend ${p[6][0]=="-"?"down":"up"}">${p[5]}<br>${p[6]}</div></article>`).join("");document.querySelectorAll(".card").forEach(x=>x.onclick=()=>openDetail(+x.dataset.i))}
draw();
document.querySelectorAll(".chips button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".chips button").forEach(x=>x.classList.remove("active"));b.classList.add("active");draw(b.textContent==="전체"?products:products.filter(p=>p[2].includes(b.textContent.replace("·",""))))});
function openDetail(i){const p=products[i];document.querySelector("#detail").innerHTML=`<span class="eyebrow">PRODUCT SIGNAL</span><h2>${p[0]}</h2><p>${p[1]} · ${p[2]} · ${p[3]}</p><div class="badges"><span class="badge">트렌드 ${p[4]}</span><span class="badge">${p[5]}</span><span class="badge">${p[6]}</span></div><h3>검증 상태</h3><div class="detailgrid"><div><b>쿠팡 동일 모델</b><br>확인 데이터 연결 예정</div><div><b>제품 영상</b><br>소스 데이터 연결 예정</div><div><b>TikTok / Reels</b><br>개별 영상 URL 기준</div><div><b>샤오홍슈</b><br>확인됨 / 미확인 구분</div><div><b>사람 등장 여부</b><br>제품 단독 · 손 · 사람 구분</div><div><b>쇼츠 적합성</b><br>후크 · 화질 · 워터마크 평가</div></div><h3>콘텐츠 확장</h3><div class="ideas"><div class="idea"><b>2-1 핵심 리뷰</b><br>첫 1~3초 후크 + 핵심 기능</div><div class="idea"><b>2-2 기능·실사용</b><br>사용 장면과 차별 기능</div><div class="idea"><b>2-3 활용·비교</b><br>숨은 기능과 비교 포인트</div></div>`;document.querySelector("#modal").classList.remove("hidden")}
document.querySelector(".close").onclick=()=>document.querySelector("#modal").classList.add("hidden");