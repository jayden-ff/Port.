// UI copy is deliberately separate from curriculum content and user-authored notes.
// Exact matches keep mathematical expressions and unknown content intact.
const rows = [
 ['Dashboard','Übersicht','Tableau de bord'],
 ['Classes','Kurse','Cours'], ['Notebook','Notizbuch','Carnet'], ['Profile','Profil','Profil'], ['Learn','Lernen','Apprendre'],
 ['Home','Startseite','Accueil'], ['port. home','port. Startseite','Accueil port.'],
 ['A MUSEUM FOR YOUR MIND','EIN MUSEUM FÜR DEINEN GEIST','UN MUSÉE POUR VOTRE ESPRIT'],
 ['THE ART OF UNDERSTANDING','DIE KUNST DES VERSTEHENS','L’ART DE COMPRENDRE'],
 ['Main navigation','Hauptnavigation','Navigation principale'], ['Mobile navigation','Mobile Navigation','Navigation mobile'],
 ['Search classes','Kurse suchen','Rechercher des cours'], ['Current learning streak','Aktuelle Lernserie','Série d’apprentissage en cours'],
 ['Your profile','Dein Profil','Votre profil'], ['Your learning','Dein Lernen','Votre apprentissage'],
 ['Your next lesson','Deine nächste Lektion','Votre prochaine leçon'], ['Revisit a lesson','Eine Lektion wiederholen','Revoir une leçon'],
 ['Motion: reduced','Animationen: reduziert','Animations : réduites'], ['Motion: system','Animationen: Systemeinstellung','Animations : réglage système'],
 ['Animations paused.','Animationen pausiert.','Animations en pause.'],
 ['Animations follow your device preference.','Animationen folgen deiner Geräteeinstellung.','Les animations suivent les préférences de votre appareil.'],
 ['A LITTLE MORE UNDERSTOOD.','EIN BISSCHEN MEHR VERSTANDEN.','UN PEU MIEUX COMPRIS.'],
 ['Keep asking better questions.','Stelle immer bessere Fragen.','Continuez à poser de meilleures questions.'],
 ['INDEPENDENT LEARNING','SELBSTBESTIMMTES LERNEN','APPRENTISSAGE AUTONOME'],
 ['COLLECTION 001 — ARTIFICIAL INTELLIGENCE','SAMMLUNG 001 — KÜNSTLICHE INTELLIGENZ','COLLECTION 001 — INTELLIGENCE ARTIFICIELLE'],
 ['COLLECTION 001 / THE SCIENCE OF THINKING','SAMMLUNG 001 / DIE WISSENSCHAFT DES DENKENS','COLLECTION 001 / LA SCIENCE DE LA PENSÉE'],
 ['ARTIFICIAL','KÜNSTLICHE','INTELLIGENCE'], ['INTELLIGENCE','INTELLIGENZ','ARTIFICIELLE'],
 ['Ideas, experiments, discoveries — from intuition to the frontier.','Ideen, Experimente, Entdeckungen — von der Intuition bis zur aktuellen Forschung.','Idées, expériences, découvertes — de l’intuition aux frontières de la recherche.'],
 ['Conceptual marble sculpture with layered forms','Abstrakte Marmorskulptur mit geschichteten Formen','Sculpture conceptuelle en marbre aux formes superposées'],
 ['STUDY 001 · THE LAYERED MIND','STUDIE 001 · DER VIELSCHICHTIGE GEIST','ÉTUDE 001 · LES STRATES DE L’ESPRIT'],
 ['Your progress','Dein Fortschritt','Votre progression'], ['Overall learning progress','Gesamter Lernfortschritt','Progression globale'],
 ['Collection complete','Sammlung abgeschlossen','Collection terminée'], ['Current lesson','Aktuelle Lektion','Leçon en cours'],
 ['A NEW PERSPECTIVE AWAITS','EINE NEUE PERSPEKTIVE WARTET','UNE NOUVELLE PERSPECTIVE VOUS ATTEND'],
 ['Review lesson','Lektion wiederholen','Revoir la leçon'], ['Continue','Weiter','Continuer'], ['Begin lesson','Lektion beginnen','Commencer la leçon'],
 ['Your next frontier','Dein nächster Horizont','Votre prochain horizon'], ['All classes','Alle Kurse','Tous les cours'],
 ['In the spotlight','Im Mittelpunkt','À la une'], ['Attention','Aufmerksamkeit','Attention'],
 ['A conversation in weights','Ein Gespräch in Gewichten','Une conversation en poids'], ['Interactive experiment ↗','Interaktives Experiment ↗','Expérience interactive ↗'],
 ['How does a model decide what matters?','Wie entscheidet ein Modell, was wichtig ist?','Comment un modèle détermine-t-il ce qui compte ?'],
 ['Step inside the attention mechanism.','Erkunde den Aufmerksamkeitsmechanismus.','Explorez le mécanisme d’attention.'],
 ['Revisit the ideas','Ideen wiederentdecken','Revisitez les idées'], ['Your next steps','Deine nächsten Schritte','Vos prochaines étapes'],
 ['STAY CURIOUS','BLEIB NEUGIERIG','RESTEZ CURIEUX'], ['DAY STREAK','TAGE IN FOLGE','JOURS DE SUITE'],
 ['A practice,','Eine Gewohnheit,','Une pratique,'], ['not a race.','kein Wettlauf.','à votre rythme.'],
 ['CURATOR’S NOTE','ANMERKUNG DER KURATION','LE MOT DU COMMISSAIRE'],
 ['“The pleasure is in finding things out.”','„Die Freude liegt darin, Dinge herauszufinden.“','« Le plaisir est de découvrir. »'],
 ['Inspired by the spirit of scientific inquiry.','Inspiriert vom Geist wissenschaftlicher Neugier.','Inspiré par l’esprit de la recherche scientifique.'],
 ['INDEX / THE COLLECTION','INDEX / DIE SAMMLUNG','INDEX / LA COLLECTION'],
 ['A collection','Eine Sammlung','Une collection'], ['of','voller','de'], ['possibilities.','Möglichkeiten.','possibilités.'],
 ['Start at the beginning, or jump to the questions that move you.','Beginne ganz vorne oder springe zu den Fragen, die dich bewegen.','Commencez par les bases ou passez aux questions qui vous passionnent.'],
 ['Search classes and lessons','Kurse und Lektionen suchen','Rechercher des cours et des leçons'],
 ['Filter by level','Nach Niveau filtern','Filtrer par niveau'], ['Filter by topic','Nach Thema filtern','Filtrer par thème'],
 ['All levels','Alle Niveaus','Tous les niveaux'], ['Foundational','Grundlagen','Fondamental'], ['Intermediate','Fortgeschritten','Intermédiaire'], ['Advanced','Vertieft','Avancé'],
 ['All topics','Alle Themen','Tous les thèmes'], ['Explore the collection','Sammlung erkunden','Explorer la collection'],
 ['Curiosity doesn’t stop at AI.','Neugier endet nicht bei KI.','La curiosité ne s’arrête pas à l’IA.'],
 ['More topics will have a home here. This first collection starts with the science of intelligence.','Weitere Themen werden hier ihren Platz finden. Diese erste Sammlung beginnt mit der Wissenschaft der Intelligenz.','D’autres thèmes trouveront leur place ici. Cette première collection commence par la science de l’intelligence.'],
 ['MORE TOPICS TO COME','WEITERE THEMEN FOLGEN','D’AUTRES THÈMES À VENIR'],
 ['No matching classes yet.','Keine passenden Kurse gefunden.','Aucun cours correspondant.'],
 ['Try “neural”, “learning” or a different level.','Versuche „neuronal“, „Lernen“ oder ein anderes Niveau.','Essayez « neuronal », « apprentissage » ou un autre niveau.'],
 ['Clear filters','Filter zurücksetzen','Réinitialiser les filtres'], ['Enter class','Kurs öffnen','Ouvrir le cours'], ['Class progress','Kursfortschritt','Progression du cours'],
 ['FORM → MEANING','FORM → BEDEUTUNG','FORME → SENS'], ['PATTERN → PREDICTION','MUSTER → VORHERSAGE','MOTIF → PRÉDICTION'], ['LAYERS → INTELLIGENCE','SCHICHTEN → INTELLIGENZ','COUCHES → INTELLIGENCE'],
 ['Your path through the ideas','Dein Weg durch die Ideen','Votre parcours à travers les idées'],
 ['BUILD YOUR INTUITION','ENTWICKLE DEINE INTUITION','DÉVELOPPEZ VOTRE INTUITION'], ['GO DEEPER','GEHE IN DIE TIEFE','APPROFONDISSEZ'],
 ['BEFORE YOU DIVE IN','BEVOR DU EINSTEIGST','AVANT DE VOUS LANCER'], ['Bring a little context.','Etwas Vorwissen hilft.','Quelques repères pour commencer.'],
 ['Learn your way.','Lerne auf deine Weise.','Apprenez à votre façon.'],
 ['Every lesson is open. Start in order for a guided path, or jump ahead if the foundations feel familiar.','Jede Lektion ist frei zugänglich. Folge der Reihenfolge für einen geführten Lernpfad oder springe weiter, wenn du die Grundlagen schon kennst.','Chaque leçon est accessible. Suivez l’ordre proposé pour être guidé, ou avancez si vous maîtrisez déjà les bases.'],
 ['Progress and notes stay in this browser.','Fortschritt und Notizen bleiben in diesem Browser.','Votre progression et vos notes restent dans ce navigateur.'],
 ['YOUR PERSONAL ARCHIVE','DEIN PERSÖNLICHES ARCHIV','VOS ARCHIVES PERSONNELLES'],
 ['Your','Dein','Votre'], ['notebook.','Notizbuch.','carnet.'],
 ['Saved lessons and the thoughts you want to come back to.','Gespeicherte Lektionen und Gedanken, zu denen du zurückkehren möchtest.','Les leçons enregistrées et les réflexions que vous souhaitez retrouver.'],
 ['Saved for another moment of curiosity.','Für einen weiteren neugierigen Moment gespeichert.','À retrouver lors d’un prochain moment de curiosité.'],
 ['Revisit lesson','Lektion wiederholen','Revoir la leçon'], ['A home for your “aha” moments.','Ein Zuhause für deine Aha-Momente.','Un espace pour vos déclics.'],
 ['Bookmark a lesson or write a note in the lesson player.','Speichere eine Lektion oder schreibe eine Notiz im Lektionsfenster.','Enregistrez une leçon ou prenez une note dans le lecteur.'],
 ['Your ideas will appear here.','Deine Ideen erscheinen hier.','Vos idées apparaîtront ici.'], ['Find an idea to explore','Eine Idee zum Erkunden finden','Trouver une idée à explorer'],
 ['EVERY IDEA ADDS UP','JEDE IDEE ZÄHLT','CHAQUE IDÉE COMPTE'], ['Your learning','Dein Lernprofil','Votre apprentissage'], ['profile.','im Überblick.','en détail.'],
 ['Your progress, preferences and saved learning data. This profile stays in this browser.','Dein Fortschritt, deine Einstellungen und gespeicherten Lerndaten. Dieses Profil bleibt in diesem Browser.','Votre progression, vos préférences et vos données d’apprentissage enregistrées. Ce profil reste dans ce navigateur.'],
 ['Display name','Anzeigename','Nom affiché'], ['What should we call you?','Wie sollen wir dich nennen?','Comment vous appeler ?'], ['Save name','Namen speichern','Enregistrer le nom'],
 ['No account or password needed. Export your progress below to move it to another device.','Kein Konto oder Passwort nötig. Exportiere deinen Fortschritt unten, um ihn auf ein anderes Gerät zu übertragen.','Aucun compte ni mot de passe nécessaire. Exportez votre progression ci-dessous pour la transférer vers un autre appareil.'],
 ['Lessons completed','Abgeschlossene Lektionen','Leçons terminées'], ['Experience earned','Gesammelte Erfahrung','Expérience acquise'], ['Current streak','Aktuelle Lernserie','Série en cours'], ['days','Tage','jours'],
 ['Your learning map','Deine Lernübersicht','Votre carte d’apprentissage'], ['100 XP per completed lesson','100 XP pro abgeschlossener Lektion','100 XP par leçon terminée'],
 ['Make it stick.','Festige dein Wissen.','Ancrez vos connaissances.'],
 ['Revisit any completed lesson. Review builds understanding; XP is awarded once.','Wiederhole abgeschlossene Lektionen. Wiederholung vertieft das Verständnis; XP gibt es einmalig.','Reprenez toute leçon terminée. Réviser renforce la compréhension ; les XP sont attribués une seule fois.'],
 ['Review a lesson','Eine Lektion wiederholen','Réviser une leçon'],
 ['Saved on this device, in this browser. No account or cloud sync required.','Auf diesem Gerät in diesem Browser gespeichert. Kein Konto oder Cloud-Abgleich nötig.','Enregistré sur cet appareil, dans ce navigateur. Aucun compte ni synchronisation cloud nécessaire.'],
 ['Export progress','Fortschritt exportieren','Exporter la progression'], ['Import progress','Fortschritt importieren','Importer la progression'],
 ['Profile name saved.','Profilname gespeichert.','Nom du profil enregistré.'],
 ['Name updated for this session. Export progress to keep it.','Name für diese Sitzung aktualisiert. Exportiere den Fortschritt, um ihn zu behalten.','Nom mis à jour pour cette session. Exportez votre progression pour le conserver.'],
 ['Choose a progress file smaller than 1 MB.','Wähle eine Fortschrittsdatei mit weniger als 1 MB.','Choisissez un fichier de progression de moins de 1 Mo.'],
 ['Progress imported. Existing notes were preserved.','Fortschritt importiert. Vorhandene Notizen wurden beibehalten.','Progression importée. Les notes existantes ont été conservées.'],
 ['Progress imported for this session. Export it to keep a backup.','Fortschritt für diese Sitzung importiert. Exportiere ihn, um eine Sicherung zu behalten.','Progression importée pour cette session. Exportez-la pour en garder une copie.'],
 ['That file is not a valid port. progress export.','Diese Datei ist kein gültiger Fortschrittsexport von port.','Ce fichier n’est pas un export de progression port. valide.'],
 ['Browser storage is unavailable. You can keep learning in this tab, but progress will be lost when it closes. Export your progress from','Der Browserspeicher ist nicht verfügbar. Du kannst in diesem Tab weiterlernen, aber dein Fortschritt geht beim Schließen verloren. Exportiere deinen Fortschritt über','Le stockage du navigateur est indisponible. Vous pouvez continuer dans cet onglet, mais votre progression sera perdue à sa fermeture. Exportez votre progression depuis'],
 ['your profile','dein Profil','votre profil'], ['to keep a backup.','um eine Sicherung zu behalten.','pour en garder une copie.'],
 ['Browser storage is unavailable. Progress lasts for this session only.','Der Browserspeicher ist nicht verfügbar. Dein Fortschritt bleibt nur für diese Sitzung erhalten.','Le stockage du navigateur est indisponible. Votre progression est conservée uniquement pour cette session.'],
 ['Back to class','Zurück zum Kurs','Retour au cours'], ['Lesson progress','Lektionsfortschritt','Progression de la leçon'], ['Complete','Abgeschlossen','Terminé'],
 ['Save lesson','Lektion speichern','Enregistrer la leçon'], ['Unsave lesson','Lektion nicht mehr speichern','Retirer la leçon des favoris'],
 ['Lesson navigation','Lektionsnavigation','Navigation des leçons'], ['Switch lesson','Lektion wechseln','Changer de leçon'], ['Lesson stages','Lektionsschritte','Étapes de la leçon'],
 ['Explore','Erkunden','Explorer'], ['Understand','Verstehen','Comprendre'], ['Challenge','Anwenden','S’exercer'], ['Try this','Probiere es aus','À vous d’essayer'],
 ['Go to the source','Zu den Quellen','Consulter les sources'],
 ['Original lesson text, informed by these references. No institutional affiliation.','Eigenständiger Lektionstext auf Grundlage dieser Quellen. Keine institutionelle Zugehörigkeit.','Texte original de la leçon fondé sur ces références. Aucune affiliation institutionnelle.'],
 ['Your notes','Deine Notizen','Vos notes'], ['Saved as you type','Wird beim Schreiben gespeichert','Enregistrement automatique'],
 ['Session only — export to keep','Nur diese Sitzung — zum Behalten exportieren','Session uniquement — exportez pour conserver'],
 ['What clicked? What are you still wondering about?','Was hast du verstanden? Welche Fragen sind noch offen?','Qu’avez-vous compris ? Quelles questions vous posez-vous encore ?'],
 ['Previous question','Vorherige Frage','Question précédente'], ['Back','Zurück','Retour'], ['Class overview','Kursübersicht','Présentation du cours'],
 ['Your place is saved automatically','Deine Position wird automatisch gespeichert','Votre position est enregistrée automatiquement'],
 ['Explore the theory','Theorie erkunden','Explorer la théorie'], ['Test your understanding','Verständnis prüfen','Tester votre compréhension'], ['Check answer','Antwort prüfen','Vérifier la réponse'],
 ['Lesson removed from saved lessons.','Lektion aus den gespeicherten Lektionen entfernt.','Leçon retirée des leçons enregistrées.'], ['Lesson saved to your notebook.','Lektion in deinem Notizbuch gespeichert.','Leçon enregistrée dans votre carnet.'],
 ['Complete both questions to finish this lesson.','Beantworte beide Fragen richtig, um diese Lektion abzuschließen.','Répondez correctement aux deux questions pour terminer cette leçon.'],
 ['PUT THE IDEA TO WORK','WENDE DIE IDEE AN','METTEZ L’IDÉE EN PRATIQUE'],
 ['Choose the best answer.','Wähle die beste Antwort.','Choisissez la meilleure réponse.'],
 ['Enter a number. Use ± to change its sign.','Gib eine Zahl ein. Mit ± änderst du ihr Vorzeichen.','Saisissez un nombre. Utilisez ± pour changer son signe.'],
 ['Your answer','Deine Antwort','Votre réponse'], ['Enter a number','Zahl eingeben','Saisir un nombre'], ['Change answer sign','Vorzeichen der Antwort ändern','Changer le signe de la réponse'],
 ['That’s the idea.','Genau darum geht es.','C’est bien ça.'], ['Not quite. Take another look.','Noch nicht ganz. Schau noch einmal hin.','Pas tout à fait. Regardez à nouveau.'],
 ['Try again to put the reasoning into practice.','Versuche es noch einmal, um den Gedankengang anzuwenden.','Réessayez pour mettre le raisonnement en pratique.'],
 ['UNDERSTOOD','VERSTANDEN','COMPRIS'], ['ONE IDEA CLOSER','EINE IDEE WEITER','UNE IDÉE DE PLUS'],
 ['That’s a new','Das ist eine neue','Voilà une nouvelle'], ['way of seeing.','Sichtweise.','façon de voir.'], ['Let that understanding settle in.','Lass dieses Verständnis auf dich wirken.','Prenez le temps d’assimiler cette idée.'],
 ['Lesson complete','Lektion abgeschlossen','Leçon terminée'], ['100 XP · awarded once','100 XP · einmalig vergeben','100 XP · attribués une seule fois'],
 ['See your learning progress','Deinen Lernfortschritt ansehen','Voir votre progression'], ['Revisit this lesson','Diese Lektion wiederholen','Revoir cette leçon'], ['Back to my learning','Zurück zu meinem Lernen','Retour à mon apprentissage'],
 ['A little off the path.','Ein wenig vom Weg abgekommen.','Un petit détour.'],
 ['This lesson or page doesn’t exist. Your saved progress is still here.','Diese Lektion oder Seite existiert nicht. Dein gespeicherter Fortschritt ist noch da.','Cette leçon ou cette page n’existe pas. Votre progression enregistrée est toujours là.'],
 ['Go home','Zur Startseite','Retour à l’accueil'], ['Explore the classes','Kurse erkunden','Explorer les cours'], ['Lesson not found','Lektion nicht gefunden','Leçon introuvable'],
 ['Skip to content','Zum Inhalt springen','Aller au contenu'],
 ['port. needs JavaScript to run its interactive lessons. Enable JavaScript and reload.','port. benötigt JavaScript für die interaktiven Lektionen. Aktiviere JavaScript und lade die Seite neu.','port. nécessite JavaScript pour ses leçons interactives. Activez JavaScript et rechargez la page.'],
 ['THE GENERALIZATION LAB','DAS GENERALISIERUNGSLABOR','LE LABO DE GÉNÉRALISATION'], ['THE PREDICTION LAB','DAS VORHERSAGELABOR','LE LABO DE PRÉDICTION'],
 ['Live','Live','En direct'], ['Training MSE','Trainings-MSE','EQM d’entraînement'], ['Validation MSE','Validierungs-MSE','EQM de validation'], ['Your model','Dein Modell','Votre modèle'],
 ['Penalty λ','Strafterm λ','Pénalité λ'], ['Slope w','Steigung w','Pente w'], ['Intercept b','Achsenabschnitt b','Ordonnée à l’origine b'],
 ['Filled dots: training · outlined dots: validation. One coefficient, no intercept.','Gefüllte Punkte: Training · umrandete Punkte: Validierung. Ein Koeffizient, kein Achsenabschnitt.','Points pleins : entraînement · points évidés : validation. Un coefficient, sans ordonnée à l’origine.'],
 ['Four observed examples. Mean squared error measures the average squared residual.','Vier beobachtete Beispiele. Der mittlere quadratische Fehler misst das durchschnittliche quadrierte Residuum.','Quatre observations. L’erreur quadratique moyenne mesure la moyenne des résidus au carré.'],
 ['Interactive mathematical plot','Interaktives mathematisches Diagramm','Graphique mathématique interactif'],
 ['THE OPTIMIZATION LAB','DAS OPTIMIERUNGSLABOR','LE LABO D’OPTIMISATION'], ['Parameter θ','Parameter θ','Paramètre θ'], ['Loss θ²','Verlust θ²','Perte θ²'], ['Learning rate η','Lernrate η','Taux d’apprentissage η'],
 ['Take a step →','Einen Schritt machen →','Faire un pas →'], ['Reset','Zurücksetzen','Réinitialiser'],
 ['Follow the slope toward the minimum.','Folge der Steigung zum Minimum.','Suivez la pente vers le minimum.'],
 ['The iterates are diverging. Reset and reduce the learning rate.','Die Iterationen divergieren. Setze zurück und verringere die Lernrate.','Les itérations divergent. Réinitialisez et réduisez le taux d’apprentissage.'],
 ['Near the minimum: the gradient and updates are now tiny.','Nahe am Minimum: Gradient und Aktualisierungen sind jetzt sehr klein.','Près du minimum : le gradient et les mises à jour sont maintenant très faibles.'],
 ['THE NEURON LAB','DAS NEURONENLABOR','LE LABO DU NEURONE'], ['input','Eingabe','entrée'],
 ['One input, one weight, one bias. A sigmoid output.','Eine Eingabe, ein Gewicht, ein Bias. Eine Sigmoid-Ausgabe.','Une entrée, un poids, un biais. Une sortie sigmoïde.'],
 ['Weight w','Gewicht w','Poids w'], ['Bias b','Bias b','Biais b'],
 ['THE BELIEF LAB','DAS WAHRSCHEINLICHKEITSLABOR','LE LABO DES CROYANCES'],
 ['Probability after a positive result','Wahrscheinlichkeit nach einem positiven Ergebnis','Probabilité après un résultat positif'], ['Prior prevalence (%)','A-priori-Prävalenz (%)','Prévalence a priori (%)'],
 ['Sensitivity','Sensitivität','Sensibilité'], ['False-positive rate','Falsch-Positiv-Rate','Taux de faux positifs'],
 ['THE ATTENTION LAB','DAS AUFMERKSAMKEITSLABOR','LE LABO D’ATTENTION'], ['Query:','Abfrage:','Requête :'], ['Temperature T','Temperatur T','Température T'],
 ['Fixed illustrative scores: [0.2, 2.1, 0.8, 1.5]. These weights are computed, not taken from a trained language model.','Feste Beispielwerte: [0.2, 2.1, 0.8, 1.5]. Diese Gewichte werden berechnet und stammen nicht aus einem trainierten Sprachmodell.','Scores illustratifs fixes : [0.2, 2.1, 0.8, 1.5]. Ces poids sont calculés et ne proviennent pas d’un modèle de langage entraîné.'],
 ['Language','Sprache','Langue'],
 // Recall controls use the same translation path as the lesson player.
 ['Review','Wiederholen','Réviser'], ['Due for review','Zur Wiederholung fällig','À réviser'], ['Review due','Wiederholung fällig','Révision prévue'],
 ['Review queue','Wiederholungen','Révisions'], ['Spaced review','Verteilte Wiederholung','Révision espacée'], ['Review now','Jetzt wiederholen','Réviser maintenant'],
 ['No reviews due today.','Heute sind keine Wiederholungen fällig.','Aucune révision prévue aujourd’hui.'],
 ['You’re all caught up.','Du bist auf dem neuesten Stand.','Vous êtes à jour.'], ['Recall check','Erinnerung prüfen','Test de rappel'],
 ['Review complete','Wiederholung abgeschlossen','Révision terminée'], ['Recall complete','Wiederholung abgeschlossen','Rappel terminé'],
 ['Next review','Nächste Wiederholung','Prochaine révision'], ['Review saved.','Wiederholung gespeichert.','Révision enregistrée.'],
 ['No extra XP for reviews.','Keine zusätzlichen XP für Wiederholungen.','Pas de XP supplémentaires pour les révisions.'],
 ['Recall first. Then revisit.','Erst erinnern. Dann nachlesen.','Rappelez-vous, puis revoyez.'],
 ['Start review','Wiederholung starten','Commencer la révision'], ['Back to dashboard','Zurück zur Übersicht','Retour au tableau de bord'],
 ['One idea at a time','Eine Idee nach der anderen','Une idée à la fois'],
 ['Learning goal:','Lernziel:','Objectif d’apprentissage :'],
 ['Explore → Understand → Recall','Erkunden → Verstehen → Erinnern','Explorer → Comprendre → Se rappeler'],
 ['SPACED REPETITION','VERTEILTE WIEDERHOLUNG','RÉPÉTITION ESPACÉE'],
 ['Reviews are optional. New lessons are always open, with no daily limit.','Wiederholungen sind freiwillig. Neue Lektionen sind immer frei zugänglich, ohne Tageslimit.','Les révisions sont facultatives. Les nouvelles leçons restent accessibles, sans limite quotidienne.'],
 ['No reviews due. Keep exploring; we will suggest a recall session after your first lesson.','Keine Wiederholungen fällig. Erkunde weiter; nach deiner ersten Lektion schlagen wir eine Wiederholung vor.','Aucune révision prévue. Continuez à explorer ; nous vous proposerons un rappel après votre première leçon.'],
 ['Recall first, then reveal the explanation. No XP or progress is lost for mistakes.','Erinnere dich zuerst und decke dann die Erklärung auf. Bei Fehlern gehen weder XP noch Fortschritt verloren.','Essayez de vous rappeler, puis affichez l’explication. Une erreur ne vous fait perdre ni XP ni progression.'],
 ['Next review:','Nächste Wiederholung:','Prochaine révision :'],
 ['Previous card','Vorherige Karte','Carte précédente'], ['Next card','Nächste Karte','Carte suivante'],
];

