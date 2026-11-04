import {solutionFor} from './mission-check.js';
export function rescueAfterMistake(step,session){
 const next=structuredClone(session);
 next.mistakes={...next.mistakes,[step.id]:Math.min(100,(next.mistakes?.[step.id]||0)+1)};
 next.hinted=[...new Set([...(next.hinted||[]),step.id])];next.combo=0;
 if(next.mistakes[step.id]>=3){
  next.answers={...next.answers,[step.id]:solutionFor(step)};
  next.assisted=[...new Set([...(next.assisted||[]),step.id])];
  if(next.drafts)delete next.drafts[step.id];
 }
 return next;
}
