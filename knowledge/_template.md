---
# Copia questo file, rinominalo (es. windows-prefetch.md) e riempi i campi.
# I file che iniziano con "_" vengono ignorati dall'indice.
title: Nome dell'entry
slug: nome-entry
type: artifact
domain: DFIR
tags:
  - tag1
  - tag2
related:
  - slug-di-un-altra-entry
---

Introduzione: 1-2 frasi che riassumono l'entry.

## Sezione

Contenuto Markdown standard: **bold**, *italic*, `codice inline`,
[link esterno](https://example.com), liste, tabelle, blocchi di codice:

```bash
comando di esempio
```

Link interni: vedi [[Titolo di un'altra entry]] o [[Titolo|etichetta]].

:::artifact
name: Nome artefatto
location: percorso
platform: Windows
useful_for:
  - Uso 1
  - Uso 2
:::

:::tool
name: Nome tool
category: Categoria
useful_for:
  - Uso 1
:::

:::command
tool: nome-tool
command: comando -opzione
description: Cosa fa il comando.
:::

:::event
id: 4688
name: Process Creation
source: Windows Security
useful_for:
  - Process execution
:::

:::tip
Consiglio utile.
:::

:::warning
Attenzione a questo dettaglio.
:::

:::note
Nota supplementare.
:::
