import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePortfolioCSV, parseNumber, matchSymbols, validateHolding, totalValue, relevanceScore } from '../src/portfolio.js';

test('imports quoted decimal values, German headers, and semicolon delimiters', () => {
  const holdings = parsePortfolioCSV('\uFEFFticker;anzahl;kurs\nNVDA;10;"142,87"\nAAPL;2;"1.234,56"', 'Revolut');
  assert.equal(holdings.length, 2);
  assert.equal(holdings[0].quantity, 10);
  assert.equal(holdings[0].price, 142.87);
  assert.equal(holdings[1].price, 1234.56);
  assert.equal(holdings[1].broker, 'Revolut');
});

test('merges duplicate positions with their weighted price, preserving total value', () => {
  const holdings = parsePortfolioCSV('symbol,quantity,price\nNVDA,10,100\nNVDA,20,130', 'Robinhood');
  assert.equal(holdings.length, 1);
  assert.equal(holdings[0].quantity, 30);
  assert.equal(holdings[0].price, 120);
  assert.equal(totalValue(holdings), 3600);
});

test('rejects missing columns, broken CSV, zero, negative and nonfinite positions', () => {
  assert.throws(() => parsePortfolioCSV('symbol,quantity\nNVDA,10', 'Fomo'), /Spalten/);
  assert.throws(() => parsePortfolioCSV('symbol,quantity,price\nNVDA,0,100', 'Fomo'), /Zeile 2/);
  assert.throws(() => parsePortfolioCSV('symbol,quantity,price\nNVDA,-1,100', 'Fomo'), /größer/);
  assert.throws(() => parsePortfolioCSV('symbol,quantity,price\nNVDA,Infinity,100', 'Fomo'), /größer/);
  assert.throws(() => parsePortfolioCSV('symbol,quantity,price\n"NVDA,10,100', 'Fomo'), /CSV/);
  assert.throws(() => validateHolding('<script>', 2, 100, 'Fomo'), /Börsenkürzel/);
  assert.throws(() => validateHolding('NVDA', 1e12, 100, 'Fomo'), /zu groß/);
});

test('handles English and German decimal/thousands formats without silently ignoring garbage', () => {
  assert.equal(parseNumber('1,234.56'), 1234.56);
  assert.equal(parseNumber('1.234,56 €'), 1234.56);
  assert.equal(parseNumber('100,25'), 100.25);
  assert.ok(Number.isNaN(parseNumber('100oops')));
  assert.ok(Number.isNaN(parseNumber('')));
});

test('matches companies and ticker boundaries without substring false positives', () => {
  const positions = [{ symbol:'NVDA' },{ symbol:'AAPL' },{ symbol:'V' }];
  assert.deepEqual(matchSymbols('NVIDIA und AAPL melden Ergebnisse', positions), ['NVDA','AAPL']);
  assert.deepEqual(matchSymbols('Ein Vektor bewegt Märkte', positions), []);
  assert.deepEqual(matchSymbols('Visa meldet Zahlen', positions), ['V']);
});

test('ranks larger affected portfolio shares higher without division by zero', () => {
  const positions = [{ symbol: 'AAPL', quantity: 1, price: 200 }, { symbol: 'NVDA', quantity: 10, price: 100 }];
  assert.ok(relevanceScore({symbols:['NVDA']}, positions) > relevanceScore({symbols:['AAPL']}, positions));
  assert.equal(relevanceScore({symbols:['NVDA','AAPL']}, positions), 99);
  assert.equal(relevanceScore({symbols:['NVDA']}, []), 55);
});
