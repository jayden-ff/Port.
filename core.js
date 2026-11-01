export const sigmoid=x=>1/(1+Math.exp(-x));
export function softmax(xs){const m=Math.max(...xs), e=xs.map(x=>Math.exp(x-m)),s=e.reduce((a,b)=>a+b,0);return e.map(x=>x/s)}
export const gradientStep=(x,rate)=>x-rate*2*x;
export const posterior=(prior,sensitivity,falsePositive)=>(prior*sensitivity)/(prior*sensitivity+(1-prior)*falsePositive);
export const fresh=()=>({completed:[],days:[],xp:0,steps:{},notes:{},saved:[],motion:false});
export function readState(raw){try{const x=JSON.parse(raw);if(!x||!Array.isArray(x.completed)||x.completed.some(v=>typeof v!=='string'))return fresh();return {...fresh(),completed:[...new Set(x.completed)],xp:new Set(x.completed).size*100,days:Array.isArray(x.days)?x.days.filter(d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)):[],steps:x.steps&&typeof x.steps==='object'&&!Array.isArray(x.steps)?Object.fromEntries(Object.entries(x.steps).filter(([k,v])=>Number.isInteger(v)&&v>=0&&v<=2)):{},notes:x.notes&&typeof x.notes==='object'&&!Array.isArray(x.notes)?x.notes:{},saved:Array.isArray(x.saved)?x.saved.filter(v=>typeof v==='string'):[],motion:x.motion===true}}catch{return fresh()}}
export function complete(s,id,day){return {...s,completed:[...new Set([...s.completed,id])],days:[...new Set([...s.days,day])],xp:new Set([...s.completed,id]).size*100}}
export function localDay(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
export function streak(days){let d=new Date(),n=0;if(!days.includes(localDay(d)))d.setDate(d.getDate()-1);while(days.includes(localDay(d))){n++;d.setDate(d.getDate()-1)}return n}
