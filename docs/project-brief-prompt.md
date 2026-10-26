# Prompt per le repo dei progetti

Come si usa: apri una sessione di Claude dentro la repo del progetto, incolla il prompt qui sotto (tutto
il blocco), copia la risposta e incollala nella sessione del portfolio. Il portfolio importerà testo,
immagini e idee grafiche da quella repo (le dovrai indicare il percorso della cartella).

La risposta arriva **in chat**: nella repo del progetto non va committato niente. L'unica cosa che la
sessione può creare sono gli screenshot, in una cartella temporanea fuori dalla repo.

Modello di riferimento per il risultato: la pagina di Hevy Companion (hero animata, telefono con la Glyph
che si può provare, notifica che cambia stato).

---

```text
Devi preparare la scheda del progetto per il mio portfolio (sito di un web developer di Trento). La
pagina sarà letta da due tipi di persone: chi non è tecnico (un cliente, un recruiter) e chi lo è.
Deve essere piacevole da leggere, non un elenco di funzioni. Leggi README, codice, asset e storia git
di questa repo. NON modificare né committare niente nella repo: rispondi in chat.

Rispondi con UN SOLO blocco di codice markdown (```markdown ... ```), in italiano, così.

────────────────────────────────────────
PARTE 1 · intestazione
────────────────────────────────────────
---
title: nome del progetto
tagline: una frase sola, concreta, senza marketing (max ~110 caratteri). Mettila tra apici se contiene i due punti.
year: 'AAAA'
kind: web | app | bot | hardware | tool
stack: [tecnologie principali, max ~8]
live: URL pubblico, se esiste
repo: URL della repo GitHub, solo se è pubblica
summary: >
  IN BREVE: 2-4 frasi (max ~350 caratteri) per chi legge di fretta: cos'è, a cosa serve, la cosa più
  interessante. Deve reggersi da sola, senza gergo.
highlights: [3-4 punti chiave brevissimi, max 3 parole l'uno]
---

────────────────────────────────────────
PARTE 2 · il testo della pagina (Markdown)
────────────────────────────────────────
Scrivi per essere letto, non per documentare. Regole di stile:
- Parti da una scena concreta o da un problema reale che ho vissuto io, non da "Questo progetto è…".
- Tono misto: racconto in prima persona quando spieghi perché e cosa è andato storto, tono più da prodotto
  quando descrivi cosa fa. Frasi corte, parole semplici, niente superlativi, niente "innovativo",
  "potente", "soluzione". Un dettaglio concreto vale più di un aggettivo.
- Ogni sezione deve far venire voglia di leggere la successiva. Se una frase si può togliere senza perdere
  nulla, toglila. Meglio 500 parole vive che 1200 piatte.
- Non parlare di AI né di strumenti di sviluppo.
- Solo cose verificabili nella repo; se un dato non lo sai, mettilo nell'elenco "DA CONFERMARE" in fondo.

Struttura (titoli di secondo livello, in questo ordine):
## Il problema
   La scena e il problema reale, 2-3 paragrafi brevi. Chi ne soffre, cosa non funzionava prima.
## Come funziona
   Una passeggiata guidata nell'uso, nell'ordine in cui lo vivrebbe una persona: cosa vede, cosa fa, cosa
   succede. Scritta per chi non è tecnico. Qui vanno gli screenshot e le parti interattive (vedi PARTE 4),
   segnati nel testo con un segnaposto su riga a sé: [[FIGURA: nome-file o nome-idea | didascalia]]
## Cosa sa fare
   Le 4-8 funzioni principali come SCHEDE: per ognuna un titolo di terzo livello (### Nome della funzione)
   seguito da 1-2 frasi (cosa fa e perché è utile). Niente elenchi puntati lunghi.
## Sotto il cofano
   Per chi è tecnico. 2-4 sfide o scelte, ognuna raccontata come una piccola storia di 4-6 righe: il
   problema, cosa ho provato, cosa ha funzionato e perché. Scegli le cose che nel codice si vedono solo
   leggendo, non quelle ovvie dal README. Nomina i file/funzioni dove aiuta.
   Se un'architettura o un flusso si capisce meglio con uno schema, aggiungi UN diagramma mermaid
   (blocco ```mermaid, flowchart/sequence semplici, etichette brevi in italiano). Solo se chiarisce
   davvero; se il progetto è semplice niente diagramma.
