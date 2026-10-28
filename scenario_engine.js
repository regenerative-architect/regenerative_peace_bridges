/* Deterministic conditional calculations, never forecasts or identified causal effects. */
(() => {
 'use strict';
 const label='SIMULATION — not a forecast or verified causal effect';
 const drivers=[['rainfall','Rainfall','mm per planning period',0,1000,500],['population','Population','people',0,20000,10000],['funding','Funding','local currency per planning period',0,200000,100000],['security','Security','locally defined index (0–100)',0,100,50],['capacity','Institutional capacity','locally defined index (0–100)',0,100,50]];
 const empty=()=>({schema:1,context:'',period:'',parameters:drivers.map(([id,name,unit,min,max,baseline])=>({id,name,unit,min,max,baseline,assumption:''})),outcomes:[],scenarios:[]});
 const fail=m=>{throw Error(m);};
 const text=(v,n,required=false)=>{if(typeof v!=='string'||v.length>n||(required&&!v.trim()))fail('Missing or invalid scenario text.');return v.trim();};
 const number=v=>{if(typeof v!=='number'||!Number.isFinite(v)||Math.abs(v)>1e12)fail('Scenario numbers must be finite and between -1 trillion and 1 trillion.');return v;};
 const id=v=>{if(typeof v!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(v))fail('Invalid scenario ID.');return v;};
 const unique=rows=>{if(new Set(rows.map(x=>x.id)).size!==rows.length)fail('Duplicate scenario or outcome ID.');return rows;};
 function clean(raw){
  if(raw==null)return empty();
  if(raw.schema!==1||!Array.isArray(raw.parameters)||raw.parameters.length!==5||!Array.isArray(raw.outcomes)||raw.outcomes.length>20||!Array.isArray(raw.scenarios)||raw.scenarios.length>10)fail('Scenario schema requires five parameters, at most 20 outcomes and 10 scenarios.');
  const p={schema:1,context:text(raw.context,2000),period:text(raw.period,200),parameters:[],outcomes:[],scenarios:[]};
  p.parameters=drivers.map(([key,name])=>{const rows=raw.parameters.filter(x=>x.id===key);if(rows.length!==1)fail('Missing or duplicate scenario parameter.');const x=rows[0],v={id:key,name,unit:text(x.unit,120,true),min:number(x.min),max:number(x.max),baseline:number(x.baseline),assumption:text(x.assumption,2000)};if(v.min<0||v.max<=v.min||v.baseline<v.min||v.baseline>v.max)fail('Parameter ranges must be nonnegative, ordered, and contain the baseline.');if(['security','capacity'].includes(key)&&v.max>100)fail('Security and capacity indices must stay within 0–100.');return v;});
  const values=raw=>Object.fromEntries(p.parameters.map(x=>{const v=number(raw?.[x.id]);if(v<x.min||v>x.max)fail(x.name+' scenario value is outside its range.');return [x.id,v];}));
  p.outcomes=unique(raw.outcomes.map(o=>({id:id(o.id),title:text(o.title,200,true),unit:text(o.unit,120,true),baseline:number(o.baseline),assumption:text(o.assumption,4000,true),weights:Object.fromEntries(p.parameters.map(x=>[x.id,number(o.weights?.[x.id])]))})));
  p.scenarios=unique(raw.scenarios.map(s=>({id:id(s.id),title:text(s.title,200,true),values:values(s.values)})));
  return p;
 }
 function run(raw){
  const p=clean(raw);if(!p.context||!p.period||p.parameters.some(x=>!x.assumption)||!p.outcomes.length)fail('Define context, planning period, all parameter assumptions and at least one outcome before simulating.');
  const calculate=(o,values)=>{const contributions=p.parameters.map(x=>({id:x.id,delta:o.weights[x.id]*(values[x.id]-x.baseline)/(x.max-x.min)}));return {value:o.baseline+contributions.reduce((s,c)=>s+c.delta,0),contributions};};
  const base=Object.fromEntries(p.parameters.map(x=>[x.id,x.baseline]));
  return {label,method:'Additive linear response using range-normalized parameter changes; no probabilities, interactions, feedback or causal identification.',context:p.context,period:p.period,
   outcomes:p.outcomes.map(o=>{const sensitivity=p.parameters.map(x=>{const low=calculate(o,{...base,[x.id]:x.min}).value,high=calculate(o,{...base,[x.id]:x.max}).value;return {parameter:x.id,lowInput:x.min,highInput:x.max,lowOutput:low,highOutput:high,swing:Math.abs(high-low)};}).sort((a,b)=>b.swing-a.swing);
    const lower=o.baseline+sensitivity.reduce((s,x)=>s+Math.min(x.lowOutput-o.baseline,x.highOutput-o.baseline),0),upper=o.baseline+sensitivity.reduce((s,x)=>s+Math.max(x.lowOutput-o.baseline,x.highOutput-o.baseline),0);
    return {id:o.id,title:o.title,unit:o.unit,baseline:o.baseline,assumption:o.assumption,sensitivity,bounds:{lower,upper,label:'Model extrema across the full input box; not a confidence interval. Joint extremes may be infeasible.'},scenarios:p.scenarios.map(s=>({id:s.id,title:s.title,...calculate(o,s.values)})),warning:lower<0?'This model permits negative outputs; review whether that is meaningful for this outcome. No silent clipping is applied.':''};})};
 }
 const texts=raw=>{const p=clean(raw);return [p.context,p.period,...p.parameters.flatMap(x=>[x.name,x.unit,x.assumption]),...p.outcomes.flatMap(o=>[o.title,o.unit,o.assumption]),...p.scenarios.map(s=>s.title)];};
 const example=()=>{const p=empty();p.context='Illustrative food production exercise only. Invented coefficients; replace every assumption with locally reviewed reasoning.';p.period='One illustrative growing season';p.parameters.forEach(x=>x.assumption='Illustrative range, not measured data. Define local meaning, source, uncertainty and omitted influences before use.');p.outcomes=[{id:'food',title:'Illustrative food production',unit:'illustrative tonnes',baseline:100,assumption:'Invented linear response: rainfall +40, population -20, funding +30, security +20 and capacity +20 tonnes per full parameter span. No causal evidence; no thresholds, lag, interactions or feedback represented.',weights:{rainfall:40,population:-20,funding:30,security:20,capacity:20}}];p.scenarios=[{id:'dry',title:'Illustrative lower rainfall and funding',values:{rainfall:250,population:10000,funding:50000,security:50,capacity:50}}];return p;};
 window.RPB_SCENARIO={empty,clean,run,texts,example,label};
})();
