/* Contribution claims and explicit revision chains; not authenticated authorship. */
(() => {
 'use strict';
 const fields={author:'Bridge author credit',adapter:'Adaptation credit',evidence:'Evidence account',sourceIds:'Evidence source links',assumptions:'Assumptions'};
 const empty=()=>({schema:1,bridges:{}});
 const initial=()=>({author:'',adapter:'',evidence:'',sourceIds:[],assumptions:''});
 const blank=()=>({current:initial(),history:[],inheritedFrom:'',sharing:'local',permission:''});
 const fail=m=>{throw Error(m);};
 const text=(v,n)=>{if(typeof v!=='string'||v.length>n)fail('Invalid or overlong contribution text.');return v.trim();};
 const id=v=>{if(typeof v!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(v))fail('Invalid contribution ID.');return v;};
 const date=v=>{if(typeof v!=='string'||!Number.isFinite(Date.parse(v))||new Date(v).toISOString()!==v)fail('Invalid contribution date.');return v;};
 function snapshot(raw){
  if(!raw||!Array.isArray(raw.sourceIds)||raw.sourceIds.length>20)fail('Use up to 20 evidence links.');
  const s={author:text(raw.author,200),adapter:text(raw.adapter,200),evidence:text(raw.evidence,4000),sourceIds:[],assumptions:text(raw.assumptions,4000)};
  for(const key of raw.sourceIds){if(!window.RPB.documents.some(d=>d.id===key)||s.sourceIds.includes(key))fail('Invalid or duplicate evidence link.');s.sourceIds.push(key);}s.sourceIds.sort();return s;
 }
 const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const changes=(a,b)=>Object.keys(fields).filter(k=>!equal(a[k],b[k])).map(k=>({field:k,label:fields[k],before:a[k],after:b[k]}));
 function clean(raw){
  if(raw==null)return empty();
  if(raw.schema!==1||!raw.bridges||typeof raw.bridges!=='object'||Array.isArray(raw.bridges))fail('Invalid contribution provenance schema.');
  if(JSON.stringify(raw).length>2000000)fail('Contribution provenance exceeds 2 MB.');
  const out=empty(),seen=new Set();let total=0;
  for(const [bid,b] of Object.entries(raw.bridges)){
   if(bid!=='other'&&!window.RPB.bridges.some(x=>x.id===bid))fail('Unknown provenance bridge.');
   if(!b||!Array.isArray(b.history)||b.history.length>200)fail('Invalid contribution history.');
   const result=blank();result.inheritedFrom=b.inheritedFrom===''?'':id(b.inheritedFrom);
   if(!['local','shared'].includes(b.sharing))fail('Invalid provenance sharing state.');result.sharing=b.sharing;result.permission=text(b.permission,500);
   if(result.sharing==='shared'&&!result.permission)fail('Record permission to share the entire contribution history.');
   let last=initial(),lastDate='';
   for(const rawEvent of b.history){
    const e={id:id(rawEvent.id),at:date(rawEvent.at),actor:text(rawEvent.actor,200),reason:text(rawEvent.reason,1000),planId:id(rawEvent.planId),before:snapshot(rawEvent.before),after:snapshot(rawEvent.after)};
    if(seen.has(e.id)||!e.actor||!e.reason||e.at<lastDate||!equal(e.before,last)||!changes(e.before,e.after).length)fail('Contribution history needs unique IDs, an actor, a reason and a continuous change sequence.');
    seen.add(e.id);result.history.push(e);last=e.after;lastDate=e.at;total++;
   }
   result.current=snapshot(b.current);if(!equal(result.current,last))fail('Current contribution state does not match its history.');out.bridges[bid]=result;
  }
  if(total>200)fail('A plan supports up to 200 contribution events.');return out;
 }
 const get=(raw,bid)=>raw?.bridges?.[bid]||blank();
 function record(raw,bid,next,actor,reason,planId,eventId,at){
  const out=clean(raw),b=get(out,bid),after=snapshot(next);
  if(!changes(b.current,after).length)fail('No contribution fields changed. Edit the credits, evidence or assumptions before recording.');
  out.bridges[bid]={...b,current:after,sharing:'local',permission:'',history:[...b.history,{id:eventId,at,actor,reason,planId,before:b.current,after}]};return clean(out);
 }
 function share(raw,bid,sharing,permission){const out=clean(raw);out.bridges[bid]={...get(out,bid),sharing,permission};return clean(out);}
 function inherit(raw,planId){const out=clean(raw);for(const b of Object.values(out.bridges)){b.inheritedFrom=id(planId);b.sharing='local';b.permission='';}return out;}
 function lines(raw,bid,sharedOnly=true){const b=get(raw,bid);if(!b.history.length||(sharedOnly&&b.sharing!=='shared'))return [];return ['Contribution provenance (self-reported)', 'Author credit: '+(b.current.author||'Not recorded'),'Adaptation credit: '+(b.current.adapter||'Not recorded'),'Evidence account: '+(b.current.evidence||'Not recorded'),'Evidence links: '+(b.current.sourceIds.join(', ')||'None recorded'),'Assumptions: '+(b.current.assumptions||'Not recorded'),b.history.length+' contribution events; latest '+b.history.at(-1).at,...(b.inheritedFrom?['Inherited from source plan '+b.inheritedFrom+'; requires review in this context.']:[])];}
 const texts=raw=>Object.values(raw?.bridges||{}).flatMap(b=>[b.permission,b.inheritedFrom,...Object.values(b.current).flat(),...b.history.flatMap(e=>[e.actor,e.reason,e.planId,...Object.values(e.before).flat(),...Object.values(e.after).flat()])]);
 function packet(raw,bid){const b=get(clean(raw),bid);if(!b.history.length||b.sharing!=='shared')fail('Approve this contribution history for sharing first.');return {format:'rpb-contribution-provenance',schema:1,bridgeId:bid,notice:'Self-reported attribution and evidence/assumption revisions, not authenticated authorship or independent validation. Restore editable provenance using a private plan backup.',record:b};}
 window.RPB_PROVENANCE={fields,empty,initial,blank,snapshot,changes,clean,get,record,share,inherit,lines,texts,packet};
})();
