/* Non-financial solutions commons. Portable notices, never automatic publication. */
(() => {
  'use strict';
  const needed={water:'Water',food:'Food',restoration:'Restoration',mediation:'Mediation',monitoring:'Monitoring'};
  const offered={knowledge:'Knowledge',volunteers:'Volunteers',seeds:'Seeds',training:'Training',equipment:'Equipment'};
  const states={draft:'Draft',open:'Open',paused:'Paused',fulfilled:'Fulfilled',withdrawn:'Withdrawn'};
  const empty=()=>({schema:1,listings:[]});
  const fresh=()=>({kind:'needed',category:'water',themes:['water'],title:'',description:'',community:'',area:'',capacity:'',conditions:'',route:'',start:'',end:'',status:'draft',sharing:'local',permission:''});
  const fail=m=>{throw Error(m);};
  const text=(v,max)=>{if(typeof v!=='string'||v.length>max)fail('Missing or overlong commons text.');return v.trim();};
  const id=v=>{if(typeof v!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(v))fail('Invalid commons ID.');return v;};
  const date=v=>{if(typeof v!=='string'||(v&&(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)))fail('Use a valid calendar date.');return v;};
  const stamp=v=>{if(typeof v!=='string'||!Number.isFinite(Date.parse(v))||new Date(v).toISOString()!==v)fail('Invalid commons timestamp.');return v;};
  const bridges=()=>new Set([...window.RPB.bridges.map(b=>b.id),'other']);
  function snapshot(raw){
    if(!raw)fail('Missing listing.');const s=fresh();
    if(!['needed','offered'].includes(raw.kind)||!Object.hasOwn(raw.kind==='needed'?needed:offered,raw.category)||!Object.hasOwn(states,raw.status)||!['local','shared'].includes(raw.sharing))fail('Invalid listing type, category, status or sharing state.');
    for(const key of ['kind','category','status','sharing'])s[key]=raw[key];
    for(const [key,max] of Object.entries({title:120,description:1500,community:160,area:200,capacity:300,conditions:700,route:300,permission:500}))s[key]=text(raw[key],max);
    if(!s.title||!s.description||!s.community||!s.area)fail('Add a title, description, community group and broad area.');
    if(!Array.isArray(raw.themes)||!raw.themes.length||raw.themes.length>5||new Set(raw.themes).size!==raw.themes.length||raw.themes.some(t=>!Object.hasOwn(needed,t)))fail('Choose at least one valid need addressed by this listing.');s.themes=[...raw.themes].sort();
    if(s.kind==='needed'&&!s.themes.includes(s.category))fail('A needed listing must include its own topic.');
    s.start=date(raw.start);s.end=date(raw.end);if(s.start&&s.end&&s.start>s.end)fail('Availability end must not precede its start.');
    if(s.sharing==='shared'&&(!s.permission||!s.route||!s.end||s.status==='draft'))fail('Sharing requires permission, a community contact route, an expiry/review date and a non-draft status.');
    return s;
  }
  const current=r=>r.versions.at(-1).snapshot;
  function clean(raw){
    if(raw==null)return empty();if(raw.schema!==1||!Array.isArray(raw.listings)||raw.listings.length>200)fail('Invalid commons schema or more than 200 listings.');
    const out=empty(),seen=new Set();
    for(const r of raw.listings){
      if(!r||!bridges().has(r.bridgeId)||!Array.isArray(r.versions)||!r.versions.length||r.versions.length>20)fail('Invalid listing bridge or history (maximum 20 revisions).');
      const x={id:id(r.id),bridgeId:r.bridgeId,origin:null,versions:[]};if(seen.has(x.id))fail('Duplicate listing ID.');seen.add(x.id);let last='';
      x.versions=r.versions.map(v=>{const at=stamp(v.at),reason=text(v.reason,500);if(!reason||at<last)fail('Revisions require reasons and chronological timestamps.');last=at;return {at,reason,snapshot:snapshot(v.snapshot)};});
      if(r.origin!=null){const o=r.origin;if(!Number.isInteger(o.revision)||o.revision<1||o.revision>20||!bridges().has(o.bridgeId))fail('Invalid source revision.');x.origin={id:id(o.id),revision:o.revision,at:stamp(o.at),bridgeId:o.bridgeId,snapshot:snapshot(o.snapshot)};if(x.origin.snapshot.sharing!=='shared'||current(x).sharing!=='local')fail('Received listings must retain shared source permission and remain local-only.');}
      out.listings.push(x);
    }
    if(JSON.stringify(out).length>2000000)fail('Commons data exceeds 2 MB in this plan.');return out;
  }
  function save(raw,bid,key,values,reason,at=new Date().toISOString()){
    const out=clean(raw),s=snapshot(values);id(key);stamp(at);reason=text(reason,500);if(!reason)fail('Explain this revision.');
    if(s.sharing==='shared'&&s.status==='open'&&s.end<at.slice(0,10))fail('Renew the expiry/review date before sharing an open listing.');
    let r=out.listings.find(r=>r.id===key);if(r&&(r.origin||r.bridgeId!==bid))fail('Received listings are read-only. Create your own listing instead.');
    if(!r){r={id:key,bridgeId:bid,origin:null,versions:[]};out.listings.push(r);}r.versions.push({at,reason,snapshot:s});return clean(out);
  }
  const state=(r,today=new Date().toISOString().slice(0,10))=>{const s=current(r);return s.status==='open'&&s.end&&s.end<today?'expired':s.status;};
  const active=(r,today)=>state(r,today)==='open';
  function matches(raw,key,today=new Date().toISOString().slice(0,10)){
    const listings=raw.listings||[],a=listings.find(r=>r.id===key);if(!a||!active(a,today))return [];
    const x=current(a);return listings.filter(b=>b.id!==key&&active(b,today)&&current(b).kind!==x.kind).map(b=>{const y=current(b),themes=x.themes.filter(t=>y.themes.includes(t)),overlap=!(x.end&&y.start&&x.end<y.start||y.end&&x.start&&y.end<x.start);return {listing:b,themes,overlap};}).filter(m=>m.themes.length&&m.overlap);
  }
  function packet(raw){const listings=clean(raw).listings.filter(r=>!r.origin&&current(r).sharing==='shared');if(!listings.length)fail('No listings approved for sharing.');return {format:'rpb-solutions-commons',schema:1,notice:'Community notices, not verified commitments. Recheck availability, authority and consent. No payments or automatic contact.',listings:listings.map(r=>({id:r.id,bridgeId:r.bridgeId,revision:r.versions.length,at:r.versions.at(-1).at,snapshot:current(r)}))};}
  function readPacket(p){
    if(!p||p.format!=='rpb-solutions-commons'||p.schema!==1||!Array.isArray(p.listings)||p.listings.length>200)fail('Not a valid commons exchange file.');const seen=new Set();
    const rows=p.listings.map(r=>{if(!r||!bridges().has(r.bridgeId)||!Number.isInteger(r.revision)||r.revision<1||r.revision>20)fail('Invalid shared listing revision.');const x={id:id(r.id),bridgeId:r.bridgeId,revision:r.revision,at:stamp(r.at),snapshot:snapshot(r.snapshot)};if(seen.has(x.id)||x.snapshot.sharing!=='shared')fail('Shared files require unique, approved listings.');seen.add(x.id);return x;});
    if(JSON.stringify(rows).length>2000000)fail('Commons exchange exceeds 2 MB.');return rows;
  }
  function importPacket(raw,p,makeId,at=new Date().toISOString()){
    const data=clean(raw),rows=readPacket(p);stamp(at);let added=0,updated=0,skipped=0,conflicts=0;
    for(const incoming of rows){
      const own=data.listings.find(r=>!r.origin&&r.id===incoming.id);
      if(own){if(own.bridgeId===incoming.bridgeId&&incoming.revision<=own.versions.length&&JSON.stringify(own.versions[incoming.revision-1].snapshot)===JSON.stringify(incoming.snapshot))skipped++;else conflicts++;continue;}
      const r=data.listings.find(r=>r.origin?.id===incoming.id);
      if(r){const o=r.origin;if(incoming.bridgeId!==o.bridgeId){conflicts++;continue;}if(incoming.revision<o.revision){skipped++;continue;}if(incoming.revision===o.revision){if(incoming.at===o.at&&JSON.stringify(incoming.snapshot)===JSON.stringify(o.snapshot))skipped++;else conflicts++;continue;}if(incoming.at<o.at){conflicts++;continue;}}
      const s={...incoming.snapshot,sharing:'local',permission:''};
      if(r){r.origin=incoming;r.versions.push({at,reason:'Received newer source revision '+incoming.revision,snapshot:s});updated++;}
      else{data.listings.push({id:makeId(),bridgeId:incoming.bridgeId,origin:incoming,versions:[{at,reason:'Received source revision '+incoming.revision,snapshot:s}]});added++;}
    }
    return {data:clean(data),added,updated,skipped,conflicts};
  }
  function lines(raw,bid,sharedOnly=true){return (raw?.listings||[]).filter(r=>(!bid||r.bridgeId===bid)&&(!sharedOnly||!r.origin&&current(r).sharing==='shared')).map(r=>{const s=current(r);return `${s.kind==='needed'?'Needed':'Offered'}: ${s.title} — ${(s.kind==='needed'?needed:offered)[s.category]}; ${states[state(r)]||'Expired'}. ${s.description} Community: ${s.community}. Area: ${s.area}. Capacity: ${s.capacity||'Discuss locally'}. Conditions: ${s.conditions||'Discuss locally'}. Availability: ${s.start||'Discuss'} to ${s.end||'Not specified'}. Contact route: ${s.route||'Not shared'}.`;});}
  const texts=raw=>(raw?.listings||[]).flatMap(r=>r.versions.flatMap(v=>[v.reason,...Object.values(v.snapshot).filter(x=>typeof x==='string')]).concat(r.origin?Object.values(r.origin.snapshot).filter(x=>typeof x==='string'):[]));
  const examples=[['needed','water','Water-point maintenance support','A community water group seeks help diagnosing recurring pump downtime.'],['needed','food','Community food-growing guidance','Growers seek locally suitable advice for a shared demonstration plot.'],['needed','restoration','Restoration planning support','Land users seek help planning a small restoration trial after agreeing rights.'],['needed','mediation','Facilitation for shared access','A dialogue group seeks voluntary facilitation around seasonal resource access.'],['needed','monitoring','Participatory monitoring skills','A restoration group seeks a simple method to record tree survival.'],['offered','knowledge','Local soil-cover learning','A farming group can share its own observations and limits from soil-cover trials.'],['offered','volunteers','Volunteer monitoring time','A community team offers a limited number of supervised monitoring sessions.'],['offered','seeds','Locally appropriate seed exchange','A seed group offers a discussion about suitability, provenance and voluntary sharing.'],['offered','training','Peer facilitation training','Experienced facilitators offer a small peer-learning session.'],['offered','equipment','Shared monitoring equipment','A group offers supervised use of simple monitoring equipment under agreed care rules.']];
  window.RPB_COMMONS={needed,offered,states,empty,fresh,snapshot,clean,current,save,state,active,matches,packet,readPacket,importPacket,lines,texts,examples};
})();
