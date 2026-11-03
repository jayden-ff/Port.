import { evaluateStep, solutionFor } from './mission-check.js';

const UI = {
  en: { example:'Try an example', principle:'Discover the rule', transfer:'Your turn', check:'Check my work', continue:'Continue', finish:'Finish mission', understood:'Let’s try it', exit:'Save & exit', hint:'A little hint', reveal:'Show a worked example', correct:'You’ve got it!', retry:'Keep experimenting', retryText:'Look at what changed, adjust your answer, and try again.', combo:'in a row', done:'Mission accomplished', replay:'Try again', back:'Back to lessons', matched:'pairs connected', selectLeft:'Choose a starting point, then its partner.', order:'Tap the pieces in order. Tap a placed piece to remove it.', undo:'Undo', clear:'Clear', answer:'Your answer', calculate:'Result', target:'Observed examples', model:'Your prediction', input:'Input', output:'Output', error:'Average squared error', line:'Your model', weights:'Adjust the values', progress:'Mission progress', step:'Step', of:'of', assisted:'Worked example', independent:'Now try the next challenge on your own.', complete:'You built it, tested it, and made it work.', saved:'Your progress is saved as you go.', amount:'Amount', total:'Total', signal:'Signal', contribution:'Contribution', examples:'Examples', connection:'Connect', choose:'Choose a partner', remove:'Remove', moveUp:'Move up', noReveal:'Solve this fresh example yourself. Use the hint if you need a starting point.', numericHelp:'Enter a number or build a calculation with the tiles. + − × ÷ also work.', exampleHelp:'Here is one working setup. Notice how it changes the scene, then check it.', awaiting:'Ready when you are', sound:'Sound', soundOff:'Sound off', soundOn:'Sound on' },
  de: { example:'Ein Beispiel ausprobieren', principle:'Die Regel entdecken', transfer:'Jetzt bist du dran', check:'Meine Lösung prüfen', continue:'Weiter', finish:'Mission abschließen', understood:'Probieren wir es aus', exit:'Speichern & verlassen', hint:'Ein kleiner Hinweis', reveal:'Ein Beispiel vorrechnen', correct:'Du hast es geschafft!', retry:'Probiere weiter', retryText:'Beobachte die Veränderung, passe deine Lösung an und versuche es noch einmal.', combo:'in Folge', done:'Mission geschafft', replay:'Noch einmal', back:'Zur Lektionsübersicht', matched:'Paare verbunden', selectLeft:'Wähle einen Ausgangspunkt und dann den passenden Partner.', order:'Tippe die Bausteine in der richtigen Reihenfolge an. Entferne gesetzte Bausteine durch Antippen.', undo:'Zurücknehmen', clear:'Leeren', answer:'Deine Antwort', calculate:'Ergebnis', target:'Beobachtete Beispiele', model:'Deine Vorhersage', input:'Eingabe', output:'Ausgabe', error:'Mittlerer quadratischer Fehler', line:'Dein Modell', weights:'Passe die Werte an', progress:'Missionsfortschritt', step:'Schritt', of:'von', assisted:'Vorgerechnetes Beispiel', independent:'Löse die nächste Aufgabe nun selbstständig.', complete:'Du hast es gebaut, geprüft und zum Funktionieren gebracht.', saved:'Dein Fortschritt wird laufend gespeichert.', amount:'Menge', total:'Summe', signal:'Signal', contribution:'Beitrag', examples:'Beispiele', connection:'Verbinden', choose:'Partner wählen', remove:'Entfernen', moveUp:'Nach oben', noReveal:'Löse dieses neue Beispiel selbstständig. Der Hinweis hilft dir beim Einstieg.', numericHelp:'Gib eine Zahl ein oder baue mit den Bausteinen eine Rechnung. + − × ÷ funktionieren auch.', exampleHelp:'Hier ist eine passende Einstellung. Beobachte die Szene und prüfe sie anschließend.', awaiting:'Bereit, wenn du es bist', sound:'Ton', soundOff:'Ton aus', soundOn:'Ton an' },
  fr: { example:'Essayer un exemple', principle:'Découvrir la règle', transfer:'À toi de jouer', check:'Vérifier ma réponse', continue:'Continuer', finish:'Terminer la mission', understood:'Essayons ensemble', exit:'Enregistrer et quitter', hint:'Un petit indice', reveal:'Voir un exemple résolu', correct:'Tu as compris !', retry:'Continue à explorer', retryText:'Observe ce qui change, ajuste ta réponse et réessaie.', combo:'à la suite', done:'Mission accomplie', replay:'Recommencer', back:'Retour aux leçons', matched:'paires reliées', selectLeft:'Choisis un point de départ, puis son partenaire.', order:'Touche les éléments dans le bon ordre. Touche un élément placé pour le retirer.', undo:'Annuler', clear:'Effacer', answer:'Ta réponse', calculate:'Résultat', target:'Exemples observés', model:'Ta prédiction', input:'Entrée', output:'Sortie', error:'Erreur quadratique moyenne', line:'Ton modèle', weights:'Ajuste les valeurs', progress:'Progression de la mission', step:'Étape', of:'sur', assisted:'Exemple résolu', independent:'Essaie maintenant le prochain défi sans aide.', complete:'Tu as construit, vérifié et fait fonctionner ton modèle.', saved:'Ta progression est enregistrée à chaque étape.', amount:'Quantité', total:'Total', signal:'Signal', contribution:'Contribution', examples:'Exemples', connection:'Relier', choose:'Choisir un partenaire', remove:'Retirer', moveUp:'Monter', noReveal:'Résous ce nouvel exemple par toi-même. L’indice peut te donner une piste.', numericHelp:'Saisis un nombre ou construis un calcul avec les tuiles. + − × ÷ fonctionnent aussi.', exampleHelp:'Voici un réglage qui fonctionne. Observe la scène, puis vérifie-le.', awaiting:'Prêt quand tu veux', sound:'Son', soundOff:'Son désactivé', soundOn:'Son activé' }
};
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone = value => JSON.parse(JSON.stringify(value));
const finite = value => typeof value === 'number' && Number.isFinite(value);
const format = value => finite(value) ? Number(value.toFixed(3)).toLocaleString('en-US', {maximumFractionDigits:3}) : '—';
const label = (locale, en, de, fr) => locale === 'de' ? de : locale === 'fr' ? fr : en;

