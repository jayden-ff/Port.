// Each || boundary is one short reading card: one idea and a concrete example.
const cards = (...items) => items.join('||');
const text = (title, subtitle, goal, intro, task, reading, questions) =>
  ({title, subtitle, goal, intro, task, reading, questions});
const question = (prompt, explanation, options) => ({prompt, explanation, ...(options ? {options} : {})});

const en = {
  lessons: {
    prediction: {
      goal: 'Make a prediction and distinguish a model parameter from an observation.',
      intro: 'Start with one line: its slope and intercept turn an input into a prediction.',
      task: 'Move the slope once. Keep the change if loss falls; otherwise move back. Then try the intercept.',
      reading: cards(
        'A model is a rule with adjustable numbers. In ŷ = wx + b, x is the observed input; w and b are the parameters you can train. For w = 2, b = 1 and x = 3, the prediction is 2 × 3 + 1 = 7.',
        'Loss measures a mistake. If the true value is 5, the squared error of a prediction of 7 is (7 − 5)² = 4. Average these errors over the training examples to score the whole line. A lower score means a closer fit to those examples.',
        'Training changes the parameters to reduce loss. A good fit still needs a new-data check: a line can match today’s examples and miss tomorrow’s. Keep some observations outside training to test it.'
      )
    },
    vectors: {
      goal: 'Compute a weighted sum and match the dimensions of a matrix and a vector.',
      intro: 'A vector is a list of numbers. A weighted sum decides how much each number contributes.',
      task: 'Set the weight to zero, then negative. Describe which contribution disappears or changes direction.',
      reading: cards(
        'Represent an example as an ordered list x. A weight list w has one weight per input. The dot product multiplies matching entries and adds them: (2, −1) · (3, 4) = 2 × 3 − 1 × 4 = 2.',
        'A zero weight ignores an input; a negative weight reverses its contribution. Add a bias to get a score z. The sigmoid turns z into a probability: a score of 0 gives 0.5. Changing one weight changes the score before that conversion.',
        'A matrix stacks examples in rows. If X has 100 rows and 5 columns, each example has 5 features. Multiply by 5 weights to get 100 scores, one per row. Check the matching 5 before multiplying.'
      )
    },
    probability: {
      goal: 'Use counts to explain why a positive signal depends on the base rate.',
      intro: 'A reliable detector can still give many false alarms when the event is rare.',
      task: 'Keep the detector fixed. Raise the prior, predict the direction of the result, then check.',
      reading: cards(
        'The prior is how common an event is before new evidence. The posterior is its probability after evidence. “Positive when true” and “true when positive” ask different questions. Bayes’ rule connects them.',
        'Imagine 10,000 cases: 1% are true cases, so there are 100. A detector finds 90% of them: 90 true positives. Of the remaining 9,900 cases, 5% trigger false alarms: 495 false positives.',
        'Now count only positives: 90 + 495 = 585. The fraction that are true is 90 / 585 ≈ 15.4%. With the same detector, a higher prior means more true cases among positives. Use counts before memorizing the formula.'
      )
    },
    derivatives: {
      goal: 'Calculate one gradient step and recognize when its size causes instability.',
      intro: 'The gradient gives a local uphill direction. Learning takes a small step the other way.',
      task: 'Start at 4 with rate 0.25 and take three steps. Reset, use 1.10, and compare the distance from zero.',
      reading: cards(
        'For the bowl L(θ) = θ², zero is the best parameter. Its derivative is 2θ. At θ = 4 the derivative is 8: moving toward smaller θ reduces the loss locally.',
        'A gradient step is θnew = θ − η × 2θ. With rate η = 0.25, the step from 4 is 4 − 0.25 × 8 = 2. The next step reaches 1. Each step halves the distance to zero.',
        'Direction alone is not enough. At η = 1, 4 jumps to −4 and back. At η = 1.10, 4 jumps to −4.8: the distance grows. For this bowl and a nonzero starting point, convergence needs 0 < η < 1. Other losses have different stable rates.'
      )
    },
    regression: {
      goal: 'Solve a tiny least-squares problem and identify when its coefficients are unique.',
      intro: 'A best-fitting line minimizes total squared error; it need not touch every point.',
      task: 'Adjust slope, then intercept, until loss stops falling. Find a point the line still misses.',
      reading: cards(
        'Least squares chooses weights to minimize the average squared residual, where a residual is prediction minus target. A line balances all observations, so one point can remain above it while another remains below.',
        'At an optimum the gradient is zero, giving XᵀXw = Xᵀy. For one feature X = [1, 2]ᵀ and targets [2, 4]ᵀ, XᵀX = 1² + 2² = 5 and Xᵀy = 1 × 2 + 2 × 4 = 10. Thus 5w = 10 and w = 2.',
        'Unique coefficients require independent feature columns: full column rank. If two columns are identical, their weights can trade off without changing predictions. In software, use a least-squares solver such as QR or SVD rather than explicitly inverting XᵀX.'
      )
    },
    classification: {
      goal: 'Interpret a probability and compute the logistic loss gradient p − y.',
      intro: 'A sigmoid turns a score into a probability. Cross-entropy rewards accurate, cautious confidence.',
      task: 'Move the score near zero, then to an extreme. Compare how a small weight change affects probability.',
      reading: cards(
        'Logistic regression first makes a score z = wᵀx + b, then computes p = sigmoid(z). At z = 0, p = 0.5. Near zero, a small score change moves probability most; at either extreme the sigmoid flattens.',
        'Cross-entropy makes a confidently wrong prediction costly. With sigmoid plus cross-entropy, the score gradient is simply p − y. If p = 0.8 and the true label y = 1, the gradient is −0.2. Subtracting this negative gradient pushes the score upward.',
        'Calibration checks a group of predictions. Among comparable cases assigned probability 0.8, about 80% should be positive. It does not guarantee any single outcome. A decision threshold is a separate choice that should reflect the costs of mistakes.'
      )
    },
    generalization: {
      goal: 'Calculate a ridge coefficient and choose its penalty without using the final test set.',
      intro: 'A little shrinkage can stop a model from chasing noise in a small training sample.',
      task: 'Raise the penalty from zero. Note both training and validation errors; keep the setting only if validation supports it.',
      reading: cards(
        'Training fit measures examples already seen. Generalization means working on new examples. Ridge adds λ‖w‖² to training error, discouraging large weights. This can improve stability, but a penalty that is too strong can remove useful signal.',
        'For one feature, the ridge equation is (XᵀX/n + λ)w = Xᵀy/n. If the left data term is 2, the right term is 6 and λ = 1, then (2 + 1)w = 6, so w = 2. With no penalty, w would be 3.',
        'Choose λ on validation data or cross-validation. Save the final test set for an independent check after choosing. Split by time or person when that matches future use, and fit preprocessing only inside each training split. This toy dataset cannot prove that shrinkage always helps.'
      )
    },
    evaluation: {
      goal: 'Distinguish precision from recall and choose an independent evaluation unit.',
      intro: 'A useful score answers a specific question about new cases and the mistakes that matter.',
      task: 'Lower prevalence with the detector fixed. Predict whether precision falls, then inspect the positive cases.',
      reading: cards(
        'Precision asks: of predicted positives, how many are true? Recall asks: of actual positives, how many did we find? With TP = 40, FP = 10 and FN = 60, precision is 40/50 = 80%; recall is 40/100 = 40%.',
        'The test set checks a decision already made. If you repeatedly tune using its results, it becomes selection data. Keep a final holdout. Also check relevant subgroups: a strong overall score can hide a weak result for one group.',
        'Uncertainty depends on independent cases. If 200 records come from 10 patients, those are not 200 independent patients. To estimate patient-level uncertainty with a bootstrap, resample patients together with their records. State who the result should generalize to.'
      )
    },
    neuron: {
      goal: 'Apply ReLU and explain why a network needs nonlinear activations.',
      intro: 'A neuron makes a weighted sum, then transforms it. Repeating both steps creates a network.',
      task: 'Change weight, then bias. Describe sensitivity and the location where the output passes 0.5.',
      reading: cards(
        'A layer makes z = Wx + b, then applies an activation. ReLU keeps positive values and clips negative ones to zero: ReLU(z) = max(0, z). With W = 2, x = −3 and b = 1, z = −5 and the output is 0.',
        'Nonlinearity adds a new capability. Without activations, two affine layers collapse into one: 3(2x + 1) + 4 = 6x + 7. Extra affine layers alone do not create a more expressive family of functions.',
        'A hidden layer builds features that the next layer combines. Having enough capacity to represent a pattern does not guarantee training will find it or that it will work on new data. The sigmoid experiment shows one unit, not a complete trained network.'
      )
    },
    backprop: {
      goal: 'Trace both uses of a shared weight and add their gradient contributions.',
      intro: 'Backpropagation follows the chain rule backward. When paths meet, add their contributions.',
      task: 'Use a small gradient step. Watch the updates shrink near zero; then trace the shared-weight example below.',
      reading: cards(
        'First compute forward values, then derivatives backward. For h = ReLU(wx), ŷ = wh and L = ½(ŷ − y)², the same weight w appears twice. Keep both paths to the loss.',
        'At w = 2, x = 3 and y = 1: h = 6, ŷ = 12 and ∂L/∂ŷ = 11. The ReLU input is positive, so dh/dw = 3. The output has two contributions: dŷ/dw = h + w × dh/dw = 6 + 2 × 3 = 12.',
        'Multiply through the loss: dL/dw = 11 × 12 = 132. Counting only one use would give 66. Reverse-mode automatic differentiation reuses forward values and sums all paths efficiently. A small finite-difference check can help detect missing paths in smooth examples.'
      )
    },
    attention: {
      goal: 'Compute masked attention and explain the role of dimension scaling.',
      intro: 'Attention uses a query to assign weights to keys, then mixes the corresponding values.',
      task: 'Compare low and high temperatures. Name the most heavily weighted token and describe how the mixture changes.',
      reading: cards(
        'A query asks what information is useful. Dot products with keys give scores; softmax turns scores into nonnegative weights summing to one. The output is the weighted sum of values. Each query gets its own row of weights.',
        'Try logits [0, ln(3), ln(100)] and values [2, 6, 100]. Suppose the last position is in the future. A causal mask excludes it before softmax. The remaining exponentials are 1 and 3, so their normalized weights are ¼ and ¾.',
        'Now mix values: ¼ × 2 + ¾ × 6 = 5. The masked value 100 contributes zero. Masking after normalization would give the wrong answer because the excluded position would already have taken part of the weight.',
        'Attention divides query-key dot products by √dₖ. Under independent, centered, unit-variance coordinates, dot-product variance grows with dₖ. The division keeps score scale roughly stable. Temperature is another control: lowering T in softmax(scores/T) concentrates weights; it does not change head dimension.',
        'For n queries and m keys, scores have shape n × m. Normalize across the m keys. Self-attention also needs position information to represent order. Attention weights show a mixture, but the values and downstream layers also matter when explaining a prediction.'
      )
    },
    research: {
      goal: 'Compute a tiny neural tangent kernel and state the boundary of a research claim.',
      intro: 'A research result becomes useful when you can name its assumptions and test its limits.',
      task: 'Change the ridge penalty. Write one observation, one limit of this dataset, and one follow-up test in your notes.',
      reading: cards(
        'Separate a theorem, an experiment and a heuristic. A theorem guarantees a conclusion under stated assumptions. An experiment supports a claim for its tested setup. A heuristic suggests a useful approach. None automatically proves a result outside its scope.',
        'The neural tangent kernel compares how a model responds to its parameters at two inputs: K(x,x′) = ∇θf(x)ᵀ∇θf(x′). Work through f(a,b)(x) = a(bx)² with both a and b trainable. Its parameter gradient is (b²x², 2abx²).',
        'At a = 1 and b = 2, that gradient is (4x², 4x²). At x = 1 it is (4, 4); at x = 3 it is (36, 36). Thus K(1,3) = 4 × 36 + 4 × 36 = 288. Holding b fixed would remove one contribution and define a different kernel.',
        'Some infinite-width results say this kernel becomes effectively fixed under specific scaling and initialization assumptions. That does not prove that finite networks never learn new features. Locate the limit and assumptions before extending the conclusion.',
        'Audit one claim from a linked source. Write the claim, its assumptions, its strongest evidence and a plausible failure condition. Propose a test with matched data and compute budgets. Record splits, settings and repeated-run variability. Your ridge experiment supports an observation on this dataset; test another dataset before making a broader claim.'
      )
    }
  }
};

