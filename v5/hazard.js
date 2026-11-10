/* Mine-action prerequisite records, never a clearance certificate or technical advice. */
(()=>{
 'use strict';
 const deskBridges=['community-archives','local-knowledge','resilience-portals','regenerative-governance'];
 const checks={authority:'Qualified mine-action authority or accredited organization supplied the assessment / land-release reference.',scope:'The documented area, intended activities and restrictions match this work; no assumptions from an adjacent area or different use.',access:'Access routes and work boundaries have been addressed through the competent authority’s process.',briefing:'Workers and affected communities received appropriate explosive-ordnance risk education.',response:'A locally agreed stop-work, reporting and emergency-response arrangement is in place.',monitoring:'Conditions, residual-risk monitoring and triggers for renewed authority review are understood.'};
 const warning='STOP before field work: do not approach, touch, move or disturb suspected mines or unexploded ordnance. Do not enter suspected areas to inspect, mark or photograph hazards. Follow local emergency guidance and contact the competent mine-action service from a safe location. Only qualified, authorized organizations conduct survey, clearance and disposal.';
 const empty=()=>({schema:1,reviews:[]});
 const fail=m=>{throw Error(m);};
 const text=(v,n,required=false)=>{if(typeof v!=='string'||v.length>n||(required&&!v.trim()))fail('Invalid or missing hazard review text.');return v.trim();};
 const date=v=>{if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)fail('Use a valid review date.');return v;};
 const today=()=>new Date().toISOString().slice(0,10);
 const fieldBridge=id=>!deskBridges.includes(id);
 const scopeKey=p=>JSON.stringify({timeline:(p.timeline||[]).map(r=>r.title),portfolio:(p.portfolio?.nodes||[]).map(n=>[n.title,n.bridgeId])});
 function clean(raw){
  if(raw==null)return empty();
  if(raw.schema!==1||!Array.isArray(raw.reviews)||raw.reviews.length>101)fail('Hazard history supports up to 100 reviews. Export and retain the history before starting a new plan.');
  const ids=new Set();let last='';
  const reviews=raw.reviews.map(r=>{
   const id=text(r.id,80,true);if(!/^[-a-zA-Z0-9_]+$/.test(id)||ids.has(id))fail('Duplicate or invalid hazard review ID.');ids.add(id);
   if(typeof r.at!=='string'||!Number.isFinite(Date.parse(r.at))||new Date(r.at).toISOString()!==r.at||r.at<last)fail('Invalid hazard review chronology.');last=r.at;
   if(!['unresolved','documented','desk-only'].includes(r.status))fail('Invalid hazard review status.');
   const out={id,at:r.at,bridge:text(r.bridge,100),place:text(r.place,120),status:r.status,scopeKey:text(r.scopeKey,40000,true),work:text(r.work,1000),authority:text(r.authority,200),reference:text(r.reference,500),conditions:text(r.conditions,2000),owner:text(r.owner,200,true),reason:text(r.reason,1000,true),date:date(r.date),nextReview:r.nextReview?date(r.nextReview):'',checks:{}};
   for(const k of Object.keys(checks)){if(typeof r.checks?.[k]!=='boolean')fail('Invalid hazard checklist.');out.checks[k]=r.checks[k];}
   if(out.date>r.at.slice(0,10))fail('Review date cannot be later than the recorded date.');
   if(out.nextReview&&out.nextReview<out.date)fail('Next review cannot precede the assessment.');
   if(out.status==='documented'&&(!out.bridge||!out.place||!out.work||!out.authority||!out.reference||!out.conditions||!out.nextReview||Object.values(out.checks).some(v=>!v)))fail('Documented prerequisites require location context, intended work, authority/reference, conditions, a next review date and every checklist item.');
   if(out.status==='desk-only'&&(fieldBridge(out.bridge)||!out.work||!out.conditions||!out.nextReview))fail('Desk-only scope is limited to non-field knowledge/governance planning, with explicit scope, conditions and next review. It cannot exempt a biophysical bridge.');
   return out;
  });if(reviews.length===101&&reviews.at(-1).status!=='unresolved')fail('Final reserved history slot is for stop-work only.');return {schema:1,reviews};
 }
 function assess(raw,context,on=today()){
  const p=clean(raw),r=p.reviews.at(-1);date(on);
  const blocked=reason=>({blocked:true,code:'hold',title:'STOP: hazard prerequisite unresolved',reason});
  if(!r)return blocked('No current mine-action prerequisite review. Do not begin field activities.');
  if(r.bridge!==context.bridge||r.place!==context.place.trim())return blocked('Bridge or location changed. Obtain a new scope-specific review; earlier records do not transfer automatically.');
  if(r.scopeKey!==scopeKey(context))return blocked('Planned activities changed. Review the intended work scope again with the competent authority.');
  if(r.status==='desk-only'&&(context.portfolio?.nodes||[]).some(n=>fieldBridge(n.bridgeId)))return blocked('Portfolio contains field or unspecified activities; a desk-only review cannot cover them.');
  if(r.status==='unresolved')return blocked('Uncertainty or a stop-work concern remains. Refer to the competent mine-action authority.');
  if(r.date>on||!r.nextReview||r.nextReview<on)return blocked('Review is future-dated or overdue. Reconfirm conditions before field work.');
  if(r.status==='desk-only')return {blocked:false,code:'desk',title:'Desk-only planning — no field activity authorized',reason:'Applies only to the recorded non-field scope. Any site visit, installation, land access or ground work requires a new authority-based review.'};
  return {blocked:false,code:'recorded',title:'Prerequisite records complete — not a clearance certificate',reason:'The app has not verified the authority or certified safety. Work remains subject to the competent authority’s exact scope and restrictions, other safeguards and renewed review after any concern or change.'};
 }
 function record(raw,review){const p=clean(raw);if(p.reviews.length>=100&&review.status!=='unresolved')fail('History full. Preserve this history in a backup and begin a fresh plan; no new field-work review was accepted.');return clean({schema:1,reviews:[...p.reviews,review]});}
 const texts=raw=>clean(raw).reviews.flatMap(r=>[r.work,r.authority,r.reference,r.conditions,r.owner,r.reason]);
 window.RPB_HAZARD={empty,clean,assess,record,checks,warning,fieldBridge,scopeKey,today,texts};
})();
