/* Deterministic, offline portfolio analysis. Interactions never imply prerequisites. */
(() => {
 'use strict';
 const empty=()=>({schema:1,nodes:[],edges:[]});
 const fail=m=>{throw Error(m);};
 const text=(v,max,required=false)=>{if(typeof v!=='string'||v.length>max||(required&&!v.trim()))fail('Invalid or missing portfolio text.');return v.trim();};
 const id=v=>{if(typeof v!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(v))fail('Invalid portfolio ID.');return v;};
 const choice=(v,list)=>list.includes(v)?v:fail('Invalid portfolio choice.');
 function clean(raw){
  if(raw==null)return empty();
  if(raw.schema!==1||!Array.isArray(raw.nodes)||!Array.isArray(raw.edges)||raw.nodes.length>100||raw.edges.length>300)fail('Portfolio supports 100 activities and 300 relationships.');
  const nodes=raw.nodes.map(n=>({id:id(n.id),title:text(n.title,200,true),bridgeId:n.bridgeId===''?'':choice(n.bridgeId,window.RPB.bridges.map(b=>b.id)),status:choice(n.status,['planned','active','complete']),owner:text(n.owner,200)}));
  const ids=new Set(nodes.map(n=>n.id));if(ids.size!==nodes.length)fail('Duplicate activity ID.');
  const seen=new Set(),pairs=new Set();
  const edges=raw.edges.map(e=>{
   if(!ids.has(e.from)||!ids.has(e.to)||e.from===e.to)fail('Relationship endpoints must be different existing activities.');
   const key=e.from+'|'+e.to+'|'+e.kind;
   if(seen.has(e.id)||pairs.has(key))fail('Duplicate relationship.');seen.add(e.id);pairs.add(key);
   const out={id:id(e.id),from:e.from,to:e.to,kind:choice(e.kind,['dependency','benefit','tension']),owner:text(e.owner,200,true),confidence:choice(e.confidence,['low','medium','high']),requirement:text(e.requirement,2000,true),contingency:text(e.contingency,2000,true),verification:choice(e.verification,['unverified','verified','failed']),evidence:text(e.evidence,2000)};
   if(out.verification==='verified'&&!out.evidence)fail('Verification needs a dated evidence or review reference.');return out;
  });
  return {schema:1,nodes,edges};
 }
 function analyze(raw){
  const p=clean(raw),deps=p.edges.filter(e=>e.kind==='dependency'),byId=new Map(p.nodes.map(n=>[n.id,n]));
  const reach=start=>{const found=new Set(),todo=deps.filter(e=>e.from===start).map(e=>e.to);while(todo.length){const n=todo.pop();if(found.has(n))continue;found.add(n);todo.push(...deps.filter(e=>e.from===n).map(e=>e.to));}return found;};
  const descendants=new Map(p.nodes.map(n=>[n.id,reach(n.id)]));
  const cycles=p.nodes.filter(n=>descendants.get(n.id).has(n.id)).map(n=>n.id);
  const done=new Set(),waves=[];
  while(done.size<p.nodes.length){const wave=p.nodes.filter(n=>!done.has(n.id)&&deps.filter(e=>e.to===n.id).every(e=>done.has(e.from))).map(n=>n.id);if(!wave.length)break;waves.push(wave);wave.forEach(n=>done.add(n));}
  const blockers=n=>deps.filter(e=>e.to===n.id&&(byId.get(e.from).status!=='complete'||e.verification!=='verified'));
  const blocked=p.nodes.filter(n=>n.status!=='complete'&&blockers(n).length).map(n=>({id:n.id,edges:blockers(n).map(e=>e.id)}));
  const ready=p.nodes.filter(n=>n.status!=='complete'&&!blockers(n).length&&!cycles.includes(n.id)).map(n=>n.id);
  const warnings=p.nodes.filter(n=>n.status!=='planned'&&blockers(n).length).map(n=>n.id);
  const bottlenecks=p.nodes.map(n=>({id:n.id,downstream:[...descendants.get(n.id)].filter(x=>x!==n.id).length,unresolved:deps.filter(e=>e.from===n.id&&(n.status!=='complete'||e.verification!=='verified')).length})).filter(n=>n.unresolved).sort((a,b)=>b.downstream-a.downstream||b.unresolved-a.unresolved||a.id.localeCompare(b.id));
  return {waves,cycles,unscheduled:p.nodes.filter(n=>!done.has(n.id)).map(n=>n.id),ready,blocked,warnings,bottlenecks,lowConfidence:deps.filter(e=>e.confidence==='low').map(e=>e.id),interactions:p.edges.filter(e=>e.kind!=='dependency')};
 }
 const texts=raw=>{const p=clean(raw);return p.nodes.flatMap(n=>[n.title,n.owner]).concat(p.edges.flatMap(e=>[e.owner,e.requirement,e.contingency,e.evidence]));};
 const inherit=raw=>{const p=clean(raw);p.nodes.forEach(n=>n.status='planned');p.edges.forEach(e=>{e.verification='unverified';e.evidence='';});return p;};
 const example=()=>({schema:1,nodes:['Safe land access','Seed distribution','Food production','School feeding'].map((title,i)=>({id:'demo-'+i,title,bridgeId:'',owner:'Assign locally',status:'planned'})),edges:[0,1,2].map(i=>({id:'demo-edge-'+i,from:'demo-'+i,to:'demo-'+(i+1),kind:'dependency',owner:'Assign local verification steward',confidence:'low',requirement:['Confirm safe, voluntary land access with affected rights holders before distribution.','Verify suitable seeds reached growers and planting conditions are suitable.','Verify sufficient safe food and agreed supply arrangements before feeding.'][i],contingency:['Pause distribution and arrange mediation or a consensual alternative site.','Delay planting or use locally agreed alternative seed sources.','Arrange an agreed alternative food supply; do not promise unverified harvests.'][i],verification:'unverified',evidence:''}))});
 window.RPB_PORTFOLIO={empty,clean,analyze,texts,inherit,example};
})();
