import { useState, useEffect, useRef, useMemo, useCallback, useId } from 'react';
import { motion, AnimatePresence, useReducedMotion, MotionConfig } from 'framer-motion';
import { ArrowUpRight, ArrowRight, Plus, LayoutDashboard, BriefcaseBusiness, Bookmark, Settings2, Search, Bell, ChevronDown, ChevronRight, X, Check, Upload, FileText, Radio, RefreshCw, Menu, SlidersHorizontal, Globe2, ExternalLink, ShieldCheck, CircleHelp, CheckCircle2, Leaf, Sparkles, Activity, Layers, LoaderCircle, Download } from 'lucide-react';
import { demoHoldings, euro, totalValue, parsePortfolioCSV, validateHolding, relevanceScore } from './portfolio.js';
import { demoNews, brokers } from './data.js';
import { newsHosting, newsRequestUrl } from './hosting.js';

const hosting = newsHosting({ mode: import.meta.env.MODE, apiUrl: import.meta.env.VITE_NEWS_API_URL });

const storage = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(`port:${key}`)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(`port:${key}`, JSON.stringify(value)); } catch { /* Browsers may disable local storage. */ } },
};
function loadPortfolio() {
  const value = storage.get('portfolio', null);
  if (!value || typeof value.demo !== 'boolean' || !Array.isArray(value.holdings) || !value.holdings.length) return { demo: true, holdings: demoHoldings };
  try { return { demo: value.demo, holdings: value.holdings.map(h => ({ ...validateHolding(h.symbol, h.quantity, h.price, h.broker || 'Manuell'), ...(value.demo ? { change: h.change } : {}) })) }; }
  catch { return { demo: true, holdings: demoHoldings }; }
}
const newsAge = article => article.publishedAt ? Math.max(0, Math.floor((Date.now() - new Date(article.publishedAt)) / 60000)) : article.minutes;
function timeLabel(article) {
  const minutes = newsAge(article);
  return minutes < 1 ? 'gerade eben' : minutes < 60 ? `vor ${minutes} Min.` : minutes < 1440 ? `vor ${Math.floor(minutes / 60)} Std.` : `vor ${Math.floor(minutes / 1440)} Tagen`;
}

function Brand({ compact = false }) {
  return <div className={`brand ${compact ? 'compact' : ''}`}><span className="brand-symbol"><span /><span /><span /></span><span>port<span className="brand-dot">.</span></span></div>;
}
function BrokerMark({ name, small = false }) {
  const broker = brokers.find(b => b.name === name) || brokers[4];
  return <span className={`broker-mark ${small ? 'small' : ''} ${name === 'Robinhood' || name === 'Fomo' || name === 'Andere Quelle' ? 'light' : ''}`} style={{ background: broker.color }}>{name === 'Robinhood' ? <Leaf size={small ? 11 : 18} strokeWidth={2.2} /> : broker.mark}</span>;
}
function CompanyMark({ symbol, small = false }) {
  const labels = { NVDA: 'N', AAPL: 'a', MSFT: '▦', TSLA: 'T', AMZN: 'a', META: '∞', GOOGL: 'G', BTC: '₿' };
  return <span className={`company-mark ${symbol.toLowerCase()} ${small ? 'small' : ''}`}>{labels[symbol] || symbol.slice(0, 2)}</span>;
}

function Modal({ title, subtitle, onClose, children, wide = false }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector('button, input, select, [tabindex="0"]')?.focus();
    function onKey(event) {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const elements = [...ref.current.querySelectorAll('button:not([disabled]), input:not([disabled]), select, a[href], [tabindex="0"]')];
      const first = elements[0], last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = originalOverflow; document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [onClose]);
  return <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <motion.section ref={ref} className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId} initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: 0.98 }} transition={{ duration: 0.25 }} onClick={e => e.stopPropagation()}>
      <button className="icon-button modal-close" aria-label="Schließen" onClick={onClose}><X size={20} /></button>
      <span className="eyebrow">DEIN PORT. DEIN KONTEXT.</span><h2 id={titleId}>{title}</h2>{subtitle && <p className="modal-subtitle">{subtitle}</p>}{children}
    </motion.section>
  </motion.div>;
}

