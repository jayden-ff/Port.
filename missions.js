// Every visible string is authored in English, German and French. Mathematical
// contracts are shared so a language change cannot change a learner's task.
const t = text => Object.fromEntries(text.split('|').map((value,i) => [['en','de','fr'][i],value.trim()]));
const fields = (names, texts) => Object.fromEntries(names.map((name,i) => [name,t(texts.map(text => text.split('~')[i].trim()).join('|'))]));
const s = (id,phase,kind,texts,extra={}) => ({id,phase,kind,...fields(['title','prompt','hint','explanation'],texts),...extra});
const m = (id,minutes,texts,steps) => ({id,minutes,...fields(['title','scene','goal'],texts),steps});
const pair = (left,right) => ({left:t(left),right:t(right)});
const match = pairs => ({pairs,solution:pairs.map((_,i)=>i)});
const order = labels => ({items:labels.map((label,i)=>({id:`part-${i}`,label:t(label)})),solution:labels.map((_,i)=>`part-${i}`)});
const control = (id,label,min,max,step,initial) => ({id,label:t(label),min,max,step,initial});
const tune = (controls,target,tolerance=0) => ({controls,rule:{kind:'values',target,tolerance},solution:{...target}});
const num = (expected,tolerance=0,tiles=[]) => ({expected,tolerance,tiles});

