import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const box={window:{}};for(const f of ['data.js','portfolio_engine.js'])vm.runInNewContext(readFileSync(new URL('../'+f,import.meta.url),'utf8'),box);
const P=box.window.RPB_PORTFOLIO,clone=x=>JSON.parse(JSON.stringify(x));let count=0;const check=fn=>{fn();count++;};
check(()=>assert.equal(P.clean().nodes.length,0));let p=P.example();let a=P.analyze(p);
check(()=>assert.equal(a.waves.length,4));check(()=>assert.equal(a.ready.join(','),'demo-0'));check(()=>assert.equal(a.blocked.length,3));check(()=>assert.equal(a.bottlenecks[0].downstream,3));
p.nodes[0].status='complete';check(()=>assert.equal(P.analyze(p).ready.length,0));p.edges[0].verification='verified';p.edges[0].evidence='Council review 2026-10-26';check(()=>assert.equal(P.analyze(p).ready.join(','),'demo-1'));
p.edges[0].confidence='low';check(()=>assert.equal(P.analyze(p).ready.join(','),'demo-1'));p.edges[0].verification='failed';check(()=>assert.equal(P.analyze(p).ready.length,0));
let interaction=clone(p);interaction.edges.forEach(e=>e.kind='benefit');check(()=>assert.equal(P.analyze(interaction).waves.length,1));check(()=>assert.equal(P.analyze(interaction).blocked.length,0));check(()=>assert.equal(P.analyze(interaction).interactions.length,3));
let cyclic=P.example();cyclic.edges.push({...cyclic.edges[0],id:'cycle',from:'demo-1',to:'demo-0'});a=P.analyze(cyclic);check(()=>assert.equal(a.cycles.length,2));check(()=>assert.equal(a.unscheduled.length,4));check(()=>assert.equal(a.waves.length,0));
let diamond=P.example();diamond.edges=[{...diamond.edges[0],from:'demo-0',to:'demo-2'},{...diamond.edges[1],from:'demo-1',to:'demo-2'},{...diamond.edges[2],from:'demo-2',to:'demo-3'}];check(()=>assert.equal(P.analyze(diamond).waves[0].length,2));
let inherited=P.inherit(p);check(()=>assert.ok(inherited.nodes.every(n=>n.status==='planned')));check(()=>assert.ok(inherited.edges.every(e=>e.verification==='unverified'&&!e.evidence)));check(()=>assert.equal(p.nodes[0].status,'complete'));
check(()=>assert.deepEqual(clone(P.clean(clone(p))),clone(p)));check(()=>assert.ok(P.texts(p).includes('Safe land access')));
for(const mutate of [x=>x.schema=2,x=>x.nodes.push(x.nodes[0]),x=>x.nodes[0].bridgeId='unknown',x=>x.edges[0].owner='',x=>x.edges[0].contingency='',x=>x.edges[0].requirement='',x=>x.edges[0].confidence='certain',x=>x.edges[0].verification='done',x=>{x.edges[0].verification='verified';x.edges[0].evidence='';},x=>x.edges[0].to='missing',x=>x.edges[0].to=x.edges[0].from,x=>x.edges.push(x.edges[0]),x=>x.nodes[0].title='x'.repeat(201)]){const bad=P.example();mutate(bad);check(()=>assert.throws(()=>P.clean(bad)));}
let high=P.example();high.edges[0].confidence='high';high.nodes[0].status='complete';check(()=>assert.equal(P.analyze(high).ready.length,0));
high.nodes[1].status='active';check(()=>assert.ok(P.analyze(high).warnings.includes('demo-1')));
let isolated=P.example();isolated.nodes.push({id:'independent',title:'Independent monitoring',bridgeId:'water',owner:'Water council',status:'planned'});check(()=>assert.ok(P.analyze(isolated).ready.includes('independent')));
let tension=P.example();tension.edges.forEach(e=>e.kind='tension');check(()=>assert.equal(P.analyze(tension).waves.length,1));
const oversized=P.empty();oversized.nodes=Array.from({length:101},(_,i)=>({id:'n'+i,title:'Activity '+i,bridgeId:'',owner:'',status:'planned'}));check(()=>assert.throws(()=>P.clean(oversized)));
const beforeAnalyze=JSON.stringify(p);P.analyze(p);check(()=>assert.equal(JSON.stringify(p),beforeAnalyze));
console.log('Passed '+count+' portfolio model checks.');

