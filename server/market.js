import { XMLParser } from 'fast-xml-parser';
import { companyNames } from '../src/portfolio.js';

// Ignore unused attributes and decode only the fields we display. Processing all
// entities in RSS descriptions exceeds a free Worker's CPU budget on cold feeds.
const parser = new XMLParser({ ignoreAttributes: true, parseTagValue: false, processEntities: false });
const stockPattern = /^[A-Z0-9][A-Z0-9.^=-]{0,24}$/;
const coinPattern = /^[a-z0-9][a-z0-9._-]{0,100}$/;
function decodeXML(value) {
  const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
  return String(value || '').replace(/&([a-z]+|#x[0-9a-f]+|#[0-9]+);/gi,(full,name)=>{
    if(entities[name])return entities[name];
    if(name[0]!=='#')return full;
    const code=name[1]==='x'?parseInt(name.slice(2),16):Number(name.slice(1));
    return Number.isInteger(code) && code>0 && code<=0x10ffff?String.fromCodePoint(code):full;
  });
}
const clean = value => decodeXML(value).replace(/<[^>]*>/g, '').trim();
const macro = /\b(Fed|EZB|Zinsen|Zinssatz|Inflation|Notenbank|interest rates|central bank)\b/i;

export function normalizeFeed(xml, symbols, names = {}) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('Ungültiger RSS-Feed.');
  const parsed = parser.parse(xml);
  if (!parsed.rss?.channel) throw new Error('Der Nachrichtenanbieter hat keinen gültigen RSS-Feed geliefert.');
  const raw = parsed.rss.channel.item || [];
  const matchers=symbols.map(symbol=>({symbol,name:(companyNames[symbol] || '').toLowerCase(),supplied:(names[symbol] || '').toLowerCase(),pattern:new RegExp(`(^|[^a-z0-9])${symbol.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}([^a-z0-9]|$)`,'i')}));
  return [...new Map((Array.isArray(raw) ? raw : [raw]).map(item => {
    const title = clean(item.title), isMacro = macro.test(title), date = new Date(item.pubDate);
    const lower=title.toLowerCase();
    const matched = isMacro ? symbols : matchers.filter(m=>(m.name && lower.includes(m.name)) || (m.supplied.length>2 && lower.includes(m.supplied)) || m.pattern.test(title)).map(m=>m.symbol);
    const link = decodeXML(item.link);
    if (!title || !matched.length || !/^https:\/\//.test(link) || !Number.isFinite(date.getTime())) return null;
    const source = clean(item.source?.['#text'] || item.source || 'Google News');
    const id = String(item.guid?.['#text'] || item.guid || link);
    return [id, { id, title: title.endsWith(` - ${source}`) ? title.slice(0, -(source.length + 3)) : title,
      summary: 'Aktuelle Meldung zu deinen Positionen. Den vollständigen Artikel findest du bei der Originalquelle.',
      body: 'Diese Meldung stammt aus dem Google-News-RSS-Index. Die Zuordnung basiert auf Unternehmen, Coin-Namen und Börsenkürzeln im Titel; Makromeldungen werden dem Portfolio zugeordnet. Öffne die Originalquelle für den vollständigen Kontext.',
      source, url: link, publishedAt: date.toISOString(), symbols: matched, category: isMacro ? 'Makro' : /quartal|earnings|ergebnis|umsatz/i.test(title) ? 'Quartalszahlen' : 'Unternehmen', image: 'news' }];
  }).filter(Boolean)).values()].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export function normalizeYahooQuote(data) {
  const meta = data?.chart?.result?.[0]?.meta;
  if (!(meta?.regularMarketPrice > 0) || !(meta.regularMarketTime > 0) || !/^[A-Z]{3}$|^GBp$/.test(meta.currency || '')) throw new Error('Für dieses Kürzel liefert der Anbieter keinen gültigen Kurs.');
  const pence = ['GBp', 'GBX'].includes(meta.currency), price = meta.regularMarketPrice;
  const date = new Date(meta.regularMarketTime * 1000);
  if (!Number.isFinite(date.getTime()) || !Number.isFinite(price)) throw new Error('Ungültige Kursdaten.');
  const previous = meta.chartPreviousClose || meta.previousClose;
  return { price: pence ? price / 100 : price, currency: pence ? 'GBP' : meta.currency,
    change24h: previous > 0 ? (price / previous - 1) * 100 : null, marketTime: date.toISOString(), fetchedAt: new Date().toISOString(), source: 'Yahoo Finance · öffentliche Schnittstelle' };
}

export function createMarketService(fetcher = fetch) {
  const cache = new Map(), pending = new Map(), failures = new Map();
  async function cached(key, ttl, run) {
    const old = cache.get(key);
    if (old && Date.now() - old.at < ttl) return old.data;
    if (pending.has(key)) return pending.get(key);
    const failed=failures.get(key);
    if(failed && Date.now()<failed.retryAt)throw new Error(failed.message);
    const job = run().then(data => { failures.delete(key);if (cache.size >= 300) cache.delete(cache.keys().next().value); cache.set(key, { at: Date.now(), data }); return data; }).catch(error=>{
      if(failures.size>=300)failures.delete(failures.keys().next().value);
      failures.set(key,{message:error.message,retryAt:Date.now()+Math.max(60,error.retrySeconds || 0)*1000});
      throw error;
    }).finally(() => pending.delete(key));
    pending.set(key, job); return job;
  }
  async function request(url, xml = false) {
    const response = await fetcher(url, { signal: AbortSignal.timeout(12000), headers: { Accept: xml ? 'application/rss+xml, application/xml' : 'application/json', 'User-Agent': 'Port/1.0' } });
    if (!response.ok) {
      const error=new Error(response.status === 429 ? 'Datenanbieter-Limit erreicht. Bitte später erneut versuchen.' : `Datenanbieter antwortet mit HTTP ${response.status}.`);
      const retry=response.headers.get('Retry-After');
      const seconds=retry && /^\d+$/.test(retry)?Number(retry):retry?Math.max(0,(Date.parse(retry)-Date.now())/1000):60;
      error.retrySeconds=Number.isFinite(seconds)?Math.min(seconds,3600):60;
      throw error;
    }
    const body = await response.text();
    if (body.length > 2000000) throw new Error('Anbieterantwort zu groß.');
    return xml ? body : JSON.parse(body);
  }
  async function stock(symbol) {
    return cached(`stock:${symbol}`, 55000, async () => normalizeYahooQuote(await request(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`)));
  }
  async function quotes(assets) {
    const result = { quotes: {}, errors: {} };
    await Promise.all(assets.filter(a => a.type === 'stock').map(async a => { try { result.quotes[`stock:${a.id}`] = await stock(a.id); } catch (e) { result.errors[`stock:${a.id}`] = e.message; } }));
    const coins = assets.filter(a => a.type === 'crypto');
    if (coins.length) {
      try {
        const ids = coins.map(a => a.id).sort().join(',');
        const data = await cached(`coins:${ids}`, 55000, () => request(`https://api.coingecko.com/api/v3/simple/price?${new URLSearchParams({ ids, vs_currencies: 'eur', include_24hr_change: 'true', include_last_updated_at: 'true' })}`));
        for (const coin of coins) { const q = data[coin.id]; if (Number.isFinite(q?.eur) && q.eur > 0 && q.last_updated_at > 0) result.quotes[`crypto:${coin.id}`] = { price: q.eur, currency: 'EUR', change24h: q.eur_24h_change ?? null, marketTime: new Date(q.last_updated_at * 1000).toISOString(), fetchedAt: new Date().toISOString(), source: 'CoinGecko' }; else result.errors[`crypto:${coin.id}`] = 'Kein Kurs für diese CoinGecko-ID verfügbar.'; }
      } catch (e) { for (const coin of coins) result.errors[`crypto:${coin.id}`] = e.message; }
    }
    return result;
  }
  async function search(q, type) {
    return cached(`search:${type}:${q.toLowerCase()}`, 3600000, async () => {
      if (type === 'crypto') { const data = await request(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`); return (data.coins || []).slice(0,8).map(a => ({symbol:a.symbol.toUpperCase(),id:a.id,name:a.name})); }
      const data = await request(`https://query1.finance.yahoo.com/v1/finance/search?${new URLSearchParams({q,quotesCount:'8',newsCount:'0'})}`);
      return (data.quotes || []).filter(a => ['EQUITY','ETF'].includes(a.quoteType) && stockPattern.test(a.symbol)).slice(0,8).map(a => ({symbol:a.symbol,id:a.symbol,name:a.longname || a.shortname || a.symbol}));
    });
  }
  async function news(symbols, names = {}) {
    const key = JSON.stringify(symbols.map(s => [s,names[s]]).sort());
    return cached(`news:${key}`, 55000, async () => {
      const terms = symbols.map(s => `"${clean(names[s] || companyNames[s] || s).replace(/["()]/g,' ')}"`).join(' OR ');
      const url = `https://news.google.com/rss/search?${new URLSearchParams({q:`(${terms} OR "EZB" OR "Fed Zinsen") when:2d`,hl:'de',gl:'DE',ceid:'DE:de'})}`;
      return { articles: normalizeFeed(await request(url,true),symbols,names), errors:[], fetchedAt:new Date().toISOString(), provider:'Google News RSS', refreshSeconds:60, coveredSymbols:symbols };
    });
  }
  async function fx() { return cached('fx',3600000,async()=>{const data=await request('https://api.frankfurter.dev/v1/latest?base=EUR');if(data.base!=='EUR' || !data.rates || !data.date)throw new Error('Ungültige Wechselkurse.');return {rates:data.rates,date:data.date,source:'Frankfurter / EZB',fetchedAt:new Date().toISOString()};}); }
  return { quotes, search, news, fx };
}

export function createAPI(service, {allowedOrigins = ['https://jayden-ff.github.io']} = {}) {
  const visitors = new Map();
  return async function handle(request, clientIP = '') {
    const origin = request.headers.get('Origin');
    const headers = { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Vary':'Origin' };
    if (origin && !allowedOrigins.includes(origin)) return new Response(JSON.stringify({error:'Dieser Ursprung ist nicht freigegeben.'}), {status:403,headers});
    if (origin) headers['Access-Control-Allow-Origin'] = origin;
    if (request.method === 'OPTIONS') return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'86400'}});
    const reply = (body,status=200) => new Response(JSON.stringify(body),{status,headers});
    if (request.method !== 'GET') return reply({error:'Nur GET ist erlaubt.'},405);
    if (clientIP) { const now=Date.now(),old=visitors.get(clientIP);const item=old && now-old.at<60000?old:{at:now,count:0};item.count++;if(visitors.size>1000)visitors.delete(visitors.keys().next().value);visitors.set(clientIP,item);if(item.count>120)return reply({error:'Zu viele Abfragen. Bitte eine Minute warten.'},429); }
    const url = new URL(request.url), path = url.pathname.replace(/^\/api/, '');
    if (url.search.length > 8000) return reply({error:'Anfrage zu lang.'},400);
    try {
      if (path === '/health') return reply({ok:true,service:'Port. Market API',version:1,providers:['Yahoo Finance (öffentliche Schnittstelle)','CoinGecko','Google News RSS']});
      if (path === '/fx') return reply(await service.fx());
      if (path === '/quotes') {
        const keys = [...new Set((url.searchParams.get('assets') || '').split(','))];
        const assets = keys.map(key => { const [type,id,...extra]=key.split(':');return {type,id,extra}; });
        if (!assets.length || assets.length>30 || assets.some(a => !a.id || a.extra.length || !(a.type==='stock'?stockPattern.test(a.id):a.type==='crypto' && coinPattern.test(a.id)))) return reply({error:'Bitte 1 bis 30 gültige Assets übergeben.'},400);
        return reply(await service.quotes(assets));
      }
      if (path === '/search') {
        const q=(url.searchParams.get('q')||'').trim(),type=url.searchParams.get('type');
        if(q.length<2 || q.length>80 || !['stock','crypto'].includes(type)) return reply({error:'Ungültige Suchanfrage.'},400);
        return reply({assets:await service.search(q,type)});
      }
      if (path === '/news') {
        const symbols=[...new Set((url.searchParams.get('symbols')||'').split(',').filter(Boolean))];
        if(!symbols.length || symbols.length>15 || symbols.some(s=>!stockPattern.test(s)))return reply({error:'Bitte 1 bis 15 gültige Kürzel übergeben.'},400);
        let names;try{names=JSON.parse(url.searchParams.get('names')||'{}');}catch{return reply({error:'Ungültige Asset-Namen.'},400);}
        if(!names || Array.isArray(names) || typeof names!=='object' || Object.keys(names).some(s=>!symbols.includes(s) || typeof names[s]!=='string' || names[s].length>100))return reply({error:'Ungültige Asset-Namen.'},400);
        return reply(await service.news(symbols,names));
      }
      return reply({error:'Endpunkt nicht gefunden.'},404);
    } catch { return reply({error:'Datenanbieter momentan nicht erreichbar. Bereits geladene Daten können veraltet sein.'},503); }
  };
}
