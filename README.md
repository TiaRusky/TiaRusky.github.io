# TiaRusky.github.io

Portfolio interattivo in stile shell Linux, pensato per tracciare il mio percorso di apprendimento in cybersecurity.

## Tema

- **Distribuzione**: Debian
- **Palette**: Solarized Dark
- **Font**: Courier New
- **Layout**: terminale full screen interattivo

## Comandi disponibili

- `help` - elenco comandi
- `ls` - elenca contenuti directory
- `cd` - cambia directory
- `pwd` - stampa directory corrente
- `cat` - mostra contenuto file
- `whoami` - utente corrente
- `socgraph` - lancia il tool forense SOCGraph
- `knowledge` - lancia la knowledge base
- `reader` - lancia il reader EPUB locale
- `clear` - pulisce il terminale

## Easter egg

- `sudo su` - diventa root
- `rm -rf /` - prova e scopri
- `sl` - trenino!

## Knowledge base

La Knowledge base è un archivio personale di conoscenza cybersecurity, **repository-driven**:
le entry sono file Markdown con frontmatter YAML in `knowledge/`, senza alcuna UI di editing.
Il sito legge l'indice compilato `assets/data/knowledge-index.json`.

Dopo aver aggiunto o modificato un file `.md` in `knowledge/`:

```bash
node tools/build-knowledge.js
```

e committa sia il `.md` che l'`index.json` rigenerato. Il formato delle entry e i blocchi
semantici supportati (`:::artifact`, `:::tool`, `:::command`, `:::event`, `:::tip`,
`:::warning`, `:::note`) sono documentati in `knowledge/README.md`.

## Reader EPUB

Il comando `reader` apre `tools/reader/index.html`, una web app standalone per leggere EPUB direttamente nel browser. I file e i metadati restano locali in IndexedDB; sono disponibili libreria, drag & drop, indice, ricerca, posizione automatica, segnalibri, note, evidenziazioni, impostazioni tipografiche e tema chiaro/scuro.

Il reader usa `epub.js` da CDN, quindi per l'apertura dei libri è necessaria una connessione al primo caricamento della pagina. L'app può essere avviata con un semplice server statico (ad esempio GitHub Pages o `npx serve .`).

## Sviluppo locale

Il sito è pensato per essere ospitato su GitHub Pages. Per testarlo localmente basta aprire `index.html` in un browser moderno; per il reader EPUB è preferibile un server HTTP statico per evitare limitazioni del browser su IndexedDB e risorse locali.
