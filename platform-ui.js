(()=>{"use strict";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function setupHeader(){
 const main=$(".main"),app=$(".app"),side=$(".side"),nav=side?.querySelector("nav"),search=$(".main>.global-search");
 if(main&&!$(".controls",main)){const compatibility=document.createElement("div");compatibility.className="controls";compatibility.hidden=true;main.insertBefore(compatibility,main.firstChild)}
 if(!app||!nav||!search||$("#mpPlatformHeader"))return;
 const header=document.createElement("header");header.id="mpPlatformHeader";header.className="mp-platform-header";
 header.innerHTML='<div class="mp-header-main"><button class="mp-brand" type="button" aria-label="모찌픽 DATA LAB 메인 홈"><span class="mp-brand-mark">M</span><span class="mp-brand-copy"><span class="mp-brand-title"><b>MOZZIPICK</b><em class="mp-version-badge">V3.4</em></span><small>모찌픽 DATA LAB</small></span><span class="mp-slogan">좋은건, 함께 쓰자! <i>♥</i></span></button><div class="mp-header-search"></div><div class="mp-header-actions"><button class="mp-quick" type="button" data-quick="favorites"><span>♥</span> 즐겨찾기</button><button class="mp-quick" type="button" data-quick="production"><span>▣</span> 제작관리</button><span class="mp-profile" aria-hidden="true">●</span><button class="mp-menu-toggle" type="button" aria-label="전체 메뉴" aria-expanded="false">☰</button></div></div><div class="mp-header-nav"></div>';
 document.body.insertBefore(header,app);
 const searchWrap=$(".mp-header-search",header);searchWrap.appendChild(search);
 const submit=document.createElement("button");submit.type="button";submit.className="mp-search-submit";submit.textContent="검색";search.querySelector("div")?.appendChild(submit);submit.onclick=()=>$("#productSearch")?.focus();
 $(".mp-header-nav",header).appendChild(nav);
 const icons={home:"⚡",time:"🏆",categories:"📊",viral:"🔥",instagram:"📸",favorites:"❤️",production:"🎬",quality:"✅"};
 const labels={home:"실시간 상품등록",time:"쿠팡 판매랭킹",categories:"등급",viral:"바이럴 레이더",instagram:"인스타 전자제품",favorites:"즐겨찾기",production:"제작관리",quality:"검증"};
 const homeBtn=$(".main-home-btn",nav);if(homeBtn){homeBtn.innerHTML='<i>🏠</i><span>홈</span>';homeBtn.dataset.platformHome="true"}
 $$("[data-view]",nav).forEach(b=>b.innerHTML='<i>'+(icons[b.dataset.view]||"•")+'</i><span>'+labels[b.dataset.view]+'</span>');
 const mobileLabels={home:"홈",time:"쿠팡",categories:"등급",viral:"바이럴",instagram:"인스타",favorites:"즐겨찾기",production:"제작관리",quality:"검증"};
 $$("footer [data-mobile-view]").forEach(b=>{const v=b.dataset.mobileView;b.innerHTML='<i>'+(icons[v]||"🏠")+'</i><span>'+(mobileLabels[v]||v)+'</span>'});
 $(".mp-menu-toggle",header).onclick=()=>{const open=document.body.classList.toggle("mp-nav-open");$(".mp-menu-toggle",header).setAttribute("aria-expanded",String(open))};
 $$("[data-quick]",header).forEach(b=>b.onclick=()=>document.querySelector('[data-view="'+b.dataset.quick+'"]')?.click());
}
function init(){setupHeader()}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();