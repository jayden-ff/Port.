import { parseNumber, companyNames } from './portfolio.js';
import Papa from 'papaparse';

export const cryptoAssets = [
  { symbol:'BTC', id:'bitcoin', name:'Bitcoin' }, { symbol:'ETH', id:'ethereum', name:'Ethereum' },
  { symbol:'SOL', id:'solana', name:'Solana' }, { symbol:'XRP', id:'ripple', name:'XRP' },
  { symbol:'ADA', id:'cardano', name:'Cardano' }, { symbol:'DOGE', id:'dogecoin', name:'Dogecoin' },
  { symbol:'AVAX', id:'avalanche-2', name:'Avalanche' }, { symbol:'LINK', id:'chainlink', name:'Chainlink' },
  { symbol:'LTC', id:'litecoin', name:'Litecoin' }, { symbol:'DOT', id:'polkadot', name:'Polkadot' },
  { symbol:'USDC', id:'usd-coin', name:'USDC' }, { symbol:'USDT', id:'tether', name:'Tether' },
];
export const positionKey = p => `${p.assetType}:${p.assetType === 'crypto' ? p.assetId : p.symbol}`;
export const currencies = ['EUR','USD','GBP','CHF','CAD','AUD','JPY','HKD','SEK','NOK','DKK','CNY'];
const colors=['#76a35a','#81a5d3','#ce8c74','#d4ba78','#aa96c5'];
const number = (value,label) => {
  const n=parseNumber(value);
  if(!Number.isFinite(n) || n<=0 || n>1e12) throw new Error(`${label} muss eine Zahl größer als 0 sein (max. 1 Billion).`);
  return n;
};

export function validatePosition(input) {
  const symbol=String(input.symbol || '').trim().toUpperCase();
  if(!/^[A-Z0-9][A-Z0-9.^=-]{0,24}$/.test(symbol)) throw new Error('Bitte ein gültiges Börsenkürzel angeben.');
  const assetType=input.assetType || 'stock';
  if(!['stock','crypto'].includes(assetType)) throw new Error('Bitte Aktie oder Krypto auswählen.');
  const assetId=assetType==='crypto' ? String(input.assetId || '').trim().toLowerCase() : symbol;
  if(assetType==='crypto' && !/^[a-z0-9][a-z0-9._-]{0,100}$/.test(assetId)) throw new Error('Bitte eine Kryptowährung auswählen oder ihre CoinGecko-ID eintragen.');
  const currency=input.currency || 'EUR';
  if(!currencies.includes(currency)) throw new Error('Diese Positionswährung wird nicht unterstützt.');
  const entryPrice=number(input.entryPrice ?? input.price,'Einstiegskurs');
  const kind=input.kind || 'spot';
  if(!['spot','margin'].includes(kind)) throw new Error('Ungültiger Positionstyp.');
  const direction=kind==='margin' ? input.direction || 'long' : 'long';
  if(!['long','short'].includes(direction)) throw new Error('Bitte Long oder Short auswählen.');
  const leverage=kind==='margin' ? number(input.leverage,'Hebel') : 1;
  if(leverage<1 || leverage>500) throw new Error('Der Hebel muss zwischen 1 und 500 liegen.');
  const margin=kind==='margin' ? number(input.margin,'Sicherheitsleistung') : null;
  const quantity=kind==='margin' ? margin*leverage/entryPrice : number(input.quantity,'Anzahl');
  if(!Number.isFinite(quantity) || quantity*entryPrice>1e12) throw new Error('Der Positionswert ist zu groß.');
  const liquidationMode=kind==='margin' ? input.liquidationMode || 'manual' : 'none';
  if(!['none','manual','estimate'].includes(liquidationMode)) throw new Error('Ungültige Liquidationsberechnung.');
  const liquidationPrice=kind==='margin' && input.liquidationPrice!=='' && input.liquidationPrice!=null ? number(input.liquidationPrice,'Liquidationspreis') : null;
  const maintenanceRate=kind==='margin' && liquidationMode==='estimate' ? parseNumber(input.maintenanceRate ?? 0.5) / 100 : null;
  if(liquidationMode==='estimate' && (!Number.isFinite(maintenanceRate) || maintenanceRate<0 || maintenanceRate>=1/leverage)) throw new Error('Die Maintenance Margin muss kleiner als 100 / Hebel sein und darf nicht negativ sein.');
  return {
    id: input.id || globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    symbol,assetId,assetType,name:String(input.name || (assetType==='crypto' ? cryptoAssets.find(c=>c.id===assetId)?.name : companyNames[symbol]) || symbol).slice(0,100),
    broker:String(input.broker || 'Manuell').slice(0,80),currency,kind,direction,entryPrice,quantity,margin,leverage,
    liquidationMode,liquidationPrice,maintenanceRate,color:input.color || colors[symbol.charCodeAt(0)%colors.length],
  };
}

export function liquidationThreshold(position) {
  if(position.kind!=='margin') return null;
  if(position.liquidationMode==='manual') return position.liquidationPrice ? {price:position.liquidationPrice,estimated:false} : null;
  if(position.liquidationMode!=='estimate') return null;
  const m=position.maintenanceRate;
  if(!Number.isFinite(m) || m<0 || m>=1/position.leverage) return null;
  // Linear isolated position: collateral + d*q*(P-E) = maintenanceRate*q*P.
  // No cross collateral, funding, interest, maintenance tiers, fees or deductions.
  const price=position.direction==='long'
    ? position.entryPrice*(1-1/position.leverage)/(1-m)
    : position.entryPrice*(1+1/position.leverage)/(1+m);
  return {price,estimated:true};
}

