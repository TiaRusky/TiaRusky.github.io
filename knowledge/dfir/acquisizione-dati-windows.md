---
title: Acquisizione dei dati Windows
slug: acquisizione-dati-windows
type: technique
domain: DFIR / Windows
tags:
  - dfir
  - acquisition
  - windows
  - triage
  - write-blocker
related:
  - dfir-fondamenti
  - memoria-volatile
  - artefatti-windows-da-acquisire
---

L'acquisizione deve preservare il maggior numero possibile di dati nello stato in cui sono stati trovati. In presenza di un host compromesso, evitare di spegnerlo o scollegarlo dall'alimentazione quando ciò può causare la perdita di informazioni volatili, come chiavi di cifratura, processi e connessioni attive.

## Sequenza consigliata

1. Acquisire un'immagine della RAM, cioè la memoria [[Memoria volatile]].
2. Verificare se il disco è cifrato.
3. Creare un'immagine di triage con FTK Imager o KAPE.
4. Avviare l'analisi di triage.
5. Acquisire l'intero hard drive solo se necessario.

:::tool
name: Encrypted Disk Detector (EDD)
category: Disk encryption detection
useful_for:
  - Verificare la cifratura del disco
url: https://www.magnetforensics.com/resources/encrypted-disk-detector/
:::

:::warning
Il disco logico può apparire non cifrato perché i dati necessari sono già caricati in memoria, mentre il disco fisico è cifrato. Spegnere il computer potrebbe comportare la perdita delle chiavi di cifratura.
:::

## Write blocker

Un **write blocker** è uno strumento hardware o software che consente accesso in sola lettura ai supporti, impedendo modifiche ai dati durante l'acquisizione forense.

Vedi [[Artefatti Windows da acquisire]] per l'elenco dei dati da raccogliere.
