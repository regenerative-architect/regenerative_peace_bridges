window.RPB_VAULT_UI=async function(api){
 'use strict';
 const {h,mount,Store,confirmDialog,download,safetyGate,getPlan,changed}=api,V=window.RPB_VAULT,KEY='knowledge-vault';
 let data=V.empty(),editing=null,query='',filter='',bridgeFilter='',busy=false;
 const uid=()=> 'v-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12);
 const now=()=>new Date().toISOString();
 const btn=(id,label,fn)=>h('button',{id,type:'button',class:'btn btn--quiet',onclick:()=>run(fn)},label);
 const input=(id,value,max=200)=>h('input',{id,value,maxlength:max,dir:'auto'});
 const area=(id,value,max=20000)=>h('textarea',{id,rows:4,maxlength:max,dir:'auto'},value);
 const select=(id,pairs,value)=>{const el=h('select',{id},pairs.map(([v,t])=>h('option',{value:v},t)));el.value=value;return el;};
 const field=(label,control)=>h('div',{class:'field'},h('label',{for:control.id},label),control);
 const bridges=()=>[['','No bridge / all bridges'],...window.RPB.bridges.map(b=>[b.id,b.short]),['other','Another idea']];
 const message=text=>{const el=mount.querySelector('#vaultStatus');if(el){el.textContent=text;el.focus();}};
 async function run(fn){if(busy)return;busy=true;try{await fn();}catch(err){message(err.message||String(err));}finally{busy=false;}}
 async function load(){data=V.clean(await Store.get(KEY));changed();}
 let channel=null;try{channel=new BroadcastChannel('rpb-vault');channel.onmessage=()=>{message('Vault changed in another tab. Reload records before editing; your draft is still here.');};}catch{}
 const announce=()=>{channel?.postMessage('changed');changed();};
 async function update(fn){data=await Store.updateAtomic(KEY,fn);announce();}
 async function capture(values){
  const key=uid();let duplicate=false;
  await update(raw=>{const d=V.clean(raw);if(values.origin&&d.records.some(r=>r.origin===values.origin)){duplicate=true;return d;}return V.save(d,key,0,values,now());});
  editing=null;render(duplicate?'This source revision is already captured.':'Captured a private snapshot. The source record is unchanged.');
 }
 function render(info=''){
  const r=editing||V.fresh();
  const kind=select('vaultKind',Object.entries(V.kinds),r.kind),title=input('vaultTitle',r.title),body=area('vaultBody',r.body),context=area('vaultContext',r.context,2000),source=input('vaultSource',r.source,1000),bridge=select('vaultBridge',bridges(),r.bridgeId);
  const search=input('vaultSearch',query,200),typeFilter=select('vaultTypeFilter',[['','All record types'],...Object.entries(V.kinds)],filter),byBridge=select('vaultBridgeFilter',bridges(),bridgeFilter);
  const status=h('p',{id:'vaultStatus',role:'status',tabindex:'-1'},info);
  const list=h('div',{id:'vaultList'}),count=h('p',{id:'vaultCount'});
  const matches=()=>{
   const terms=query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
   const records=data.records.filter(x=>(!filter||x.kind===filter)&&(!bridgeFilter||x.bridgeId===bridgeFilter)&&terms.every(w=>[x.title,x.body,x.context,x.source,x.planId,x.origin].join(' ').toLocaleLowerCase().includes(w))).sort((a,b)=>b.updated.localeCompare(a.updated));
   count.textContent=records.length+' of '+data.records.length+' private vault records';
   list.replaceChildren(...records.map(x=>h('article',{class:'panel','data-vault-id':x.id},h('h4',{dir:'auto'},x.title),h('p',null,V.kinds[x.kind]+' · revision '+x.revision+' · '+x.updated),h('p',{class:'vault-text',dir:'auto'},x.body),h('p',{dir:'auto'},x.context),h('p',{dir:'auto'},x.source),x.origin?h('p',{dir:'auto'},'Captured source: '+x.origin):null,
    btn('vaultEdit-'+x.id,'Edit note',()=>{editing=x;render();mount.querySelector('#vaultTitle').focus();}),
    btn('vaultDelete-'+x.id,'Delete note',async()=>{if(await confirmDialog('Delete this vault note?','This removes the note and its retained history from this vault. Copies and original plan accounts remain.','Delete note')){await update(raw=>V.remove(raw,x.id,x.revision));if(editing?.id===x.id)editing=null;render('Note deleted.');}}),
    h('details',null,h('summary',null,x.history.length+' previous revisions'),x.history.map(v=>h('div',null,h('p',null,'Revision '+v.revision+' · '+v.updated),h('pre',{class:'fork-value',dir:'auto'},JSON.stringify(v,null,2))))))));
  };
  search.oninput=()=>{query=search.value;matches();};typeFilter.onchange=()=>{filter=typeFilter.value;matches();};byBridge.onchange=()=>{bridgeFilter=byBridge.value;matches();};
  const file=h('input',{id:'vaultImport',type:'file',accept:'.json,application/json','aria-label':'Import Knowledge Vault backup'});
  file.onchange=()=>run(async()=>{const f=file.files?.[0];file.value='';if(!f)return;if(f.size>64000000)throw Error('Backup exceeds 64 MB.');const incoming=V.readPacket(JSON.parse(await f.text()));if(!(await confirmDialog('Import private vault records?',incoming.records.length+' incoming records. Identical IDs are skipped; conflicting IDs keep the local version.','Import records')))return;let result;await update(raw=>{result=V.merge(raw,incoming);return result.vault;});editing=null;render(result.added+' added; '+result.duplicates+' duplicates; '+result.conflicts+' conflicts kept local.');});
  mount.replaceChildren(h('h3',null,'IndexedDB Knowledge Vault'),h('p',{id:'vaultStorage'},Store.mode==='indexeddb'?'Storage: IndexedDB — local to this browser and origin.':Store.mode==='local'?'IndexedDB unavailable: using localStorage on this device. Export a backup; capacity is smaller.':'Storage unavailable: memory only. Export before closing this page.'),
   h('p',null,'Research notes, community observations, lessons learned and bridge adaptations. Nothing is uploaded. This vault is not encrypted and browser data can be cleared. Existing plan knowledge stays in its plan until you explicitly capture a copy.'),status,
   h('p',null,editing?'Editing revision '+editing.revision:'New private note'),field('Record type',kind),field('Title',title),field('Note',body),field('Context and limitations',context),field('Source / attribution / citation (plain text)',source),field('Related bridge',bridge),
   btn('vaultSave','Save note',async()=>{const values={kind:kind.value,title:title.value,body:body.value,context:context.value,source:source.value,bridgeId:bridge.value,planId:editing?.planId||'',origin:editing?.origin||''};const id=editing?.id||uid(),expected=editing?.revision||0;await update(raw=>V.save(raw,id,expected,values,now()));editing=null;render('Saved locally.');}),
   btn('vaultCancel','New note / discard draft',()=>{editing=null;render();}),
   btn('vaultReload','Reload records (keep draft)',async()=>{await load();matches();message('Records reloaded. Reopen a record to edit its latest revision.');}),
   h('details',null,h('summary',null,'Capture from the active bridge plan'),h('p',null,'Captures are independent private snapshots. Later edits or withdrawal in the source do not alter a vault copy. Review permission before capturing or sharing.'),
    btn('vaultCaptureAccounts','Capture active bridge observations and lessons',async()=>{
     const p=getPlan();if(!p?.bridge)throw Error('Choose a bridge in the planner first.');
     const accounts=window.RPB_KNOWLEDGE.forBridge(p.knowledge,p.bridge,true).filter(x=>{const s=window.RPB_KNOWLEDGE.current(x);return !s.withdrawn&&['observation','lesson'].includes(s.kind);});
     if(!accounts.length)throw Error('No active observations or lessons for this bridge.');
     if(!(await confirmDialog('Capture community accounts?',accounts.length+' local snapshots will be retained independently of the source, including future withdrawal.','Capture snapshots')))return;
     let added=0;await update(raw=>{let d=V.clean(raw);for(const x of accounts){const s=window.RPB_KNOWLEDGE.current(x),origin='knowledge:'+p.forking.id+':'+x.id+':'+x.versions.length;if(d.records.some(r=>r.origin===origin))continue;d=V.save(d,uid(),0,{...V.fresh(),kind:s.kind,title:s.statement.slice(0,200),body:s.statement+'\n\nSource account metadata:\n'+JSON.stringify(s,null,2),context:s.context,source:s.source,bridgeId:p.bridge,planId:p.forking.id,origin},now());added++;}return d;});editing=null;render(added+' source accounts captured; existing source revisions skipped.');
    }),
    btn('vaultCaptureAdaptation','Capture current bridge adaptation',async()=>{const p=getPlan();if(!p)throw Error('Create a plan first.');const body=[p.project,p.notes,...window.RPB_FORKING.attribution(p),...window.RPB_PROVENANCE.lines(p.provenance,p.bridge,false),p.forking.parent?JSON.stringify(window.RPB_FORKING.diff(p.forking.parent.baseline,window.RPB_FORKING.design(p)),null,2):'No fork baseline; this is a local planning note.'].filter(Boolean).join('\n\n');await capture({...V.fresh(),kind:'adaptation',title:(p.project||'Untitled bridge')+' adaptation',body,context:'Snapshot of the active plan. Review inherited statements in their original context.',source:p.forking.credit,bridgeId:p.bridge,planId:p.forking.id});})),
   h('h4',null,'Find private knowledge'),field('Search vault',search),field('Filter record type',typeFilter),field('Filter bridge',byBridge),count,list,
   h('h4',null,'Private backup and recovery'),h('p',null,'Backups include all records and their last ten revisions, regardless of filters. Export everything also includes the vault. Use this import control to restore the vault portion of either backup; plan import restores plans separately. Plan auto-deletion does not delete vault records. Delete everything on this device also deletes the vault.'),
   btn('vaultExport','Export vault backup',async()=>{const current=V.clean(await Store.get(KEY));safetyGate(current,()=>download('knowledge-vault.json',JSON.stringify(V.packet(current),null,2),'application/json'));}),field('Import private vault or Export everything backup',file),
   btn('vaultClear','Delete vault contents',async()=>{if(await confirmDialog('Delete all vault records?','All vault notes and their history will be removed. Plans and downloaded copies remain.','Delete vault')){await update(()=>V.empty());editing=null;render('Vault cleared.');}}));matches();
 }
 try{
  let raw=await Store.get(KEY);
  if(raw==null&&Store.mode==='indexeddb'){let fallback=null;try{fallback=JSON.parse(localStorage.getItem('rpb_kv_'+KEY)||'null');}catch{}if(fallback){raw=await Store.updateAtomic(KEY,old=>old==null?V.clean(fallback):V.clean(old));}}
  data=V.clean(raw);render();
 }catch(err){render('Vault could not be read: '+err.message+'. Existing storage has not been overwritten.');}
 return {reload:async()=>{await load();render();announce();},rows:()=>data.records,backup:async()=>V.clean(await Store.get(KEY)),reset:()=>{data=V.empty();editing=null;render();announce();},open:id=>{const r=data.records.find(r=>r.id===id);if(r){editing=r;render();}mount.scrollIntoView({block:'start'});mount.querySelector('#vaultTitle').focus();}};
};
