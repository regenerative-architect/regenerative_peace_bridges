/* =====================================================================
   Regenerative Peace Bridges — sw.js (service worker)
   Keeps an offline copy of this app's OWN files so it opens without a
   connection. It never stores other websites, your plans or anything
   you type (those live only in the page's own storage).

   When you change any file, bump VERSION so readers get the update.
   The page then shows "A new version is ready" with a Reload button,
   so nobody loses work to a surprise refresh.
   ===================================================================== */
const VERSION = "rpb-core-v3.25.0";
const CORE = [
  "./",
  "./index.html",
  "./offline.html",
  "./pwa.js",
  "./hazard.js",
  "./local_glossary.js",
  "./local-glossary-ui.js",
  "./workshop_print.js",
  "./evidence_explorer.js",
  "./evidence-explorer-ui.js",
  "./decision_tree.js",
  "./decision-tree-ui.js",
  "./seed_sovereignty.js",
  "./seed-sovereignty-ui.js",
  "./traditional_knowledge.js",
  "./traditional-knowledge-ui.js",
  "./hazard-ui.js",
  "./evidence-archive.json",
  "./styles.css",
  "./early.js",
  "./data.js",
  "./impact.js",
  "./impact-ui.js",
  "./knowledge.js",
  "./knowledge-examples.js",
  "./knowledge-ui.js",
  "./systems.js",
  "./systems-ui.js",
  "./commons.js",
  "./commons-ui.js",
  "./lang/content-paths.js",
  "./lang/catalog.js",
  "./lang/fr.js",
  "./lang/es.js",
  "./lang/ar.js",
  "./offline_transfer.js",
  "./transfer-ui.js",
  "./regenerative_economics.js",
  "./economics-ui.js",
  "./community_stewardship.js",
  "./stewardship-ui.js",
  "./replication_registry.js",
  "./replication-ui.js",
  "./scenario_engine.js",
  "./scenario-ui.js",
  "./portfolio_engine.js",
  "./portfolio-ui.js",
  "./provenance.js",
  "./provenance-ui.js",
  "./forking.js",
  "./vault.js",
  "./vault-ui.js",
  "./app.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
  "./fonts/fraunces-latin-full-normal.woff2",
  "./fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2",
  "./fonts/atkinson-hyperlegible-next-latin-wght-italic.woff2"
];


// Each release is immutable. A partial install never replaces the working release.
self.addEventListener('install',event=>event.waitUntil((async()=>{
 try { const cache=await caches.open(VERSION); await cache.addAll(CORE.map(p=>new Request(new URL(p,self.registration.scope),{cache:'reload'}))); await cache.put(new URL('__release-manifest',self.registration.scope),new Response(JSON.stringify({version:VERSION,files:CORE}))); }
 catch(error){ await caches.delete(VERSION); throw error; }
})()));
async function release(){
 try {const c=await caches.open('rpb-release-settings'),r=await c.match(new URL('__release-pin',self.registration.scope).href),pin=r&&await r.json();if(pin&&/^rpb-core-v[\w.-]+$/.test(pin.version))return {version:pin.version,pinned:true};}catch(e){}
 return {version:VERSION,pinned:false};
}
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{
 if(event.data?.type==='SKIP_WAITING')event.waitUntil(self.skipWaiting());
 if(event.data?.type==='REMOVE_ARCHIVE')event.waitUntil((async()=>{
  try {
   const name=event.data.version,chosen=await release();
   if(typeof name!=='string'||!/^rpb-core-v[\w.-]+$/.test(name)||name===VERSION||name===chosen.version)throw Error('The current or pinned release cannot be removed.');
   if(self.registration.waiting||self.registration.installing)throw Error('Finish or defer the pending update before removing archives.');
   const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
   if(clients.length>1)throw Error('Close other app tabs and windows before removing an old release.');
   await caches.delete(name);event.ports[0]?.postMessage({removed:true});
  }catch(e){event.ports[0]?.postMessage({error:e.message});}
 })());
 if(event.data?.type==='ARCHIVE_STATUS')event.waitUntil((async()=>{
  try {const chosen=await release(),cache=await caches.open(chosen.version),missing=[],manifest=await cache.match(new URL('__release-manifest',self.registration.scope).href),files=manifest?(await manifest.json()).files:CORE;for(const p of files)if(!await cache.match(new URL(p,self.registration.scope).href))missing.push(p);
   event.ports[0]?.postMessage({...chosen,complete:!missing.length,missing});
  }catch(e){event.ports[0]?.postMessage({version:VERSION,complete:false,error:'Cache unavailable'});}
 })());
});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin)return;
 const scope=new URL(self.registration.scope);if(!url.pathname.startsWith(scope.pathname))return;
 const relative='./'+url.pathname.slice(scope.pathname.length);
 const appPage=req.mode==='navigate'&&(relative==='./'||relative==='./index.html');
 if(!appPage&&!CORE.includes(relative))return;
 event.respondWith((async()=>{
  try {const chosen=await release(),cache=await caches.open(chosen.version),hit=await cache.match(new URL(appPage?'./index.html':relative,scope).href);if(hit)return hit;}catch(e){}
  // Never splice network files from another release into this release.
  return new Response('Offline archive incomplete. Reconnect and check for an update, or open your saved standalone HTML. Your plans have not been deleted. Restore external backups if browser data was cleared.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
 })());
});
