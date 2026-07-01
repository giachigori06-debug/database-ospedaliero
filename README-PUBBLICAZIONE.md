# Database Ospedaliero - pubblicazione ufficiale

## Stato attuale

Il portale e pronto per essere pubblicato come web app.
`ai-backend.py` serve i file del portale e fornisce `/api/state`, cioe lo stato condiviso usato da piu operatori contemporaneamente.

Quando il portale e aperto via server, pazienti, archivio, personale, log, letti, sale operatorie e configurazioni vengono sincronizzati sullo stesso backend.
Se invece apri direttamente `index.html`, resta disponibile la modalita locale su browser.

## Avvio locale di prova

```bash
python3 ai-backend.py
```

Poi apri:

```text
http://127.0.0.1:8787
```

Controlli utili:

```text
http://127.0.0.1:8787/health
http://127.0.0.1:8787/api/state
```

## Pubblicazione consigliata su Render

1. Crea un repository GitHub privato o pubblico.
2. Carica tutta la cartella del progetto.
3. Entra su Render.
4. Seleziona `New` -> `Blueprint`.
5. Collega il repository GitHub.
6. Render leggera automaticamente `render.yaml`.
7. Conferma il servizio `database-ospedaliero`.
8. Lascia il comando di start: `python3 ai-backend.py`.
9. Verifica che sia presente il disco persistente:
   - mount path: `/var/data`
   - file dati: `/var/data/hospital-data.json`
10. Imposta `OPENAI_API_KEY` solo se vuoi usare funzioni IA esterne.
11. Apri l'URL pubblico generato da Render.

## Variabili ambiente

```text
OPENAI_MODEL=gpt-4.1-mini
OPENAI_API_KEY=sk-...          opzionale
HOSPITAL_DATA_FILE=/var/data/hospital-data.json
PORT=gestita da Render
```

## Dominio ufficiale

Su Render:

1. Apri il servizio.
2. Vai in `Settings` -> `Custom Domains`.
3. Aggiungi il dominio, per esempio `databaseospedaliero.it` o `app.databaseospedaliero.it`.
4. Copia i record DNS suggeriti da Render nel pannello del tuo provider dominio.
5. Attendi la propagazione DNS e il certificato HTTPS automatico.

## Uso multi-operatore

Per lavorare insieme:

- tutti devono entrare dallo stesso URL Render;
- non devono aprire il vecchio file locale `index.html`;
- il backend deve avere disco persistente attivo;
- ogni operatore accede con il proprio profilo;
- i dati vengono condivisi tramite `/api/state`.

## Passaggio professionale successivo

Il backend JSON e adatto per demo, simulazione, prototipo e piccoli gruppi.
Per uso realmente ospedaliero o con molti operatori serve passare a PostgreSQL/Supabase:

- tabella `patients`;
- tabella `vitals`;
- tabella `orders`;
- tabella `reports`;
- tabella `therapies`;
- tabella `beds`;
- tabella `users`;
- tabella `audit_logs`;
- login con password cifrate;
- sessioni sicure;
- backup automatici;
- aggiornamenti realtime.

Questa architettura e gia pronta per quel passaggio: il frontend parla con un backend, quindi si sostituisce `/api/state` con API/database strutturati.

## File principali

- `index.html`: portale.
- `style.css`: stile.
- `app.js`, `access-control.js`, `clinical-enhancements.js`, `ai-simulation.js`: logica applicativa.
- `ai-backend.py`: server statico, endpoint IA e stato condiviso.
- `render.yaml`: configurazione Render con disco persistente.
- `.env.example`: esempio variabili ambiente.
