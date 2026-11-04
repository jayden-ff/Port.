import {evaluateStep} from './mission-check.js';

export const freshMission=()=>({version:1,index:0,answers:{},drafts:{},assisted:[],combo:0,submitted:false,mistakes:{},hinted:[]});
const record=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
const atom=x=>typeof x==='string'?x.slice(0,120):typeof x==='boolean'?x:typeof x==='number'&&Number.isFinite(x)?x:null;
function safeValue(x){
 if(Array.isArray(x))return x.length<=32&&x.every(v=>atom(v)!==null)?x.map(atom):undefined;
 if(x&&typeof x==='object'){const entries=Object.entries(x);if(entries.length>16||entries.some(([k,v])=>['__proto__','prototype','constructor'].includes(k)||atom(v)===null))return undefined;return Object.fromEntries(entries.map(([k,v])=>[k,atom(v)]))}
 return atom(x)??undefined;
}
function validDraft(step,value){
 if(step.kind==='number')return typeof value==='string'||typeof value==='number'&&Number.isFinite(value);
 if(step.kind==='match')return Array.isArray(value)&&value.length===step.pairs.length&&value.every(n=>Number.isInteger(n)&&n>=-1&&n<step.pairs.length);
 if(step.kind==='order')return Array.isArray(value)&&value.length<=step.items.length&&new Set(value).size===value.length&&value.every(id=>step.items.some(item=>item.id===id));
 if(step.kind==='tune')return value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===step.controls.length&&step.controls.every(c=>typeof value[c.id]==='number'&&Number.isFinite(value[c.id])&&value[c.id]>=c.min&&value[c.id]<=c.max);
 return false;
}
export function sanitizeMissionSession(mission,raw){
 if(!raw||raw.version!==1)return freshMission();
 const answers={},source=record(raw.answers),drafts={},sourceDrafts=record(raw.drafts);
 let prefix=0;
 for(const step of mission.steps){
  const value=safeValue(source[step.id]);
  if(value===undefined||!evaluateStep(step,value))break;
  answers[step.id]=value;prefix++;
 }
 for(const step of mission.steps){const value=safeValue(sourceDrafts[step.id]);if(value!==undefined&&validDraft(step,value)&&!Object.hasOwn(answers,step.id))drafts[step.id]=value}
 const assisted=Array.isArray(raw.assisted)?[...new Set(raw.assisted.filter(id=>typeof id==='string'&&mission.steps.some(s=>s.id===id)))]:[];
 const maxCombo=mission.steps.slice(0,prefix).filter(s=>s.kind!=='story'&&!assisted.includes(s.id)).length;
 const combo=Number.isInteger(raw.combo)&&raw.combo>=0&&raw.combo<=maxCombo?raw.combo:0;
 const index=Number.isInteger(raw.index)&&raw.index>=0?Math.min(raw.index,prefix):prefix;
 const mistakes=Object.fromEntries(mission.steps.filter(s=>Number.isInteger(raw.mistakes?.[s.id])&&raw.mistakes[s.id]>=0&&raw.mistakes[s.id]<=100).map(s=>[s.id,raw.mistakes[s.id]]));
 const hinted=Array.isArray(raw.hinted)?[...new Set(raw.hinted.filter(id=>mission.steps.some(s=>s.id===id)))]:[];
 return {version:1,index,answers,drafts,assisted,combo,mistakes,hinted,submitted:raw.submitted===true&&prefix===mission.steps.length};
}
export function mergeMissionSessions(local,incoming,missions){
 const result={};for(const mission of missions){
  if(!Object.hasOwn(record(local),mission.id)&&!Object.hasOwn(record(incoming),mission.id))continue;
  const a=sanitizeMissionSession(mission,record(local)[mission.id]);const b=sanitizeMissionSession(mission,record(incoming)[mission.id]);
  if(!Object.hasOwn(record(local),mission.id)){result[mission.id]=b;continue}
  if(!Object.hasOwn(record(incoming),mission.id)){result[mission.id]=a;continue}
  const score=s=>s.submitted?-1:Object.keys(s.answers).length;result[mission.id]=score(b)>score(a)?b:a;
 }return result;
}
export const missionFinished=(mission,session)=>mission.steps.every(step=>Object.hasOwn(session.answers,step.id)&&evaluateStep(step,session.answers[step.id]));
