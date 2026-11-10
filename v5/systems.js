/* Peace Systems Mapping: bounded, device-local graphs; arrows are claims, not proof. */
(() => {
  'use strict';
  const types={water:'Water',food:'Food',education:'Education',health:'Health',land:'Land Rights',governance:'Governance',women:'Women Leadership',youth:'Youth Participation',restoration:'Restoration',outcome:'Peace / other outcome'};
  const polarities={positive:'Same direction (+)',negative:'Opposite direction (−)',uncertain:'Direction uncertain (?)'};
  const statuses={hypothesis:'Proposed relationship',observed:'Locally supported account',disputed:'Contested relationship'};
  const empty=()=>({schema:1,maps:{}});
  const blank=()=>({nodes:[],edges:[],sharing:'local',permission:''});
  const fail=m=>{throw Error(m);};
  const text=(v,n)=>{if(typeof v!=='string'||v.length>n)fail('Invalid or overlong systems text.');return v.trim();};
  const id=v=>{if(typeof v!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(v))fail('Invalid systems ID.');return v;};
  const stamp=v=>{if(typeof v!=='string'||!Number.isFinite(Date.parse(v))||new Date(v).toISOString()!==v)fail('Invalid systems revision timestamp.');return v;};
  function graph(raw) {
    if(!raw||!Array.isArray(raw.nodes)||!Array.isArray(raw.edges)||raw.nodes.length>30||raw.edges.length>60)fail('A map supports up to 30 nodes and 60 relationships.');
    const g=blank(),ids=new Set(),pairs=new Set(),edgeIds=new Set();
    if(!['local','shared'].includes(raw.sharing))fail('Invalid systems sharing state.');
    g.sharing=raw.sharing;g.permission=text(raw.permission,500);
    if(g.sharing==='shared'&&!g.permission)fail('Record permission before sharing this map.');
    g.nodes=raw.nodes.map(n=>{
      const x={id:id(n.id),type:n.type,label:text(n.label,100),description:text(n.description,700),metricId:n.metricId};
      if(ids.has(x.id)||!Object.hasOwn(types,x.type)||!x.label)fail('Nodes need unique IDs, a type and a label.');ids.add(x.id);
      if(typeof x.metricId!=='string'||(x.metricId&&!window.RPB_IMPACT.byId.has(x.metricId)))fail('Unknown impact indicator.');return x;
    });
    g.edges=raw.edges.map(e=>{
      const x={id:id(e.id),from:id(e.from),to:id(e.to),polarity:e.polarity,status:e.status,mechanism:text(e.mechanism,1000),context:text(e.context,700),evidence:text(e.evidence,1000),delay:text(e.delay,200),knowledgeId:e.knowledgeId,docId:e.docId};
      const pair=x.from+'>'+x.to;
      if(edgeIds.has(x.id)||pairs.has(pair)||x.from===x.to||!ids.has(x.from)||!ids.has(x.to))fail('Use distinct existing endpoints and one relationship per directed pair.');
      edgeIds.add(x.id);pairs.add(pair);
      if(!Object.hasOwn(polarities,x.polarity)||!Object.hasOwn(statuses,x.status)||!x.mechanism||!x.context)fail('Explain the relationship, local context, direction and review status.');
      if(x.status!=='hypothesis'&&!x.evidence)fail('Describe local support or disagreement; a link alone is not evidence.');
      if(typeof x.knowledgeId!=='string'||(x.knowledgeId&&!id(x.knowledgeId)))fail('Invalid knowledge link.');
      if(typeof x.docId!=='string'||(x.docId&&!window.RPB.documents.some(d=>d.id===x.docId)))fail('Unknown institutional source.');return x;
    });return g;
  }
  function clean(raw) {
    if(raw==null)return empty();
    if(raw.schema!==1||!raw.maps||typeof raw.maps!=='object'||Array.isArray(raw.maps))fail('Invalid systems schema.');
    const out=empty(),valid=new Set([...window.RPB.bridges.map(b=>b.id),'other']);
    for(const [bid,m] of Object.entries(raw.maps)){
      if(!valid.has(bid)||!m||!Array.isArray(m.history)||m.history.length>20)fail('Invalid systems bridge or history.');
      let last='';
      const history=m.history.map(v=>{const at=stamp(v.at),reason=text(v.reason,500);if(!reason||at<last)fail('Systems history needs chronological dates and reasons.');last=at;return {at,reason,graph:graph(v.graph)};});
      out.maps[bid]={...graph(m),history};
    }
    if(JSON.stringify(out).length>2000000)fail('Systems maps exceed the 2 MB plan limit.');return out;
  }
  const get=(raw,bid)=>raw?.maps?.[bid]||{...blank(),history:[]};
  function save(raw,bid,next,reason,at=new Date().toISOString()){
    const out=clean(raw),prev=get(out,bid),g=graph(next);reason=text(reason,500);stamp(at);
    if(!reason)fail('Describe why this map changed.');
    const history=[...prev.history,{at,reason,graph:graph(prev)}].slice(-20);
    out.maps[bid]={...g,history};return clean(out);
  }
  function path(g,start,end,excluded=''){
    if(!g.nodes.some(n=>n.id===start)||!g.nodes.some(n=>n.id===end))return [];
    const queue=[[start]],seen=new Set([start]);
    while(queue.length){const p=queue.shift();if(p.at(-1)===end)return p;for(const e of g.edges.filter(e=>e.from===p.at(-1)&&e.id!==excluded)){if(!seen.has(e.to)){seen.add(e.to);queue.push([...p,e.to]);}}}return [];
  }
  const loopEdges=g=>g.edges.filter(e=>path(g,e.to,e.from,e.id).length).map(e=>e.id);
  function lines(raw,bid,sharedOnly=true){
    const g=get(raw,bid);if(sharedOnly&&g.sharing!=='shared')return [];
    const names=new Map(g.nodes.map(n=>[n.id,n.label]));
    return [...g.nodes.map(n=>n.label+' ['+types[n.type]+']'+(n.description?': '+n.description:'')),...g.edges.map(e=>`${names.get(e.from)} → ${names.get(e.to)} (${polarities[e.polarity]}; ${statuses[e.status]}). ${e.mechanism} Context: ${e.context} Support / disagreement: ${e.evidence||'Not yet recorded'}. Delay: ${e.delay||'Unknown'}.`),...(g.sharing==='shared'?['Sharing agreement: '+g.permission]:[])];
  }
  const texts=raw=>Object.values(raw?.maps||{}).flatMap(m=>[m,...m.history.map(v=>v.graph)].flatMap(g=>[g.permission,...g.nodes.flatMap(n=>[n.label,n.description]),...g.edges.flatMap(e=>[e.mechanism,e.context,e.evidence,e.delay])]).concat(m.history.map(v=>v.reason)));
  function packet(raw,bid,knowledge){
    const g=graph(get(raw,bid));if(g.sharing!=='shared')fail('Approve the current map for sharing first.');
    const allowed=new Set(window.RPB_KNOWLEDGE.forBridge(knowledge,bid).filter(window.RPB_KNOWLEDGE.shareable).map(r=>r.id));
    g.edges.forEach(e=>{if(!allowed.has(e.knowledgeId))e.knowledgeId='';});
    return {format:'rpb-peace-systems',schema:1,bridgeId:bid,notice:'Illustrative or locally assessed relationships, not causal proof. Knowledge IDs are references only; accounts are not included.',graph:g};
  }
  function readPacket(p){if(!p||p.format!=='rpb-peace-systems'||p.schema!==1||![...window.RPB.bridges.map(b=>b.id),'other'].includes(p.bridgeId))fail('Not a valid peace systems exchange file.');const g=graph(p.graph);g.sharing='local';g.permission='';g.edges.forEach(e=>e.knowledgeId='');return g;}
  const templates=[
    {id:'water-school',name:'Water → School Attendance → Social Stability → Reduced Tension',nodes:[['water','Water'],['education','School Attendance'],['outcome','Social Stability'],['outcome','Reduced Tension']],links:[[0,1,'Reliable nearby water may reduce collection time and missed lessons.'],[1,2,'Inclusive schooling may create repeated contact and shared opportunities.'],[2,3,'Trusted shared routines may reduce some sources of tension.']]},
    {id:'restoration-food',name:'Restoration, water and food feedback',nodes:[['restoration','Restoration'],['water','Water retention'],['food','Food security'],['governance','Shared stewardship']],links:[[0,1,'Vegetation and soil cover may improve infiltration.'],[1,2,'Water availability may support more reliable harvests.'],[2,3,'More secure livelihoods may enable voluntary stewardship.'],[3,0,'Agreed maintenance and resource rules may sustain restoration.']]},
    {id:'inclusive',name:'Inclusive land and resource decisions',nodes:[['women','Women Leadership'],['youth','Youth Participation'],['governance','Inclusive Governance'],['land','Secure Land Rights'],['restoration','Restoration'],['health','Community Health'],['food','Food security'],['water','Equitable Water Access'],['education','Education']],links:[[0,2,'Meaningful decision power may broaden whose needs are considered.'],[1,2,'Youth participation may expose overlooked access barriers.'],[2,3,'Transparent dispute processes may clarify rights.'],[3,4,'Fair tenure arrangements may support long-term restoration.'],[4,7,'Restoration may improve water regulation in suitable contexts.'],[7,5,'Reliable safe water may reduce illness.'],[5,8,'Better health may reduce missed school days.'],[7,6,'Fair water access may support food production.']]},
    {id:'tradeoff',name:'Restoration benefits and land disputes',nodes:[['restoration','Tree restoration'],['food','Crop production'],['land','Contested tree ownership'],['outcome','Resource tension']],links:[[0,1,'Shade may reduce crop production in some species and spacing combinations.','negative'],[0,2,'Higher tree value may intensify competing ownership claims.'],[2,3,'Unresolved claims may increase tensions between users.']]}
,
{"id":"restoration-diplomacy","name":"Restoration Diplomacy: cooperation, trust and trade-offs","nodes":[["restoration","Shared ecological work"],["governance","Joint monitoring and review"],["outcome","Trust between groups"],["outcome","Sustained cooperation"],["land","Unequal access or benefits"]],"links":[[0,1,"Shared tasks may create opportunities to compare observations and review responsibilities."],[1,2,"Fair review and transparent correction may strengthen confidence in partners."],[2,3,"Trust may help groups continue cooperation through disagreement."],[3,0,"Sustained cooperation may support maintenance and further restoration."],[0,4,"Restoration can change access and create unequal benefits."],[4,2,"Unaddressed unfairness may weaken trust.","negative"]]}
  ];
  function template(key){const t=templates.find(t=>t.id===key);if(!t)fail('Unknown systems example.');return {nodes:t.nodes.map(([type,label],i)=>({id:'n'+i,type,label,description:'Illustrative concept: adapt with the community.',metricId:''})),edges:t.links.map(([a,b,mechanism,polarity],i)=>({id:'e'+i,from:'n'+a,to:'n'+b,polarity:polarity||'positive',status:'hypothesis',mechanism,context:'Illustrative only — replace with local conditions and alternative explanations.',evidence:'',delay:'Unknown — discuss locally',knowledgeId:'',docId:''})),sharing:'local',permission:''};}
  window.RPB_SYSTEMS={types,polarities,statuses,empty,blank,graph,clean,get,save,path,loopEdges,lines,texts,packet,readPacket,templates,template};
})();
