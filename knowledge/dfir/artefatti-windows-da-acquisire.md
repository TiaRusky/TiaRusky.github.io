---
title: Artefatti Windows da acquisire
slug: artefatti-windows-da-acquisire
type: artifact
domain: DFIR / Windows
tags:
  - dfir
  - windows
  - artefatti
  - acquisition
related:
  - dfir-fondamenti
  - categorie-di-evidenza
  - acquisizione-dati-windows
  - memoria-volatile
---

Durante un'acquisizione di triage Windows è utile includere almeno i seguenti artefatti, adattando la raccolta agli obiettivi dell'indagine e alle condizioni dell'host.

:::artifact
name: Windows forensic acquisition set
location: Host filesystem and Windows Registry
platform: Windows
useful_for:
  - Ricostruzione della timeline
  - Analisi dell'esecuzione dei programmi
  - Analisi degli account e della configurazione
  - Ricerca di file recenti e attività utente
:::

## File system e timeline

- `$MFT`
- `$LogFile`
- `$UsnJrnl:$J`
- Cartella home dell'utente
- Cartella Recent e relative sottocartelle

## Registry hive

- `SAM`
- `SYSTEM`
- `SOFTWARE`
- `DEFAULT`
- `NTUSER.DAT`
- `UsrClass.dat` / `USERCLASS.DAT`

## Eventi e tracce di esecuzione

- File `*.evtx`
- File `*.lnk`
- File Prefetch `*.pf`

## Memoria virtuale e dati di recupero

- `pagefile.sys`
- `hiberfil.sys`
- `memory.dmp`

Questi artefatti devono essere interpretati insieme: una singola evidenza raramente è sufficiente a dimostrare un'attività. Per i dati che possono scomparire con lo spegnimento, consultare [[Memoria volatile]] e seguire la strategia descritta in [[Acquisizione dei dati Windows]].
