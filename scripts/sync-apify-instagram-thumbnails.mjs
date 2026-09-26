#!/usr/bin/env node
/**
 * MOZZIPICK Instagram thumbnail sync from an authorized Apify dataset.
 * Requires APIFY_TOKEN and APIFY_DATASET_ID. Never prints credentials.
 * Exact shortcode matching is performed by merge-instagram-thumbnails.mjs.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const token=process.env.APIFY_TOKEN||'';
const id=process.env.APIFY_DATASET_ID||'';
if(!token||!id){console.log('SKIP: APIFY_TOKEN or APIFY_DATASET_ID is not configured. Existing reel data is untouched.');process.exit(0)}
if(!/^[A-Za-z0-9_-]{5,80}$/.test(id)){console.error('Invalid Apify dataset ID.');process.exit(2)}
const url='https://api.apify.com/v2/datasets/'+encodeURIComponent(id)+'/items?clean=true&format=json';
const res=await fetch(url,{headers:{Authorization:'Bearer '+token,Accept:'application/json'},signal:AbortSignal.timeout(25000)});
if(!res.ok){console.error('Apify dataset fetch error: HTTP '+res.status);process.exit(1)}
const raw=await res.json();if(!Array.isArray(raw)){console.error('Dataset did not contain a JSON item array.');process.exit(1)}
const tmp=path.join(os.tmpdir(),'mozzipick-apify-items-'+process.pid+'.json');
try{fs.writeFileSync(tmp,JSON.stringify(raw),'utf8');const cmd=spawnSync(process.execPath,['scripts/merge-instagram-thumbnails.mjs',tmp,'--write'],{encoding:'utf8'});if(cmd.stdout)process.stdout.write(cmd.stdout);if(cmd.stderr)process.stderr.write(cmd.stderr);process.exitCode=cmd.status||0}
finally{fs.rmSync(tmp,{force:true})}
