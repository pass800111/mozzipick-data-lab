#!/usr/bin/env node
/**
 * Exact Instagram original-poster capture for MOZZIPICK. Source is the public
 * original Instagram embed, not product-image search or synthesized artwork.
 * 360 x 640 JPEG as in the approved first thumbnail.
 *
 * No screenshot is accepted unless the actual media-sized element is present,
 * loaded and visually non-flat. Failed posts are left unchanged and reported.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const dataPath = "data/instagram-electronics.json";
const imageDir = "assets/instagram";
const reportPath = "instagram-poster-capture-report.json";
const chatPath = "data/command-reports.json";
const stock = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const chat = JSON.parse(fs.readFileSync(chatPath, "utf8"));
const originals = [...(stock.domestic || []), ...(stock.overseas || [])];
const chatEntries = (chat.reports?.["1-1"] || [])
 .filter(r=>r.command==="1-1"&&Array.isArray(r.items))
 .flatMap(r=>r.items.map(item=>{
  const author=String(item.accountUrl||"").match(/^https:\/\/www\.instagram\.com\/([A-Za-z0-9._]+)\/?$/i)?.[1]||"";
  return {reel:item.reelUrl,username:author,thumbnail:item.thumbnail||"",reportItem:item};
 }));
const entries = [...originals, ...chatEntries];
fs.mkdirSync(imageDir, { recursive: true });
const browser = await chromium.launch({headless:true, args:["--disable-dev-shm-usage"]});
const context = await browser.newContext({
  viewport:{width:440,height:940},deviceScaleFactor:1,
  locale:"en-US",
  userAgent:"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
});
const reports=[];
const sleep=ms=>new Promise(ok=>setTimeout(ok,ms));
function shortcode(url) {
  const m=String(url||"").match(/^https:\/\/www\.instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)\/?(?:\?.*)?$/i);
  return m?.[1]||"";
}
async function capture(p, index) {
  const code=shortcode(p.reel), output=path.join(imageDir,code+".jpg");
  if(!code) return {status:"skip",reason:"missing or unexpected exact original Instagram URL"};
  if(p.thumbnail===output&&fs.existsSync(output))return {status:"existing",code};
  // Source-matched local poster already captured in an earlier run: attach without recapture.
  if(fs.existsSync(output)){
    const m=await sharp(output).metadata();
    if(m.width===360&&m.height===640){
      p.thumbnail=output;
      p.thumbnailSource="Exact original Instagram poster for "+code;
      p.thumbnailStatus="Original reel and shortcode matched; image reuse rights not independently verified";
      if(p.reportItem)Object.assign(p.reportItem,{thumbnail:output,thumbnailSource:p.thumbnailSource,thumbnailStatus:p.thumbnailStatus});
      return {status:"reused-local",code};
    }
  }
  const page=await context.newPage();
  try{
    const url="https://www.instagram.com/p/"+code+"/embed/captioned/";
    const response=await page.goto(url,{waitUntil:"domcontentloaded",timeout:35000});
    await page.waitForTimeout(3000);
    if(response?.status()>=400)throw Error("official embed HTTP "+response.status());
    if(!page.url().includes(code))throw Error("unexpected source redirect");
    const invalid=await page.locator("body").innerText({timeout:7000}).catch(()=>"");
    if(/Sorry, this page isn't available|Page Not Found|Content unavailable/i.test(invalid))throw Error("official post unavailable");
    const author=String(p.username||"").toLowerCase().replace(/^@/,"");
    if(author&&!invalid.toLowerCase().includes(author))throw Error("source account not confirmed in original embed");

    // The official post's media image is normally the largest visible image.
    // Avatars, logos, blurred backgrounds and placeholder SVGs are excluded.
    await page.waitForFunction(()=>{
      return [...document.querySelectorAll("img")].some(im=>{
        const r=im.getBoundingClientRect();
        return im.complete&&im.naturalWidth>=240&&im.naturalHeight>=200&&
          r.width>=230&&r.height>=180&&getComputedStyle(im).visibility!=="hidden";
      });
    },{timeout:15000}).catch(()=>{});
    const candidates=await page.evaluate(()=>[...document.querySelectorAll("img")].map((im,i)=>{
      const r=im.getBoundingClientRect();
      return {i,w:r.width,h:r.height,nw:im.naturalWidth,nh:im.naturalHeight,alt:im.alt||"",src:im.currentSrc||im.src||"",complete:im.complete};
    }).filter(x=>x.complete&&x.nw>=240&&x.nh>=200&&x.w>=230&&x.h>=180&&
      !/profile|avatar|logo/i.test(x.alt+" "+x.src)).sort((a,b)=>(b.w*b.h)-(a.w*a.h)));
    if(!candidates.length)throw Error("no verified media-sized original poster found in embed");
    const best=candidates[0];
    const img=page.locator("img").nth(best.i);
    const raw=await img.screenshot({animations:"disabled",timeout:15000});
    const meta=await sharp(raw).metadata(),stats=await sharp(raw).stats();
    const avg=stats.channels.slice(0,3).reduce((acc,ch)=>acc+ch.stdev,0)/3;
    if(meta.width<230||meta.height<180||avg<9)throw Error("poster appears unloaded, solid or too small");
    const fit=meta.height/meta.width>=1.5?"cover":"contain";
    const processed=await sharp(raw).rotate().resize(360,640,{fit,position:"centre",background:"#172238"}).jpeg({quality:88,mozjpeg:true}).toBuffer();
    const v=await sharp(processed).metadata();
    if(v.width!==360||v.height!==640||processed.length<9000)throw Error("poster output size/quality invalid");
    fs.writeFileSync(output,processed);
    p.thumbnail=output.replace(/\\/g,"/");
    p.thumbnailSource="Screenshot of official original Instagram embed for "+code;
    p.thumbnailStatus="Official post and account cross-checked, original media screenshot captured 360x640; image reuse rights not independently verified";
    p.thumbnailCapturedAt=new Date().toISOString();
    if(p.reportItem)Object.assign(p.reportItem,{
      thumbnail:p.thumbnail,thumbnailSource:p.thumbnailSource,thumbnailStatus:p.thumbnailStatus,thumbnailCapturedAt:p.thumbnailCapturedAt
    });
    return {status:"captured",code,source:p.reel,dimensions:[best.nw,best.nh],bytes:processed.length};
  }catch(err){return {status:"failed",code,reason:String(err?.message||err).slice(0,230)}}
  finally{await page.close().catch(()=>{});}
}
try{
 for(let i=0;i<entries.length;i++){
   const p=entries[i],report=await capture(p,i);
   reports.push({index:i,region:i<stock.domestic.length?"domestic":i<originals.length?"overseas":"chat-domestic",reel:p.reel,...report});
   console.log(JSON.stringify(reports.at(-1)));
   // Avoid burst loads on Instagram and allow each publicly embedded original to render.
   if(report.status!=="existing")await sleep(1200);
 }
}finally{await browser.close();}
const captured=reports.filter(x=>x.status==="captured").length;
const chatMatched=reports.slice(originals.length).filter(x=>["captured","reused-local","existing"].includes(x.status)).length;
if(reports.slice(0,originals.length).some(x=>x.status==="captured"))fs.writeFileSync(dataPath,JSON.stringify(stock,null,2)+"\n");
if(chatMatched){chat.updatedAt=new Date().toISOString();fs.writeFileSync(chatPath,JSON.stringify(chat,null,2)+"\n")}
fs.writeFileSync(reportPath,JSON.stringify({
  generatedAt:new Date().toISOString(),total:entries.length,existing:reports.filter(x=>x.status==="existing").length,
  captured,chatMatched,failed:reports.filter(x=>x.status==="failed").length,reports
},null,2)+"\n");
console.log("Original reel capture report: "+captured+" added, "+reports.filter(x=>x.status==="failed").length+" still unverified.");
