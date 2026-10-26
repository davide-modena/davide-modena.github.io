# Todo del portfolio

## Da fare

- [ ] **Hevy Companion — mockup**: sostituire la foto del telefono con una che scatto io (mockup della Glyph).
- [ ] **Hevy Companion — simulazione**: migliorare la simulazione dell'allenamento mettendone uno già fatto
      e in movimento, senza i 300 tasti da provare (al massimo 2-3 controlli).
- [ ] **Terminale**: trovare una scorciatoia migliore del backtick (`` ` ``) per aprirlo, che possano usare
      tutti (la tastiera italiana non ha il backtick a portata di mano).
- [ ] **Form contatti**: è nascosto (`FORM_ENABLED = false` in `src/views/ContactView.astro`). Da ripristinare
      con Netlify Forms o Web3Forms/Formspree.
- [ ] **Pagine dei progetti Lab**: riscriverle col nuovo prompt (`docs/project-brief-prompt.md`), una repo alla
      volta: Trenitardo (fatto in parte), Bustardo, Nothing Home, ecc.
- [ ] **Trenitardo — grafica**: hero, notifica, Glyph Toy e widget sono ricostruiti in HTML e seguono lo stesso
      viaggio finto Trento → Verona (`src/scripts/trenSim.ts`). Restano: foto vere dal telefono (notifica,
      Glyph, orologio, widget) se si vogliono affiancare alle ricostruzioni; screenshot a risoluzione più alta
      (ora JPEG a bassa risoluzione); app per l'orologio ancora senza ricostruzione. Altre idee proposte dalla
      sessione della repo: linea di stazioni con il filtro della posizione credibile on/off, selettore "Per quando?"
      con ruote.
- [ ] **Licenza font Ndot57**: la hero di Trenitardo usa il font Ndot57 (Nothing) copiato dalla repo; verificare
      che sia ridistribuibile sul sito pubblico, altrimenti sostituirlo con un font a puntini libero.
- [ ] **Trenitardo — da confermare**: link del bot Telegram, repo pubblica o privata (ora senza `repo`),
      app per l'orologio = Wear OS?
- [ ] **Essential Search**: è un altro progetto di Davide che andrà nel Lab; quando c'è la sua pagina, linkarla
      da Trenitardo (oggi è solo nominata nel testo, nella scheda "Anche da Telegram e dalla barra del PC").
- [ ] **Lab — vista a costellazione**: oltre alla griglia di schede, una seconda vista selezionabile in cui i
      progetti sono stelle che fluttuano nello spazio (ognuno con la sua icona). I progetti collegati (un
      progetto e le sue sotto-parti, es. Trenitardo + Bustardo, o le app per la Glyph) sono uniti da linee e
      formano una costellazione, come in un grafo. Passando il mouse (o toccando) su una stella compare un
      dettaglio breve (titolo, tagline, tipo). Serve un campo `related` nell'intestazione dei progetti, un
      interruttore "schede / costellazione" sulla pagina Lab, canvas leggero, e su telefono un tocco al posto
      dell'hover. Con "riduci movimento" le stelle stanno ferme.
- [ ] **Pagine progetto — immagini nel riquadro "in breve"**: il riassunto iniziale c'è già (2-4 frasi e punti
      chiave); manca ancora la possibilità di affiancargli 1-2 immagini di supporto.
- [ ] **Dominio**: davidemodena.com (libero, insieme a .it e .dev) quando si decide di comprarlo.
- [ ] **Mini-me**: l'animazione `plane` è disattivata (peso 0 in `src/mini/scenes.ts`); da rifare se la vogliamo.

## Fatto di recente

- Blog con articoli in Markdown (`npm run new "titolo"`), modello in `src/content/blog/_template.md`.
- Menu mobile classico.
- Mini-me: la scena del treno e del bus ora è rara (la prima dopo ~30 s, poi pause di 90-160 s).
- Riquadro "in breve" nelle pagine progetto, e diagrammi mermaid nei blocchi di codice.