export function robotSVG(mood = 'ready') {
  return `<svg class="mission-robot ${mood === 'happy' ? 'is-happy' : ''}" viewBox="0 0 150 150" aria-hidden="true"><ellipse cx="76" cy="137" rx="36" ry="7" fill="#191624" opacity=".12"/><g class="robot-body"><path d="M75 24V13" stroke="#51485f" stroke-width="5" stroke-linecap="round"/><circle cx="75" cy="11" r="7" fill="#bfe980"/><rect x="32" y="32" width="88" height="72" rx="25" fill="#dfd3f4" stroke="#5b486e" stroke-width="3"/><rect x="43" y="45" width="66" height="43" rx="16" fill="#342b42"/><g fill="#c9f28b"><ellipse cx="60" cy="63" rx="6" ry="${mood === 'happy' ? 3 : 7}"/><ellipse cx="91" cy="63" rx="6" ry="${mood === 'happy' ? 3 : 7}"/></g><path d="M67 77q9 7 18 0" fill="none" stroke="#c9f28b" stroke-width="3" stroke-linecap="round"/><path d="M33 67 20 79m99-12 13 ${mood === 'happy' ? '-18' : '12'}" stroke="#bda6d6" stroke-width="11" stroke-linecap="round"/><rect x="48" y="105" width="54" height="23" rx="11" fill="#bda6d6"/><path d="M58 127v7m34-7v7" stroke="#51485f" stroke-width="8" stroke-linecap="round"/><circle cx="75" cy="116" r="5" fill="#c9f28b"/></g></svg>`;
}

// A small arithmetic parser keeps number tiles useful without executing learner input.
export function parseMissionNumber(raw) {
  if (finite(raw)) return raw;
  const source = String(raw ?? '').trim().replace(/,/g,'.').replace(/×/g,'*').replace(/[÷]/g,'/').replace(/[−]/g,'-').replace(/\s+/g,'');
  if (!source || !/^[\d.+\-*/()]+$/.test(source)) return NaN;
  let position = 0;
  const atom = () => { let sign=1; while(source[position]==='+' || source[position]==='-') { if(source[position++]==='-') sign *= -1; } if(source[position]==='('){ position++;const v=expression();if(source[position++]!==')')throw Error();return sign*v; } const m=source.slice(position).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);if(!m)throw Error();position+=m[0].length;return sign*Number(m[0]); };
  const term = () => { let v=atom();while(source[position]==='*'||source[position]==='/'){const op=source[position++];const n=atom();v=op==='*'?v*n:v/n;}return v; };
  const expression = () => { let v=term();while(source[position]==='+'||source[position]==='-'){const op=source[position++];const n=term();v=op==='+'?v+n:v-n;}return v; };
  try { const value=expression(); return position===source.length && Number.isFinite(value) ? value : NaN; } catch { return NaN; }
}

function initialValue(step) {
  if (step.kind === 'tune') return Object.fromEntries(step.controls.map(c => [c.id,c.initial ?? c.min]));
  if (step.kind === 'match') return step.pairs.map(() => -1);
  if (step.kind === 'order') return [];
  if (step.kind === 'story') return true;
  return '';
}

function lineScene(step, value, t) {
  const samples=step.rule.samples, xs=samples.map(p=>p[0]), ys=samples.map(p=>p[1]);
  const maxX=Math.max(...xs,1)+.7, maxY=Math.max(...ys,1)*1.35;
  const x=n=>54+n/maxX*374, y=n=>225-n/maxY*176;
  const ids=step.controls.map(c=>c.id), slope=Number(value[ids[0]]||0), intercept=Number(value[ids[1]]||0);
  const mse=samples.reduce((s,[a,b])=>s+(slope*a+intercept-b)**2,0)/samples.length;
  return `<div class="mission-plot-key"><span><i class="observed-dot"></i>${t.target}</span><span><i class="model-line"></i>${t.model}</span></div><svg class="mission-plot" viewBox="0 0 470 275" role="img" aria-label="${escape(t.model)}: y = ${format(slope)}x + ${format(intercept)}"><defs><clipPath id="mission-chart-clip"><rect x="50" y="28" width="390" height="200"/></clipPath></defs>${[0,1,2,3,4].map(i=>`<path d="M54 ${y(maxY*i/4)}H430" stroke="#d8d2df" stroke-dasharray="3 6"/>`).join('')}<path d="M54 32V225H434" fill="none" stroke="#95879e" stroke-width="2"/><g clip-path="url(#mission-chart-clip)"><path d="M${x(0)} ${y(intercept)}L${x(maxX)} ${y(slope*maxX+intercept)}" stroke="#8c67c3" stroke-width="4" stroke-linecap="round"/>${samples.map(([a,b])=>`<path d="M${x(a)} ${y(b)}V${y(slope*a+intercept)}" stroke="#eea369" stroke-width="2" stroke-dasharray="4 4"/><circle cx="${x(a)}" cy="${y(b)}" r="8" fill="#73a147" stroke="#f8f7f0" stroke-width="3"/>`).join('')}</g>${samples.map(([a,b])=>`<text x="${x(a)+12}" y="${y(b)-12}">${a}, ${b}</text><text x="${x(a)}" y="246" text-anchor="middle">${a}</text>`).join('')}<text x="245" y="272" text-anchor="middle">${escape(step.xLabel || t.input)}</text><text x="14" y="24">${escape(step.yLabel || t.output)}</text></svg><div class="mission-live-metric"><span>${t.error}</span><strong>${format(mse)}</strong><span class="mission-goal-dot ${mse <= step.rule.maxError ? 'on' : ''}">≤ ${format(step.rule.maxError)}</span></div>`;
}

