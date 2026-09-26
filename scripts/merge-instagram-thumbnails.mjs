#!/usr/bin/env node
/**
 * Exact-post Instagram thumbnail metadata sync.
 * Usage: node scripts/merge-instagram-thumbnails.mjs apify-export.json [--write]
 * Refuses already expired Instagram CDN links. Never guesses by caption/product
 * name and never replaces an approved local asset with a hotlink.
 */
import fs from 'node:fs';
const input=process.argv[2],write=process.argv.includes('--write');
if(!input){console.error('Usage: node scripts/merge-instagram-thumbnails.mjs apify-export.json [--write]');process.exit(2)}
const target='data/instagram-electronics.json';
const inventory=JSON.parse(fs.readFileSync(target,'utf8'));
const raw=JSON.parse(fs.readFileSync(input,'utf8'));
const records=Array.isArray(raw)?raw:Array.isArray(raw.items)?raw.items:Array.isArray(raw.results)?raw.results:[...(raw.domestic||[]),...(raw.overseas||[])];
function key(v){if(!v)return '';const s=String(v).trim();const m=s.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/i);return m?m[1]:(/^[A-Za-z0-9_-]{9,24}$/.test(s)?s:'')}
function expiry(url){try{const v=new URL(url).searchParams.get('oe');return v&&/^[0-9a-f]{8,16}$/i.test(v)?parseInt(v,16)*1000:0}catch{return 0}}
function allowed(url){if(typeof url!=='string'||!/^https:\/\//i.test(url)||/\s/.test(url))return false;const u=new URL(url);if(!/(^|\.)((cdninstagram\.com)|(fbcdn\.net))$/i.test(u.hostname))return false;const end=expiry(url);return !end||end>Date.now()+60*60*1000}
function imageOf(p){return [p.thumbnail,p.thumbnailUrl,p.thumbnail_url,p.displayUrl,p.videoThumbnail,p.coverUrl,p.cover,p.imageUrl,p.previewUrl].find(allowed)||''}
const from=new Map();let expiredCandidates=0;
for(const p of records){const k=key(p.reel||p.url||p.postUrl||p.post_url||p.permalink||p.shortCode||p.shortcode);const rawImage=[p.thumbnail,p.thumbnailUrl,p.thumbnail_url,p.displayUrl,p.videoThumbnail,p.coverUrl,p.cover,p.imageUrl,p.previewUrl].find(v=>typeof v==='string'&&/^https:\/\//i.test(v))||'';if(rawImage&&expiry(rawImage)&&expiry(rawImage)<=Date.now()+60*60*1000)expiredCandidates++;const v=imageOf(p);if(k&&v)from.set(k,v)}
let added=0,updated=0,existing=0,stale=0,missing=[];
for(const region of ['domestic','overseas'])for(const p of inventory[region]||[]){
 const k=key(p.reel),ref=from.get(k),current=p.thumbnail||'';
 if(current.startsWith('assets/instagram/')){existing++;continue}
 if(current&&allowed(current)&&(!ref||expiry(ref)<=expiry(current))){existing++;continue}
 if(!ref){if(current&&!allowed(current)){delete p.thumbnail;p.thumbnailStatus='Expired source URL removed; source post preserved';stale++}missing.push({region,reel:p.reel||''});continue}
 p.thumbnail=ref;p.thumbnailSource='Exact original-post shortcode matched from authorized dataset';p.thumbnailStatus='Fresh source URL; remote image loading and permission require independent verification';p.thumbnailCheckedAt=new Date().toISOString();current?updated++:added++;
}
console.log(JSON.stringify({sourceRecords:records.length,matchedFreshSourceRecords:from.size,expiredSourceCandidates:expiredCandidates,added,updated,staleRemoved:stale,kept:existing,missingCount:missing.length,missing},null,2));
if(write&&(added||updated||stale)){fs.writeFileSync(target,JSON.stringify(inventory,null,2)+'\n','utf8');console.log('Updated '+target)}
else console.log(write?'No applicable new metadata.':'Dry-run only. Add --write after reviewing source and permissions.');
