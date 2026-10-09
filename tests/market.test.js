import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeYahooQuote,createMarketService,createAPI,normalizeFeed } from '../server/market.js';
const data={chart:{result:[{meta:{regularMarketPrice:120,regularMarketTime:1791547200,currency:'USD',chartPreviousClose:100}}]}};
const response=value=>new Response(JSON.stringify(value));

test('Yahoo quotes preserve native currency, actual market time and pence scaling',()=>{
  const q=normalizeYahooQuote(data);assert.equal(q.price,120);assert.equal(q.currency,'USD');assert.ok(Math.abs(q.change24h-20)<1e-8);assert.equal(q.marketTime,'2026-10-09T12:00:00.000Z');
  const penny=normalizeYahooQuote({chart:{result:[{meta:{...data.chart.result[0].meta,currency:'GBp'}}]}});assert.equal(penny.price,1.2);assert.equal(penny.currency,'GBP');
  assert.throws(()=>normalizeYahooQuote({chart:{result:[]}}));assert.throws(()=>normalizeYahooQuote({chart:{result:[{meta:{...data.chart.result[0].meta,currency:null}}]}}));
});
test('backend caches individual quotes and coalesces concurrent requests',async()=>{
  let calls=0;const service=createMarketService(async()=>{calls++;return response(data);});
  const asset=[{type:'stock',id:'AAPL'}];const [a,b]=await Promise.all([service.quotes(asset),service.quotes(asset)]);
  assert.equal(calls,1);assert.equal(a.quotes['stock:AAPL'].price,120);assert.deepEqual(a,b);await service.quotes(asset);assert.equal(calls,1);
});
test('upstream failures preserve successful quotes with explicit per-asset errors',async()=>{
  const service=createMarketService(async url=>url.includes('/BAD?')?new Response('',{status:429}):response(data));
  const r=await service.quotes([{type:'stock',id:'AAPL'},{type:'stock',id:'BAD'}]);assert.equal(r.quotes['stock:AAPL'].price,120);assert.match(r.errors['stock:BAD'],/Limit/);assert.equal(r.quotes['stock:BAD'],undefined);
});
test('API validates inputs, uses exact-origin CORS, bounds requests and permits preflight',async()=>{
  let calls=0;const handle=createAPI({quotes:async()=>{calls++;return {quotes:{},errors:{}}},news:async()=>({articles:[]})});
  const run=(path,origin='https://jayden-ff.github.io',method='GET')=>handle(new Request(`https://api.example.com${path}`,{method,headers:{Origin:origin}}));
  const good=await run('/quotes?assets=stock:AAPL');assert.equal(good.status,200);assert.equal(good.headers.get('Access-Control-Allow-Origin'),'https://jayden-ff.github.io');
  assert.equal((await run('/health','https://jayden-ff.github.io.evil.test')).status,403);assert.equal((await run('/health',undefined,'OPTIONS')).status,204);
  for(const path of ['/quotes?assets=crypto:','/quotes?assets=stock:AAPL:extra','/quotes?assets=stock:https://evil.test','/news?symbols=','/news?symbols=AAPL&names=invalid','/news?symbols=AAPL&names=[]','/search?type=other&q=Apple'])assert.equal((await run(path)).status,400,path);
  assert.equal(calls,1);assert.equal((await run('/health',undefined,'POST')).status,405);
});
test('in-isolate request limit restricts bursts without affecting other visitors',async()=>{
  const handle=createAPI({});for(let i=0;i<120;i++)assert.equal((await handle(new Request('https://api.test/health'),'ip-one')).status,200);
  assert.equal((await handle(new Request('https://api.test/health'),'ip-one')).status,429);assert.equal((await handle(new Request('https://api.test/health'),'ip-two')).status,200);
});
test('RSS matches explicit crypto names and refuses XML entity declarations',()=>{
  const xml='<rss><channel><item><title>Ethereum update</title><link>https://example.com/news</link><pubDate>Fri, 09 Oct 2026 12:00:00 GMT</pubDate></item></channel></rss>';
  assert.equal(normalizeFeed(xml,['ETH'],{ETH:'Ethereum'})[0].symbols[0],'ETH');assert.throws(()=>normalizeFeed('<!DOCTYPE rss [<!ENTITY xx "bad">]>'+xml,['ETH']),/Ungültiger/);
});
test('RSS entity decoding preserves readable titles, source names and original query strings',()=>{
  const xml='<rss><channel><item><title>Apple &amp; NVIDIA - A&amp;B</title><link>https://example.com/news?a=1&amp;b=2</link><pubDate>Fri, 09 Oct 2026 12:00:00 GMT</pubDate><source url="https://example.com">A&amp;B</source></item></channel></rss>';
  const [a]=normalizeFeed(xml,['AAPL','NVDA']);assert.equal(a.title,'Apple & NVIDIA');assert.equal(a.source,'A&B');assert.equal(a.url,'https://example.com/news?a=1&b=2');assert.deepEqual(a.symbols,['AAPL','NVDA']);
});
test('provider failures pause repeated upstream requests and respect Retry-After',async()=>{
  let calls=0;const service=createMarketService(async()=>{calls++;return new Response('',{status:429,headers:{'Retry-After':'120'}});});
  const asset=[{type:'stock',id:'AAPL'}];const first=await service.quotes(asset);const second=await service.quotes(asset);
  assert.equal(calls,1);assert.match(first.errors['stock:AAPL'],/Limit/);assert.deepEqual(second,first);assert.deepEqual(second.quotes,{});
});
