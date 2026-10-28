/* Constant-price lifecycle appraisal; assumptions, not forecasts or causal estimates. */
(() => {
 'use strict';
 const kinds=['capital','maintenance','operating','replacement','decommissioning','opportunity','avoided-loss','benefit','funding'];
 const benefit=k=>['avoided-loss','benefit'].includes(k);
 const cash=k=>!benefit(k)&&!['opportunity','funding'].includes(k);
 const empty=()=>({schema:1,currency:'',priceYear:'',horizon:10,rate:0.03,rateLow:0,rateHigh:0.06,context:'',lines:[],nonMonetized:[]});
 const fail=m=>{throw Error(m);};
 const text=(v,n,required=false)=>{if(typeof v!=='string'||v.length>n||(required&&!v.trim()))fail('Missing or invalid economics text.');return v.trim();};
 const num=(v,min,max)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)fail('Economics value outside supported range.');return v;};
 const integer=(v,min,max)=>{num(v,min,max);if(!Number.isInteger(v))fail('Years and intervals must be whole numbers.');return v;};
 const id=v=>{if(typeof v!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(v))fail('Invalid economics ID.');return v;};
 const choose=(v,list)=>list.includes(v)?v:fail('Invalid economics choice.');
 function clean(raw){
  if(raw==null)return empty();if(raw.schema!==1||!Array.isArray(raw.lines)||raw.lines.length>200||!Array.isArray(raw.nonMonetized)||raw.nonMonetized.length>100)fail('Economics supports 200 monetary lines and 100 non-monetized impacts.');
  const p={schema:1,currency:text(raw.currency,40),priceYear:text(raw.priceYear,4),horizon:integer(raw.horizon,1,50),rate:num(raw.rate,0,1),rateLow:num(raw.rateLow,0,1),rateHigh:num(raw.rateHigh,0,1),context:text(raw.context,4000),lines:[],nonMonetized:[]};
  if(p.priceYear&&!/^\d{4}$/.test(p.priceYear))fail('Price year must have four digits.');if(p.rateLow>p.rate||p.rate>p.rateHigh)fail('Discount sensitivity range must contain the base rate.');
  const seen=new Set();
  p.lines=raw.lines.map(r=>{const key=id(r.id);if(seen.has(key))fail('Duplicate economics ID.');seen.add(key);if(typeof r.included!=='boolean')fail('Specify line inclusion.');const l={id:key,title:text(r.title,200,true),kind:choose(r.kind,kinds),group:text(r.group,200,true),start:integer(r.start,0,p.horizon),end:integer(r.end,0,p.horizon),interval:integer(r.interval,1,50),amount:num(r.amount,-1e12,1e12),low:num(r.low,-1e12,1e12),high:num(r.high,-1e12,1e12),growth:num(r.growth,-0.5,0.5),localShare:num(r.localShare,0,1),localGroup:text(r.localGroup,200),service:text(r.service,200).toLowerCase(),valuation:choose(r.valuation,['final','intermediate']),withoutLoss:num(r.withoutLoss,0,1e12),withLoss:num(r.withLoss,0,1e12),basis:text(r.basis,4000,true),included:r.included};
   if(l.start>l.end||l.low>l.amount||l.amount>l.high)fail('Ordered years and low ≤ base ≤ high amounts are required.');
   if(l.kind!=='avoided-loss'&&l.low<0)fail('Use a cost line for losses; only avoided-loss scenarios may be negative.');
   if(l.kind==='avoided-loss'&&Math.abs(l.amount-(l.withoutLoss-l.withLoss))>1e-7)fail('Avoided loss must equal loss without intervention minus residual loss with it.');
   if(benefit(l.kind)&&!l.service)fail('Benefits need a shared benefit-pathway key to check overlap.');
   if(benefit(l.kind)&&l.included&&l.valuation!=='final')fail('Intermediate ecosystem services cannot be monetized alongside final outcomes. Exclude this line or record it as non-monetized.');
   if(cash(l.kind)&&l.localShare>0&&!l.localGroup)fail('Local retention needs a recipient group.');return l;
  });
  p.nonMonetized=raw.nonMonetized.map(r=>{const key=id(r.id);if(seen.has(key))fail('Duplicate economics ID.');seen.add(key);return {id:key,title:text(r.title,200,true),domain:choose(r.domain,['ecological','cultural','social']),direction:choose(r.direction,['positive','negative','mixed','unknown']),group:text(r.group,200,true),indicator:text(r.indicator,1000,true),description:text(r.description,4000,true)};});return p;
 }
 const years=l=>{const a=[];for(let y=l.start;y<=l.end;y+=l.interval)a.push(y);return a;};
 function conflicts(p){const found=[];const rows=p.lines.filter(l=>l.included&&benefit(l.kind));for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++)if(rows[i].service===rows[j].service&&years(rows[i]).some(y=>years(rows[j]).includes(y)))found.push({first:rows[i].id,second:rows[j].id,key:rows[i].service});return found;}
 function calculate(p,rate,mode='base'){
  const annual=Array.from({length:p.horizon+1},(_,year)=>({year,cashCosts:0,maintenance:0,opportunity:0,benefits:0,funding:0,localRetained:0})),distribution=new Map();
  const group=name=>{if(!distribution.has(name))distribution.set(name,{group:name,costPV:0,benefitPV:0,fundingPV:0,localReceiptsPV:0});return distribution.get(name);};
  for(const l of p.lines.filter(x=>x.included))for(const y of years(l)){
   let amount=l.amount;if(mode==='lower-net')amount=benefit(l.kind)?l.low:l.high;if(mode==='higher-net')amount=benefit(l.kind)?l.high:l.low;
   const value=amount*Math.pow(1+l.growth,y-l.start),pv=value/Math.pow(1+rate,y),row=annual[y],g=group(l.group);
   if(l.kind==='funding'){row.funding+=value;g.fundingPV+=pv;}
   else if(benefit(l.kind)){row.benefits+=value;g.benefitPV+=pv;}
   else {g.costPV+=pv;if(l.kind==='opportunity')row.opportunity+=value;else {row.cashCosts+=value;if(l.kind==='maintenance')row.maintenance+=value;row.localRetained+=value*l.localShare;if(l.localShare)group(l.localGroup).localReceiptsPV+=pv*l.localShare;}}
  }
  const sum=k=>annual.reduce((s,r)=>s+r[k],0),pv=k=>annual.reduce((s,r)=>s+r[k]/Math.pow(1+rate,r.year),0);
  const cashPV=pv('cashCosts'),opportunityPV=pv('opportunity'),benefitPV=pv('benefits'),costPV=cashPV+opportunityPV;
  return {rate,mode,annual,cashPV,opportunityPV,benefitPV,costPV,netPV:benefitPV-costPV,benefitCostRatio:costPV>0?benefitPV/costPV:null,maintenancePV:pv('maintenance'),fundingPV:pv('funding'),undiscountedCashCost:sum('cashCosts'),undiscountedMaintenance:sum('maintenance'),localRetainedPV:pv('localRetained'),localRetentionShare:cashPV>0?pv('localRetained')/cashPV:null,distribution:[...distribution.values()].map(g=>({...g,netPV:g.benefitPV-g.costPV}))};
 }
 function run(raw){const p=clean(raw);if(!p.currency||!p.priceYear||!p.context)fail('Define currency/unit, constant-price year and appraisal assumptions first.');if(!p.lines.some(l=>l.included))fail('Add at least one included monetary line before calculating.');const overlap=conflicts(p);if(overlap.length)fail('Potential double counting: overlapping included benefits share pathway '+overlap.map(x=>x.key).join(', ')+'. Exclude an alternative valuation or reconcile scope; do not rename keys to hide overlap.');return {label:'SIMULATION — assumption-based appraisal, not a forecast or verified causal effect',method:'Constant-price end-of-year discounting; year 0 undiscounted. No probability model, exchange conversion or automatic inflation adjustment.',base:calculate(p,p.rate),sensitivity:[calculate(p,p.rateLow),calculate(p,p.rateHigh),calculate(p,p.rate,'lower-net'),calculate(p,p.rate,'higher-net')],nonMonetized:p.nonMonetized,limitations:['Sensitivity cases are deterministic comparisons, not confidence bounds; discount-rate endpoints need not bound net value.','Funding and local receipts are transfers/distribution views, never additional social benefits.','Local retention is a gross direct-spending proxy, not net local wealth or a multiplier estimate.','Pathway keys detect declared overlaps only; review intermediate/final services, replacement values, time, population and opportunity-cost scope manually.','Non-monetized impacts remain separate; a positive net value does not establish acceptability or equitable outcomes.']};}
 const texts=raw=>{const p=clean(raw);return [p.currency,p.priceYear,p.context,...p.lines.flatMap(l=>[l.title,l.group,l.localGroup,l.service,l.basis]),...p.nonMonetized.flatMap(x=>[x.title,x.group,x.indicator,x.description])];};
 const example=()=>{const p=empty();Object.assign(p,{currency:'illustrative units',priceYear:'2026',horizon:5,context:'Invented teaching example. Define the counterfactual, boundary, constant prices, discount rationale, exclusions and distribution before real use.'});const line=(id,kind,amount,start,end,extra={})=>({id,title:id,kind,group:'Community',start,end,interval:1,amount,low:amount*0.8,high:amount*1.2,growth:0,localShare:0,localGroup:'',service:'',valuation:'final',withoutLoss:0,withLoss:0,basis:'Illustrative invented assumption; not empirical evidence.',included:true,...extra});p.lines=[line('Restoration setup','capital',1000,0,0,{id:'setup',localShare:0.6,localGroup:'Local workers and suppliers'}),line('Annual maintenance','maintenance',100,1,5,{id:'maint',localShare:0.8,localGroup:'Local workers and suppliers'}),line('Foregone alternative land use','opportunity',50,1,5,{id:'opportunity'}),line('Avoided crop loss','avoided-loss',400,1,5,{id:'avoided',withoutLoss:600,withLoss:200,service:'crop-loss-endpoint'})];p.nonMonetized=[{id:'culture',title:'Access to culturally important landscapes',domain:'cultural',direction:'mixed',group:'Knowledge holders',indicator:'Permissioned qualitative review',description:'Not assigned a monetary value. Consider access, restricted knowledge and dissent.'}];return p;};
 window.RPB_ECONOMICS={kinds,empty,clean,conflicts,run,texts,example};
})();
