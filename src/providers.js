import { cryptoAssets, positionKey } from './positions.js';

const cache=new Map();
export const defaultBackend=import.meta.env?.VITE_API_BASE_URL || (import.meta.env?.MODE==='pages' ? '' : '/api');
export function validateBackend(value) {
  if(value==='/api')return value;
  const url=new URL(value);
  if(url.protocol!=='https:' || url.username || url.password || url.search || url.hash)throw new Error('Bitte eine HTTPS-Adresse ohne Zugangsdaten, Query oder Fragment verwenden.');
  return url.href.replace(/\/$/,'');
}
async function json(url) {
  const r=await fetch(url,{signal:AbortSignal.timeout(20000),credentials:'omit'});
  let data;try{data=await r.json();}catch{throw new Error('Der Dienst liefert kein gültiges JSON. Prüfe die Backend-Adresse.');}
  if(!r.ok || data.error)throw new Error(data.error || (r.status===429?'Gratislimit erreicht. Bitte später erneut versuchen.':`Datenanbieter nicht erreichbar (HTTP ${r.status}).`));
  return data;
}
function endpoint(base,path,params={}) {
  if(!base)throw new Error('Der gemeinsame Dienst ist noch nicht veröffentlicht. Kryptokurse funktionieren bereits ohne Backend.');
  return `${validateBackend(base)}/${path}?${new URLSearchParams(params)}`;
}
function cached(key,ttl,fn) {
  const old=cache.get(key);if(old && Date.now()-old.at<ttl)return Promise.resolve(old.data);
  return fn().then(data=>{if(cache.size>100)cache.delete(cache.keys().next().value);cache.set(key,{at:Date.now(),data});return data;});
}
export async function loadDefaultBackend() {
  if(defaultBackend)return validateBackend(defaultBackend);
  try{const result=await json(`${import.meta.env.BASE_URL}backend.json`);return result.apiBaseUrl?validateBackend(result.apiBaseUrl):'';}catch{return '';}
}
export async function verifyBackend(base) {
  const data=await json(endpoint(base,'health'));
  if(data.ok!==true || data.service!=='Port. Market API')throw new Error('Diese Adresse ist kein kompatibler Port.-Dienst.');
  return data;
}
export function getFX(base) {
  if(base)return cached(`fx:${base}`,3600000,()=>json(endpoint(base,'fx')));
  return cached('fx',3600000,async()=>{
    const data=await json('https://api.frankfurter.dev/v1/latest?base=EUR');
    if(data.base!=='EUR' || !data.rates || !data.date)throw new Error('Ungültige Wechselkurse erhalten.');
    return {rates:data.rates,date:data.date,source:'Frankfurter / EZB',fetchedAt:new Date().toISOString()};
  });
}
export async function searchAssets(query,type,base) {
  if(query.trim().length<2)return [];
  if(base)return (await json(endpoint(base,'search',{q:query,type}))).assets || [];
  if(type==='stock')return [];
  const data=await cached(`search:${query}`,3600000,()=>json(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`));
  return (data.coins || []).slice(0,8).map(c=>({symbol:c.symbol.toUpperCase(),id:c.id,name:c.name}));
}
async function cryptoQuote(p) {
  try {
    const data=await cached(`cg:${p.assetId}`,55000,()=>json(`https://api.coingecko.com/api/v3/simple/price?${new URLSearchParams({ids:p.assetId,vs_currencies:'eur',include_24hr_change:'true',include_last_updated_at:'true'})}`));
    const coin=data[p.assetId];if(!(coin?.eur>0) || !(coin.last_updated_at>0))throw new Error('Kein Kurs für diese CoinGecko-ID verfügbar.');
    return {price:coin.eur,currency:'EUR',change24h:coin.eur_24h_change ?? null,marketTime:new Date(coin.last_updated_at*1000).toISOString(),fetchedAt:new Date().toISOString(),source:'CoinGecko'};
  }catch(error){
    if(!cryptoAssets.some(c=>c.id===p.assetId && c.symbol===p.symbol))throw error;
    const data=await cached(`cb:${p.symbol}`,55000,()=>json(`https://api.coinbase.com/v2/prices/${p.symbol}-EUR/spot`));
    const price=Number(data.data?.amount);if(!(price>0) || data.data?.currency!=='EUR')throw error;
    return {price,currency:'EUR',change24h:null,marketTime:null,fetchedAt:new Date().toISOString(),source:'Coinbase · Spotkurs'};
  }
}
export async function getQuotes(positions,base,onQuote=()=>{}) {
  const unique=[...new Map(positions.map(p=>[positionKey(p),p])).values()],quotes={},errors={};
  if(base){
    // Bound each request, including large CSV portfolios; keep successful chunks on partial failures.
    for(let i=0;i<unique.length;i+=30){const part=unique.slice(i,i+30);try{const r=await json(endpoint(base,'quotes',{assets:part.map(positionKey).join(',')}));Object.assign(quotes,r.quotes);Object.assign(errors,r.errors);Object.entries(r.quotes || {}).forEach(([id,q])=>onQuote(id,q));}catch(e){part.forEach(p=>errors[positionKey(p)]=e.message);}}
  }
  const missing=unique.filter(p=>!quotes[positionKey(p)]);
  await Promise.all(missing.map(async p=>{try{if(p.assetType==='stock')throw new Error(errors[positionKey(p)] || 'Der gemeinsame Aktiendienst ist noch nicht verbunden.');const q=await cryptoQuote(p);quotes[positionKey(p)]=q;delete errors[positionKey(p)];onQuote(positionKey(p),q);}catch(e){errors[positionKey(p)]=e.message;}}));
  return {quotes,errors};
}
export async function getPortfolioNews(positions,base) {
  if(!positions.length)return {articles:[],errors:[]};
  const assets=[...new Map(positions.map(p=>[p.symbol,p])).values()],articles=[],errors=[];let fetchedAt;
  for(let i=0;i<assets.length;i+=15){const group=assets.slice(i,i+15);try{const r=await json(endpoint(base,'news',{symbols:group.map(p=>p.symbol).join(','),names:JSON.stringify(Object.fromEntries(group.map(p=>[p.symbol,p.name])))}));articles.push(...r.articles);fetchedAt=r.fetchedAt;}catch(e){errors.push(e.message);}}
  if(!articles.length && errors.length)throw new Error([...new Set(errors)].join(' '));
  const merged=new Map();for(const a of articles){const old=merged.get(a.id);merged.set(a.id,old?{...a,symbols:[...new Set([...old.symbols,...a.symbols])]}:a);}
  return {articles:[...merged.values()].sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)),errors,fetchedAt};
}