export function fxConvert(amount,from,to,fx) {
  if(from===to) return amount;
  const source=from==='EUR' ? 1 : fx?.rates?.[from];
  const target=to==='EUR' ? 1 : fx?.rates?.[to];
  return source>0 && target>0 ? amount/source*target : null;
}

export function positionMetrics(position,quote,fx,now=Date.now()) {
  const threshold=liquidationThreshold(position);
  const price=quote?.price>0 ? fxConvert(quote.price,quote.currency,position.currency,fx) : null;
  const isPriced=price!==null && Number.isFinite(price);
  const cost=position.kind==='margin' ? position.margin : position.quantity*position.entryPrice;
  const pnl=isPriced ? (position.direction==='short' ? -1 : 1)*position.quantity*(price-position.entryPrice) : null;
  const equity=isPriced ? position.kind==='margin' ? position.margin+pnl : position.quantity*price : null;
  const equityEUR=equity===null ? null : fxConvert(equity,position.currency,'EUR',fx);
  const pnlEUR=pnl===null ? null : fxConvert(pnl,position.currency,'EUR',fx);
  const notionalEUR=isPriced ? fxConvert(position.quantity*price,position.currency,'EUR',fx) : null;
  const buffer=isPriced && threshold ? (position.direction==='short' ? threshold.price-price : price-threshold.price)/price*100 : null;
  const crossed=buffer!==null && buffer<=0;
  return {price,pnl,pnlEUR,equity,equityEUR,notionalEUR,cost,returnPct:pnl===null ? null : pnl/cost*100,threshold,buffer,crossed,
    stale:Boolean(quote && (!quote.fetchedAt || now-Date.parse(quote.fetchedAt)>180000)),
    // Spot quotes are indicative. A true liquidation uses the provider's mark/index price.
    risk:crossed ? 'crossed' : buffer!==null && buffer<5 ? 'near' : buffer!==null ? 'normal' : 'unknown',
  };
}

export function portfolioMetrics(positions,quotes,fx) {
  const rows=positions.map(position=>({position,quote:quotes[positionKey(position)],...positionMetrics(position,quotes[positionKey(position)],fx)}));
  const valued=rows.filter(r=>r.equityEUR!==null);
  return {rows,valuedCount:valued.length,total:valued.reduce((sum,r)=>sum+r.equityEUR,0),pnl:valued.reduce((sum,r)=>sum+(r.pnlEUR || 0),0),
    notional:rows.reduce((sum,r)=>sum+(r.notionalEUR || 0),0),complete:valued.length===positions.length,
    closest:rows.filter(r=>r.buffer!==null).sort((a,b)=>a.buffer-b.buffer)[0] || null};
}

export function migratePortfolio(raw) {
  if(!raw || raw.demo || !Array.isArray(raw.holdings)) return [];
  return raw.holdings.map(h=>{
    try {
      if(raw.version===2) return validatePosition({...h,maintenanceRate:h.maintenanceRate==null ? undefined : h.maintenanceRate*100});
      return validatePosition({...h,assetType:'stock',entryPrice:h.price,currency:'EUR',kind:'spot'});
    } catch { return null; }
  }).filter(Boolean);
}

export function parsePositionsCSV(text,broker) {
  const result=Papa.parse(text.trim(),{header:true,skipEmptyLines:'greedy',transformHeader:h=>h.replace(/^\uFEFF/,'').trim().toLowerCase()});
  if(result.errors.length) throw new Error(`CSV-Fehler: ${result.errors[0].message}`);
  if(!result.data.length || result.data.length>1000) throw new Error('Die CSV muss 1 bis 1.000 Positionen enthalten.');
  const rows=result.data.map((r,i)=>{
    try {
      return validatePosition({symbol:r.symbol || r.ticker,quantity:r.quantity || r.anzahl,entryPrice:r.entry_price || r.price || r.kurs,
        name:r.name,broker,currency:r.currency || 'EUR',assetType:r.asset_type || 'stock',assetId:r.coin_id,
        kind:r.kind || 'spot',direction:r.direction,margin:r.margin,leverage:r.leverage,liquidationMode:r.liquidation_mode || 'manual',
        liquidationPrice:r.liquidation_price,maintenanceRate:r.maintenance_margin});
    } catch(e){throw new Error(`Zeile ${i+2}: ${e.message}`);}
  });
  const combined=[];
  for(const p of rows) {
    const previous=p.kind==='spot' ? combined.find(c=>c.kind==='spot' && positionKey(c)===positionKey(p) && c.currency===p.currency) : null;
    if(previous) {
      const q=previous.quantity+p.quantity;
      previous.entryPrice=(previous.quantity*previous.entryPrice+p.quantity*p.entryPrice)/q;previous.quantity=q;
    } else combined.push(p);
  }
  if(combined.reduce((s,p)=>s+p.quantity*p.entryPrice,0)>1e12) throw new Error('Der Gesamtwert ist zu groß.');
  return combined;
}
