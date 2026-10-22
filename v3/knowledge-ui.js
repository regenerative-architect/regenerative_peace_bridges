/* Device-local knowledge editor. All user text is inserted through safe DOM helpers. */
window.RPB_KNOWLEDGE_UI = function(api) {
  "use strict";
  const {h,getPlan,changed,download,csvOf,safetyGate,confirmDialog,onMetric,onSource,onLifecycle,onLearning}=api;
  const K=window.RPB_KNOWLEDGE, examples=window.RPB_KNOWLEDGE_EXAMPLES;
  let editing="", example="", kindFilter="", reviewFilter="", query="", showWithdrawn=false, activeBridge="", mount;
  const now=()=>new Date().toISOString(), today=()=>now().slice(0,10);
  const makeId=()=>"k-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,12);
  const field=(id,label,control,hint="")=>h("div",{class:"field"},h("label",{for:id},label),control,hint?h("p",{class:"field__hint"},hint):null);
  const input=(id,type="text",value="",attrs={})=>{const e=h("input",{id,type,...attrs});e.value=value;return e;};
  const area=(id,value="",max=1000)=>{const e=h("textarea",{id,rows:3,maxlength:max,dir:"auto"});e.value=value;return e;};
  const select=(id,pairs,value)=>{const e=h("select",{id},pairs.map(([v,t])=>h("option",{value:v},t)));e.value=value;return e;};
  const btn=(id,label,fn)=>h("button",{id,type:"button",class:"btn btn--quiet",onclick:fn},label);
  const norm=x=>String(x).toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  function render(target,message="") {
    mount=target;
    const plan=getPlan(), bridgeId=plan.bridge;
    if(activeBridge!==bridgeId){editing="";example="";activeBridge=bridgeId;}
    const all=K.forBridge(plan.knowledge,bridgeId,true), current=all.filter(r=>!K.current(r).withdrawn);
    const record=all.find(r=>r.id===editing), values=record?K.current(record):K.fresh();
    const prompt=examples.find(e=>e.id===example);
    const status=h("p",{id:"knowledgeStatus",role:"status","aria-live":"polite",tabindex:"-1"},message);
    const report=error=>{status.textContent=error.message||String(error);status.focus();};
    const run=fn=>{try{fn();}catch(e){report(e);}};
    const commit=(data,message)=>{plan.knowledge=data;changed();render(mount,message);};
    mount.replaceChildren(h("h3",null,"Community Knowledge Capture"),
      h("p",null,"Community observations, lessons learned and unexpected outcomes belong alongside institutional evidence. Keep their context, whose perspective they represent, and differing views visible."),
      h("p",{class:"note"},"Accounts are local perspectives, not independently verified findings. Record them with contributors' agreement. Use collective roles, not private names or precise locations. Local-only records are excluded from shared knowledge exports and briefs, but remain in private plan/device backups."),status);
    if(!bridgeId){mount.append(h("p",null,"Choose a bridge in Readiness to capture or import community knowledge."));return;}
    const bridgeName=window.RPB.bridges.find(b=>b.id===bridgeId)?.short||"Another idea";
    mount.append(h("p",{class:"knowledge-context"},(plan.project||"Untitled plan")+" · "+bridgeName),
      h("p",{id:"knowledgeCount"},current.length+" active accounts · "+current.filter(K.shareable).length+" approved for sharing. Accounts and versions are not counts of independent corroboration."));

    const pickExample=select("knowledgeExample",[["","Choose an illustrative prompt"],...examples.map(e=>[e.id,(window.RPB.bridges.find(b=>b.id===e.bridgeId)?.short||e.bridgeId)+" / "+K.kinds[e.kind]+" — "+e.statement])],example);
    mount.append(h("details",{class:"knowledge-examples",id:"knowledgeExamples",open:!!prompt},h("summary",null,"Explore 39 illustrative examples — not evidence"),
      h("p",null,"These invented examples include the requested grazing-corridor, committee-election and tree-ownership scenarios. They illustrate questions to ask; they are not claims about any actual community."),
      field("knowledgeExample","Example across all bridges",pickExample),
      btn("knowledgeUseExample","Use this as a discussion prompt",()=>{example=pickExample.value;editing="";render(mount);document.getElementById("knowledgeStatement").focus();})));
    if(prompt)mount.append(h("aside",{id:"knowledgePrompt",class:"knowledge-prompt"},h("strong",null,"Illustrative prompt — do not copy as an observed fact"),h("blockquote",null,prompt.statement),h("p",null,prompt.prompt),h("p",null,"Write your own supported local account below. This prompt is never saved as a knowledge record.")));

    const type=select("knowledgeKind",Object.entries(K.kinds),record?values.kind:prompt?.kind||values.kind);
    const statement=area("knowledgeStatement",values.statement,1500),context=area("knowledgeContext",values.context);
    const source=input("knowledgeSource","text",values.source,{maxlength:240,dir:"auto"});
    const method=select("knowledgeMethod",Object.entries(K.methods),values.method),date=input("knowledgeDate","date",values.date||today(),{max:today()});
    const period=input("knowledgePeriod","text",values.period,{maxlength:240,dir:"auto"}),language=input("knowledgeLanguage","text",values.language,{maxlength:35});
    const limitations=area("knowledgeLimits",values.limitations),action=area("knowledgeAction",values.action);
    const review=select("knowledgeReview",Object.entries(K.reviews),values.review),reviewNote=area("knowledgeReviewNote",values.reviewNote);
    const sharing=select("knowledgeSharing",[["local","Local only — included in private backups"],["shared","Community approved this version for sharing"]],values.sharing);
    const permission=area("knowledgePermission",values.permissionNote,500);
    const metric=select("knowledgeMetric",[["","No linked impact indicator"],...window.RPB_IMPACT.metrics.map(m=>[m.id,m.name])],values.metricId);
    const doc=select("knowledgeDoc",[["","No linked institutional source"],...window.RPB.documents.map(d=>[d.id,d.title])],values.docId);
    const reason=area("knowledgeReason","",500);
    mount.append(h("fieldset",{class:"knowledge-editor"},h("legend",null,record?"Revise a community account":"Capture a community account"),
      h("p",{class:"note"},"Save explicitly before switching records, bridges, plans or languages. Fields are drafts until saved. A reviewed account can still be uncertain or contested."),
      h("div",{class:"grid-2"},field("knowledgeKind","Record type",type),field("knowledgeDate","Observation or discussion date",date),
        field("knowledgeStatement","What did the community observe or learn? (required)",statement,"Separate an observation from an interpretation. Attribute claims such as 'reduced conflict' to the people reporting them."),
        field("knowledgeContext","Local context and conditions (required)",context,"Use a broad area and relevant season, activity or agreement. Explain where the account may or may not apply."),
        field("knowledgeSource","Community source / collective role (required)",source,"For example: farmer–herder dialogue group. No private names."),field("knowledgeMethod","How the knowledge was gathered",method),
        field("knowledgePeriod","Period covered or duration",period,"For example: 18 months spanning two dry seasons."),field("knowledgeLanguage","Language code",language,"For example en, ar, sw or und for unknown. Keep translation context in the account."),
        field("knowledgeLimits","Uncertainty, missing perspectives or different accounts",limitations),field("knowledgeAction","What should be explored or adapted next?",action),
        field("knowledgeReview","Community review status",review),field("knowledgeReviewNote","Review process and differing views",reviewNote,"Required for reviewed or disputed accounts. Describe collective roles and process; this is not independent certification."),
        field("knowledgeSharing","Sharing permission for this version",sharing),field("knowledgePermission","How permission to share was agreed",permission,"Required when sharing. Record the process, scope and any conditions; permissions must be checked before resharing."),
        field("knowledgeMetric","Related impact indicator (optional)",metric),field("knowledgeDoc","Related institutional source (optional)",doc)),
      record?field("knowledgeReason",values.withdrawn?"Reason for revision / restoring this withdrawn account":"Reason for revision (required)",reason):null,
      btn("knowledgeSave",record?"Save revised account":"Save community account",()=>run(()=>{
        const next={kind:type.value,statement:statement.value,context:context.value,source:source.value,method:method.value,date:date.value,period:period.value,language:language.value,limitations:limitations.value,action:action.value,review:review.value,reviewNote:reviewNote.value,sharing:sharing.value,permissionNote:permission.value,metricId:metric.value,docId:doc.value,withdrawn:false};
        const updated=K.save(plan.knowledge,bridgeId,record?.id||makeId(),next,record?reason.value:"Initial community capture.");
        editing="";example="";commit(updated,"Community account saved. Sharing follows the recorded permission.");document.getElementById("knowledgeSave").focus();
      })),record||prompt?btn("knowledgeCancel","Start a blank account",()=>{editing="";example="";render(mount);document.getElementById("knowledgeStatement").focus();}):null));

    const search=input("knowledgeSearch","search",query,{placeholder:"Search accounts, context, source or review notes"});
    const kind=select("knowledgeKindFilter",[["","All record types"],...Object.entries(K.kinds)],kindFilter);
    const reviewed=select("knowledgeReviewFilter",[["","All review states"],...Object.entries(K.reviews)],reviewFilter);
    const withdrawn=input("knowledgeShowWithdrawn","checkbox");withdrawn.checked=showWithdrawn;
    const list=h("div",{id:"knowledgeList"}),matches=h("p",{id:"knowledgeMatches",role:"status"});
    const drawList=()=>{
      query=search.value;kindFilter=kind.value;reviewFilter=reviewed.value;showWithdrawn=withdrawn.checked;
      const rows=all.filter(r=>{const s=K.current(r);return(showWithdrawn||!s.withdrawn)&&(!kindFilter||s.kind===kindFilter)&&(!reviewFilter||s.review===reviewFilter)&&norm(query).split(/\s+/).every(w=>norm(Object.values(s).join(" ")).includes(w));});
      matches.textContent=rows.length+" matching accounts";
      list.replaceChildren(...rows.slice().reverse().map(r=>{
        const s=K.current(r),share=K.shareable(r),withdrawReason=area("knowledgeWithdrawReason-"+r.id,"",500);
        return h("article",{class:"knowledge-card","data-knowledge-id":r.id},h("h4",null,K.kinds[s.kind]+" · "+s.date),
          h("p",{class:"knowledge-state"},K.reviews[s.review]+" · "+(s.withdrawn?"Withdrawn":share?"Approved for sharing":"Local only")),
          h("blockquote",{lang:s.language,dir:"auto"},s.statement),h("p",{dir:"auto"},"Context: "+s.context),h("p",{dir:"auto"},"Source: "+s.source+" · "+K.methods[s.method]+(s.period?" · "+s.period:"")),
          s.limitations?h("p",{dir:"auto"},"Limits / differing views: "+s.limitations):null,s.reviewNote?h("p",{dir:"auto"},"Review: "+s.reviewNote):null,
          s.action?h("p",{dir:"auto"},"Next exploration: "+s.action):null,share?h("p",{dir:"auto"},"Sharing agreement: "+s.permissionNote):null,
          r.origin?h("p",{class:"note"},"Imported account "+r.origin.id+", source revision "+r.origin.revision+". Source reported: "+K.reviews[r.origin.snapshot.review]+". Local review and permission are separate."+(r.origin.related?" Another version or conflicting account is already present; these are not independent corroboration.":"")):null,
          h("p",{class:"note"},"Record "+r.id+" · "+r.versions.length+" version(s)"),
          h("div",{class:"knowledge-actions"},btn("knowledgeEdit-"+r.id,"Revise account",()=>{editing=r.id;example="";render(mount);document.getElementById("knowledgeStatement").focus();}),
            s.metricId?btn("knowledgeMetric-"+r.id,"Open related impact indicator",()=>onMetric(s.metricId)):null,
            s.docId?btn("knowledgeSource-"+r.id,"Open related institutional source",()=>onSource(s.docId)):null,
            share?btn("knowledgeLifecycle-"+r.id,"Draft lifecycle review from this account",()=>onLifecycle(K.lines({records:[r]},bridgeId)[0])):null,
            share?btn("knowledgeLearning-"+r.id,"Draft impact learning review",()=>onLearning("Community account ["+r.id+"]: "+s.statement+"\nContext: "+s.context+"\n"+K.reviews[s.review],s.action)):null),
          h("details",null,h("summary",null,"Revision history (local, included in private backups)"),h("ol",null,r.versions.map(v=>h("li",null,h("time",{datetime:v.at},v.at),h("p",{dir:"auto"},v.reason),h("p",{lang:v.snapshot.language,dir:"auto"},v.snapshot.statement),h("p",null,K.reviews[v.snapshot.review]+" · "+v.snapshot.sharing+(v.snapshot.withdrawn?" · withdrawn":""))))),
          !s.withdrawn?h("details",null,h("summary",null,"Withdraw this account from use and future sharing"),field("knowledgeWithdrawReason-"+r.id,"Reason for withdrawal (required)",withdrawReason),
            btn("knowledgeWithdraw-"+r.id,"Withdraw account",async()=>{
              if(!withdrawReason.value.trim()){report(Error("Add a reason for withdrawal."));return;}
              if(!await confirmDialog({title:"Withdraw this community account?",text:"The account stays in local history and private backups, but will be excluded from new shared exports and summaries. Existing copies or text copied into other plan fields cannot be recalled automatically.",ok:"Withdraw account",danger:true}))return;
              run(()=>{editing="";commit(K.withdraw(plan.knowledge,r.id,withdrawReason.value),"Account withdrawn from future sharing and summaries.");});
            })):null);
      }));
    };
    search.addEventListener("input",drawList);kind.addEventListener("change",drawList);reviewed.addEventListener("change",drawList);withdrawn.addEventListener("change",drawList);
    mount.append(h("h4",null,"Community knowledge in this bridge plan"),h("div",{class:"grid-2"},field("knowledgeSearch","Search local accounts",search),field("knowledgeKindFilter","Record type",kind),field("knowledgeReviewFilter","Review state",reviewed),h("label",{class:"check",for:"knowledgeShowWithdrawn"},withdrawn,"Include withdrawn accounts")),matches,list);drawList();

    const file=input("knowledgeImportFile","file","",{accept:"application/json,.json"});
    file.addEventListener("change",async()=>{
      const chosen=file.files?.[0];file.value="";if(!chosen)return;
      try{
        if(chosen.size>5000000)throw Error("Community exchange files must be at most 5 MB.");
        const packet=JSON.parse(await chosen.text());K.cleanPacket(packet);
        const preview=K.importPacket(plan.knowledge,packet,makeId);
        if(!preview.added){status.textContent="No new accounts; "+preview.skipped+" duplicate(s) skipped.";return;}
        const bridgeCount=new Set(packet.records.map(r=>r.bridgeId)).size;
        if(!await confirmDialog({title:"Import community accounts?",text:preview.added+" account(s) across "+bridgeCount+" bridge(s) will be added to this plan. Imports start local-only and unreviewed, preserve source provenance, and never overwrite local accounts. "+preview.skipped+" duplicate(s) skipped; "+preview.related+" related/conflicting version(s).",ok:"Import accounts",danger:false}))return;
        const result=K.importPacket(plan.knowledge,packet,makeId);editing="";example="";commit(result.data,"Imported "+result.added+" community account(s). Check the indicated bridges and review before sharing.");
      }catch(error){report(error);}
    });
    mount.append(h("h4",null,"Decentralized exchange — files you choose to share"),h("p",null,"Exchange approved accounts by USB, messaging or another community-chosen channel. Nothing uploads automatically. Importing a file is not proof of its authenticity; claims and permission records require local review."),
      h("div",{class:"knowledge-actions"},
        btn("knowledgeExport","Export approved accounts for this bridge",()=>run(()=>{
          const packet=K.packet(plan.knowledge,bridgeId);if(!packet.records.length)throw Error("No active accounts in this bridge are approved for sharing.");
          safetyGate(plan,()=>download("community-knowledge-"+today()+".json",JSON.stringify(packet,null,2),"application/json"));
        })),
        btn("knowledgeCsv","Export approved accounts CSV",()=>run(()=>{
          const rows=current.filter(K.shareable);if(!rows.length)throw Error("No active accounts in this bridge are approved for sharing.");
          safetyGate(plan,()=>download("community-knowledge-"+today()+".csv",csvOf(["ID","Bridge","Type","Statement","Context","Community source","Method","Date","Period","Language","Limitations / other views","Next action","Review state","Review process","Sharing agreement","Impact indicator","Institutional source","Revision"],rows.map(r=>{const s=K.current(r);return[r.id,r.bridgeId,K.kinds[s.kind],s.statement,s.context,s.source,K.methods[s.method],s.date,s.period,s.language,s.limitations,s.action,K.reviews[s.review],s.reviewNote,s.permissionNote,s.metricId,s.docId,r.versions.length];})),"text/csv"));
        }))),field("knowledgeImportFile","Import a community knowledge exchange file",file),
      h("p",{class:"note"},"Shared JSON/CSV contains only the current approved version, never private revisions. Plan and device backups are private copies and include local-only accounts, withdrawn records and history. Deleting a plan or device data uses the existing controls; saved versions and exported copies may retain earlier records."));
  }
  return{render};
};
