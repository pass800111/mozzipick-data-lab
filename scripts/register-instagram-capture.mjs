#!/usr/bin/env node
/**
 * Register one user-provided, usage-authorized reel screenshot as a local preview.
 * No Instagram API, scraper or paid service.
 * Usage: node scripts/register-instagram-capture.mjs SHORTCODE /path/to/cropped.png --use-approved
 * Input must be a screenshot of the exact linked post, not an unrelated product.
 */
import fs from 'node:fs';
import path from 'node:path';
const code=process.argv[2],input=process.argv[3],approved=process.argv.includes('--use-approved');
if(!/^[A-Za-z0-9_-]{9,24}$/.test(code||'')||!input||!approved){console.error('Usage: node scripts/register-instagram-capture.mjs SHORTCODE screenshot.png --use-approved');process.exit(2)}
const bytes=fs.readFileSync(input);if(bytes.length<100||bytes.length>8*1024*1024)throw Error('Screenshot must be a nonempty image up to 8 MB.');
let ext;
if(bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')))ext='png';
else if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)ext='jpg';
else if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')ext='webp';
else throw Error('Only valid PNG, JPEG or WebP images are supported.');
const inventoryPath='data/instagram-electronics.json',data=JSON.parse(fs.readFileSync(inventoryPath,'utf8'));
const all=['domestic','overseas'].flatMap(region=>(data[region]||[]).map(item=>({region,item})));
const matches=all.filter(x=>(x.item.reel||'').match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/)?.[1]===code);
if(matches.length!==1)throw Error('Require exactly one original reel with this shortcode, found '+matches.length);
const dir='assets/instagram';fs.mkdirSync(dir,{recursive:true});
const target=path.posix.join(dir,code+'.'+ext);fs.copyFileSync(input,target);
for(const suffix of ['png','jpg','webp']){const other=path.posix.join(dir,code+'.'+suffix);if(other!==target&&fs.existsSync(other))fs.rmSync(other)}
const record=matches[0].item;record.thumbnail=target;record.thumbnailSource='User-supplied screenshot, manually matched to original post '+code;record.thumbnailStatus='Locally hosted; image use approved by submitter';record.thumbnailCheckedAt=new Date().toISOString();
fs.writeFileSync(inventoryPath,JSON.stringify(data,null,2)+'\n','utf8');
console.log(JSON.stringify({updated:matches[0].region,shortcode:code,originalPost:record.reel,asset:target,bytes:bytes.length},null,2));
