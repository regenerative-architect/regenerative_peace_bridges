/* Illustrative pathways, deliberately separate from local evidence and causal estimates. */
(()=>{'use strict';
const stories={drought:'Drought & food livelihoods',flood:'Flooding & shared watersheds',access:'Disrupted farm access & seed systems',all:'All illustrative pathways'};
const types={pressure:'Pressure',mechanism:'Ecological / access condition',outcome:'Possible livelihood / social effect',bridge:'Proposed restoration bridge'};
const relations={pressure:'May worsen',response:'May help address',tradeoff:'Possible trade-off'};
const nodes=[
['drought','Drought / rainfall stress','pressure','Discuss timing, duration and local observations. Rainfall stress alone does not determine livelihood or conflict outcomes.'],
['flood','Heavy rainfall / flooding','pressure','Explore drainage, exposure and seasonal variation. Do not assume every flood has the same ecological or social effects.'],
['access','Disrupted farm access','pressure','Conflict, damaged infrastructure or disputed rights can constrain access. Do not record routes, armed actors or precise locations.'],
['water-stress','Unreliable water access','mechanism','Separate physical water availability from who has safe, fair access. Consider downstream users and seasonal needs.'],
['soil-loss','Loss of soil / ground cover','mechanism','Examine erosion, cover and soil condition locally; distinguish observations from assumptions.'],
['seed-loss','Seed / input disruption','mechanism','Consider seed diversity, quality, permissions, storage and propagation capacity, not only total quantities.'],
['crop-loss','Crop / livelihood losses','outcome','Agricultural collapse is a severe possible outcome, not an inevitable step. Record scale, timeframe, alternative explanations and local resilience.'],
['food-stress','Food access pressure','outcome','Production is only one influence on food access; prices, income, distribution and services also matter.'],
['tension','Resource-use tensions','outcome','Scarcity does not inevitably produce violence. Governance, power, cooperation and historical relationships influence outcomes.'],
['b-zai','Zaï / soil-water work','bridge','A proposed soil-water response requiring local suitability, safe land access and appropriate agronomic advice.','zai'],
['b-regeneration','Natural regeneration','bridge','A proposed response involving locally appropriate regrowth, tenure and long-term stewardship.','regeneration'],
['b-watershed','Shared watershed care','bridge','A proposed cooperation pathway requiring upstream/downstream inclusion, consent and monitoring.','shared-watersheds'],
['b-wetland','Wetland restoration','bridge','A proposed response requiring ecological assessment, water governance and protection of existing livelihoods.','wetlands'],
['b-seed','Community seed banks','bridge','A proposed response with community control, documented seed rights, quality reviews and diverse local preferences.','seed-sovereignty'],
['b-cooperate','Farmer–herder cooperation','bridge','A proposed relationship-building pathway requiring voluntary, safe participation and legitimate local arrangements.','agropeace']
].map(([id,label,type,description,bridgeId])=>({id,label,type,description,...(bridgeId?{bridgeId}:{})}));
const edges=[
['dry-water','drought','water-stress','pressure',['drought'],'Which water users and seasons are affected? What observations distinguish climate stress from infrastructure or access problems?',['unesco-water-cooperation-2024']],
['dry-soil','drought','soil-loss','pressure',['drought'],'Could reduced cover or other pressures increase soil vulnerability? Check local conditions and competing explanations.',['un-decade-principles-2021']],
['flood-water','flood','water-stress','pressure',['flood'],'Could flooding damage water access or alter water quality? Examine local infrastructure, exposure and recovery rather than assuming one outcome.',['un-decade-principles-2021']],
['flood-soil','flood','soil-loss','pressure',['flood'],'Could exposed soils or damaged drainage increase erosion? Include beneficial sediment processes and site differences.',['un-decade-principles-2021']],
['flood-seed','flood','seed-loss','pressure',['flood'],'Could storage loss or interrupted planting reduce seed availability? Review actual losses and recovery options.',['fao-community-seed-banks-2014']],
['access-seed','access','seed-loss','pressure',['access'],'Could disrupted production or exchange limit suitable seed? Examine local alternatives and who controls access.',['fao-community-seed-banks-2014']],
['access-crop','access','crop-loss','pressure',['access'],'Could unsafe or disputed access reduce production? Safe access must be reviewed through the existing hazard and rights processes.',['imas','fao-vggt']],
['water-crop','water-stress','crop-loss','pressure',['drought','flood'],'How might timing and reliability of water affect the selected crops? What other factors influence observed losses?',['un-decade-principles-2021']],
['soil-crop','soil-loss','crop-loss','pressure',['drought','flood'],'Which locally observed soil changes matter for production, and over what timeframe?',['un-decade-principles-2021']],
['seed-crop','seed-loss','crop-loss','pressure',['flood','access'],'Would suitable, permissioned seed be available at the needed time? Quantity alone does not establish suitability.',['fao-community-seed-banks-2014']],
['crop-food','crop-loss','food-stress','pressure',['drought','flood','access'],'How do production, market access, household income and distribution interact here? Avoid assuming yield alone determines food security.',['un-decade-principles-2021']],
['water-tension','water-stress','tension','pressure',['drought'],'Could unequal access aggravate existing tensions? Identify cooperation, institutions and explanations that may interrupt this pathway.',['unesco-water-cooperation-2024','cda-dnh']],
['zai-water','b-zai','water-stress','response',['drought'],'Could a locally suitable soil-water pilot help? Verify land safety and downstream effects before field work.',['wocat-zai-niger']],
['regen-soil','b-regeneration','soil-loss','response',['drought','flood'],'Could locally appropriate regrowth improve cover? Examine tenure, grazing, maintenance and evidence at a comparable scale.',['sendzimir-2011','un-decade-principles-2021']],
['wetland-soil','b-wetland','soil-loss','response',['flood'],'Could wetland recovery contribute to the desired ecological functions here? Do not assume flood protection or livelihood benefits without assessment.',['unep-iraq-marshes-2009','un-decade-principles-2021']],
['watershed-water','b-watershed','water-stress','response',['drought','flood'],'Could jointly reviewed watershed management improve fair water access? Include downstream users and assess trade-offs.',['unesco-water-cooperation-2024']],
['watershed-tension','b-watershed','tension','tradeoff',['drought','flood'],'Could changes in water retention or allocation disadvantage others and intensify tension? Review consent, distribution and grievance routes.',['unesco-water-cooperation-2024','cda-dnh']],
['seed-response','b-seed','seed-loss','response',['flood','access'],'Could locally governed seed reserves and nursery capacity help recovery? Review diversity, permissions and quality.',['fao-community-seed-banks-2014']],
['cooperate-access','b-cooperate','access','response',['access'],'Could voluntary agreements support safer, fairer resource access? Agreements do not replace land rights or mine-action clearance.',['fao-vggt','cda-dnh']],
['seed-tradeoff','b-seed','tension','tradeoff',['access'],'Could allocation exclude growers, displace valued varieties or create dependency? Invite differing views and review benefit sharing.',['fao-community-seed-banks-2014','cda-dnh']]
].map(([id,from,to,kind,stories,question,sources])=>({id,from,to,kind,stories,question,sources,status:'Illustrative relationship — examine locally'}));
function graph(story='drought'){if(!Object.hasOwn(stories,story))throw Error('Unknown pathway.');const es=edges.filter(e=>story==='all'||e.stories.includes(story)),used=new Set(es.flatMap(e=>[e.from,e.to]));return {nodes:nodes.filter(n=>used.has(n.id)),edges:es};}
function neighborhood(g,id){const es=g.edges.filter(e=>e.from===id||e.to===id),used=new Set([id,...es.flatMap(e=>[e.from,e.to])]);return {nodes:g.nodes.filter(n=>used.has(n.id)),edges:es};}
function trace(g,id){const seen=new Set([id]),todo=[id],es=new Set();while(todo.length){const from=todo.shift();for(const e of g.edges.filter(e=>e.from===from)){es.add(e.id);if(!seen.has(e.to)){seen.add(e.to);todo.push(e.to);}}}return {nodes:g.nodes.filter(n=>seen.has(n.id)),edges:g.edges.filter(e=>es.has(e.id))};}
function validate(registry){const seen=new Set();for(const n of nodes){if(seen.has(n.id)||!types[n.type])throw Error('Invalid explorer node.');seen.add(n.id);if(n.bridgeId&&!registry.bridges.some(b=>b.id===n.bridgeId))throw Error('Unknown bridge.');}const links=new Set();for(const e of edges){if(links.has(e.id)||!seen.has(e.from)||!seen.has(e.to)||!relations[e.kind]||!e.stories.length||e.stories.some(s=>s==='all'||!stories[s])||!e.sources.length||e.sources.some(s=>!registry.documents.some(d=>d.id===s)))throw Error('Invalid explorer relationship.');links.add(e.id);}return true;}
window.RPB_EXPLORER={stories,types,relations,nodes,edges,graph,neighborhood,trace,validate};
})();