const dictionary = new Map(rows.map(([en,de,fr])=>[en,{en,de,fr}]));
const localeOf = locale => ['en','de','fr'].includes(locale) ? locale : 'en';
const localizedLevel = (value,locale) => {
 const en = rows.find(row=>row.some(item=>item.toUpperCase()===value.toUpperCase()))?.[0] || value;
 return (dictionary.get(en)?.[locale] || value).toUpperCase();
};

// Patterns are anchored so user content that happens to contain a UI phrase is untouched.
const patterns = [
 [/^Lesson (\d+) of (\d+)$/, (m,l)=>l==='de'?`Lektion ${m[1]} von ${m[2]}`:`Leçon ${m[1]} sur ${m[2]}`],
 [/^Question (\d+) of (\d+)$/, (m,l)=>l==='de'?`Frage ${m[1]} von ${m[2]}`:`Question ${m[1]} sur ${m[2]}`],
 [/^(\d+) of (\d+) lessons$/, (m,l)=>l==='de'?`${m[1]} von ${m[2]} Lektionen`:`${m[1]} leçons sur ${m[2]}`],
 [/^(\d+) classes · (\d+) lessons$/, (m,l)=>l==='de'?`${m[1]} Kurse · ${m[2]} Lektionen`:`${m[1]} cours · ${m[2]} leçons`],
 [/^(\d+) lessons$/, (m,l)=>l==='de'?`${m[1]} ${m[1]==='1'?'Lektion':'Lektionen'}`:`${m[1]} ${m[1]==='1'?'leçon':'leçons'}`],
 [/^(\d+)\/(\d+) completed$/, (m,l)=>`${m[1]}/${m[2]} ${l==='de'?'abgeschlossen':m[1]==='1'?'terminée':'terminées'}`],
 [/^(\d+) steps$/, (m,l)=>l==='de'?`${m[1]} ${m[1]==='1'?'Schritt':'Schritte'}`:`${m[1]} pas`],
 [/^(\d+) min · Experiment \+ (\d+) questions$/, (m,l)=>l==='de'?`${m[1]} Min. · Experiment + ${m[2]} Fragen`:`${m[1]} min · Expérience + ${m[2]} questions`],
 [/^(\d+) min · One idea at a time$/, (m,l)=>l==='de'?`${m[1]} Min. · Eine Idee nach der anderen`:`${m[1]} min · Une idée à la fois`],
 [/^OBJECT \/ (\d+)$/, (m,l)=>`${l==='de'?'OBJEKT':'OBJET'} / ${m[1]}`],
 [/^LESSON (\d+) \/ (.+)$/, (m,l)=>`${l==='de'?'LEKTION':'LEÇON'} ${m[1]} / ${localizedLevel(m[2],l)}`],
 [/^(.+) \/ CLASS (\d+)$/, (m,l)=>`${text(m[1],l).toUpperCase()} / ${l==='de'?'KURS':'COURS'} ${m[2]}`],
 [/^Per 10,000 cases in expectation: (\d+) true positives and (\d+) false positives\.$/, (m,l)=>l==='de'?`Erwartungswerte pro 10.000 Fälle: ${m[1]} richtig positive und ${m[2]} falsch positive Ergebnisse.`:`Pour 10 000 cas en espérance : ${m[1]} vrais positifs et ${m[2]} faux positifs.`],
 [/^You completed “(.+)”\.$/, (m,l)=>l==='de'?`Du hast „${m[1]}“ abgeschlossen.`:`Vous avez terminé « ${m[1]} ».`],
 [/^Next: (.+)$/, (m,l)=>l==='de'?`Weiter: ${m[1]}`:`Suite : ${m[1]}`],
 [/^(\d+) (?:reviews? due|due for review)$/, (m,l)=>l==='de'?`${m[1]} ${m[1]==='1'?'Wiederholung':'Wiederholungen'} fällig`:`${m[1]} ${m[1]==='1'?'révision prévue':'révisions prévues'}`],
 [/^(\d+) reviews ready$/, (m,l)=>l==='de'?`${m[1]} ${m[1]==='1'?'Wiederholung':'Wiederholungen'} bereit`:`${m[1]} ${m[1]==='1'?'révision prête':'révisions prêtes'}`],
 [/^Next review: (.+)$/, (m,l)=>l==='de'?`Nächste Wiederholung: ${m[1]}`:`Prochaine révision : ${m[1]}`],
 [/^Review in (\d+) days?$/, (m,l)=>l==='de'?`Wiederholung in ${m[1]} ${m[1]==='1'?'Tag':'Tagen'}`:`Révision dans ${m[1]} ${m[1]==='1'?'jour':'jours'}`],
 [/^port\. — (.+)$/, (m,l)=>`port. — ${text(m[1],l)}`],
 [/^(.+)( [→↗])$/, (m,l)=>text(m[1],l)+m[2]],
];

