(()=>{"use strict";
const state={products:[],homeBuilt:false};
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function setupHeader(){
 const main=$(".main");if(main&&!$(".controls",main)){const compatibility=document.createElement("div");compatibility.className="controls";compatibility.hidden=true;main.insertBefore(compatibility,main.firstChild)}
 const app=$(".app"),side=$(".side"),nav=side?.querySelector("nav"),search=$(".main>.global-search");
 if(!app||!nav||!search||$("#mpPlatformHeader"))return;
 const header=document.createElement("header");header.id="mpPlatformHeader";header.className="mp-platform-header";
 header.innerHTML='<div class="mp-header-main"><button class="mp-brand" type="button" aria-label="모찌픽 DATA LAB 메인 홈"><span class="mp-brand-mark">M</span><span class="mp-brand-copy"><b>MOZZIPICK</b><small>모찌픽 DATA LAB</small></span><span class="mp-slogan">좋은건, 함께 쓰자! <i>♥</i></span></button><div class="mp-header-search"></div><div class="mp-header-actions"><button class="mp-quick" type="button" data-quick="favorites"><span>♥</span> 즐겨찾기</button><button class="mp-quick" type="button" data-quick="production"><span>▣</span> 제작관리</button><span class="mp-profile" aria-hidden="true">●</span><button class="mp-menu-toggle" type="button" aria-label="전체 메뉴" aria-expanded="false">☰</button></div></div><div class="mp-header-nav"></div>';
 document.body.insertBefore(header,app);
 const searchWrap=$(".mp-header-search",header);searchWrap.appendChild(search);const submit=document.createElement("button");submit.type="button";submit.className="mp-search-submit";submit.textContent="검색";submit.onclick=()=>$("#productSearch")?.focus();search.querySelector("div")?.appendChild(submit);
 $(".mp-header-nav",header).appendChild(nav);
 const icons={home:"⚡",time:"🏆",categories:"📊",viral:"🔥",instagram:"📸",favorites:"❤️",production:"🎬",quality:"✅"};
 const labels={home:"실시간 상품등록",time:"쿠팡 판매랭킹",categories:"등급",viral:"바이럴 레이더",instagram:"인스타 전자제품",favorites:"즐겨찾기",production:"제작관리",quality:"검증"};
 const homeBtn=$(".main-home-btn",nav);if(homeBtn){homeBtn.innerHTML='<i>🏠</i><span>홈</span>';homeBtn.dataset.platformHome="true"}
 $$("[data-view]",nav).forEach(b=>b.innerHTML='<i>'+(icons[b.dataset.view]||"•")+'</i><span>'+labels[b.dataset.view]+'</span>');
 const mobileIcons={home:"🏠",time:"🏆",categories:"📊",viral:"🔥",instagram:"📸",favorites:"❤️",production:"🎬",quality:"✅"};
 $$("footer [data-mobile-view]").forEach(b=>{const v=b.dataset.mobileView;b.innerHTML='<i>'+mobileIcons[v]+'</i><span>'+labels[v].replace(" 판매","").replace(" 전자제품","")+'</span>'});
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
 home.innerHTML='<div class="mp-category-row">'+[
 ["⚡","실시간 상품","home","peach"],["🏆","쿠팡 랭킹","time","blue"],["📊","등급","categories","green"],["🔥","바이럴","viral","pink"],["📸","인스타","instagram","purple"],["🎁","즐겨찾기","favorites","yellow"],["🎬","제작관리","production","lavender"],["✅","검증","quality","mint"]
 ].map(x=>'<button class="mp-category '+x[3]+'" type="button" data-home-view="'+x[2]+'"><i>'+x[0]+'</i><b>'+x[1]+'</b></button>').join("")+'</div><div id="mpHomeSections"></div>';
 main.insertBefore(home,anchor);
 $$("[data-home-view]",home).forEach(b=>b.addEventListener("click",()=>clickView(b.dataset.homeView)));
}
function focusSearch(){const input=$("#productSearch");if(!input)return;document.body.classList.remove("mp-nav-open");input.closest(".global-search").scrollIntoView({behavior:"smooth",block:"center"});input.focus()}
function card(p){
 const image=p.image||"assets/products/image-fallback.svg",grade=p.viralGrade||p.grade||"미확인",rank=p.rank?"랭킹 "+p.rank:"",price=p.coupangPrice||p.price||"가격 미확인",reviews=p.reviews&&p.reviews!=="확인 중"?p.reviews:"",desc=p.spec||p.viralEvidence||p.category||"상품 정보 확인 중",viral=p.viralRadar||p.reelsRecommended;
 const stats=[reviews?"리뷰 "+reviews:"",rank].filter(Boolean).join(" · ");
 return '<button class="mp-showcase-card" type="button" data-home-product="'+esc(p.id)+'"><span class="mp-showcase-image"><img src="'+esc(image)+'" alt="'+esc(p.name)+'" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback=\'1\';this.src=\'assets/products/image-fallback.svg\'}"><span class="mp-card-flags">'+(viral?'<em>🔥 급상승</em>':'')+'<b>'+esc(grade)+'등급</b></span><i class="mp-card-heart">♡</i></span><span class="mp-showcase-body"><b class="mp-showcase-title">'+esc(p.name)+'</b><small class="mp-card-desc">'+esc(desc)+'</small><strong class="mp-card-price">'+esc(price)+'</strong><small class="mp-showcase-meta">'+esc(stats||p.category||"데이터 확인 중")+'</small><span class="mp-badges"><em class="mp-badge">'+esc(p.category||"카테고리 미확인")+'</em><em class="mp-badge">'+esc(p.status||p.coupangStatus||"수집 중")+'</em></span></span></button>';
}
function section(title,items,view,subtitle=""){
 return '<section class="mp-home-section"><div class="mp-home-section-head"><div><h2>'+title+'</h2>'+(subtitle?'<p>'+subtitle+'</p>':'')+'</div><button type="button" data-section-view="'+view+'">전체보기 →</button></div><div class="mp-showcase-grid">'+(items.length?items.slice(0,4).map(card).join(""):'<div class="mp-home-empty">현재 조건에 맞는 실제 데이터가 없습니다.</div>')+'</div></section>';
}
function openProduct(id){const target=[...document.querySelectorAll("[data-detail]")].find(x=>x.dataset.detail===String(id));if(target){target.click();return}const nav=document.querySelector("[data-view=home]");if(nav)nav.click()}
function buildHome(){
 if(!state.products.length)return;
 const all=[...state.products].sort((a,b)=>new Date(b.siteUpdatedAt||0)-new Date(a.siteUpdatedAt||0)||Number(a.rank||999)-Number(b.rank||999));
 const viral=all.filter(p=>p.viralRadar||["A","B"].includes(p.viralGrade));
 const coupang=all.filter(p=>p.coupangEligible||(!p.rankingExcluded&&p.coupangStatus==="확인"));
 const reels=all.filter(p=>p.reelsRecommended);
 const html=section("🔥 지금 바이럴 급상승",viral,"viral","요즘 가장 핫한 상품만 모았어요!")+section("🏆 쿠팡 인기상품",coupang,"time","실제 확인된 쿠팡 상품 데이터")+section("🎬 릴스 제작 추천",reels,"production","콘텐츠 제작 가능성이 높은 상품")+section("지금 모찌픽이 주목하는 상품",all,"home","최신 등록·수집 데이터를 기준으로 선별");
 const root=$("#mpHomeSections");if(!root)return;root.innerHTML=html;
 $$("[data-section-view]",root).forEach(b=>b.addEventListener("click",()=>clickView(b.dataset.sectionView)));
 $$("[data-home-product]",root).forEach(b=>b.addEventListener("click",()=>openProduct(b.dataset.homeProduct)));
 state.homeBuilt=true;
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
function init(){document.body.classList.remove("mp-nav-open");setupHeader();document.body.classList.remove("mp-nav-open");createHome();setupListShell();qualityGuard();loadProducts();showHome()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,0));else setTimeout(init,0);
})();