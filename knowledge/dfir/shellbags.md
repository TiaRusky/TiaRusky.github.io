---

title: Windows ShellBags
slug: shellbags
type: artifact
domain: DFIR
tags:
  - windows
  - shellbags
  - dfir
  - registry
  - mru
related:
  - artefatti-windows-da-acquisire
  - dfir-fondamenti
  - categorie-di-evidenza

---

Introduzione: le ShellBags sono artefatti Windows che descrivono le directory e le preferenze di navigazione dell'utente nel Windows Explorer, utili per ricostruire l'interazione con il file system e le condivisioni.

## Definizione

Le ShellBags sono artefatti Windows che mostrano informazioni relative alle directory e alle cartelle accedute dall'utente. Nello specifico, mantengono le impostazioni e le preferenze da preservare quando un utente naviga una cartella tramite Windows Explorer.

Gli artefatti si dividono in due categorie principali:

- Hive primaria:
  - `USRCLASS.DAT\Local Settings\Software\Microsoft\Windows\Shell\Bags`
  - `USRCLASS.DAT\Local Settings\Software\Microsoft\Windows\Shell\BagMRU`
- Hive secondaria:
  - `NTUSER\Software\Microsoft\Windows\Shell\Bags`
  - `NTUSER\Software\Microsoft\Windows\Shell\BagMRU`

L'utilizzo delle ShellBags permette di ricostruire le cartelle con cui un possibile attore ha interagito (accesso, modifica, eliminazione). Le chiavi **Bag** identificano le preferenze associate a un'utenza e a una cartella, mentre le chiavi **BagMRU** (**Most Recently Used**) permettono di ricostruire la struttura del File/Network System con cui l'utenza ha interagito.

Le chiavi Bag e BagMRU sono associate tramite l'utilizzo di un identificativo numerico che prende il nome **NodeSlot**, il quale collega una sottochiave di Bag (da BagMRU).

## Struttura ShellBags

### Come leggere una lista MRU

Le liste MRU sono collezioni di valori esadecimali suddivisi in blocchi da 4 byte, letti in Little Endian (da destra verso sinistra). Ogni blocco da 4 byte identifica un item descritto dalla Bag.

La collezione finisce con i 4 byte **0xFF 0xFF 0xFF 0xFF**.

Gli item sono organizzati secondo l'accesso più recente. Quindi il primo identifica la cartella acceduta per ultima, il secondo per penultima e così via.

> **Note:** Gli item sono collegati tramite NodeSlot ad una sottochiave di Bag, che contiene le preferenze relative a quella cartella.

### Lettura valore MRU

I primi due byte di questo campo rappresentano la **dimensione dello Shell Item**.

Seguono:

- un singolo byte denominato **class type identifier** (identificatore del tipo di classe);
- un singolo byte denominato **sort index** (indice di ordinamento).

Il *sort index* è semplicemente un riferimento a elementi come **Questo PC**, **Utenti** e simili.

Dopo questi byte, troviamo un **GUID di 16 byte**, seguito da **due byte NULL (`00 00`)** utilizzati per terminare la riga.

> **Nota:** il campo `Data` contiene dati binari, quindi è necessario convertire i valori esadecimali per ottenere il GUID corretto. È possibile utilizzare un [convertitore GUID](https://toolslick.com/conversion/data/guid).

Una volta ottenuto il GUID, è possibile consultare [questa tabella di mapping](https://github.com/EricZimmerman/GuidMapping/blob/master/Resources/GuidToName.txt) per identificare a quale oggetto o riferimento corrisponde.

## Struttura shell item

| Offset | Valore | Note |
| ------ | ------ | ---- |
| 0-1 | dimensione shell item | lunghezza totale dello shell item |
| 2 | class type identifier | tipo di classe |
| 3 | sort index | indice di ordinamento |
| 4-19 | GUID | identificatore dell'oggetto |
| 20-21 | NULL | terminatore della riga |

Per la decodifica degli offset e dei valori, il campo dati è binario e va interpretato in sequenza: dimensione, tipo, sort index, GUID, terminatore.

## Tools

Le ShellBags possono essere analizzate da riga di comando tramite il tool **SBECmd** (Zimmerman) oppure graficamente tramite lo **ShellbagExplorer** (Zimmerman).

:::artifact
name: ShellBags
location: USRCLASS.DAT\Local Settings\Software\Microsoft\Windows\Shell e NTUSER\Software\Microsoft\Windows\Shell
platform: Windows
useful_for:
  - ricostruzione accesso cartelle
  - ricostruzione interazione condivisioni
  - analisi preferenze Explorer
:::

:::tool
name: SBECmd
category: ShellBags
useful_for:
  - analisi da riga di comando
  - estrazione valori Bag/BagMRU
:::

:::tool
name: ShellbagExplorer
category: ShellBags
useful_for:
  - analisi grafica
  - visualizzazione struttura MRU
:::

## Note per l'analisi

- Le liste MRU sono ordinate per accesso più recente, con terminazione `0xFF 0xFF 0xFF 0xFF`.
- Ogni entry MRU è un intero rappresentato da un blocco di 4 byte in Little Endian.
- Il NodeSlot collega BagMRU a Bag, consentendo la ricostruzione delle preferenze per cartella.
- L'interpretazione dei GUID richiede il mapping riferito alla tabella ufficiale.
