/* Community assets, process evidence, and deliberately limited public summaries. */
(() => {
 'use strict';
 const categories=['expertise','cultural-knowledge','institutions','infrastructure','ecological-assets','collaborations'];
 const kinds=['disclosure-granted','disclosure-withheld','disclosure-withdrawn','inclusion','grievance-open','grievance-response','grievance-close','decision','retired'];
 const empty=()=>({schema:1,assets:[]});
 const fail=m=>{throw Error(m);};
 const text=(v,max,required=false)=>{if(typeof v!=='string'||v.length>max||(required&&!v.trim()))fail('Missing or invalid stewardship text.');return v.trim();};
 const id=v=>{if(typeof v!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(v))fail('Invalid stewardship ID.');return v;};
 const choose=(v,a)=>a.includes(v)?v:fail('Invalid stewardship choice.');
 const date=v=>{if(v==='')return '';if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)fail('Invalid stewardship date.');return v;};
 const stamp=v=>{if(typeof v!=='string'||!Number.isFinite(Date.parse(v))||new Date(v).toISOString()!==v)fail('Invalid stewardship timestamp.');return v;};
 const groups=()=>window.RPB.stakeholders.map(g=>g.id);
 const bytes=(s,min,max)=>{if(typeof s!=='string'||!/^[A-Za-z0-9+/]+={0,2}$/.test(s)||s.length%4!==0)fail('Invalid encrypted envelope.');const b=Uint8Array.from(atob(s),c=>c.charCodeAt(0));if(b.length<min||b.length>max)fail('Invalid encrypted envelope size.');return b;};
 function envelope(v){if(v==null)return null;if(v.version!==1||v.algorithm!=='AES-GCM'||v.iterations!==310000)fail('Unsupported encrypted envelope.');bytes(v.salt,16,16);bytes(v.iv,12,12);bytes(v.ciphertext,16,50000);return {version:1,algorithm:'AES-GCM',iterations:310000,salt:v.salt,iv:v.iv,ciphertext:v.ciphertext};}
 function clean(raw){
  if(raw==null)return empty();if(raw.schema!==1||!Array.isArray(raw.assets)||raw.assets.length>100)fail('Stewardship supports 100 assets.');
  const seen=new Set();let events=0;
  const assets=raw.assets.map(a=>{const key=id(a.id);if(seen.has(key))fail('Duplicate asset ID.');seen.add(key);
   if(!Array.isArray(a.groups)||!a.groups.length||new Set(a.groups).size!==a.groups.length)fail('Select distinct affected stakeholder groups.');
   const out={id:key,created:stamp(a.created),category:choose(a.category,categories),title:text(a.title,200,true),summary:text(a.summary,2000,true),groups:a.groups.map(g=>choose(g,groups())),protected:envelope(a.protected),events:[]};
   if(!Array.isArray(a.events)||a.events.length>100||(events+=a.events.length)>500)fail('Limit: 100 events per asset and 500 per plan.');
   const eventIds=new Set();let previous=out.created;
   for(const e of a.events){const v={id:id(e.id),at:stamp(e.at),kind:choose(e.kind,kinds),group:e.group===''?'':choose(e.group,out.groups),owner:text(e.owner,200,true),note:text(e.note,2000,true),reference:text(e.reference,1000,true),due:date(e.due),caseId:e.caseId===''?'':id(e.caseId)};
    if(eventIds.has(v.id)||v.at<previous)fail('Events need unique IDs and chronological dates.');eventIds.add(v.id);previous=v.at;
    if(v.kind.startsWith('disclosure-')&&!v.group)fail('Disclosure decisions require an affected group.');
    if(v.kind==='disclosure-granted'&&(!v.due||v.due<v.at.slice(0,10)))fail('Disclosure approval needs a valid review/expiry date.');
    if(['grievance-open','decision'].includes(v.kind)&&(!v.due||v.due<v.at.slice(0,10)))fail('Grievances and decisions need a response/review deadline.');
    if(['grievance-response','grievance-close'].includes(v.kind)){const opened=out.events.find(x=>x.id===v.caseId&&x.kind==='grievance-open');if(!opened||out.events.some(x=>x.caseId===v.caseId&&x.kind==='grievance-close'))fail('Reference an open grievance.');}
    else if(v.caseId)fail('Only responses and closure reference a grievance.');
    out.events.push(v);
   }return out;
  });return {schema:1,assets};
 }
 const add=(raw,asset)=>clean({schema:1,assets:[...clean(raw).assets,asset]});
 const record=(raw,assetId,event)=>{const p=clean(raw),a=p.assets.find(a=>a.id===assetId);if(!a)fail('Asset not found.');a.events.push(event);return clean(p);};
 function assess(asset,plan,today){
  date(today);if(!today)fail('Current date is required.');const reasons=[];
  if(asset.events.some(e=>e.kind==='retired'))reasons.push('Asset retired.');
  const grievances=asset.events.filter(e=>e.kind==='grievance-open').map(e=>{const follow=asset.events.filter(x=>x.caseId===e.id);const first=follow.find(x=>['grievance-response','grievance-close'].includes(x.kind));return {id:e.id,owner:e.owner,due:e.due,responded:!!first,responseDays:first?Math.ceil((Date.parse(first.at)-Date.parse(e.at))/86400000):null,lateResponse:!!first&&first.at.slice(0,10)>e.due,closed:follow.some(x=>x.kind==='grievance-close'),overdue:e.due<today&&!first};});
  if(grievances.some(g=>!g.closed))reasons.push('Unresolved asset grievance.');
  for(const group of asset.groups){
   if(plan.who?.[group]!=='met')reasons.push(group+': inclusion not recorded as heard from in Readiness.');
   const consent=(plan.consent||[]).filter(c=>c.group===group).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
   const c=consent.at(-1);if(!c||!c.date||c.date>today||c.decision!=='agreed'||!c.nextCheck||c.nextCheck<today)reasons.push(group+': dated, current unconditional planner consent is missing.');
   const grant=asset.events.filter(e=>e.group===group&&e.kind.startsWith('disclosure-')).at(-1);
   if(!grant||grant.kind!=='disclosure-granted'||grant.due<today||grant.at.slice(0,10)>today)reasons.push(group+': current asset-summary disclosure permission missing.');
  }
  const communal=(plan.consent||[]).filter(c=>c.group==='community').sort((a,b)=>(a.date||'').localeCompare(b.date||'')).at(-1);
  if(communal&&(communal.decision!=='agreed'||!communal.date||communal.date>today||!communal.nextCheck||communal.nextCheck<today))reasons.push('Whole-community consent has unresolved conditions or a refusal/withdrawal.');
  const decisions=asset.events.filter(e=>e.kind==='decision');
  if(!decisions.length)reasons.push('No accountable decision recorded for asset use and disclosure.');
  else if(decisions.at(-1).due<today||decisions.at(-1).at.slice(0,10)>today)reasons.push('Accountable decision review overdue.');
  return {eligible:reasons.length===0,reasons,grievances,decisions:decisions.length};
 }
 function publicPacket(raw,plan,today){const p=clean(raw);return {format:'rpb-community-assets-public',schema:1,notice:'Approved neutral asset summaries only. Not proof of legitimacy, consent authenticity or permission for other uses.',assets:p.assets.filter(a=>assess(a,plan,today).eligible).map(a=>({category:a.category,title:a.title,summary:a.summary}))};}
 const texts=raw=>clean(raw).assets.flatMap(a=>[a.title,a.summary,...a.events.flatMap(e=>[e.owner,e.note,e.reference])]);
 const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b)));
 async function key(pass,salt){if(typeof pass!=='string'||pass.length<12||pass.length>500)fail('Use a passphrase of 12–500 characters. It is not stored or recoverable by this app.');if(!globalThis.crypto?.subtle)fail('Protected details require Web Crypto in a secure browser context.');const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
 async function encrypt(assetId,plain,pass){id(assetId);text(plain,10000,true);if(!globalThis.crypto?.subtle)fail('Protected details require Web Crypto.');const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),k=await key(pass,salt);const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(assetId)},k,new TextEncoder().encode(plain));return envelope({version:1,algorithm:'AES-GCM',iterations:310000,salt:b64(salt),iv:b64(iv),ciphertext:b64(ciphertext)});}
 async function decrypt(assetId,raw,pass){const e=envelope(raw);if(!e)fail('No protected details.');const k=await key(pass,bytes(e.salt,16,16));try{return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(e.iv,12,12),additionalData:new TextEncoder().encode(id(assetId))},k,bytes(e.ciphertext,16,50000)));}catch{fail('Unable to unlock: wrong passphrase or altered protected data.');}}
 window.RPB_STEWARDSHIP={categories,kinds,empty,clean,add,record,assess,publicPacket,texts,encrypt,decrypt};
})();