const de = {
  topics: { ai: { title: 'Künstliche Intelligenz', description: 'Die Wissenschaft des Lernens, Schlussfolgerns und Darstellens.' } },
  classes: {
    foundations: { title: 'Die Grundlagen der Intelligenz', short: 'Mathematische Grundlagen', level: 'Grundlagen', description: 'Entwickle ein Gefühl für die Ideen. Lerne dann ihre mathematische Sprache.', prereq: 'Neugier und Schulalgebra.' },
    'machine-learning': { title: 'Maschinen, die lernen', short: 'Maschinelles Lernen', level: 'Aufbau', description: 'Von der ersten Vorhersage zum Lernen mit neuen Daten.', prereq: 'Vektoren, Ableitungen und Grundkenntnisse der Wahrscheinlichkeit.' },
    'deep-learning': { title: 'Im Inneren des neuronalen Netzes', short: 'Tiefes Lernen', level: 'Fortgeschritten', description: 'Verfolge Gradienten, verstehe Aufmerksamkeit und prüfe Forschung.', prereq: 'Lineare Algebra, Kettenregel und statistisches Lernen.' }
  },
  lessons: {
    prediction: text('Was bedeutet Lernen?', 'Von Regeln zu Darstellungen',
      'Berechne eine Vorhersage und unterscheide Parameter von Beobachtungen.',
      'Beginne mit einer Geraden: Steigung und Achsenabschnitt machen aus einer Eingabe eine Vorhersage.',
      'Ändere die Steigung einmal. Behalte die Änderung, wenn der Verlust sinkt; gehe sonst zurück. Versuche dann den Achsenabschnitt.',
      cards(
        'Ein Modell ist eine Regel mit veränderbaren Zahlen. In ŷ = wx + b ist x die beobachtete Eingabe; w und b sind trainierbare Parameter. Für w = 2, b = 1 und x = 3 lautet die Vorhersage 2 × 3 + 1 = 7.',
        'Der Verlust misst einen Fehler. Ist der wahre Wert 5, beträgt der quadratische Fehler der Vorhersage 7 genau (7 − 5)² = 4. Der Mittelwert dieser Fehler bewertet die Gerade über alle Trainingsbeispiele. Ein kleinerer Wert bedeutet eine bessere Anpassung an diese Beispiele.',
        'Training verändert Parameter, um den Verlust zu senken. Eine gute Anpassung braucht trotzdem einen Test mit neuen Daten: Eine Gerade kann heutige Beispiele treffen und morgige verfehlen. Halte deshalb einige Beobachtungen vom Training getrennt.'
      ), [
        question('Welche Größen verändert das Training eines linearen Modells?', 'Training verändert die Modellparameter. Eingaben und Zielwerte sind Beobachtungen und werden dabei nicht angepasst.', ['Die beobachteten Zielwerte', 'Steigung und Achsenabschnitt', 'Die Definition jeder zukünftigen Eingabe']),
        question('Für ŷ = 2x + 1 und x = 3: Wie lautet die Vorhersage?', 'Setze x = 3 ein: 2 × 3 + 1 = 7. Die Vorhersage wird zuerst berechnet; danach lässt sich ein Verlust bestimmen.')
      ]),
    vectors: text('In Vektoren denken', 'Die Sprache der Darstellungen',
      'Berechne eine gewichtete Summe und prüfe passende Matrix- und Vektordimensionen.',
      'Ein Vektor ist eine Zahlenliste. Eine gewichtete Summe legt den Beitrag jeder Zahl fest.',
      'Setze das Gewicht auf null, dann auf einen negativen Wert. Beschreibe, welcher Beitrag verschwindet oder seine Richtung ändert.',
      cards(
        'Ein Beispiel lässt sich als geordnete Liste x darstellen. Die Gewichtsliste w enthält ein Gewicht pro Eingabe. Das Skalarprodukt multipliziert passende Einträge und addiert sie: (2, −1) · (3, 4) = 2 × 3 − 1 × 4 = 2.',
        'Ein Gewicht von null ignoriert eine Eingabe; ein negatives Gewicht kehrt ihren Beitrag um. Mit einem zusätzlichen Bias entsteht der Wert z. Die Sigmoidfunktion macht daraus eine Wahrscheinlichkeit: z = 0 ergibt 0,5. Eine Gewichtsänderung verändert zuerst z.',
        'Eine Matrix sammelt Beispiele in Zeilen. Hat X 100 Zeilen und 5 Spalten, besitzt jedes Beispiel 5 Merkmale. Die Multiplikation mit 5 Gewichten liefert 100 Werte, einen pro Zeile. Prüfe vor der Rechnung die übereinstimmende Dimension 5.'
      ), [
        question('Berechne wᵀx für w = (2, −1) und x = (3, 4).', 'Das Skalarprodukt ist 2 × 3 + (−1) × 4 = 2. Multipliziere erst passende Einträge und addiere dann.'),
        question('X hat die Form 100 × 5. Welche Form braucht w für eine Vorhersage pro Zeile?', 'Die inneren Dimensionen müssen passen: Eine Matrix mit 100 × 5 Einträgen mal 5 Gewichte ergibt 100 Ausgaben.', ['100 Koordinaten', '5 Koordinaten', '500 Koordinaten'])
      ]),
    probability: text('Eine Überzeugung aktualisieren', 'Warum die Grundrate zählt',
      'Erkläre mit Anzahlen, warum ein positives Signal von der Grundrate abhängt.',
      'Auch ein zuverlässiger Detektor kann viele Fehlalarme liefern, wenn das Ereignis selten ist.',
      'Lass den Detektor unverändert. Erhöhe die Vorabwahrscheinlichkeit, sage die Richtung voraus und prüfe das Ergebnis.',
      cards(
        'Die Vorabwahrscheinlichkeit beschreibt die Häufigkeit vor neuer Evidenz. Die nachträgliche Wahrscheinlichkeit berücksichtigt diese Evidenz. „Positiv, wenn wahr“ und „wahr, wenn positiv“ sind verschiedene Fragen. Die Bayes-Regel verbindet sie.',
        'Stell dir 10.000 Fälle vor: 1 % sind echte Fälle, also 100. Ein Detektor findet 90 % davon: 90 richtig positive Ergebnisse. Von den übrigen 9.900 Fällen lösen 5 % Fehlalarm aus: 495 falsch positive Ergebnisse.',
        'Zähle nun nur positive Ergebnisse: 90 + 495 = 585. Davon sind 90 / 585 ≈ 15,4 % echt. Bei gleichem Detektor erhöht eine höhere Vorabwahrscheinlichkeit den Anteil echter Fälle unter den positiven Ergebnissen. Rechne zuerst mit Anzahlen.'
      ), [
        question('Von 90 richtig und 495 falsch positiven Ergebnissen: Welcher Prozentsatz der positiven Ergebnisse ist echt? Runde auf eine Nachkommastelle.', 'Insgesamt gibt es 585 positive Ergebnisse. 100 × 90 / 585 ≈ 15,4 %. Die Sensitivität allein beantwortet diese Frage nicht.'),
        question('Welche Änderung erhöht bei gleichem positiven Detektorsignal die nachträgliche Wahrscheinlichkeit?', 'Bleiben Sensitivität und Falsch-Positiv-Rate gleich, erhöht eine höhere Vorabwahrscheinlichkeit auch die nachträgliche Wahrscheinlichkeit.', ['Eine niedrigere Vorabwahrscheinlichkeit', 'Eine höhere Falsch-Positiv-Rate', 'Eine höhere Vorabwahrscheinlichkeit'])
      ]),
    derivatives: text('Die Richtung der Verbesserung', 'Aus einer Ableitung wird eine Lernregel',
      'Berechne einen Gradientenschritt und erkenne eine instabile Schrittweite.',
      'Der Gradient zeigt lokal bergauf. Zum Lernen geht es einen kleinen Schritt in die Gegenrichtung.',
      'Starte bei 4 mit Lernrate 0,25 und mache drei Schritte. Starte neu mit 1,10 und vergleiche den Abstand zu null.',
      cards(
        'Für die Schüssel L(θ) = θ² ist null der beste Parameter. Die Ableitung lautet 2θ. Bei θ = 4 beträgt sie 8: Eine kleine Bewegung zu kleinerem θ senkt den Verlust.',
        'Ein Gradientenschritt lautet θneu = θ − η × 2θ. Mit Lernrate η = 0,25 führt der Schritt von 4 zu 4 − 0,25 × 8 = 2. Danach geht es zu 1. Jeder Schritt halbiert den Abstand zu null.',
        'Die richtige Richtung reicht nicht aus. Bei η = 1 springt 4 zu −4 und zurück. Bei η = 1,10 springt 4 zu −4,8: Der Abstand wächst. Für diese Funktion und einen Start ungleich null braucht Konvergenz 0 < η < 1. Andere Funktionen haben andere stabile Lernraten.'
      ), [
        question('Start bei θ = 4, η = 0,25 und L = θ²: Welchen Wert hat θ nach einem Schritt?', 'Der Gradient beträgt 8. Die Aktualisierung ergibt 4 − 0,25 × 8 = 2; der Abstand zum Minimum halbiert sich.'),
        question('Welche feste Lernrate konvergiert für L = θ² und θ ungleich null?', 'Konvergenz erfordert |1 − 2η| < 1. Bei 0,75 halbiert sich der Betrag bei jedem Schritt und das Vorzeichen wechselt.', ['η = 1,2', 'η = 1', 'η = 0,75'])
      ]),
    regression: text('Anpassen heißt optimieren', 'Von Residuen zu Normalgleichungen',
      'Löse ein kleines Ausgleichsproblem und erkenne eindeutige Koeffizienten.',
      'Die beste Gerade minimiert die Summe quadratischer Fehler; sie muss nicht jeden Punkt treffen.',
      'Ändere Steigung und dann Achsenabschnitt, bis der Verlust nicht mehr sinkt. Finde einen Punkt, den die Gerade weiter verfehlt.',
      cards(
        'Die Methode der kleinsten Quadrate minimiert den mittleren quadratischen Restfehler. Ein Residuum ist Vorhersage minus Zielwert. Die Gerade gleicht alle Beobachtungen aus: Ein Punkt kann darüber und ein anderer darunter liegen.',
        'Am Optimum ist der Gradient null. Daraus folgt XᵀXw = Xᵀy. Für X = [1, 2]ᵀ und Zielwerte [2, 4]ᵀ gilt XᵀX = 1² + 2² = 5 und Xᵀy = 1 × 2 + 2 × 4 = 10. Also 5w = 10 und w = 2.',
        'Eindeutige Koeffizienten brauchen unabhängige Merkmalsspalten: vollen Spaltenrang. Sind zwei Spalten identisch, können ihre Gewichte einander ausgleichen, ohne die Vorhersage zu ändern. Verwende in Software einen Löser wie QR oder SVD statt XᵀX ausdrücklich zu invertieren.'
      ), [
        question('Wann ist der Koeffizientenvektor der unregularisierten kleinsten Quadrate eindeutig?', 'Voller Spaltenrang macht XᵀX positiv definit. Damit besitzt das quadratische Problem genau einen minimierenden Koeffizientenvektor.', ['Sobald n positiv ist', 'Wenn X vollen Spaltenrang hat', 'Wenn alle Zielwerte verschieden sind']),
        question('Löse die Normalgleichung für X = [1, 2]ᵀ und y = [2, 4]ᵀ ohne Achsenabschnitt.', 'XᵀX = 5 und Xᵀy = 10. Daher gilt 5w = 10 und der gesuchte Koeffizient ist w = 2.')
      ]),
    classification: text('Von Werten zu Wahrscheinlichkeiten', 'Logistische Regression und Kreuzentropie',
      'Deute eine Wahrscheinlichkeit und berechne den logistischen Gradienten p − y.',
      'Die Sigmoidfunktion macht aus einem Wert eine Wahrscheinlichkeit. Kreuzentropie bestraft selbstsichere Fehlvorhersagen.',
      'Bewege den Wert nahe null, dann zu einem Extrem. Vergleiche die Wirkung einer kleinen Gewichtsänderung auf die Wahrscheinlichkeit.',
      cards(
        'Logistische Regression berechnet zuerst z = wᵀx + b und danach p = sigmoid(z). Bei z = 0 ist p = 0,5. Nahe null verändert eine kleine Änderung von z die Wahrscheinlichkeit am stärksten; an den Rändern flacht die Kurve ab.',
        'Kreuzentropie macht selbstsichere Fehler teuer. Für Sigmoidfunktion und Kreuzentropie ist der Gradient nach z einfach p − y. Bei p = 0,8 und wahrem Ziel y = 1 ist er −0,2. Das Abziehen dieses negativen Gradienten erhöht z.',
        'Kalibrierung prüft Gruppen von Vorhersagen. Von vergleichbaren Fällen mit Wahrscheinlichkeit 0,8 sollten etwa 80 % positiv sein. Das garantiert keinen einzelnen Ausgang. Ein Entscheidungsschwellenwert ist eine eigene Wahl und sollte die Fehlerkosten berücksichtigen.'
      ), [
        question('Für p = 0,8 und y = 1: Wie groß ist ∂ℓ/∂z bei binärer Kreuzentropie?', 'Für das logistische Modell mit Kreuzentropie ist der Gradient nach dem Logit p − y = 0,8 − 1 = −0,2.'),
        question('Was bedeutet eine gut kalibrierte Wahrscheinlichkeit von 0,8?', 'Kalibrierung beschreibt beobachtete Häufigkeiten bei vergleichbaren vorhergesagten Wahrscheinlichkeiten, keine Gewissheit für einen Einzelfall.', ['Jede solche Vorhersage ist richtig', 'Etwa 80 % vergleichbarer Fälle sind positiv', 'Der Entscheidungsschwellenwert muss 0,8 sein'])
      ]),
    generalization: text('Das Problem neuer Daten', 'Verzerrung, Varianz und Regularisierung',
      'Berechne einen Ridge-Koeffizienten und wähle die Strafe ohne den abschließenden Testsatz.',
      'Etwas Schrumpfung kann verhindern, dass ein Modell dem Rauschen einer kleinen Stichprobe folgt.',
      'Erhöhe die Strafe von null aus. Beobachte Trainings- und Validierungsfehler; behalte die Einstellung nur bei passender Validierung.',
      cards(
        'Die Trainingsanpassung betrifft bekannte Beispiele. Generalisierung bedeutet Erfolg bei neuen Beispielen. Ridge addiert λ‖w‖² zum Trainingsfehler und bremst große Gewichte. Das kann stabilisieren; eine zu starke Strafe kann aber nützliche Signale entfernen.',
        'Für ein Merkmal lautet die Ridge-Gleichung (XᵀX/n + λ)w = Xᵀy/n. Sind der linke Datenterm 2, der rechte Term 6 und λ = 1, gilt (2 + 1)w = 6, also w = 2. Ohne Strafe wäre w = 3.',
        'Wähle λ mit Validierungsdaten oder Kreuzvalidierung. Hebe den abschließenden Testsatz für eine unabhängige Prüfung danach auf. Trenne nach Zeit oder Person, wenn das den späteren Einsatz abbildet. Passe die Vorverarbeitung nur im jeweiligen Trainingsanteil an. Dieses Beispiel beweist nicht, dass Schrumpfung immer hilft.'
      ), [
        question('Wo sollte λ gewählt werden?', 'Hyperparameter gehören zur Modellauswahl. Der abschließende Testsatz muss davon unabhängig bleiben, damit die Bewertung aussagekräftig ist.', ['Auf dem abschließenden Testsatz', 'Nur durch Minimierung des Trainingsfehlers', 'Mit Trainings-/Validierungsaufteilungen oder Kreuzvalidierung']),
        question('Ein Merkmal hat XᵀX/n = 2, Xᵀy/n = 6 und λ = 1. Wie lautet der Ridge-Koeffizient?', 'Die Ridge-Normalgleichung ist (2 + 1)w = 6. Daher w = 2. Ohne Strafe wäre der Koeffizient 3.')
      ]),
    evaluation: text('Evidenz statt nur Genauigkeit', 'Eine belastbare Bewertung entwerfen',
      'Unterscheide Präzision von Trefferquote und wähle eine unabhängige Bewertungseinheit.',
      'Ein nützlicher Messwert beantwortet eine konkrete Frage über neue Fälle und relevante Fehler.',
      'Senke die Grundrate bei unverändertem Detektor. Sage voraus, ob die Präzision sinkt, und prüfe dann die positiven Fälle.',
      cards(
        'Präzision fragt: Wie viele vorhergesagte Positive sind echt? Die Trefferquote (Recall) fragt: Wie viele echte Positive wurden gefunden? Bei TP = 40, FP = 10 und FN = 60 ist die Präzision 40/50 = 80 %, die Trefferquote 40/100 = 40 %.',
        'Ein Testsatz prüft eine bereits gewählte Lösung. Wenn du wiederholt anhand seiner Ergebnisse nachjustierst, wird er zum Auswahldatensatz. Reserviere eine abschließende Prüfung. Prüfe auch relevante Untergruppen: Ein guter Gesamtwert kann eine schwache Gruppe verdecken.',
        'Unsicherheit hängt von unabhängigen Fällen ab. 200 Datensätze von 10 Patienten sind keine 200 unabhängigen Patienten. Für einen Bootstrap zur Unsicherheit auf Patientenebene ziehst du Patienten samt ihren Datensätzen neu. Sage, für welche Population das Ergebnis gelten soll.'
      ), [
        question('Ein Modell liefert TP = 40, FP = 10 und FN = 60. Wie hoch ist der Recall in Prozent?', 'Recall = TP/(TP+FN) = 40/100 = 40 %. Die Präzision wäre dagegen 40/50 = 80 %.'),
        question('200 Datensätze stammen von zehn Patienten. Welcher Bootstrap passt meist besser zur Generalisierung auf Patienten?', 'Das Ziehen ganzer Patienten berücksichtigt die Abhängigkeit ihrer Datensätze. Die Einheit folgt der Zielpopulation und dem Stichprobendesign.', ['Patienten samt ihren Datensätzen neu ziehen', 'Alle Datensätze unabhängig neu ziehen', 'Die Trainingsgenauigkeit wiederverwenden'])
      ]),
    neuron: text('Ein Neuron ist der Anfang', 'Verknüpfung, Merkmale und Ausdrucksstärke',
      'Wende ReLU an und erkläre, warum ein Netz nichtlineare Aktivierungen braucht.',
      'Ein Neuron bildet eine gewichtete Summe und transformiert sie. Wiederholung beider Schritte ergibt ein Netz.',
      'Ändere erst das Gewicht, dann den Bias. Beschreibe die Empfindlichkeit und die Stelle, an der die Ausgabe 0,5 erreicht.',
      cards(
        'Eine Schicht berechnet z = Wx + b und wendet dann eine Aktivierung an. ReLU behält positive Werte und setzt negative auf null: ReLU(z) = max(0, z). Für W = 2, x = −3 und b = 1 ist z = −5 und die Ausgabe 0.',
        'Nichtlinearität erweitert die Möglichkeiten. Ohne Aktivierungen fallen zwei affine Schichten zu einer zusammen: 3(2x + 1) + 4 = 6x + 7. Zusätzliche affine Schichten allein schaffen also keine ausdrucksstärkere Funktionsfamilie.',
        'Eine verborgene Schicht baut Merkmale auf, die die nächste kombiniert. Genug Kapazität für ein Muster garantiert weder, dass Training es findet, noch Erfolg auf neuen Daten. Das Sigmoidexperiment zeigt eine einzelne Einheit, kein vollständig trainiertes Netz.'
      ), [
        question('Was stellt eine Folge affiner Schichten ohne Nichtlinearitäten dar?', 'Die Verknüpfung affiner Abbildungen ist wieder affin. Nichtlineare Aktivierungen verhindern, dass alle Schichten zu einer zusammenfallen.', ['Eine beliebige stetige Funktion', 'Eine einzelne affine Abbildung', 'Eine kalibrierte Bayes-Verteilung']),
        question('Für ReLU(Wx+b) mit W = 2, x = −3 und b = 1: Wie lautet die Ausgabe?', 'Vor der Aktivierung ergibt sich 2 × (−3) + 1 = −5. ReLU liefert max(0, −5) = 0.')
      ]),
    backprop: text('Rückpropagation ohne Zauberei', 'Automatische Differenzierung im Rückwärtsmodus',
      'Verfolge beide Verwendungen eines geteilten Gewichts und addiere ihre Gradientenbeiträge.',
      'Rückpropagation folgt der Kettenregel rückwärts. Treffen Pfade zusammen, werden ihre Beiträge addiert.',
      'Nutze einen kleinen Gradientenschritt. Beobachte kleinere Änderungen nahe null und verfolge dann das Beispiel mit geteiltem Gewicht.',
      cards(
        'Berechne zuerst Werte vorwärts, dann Ableitungen rückwärts. In h = ReLU(wx), ŷ = wh und L = ½(ŷ − y)² kommt dasselbe Gewicht w zweimal vor. Berücksichtige beide Pfade zum Verlust.',
        'Bei w = 2, x = 3 und y = 1 gilt h = 6, ŷ = 12 und ∂L/∂ŷ = 11. Die ReLU-Eingabe ist positiv, also dh/dw = 3. Die Ausgabe hat zwei Beiträge: dŷ/dw = h + w × dh/dw = 6 + 2 × 3 = 12.',
        'Über den Verlust ergibt sich dL/dw = 11 × 12 = 132. Nur eine Verwendung zu zählen ergäbe 66. Automatische Differenzierung im Rückwärtsmodus nutzt Vorwärtswerte erneut und addiert alle Pfade effizient. Eine kleine Prüfung mit finiten Differenzen kann fehlende Pfade in glatten Beispielen aufdecken.'
      ), [
        question('Ein geteiltes Gewicht w kommt zweimal vor: h = ReLU(wx), ŷ = wh, L = ½(ŷ − y)². Berechne dL/dw bei w = 2, x = 3 und y = 1.', 'h = 6 und ŷ = 12. Beide Pfade tragen bei: dŷ/dw = h + w × dh/dw = 6 + 2 × 3 = 12. Daher dL/dw = (12 − 1) × 12 = 132, nicht 66.'),
        question('Ein Parameter erreicht den Verlust über zwei Zweige. Wie verbindet man die Gradientenbeiträge?', 'Die mehrdimensionale Kettenregel addiert die Ableitungsbeiträge aller Pfade vom wiederverwendeten Parameter zum Verlust.', ['Die Beiträge multiplizieren', 'Nur den größeren Beitrag verwenden', 'Die Beiträge addieren'])
      ]),
    attention: text('Aufmerksamkeit als gewichteter Austausch', 'Anfragen, Schlüssel und Werte',
      'Berechne maskierte Aufmerksamkeit und erkläre die Skalierung mit der Dimension.',
      'Aufmerksamkeit gewichtet Schlüssel anhand einer Anfrage und mischt die zugehörigen Werte.',
      'Vergleiche niedrige und hohe Temperaturen. Nenne das am stärksten gewichtete Token und beschreibe die veränderte Mischung.',
      cards(
        'Eine Anfrage bestimmt, welche Informationen nützlich sind. Skalarprodukte mit Schlüsseln ergeben Werte; Softmax macht daraus nichtnegative Gewichte mit Summe eins. Die Ausgabe ist die gewichtete Summe der zugehörigen Werte. Jede Anfrage hat ihre eigene Gewichtszeile.',
        'Betrachte Logits [0, ln(3), ln(100)] und Werte [2, 6, 100]. Die letzte Position liege in der Zukunft. Eine kausale Maske schließt sie vor Softmax aus. Die übrigen Exponentialwerte sind 1 und 3; normiert ergeben sie ¼ und ¾.',
        'Mische nun die Werte: ¼ × 2 + ¾ × 6 = 5. Der maskierte Wert 100 trägt null bei. Maskieren nach der Normierung wäre falsch, weil die ausgeschlossene Position bereits einen Teil des Gewichts erhalten hätte.',
        'Aufmerksamkeit teilt die Anfrage-Schlüssel-Skalarprodukte durch √dₖ. Bei unabhängigen, zentrierten Koordinaten mit Varianz eins wächst die Varianz des Skalarprodukts mit dₖ. Die Division hält die Skala ungefähr stabil. Eine niedrigere Temperatur T in softmax(Werte/T) konzentriert Gewichte, ändert aber nicht die Kopfdimension.',
        'Bei n Anfragen und m Schlüsseln haben die Werte die Form n × m. Normiere über die m Schlüssel. Selbstaufmerksamkeit braucht außerdem Positionsinformationen für Reihenfolge. Aufmerksamkeitsgewichte zeigen eine Mischung; zur Erklärung einer Vorhersage zählen auch Werte und nachfolgende Schichten.'
      ), [
        question('Nach Dimensionsskalierung sind die Logits [0, ln(3), ln(100)] und die skalaren Werte [2, 6, 100]. Die dritte Position ist kausal maskiert. Berechne die Ausgabe bei Temperatur 1.', 'Maskiere vor Softmax. Die übrigen Exponentialwerte 1 und 3 ergeben Gewichte ¼ und ¾. Die Ausgabe ist ¼ × 2 + ¾ × 6 = 5; der maskierte Wert trägt nichts bei.'),
        question('Warum wird das Skalarprodukt durch √dₖ geteilt?', 'Bei unabhängigen Koordinaten mit Varianz eins wächst die Varianz des Skalarprodukts mit dₖ. Die Skalierung wirkt dem entgegen; die quadratische Paarstruktur bleibt.', ['Damit die Skala der Logits bei wachsender Schlüsseldimension ungefähr stabil bleibt', 'Damit Aufmerksamkeit linear von der Sequenzlänge abhängt', 'Damit kausale Erklärungen garantiert sind'])
      ]),
    research: text('Vom Modell zum Forschungspaper', 'Annahmen, Grenzfälle und Reproduzierbarkeit',
      'Berechne einen kleinen neuronalen Tangentenkern und benenne die Grenze einer Forschungsbehauptung.',
      'Ein Forschungsergebnis wird nützlich, wenn du seine Annahmen benennen und seine Grenzen prüfen kannst.',
      'Ändere die Ridge-Strafe. Notiere eine Beobachtung, eine Grenze dieses Datensatzes und einen anschließenden Test.',
      cards(
        'Unterscheide Satz, Experiment und Faustregel. Ein Satz garantiert eine Folgerung unter genannten Annahmen. Ein Experiment stützt eine Aussage für den geprüften Aufbau. Eine Faustregel schlägt ein nützliches Vorgehen vor. Nichts davon beweist automatisch etwas außerhalb seines Geltungsbereichs.',
        'Der neuronale Tangentenkern vergleicht Parameterreaktionen eines Modells bei zwei Eingaben: K(x,x′) = ∇θf(x)ᵀ∇θf(x′). Betrachte f(a,b)(x) = a(bx)² mit trainierbarem a und b. Sein Parametergradient ist (b²x², 2abx²).',
        'Bei a = 1 und b = 2 lautet der Gradient (4x², 4x²). Bei x = 1 ist er (4, 4), bei x = 3 ist er (36, 36). Also K(1,3) = 4 × 36 + 4 × 36 = 288. Ein festgehaltenes b würde einen Beitrag entfernen und einen anderen Kern definieren.',
        'Manche Ergebnisse für unendliche Breite besagen, dass dieser Kern unter bestimmten Skalierungs- und Initialisierungsannahmen praktisch fest bleibt. Daraus folgt nicht, dass endliche Netze keine neuen Merkmale lernen. Suche zuerst Grenzübergang und Annahmen, bevor du die Folgerung erweiterst.',
        'Prüfe eine Behauptung aus einer verlinkten Quelle. Notiere Behauptung, Annahmen, stärkste Evidenz und eine mögliche Fehlerbedingung. Entwirf einen Test mit vergleichbaren Daten und Rechenbudgets. Halte Aufteilungen, Einstellungen und Schwankungen mehrerer Läufe fest. Das Ridge-Experiment belegt eine Beobachtung hier; für allgemeinere Aussagen brauchst du weitere Daten.'
      ), [
        question('Sei f(a,b)(x) = a(bx)² mit trainierbarem a und b. Berechne bei a = 1 und b = 2 den neuronalen Tangentenkern K(1, 3).', 'Der Gradient ist (b²x², 2abx²) = (4x², 4x²). Bei x = 1 ist er (4,4), bei x = 3 (36,36). Das Skalarprodukt ist 4 × 36 + 4 × 36 = 288. Ein fester Parameter ergäbe einen anderen Kern.'),
        question('Was folgt unmittelbar aus einem Satz über einen festen Kern bei unendlicher Breite?', 'Ein Satz beweist seine Folgerung unter seinen Annahmen und im genannten Grenzregime. Für endliche Modelle ist zusätzliche Evidenz nötig.', ['Jeder endliche Transformer hat beim Training einen festen Kern', 'Der angegebene Grenzfall zeigt unter den Annahmen das beschriebene Verhalten', 'Merkmalslernen tritt niemals auf'])
      ])
  }
};

