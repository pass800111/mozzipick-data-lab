#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const cwd=fs.mkdtempSync(path.join(os.tmpdir(),'mozzipick-cover-test-'));
const script=path.resolve('scripts/merge-instagram-thumbnails.mjs');
const rel='https://www.instagram.com/p/DdJJLFShWgQ/';
const inv={domestic:[{reel:rel,productKo:'레이저 모바일 게임패드'}],overseas:[]};
const full=path.join(cwd,'data','instagram-electronics.json'),input=path.join(cwd,'dataset.json');
fs.mkdirSync(path.dirname(full),{recursive:true});
function run(items){fs.writeFileSync(input,JSON.stringify(items));const x=spawnSync(process.execPath,[script,input,'--write'],{cwd,encoding:'utf8'});if(x.status!==0)throw Error(x.stderr||x.stdout||'merge failed');return JSON.parse(fs.readFileSync(full,'utf8')).domestic[0]}
function url(offset){return 'https://scontent-fra5-1.cdninstagram.com/x.jpg?oe='+Math.floor((Date.now()+offset)/1000).toString(16)}
try{
 fs.writeFileSync(full,JSON.stringify(inv));
 let x=run([{shortCode:'DdJJLFShWgQ',displayUrl:url(-86400000)}]);if(x.thumbnail)throw Error('Expired CDN source wrongly accepted');
 x=run([{shortCode:'DIFFERENT',displayUrl:url(86400000*2)}]);if(x.thumbnail)throw Error('Different shortcode wrongly accepted');
 x=run([{shortCode:'DdJJLFShWgQ',displayUrl:'https://example.com/image.jpg'}]);if(x.thumbnail)throw Error('Unapproved domain wrongly accepted');
 x=run([{shortCode:'DdJJLFShWgQ',displayUrl:url(86400000*3)}]);if(!x.thumbnail)throw Error('Fresh exact-post image missing');
 x=run([{shortCode:'DdJJLFShWgQ',displayUrl:url(-3600000)}]);if(!x.thumbnail)throw Error('Fresh image deleted by stale source');
 console.log('PASS 5/5: expired rejected; shortcode exact; foreign URL rejected; fresh accepted; valid existing preserved');
}finally{fs.rmSync(cwd,{recursive:true,force:true})}
