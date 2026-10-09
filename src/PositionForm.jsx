import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Upload, FileText, Download, ShieldCheck, LoaderCircle, CheckCircle2, Search, Check, ChevronDown } from 'lucide-react';
import { Modal } from './components.jsx';
import { cryptoAssets,currencies,validatePosition,parsePositionsCSV,liquidationThreshold } from './positions.js';
import { companyNames } from './portfolio.js';
import { searchAssets } from './providers.js';
import { brokers } from './data.js';

const money=(n,currency)=>new Intl.NumberFormat('de-DE',{style:'currency',currency,maximumFractionDigits:n<1?6:2}).format(n);
export default function PositionForm({onClose,onSave,backend,editing,initialBroker}) {
  const [tab,setTab]=useState('manual');
  const [form,setForm]=useState(()=>editing ? {...editing,maintenanceRate:editing.maintenanceRate==null?'0.5':editing.maintenanceRate*100,liquidationPrice:editing.liquidationPrice ?? ''} :
    {assetType:'stock',symbol:'',assetId:'',name:'',currency:'USD',kind:'spot',direction:'long',quantity:'',entryPrice:'',margin:'',leverage:'5',liquidationMode:'manual',liquidationPrice:'',maintenanceRate:'0.5',broker:initialBroker || 'Manuell'});
  const [query,setQuery]=useState(editing?.symbol || '');
  const [results,setResults]=useState([]);
  const [searching,setSearching]=useState(false);
  const [searchError,setSearchError]=useState('');
  const [error,setError]=useState('');
  const [file,setFile]=useState('');
  const [pending,setPending]=useState([]);
  const [reading,setReading]=useState(false);
  const fileRef=useRef(null);
  const update=(key,value)=>setForm(p=>({...p,[key]:value}));
  useEffect(()=>{
    let active=true;
    if(query.length<2){setResults([]);setSearchError('');return;}
    const timer=setTimeout(async()=>{
      setSearching(true);setSearchError('');
      try{const values=await searchAssets(query,form.assetType,backend);if(active)setResults(values);}
      catch(e){if(active){setSearchError(e.message);setResults([]);}}
      finally{if(active)setSearching(false);}
    },700);
    return()=>{active=false;clearTimeout(timer);};
  },[query,form.assetType,backend]);
  const choose=a=>{setForm(f=>({...f,symbol:a.symbol,assetId:a.id,name:a.name}));setQuery(a.symbol);setResults([]);};
  const suggestions=results.length ? results : query.length<2 ? form.assetType==='crypto' ? cryptoAssets.slice(0,6) : ['AAPL','NVDA','MSFT','AMZN','TSLA','GOOGL'].map(symbol=>({symbol,id:symbol,name:companyNames[symbol]})) : [];
  let preview=null;
  try {preview=liquidationThreshold(validatePosition(form));}catch{/* Preview appears only for valid values. */}
  async function read(file){
    setError('');setFile('');setPending([]);if(!file)return;
    if(file.size>2*1024*1024){setError('Die Datei darf höchstens 2 MB groß sein.');return;}
    setReading(true);
    try{setPending(parsePositionsCSV(await file.text(),form.broker));setFile(file.name);}catch(e){setError(e.message);}finally{setReading(false);}
  }
  function submit(e){e.preventDefault();setError('');try{const positions=tab==='csv'?pending.map(p=>({...p,broker:form.broker})):[validatePosition(form)];if(!positions.length)throw new Error('Bitte zuerst eine CSV auswählen.');onSave(positions,tab==='csv',editing?.id);}catch(e){setError(e.message);}}
  return <Modal title={editing?'Deine Position aktualisieren.':'Dein Portfolio beginnt mit dir.'} subtitle="Echte Positionen. Aktuelle Daten. Dein eigener Blick." onClose={onClose} wide>
    <form className="position-form" onSubmit={submit}>
      {!editing && <div className="segmented import-tabs">{[['manual','Position eingeben'],['csv','CSV importieren']].map(([key,label])=><button type="button" key={key} className={tab===key?'selected':''} onClick={()=>{setTab(key);setError('');}}>{label}</button>)}</div>}
      {tab==='manual' ? <>
        <div className="segmented asset-types">{[['stock','Aktie / ETF'],['crypto','Krypto']].map(([type,label])=><button type="button" key={type} className={form.assetType===type?'selected':''} onClick={()=>{setForm(f=>({...f,assetType:type,currency:type==='crypto'?'EUR':'USD',symbol:'',assetId:'',name:''}));setQuery('');}}>{label}</button>)}</div>
        <label className="form-label">{form.assetType==='crypto'?'Kryptowährung suchen':'Unternehmen oder Börsenkürzel'}<div className="asset-search"><Search size={16}/><input autoComplete="off" aria-label="Asset suchen" placeholder={form.assetType==='crypto'?'z. B. Bitcoin oder BTC':'z. B. Apple oder AAPL'} value={query} onChange={e=>{setQuery(e.target.value);setForm(f=>({...f,symbol:e.target.value.trim().toUpperCase(),assetId:form.assetType==='stock'?e.target.value.trim().toUpperCase():'',name:''}));}}/>{searching?<LoaderCircle size={15} className="spinning"/>:form.name&&<Check size={16}/>}</div></label>
        {suggestions.length>0 && <div className="asset-results">{suggestions.map(a=><button type="button" key={a.id} onClick={()=>choose(a)}><strong>{a.symbol}</strong><span>{a.name}</span>{form.assetType==='crypto'&&<small>{a.id}</small>}</button>)}</div>}
        {searchError&&<p className="field-hint">Suche nicht verfügbar. Du kannst das Kürzel bzw. die Coin-ID direkt eingeben.</p>}
        {form.assetType==='crypto'&&<label className="form-label compact-field">CoinGecko-ID<input aria-label="CoinGecko-ID" value={form.assetId} placeholder="z. B. bitcoin" onChange={e=>update('assetId',e.target.value)}/><span className="field-hint">Die ID unterscheidet Coins mit gleichem Kürzel. Bei Suchauswahl wird sie automatisch gesetzt.</span></label>}
        {form.assetType==='stock'&&!backend&&<div className="form-information">Aktienkurse und Nachrichten starten nach Veröffentlichung des gemeinsamen Backends. Deine Position kannst du schon speichern.</div>}
        <div className="form-grid two"><label className="form-label">Positionstyp<select aria-label="Positionstyp" value={form.kind} onChange={e=>update('kind',e.target.value)}><option value="spot">Spot / ohne Hebel</option><option value="margin">Hebel · isoliert, linear</option></select></label><label className="form-label">Währung deiner Eingaben<select aria-label="Positionswährung" value={form.currency} onChange={e=>update('currency',e.target.value)}>{currencies.map(c=><option key={c}>{c}</option>)}</select></label></div>
        {form.kind==='margin'&&<div className="segmented direction-tabs">{[['long','Long · steigende Kurse'],['short','Short · fallende Kurse']].map(([value,label])=><button type="button" key={value} className={form.direction===value?'selected':''} onClick={()=>update('direction',value)}>{label}</button>)}</div>}
        <div className="form-grid two"><label className="form-label">Einstiegskurs · {form.currency}<input aria-label="Einstiegskurs" inputMode="decimal" placeholder="Dein tatsächlicher Einstieg" value={form.entryPrice} onChange={e=>update('entryPrice',e.target.value)} required/></label><label className="form-label">{form.kind==='margin'?`Sicherheitsleistung · ${form.currency}`:'Anzahl / Stück'}<input aria-label={form.kind==='margin'?'Sicherheitsleistung':'Anzahl'} inputMode="decimal" placeholder={form.kind==='margin'?'Deine isolierte Margin':'Auch Bruchteile möglich'} value={form.kind==='margin'?form.margin:form.quantity} onChange={e=>update(form.kind==='margin'?'margin':'quantity',e.target.value)} required/></label></div>
        {form.kind==='margin'&&<div className="leverage-fields"><div className="form-grid two"><label className="form-label">Hebel<input aria-label="Hebel" inputMode="decimal" value={form.leverage} onChange={e=>update('leverage',e.target.value)} required/></label><label className="form-label">Liquidationsschwelle<select aria-label="Liquidationsmodell" value={form.liquidationMode} onChange={e=>update('liquidationMode',e.target.value)}><option value="manual">Vom Anbieter übernehmen</option><option value="estimate">Als Modell schätzen</option></select></label></div>
          {form.liquidationMode==='manual'?<label className="form-label">Liquidationspreis vom Anbieter · {form.currency} (optional)<input aria-label="Liquidationspreis" inputMode="decimal" placeholder="Genauen Wert beim Anbieter ablesen" value={form.liquidationPrice} onChange={e=>update('liquidationPrice',e.target.value)}/><span className="field-hint">Ohne eingetragene Schwelle wird kein Liquidationsabstand angezeigt.</span></label>:<label className="form-label">Maintenance Margin · %<input aria-label="Maintenance Margin" inputMode="decimal" value={form.maintenanceRate} onChange={e=>update('maintenanceRate',e.target.value)}/><span className="field-hint">0,5% ist eine Modellannahme. Trage den Satz deines Anbieters ein.</span></label>}
          {preview&&<div className="liquidation-preview"><span>{preview.estimated?'Geschätzte Liquidationsschwelle':'Eingetragene Liquidationsschwelle'}</span><strong>{money(preview.price,form.currency)}</strong></div>}
          <p className="model-note">Nur für isolierte, lineare Margin-Positionen mit konstanter Stückzahl. Cross-Margin, inverse Kontrakte, Optionen, Knock-outs, Funding, Zinsen, Gebühren und Margin-Stufen werden nicht berechnet. Der Broker-Markpreis kann vom angezeigten Spotkurs abweichen.</p>
        </div>}
      </> : <><input className="visually-hidden" ref={fileRef} type="file" accept=".csv,text/csv" aria-label="CSV-Datei auswählen" onChange={e=>read(e.target.files[0])}/><button type="button" className="upload-zone" onClick={()=>fileRef.current.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();read(e.dataTransfer.files[0]);}}>{reading?<LoaderCircle className="spinning" size={25}/>:pending.length?<CheckCircle2 size={25}/>:<Upload size={25}/>}<strong>{file||'Deine CSV hier ablegen'}</strong><span>{pending.length?`${pending.length} Positionen erkannt`:'oder klicken · höchstens 2 MB'}</span></button><div className="csv-help"><FileText size={15}/><span>Pflicht: symbol, quantity, price. Krypto: asset_type, coin_id.</span><a href={`${import.meta.env.BASE_URL}portfolio-beispiel.csv`} download>CSV-Vorlage<Download size={13}/></a></div><p className="field-hint">price = Einstiegskurs. currency = Währung. Für Hebel: kind=margin, direction, margin, leverage und liquidation_price. Separate Hebelpositionen werden nicht zusammengeführt.</p></>}
      <label className="form-label broker-field">Quelle / Depotname<select aria-label="Depotquelle" value={form.broker} onChange={e=>update('broker',e.target.value)}>{['Manuell',...brokers.map(b=>b.name)].map(name=><option key={name}>{name}</option>)}</select></label>
      {error&&<p role="alert" className="form-error">{error}</p>}
      <div className="privacy-note"><ShieldCheck size={17}/><p>Positionen bleiben in deinem Browser. Nur Kürzel und Coin-IDs werden an die Datenanbieter gesendet. Die Depotquelle ist ein Name für deine Erfassung, keine automatische Depotverbindung.</p></div>
      <div className="modal-footer"><span>{tab==='csv'?'Ersetzt die gespeicherten Positionen dieser Quelle.':'Separate Trades bleiben separate Positionen.'}</span><button className="button primary" disabled={reading||(tab==='csv'&&!pending.length)}>{editing?'Position speichern':tab==='csv'?'Positionen importieren':'Position hinzufügen'}<ArrowRight size={16}/></button></div>
    </form>
  </Modal>;
}
