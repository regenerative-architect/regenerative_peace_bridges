/* Local plan lineage and frozen design comparisons. Attribution is a claim, not authentication. */
(() => {
 'use strict';
 const keys=['project','place','bridge','review','dividers','connectors','measures','customMeasures','notes','timeline','budget','risks','systems'];
 const copy=x=>JSON.parse(JSON.stringify(x));
 const empty=()=>({schema:1,id:'',credit:'',note:'',ancestors:[],parent:null});
 const fail=m=>{throw Error(m);};
 const text=(v,n)=>{if(typeof v!=='string'||v.length>n)fail('Invalid plan attribution text.');return v;};
 const id=v=>{if(typeof v!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(v))fail('Invalid plan lineage ID.');return v;};
 const stamp=v=>{if(typeof v!=='string'||!Number.isFinite(Date.parse(v))||new Date(v).toISOString()!==v)fail('Invalid fork date.');return v;};
 const design=p=>Object.fromEntries(keys.map(k=>[k,copy(p[k])]));
 function clean(raw,sanitize){
  if(raw==null)return empty();
  if(raw.schema!==1||!Array.isArray(raw.ancestors)||raw.ancestors.length>20)fail('Invalid plan lineage; at most 20 ancestors are supported.');
  const out=empty();out.id=raw.id===''?'':id(raw.id);out.credit=text(raw.credit,200);out.note=text(raw.note,1000);
  out.ancestors=raw.ancestors.map(a=>({id:id(a.id),title:text(a.title,120),credit:text(a.credit,200),note:text(a.note,1000),at:stamp(a.at)}));
  const seen=new Set(out.id?[out.id]:[]);for(const a of out.ancestors){if(seen.has(a.id))fail('Cyclic or duplicate plan lineage.');seen.add(a.id);}
  if(raw.parent!=null){
   if(!out.id||!out.ancestors.length||!raw.parent.baseline||typeof raw.parent.baseline!=='object'||Array.isArray(raw.parent.baseline))fail('Missing fork baseline or attribution.');
   if(raw.parent.id!==out.ancestors.at(-1).id)fail('Fork parent does not match attribution.');
   if(Object.keys(raw.parent.baseline).some(k=>!keys.includes(k)))fail('Unknown or nested fork baseline fields.');
   if(JSON.stringify(raw.parent.baseline).length>2000000)fail('Fork baseline exceeds 2 MB.');
   out.parent={id:id(raw.parent.id),baseline:design(sanitize(raw.parent.baseline))};
  } else if(out.ancestors.length)fail('Fork lineage needs a parent baseline.');
  return out;
 }
 function fork(source,newId,at,sanitize){
  const provenance=clean(source.forking,sanitize);
  if(!provenance.id)fail('Save source attribution before forking.');
  if(provenance.ancestors.length>=20)fail('This plan has 20 ancestors. Further forking is not supported; export a backup to preserve its lineage.');
  const p=sanitize(design(source));
  p.provenance=window.RPB_PROVENANCE.inherit(source.provenance,provenance.id);
  p.answers={};p.who={};p.consent=[];p.evolution={};
  p.timeline.forEach(r=>r.status='planned');p.risks.forEach(r=>r.status='open');p.review='';
  for(const g of Object.values(p.systems.maps)){g.sharing='local';g.permission='';g.history=[];g.edges.forEach(e=>{e.status='hypothesis';e.evidence='';e.knowledgeId='';});}
  const baseline=design(p);
  p.forking={schema:1,id:id(newId),credit:'',note:'',ancestors:[...provenance.ancestors,{id:provenance.id,title:source.project,credit:provenance.credit,note:provenance.note,at:stamp(at)}],parent:{id:provenance.id,baseline}};
  p.forking=clean(p.forking,sanitize);
  return p;
 }
 const canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
 function diff(before,after){
  const changes=[];
  const visit=(a,b,path)=>{
   if(canonical(a)===canonical(b))return;
   if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b)){
    for(const k of [...new Set([...Object.keys(a),...Object.keys(b)])].sort())visit(a[k],b[k],path?path+'.'+k:k);
   }else changes.push({path,kind:a===undefined?'added':b===undefined?'removed':'changed',before:a??null,after:b??null});
  };
  visit(before,after,'');return changes;
 }
 const attribution=p=>{const f=p.forking||empty();return [f.credit?'Plan attribution: '+f.credit:'',f.note?'Adaptation note: '+f.note:'',...f.ancestors.map(a=>'Adapted from: '+(a.title||'Untitled plan')+' — '+(a.credit||'Attribution not recorded')+' ['+a.id+']; forked '+a.at+(a.note?'. Source note: '+a.note:''))].filter(Boolean);};
 const texts=p=>[...attribution(p),p.forking?.parent?JSON.stringify(p.forking.parent.baseline):''];
 window.RPB_FORKING={empty,clean,design,fork,diff,attribution,texts};
})();
