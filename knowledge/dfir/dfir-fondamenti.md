---
title: Fondamenti di DFIR
slug: dfir-fondamenti
type: concept
domain: DFIR
tags:
  - dfir
  - digital-forensics
  - incident-response
  - artefatti
related:
  - categorie-di-evidenza
  - acquisizione-dati-windows
  - memoria-volatile
---

Il processo di **DFIR** (*Digital Forensics and Incident Response*) riguarda l'analisi degli artefatti lasciati dalle azioni degli utenti, dal sistema operativo o da eventuali avversari, con l'obiettivo di ricostruire una compromissione e la sequenza degli eventi.

L'analisi non consiste soltanto nell'estrarre artefatti: è necessario correlare le evidenze e formulare le domande corrette per stabilire dove cercare le informazioni mancanti.

## Artefatti

Esempi di artefatti Windows includono eventi di sistema, registri, la tabella MFT, Prefetch e hive del Registry. Uno stesso evento può produrre più artefatti associati; per questo è importante considerarli nel loro insieme e valutarne la coerenza temporale.

## Obiettivo dell'analisi

L'obiettivo è identificare la sequenza di azioni che si sono susseguite, distinguendo ciò che è stato eseguito dall'utente, dal sistema o da un possibile malware.

Vedi anche [[Categorie di evidenza]] e [[Acquisizione dei dati Windows]].