function valueScene(step,value,t,mission,locale) {
  const controls=step.controls;
  if(mission.id==='attention') {
    const vals=[2,4,8];const total=controls.reduce((s,c,i)=>s+Number(value[c.id]||0)*(vals[i]||1),0);
    return `<div class="attention-tokens">${controls.map((c,i)=>`<div class="attention-token"><span class="attention-word">${escape(c.label)}</span><div class="attention-tube"><i style="height:${Math.max(0,Math.min(100,Number(value[c.id]||0)*100))}%"></i></div><strong>${format(Number(value[c.id]))}</strong><small>${label(locale,'Value','Wert','Valeur')} ${vals[i]||1}</small></div>`).join('')}</div><div class="mission-live-metric"><span>${label(locale,'Weight total','Summe der Gewichte','Somme des poids')}</span><strong>${format(controls.reduce((s,c)=>s+Number(value[c.id]||0),0))}</strong></div><div class="mission-live-metric"><span>${label(locale,'Weighted mixture','Gewichtete Mischung','Mélange pondéré')}</span><strong>${format(total)}</strong></div>`;
  }
  if(mission.id==='vectors') {
    const contributions=[3*Number(value.sweet||0),2*Number(value.crunch||0)];
    return `<div class="mission-contributions">${controls.map((c,i)=>`<div><span>${escape(c.label)}</span><p>${i===0?3:2} <i>×</i> ${format(Number(value[c.id]))}</p><strong>${format(contributions[i])}</strong></div>`).join('<b>+</b>')}</div><div class="mission-equation-total"><span>${t.total}</span><strong>${format(contributions[0]+contributions[1])}</strong></div>`;
  }
  if(mission.id==='probability') {
    return countsScene([{label:controls[0].label,value:Number(value.true||0)},{label:controls[1].label,value:Number(value.false||0)}],locale);
  }
  if(mission.id==='classification') {
    const score=Number(value.weight||0)+Number(value.bias||0),probability=1/(1+Math.exp(-score));
    return `<div class="mission-classifier"><span>${label(locale,'Input','Eingabe','Entrée')} x = 1</span><div class="classifier-score">1 × ${format(Number(value.weight||0))} + (${format(Number(value.bias||0))})<strong>${format(score)}</strong></div><div class="classifier-transform">↓ sigmoid ↓</div><div class="classifier-probability"><i style="width:${probability*100}%"></i><b>${format(probability*100)}%</b></div><small>${label(locale,'Probability of class 1','Wahrscheinlichkeit für Klasse 1','Probabilité de la classe 1')}</small></div>`;
  }
  if(mission.id==='evaluation') {
    const tp=Number(value.tp||0),fp=Number(value.fp||0),fn=Number(value.fn||0);
    return countsScene(controls.map(c=>({label:c.label,value:Number(value[c.id]||0)})),locale)+`<div class="evaluation-live-ratios"><div><span>${label(locale,'True / all alarms','Echte / alle Alarme','Vraies / toutes les alertes')}</span><strong>${tp} / ${tp+fp} = ${tp+fp?format(tp/(tp+fp)):'—'}</strong></div><div><span>${label(locale,'Found / all emergencies','Erkannte / alle Notfälle','Trouvées / toutes les urgences')}</span><strong>${tp} / ${tp+fn} = ${tp+fn?format(tp/(tp+fn)):'—'}</strong></div></div>`;
  }
  if(mission.id==='backprop') {
    const w=Number(value.w||0),a=2*w,y=a+1,loss=(y-7)**2,gradient=4*(y-7);
    return `<div class="mission-chain-scene"><div class="chain-forward"><div><small>w</small><strong>${format(w)}</strong></div><i>× 2 →</i><div><small>a</small><strong>${format(a)}</strong></div><i>+ 1 →</i><div><small>y</small><strong>${format(y)}</strong></div></div><div class="chain-target">${label(locale,'Target','Ziel','Cible')} y = 7</div><div class="chain-loss">L = (${format(y)} − 7)² = <strong>${format(loss)}</strong></div><div class="chain-backward"><span>← ${label(locale,'Sensitivity travels back','Empfindlichkeit läuft zurück','La sensibilité revient')}</span><strong>∂L/∂w = ${format(gradient)}</strong></div></div>`;
  }
  if(mission.id==='generalization') {
    const strength=Number(value.strength||0),table={0:[.05,.30],0.5:[.12,.15],1:[.25,.22]},errors=table[strength]||table[0];
    return `<div class="generalization-gardens">${errors.map((error,i)=>`<div><span>${i?label(locale,'New plants','Neue Pflanzen','Plantes inédites'):label(locale,'Training plants','Trainingspflanzen','Plantes connues')}</span><div class="garden-icon" aria-hidden="true">${i?'❀':'✿'}</div><div class="garden-error"><i style="height:${error/.4*100}%"></i></div><strong>${format(error)}</strong><small>${label(locale,'Error','Fehler','Erreur')}</small></div>`).join('')}</div><div class="mission-scene-label">${label(locale,'Compare new-data error at each setting.','Vergleiche den Fehler auf neuen Daten bei jeder Einstellung.','Compare l’erreur inédite pour chaque réglage.')}</div>`;
  }
  if(mission.id==='neuron') {
    const signal=2*Number(value.w1||0)+Number(value.w2||0)+Number(value.bias||0);
    return `<div class="mission-neuron-live"><div class="neuron-live-inputs"><span>2 × (${format(Number(value.w1||0))})</span><b>+</b><span>1 × (${format(Number(value.w2||0))})</span></div><div class="neuron-live-bias">+ ${label(locale,'bias','Bias','biais')} (${format(Number(value.bias||0))})</div><div class="neuron-live-sum">Σ = ${format(signal)}</div><div class="classifier-transform">↓ ReLU ↓</div><div class="neuron-live-output">max(0, ${format(signal)}) = <strong>${format(Math.max(0,signal))}</strong></div></div>`;
  }
  if(mission.id==='derivatives') {
    const rate=Number(value.rate||0),next=2-4*rate;
    const x=n=>235+n*44,y=n=>191-n*n*9;
    return `<svg class="mission-landscape" viewBox="0 0 470 235" role="img" aria-label="x: 2 → ${format(next)}"><path d="M${Array.from({length:81},(_,i)=>{const n=-4+i*.1;return `${x(n)},${y(n)}`;}).join(' L')}" fill="none" stroke="#9678b2" stroke-width="3"/><path d="M235 40V205" stroke="#c2b4cb" stroke-dasharray="4 5"/><circle cx="${x(2)}" cy="${y(2)}" r="8" fill="#d5c2e4" stroke="#a78bb9" stroke-width="2"/><path d="M${x(2)} ${y(2)}L${x(next)} ${y(next)}" stroke="#9ab96e" stroke-width="2" stroke-dasharray="4 5"/><circle cx="${x(next)}" cy="${y(next)}" r="13" fill="#b8dc83" stroke="#557f32" stroke-width="3"/><text x="${x(2)+13}" y="${y(2)+4}">x = 2</text><text x="235" y="226" text-anchor="middle">f(x) = x² · x′ = 2 − 4 × ${format(rate)} = ${format(next)}</text></svg><div class="mission-live-metric"><span>${label(locale,'New error','Neuer Fehler','Nouvelle erreur')}</span><strong>${format(next*next)}</strong></div>`;
  }
  const symbols=mission.id==='classification'?['●','◆']:mission.id==='generalization'?['✿','✿']:['◈','✦','●'];
  return `<div class="mission-signal-scene">${controls.map((c,i)=>{const n=Number(value[c.id]||0),span=c.max-c.min||1,percent=Math.max(0,Math.min(100,(n-c.min)/span*100));return `<div class="mission-signal"><div class="signal-symbol">${symbols[i%symbols.length]}</div><span>${escape(c.label)}</span><div class="signal-meter"><i style="width:${percent}%"></i></div><strong>${format(n)}</strong></div>`;}).join('<span class="signal-connector" aria-hidden="true">→</span>')}</div>`;
}