function ImportModal({ onClose, onImport, initialBroker }) {
  const [broker, setBroker] = useState(initialBroker || 'Trade Republic');
  const [tab, setTab] = useState('csv');
  const [error, setError] = useState('');
  const [pending, setPending] = useState([]);
  const [filename, setFilename] = useState('');
  const [reading, setReading] = useState(false);
  const inputRef = useRef(null);
  const [manual, setManual] = useState({ symbol: '', quantity: '', price: '' });
  async function readFile(file) {
    setError(''); setPending([]); setFilename('');
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Die CSV-Datei darf höchstens 2 MB groß sein.'); return; }
    setReading(true);
    try { setPending(parsePortfolioCSV(await file.text(), broker)); setFilename(file.name); }
    catch (error) { setError(error.message); }
    finally { setReading(false); }
  }
  function submit(event) {
    event.preventDefault(); setError('');
    try {
      const holdings = tab === 'csv' ? pending.map(h => ({ ...h, broker })) : [validateHolding(manual.symbol, manual.quantity, manual.price, broker)];
      if (!holdings.length) throw new Error('Bitte wähle zuerst eine CSV-Datei aus.');
      onImport(holdings, broker, tab === 'csv');
    } catch (error) { setError(error.message); }
  }
  return <Modal title="Alles an einem Ort." subtitle="Bring deine Positionen mit. Port. bringt den Kontext." onClose={onClose} wide>
    <form onSubmit={submit}>
      <label className="field-label">Wo liegt dein Portfolio?</label>
      <div className="broker-options">{brokers.map(b => <button type="button" key={b.name} className={`broker-option ${broker === b.name ? 'selected' : ''}`} onClick={() => setBroker(b.name)} aria-pressed={broker === b.name}><BrokerMark name={b.name} /><span>{b.name}</span>{broker === b.name && <Check size={15} />}</button>)}</div>
      <div className="segmented import-tabs">{[['csv', 'CSV importieren'], ['manual', 'Manuell hinzufügen']].map(([key, label]) => <button type="button" key={key} className={tab === key ? 'selected' : ''} onClick={() => { setTab(key); setError(''); }}>{label}</button>)}</div>
      {tab === 'csv' ? <>
        <input ref={inputRef} type="file" accept=".csv,text/csv" className="visually-hidden" aria-label="CSV-Datei auswählen" onChange={e => readFile(e.target.files?.[0])} />
        <button type="button" className={`upload-zone ${pending.length ? 'has-file' : ''}`} onClick={() => inputRef.current.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); readFile(e.dataTransfer.files[0]); }}>
          {reading ? <LoaderCircle className="spinning" size={28} /> : pending.length ? <CheckCircle2 size={28} /> : <Upload size={28} />}<strong>{filename || 'Deine CSV hier ablegen'}</strong><span>{pending.length ? `${pending.length} Positionen · ${euro(totalValue(pending))}` : 'oder klicken und Datei auswählen · max. 2 MB'}</span>
        </button>
        <div className="csv-help"><FileText size={16} /><span>Spalten: <code>symbol,quantity,price</code>. Kurse in EUR.</span><a href={`${import.meta.env.BASE_URL}portfolio-beispiel.csv`} download>Beispiel <Download size={13} /></a></div>
      </> : <div className="manual-fields"><label>Börsenkürzel<input autoComplete="off" placeholder="z. B. NVDA" value={manual.symbol} onChange={e => setManual({ ...manual, symbol: e.target.value })} required /></label><label>Anzahl<input inputMode="decimal" placeholder="z. B. 10" value={manual.quantity} onChange={e => setManual({ ...manual, quantity: e.target.value })} required /></label><label>Kurs in EUR<input inputMode="decimal" placeholder="z. B. 120,50" value={manual.price} onChange={e => setManual({ ...manual, price: e.target.value })} required /></label></div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="privacy-note"><ShieldCheck size={18} /><p>Stückzahlen und Kurse bleiben in diesem Browser. Beim Live-Abruf werden Firmennamen und Kürzel an den Nachrichtenindex gesendet. Die Anbieter dienen als Importquellen; eine direkte Depotverbindung ist noch nicht eingerichtet.</p></div>
      <div className="modal-footer"><span>{tab === 'csv' ? 'Ein Import ersetzt die Positionen dieser Quelle.' : 'Die Position wird deiner Quelle hinzugefügt.'}</span><button className="button primary" disabled={reading || (tab === 'csv' && !pending.length)}>{tab === 'csv' ? 'Portfolio importieren' : 'Position hinzufügen'}<ArrowRight size={16} /></button></div>
    </form>
  </Modal>;
}

const basePoints = [65, 66, 64, 71, 68, 73, 77, 74, 80, 85, 81, 78, 87, 85, 90, 86, 95, 100, 96, 103, 100, 108, 106, 104, 113, 117, 112, 115, 121, 118, 126, 121, 124, 128, 127, 134, 131, 138, 143, 138, 145, 141, 147, 144, 151, 149, 158, 155, 160, 158, 166, 162, 169, 166, 174, 170, 180, 176, 178, 187, 185, 192, 189, 197, 192, 201, 206, 203, 212, 208, 211, 214];
function PortfolioChart({ range, total }) {
  const reducedMotion = useReducedMotion();
  const [hover, setHover] = useState(null);
  const points = useMemo(() => basePoints.map((p, i) => p + (range === '1W' ? Math.sin(i * .7) * 13 : range === '1M' ? Math.sin(i * .3) * 6 : range === '1J' ? Math.sin(i * .4) * 8 : 0)), [range]);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i / (points.length - 1) * 640} ${205 - (p - 55) * 0.94}`).join(' ');
  const h = hover === null ? null : { x: hover / (points.length - 1) * 640, y: 205 - (points[hover] - 55) * .94 };
  const id = useId().replace(/:/g, '');
  return <div className="chart-area" onMouseLeave={() => setHover(null)}>
    <div className="chart-ylabels"><span>{euro(total * 1.06, 0)}</span><span>{euro(total * .94, 0)}</span><span>{euro(total * .82, 0)}</span></div>
    <svg viewBox="0 0 640 226" preserveAspectRatio="none" role="img" aria-label={`Beispielhafter Portfolioverlauf für ${range}, keine realen Kursdaten`} onMouseMove={e => { const rect = e.currentTarget.getBoundingClientRect(); setHover(Math.max(0, Math.min(points.length - 1, Math.round((e.clientX - rect.left) / rect.width * (points.length - 1))))); }}>
      <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#bbd5a1" stopOpacity=".32" /><stop offset="100%" stopColor="#bbd5a1" stopOpacity="0" /></linearGradient></defs>
      {[48, 126, 205].map(y => <line key={y} x1="0" x2="640" y1={y} y2={y} stroke="#e9ece5" strokeDasharray="3 5" />)}
      <path d={`${path} L 640 226 L 0 226 Z`} fill={`url(#${id})`} />
      <motion.path key={range} d={path} fill="none" stroke="#417b4f" strokeWidth="2.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" initial={reducedMotion ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reducedMotion ? 0 : 1.5, ease: 'easeInOut' }} />
      <circle cx="640" cy={205 - (points.at(-1) - 55) * .94} r="4" fill="#417b4f" />
      {h && <><line x1={h.x} x2={h.x} y1="12" y2="226" stroke="#72906f" strokeDasharray="4 4" /><circle cx={h.x} cy={h.y} r="5" fill="#417b4f" stroke="white" strokeWidth="3" /></>}
    </svg>
    {h && <div className="chart-tooltip" style={{ left: `${Math.min(80, h.x / 640 * 90)}%` }}><span>Beispielwert</span><strong>{euro(total * (.76 + hover / points.length * .24))}</strong></div>}
    <div className="chart-xlabels">{(range === '1W' ? ['Mo', 'Di', 'Mi', 'Do', 'Fr'] : range === '1M' ? ['01. Okt.', '08. Okt.', '15. Okt.', '22. Okt.', '31. Okt.'] : range === '1J' ? ['Jan', 'Mär', 'Jun', 'Sep', 'Dez'] : ['09:00', '11:00', '13:00', '15:00', '17:00']).map(s => <span key={s}>{s}</span>)}</div>
  </div>;
}
function NewsArt({ kind, big = false }) {
  return <div className={`news-art art-${kind} ${big ? 'big' : ''}`} aria-hidden="true">
    {kind === 'chip' ? <><div className="circuit circuit-one" /><div className="circuit circuit-two" /><div className="circuit circuit-three" /><div className="chip"><span className="chip-eye">◉</span><span>NVIDIA</span><small>THE NEXT WAVE</small></div><div className="art-orb" /></> : kind === 'apple' ? <><div className="apple-device"><span>◒</span></div><div className="apple-device second"><span>◒</span></div></> : kind === 'macro' ? <><div className="macro-column" /><div className="macro-column" /><div className="macro-column" /><div className="macro-column" /><div className="macro-roof" /><span className="macro-label">THE BIG PICTURE</span></> : kind === 'cloud' ? <><div className="cloud-orb" /><span className="art-word">Beyond<br />the cloud.</span></> : kind === 'tesla' ? <><span className="tesla-art">T</span><div className="tesla-line" /></> : kind === 'amazon' ? <><div className="amazon-box">a<span>⌣</span></div></> : <><Globe2 size={44} strokeWidth={1} /><span className="art-word">World in motion.</span></>}
  </div>;
}

