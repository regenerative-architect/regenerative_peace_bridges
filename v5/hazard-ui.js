window.RPB_HAZARD_UI=function({h,getPlan,changed}){
 const H=window.RPB_HAZARD;
 const field=(label,c)=>h('div',{class:'field'},h('label',{for:c.id},label),c);
 function render(mount,message=''){
  const plan=getPlan(),history=H.clean(plan.hazard).reviews,last=history.at(-1),current=last&&last.bridge===plan.bridge&&last.place===plan.place.trim()?last:null;
  const input=(id,value='',max=200)=>h('input',{id,value,maxlength:max,dir:'auto'});
  const area=(id,value='',max=1000)=>h('textarea',{id,rows:3,maxlength:max,dir:'auto'},value);
  const status=h('p',{id:'hazardStatus',role:'status',tabindex:'-1'},message),result=h('p',{id:'hazardResult',role:'status'});
  const outcome=h('select',{id:'hazardOutcome'},[['unresolved','Unresolved / stop work'],['documented','Authority-based prerequisite records complete'],['desk-only','Desk-only scope — no field activity']].map(([value,label])=>h('option',{value,selected:value===(current?.status||'unresolved')},label)));
  const work=area('hazardWork',current?.work),authority=input('hazardAuthority',current?.authority),reference=input('hazardReference',current?.reference,500),conditions=area('hazardConditions',current?.conditions,2000),owner=input('hazardOwner',current?.owner),reason=area('hazardReason'),review=input('hazardDate',H.today()),next=input('hazardNext',current?.nextReview||'');review.type=next.type='date';
  const boxes=Object.fromEntries(Object.keys(H.checks).map(k=>[k,h('input',{id:'hazardCheck-'+k,type:'checkbox',checked:current?.checks[k]||false})]));
  const update=()=>{const a=H.assess(getPlan().hazard,getPlan());result.textContent=a.title+'. '+a.reason;};
  const save=suspend=>{try{
   if(getPlan()!==plan)throw Error('Plan changed. Reopen the hazard checklist.');
   const r={id:'hz-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9),at:new Date().toISOString(),bridge:plan.bridge,place:plan.place.trim(),status:suspend?'unresolved':outcome.value,scopeKey:H.scopeKey(plan),work:work.value,authority:authority.value,reference:reference.value,conditions:conditions.value,owner:owner.value,reason:reason.value,date:review.value,nextReview:next.value,checks:Object.fromEntries(Object.entries(boxes).map(([k,c])=>[k,suspend?false:c.checked]))};
   if(suspend){r.owner=owner.value.trim()||'Role not yet assigned';r.reason=reason.value.trim()||'New concern: stop work and request competent authority review.';r.date=H.today();r.nextReview='';}
   plan.hazard=H.record(plan.hazard,r);changed();render(mount,suspend?'Stop-work concern recorded. Field work remains blocked.':'Review recorded locally. This is not independent verification or permission to work.');document.querySelector('#hazardStatus').focus();
  }catch(e){status.textContent=e.message;status.focus();}};
  mount.replaceChildren(h('h3',null,'Hazard & Demining Prerequisite'),h('p',{class:'note'},H.warning),result,status,
   h('p',null,'Applies to the selected bridge and general location. Record document references and responsible roles, not precise hazard coordinates, device details or personal names. A self-completed checklist, lack of visible objects, past farming or an old clearance record cannot establish safety. Survey, land release and residual risk must be addressed by the competent authority under applicable standards.'),
   field('Review outcome',outcome),field('Intended work and authority-defined area / scope reference (no precise coordinates)',work),field('Competent authority / accredited mine-action organization',authority),field('Dated assessment or land-release document reference',reference),field('Restrictions, permitted uses and conditions; for desk-only scope, explicitly exclude field visits and work',conditions),field('Responsible local role',owner),field('Review date',review),field('Review again by (earlier if conditions change)',next),field('Reason / source of this review or stop-work concern',reason),
   h('fieldset',null,h('legend',null,'Required before biophysical intervention — record only what has been established through qualified processes'),Object.entries(H.checks).map(([k,label])=>h('label',{class:'check'},boxes[k],h('span',null,label)))),
   h('button',{id:'hazardSave',type:'button',class:'btn',onclick:()=>save(false)},'Record prerequisite review'),h('button',{id:'hazardStop',type:'button',class:'btn btn--quiet',onclick:()=>save(true)},'Record stop-work concern'),
   h('p',null,'New suspicious items, changed access or work scope, renewed conflict, flooding/erosion or other changed conditions require stopping and referring back to the competent authority. Do not investigate yourself. References are local claims; this app does not authenticate documents, notify responders or authorize work.'),
   h('p',null,h('a',{href:'https://www.mineactionstandards.org/standards/07-11/',target:'_blank',rel:'noopener noreferrer'},'IMAS land release guidance'), ' · ',h('a',{href:'https://unmas.org/sites/default/files/handbook_english.pdf',target:'_blank',rel:'noopener noreferrer'},'UNMAS safety handbook (online source)')),
   h('h4',null,'Local review and stop-work history'),h('ol',{id:'hazardHistory'},history.slice().reverse().map(r=>h('li',null,h('strong',null,r.date+' — '+r.status),h('p',null,r.reason),h('p',null,'Responsible role: '+r.owner+'; authority/reference: '+r.authority+' / '+r.reference),h('p',null,'Bridge / general location: '+r.bridge+' / '+r.place+'; review again by: '+(r.nextReview||'not set')),h('p',null,'Work scope: '+r.work+'; conditions: '+r.conditions)))));
  update();
 }
 return {render};
};
