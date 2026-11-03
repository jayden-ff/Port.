export const sigmoid=x=>1/(1+Math.exp(-x));
export function softmax(xs){const m=Math.max(...xs), e=xs.map(x=>Math.exp(x-m)),s=e.reduce((a,b)=>a+b,0);return e.map(x=>x/s)}
export const gradientStep=(x,rate)=>x-rate*2*x;
export const posterior=(prior,sensitivity,falsePositive)=>(prior*sensitivity)/(prior*sensitivity+(1-prior)*falsePositive);
export const fresh=()=>({completed:[],days:[],xp:0,steps:{},notes:{},saved:[],motion:false,name:'',lastLesson:'',sessions:{},reviews:{},locale:'en'});
export function readState(raw,validIds){
 try{
  const x=JSON.parse(raw);
  if(!x||!Array.isArray(x.completed)||x.completed.some(v=>typeof v!=='string'))return fresh();
  const known=validIds?new Set(validIds):null;
  const idOK=id=>typeof id==='string'&&!['__proto__','constructor','prototype'].includes(id)&&(!known||known.has(id));
  const record=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  const uniqueIds=value=>Array.isArray(value)?[...new Set(value.filter(idOK))]:[];
  const completed=uniqueIds(x.completed);
  const answer=value=>typeof value==='string'?value.slice(0,100):typeof value==='number'&&Number.isFinite(value)?value:null;
  const sessions=Object.fromEntries(Object.entries(record(x.sessions)).filter(([id])=>idOK(id)).map(([id,v])=>{v=record(v);return [id,{question:v.question===1?1:0,answers:[answer(v.answers?.[0]),answer(v.answers?.[1])],checked:[v.checked?.[0]===true,v.checked?.[1]===true]}]}));
  const dateOK=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;
  return {...fresh(),completed,xp:completed.length*100,
   locale:['en','de','fr'].includes(x.locale)?x.locale:'en',
   reviews:Object.fromEntries(Object.entries(record(x.reviews)).filter(([id,r])=>idOK(id)&&r&&dateOK(r.due)&&Number.isInteger(r.level)&&r.level>=0&&r.level<=4&&(r.last===''||dateOK(r.last))).map(([id,r])=>[id,{due:r.due,level:r.level,last:r.last}])),
   days:[...new Set(Array.isArray(x.days)?x.days.filter(dateOK):[])],
   steps:Object.fromEntries(Object.entries(record(x.steps)).filter(([id,v])=>idOK(id)&&Number.isInteger(v)&&v>=0&&v<=2)),
   notes:Object.fromEntries(Object.entries(record(x.notes)).filter(([id,v])=>idOK(id)&&typeof v==='string').map(([id,v])=>[id,v.slice(0,10000)])),
   saved:uniqueIds(x.saved),motion:x.motion===true,name:typeof x.name==='string'?x.name.trim().slice(0,60):'',lastLesson:idOK(x.lastLesson)?x.lastLesson:'',sessions};
 }catch{return fresh()}
}
export function complete(s,id,day){return {...s,completed:[...new Set([...s.completed,id])],days:[...new Set([...s.days,day])],xp:new Set([...s.completed,id]).size*100}}
export function localDay(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
export function streak(days){let d=new Date(),n=0;if(!days.includes(localDay(d)))d.setDate(d.getDate()-1);while(days.includes(localDay(d))){n++;d.setDate(d.getDate()-1)}return n}
