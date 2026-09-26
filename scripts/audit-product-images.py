#!/usr/bin/env python3
"""Audit product images whenever product data changes. No unverified replacement."""
import json, pathlib, urllib.request, urllib.error
root=pathlib.Path(__file__).resolve().parents[1]
raw=json.loads((root/'data/products.json').read_text(encoding='utf-8'))
products=raw if isinstance(raw,list) else raw.get('products',[])
rows=[]
for p in products:
    src=p.get('image') or ''
    state='needs-image' if not src or 'image-fallback' in src else 'local-asset' if src.startswith('assets/') else 'external-unverified' if src.startswith('https://') else 'invalid-url'
    if state=='local-asset' and not (root/src).is_file(): state='missing-local-asset'
    rows.append({'name':p.get('name',''), 'image':src, 'status':state, 'source':p.get('imageSource',''), 'verified':bool(p.get('imageVerified',False))})
report={'total':len(rows),'needs_image':[r for r in rows if r['status'] in ('needs-image','missing-local-asset','invalid-url')],'pending_verification':[r for r in rows if r['status'] in ('external-unverified','local-asset') and not r['verified']],'items':rows}
out=root/'data/image-audit.json'
out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Image audit:',len(rows),'products;',len(report['needs_image']),'missing;',len(report['pending_verification']),'unverified')
