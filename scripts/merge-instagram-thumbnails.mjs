#!/usr/bin/env node
/**
 * Match authorized Apify/Instagram post metadata to the existing reel inventory.
 * Usage: node scripts/merge-instagram-thumbnails.mjs apify-export.json [--write]
 * Dry-run by default; does not download images, crawl Instagram, or overwrite existing
 * verified/local thumbnails. Only source records for the exact same reel are accepted.
 */
import fs from 'node:fs';
const input=process.argv[2],write=process.argv.includes('--write');
if(!input){console.error('Usage: node scripts/merge-instagram-thumbnails.mjs apify-export.json [--write]');process.exit(2)}
const target='data/instagram-electronics.json';
const inventory=JSON.parse(fs.readFileSync(target,'utf8'));
const raw=JSON.parse(fs.readFileSync(input,'utf8'));
const records=Array.isArray(raw)?raw:Array.isArray(raw.items)?raw.items:Array.isArray(raw.results)?raw.results:[...(raw.domestic||[]),...(raw.overseas||[])];
function key(v){if(!v)return'';const s=String(v).trim();const m=s.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/i);return m?m[1]:(/^[A-Za-z0-9_-]{9,24}$/.test(s)?s:'')}
function imageOf(p){return [p.thumbnail,p.thumbnailUrl,p.thumbnail_url,p.displayUrl,p.videoThumbnail,p.coverUrl,p.cover,p.imageUrl,p.previewUrl].find(v=>typeof v==='string'&&/^https:\/\//i.test(v.trim())&&!/\s/.test(v))||''}
const from=new Map();for(const p of records){const k=key(p.reel||p.url||p.postUrl||p.post_url||p.permalink||p.inputUrl||p.shortCode||p.shortcode);const v=imageOf(p);if(k&&v)from.set(k,{image:v,source:p.reel||p.url||p.postUrl||p.post_url||p.permalink||p.inputUrl||''})}
let added=0,skipped=0;const missing=[];
for(const region of ['domestic','overseas'])for(const p of inventory[region]||[]){
 const k=key(p.reel),ref=from.get(k);if(p.thumbnail){skipped++;continue}
 if(!k||!ref){missing.push({region,reel:p.reel||''});continue}
 p.thumbnail=ref.image;
 p.thumbnailSource='Post-matched metadata export; image loading and reuse rights require verification';
 p.thumbnailStatus='URL supplied / image and permission not independently verified';
 added++;
}
console.log(JSON.stringify({sourceRecords:records.length,matchedImageRecords:from.size,added,preexisting:skipped,missingCount:missing.length,missing},null,2));
if(write&&added){fs.writeFileSync(target,JSON.stringify(inventory,null,2)+'\n','utf8');console.log('Updated '+target)}
else console.log('Dry-run only. Use --write to update the inventory after confirming the source and rights.');
