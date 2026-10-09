import test from 'node:test';
import assert from 'node:assert/strict';
import { newsHosting, newsRequestUrl } from '../src/hosting.js';

test('GitHub Pages does not advertise a nonexistent local news API', () => {
  assert.deepEqual(newsHosting({mode:'pages'}), {staticSite:true,available:false,endpoint:null});
  assert.throws(() => newsRequestUrl(null,'NVDA'), /Nachrichtendienst/);
});

test('development and production retain the same-origin news API', () => {
  assert.deepEqual(newsHosting({mode:'production'}), {staticSite:false,available:true,endpoint:'/api/news'});
  assert.equal(newsRequestUrl('/api/news','NVDA,AAPL'), '/api/news?symbols=NVDA%2CAAPL');
});

test('Pages can use an explicitly configured HTTPS service', () => {
  const config=newsHosting({mode:'pages',apiUrl:'https://feed.example.com/api/news'});
  assert.equal(config.available,true);
  assert.equal(newsRequestUrl(config.endpoint,'NVDA,AAPL'),'https://feed.example.com/api/news?symbols=NVDA%2CAAPL');
  for (const value of ['http://feed.example.com/api/news','https://user:pass@feed.example.com/api/news','https://feed.example.com/api/news?token=secret','https://feed.example.com/api/news#token']) {
    assert.throws(() => newsHosting({mode:'pages',apiUrl:value}), /HTTPS/);
  }
});