const missions = [
  m('prediction',5,[
    'Teach a delivery robot~A robot needs to promise delivery times. Its notebook shows distance → minutes: 1 → 3, 2 → 5, 3 → 7.~Fit a prediction rule, then use it in a different shop.',
    'Trainiere einen Lieferroboter~Ein Roboter soll Lieferzeiten nennen. Sein Notizbuch zeigt Strecke → Minuten: 1 → 3, 2 → 5, 3 → 7.~Passe eine Vorhersageregel an und nutze sie in einem anderen Laden.',
    'Entraîne un robot livreur~Un robot doit annoncer ses délais. Son carnet indique distance → minutes : 1 → 3, 2 → 5, 3 → 7.~Ajuste une règle de prédiction puis utilise-la dans un autre magasin.'
  ],[
    s('notice','example','story',[
      'Open the notebook~Each extra distance unit adds two minutes. The dots are observations: times that really happened. Trace that pattern with your eyes.~Compare 3 → 5 and 5 → 7; the change is the same.~A repeated change gives us a useful first prediction, although real deliveries can vary.',
      'Öffne das Notizbuch~Jede zusätzliche Streckeneinheit kostet zwei Minuten. Die Punkte sind Beobachtungen: tatsächlich gemessene Zeiten. Verfolge dieses Muster.~Vergleiche 3 → 5 und 5 → 7: Die Änderung ist gleich.~Eine gleichbleibende Änderung liefert eine erste Vorhersage, obwohl echte Lieferzeiten schwanken können.',
      'Ouvre le carnet~Chaque unité de distance ajoute deux minutes. Les points sont des observations : des délais réellement mesurés. Repère ce motif.~Compare 3 → 5 et 5 → 7 : la variation est identique.~Une variation régulière donne une première prédiction, même si les livraisons réelles peuvent varier.'
    ]),
    s('next-dot','example','number',[
      'Place the next delivery~If this pattern continues, how many minutes would distance 4 take? Build or enter the number.~Add the same change you saw between neighboring dots.~You extended the observed pattern by one distance unit. This is a prediction, not a new measurement.',
      'Setze den nächsten Punkt~Wenn das Muster weitergeht: Wie viele Minuten braucht Strecke 4? Baue die Zahl oder gib sie ein.~Addiere die gleiche Änderung wie zwischen benachbarten Punkten.~Du hast das Muster um eine Streckeneinheit verlängert. Das ist eine Vorhersage, keine neue Messung.',
      'Place la prochaine livraison~Si ce motif continue, combien de minutes faut-il pour la distance 4 ? Compose ou saisis le nombre.~Ajoute la même variation qu’entre deux points voisins.~Tu as prolongé le motif d’une unité de distance. C’est une prédiction, pas une nouvelle mesure.'
    ],num(9,0,[2,7])),
    s('fit-line','example','tune',[
      'Bring the line to the dots~Change the rise per distance unit and the starting time until the line follows all three deliveries. The error meter must fall to 0.1 or less.~First match the rise between dots, then slide the whole line with the starting time.~Rise 2 and starting time 1 predict all three measurements. We checked the average squared distance from the dots.',
      'Bringe die Linie zu den Punkten~Ändere Anstieg pro Streckeneinheit und Startzeit, bis die Linie allen drei Lieferungen folgt. Die Fehleranzeige muss höchstens 0,1 zeigen.~Passe zuerst den Anstieg an. Verschiebe dann die ganze Linie mit der Startzeit.~Anstieg 2 und Startzeit 1 passen zu allen Messungen. Geprüft wurde die mittlere quadrierte Abweichung von den Punkten.',
      'Amène la droite sur les points~Change la hausse par unité de distance et le temps de départ pour suivre les trois livraisons. L’erreur doit être au plus 0,1.~Ajuste d’abord la hausse entre les points, puis déplace toute la droite avec le temps de départ.~Une hausse de 2 et un départ à 1 reproduisent les mesures. Nous vérifions la moyenne des écarts au carré.'
    ],{controls:[control('slope','Rise per unit|Anstieg pro Einheit|Hausse par unité',0,3,.25,0),control('intercept','Starting time|Startzeit|Temps de départ',0,3,.25,0)],rule:{kind:'line-mse',samples:[[1,3],[2,5],[3,7]],maxError:.1},solution:{slope:2,intercept:1}}),
    s('name-rule','principle','story',[
      'Give the pattern a name~A model is an adjustable rule: prediction = rise × input + start. Rise and start are parameters; input is the distance. Error compares prediction with observation.~A parameter changes the rule; an input asks the rule a new question.~Fitting means choosing parameters that reduce prediction error on observations.',
      'Benenne das Muster~Ein Modell ist eine verstellbare Regel: Vorhersage = Anstieg × Eingabe + Start. Anstieg und Start sind Parameter; die Eingabe ist die Strecke. Fehler vergleicht Vorhersage und Beobachtung.~Ein Parameter verändert die Regel; eine Eingabe stellt ihr eine neue Frage.~Anpassen bedeutet, Parameter so zu wählen, dass Vorhersagen besser zu Beobachtungen passen.',
      'Nomme le motif~Un modèle est une règle réglable : prédiction = hausse × entrée + départ. Hausse et départ sont des paramètres ; l’entrée est la distance. L’erreur compare prédiction et observation.~Un paramètre change la règle ; une entrée lui pose une nouvelle question.~Ajuster consiste à choisir des paramètres qui réduisent l’erreur sur les observations.'
    ]),
    s('connect-roles','principle','match',[
      'Connect each role~Connect the thing you change or observe to its role in the robot’s model.~Ask: is it the question, the adjustable rule, or the mismatch?~Inputs, parameters and errors play different roles even when all are written as numbers.',
      'Verbinde die Rollen~Ordne jede veränderbare oder beobachtete Größe ihrer Rolle im Robotermodell zu.~Frage dich: Ist es die Frage, die verstellbare Regel oder die Abweichung?~Eingaben, Parameter und Fehler haben unterschiedliche Rollen, auch wenn alle als Zahlen erscheinen.',
      'Relie les rôles~Relie chaque quantité modifiée ou observée à son rôle dans le modèle du robot.~Demande-toi : est-ce la question, la règle réglable ou l’écart ?~Entrées, paramètres et erreurs ont des rôles distincts, même si tous sont des nombres.'
    ],match([pair('Distance of a new trip|Strecke einer neuen Fahrt|Distance d’un nouveau trajet','Input|Eingabe|Entrée'),pair('Rise of the line|Anstieg der Linie|Hausse de la droite','Parameter|Parameter des Modells|Paramètre'),pair('Predicted time minus observed time|Vorhergesagte minus beobachtete Zeit|Délai prédit moins délai observé','Error|Abweichung|Erreur') ])),
    s('build-cycle','principle','order',[
      'Build a learning loop~Put the actions in a useful order, starting with real deliveries and ending with a checked prediction.~A model needs evidence before fitting, and a new case tests what it learned.~Observe → fit → predict → compare is a reusable learning loop.',
      'Baue eine Lernschleife~Ordne die Handlungen: Beginne mit echten Lieferungen und ende mit einer überprüften Vorhersage.~Vor dem Anpassen braucht das Modell Daten; ein neuer Fall prüft das Gelernte.~Beobachten → anpassen → vorhersagen → vergleichen ist eine wiederverwendbare Lernschleife.',
      'Construis une boucle d’apprentissage~Ordonne les actions, des livraisons réelles à une prédiction vérifiée.~Il faut des observations pour ajuster le modèle, puis un nouveau cas pour le tester.~Observer → ajuster → prédire → comparer forme une boucle réutilisable.'
    ],order(['Collect observed deliveries|Sammle beobachtete Lieferungen|Recueillir les livraisons observées','Adjust the parameters|Passe die Parameter an|Ajuster les paramètres','Predict a new delivery|Sage eine neue Lieferung vorher|Prédire une nouvelle livraison','Compare with its real time|Vergleiche mit ihrer echten Zeit|Comparer au délai réel'])),
    s('fruit-transfer','transfer','number',[
      'A different shop, your rule~A fruit shop charges 13 for 1 basket and 16 for 2 baskets. Its rule has a fixed fee plus the same amount per basket. What is the charge for 3 baskets?~Find the change per basket, then separate it from the fixed fee. A different example: charges 7 and 9 imply a rise of 2.~The rise is 3 and the fixed fee is 10, so 3 baskets cost 19. You transferred the model to a new setting.',
      'Ein anderer Laden, deine Regel~Ein Obstladen berechnet 13 für 1 Korb und 16 für 2 Körbe. Es gibt eine Grundgebühr und denselben Preis pro Korb. Was kosten 3 Körbe?~Finde zuerst die Änderung pro Korb und dann die Grundgebühr. Anderes Beispiel: Preise 7 und 9 ergeben Anstieg 2.~Der Anstieg ist 3 und die Grundgebühr 10. Drei Körbe kosten daher 19. Du hast das Modell auf eine neue Situation übertragen.',
      'Un autre magasin, ta règle~Un fruitier facture 13 pour 1 panier et 16 pour 2 paniers. Il applique des frais fixes et le même prix par panier. Combien coûtent 3 paniers ?~Trouve la hausse par panier, puis les frais fixes. Autre exemple : des prix de 7 et 9 donnent une hausse de 2.~La hausse est 3 et les frais fixes sont 10 : trois paniers coûtent 19. Tu as transféré le modèle à une autre situation.'
    ],num(19,0,[1,2,3,13,16]))
  ]),
  m('vectors',5,[
    'Pack the robot’s basket~A robot rates a snack using sweetness and crunch. Each feature gets a different importance.~Build a weighted sum and explain zero and negative weights.',
    'Packe den Roboterkorb~Ein Roboter bewertet einen Snack mit Süße und Knusprigkeit. Jedes Merkmal bekommt eine andere Bedeutung.~Baue eine gewichtete Summe und deute Gewichte von null und negative Gewichte.',
    'Prépare le panier du robot~Un robot évalue un goûter selon sa douceur et son croquant. Chaque caractéristique a une importance différente.~Construis une somme pondérée et interprète les poids nuls et négatifs.'
  ],[
    s('snack','example','story',[
      'Two features, one snack~Our snack has sweetness 3 and crunch 2. A vector is simply this ordered list: [3, 2]. Keep the order: sweetness first.~Swapping the numbers would describe a different snack.~Vectors let a model keep several features together without mixing up their meanings.',
      'Zwei Merkmale, ein Snack~Unser Snack hat Süße 3 und Knusprigkeit 2. Ein Vektor ist einfach diese geordnete Liste: [3, 2]. Süße steht zuerst.~Vertauschte Zahlen würden einen anderen Snack beschreiben.~Vektoren halten mehrere Merkmale zusammen, ohne ihre Bedeutungen zu vertauschen.',
      'Deux caractéristiques, un goûter~Notre goûter a une douceur de 3 et un croquant de 2. Un vecteur est cette liste ordonnée : [3, 2]. La douceur vient en premier.~Inverser les nombres décrirait un autre goûter.~Les vecteurs regroupent plusieurs caractéristiques sans confondre leurs significations.'
    ]),
    s('contribution','example','number',[
      'Double the sweetness~The robot gives sweetness a weight of 2. What contribution does sweetness 3 make to the score?~A weight multiplies its feature: use 3 × 2.~The contribution is 6. It is one part of the total, not the whole score.',
      'Verdopple die Süße~Der Roboter gibt Süße das Gewicht 2. Welchen Beitrag liefert Süße 3 zum Ergebnis?~Ein Gewicht multipliziert sein Merkmal: rechne 3 × 2.~Der Beitrag ist 6. Er ist ein Teil des Gesamtergebnisses, nicht das ganze Ergebnis.',
      'Double la douceur~Le robot donne à la douceur un poids de 2. Quelle contribution apporte une douceur de 3 ?~Un poids multiplie sa caractéristique : calcule 3 × 2.~La contribution vaut 6. C’est une partie du score, pas le score entier.'
    ],num(6,0,[2,3])),
    s('set-weights','example','tune',[
      'Choose the robot’s priorities~Set sweetness weight to 2 and crunch weight to 1. Watch how each feature contributes.~Change importance, not the measured feature values.~The score is 3 × 2 + 2 × 1 = 8. Each position in the feature vector meets the same position in the weight vector.',
      'Wähle die Prioritäten~Setze das Gewicht für Süße auf 2 und für Knusprigkeit auf 1. Beobachte die einzelnen Beiträge.~Ändere die Bedeutung, nicht die gemessenen Merkmalswerte.~Das Ergebnis ist 3 × 2 + 2 × 1 = 8. Jede Position im Merkmalsvektor trifft die gleiche Position im Gewichtsvektor.',
      'Choisis les priorités~Règle le poids de la douceur sur 2 et celui du croquant sur 1. Observe les contributions.~Change l’importance, pas les caractéristiques mesurées.~Le score vaut 3 × 2 + 2 × 1 = 8. Les positions correspondantes des deux vecteurs sont multipliées.'
    ],tune([control('sweet','Sweetness weight|Gewicht für Süße|Poids de la douceur',-2,3,.5,0),control('crunch','Crunch weight|Gewicht für Knusprigkeit|Poids du croquant',-2,3,.5,0)],{sweet:2,crunch:1})),
    s('dot-product','principle','story',[
      'Name the operation~Multiply matching positions, then add the contributions: this is a dot product. A zero weight ignores a feature; a negative weight subtracts its contribution.~Positive means add, zero means ignore, negative means subtract.~A weighted sum encodes the model’s priorities. Large feature values matter only through their weights.',
      'Benenne die Rechenart~Multipliziere passende Positionen und addiere die Beiträge: Das heißt Skalarprodukt. Gewicht null ignoriert ein Merkmal; ein negatives Gewicht zieht seinen Beitrag ab.~Positiv addiert, null ignoriert, negativ zieht ab.~Eine gewichtete Summe bildet die Prioritäten des Modells ab. Große Merkmalswerte wirken nur durch ihre Gewichte.',
      'Nomme l’opération~Multiplie les positions correspondantes puis additionne : c’est un produit scalaire. Un poids nul ignore une caractéristique ; un poids négatif retire sa contribution.~Positif ajoute, zéro ignore, négatif retire.~Une somme pondérée traduit les priorités du modèle. Une grande valeur agit seulement à travers son poids.'
    ]),
    s('weight-roles','principle','match',[
      'Connect weights to effects~Match each weight with what it does to a feature value of 4.~Compute 4 × weight before choosing the effect.~Weights can amplify, remove or reverse a contribution.',
      'Verbinde Gewichte und Wirkung~Ordne jedem Gewicht seine Wirkung auf den Merkmalswert 4 zu.~Rechne vor dem Zuordnen 4 × Gewicht.~Gewichte können einen Beitrag verstärken, entfernen oder umkehren.',
      'Relie poids et effets~Associe chaque poids à son effet sur une caractéristique de valeur 4.~Calcule 4 × poids avant de choisir l’effet.~Les poids amplifient, annulent ou inversent une contribution.'
    ],match([pair('Weight 2|Gewicht 2|Poids 2','Contribution +8|Beitrag +8|Apport +8'),pair('Weight 0|Gewicht 0|Poids 0','Contribution 0|Beitrag 0|Apport 0'),pair('Weight −1|Gewicht −1|Poids −1','Contribution −4|Beitrag −4|Apport −4')])),
    s('sum-steps','principle','order',[
      'Build the score~Order the recipe for a dot product, starting with aligning features.~Add only after each matching multiplication is complete.~Alignment → multiplication → addition turns two lists into a single score.',
      'Baue das Ergebnis~Ordne das Rezept für ein Skalarprodukt. Beginne mit dem Ausrichten der Merkmale.~Addiere erst, nachdem die passenden Werte multipliziert wurden.~Ausrichten → multiplizieren → addieren macht aus zwei Listen eine einzelne Zahl.',
      'Construis le score~Ordonne la recette du produit scalaire en commençant par aligner les caractéristiques.~Additionne seulement après les multiplications correspondantes.~Aligner → multiplier → additionner transforme deux listes en un score.'
    ],order(['Align features with weights|Ordne Merkmale ihren Gewichten zu|Aligner caractéristiques et poids','Multiply matching positions|Multipliziere passende Positionen|Multiplier les positions correspondantes','Add the contributions|Addiere die Beiträge|Additionner les contributions'])),
    s('route-transfer','transfer','number',[
      'Rate a new route~A route has [scenery, traffic, shade] = [4, 3, 2]. Use weights [2, −1, 0]. What is its score?~Keep positions aligned. For another route [1, 2] with weights [3, −1], the score would be 3 − 2.~The score is 4 × 2 − 3 × 1 + 2 × 0 = 5. Traffic penalizes the route and shade is ignored.',
      'Bewerte eine neue Route~Eine Route hat [Aussicht, Verkehr, Schatten] = [4, 3, 2]. Nutze Gewichte [2, −1, 0]. Wie lautet ihr Ergebnis?~Halte die Reihenfolge ein. Für [1, 2] mit Gewichten [3, −1] wäre das Ergebnis 3 − 2.~Das Ergebnis ist 4 × 2 − 3 × 1 + 2 × 0 = 5. Verkehr verschlechtert die Bewertung; Schatten wird ignoriert.',
      'Évalue un nouveau trajet~Un trajet a [paysage, circulation, ombre] = [4, 3, 2]. Utilise les poids [2, −1, 0]. Quel est son score ?~Respecte les positions. Pour [1, 2] avec les poids [3, −1], le score serait 3 − 2.~Le score vaut 4 × 2 − 3 × 1 + 2 × 0 = 5. La circulation pénalise le trajet et l’ombre est ignorée.'
    ],num(5,0,[0,2,3,4,-1]))
  ]),
  m('probability',5,[
    'Investigate the alarm~A station watches 100 parcels. Ten contain fragile glass; an alarm is useful but sometimes wrong.~Find how often a positive signal really indicates a fragile parcel.',
    'Untersuche den Alarm~Eine Station prüft 100 Pakete. Zehn enthalten zerbrechliches Glas; ihr Alarm ist nützlich, irrt sich aber manchmal.~Bestimme, wie oft hinter einem positiven Signal wirklich ein zerbrechliches Paket steckt.',
    'Enquête sur l’alarme~Une station surveille 100 colis. Dix contiennent du verre fragile ; son alarme est utile mais se trompe parfois.~Trouve la fréquence des vrais colis fragiles parmi les signaux positifs.'
  ],[
    s('parcel-room','example','story',[
      'Count before guessing~Among 10 fragile parcels the alarm rings for 8. Among 90 sturdy parcels it also rings for 18. Both groups enter the same alarm queue.~An alarm can come from either group. Keep the counts separate.~A reliable-looking detection rate alone does not tell us what an alarm means.',
      'Zähle vor dem Schätzen~Bei 10 zerbrechlichen Paketen ertönt der Alarm 8-mal. Bei 90 stabilen Paketen ertönt er ebenfalls 18-mal. Beide Gruppen landen in derselben Alarmwarteschlange.~Ein Alarm kann aus jeder Gruppe stammen. Halte die Zahlen getrennt.~Eine hohe Erkennungsrate allein sagt noch nicht, was ein Alarm bedeutet.',
      'Compte avant de deviner~Sur 10 colis fragiles, l’alarme sonne 8 fois. Sur 90 colis solides, elle sonne aussi 18 fois. Les deux groupes arrivent dans la même file d’alarme.~Une alarme peut provenir de chaque groupe. Sépare bien les comptes.~Un bon taux de détection ne suffit pas à interpréter une alarme.'
    ]),
    s('alarm-total','example','number',[
      'Build the alarm queue~There are 8 true alarms and 18 false alarms. How many parcels are in the alarm queue?~Add both kinds of alarm; do not include parcels with no alarm.~The queue has 26 parcels. Only 8 of these are actually fragile.',
      'Baue die Alarmwarteschlange~Es gibt 8 echte und 18 falsche Alarme. Wie viele Pakete stehen in der Alarmwarteschlange?~Addiere beide Alarmarten. Pakete ohne Alarm gehören nicht hinein.~Die Warteschlange enthält 26 Pakete. Nur 8 davon sind wirklich zerbrechlich.',
      'Construis la file d’alarme~Il y a 8 vraies alarmes et 18 fausses alarmes. Combien de colis sont dans la file ?~Additionne les deux types d’alarme, sans les colis non signalés.~La file contient 26 colis. Seuls 8 sont réellement fragiles.'
    ],num(26,0,[8,18])),
    s('count-bars','example','tune',[
      'Rebuild the two alarm bars~Set the true-alarm count to 8 and false-alarm count to 18. Compare their sizes.~These sliders represent counts in the queue, not rates within the original groups.~False alarms outnumber true alarms because sturdy parcels were much more common.',
      'Baue die beiden Alarmbalken~Setze echte Alarme auf 8 und falsche auf 18. Vergleiche ihre Größen.~Die Regler zeigen Anzahlen in der Warteschlange, keine Raten innerhalb der ursprünglichen Gruppen.~Falsche Alarme sind häufiger, weil es viel mehr stabile Pakete gab.',
      'Reconstruis les deux barres~Règle les vraies alarmes sur 8 et les fausses sur 18. Compare leurs tailles.~Ces curseurs comptent les colis signalés, pas les taux dans les groupes d’origine.~Les fausses alarmes dominent parce que les colis solides étaient beaucoup plus nombreux.'
    ],tune([control('true','True alarms|Echte Alarme|Vraies alarmes',0,30,1,0),control('false','False alarms|Falsche Alarme|Fausses alarmes',0,30,1,0)],{true:8,false:18})),
    s('condition','principle','story',[
      'Choose the right denominator~“Fragile given alarm” means inspect only the alarm queue. Divide true alarms by all alarms: 8 ÷ 26 ≈ 0.308. This is a conditional probability.~The word “given” tells you which group becomes your new whole.~Reversing “alarm given fragile” and “fragile given alarm” changes the denominator and the answer.',
      'Wähle den richtigen Nenner~„Zerbrechlich bei Alarm“ bedeutet: Betrachte nur die Alarmwarteschlange. Teile echte Alarme durch alle Alarme: 8 ÷ 26 ≈ 0,308. Das ist eine bedingte Wahrscheinlichkeit.~„Bei Alarm“ legt fest, welche Gruppe dein neues Ganzes bildet.~„Alarm bei zerbrechlich“ und „zerbrechlich bei Alarm“ haben verschiedene Nenner und Ergebnisse.',
      'Choisis le bon dénominateur~« Fragile sachant alarme » examine seulement la file d’alarme. Divise les vraies alarmes par toutes les alarmes : 8 ÷ 26 ≈ 0,308. C’est une probabilité conditionnelle.~« Sachant » indique quel groupe devient ton nouveau total.~Inverser « alarme sachant fragile » et « fragile sachant alarme » change le dénominateur et le résultat.'
    ]),
    s('group-roles','principle','match',[
      'Connect each count~Match each group with the number it contributes to the question “fragile given alarm”.~The denominator includes every positive signal, even an incorrect one.~The numerator is the desired subset and the denominator is the group we are inspecting.',
      'Ordne die Anzahlen zu~Verbinde jede Gruppe mit ihrer Rolle bei der Frage „zerbrechlich bei Alarm“.~Der Nenner enthält jedes positive Signal, auch falsche.~Der Zähler ist die gesuchte Teilgruppe; der Nenner ist die betrachtete Gesamtgruppe.',
      'Relie les comptes~Associe chaque groupe à son rôle dans « fragile sachant alarme ».~Le dénominateur inclut tous les signaux positifs, même erronés.~Le numérateur est le sous-ensemble recherché et le dénominateur le groupe inspecté.'
    ],match([pair('8 true alarms|8 echte Alarme|8 vraies alarmes','Numerator|Zähler des Anteils|Numérateur'),pair('26 alarms in total|26 Alarme insgesamt|26 alarmes au total','Denominator|Nenner des Anteils|Dénominateur'),pair('100 original parcels|100 ursprüngliche Pakete|100 colis d’origine','Original population|Ursprüngliche Grundgesamtheit|Population initiale')])),
    s('conditional-recipe','principle','order',[
      'Build a conditional probability~Order the steps for finding a true case among positive signals.~Select the conditioned group before counting its true cases.~A conditional question restricts the sample space before forming a fraction.',
      'Baue eine bedingte Wahrscheinlichkeit~Ordne die Schritte, um einen echten Fall unter positiven Signalen zu finden.~Wähle zuerst die bedingte Gruppe und zähle darin die echten Fälle.~Eine bedingte Frage schränkt zuerst die betrachtete Menge ein und bildet dann einen Anteil.',
      'Construis une probabilité conditionnelle~Ordonne les étapes pour trouver un vrai cas parmi les signaux positifs.~Sélectionne le groupe conditionné avant d’y compter les vrais cas.~Une question conditionnelle restreint d’abord la population puis forme une fraction.'
    ],order(['Keep only positive signals|Behalte nur positive Signale|Garder seulement les signaux positifs','Count true cases in that group|Zähle darin die echten Fälle|Y compter les vrais cas','Divide true cases by all positives|Teile echte Fälle durch alle Positiven|Diviser par tous les positifs'])),
    s('filter-transfer','transfer','number',[
      'A new signal: the spam folder~A filter flags 20 messages: 5 are spam and 15 are ordinary mail. What fraction of flagged messages is spam? Enter a decimal from 0 to 1.~Use the flagged folder as your whole. In another folder, 3 spam among 12 flagged would mean 3 ÷ 12.~The answer is 5 ÷ 20 = 0.25. You used the base counts rather than assuming every positive signal was correct.',
      'Ein neues Signal: der Spamordner~Ein Filter markiert 20 Nachrichten: 5 sind Spam, 15 normale Post. Welcher Anteil der markierten Nachrichten ist Spam? Gib eine Dezimalzahl von 0 bis 1 ein.~Der markierte Ordner ist dein Ganzes. In einem anderen Ordner wären 3 Spam unter 12 markierten Nachrichten 3 ÷ 12.~Das Ergebnis ist 5 ÷ 20 = 0,25. Du hast die Anzahlen genutzt, statt jedes positive Signal für richtig zu halten.',
      'Un nouveau signal : le dossier spam~Un filtre signale 20 messages : 5 sont du spam et 15 des courriels ordinaires. Quelle fraction des messages signalés est du spam ? Entre un décimal de 0 à 1.~Le dossier signalé est ton total. Ailleurs, 3 spams sur 12 messages signalés donneraient 3 ÷ 12.~Le résultat est 5 ÷ 20 = 0,25. Tu as utilisé les comptes au lieu de croire chaque signal positif.'
    ],num(.25,0,[5,20]))
  ]),
  m('derivatives',5,[
    'Guide a ball downhill~A ball sits on a bowl-shaped track. You control how far it steps toward the bottom.~Connect slope, direction and step size in gradient descent.',
    'Führe eine Kugel ins Tal~Eine Kugel liegt auf einer schüsselförmigen Bahn. Du steuerst ihre Schritte zum tiefsten Punkt.~Verbinde Steigung, Richtung und Schrittweite beim Gradientenabstieg.',
    'Guide une bille vers le bas~Une bille repose sur une piste en forme de bol. Tu règles ses pas vers le fond.~Relie pente, direction et taille du pas dans la descente de gradient.'
  ],[
    s('bowl','example','story',[
      'Feel the slope~The track height is x². At x = 2 the ground rises to the right, so moving left lowers the ball. The local slope is 2x = 4.~Downhill is opposite to the direction of increasing height.~A derivative measures local slope: how quickly height changes when position changes.',
      'Spüre die Steigung~Die Bahnhöhe ist x². Bei x = 2 steigt der Boden nach rechts; links geht es abwärts. Die lokale Steigung beträgt 2x = 4.~Bergab liegt entgegen der Richtung zunehmender Höhe.~Eine Ableitung misst die lokale Steigung: wie schnell sich Höhe bei einer Positionsänderung ändert.',
      'Ressens la pente~La hauteur vaut x². À x = 2, le sol monte vers la droite ; aller à gauche fait descendre la bille. La pente locale vaut 2x = 4.~Descendre signifie aller à l’opposé de la hausse de hauteur.~Une dérivée mesure la pente locale : la variation de hauteur quand la position change.'
    ]),
    s('slope','example','number',[
      'Read the slope at a new point~For the same bowl, the slope is 2x. What is the slope at x = 3?~Substitute the position into 2 × x.~The slope is 6. Further from the bottom, this bowl becomes steeper.',
      'Lies die Steigung an einem neuen Punkt~Für dieselbe Schüssel ist die Steigung 2x. Wie groß ist sie bei x = 3?~Setze die Position in 2 × x ein.~Die Steigung ist 6. Weiter vom Boden entfernt wird diese Schüssel steiler.',
      'Lis la pente ailleurs~Dans ce même bol, la pente vaut 2x. Quelle est-elle à x = 3 ?~Remplace x dans 2 × x.~La pente vaut 6. Ce bol devient plus raide quand on s’éloigne du fond.'
    ],num(6,0,[2,3])),
    s('step-size','example','tune',[
      'Land at position one~From x = 2, a step goes to 2 − rate × 4. Set the step size so the next position is exactly 1.~You need to subtract 1 from position 2; divide that move by the slope 4.~A rate of 0.25 gives 2 − 0.25 × 4 = 1. A larger step is not always a better step.',
      'Lande bei Position eins~Von x = 2 führt ein Schritt zu 2 − Schrittweite × 4. Stelle die Schrittweite so ein, dass die neue Position genau 1 ist.~Du musst von Position 2 genau 1 abziehen. Teile diese Bewegung durch die Steigung 4.~Schrittweite 0,25 ergibt 2 − 0,25 × 4 = 1. Ein größerer Schritt ist nicht immer besser.',
      'Atterris à la position un~Depuis x = 2, le pas mène à 2 − taux × 4. Règle le taux pour arriver exactement à 1.~Il faut retirer 1 de la position 2 ; divise ce déplacement par la pente 4.~Un taux de 0,25 donne 2 − 0,25 × 4 = 1. Un plus grand pas n’est pas toujours meilleur.'
    ],tune([control('rate','Step size|Schrittweite|Taille du pas',0,1.5,.05,1.2)],{rate:.25},.00001)),
    s('descent','principle','story',[
      'Turn slope into a learning rule~Gradient descent repeats: new position = old position − rate × slope. On x² with rate 0.25, positions 2 → 1 → 0.5 → 0.25 approach the bottom.~Recompute the slope at the new position before every step.~The minus sign sets the downhill direction; the rate controls distance. An oversized rate can jump past the bottom and diverge.',
      'Mache aus Steigung eine Lernregel~Gradientenabstieg wiederholt: neue Position = alte Position − Schrittweite × Steigung. Auf x² führen Schritte mit 0,25 über 2 → 1 → 0,5 → 0,25 zum Boden.~Berechne vor jedem Schritt die Steigung an der neuen Position.~Das Minus gibt die Abwärtsrichtung vor; die Schrittweite steuert die Entfernung. Zu große Schritte können über das Tal hinaus springen und auseinanderlaufen.',
      'Transforme la pente en règle~La descente de gradient répète : nouvelle position = ancienne position − taux × pente. Sur x² avec un taux de 0,25 : 2 → 1 → 0,5 → 0,25.~Recalcule la pente à la nouvelle position avant chaque pas.~Le signe moins fixe la direction descendante ; le taux règle la distance. Un taux excessif peut dépasser le fond et diverger.'
    ]),
    s('rate-effects','principle','match',[
      'Connect step sizes to behavior~Starting at x = 2 on x², connect each rate with the next position.~Use 2 − rate × 4 for each card. A sign change means crossing the bottom.~Rate 1.2 moves to −2.8, further from zero than before. Crossing the bottom is useful only if distance shrinks.',
      'Verbinde Schrittweite und Wirkung~Starte bei x = 2 auf x². Ordne jeder Schrittweite die nächste Position zu.~Nutze für jede Karte 2 − Schrittweite × 4. Ein Vorzeichenwechsel bedeutet: Der Boden wurde überquert.~Schrittweite 1,2 führt zu −2,8, weiter von null entfernt als zuvor. Das Überqueren hilft nur, wenn der Abstand schrumpft.',
      'Relie taux et comportement~Depuis x = 2 sur x², associe chaque taux à la prochaine position.~Utilise 2 − taux × 4. Un changement de signe signifie traverser le fond.~Le taux 1,2 mène à −2,8, plus loin de zéro. Traverser le fond aide seulement si la distance diminue.'
    ],match([pair('Rate 0.25|Schrittweite 0,25|Taux 0,25','Next x = 1|Neue Position x = 1|Prochain x = 1'),pair('Rate 0.5|Schrittweite 0,5|Taux 0,5','Next x = 0|Neue Position x = 0|Prochain x = 0'),pair('Rate 1.2|Schrittweite 1,2|Taux 1,2','Next x = −2.8|Neue Position x = −2,8|Prochain x = −2,8')])),
    s('three-steps','principle','order',[
      'Follow three safe steps~From x = 2 with rate 0.25, order the next three positions on x².~The slope halves when the position halves, so each new position is halfway to zero.~Recomputing the derivative leads to smaller moves as the ball approaches the bottom.',
      'Verfolge drei sichere Schritte~Ordne die nächsten drei Positionen von x = 2 mit Schrittweite 0,25 auf x².~Mit halbierter Position halbiert sich die Steigung. Jede neue Position liegt auf halbem Weg zu null.~Durch die neu berechnete Ableitung werden die Bewegungen zum Talboden hin kleiner.',
      'Suis trois pas sûrs~Depuis x = 2 avec un taux de 0,25 sur x², ordonne les trois prochaines positions.~Quand la position est divisée par deux, la pente aussi. Chaque nouvelle position est à mi-chemin de zéro.~Recalculer la dérivée réduit les déplacements à l’approche du fond.'
    ],order(['Position 1|Position 1,0|Position 1,0','Position 0.5|Position 0,5|Position 0,5','Position 0.25|Position 0,25|Position 0,25'])),
    s('heater-transfer','transfer','number',[
      'Stabilize a heater model~A heater model minimizes error w². At w = 4 its slope is 8. A rate of 1.2 overshoots; instead use 0.1. What is the next w?~Subtract rate × slope from the current value. On another problem, 3 − 0.2 × 6 would give 1.8.~The next value is 4 − 0.1 × 8 = 3.2, closer to zero. You stabilized an update in a new setting.',
      'Stabilisiere ein Heizungsmodell~Ein Heizungsmodell minimiert den Fehler w². Bei w = 4 ist die Steigung 8. Schrittweite 1,2 überschießt; nutze stattdessen 0,1. Wie lautet das neue w?~Ziehe Schrittweite × Steigung vom alten Wert ab. In einer anderen Aufgabe wäre 3 − 0,2 × 6 gleich 1,8.~Der neue Wert ist 4 − 0,1 × 8 = 3,2, näher an null. Du hast eine Aktualisierung in einer neuen Situation stabilisiert.',
      'Stabilise un modèle de chauffage~Un modèle minimise l’erreur w². À w = 4, sa pente vaut 8. Le taux 1,2 dépasse le minimum ; utilise 0,1. Quel est le prochain w ?~Retire taux × pente de la valeur actuelle. Ailleurs, 3 − 0,2 × 6 donnerait 1,8.~La nouvelle valeur est 4 − 0,1 × 8 = 3,2, plus proche de zéro. Tu as stabilisé une mise à jour dans un autre contexte.'
    ],num(3.2,.0001,[4,.1,8]))
  ]),
  m('regression',5,[
    'Repair the prediction workshop~A workshop predicts packing time from box count. Its dots show 1 box → 4 minutes, 2 → 7, 3 → 10.~Measure residuals, square their errors and test a fitted line on a new observation.',
    'Repariere die Vorhersagewerkstatt~Eine Werkstatt schätzt Packzeiten aus der Kistenzahl. Ihre Punkte zeigen 1 Kiste → 4 Minuten, 2 → 7, 3 → 10.~Miss Abweichungen, quadriere Fehler und prüfe eine angepasste Linie an einer neuen Beobachtung.',
    'Répare l’atelier de prédiction~Un atelier prédit le temps d’emballage : 1 caisse → 4 minutes, 2 → 7, 3 → 10.~Mesure les résidus, mets les écarts au carré et teste une droite sur une nouvelle observation.'
  ],[
    s('gap','example','story',[
      'Look at the gap~For 3 boxes, one model predicts 8 minutes, but the measured time is 10. The visible gap is observed minus predicted: 10 − 8 = 2.~Draw a vertical segment between the prediction and its observation.~This gap is called a residual. Its sign tells us whether the model predicted too low or too high.',
      'Betrachte die Lücke~Für 3 Kisten sagt ein Modell 8 Minuten vorher, gemessen wurden aber 10. Die Lücke ist Beobachtung minus Vorhersage: 10 − 8 = 2.~Zeichne eine senkrechte Strecke zwischen Vorhersage und Beobachtung.~Diese Abweichung heißt Residuum. Ihr Vorzeichen zeigt, ob die Vorhersage zu niedrig oder zu hoch war.',
      'Observe l’écart~Pour 3 caisses, un modèle prédit 8 minutes alors que la mesure vaut 10. L’écart vaut observation moins prédiction : 10 − 8 = 2.~Trace un segment vertical entre prédiction et observation.~Cet écart s’appelle un résidu. Son signe indique si le modèle prédit trop bas ou trop haut.'
    ]),
    s('square-gap','example','number',[
      'Make the gap count~The residual is 2. What is its squared error?~Squaring means multiply the residual by itself, not by two.~The squared error is 4. A residual of −2 would also contribute 4, so opposite signs cannot cancel.',
      'Lass die Lücke zählen~Das Residuum beträgt 2. Wie groß ist der quadrierte Fehler?~Quadrieren heißt mit sich selbst multiplizieren, nicht mit zwei.~Der quadrierte Fehler ist 4. Ein Residuum von −2 trägt ebenfalls 4 bei; Vorzeichen können sich daher nicht aufheben.',
      'Fais compter l’écart~Le résidu vaut 2. Quelle est son erreur au carré ?~Mettre au carré signifie multiplier le résidu par lui-même, pas par deux.~L’erreur au carré vaut 4. Un résidu de −2 donnerait aussi 4 : les signes opposés ne s’annulent pas.'
    ],num(4,0,[2])),
    s('fit-workshop','example','tune',[
      'Fit the workshop line~Adjust minutes per box and setup time to fit (1,4), (2,7), (3,10). Get average squared error below 0.1.~Notice the same increase between adjacent observations, then set the starting height.~A rise of 3 and setup time 1 reproduce the observations. Fitting minimizes an error measure on known data.',
      'Passe die Werkstattlinie an~Stelle Minuten pro Kiste und Rüstzeit für (1,4), (2,7), (3,10) ein. Erreiche mittleren quadrierten Fehler unter 0,1.~Erkenne den gleichen Zuwachs zwischen benachbarten Beobachtungen und stelle dann die Starthöhe ein.~Anstieg 3 und Rüstzeit 1 bilden die Beobachtungen ab. Anpassen minimiert ein Fehlermaß auf bekannten Daten.',
      'Ajuste la droite de l’atelier~Règle les minutes par caisse et le temps de préparation pour (1,4), (2,7), (3,10). Vise une erreur quadratique moyenne inférieure à 0,1.~Repère la hausse entre observations voisines, puis règle la hauteur de départ.~Une hausse de 3 et un départ de 1 reproduisent les mesures. Ajuster minimise une erreur sur les données connues.'
    ],{controls:[control('slope','Minutes per box|Minuten pro Kiste|Minutes par caisse',0,4,.25,0),control('intercept','Setup time|Rüstzeit|Temps de préparation',0,4,.25,0)],rule:{kind:'line-mse',samples:[[1,4],[2,7],[3,10]],maxError:.1},solution:{slope:3,intercept:1}}),
    s('loss','principle','story',[
      'Turn gaps into a loss~Regression predicts a numerical quantity. Mean squared error, or MSE, averages the squared residuals. For residuals 1 and −3, MSE = (1 + 9) ÷ 2 = 5.~Square each residual before adding; divide by the number of observations.~Squaring prevents cancellation and makes large errors count more heavily. Low training error still needs a test on new data.',
      'Mache aus Lücken einen Verlust~Regression sagt eine Zahl vorher. Der mittlere quadrierte Fehler, MSE, mittelt quadrierte Residuen. Für 1 und −3 gilt MSE = (1 + 9) ÷ 2 = 5.~Quadriere jedes Residuum vor dem Addieren und teile durch die Beobachtungszahl.~Quadrieren verhindert Aufheben und gewichtet große Fehler stärker. Niedriger Trainingsfehler muss sich trotzdem an neuen Daten bewähren.',
      'Transforme les écarts en perte~La régression prédit une quantité numérique. L’erreur quadratique moyenne, MSE, moyenne les résidus au carré. Pour 1 et −3 : MSE = (1 + 9) ÷ 2 = 5.~Mets chaque résidu au carré avant d’additionner, puis divise par le nombre d’observations.~Le carré évite l’annulation et accentue les grandes erreurs. Une faible erreur d’entraînement doit encore être testée sur de nouvelles données.'
    ]),
    s('residual-roles','principle','match',[
      'Read a residual diagram~Match the observation, prediction and residual for a case measured at 10 but predicted at 8.~The residual is the difference, not either endpoint.~The same three roles let us inspect any regression prediction.',
      'Lies ein Residuenbild~Ordne Beobachtung, Vorhersage und Residuum zu: gemessen 10, vorhergesagt 8.~Das Residuum ist die Differenz, keiner der beiden Endpunkte.~Dieselben drei Rollen helfen bei jeder Regressionsvorhersage.',
      'Lis un diagramme de résidu~Relie observation, prédiction et résidu pour une mesure de 10 et une prédiction de 8.~Le résidu est la différence, pas une des extrémités.~Ces trois rôles permettent d’inspecter toute prédiction de régression.'
    ],match([pair('Measured 10|Gemessen 10|Mesure 10','Observation|Beobachteter Wert|Valeur observée'),pair('Model output 8|Modellausgabe 8|Sortie du modèle 8','Prediction|Vorhersagewert|Valeur prédite'),pair('Gap +2|Abstand +2|Écart +2','Residual|Residuum der Vorhersage|Résidu')])),
    s('mse-recipe','principle','order',[
      'Assemble the error meter~Order the steps that turn several observed and predicted values into MSE.~Averaging comes last, after all squared gaps have been added.~Subtract → square → add → divide gives each observation one nonnegative contribution.',
      'Baue die Fehleranzeige~Ordne die Schritte, die aus mehreren Beobachtungen und Vorhersagen den MSE machen.~Der Mittelwert kommt zuletzt, nachdem alle quadrierten Lücken addiert wurden.~Abziehen → quadrieren → addieren → teilen ergibt einen nichtnegativen Beitrag pro Beobachtung.',
      'Assemble l’indicateur d’erreur~Ordonne les étapes qui transforment mesures et prédictions en MSE.~La moyenne vient à la fin, après la somme des écarts au carré.~Soustraire → mettre au carré → additionner → diviser donne une contribution positive ou nulle par observation.'
    ],order(['Observed minus predicted|Beobachtung minus Vorhersage|Observation moins prédiction','Square each residual|Quadriere jedes Residuum|Mettre chaque résidu au carré','Add squared residuals|Addiere die quadrierten Residuen|Additionner les résidus au carré','Divide by observation count|Teile durch die Beobachtungszahl|Diviser par le nombre d’observations'])),
    s('new-observation','transfer','number',[
      'Test a fresh observation~A different workshop uses prediction = 3 × boxes + 1. For 4 boxes it measures 16 minutes. What squared error does this one new observation contribute?~Calculate a prediction first, then the residual and its square. In another case, measured 7 and predicted 5 contribute 4.~The prediction is 13, the residual is 3 and the squared error is 9. A line that fit earlier data can still miss new observations.',
      'Prüfe eine frische Beobachtung~Eine andere Werkstatt nutzt Vorhersage = 3 × Kisten + 1. Bei 4 Kisten misst sie 16 Minuten. Welchen quadrierten Fehler trägt diese neue Beobachtung bei?~Berechne zuerst die Vorhersage, dann Residuum und Quadrat. In einem anderen Fall tragen Messung 7 und Vorhersage 5 den Fehler 4 bei.~Die Vorhersage ist 13, das Residuum 3 und der quadrierte Fehler 9. Eine passende Trainingslinie kann neue Beobachtungen verfehlen.',
      'Teste une nouvelle observation~Un autre atelier utilise prédiction = 3 × caisses + 1. Pour 4 caisses, il mesure 16 minutes. Quelle erreur au carré apporte cette nouvelle observation ?~Calcule d’abord la prédiction, puis le résidu et son carré. Ailleurs, mesure 7 et prédiction 5 donnent 4.~La prédiction vaut 13, le résidu 3 et l’erreur au carré 9. Une droite ajustée peut manquer de nouvelles observations.'
    ],num(9,0,[1,3,4,16]))
  ]),
  m('classification',5,[
    'Tune the sorting machine~A machine decides which items enter the recycling bin. A feature becomes a score, then a probability.~Connect weights, bias, probability and a decision threshold.',
    'Stelle die Sortiermaschine ein~Eine Maschine entscheidet, was in die Wertstofftonne kommt. Aus einem Merkmal wird ein Ergebnis und dann eine Wahrscheinlichkeit.~Verbinde Gewichte, Bias, Wahrscheinlichkeit und Entscheidungsschwelle.',
    'Règle la machine de tri~Une machine décide quels objets recycler. Une caractéristique devient un score puis une probabilité.~Relie poids, biais, probabilité et seuil de décision.'
  ],[
    s('sorter','example','story',[
      'Start with one bottle~Let x = 1 describe a bottle’s feature. A weight scales x; a bias adds a fixed shift. With weight 2 and bias −1, the score is 2 × 1 − 1.~A bias is like a starting position that shifts every score equally.~The score combines evidence, but it is not yet a probability because it can be any real number.',
      'Beginne mit einer Flasche~x = 1 beschreibt ein Flaschenmerkmal. Ein Gewicht skaliert x; ein Bias addiert eine feste Verschiebung. Mit Gewicht 2 und Bias −1 ist das Ergebnis 2 × 1 − 1.~Ein Bias ist eine Startverschiebung, die jedes Ergebnis gleich verändert.~Das Ergebnis kombiniert Hinweise, ist aber noch keine Wahrscheinlichkeit: Es kann jede reelle Zahl sein.',
      'Commence avec une bouteille~x = 1 décrit une caractéristique. Un poids multiplie x ; un biais ajoute un décalage fixe. Avec poids 2 et biais −1, le score vaut 2 × 1 − 1.~Un biais déplace tous les scores de la même quantité.~Le score combine des indices mais n’est pas encore une probabilité : il peut prendre toute valeur réelle.'
    ]),
    s('bottle-score','example','number',[
      'Build the bottle’s score~Compute 2 × 1 + (−1). What score enters the probability converter?~Multiply before adding the fixed bias.~The score is 1. A positive score will become a probability above one half.',
      'Baue das Flaschenergebnis~Rechne 2 × 1 + (−1). Welches Ergebnis geht in den Wahrscheinlichkeitsumwandler?~Multipliziere vor dem Addieren des festen Bias.~Das Ergebnis ist 1. Ein positives Ergebnis wird zu einer Wahrscheinlichkeit über einer Hälfte.',
      'Construis le score~Calcule 2 × 1 + (−1). Quel score entre dans le convertisseur de probabilité ?~Multiplie avant d’ajouter le biais fixe.~Le score vaut 1. Un score positif donnera une probabilité supérieure à une moitié.'
    ],num(1,0,[2,1,-1])),
    s('machine-settings','example','tune',[
      'Rebuild the machine~Set feature weight 2 and bias −1. Observe that one knob changes sensitivity and the other shifts the starting score.~Weight multiplies the input; bias is added afterward.~Weight 2 and bias −1 give score 1 for x = 1 and score −1 for x = 0.',
      'Baue die Maschine nach~Setze Merkmalsgewicht 2 und Bias −1. Ein Regler verändert die Empfindlichkeit, der andere verschiebt das Ausgangsergebnis.~Das Gewicht multipliziert die Eingabe; der Bias wird danach addiert.~Gewicht 2 und Bias −1 ergeben bei x = 1 den Wert 1 und bei x = 0 den Wert −1.',
      'Reconstruis la machine~Règle le poids sur 2 et le biais sur −1. Un curseur change la sensibilité ; l’autre déplace le score de départ.~Le poids multiplie l’entrée ; le biais s’ajoute ensuite.~Poids 2 et biais −1 donnent un score de 1 pour x = 1 et de −1 pour x = 0.'
    ],tune([control('weight','Feature weight|Merkmalsgewicht|Poids de la caractéristique',-3,3,.5,0),control('bias','Bias shift|Bias-Verschiebung|Décalage du biais',-3,3,.5,0)],{weight:2,bias:-1})),
    s('sigmoid','principle','story',[
      'From score to decision~The sigmoid converter maps score s to 1 ÷ (1 + exp(−s)), between 0 and 1. Score 0 gives 0.5; score 1 gives about 0.731. Choose class 1 when probability is at least the threshold.~The threshold turns a probability into an action. Changing it changes the action, not the probability.~Classification predicts a category. A probability expresses model confidence, not a guarantee that the item is recyclable.',
      'Vom Ergebnis zur Entscheidung~Die Sigmoidfunktion wandelt Ergebnis s in 1 ÷ (1 + exp(−s)) zwischen 0 und 1 um. 0 ergibt 0,5; 1 ergibt etwa 0,731. Wähle Klasse 1, wenn die Wahrscheinlichkeit mindestens die Schwelle erreicht.~Die Schwelle macht aus einer Wahrscheinlichkeit eine Handlung. Sie ändert die Handlung, nicht die Wahrscheinlichkeit.~Klassifikation sagt eine Kategorie vorher. Eine Wahrscheinlichkeit drückt Modellzuversicht aus, keine Garantie für Recyclingfähigkeit.',
      'Du score à la décision~La sigmoïde transforme le score s en 1 ÷ (1 + exp(−s)), entre 0 et 1. Le score 0 donne 0,5 ; le score 1 environ 0,731. Choisis la classe 1 si la probabilité atteint le seuil.~Le seuil transforme une probabilité en action. Il change l’action, pas la probabilité.~La classification prédit une catégorie. Une probabilité exprime la confiance du modèle, pas une garantie de recyclabilité.'
    ]),
    s('score-map','principle','match',[
      'Connect scores to probabilities~Match each score range with its sigmoid probability range.~The sigmoid is increasing and passes through (0, 0.5).~Positive and negative scores fall on opposite sides of probability 0.5.',
      'Verbinde Ergebnisse und Wahrscheinlichkeiten~Ordne jedem Ergebnisbereich seinen Wahrscheinlichkeitsbereich nach der Sigmoidfunktion zu.~Die Sigmoidfunktion steigt und geht durch (0; 0,5).~Positive und negative Ergebnisse liegen auf entgegengesetzten Seiten der Wahrscheinlichkeit 0,5.',
      'Relie scores et probabilités~Associe chaque intervalle de score à son intervalle de probabilité sigmoïde.~La sigmoïde est croissante et passe par (0 ; 0,5).~Les scores positifs et négatifs se trouvent de part et d’autre de la probabilité 0,5.'
    ],match([pair('Negative score|Negatives Ergebnis|Score négatif','Probability below 0.5|Wahrscheinlichkeit unter 0,5|Probabilité sous 0,5'),pair('Score zero|Ergebnis null|Score nul','Probability exactly 0.5|Wahrscheinlichkeit genau 0,5|Probabilité exactement 0,5'),pair('Positive score|Positives Ergebnis|Score positif','Probability above 0.5|Wahrscheinlichkeit über 0,5|Probabilité au-dessus de 0,5')])),
    s('classification-chain','principle','order',[
      'Assemble the sorter~Order the operations from a measured feature to a category.~Build the score before converting it; apply the threshold last.~The decision pipeline separates feature measurement, scoring, probability conversion and action.',
      'Baue die Sortierkette~Ordne die Operationen vom gemessenen Merkmal zur Kategorie.~Berechne das Ergebnis vor der Umwandlung; nutze die Schwelle zuletzt.~Die Entscheidungskette trennt Messung, Berechnung, Wahrscheinlichkeitsumwandlung und Handlung.',
      'Assemble la chaîne de tri~Ordonne les opérations depuis la caractéristique mesurée jusqu’à la catégorie.~Construis le score avant de le convertir ; applique le seuil en dernier.~La chaîne sépare mesure, calcul du score, conversion en probabilité et action.'
    ],order(['Measure the feature x|Miss das Merkmal x|Mesurer la caractéristique x','Compute weight × x + bias|Berechne Gewicht × x + Bias|Calculer poids × x + biais','Apply the sigmoid|Wende die Sigmoidfunktion an|Appliquer la sigmoïde','Compare probability with threshold|Vergleiche Wahrscheinlichkeit und Schwelle|Comparer probabilité et seuil'])),
    s('mail-transfer','transfer','number',[
      'A new machine sorts mail~For x = 0, weight 3 and bias −2, a spam model gives probability about 0.119. With threshold 0.3, enter its decision: 1 = flag, 0 = leave unflagged.~Compute the score, then compare probability with the threshold. A separate example: probability 0.8 crosses threshold 0.7.~The score is −2 and 0.119 is below 0.3, so the decision is 0. You applied a new input, parameters and threshold.',
      'Eine neue Maschine sortiert Post~Für x = 0, Gewicht 3 und Bias −2 liefert ein Spammodell Wahrscheinlichkeit etwa 0,119. Bei Schwelle 0,3: Gib 1 für markieren oder 0 für nicht markieren ein.~Berechne das Ergebnis und vergleiche dann die Wahrscheinlichkeit mit der Schwelle. Anderes Beispiel: 0,8 überschreitet Schwelle 0,7.~Das Ergebnis ist −2; 0,119 liegt unter 0,3. Die Entscheidung ist 0. Du hast neue Eingabe, Parameter und Schwelle angewandt.',
      'Une autre machine trie les courriels~Pour x = 0, poids 3 et biais −2, un modèle de spam donne environ 0,119. Au seuil 0,3, saisis la décision : 1 = signaler, 0 = laisser.~Calcule le score puis compare la probabilité au seuil. Autre exemple : 0,8 dépasse un seuil de 0,7.~Le score vaut −2 et 0,119 est inférieur à 0,3 : la décision est 0. Tu as appliqué de nouvelles entrée, paramètres et seuil.'
    ],num(0,0,[0,1]))
  ]),
  m('generalization',5,[
    'Grow a model that travels~Two gardens grow the same plants. One trains a watering model; the other tests whether its rule works on unfamiliar plants.~Choose a model by unseen-data performance and understand regularization.',
    'Lass ein Modell weiterwachsen~Zwei Gärten haben dieselben Pflanzenarten. Einer trainiert ein Bewässerungsmodell; der andere prüft seine Regel an unbekannten Pflanzen.~Wähle nach Leistung auf unbekannten Daten und verstehe Regularisierung.',
    'Fais voyager un modèle~Deux jardins cultivent les mêmes plantes. L’un entraîne un modèle d’arrosage ; l’autre teste sa règle sur des plantes inconnues.~Choisis selon les données inédites et comprends la régularisation.'
  ],[
    s('gardens','example','story',[
      'Visit both gardens~Model A misses 1 of 20 training plants but 8 of 20 new plants. Model B misses 3 of 20 in training and 4 of 20 new plants. Which garden matches tomorrow’s job?~Tomorrow brings new plants, so inspect the second garden.~Memorizing known plants can look excellent during training yet fail on new plants.',
      'Besuche beide Gärten~Modell A verfehlt 1 von 20 Trainingspflanzen und 8 von 20 neuen. Modell B verfehlt 3 von 20 im Training und 4 von 20 neuen. Welcher Garten entspricht der morgigen Aufgabe?~Morgen kommen neue Pflanzen; betrachte daher den zweiten Garten.~Das Auswendiglernen bekannter Pflanzen kann im Training glänzen und bei neuen Pflanzen scheitern.',
      'Visite les deux jardins~Le modèle A se trompe sur 1 plante d’entraînement sur 20 et 8 nouvelles sur 20. B se trompe sur 3 à l’entraînement et 4 nouvelles. Quel jardin représente demain ?~Demain apporte de nouvelles plantes : regarde le second jardin.~Mémoriser les plantes connues peut sembler excellent à l’entraînement et échouer sur les nouvelles.'
    ]),
    s('new-error','example','number',[
      'Count the useful improvement~On new plants, A makes 8 mistakes and B makes 4. How many fewer mistakes does B make?~Compare new-data mistakes with new-data mistakes, not training with testing.~B makes 4 fewer mistakes on new plants, despite its larger training error.',
      'Zähle die nützliche Verbesserung~Bei neuen Pflanzen macht A 8 Fehler und B 4. Wie viele Fehler weniger macht B?~Vergleiche Fehler auf neuen Daten miteinander, nicht Training mit Test.~B macht bei neuen Pflanzen 4 Fehler weniger, obwohl sein Trainingsfehler größer ist.',
      'Compte l’amélioration utile~Sur les nouvelles plantes, A fait 8 erreurs et B en fait 4. Combien B en évite-t-il ?~Compare les erreurs sur données inédites entre elles, pas entraînement et test.~B fait 4 erreurs de moins sur les nouvelles plantes malgré une erreur d’entraînement plus élevée.'
    ],num(4,0,[8,4])),
    s('simplify','example','tune',[
      'Find a useful amount of simplicity~Regularization discourages overly complex rules. Strength 0 gives training/new error 0.05/0.30; 0.5 gives 0.12/0.15; 1 gives 0.25/0.22. Choose the strength with lowest new-data error.~Compare the second number of each pair. The smallest training error is not the target.~Strength 0.5 has the lowest new-data error here. Too much regularization also harms predictions.',
      'Finde ein nützliches Maß an Einfachheit~Regularisierung bremst zu komplexe Regeln. Stärke 0 ergibt Training/neu 0,05/0,30; 0,5 ergibt 0,12/0,15; 1 ergibt 0,25/0,22. Wähle den kleinsten Fehler auf neuen Daten.~Vergleiche die zweite Zahl jedes Paars. Der kleinste Trainingsfehler ist nicht das Ziel.~Stärke 0,5 hat hier den kleinsten Fehler auf neuen Daten. Zu starke Regularisierung schadet ebenfalls.',
      'Trouve une simplicité utile~La régularisation décourage les règles trop complexes. Force 0 : erreur entraînement/inédit 0,05/0,30 ; 0,5 : 0,12/0,15 ; 1 : 0,25/0,22. Choisis l’erreur inédite minimale.~Compare le second nombre de chaque paire. L’erreur d’entraînement minimale n’est pas l’objectif.~La force 0,5 donne ici la plus faible erreur inédite. Trop de régularisation nuit aussi aux prédictions.'
    ],tune([control('strength','Regularization strength|Regularisierungsstärke|Force de régularisation',0,1,.5,0)],{strength:.5})),
    s('general-rule','principle','story',[
      'Name the gap~Generalization is performance on unseen cases. Overfitting means adapting too closely to training quirks. Validation data helps choose settings; a final untouched test estimates performance after those choices.~Once you use a dataset to choose settings, it is no longer an untouched final test.~Training, validation and test have separate roles. Regularization helps but cannot guarantee success under a changed population.',
      'Benenne die Lücke~Generalisierung ist Leistung auf unbekannten Fällen. Überanpassung bedeutet zu starke Anpassung an Trainingsbesonderheiten. Validierungsdaten helfen bei Einstellungen; ein unberührter Abschlusstest schätzt danach die Leistung.~Sobald ein Datensatz Einstellungen beeinflusst, ist er kein unberührter Abschlusstest mehr.~Training, Validierung und Test haben getrennte Rollen. Regularisierung hilft, garantiert aber keinen Erfolg bei einer veränderten Grundgesamtheit.',
      'Nomme l’écart~La généralisation est la performance sur des cas inédits. Le surapprentissage épouse les particularités d’entraînement. La validation aide à choisir les réglages ; un test final intact estime ensuite la performance.~Dès qu’un jeu sert à choisir des réglages, il n’est plus un test final intact.~Entraînement, validation et test ont des rôles distincts. La régularisation ne garantit pas le succès si la population change.'
    ]),
    s('dataset-roles','principle','match',[
      'Give every garden a job~Connect each dataset with the decision it may inform.~The final test should not guide repeated tuning.~Separating data roles prevents a model-selection decision from masquerading as independent evidence.',
      'Gib jedem Garten eine Aufgabe~Ordne jedem Datensatz die Entscheidung zu, die er unterstützen darf.~Der Abschlusstest soll keine wiederholte Abstimmung steuern.~Getrennte Datenrollen verhindern, dass eine Modellwahl als unabhängige Evidenz erscheint.',
      'Donne un rôle à chaque jardin~Associe chaque jeu de données à la décision qu’il peut guider.~Le test final ne doit pas guider les réglages répétés.~Séparer les rôles évite de présenter un choix de modèle comme une preuve indépendante.'
    ],match([pair('Training data|Trainingsdaten|Données d’entraînement','Fit parameters|Parameter anpassen|Ajuster les paramètres'),pair('Validation data|Validierungsdaten|Données de validation','Choose settings|Einstellungen wählen|Choisir les réglages'),pair('Untouched test data|Unberührte Testdaten|Données de test intactes','Estimate final performance|Abschließende Leistung schätzen|Estimer la performance finale')])),
    s('honest-comparison','principle','order',[
      'Plan a fair comparison~Put the steps in order so the test remains independent.~Split before fitting. Freeze the selected model before opening the final test.~Protecting unseen data is part of the experiment, not an afterthought.',
      'Plane einen fairen Vergleich~Ordne die Schritte so, dass der Test unabhängig bleibt.~Teile vor dem Training auf. Lege das gewählte Modell vor dem Abschlusstest fest.~Unbekannte Daten zu schützen ist Teil des Experiments, keine nachträgliche Ergänzung.',
      'Prépare une comparaison équitable~Ordonne les étapes pour garder un test indépendant.~Sépare avant l’entraînement. Fige le modèle choisi avant le test final.~Protéger les données inédites fait partie de l’expérience dès le départ.'
    ],order(['Separate training, validation and test|Trenne Training, Validierung und Test|Séparer entraînement, validation et test','Fit on training data|Trainiere mit Trainingsdaten|Ajuster sur l’entraînement','Choose settings with validation|Wähle Einstellungen mit Validierung|Choisir avec la validation','Evaluate once on untouched test|Prüfe einmal auf unberührtem Test|Évaluer une fois sur le test intact'])),
    s('forecast-transfer','transfer','number',[
      'Select a demand forecast~Forecast P has training/validation errors 2/9. Forecast Q has 4/5. Before opening the final test, what validation error belongs to the model you should choose?~Choose using validation, then report that model’s validation value. In another comparison, 3/7 loses to 4/6.~Choose Q with validation error 5. Its higher training error does not outweigh its better unseen-data evidence.',
      'Wähle eine Nachfrageprognose~Prognose P hat Trainings-/Validierungsfehler 2/9. Prognose Q hat 4/5. Welchen Validierungsfehler hat das zu wählende Modell, bevor der Abschlusstest geöffnet wird?~Wähle anhand der Validierung und nenne diesen Wert. In einem anderen Vergleich verliert 3/7 gegen 4/6.~Wähle Q mit Validierungsfehler 5. Sein höherer Trainingsfehler wiegt die bessere Evidenz auf unbekannten Daten nicht auf.',
      'Choisis une prévision de demande~P a des erreurs entraînement/validation de 2/9. Q a 4/5. Avant le test final, quelle erreur de validation appartient au modèle à choisir ?~Choisis avec la validation puis donne cette valeur. Ailleurs, 3/7 perd contre 4/6.~Choisis Q, dont l’erreur de validation vaut 5. Sa meilleure performance inédite compte davantage que son erreur d’entraînement plus élevée.'
    ],num(5,0,[2,4,5,9]))
  ]),
  m('evaluation',5,[
    'Audit the rescue alarm~A rescue station has to notice emergencies without overwhelming its crew with false alarms.~Construct precision and recall from concrete counts.',
    'Prüfe den Rettungsalarm~Eine Rettungsstation soll Notfälle erkennen, ohne das Team mit falschen Alarmen zu überlasten.~Baue Precision und Recall aus konkreten Anzahlen auf.',
    'Vérifie l’alarme de secours~Une station doit repérer les urgences sans submerger son équipe de fausses alertes.~Construis précision et rappel à partir de comptes concrets.'
  ],[
    s('rescue-log','example','story',[
      'Open the rescue log~The station detects 6 real emergencies, sends 2 false alarms, and misses 4 emergencies. We need two different questions: can we trust an alarm, and how many emergencies did we find?~Alarms and real emergencies are overlapping groups, not identical groups.~The same detector can have trustworthy alarms while still missing many emergencies.',
      'Öffne das Rettungsprotokoll~Die Station erkennt 6 echte Notfälle, sendet 2 falsche Alarme und übersieht 4 Notfälle. Zwei Fragen sind nötig: Wie verlässlich ist ein Alarm und wie viele Notfälle finden wir?~Alarme und echte Notfälle überlappen, sind aber nicht dieselbe Gruppe.~Derselbe Detektor kann verlässliche Alarme liefern und trotzdem viele Notfälle übersehen.',
      'Ouvre le journal de secours~La station détecte 6 urgences, envoie 2 fausses alertes et manque 4 urgences. Deux questions : peut-on croire une alerte et combien d’urgences trouve-t-on ?~Les alertes et les vraies urgences se recoupent sans être identiques.~Un détecteur peut émettre des alertes fiables tout en manquant beaucoup d’urgences.'
    ]),
    s('alarm-count','example','number',[
      'Count the crew’s callouts~The crew follows every alarm: 6 real plus 2 false. How many callouts are there?~Missed emergencies did not cause an alarm, so do not add them here.~There are 8 callouts. This count is the denominator for precision.',
      'Zähle die Einsätze~Das Team folgt jedem Alarm: 6 echten und 2 falschen. Wie viele Einsätze gibt es?~Übersehene Notfälle lösten keinen Alarm aus und gehören hier nicht dazu.~Es gibt 8 Einsätze. Diese Anzahl ist der Nenner der Precision.',
      'Compte les interventions~L’équipe suit chaque alerte : 6 vraies et 2 fausses. Combien d’interventions cela fait-il ?~Les urgences manquées n’ont pas déclenché d’alerte ; ne les ajoute pas.~Il y a 8 interventions. Ce nombre est le dénominateur de la précision.'
    ],num(8,0,[6,2])),
    s('rebuild-counts','example','tune',[
      'Rebuild the audit~Set the count bars to 6 detected emergencies, 2 false alarms and 4 missed emergencies.~Match what the station did to what really happened.~Correct detections belong to both the alarm group and the real-emergency group.',
      'Baue die Prüfung nach~Setze die Balken auf 6 erkannte Notfälle, 2 falsche Alarme und 4 übersehene Notfälle.~Vergleiche die Handlung der Station mit den tatsächlichen Ereignissen.~Richtige Erkennungen gehören sowohl zur Alarmgruppe als auch zur Gruppe echter Notfälle.',
      'Reconstruis l’audit~Règle les barres sur 6 urgences détectées, 2 fausses alertes et 4 urgences manquées.~Compare les actions de la station aux événements réels.~Les bonnes détections appartiennent à la fois aux alertes et aux urgences réelles.'
    ],tune([control('tp','Detected emergencies|Erkannte Notfälle|Urgences détectées',0,12,1,0),control('fp','False alarms|Falsche Alarme|Fausses alertes',0,12,1,0),control('fn','Missed emergencies|Übersehene Notfälle|Urgences manquées',0,12,1,0)],{tp:6,fp:2,fn:4})),
    s('metric-names','principle','story',[
      'Two questions, two fractions~A true positive (TP) is a correct alarm; a false positive (FP) is a false alarm; a false negative (FN) is a missed emergency. Precision = TP/(TP+FP) = 6/8. Recall = TP/(TP+FN) = 6/10.~Precision starts from alarms. Recall starts from actual emergencies.~Precision here is 0.75 and recall is 0.6. Each answers a different operational question.',
      'Zwei Fragen, zwei Anteile~Ein richtig Positiver (TP) ist ein richtiger Alarm, ein falsch Positiver (FP) ein Fehlalarm, ein falsch Negativer (FN) ein übersehener Notfall. Precision = TP/(TP+FP) = 6/8. Recall = TP/(TP+FN) = 6/10.~Precision beginnt bei Alarmen. Recall beginnt bei tatsächlichen Notfällen.~Precision beträgt hier 0,75 und Recall 0,6. Beide beantworten unterschiedliche praktische Fragen.',
      'Deux questions, deux fractions~Un vrai positif (TP) est une bonne alerte ; un faux positif (FP), une fausse alerte ; un faux négatif (FN), une urgence manquée. Précision = TP/(TP+FP) = 6/8. Rappel = TP/(TP+FN) = 6/10.~La précision part des alertes. Le rappel part des urgences réelles.~La précision vaut ici 0,75 et le rappel 0,6. Chaque mesure répond à une question pratique différente.'
    ]),
    s('label-cases','principle','match',[
      'Sort the station’s cases~Connect each outcome to TP, FP or FN.~Compare predicted positive or negative with what actually happened.~The label depends on both the prediction and reality; neither alone is enough.',
      'Sortiere die Fälle~Ordne jedes Ergebnis TP, FP oder FN zu.~Vergleiche die positive oder negative Vorhersage mit dem tatsächlichen Ereignis.~Die Bezeichnung hängt von Vorhersage und Wirklichkeit ab; eines allein reicht nicht.',
      'Classe les cas~Relie chaque résultat à TP, FP ou FN.~Compare la prédiction positive ou négative à la réalité.~L’étiquette dépend de la prédiction et de la réalité ; une seule ne suffit pas.'
    ],match([pair('Alarm and real emergency|Alarm und echter Notfall|Alerte et vraie urgence','True positive (TP)|Richtig positiv (TP)|Vrai positif (TP)'),pair('Alarm but no emergency|Alarm ohne Notfall|Alerte sans urgence','False positive (FP)|Falsch positiv (FP)|Faux positif (FP)'),pair('No alarm but real emergency|Kein Alarm trotz Notfall|Pas d’alerte malgré une urgence','False negative (FN)|Falsch negativ (FN)|Faux négatif (FN)')])),
    s('recall-recipe','principle','order',[
      'Build recall from the ground up~Order the calculation for the fraction of actual emergencies detected.~Start with the real emergencies, not with every alarm.~Recall counts correct detections out of all real positive cases.',
      'Baue Recall von Grund auf~Ordne die Berechnung für den Anteil erkannter tatsächlicher Notfälle.~Beginne mit echten Notfällen, nicht mit allen Alarmen.~Recall zählt richtige Erkennungen unter allen tatsächlich positiven Fällen.',
      'Construis le rappel~Ordonne le calcul de la fraction des urgences réelles détectées.~Pars des urgences réelles, pas de toutes les alertes.~Le rappel compte les détections correctes parmi tous les cas réellement positifs.'
    ],order(['Collect detected and missed emergencies|Sammle erkannte und übersehene Notfälle|Rassembler urgences détectées et manquées','Add TP + FN for the total|Addiere TP + FN für die Gesamtzahl|Additionner TP + FN pour le total','Divide TP by that total|Teile TP durch diese Gesamtzahl|Diviser TP par ce total'])),
    s('clinic-transfer','transfer','number',[
      'Audit a new screening tool~A clinic finds 9 true cases, raises 3 false alarms and misses 6 true cases. What is its recall? Enter a decimal from 0 to 1.~Recall asks about all true cases. Another tool with 4 found and 1 missed has recall 4 ÷ 5.~Recall is 9 ÷ (9 + 6) = 0.6. The 3 false alarms affect precision, not this denominator.',
      'Prüfe ein neues Screening~Eine Klinik findet 9 echte Fälle, meldet 3 Fehlalarme und übersieht 6 echte Fälle. Wie hoch ist ihr Recall? Gib eine Dezimalzahl von 0 bis 1 ein.~Recall fragt nach allen echten Fällen. Ein anderes Werkzeug mit 4 gefundenen und 1 übersehenem Fall hat Recall 4 ÷ 5.~Recall ist 9 ÷ (9 + 6) = 0,6. Die 3 Fehlalarme verändern Precision, nicht diesen Nenner.',
      'Vérifie un nouveau dépistage~Une clinique trouve 9 vrais cas, émet 3 fausses alertes et manque 6 vrais cas. Quel est son rappel ? Entre un décimal de 0 à 1.~Le rappel porte sur tous les vrais cas. Un autre outil qui en trouve 4 et en manque 1 a un rappel de 4 ÷ 5.~Le rappel vaut 9 ÷ (9 + 6) = 0,6. Les 3 fausses alertes affectent la précision, pas ce dénominateur.'
    ],num(.6,.00001,[9,6]))
  ]),
  m('neuron',5,[
    'Build a signal workshop~Two sensors send numbers to a tiny artificial neuron. You wire the weighted inputs, a bias and an output gate.~Follow a complete neuron calculation and apply it to changed sensor readings.',
    'Baue eine Signalwerkstatt~Zwei Sensoren senden Zahlen an ein kleines künstliches Neuron. Du verbindest gewichtete Eingaben, Bias und Ausgangstor.~Verfolge eine vollständige Neuronenrechnung und wende sie auf neue Sensorwerte an.',
    'Construis un atelier de signaux~Deux capteurs envoient des nombres à un petit neurone artificiel. Tu relies entrées pondérées, biais et porte de sortie.~Suis un calcul neuronal complet puis applique-le à de nouvelles mesures.'
  ],[
    s('sensors','example','story',[
      'Meet the two sensors~Sensor readings are [2, 1]. Their weights are [3, −2]. The first contributes 6; the second contributes −2. A bias of −1 will shift the sum.~Like the snack robot, multiply matching positions first.~An artificial neuron starts with the same weighted sum you already know.',
      'Lerne die Sensoren kennen~Die Sensorwerte sind [2, 1], ihre Gewichte [3, −2]. Der erste Beitrag ist 6, der zweite −2. Ein Bias von −1 verschiebt danach die Summe.~Multipliziere wie beim Snackroboter zuerst passende Positionen.~Ein künstliches Neuron beginnt mit der bereits bekannten gewichteten Summe.',
      'Rencontre les capteurs~Les mesures sont [2, 1] et les poids [3, −2]. Le premier apporte 6 ; le second −2. Un biais de −1 décale ensuite la somme.~Comme pour le robot du goûter, multiplie d’abord les positions correspondantes.~Un neurone artificiel commence par la somme pondérée que tu connais déjà.'
    ]),
    s('weighted-signal','example','number',[
      'Combine the signals~What is 2 × 3 + 1 × (−2) − 1, before the output gate?~Add both contributions and then add the bias.~The combined signal is 3. This value is often called the pre-activation.',
      'Kombiniere die Signale~Was ist 2 × 3 + 1 × (−2) − 1 vor dem Ausgangstor?~Addiere beide Beiträge und dann den Bias.~Das kombinierte Signal ist 3. Dieser Wert heißt oft Voraktivierung.',
      'Combine les signaux~Combien vaut 2 × 3 + 1 × (−2) − 1 avant la porte de sortie ?~Additionne les deux contributions puis le biais.~Le signal combiné vaut 3. Cette valeur s’appelle souvent la préactivation.'
    ],num(3,0,[2,3,1,-2,-1])),
    s('wire-weights','example','tune',[
      'Wire the workshop~Set the first weight to 3, second weight to −2 and bias to −1. These are adjustable parameters, unlike the measured inputs.~Weights multiply sensors; the bias shifts their combined result.~With readings [2, 1], these settings produce pre-activation 3.',
      'Verdrahte die Werkstatt~Setze das erste Gewicht auf 3, das zweite auf −2 und den Bias auf −1. Das sind veränderbare Parameter, anders als die gemessenen Eingaben.~Gewichte multiplizieren Sensorwerte; der Bias verschiebt das gemeinsame Ergebnis.~Bei Messwerten [2, 1] liefern diese Einstellungen die Voraktivierung 3.',
      'Câble l’atelier~Règle le premier poids sur 3, le second sur −2 et le biais sur −1. Ce sont des paramètres réglables, contrairement aux entrées mesurées.~Les poids multiplient les capteurs ; le biais décale leur somme.~Avec les mesures [2, 1], ces réglages produisent une préactivation de 3.'
    ],tune([control('w1','First weight|Erstes Gewicht|Premier poids',-3,3,1,0),control('w2','Second weight|Zweites Gewicht|Second poids',-3,3,1,0),control('bias','Bias shift|Bias-Verschiebung|Décalage du biais',-3,3,1,0)],{w1:3,w2:-2,bias:-1})),
    s('activation','principle','story',[
      'Open the output gate~An activation transforms the combined signal. Our ReLU gate outputs max(0, signal): positive values pass through; negative values become zero. Thus signal 3 outputs 3, and signal −2 outputs 0.~ReLU is a rule applied after the weighted sum and bias.~Without nonlinear gates, stacked linear layers still behave like one linear transformation. This gate adds a useful bend.',
      'Öffne das Ausgangstor~Eine Aktivierung verändert das kombinierte Signal. Unser ReLU-Tor liefert max(0, Signal): Positive Werte gehen durch, negative werden null. Signal 3 liefert 3 und Signal −2 liefert 0.~ReLU wird nach gewichteter Summe und Bias angewandt.~Ohne nichtlineare Tore verhalten sich gestapelte lineare Schichten wie eine einzige lineare Abbildung. Dieses Tor ergänzt einen nützlichen Knick.',
      'Ouvre la porte de sortie~Une activation transforme le signal combiné. Notre porte ReLU donne max(0, signal) : les positifs passent, les négatifs deviennent zéro. Le signal 3 donne 3 et −2 donne 0.~ReLU s’applique après la somme pondérée et le biais.~Sans portes non linéaires, des couches linéaires empilées restent une transformation linéaire. Cette porte ajoute un coude utile.'
    ]),
    s('neuron-parts','principle','match',[
      'Connect the components~Match each component to its job in the neuron.~Keep multiplication, shifting and gating separate.~Each component has a specific role in turning sensor readings into an output.',
      'Verbinde die Bauteile~Ordne jedem Bauteil seine Aufgabe im Neuron zu.~Trenne Multiplikation, Verschiebung und Torfunktion.~Jedes Bauteil hat eine bestimmte Rolle beim Umwandeln von Sensorwerten in eine Ausgabe.',
      'Relie les composants~Associe chaque composant à son rôle dans le neurone.~Sépare multiplication, décalage et filtrage.~Chaque composant joue un rôle précis pour transformer les mesures en sortie.'
    ],match([pair('Weight|Gewicht des Eingangs|Poids de l’entrée','Scale one input|Skaliert eine Eingabe|Multiplier une entrée'),pair('Bias|Bias des Neurons|Biais du neurone','Shift the sum|Verschiebt die Summe|Décaler la somme'),pair('ReLU activation|ReLU-Aktivierung|Activation ReLU','Clip negative signals to zero|Setzt negative Signale auf null|Ramener les signaux négatifs à zéro')])),
    s('neuron-pipeline','principle','order',[
      'Build the neuron’s pipeline~Order the operations from two raw sensor readings to the neuron output.~Apply the gate only after the bias has joined the sum.~Inputs → weights → sum and bias → activation is a complete forward pass.',
      'Baue die Neuronenkette~Ordne die Operationen von zwei rohen Sensorwerten bis zur Neuronenausgabe.~Wende das Tor erst an, wenn der Bias zur Summe addiert wurde.~Eingaben → Gewichte → Summe und Bias → Aktivierung ist ein vollständiger Vorwärtsdurchlauf.',
      'Construis la chaîne du neurone~Ordonne les opérations depuis les deux mesures brutes jusqu’à la sortie.~Applique la porte seulement après l’ajout du biais à la somme.~Entrées → poids → somme et biais → activation constitue un passage avant complet.'
    ],order(['Read the inputs|Lies die Eingaben|Lire les entrées','Multiply by weights|Multipliziere mit den Gewichten|Multiplier par les poids','Add contributions and bias|Addiere Beiträge und Bias|Additionner contributions et biais','Apply ReLU|Wende ReLU an|Appliquer ReLU'])),
    s('changed-sensors','transfer','number',[
      'New sensors, same neuron~A greenhouse neuron receives [1, 3], uses weights [3, −2] and bias −1, then ReLU. What output does it send?~Compute the full signal before the gate. A different signal of −5 would become 0.~The signal is 3 − 6 − 1 = −4, so ReLU outputs 0. You followed changed inputs through the complete neuron.',
      'Neue Sensoren, gleiches Neuron~Ein Gewächshausneuron erhält [1, 3], nutzt Gewichte [3, −2] und Bias −1, danach ReLU. Welche Ausgabe sendet es?~Berechne das vollständige Signal vor dem Tor. Ein anderes Signal von −5 würde zu 0.~Das Signal ist 3 − 6 − 1 = −4. ReLU liefert daher 0. Du hast geänderte Eingaben durch das ganze Neuron verfolgt.',
      'Nouveaux capteurs, même neurone~Un neurone de serre reçoit [1, 3], utilise les poids [3, −2], un biais de −1 puis ReLU. Quelle sortie envoie-t-il ?~Calcule tout le signal avant la porte. Un autre signal de −5 deviendrait 0.~Le signal vaut 3 − 6 − 1 = −4 : ReLU donne donc 0. Tu as suivi de nouvelles entrées dans le neurone entier.'
    ],num(0,0,[1,3,-2,-1,0]))
  ]),
  m('backprop',5,[
    'Trace the error backward~A tiny audio amplifier multiplies a knob w by 2, then adds 1. Its output should reach 7.~Use local derivatives to trace how a parameter changes a final squared error.',
    'Verfolge den Fehler rückwärts~Ein kleiner Audioverstärker multipliziert Regler w mit 2 und addiert dann 1. Seine Ausgabe soll 7 erreichen.~Verknüpfe lokale Ableitungen, um den Einfluss eines Parameters auf den quadrierten Fehler zu verfolgen.',
    'Remonte le chemin de l’erreur~Un petit amplificateur multiplie le bouton w par 2 puis ajoute 1. Sa sortie doit atteindre 7.~Combine les dérivées locales pour relier un paramètre à l’erreur finale au carré.'
  ],[
    s('amplifier','example','story',[
      'Follow the sound forward~The amplifier has two stages: a = 2w and y = a + 1. With knob w = 1, the intermediate signal is a = 2. The target output is 7.~Keep the intermediate value: it will help us explain which stage changed the output.~A computation graph records small operations and the values flowing between them.',
      'Folge dem Klang vorwärts~Der Verstärker hat zwei Stufen: a = 2w und y = a + 1. Bei Regler w = 1 ist das Zwischensignal a = 2. Die Zielausgabe ist 7.~Merke dir den Zwischenwert: Damit lässt sich erklären, welche Stufe die Ausgabe verändert.~Ein Rechengraph hält kleine Operationen und die Werte zwischen ihnen fest.',
      'Suis le son vers l’avant~L’amplificateur a deux étapes : a = 2w et y = a + 1. Pour w = 1, le signal intermédiaire vaut a = 2. La sortie cible est 7.~Garde la valeur intermédiaire : elle aide à expliquer l’effet de chaque étape.~Un graphe de calcul conserve les petites opérations et les valeurs qui les relient.'
    ]),
    s('forward-value','example','number',[
      'Finish the forward pass~For w = 1, a = 2w = 2. What is the output y = a + 1?~The second stage adds one; it does not multiply again.~The output is 3, four below the target. Its squared error is (3 − 7)² = 16.',
      'Beende den Vorwärtsdurchlauf~Für w = 1 gilt a = 2w = 2. Wie lautet die Ausgabe y = a + 1?~Die zweite Stufe addiert eins und multipliziert nicht noch einmal.~Die Ausgabe ist 3, vier unter dem Ziel. Ihr quadrierter Fehler ist (3 − 7)² = 16.',
      'Termine le passage avant~Pour w = 1, a = 2w = 2. Quelle est la sortie y = a + 1 ?~La seconde étape ajoute un ; elle ne multiplie pas à nouveau.~La sortie vaut 3, soit quatre de moins que la cible. L’erreur au carré vaut (3 − 7)² = 16.'
    ],num(3,0,[2,1])),
    s('correct-knob','example','tune',[
      'Find the silent error~Adjust w so that 2w + 1 reaches target 7. Watch the two stages carry your change forward.~Undo the added one, then undo multiplication by two.~At w = 3 the output is 7 and squared error is zero. Next we will find a direction without solving the whole equation.',
      'Bringe den Fehler zum Schweigen~Stelle w so ein, dass 2w + 1 das Ziel 7 erreicht. Beobachte, wie beide Stufen deine Änderung vorwärts tragen.~Mache zuerst das Addieren von eins und dann das Verdoppeln rückgängig.~Bei w = 3 ist die Ausgabe 7 und der quadrierte Fehler null. Als Nächstes suchen wir eine Richtung ohne vollständiges Auflösen.',
      'Fais taire l’erreur~Règle w pour que 2w + 1 atteigne 7. Observe les deux étapes transmettre ton changement.~Annule l’ajout de un puis la multiplication par deux.~À w = 3, la sortie vaut 7 et l’erreur est nulle. Nous allons trouver une direction sans résoudre toute l’équation.'
    ],tune([control('w','Amplifier knob|Verstärkerregler|Bouton de l’amplificateur',0,4,.25,1)],{w:3})),
    s('chain-rule','principle','story',[
      'Send sensitivity backward~Return to w = 1, y = 3. Loss L = (y − 7)² has slope dL/dy = 2(y − 7) = −8. Also dy/da = 1 and da/dw = 2. The chain rule multiplies: dL/dw = −8 × 1 × 2 = −16.~Each local derivative says how much its output changes for a tiny input change.~Backpropagation carries loss sensitivity backward through local derivatives. The negative gradient means increasing w initially lowers the loss.',
      'Schicke Empfindlichkeit rückwärts~Zurück bei w = 1, y = 3: Verlust L = (y − 7)² hat Steigung dL/dy = 2(y − 7) = −8. Außerdem dy/da = 1 und da/dw = 2. Die Kettenregel multipliziert: dL/dw = −8 × 1 × 2 = −16.~Jede lokale Ableitung sagt, wie stark ihre Ausgabe auf eine kleine Eingabeänderung reagiert.~Backpropagation trägt Verlustempfindlichkeit durch lokale Ableitungen rückwärts. Der negative Gradient bedeutet: Größeres w senkt zunächst den Verlust.',
      'Renvoie la sensibilité en arrière~Reviens à w = 1, y = 3. La perte L = (y − 7)² a pour pente dL/dy = 2(y − 7) = −8. Puis dy/da = 1 et da/dw = 2. La règle de chaîne multiplie : dL/dw = −8 × 1 × 2 = −16.~Chaque dérivée locale indique la variation de sa sortie pour une petite variation d’entrée.~La rétropropagation transmet la sensibilité de la perte à travers les dérivées locales. Le gradient négatif indique qu’augmenter w réduit d’abord la perte.'
    ]),
    s('local-derivatives','principle','match',[
      'Connect the local slopes~At w = 1, match each graph edge with its local derivative.~An addition by a constant has slope 1; multiplication by 2 has slope 2.~Local slopes describe one operation each. Multiplying them connects the parameter to the final loss.',
      'Verbinde lokale Steigungen~Ordne bei w = 1 jeder Kante im Graphen ihre lokale Ableitung zu.~Addition einer Konstante hat Steigung 1; Multiplikation mit 2 hat Steigung 2.~Lokale Steigungen beschreiben jeweils eine Operation. Ihr Produkt verbindet Parameter und endgültigen Verlust.',
      'Relie les pentes locales~À w = 1, associe chaque lien du graphe à sa dérivée locale.~Ajouter une constante a une pente de 1 ; multiplier par 2 a une pente de 2.~Chaque pente décrit une opération. Leur produit relie le paramètre à la perte finale.'
    ],match([pair('Output y → squared loss L|Ausgabe y → quadrierter Verlust L|Sortie y → perte au carré L','Local slope −8|Lokale Steigung −8|Pente locale −8'),pair('Intermediate a → output y|Zwischenwert a → Ausgabe y|Intermédiaire a → sortie y','Local slope 1|Lokale Steigung 1|Pente locale 1'),pair('Knob w → intermediate a|Regler w → Zwischenwert a|Bouton w → intermédiaire a','Local slope 2|Lokale Steigung 2|Pente locale 2')])),
    s('backward-order','principle','order',[
      'Walk backward through the graph~Order the loss-sensitivity calculation, beginning at the final error.~Forward values are already stored. Follow their dependencies in reverse.~Loss → output → intermediate → parameter is the reverse of the forward calculation.',
      'Gehe rückwärts durch den Graphen~Ordne die Berechnung der Verlustempfindlichkeit, beginnend beim endgültigen Fehler.~Die Vorwärtswerte sind gespeichert. Folge ihren Abhängigkeiten in umgekehrter Richtung.~Verlust → Ausgabe → Zwischenwert → Parameter kehrt die Vorwärtsrechnung um.',
      'Remonte le graphe~Ordonne le calcul de sensibilité en commençant par l’erreur finale.~Les valeurs avant sont conservées. Suis leurs dépendances en sens inverse.~Perte → sortie → intermédiaire → paramètre inverse le calcul avant.'
    ],order(['Start at loss L|Beginne beim Verlust L|Partir de la perte L','Compute dL/dy|Berechne die Ableitung dL/dy|Calculer la dérivée dL/dy','Multiply by dy/da|Multipliziere mit dy/da|Multiplier par dy/da','Multiply by da/dw|Multipliziere mit da/dw|Multiplier par da/dw'])),
    s('pressure-transfer','transfer','number',[
      'Trace a new pressure controller~Now a = 3w, y = a + 2 and L = (y − 8)². At w = 1, compute dL/dw. Keep its sign.~First compute y, then multiply 2(y − target), dy/da and da/dw. In another chain, −4 × 1 × 2 gives −8.~Here y = 5, so dL/dw = 2(5 − 8) × 1 × 3 = −18. You applied the chain rule to new operations and values.',
      'Untersuche eine neue Druckregelung~Jetzt gilt a = 3w, y = a + 2 und L = (y − 8)². Berechne bei w = 1 die Ableitung dL/dw mit Vorzeichen.~Berechne zuerst y und multipliziere dann 2(y − Ziel), dy/da und da/dw. In einer anderen Kette ergibt −4 × 1 × 2 den Wert −8.~Hier ist y = 5. Daher dL/dw = 2(5 − 8) × 1 × 3 = −18. Du hast die Kettenregel auf neue Operationen und Werte angewandt.',
      'Analyse un nouveau régulateur de pression~Désormais a = 3w, y = a + 2 et L = (y − 8)². À w = 1, calcule dL/dw avec son signe.~Calcule y puis multiplie 2(y − cible), dy/da et da/dw. Dans une autre chaîne, −4 × 1 × 2 donne −8.~Ici y = 5 : dL/dw = 2(5 − 8) × 1 × 3 = −18. Tu as transféré la règle de chaîne à de nouvelles opérations et valeurs.'
    ],num(-18,0,[3,1,2,8]))
  ]),
  m('attention',9,[
    'Mix signals with attention~A word looks toward three other words, each carrying a score and a value. These numbers are an illustration, not measurements from a language model.~Normalize scores, mix values and explain what a changed temperature can and cannot show.',
    'Mische Signale mit Attention~Ein Wort blickt auf drei andere Wörter mit je einem Score und Wert. Die Zahlen sind eine Illustration, keine Messungen eines Sprachmodells.~Normalisiere Scores, mische Werte und erkläre die Wirkung und Grenzen einer Temperaturänderung.',
    'Mélange les signaux avec l’attention~Un mot regarde trois autres mots portant chacun un score et une valeur. Ces nombres illustrent un mécanisme ; ils ne mesurent aucun modèle de langue.~Normalise les scores, mélange les valeurs et explique l’effet et les limites d’un changement de température.'
  ],[
    s('word-links','example','story',[
      'Three word connections~Imagine “it” looking toward three words. Their illustrative scores are 0, ln(2), ln(3), and their values are 2, 4, 8. Here ln is natural logarithm; exponentiating reverses it, giving strengths 1, 2, 3.~A score selects how strongly to use a word; its value is the information being mixed.~Attention uses input-dependent weights to combine information. This tiny example does not explain a model’s language understanding.',
      'Drei Wortverbindungen~Stell dir vor, „es“ blickt auf drei Wörter. Ihre illustrativen Scores sind 0, ln(2), ln(3), die Werte 2, 4, 8. ln ist der natürliche Logarithmus; Potenzieren mit e kehrt ihn um und ergibt Stärken 1, 2, 3.~Ein Score bestimmt, wie stark ein Wort genutzt wird; sein Wert ist die zu mischende Information.~Attention kombiniert Information mit eingabeabhängigen Gewichten. Das kleine Beispiel erklärt kein Sprachverständnis eines Modells.',
      'Trois liens entre mots~Imagine « il » regardant trois mots. Leurs scores illustratifs sont 0, ln(2), ln(3) et leurs valeurs 2, 4, 8. ln est le logarithme naturel ; l’exponentielle l’inverse et donne les forces 1, 2, 3.~Le score choisit l’importance d’un mot ; sa valeur est l’information mélangée.~L’attention combine l’information avec des poids dépendant de l’entrée. Ce petit exemple n’explique pas la compréhension d’un modèle.'
    ]),
    s('attention-roles','example','match',[
      'Connect the attention roles~Connect the query, score and value to their jobs in this illustration. A query is the representation asking what information to collect.~Separate the question, the matching strength and the content being collected.~The score helps set the weight; the value supplies the content. They are not interchangeable.',
      'Verbinde die Attention-Rollen~Ordne Query, Score und Value ihre Aufgaben zu. Eine Query ist die Darstellung, die nach benötigter Information fragt.~Trenne Frage, Verbindungsstärke und gesammelten Inhalt.~Der Score hilft beim Festlegen des Gewichts; der Value liefert den Inhalt. Beide sind nicht austauschbar.',
      'Relie les rôles de l’attention~Relie requête, score et valeur à leur rôle. Une requête est la représentation qui demande quelle information recueillir.~Sépare la question, la force du lien et le contenu collecté.~Le score détermine le poids ; la valeur apporte le contenu. Ils ne sont pas interchangeables.'
    ],match([pair('Query|Query (Anfrage)|Requête','Representation seeking information|Darstellung sucht Information|Représentation cherchant l’information'),pair('Score|Score der Verbindung|Score du lien','Compatibility before normalization|Passung vor der Normalisierung|Compatibilité avant normalisation'),pair('Value|Value (Inhalt)|Valeur du contenu','Information to mix|Zu mischende Information|Information à mélanger')])),
    s('normalize','principle','tune',[
      'Build the normalized weights~Softmax exponentiates the scores and divides by their total. The strengths are 1, 2, 3, total 6. Set weights to 1/6, 2/6, 3/6, within 0.01 each.~Use approximately 0.17, 0.33 and 0.50. Normalized weights sum to one.~The three weights are approximately 0.167, 0.333, 0.500. Larger scores get more share, not arbitrary extra mass.',
      'Baue die normierten Gewichte~Softmax potenziert Scores mit e und teilt durch ihre Summe. Die Stärken sind 1, 2, 3, zusammen 6. Setze Gewichte auf 1/6, 2/6, 3/6, jeweils mit Abweichung höchstens 0,01.~Nutze ungefähr 0,17, 0,33 und 0,50. Normierte Gewichte ergeben zusammen eins.~Die drei Gewichte sind ungefähr 0,167, 0,333, 0,500. Größere Scores bekommen mehr Anteil, keine beliebige Zusatzmasse.',
      'Construis les poids normalisés~Softmax applique l’exponentielle puis divise par le total. Les forces sont 1, 2, 3, soit 6. Règle les poids sur 1/6, 2/6, 3/6, à 0,01 près chacun.~Utilise environ 0,17, 0,33 et 0,50. Les poids normalisés totalisent un.~Les poids valent environ 0,167, 0,333, 0,500. Les grands scores obtiennent une plus grande part du même total.'
    ],tune([control('a','First weight|Erstes Gewicht|Premier poids',0,1,.01,.33),control('b','Second weight|Zweites Gewicht|Deuxième poids',0,1,.01,.33),control('c','Third weight|Drittes Gewicht|Troisième poids',0,1,.01,.34)],{a:1/6,b:2/6,c:3/6},.01)),
    s('weighted-value','principle','number',[
      'Mix the values~Values 2, 4, 8 receive exact weights 1/6, 2/6, 3/6. Compute (1 × 2 + 2 × 4 + 3 × 8) ÷ 6. Enter a decimal within 0.01.~Calculate each weighted contribution and add. This is the dot product with normalized weights.~The mixture is 34/6 ≈ 5.667. Attention returns a weighted combination rather than simply picking the largest value.',
      'Mische die Werte~Werte 2, 4, 8 erhalten exakte Gewichte 1/6, 2/6, 3/6. Berechne (1 × 2 + 2 × 4 + 3 × 8) ÷ 6. Gib eine Dezimalzahl mit Toleranz 0,01 ein.~Berechne jeden gewichteten Beitrag und addiere. Das ist das Skalarprodukt mit normierten Gewichten.~Die Mischung ist 34/6 ≈ 5,667. Attention liefert eine gewichtete Kombination und wählt nicht einfach den größten Wert.',
      'Mélange les valeurs~Les valeurs 2, 4, 8 reçoivent les poids exacts 1/6, 2/6, 3/6. Calcule (1 × 2 + 2 × 4 + 3 × 8) ÷ 6 à 0,01 près.~Calcule chaque contribution pondérée puis additionne. C’est un produit scalaire avec des poids normalisés.~Le mélange vaut 34/6 ≈ 5,667. L’attention combine les valeurs au lieu de prendre simplement la plus grande.'
    ],num(34/6,.01,[1,2,3,4,6,8])),
    s('temperature','principle','story',[
      'A new knob: temperature~Temperature T divides scores before softmax: weight ∝ exp(score/T). T must be positive. Larger T makes shares more even; smaller T concentrates them. At T = 2, strengths become 1, √2, √3.~Dividing scores by two shrinks their differences. It does not divide the final weights by two.~Temperature changes the distribution while weights still sum to one. It does not measure factual correctness.',
      'Ein neuer Regler: Temperatur~Temperatur T teilt Scores vor Softmax: Gewicht ∝ exp(Score/T). T muss positiv sein. Größeres T gleicht Anteile an, kleineres konzentriert sie. Bei T = 2 werden Stärken zu 1, √2, √3.~Halbierte Scores verkleinern ihre Abstände. Sie halbieren nicht die fertigen Gewichte.~Temperatur verändert die Verteilung; die Gewichte ergeben weiter eins. Sie misst keine sachliche Richtigkeit.',
      'Un nouveau bouton : température~La température T divise les scores avant softmax : poids ∝ exp(score/T). T est positive. Une grande T égalise les parts ; une petite T les concentre. À T = 2, les forces sont 1, √2, √3.~Diviser les scores par deux réduit leurs écarts, sans diviser les poids finaux par deux.~La température change la répartition, dont la somme reste un. Elle ne mesure pas l’exactitude des faits.'
    ]),
    s('warmer-weights','principle','tune',[
      'Rebuild the warmer distribution~At T = 2 divide 1, √2, √3 by their total, about 4.146. Set weights near 0.241, 0.341 and 0.418, within 0.01 each.~Compared with T = 1, the smallest share grows and the largest shrinks.~The higher temperature makes the same scores less concentrated. The values themselves have not changed.',
      'Baue die wärmere Verteilung~Bei T = 2 teile 1, √2, √3 durch ihre Summe von etwa 4,146. Stelle Gewichte nahe 0,241, 0,341 und 0,418 ein, mit Toleranz 0,01.~Gegenüber T = 1 wächst der kleinste Anteil und der größte schrumpft.~Die höhere Temperatur verteilt dieselben Scores gleichmäßiger. Die Werte selbst bleiben unverändert.',
      'Reconstruis la répartition plus chaude~À T = 2, divise 1, √2, √3 par leur somme, environ 4,146. Vise 0,241, 0,341 et 0,418, à 0,01 près.~Par rapport à T = 1, la petite part grandit et la grande diminue.~La température plus élevée répartit les mêmes scores plus uniformément. Les valeurs n’ont pas changé.'
    ],tune([control('a','First weight|Erstes Gewicht|Premier poids',0,1,.01,.17),control('b','Second weight|Zweites Gewicht|Deuxième poids',0,1,.01,.33),control('c','Third weight|Drittes Gewicht|Troisième poids',0,1,.01,.5)],{a:1/(1+Math.sqrt(2)+Math.sqrt(3)),b:Math.sqrt(2)/(1+Math.sqrt(2)+Math.sqrt(3)),c:Math.sqrt(3)/(1+Math.sqrt(2)+Math.sqrt(3))},.01)),
    s('illustration-limits','principle','match',[
      'Connect evidence to its limits~Match each observation with the conclusion it actually supports.~A mechanism demo shows arithmetic. Claims about real model behavior require real measurements and controlled tests.~A high attention weight alone does not prove causality, truth or understanding.',
      'Verbinde Evidenz und Grenzen~Ordne jeder Beobachtung die Schlussfolgerung zu, die sie tatsächlich stützt.~Eine Mechanismusdemo zeigt Rechenregeln. Aussagen über echte Modelle benötigen Messungen und kontrollierte Tests.~Ein hohes Attention-Gewicht allein beweist weder Ursache noch Wahrheit noch Verständnis.',
      'Relie preuves et limites~Associe chaque observation à la conclusion qu’elle soutient réellement.~Une démonstration montre un calcul. Le comportement réel exige mesures et tests contrôlés.~Un grand poids d’attention ne prouve à lui seul ni causalité, ni vérité, ni compréhension.'
    ],match([pair('Weights total one|Gewichte ergeben eins|Les poids totalisent un','Normalized mixture|Normierte Mischung|Mélange normalisé'),pair('One word gets a large weight|Ein Wort erhält ein großes Gewicht|Un mot reçoit un grand poids','Large share of this mixture’s weight|Großer Anteil am Gewicht dieser Mischung|Grande part du poids de ce mélange'),pair('Invented scores in a demo|Erfundene Scores in einer Demo|Scores inventés dans une démonstration','Illustration, not a measured language model|Illustration, kein gemessenes Sprachmodell|Illustration, pas mesure d’un modèle de langue')])),
    s('music-transfer','transfer','number',[
      'Transfer the mix to music~A music mixer uses the warmer shares 0.241, 0.341, 0.418 for new values 1, 3, 5. What weighted value results? Enter within 0.01. These are still illustrative data.~Multiply corresponding values and shares, then add. Another mix, shares 0.25/0.75 and values 2/6, gives 5.~The result is about 3.354. You transferred normalized weighting to new content without treating weights as proof of meaning.',
      'Übertrage die Mischung auf Musik~Ein Musikmischer nutzt die wärmeren Anteile 0,241, 0,341, 0,418 für neue Werte 1, 3, 5. Welcher gewichtete Wert entsteht? Toleranz 0,01. Die Daten bleiben illustrativ.~Multipliziere passende Werte und Anteile und addiere. Eine andere Mischung mit Anteilen 0,25/0,75 und Werten 2/6 ergibt 5.~Das Ergebnis ist etwa 3,354. Du hast normierte Gewichtung auf neue Inhalte übertragen, ohne Gewichte als Bedeutungsbeweis zu behandeln.',
      'Transfère le mélange à la musique~Un mixeur utilise les parts 0,241, 0,341, 0,418 pour de nouvelles valeurs 1, 3, 5. Quel mélange obtient-il à 0,01 près ? Les données restent illustratives.~Multiplie chaque valeur par sa part puis additionne. Un autre mélange, parts 0,25/0,75 et valeurs 2/6, donne 5.~Le résultat vaut environ 3,354. Tu as transféré la pondération à de nouveaux contenus sans y voir une preuve de sens.'
    ],num((1+3*Math.sqrt(2)+5*Math.sqrt(3))/(1+Math.sqrt(2)+Math.sqrt(3)),.01,[.241,.341,.418,1,3,5]))
  ]),
  m('research',10,[
    'Design an honest research test~A team says its speech model works everywhere because it improved in one quiet room. Your laboratory has to test the claim.~Separate claims, assumptions and evidence, then design a fair comparison and limit the conclusion.',
    'Entwirf einen ehrlichen Forschungstest~Ein Team behauptet: Sein Sprachmodell funktioniert überall, weil es sich in einem ruhigen Raum verbessert hat. Dein Labor prüft die Aussage.~Trenne Aussage, Annahme und Evidenz, plane einen fairen Vergleich und begrenze die Schlussfolgerung.',
    'Conçois un test de recherche honnête~Une équipe dit que son modèle vocal marche partout après un progrès dans une salle calme. Ton laboratoire doit tester cette affirmation.~Sépare affirmation, hypothèse et preuve, prépare une comparaison équitable et limite la conclusion.'
  ],[
    s('claim','example','story',[
      'Read the laboratory claim~“Our new speech model is better everywhere.” The only experiment used 100 recordings from one quiet room. A claim can be broader than the evidence that supports it.~Look for the population, conditions and metric named in the experiment.~One quiet-room result supports a claim about that test, not every language, speaker or noise level.',
      'Lies die Laboraussage~„Unser neues Sprachmodell ist überall besser.“ Das einzige Experiment nutzt 100 Aufnahmen aus einem ruhigen Raum. Eine Aussage kann weiter reichen als ihre Evidenz.~Suche Grundgesamtheit, Bedingungen und Messgröße des Experiments.~Ein Ergebnis aus einem ruhigen Raum stützt diese Testsituation, nicht jede Sprache, Stimme oder Lärmstufe.',
      'Lis l’affirmation du laboratoire~« Notre nouveau modèle vocal est meilleur partout. » L’unique expérience porte sur 100 enregistrements d’une salle calme. Une affirmation peut dépasser ses preuves.~Repère population, conditions et mesure de l’expérience.~Un résultat en salle calme soutient ce test, pas toutes les langues, voix ou nuisances sonores.'
    ]),
    s('quiet-improvement','example','number',[
      'Measure the observed gain~On the same 100 quiet recordings, the baseline makes 20 errors and the new model 15. How many fewer errors does the new model make?~Subtract new errors from baseline errors on these same cases.~The observed gain is 5 fewer errors. This is an absolute count on this test, not a universal performance guarantee.',
      'Miss den beobachteten Gewinn~Auf denselben 100 ruhigen Aufnahmen macht das Basismodell 20 Fehler, das neue 15. Wie viele Fehler weniger macht das neue Modell?~Ziehe neue Fehler von Basisfehlern auf denselben Fällen ab.~Der beobachtete Gewinn sind 5 Fehler weniger. Das ist eine absolute Anzahl in diesem Test, keine allgemeine Leistungsgarantie.',
      'Mesure le gain observé~Sur les mêmes 100 enregistrements calmes, la référence fait 20 erreurs et le nouveau modèle 15. Combien d’erreurs évite le nouveau ?~Soustrais les nouvelles erreurs de celles de la référence sur ces mêmes cas.~Le gain observé est de 5 erreurs. C’est un compte absolu dans ce test, pas une garantie universelle.'
    ],num(5,0,[20,15])),
    s('claim-evidence','example','match',[
      'Sort the laboratory notes~Connect each note to claim, assumption or evidence. An assumption is something the argument relies on but this test has not established.~Measured counts are evidence; “everywhere” is a claim; representativeness needs checking.~Separating these roles reveals which parts need further experiments.',
      'Sortiere die Labornotizen~Ordne jede Notiz Aussage, Annahme oder Evidenz zu. Eine Annahme wird im Argument vorausgesetzt, aber durch diesen Test nicht belegt.~Gemessene Zahlen sind Evidenz; „überall“ ist eine Aussage; Repräsentativität muss geprüft werden.~Die Trennung zeigt, welche Teile weitere Experimente brauchen.',
      'Classe les notes du laboratoire~Relie chaque note à affirmation, hypothèse ou preuve. Une hypothèse est un appui de l’argument que ce test n’a pas établi.~Les comptes sont des preuves ; « partout » est une affirmation ; la représentativité reste à vérifier.~Séparer ces rôles montre ce qu’il faut encore tester.'
    ],match([pair('The model is better everywhere|Das Modell ist überall besser|Le modèle est meilleur partout','Claim|Zu prüfende Aussage|Affirmation à tester'),pair('Quiet recordings represent all use|Ruhige Aufnahmen stehen für jede Nutzung|Le calme représente tous les usages','Assumption|Ungeprüfte Annahme|Hypothèse non vérifiée'),pair('15 errors versus 20 on 100 recordings|15 statt 20 Fehler auf 100 Aufnahmen|15 erreurs contre 20 sur 100 enregistrements','Evidence|Gemessene Evidenz|Preuve mesurée')])),
    s('fair-test','principle','order',[
      'Build the next experiment~Order a fair comparison. Predefine the question, share the same held-out cases and budget, then compare results across conditions.~Decide how to judge success before seeing which model wins.~A shared protocol reduces alternative explanations such as easier data or more compute for only one model.',
      'Baue das nächste Experiment~Ordne einen fairen Vergleich. Lege die Frage fest, nutze dieselben zurückgehaltenen Fälle und Budgets und vergleiche dann Bedingungen.~Lege Erfolgskriterien fest, bevor du siehst, welches Modell gewinnt.~Ein gemeinsames Protokoll verringert andere Erklärungen wie leichtere Daten oder mehr Rechenleistung für nur ein Modell.',
      'Construis la prochaine expérience~Ordonne une comparaison équitable : fixe la question, partage les mêmes cas réservés et budgets, puis compare les conditions.~Définis le succès avant de savoir quel modèle gagne.~Un protocole commun réduit les explications concurrentes, comme des données plus faciles ou davantage de calcul pour un seul modèle.'
    ],order(['Define population, metric and comparison|Definiere Grundgesamtheit, Messgröße und Vergleich|Définir population, mesure et comparaison','Freeze shared held-out cases and budget|Lege gemeinsame Testfälle und Budget fest|Figer les cas réservés et le budget communs','Run both models under the same protocol|Prüfe beide Modelle unter gleichem Protokoll|Tester les deux modèles avec le même protocole','Report repeated results and limits|Berichte wiederholte Ergebnisse und Grenzen|Rapporter répétitions et limites'])),
    s('uncertainty','principle','story',[
      'Ask what could change the result~Repeat runs when training is random; report variation, not just the best run. Check relevant subgroups and use untouched cases. A controlled comparison supports the tested change under its stated conditions.~More repeats reduce uncertainty about that setup; they do not expand the population automatically.~A strong conclusion names the metric, dataset, conditions and uncertainty. An ablation changes one component to probe its contribution.',
      'Frage nach veränderlichen Ergebnissen~Wiederhole Läufe bei zufälligem Training und berichte Streuung statt nur den besten Lauf. Prüfe relevante Teilgruppen und unberührte Fälle. Ein kontrollierter Vergleich stützt die Änderung unter den angegebenen Bedingungen.~Mehr Wiederholungen verringern Unsicherheit für diesen Aufbau, erweitern aber nicht automatisch die Grundgesamtheit.~Eine starke Schlussfolgerung nennt Messgröße, Daten, Bedingungen und Unsicherheit. Eine Ablation verändert eine Komponente, um ihren Beitrag zu prüfen.',
      'Demande ce qui ferait varier le résultat~Répète si l’entraînement est aléatoire ; rapporte la variation, pas seulement le meilleur essai. Vérifie les sous-groupes et les cas intacts. Une comparaison contrôlée soutient le changement dans les conditions annoncées.~Les répétitions réduisent l’incertitude du protocole sans élargir automatiquement la population.~Une conclusion solide nomme mesure, données, conditions et incertitude. Une ablation change un composant pour sonder sa contribution.'
    ]),
    s('research-tools','principle','match',[
      'Choose the right research tool~Match each concern with the experiment that addresses it.~A tool answers a specific question, not every weakness of a study.~Repeats measure run variation, subgroup tests reveal uneven performance, and ablations isolate components under controlled conditions.',
      'Wähle das passende Forschungswerkzeug~Ordne jeder Sorge das passende Experiment zu.~Ein Werkzeug beantwortet eine konkrete Frage, nicht jede Schwäche einer Studie.~Wiederholungen messen Laufstreuung, Teilgruppentests zeigen ungleiche Leistung und Ablationen isolieren Komponenten unter kontrollierten Bedingungen.',
      'Choisis le bon outil de recherche~Associe chaque préoccupation à l’expérience adaptée.~Un outil répond à une question précise, pas à toutes les faiblesses d’une étude.~Les répétitions mesurent la variation, les sous-groupes révèlent les écarts et les ablations isolent les composants sous contrôle.'
    ],match([pair('Does a component help?|Hilft eine Komponente?|Un composant aide-t-il ?','Controlled ablation|Kontrollierte Ablation|Ablation contrôlée'),pair('Is one run lucky?|Ein glücklicher Einzellauf?|Un essai chanceux ?','Repeated runs|Wiederholte Läufe|Essais répétés'),pair('Does noisy audio suffer?|Leidet verrauschte Sprache?|Le bruit dégrade-t-il le résultat ?','Noise subgroup evaluation|Auswertung nach Lärmgruppen|Évaluation par groupes de bruit')])),
    s('translation-limits','transfer','match',[
      'A new paper: translation~A translation model reduces errors on French news in three runs. Connect each proposed conclusion to its status. No medical texts or other languages were tested.~Keep each conclusion within the tested population and metric.~The news result supports a limited claim. Medical performance remains untested, and “all languages” exceeds the evidence.',
      'Ein neues Paper: Übersetzung~Ein Übersetzungsmodell senkt Fehler auf französischen Nachrichten in drei Läufen. Ordne die Schlussfolgerungen ihrem Status zu. Medizintexte und andere Sprachen wurden nicht getestet.~Begrenze jede Schlussfolgerung auf geprüfte Grundgesamtheit und Messgröße.~Das Nachrichtenergebnis stützt eine begrenzte Aussage. Medizinleistung bleibt ungeprüft; „alle Sprachen“ überschreitet die Evidenz.',
      'Un nouvel article : traduction~Un modèle réduit les erreurs sur l’actualité française en trois essais. Classe les conclusions. Aucun texte médical ni autre langue n’a été testé.~Limite chaque conclusion à la population et à la mesure testées.~Le résultat soutient une conclusion limitée à l’actualité. La médecine reste non testée ; « toutes les langues » dépasse les preuves.'
    ],match([pair('Fewer errors on the tested French news|Weniger Fehler auf den geprüften französischen Nachrichten|Moins d’erreurs sur l’actualité française testée','Supported within this test|Innerhalb dieses Tests gestützt|Soutenu dans ce test'),pair('Works equally well on medical texts|Funktioniert ebenso gut auf Medizintexten|Aussi bon sur les textes médicaux','New domain: untested|Neuer Bereich: ungeprüft|Nouveau domaine : non testé'),pair('Better for every language|Besser für jede Sprache|Meilleur pour toutes les langues','Unsupported generalization|Unbelegte Verallgemeinerung|Généralisation non étayée')])),
    s('subgroup-transfer','transfer','number',[
      'Check the claim against a new subgroup~In a fresh test, baseline/new errors are 20/12 on quiet audio and 10/14 on noisy audio. How many additional errors does the new model make on noisy audio?~Compare within the noisy group. In a different study, changing from 6 to 9 errors would mean 3 additional errors.~The new model makes 4 extra noisy-audio errors. Its average improvement cannot justify “better in every condition”.',
      'Prüfe die Aussage an einer neuen Teilgruppe~In einem frischen Test sind Basis-/Neufehler 20/12 bei ruhiger und 10/14 bei verrauschter Sprache. Wie viele zusätzliche Fehler macht das neue Modell bei verrauschter Sprache?~Vergleiche innerhalb der Lärmgruppe. In einer anderen Studie wäre ein Wechsel von 6 auf 9 Fehler eine Zunahme um 3.~Das neue Modell macht 4 zusätzliche Fehler bei verrauschter Sprache. Eine mittlere Verbesserung rechtfertigt nicht „unter jeder Bedingung besser“.',
      'Confronte l’affirmation à un nouveau groupe~Dans un nouveau test, erreurs référence/nouveau : 20/12 au calme et 10/14 dans le bruit. Combien d’erreurs supplémentaires le nouveau modèle fait-il dans le bruit ?~Compare dans le groupe bruyant. Ailleurs, passer de 6 à 9 erreurs en ajouterait 3.~Le nouveau modèle fait 4 erreurs de plus dans le bruit. Un gain moyen ne justifie pas « meilleur dans toutes les conditions ».'
    ],num(4,0,[10,14]))
  ])
];

