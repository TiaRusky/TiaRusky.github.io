# Knowledge

La Knowledge base è un archivio personale di conoscenza cybersecurity, **repository-driven**:
non esiste alcuna interfaccia web per creare o modificare contenuti. Ogni entry è un file
Markdown con frontmatter YAML in questa cartella. Il sito web è solo il lettore, l'esploratore
e il motore di ricerca.

```
knowledge/
├── README.md            ← questo file (ignorato dall'indice)
├── dfir/                ← una cartella per dominio (libera, non rigida)
│   ├── windows-event-logs.md
│   └── ...
├── networking/
│   └── ...
└── ...
```

## Formato di un'entry

Ogni file `.md` inizia con frontmatter YAML delimitato da `---`:

```yaml
---
title: Windows Security Event Log
slug: windows-security-event-log
type: artifact
domain: DFIR
tags:
  - windows
  - event-logs
  - authentication
related:
  - windows-prefetch
  - process-creation
  - sysmon
---

Corpo in Markdown standard...
```

### Campi frontmatter

| Campo      | Obbligatorio | Descrizione                                                            |
| ---------- | ------------ | ---------------------------------------------------------------------- |
| `title`    | sì           | Titolo dell'entry                                                        |
| `slug`     | no           | Identificatore univoco. Se assente viene derivato dal titolo.            |
| `type`     | no           | Tipo concettuale: `artifact`, `tool`, `event`, `technique`, `concept`, `topic`, ... |
| `domain`   | no           | Dominio (es. `DFIR`, `Windows`, `Networking`). Se assente, deriva dalla cartella. |
| `tags`     | no           | Lista di tag liberi                                                       |
| `related`  | no           | Slug/titoli di entry correlate                                            |

Il modello è volutamente leggero: si possono aggiungere campi opzionali, ma non serve
forzare decine di campi obbligatori.

## Contenuto Markdown

Il corpo supporta Markdown standard: titoli, paragrafi, liste, tabelle, link, immagini,
blockquote, codice inline e blocchi di codice con fence.

### Link interni (wiki-style)

```
[[Windows Event Logs]]
[[NTFS|file system NTFS]]
```

Vengono risolti verso le entry corrispondenti (per titolo o slug). I link non risolti
vengono renderizzati in modo discreto come "non ancora documentato".

## Blocchi semantici

Un piccolo set di blocchi semantici delimita dati strutturati. Chiudono con `:::`.

```text
:::artifact
name: Windows Prefetch
location: C:\Windows\Prefetch
platform: Windows
useful_for:
  - Program execution
  - Execution frequency
:::
```

Blocchi supportati:

| Blocco       | Scopo                                              |
| ------------ | -------------------------------------------------- |
| `:::artifact`| Scheda artefatto (location, platform, useful_for)   |
| `:::tool`    | Scheda tool (category, useful_for, url)             |
| `:::command` | Blocco comando con pulsante di copia                |
| `:::event`   | Scheda Event ID (id, name, source, useful_for)      |
| `:::tip`     | Callout informativo                                 |
| `:::warning` | Callout di avviso                                   |
| `:::note`    | Callout di nota                                     |

Preferire sempre il Markdown standard quando possibile.

## Workflow

1. Aggiungi o modifica un file `.md` in questa cartella.
2. Rigenera l'indice (il sito legge solo `assets/data/knowledge-index.json`):

```bash
node tools/build-knowledge.js
```

3. Committa sia il `.md` che l'`index.json` rigenerato.

### Date (Recently Acquired)

`dateAdded` / `dateModified` vengono derivate da `git log` (primo commit che introduce
il file e ultimo commit che lo modifica), con fallback ai timestamp del filesystem.
Non serve manutenere date a mano.
