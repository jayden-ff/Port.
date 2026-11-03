// Reviews are suggestions only. This module never selects or locks new lessons.
const intervals=[1,3,7,14,30];
export function addDays(day,count){const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+count);return d.toISOString().slice(0,10)}
export function initializeReviews(state,today){const reviews={...state.reviews};for(const id of state.completed)if(!reviews[id])reviews[id]={due:addDays(today,1),level:0,last:''};return {...state,reviews}}
export function dueReviews(state,today){return Object.entries(state.reviews||{}).filter(([id,r])=>state.completed.includes(id)&&r.due<=today).sort((a,b)=>a[1].due.localeCompare(b[1].due)).map(([id])=>id)}
export function recordReview(state,id,correct,today){const r=state.reviews?.[id];if(!r||r.last===today||r.due>today)return state;const level=correct?Math.min(r.level+1,intervals.length-1):0;return {...state,reviews:{...state.reviews,[id]:{due:addDays(today,intervals[level]),level,last:today}}}}