// Quantitative scenes carry their own source values so a new task cannot inherit
// a decorative diagram or stale counts from the preceding example.
const counts = rows => ({kind:'counts',counts:rows.map(([label,value])=>({label:t(label),value}))});
const visual = (missionId,stepId,value) => {
  missions.find(mission=>mission.id===missionId).steps.find(step=>step.id===stepId).visual=value;
};
visual('generalization','gardens',counts([
  ['A: training mistakes|A: Trainingsfehler|A : erreurs d’entraînement',1],
  ['A: new-plant mistakes|A: Fehler bei neuen Pflanzen|A : erreurs sur plantes inédites',8],
  ['B: training mistakes|B: Trainingsfehler|B : erreurs d’entraînement',3],
  ['B: new-plant mistakes|B: Fehler bei neuen Pflanzen|B : erreurs sur plantes inédites',4]
]));
visual('generalization','new-error',counts([
  ['A: mistakes on new plants|A: Fehler bei neuen Pflanzen|A : erreurs sur plantes inédites',8],
  ['B: mistakes on new plants|B: Fehler bei neuen Pflanzen|B : erreurs sur plantes inédites',4]
]));
visual('generalization','forecast-transfer',counts([
  ['P: training error|P: Trainingsfehler|P : erreur d’entraînement',2],
  ['P: validation error|P: Validierungsfehler|P : erreur de validation',9],
  ['Q: training error|Q: Trainingsfehler|Q : erreur d’entraînement',4],
  ['Q: validation error|Q: Validierungsfehler|Q : erreur de validation',5]
]));
for (const stepId of ['claim','quiet-improvement']) visual('research',stepId,counts([
  ['Baseline errors, quiet audio|Basisfehler bei ruhiger Sprache|Erreurs de référence au calme',20],
  ['New model errors, quiet audio|Neue Modellfehler bei ruhiger Sprache|Erreurs du nouveau modèle au calme',15]
]));
visual('research','subgroup-transfer',counts([
  ['Quiet: baseline errors|Ruhig: Basisfehler|Calme : erreurs de référence',20],
  ['Quiet: new model errors|Ruhig: neue Modellfehler|Calme : erreurs du nouveau modèle',12],
  ['Noisy: baseline errors|Lärm: Basisfehler|Bruit : erreurs de référence',10],
  ['Noisy: new model errors|Lärm: neue Modellfehler|Bruit : erreurs du nouveau modèle',14]
]));
for (const stepId of ['gap','square-gap']) visual('regression',stepId,counts([
  ['Observed minutes|Beobachtete Minuten|Minutes observées',10],
  ['Predicted minutes|Vorhergesagte Minuten|Minutes prédites',8]
]));

function localize(value,locale) {
  if (Array.isArray(value)) return value.map(item=>localize(item,locale));
  if (value && typeof value === 'object') {
    if (Object.hasOwn(value,'en') && Object.hasOwn(value,'de') && Object.hasOwn(value,'fr')) return value[locale];
    return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,localize(item,locale)]));
  }
  return value;
}

export const getMissionIds = () => missions.map(mission=>mission.id);
export function getMission(id,locale='en') {
  const mission = missions.find(item=>item.id===id);
  return mission ? localize(mission,['en','de','fr'].includes(locale)?locale:'en') : undefined;
}
