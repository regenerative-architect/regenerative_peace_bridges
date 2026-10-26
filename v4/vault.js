/* Bounded, private knowledge records; storage is supplied by the application. */
(() => {
 'use strict';
 const kinds={research:'Research notes',observation:'Community observations',lesson:'Lessons learned',adaptation:'Bridge adaptations'};
 const empty=()=>({schema:1,records:[]});
 const fail=m=>{throw Error(m);};
 const text=(v,n)=>{if(typeof v!=='string'||v.length>n)fail('Invalid or overlong vault text.');return v.trim();};
 const id=v=>{if(typeof v!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(v))fail('Invalid vault ID.');return v;};
 const date=v=>{if(typeof v!=='string'||!Number.isFinite(Date.parse(v))||new Date(v).toISOString()!==v)fail('Invalid vault date.');return v;};
 const fresh=()=>({kind:'research',title:'',body:'',context:'',source:'',bridgeId:'',planId:'',origin:''});
 function fields(raw){
  if(!raw||!Object.hasOwn(kinds,raw.kind))fail('Choose a valid vault category.');
  const r=fresh();r.kind=raw.kind;
  for(const [k,n] of Object.entries({title:200,body:20000,context:2000,source:1000,planId:100,origin:240}))r[k]=text(raw[k],n);
  if(!r.title||!r.body)fail('Add a title and note.');
  if(typeof raw.bridgeId!=='string'||(raw.bridgeId&&raw.bridgeId!=='other'&&!window.RPB.bridges.some(b=>b.id===raw.bridgeId)))fail('Unknown vault bridge.');r.bridgeId=raw.bridgeId;
  return r;
 }
 function snapshot(raw){
  const r={...fields(raw),id:id(raw.id),revision:raw.revision,created:date(raw.created),updated:date(raw.updated)};
  if(!Number.isSafeInteger(r.revision)||r.revision<1||r.updated<r.created)fail('Invalid vault revision.');return r;
 }
 function record(raw){
  const r=snapshot(raw);if(!Array.isArray(raw.history)||raw.history.length>10)fail('Invalid vault history.');
  let previous=0,last=r.created;
  r.history=raw.history.map(x=>{const h=snapshot(x);if(h.id!==r.id||h.created!==r.created||h.revision<=previous||h.revision>=r.revision||h.updated<last||h.updated>r.updated)fail('Invalid vault history sequence.');previous=h.revision;last=h.updated;return h;});return r;
 }
 function clean(raw){
  if(raw==null)return empty();
  if(raw.schema!==1||!Array.isArray(raw.records)||raw.records.length>500)fail('The vault supports up to 500 records.');
  if(JSON.stringify(raw).length>20000000)fail('Vault exceeds the 20 MB backup limit.');
  const seen=new Set();return {schema:1,records:raw.records.map(x=>{const r=record(x);if(seen.has(r.id))fail('Duplicate vault IDs.');seen.add(r.id);return r;})};
 }
 function save(raw,key,expected,input,at){
  const out=clean(raw),prev=out.records.find(r=>r.id===key);
  if((prev?.revision||0)!==expected)fail('This record changed or was deleted in another tab. Reload it before saving.');
  if(prev&&at<prev.updated)fail('Save date precedes the previous revision.');
  const history=prev?[...prev.history,(({history,...s})=>s)(prev)].slice(-10):[];
  const r=record({...fields(input),id:key,revision:expected+1,created:prev?.created||at,updated:at,history});
  if(prev)out.records[out.records.indexOf(prev)]=r;else out.records.push(r);return clean(out);
 }
 function remove(raw,key,expected){const out=clean(raw),r=out.records.find(r=>r.id===key);if(!r||r.revision!==expected)fail('This record changed or was deleted. Reload before deleting.');out.records=out.records.filter(x=>x.id!==key);return out;}
 const packet=raw=>({format:'rpb-knowledge-vault',schema:1,notice:'Private local records and revision history. Review permission before sharing; no authorship or evidence verification is implied.',vault:clean(raw)});
 function readPacket(p){if(p?.format==='rpb-knowledge-vault'&&p.schema===1&&p.vault)return clean(p.vault);if(p?.app==='regenerative-peace-bridges'&&p.kind==='everything'&&p.knowledgeVault)return clean(p.knowledgeVault);fail('Choose a Knowledge Vault or Export everything backup.');}
 function merge(raw,incoming){const out=clean(raw),add=clean(incoming);let duplicates=0,conflicts=0,added=0;for(const r of add.records){const prev=out.records.find(x=>x.id===r.id);if(prev){if(JSON.stringify(prev)===JSON.stringify(r))duplicates++;else conflicts++;}else{out.records.push(r);added++;}}return {vault:clean(out),added,duplicates,conflicts};}
 window.RPB_VAULT={kinds,empty,fresh,fields,record,clean,save,remove,packet,readPacket,merge};
})();
