import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePosition,positionMetrics,portfolioMetrics,liquidationThreshold,parsePositionsCSV,migratePortfolio,fxConvert } from '../src/positions.js';
const spot = extra => validatePosition({symbol:'AAPL',entryPrice:100,quantity:2,currency:'USD',...extra});
const margin = extra => validatePosition({symbol:'BTC',assetType:'crypto',assetId:'bitcoin',currency:'EUR',entryPrice:100,kind:'margin',margin:100,leverage:5,liquidationMode:'estimate',maintenanceRate:0.5,...extra});
const quote = (price,currency='EUR') => ({price,currency,marketTime:new Date().toISOString(),fetchedAt:new Date().toISOString()});
const fx={rates:{USD:2,GBP:0.8},date:'2026-10-08'};
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-8,`${a} differs from ${b}`);

test('spot profit uses entry and verified market currency before EUR aggregation',()=>{
  const m=positionMetrics(spot(),quote(60),fx);
  near(m.price,120);near(m.pnl,40);near(m.equityEUR,120);near(m.pnlEUR,20);near(m.returnPct,20);
});
test('isolated margin equity is collateral plus directional PnL, rather than gross exposure',()=>{
  const long=positionMetrics(margin(),quote(110),fx),short=positionMetrics(margin({direction:'short'}),quote(110),fx);
  near(long.equityEUR,150);near(long.notionalEUR,550);near(long.returnPct,50);near(short.equityEUR,50);near(short.pnlEUR,-50);
});
test('both estimated thresholds satisfy the maintenance-equity equation',()=>{
  for(const direction of ['long','short']){
    const p=margin({direction}),threshold=liquidationThreshold(p);
    const equity=p.margin+(direction==='long'?1:-1)*p.quantity*(threshold.price-p.entryPrice);
    near(equity,p.maintenanceRate*p.quantity*threshold.price);
    const m=positionMetrics(p,quote(threshold.price),fx);near(m.buffer,0);assert.equal(m.crossed,true);
  }
});
test('manual liquidation takes precedence; omitted manual threshold never invents one',()=>{
  const p=margin({liquidationMode:'manual',liquidationPrice:92});assert.deepEqual(liquidationThreshold(p),{price:92,estimated:false});
  assert.equal(liquidationThreshold(margin({liquidationMode:'manual'})),null);
  assert.equal(positionMetrics(p,quote(94),fx).risk,'near');assert.equal(positionMetrics(p,quote(91),fx).risk,'crossed');
  assert.equal(positionMetrics(margin({direction:'short',liquidationMode:'manual',liquidationPrice:120}),quote(118),fx).risk,'near');
});
test('missing price and FX remain unknown, and partial totals include only valued positions',()=>{
  const positions=[spot(),spot({symbol:'MSFT',currency:'EUR'})];
  assert.equal(positionMetrics(spot(),null,fx).equityEUR,null);assert.equal(positionMetrics(spot(),quote(110,'USD'),null).equityEUR,null);
  assert.equal(fxConvert(1,'CAD','EUR',fx),null);
  const m=portfolioMetrics(positions,{'stock:MSFT':quote(110)},null);assert.equal(m.total,220);assert.equal(m.valuedCount,1);assert.equal(m.complete,false);
});
test('stale cached quotes retain their old fetch time and are visibly marked',()=>{
  const q={...quote(90),fetchedAt:new Date(Date.now()-240000).toISOString()};assert.equal(positionMetrics(margin(),q,fx).stale,true);
});
test('rejects invalid sizes, excess leverage, ambiguous crypto IDs and impossible maintenance',()=>{
  for(const extra of [{quantity:-2},{entryPrice:0},{currency:'XYZ'},{symbol:'<script>'}])assert.throws(()=>spot(extra));
  for(const extra of [{leverage:501},{leverage:0.5},{margin:0},{maintenanceRate:20},{maintenanceRate:-1},{assetId:''}])assert.throws(()=>margin(extra));
});
test('CSV combines spot entries at a weighted cost while preserving separate margin trades',()=>{
  const rows=parsePositionsCSV('symbol,quantity,price,currency,asset_type,coin_id,kind,margin,leverage,liquidation_price\nAAPL,2,100,USD,stock,,spot,,,\nAAPL,3,200,USD,stock,,spot,,,\nBTC,,100,EUR,crypto,bitcoin,margin,50,5,85\nBTC,,100,EUR,crypto,bitcoin,margin,60,3,70','Revolut');
  assert.equal(rows.length,3);assert.equal(rows[0].quantity,5);assert.equal(rows[0].entryPrice,160);assert.equal(rows[1].quantity,2.5);assert.equal(rows[2].liquidationPrice,70);
  assert.throws(()=>parsePositionsCSV('symbol,quantity,price\nAAPL,-2,100','Manuell'),/Zeile 2/);
});
test('migration removes old demo portfolios and round-trips real leverage without changing maintenance',()=>{
  assert.deepEqual(migratePortfolio(null),[]);assert.deepEqual(migratePortfolio({demo:true,holdings:[spot()]}),[]);
  const p=margin();assert.deepEqual(migratePortfolio({version:2,holdings:[p]}),[p]);
  const legacy=migratePortfolio({demo:false,holdings:[{symbol:'AAPL',quantity:2,price:100,broker:'Fomo'}]});assert.equal(legacy[0].currency,'EUR');assert.equal(legacy[0].entryPrice,100);
});
