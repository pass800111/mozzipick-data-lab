/* MOZZIPICK V3.5 r29: authenticated-on-demand browser -> n8n discovery bridge.
 * No production webhook or secret is embedded in GitHub Pages. */
(function(){
 "use strict";
 const validCommands=new Set(["1","1-1","1-2","1-3"]);
 const titles={"1":"통합 바이럴 신규 발굴","1-1":"국내 인스타 신규 릴스 발굴","1-2":"해외 인스타 신규 릴스 발굴","1-3":"쿠팡 신규 통합랭킹 조사"};
 let endpoint="",accessKey="",state=null,view=null,callbacks={},seq=0;
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const isUrl=(url)=>{try{const u=new URL(url);return u.protocol==="https:"&&u.hostname==="pass800111.app.n8n.cloud"&&/^\/webhook\/[a-zA-Z0-9/_-]+$/.test(u.pathname)&&!u.search&&!u.hash}catch(e){return false}};
 const safeLink=(url)=>{try{const u=new URL(url);return u.protocol==="https:"&&["instagram.com","www.instagram.com","coupang.com","www.coupang.com","xiaohongshu.com","www.xiaohongshu.com","tiktok.com","www.tiktok.com","douyin.com","www.douyin.com"].includes(u.hostname)?u.href:""}catch(e){return ""}};
 const requestId=()=>typeof crypto!=="undefined"&&crypto.randomUUID?crypto.randomUUID():"mozzi-"+Date.now()+"-"+Math.random().toString(36).slice(2);
 const snap=()=>state?JSON.parse(JSON.stringify(state)):null;
 const save=()=>{if(typeof callbacks.save==="function")callbacks.save()};
 const push=()=>{if(typeof callbacks.push==="function")callbacks.push()};
 function message(text,kind){return '<p class="mr-live-message '+(kind||"")+'" role="status">'+esc(text)+'</p>'}
 function render(){
  if(!view||!state)return;
  view.dataset.mozziLive="1";const cmd=state.command,title=titles[cmd]||cmd;
  let html='<section class="mr-live-discovery"><header><span>MOZZIPICK LIVE DISCOVERY · '+esc(cmd)+'</span><h2>'+esc(title)+'</h2><p>이 기능은 기존 상품 검색이 아니라 n8n으로 새 수집 작업을 요청합니다. 실제 연결과 실행 여부를 분리해서 표시합니다.</p></header>';
  if(!endpoint){
   html+='<div class="mr-live-connect"><strong>n8n 실제 발굴 연결 대기</strong><p>Production Webhook URL과 접근 코드를 설정해야 새 검색을 실행할 수 있습니다. 현재 기존 저장 상품을 새 결과처럼 표시하지 않습니다.</p><label>n8n Production Webhook URL<input data-live-url type="url" spellcheck="false" autocomplete="off" placeholder="https://pass800111.app.n8n.cloud/webhook/…"></label><label>워크플로 접근 코드<input data-live-key type="password" autocomplete="new-password" placeholder="n8n에서 지정한 접근 코드"></label><button type="button" data-live-connect>이 탭에서 연결</button><small>Webhook URL과 접근 코드는 사이트 소스나 서버에 저장되지 않으며, 현재 열린 탭의 메모리에서만 사용합니다. n8n에는 해당 접근 코드를 검사하는 단계가 필요합니다.</small></div>';
  }else{
   html+='<div class="mr-live-ready"><span>● n8n 주소 입력됨 · 실제 연결 확인 전</span><button type="button" data-live-clear>연결 정보 지우기</button></div><div class="mr-live-actions"><button type="button" data-live-start '+(state.status==="requesting"?"disabled":"")+'>🔎 '+esc(cmd)+' 신규 검색 실행</button>'+(state.requestId?'<button type="button" data-live-check>결과 다시 확인</button>':'')+'</div>';
  }
  if(state.status==="requesting")html+=message("n8n에 새 검색을 요청 중입니다. 아직 수집·등록이 확인되지 않았습니다.","info");
  if(state.status==="accepted")html+=message("n8n에서 요청을 접수했습니다. 상품 검색 및 GitHub 결과 등록이 확인되기 전까지 완료로 표시하지 않습니다.","info");
  if(state.status==="failed")html+=message(state.error||"연결 또는 검색이 실패했습니다.","error");
  if(state.status==="done"){
   const rows=(Array.isArray(state.items)?state.items:[]).slice(0,20);
   html+='<div class="mr-report-summary"><b>실제 완료 '+rows.length+'개</b><b>신규 등록 '+(Number.isInteger(state.registeredCount)?state.registeredCount:"확인 전")+'</b><b>중복 제거 결과</b></div>';
   html+=rows.length?'<div class="mr-live-items">'+rows.map((p,i)=>{
    const nm=p.name||p.productKo||p.product||"상품명 미확인",source=safeLink(p.sourceUrl||p.reel||p.coupangUrl||p.url),date=p.postedAt||p.timestamp||p.observedAt||"",metrics=[p.views!=null?"조회 "+p.views:"",p.likes!=null?"좋아요 "+p.likes:"",p.comments!=null?"댓글 "+p.comments:""].filter(Boolean).join(" · ");
    return '<article class="mr-live-item"><b>'+(i+1)+'. '+esc(nm)+'</b><p>'+esc(p.description||p.evidence||"공개 근거 추가 검증 필요")+'</p><small>'+esc(metrics+(date?" · "+String(date).slice(0,10):""))+'</small>'+(source?'<a href="'+esc(source)+'" target="_blank" rel="noopener noreferrer">검증 출처 열기 ↗</a>':'<span>검증 출처 미등록</span>')+'</article>';
   }).join("")+'</div>':message("신규 조건을 만족한 상품이 없어 등록하지 않았습니다.","info");
   html+='<small>결과는 n8n이 반환하거나 GitHub 결과 파일에 기록한 값만 표시합니다. 수집 지표를 임의로 생성하지 않습니다.</small>';
  }
  if(state.requestId)html+='<small class="mr-live-runid">요청 ID: '+esc(state.requestId)+'</small>';
  html+='</section>';view.innerHTML=html;
  const connect=view.querySelector("[data-live-connect]");
  if(connect)connect.onclick=()=>{
   const url=view.querySelector("[data-live-url]")?.value?.trim()||"",key=view.querySelector("[data-live-key]")?.value||"";
   if(!isUrl(url)){state.status="failed";state.error="해당 n8n 작업공간의 HTTPS Production Webhook URL을 입력해 주세요. webhook-test 주소나 다른 서버 주소는 사용할 수 없습니다.";render();save();return}
   if(key.length<12){state.status="failed";state.error="n8n에서 검증할 접근 코드를 12자 이상 입력해 주세요.";render();save();return}
   endpoint=url;accessKey=key;state.status="ready";state.error="";render();save();
  };
  const clear=view.querySelector("[data-live-clear]");
  if(clear)clear.onclick=()=>{endpoint="";accessKey="";state={command:cmd,status:"idle"};render();save()};
  const start=view.querySelector("[data-live-start]");
  if(start)start.onclick=()=>execute(cmd);
  const check=view.querySelector("[data-live-check]");
  if(check)check.onclick=()=>checkResult();
 }
 function validResult(body,id){
  if(!body||typeof body!=="object"||body.requestId!==id||body.status!=="completed"||!Array.isArray(body.items))return false;
  return body.items.length<=20&&body.items.every(p=>p&&typeof p==="object"&&typeof (p.name||p.productKo||p.product)==="string");
 }
 async function checkResult(){
  if(!state?.requestId)return;
  const id=state.requestId;
  if(!/^[a-zA-Z0-9-]{8,96}$/.test(id))return;
  try{
   const res=await fetch("data/discovery-runs/"+encodeURIComponent(id)+".json?v="+Date.now(),{cache:"no-store"});
   if(res.status===404){state.status="accepted";render();save();return}
   if(!res.ok)throw Error("결과 파일 응답 오류: HTTP "+res.status);
   const body=await res.json();
   if(body.requestId!==id)throw Error("결과 파일의 요청 ID가 일치하지 않습니다.");
   if(body.status==="failed"){state.status="failed";state.error=String(body.error||"워크플로 실패");render();save();return}
   if(body.status!=="completed"){state.status="accepted";render();save();return}
   if(!validResult(body,id))throw Error("n8n 결과 파일 형식 또는 출처 데이터가 잘못되었습니다.");
   state={command:state.command,requestId:id,status:"done",items:body.items,registeredCount:Number.isInteger(body.registeredCount)?body.registeredCount:null};
   render();save();
  }catch(err){state.status="failed";state.error="결과 확인 실패: "+String(err.message||err);render();save()}
 }
 async function execute(cmd){
  if(!endpoint||!accessKey||!validCommands.has(cmd)||state?.status==="requesting")return;
  ++seq;const current=seq,id=requestId();
  push();state={command:cmd,requestId:id,status:"requesting",items:[],registeredCount:null};render();save();
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),55000);
  const payload={schema:"mozzipick.discovery.v1",command:cmd,requestId:id,requestedAt:new Date().toISOString(),limit:cmd==="1-1"||cmd==="1-2"?20:30,days:cmd==="1-1"||cmd==="1-2"?14:null,origin:location.origin,accessKey};
  try{
   // text/plain is a simple browser POST, avoiding an unnecessary CORS preflight.
   const response=await fetch(endpoint,{method:"POST",mode:"cors",redirect:"error",cache:"no-store",credentials:"omit",headers:{"Content-Type":"text/plain;charset=UTF-8"},body:JSON.stringify(payload),signal:controller.signal});
   if(!response.ok)throw Error("n8n HTTP "+response.status+" · 접근 코드 또는 Production Webhook 설정을 확인하세요.");
   const body=await response.json().catch(()=>null);
   if(!body||body.requestId!==id||body.ok!==true||!["accepted","completed"].includes(body.status))throw Error("Webhook이 정해진 응답 형식을 반환하지 않았습니다. 'Workflow got started' 문구만으로는 실행 성공을 확인할 수 없습니다.");
   if(current!==seq||state?.requestId!==id)return;
   if(body.status==="completed"){
    if(!validResult(body,id))throw Error("완료 보고서에 유효한 상품 목록 또는 요청 ID가 없습니다.");
    state={command:cmd,requestId:id,status:"done",items:body.items,registeredCount:Number.isInteger(body.registeredCount)?body.registeredCount:null};
   }else state.status="accepted";
   render();save();
   if(state.status==="accepted")checkResult();
  }catch(err){
   if(current!==seq||state?.requestId!==id)return;
   state.status="failed";state.error=err.name==="AbortError"?"n8n 응답 제한 시간을 초과했습니다. 중복 실행 전에 n8n 실행 기록을 확인하세요.":String(err.message||err);render();save();
  }finally{clearTimeout(timeout)}
 }
 function open(cmd,root,cb,previous){
  if(!validCommands.has(cmd)||!root)return;
  view=root;callbacks=cb||{};state=previous?JSON.parse(JSON.stringify(previous)):{command:cmd,status:"idle"};render();save();
 }
 function snapshot(root){return root&&root.dataset.mozziLive==="1"&&root===view?snap():null}
 window.MozzipickDiscovery={open,snapshot,connected:()=>!!endpoint,validUrl:isUrl};
})();
