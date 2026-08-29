# Starting Point

#### Libro: FOR500.1 Windows Digital Forensics and Advanced Data Triage FOR500.2 Core Windows Forensics Part 1 Windows Registry… 

### Introduzione
Il processo di DFIR (Digital Forensics and Incident Response) è tutto ciò che concerne l'analisi degli artefatti di uno o più sistemi potenzialmente compromessi, in modo da identificare le modalità con cui tale compromissione è avvenuta.

Questo processo avviene appunto tramite gli artefatti, i quali sono il risultato delle azioni effettuate su un sistema da uno o più utenti o dal sistema stesso.
Esempi di artefatti sono: eventi di sistema, registri, MFT table, prefetch, hive, ...

**Nota**: il processo di DF non si limita all'estrazione di artefatti, ma anche all'identificazione della sequenze di azioni che si sono susseguite.
Risulta fondamentale idenificare le giuste domande da porsi, in modo quindi da sapere dove cercare l'informazione necessaria.

### Evidenza di... - Categorie
Evidence of categories:
- User Communication
- File Download
- Program Execution
- File Opening
- File Knowledge
- Physical Location
- USB Key Usage
- Account Usage
- Browser Usage

**Nota** : per lo stesso evento avvenuto è possibile che ci siano più artefatti associati.

**Nota** : A write blocker is a hardware or software tool used in digital forensics to ensure read-only access to storage media, preventing any data modification during an investigation.

### Acquisizione della memoria (Volatile e Non)
La catena che si utilizza per l'acquisizione di dati da analizzare è la seguente:
- Image RAM (Volatile)
- Verifica se il disco è cifrato (EDD.exe - Encrypted Disk Detector - https://www.magnetforensics.com/resources/encrypted-disk-detector/): bisogna ricordare che il disco logico potrebbe viene visto come non cifrato dal sistema (dati caricati in memoria sono non cifrati), anche se il disco fisico lo è. Spegnere il pc comporterebbe la possibile perdita delle chiavi di cifratura.
- Creazione Immagine Triage (tramite FTK Imager o KAPE)
- Inizio analisi triage
- Image Entire Hard Drive (solo se necessario)

**Nota** : mai (o quasi mai) staccare dall'alimentazione l'host compromesso.
Facendo ciò perderemmo tutte le informazioni volatili e quindi buona parte dell'analisi in caso di malware filess.

'When responding to an incident involving digital evidence, the general rule for first responders should be to preserveas much data as possible in
the way it was found when they arrived'

#### Volatile Data
- RAM
- Active network connections
- Running applications
- Open ports
- ..

##### Acquisizione RAM

La RAM è una miniera di informazioni che potenzialmente non possiamo osservare dal triage di un'immagine disco.
Tra le informazioni possiamo identificare:
- processi in esecuzione;
- connessioni di rete;
- file, directory, registri aperti e utilizzati dai processi;
- credenziali in chiaro;
- malware filess;
- ...

L'acquisiziione di informazioni dalla memoria può avvenire:
- tramite strumenti di RAM Image Acquisition;
- da Dead Disk:
    - Hibernation File (hiberfil.sys): contiene una snapshot della RAM quando il sistema entra in ibernazione;
    - Page File (pagefile.sys): quando la RAM è piena, i dati attualmente inutilizzati sono spostati su disco e mappati (memoria virtuale). Qui si possono trovare informazioni come navigazione web o chiavi di cifratura
    - Memory Dump (memory.dmp): in caso di crash del sistema viene effettuato e salvato un dmp della memoria RAM attiva al momento dell'arresto.


Un tool che può essere usato per l'acquisizione di dump della memoria RAM è sempre FTK Imager.
Risulta importarte utilizzare lo stesso da un USB esterna all'host, in modo di evitare di salvare il dump sull'host di analisi, poiché questo comporterebbe la cancellazione di zone non allocate di memoria, le quali potrebbbero essere utili per il recupero di file presenti in precedenza.

Strumenti che possono essere usati: FTK-Imager; Capture Memory

### Cosa acquisire
- $MFT
- $LogFile e $J
- Hive: SAM, SYSTEM, SOFTWARE, DEFAULT, NTUSER.DAT, USERCLASS.DAT
- *.evtx;
- *.lnk;
- *.pf;
- Pagefile.sys;
- Hynerfile.sys;
- Recent Folder and sub folder;
- User's home folder
