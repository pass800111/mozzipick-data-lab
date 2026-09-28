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
const saleLabels={"verified-on-sale":"판매 중 · 판매처 확인","search-result-only":"검색 결과 확인 · 판매 검증 전","not-found":"판매처 미발견","unavailable":"판매 중단 확인","unknown":"판매 여부 미확인"};
let root=null,callbacks={},ui=null,seq=0;
const push=()=>callbacks.push?.(),save=()=>callbacks.save?.();
const snapshot=el=>el===root&&el?.dataset.mozziChatReport==="1"&&ui?{command:ui.command,page:ui.page,reportIndex:ui.reportIndex}:null;
function card(p,i){
 const m=p.metrics||{},s=p.sale||{},kind=s.status||"unknown";
 const checked=kind==="verified-on-sale"&&url(s.url)&&s.checkedAt;
 const status=kind==="verified-on-sale"&&!checked?"판매 근거 미확인":(saleLabels[kind]||saleLabels.unknown);
 const category=p.category||"카테고리 미확인",nm=p.productName||"상품명 미확인";
 const cells=[
  ["조회수",fmt(m.views)],["좋아요",fmt(m.likes)],["댓글",fmt(m.comments)],["공유",fmt(m.shares)]
 ].map(([k,v])=>'<span><b>'+k+'</b><strong>'+v+'</strong></span>').join("");
 const refs=(Array.isArray(p.sources)?p.sources:[]).slice(0,6).map(x=>link(x.url,x.label||x.platform||"검증 출처")).filter(Boolean).join("");
 const cross=Array.isArray(p.crossChecks)?p.crossChecks.filter(Boolean).map(x=>esc(x)).join(" · "):esc(p.crossChecks||"");
 return '<article class="mr-chat-item">'+
  '<div class="mr-chat-item-top"><span class="mr-chat-rank">#'+(i+1)+'</span><span>'+esc(category)+'</span><span>'+esc(p.sourcePlatform||"원본 출처 미확인")+'</span></div>'+
  '<h3>'+esc(nm)+'</h3>'+(p.model?'<p><b>모델</b> '+esc(p.model)+'</p>':"")+
  (p.caption?'<p><b>영상 내용</b> '+esc(p.caption)+'</p>':"")+
  '<div class="mr-chat-metrics">'+cells+'</div>'+
  '<div class="mr-chat-facts">'+
  '<p><b>판매 여부</b> <strong>'+esc(status)+'</strong>'+(s.platform?' · '+esc(s.platform):"")+
   (s.price?' · '+esc(s.price):"")+'</p>'+
  (checked?'<p>'+link(s.url,"확인된 판매처")+' · 확인: '+esc(date(s.checkedAt))+'</p>':(s.url?'<p>'+link(s.url,"판매처 후보 (미검증)")+'</p>':""))+
  '<p><b>릴스 게시일</b> '+esc(date(p.publishedAt))+'　<b>반응 확인일</b> '+esc(date(p.metricsObservedAt))+'</p>'+
  (p.sponsored!==undefined&&p.sponsored!==null?'<p><b>광고/협찬</b> '+esc(p.sponsored===true?"광고·협찬 표시 확인":p.sponsored===false?"표시 미발견 (비광고 확정 아님)":p.sponsored)+'</p>':"")+
  '</div>'+
  (p.recommendation?'<p class="mr-chat-reason"><b>모찌픽 추천 포인트</b> '+esc(p.recommendation)+'</p>':"")+
  (p.cautions?'<p><b>주의·추가 검증</b> '+esc(p.cautions)+'</p>':"")+
  (cross?'<p><b>교차 확인</b> '+cross+'</p>':"")+
  '<div class="mr-chat-links">'+link(p.reelUrl||p.sourceUrl||p.postUrl,"원본 게시물")+link(p.accountUrl,"게시 계정")+refs+'</div>'+
  '</article>'
}
function render(){
 if(!root||!ui)return;
 root.dataset.mozziChatReport="1";delete root.dataset.mozziLive;
 let html='<section class="mr-chat-report"><header><span>MOZZIPICK · CHAT RESEARCH REPORT</span><h2>'+esc(ui.command)+' · '+esc(titles[ui.command])+'</h2><p>이 채팅에서 조사한 결과만 표시합니다. 사이트 조회 시 외부 수집기를 실행하거나 상품을 자동 등록하지 않습니다.</p></header>';
 if(ui.status==="loading")html+='<p class="mr-chat-state" role="status">저장된 조사 보고서를 읽는 중입니다.</p>';
 else if(ui.status==="error")html+='<p class="mr-chat-state" role="alert">'+esc(ui.error||"보고서를 읽지 못했습니다.")+'</p>';
 else{
  const reports=ui.reports||[],r=reports[ui.reportIndex]||null;
  if(!r)html+='<div class="mr-chat-empty"><strong>아직 등록된 조사 보고서가 없습니다.</strong><p>이 채팅창에서 '+esc(ui.command)+'번 명령어를 실행하면 에이스가 실제 출처를 조사하고 확인 가능한 정보만 사이트 보고서에 등록할 수 있어요.</p><p>과거 등록 상품이나 임의의 조회수로 보고서를 채우지 않습니다.</p></div>';
  else{
   const a=Array.isArray(r.items)?r.items:[],perPage=5,pages=Math.max(1,Math.ceil(a.length/perPage)),page=Math.min(Math.max(1,ui.page),pages);
   ui.page=page;
   html+='<div class="mr-chat-summary"><strong>'+esc(r.title||titles[ui.command])+'</strong><p>'+esc(r.summary||"검증된 자료에 한해 표시")+'</p><small>조사 시각: '+esc(date(r.createdAt))+' · 기간: '+esc(r.period||"보고서 참조")+' · 결과: '+a.length+'개 · 자료 확인이 끝난 항목만 수록</small></div>';
   if(reports.length>1)html+='<label class="mr-chat-archives">이전 보고서 선택 <select data-chat-archive>'+reports.map((v,i)=>'<option value="'+i+'" '+(i===ui.reportIndex?"selected":"")+'>'+esc(v.title||titles[ui.command])+' · '+esc(date(v.createdAt))+'</option>').join("")+'</select></label>';
   html+='<div class="mr-chat-items">'+a.slice((page-1)*perPage,page*perPage).map((p,i)=>card(p,(page-1)*perPage+i)).join("")+'</div>';
   if(!a.length)html+='<p class="mr-chat-state">이번 조사에서 기준을 충족하는 상품이 없습니다.</p>';
   if(pages>1)html+='<nav class="mr-chat-pages" aria-label="보고서 페이지">'+Array.from({length:pages},(_,i)=>'<button type="button" data-chat-page="'+(i+1)+'" '+(i+1===page?'aria-current="page"':'')+'>'+(i+1)+'</button>').join("")+'</nav>';
   if(r.notes)html+='<p class="mr-chat-notes"><b>조사·검증 메모</b> '+esc(r.notes)+'</p>';
  }
 }
 html+='<div class="mr-chat-footer"><button type="button" data-chat-reload>최신 보고서 다시 읽기</button><small>보고서 입력 경로: 채팅 조사 → GitHub 보고서 저장 → 모찌픽 표시. 추가 검색·Apify·n8n 실행 없음.</small></div></section>';
 root.innerHTML=html;
 const reload=root.querySelector("[data-chat-reload]");if(reload)reload.onclick=()=>load();
 const sel=root.querySelector("[data-chat-archive]");if(sel)sel.onchange=()=>{push();ui.reportIndex=+sel.value||0;ui.page=1;render();save()};
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
 ui={command,page:Math.max(1,+previous?.page||1),reportIndex:Math.max(0,+previous?.reportIndex||0),status:"loading",reports:[]};
 render();load();
}
window.MozzipickChatReports={open,snapshot};
})();