function countsScene(counts,locale) {
  const largest=Math.max(...counts.map(c=>c.value),1);
  return `<div class="mission-counts-scene">${counts.map((c,i)=>`<div class="count-group ${i%2?'count-other':''}"><div class="count-heading"><span>${escape(c.label)}</span><strong>${format(c.value)}</strong></div><div class="count-bar"><i style="width:${c.value/largest*100}%"></i></div><div class="count-parcels" aria-hidden="true">${Array.from({length:Math.min(40,Math.max(0,Math.floor(c.value)))},()=>'<i>□</i>').join('')}</div></div>`).join('')}</div>`;
}

function vectorScene(features,weights,locale) {
 return `<div class="mission-vector-scene"><span>${label(locale,'Features','Merkmale','Caractéristiques')}</span><div>${features.map(n=>`<b>${n}</b>`).join('')}</div><span>${label(locale,'Weights','Gewichte','Poids')}</span><div>${weights.map(n=>`<b>${n}</b>`).join('')}</div><p>${label(locale,'Match positions · multiply · add','Positionen verbinden · multiplizieren · addieren','Aligner · multiplier · additionner')}</p></div>`;
}

function everydayScene(mission,step,t,locale) {
  const id=mission.id;
  if(step.visual?.kind==='counts'&&step.visual.counts)return countsScene(step.visual.counts,locale);
  if(id==='vectors'&&step.phase==='transfer')return vectorScene([4,3,2],[2,-1,0],locale);
  if(id==='neuron'&&step.phase==='transfer')return vectorScene([1,3],[3,-2],locale)+`<div class="mission-scene-label">${label(locale,'Bias −1 → ReLU → ?','Bias −1 → ReLU → ?','Biais −1 → ReLU → ?')}</div>`;
  if(id==='attention'&&step.kind==='number') {
    const transfer=step.phase==='transfer',values=transfer?[1,3,5]:[2,4,8],weights=transfer?['0.241','0.341','0.418']:['1/6','2/6','3/6'];
    return `<div class="mission-mixer">${values.map((v,i)=>`<div><span>${transfer?label(locale,'Channel','Kanal','Canal'):label(locale,'Signal','Signal','Signal')} ${i+1}</span><div class="mixer-channel"><i style="height:${transfer?[24.1,34.1,41.8][i]:[16.67,33.33,50][i]}%"></i></div><small>${label(locale,'Weight','Gewicht','Poids')} ${weights[i]}</small><strong>${label(locale,'Value','Wert','Valeur')} ${v}</strong></div>`).join('')}</div><div class="mission-equation-question">${label(locale,'Weighted result','Gewichtetes Ergebnis','Résultat pondéré')} <b>?</b></div>`;
  }
  if(id==='derivatives'&&step.phase==='transfer')return `<div class="mission-heater"><svg viewBox="0 0 120 170" aria-hidden="true"><rect x="43" y="15" width="34" height="105" rx="17" fill="#e9d7c7" stroke="#bf9675" stroke-width="3"/><path d="M60 46v80" stroke="#db9b69" stroke-width="14" stroke-linecap="round"/><circle cx="60" cy="132" r="25" fill="#e8b78d" stroke="#bf9675" stroke-width="3"/><path d="M83 40h10m-10 20h7m-7 20h10" stroke="#bda0a0" stroke-width="3"/></svg><div>w = 4<br><small>${label(locale,'Slope','Steigung','Pente')} = 8</small></div></div><div class="mission-equation-question">4 − 0.1 × 8 <b>?</b></div>`;
  if(id==='classification'&&step.phase==='transfer')return `<div class="mission-threshold-scene"><div><span>${label(locale,'Spam probability','Spam-Wahrscheinlichkeit','Probabilité de spam')}</span><strong>0.119</strong></div><i>↔</i><div><span>${label(locale,'Threshold','Schwelle','Seuil')}</span><strong>0.3</strong></div></div><div class="mission-equation-question">${label(locale,'Flag or leave?','Markieren oder lassen?','Signaler ou laisser ?')} <b>?</b></div>`;

  if(id==='prediction' && step.phase!=='transfer') return `<div class="mission-delivery"><div class="delivery-building">▥<span>${label(locale,'Depot','Depot','Dépôt')}</span></div><div class="delivery-road"><i></i><div class="delivery-bot">${robotSVG()}</div><span>1 → 3 · 2 → 5 · 3 → 7</span></div><div class="delivery-house">⌂<span>${label(locale,'Your door','Deine Tür','Chez toi')}</span></div></div>`;
  if(id==='prediction') return `<div class="mission-fruit-scene"><span aria-hidden="true">◉ ◉ ◉</span><div>1 → 13<br>2 → 16</div><strong>3 → ?</strong></div>`;
  if(id==='probability')return countsScene(step.phase==='transfer'?[{label:label(locale,'Spam','Spam','Spam'),value:5},{label:label(locale,'Ordinary mail','Normale Post','Courriels ordinaires'),value:15}]:[{label:label(locale,'True alarms','Echte Alarme','Vraies alarmes'),value:8},{label:label(locale,'False alarms','Falsche Alarme','Fausses alarmes'),value:18}],locale);
  if(id==='evaluation')return countsScene([{label:label(locale,'Detected','Erkannt','Détectées'),value:step.phase==='transfer'?9:6},{label:label(locale,'False alarms','Fehlalarme','Fausses alertes'),value:step.phase==='transfer'?3:2},{label:label(locale,'Missed','Übersehen','Manquées'),value:step.phase==='transfer'?6:4}],locale);
  if(id==='classification')return `<div class="mission-classification-scene" aria-hidden="true"><div>● → ✓</div><div>◆ → !</div></div><div class="mission-scene-label">${escape(mission.scene)}</div>`;
  if(id==='backprop')return `<div class="mission-static-chain"><span>w</span><i>× ${step.phase==='transfer'?3:2} →</i><span>a</span><i>+ ${step.phase==='transfer'?2:1} →</i><span>y</span></div><div class="mission-scene-label">L = (y − ${step.phase==='transfer'?8:7})²</div>`;
  if(['neuron','vectors'].includes(id)) return `<div class="mission-network" aria-hidden="true"><div class="network-inputs"><span>x₁</span><span>x₂</span></div><div class="network-wires">⟶<br>⟶</div><div class="network-node">Σ</div><div class="network-wires">⟶</div><div class="network-output">${id==='backprop'?'∂':'f(x)'}</div></div><div class="mission-scene-label">${escape(mission.scene)}</div>`;
  if(id==='attention') return `<div class="mission-word-scene"><span>Q</span><i>↗<br>→<br>↘</i><div><b>K₁ · V₁</b><b>K₂ · V₂</b><b>K₃ · V₃</b></div></div><div class="mission-scene-label">${escape(mission.scene)}</div>`;
  if(id==='generalization') return `<div class="mission-gardens" aria-hidden="true"><div>✿ ✿ ✿<br>✿ ✿ ✿<small>${label(locale,'Training','Training','Entraînement')}</small></div><span>→</span><div>✿ ❀ ✿<br>❀ ✿ ❀<small>${label(locale,'New data','Neue Daten','Nouvelles données')}</small></div></div>`;
  if(id==='research') return `<div class="mission-research" aria-hidden="true"><div><span>A</span>⚗</div><i>↔</i><div><span>B</span>⚗</div></div><div class="mission-scene-label">${escape(mission.scene)}</div>`;
  if(id==='derivatives') return `<svg class="mission-landscape" viewBox="0 0 470 220" aria-hidden="true"><path d="M40 30Q235 340 430 30" fill="#e1d6ed" stroke="#9678b2" stroke-width="3"/><circle cx="100" cy="110" r="17" fill="#b8dc83" stroke="#557f32" stroke-width="3"/><path d="m125 120 25 30m-17 0h17v-17" fill="none" stroke="#557f32" stroke-width="3"/></svg>`;
  return `<div class="mission-regression" aria-hidden="true"><svg viewBox="0 0 380 180"><path d="M25 150H350M25 150V20" stroke="#9e8aaa" fill="none"/><path d="M40 140 330 30" stroke="#8c67c3" stroke-width="4"/>${[[65,120],[120,80],[175,103],[230,60],[290,60]].map(([x,y])=>`<path d="M${x} ${y}V${155-x*.38}" stroke="#dc9e68" stroke-width="3"/><circle cx="${x}" cy="${y}" r="7" fill="#86aa5e"/>`).join('')}</svg></div><div class="mission-scene-label">${escape(mission.scene)}</div>`;
}