const fr = {
  topics: { ai: { title: 'Intelligence artificielle', description: 'La science de l’apprentissage, du raisonnement et des représentations.' } },
  classes: {
    foundations: { title: 'Les fondements de l’intelligence', short: 'Bases mathématiques', level: 'Fondamental', description: 'Construisez votre intuition, puis donnez-lui un langage mathématique.', prereq: 'Curiosité et algèbre du lycée.' },
    'machine-learning': { title: 'Des machines qui apprennent', short: 'Apprentissage automatique', level: 'Intermédiaire', description: 'De la première prédiction à la généralisation sur de nouvelles données.', prereq: 'Vecteurs, dérivées et probabilités élémentaires.' },
    'deep-learning': { title: 'Au cœur du réseau de neurones', short: 'Apprentissage profond', level: 'Avancé', description: 'Suivez le gradient, comprenez l’attention et examinez la recherche.', prereq: 'Algèbre linéaire, règle de dérivation en chaîne et apprentissage statistique.' }
  },
  lessons: {
    prediction: text('Que signifie apprendre ?', 'Des règles aux représentations',
      'Calculer une prédiction et distinguer un paramètre d’une observation.',
      'Commencez par une droite : sa pente et son ordonnée à l’origine transforment une entrée en prédiction.',
      'Modifiez la pente une fois. Gardez ce changement si la perte baisse ; sinon, revenez en arrière. Essayez ensuite l’ordonnée à l’origine.',
      cards(
        'Un modèle est une règle avec des nombres ajustables. Dans ŷ = wx + b, x est l’entrée observée ; w et b sont les paramètres à entraîner. Pour w = 2, b = 1 et x = 3, la prédiction vaut 2 × 3 + 1 = 7.',
        'La perte mesure une erreur. Si la vraie valeur est 5, l’erreur quadratique d’une prédiction de 7 vaut (7 − 5)² = 4. La moyenne de ces erreurs évalue la droite sur tous les exemples d’entraînement. Un score plus bas signifie un meilleur ajustement à ces exemples.',
        'L’entraînement change les paramètres pour réduire la perte. Un bon ajustement exige encore un test sur de nouvelles données : une droite peut réussir aujourd’hui et échouer demain. Gardez certaines observations à l’écart de l’entraînement pour la vérifier.'
      ), [
        question('Quelles quantités l’entraînement modifie-t-il dans un modèle linéaire ?', 'L’entraînement ajuste les paramètres du modèle. Les entrées et les cibles sont des observations, pas des paramètres à entraîner.', ['Les cibles observées', 'La pente et l’ordonnée à l’origine', 'La définition de chaque future entrée']),
        question('Pour ŷ = 2x + 1 et x = 3, quelle est la prédiction ?', 'Remplacez x par 3 : 2 × 3 + 1 = 7. La prédiction est calculée avant de mesurer une perte.')
      ]),
    vectors: text('Penser en vecteurs', 'Le langage des représentations',
      'Calculer une somme pondérée et vérifier les dimensions d’une matrice et d’un vecteur.',
      'Un vecteur est une liste de nombres. Une somme pondérée détermine la contribution de chacun.',
      'Mettez le poids à zéro, puis rendez-le négatif. Décrivez quelle contribution disparaît ou change de sens.',
      cards(
        'Représentez un exemple par une liste ordonnée x. La liste w contient un poids par entrée. Le produit scalaire multiplie les entrées correspondantes et les additionne : (2, −1) · (3, 4) = 2 × 3 − 1 × 4 = 2.',
        'Un poids nul ignore une entrée ; un poids négatif inverse sa contribution. Ajoutez un biais pour obtenir un score z. La sigmoïde le transforme en probabilité : un score de 0 donne 0,5. Modifier un poids change d’abord le score.',
        'Une matrice empile les exemples en lignes. Si X a 100 lignes et 5 colonnes, chaque exemple possède 5 caractéristiques. Multipliez par 5 poids pour obtenir 100 scores, un par ligne. Vérifiez cette dimension commune de 5 avant de calculer.'
      ), [
        question('Calculez wᵀx pour w = (2, −1) et x = (3, 4).', 'Le produit scalaire est 2 × 3 + (−1) × 4 = 2. Multipliez les coordonnées correspondantes, puis additionnez.'),
        question('X a la forme 100 × 5. Quelle forme doit avoir w pour produire une prédiction par ligne ?', 'Les dimensions intérieures doivent correspondre : une matrice 100 × 5 multipliée par 5 poids produit 100 sorties.', ['100 coordonnées', '5 coordonnées', '500 coordonnées'])
      ]),
    probability: text('Actualiser une croyance', 'Pourquoi le taux de base compte',
      'Expliquer avec des effectifs pourquoi un signal positif dépend du taux de base.',
      'Même un détecteur fiable peut donner beaucoup de fausses alertes quand l’événement est rare.',
      'Gardez le détecteur inchangé. Augmentez la probabilité a priori, prédisez le sens du changement, puis vérifiez.',
      cards(
        'La probabilité a priori décrit la fréquence avant de nouvelles informations. La probabilité a posteriori en tient compte. « Positif si vrai » et « vrai si positif » posent deux questions différentes. La règle de Bayes les relie.',
        'Imaginez 10 000 cas : 1 % sont des cas réels, soit 100. Le détecteur en repère 90 %, soit 90 vrais positifs. Parmi les 9 900 autres cas, 5 % déclenchent une fausse alerte, soit 495 faux positifs.',
        'Comptez maintenant les résultats positifs : 90 + 495 = 585. La part réelle vaut 90 / 585 ≈ 15,4 %. Avec le même détecteur, un a priori plus élevé augmente la part de vrais cas parmi les positifs. Commencez par les effectifs avant de mémoriser la formule.'
      ), [
        question('Parmi 90 vrais positifs et 495 faux positifs, quel pourcentage des résultats positifs est réel ? Arrondissez à une décimale.', 'Il y a 585 résultats positifs au total. 100 × 90 / 585 ≈ 15,4 %. La sensibilité seule ne répond pas à la question.'),
        question('Quel changement augmente la probabilité a posteriori pour un même résultat positif du détecteur ?', 'À sensibilité et taux de faux positifs constants, une probabilité a priori plus élevée augmente la probabilité a posteriori.', ['Diminuer la probabilité a priori', 'Augmenter le taux de faux positifs', 'Augmenter la probabilité a priori'])
      ]),
    derivatives: text('La direction du progrès', 'Une dérivée devient une règle d’apprentissage',
      'Calculer un pas de gradient et reconnaître une taille de pas instable.',
      'Le gradient indique localement la montée. Pour apprendre, faites un petit pas dans l’autre sens.',
      'Partez de 4 avec un taux de 0,25 et faites trois pas. Recommencez avec 1,10 et comparez la distance à zéro.',
      cards(
        'Pour la cuvette L(θ) = θ², le meilleur paramètre est zéro. La dérivée vaut 2θ. À θ = 4, elle vaut 8 : diminuer légèrement θ réduit la perte.',
        'Un pas de gradient suit θnouveau = θ − η × 2θ. Avec η = 0,25, le pas depuis 4 donne 4 − 0,25 × 8 = 2. Le suivant atteint 1. Chaque pas divise par deux la distance à zéro.',
        'La direction ne suffit pas. À η = 1, la valeur passe de 4 à −4 puis revient. À η = 1,10, elle passe de 4 à −4,8 : la distance augmente. Pour cette cuvette et un départ non nul, converger exige 0 < η < 1. D’autres pertes ont d’autres taux stables.'
      ), [
        question('Avec θ = 4, η = 0,25 et L = θ², quelle est la valeur de θ après un pas ?', 'Le gradient vaut 8. La mise à jour donne 4 − 0,25 × 8 = 2 : la distance au minimum est divisée par deux.'),
        question('Pour L = θ² et θ non nul, quel taux fixe converge ?', 'La convergence exige |1 − 2η| < 1. À 0,75, la valeur absolue est divisée par deux à chaque pas, en alternant le signe.', ['η = 1,2', 'η = 1', 'η = 0,75'])
      ]),
    regression: text('Ajuster, c’est optimiser', 'Des résidus aux équations normales',
      'Résoudre un petit problème de moindres carrés et identifier l’unicité des coefficients.',
      'La meilleure droite minimise l’erreur quadratique totale ; elle ne passe pas forcément par chaque point.',
      'Ajustez la pente, puis l’ordonnée à l’origine, jusqu’à ce que la perte ne baisse plus. Trouvez un point encore manqué par la droite.',
      cards(
        'Les moindres carrés choisissent les poids qui minimisent la moyenne des résidus au carré. Un résidu est la prédiction moins la cible. La droite équilibre toutes les observations : un point peut rester au-dessus et un autre en dessous.',
        'À l’optimum, le gradient est nul, donc XᵀXw = Xᵀy. Pour X = [1, 2]ᵀ et les cibles [2, 4]ᵀ, XᵀX = 1² + 2² = 5 et Xᵀy = 1 × 2 + 2 × 4 = 10. Ainsi 5w = 10 et w = 2.',
        'Des coefficients uniques exigent des colonnes de caractéristiques indépendantes : un rang colonne complet. Si deux colonnes sont identiques, leurs poids peuvent se compenser sans changer les prédictions. En logiciel, utilisez un solveur QR ou SVD plutôt que d’inverser explicitement XᵀX.'
      ), [
        question('Quand le vecteur des coefficients des moindres carrés non régularisés est-il unique ?', 'Un rang colonne complet rend XᵀX définie positive. Le problème quadratique possède alors un unique vecteur de coefficients minimisant la perte.', ['Dès que n est positif', 'Quand X a un rang colonne complet', 'Quand toutes les cibles sont différentes']),
        question('Pour X = [1, 2]ᵀ et y = [2, 4]ᵀ sans ordonnée à l’origine, résolvez l’équation normale pour w.', 'XᵀX = 5 et Xᵀy = 10. L’équation est donc 5w = 10, ce qui donne w = 2.')
      ]),
    classification: text('Des scores aux probabilités', 'Régression logistique et entropie croisée',
      'Interpréter une probabilité et calculer le gradient logistique p − y.',
      'Une sigmoïde transforme un score en probabilité. L’entropie croisée pénalise les erreurs trop confiantes.',
      'Placez le score près de zéro, puis à un extrême. Comparez l’effet d’un petit changement de poids sur la probabilité.',
      cards(
        'La régression logistique calcule d’abord z = wᵀx + b, puis p = sigmoid(z). À z = 0, p = 0,5. Près de zéro, un petit changement de score modifie le plus la probabilité ; aux extrêmes, la courbe s’aplatit.',
        'L’entropie croisée rend coûteuse une erreur très confiante. Avec la sigmoïde et cette perte, le gradient par rapport au score vaut simplement p − y. Si p = 0,8 et la vraie cible y = 1, il vaut −0,2. Soustraire ce gradient négatif augmente le score.',
        'La calibration concerne un groupe de prédictions. Parmi des cas comparables auxquels on attribue 0,8, environ 80 % devraient être positifs. Cela ne garantit aucun résultat individuel. Le seuil de décision est un choix distinct, qui doit refléter le coût des erreurs.'
      ), [
        question('Si p = 0,8 et y = 1, que vaut ∂ℓ/∂z pour l’entropie croisée binaire ?', 'Pour le modèle logistique avec entropie croisée, le gradient par rapport au logit est p − y = 0,8 − 1 = −0,2.'),
        question('Que signifie une probabilité bien calibrée de 0,8 ?', 'La calibration décrit les fréquences observées parmi des probabilités prédites comparables, pas une certitude sur un événement individuel.', ['Chaque prédiction de ce type est correcte', 'Environ 80 % des cas comparables sont positifs', 'Le seuil de décision doit être 0,8'])
      ]),
    generalization: text('Le défi des données inédites', 'Biais, variance et régularisation',
      'Calculer un coefficient ridge et choisir sa pénalité sans utiliser le test final.',
      'Réduire un peu les poids peut empêcher le modèle de suivre le bruit d’un petit échantillon.',
      'Augmentez la pénalité depuis zéro. Notez les erreurs d’entraînement et de validation ; gardez le réglage seulement si la validation le justifie.',
      cards(
        'L’ajustement d’entraînement concerne les exemples déjà vus. Généraliser signifie réussir sur de nouveaux exemples. Ridge ajoute λ‖w‖² à l’erreur et décourage les grands poids. Cela peut stabiliser le modèle, mais une pénalité excessive supprime aussi du signal utile.',
        'Pour une caractéristique, l’équation ridge est (XᵀX/n + λ)w = Xᵀy/n. Si le terme de données de gauche vaut 2, celui de droite 6 et λ = 1, alors (2 + 1)w = 6, donc w = 2. Sans pénalité, w vaudrait 3.',
        'Choisissez λ par validation ou validation croisée. Réservez le test final à une vérification indépendante après ce choix. Séparez par date ou personne si cela reflète l’usage futur. Ajustez le prétraitement uniquement sur chaque partie d’entraînement. Ce petit jeu de données ne prouve pas que réduire les poids aide toujours.'
      ), [
        question('Où faut-il choisir λ ?', 'Les hyperparamètres font partie de la sélection du modèle. Le test final doit rester indépendant de cette sélection.', ['Sur le jeu de test final', 'En minimisant seulement l’erreur d’entraînement', 'Avec des découpages entraînement/validation ou une validation croisée']),
        question('Pour une caractéristique, XᵀX/n = 2, Xᵀy/n = 6 et λ = 1. Quel est le coefficient ridge ?', 'L’équation normale ridge est (2 + 1)w = 6, donc w = 2. Sans pénalité, le coefficient serait 3.')
      ]),
    evaluation: text('Des preuves, pas seulement un score', 'Concevoir une évaluation défendable',
      'Distinguer précision et rappel, et choisir une unité d’évaluation indépendante.',
      'Un score utile répond à une question précise sur de nouveaux cas et les erreurs qui comptent.',
      'Diminuez la prévalence sans changer le détecteur. Prédisez si la précision baisse, puis examinez les cas positifs.',
      cards(
        'La précision demande : parmi les positifs prédits, combien sont réels ? Le rappel demande : parmi les positifs réels, combien ont été trouvés ? Avec TP = 40, FP = 10 et FN = 60, la précision vaut 40/50 = 80 % ; le rappel, 40/100 = 40 %.',
        'Le test évalue une décision déjà prise. Si vous ajustez sans cesse le modèle selon ses résultats, il devient une donnée de sélection. Gardez une réserve finale. Vérifiez aussi les sous-groupes pertinents : un bon score global peut cacher un groupe mal servi.',
        'L’incertitude dépend des cas indépendants. 200 dossiers de 10 patients ne représentent pas 200 patients indépendants. Pour un bootstrap au niveau des patients, rééchantillonnez les patients avec tous leurs dossiers. Précisez à quelle population le résultat doit se généraliser.'
      ), [
        question('Un modèle produit TP = 40, FP = 10 et FN = 60. Quel est son rappel en pourcentage ?', 'Le rappel vaut TP/(TP+FN) = 40/100 = 40 %. La précision serait 40/50 = 80 %.'),
        question('Deux cents dossiers proviennent de dix patients. Quel bootstrap convient généralement mieux à la généralisation à d’autres patients ?', 'Rééchantillonner les patients respecte la dépendance entre leurs dossiers. L’unité doit correspondre à la population cible et au plan d’échantillonnage.', ['Rééchantillonner les patients avec leurs dossiers', 'Rééchantillonner tous les dossiers indépendamment', 'Réutiliser l’exactitude sur l’entraînement'])
      ]),
    neuron: text('Un neurone pour commencer', 'Composition, caractéristiques et expressivité',
      'Appliquer ReLU et expliquer pourquoi un réseau a besoin d’activations non linéaires.',
      'Un neurone calcule une somme pondérée, puis la transforme. Répéter ces deux étapes crée un réseau.',
      'Changez le poids, puis le biais. Décrivez la sensibilité et l’endroit où la sortie passe par 0,5.',
      cards(
        'Une couche calcule z = Wx + b, puis applique une activation. ReLU garde les valeurs positives et remplace les négatives par zéro : ReLU(z) = max(0, z). Avec W = 2, x = −3 et b = 1, z = −5 et la sortie vaut 0.',
        'La non-linéarité ajoute une capacité nouvelle. Sans activation, deux couches affines se réduisent à une seule : 3(2x + 1) + 4 = 6x + 7. Ajouter seulement des couches affines ne crée donc pas une famille de fonctions plus expressive.',
        'Une couche cachée construit des caractéristiques que la suivante combine. Pouvoir représenter un motif ne garantit ni que l’entraînement le trouvera ni qu’il fonctionnera sur de nouvelles données. L’expérience sigmoïde montre une unité isolée, pas un réseau complet entraîné.'
      ), [
        question('Que représente un empilement de couches affines sans non-linéarités ?', 'Composer des transformations affines produit encore une transformation affine. Les activations non linéaires empêchent cette réduction.', ['Une fonction continue quelconque', 'Une seule transformation affine', 'Une distribution bayésienne a posteriori calibrée']),
        question('Pour ReLU(Wx+b), avec W = 2, x = −3 et b = 1, quelle est la sortie ?', 'Avant l’activation, 2 × (−3) + 1 = −5. ReLU renvoie max(0, −5) = 0.')
      ]),
    backprop: text('La rétropropagation sans mystère', 'Différentiation automatique en mode inverse',
      'Suivre les deux utilisations d’un poids partagé et additionner leurs contributions au gradient.',
      'La rétropropagation suit la règle de dérivation en chaîne à rebours. Quand des chemins se rejoignent, additionnez leurs contributions.',
      'Utilisez un petit pas de gradient. Observez les mises à jour diminuer près de zéro, puis suivez l’exemple du poids partagé.',
      cards(
        'Calculez d’abord les valeurs en avant, puis les dérivées en arrière. Dans h = ReLU(wx), ŷ = wh et L = ½(ŷ − y)², le même poids w apparaît deux fois. Conservez les deux chemins vers la perte.',
        'À w = 2, x = 3 et y = 1 : h = 6, ŷ = 12 et ∂L/∂ŷ = 11. L’entrée de ReLU est positive, donc dh/dw = 3. La sortie reçoit deux contributions : dŷ/dw = h + w × dh/dw = 6 + 2 × 3 = 12.',
        'Passez ensuite par la perte : dL/dw = 11 × 12 = 132. Ne compter qu’une utilisation donnerait 66. Le mode inverse réutilise les valeurs calculées en avant et additionne efficacement tous les chemins. Une vérification par différences finies peut détecter des chemins manquants dans de petits exemples lisses.'
      ), [
        question('Le poids partagé w apparaît deux fois : h = ReLU(wx), ŷ = wh, L = ½(ŷ − y)². À w = 2, x = 3 et y = 1, calculez la dérivée totale dL/dw.', 'h = 6 et ŷ = 12. Les deux chemins contribuent : dŷ/dw = h + w × dh/dw = 6 + 2 × 3 = 12. Ainsi dL/dw = (12 − 1) × 12 = 132, pas 66.'),
        question('Un paramètre atteint la perte par deux branches. Comment combiner leurs contributions au gradient ?', 'La règle de dérivation en chaîne à plusieurs variables additionne les contributions de tous les chemins entre le paramètre réutilisé et la perte.', ['Multiplier les contributions', 'Garder seulement la plus grande contribution', 'Additionner les contributions'])
      ]),
    attention: text('L’attention, un échange pondéré', 'Requêtes, clés et valeurs',
      'Calculer une attention masquée et expliquer le rôle de l’échelle dimensionnelle.',
      'L’attention utilise une requête pour pondérer des clés, puis mélange les valeurs correspondantes.',
      'Comparez des températures basses et hautes. Nommez le jeton au poids maximal et décrivez comment le mélange change.',
      cards(
        'Une requête cherche les informations utiles. Ses produits scalaires avec les clés donnent des scores ; softmax les transforme en poids positifs ou nuls dont la somme vaut un. La sortie est la somme pondérée des valeurs. Chaque requête possède sa propre ligne de poids.',
        'Prenez les logits [0, ln(3), ln(100)] et les valeurs [2, 6, 100]. La dernière position est dans le futur. Un masque causal l’exclut avant softmax. Les exponentielles restantes sont 1 et 3, soit des poids normalisés de ¼ et ¾.',
        'Mélangez maintenant les valeurs : ¼ × 2 + ¾ × 6 = 5. La valeur masquée 100 ne contribue pas. Masquer après normalisation serait faux, car la position exclue aurait déjà pris une part du poids.',
        'L’attention divise les produits requête-clé par √dₖ. Avec des coordonnées indépendantes, centrées et de variance un, la variance du produit scalaire croît avec dₖ. La division stabilise approximativement l’échelle. Réduire la température T dans softmax(scores/T) concentre les poids sans changer la dimension d’une tête.',
        'Pour n requêtes et m clés, les scores ont la forme n × m. Normalisez sur les m clés. L’auto-attention a aussi besoin d’informations de position pour représenter l’ordre. Les poids montrent un mélange ; les valeurs et les couches suivantes comptent aussi pour expliquer une prédiction.'
      ), [
        question('Après mise à l’échelle dimensionnelle, les logits sont [0, ln(3), ln(100)] et les valeurs scalaires [2, 6, 100]. La troisième position est masquée causalement. Calculez la sortie à température 1.', 'Appliquez le masque avant softmax. Les exponentielles restantes, 1 et 3, donnent les poids ¼ et ¾. La sortie vaut ¼ × 2 + ¾ × 6 = 5 ; la valeur masquée ne contribue pas.'),
        question('Pourquoi diviser le produit scalaire par √dₖ ?', 'Avec des coordonnées indépendantes de variance un, la variance du produit scalaire croît avec dₖ. La mise à l’échelle compense cela sans supprimer les interactions quadratiques.', ['Pour garder une échelle de logits à peu près stable quand la dimension des clés augmente', 'Pour rendre l’attention linéaire en longueur de séquence', 'Pour garantir des explications causales'])
      ]),
    research: text('Du modèle à la lecture d’un article', 'Hypothèses, limites et reproductibilité',
      'Calculer un petit noyau tangent neuronal et préciser la portée d’un résultat de recherche.',
      'Un résultat devient utile quand vous savez nommer ses hypothèses et tester ses limites.',
      'Changez la pénalité ridge. Notez une observation, une limite de ces données et un test à réaliser ensuite.',
      cards(
        'Distinguez théorème, expérience et règle pratique. Un théorème garantit une conclusion sous des hypothèses données. Une expérience appuie un résultat dans la configuration testée. Une règle pratique suggère une approche utile. Aucun ne prouve automatiquement un résultat hors de sa portée.',
        'Le noyau tangent neuronal compare la sensibilité aux paramètres pour deux entrées : K(x,x′) = ∇θf(x)ᵀ∇θf(x′). Prenez f(a,b)(x) = a(bx)² avec a et b entraînables. Le gradient par rapport aux paramètres vaut (b²x², 2abx²).',
        'À a = 1 et b = 2, ce gradient est (4x², 4x²). À x = 1, il vaut (4, 4) ; à x = 3, (36, 36). Ainsi K(1,3) = 4 × 36 + 4 × 36 = 288. Fixer b retirerait une contribution et définirait un autre noyau.',
        'Certains résultats à largeur infinie montrent que ce noyau reste pratiquement fixe sous des hypothèses précises d’échelle et d’initialisation. Cela ne prouve pas que les réseaux finis ne peuvent apprendre de nouvelles caractéristiques. Repérez la limite et les hypothèses avant d’étendre la conclusion.',
        'Examinez une affirmation d’une source liée. Notez l’affirmation, ses hypothèses, sa meilleure preuve et une condition plausible d’échec. Proposez un test avec données et budgets de calcul comparables. Consignez découpages, réglages et variabilité entre essais. L’expérience ridge appuie une observation sur ces données ; testez d’autres données avant de généraliser.'
      ), [
        question('Soit f(a,b)(x) = a(bx)² avec a et b entraînables. À a = 1 et b = 2, calculez le noyau tangent neuronal K(1, 3).', 'Le gradient vaut (b²x², 2abx²) = (4x², 4x²). À x = 1 : (4,4) ; à x = 3 : (36,36). Leur produit scalaire vaut 4 × 36 + 4 × 36 = 288. Fixer un paramètre donnerait un autre noyau.'),
        question('Que découle directement d’un théorème de noyau fixe à largeur infinie ?', 'Un théorème établit sa conclusion sous ses hypothèses et dans son régime limite. L’étendre à des modèles finis exige des preuves supplémentaires.', ['Tout Transformer fini a un noyau fixe pendant l’entraînement', 'La limite précisée a le comportement annoncé sous ses hypothèses', 'L’apprentissage de caractéristiques ne se produit jamais'])
      ])
  }
};

export const curriculumLocales = { en, de, fr };
