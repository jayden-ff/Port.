import Papa from 'papaparse';

export const companyNames = { NVDA: 'NVIDIA', AAPL: 'Apple', MSFT: 'Microsoft', TSLA: 'Tesla', AMZN: 'Amazon', GOOGL: 'Alphabet', META: 'Meta', AMD: 'AMD', SAP: 'SAP', BTC: 'Bitcoin', V: 'Visa', NFLX: 'Netflix', ASML: 'ASML', SPY: 'S&P 500 ETF', VWCE: 'FTSE All-World ETF' };
export const demoHoldings = [
  { symbol: 'NVDA', name: 'NVIDIA', quantity: 120, price: 142.87, change: 3.42, broker: 'Trade Republic', color: '#76a35a' },
  { symbol: 'AAPL', name: 'Apple', quantity: 50, price: 224.72, change: 1.18, broker: 'Trade Republic', color: '#7f8a94' },
  { symbol: 'MSFT', name: 'Microsoft', quantity: 25, price: 428.52, change: 0.86, broker: 'Revolut', color: '#81a5d3' },
  { symbol: 'TSLA', name: 'Tesla', quantity: 20, price: 248.5, change: -1.24, broker: 'Robinhood', color: '#ce8c74' },
  { symbol: 'AMZN', name: 'Amazon', quantity: 20, price: 186.3, change: 1.72, broker: 'Revolut', color: '#d4ba78' },
];
const colors = ['#76a35a', '#81a5d3', '#ce8c74', '#d4ba78', '#aa96c5'];
export const euro = (value, decimals = 2) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
export const totalValue = holdings => holdings.reduce((sum, h) => sum + h.quantity * h.price, 0);

export function parseNumber(value) {
  let text = String(value ?? '').trim().replace(/[€$£\s]/g, '');
  if (!text) return NaN;
  if (text.includes(',') && text.includes('.')) text = text.lastIndexOf(',') > text.lastIndexOf('.') ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, '');
  else if (text.includes(',')) text = text.replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return NaN;
  return Number(text);
}

export function validateHolding(symbol, quantity, price, broker) {
  symbol = String(symbol).trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9.^=-]{0,14}$/.test(symbol)) throw new Error('Bitte verwende ein gültiges Börsenkürzel, z. B. NVDA.');
  quantity = parseNumber(quantity); price = parseNumber(price);
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Die Anzahl muss größer als 0 sein.');
  if (!Number.isFinite(price) || price <= 0) throw new Error('Der Kurs muss größer als 0 sein.');
  if (!Number.isFinite(quantity * price) || quantity * price > 1e12) throw new Error('Der Positionswert ist zu groß.');
  return { symbol, name: companyNames[symbol] || symbol, quantity, price, broker, color: colors[symbol.charCodeAt(0) % colors.length] };
}

export function parsePortfolioCSV(text, broker) {
  const result = Papa.parse(text.trim(), { header: true, skipEmptyLines: 'greedy', transformHeader: h => h.replace(/^\uFEFF/, '').trim().toLowerCase() });
  if (result.errors.length) throw new Error(`CSV konnte nicht gelesen werden: ${result.errors[0].message}`);
  if (!result.data.length) throw new Error('Die Datei enthält keine Positionen.');
  if (result.data.length > 1000) throw new Error('Bitte importiere höchstens 1.000 Zeilen pro Datei.');
  const header = result.meta.fields || [];
  const field = names => names.find(name => header.includes(name));
  const symbol = field(['symbol', 'ticker', 'kürzel', 'kuerzel']);
  const quantity = field(['quantity', 'shares', 'anzahl', 'stück', 'stueck']);
  const price = field(['price', 'kurs', 'preis']);
  if (!symbol || !quantity || !price) throw new Error('Benötigte Spalten: symbol, quantity, price (oder ticker, anzahl, kurs). Alle Kurse bitte in EUR.');
  const rows = result.data.map((row, index) => {
    try { return validateHolding(row[symbol], row[quantity], row[price], broker); }
    catch (error) { throw new Error(`Zeile ${index + 2}: ${error.message}`); }
  });
  const merged = new Map();
  for (const holding of rows) {
    const previous = merged.get(holding.symbol);
    if (previous) {
      const quantity = previous.quantity + holding.quantity;
      previous.price = (previous.price * previous.quantity + holding.price * holding.quantity) / quantity;
      previous.quantity = quantity;
    } else merged.set(holding.symbol, { ...holding });
  }
  const holdings = [...merged.values()];
  if (!Number.isFinite(totalValue(holdings)) || totalValue(holdings) > 1e12) throw new Error('Der Gesamtwert des Portfolios ist zu groß.');
  return holdings;
}

export function matchSymbols(text, holdings) {
  const lower = text.toLowerCase();
  return [...new Set(holdings.filter(h => {
    const name = companyNames[h.symbol];
    const escaped = h.symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return (name && lower.includes(name.toLowerCase())) || new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(text);
  }).map(h => h.symbol))];
}

export function relevanceScore(article, holdings) {
  const total = totalValue(holdings);
  const weight = holdings.filter(h => article.symbols.includes(h.symbol)).reduce((sum, h) => sum + h.quantity * h.price, 0) / (total || 1);
  return Math.min(99, Math.round(55 + weight * 44));
}
