/* MOZZIPICK r30 — read-only ChatGPT researched report viewer.
 * Chat research is committed separately to data/command-reports.json.
 * No webhook, paid scraper, secret, or browser-triggered collector. */
(function(){
"use strict";
const allowed=new Set(["1","1-1","1-2","1-3"]);
const titles={"1":"통합 바이럴 상품 발굴","1-1":"인스타 국내 릴스 발굴","1-2":"인스타 해외 릴스 발굴","1-3":"쿠팡 통합 상품 조사"};
const esc=value=>String(value??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const fmt=v=>v===null||v===undefined||v===""?"미확인":typeof v==="number"&&Number.isFinite(v)?v.toLocaleString("ko-KR"):esc(v);
const date=v=>{if(!v)return "미확인";const d=new Date(v);return Number.isFinite(d.getTime())?d.toLocaleString("ko-KR"):"미확인"};
const url=v=>{try{const u=new URL(String(v));return u.protocol==="https:"?u.href:""}catch(e){return ""}};
const link=(href,label)=>{const u=url(href);return u?'<a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+esc(label)+' ↗</a>':""};
/* Personal review status is a local checklist, NOT independent verification of metrics or sales. */
const REVIEW_KEY="mozzipick.chat-review.v1";
function readReviews(){try{const v=JSON.parse(localStorage.getItem(REVIEW_KEY)||"{}");return v&&typeof v==="object"&&!Array.isArray(v)?v:{}}catch(e){return {}}}
let reviews=readReviews();
function itemKey(r,p,i){
 const unique=String(p.id||p.productId||"").trim();
 if(unique)return "id:"+unique;
 const raw=p.reelUrl||p.sourceUrl||p.postUrl||p.sale?.url||"";
 const u=url(raw);
 if(u){try{const parsed=new URL(u);return "url:"+parsed.origin+parsed.pathname.replace(/\/$/,"")}catch(e){}}
 return "report:"+String(r.id||r.createdAt||r.command)+":"+i+":"+String(p.productName||"");
}
const reviewed=(r,p,i)=>Boolean(reviews[itemKey(r,p,i)]?.checkedAt);
const saleLabels={"verified-on-sale":"판매 중 · 판매처 확인","search-result-only":"검색 결과 확인 · 판매 검증 전","not-found":"판매처 미발견","unavailable":"판매 중단 확인","unknown":"판매 여부 미확인"};
let root=null,callbacks={},ui=null,seq=0;
const push=()=>callbacks.push?.(),save=()=>callbacks.save?.();
const snapshot=el=>el===root&&el?.dataset.mozziChatReport==="1"&&ui?{command:ui.command,page:ui.page,reportIndex:ui.reportIndex,reviewFilter:ui.reviewFilter}:null;
function card(p,i,r){
 const reviewedAt=reviews[itemKey(r,p,i)]?.checkedAt||"";
 const m=p.metrics||{},s=p.sale||{},kind=s.status||"unknown";
 const checked=kind==="verified-on-sale"&&url(s.url)&&s.checkedAt;
 const status=kind==="verified-on-sale"&&!checked?"판매 근거 미확인":(saleLabels[kind]||saleLabels.unknown);
 const category=p.category||"카테고리 미확인",nm=p.productName||"상품명 미확인";
 const coupang=r.command==="1-3";
 const reel=url(p.reelUrl||p.sourceUrl||p.postUrl);
 const code=String(reel).match(/^https:\/\/(?:www\.)?instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)\/?/i)?.[1]||"";
 const cover=(code&&p.thumbnail==="assets/instagram/"+code+".jpg")?p.thumbnail:"";
 const media=coupang?'<a class="mr-chat-media mr-chat-coupang" href="'+esc(url(p.sourceUrl||s.url)||"https://shortsshopping.com/data/")+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc(nm)+' 실제 랭킹 기록 열기"><span class="mr-chat-media-fallback"><b>COUPANG</b><small>순위 기록 확인 ↗<br>상품 사진 미확인</small></span></a>':reel?
  '<a class="mr-chat-media" href="'+esc(reel)+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc(nm)+' 원본 릴스 열기">'+
  (cover?'<img src="'+esc(cover)+'?v=20260928-r34" alt="'+esc(nm)+' 실제 원본 릴스 썸네일" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false">'+
  '<span class="mr-chat-media-fallback" hidden><b>REELS</b><small>원본 이미지 표시 제한<br>릴스에서 확인 ↗</small></span>':
  '<span class="mr-chat-media-fallback"><b>REELS</b><small>원본 썸네일 확보 중<br>릴스에서 확인 ↗</small></span>')+
  '<span class="mr-chat-media-play" aria-hidden="true">▶</span></a>':
  '<div class="mr-chat-media mr-chat-media-unavailable"><span class="mr-chat-media-fallback"><b>REELS</b><small>원본 링크 미확인</small></span></div>';
 const cells=(coupang?[["등급",esc(p.rankGroup||"미분류")],["기록 순위",p.observedRank?fmt(p.observedRank)+"위":"미확인"],["판매량",fmt(m.sales)],["리뷰 수",fmt(m.reviews)]]:[["조회수",fmt(m.views)],["좋아요",fmt(m.likes)],["댓글",fmt(m.comments)],["공유",fmt(m.shares)]]).map(([k,v])=>'<span><b>'+k+'</b><strong>'+v+'</strong></span>').join("");
 const refs=(Array.isArray(p.sources)?p.sources:[]).slice(0,6).map(x=>link(x.url,x.label||x.platform||"검증 출처")).filter(Boolean).join("");
 const cross=Array.isArray(p.crossChecks)?p.crossChecks.filter(Boolean).map(x=>esc(x)).join(" · "):esc(p.crossChecks||"");
 return '<article class="mr-chat-item" data-review-state="'+(reviewedAt?"confirmed":"unconfirmed")+'">'+
  '<div class="mr-chat-review"><span class="mr-chat-review-badge '+(reviewedAt?"confirmed":"unconfirmed")+'">'+(reviewedAt?"✓ 확인":"○ 미확인")+'</span>'+
  '<button type="button" data-chat-review-index="'+i+'" aria-pressed="'+(reviewedAt?"true":"false")+'" aria-label="'+esc(nm)+' 내 확인 상태 '+(reviewedAt?"취소":"체크")+'">'+(reviewedAt?"✓ 확인 완료 · 체크 취소":"□ 내가 확인했어요")+'</button>'+
  (reviewedAt?'<small>내 확인 시각: '+esc(date(reviewedAt))+'</small>':"")+'</div>'+
  '<div class="mr-chat-item-top"><span class="mr-chat-rank">#'+(i+1)+'</span>'+(coupang?'<span class="mr-chat-group mr-chat-group-'+esc(p.rankGroup||"unknown")+'">'+esc(p.rankGroup||"미분류")+'</span>':"")+'<span>'+esc(category)+'</span><span>'+esc(p.sourcePlatform||"원본 출처 미확인")+'</span></div>'+
  '<div class="mr-chat-media-row">'+media+'<div class="mr-chat-media-copy"><h3>'+esc(nm)+'</h3>'+
  (p.model?'<p><b>모델</b> '+esc(p.model)+'</p>':"")+
  (p.caption?'<p><b>'+(coupang?"관측 요약":"영상 내용")+'</b> '+esc(p.caption)+'</p>':"")+
  (coupang?'<small class="mr-chat-media-source unverified">쿠팡 상품 사진은 아직 확보되지 않았습니다. 기록 출처에서 확인하세요.</small>':cover?'<small class="mr-chat-media-source">✓ 원본 릴스에서 확보한 실제 썸네일</small>':'<small class="mr-chat-media-source unverified">이미지 미확보 · 다른 상품 사진은 사용하지 않습니다.</small>')+
  '</div></div>'+
  '<div class="mr-chat-metrics">'+cells+'</div>'+
  '<div class="mr-chat-facts">'+
  '<p><b>판매 여부</b> <strong>'+esc(status)+'</strong>'+(s.platform?' · '+esc(s.platform):"")+
   (s.price?' · '+esc(s.price):"")+'</p>'+
  (checked?'<p>'+link(s.url,"확인된 판매처")+' · 확인: '+esc(date(s.checkedAt))+'</p>':(s.url?'<p>'+link(s.url,"판매처 후보 (미검증)")+'</p>':""))+
  (coupang?'<p><b>첫 관측일</b> '+esc(p.firstObservedAt||"미확인")+'　<b>순위 자료 갱신</b> '+esc(date(p.rankObservationAt))+'</p><p><b>순위 구분</b> '+esc(p.rankList||"미확인")+'</p>':'<p><b>릴스 게시일</b> '+esc(date(p.publishedAt))+'　<b>반응 확인일</b> '+esc(date(p.metricsObservedAt))+'</p>')+
  (p.sponsored!==undefined&&p.sponsored!==null?'<p><b>광고/협찬</b> '+esc(p.sponsored===true?"광고·협찬 표시 확인":p.sponsored===false?"표시 미발견 (비광고 확정 아님)":p.sponsored)+'</p>':"")+
  '</div>'+
  (p.recommendation?'<p class="mr-chat-reason"><b>모찌픽 추천 포인트</b> '+esc(p.recommendation)+'</p>':"")+
  (p.cautions?'<p><b>주의·추가 검증</b> '+esc(p.cautions)+'</p>':"")+
  (cross?'<p><b>교차 확인</b> '+cross+'</p>':"")+
  '<div class="mr-chat-links">'+link(p.reelUrl||p.sourceUrl||p.postUrl,coupang?"순위 기록":"원본 게시물")+(coupang?"":link(p.accountUrl,"게시 계정"))+refs+'</div>'+
  '</article>'
}
function render(){
 if(!root||!ui)return;
 root.dataset.mozziChatReport="1";delete root.dataset.mozziLive;
 let html='<section class="mr-chat-report"><header><span>MOZZIPICK · CHAT RESEARCH REPORT</span><h2>'+esc(ui.command)+' · '+esc(titles[ui.command])+'</h2><p>이 채팅에서 조사한 결과만 표시합니다. 국내 1-1·해외 1-2 상품은 확인 버튼을 누르면 보고서의 대기 목록에서 즉시 사라지고 각각 해당 인스타 메뉴에 추가됩니다. 외부 수집기를 실행하지 않습니다.</p></header>';
 if(ui.status==="loading")html+='<p class="mr-chat-state" role="status">저장된 조사 보고서를 읽는 중입니다.</p>';
 else if(ui.status==="error")html+='<p class="mr-chat-state" role="alert">'+esc(ui.error||"보고서를 읽지 못했습니다.")+'</p>';
 else{
  const reports=ui.reports||[],r=reports[ui.reportIndex]||null;
  if(!r)html+='<div class="mr-chat-empty"><strong>아직 등록된 조사 보고서가 없습니다.</strong><p>이 채팅창에서 '+esc(ui.command)+'번 명령어를 실행하면 에이스가 실제 출처를 조사하고 확인 가능한 정보만 사이트 보고서에 등록할 수 있어요.</p><p>과거 등록 상품이나 임의의 조회수로 보고서를 채우지 않습니다.</p></div>';
  else{
   const a=Array.isArray(r.items)?r.items:[],perPage=5,pages=Math.max(1,Math.ceil(a.length/perPage)),page=Math.min(Math.max(1,ui.page),pages);
   ui.page=page;
   const confirmed=a.filter((p,i)=>reviewed(r,p,i)).length,unchecked=a.length-confirmed;
   const transfers=ui.command==="1-1"||ui.command==="1-2";
   const chosen=transfers?"unconfirmed":ui.reviewFilter||"all";
   const shown=a.map((p,i)=>({p,i})).filter(({p,i})=>transfers?!reviewed(r,p,i):chosen==="confirmed"?reviewed(r,p,i):chosen==="unconfirmed"?!reviewed(r,p,i):true);
   const filteredPages=Math.max(1,Math.ceil(shown.length/perPage));ui.page=Math.min(ui.page,filteredPages);
   html+='<div class="mr-chat-summary"><strong>'+esc(r.title||titles[ui.command])+'</strong><p>'+esc(r.summary||"검증된 자료에 한해 표시")+'</p><small>조사 시각: '+esc(date(r.createdAt))+' · 기간: '+esc(r.period||"보고서 참조")+' · 결과: '+a.length+'개'+(ui.command==="1-3"&&r.groupCounts?" · S "+(+r.groupCounts.S||0)+" / A "+(+r.groupCounts.A||0)+" / B "+(+r.groupCounts.B||0):"")+' · 내 확인과 공개 근거 검증은 별도입니다.</small></div>';
   html+='<div class="mr-chat-review-summary"><b>'+(transfers?"이동 대기 현황":"내 확인 현황")+'</b><span>✓ 확인 '+confirmed+'개</span><span>○ 미확인 '+unchecked+'개</span>'+
    (transfers?'<strong class="mr-chat-transfer-note">확인 완료한 상품은 보고서에서 제외되며 '+(ui.command==="1-1"?"국내":"해외")+' 인스타 메뉴에서 볼 수 있습니다.</strong>':
    '<div class="mr-chat-review-filters" aria-label="내 확인 상태별 보기">'+[["all","전체"],["confirmed","확인"],["unconfirmed","미확인"]].map(([v,label])=>'<button type="button" data-chat-review-filter="'+v+'" aria-pressed="'+(chosen===v?"true":"false")+'">'+label+'</button>').join("")+'</div>')+
    '<small>내 확인 체크는 공개 지표나 판매 사실 검증과 별개이며, 이 브라우저에만 저장됩니다. 기존 인스타 상품은 유지됩니다.</small></div>';
   if(reports.length>1)html+='<label class="mr-chat-archives">이전 보고서 선택 <select data-chat-archive>'+reports.map((v,i)=>'<option value="'+i+'" '+(i===ui.reportIndex?"selected":"")+'>'+esc(v.title||titles[ui.command])+' · '+esc(date(v.createdAt))+'</option>').join("")+'</select></label>';
   html+='<div class="mr-chat-items">'+shown.slice((ui.page-1)*perPage,ui.page*perPage).map(({p,i})=>card(p,i,r)).join("")+'</div>';
   if(!a.length)html+='<p class="mr-chat-state">이번 조사에서 기준을 충족하는 상품이 없습니다.</p>';
   else if(!shown.length)html+='<p class="mr-chat-state">'+(transfers?"미확인 상품이 모두 이동되었습니다. 확인한 상품은 인스타 "+(ui.command==="1-1"?"국내":"해외")+" 메뉴에서 확인하세요.":"선택한 확인 상태에 해당하는 상품이 없습니다.")+'</p>';
   if(filteredPages>1)html+='<nav class="mr-chat-pages" aria-label="보고서 페이지">'+Array.from({length:filteredPages},(_,i)=>'<button type="button" data-chat-page="'+(i+1)+'" '+(i+1===ui.page?'aria-current="page"':'')+'>'+(i+1)+'</button>').join("")+'</nav>';
   if(ui.reviewError)html+='<p class="mr-chat-state" role="alert">'+esc(ui.reviewError)+'</p>';
   if(r.notes)html+='<p class="mr-chat-notes"><b>조사·검증 메모</b> '+esc(r.notes)+'</p>';
  }
 }
 html+='<div class="mr-chat-footer"><button type="button" data-chat-reload>최신 보고서 다시 읽기</button><small>보고서 입력 경로: 채팅 조사 → GitHub 보고서 저장 → 모찌픽 표시. 추가 검색·Apify·n8n 실행 없음.</small></div></section>';
 root.innerHTML=html;
 const reload=root.querySelector("[data-chat-reload]");if(reload)reload.onclick=()=>load();
 const sel=root.querySelector("[data-chat-archive]");if(sel)sel.onchange=()=>{push();ui.reportIndex=+sel.value||0;ui.page=1;ui.reviewFilter="all";render();save()};
 root.querySelectorAll("[data-chat-review-filter]").forEach(b=>b.onclick=()=>{if(ui.reviewFilter===b.dataset.chatReviewFilter)return;push();ui.reviewFilter=b.dataset.chatReviewFilter;ui.page=1;render();save()});
 root.querySelectorAll("[data-chat-review-index]").forEach(b=>b.onclick=()=>{
  const r=ui.reports?.[ui.reportIndex],i=Number(b.dataset.chatReviewIndex),p=r?.items?.[i];if(!p)return;
  const key=itemKey(r,p,i),next={...reviews};if(reviewed(r,p,i))delete next[key];else next[key]={checkedAt:new Date().toISOString()};
  try{localStorage.setItem(REVIEW_KEY,JSON.stringify(next));reviews=next;ui.reviewError="";render();save();window.dispatchEvent(new CustomEvent("mozzipick-chat-review-change",{detail:{command:ui.command}}))}
  catch(e){ui.reviewError="이 브라우저에 확인 상태를 저장하지 못했습니다. 저장 공간 또는 브라우저 설정을 확인해 주세요.";render()}
 });
 root.querySelectorAll("[data-chat-page]").forEach(b=>b.onclick=()=>{const n=+b.dataset.chatPage;if(n===ui.page)return;push();ui.page=n;render();save();root.querySelector(".mr-chat-report")?.scrollIntoView({block:"start",behavior:"auto"})});
}
async function load(){
 if(!ui||!root)return;
 const id=++seq,command=ui.command;
 ui.status="loading";render();
 try{
  const response=await fetch("data/command-reports.json?v="+Date.now(),{cache:"no-store"});
  if(!response.ok)throw Error("보고서 파일 조회 실패 (HTTP "+response.status+")");
  const data=await response.json();
  if(data.schema!=="mozzipick.chat-reports.v1"||!data.reports||typeof data.reports!=="object")throw Error("보고서 파일 형식 오류");
  const reports=Array.isArray(data.reports[command])?data.reports[command]:[];
  if(!reports.every(r=>r&&r.command===command&&Array.isArray(r.items)))throw Error("명령어별 보고서 데이터 불일치");
  if(id!==seq||!ui||ui.command!==command)return;
  ui.reports=[...reports].sort((a,b)=>Date.parse(b.createdAt||0)-Date.parse(a.createdAt||0));
  ui.reportIndex=Math.max(0,Math.min(ui.reportIndex,ui.reports.length-1));
  ui.status="ready";
 }catch(e){if(id!==seq||!ui||ui.command!==command)return;ui.status="error";ui.error=e?.message||String(e)}
 render();save();
}
function open(command,el,cb,previous){
 if(!allowed.has(command)||!el)return;
 root=el;callbacks=cb||{};
 reviews=readReviews();
 ui={command,page:Math.max(1,+previous?.page||1),reportIndex:Math.max(0,+previous?.reportIndex||0),reviewFilter:command==="1-1"||command==="1-2"?"unconfirmed":["all","confirmed","unconfirmed"].includes(previous?.reviewFilter)?previous.reviewFilter:"all",status:"loading",reports:[],reviewError:""};
 render();load();
}
window.addEventListener("storage",e=>{if(e.key!==REVIEW_KEY)return;reviews=readReviews();if(root?.isConnected&&ui?.status==="ready"){render();save()}});
window.MozzipickChatReports={open,snapshot};
})();
