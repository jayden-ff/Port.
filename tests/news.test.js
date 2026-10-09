import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFeed, apiRouter } from '../server/news.js';

const xml = `<rss><channel>
<item><title>NVIDIA: neue KI-Chips - Testquelle</title><link>https://news.google.com/rss/articles/one</link><guid>one</guid><pubDate>Fri, 09 Oct 2026 12:00:00 GMT</pubDate><source>Testquelle</source></item>
<item><title>Apple meldet Quartalszahlen - Andere Quelle</title><link>https://news.google.com/rss/articles/two</link><guid>two</guid><pubDate>Fri, 09 Oct 2026 13:00:00 GMT</pubDate><source>Andere Quelle</source></item>
<item><title>EZB diskutiert Zinsen</title><link>https://news.google.com/rss/articles/three</link><guid>three</guid><pubDate>Fri, 09 Oct 2026 14:00:00 GMT</pubDate></item>
<item><title>Ein ganz anderes Thema</title><link>https://news.google.com/rss/articles/four</link><guid>four</guid><pubDate>Fri, 09 Oct 2026 14:00:00 GMT</pubDate></item>
</channel></rss>`;

test('normalizes actual RSS metadata, relevance, categories, and dates', () => {
  const items = normalizeFeed(xml, ['NVDA','AAPL']);
  assert.equal(items.length, 3);
  assert.equal(items[0].category, 'Makro');
  assert.deepEqual(items[0].symbols, ['NVDA','AAPL']);
  assert.equal(items[1].category, 'Quartalszahlen');
  assert.equal(items[1].source, 'Andere Quelle');
  assert.equal(items[2].title, 'NVIDIA: neue KI-Chips');
  assert.equal(items[2].publishedAt, '2026-10-09T12:00:00.000Z');
});

test('filters invalid URLs and dates and rejects non-RSS responses', () => {
  assert.equal(normalizeFeed(xml.replace('https://news.google.com/rss/articles/one','javascript:alert(1)'), ['NVDA']).length, 1);
  assert.equal(normalizeFeed(xml.replace('Fri, 09 Oct 2026 12:00:00 GMT','invalid'), ['NVDA']).length, 1);
  assert.throws(() => normalizeFeed('<html>Blocked</html>', ['NVDA']), /gültigen RSS/);
});

test('API rejects malformed ticker queries and unsupported methods before networking', async () => {
  const run = async (url, method='GET') => {
    const result = { statusCode:200, headers:{}, setHeader(k,v){ this.headers[k]=v; }, end(body){ this.body=body; } };
    await apiRouter({url,method},result);
    return result;
  };
  assert.equal((await run('/api/news?symbols=<script>')).statusCode,400);
  assert.equal((await run('/api/news?symbols=')).statusCode,400);
  assert.equal((await run('/api/news?symbols=NVDA','POST')).statusCode,405);
  assert.equal((await run(`/api/news?symbols=${Array.from({length:16},(_,i)=>`T${i}`).join(',')}`)).statusCode,400);
});
