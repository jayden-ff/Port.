import { XMLParser } from 'fast-xml-parser';
import { fetch, EnvHttpProxyAgent } from 'undici';
import { companyNames, matchSymbols } from '../src/portfolio.js';

const dispatcher = new EnvHttpProxyAgent();
const parser = new XMLParser({ ignoreAttributes: false, processEntities: true });
const cache = new Map();
const macroPattern = /\b(Fed|EZB|Zinsen|Zinssatz|Inflation|Notenbank|interest rates|central bank)\b/i;
const stripHTML = value => String(value || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

export function normalizeFeed(xml, symbols) {
  const parsed = parser.parse(xml);
  if (!parsed.rss?.channel) throw new Error('Der Nachrichtenanbieter hat keinen gültigen RSS-Feed geliefert.');
  let items = parsed.rss.channel.item || [];
  if (!Array.isArray(items)) items = [items];
  return items.map(item => {
    const title = stripHTML(item.title);
    const isMacro = macroPattern.test(title);
    const matched = isMacro ? symbols : matchSymbols(title, symbols.map(symbol => ({ symbol })));
    const link = String(item.link || '');
    const date = new Date(item.pubDate);
    if (!matched.length || !/^https:\/\//.test(link) || !Number.isFinite(date.getTime())) return null;
    const source = stripHTML(item.source?.['#text'] || item.source || 'Google News');
    return {
      id: String(item.guid?.['#text'] || item.guid || link),
      title: title.endsWith(` - ${source}`) ? title.slice(0, -(source.length + 3)) : title,
      summary: 'Aktuelle Meldung zu deinen Positionen. Den vollständigen Artikel findest du bei der Originalquelle.',
      body: 'Diese Meldung wurde über den Google-News-RSS-Index abgerufen. Die Zuordnung basiert auf Unternehmen und Börsenkürzeln im Titel; Makromeldungen werden dem gesamten Portfolio zugeordnet. Öffne die Quelle für den vollständigen Kontext.',
      source, url: link, publishedAt: date.toISOString(), symbols: matched,
      category: isMacro ? 'Makro' : /quartal|earnings|ergebnis|umsatz/i.test(title) ? 'Quartalszahlen' : 'Unternehmen',
      tone: 'Neue Meldung', image: 'news',
    };
  }).filter(Boolean).filter((item, i, all) => all.findIndex(other => other.id === item.id) === i).sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

export async function getNews(symbols) {
  const key = [...symbols].sort().join(',');
  const cached = cache.get(key);
  if (cached && Date.now() - cached.createdAt < 55000) return cached.payload;
  const terms = symbols.map(symbol => `"${companyNames[symbol] || symbol}"`).join(' OR ');
  const url = new URL('https://news.google.com/rss/search');
  url.search = new URLSearchParams({ q: `(${terms} OR "EZB" OR "Fed Zinsen") when:2d`, hl: 'de', gl: 'DE', ceid: 'DE:de' }).toString();
  const response = await fetch(url, { dispatcher, signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'Port-Portfolio-News/0.1', Accept: 'application/rss+xml, application/xml' } });
  if (!response.ok) throw new Error(`Nachrichtenanbieter antwortet mit HTTP ${response.status}.`);
  const xml = await response.text();
  if (xml.length > 2000000) throw new Error('Der RSS-Feed ist zu groß.');
  const payload = { articles: normalizeFeed(xml, symbols), fetchedAt: new Date().toISOString(), provider: 'Google News RSS', refreshSeconds: 60, coveredSymbols: symbols };
  if (cache.size >= 100) cache.delete(cache.keys().next().value);
  cache.set(key, { createdAt: Date.now(), payload });
  return payload;
}

export async function apiRouter(req, res, next) {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname !== '/api/news') return next?.();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.statusCode = 405; res.setHeader('Allow','GET'); res.end(JSON.stringify({ error: 'Nur GET ist erlaubt.' })); return; }
  const symbols = [...new Set((url.searchParams.get('symbols') || '').split(',').filter(Boolean))];
  if (!symbols.length || symbols.length > 15 || symbols.some(s => !/^[A-Z0-9][A-Z0-9.^=-]{0,14}$/.test(s))) {
    res.statusCode = 400; res.end(JSON.stringify({ error: 'Bitte übergib 1 bis 15 gültige Börsenkürzel.' })); return;
  }
  try { res.end(JSON.stringify(await getNews(symbols))); }
  catch {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'Der Live-Feed ist momentan nicht erreichbar. Bitte prüfe die Freigabe für news.google.com oder versuche es später erneut.' }));
  }
}
