/* Community-governed TK records. Consent entries are local claims, not authentication. */
(()=>{
 'use strict';
 const types={indigenous:'Indigenous ecological knowledge',traditional:'Traditional local practice',community:'Community ecological practice'};
 const relations={context:'Related context — no claim of equivalence',complements:'Complementary perspective',differs:'Different account or conditions',question:'Question for joint inquiry'};
 const reviews={unreviewed:'Awaiting knowledge-holder review',reviewed:'Reviewed through holder-led processes',plural:'Different holder perspectives recorded'};
 const empty=()=>({schema:1,records:[]});
 const today=()=>new Date().toISOString().slice(0,10);
 const fresh=()=>({type:'indigenous',title:'',practice:'',community:'',language:'und',context:'',basis:'',limits:'',protocol:'',benefits:'',permissionReference:'',permissionDate:today(),retentionReview:'',captureApproved:false,review:'unreviewed',reviewNote:'',sharing:'local',shareApproved:false,shareReference:'',shareUntil:'',publicTitle:'',publicSummary:'',publicCredit:'',publicTerms:'',publishLinks:false,projectURL:'',links:[],withdrawn:false});
 const fail=m=>{throw Error(m);};
 const text=(v,max,required=false)=>{if(typeof v!=='string'||v.length>max||(required&&!v.trim()))fail('Missing or invalid traditional knowledge text.');return v.trim();};
 const choice=(v,list)=>list.includes(v)?v:fail('Invalid traditional knowledge choice.');
 const date=v=>{if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)fail('Use a valid consent/review date.');return v;};
 const id=v=>{if(typeof v!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(v))fail('Invalid traditional knowledge ID.');return v;};
 const stamp=v=>{if(typeof v!=='string'||!Number.isFinite(Date.parse(v))||new Date(v).toISOString()!==v)fail('Invalid traditional knowledge timestamp.');return v;};
 const targets=kind=>kind==='source'?window.RPB.documents:kind==='practice'?window.RPB.practices:kind==='bridge'?window.RPB.bridges:[];
 function snapshot(raw){
  if(!raw||typeof raw!=='object')fail('Missing traditional knowledge record.');const s=fresh();
  for(const [k,n]of Object.entries({title:200,practice:2000,community:300,language:40,context:1500,basis:1500,limits:1500,protocol:2000,benefits:1000,permissionReference:1000,reviewNote:1500,shareReference:1000,publicTitle:200,publicSummary:1500,publicCredit:500,publicTerms:1500,projectURL:500}))s[k]=text(raw[k],n,['title','practice','community','language','context','basis','limits','protocol','permissionReference'].includes(k));
  if(!/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(s.language))fail('Use a language code such as en, sw or und.');
  s.type=choice(raw.type,Object.keys(types));s.review=choice(raw.review,Object.keys(reviews));s.sharing=choice(raw.sharing,['local','summary']);
  for(const k of ['captureApproved','shareApproved','publishLinks','withdrawn']){if(typeof raw[k]!=='boolean')fail('Invalid permission choice.');s[k]=raw[k];}
  if(!s.captureApproved)fail('Document only with the knowledge holders’ permission for recording and local storage.');
  s.permissionDate=date(raw.permissionDate);s.retentionReview=date(raw.retentionReview);s.shareUntil=raw.shareUntil?date(raw.shareUntil):'';
  if(s.retentionReview<s.permissionDate)fail('Retention review cannot precede recording permission.');
  if(s.review!=='unreviewed'&&!s.reviewNote)fail('Describe the holder-led review process and any differing perspectives.');
  if(s.projectURL){let url;try{url=new URL(s.projectURL);}catch(e){fail('Use a valid community-managed Local Contexts project URL.');}if(url.protocol!=='https:'||url.username||url.password||!['localcontextshub.org','localcontexts.org'].some(host=>url.hostname===host||url.hostname.endsWith('.'+host)))fail('Project URL must be an HTTPS Local Contexts URL. No label is assigned automatically.');}
  if(!Array.isArray(raw.links)||raw.links.length>4)fail('Use up to four cross-references per record.');const seen=new Set();
  s.links=raw.links.map(l=>{const kind=choice(l.kind,['source','practice','bridge']),key=kind+'|'+l.id;if(seen.has(key)||!targets(kind).some(t=>t.id===l.id))fail('Unknown or duplicate cross-reference.');seen.add(key);return {kind,id:id(l.id),relation:choice(l.relation,Object.keys(relations)),note:text(l.note,1000,true)};});
  if(s.withdrawn&&s.sharing!=='local')fail('Withdrawn knowledge cannot be shared.');
  if(s.sharing==='summary'&&(!s.shareApproved||!s.shareReference||!s.shareUntil||s.review==='unreviewed'||!s.publicTitle||!s.publicSummary||!s.publicCredit||!s.publicTerms||!s.benefits))fail('Sharing requires separate approval, reviewed public text/credit/use terms, benefit arrangements and an expiry date.');
  return s;
 }
 function clean(raw){
  if(raw==null)return empty();if(raw.schema!==1||!Array.isArray(raw.records)||raw.records.length>100)fail('Traditional knowledge supports up to 100 records per plan.');const seen=new Set();
  const records=raw.records.map(r=>{const key=id(r.id);if(seen.has(key))fail('Duplicate traditional knowledge ID.');seen.add(key);if(!window.RPB.bridges.some(b=>b.id===r.bridgeId)&&r.bridgeId!=='other')fail('Select a bridge for this record.');if(!Array.isArray(r.versions)||!r.versions.length||r.versions.length>21)fail('Up to 20 revisions plus a final withdrawal are supported.');let previous=stamp(r.createdAt);
   const versions=r.versions.map(v=>{const at=stamp(v.at),s=snapshot(v.snapshot);if(at<previous||s.permissionDate>at.slice(0,10))fail('Invalid revision or permission chronology.');previous=at;return {at,reason:text(v.reason,1000,true),snapshot:s};});if(versions.length===21&&!versions.at(-1).snapshot.withdrawn)fail('Final revision slot is reserved for withdrawal.');const withdrawal=r.withdrawal==null?null:{at:stamp(r.withdrawal.at),reason:text(r.withdrawal.reason,1000,true)};if(withdrawal&&withdrawal.at<previous)fail('Withdrawal cannot precede the latest revision.');return {id:key,bridgeId:r.bridgeId,createdAt:r.createdAt,versions,withdrawal};});
  const result={schema:1,records};if(JSON.stringify(result).length>2120000)fail('Traditional knowledge exceeds the 2 MB plan limit. Preserve a private backup before starting another plan.');return result;
 }
 const current=r=>r.versions.at(-1).snapshot;
 function save(raw,recordId,bridgeId,values,reason,at,newId){const p=clean(raw),r=p.records.find(r=>r.id===recordId),v={at,reason,snapshot:values};if(values.retentionReview<at.slice(0,10)||(values.sharing==='summary'&&values.shareUntil<at.slice(0,10)))fail('Renew expired recording/sharing permission before adding this revision.');if(r){if(r.withdrawal)fail('Withdrawn records remain withdrawn. Obtain fresh permission for a new account.');if(r.bridgeId!==bridgeId)fail('A record cannot silently change its bridge context.');if(r.versions.length>=20&&!values.withdrawn)fail('Revision limit reached; preserve the record and history.');r.versions.push(v);}else p.records.push({id:newId,bridgeId,createdAt:at,versions:[v],withdrawal:null});const result=clean(p);if(JSON.stringify(result).length>2000000)fail('Record capacity reached; preserve existing history and permissions.');return result;}
 function eligible(r,on=today()){date(on);const s=current(r);return !r.withdrawal&&!s.withdrawn&&s.captureApproved&&s.sharing==='summary'&&s.shareApproved&&s.review!=='unreviewed'&&s.permissionDate<=on&&s.retentionReview>=on&&s.shareUntil>=on;}
 const publicRecord=r=>{const s=current(r);return {id:r.id,revision:r.versions.length,bridgeId:r.bridgeId,title:s.publicTitle,summary:s.publicSummary,credit:s.publicCredit,terms:s.publicTerms,validUntil:[s.shareUntil,s.retentionReview].sort()[0],links:s.publishLinks?s.links.map(({kind,id,relation})=>({kind,id,relation})):[]};};
 const packet=(raw,bridgeId,on=today())=>({format:'rpb-traditional-knowledge-summaries',schema:1,notice:'Permission-scoped summaries, not open licenses, independent authentication or institutional grades. Further use requires the stated terms and engagement with knowledge holders. No automatic synchronization or recall.',records:clean(raw).records.filter(r=>(!bridgeId||r.bridgeId===bridgeId)&&eligible(r,on)).map(publicRecord)});
 const lines=(raw,bridgeId,on=today())=>packet(raw,bridgeId,on).records.flatMap(r=>[r.title+': '+r.summary,'Credit: '+r.credit,'Use terms: '+r.terms+'; review/expiry: '+r.validUntil,...r.links.map(l=>'Cross-reference: '+l.kind+' '+l.id+' — '+relations[l.relation])]);
 function withdraw(raw,recordId,reason,at){const p=clean(raw),r=p.records.find(r=>r.id===recordId);if(!r)fail('Record not found.');if(r.withdrawal)return p;r.withdrawal={at,reason};return clean(p);}
 const texts=raw=>clean(raw).records.flatMap(r=>r.versions.flatMap(v=>Object.values(v.snapshot).filter(x=>typeof x==='string').concat(v.reason,v.snapshot.links.flatMap(l=>[l.id,l.note]))));
 window.RPB_TK={types,relations,reviews,empty,fresh,clean,current,save,withdraw,eligible,packet,lines,texts,targets,today};
})();
