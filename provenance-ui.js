window.RPB_PROVENANCE_UI=function(api){
 'use strict';
 const {h,getPlan,changed,download,csvOf,safetyGate}=api,P=window.RPB_PROVENANCE;
 const field=(label,c)=>h('div',{class:'field'},h('label',{for:c.id},label),c);
 const input=(id,value,max)=>h('input',{id,value,maxlength:max,dir:'auto'});
 const area=(id,value,max)=>h('textarea',{id,rows:3,maxlength:max,dir:'auto'},value);
 const button=(id,label,fn)=>h('button',{id,type:'button',class:'btn btn--quiet',onclick:fn},label);
 function render(mount,info=''){
  const plan=getPlan(),bid=plan.bridge,b=P.get(plan.provenance,bid),s=b.current;
  const status=h('p',{id:'provStatus',role:'status',tabindex:'-1'},info);
  const run=fn=>{try{if(getPlan()!==plan||plan.bridge!==bid)throw Error('The active plan or bridge changed. Reopen contribution provenance.');fn();}catch(e){status.textContent=e.message;status.focus();}};
  mount.replaceChildren(h('h3',null,'Contribution Provenance'),h('p',null,'Record who authored or adapted this bridge and how its evidence and assumptions changed. Credits are self-reported; leave unknown authors blank. Library publishers are not automatically bridge authors.'),status);
  if(!bid){mount.append(h('p',null,'Choose a bridge in Readiness first.'));return;}
  const author=input('provAuthor',s.author,200),adapter=input('provAdapter',s.adapter,200),actor=input('provActor','',200),reason=area('provReason','',1000),evidence=area('provEvidence',s.evidence,4000),assumptions=area('provAssumptions',s.assumptions,4000);
  const links=h('select',{id:'provSources',multiple:true,size:5},window.RPB.documents.map(d=>h('option',{value:d.id,selected:s.sourceIds.includes(d.id)},d.short)));
  const permission=area('provPermission',b.permission,500);
  const draft=()=>({author:author.value,adapter:adapter.value,evidence:evidence.value,sourceIds:[...links.selectedOptions].map(o=>o.value),assumptions:assumptions.value});
  const preview=h('div',{id:'provPreview','aria-live':'polite'});
  const detail=d=>h('details',null,h('summary',null,d.label),h('h5',null,'Before'),h('pre',{class:'fork-value',dir:'auto'},typeof d.before==='string'?d.before:JSON.stringify(d.before,null,2)),h('h5',null,'After'),h('pre',{class:'fork-value',dir:'auto'},typeof d.after==='string'?d.after:JSON.stringify(d.after,null,2)));
  mount.append(h('p',null,(plan.project||'Untitled plan')+' · '+(window.RPB.bridges.find(x=>x.id===bid)?.short||bid)),
   b.inheritedFrom?h('p',null,'Inherited contribution history from plan '+b.inheritedFrom+'. These are source-context claims, not local validation.'):null,
   h('p',null,'Use collective roles or organizations rather than private identities. Each saved change needs a contributor and rationale. Editing this ledger does not change the catalogue, maturity, impact measurements or community accounts.'),
   field('Bridge author credit (optional if unknown)',author),field('Adaptation credit (group or organization)',adapter),field('Evidence account — support, limitations and community references',evidence),field('Linked institutional evidence (up to 20; use Ctrl/Command to select multiple)',links),
   button('provCatalogue','Use catalogue evidence links in draft',()=>{const selected=window.RPB.bridges.find(x=>x.id===bid)?.docs||[];for(const o of links.options)o.selected=selected.includes(o.value);status.textContent='Catalogue links added to draft. Explain their relevance before recording.';}),
   field('Assumptions — context, dependencies and uncertainties',assumptions),field('Who is recording this contribution? (required)',actor),field('Why did this change? (required)',reason),
   button('provPreviewBtn','Preview changes',()=>run(()=>{const changes=P.changes(s,P.snapshot(draft()));preview.replaceChildren(h('p',null,changes.length+' changed fields.'),...changes.map(detail));})),preview,
   button('provSave','Record contribution',()=>run(()=>{plan.provenance=P.record(plan.provenance,bid,draft(),actor.value,reason.value,plan.forking.id,'p-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12),new Date().toISOString());changed();render(mount,'Contribution recorded; sharing is now local only.');})),
   h('h4',null,'Contribution timeline'),h('p',{id:'provCount'},b.history.length+' recorded contributions'),
   h('div',{id:'provHistory'},[...b.history].reverse().map(e=>h('details',null,h('summary',{dir:'auto'},e.at+' · '+e.actor+' · '+e.reason),h('p',null,'Recorded in plan '+e.planId),...P.changes(e.before,e.after).map(detail)))),
   h('h4',null,'Sharing and exports'),h('p',{id:'provSharing'},b.sharing==='shared'?'Approved for sharing':'Local only'),h('p',null,'Private backups retain the full history. Approving sharing includes all previous author credits, evidence, assumptions and rationales. Any new contribution resets approval. Unsaved drafts are not exported.'),field('Permission to share this entire history',permission),
   button('provApprove','Approve recorded history for sharing',()=>run(()=>{if(!b.history.length)throw Error('Record a contribution first.');plan.provenance=P.share(plan.provenance,bid,'shared',permission.value);changed();render(mount,'Sharing approved for the recorded history.');})),
   button('provLocal','Keep history local',()=>run(()=>{plan.provenance=P.share(plan.provenance,bid,'local','');changed();render(mount,'History is local only. Existing exported copies cannot be recalled.');})),
   button('provExport','Export provenance JSON',()=>run(()=>{const packet=P.packet(plan.provenance,bid);safetyGate(plan,()=>download('contribution-provenance.json',JSON.stringify(packet,null,2),'application/json'));})),
   button('provCsv','Export changes CSV',()=>run(()=>{P.packet(plan.provenance,bid);const rows=b.history.flatMap(e=>P.changes(e.before,e.after).map(d=>[bid,e.at,e.actor,e.reason,e.planId,d.label,typeof d.before==='string'?d.before:JSON.stringify(d.before),typeof d.after==='string'?d.after:JSON.stringify(d.after)]));safetyGate(plan,()=>download('contribution-changes.csv',csvOf(['Bridge','Date','Contributor','Reason','Source plan','Changed field','Before','After'],rows),'text/csv'));})));
 }
 return {render};
};
