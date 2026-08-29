---
title: Memoria volatile
slug: memoria-volatile
type: artifact
domain: DFIR / Windows
tags:
  - dfir
  - volatile-data
  - ram
  - memory-forensics
  - windows
related:
  - acquisizione-dati-windows
  - artefatti-windows-da-acquisire
---

La memoria volatile contiene informazioni che possono andare perse quando l'host viene spento. La RAM può rivelare dati non osservabili attraverso il solo triage di un'immagine disco.

:::artifact
name: RAM
location: Physical memory of the host
platform: Windows
useful_for:
  - Processi in esecuzione
  - Connessioni di rete
  - File, directory e registri aperti
  - Credenziali in chiaro
  - Malware fileless
:::

## Altri dati volatili

- Connessioni di rete attive
- Applicazioni in esecuzione
- Porte aperte
- Handle e risorse utilizzate dai processi

## Acquisizione da un host attivo

L'acquisizione può essere effettuata con strumenti di RAM image acquisition. FTK Imager e Capture Memory sono esempi di strumenti utilizzabili. È preferibile eseguire il tool da un supporto USB esterno e salvare il dump su un supporto separato, riducendo l'impatto sull'host e preservando le aree non allocate potenzialmente utili al recupero di file precedenti.

## Acquisizione da un sistema spento

Quando si dispone soltanto del disco è possibile esaminare file che possono contenere una rappresentazione parziale della memoria:

- `hiberfil.sys`: snapshot della RAM generata durante l'ibernazione;
- `pagefile.sys`: memoria virtuale usata quando la RAM è piena, potenzialmente contenente tracce di navigazione o chiavi di cifratura;
- `memory.dmp`: dump prodotto in seguito a un crash del sistema.

:::tool
name: FTK Imager
category: Forensic acquisition
useful_for:
  - Acquisizione di immagini RAM e disco
:::

:::tool
name: Capture Memory
category: RAM acquisition
useful_for:
  - Acquisizione della memoria volatile
:::

Vedi [[Acquisizione dei dati Windows]] per la sequenza complessiva di preservazione e raccolta.
