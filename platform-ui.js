(()=>{"use strict";
const state={products:[],homeBuilt:false};
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function setupHeader(){
 const main=$(".main");if(main&&!$(".controls",main)){const compatibility=document.createElement("div");compatibility.className="controls";compatibility.hidden=true;main.insertBefore(compatibility,main.firstChild)}
 const app=$(".app"),side=$(".side"),nav=side?.querySelector("nav"),search=$(".main>.global-search");
 if(!app||!nav||!search||$("#mpPlatformHeader"))return;
 const header=document.createElement("header");header.id="mpPlatformHeader";header.className="mp-platform-header";
 header.innerHTML='<div class="mp-header-main"><button class="mp-brand" type="button" aria-label="모찌픽 DATA LAB 메인 홈"><span class="mp-brand-mark">M</span><span class="mp-brand-copy"><b>MOZZIPICK</b><small>모찌픽 DATA LAB</small></span></button><div class="mp-header-search"></div><div class="mp-header-actions"><button class="mp-quick" type="button" data-quick="favorites">♡ 즐겨찾기</button><button class="mp-quick" type="button" data-quick="production">▣ 제작관리</button><button class="mp-menu-toggle" type="button" aria-label="전체 메뉴" aria-expanded="false">☰</button></div></div><div class="mp-header-nav"></div>';
 document.body.insertBefore(header,app);
 $(".mp-header-search",header).appendChild(search);$(".mp-header-nav",header).appendChild(nav);
 const homeBtn=$(".main-home-btn",nav);
 if(homeBtn){homeBtn.innerHTML='⌂ <span>홈</span>';homeBtn.dataset.platformHome="true"}
 $("[data-view=home] span",nav).textContent="실시간 상품등록";
 $(".mp-brand",header).addEventListener("click",showHome);
 $(".mp-menu-toggle",header).addEventListener("click",()=>{const open=document.body.classList.toggle("mp-nav-open");$(".mp-menu-toggle",header).setAttribute("aria-expanded",String(open))});
 $$("[data-quick]",header).forEach(b=>b.addEventListener("click",()=>clickView(b.dataset.quick)));
 nav.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.platformHome!==undefined){setTimeout(showHome,0)}else if(b.dataset.view){leaveHome(b.dataset.view)}closeMenu()});
 const mobileHome=$("footer [data-mobile-view=home]");if(mobileHome)mobileHome.addEventListener("click",()=>setTimeout(showHome,0),true);
 $$("footer [data-mobile-view]").forEach(b=>{if(b.dataset.mobileView!=="home")b.addEventListener("click",()=>leaveHome(b.dataset.mobileView),true)});
}
function closeMenu(){document.body.classList.remove("mp-nav-open");$(".mp-menu-toggle")?.setAttribute("aria-expanded","false")}
function clickView(view){const b=$('[data-view="'+view+'"]');if(b){b.click();leaveHome(view);closeMenu()}}
function createHome(){
 const main=$(".main"),anchor=$("#menuDataView");if(!main||!anchor||$("#mpPlatformHome"))return;
 const home=document.createElement("section");home.id="mpPlatformHome";home.className="mp-platform-home";
 home.innerHTML='<div class="mp-home-hero"><div class="mp-home-hero-inner"><span class="mp-home-eyebrow">MOZZIPICK DATA INTELLIGENCE</span><h1>콘텐츠가 되는 상품을<br>가장 빠르게 발견하세요</h1><p>실시간 상품 데이터, 바이럴 신호, 쿠팡 랭킹을 한곳에서 확인합니다.</p><div class="mp-home-search-trigger" role="button" tabindex="0"><span>⌕</span><b>제품명 · 브랜드 · 카테고리 · 중국어 검색어 검색</b></div></div></div><div class="mp-category-row">'+[
 ["⌁","실시간 상품","home"],["◷","쿠팡 랭킹","time"],["▦","등급","categories"],["✦","바이럴","viral"],["◎","인스타","instagram"],["♡","즐겨찾기","favorites"],["▣","제작관리","production"],["✓","검증","quality"]
 ].map(x=>'<button class="mp-category" type="button" data-home-view="'+x[2]+'"><i>'+x[0]+'</i><b>'+x[1]+'</b></button>').join("")+'</div><div id="mpHomeSections"></div>';
 main.insertBefore(home,anchor);
 $(".mp-home-search-trigger",home).addEventListener("click",focusSearch);$(".mp-home-search-trigger",home).addEventListener("keydown",e=>{if(e.key==="Enter")focusSearch()});
 $$("[data-home-view]",home).forEach(b=>b.addEventListener("click",()=>clickView(b.dataset.homeView)));
}
function focusSearch(){const input=$("#productSearch");if(!input)return;document.body.classList.remove("mp-nav-open");input.closest(".global-search").scrollIntoView({behavior:"smooth",block:"center"});input.focus()}
function card(p){
 const image=p.image||"assets/products/image-fallback.svg",grade=p.viralGrade||p.grade||"미확인",rank=p.rank?"랭킹 "+p.rank:"랭킹 미확인";
 return '<button class="mp-showcase-card" type="button" data-home-product="'+esc(p.id)+'"><span class="mp-showcase-image"><img src="'+esc(image)+'" alt="'+esc(p.name)+'" loading="lazy" onerror="this.src=\'assets/products/image-fallback.svg\'"></span><span class="mp-showcase-body"><b class="mp-showcase-title">'+esc(p.name)+'</b><small class="mp-showcase-meta">'+esc(p.category||"카테고리 미확인")+' · '+esc(p.release||"등록일 미확인")+'</small><span class="mp-badges"><em class="mp-badge hot">'+esc(grade)+'등급</em><em class="mp-badge">'+esc(rank)+'</em></span></span></button>';
}
function section(title,items,view){
 return '<section class="mp-home-section"><div class="mp-home-section-head"><h2>'+title+'</h2><button type="button" data-section-view="'+view+'">전체보기 →</button></div><div class="mp-showcase-grid">'+(items.length?items.slice(0,4).map(card).join(""):'<div class="mp-home-empty">현재 조건에 맞는 실제 데이터가 없습니다.</div>')+'</div></section>';
}
function buildHome(){
 if(!state.products.length)return;
 const all=[...state.products].sort((a,b)=>new Date(b.siteUpdatedAt||0)-new Date(a.siteUpdatedAt||0)||Number(a.rank||999)-Number(b.rank||999));
 const viral=all.filter(p=>p.viralRadar||["A","B"].includes(p.viralGrade));
 const coupang=all.filter(p=>p.coupangEligible||(!p.rankingExcluded&&p.coupangStatus==="확인"));
 const reels=all.filter(p=>p.reelsRecommended);
 const html=section("🔥 지금 바이럴 급상승",viral,"viral")+section("🏆 쿠팡 인기상품",coupang,"time")+section("🎬 릴스 제작 추천",reels,"production")+section("지금 모찌픽이 주목하는 상품",all,"home");
 const root=$("#mpHomeSections");if(!root)return;root.innerHTML=html;
 $$("[data-section-view]",root).forEach(b=>b.addEventListener("click",()=>clickView(b.dataset.sectionView)));
 $$("[data-home-product]",root).forEach(b=>b.addEventListener("click",()=>openProduct(b.dataset.homeProduct)));
 state.homeBuilt=true;
}
async function openProduct(id){
 let original=$('#ranking [data-product-id="'+CSS.escape(id)+'"]');
 if(original){original.click();return}
 clickView("home");
 await new Promise(r=>setTimeout(r,180));
 const pages=$$(".home-pager-v18 button");
 for(const page of pages){page.click();await new Promise(r=>setTimeout(r,180));original=$('#ranking [data-product-id="'+CSS.escape(id)+'"]');if(original){original.click();return}}
 const p=state.products.find(x=>x.id===id),input=$("#productSearch");if(input&&p){input.value=p.name;input.dispatchEvent(new Event("input",{bubbles:true}));input.focus()}
}
function showHome(){
 document.body.classList.add("mp-home-active");closeMenu();
 $$(".mp-header-nav nav button").forEach(b=>b.classList.remove("mp-home-current"));
 $(".main-home-btn")?.classList.add("mp-home-current");
 window.scrollTo({top:0,behavior:"smooth"});
}
function leaveHome(view){
 document.body.classList.remove("mp-home-active");$(".main-home-btn")?.classList.remove("mp-home-current");
 requestAnimationFrame(()=>updateContext(view));
}
function setupListShell(){
 const panel=$("#menuDataView");if(!panel||panel.parentElement?.classList.contains("mp-list-shell"))return;
 const shell=document.createElement("div");shell.className="mp-list-shell";shell.hidden=true;
 shell.innerHTML='<aside class="mp-filter-aside"><h3>세부 탐색</h3><div class="mp-filter-group"><b>메뉴</b><button type="button" data-filter-view="categories">등급별 상품</button><button type="button" data-filter-view="viral">바이럴 후보</button><button type="button" data-filter-view="time">쿠팡 랭킹</button></div><div class="mp-filter-group"><b>관리</b><button type="button" data-filter-view="favorites">즐겨찾기</button><button type="button" data-filter-view="production">제작 상태</button></div></aside><div class="mp-view-content"><div class="mp-view-toolbar"><strong id="mpViewLabel">상품 탐색</strong><span>검증된 실제 데이터 기준</span></div></div>';
 panel.parentNode.insertBefore(shell,panel);$(".mp-view-content",shell).appendChild(panel);
 $$("[data-filter-view]",shell).forEach(b=>b.addEventListener("click",()=>clickView(b.dataset.filterView)));
 const observer=new MutationObserver(()=>{if(!document.body.classList.contains("mp-home-active"))shell.hidden=panel.hidden});
 observer.observe(panel,{attributes:true,attributeFilter:["hidden"],childList:true,subtree:false});
}
function updateContext(view){
 const names={home:"실시간 상품등록",time:"쿠팡 판매랭킹",categories:"등급별 상품",viral:"바이럴 레이더",instagram:"인스타 전자제품",favorites:"즐겨찾기",production:"제작관리",quality:"데이터 검증"};
 const label=$("#mpViewLabel");if(label)label.textContent=names[view]||"상품 탐색";
 const shell=$(".mp-list-shell"),panel=$("#menuDataView");if(shell&&panel)shell.hidden=panel.hidden&&view==="home";
}
async function loadProducts(){
 try{const r=await fetch("data/products.json?platform="+Date.now(),{cache:"no-store"});const j=await r.json();state.products=Array.isArray(j)?j:(j.products||[]);buildHome()}catch(e){console.warn("Platform home data load failed",e)}
}
function qualityGuard(){
 document.addEventListener("click",e=>{const b=e.target.closest?.('[data-view="quality"],[data-mobile-view="quality"]');if(!b)return;setTimeout(()=>{$$("#menuDataView .coupang-rank-panel,#menuDataView .coupang-select,#menuDataView [data-coupang-section]").forEach(x=>x.remove())},180)},true)
}
function init(){setupHeader();createHome();setupListShell();qualityGuard();loadProducts();showHome()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,0));else setTimeout(init,0);
})();