# Database Ospedaliero

## Scelta attuale

Il progetto non usa piu API IA obbligatorie.

Funziona gratis, senza backend, senza chiave API e senza Terminale acceso.

## Come funziona

- L'amministratore genera il caso clinico.
- Il paziente viene creato automaticamente in cartella.
- Gli operatori usano domande preimpostate.
- Il paziente risponde con un motore locale basato su scenario, identita, farmaci, allergie, parametri e sintomi.
- Infermieri e soccorritori hanno compiti dedicati.
- Referti, trattamenti, evoluzione e debrief restano simulati offline.

## Pubblicazione gratuita

Puoi pubblicare il sito come statico su:

- GitHub Pages;
- Netlify;
- Vercel;
- Render static site.

File necessari:

- `index.html`
- `style.css`
- `app.js`
- `access-control.js`
- `clinical-enhancements.js`
- `ai-simulation.js`

Il file `ai-backend.py` puo restare nella cartella, ma non serve per la versione gratuita/offline.

## Ruoli

- Amministratore: genera e controlla casi.
- Medico: anamnesi medica, ipotesi, esami, terapia, decisione finale.
- Infermiere: triage, parametri, dolore, allergie/farmaci, prelievi/ECG, sorveglianza.
- Soccorritore: scena, ABCDE, monitoraggio, accesso, preallerta, consegna SBAR.
