#!/usr/bin/env node
/**
 * Sync existing Apify metadata, WITHOUT starting a paid Actor run.
 * APIFY_TASK_ID resolves the latest successful run, or APIFY_DATASET_ID
 * fetches an explicitly specified dataset. APIFY_TOKEN is a secret.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const token=process.env.APIFY_TOKEN||'';
const task=process.env.APIFY_TASK_ID||'';
const dataset=process.env.APIFY_DATASET_ID||'';
if(!token||(!task&&!dataset)){console.log('SKIP: configure APIFY_TOKEN and APIFY_TASK_ID or APIFY_DATASET_ID in GitHub Actions. No data changed.');process.exit(0)}
const id=task||dataset;
if(!/^[A-Za-z0-9_-]{5,80}$/.test(id)){console.error('Invalid Apify task/dataset identifier.');process.exit(2)}
const url=task
 ?'https://api.apify.com/v2/actor-tasks/'+encodeURIComponent(task)+'/runs/last/dataset/items?status=SUCCEEDED&clean=true&format=json'
 :'https://api.apify.com/v2/datasets/'+encodeURIComponent(dataset)+'/items?clean=true&format=json';
let raw;
try{
 const res=await fetch(url,{headers:{Authorization:'Bearer '+token,Accept:'application/json'},signal:AbortSignal.timeout(30000)});
 if(!res.ok){console.error('Apify latest dataset request failed: HTTP '+res.status);process.exit(1)}
 raw=await res.json();
}catch(e){console.error('Apify request failed or timed out:',e.name);process.exit(1)}
if(!Array.isArray(raw)){console.error('The latest run did not return a JSON item array.');process.exit(1)}
const tmp=path.join(os.tmpdir(),'mozzipick-apify-items-'+process.pid+'.json');
try{
 fs.writeFileSync(tmp,JSON.stringify(raw),'utf8');
 const cmd=spawnSync(process.execPath,['scripts/merge-instagram-thumbnails.mjs',tmp,'--write'],{encoding:'utf8'});
 if(cmd.stdout)process.stdout.write(cmd.stdout);if(cmd.stderr)process.stderr.write(cmd.stderr);
 process.exitCode=cmd.status||0;
}finally{fs.rmSync(tmp,{force:true})}