function NewsCard({ article, saved, onSave, onOpen, holdings, index }) {
  const score = relevanceScore(article, holdings);
  return <motion.article className="news-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, delay: index * .04 }} layout>
    <button className="card-art-button" onClick={() => onOpen(article)} aria-label={`Artikel lesen: ${article.title}`}><NewsArt kind={article.image} /><span className="art-category">{article.category}</span></button>
    <button className={`card-save ${saved ? 'is-saved' : ''}`} onClick={() => onSave(article)} aria-label={saved ? 'Aus Merkliste entfernen' : 'Artikel speichern'} aria-pressed={saved}><Bookmark size={16} fill={saved ? 'currentColor' : 'none'} /></button>
    <div className="news-card-body"><div className="news-meta"><span className="source-dot" /><span>{article.source}</span><span className="meta-separator">·</span><span>{timeLabel(article)}</span></div>
      <button className="article-title" onClick={() => onOpen(article)}><h3>{article.title}</h3></button><p>{article.summary}</p>
      <div className="news-card-footer"><div className="ticker-pills">{article.symbols.slice(0, 2).map(s => <span key={s}><span className="ticker-dot" />{s}</span>)}{article.symbols.length > 2 && <span>+{article.symbols.length - 2}</span>}</div><span className="relevance" title="Relevanz nach dem Anteil betroffener Positionen im Portfolio"><Activity size={12} />{score}% relevant</span></div>
    </div>
  </motion.article>;
}

