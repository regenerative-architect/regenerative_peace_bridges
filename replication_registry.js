/* Independent reports coexist. Outcome labels describe reports, never a consensus. */
(() => {
 'use strict';
 const statuses=['successful','mixed','failed','interrupted','inconclusive'];
 const empty=()=>({schema:1,records:[]});
 const fail=m=>{throw Error(m);};
 const text=(v,max,required=false)=>{if(typeof v!=='string'||v.length>max||(required&&!v.trim()))fail('Missing or invalid replication text.');return v.trim();};
 const id=v=>{if(typeof v!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(v))fail('Invalid report ID.');return v;};
 const choice=(v,values)=>values.includes(v)?v:fail('Invalid replication choice.');
 const stamp=v=>{if(typeof v!=='string'||!Number.isFinite(Date.parse(v))||new Date(v).toISOString()!==v)fail('Invalid report date.');return v;};
 function clean(raw){
  if(raw==null)return empty();
  if(raw.schema!==1||!Array.isArray(raw.records)||raw.records.length>200)fail('Registry supports up to 200 reports.');
  const records=raw.records.map(r=>{
   const out={id:id(r.id),created:stamp(r.created),title:text(r.title,200,true),intervention:text(r.intervention,200,true),bridgeId:r.bridgeId===''?'':choice(r.bridgeId,window.RPB.bridges.map(b=>b.id)),status:choice(r.status,statuses),sourceType:choice(r.sourceType,['study','community','programme']),source:text(r.source,2000,true),period:text(r.period,200,true),context:text(r.context,3000,true),conditions:text(r.conditions,3000,true),fidelity:text(r.fidelity,3000,true),findings:text(r.findings,4000,true),adverse:text(r.adverse,3000,true),limitations:text(r.limitations,3000,true),cost:{amount:r.cost?.amount,currency:text(r.cost?.currency,80),basis:text(r.cost?.basis,2000,true)},verification:{status:choice(r.verification?.status,['unverified','self-reported','independent','disputed']),by:text(r.verification?.by,200),reference:text(r.verification?.reference,2000),independence:text(r.verification?.independence,2000)},relations:[],withdrawal:null};
   if(out.cost.amount!==null&&(typeof out.cost.amount!=='number'||!Number.isFinite(out.cost.amount)||out.cost.amount<0||out.cost.amount>1e12))fail('Cost must be unknown or a finite nonnegative amount.');
   if(out.cost.amount!==null&&!out.cost.currency)fail('A known cost needs currency or unit.');
   if(['independent','disputed'].includes(out.verification.status)&&(!out.verification.by||!out.verification.reference||!out.verification.independence))fail('Independent or disputed verification needs reviewer, reference and independence/conflict details.');
   if(!Array.isArray(r.relations)||r.relations.length>20)fail('At most 20 report relationships are supported.');
   out.relations=r.relations.map(x=>({id:id(x.id),kind:choice(x.kind,['contradicts','supports','replicates','corrects'])}));
   if(new Set(out.relations.map(x=>x.id)).size!==out.relations.length||out.relations.some(x=>x.id===out.id))fail('Duplicate or self-referencing report relationship.');
   if(r.withdrawal!=null)out.withdrawal={at:stamp(r.withdrawal.at),reason:text(r.withdrawal.reason,1000,true)};
   return out;
  });
  const ids=new Set(records.map(r=>r.id));if(ids.size!==records.length)fail('Duplicate report IDs.');
  for(const r of records)for(const link of r.relations)if(!ids.has(link.id))fail('Related report is missing. Import a complete registry or remove the invalid reference.');
  return {schema:1,records};
 }
 const texts=raw=>clean(raw).records.flatMap(r=>[r.title,r.intervention,r.source,r.period,r.context,r.conditions,r.fidelity,r.findings,r.adverse,r.limitations,r.cost.currency,r.cost.basis,r.verification.by,r.verification.reference,r.verification.independence,r.withdrawal?.reason||'']);
 function query(raw,{search='',status='',sourceType='',verification='',bridgeId='',includeWithdrawn=false}={}){
  const p=clean(raw),q=search.trim().toLocaleLowerCase();
  return p.records.filter(r=>(includeWithdrawn||!r.withdrawal)&&(!status||r.status===status)&&(!sourceType||r.sourceType===sourceType)&&(!verification||r.verification.status===verification)&&(!bridgeId||r.bridgeId===bridgeId)&&(!q||JSON.stringify(r).toLocaleLowerCase().includes(q)));
 }
 const append=(raw,record)=>clean({schema:1,records:[...clean(raw).records,record]});
 function withdraw(raw,reportId,reason,at){const p=clean(raw),r=p.records.find(x=>x.id===reportId);if(!r)fail('Report not found.');if(r.withdrawal)fail('Report is already withdrawn.');r.withdrawal={at,reason};return clean(p);}
 const canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
 function merge(raw,incoming){const p=clean(raw),q=clean(incoming);let duplicates=0;for(const r of q.records){const existing=p.records.find(x=>x.id===r.id);if(existing){if(canonical(existing)!==canonical(r))fail('Conflicting report ID '+r.id+'. Import refused; existing reports remain unchanged.');duplicates++;}else p.records.push(r);}return {registry:clean(p),duplicates,added:q.records.length-duplicates};}
 const packet=raw=>({format:'rpb-replication-registry',schema:1,notice:'Separate reported findings, not verified causal effects or consensus. Contains all reports, including withdrawn records.',registry:clean(raw)});
 function readPacket(raw){if(raw?.format!=='rpb-replication-registry'||raw.schema!==1)fail('Not a supported registry export.');return clean(raw.registry);}
 function examples(){const at='2026-10-26T00:00:00.000Z';return clean({schema:1,records:statuses.map((status,i)=>({id:'example-'+i,created:at,title:'ILLUSTRATIVE: '+status+' seed intervention',intervention:'Illustrative shared seed system',bridgeId:'',status,sourceType:i%2?'community':'study',source:'Invented teaching example — not real evidence.',period:'Illustrative growing season',context:['Two settlements with agreed land access.','Participation varied between settlements.','Planting coincided with severe dry conditions.','Access was suspended before planting.','Follow-up records were incomplete.'][i],conditions:'Illustrative local conditions; document rainfall, access, security, livelihoods and governance in real reports.',fidelity:['Distribution and follow-up followed the intended design.','Follow-up was uneven.','Seeds arrived late; attribution to the design alone is not justified.','Implementation stopped early.','Delivery records could not be independently checked.'][i],findings:['Participants reported improved access to suitable seeds.','Some households benefited; excluded households reported no improvement.','Reported harvests did not meet the stated objective.','No completed intervention outcome can be inferred.','Evidence was insufficient to classify effectiveness.'][i],adverse:i===1?'Excluded households reported resentment.':'Not assessed in this invented example; this is not evidence of no harm.',limitations:'Hypothetical account. No causal inference, representative sampling or independent verification.',cost:{amount:null,currency:'',basis:'Not recorded; distinguish unknown costs from zero.'},verification:{status:'unverified',by:'',reference:'',independence:''},relations:i===1?[{id:'example-0',kind:'contradicts'}]:[],withdrawal:null}))});}
 window.RPB_REPLICATION={statuses,empty,clean,texts,query,append,withdraw,merge,packet,readPacket,examples};
})();