Nessuna sezione "Stato" o "Roadmap". Se c'è qualcosa di importante che manca, una sola frase alla fine di
"Come funziona" o di "Sotto il cofano".

────────────────────────────────────────
PARTE 3 · screenshot e asset
────────────────────────────────────────
Cerca gli asset già presenti (screenshot, foto, video, schemi, icone, grafiche) e scegline al massimo 6-8,
i migliori. Per ognuno: percorso relativo alla radice della repo, cosa mostra, dimensioni in pixel, a cosa
servirebbe (copertina / "come funziona" / dettaglio). Segna "IN BREVE" i 1-3 più adatti ad aprire la pagina.
Segnala quelli con dati personali, nomi veri o credenziali.

Se mancano immagini che servirebbero (di solito: la schermata principale, il momento d'uso più bello, il
risultato), NON limitarti a elencarle. Chiedimi il permesso e poi:
1. avvia il progetto in locale seguendo il README (se per girare servono chiavi, account o dati miei,
   fermati e dimmi cosa serve invece di inventare);
2. usa dati di esempio, mai dati reali o personali;
3. fai gli screenshot con gli strumenti che hai a disposizione (browser/emulatore), in due formati se è un
   progetto web: desktop ~1440 px di larghezza e mobile ~390 px, e salvali in una cartella FUORI dalla repo
   (per esempio <cartella-temporanea>/portfolio-shots/<nome-progetto>/), nominandoli in modo chiaro
   (01-home-desktop.png, 02-treno-mobile.png…);
4. riportami i percorsi assoluti e cosa mostra ciascuno. Scegli i momenti che raccontano il progetto, non
   le schermate di impostazioni.
Se non riesci ad avviarlo, dimmelo e scrivi quali foto/screenshot dovrei fare io (soggetto, inquadratura).

────────────────────────────────────────
PARTE 4 · idee grafiche e interattive
────────────────────────────────────────
Le pagine più belle del mio portfolio non hanno solo testo: hanno una hero animata costruita apposta e
piccoli componenti che si possono provare (esempio: la pagina di Hevy Companion, con strisce di Glyph che
scorrono in hero, un telefono la cui Glyph gira i fotogrammi veri dell'app, una notifica che cambia stato).
Proponi 2-4 idee di questo tipo per QUESTO progetto, in ordine di resa. Per ognuna:
- cosa si vede e cosa può fare chi visita (una frase);
- da cosa nasce: quali dati, algoritmi, file o asset della repo si possono riusare (percorsi precisi:
  per esempio una funzione di calcolo, un JSON, i colori/font del progetto), così posso portarli sul sito;
- se serve la grafica come HERO (sostituisce l'immagine in cima alla pagina) oppure come componente
  dentro il testo;
- come funziona senza server né librerie pesanti (HTML/CSS/JS o canvas leggero, dati inclusi nella pagina).
Regole: la demo deve già mostrare qualcosa di bello da sola appena si apre, con uno scenario pronto e
già in movimento; massimo 2-3 controlli (niente pannelli con decine di bottoni da provare); deve
funzionare anche con un tocco su telefono. Se un'idea richiede dati o backend reali del progetto, scartala.

────────────────────────────────────────
PARTE 5 · in fondo, fuori dal blocco
────────────────────────────────────────
- Elenco "DA CONFERMARE:" con quello che non hai potuto verificare (link, repo pubblica o privata, chi può
  usare l'app, fonti dati da nominare…).
- Eventuali problemi legali o di riservatezza che noti (nomi di terzi, API non ufficiali, dati personali).
```