export default function App() {
  const reducedMotion = useReducedMotion();
  const [portfolio, setPortfolio] = useState(loadPortfolio);
  const [page, setPage] = useState('overview');
  const [filter, setFilter] = useState('Für dich');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('relevance');
  const [range, setRange] = useState('1T');
  const [savedArticles, setSavedArticles] = useState(() => { const data = storage.get('saved', []); return Array.isArray(data) ? data.filter(a => a && typeof a.id === 'string' && Array.isArray(a.symbols) && typeof a.title === 'string') : []; });
  const [modal, setModal] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [liveEnabled, setLiveEnabled] = useState(false);
  const [liveNews, setLiveNews] = useState([]);
  const [feedStatus, setFeedStatus] = useState('idle');
  const [feedError, setFeedError] = useState('');
  const [fetchedAt, setFetchedAt] = useState(null);
  const [toast, setToast] = useState(null);
  const [alerts, setAlerts] = useState(() => Boolean(storage.get('alerts', false)));
  const [brokerFilter, setBrokerFilter] = useState('Alle Quellen');
  const toastTimer = useRef(null);
  const requestId = useRef(0);
  const searchRef = useRef(null);
  const holdings = portfolio.holdings;
  const total = totalValue(holdings);
  const sources = [...new Set(holdings.map(h => h.broker))];
  const symbols = [...new Set(holdings.map(h => h.symbol))].slice(0, 15).join(',');
  const closeModal = useCallback(() => setModal(null), []);
  useEffect(() => { storage.set('portfolio', portfolio); }, [portfolio]);
  useEffect(() => { storage.set('saved', savedArticles); }, [savedArticles]);
  useEffect(() => { storage.set('alerts', alerts); }, [alerts]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  function notify(message) { setToast(message); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 4000); }
  function navigate(next) { setPage(next); setSearch(''); setFilter('Für dich'); setMobileOpen(false); window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' }); }
  function openImport(broker) { setSelectedBroker(broker || null); setModal('import'); }
  function saveArticle(article) { setSavedArticles(prev => prev.some(a => a.id === article.id) ? prev.filter(a => a.id !== article.id) : [...prev, article]); }
  function openArticle(article) { setSelectedArticle(article); setModal('article'); }
  function importHoldings(incoming, broker, replace) {
    setPortfolio(previous => {
      const current = previous.demo ? [] : previous.holdings;
      let next = replace ? [...current.filter(h => h.broker !== broker), ...incoming] : [...current];
      if (!replace) for (const h of incoming) {
        const match = next.findIndex(old => old.symbol === h.symbol && old.broker === h.broker);
        if (match < 0) next.push(h);
        else { const old = next[match]; const quantity = old.quantity + h.quantity; next[match] = { ...h, quantity, price: (old.quantity * old.price + h.quantity * h.price) / quantity }; }
      }
      return { demo: false, holdings: next };
    });
    setModal(null); setBrokerFilter('Alle Quellen'); notify(`${incoming.length} ${incoming.length === 1 ? 'Position' : 'Positionen'} von ${broker} importiert.`);
  }
  const fetchNews = useCallback(async () => {
    const id = ++requestId.current;
    setFeedStatus('loading'); setFeedError('');
    try {
      const response = await fetch(newsRequestUrl(hosting.endpoint, symbols), { signal: AbortSignal.timeout(16000) });
      const data = await response.json();
      if (id !== requestId.current) return;
      if (!response.ok) throw new Error(data.error || 'Der Feed konnte nicht geladen werden.');
      setLiveNews(data.articles); setFetchedAt(data.fetchedAt); setFeedStatus('ready');
    } catch (error) {
      if (id !== requestId.current) return;
      setFeedError(error.name === 'TimeoutError' ? 'Der Nachrichtenabruf dauert zu lange. Bitte versuche es erneut.' : error.message); setFeedStatus('error');
    }
  }, [symbols]);
  useEffect(() => {
    if (!liveEnabled) return;
    setLiveNews([]); setFetchedAt(null); fetchNews();
    const interval = setInterval(fetchNews, 60000);
    return () => { clearInterval(interval); requestId.current++; };
  }, [liveEnabled, fetchNews]);

  const articles = liveEnabled ? liveNews : portfolio.demo ? demoNews : [];
  const displayedNews = useMemo(() => {
    let result = page === 'saved' || filter === 'Gespeichert' ? savedArticles : articles;
    result = result.filter(a => (filter === 'Für dich' || filter === 'Gespeichert' || a.category === filter) && (!search || `${a.title} ${a.source} ${a.symbols.join(' ')}`.toLowerCase().includes(search.toLowerCase())));
    return [...result].sort((a, b) => sort === 'latest' ? newsAge(a) - newsAge(b) : relevanceScore(b, holdings) - relevanceScore(a, holdings));
  }, [articles, page, filter, search, sort, holdings, savedArticles]);
  const topHolding = [...holdings].sort((a,b) => b.quantity * b.price - a.quantity * a.price)[0];
  const changeAmount = portfolio.demo ? holdings.reduce((sum,h) => sum + h.quantity * h.price - h.quantity * h.price / (1 + h.change / 100), 0) : null;
  const dayChange = changeAmount === null ? null : changeAmount / (total - changeAmount) * 100;
  const today = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Berlin' }).format(new Date());
  const pageHeading = { overview: ['Dein Portfolio. Im Kontext.', 'Weniger Rauschen. Mehr von dem, was für dich zählt.'], portfolio: ['Viele Quellen. Ein Portfolio.', 'Alle Positionen im Blick. Ganz ohne Tab-Chaos.'], news: ['Wissen, was dich bewegt.', 'Die Nachrichten hinter deinen Positionen.'], saved: ['Für den zweiten Blick.', 'Deine gespeicherten Nachrichten, an einem Ort.'], settings: ['Ganz nach deinem Rhythmus.', 'Deine Quellen, dein Feed und deine Einstellungen.'] };

  const feedContent = <section className="news-section" aria-label="Portfolio-Nachrichten">
    <div className="section-heading"><div><span className="eyebrow">DEIN PERSÖNLICHER NEWSFEED</span><h2>{page === 'saved' ? 'Deine Merkliste' : 'Relevant für dich'}<span className="count-badge">{displayedNews.length}</span></h2></div><button className={`feed-control ${liveEnabled ? 'enabled' : ''}`} onClick={() => { if (!hosting.available) setModal('hosting'); else if (!liveEnabled) setLiveEnabled(true); else fetchNews(); }} disabled={feedStatus === 'loading'}>{feedStatus === 'loading' ? <LoaderCircle className="spinning" size={14} /> : liveEnabled ? <RefreshCw size={14} /> : <Radio size={14} />}{!hosting.available ? 'Live-Feed: nicht verbunden' : liveEnabled ? 'Aktualisieren' : 'Live abrufen'}</button></div>
    <div className="feed-toolbar"><div className="feed-tabs">{(page === 'saved' ? ['Für dich'] : ['Für dich', 'Unternehmen', 'Makro', 'Quartalszahlen', 'Gespeichert']).map(f => <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f === 'Für dich' && <Sparkles size={13} />}{page === 'saved' ? 'Alle gespeicherten' : f}</button>)}</div><label className="sort-control"><SlidersHorizontal size={14} /><select aria-label="Nachrichten sortieren" value={sort} onChange={e => setSort(e.target.value)}><option value="relevance">Relevanz</option><option value="latest">Neueste zuerst</option></select><ChevronDown size={12} /></label></div>
    <div className="feed-info"><span className={`status-dot ${feedStatus === 'ready' && liveEnabled ? 'active' : ''}`} />{liveEnabled ? fetchedAt ? `Zuletzt abgerufen um ${new Date(fetchedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' })} · RSS-Abfrage alle 60 Sekunden` : 'Live-Feed · Google News RSS' : portfolio.demo ? 'Beispielnachrichten · keine aktuellen Marktberichte' : hosting.available ? 'Aktiviere den Live-Feed für Nachrichten zu deinen importierten Positionen.' : 'Für Nachrichten zu deinen Positionen muss ein Nachrichtendienst verbunden werden.'}{liveEnabled && symbols.split(',').length < new Set(holdings.map(h => h.symbol)).size && <span> · Abdeckung: erste 15 Kürzel</span>}</div>
    {liveEnabled && feedError && <div className="feed-error" role="alert"><Globe2 size={18} /><div><strong>Der Live-Feed wartet auf Verbindung.</strong><p>{feedError}</p>{fetchedAt && <p>Bereits geladene Meldungen bleiben sichtbar; der Abruf ist derzeit unterbrochen.</p>}</div><button className="text-button" onClick={() => { setLiveEnabled(false); requestId.current++; setFeedStatus('idle'); setFeedError(''); }}>Live-Modus beenden</button></div>}
    <motion.div className="news-grid" layout>{displayedNews.map((article, index) => <NewsCard key={article.id} article={article} holdings={holdings} saved={savedArticles.some(a => a.id === article.id)} onSave={saveArticle} onOpen={openArticle} index={index} />)}</motion.div>
    {!displayedNews.length && <div className="empty-state">{feedStatus === 'loading' ? <LoaderCircle className="spinning" size={28} /> : page === 'saved' || filter === 'Gespeichert' ? <Bookmark size={28} /> : <Search size={28} />}<h3>{feedStatus === 'loading' ? 'Wir holen deinen Kontext.' : page === 'saved' || filter === 'Gespeichert' ? 'Ein guter Gedanke verdient eine Merkliste.' : search ? 'Hier ist es gerade ruhig.' : 'Dein nächstes Update wartet schon.'}</h3><p>{feedStatus === 'loading' ? 'Nachrichten zu deinen Positionen werden abgerufen.' : page === 'saved' || filter === 'Gespeichert' ? 'Speichere einen Artikel mit dem Lesezeichen. Du findest ihn dann hier.' : search ? 'Versuche ein anderes Unternehmen oder setze den Filter zurück.' : liveEnabled ? 'Momentan sind keine passenden Meldungen verfügbar.' : hosting.available ? 'Rufe den Live-Feed ab, um Nachrichten zu deinem Portfolio zu sehen.' : 'Dein Portfolio ist importiert. Für aktuelle Nachrichten fehlt noch ein verbundener Nachrichtendienst.'}</p>{search && <button className="button secondary" onClick={() => { setSearch(''); setFilter('Für dich'); }}>Filter zurücksetzen</button>}</div>}
    <div className="feed-bottom"><ShieldCheck size={13} /><span>Kontext für deine Entscheidungen. Keine Anlageempfehlungen.</span><span className="feed-bottom-right">Eine ruhigere Art, informiert zu bleiben.</span></div>
  </section>;

  return <MotionConfig reducedMotion="user"><div className="app-shell">
    {mobileOpen && <div className="sidebar-scrim" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}><button className="brand-button" onClick={() => navigate('overview')} aria-label="Port. Startseite"><Brand /></button><button className="icon-button sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Navigation schließen"><X size={20} /></button>
      <div className="workspace-label"><span className="workspace-icon"><Layers size={15} /></span><span>Mein Workspace<small>Dein persönlicher Überblick</small></span><ChevronDown size={13} /></div>
      <span className="nav-caption">WORKSPACE</span>
      <nav className="main-nav" aria-label="Hauptnavigation">{[['overview', LayoutDashboard, 'Übersicht'], ['portfolio', BriefcaseBusiness, 'Mein Portfolio'], ['news', Radio, 'Nachrichten'], ['saved', Bookmark, 'Merkliste']].map(([key, Icon, label]) => <button key={key} onClick={() => navigate(key)} className={page === key ? 'active' : ''} aria-current={page === key ? 'page' : undefined}><Icon size={18} strokeWidth={1.65} /><span>{label}</span>{key === 'saved' && savedArticles.length > 0 && <span className="nav-count">{savedArticles.length}</span>}{key === 'news' && <span className="nav-dot" />}</button>)}</nav>
      <div className="sources-heading"><span className="nav-caption">DEINE QUELLEN</span><button className="icon-button" aria-label="Portfolioquelle hinzufügen" onClick={() => openImport()}><Plus size={15} /></button></div>
      <div className="sidebar-sources">{sources.map(name => <button key={name} onClick={() => { navigate('portfolio'); setBrokerFilter(name); }}><BrokerMark name={name} small /><span>{name}</span><span className="source-connected" title={portfolio.demo ? 'Beispielquelle' : 'Lokal importiert'} /></button>)}</div>
      <button className="add-source" onClick={() => openImport()}><Plus size={15} />Quelle hinzufügen</button>
      <div className="sidebar-spacer" />
      <div className="sidebar-promo"><div className="promo-icon"><Leaf size={19} strokeWidth={1.6} /><span>Ein klarer Blick.</span></div><p>Dein Portfolio erzählt eine Geschichte. Bleib dran.</p><button onClick={() => openImport()}>Portfolio hinzufügen<ArrowUpRight size={15} /></button></div>
      <button className={`sidebar-settings ${page === 'settings' ? 'active' : ''}`} onClick={() => navigate('settings')}><Settings2 size={17} />Einstellungen</button>
      <button className="user-profile" onClick={() => setModal('profile')}><span className="avatar">JD</span><span>Dein Workspace<small>Lokal auf diesem Gerät</small></span><ChevronRight size={15} /></button>
    </aside>

    <div className="main-shell"><header className="topbar"><div className="breadcrumb"><button className="icon-button mobile-menu" aria-label="Navigation öffnen" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><span>Workspace</span><ChevronRight size={12} /><strong>{({ overview: 'Übersicht', portfolio: 'Mein Portfolio', news: 'Nachrichten', saved: 'Merkliste', settings: 'Einstellungen' })[page]}</strong></div><div className="topbar-actions"><span className="today">{today}</span><span className="topbar-divider" /><button className="icon-button" aria-label="Nachrichten durchsuchen" onClick={() => { if (page === 'settings') navigate('news'); setTimeout(() => searchRef.current?.focus(), 50); }}><Search size={18} /></button><button className="icon-button notification-button" aria-label="Benachrichtigungen öffnen" onClick={() => setModal('notifications')}><Bell size={18} />{alerts && <span />}</button><button className="top-avatar" aria-label="Workspace-Informationen" onClick={() => setModal('profile')}>JD</button></div></header>
      <main><motion.div className="page-intro" key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}><div><div className="greeting"><span />DEIN VORSPRUNG BEGINNT MIT KONTEXT</div><h1>{pageHeading[page][0]}</h1><p>{pageHeading[page][1]}</p></div><button className="button primary" onClick={() => openImport()}><Plus size={16} />Portfolio hinzufügen</button></motion.div>

      {(page === 'overview' || page === 'portfolio') && <motion.div className="dashboard-grid" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .1 }}>
        <section className="portfolio-card"><div className="portfolio-card-heading"><div className="portfolio-card-label"><BriefcaseBusiness size={16} /><span>Dein Gesamtportfolio</span><span className="subtle-badge">{portfolio.demo ? 'Demo' : 'Importiert'}</span></div><button className="icon-button" aria-label="Portfoliodetails öffnen" onClick={() => navigate('portfolio')}><ArrowUpRight size={19} /></button></div>
          <div className="portfolio-value"><span>{euro(total).replace(/\s?€$/, '')}</span><small>EUR</small></div>
          <div className="portfolio-value-bottom">{portfolio.demo ? <span className="positive day-change"><ArrowUpRight size={15} />+{euro(changeAmount)} ({dayChange.toFixed(2).replace('.', ',')}%)<span>heute · Beispielwerte</span></span> : <span className="import-value-note">Wert zum importierten Kurs · keine Live-Kurse</span>}<div className="source-stack">{sources.slice(0, 3).map(name => <BrokerMark key={name} name={name} small />)}<span>{sources.length} Quellen</span></div></div>
          {portfolio.demo ? <><PortfolioChart range={range} total={total} /><div className="chart-footer"><div className="range-buttons">{['1T', '1W', '1M', '1J'].map(r => <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)} aria-pressed={range === r}>{r}</button>)}</div><span><span className="chart-legend-dot" />Beispielverlauf</span></div></> : <div className="allocation-chart"><div className="allocation-bar">{holdings.map((h, i) => <motion.div key={`${h.symbol}-${h.broker}-${i}`} style={{ background: h.color, flex: h.quantity * h.price }} initial={{ scaleY: .3 }} animate={{ scaleY: 1 }} title={`${h.symbol}: ${euro(h.quantity * h.price)}`} />)}</div><div className="allocation-legend">{holdings.map((h, i) => <span key={`${h.symbol}-${h.broker}-${i}`}><i style={{ background: h.color }} />{h.symbol}<strong>{(h.quantity * h.price / total * 100).toFixed(1)}%</strong></span>)}</div><p>Deine Verteilung nach importiertem Positionswert.</p></div>}
        </section>
        <section className="focus-card"><div className="focus-card-top"><span className="focus-label"><Sparkles size={14} />DEIN FOKUS</span><span className="focus-number">01 / PORT.</span></div><div className="focus-art"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" /><div className="focus-orb"><Activity size={31} strokeWidth={1.4} /></div><span className="orbit-dot one" /><span className="orbit-dot two" /><span className="orbit-dot three" /></div><h2>Der Markt ist laut.<br />Dein Feed ist es nicht.</h2><p>{holdings.length} Positionen. Die Nachrichten, die dazu passen. Alles andere darf warten.</p><div className="focus-card-bottom"><span className="focus-avatar-stack">{holdings.slice(0, 3).map((h,i) => <CompanyMark key={h.symbol+i} symbol={h.symbol} small />)}</span><button onClick={() => { navigate('news'); }}>{portfolio.demo ? 'Deinen Feed entdecken' : 'Nachrichten ansehen'}<ArrowUpRight size={15} /></button></div></section>
      </motion.div>}

      {page === 'overview' && <div className="quick-stats"><div><span className="stat-icon"><Layers size={17} /></span><span>Positionen<strong>{holdings.length}<small>über {sources.length} Quellen</small></strong></span></div><div><span className="stat-icon"><Radio size={17} /></span><span>{liveEnabled ? 'Aktuelle Meldungen' : 'Beispielmeldungen'}<strong>{articles.length}<small>für dein Portfolio</small></strong></span></div><div><span className="stat-icon"><Activity size={17} /></span><span>Größte Position<strong>{topHolding?.symbol}<small>{((topHolding?.quantity * topHolding?.price || 0) / total * 100).toFixed(1).replace('.', ',')}% deines Portfolios</small></strong></span></div><button className="stats-insight" onClick={() => setModal('relevance')}><span className="insight-icon"><Sparkles size={16} /></span><span>Die Verbindung macht<br /><strong>den Unterschied.</strong></span><ArrowRight size={15} /></button></div>}

      {['overview', 'news', 'saved'].includes(page) && <><label className={`news-search ${search ? 'has-value' : ''}`}><Search size={17} /><input ref={searchRef} placeholder="Nachrichten, Unternehmen oder Kürzel suchen …" aria-label="Nachrichten suchen" value={search} onChange={e => setSearch(e.target.value)} />{search && <button className="icon-button" aria-label="Suche löschen" onClick={() => setSearch('')}><X size={15} /></button>}<span>DEIN KONTEXT, AUF EINEN BLICK</span></label>{feedContent}</>}

      {page === 'portfolio' && <section className="positions-section"><div className="section-heading"><div><span className="eyebrow">ALLES, WAS DU HÄLTST</span><h2>Deine Positionen<span className="count-badge">{holdings.length}</span></h2></div><label className="sort-control"><select aria-label="Quelle filtern" value={brokerFilter} onChange={e => setBrokerFilter(e.target.value)}>{['Alle Quellen', ...sources].map(s => <option key={s}>{s}</option>)}</select><ChevronDown size={13} /></label></div><div className="table-scroll"><table className="positions-table"><thead><tr><th>Unternehmen</th><th>Quelle</th><th>Anzahl</th><th>Kurs · EUR</th><th>Positionswert</th><th>Anteil</th><th /></tr></thead><tbody>{holdings.filter(h => brokerFilter === 'Alle Quellen' || h.broker === brokerFilter).map((h,i) => <tr key={`${h.symbol}-${h.broker}-${i}`}><td><div className="position-name"><CompanyMark symbol={h.symbol} /><span><strong>{h.name}</strong><small>{h.symbol}</small></span></div></td><td><span className="table-broker"><BrokerMark name={h.broker} small />{h.broker}</span></td><td>{h.quantity.toLocaleString('de-DE')}</td><td>{euro(h.price)}</td><td className="value-cell">{euro(h.quantity * h.price)}</td><td><span className="weight-cell">{(h.quantity * h.price / total * 100).toFixed(1)}%<i style={{ width: `${h.quantity * h.price / total * 100}%`, background: h.color }} /></span></td><td><button className="icon-button" aria-label={`Nachrichten zu ${h.symbol}`} onClick={() => { navigate('news'); setSearch(h.symbol); }}><ArrowUpRight size={17} /></button></td></tr>)}</tbody></table></div><p className="table-note"><ShieldCheck size={14} />{portfolio.demo ? 'Demo-Portfolio mit Beispielkursen in EUR.' : 'Importierte Kurse in EUR. Zum Aktualisieren dieselbe Quelle erneut importieren.'}</p></section>}

      {page === 'settings' && <div className="settings-grid"><section className="settings-card"><span className="eyebrow">DEIN NEWSFEED</span><h2>Informiert. In deinem Tempo.</h2><div className="setting-row"><div><strong>Live-Nachrichten</strong><p>{hosting.available ? 'Google-News-RSS-Abfrage alle 60 Sekunden. Keine garantierte Echtzeit.' : 'Noch kein Nachrichtendienst verbunden. Portfolioimport und Merkliste funktionieren bereits.'}</p></div><button className={`toggle ${liveEnabled ? 'on' : ''}`} role="switch" aria-checked={liveEnabled} aria-label="Live-Nachrichten aktivieren" onClick={() => hosting.available ? setLiveEnabled(!liveEnabled) : setModal('hosting')}><span /></button></div><div className="setting-row"><div><strong>Feed-Hinweis im Workspace</strong><p>Zeigt den Status des Live-Feeds im Benachrichtigungsbereich. Keine Push-Nachrichten.</p></div><button className={`toggle ${alerts ? 'on' : ''}`} role="switch" aria-checked={alerts} aria-label="Feed-Hinweis aktivieren" onClick={() => setAlerts(!alerts)}><span /></button></div><div className="setting-row"><div><strong>Lokale Portfolio-Daten</strong><p>Positionen und Merkliste werden in diesem Browser gespeichert.</p></div><ShieldCheck size={21} /></div></section><section className="settings-card"><span className="eyebrow">DEINE QUELLEN</span><h2>Ein Portfolio. Viele Wege.</h2>{sources.map(name => <div className="setting-source" key={name}><BrokerMark name={name} /><span><strong>{name}</strong><small>{portfolio.demo ? 'Beispielquelle' : 'CSV / manueller Import'} · {holdings.filter(h => h.broker === name).length} Positionen</small></span><button className="text-button" onClick={() => openImport(name)}>Importieren<ArrowUpRight size={14} /></button></div>)}<button className="button secondary full-width" onClick={() => openImport()}><Plus size={16} />Quelle hinzufügen</button></section><section className="settings-card full-width"><span className="eyebrow">NEU ANFANGEN</span><h2>Platz für einen neuen Blick.</h2><p className="settings-description">Setze dein lokales Portfolio und deine Merkliste zurück. Anschließend siehst du wieder die gekennzeichneten Beispieldaten.</p><button className="button secondary" onClick={() => setModal('reset')}><RefreshCw size={15} />Demo wiederherstellen</button></section></div>}

      <footer className="page-footer"><Brand compact /><span>Ein klarer Blick auf das, was dir gehört.</span><button onClick={() => setModal('about')}>Über Port.<ArrowUpRight size={12} /></button></footer>
      </main>
    </div>

    <AnimatePresence>{modal === 'hosting' && <Modal key="hosting" title="Dein nächster Schritt zum Live-Feed." subtitle="Noch kein Nachrichtendienst verbunden." onClose={closeModal}><p className="article-body">Für aktuelle Nachrichten benötigt Port. einen verbundenen Nachrichtendienst. Diese veröffentlichte Version kann dein Portfolio importieren, Artikel speichern und die gekennzeichneten Beispiele anzeigen. Sobald der Nachrichtendienst angebunden ist, lässt sich der Live-Feed hier aktivieren.</p><button className="button primary full-width" onClick={closeModal}>Alles klar<Check size={16} /></button></Modal>}{modal === 'import' && <ImportModal key="import" onClose={closeModal} onImport={importHoldings} initialBroker={selectedBroker} />}
      {modal === 'article' && selectedArticle && <Modal key="article" title={selectedArticle.title} subtitle={`${selectedArticle.source} · ${selectedArticle.publishedAt ? new Date(selectedArticle.publishedAt).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }) : 'Beispielnachricht'}`} onClose={closeModal} wide><NewsArt kind={selectedArticle.image} big /><div className="article-detail-tags">{selectedArticle.symbols.map(s => <span key={s}>{s}</span>)}<span>{selectedArticle.category}</span></div><p className="article-body">{selectedArticle.body}</p><div className="relevance-explainer"><Activity size={19} /><div><strong>{relevanceScore(selectedArticle, holdings)}% Portfolio-Relevanz</strong><p>Ein Orientierungswert aus dem Anteil betroffener Positionen. Keine Bewertung der Nachricht und kein Handelssignal.</p></div></div><div className="modal-footer"><button className="button secondary" onClick={() => saveArticle(selectedArticle)}><Bookmark size={16} fill={savedArticles.some(a => a.id === selectedArticle.id) ? 'currentColor' : 'none'} />{savedArticles.some(a => a.id === selectedArticle.id) ? 'Gespeichert' : 'Artikel speichern'}</button>{selectedArticle.url && /^https:\/\//.test(selectedArticle.url) ? <a className="button primary" href={selectedArticle.url} target="_blank" rel="noopener noreferrer">Originalquelle öffnen<ExternalLink size={15} /></a> : <span className="demo-article-note">Fiktives Beispiel · kein Originalartikel</span>}</div></Modal>}
      {modal === 'notifications' && <Modal key="notifications" title="Dein Feed. Dein Rhythmus." onClose={closeModal}><div className="notification-empty"><Bell size={30} /><h3>{liveEnabled && feedStatus === 'ready' ? `${liveNews.length} Meldungen für dein Portfolio` : feedStatus === 'error' ? 'Der Live-Feed ist gerade unterbrochen.' : 'Dein Feed wartet auf dich.'}</h3><p>{liveEnabled && feedStatus === 'ready' ? 'Die zuletzt geladenen Meldungen findest du in deinem persönlichen Newsfeed.' : 'Aktiviere den Live-Feed, um veröffentlichte Nachrichten zu deinen Positionen abzurufen.'}</p></div><button className="button primary full-width" onClick={() => { closeModal(); navigate('news'); }}>Zum Newsfeed<ArrowRight size={15} /></button></Modal>}
      {['about','profile','relevance'].includes(modal) && <Modal key={modal} title={modal === 'relevance' ? 'Aus Information wird Kontext.' : modal === 'profile' ? 'Dein persönlicher Workspace.' : 'Weniger Rauschen. Mehr Port.'} subtitle="Dein Portfolio ist der Ausgangspunkt. Die Welt liefert den Kontext." onClose={closeModal}><div className="about-steps"><div><span>01</span><p><strong>Positionen zusammenbringen.</strong>Importiere eine CSV oder füge Positionen manuell hinzu. Daten bleiben lokal in diesem Browser.</p></div><div><span>02</span><p><strong>Nachrichten zuordnen.</strong>Der Live-Feed sucht nach deinen Unternehmen. Relevanz wird anhand betroffener Portfolioanteile berechnet.</p></div><div><span>03</span><p><strong>Den eigenen Blick behalten.</strong>Speichere wichtige Meldungen und öffne die Originalquelle. Port. gibt keine Handelsempfehlungen.</p></div></div><div className="privacy-note"><CircleHelp size={18} /><p>Direkte Brokeranbindungen, Live-Kurse und ein Benutzerkonto sind noch nicht Teil dieses Prototyps. RSS-Abfragen erfolgen alle 60 Sekunden, die Veröffentlichung durch Anbieter kann verzögert sein.</p></div><button className="button primary full-width" onClick={closeModal}>Alles klar<Check size={16} /></button></Modal>}
      {modal === 'reset' && <Modal key="reset" title="Mit einem frischen Blick starten?" subtitle="Deine lokal gespeicherten Positionen und Artikel werden entfernt und durch das Demo-Portfolio ersetzt." onClose={closeModal}><div className="modal-footer"><button className="button secondary" onClick={closeModal}>Abbrechen</button><button className="button primary" onClick={() => { setPortfolio({ demo: true, holdings: demoHoldings }); setSavedArticles([]); setLiveEnabled(false); setLiveNews([]); setFeedStatus('idle'); setBrokerFilter('Alle Quellen'); closeModal(); notify('Demo-Portfolio wiederhergestellt.'); }}>Zurücksetzen<RefreshCw size={15} /></button></div></Modal>}
    </AnimatePresence>
    <AnimatePresence>{toast && <motion.div className="toast" role="status" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}><CheckCircle2 size={18} />{toast}<button aria-label="Hinweis schließen" onClick={() => setToast(null)}><X size={15} /></button></motion.div>}</AnimatePresence>
  </div></MotionConfig>;
}