export function mountMission(root, { mission, session, locale='en', onChange=()=>{}, onAttempt=()=>{}, onComplete=()=>{}, onExit=()=>{}, onReplay=()=>{}, review=false }) {
  const t=UI[locale]||UI.en;
  const steps=review && mission.steps.length>1 ? [mission.steps.filter(s=>s.phase==='transfer').at(-1)] : mission.steps;
  let state={version:1,index:0,answers:{},drafts:{},assisted:[],combo:0,...clone(session||{})};
  state.answers ||= {};state.drafts ||= {};state.assisted ||= [];
  state.index=Math.max(0,Math.min(steps.length-1,Number(state.index)||0));
  let hint=false, feedback='', selectedLeft=0, completed=false, destroyed=false;
  const publish=()=>onChange(clone(state));
  const current=()=>steps[state.index];
  const accepted=()=>Object.hasOwn(state.answers,current().id) && evaluateStep(current(),state.answers[current().id]);
  const value=()=>accepted()?state.answers[current().id]:(state.drafts[current().id]??initialValue(current()));
  const gradedValue=()=>current().kind==='number'?parseMissionNumber(value()):value();
  const count=()=>steps.filter(s=>Object.hasOwn(state.answers,s.id)&&evaluateStep(s,state.answers[s.id])).length;
  const remember=(next)=>{if(accepted())return;state.drafts[current().id]=next;feedback='';publish();};
  function focus(selector) {requestAnimationFrame(()=>{if(!destroyed)root.querySelector(selector)?.focus({preventScroll:true});});}
  function scrollTo(selector,block='center') {requestAnimationFrame(()=>{if(destroyed)return;const reduced=document.body.classList.contains('reduce-motion')||window.matchMedia('(prefers-reduced-motion: reduce)').matches;root.querySelector(selector)?.scrollIntoView({block,behavior:reduced?'auto':'smooth'});});}
  function scene() {const s=current();return s.kind==='tune'?s.rule.kind==='line-mse'?lineScene(s,value(),t):valueScene(s,value(),t,mission,locale):everydayScene(mission,s,t,locale);}
  function controls() {
    const s=current(),v=value(),disabled=accepted()?'disabled':'';
    if(s.kind==='tune') return `<div class="mission-control-list">${s.controls.map(c=>`<div class="mission-control"><div class="mission-control-title"><label for="mission-control-${escape(c.id)}">${escape(c.label)}</label><output data-output="${escape(c.id)}">${format(Number(v[c.id]))}</output></div><div class="mission-slider-row"><button type="button" class="mission-adjust" data-action="decrease" data-control="${escape(c.id)}" aria-label="${escape(c.label)} −" ${disabled}>−</button><input id="mission-control-${escape(c.id)}" data-control="${escape(c.id)}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${v[c.id]}" ${disabled}><button type="button" class="mission-adjust" data-action="increase" data-control="${escape(c.id)}" aria-label="${escape(c.label)} +" ${disabled}>+</button></div><div class="mission-range-labels"><span>${c.min}</span><span>${c.max}</span></div></div>`).join('')}</div>`;
    if(s.kind==='match') {
      const rights=s.pairs.map((_,i)=>i).sort((a,b)=>((a*7+3)%s.pairs.length)-((b*7+3)%s.pairs.length));
      // Rotation guarantees a non-identity display even when the small prime shares a factor.
      if(rights.every((n,i)=>n===i)&&rights.length>1)rights.push(rights.shift());
      return `<p class="mission-instruction">${t.selectLeft}</p><div class="mission-match"><div class="match-column">${s.pairs.map((p,i)=>`<button type="button" class="mission-match-item ${selectedLeft===i?'selected':''} ${v[i]>=0?'connected':''}" data-action="match-left" data-left="${i}" aria-pressed="${selectedLeft===i}" ${disabled}><span class="match-letter">${i+1}</span><span>${escape(p.left)}</span>${v[i]>=0?`<span class="match-mark">${String.fromCharCode(65+rights.indexOf(v[i]))}</span>`:''}</button>`).join('')}</div><div class="match-column">${rights.map((index,i)=>`<button type="button" class="mission-match-item ${v.includes(index)?'connected':''}" data-action="match-right" data-right="${index}" aria-label="${escape(t.connection)}: ${escape(s.pairs[index].right)}" ${disabled}><span class="match-letter">${String.fromCharCode(65+i)}</span><span>${escape(s.pairs[index].right)}</span>${v.includes(index)?`<span class="match-mark">${v.indexOf(index)+1}</span>`:''}</button>`).join('')}</div></div><p class="mission-counter">${v.filter(n=>n>=0).length} / ${s.pairs.length} ${t.matched}</p>`;
    }
    if(s.kind==='order') return `<p class="mission-instruction">${t.order}</p><ol class="mission-sequence">${v.map((id,i)=>`<li><button type="button" data-action="order-remove" data-item="${escape(id)}" aria-label="${t.remove}: ${escape(s.items.find(x=>x.id===id)?.label)}" ${disabled}><b>${i+1}</b>${escape(s.items.find(x=>x.id===id)?.label)}<span aria-hidden="true">×</span></button></li>`).join('')}${Array.from({length:Math.max(0,s.items.length-v.length)},(_,i)=>`<li class="sequence-empty"><b>${v.length+i+1}</b><span>···</span></li>`).join('')}</ol><div class="mission-piece-bank">${[...s.items].reverse().map(item=>`<button type="button" data-action="order-add" data-item="${escape(item.id)}" ${disabled||v.includes(item.id)?'disabled':''}>${escape(item.label)}<span aria-hidden="true">＋</span></button>`).join('')}</div><button type="button" class="mission-subtle" data-action="order-undo" ${disabled||!v.length?'disabled':''}>↶ ${t.undo}</button>`;
    if(s.kind==='number') return `<div class="mission-number-workbench"><label for="mission-number">${t.answer}</label><div class="mission-number-row"><input id="mission-number" data-number type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value="${escape(v)}" placeholder="?" aria-describedby="mission-numeric-help" ${disabled}><div class="mission-number-result"><span>${t.calculate}</span><strong data-number-result>${format(parseMissionNumber(v))}</strong></div></div><p id="mission-numeric-help" class="mission-instruction">${t.numericHelp}</p><div class="mission-number-tiles">${(s.tiles||[1,2,3,4,5,6,7,8,9,0]).map(tile=>`<button type="button" data-tile="${escape(typeof tile==='object'?tile.value:tile)}" ${disabled}>${escape(typeof tile==='object'?tile.label:tile)}</button>`).join('')}${['+','−','×','÷'].map(token=>`<button type="button" class="operator" data-tile="${token}" ${disabled}>${token}</button>`).join('')}<button type="button" data-action="number-clear" class="mission-subtle" ${disabled}>${t.clear}</button><button type="button" data-action="number-backspace" aria-label="${t.undo}" ${disabled}>⌫</button></div></div>`;
    return `<div class="mission-story-cue"><span aria-hidden="true">✦</span>${escape(mission.goal)}</div>`;
  }
  function render(focusHeading=false) {
    if(destroyed)return;
    const s=current(),ok=accepted(),n=count(),last=state.index===steps.length-1;
    root.innerHTML=`<section class="mission-player ${ok?'step-accepted':''}" data-no-translate data-mission="${escape(mission.id)}" data-step="${escape(s.id)}" data-kind="${s.kind}" data-phase="${s.phase}" aria-label="${escape(mission.title)}"><header class="mission-top"><button type="button" class="mission-exit" data-action="exit" aria-label="${t.exit}">×</button><div class="mission-progress" role="progressbar" aria-label="${t.progress}" aria-valuemin="0" aria-valuemax="${steps.length}" aria-valuenow="${n}"><i style="width:${n/steps.length*100}%"></i></div><span class="mission-combo" aria-label="${state.combo} ${t.combo}">✦ ${state.combo}</span></header><div class="mission-phase-nav">${['example','principle','transfer'].map((phase,i)=>`<span class="${s.phase===phase?'active':''}"><b>${i+1}</b>${t[phase]}</span>`).join('')}</div><div class="mission-task-heading"><div class="mission-step-kicker">${review?t.transfer:`${t.step} ${state.index+1} ${t.of} ${steps.length}`}<span>·</span>${escape(mission.title)}</div><h1 tabindex="-1">${escape(s.title)}</h1><p>${escape(s.prompt)}</p></div><div class="mission-workspace ${s.kind==='match'||s.kind==='order'?'compact-scene':''}"><div class="mission-scene" data-scene>${scene()}</div><div class="mission-interaction">${controls()}</div></div>${!ok?`<div class="mission-coach ${hint?'mission-hint':''}"><div class="mission-coach-avatar">${robotSVG(ok?'happy':'ready')}</div><div><strong>${ok?t.correct:hint?t.hint:t.awaiting}</strong><p>${escape(ok?s.explanation:hint?s.hint:mission.scene)}</p></div></div>`:''}${feedback==='wrong'?`<div class="mission-feedback is-retry" role="status" tabindex="-1"><b>${t.retry}</b><p>${escape(s.feedback?.incorrect||s.incorrectFeedback||s.hint||t.retryText)}</p></div>`:''}${ok?`<div class="mission-feedback is-correct" role="status" tabindex="-1"><div class="feedback-robot">${robotSVG('happy')}</div><div><b>${state.assisted.includes(s.id)?t.assisted:t.correct}</b><p>${escape(state.assisted.includes(s.id)?t.independent:s.explanation)}</p></div></div>`:''}${feedback==='example'?`<div class="mission-worked-example mission-example" role="status"><b>${t.assisted}</b><p>${t.exampleHelp}</p><p>${escape(s.explanation)}</p></div>`:''}<footer class="mission-actions"><div class="mission-help-actions">${!ok&&s.kind!=='story'?`<button type="button" data-action="hint" class="mission-subtle">${t.hint} <span aria-hidden="true">?</span></button>${hint&&s.phase!=='transfer'?`<button type="button" data-action="reveal" class="mission-subtle">${t.reveal}</button>`:''}`:`<span class="mission-saved">${t.saved}</span>`}</div><button type="button" class="mission-primary" data-action="${ok?'continue':'check'}">${ok?(last?t.finish:t.continue):s.kind==='story'?t.understood:t.check}<span aria-hidden="true">${ok?'→':'✓'}</span></button></footer></section>`;
    if(focusHeading)focus('.mission-task-heading h1');
  }
  function updateScene() {root.querySelector('[data-scene]').innerHTML=scene();const s=current(),v=value();if(s.kind==='tune')s.controls.forEach(c=>{const out=root.querySelector(`[data-output="${CSS.escape(c.id)}"]`);if(out)out.textContent=format(Number(v[c.id]));const range=root.querySelector(`input[data-control="${CSS.escape(c.id)}"]`);if(range)range.value=v[c.id];});if(s.kind==='number'){const out=root.querySelector('[data-number-result]');if(out)out.textContent=format(parseMissionNumber(v));}}
  function check() {
    if(accepted()||completed)return;
    const s=current(),answer=gradedValue();
    const correct=evaluateStep(s,answer);onAttempt(correct);
    if(correct) {state.answers[s.id]=clone(answer);delete state.drafts[s.id];state.combo=state.assisted.includes(s.id)?0:(Number(state.combo)||0)+(s.kind==='story'?0:1);feedback='right';publish();render();focus('[data-action="continue"]');scrollTo('.mission-feedback');}
    else {state.combo=0;feedback='wrong';publish();render();focus('.mission-feedback');scrollTo('.mission-feedback');}
  }
  function click(event) {
    const button=event.target.closest('button');if(!button||!root.contains(button)||button.disabled)return;
    const action=button.dataset.action,s=current(),v=value();
    if(action==='exit'){publish();onExit();return;}
    if(action==='check'){check();return;}
    if(action==='continue'){
      if(!accepted())return;
      if(state.index===steps.length-1){if(count()===steps.length&&!completed){completed=true;publish();onComplete(clone(state));}return;}
      state.index++;hint=false;feedback='';selectedLeft=0;publish();render(true);scrollTo('.mission-player','start');return;
    }
    if(accepted())return;
    if(action==='hint'){hint=true;render();focus('[data-action="hint"]');return;}
    if(action==='reveal'&&s.phase!=='transfer'){if(!state.assisted.includes(s.id))state.assisted.push(s.id);state.combo=0;state.drafts[s.id]=clone(solutionFor(s));feedback='example';publish();render();focus('[data-action="check"]');return;}
    if(action==='decrease'||action==='increase'){const c=s.controls.find(c=>c.id===button.dataset.control);const next=Math.min(c.max,Math.max(c.min,Number((Number(v[c.id])+(action==='increase'?1:-1)*c.step).toFixed(8))));remember({...v,[c.id]:next});updateScene();return;}
    if(action==='match-left'){selectedLeft=Number(button.dataset.left);render();focus(`[data-action="match-right"]`);return;}
    if(action==='match-right'){const next=[...v],right=Number(button.dataset.right);const previous=next.indexOf(right);if(previous>=0)next[previous]=-1;next[selectedLeft]=right;remember(next);selectedLeft=next.findIndex(n=>n<0);if(selectedLeft<0)selectedLeft=0;render();focus(next.every(n=>n>=0)?'[data-action="check"]':`[data-action="match-left"][data-left="${selectedLeft}"]`);return;}
    if(action==='order-add'){remember([...v,button.dataset.item]);render();focus('[data-action="order-add"]:not(:disabled), [data-action="check"]');return;}
    if(action==='order-remove'){remember(v.filter(id=>id!==button.dataset.item));render();focus(`[data-action="order-add"][data-item="${CSS.escape(button.dataset.item)}"]`);return;}
    if(action==='order-undo'){remember(v.slice(0,-1));render();focus('[data-action="order-undo"]:not(:disabled), [data-action="order-add"]:not(:disabled)');return;}
    if(button.hasAttribute('data-tile')||action==='number-clear'||action==='number-backspace'){
      const token=button.dataset.tile;let next=String(v);
      if(action==='number-clear')next='';else if(action==='number-backspace')next=next.slice(0,-1);else next+=String(token);
      remember(next);const input=root.querySelector('[data-number]');input.value=next;updateScene();input.focus({preventScroll:true});return;
    }
  }
  function input(event) {
    if(accepted())return;
    if(event.target.matches('input[type="range"][data-control]')){remember({...value(),[event.target.dataset.control]:Number(event.target.value)});updateScene();}
    if(event.target.matches('[data-number]')){remember(event.target.value);updateScene();}
  }
  function keydown(event) {if(event.key==='Enter' && event.target.matches('[data-number]')){event.preventDefault();check();}}
  root.addEventListener('click',click);root.addEventListener('input',input);root.addEventListener('keydown',keydown);
  render();
  return {destroy(){destroyed=true;root.removeEventListener('click',click);root.removeEventListener('input',input);root.removeEventListener('keydown',keydown);},getSession(){return clone(state);}};
}