/** Translate a complete UI string, retaining its surrounding whitespace. */
export function text(value, locale='en') {
 const source=String(value??''), lang=localeOf(locale);
 if(lang==='en')return source;
 const match=source.match(/^(\s*)([\s\S]*?)(\s*)$/), phrase=match[2];
 let translated=dictionary.get(phrase)?.[lang];
 if(translated===undefined){
  // Uppercase category labels are rendered by the original app.
  const row=rows.find(([en])=>en.toUpperCase()===phrase && en!==phrase);
  if(row)translated=dictionary.get(row[0])[lang].toUpperCase();
 }
 if(translated===undefined)for(const [pattern,replace]of patterns){const found=phrase.match(pattern);if(found){translated=replace(found,lang);break}}
 return translated===undefined?source:match[1]+translated+match[3];
}

const textSources=new WeakMap(), attributeSources=new WeakMap();
const excluded='[data-no-translate],script,style,.formula,.sources a,.note-card p,.profile-dot,.attention-tokens,.attention-query b';
const attributes=['aria-label','placeholder','title','alt'];

/** Translate in place so listeners, focus and input values survive. Safe to repeat. */
export function translateDOM(root, locale='en') {
 if(!root)return;
 const lang=localeOf(locale);
 const translateNode=node=>{
  const parent=node.parentElement;
  if(!parent || parent.closest(`${excluded},textarea`))return;
  const current=node.nodeValue, previous=textSources.get(node);
  const source=previous&&current===previous.last?previous.source:current;
  // An option without an explicit value inherits its label as its submitted value.
  if(parent.tagName==='OPTION'&&!parent.hasAttribute('value'))parent.setAttribute('value',parent.value);
  let next=text(source,lang);
  if(parent.matches('.week-days span')){
   const index=[...parent.parentElement.parentElement.children].indexOf(parent.parentElement);
   next=({en:['M','T','W','T','F','S','S'],de:['M','D','M','D','F','S','S'],fr:['L','M','M','J','V','S','D']})[lang][index]??next;
  }
  if(current!==next)node.nodeValue=next;
  textSources.set(node,{source,last:next});
 };
 const translateAttributes=element=>{
  if(element.closest(excluded))return;
  const records=attributeSources.get(element)||new Map();
  const names=element.tagName==='OPTGROUP'?[...attributes,'label']:attributes;
  for(const name of names){
   if(!element.hasAttribute(name))continue;
   const current=element.getAttribute(name),previous=records.get(name);
   const source=previous&&current===previous.last?previous.source:current,next=text(source,lang);
   if(current!==next)element.setAttribute(name,next);
   records.set(name,{source,last:next});
  }
  attributeSources.set(element,records);
 };
 if(root.nodeType===3){translateNode(root);return}
 if(root.nodeType===1)translateAttributes(root);
 const document=root.ownerDocument||root;
 const walker=document.createTreeWalker(root,5); // SHOW_ELEMENT | SHOW_TEXT
 let node;
 while((node=walker.nextNode())){if(node.nodeType===3)translateNode(node);else translateAttributes(node)}
}

/** Language names stay recognizable while the surrounding UI changes language. */
export function languageSelector(locale='en') {
 const lang=localeOf(locale),label=text('Language',lang);
 return `<label class="language-control"><span>${label}</span><select id="language" aria-label="${label}" data-no-translate>${[['en','English'],['de','Deutsch'],['fr','Français']].map(([value,name])=>`<option value="${value}"${value===lang?' selected':''}>${name}</option>`).join('')}</select></label>`;
}
