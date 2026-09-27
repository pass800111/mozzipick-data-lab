#!/usr/bin/env node
/** Refine frame of POST-MATCHED originals only. This does not invent photos:
 *  all pixels originate in the verified source screenshot for the same reel.
 *  approved DdbwAIlJgdo reference asset is left byte-for-byte untouched.
 */
import fs from "node:fs";
import sharp from "sharp";
import {execFileSync} from "node:child_process";
const data=JSON.parse(fs.readFileSync("data/instagram-electronics.json","utf8"));
const originals=[...(data.domestic||[]),...(data.overseas||[])];
const log=[];
const metadata=async b=>sharp(b).metadata();
for(const p of originals){
 const code=p.reel?.match(/\/(?:p|reel)\/([A-Za-z0-9_-]+)/)?.[1];
 const file=p.thumbnail;
 if(!code||file!=="assets/instagram/"+code+".jpg"||!fs.existsSync(file)){log.push({code,status:"skip",reason:"not a verified local source"});continue}
 if(code==="DdbwAIlJgdo"){log.push({code,status:"approved-reference-unchanged"});continue}
 const original=execFileSync("git",["show","origin/snapshot/v34-26-original-posters-before-frame-refine-20260927:"+file],{maxBuffer:10*1024*1024}),before=await metadata(original);
 if(before.width!==360||before.height!==640){log.push({code,status:"skip",reason:"unexpected source geometry"});continue}
 try{
   const media1=await sharp(original).trim({background:"#172238",threshold:18}).toBuffer();
   const meta1=await metadata(media1);
   if(meta1.width<150||meta1.height<200){log.push({code,status:"skip",reason:"trim removed too much source"});continue}
   let content=media1,meta=meta1;
   // Detect embedded-video black sidebars by sampling each border column in
   // eight central rows. This accepts asymmetric sidebars without cutting content.
   const raw=await sharp(media1).removeAlpha().raw().toBuffer({resolveWithObject:true});
   const {data:pixels,info:{width:w,height:h,channels:ch}}=raw;
   const ys=[.15,.25,.35,.45,.55,.65,.75,.85].map(t=>Math.min(h-1,Math.floor(h*t)));
   function bar(x){
     let hits=0;
     for(const y of ys){const z=(y*w+x)*ch;
       if(Math.max(pixels[z],pixels[z+1],pixels[z+2])<30)hits++;
     }
     return hits>=6;
   }
   let left=0,right=0;
   while(left<Math.floor(w*.45)&&bar(left))left++;
   while(right<Math.floor(w*.45)&&bar(w-1-right))right++;
   if(left>=8&&right>=8&&w-left-right>=135){
     const clean=await sharp(media1).extract({left,top:0,width:w-left-right,height:h}).toBuffer();
     const cleanMeta=await metadata(clean);
     if(cleanMeta.width>=135&&cleanMeta.height>=220){content=clean;meta=cleanMeta}
   }
   const ratio=meta.height/meta.width;
   let output;
   if(ratio>=1.45){
     output=await sharp(content).resize(360,640,{fit:"cover",position:"centre"}).jpeg({quality:90,mozjpeg:true}).toBuffer();
   }else{
     // Original source on both layers: sharp background instead of artificial bars,
     // foreground is letterboxed without cutting off the original.
     const background=await sharp(content).resize(360,640,{fit:"cover"}).blur(20).modulate({brightness:.7}).toBuffer();
     const foreground=await sharp(content).resize(360,640,{fit:"contain",background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
     output=await sharp(background).composite([{input:foreground,top:0,left:0}]).jpeg({quality:90,mozjpeg:true}).toBuffer();
   }
   const finalMeta=await metadata(output);
   if(finalMeta.width!==360||finalMeta.height!==640||output.length<9000)throw Error("invalid refined image");
   fs.writeFileSync(file,output);
   p.thumbnailStatus="Verified original reel screenshot, source-only 9:16 framing, 360x640; reuse rights not independently verified";
   p.thumbnailFraming="Source-only crop / blurred source edge for nonportrait media";
   log.push({code,status:"refined",previous:[before.width,before.height],detectedMedia:[meta.width,meta.height],mode:ratio>=1.45?"portrait-crop":"source-blur-background",bytes:output.length});
 }catch(e){log.push({code,status:"failed",reason:String(e.message).slice(0,220)})}
}
if(log.some(x=>x.status==="refined"))fs.writeFileSync("data/instagram-electronics.json",JSON.stringify(data,null,2)+"\n");
fs.writeFileSync("instagram-poster-frame-report.json",JSON.stringify(log,null,2)+"\n");
console.log(JSON.stringify({refined:log.filter(x=>x.status==="refined").length,failed:log.filter(x=>x.status==="failed"),originalReference:log.filter(x=>x.status==="approved-reference-unchanged").length}));
