import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBackend,getQuotes,getPortfolioNews } from '../src/providers.js';
test('shared backend configuration accepts HTTPS without tokens and the local API',()=>{
  assert.equal(validateBackend('https://service.example.com/'),'https://service.example.com');assert.equal(validateBackend('/api'),'/api');
  for(const url of ['http://service.example.com','https://user:password@service.example.com','https://service.example.com?token=secret','https://service.example.com#secret'])assert.throws(()=>validateBackend(url));
});
test('quote requests send only asset identifiers and preserve successful chunks on a partial outage',async()=>{
  const original=globalThis.fetch;let calls=0;const urls=[];
  globalThis.fetch=async url=>{urls.push(url);calls++;if(calls===2)return new Response(JSON.stringify({error:'Outage'}),{status:503});const assets=new URL(url).searchParams.get('assets').split(',');return new Response(JSON.stringify({quotes:Object.fromEntries(assets.map(key=>[key,{price:100,currency:'USD'}])),errors:{}}));};
  try{
    const positions=Array.from({length:31},(_,i)=>({symbol:`T${i}`,assetType:'stock',quantity:999,entryPrice:1234,margin:9876,broker:'Private broker'}));
    const result=await getQuotes(positions,'https://api.example.com');assert.equal(calls,2);assert.equal(Object.keys(result.quotes).length,30);assert.equal(result.errors['stock:T30'],'Outage');
    for(const url of urls)assert.deepEqual([...new URL(url).searchParams.keys()],['assets']);
  }finally{globalThis.fetch=original;}
});
test('large-portfolio news requests merge the symbols of duplicate macro articles',async()=>{
  const original=globalThis.fetch;let calls=0;
  globalThis.fetch=async url=>{calls++;const symbols=new URL(url).searchParams.get('symbols').split(',');return new Response(JSON.stringify({articles:[{id:'macro',title:'EZB',symbols,publishedAt:'2026-10-09T12:00:00.000Z'}],fetchedAt:'2026-10-09T12:00:00.000Z'}));};
  try{const r=await getPortfolioNews(Array.from({length:16},(_,i)=>({symbol:`T${i}`,name:`Company ${i}`})),'https://api.example.com');assert.equal(calls,2);assert.equal(r.articles.length,1);assert.equal(r.articles[0].symbols.length,16);}finally{globalThis.fetch=original;}
});
