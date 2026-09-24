const products=[
["UGREEN MagFlow PB773 Qi2 25W","UGREEN","충전·배터리","판매 확인",90,"VERIFIED","쿠팡 동일모델",["쿠팡 정확모델"],"verified"],
["Insta360 Link 2 CINSABNB/LINK201","Insta360","카메라","2024.09",88,"VERIFIED","쿠팡 판매",["쿠팡 정확모델","영상 후보"],"verified"],
["Galaxy S26 FE · SM-S741N","Samsung","모바일","2026.09.04",0,"RELEASE VERIFIED","국내 출시 확인",["삼성 공식","모델코드 확인"],"verified"],
["Aurzen ZIP Pro","Aurzen","디스플레이","2026.09.04",0,"ANNOUNCED","IFA 2026 공개",["Aurzen 공식","1080p"],"verified"],
["Philips Hue Liane 360°","Philips Hue","스마트홈","2026.09",0,"WATCH","IFA 신제품",["출시 확인"],"watch"],
["Soundcore Sleep Earbuds 4 Pro","Soundcore","오디오","2026.09",0,"상품 VERIFIED","공식 제품 확인",["Soundcore 공식","AMOLED 케이스"],"verified"],
["Roborock Qrevo Edge 3 Pro","Roborock","생활가전","2026.08",0,"PRE-LAUNCH","미출시",["Roborock 공식","출시 대기"],"watch"],
["Ecovacs DEEBOT X12S OmniCyclone","Ecovacs","생활가전","2026.08",0,"WATCH","8월 신제품",["출시 확인"],"watch"],
["Wyze Indoor Cam Pan","Wyze","스마트홈","2026.08",0,"WATCH","8월 신제품",["출시 확인"],"watch"],
["Tapo TC34 Dual Lens","Tapo","스마트홈","2026.08",0,"WATCH","8월 신제품",["출시 확인"],"watch"]
];
const ranking=document.querySelector("#ranking");
function bars(score){let a=score?[38,48,44,61,70,78]:[28,28,28,28,28,28];return a.map(x=>`<i style="height:${x}%"></i>`).join("")}
function draw(list=products){ranking.innerHTML=list.map((p,i)=>`<article class="product" data-i="${products.indexOf(p)}"><div class="rank ${i<2?"top":""}">${i+1}</div><div class="thumb">상품</div><div><div class="name">${p[0]}</div><div class="meta">${p[1]} · ${p[2]} · ${p[3]}</div><div class="status">${p[8].map(x=>`<span class="tag">${x}</span>`).join("")}<span class="tag ${p[9]==="verified"?"new":""}">${p[6]}</span></div></div><div class="mini">${bars(p[4])}</div><div class="trend ${p[9]==="verified"?"up":""}">${p[5]}<b>${p[7]}</b></div></article>`).join("");document.querySelectorAll(".product").forEach(x=>x.onclick=()=>openDetail(+x.dataset.i))}
draw();
document.querySelectorAll(".chips button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".chips button").forEach(x=>x.classList.remove("on"));b.classList.add("on");draw(b.textContent==="전체"?products:products.filter(p=>p[2].includes(b.textContent.replace("·",""))))});
function openDetail(i){const p=products[i];const verified=p[9]==="verified";document.querySelector("#detail").innerHTML=`<span class="kicker">상품 SIGNAL</span><h2>${p[0]}</h2><p>${p[1]} · ${p[2]} · ${p[3]}</p><div class="badges"><span class="badge">${p[5]}</span><span class="badge">${p[6]}</span><span class="badge">${p[7]}</span></div><h3>검증 상태</h3><div class="detailgrid"><div><b>쿠팡 동일 모델</b><br>${verified?"확인됨":"검증 대기"}</div><div><b>제품 영상</b><br>${i===1?"후보 확인 · 세부 검수 예정":"검증 대기"}</div><div><b>TikTok / Reels</b><br>개별 영상 URL 검증 대기</div><div><b>샤오홍슈</b><br>외부 확인 시에만 확인됨 처리</div><div><b>사람 등장</b><br>영상 확보 후 판정</div><div><b>쇼츠 적합성</b><br>영상 확보 후 판정</div></div><h3>콘텐츠 확장</h3><div class="ideas"><div class="idea"><b>2-1 핵심 리뷰</b><br>검증된 영상 기반으로 작성 예정</div><div class="idea"><b>2-2 기능·실사용</b><br>기능 장면 확보 후 작성 예정</div><div class="idea"><b>2-3 활용·비교</b><br>비교 근거 확보 후 작성 예정</div></div>`;document.querySelector("#modal").classList.remove("hidden")}
document.querySelector(".close").onclick=()=>document.querySelector("#modal").classList.add("hidden");