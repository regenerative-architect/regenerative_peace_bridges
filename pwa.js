/* Local release controls; public archives never contain community plans. */
window.RPB_PWA = function({h,mount,mode,version,download,prepareUpdate,confirmDialog}) {
 const web=mode==='bundle'&&/^https?:$/.test(location.protocol)&&'serviceWorker' in navigator;
 const base=new URL('./',location.href),settings='rpb-release-settings',pinURL=new URL('__release-pin',base).href;
 const status=h('p',{id:'pwaHealth',role:'status'}),space=h('p',{id:'pwaStorage'}),message=h('p',{id:'pwaMessage',role:'status'}),view=h('div',{id:'pwaArchiveView'});
 const pick=h('select',{id:'pwaArchiveVersion','aria-label':'Evidence archive version'}),search=h('input',{id:'pwaArchiveSearch',type:'search',placeholder:'Search this archive','aria-label':'Search this archive'});
 let state=null,archive=null,token=0,refreshGeneration=0;
 const action=(id,label,fn)=>h('button',{id,type:'button',class:'btn btn--quiet',onclick:async()=>{try{await fn();}catch(e){message.textContent=e.message;}}},label);
 const request=(worker,data={type:'ARCHIVE_STATUS'})=>new Promise((resolve,reject)=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error('Offline verification unavailable. This may be an earlier app worker.'));},5000);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data);};worker.postMessage(data,[channel.port2]);});
 const clearPin=async()=>{if(web){const c=await caches.open(settings);await c.delete(pinURL);}};
 window.RPB_PWA.unpin=clearPin;
 async function refresh(){
  const generation=++refreshGeneration;state=null;
  space.textContent='Storage estimates unavailable. Keep an external backup.';
  try {const estimate=await navigator.storage?.estimate?.(),persistent=await navigator.storage?.persisted?.();
   const known=Number.isFinite(estimate?.usage)&&Number.isFinite(estimate?.quota)&&estimate.quota>0;
   space.textContent=(persistent===true?'Persistent storage granted. ':persistent===false?'Storage is best effort; protection has not been granted. ':'Persistence status unavailable. ')+(known?`${(estimate.usage/1048576).toFixed(1)} MB used of approximately ${(estimate.quota/1048576).toFixed(1)} MB. `:'')+(known&&(estimate.usage/estimate.quota>=0.8||estimate.quota-estimate.usage<10*1048576)?'Low storage: export backups before adding archives. ':'')+'Clearing browser data still erases local plans and caches.';
  }catch(e){}
  if(!web){status.textContent=`App ${version}. Keep this folder or standalone HTML and separate plan backups. Installation and cached version controls require HTTPS or localhost.`;return;}
  const worker=navigator.serviceWorker.controller;
  if(!worker){status.textContent=`App ${version}. Offline download not yet verified. Keep this page open until installation completes.`;return;}
  try {const response=await request(worker);if(generation!==refreshGeneration)return;state=response;status.textContent=`${navigator.onLine?'Network reported available':'Offline'} · App ${version} · ${state.version} · ${state.complete?'Offline archive verified':'Offline archive INCOMPLETE — keep this page open and export plans'}${state.pinned?' · Pinned release':' · Updates require review while open'}.`;
   const pill=document.querySelector('#netStatus');if(pill){pill.textContent=navigator.onLine?(state.complete?'Offline-ready':'Offline copy incomplete'):(state.complete?'Offline, verified copy':'Offline, copy incomplete');pill.dataset.state=state.complete?'ready':'offline';}
   const options=[];for(const name of (await caches.keys()).filter(n=>/^rpb-core-v/.test(n)).sort().reverse()){
    const c=await caches.open(name);if(await c.match(new URL('evidence-archive.json',base).href))options.push(h('option',{value:name},name.replace('rpb-core-v','Evidence ')));
   }if(generation!==refreshGeneration)return;const selected=pick.value;pick.replaceChildren(...options);if([...pick.options].some(o=>o.value===selected))pick.value=selected;else if([...pick.options].some(o=>o.value===state.version))pick.value=state.version;
   await loadArchive();
  }catch(e){if(generation===refreshGeneration)status.textContent=e.message;}
 }
 async function loadArchive(){const id=++token;archive=null;view.replaceChildren();if(!pick.value)return;const c=await caches.open(pick.value),r=await c.match(new URL('evidence-archive.json',base).href);if(!r)throw Error('Archive missing; no network substitute was loaded.');const data=await r.json();if(id!==token)return;if(data.format!=='rpb-evidence-archive'||data.schema!==1||!Array.isArray(data.data?.documents)||!Array.isArray(data.data?.bridges))throw Error('Unsupported evidence archive.');archive=data;draw();}
 function draw(){view.replaceChildren();if(!archive)return;const q=search.value.toLowerCase(),records=[...archive.data.documents,...archive.data.bridges].filter(r=>JSON.stringify(r).toLowerCase().includes(q));view.append(h('p',null,`Read-only evidence ${archive.version}: ${records.length} matching records. Planner and main library remain on app ${version}. Source dates describe review history, not a guarantee of current accuracy.`));for(const r of records)view.append(h('details',null,h('summary',null,r.title||r.name||r.id),h('pre',{class:'pwa-archive-record'},JSON.stringify(r,null,2))));}
 pick.addEventListener('change',()=>loadArchive().catch(e=>message.textContent=e.message));search.addEventListener('input',draw);
 mount.append(h('details',{id:'pwaDetails',lang:'en'},h('summary',null,'Installation, storage and stable evidence archives'),status,space,message,
  h('p',null,'Install using Install as an app when offered, or your browser menu (on iPhone/iPad: Share → Add to Home Screen). Installation is optional and does not replace backups. A network indicator does not prove internet access.'),
  action('pwaRefresh','Verify offline copy and storage',refresh),
  action('pwaProtect','Request persistent storage',async()=>{if(!navigator.storage?.persist)throw Error('Persistent storage is unavailable here. Export backups instead.');const ok=await navigator.storage.persist();message.textContent=ok?'Protection granted against automatic storage eviction; manual clearing still deletes data.':'Protection not granted. Keep external backups.';await refresh();}),
  action('pwaPin','Pin this app release',async()=>{await refresh();if(!state?.complete)throw Error('Verify a complete offline release before pinning.');const c=await caches.open(settings);await c.put(pinURL,new Response(JSON.stringify({version:state.version}),{headers:{'Content-Type':'application/json'}}));message.textContent='Pinned. Future workers keep serving this complete release until you accept an update. Pinning is not a backup.';await refresh();}),
  action('pwaCheckUpdate','Check for an update',async()=>{if(!web)throw Error('Open the served folder edition to check for updates.');const reg=await navigator.serviceWorker.getRegistration();if(!reg)throw Error('Offline installation has not started.');await reg.update();message.textContent='Update check finished. If a complete new release is available, use its Reload prompt. Current release and pin remain until you accept.';}),
  action('pwaUseUpdate','Unpin and use available app release',async()=>{if(!web)throw Error('Available in the served folder edition.');await prepareUpdate();const reg=await navigator.serviceWorker.getRegistration();if(!reg?.active)throw Error('No installed release is available.');await clearPin();if(reg.waiting){navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});reg.waiting.postMessage({type:'SKIP_WAITING'});}else location.reload();}),
  h('p',null,'Pinned releases freeze app files and built-in evidence, not your editable plans. Keep a copy of the release ZIP or standalone HTML outside the browser. After browser storage is cleared, reopen that copy and restore your JSON backup. No browser feature can recover erased data without an external copy.'),
  h('a',{href:'#planner',onclick:()=>{const d=document.querySelector('#transferDetails');if(d)d.open=true;}},'Open encrypted backup and restore tools'),
  h('h4',null,'Evidence archive version switcher'),h('p',null,'Locally retained evidence snapshots appear; offline verification checks the active app release. Earlier releases lacking snapshots are not listed. Switching this reader never changes plans or executes older app code.'),pick,search,
  action('pwaRemoveArchive','Remove selected older release to free space',async()=>{if(!pick.value||!navigator.serviceWorker?.controller)throw Error('Select an older cached release first.');const selected=pick.value;if(!await confirmDialog({title:'Remove older offline release?',text:'Remove '+selected+' from this browser? Keep its exported evidence JSON or release ZIP first. Plans and vault records are not removed. Close other app tabs before continuing.',ok:'Remove older release'}))return;const result=await request(navigator.serviceWorker.controller,{type:'REMOVE_ARCHIVE',version:selected});if(result.error)throw Error(result.error);message.textContent='Older release removed. Plans and vault records were preserved.';await refresh();}),
  action('pwaExportArchive','Export selected evidence JSON',()=>{if(!archive)throw Error('Select an available archive first.');download('peace-bridges-evidence-'+archive.version+'.json',JSON.stringify(archive,null,2),'application/json');}),view));
 const safeRefresh=()=>refresh().catch(e=>status.textContent=e.message);
 window.addEventListener('rpb-storage-error',()=>{message.textContent='Could not save. Keep this page open, export your current plan, and free device space before retrying. Existing stored records have not been deliberately removed.';safeRefresh();});
 window.addEventListener('online',safeRefresh);window.addEventListener('offline',safeRefresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)safeRefresh();});
 if(web)navigator.serviceWorker.addEventListener('controllerchange',safeRefresh);
 safeRefresh();
};
