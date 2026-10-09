import { useEffect, useRef, useId } from 'react';
import { motion } from 'framer-motion';
import { X, Leaf, Globe2, Bookmark, Activity } from 'lucide-react';
import { brokers } from './data.js';
import { relevanceScore } from './portfolio.js';

const newsAge = a => Math.max(0, Math.floor((Date.now()-Date.parse(a.publishedAt))/60000));
function timeLabel(a) { const m=newsAge(a); return m<1?'gerade eben':m<60?`vor ${m} Min.`:m<1440?`vor ${Math.floor(m/60)} Std.`:`vor ${Math.floor(m/1440)} Tagen`; }
export function Brand({ compact = false }) {
  return <div className={`brand ${compact ? 'compact' : ''}`}><span className="brand-symbol"><span /><span /><span /></span><span>port<span className="brand-dot">.</span></span></div>;
}
export function BrokerMark({ name, small = false }) {
  const broker = brokers.find(b => b.name === name) || brokers[4];
  return <span className={`broker-mark ${small ? 'small' : ''} ${name === 'Robinhood' || name === 'Fomo' || name === 'Andere Quelle' ? 'light' : ''}`} style={{ background: broker.color }}>{name === 'Robinhood' ? <Leaf size={small ? 11 : 18} strokeWidth={2.2} /> : broker.mark}</span>;
}
export function CompanyMark({ symbol, small = false }) {
  const labels = { NVDA: 'N', AAPL: 'a', MSFT: '▦', TSLA: 'T', AMZN: 'a', META: '∞', GOOGL: 'G', BTC: '₿' };
  return <span className={`company-mark ${symbol.toLowerCase()} ${small ? 'small' : ''}`}>{labels[symbol] || symbol.slice(0, 2)}</span>;
}

export function Modal({ title, subtitle, onClose, children, wide = false }) {
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

export function NewsArt({ kind, big = false }) {
  return <div className={`news-art art-${kind} ${big ? 'big' : ''}`} aria-hidden="true">
    {kind === 'chip' ? <><div className="circuit circuit-one" /><div className="circuit circuit-two" /><div className="circuit circuit-three" /><div className="chip"><span className="chip-eye">◉</span><span>NVIDIA</span><small>THE NEXT WAVE</small></div><div className="art-orb" /></> : kind === 'apple' ? <><div className="apple-device"><span>◒</span></div><div className="apple-device second"><span>◒</span></div></> : kind === 'macro' ? <><div className="macro-column" /><div className="macro-column" /><div className="macro-column" /><div className="macro-column" /><div className="macro-roof" /><span className="macro-label">THE BIG PICTURE</span></> : kind === 'cloud' ? <><div className="cloud-orb" /><span className="art-word">Beyond<br />the cloud.</span></> : kind === 'tesla' ? <><span className="tesla-art">T</span><div className="tesla-line" /></> : kind === 'amazon' ? <><div className="amazon-box">a<span>⌣</span></div></> : <><Globe2 size={44} strokeWidth={1} /><span className="art-word">World in motion.</span></>}
  </div>;
}

export function NewsCard({ article, saved, onSave, onOpen, holdings, index }) {
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

