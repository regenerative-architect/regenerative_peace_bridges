window.RPB_PORTFOLIO_UI=function(api){
 'use strict';
 const {h,getPlan,changed,download,safetyGate}=api,P=window.RPB_PORTFOLIO;
 const field=(label,c)=>h('div',{class:'field'},h('label',{for:c.id},label),c);
 const input=(id,value='',max=200)=>h('input',{id,value,maxlength:max,dir:'auto'});
 const area=(id,value='')=>h('textarea',{id,rows:3,maxlength:2000,dir:'auto'},value);
 const select=(id,choices,value)=>h('select',{id},choices.map(([v,label])=>h('option',{value:v,selected:v===value},label)));
 const button=(id,label,fn)=>h('button',{id,type:'button',class:'btn btn--quiet',onclick:fn},label);
 let editNode='',editEdge='',activePlan;
 function render(mount,message=''){
  const plan=getPlan();if(activePlan!==plan){editNode="";editEdge="";activePlan=plan;}
  const p=P.clean(plan.portfolio),a=P.analyze(p),name=id=>p.nodes.find(n=>n.id===id)?.title||id;
  const hazard=window.RPB_HAZARD.assess(plan.hazard,plan);
  const status=h('p',{id:'portfolioStatus',role:'status',tabindex:'-1'},message);
  const run=fn=>{try{if(getPlan()!==plan)throw Error('Active plan changed. Reopen the portfolio.');fn();}catch(e){status.textContent=e.message;status.focus();}};
  const save=next=>{plan.portfolio=P.clean(next);changed();editNode='';editEdge='';render(mount,'Portfolio saved locally.');document.getElementById('portfolioStatus').focus();};
  const uid=()=> 'pf-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
  const list=ids=>ids.length?ids.map(name).join(' → '):'None';
  mount.replaceChildren(h('h3',null,'Portfolio & Dependency Intelligence'),h('p',null,'Build a portfolio of bridge activities within this plan. A required dependency gates its target; a possible benefit or tension does not. This is a local planning model, not proof of causation or permission to proceed.'),status,
   h('p',{id:'portfolioHazard'},hazard.title+'. '+hazard.reason),h('h4',null,'Sequence and readiness'),h('p',null,'Sequence waves show prerequisite order, not dates or duration. Ready means all direct prerequisites are complete and their requirements verified. Independent activities can share a wave. Confidence does not substitute for verification.'),
   h('ol',{id:'portfolioWaves'},a.waves.map(w=>h('li',null,w.map(name).join(' · ')))),
   h('p',{id:'portfolioReady'},'Dependency-ready only (not field-work authorization): '+list(a.ready)),h('p',{id:'portfolioCycles'},'Cycle members: '+list(a.cycles)),h('p',null,'Unscheduled (cycles and their downstream activities): '+list(a.unscheduled)),
   h('p',null,'Active or completed despite unmet prerequisites: '+list(a.warnings)),h('p',null,'Low-confidence prerequisites: '+a.lowConfidence.length),
   h('h4',null,'Blocked activities'),h('ul',{id:'portfolioBlocked'},a.blocked.map(n=>h('li',null,name(n.id)+': '+n.edges.map(id=>{const e=p.edges.find(e=>e.id===id);return name(e.from)+' — '+e.verification+'; owner: '+e.owner+'; check: '+e.requirement+'; contingency: '+e.contingency;}).join(' | ')))),
   h('h4',null,'Bottlenecks'),h('p',null,'Ranked by number of reachable downstream activities, then unresolved outgoing requirements. This does not estimate impact, duration or critical-path time.'),h('ul',{id:'portfolioBottlenecks'},a.bottlenecks.map(n=>h('li',null,name(n.id)+' — '+n.downstream+' downstream activities; '+n.unresolved+' unresolved outgoing prerequisites'))),
   h('h4',null,'Possible cross-bridge interactions'),h('ul',{id:'portfolioInteractions'},a.interactions.map(e=>h('li',null,name(e.from)+' → '+name(e.to)+' — '+e.kind+' ('+e.confidence+' confidence): '+e.requirement+'; owner: '+e.owner+'; contingency: '+e.contingency+'; '+e.verification+(e.evidence?'; '+e.evidence:'')))));
  const node=p.nodes.find(n=>n.id===editNode)||{title:'',bridgeId:'',owner:'',status:'planned'};
  const title=input('portfolioTitle',node.title),owner=input('portfolioNodeOwner',node.owner),bridge=select('portfolioBridge',[['','General activity / prerequisite'],...window.RPB.bridges.map(b=>[b.id,b.short])],node.bridgeId),state=select('portfolioNodeState',[['planned','Planned'],['active','Active'],['complete','Complete']],node.status);
  mount.append(h('h4',null,editNode?'Edit activity':'Add activity'),field('Activity title',title),field('Linked bridge (optional)',bridge),field('Activity owner (role or collective)',owner),field('Activity status — self-reported',state),
   button('portfolioSaveNode','Save activity',()=>run(()=>{const n={id:editNode||uid(),title:title.value,bridgeId:bridge.value,owner:owner.value,status:state.value};save({...p,nodes:editNode?p.nodes.map(x=>x.id===editNode?n:x):[...p.nodes,n]});})),
   h('ul',{id:'portfolioNodes'},p.nodes.map(n=>h('li',null,h('span',{dir:'auto'},n.title+' · '+(window.RPB.bridges.find(b=>b.id===n.bridgeId)?.short||'General')+' · '+n.status+' · '+(n.owner||'Owner unassigned')),
    button('portfolioEditNode-'+n.id,'Edit '+n.title,()=>{editNode=n.id;render(mount);document.getElementById('portfolioTitle').focus();}),
    button('portfolioDeleteNode-'+n.id,'Remove '+n.title,()=>run(()=>{if(p.edges.some(e=>e.from===n.id||e.to===n.id))throw Error('Remove connected relationships before deleting this activity.');save({...p,nodes:p.nodes.filter(x=>x.id!==n.id)});}))))));
  if(p.nodes.length>=2){
   const e=p.edges.find(x=>x.id===editEdge)||{from:p.nodes[0].id,to:p.nodes[1].id,kind:'dependency',owner:'',confidence:'low',requirement:'',contingency:'',verification:'unverified',evidence:''};
   const choices=p.nodes.map(n=>[n.id,n.title]);
   const controls={from:select('portfolioFrom',choices,e.from),to:select('portfolioTo',choices,e.to),kind:select('portfolioKind',[['dependency','Required dependency'],['benefit','Possible beneficial interaction'],['tension','Possible tension / trade-off']],e.kind),owner:input('portfolioOwner',e.owner),confidence:select('portfolioConfidence',['low','medium','high'].map(x=>[x,x]),e.confidence),requirement:area('portfolioRequirement',e.requirement),contingency:area('portfolioContingency',e.contingency),verification:select('portfolioVerification',['unverified','verified','failed'].map(x=>[x,x]),e.verification),evidence:area('portfolioEvidence',e.evidence)};
   const labels={from:'Prerequisite / source activity',to:'Dependent / affected activity',kind:'Relationship type',owner:'Requirement owner (required)',confidence:'Confidence in this relationship',requirement:'Verification requirement (or interaction hypothesis to check)',contingency:'Contingency if unmet or harmful',verification:'Verification status',evidence:'Dated evidence / review reference (required when verified)'};
   mount.append(h('h4',null,editEdge?'Edit relationship':'Add relationship'),h('p',null,'Changing a relationship’s endpoints, type or verification requirement resets its verification; save first, then record a fresh review. A complete activity alone does not verify a relationship. Cycles are retained for review but cannot be sequenced.'),...Object.keys(controls).map(k=>field(labels[k],controls[k])),
    button('portfolioSaveEdge','Save relationship',()=>run(()=>{const next={id:editEdge||uid(),...Object.fromEntries(Object.entries(controls).map(([k,c])=>[k,c.value]))};if(editEdge&&["from","to","kind","requirement"].some(k=>next[k]!==e[k])){next.verification="unverified";next.evidence="";}save({...p,edges:editEdge?p.edges.map(x=>x.id===editEdge?next:x):[...p.edges,next]});})));
  }
  mount.append(h('ul',{id:'portfolioEdges'},p.edges.map(e=>h('li',null,name(e.from)+' → '+name(e.to)+' · '+e.kind+' · '+e.confidence+' · '+e.verification,
   button('portfolioEditEdge-'+e.id,'Edit relationship '+name(e.from)+' to '+name(e.to),()=>{editEdge=e.id;render(mount);document.getElementById('portfolioFrom').focus();}),button('portfolioDeleteEdge-'+e.id,'Remove relationship '+name(e.from)+' to '+name(e.to),()=>run(()=>save({...p,edges:p.edges.filter(x=>x.id!==e.id)})))))),
   button('portfolioCancel','Cancel editing',()=>{editNode='';editEdge='';render(mount);}),
   button('portfolioExample','Load illustrative land → seeds → food → school chain (empty portfolio only)',()=>run(()=>{if(p.nodes.length)throw Error('The example only loads into an empty portfolio. Create a new plan to explore it.');save(P.example());})),
   h('p',null,'Saved portfolios are private local plan data, included in plan backups and saved versions. Forks retain structure and owners but reset completion and verification. They are not added to public bridge briefs. Export intentionally shares all portfolio text; use collective roles rather than sensitive identities.'),
   button('portfolioExport','Export portfolio and analysis JSON',()=>run(()=>safetyGate(plan,()=>download('bridge-portfolio.json',JSON.stringify({format:'rpb-portfolio-report',schema:1,planId:plan.forking.id,exportedAt:new Date().toISOString(),portfolio:p,analysis:a},null,2),'application/json')))));
 }
 return {render};
};

