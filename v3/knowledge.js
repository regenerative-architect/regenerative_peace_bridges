/* Community Knowledge Capture: local records and portable, consent-scoped exchange.
   No server or remote dependency. Examples are prompts, never evidence records. */
(() => {
  "use strict";
  const kinds = { observation: "Community observations", lesson: "Lessons learned", unexpected: "Unexpected outcomes" };
  const methods = { observation: "Direct community observation", discussion: "Community discussion", monitoring: "Community monitoring", oral: "Oral history or remembered experience", feedback: "Voluntary feedback", other: "Another described method" };
  const reviews = { unreviewed: "Not yet community-reviewed", reviewed: "Community-reviewed account", disputed: "Different views / disputed" };
  const empty = () => ({ schema: 1, records: [] });
  const fresh = () => ({ kind: "observation", statement: "", context: "", source: "", method: "discussion", date: "", period: "", language: "en", limitations: "", action: "", review: "unreviewed", reviewNote: "", sharing: "local", permissionNote: "", metricId: "", docId: "", withdrawn: false });
  const fail = message => { throw Error(message); };
  const text = (v, max) => { if (typeof v !== "string" || v.length > max) fail("Knowledge text is missing or exceeds its length limit."); return v.trim(); };
  const stamp = v => { if (typeof v !== "string" || !Number.isFinite(Date.parse(v)) || new Date(v).toISOString() !== v) fail("Invalid knowledge recording timestamp."); return v; };
  const date = v => { if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v) || !Number.isFinite(Date.parse(v)) || new Date(v).toISOString().slice(0,10) !== v) fail("Use a valid date for the observation or discussion."); return v; };
  const id = v => { if (typeof v !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(v)) fail("Invalid community knowledge ID."); return v; };
  const bridgeIds = () => new Set([...window.RPB.bridges.map(b => b.id), "other"]);
  function snapshot(raw) {
    if (!raw || typeof raw !== "object") fail("Missing knowledge account.");
    const s = fresh();
    for (const [key,max] of Object.entries({ statement:1500, context:1000, source:240, period:240, language:35, limitations:1000, action:1000, reviewNote:1000, permissionNote:500 })) s[key] = text(raw[key],max);
    if (!s.statement || !s.context || !s.source) fail("Add an account, local context and a collective source or role.");
    if (!/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(s.language)) fail("Use a language code such as en, ar or sw (und for unknown).");
    for (const [key,allowed] of [["kind",Object.keys(kinds)],["method",Object.keys(methods)],["review",Object.keys(reviews)],["sharing",["local","shared"]]]) {
      if (!allowed.includes(raw[key])) fail("Invalid community knowledge category, review or sharing choice."); s[key]=raw[key];
    }
    s.date=date(raw.date);
    if (typeof raw.withdrawn !== "boolean") fail("Invalid withdrawal state."); s.withdrawn=raw.withdrawn;
    s.metricId=raw.metricId; s.docId=raw.docId;
    if (typeof s.metricId !== "string" || (s.metricId && !window.RPB_IMPACT.byId.has(s.metricId))) fail("Unknown linked impact indicator.");
    if (typeof s.docId !== "string" || (s.docId && !window.RPB.documents.some(d=>d.id===s.docId))) fail("Unknown linked institutional source.");
    if (s.review !== "unreviewed" && !s.reviewNote) fail("Describe who reviewed the account, how it was reviewed, and any differing views.");
    if (s.sharing === "shared" && !s.permissionNote) fail("Record how the community approved sharing this account.");
    if (s.withdrawn && s.sharing !== "local") fail("Withdrawn accounts must remain local.");
    return s;
  }
  function clean(raw) {
    if (raw == null) return empty();
    if (raw.schema !== 1 || !Array.isArray(raw.records) || raw.records.length > 200) fail("Invalid knowledge schema or more than 200 accounts in this plan.");
    const result=empty(), seen=new Set(), bridges=bridgeIds();
    for (const r of raw.records) {
      if (!r || !bridges.has(r.bridgeId) || !Array.isArray(r.versions) || !r.versions.length || r.versions.length>20) fail("Invalid knowledge bridge or revision history (maximum 20 revisions).");
      const record={id:id(r.id),bridgeId:r.bridgeId,createdAt:stamp(r.createdAt),origin:null,versions:[]};
      if (seen.has(record.id)) fail("Duplicate knowledge account ID."); seen.add(record.id);
      let lastAt=record.createdAt;
      for (const v of r.versions) {
        const version={at:stamp(v.at),reason:text(v.reason,500),snapshot:snapshot(v.snapshot)};
        if (!version.reason || version.at<lastAt || version.snapshot.date>version.at.slice(0,10)) fail("Knowledge revisions need a reason and valid chronological dates.");
        record.versions.push(version); lastAt=version.at;
      }
      if (r.origin != null) {
        const o=r.origin;
        if (!Number.isInteger(o.revision) || o.revision<1 || o.revision>20 || !bridges.has(o.bridgeId) || typeof o.related !== "boolean") fail("Invalid community import provenance.");
        record.origin={id:id(o.id),revision:o.revision,bridgeId:o.bridgeId,createdAt:stamp(o.createdAt),at:stamp(o.at),receivedAt:stamp(o.receivedAt),related:o.related,snapshot:snapshot(o.snapshot)};
        if (record.origin.snapshot.sharing!=="shared" || record.origin.snapshot.withdrawn || record.origin.snapshot.date>record.origin.at.slice(0,10) || record.origin.at<record.origin.createdAt) fail("Imported provenance must describe an approved, active shared version.");
      }
      result.records.push(record);
    }
    if (JSON.stringify(result).length>2000000) fail("This plan's community knowledge exceeds the 2 MB text limit. Export a private backup and start a new plan.");
    return result;
  }
  const current = r => r.versions[r.versions.length-1].snapshot;
  const forBridge = (raw, bridgeId, includeWithdrawn=false) => (raw?.records || []).filter(r=>r.bridgeId===bridgeId&&(includeWithdrawn||!current(r).withdrawn));
  const shareable = r => current(r).sharing === "shared" && !current(r).withdrawn;
  function save(raw, bridgeId, accountId, values, reason, at=new Date().toISOString()) {
    const result=clean(raw), found=result.records.find(r=>r.id===accountId);
    if (found && found.bridgeId!==bridgeId) fail("An account cannot be moved to another bridge.");
    const version={at,reason,snapshot:values};
    if (found) found.versions.push(version);
    else result.records.push({id:accountId,bridgeId,createdAt:at,origin:null,versions:[version]});
    return clean(result);
  }
  function withdraw(raw, accountId, reason, at=new Date().toISOString()) {
    const r=clean(raw).records.find(r=>r.id===accountId); if (!r) fail("Knowledge account not found.");
    return save(raw,r.bridgeId,r.id,{...current(r),withdrawn:true,sharing:"local"},reason,at);
  }
  function lines(raw, bridgeId, sharedOnly=true) {
    return forBridge(raw,bridgeId).filter(r=>!sharedOnly||shareable(r)).map(r=> {
      const s=current(r);
      return kinds[s.kind]+" ["+r.id+"] — "+s.statement+" Context: "+s.context+" Source: "+s.source+"; "+s.date+(s.period?"; period: "+s.period:"")+". "+reviews[s.review]+(s.reviewNote?": "+s.reviewNote:"")+(s.limitations?" Limits / other views: "+s.limitations:"")+(s.action?" Next learning/action: "+s.action:"");
    });
  }
  const texts = raw => (raw?.records||[]).flatMap(r=>[...r.versions.flatMap(v=>[v.reason,...Object.values(v.snapshot).filter(x=>typeof x==="string")]), ...(r.origin?Object.values(r.origin.snapshot).filter(x=>typeof x==="string"):[])]);
  function packet(raw, bridgeId, at=new Date().toISOString()) {
    const records=clean(raw).records.filter(r=>(!bridgeId||r.bridgeId===bridgeId)&&shareable(r));
    return { format:"rpb-community-knowledge",schema:1,exported:stamp(at),notice:"Community accounts with recorded permission to share; not independently verified. Review locally before relying on or resharing them. Only current approved versions are included.",records:records.map(r=>({id:r.id,bridgeId:r.bridgeId,createdAt:r.createdAt,revision:r.versions.length,at:r.versions.at(-1).at,snapshot:current(r)})) };
  }
  function cleanPacket(raw) {
    if (!raw || raw.format!=="rpb-community-knowledge" || raw.schema!==1 || !Array.isArray(raw.records) || raw.records.length>200) fail("This is not a supported community knowledge exchange file.");
    stamp(raw.exported);
    const bridges=bridgeIds(), seen=new Set();
    return raw.records.map(x=> {
      if (!x || !bridges.has(x.bridgeId) || !Number.isInteger(x.revision) || x.revision<1 || x.revision>20) fail("Invalid shared account or revision.");
      const r={id:id(x.id),bridgeId:x.bridgeId,createdAt:stamp(x.createdAt),revision:x.revision,at:stamp(x.at),snapshot:snapshot(x.snapshot)};
      if (r.snapshot.sharing!=="shared" || r.snapshot.withdrawn || r.at<r.createdAt || r.snapshot.date>r.at.slice(0,10) || r.at>raw.exported || seen.has(r.id)) fail("Shared accounts must be unique, active and approved for sharing, with valid dates.");
      seen.add(r.id); return r;
    });
  }
  function importPacket(raw, incoming, makeId, at=new Date().toISOString()) {
    const result=clean(raw), entries=cleanPacket(incoming); stamp(at);
    let added=0, skipped=0, related=0;
    for (const e of entries) {
      const exact=result.records.some(r=> (r.id===e.id && r.versions.length===e.revision && r.bridgeId===e.bridgeId && JSON.stringify(current(r))===JSON.stringify(e.snapshot)) || (r.origin && r.origin.id===e.id && r.origin.revision===e.revision && r.origin.bridgeId===e.bridgeId && JSON.stringify(r.origin.snapshot)===JSON.stringify(e.snapshot)));
      if (exact) { skipped++; continue; }
      const linked=result.records.some(r=>r.id===e.id || r.origin?.id===e.id);
      if (linked) related++;
      result.records.push({id:makeId(),bridgeId:e.bridgeId,createdAt:at,origin:{...e,receivedAt:at,related:linked},versions:[{at,reason:"Imported community account; local review and sharing decision required.",snapshot:{...e.snapshot,sharing:"local",permissionNote:"",review:"unreviewed",reviewNote:""}}]});
      added++;
    }
    return {data:clean(result),added,skipped,related};
  }
  window.RPB_KNOWLEDGE={kinds,methods,reviews,empty,fresh,clean,snapshot,current,forBridge,shareable,save,withdraw,lines,texts,packet,cleanPacket,importPacket};
})();
