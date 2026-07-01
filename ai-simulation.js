/* Simulatore IA: casi infiniti centrati sul paziente, dalla chiamata 118 alla chiusura */

const AI_SIM_STORAGE = "hospitalAISimulations";
let aiSimSelezionata = localStorage.getItem("aiSimSelezionata") || "";

const AI_SIM_AREE = [
    "118", "Pronto Soccorso", "Chirurgia", "Medicina Interna", "Cardiologia",
    "Neurologia", "Ortopedia", "Rianimazione"
];

const AI_SIM_NOMI = ["Marco", "Luca", "Giulia", "Anna", "Francesca", "Alessandro", "Sara", "Paolo", "Elena", "Davide", "Marta", "Antonio", "Claudia", "Roberto", "Irene", "Stefano"];
const AI_SIM_COGNOMI = ["Rossi", "Bianchi", "Ferrari", "Russo", "Romano", "Gallo", "Costa", "Fontana", "Moretti", "Conti", "Marino", "Greco", "Bruno", "Rizzo", "Caruso", "Vitale"];
const AI_SIM_PERSONALITA = ["collaborante", "ansioso", "reticente", "confuso", "dolorante", "agitato", "stanco", "spaventato"];
const AI_SIM_LUOGHI = ["Firenze", "Prato", "Pistoia", "Empoli", "Siena", "Arezzo", "Lucca", "Pisa", "Livorno", "Bologna", "Roma", "Milano"];
const AI_SIM_INDIRIZZI = ["Via Roma 12", "Via Garibaldi 8", "Piazza Matteotti 3", "Via Verdi 41", "Via della Repubblica 22", "Viale Europa 17"];
const AI_SIM_PROFESSIONI = ["impiegato", "pensionata", "operaio", "insegnante", "studente", "autista", "commerciante", "infermiere in pensione", "casalinga", "libero professionista"];
const AI_SIM_ALLERGIE = ["Nessuna allergia nota", "Penicillina", "Amoxicillina", "FANS", "Mezzi di contrasto iodati", "Lattice"];
const AI_SIM_FARMACI_DOMICILIARI = [
    { nome: "Ramipril", dose: "5 mg", frequenza: "1 cp al mattino", motivo: "ipertensione" },
    { nome: "Amlodipina", dose: "5 mg", frequenza: "1 cp la sera", motivo: "ipertensione" },
    { nome: "Bisoprololo", dose: "2.5 mg", frequenza: "1 cp al mattino", motivo: "cardiopatia/ipertensione" },
    { nome: "Metformina", dose: "1000 mg", frequenza: "1 cp x 2", motivo: "diabete tipo 2" },
    { nome: "Atorvastatina", dose: "20 mg", frequenza: "1 cp la sera", motivo: "dislipidemia" },
    { nome: "Levotiroxina", dose: "75 mcg", frequenza: "1 cp al mattino", motivo: "ipotiroidismo" },
    { nome: "Pantoprazolo", dose: "20 mg", frequenza: "1 cp al mattino", motivo: "gastroprotezione/reflusso" },
    { nome: "Acido acetilsalicilico", dose: "100 mg", frequenza: "1 cp dopo pranzo", motivo: "prevenzione cardiovascolare" },
    { nome: "Apixaban", dose: "5 mg", frequenza: "1 cp x 2", motivo: "fibrillazione atriale" },
    { nome: "Furosemide", dose: "25 mg", frequenza: "1 cp al mattino", motivo: "scompenso/edemi" }
];
const AI_SIM_PATOLOGIE = ["ipertensione arteriosa", "diabete tipo 2", "dislipidemia", "fibrillazione atriale", "BPCO", "pregresso infarto", "insufficienza renale lieve", "ipotiroidismo", "ansia", "nessuna patologia nota"];
const AI_SIM_DOMANDE = {
    soccorritore: [
        { id: "dinamica", label: "Dinamica evento", domanda: "Mi racconta cosa e successo?" },
        { id: "coscienza", label: "Stato coscienza", domanda: "Mi sente? Sa dove si trova e che giorno e?" },
        { id: "dolore", label: "Dolore", domanda: "Dove sente dolore e quanto e forte da 0 a 10?" },
        { id: "respiro", label: "Respiro", domanda: "Le manca il fiato o respira normalmente?" },
        { id: "allergie", label: "Allergie", domanda: "Ha allergie a farmaci, lattice o altro?" },
        { id: "farmaci", label: "Farmaci", domanda: "Che farmaci prende abitualmente?" },
        { id: "ultimoPasto", label: "Ultimo pasto", domanda: "Quando ha mangiato o bevuto l'ultima volta?" },
        { id: "contatto", label: "Familiare", domanda: "Chi possiamo chiamare come familiare o contatto?" }
    ],
    infermiere: [
        { id: "identita", label: "Identita", domanda: "Mi conferma nome, cognome e data di nascita?" },
        { id: "cf", label: "Codice fiscale", domanda: "Mi puo dire il codice fiscale o ha un documento?" },
        { id: "triage", label: "Motivo accesso", domanda: "Qual e il problema principale per cui e venuto qui?" },
        { id: "dolore", label: "Dolore NRS", domanda: "Da 0 a 10 quanto e forte il dolore?" },
        { id: "parametri", label: "Sintomi associati", domanda: "Ha febbre, nausea, difficolta a respirare o svenimenti?" },
        { id: "farmaci", label: "Terapia domiciliare", domanda: "Mi dice i farmaci che prende a casa, con dosi se le ricorda?" },
        { id: "allergie", label: "Allergie", domanda: "Ha allergie note?" },
        { id: "bisogni", label: "Bisogni assistenziali", domanda: "Riesce ad alzarsi, camminare, urinare o ha bisogno di aiuto?" }
    ],
    medico: [
        { id: "hpi", label: "Storia del sintomo", domanda: "Quando e iniziato il disturbo e come e cambiato nel tempo?" },
        { id: "sede", label: "Sede/irradiazione", domanda: "Dove sente il problema? Si sposta o si irradia da qualche parte?" },
        { id: "fattori", label: "Fattori", domanda: "Cosa peggiora o migliora il sintomo?" },
        { id: "redflags", label: "Red flags", domanda: "Ha avuto svenimento, sudorazione, febbre alta, sangue, difficolta a parlare o respirare?" },
        { id: "anamnesi", label: "Anamnesi", domanda: "Che malattie importanti ha avuto in passato?" },
        { id: "farmaci", label: "Farmaci", domanda: "Che farmaci assume e li ha presi oggi?" },
        { id: "allergie", label: "Allergie", domanda: "Ha allergie o reazioni importanti a farmaci?" },
        { id: "sociale", label: "Contesto", domanda: "Vive solo? C'e qualcuno che puo aiutarla a casa?" }
    ]
};

const AI_SIM_COMPITI = {
    soccorritore: [
        { id: "scena", label: "Sicurezza scena", effetto: "Scena valutata e resa sicura; raccolta dinamica iniziale." },
        { id: "abcde", label: "ABCDE 118", effetto: "Valutazione ABCDE preospedaliera completata." },
        { id: "monitor", label: "Monitor/SpO2/PA", effetto: "Monitoraggio di base applicato durante intervento 118." },
        { id: "accesso", label: "Accesso venoso", effetto: "Accesso venoso posizionato se indicato." },
        { id: "preallerta", label: "Preallerta PS", effetto: "Preallertato il Pronto Soccorso con quadro clinico e codice." },
        { id: "handover", label: "Consegna SBAR", effetto: "Consegna strutturata SBAR effettuata al team ricevente." }
    ],
    infermiere: [
        { id: "triage", label: "Triage strutturato", effetto: "Triage completato con motivo accesso, dolore e rischio evolutivo." },
        { id: "parametri", label: "Parametri vitali", effetto: "Parametri vitali rivalutati e registrati." },
        { id: "dolore", label: "Scala dolore", effetto: "Dolore rilevato con scala NRS e rivalutazione programmata." },
        { id: "allergie", label: "Allergie/farmaci", effetto: "Allergie e terapia domiciliare riconciliate." },
        { id: "prelievi", label: "Prelievi/ECG", effetto: "Prelievi ed ECG predisposti secondo priorita clinica." },
        { id: "sorveglianza", label: "Sorveglianza", effetto: "Sorveglianza infermieristica attivata con segnalazione peggioramenti." }
    ],
    medico: [
        { id: "valutazione", label: "Valutazione medica", effetto: "Valutazione medica iniziale registrata." },
        { id: "ipotesi", label: "Ipotesi diagnostiche", effetto: "Diagnosi differenziale formulata." },
        { id: "esami", label: "Piano esami", effetto: "Piano diagnostico impostato in base a rischio e sospetto." },
        { id: "terapia", label: "Piano terapeutico", effetto: "Terapia iniziale impostata e rivalutazione pianificata." },
        { id: "consulenza", label: "Consulenza", effetto: "Consulenza specialistica richiesta se indicata." },
        { id: "decisione", label: "Decisione finale", effetto: "Decisione clinica finale documentata." }
    ]
};

const AI_SIM_QUADRI = [
    {
        area: "Cardiologia",
        tipo: "Dolore toracico",
        diagnosi: ["STEMI anteriore", "NSTEMI", "Embolia polmonare", "Dissezione aortica", "Pericardite acuta", "Dolore toracico non cardiaco"],
        sintomi: ["dolore oppressivo al torace", "dispnea", "sudorazione fredda", "nausea", "dolore irradiato al braccio sinistro", "sincope"],
        redFlags: ["ipotensione", "dolore migrante al dorso", "sopraslivellamento ST", "desaturazione", "troponina positiva"],
        esami: ["ECG 12 derivazioni", "Troponina seriata", "Emocromo", "Elettroliti", "D-dimero", "RX torace", "TC angio torace"]
    },
    {
        area: "Medicina Interna",
        tipo: "Dispnea",
        diagnosi: ["Polmonite", "BPCO riacutizzata", "Edema polmonare acuto", "Asma severa", "Pneumotorace", "Sepsi respiratoria"],
        sintomi: ["fame d'aria", "tosse", "febbre", "respiro sibilante", "astenia", "dolore pleuritico"],
        redFlags: ["SpO2 bassa", "uso muscoli accessori", "cianosi", "confusione", "ipotensione"],
        esami: ["EGA", "RX torace", "Emocromo", "PCR", "PCT", "Elettroliti", "TC torace"]
    },
    {
        area: "Chirurgia",
        tipo: "Addome acuto",
        diagnosi: ["Appendicite acuta", "Colecistite", "Occlusione intestinale", "Perforazione viscerale", "Pancreatite acuta", "Colica renale complicata"],
        sintomi: ["dolore addominale", "vomito", "febbre", "alvo chiuso", "dolore alla palpazione", "inappetenza"],
        redFlags: ["addome peritonitico", "lattati elevati", "aria libera", "ipotensione", "febbre alta"],
        esami: ["Emocromo", "PCR", "Amilasi/Lipasi", "Funzione renale", "Ecografia addome", "TC addome con contrasto"]
    },
    {
        area: "Neurologia",
        tipo: "Deficit neurologico",
        diagnosi: ["Ictus ischemico", "Emorragia cerebrale", "Crisi epilettica post-critica", "TIA", "Ipoglicemia severa", "Meningoencefalite"],
        sintomi: ["difficolta a parlare", "deviazione della rima orale", "ipostenia di un lato", "cefalea intensa", "confusione", "convulsione"],
        redFlags: ["GCS ridotto", "deficit focale", "cefalea improvvisa", "febbre e rigidita nucale", "ipoglicemia"],
        esami: ["Glicemia capillare", "TC encefalo", "Angio-TC", "Emocromo", "Coagulazione", "Elettroliti", "ECG 12 derivazioni"]
    },
    {
        area: "Ortopedia",
        tipo: "Trauma",
        diagnosi: ["Frattura femore", "Frattura polso", "Lussazione spalla", "Politrauma", "Trauma cranico minore", "Frattura costale con pneumotorace"],
        sintomi: ["dolore post-traumatico", "impotenza funzionale", "deformita", "tumefazione", "ferita lacero-contusa", "dolore toracico dopo trauma"],
        redFlags: ["instabilita emodinamica", "deficit neurovascolare", "trauma ad alta energia", "GCS ridotto", "dispnea"],
        esami: ["RX distretto interessato", "RX torace", "TC trauma total body", "Emocromo", "Coagulazione", "EGA"]
    },
    {
        area: "Rianimazione",
        tipo: "Shock",
        diagnosi: ["Shock settico", "Shock emorragico", "Anafilassi", "Shock cardiogeno", "Arresto cardiaco peri-ritorno", "Insufficienza respiratoria severa"],
        sintomi: ["ipotensione", "cute fredda", "dispnea severa", "confusione", "oliguria", "rash diffuso"],
        redFlags: ["lattati elevati", "PA non rilevabile", "GCS basso", "SpO2 critica", "tachicardia estrema"],
        esami: ["EGA con lattati", "Emocromo", "Coagulazione", "Elettroliti", "ECG 12 derivazioni", "RX torace", "TC mirata"]
    },
    {
        area: "118",
        tipo: "Evento territoriale",
        diagnosi: ["Sincope", "Intossicazione", "Trauma stradale", "Dolore toracico sul territorio", "Dispnea domiciliare", "Agitazione psicomotoria"],
        sintomi: ["chiamata da familiare", "paziente a terra", "ambiente non sicuro", "dolore riferito", "respiro difficoltoso", "stato confusionale"],
        redFlags: ["incoscienza", "trauma maggiore", "dispnea severa", "dolore toracico persistente", "agitazione non contenibile"],
        esami: ["Valutazione ABCDE", "Glicemia capillare", "ECG 12 derivazioni", "Parametri seriali", "Scheda 118"]
    }
];

function aiSimLoad() {
    try {
        return JSON.parse(localStorage.getItem(AI_SIM_STORAGE) || "[]");
    } catch (error) {
        return [];
    }
}

function aiSimSave(items) {
    localStorage.setItem(AI_SIM_STORAGE, JSON.stringify(items));
}

function aiRnd(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function aiPickMany(list, min, max) {
    const pool = [...list].sort(() => Math.random() - 0.5);
    return pool.slice(0, min + Math.floor(Math.random() * (max - min + 1)));
}

function aiNow() {
    return new Date().toLocaleString();
}

function aiDataNascitaDaEta(eta) {
    const now = new Date();
    const year = now.getFullYear() - Number(eta || 40);
    const month = 1 + Math.floor(Math.random() * 12);
    const day = 1 + Math.floor(Math.random() * 27);
    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

function aiCodiceFiscaleDemo(nome, cognome, eta, sesso) {
    const clean = value => String(value || "").toUpperCase().replace(/[^A-Z]/g, "");
    const base = `${clean(cognome).slice(0, 3).padEnd(3, "X")}${clean(nome).slice(0, 3).padEnd(3, "X")}`;
    const year = String(new Date().getFullYear() - Number(eta || 40)).slice(-2);
    return `${base}${year}${sesso === "F" ? "D" : "A"}${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}H501Z`;
}

function aiFarmaciPerScenario(quadro, diagnosi, eta) {
    const pool = [...AI_SIM_FARMACI_DOMICILIARI];
    const result = [];
    if (eta > 55) result.push(aiRnd(pool));
    if (/Cardiologia|STEMI|NSTEMI|Edema|fibrillazione/i.test(`${quadro.area} ${diagnosi}`)) {
        result.push(...pool.filter(f => /Ramipril|Bisoprololo|Atorvastatina|Acido acetilsalicilico|Apixaban/i.test(f.nome)).slice(0, 2));
    }
    if (/Dispnea|BPCO|Asma/i.test(`${quadro.tipo} ${diagnosi}`)) {
        result.push({ nome: "Salbutamolo spray", dose: "100 mcg", frequenza: "al bisogno", motivo: "broncospasmo" });
    }
    if (/diabete|Shock|Sepsi|Polmonite/i.test(`${quadro.tipo} ${diagnosi}`)) {
        result.push(pool.find(f => f.nome === "Metformina"));
    }
    const unique = result.filter(Boolean).filter((f, i, arr) => arr.findIndex(x => x.nome === f.nome) === i);
    return unique.length ? unique.slice(0, 4) : (Math.random() > 0.45 ? [aiRnd(pool)] : []);
}

function aiAnagraficaScenario(nome, cognome, eta, sesso, quadro, diagnosi) {
    const luogoNascita = aiRnd(AI_SIM_LUOGHI);
    const comuneResidenza = aiRnd(AI_SIM_LUOGHI);
    const dataNascita = aiDataNascitaDaEta(eta);
    const farmaci = aiFarmaciPerScenario(quadro, diagnosi, eta);
    const patologie = aiPickMany(AI_SIM_PATOLOGIE, eta > 55 ? 2 : 1, eta > 65 ? 4 : 2).filter(v => !(v === "nessuna patologia nota" && farmaci.length));
    return {
        dataNascita,
        luogoNascita,
        comuneResidenza,
        indirizzo: aiRnd(AI_SIM_INDIRIZZI),
        codiceFiscale: aiCodiceFiscaleDemo(nome, cognome, eta, sesso),
        professione: aiRnd(AI_SIM_PROFESSIONI),
        telefono: `3${String(Math.floor(100000000 + Math.random() * 899999999))}`,
        contatto: `${aiRnd(["Mario", "Laura", "Gianni", "Silvia", "Paola", "Andrea"])} ${cognome} (${aiRnd(["coniuge", "figlio/a", "fratello/sorella", "madre", "padre"])})`,
        allergie: aiRnd(AI_SIM_ALLERGIE),
        farmaciDomiciliari: farmaci,
        patologieRemote: patologie.length ? patologie : ["nessuna patologia nota"],
        abitudini: aiRnd(["non fuma", "ex fumatore", "fuma circa 10 sigarette/die", "beve alcol occasionalmente", "vive da solo", "vive con famiglia"]),
        ultimoPasto: aiRnd(["questa mattina", "ieri sera", "circa 3 ore fa", "non ricorda bene", "poco prima dell'evento"])
    };
}

function aiSeverityWeight(difficolta) {
    return { facile: 1, media: 2, avanzata: 3, critica: 4 }[difficolta] || 2;
}

function aiCodiceBySeverity(sev) {
    if (sev >= 4) return "Rosso";
    if (sev === 3) return "Arancione";
    if (sev === 2) return "Azzurro";
    return "Verde";
}

function aiParametriIniziali(sev, quadro) {
    const cardio = quadro.area === "Cardiologia";
    const resp = quadro.tipo === "Dispnea" || /respiratoria|polmonite|bpco|asma/i.test(quadro.diagnosiScelta || "");
    const shock = quadro.tipo === "Shock";
    const neuro = quadro.area === "Neurologia";
    const fc = Math.min(158, 72 + sev * 13 + Math.floor(Math.random() * 18));
    const fr = resp || shock ? 20 + sev * 4 + Math.floor(Math.random() * 8) : 14 + sev * 2 + Math.floor(Math.random() * 5);
    const sat = resp ? 98 - sev * 4 - Math.floor(Math.random() * 4) : 98 - Math.max(0, sev - 2) * 2;
    const sys = shock ? 118 - sev * 12 - Math.floor(Math.random() * 12) : cardio && sev >= 3 ? 145 + Math.floor(Math.random() * 35) : 125 - sev * 3;
    return {
        fc: String(fc),
        fr: String(fr),
        sat: String(Math.max(78, sat)),
        pa: `${Math.max(70, sys)}/${Math.max(42, Math.round(sys * 0.58))}`,
        temp: String(quadro.tipo === "Addome acuto" || quadro.tipo === "Dispnea" ? (36.8 + Math.random() * sev).toFixed(1) : (36.4 + Math.random()).toFixed(1)),
        gcs: String(neuro || shock ? Math.max(7, 15 - sev - Math.floor(Math.random() * 3)) : 15),
        dolore: String(Math.min(10, 3 + sev + Math.floor(Math.random() * 3)))
    };
}

function aiScenarioBlueprint(quadro, diagnosi, sev) {
    const percorsoInfo = aiPercorsoScenario(quadro, diagnosi);
    const base = {
        percorso: percorsoInfo.percorso,
        obiettiviDidattici: [
            "Raccogliere anamnesi mirata senza suggerire la diagnosi al paziente.",
            "Riconoscere precocemente i segni di instabilita clinica.",
            "Richiedere esami coerenti con sospetto, gravita e tempo clinico.",
            "Rivalutare il paziente dopo ogni intervento."
        ],
        erroriCritici: [
            "Ignorare peggioramento dei parametri vitali.",
            "Non rivalutare dolore, coscienza, respiro e perfusione.",
            "Dimettere o spostare il paziente senza referti/parametri coerenti."
        ],
        trattamentiAttesi: ["Monitoraggio", "Accesso venoso", "Analgesia titolata", "Rivalutazione seriata"],
        trattamentiDannosi: ["Ritardo decisionale", "Terapia non rivalutata", "Dimissione precoce"],
        criteriMiglioramento: ["parametri vitali in miglioramento", "dolore ridotto", "referti compatibili con piano", "decisione appropriata"],
        criteriPeggioramento: ["ipotensione", "desaturazione", "GCS ridotto", "dolore persistente", "ritardo nei percorsi tempo-dipendenti"]
    };
    const text = `${quadro.tipo} ${diagnosi}`;
    if (/STEMI|NSTEMI|Dolore toracico|Dissezione|Embolia/i.test(text)) {
        base.obiettiviDidattici.push("Distinguere cause cardiache, vascolari e respiratorie del dolore toracico.");
        base.erroriCritici.push("Non eseguire ECG precoce o non attivare percorso tempo-dipendente.");
        base.trattamentiAttesi.push("ECG precoce", "Troponina seriata", "Percorso cardiologico se indicato");
        base.trattamentiDannosi.push("Nitrato in ipotensione", "Sottovalutazione del dolore toracico persistente");
    }
    if (/Dispnea|Polmonite|BPCO|Asma|Pneumotorace|respiratoria/i.test(text)) {
        base.obiettiviDidattici.push("Valutare ABCDE respiratorio e necessita di ossigeno/supporto ventilatorio.");
        base.erroriCritici.push("Lasciare desaturazione o fatica respiratoria senza trattamento.");
        base.trattamentiAttesi.push("Ossigeno titolato", "EGA", "RX torace/TC se indicata");
        base.trattamentiDannosi.push("Sedazione non monitorata", "Ritardo nel supporto ventilatorio");
    }
    if (/Appendicite|Colecistite|Occlusione|Perforazione|Pancreatite|Addome/i.test(text)) {
        base.obiettiviDidattici.push("Riconoscere addome chirurgico e segni di sepsi/peritonite.");
        base.erroriCritici.push("Somministrare solo analgesia senza rivalutazione chirurgica se quadro evolutivo.");
        base.trattamentiAttesi.push("Esami ematochimici", "Imaging addominale", "Valutazione chirurgica");
        base.trattamentiDannosi.push("Dimissione con addome peritonitico", "Ritardo antibiotico se sepsi");
    }
    if (/Ictus|Emorragia|TIA|Meningo|Neurolog/i.test(text)) {
        base.obiettiviDidattici.push("Definire tempo di esordio e deficit neurologico focale.");
        base.erroriCritici.push("Non controllare glicemia o non attivare percorso ictus.");
        base.trattamentiAttesi.push("Glicemia", "TC encefalo", "Valutazione neurologica tempo-dipendente");
        base.trattamentiDannosi.push("Ritardo imaging", "Sedazione non necessaria prima della valutazione neurologica");
    }
    if (/Shock|sepsi|Anafilassi|emorragico|Rianimazione/i.test(text)) {
        base.obiettiviDidattici.push("Riconoscere shock e iniziare trattamento entro pochi minuti.");
        base.erroriCritici.push("Non trattare ipotensione/lattati elevati o non cercare causa dello shock.");
        base.trattamentiAttesi.push("Fluidi", "Vasopressore se indicato", "EGA lattati", "Controllo causa");
        base.trattamentiDannosi.push("Ritardo antibiotico in sepsi", "Ritardo adrenalina in anafilassi");
    }
    base.evoluzione = [
        { minuto: 0, evento: "Ingresso scenario", effetto: "quadro iniziale" },
        { minuto: 10, evento: sev >= 3 ? "Possibile peggioramento" : "Rivalutazione attesa", effetto: sev >= 3 ? "parametri instabili se non trattato" : "stabilita se gestito correttamente" },
        { minuto: 30, evento: "Decisione clinica", effetto: "esito dipende da esami, trattamenti e rivalutazione" }
    ];
    base.obiettiviNascosti = aiObiettiviNascosti(percorsoInfo.percorso, sev);
    base.eventiTempo = aiEventiTempo(percorsoInfo.percorso, sev);
    return base;
}

function aiPercorsoScenario(quadro, diagnosi) {
    const text = `${quadro?.tipo || ""} ${diagnosi || ""}`.toLowerCase();
    if (/stemi|nstemi|infarto|dolore toracico|sindrome coronarica/.test(text)) return { percorso: "SCA tempo-dipendente" };
    if (/ictus|tia|emorragia|neurolog/.test(text)) return { percorso: "Stroke tempo-dipendente" };
    if (/sepsi|shock settico|polmonite|meningo/.test(text)) return { percorso: "Sepsi" };
    if (/trauma|politrauma|frattura|emorragico/.test(text)) return { percorso: "Trauma" };
    if (/anafilassi/.test(text)) return { percorso: "Anafilassi" };
    if (/dispnea|bpco|asma|pneumotorace|embolia|respiratoria|edema polmonare/.test(text)) return { percorso: "Respiratorio" };
    if (/appendicite|colecistite|occlusione|perforazione|pancreatite|addome/.test(text)) return { percorso: "Addome acuto" };
    if (/shock/.test(text)) return { percorso: "Shock" };
    return { percorso: "Percorso generale PS" };
}

function aiObiettiviNascosti(percorso, sev) {
    const critico = sev >= 3;
    const base = [
        { id: "abcde", ruolo: "soccorritore", label: "ABCDE iniziale e monitoraggio precoce", due: 5, points: 3, critical: critico, keywords: ["abcde", "monitor", "monitoraggio"] },
        { id: "consegna", ruolo: "soccorritore", label: "Consegna SBAR completa", due: 10, points: 2, critical: false, keywords: ["sbar", "consegna", "preallerta"] },
        { id: "parametri", ruolo: "infermiere", label: "Parametri, dolore e priorita rivalutati", due: 10, points: 3, critical: critico, keywords: ["parametri", "dolore", "sorveglianza", "triage"] },
        { id: "accesso", ruolo: "infermiere", label: "Accesso venoso/prelievi se indicati", due: 15, points: 2, critical: false, keywords: ["accesso venoso", "prelievi"] },
        { id: "valutazione-medica", ruolo: "medico", label: "Valutazione medica con ipotesi e piano", due: 15, points: 3, critical: false, keywords: ["valutazione medica", "ipotesi", "differenziale", "piano"] }
    ];
    const specifici = {
        "SCA tempo-dipendente": [
            { id: "ecg-10", ruolo: "medico", label: "ECG o percorso cardiologico entro 10 minuti", due: 10, points: 5, critical: true, keywords: ["ecg", "cardiologico", "emodinamica"] },
            { id: "troponina", ruolo: "medico", label: "Troponina/enzimi cardiaci richiesti", due: 20, points: 3, critical: false, keywords: ["troponina"] },
            { id: "antiaggregante", ruolo: "medico", label: "Antiaggregante se coerente con il quadro", due: 25, points: 3, critical: false, keywords: ["asa", "antiaggregante", "acetilsalicilico"] }
        ],
        "Stroke tempo-dipendente": [
            { id: "glicemia", ruolo: "infermiere", label: "Glicemia e stato neurologico controllati", due: 10, points: 3, critical: true, keywords: ["glicemia", "gcs", "neurolog"] },
            { id: "tc-stroke", ruolo: "medico", label: "TC encefalo/stroke team entro 20 minuti", due: 20, points: 5, critical: true, keywords: ["tc encefalo", "stroke", "neurolog"] }
        ],
        "Sepsi": [
            { id: "lattati", ruolo: "medico", label: "EGA/lattati e fonte infettiva cercati", due: 20, points: 4, critical: true, keywords: ["ega", "lattati", "emocolture", "fonte"] },
            { id: "antibiotico", ruolo: "medico", label: "Antibiotico precoce se sepsi probabile", due: 30, points: 5, critical: true, keywords: ["antibiotico", "ceftriaxone", "piperacillina"] }
        ],
        "Trauma": [
            { id: "trauma-abc", ruolo: "soccorritore", label: "ABCDE trauma e immobilizzazione", due: 5, points: 4, critical: true, keywords: ["abcde", "immobilizzazione", "emorragia"] },
            { id: "trauma-imaging", ruolo: "medico", label: "Imaging/TC trauma se instabile o dinamica maggiore", due: 20, points: 4, critical: true, keywords: ["tc trauma", "total body", "rx", "ecografia"] }
        ],
        "Anafilassi": [
            { id: "adrenalina", ruolo: "medico", label: "Adrenalina se anafilassi riconosciuta", due: 5, points: 6, critical: true, keywords: ["adrenalina"] },
            { id: "anafilassi-monitor", ruolo: "infermiere", label: "Monitoraggio respiratorio e accesso EV", due: 10, points: 3, critical: true, keywords: ["monitor", "accesso venoso", "ossigeno"] }
        ],
        "Respiratorio": [
            { id: "ossigeno", ruolo: "infermiere", label: "Ossigeno/supporto e saturazione rivalutati", due: 10, points: 4, critical: true, keywords: ["ossigeno", "saturazione", "bronco", "ventilatorio"] },
            { id: "rx-ega", ruolo: "medico", label: "RX torace/EGA coerenti con la dispnea", due: 20, points: 3, critical: false, keywords: ["rx torace", "ega", "tc torace"] }
        ],
        "Addome acuto": [
            { id: "addome-imaging", ruolo: "medico", label: "Ecografia/TC addome e chirurgia se indicata", due: 30, points: 4, critical: true, keywords: ["tc addome", "ecografia", "chirurg"] },
            { id: "addome-sepsi", ruolo: "infermiere", label: "Dolore, febbre e perfusione rivalutati", due: 15, points: 3, critical: false, keywords: ["dolore", "temperatura", "parametri"] }
        ],
        "Shock": [
            { id: "shock-fluidi", ruolo: "medico", label: "Shock riconosciuto e perfusione trattata", due: 10, points: 5, critical: true, keywords: ["fluidi", "noradrenalina", "lattati", "shock"] }
        ]
    };
    return base.concat(specifici[percorso] || [
        { id: "rivalutazione", ruolo: "medico", label: "Rivalutazione documentata dopo esami/terapia", due: 25, points: 3, critical: critico, keywords: ["rivalutazione", "parametri", "dolore"] }
    ]);
}

function aiEventiTempo(percorso, sev) {
    const base = [
        { id: "rivalutazione-20", minuto: 20, titolo: "Rivalutazione mancata", descrizione: "Il tempo passa senza una rivalutazione chiara: aumenta il rischio clinico.", required: ["parametri", "rivalutazione", "sorveglianza"], delta: { fc: 4, fr: 1, dolore: 1 }, critical: sev >= 3 }
    ];
    const specifici = {
        "SCA tempo-dipendente": [
            { id: "ritardo-ecg", minuto: 10, titolo: "Ritardo ECG", descrizione: "Nel dolore toracico il mancato ECG precoce ritarda il percorso tempo-dipendente.", required: ["ecg"], delta: { fc: 8, sys: -4, dolore: 1 }, critical: true },
            { id: "ritardo-sca", minuto: 30, titolo: "Dolore toracico persistente", descrizione: "Senza percorso cardiologico il quadro resta instabile.", required: ["cardiologico", "emodinamica", "antiaggregante"], delta: { fc: 8, sat: -1, dolore: 2 }, critical: true }
        ],
        "Stroke tempo-dipendente": [
            { id: "ritardo-stroke", minuto: 20, titolo: "Ritardo percorso stroke", descrizione: "Il tempo di ischemia aumenta: il deficit neurologico peggiora.", required: ["tc encefalo", "stroke", "neurolog"], delta: { gcs: -1, sys: 4 }, critical: true }
        ],
        "Sepsi": [
            { id: "ritardo-sepsi", minuto: 30, titolo: "Sepsi non controllata", descrizione: "Senza lattati/antibiotico la perfusione peggiora progressivamente.", required: ["lattati", "antibiotico", "emocolture"], delta: { fc: 10, sys: -10, temp: 0.4, gcs: -1 }, critical: true }
        ],
        "Trauma": [
            { id: "ritardo-trauma", minuto: 15, titolo: "Trauma non stabilizzato", descrizione: "Dinamica e lesioni non inquadrate: dolore e instabilita aumentano.", required: ["abcde", "immobilizzazione", "tc trauma", "ecografia"], delta: { fc: 8, sys: -8, dolore: 1 }, critical: true }
        ],
        "Anafilassi": [
            { id: "ritardo-adrenalina", minuto: 5, titolo: "Anafilassi non trattata", descrizione: "Senza adrenalina precoce peggiorano respiro e pressione.", required: ["adrenalina"], delta: { sat: -5, fr: 5, sys: -14, gcs: -1 }, critical: true }
        ],
        "Respiratorio": [
            { id: "ritardo-respiro", minuto: 10, titolo: "Supporto respiratorio insufficiente", descrizione: "La desaturazione non corretta aumenta la fatica respiratoria.", required: ["ossigeno", "bronco", "ventilatorio", "ega"], delta: { sat: -4, fr: 5, fc: 6 }, critical: true }
        ],
        "Addome acuto": [
            { id: "ritardo-addome", minuto: 30, titolo: "Addome evolutivo", descrizione: "Senza imaging/valutazione chirurgica il dolore e la risposta infiammatoria aumentano.", required: ["tc addome", "ecografia", "chirurg", "antibiotico"], delta: { dolore: 2, fc: 7, temp: 0.3 }, critical: true }
        ],
        "Shock": [
            { id: "ritardo-shock", minuto: 10, titolo: "Shock non corretto", descrizione: "Perfusione non trattata: pressione e coscienza peggiorano.", required: ["fluidi", "noradrenalina", "lattati"], delta: { sys: -14, fc: 12, gcs: -1 }, critical: true }
        ]
    };
    return base.concat(specifici[percorso] || []);
}

function aiBackendEnabled() {
    return false;
}

function aiSetBackendEnabled(value) {
    localStorage.setItem("aiBackendEnabled", "false");
    render();
}

async function aiBackendRequest(kind, payload) {
    throw new Error("Simulatore offline attivo");
}

function aiPatientSystemPrompt(s) {
    const a = s.anagrafica || {};
    const farmaci = (a.farmaciDomiciliari || []).map(f => `${f.nome} ${f.dose}, ${f.frequenza}, per ${f.motivo}`).join("; ") || "nessuna terapia domiciliare riferita";
    return [
        "Sei un paziente simulato in un portale didattico ospedaliero.",
        "Devi restare nel ruolo del paziente, non del medico.",
        "Non rivelare mai diagnosi nascosta, differenziali, red flags progettuali, score, obiettivi didattici o risposte attese.",
        "Non interpretare referti e non decidere terapie. Se chiesto, rispondi che conosci solo cio che senti o ricordi.",
        "Rispondi in modo sensato anche a domande vaghe, stupide, incomplete o colloquiali: chiedi chiarimento oppure rispondi con quello che il paziente capirebbe davvero.",
        "Conosci bene i tuoi dati personali, ma puoi essere incerto su nomi/dosi dei farmaci se la personalita o il quadro lo rendono plausibile.",
        "Rispondi in italiano, in prima persona, in modo realistico e coerente con stato, personalita e gravita.",
        "Se il paziente e confuso, agitato, dolorante o spaventato, rendilo evidente senza impedire del tutto l'intervista.",
        `Paziente: ${s.nome} ${s.cognome}, ${s.eta} anni, sesso ${s.sesso}, personalita ${s.personalita}.`,
        `Data e luogo di nascita: ${a.dataNascita || ""}, ${a.luogoNascita || ""}. Codice fiscale: ${a.codiceFiscale || ""}.`,
        `Residenza: ${a.indirizzo || ""}, ${a.comuneResidenza || ""}. Professione: ${a.professione || ""}.`,
        `Contatto: ${a.contatto || ""}. Allergie: ${a.allergie || "non note"}.`,
        `Patologie note: ${(a.patologieRemote || []).join(", ")}. Farmaci domiciliari: ${farmaci}.`,
        `Abitudini/contesto: ${a.abitudini || ""}. Ultimo pasto: ${a.ultimoPasto || ""}.`,
        `Sintomi percepiti: ${(s.sintomi || []).join(", ")}.`,
        `Gravita simulata: ${s.difficolta}, parametri: FC ${s.parametri?.fc}, FR ${s.parametri?.fr}, SpO2 ${s.parametri?.sat}, PA ${s.parametri?.pa}, dolore ${s.parametri?.dolore}/10.`,
        `Informazione nascosta per coerenza, da non dichiarare: ${s.diagnosiNascosta}.`
    ].join("\n");
}

async function aiRispostaPazienteSmart(s, domanda) {
    s.aiRealeUltimoUso = false;
    s.aiErrore = "";
    return aiRispostaPaziente(s, domanda);
}

function aiScenarioSafeForBackend(s) {
    return {
        nome: s.nome,
        eta: s.eta,
        sesso: s.sesso,
        tipo: s.tipo,
        area: s.area,
        ingresso: s.ingresso,
        difficolta: s.difficolta,
        codice: s.codice,
        personalita: s.personalita,
        anagrafica: s.anagrafica,
        sintomi: s.sintomi,
        parametri: s.parametri,
        diagnosiNascosta: s.diagnosiNascosta
    };
}

function aiGeneraCaso() {
    if (!hasPermission("all")) {
        alert("Solo l'amministratore puo generare nuovi casi clinici.");
        return;
    }
    const area = fieldValue("aiArea") || "Pronto Soccorso";
    const difficolta = fieldValue("aiDifficolta") || "media";
    const ingresso = fieldValue("aiIngresso") || "118";
    const quadriCompatibili = AI_SIM_QUADRI.filter(q => area === "Qualsiasi" || q.area === area || (area === "Pronto Soccorso" && q.area !== "118"));
    const quadro = { ...aiRnd(quadriCompatibili.length ? quadriCompatibili : AI_SIM_QUADRI) };
    quadro.diagnosiScelta = aiRnd(quadro.diagnosi);
    const sev = aiSeverityWeight(difficolta);
    const eta = Math.floor(18 + Math.random() * 72);
    const sesso = Math.random() > 0.5 ? "M" : "F";
    const nome = aiRnd(AI_SIM_NOMI);
    const cognome = aiRnd(AI_SIM_COGNOMI);
    const sintomi = aiPickMany(quadro.sintomi, 3, Math.min(5, quadro.sintomi.length));
    const redFlags = aiPickMany(quadro.redFlags, sev >= 3 ? 2 : 1, Math.min(sev + 1, quadro.redFlags.length));
    const parametri = aiParametriIniziali(sev, quadro);
    const blueprint = aiScenarioBlueprint(quadro, quadro.diagnosiScelta, sev);
    const anagrafica = aiAnagraficaScenario(nome, cognome, eta, sesso, quadro, quadro.diagnosiScelta);
    const scenario = {
        id: id(),
        creato: aiNow(),
        stato: "In corso",
        area,
        ingresso,
        difficolta,
        severity: sev,
        score: 0,
        nome,
        cognome,
        eta,
        sesso,
        anagrafica,
        codice: aiCodiceBySeverity(sev),
        tipo: quadro.tipo,
        diagnosiNascosta: quadro.diagnosiScelta,
        diagnosiDifferenziali: aiPickMany(quadro.diagnosi.filter(d => d !== quadro.diagnosiScelta), 2, Math.min(4, quadro.diagnosi.length - 1)),
        sintomi,
        redFlags,
        esamiAttesi: quadro.esami,
        percorso: blueprint.percorso,
        obiettiviDidattici: blueprint.obiettiviDidattici,
        obiettiviNascosti: blueprint.obiettiviNascosti,
        erroriCritici: blueprint.erroriCritici,
        trattamentiAttesi: blueprint.trattamentiAttesi,
        trattamentiDannosi: blueprint.trattamentiDannosi,
        criteriMiglioramento: blueprint.criteriMiglioramento,
        criteriPeggioramento: blueprint.criteriPeggioramento,
        evoluzione: blueprint.evoluzione,
        eventiTempo: blueprint.eventiTempo,
        eventiTempoApplicati: [],
        erroriRilevati: [],
        minutiSimulati: 0,
        modalitaEsame: false,
        personalita: aiRnd(AI_SIM_PERSONALITA),
        parametri,
        pazienteId: "",
        timeline: [
            { time: aiNow(), fase: "Generazione", testo: `Caso generato: ${quadro.tipo}, accesso ${ingresso}, codice ${aiCodiceBySeverity(sev)}.` },
            { time: aiNow(), fase: "118", testo: aiTestoChiamata118(nome, cognome, quadro, sintomi, sev) }
        ],
        chat: [],
        esami: [],
        terapie: [],
        valutazioni: [],
        eventiRegia: [],
        aiRealeUltimoUso: false,
        aiErrore: "",
        compitiSvolti: []
    };
    scenario.chat.push({ from: "paziente", time: aiNow(), text: aiPresentazionePaziente(scenario) });
    const sims = aiSimLoad();
    sims.unshift(scenario);
    aiSimSave(sims);
    aiSimSelezionata = scenario.id;
    localStorage.setItem("aiSimSelezionata", aiSimSelezionata);
    logAction(`Generato caso IA: ${scenario.tipo}, codice ${scenario.codice}, difficolta ${scenario.difficolta}`);
    aiCreaPazienteDaScenario(scenario.id, { navigate: false, silent: true });
    render();
}

function aiTestoChiamata118(nome, cognome, quadro, sintomi, sev) {
    const luogo = aiRnd(["domicilio", "strada", "ambulatorio", "luogo di lavoro", "impianto sportivo", "RSA"]);
    const chiamante = aiRnd(["familiare", "collega", "passante", "medico curante", "operatore sanitario"]);
    const urgenza = sev >= 3 ? "Il chiamante riferisce peggioramento rapido e chiede invio urgente." : "Il chiamante riferisce quadro stabile ma da valutare.";
    return `Chiamata da ${chiamante}, luogo: ${luogo}. Paziente ${nome} ${cognome}, sintomi principali: ${sintomi.join(", ")}. ${urgenza} Scenario sospetto: ${quadro.tipo}.`;
}

function aiPresentazionePaziente(s) {
    const tono = {
        collaborante: "Riesco a rispondere, mi dica.",
        ansioso: "Ho paura, non capisco cosa mi stia succedendo.",
        reticente: "Non so, preferirei non parlare troppo.",
        confuso: "Mi sento strano, faccio fatica a ricordare bene.",
        dolorante: "Mi fa molto male, faccio fatica a concentrarmi.",
        agitato: "Non riesco a stare fermo, mi manca il controllo.",
        stanco: "Sono molto debole, rispondo piano.",
        spaventato: "Sono spaventato, mi dica che succede."
    }[s.personalita] || "Mi dica.";
    return `${tono} Sono ${s.nome} ${s.cognome}, ho ${s.eta} anni. Il problema principale e ${s.sintomi.slice(0, 2).join(" e ")}.`;
}

function aiTrovaScenario(idScenario = aiSimSelezionata) {
    return aiSimLoad().find(s => s.id === idScenario);
}

function aiAggiornaScenario(updated) {
    const sims = aiSimLoad().map(s => s.id === updated.id ? updated : s);
    aiSimSave(sims);
}

function aiSeleziona(idScenario) {
    aiSimSelezionata = idScenario;
    localStorage.setItem("aiSimSelezionata", idScenario);
    render();
}

function aiCreaPazienteDaScenario(idScenario = aiSimSelezionata, options = {}) {
    const s = aiTrovaScenario(idScenario);
    if (!s) return;
    if (s.pazienteId) {
        pazienteSelezionato = pazienti.find(p => p.id === s.pazienteId) || pazienteSelezionato;
        if (options.navigate !== false) {
            pagina = "cartella";
            render();
        }
        return;
    }
    if (!hasPermission("all")) {
        alert("Solo l'amministratore puo trasformare un caso IA in paziente operativo.");
        return;
    }
    const p = {
        id: id(),
        nome: s.nome,
        cognome: s.cognome,
        eta: s.eta,
        sesso: s.sesso,
        dataNascita: s.anagrafica?.dataNascita || "",
        luogoNascita: s.anagrafica?.luogoNascita || "",
        residenza: `${s.anagrafica?.indirizzo || ""}, ${s.anagrafica?.comuneResidenza || ""}`.replace(/^, /, ""),
        cf: s.anagrafica?.codiceFiscale || `SIM${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`,
        codice: s.codice,
        motivo: `${s.tipo}: ${s.sintomi.join(", ")}`,
        reparto: "ps",
        parametri: { ...s.parametri },
        parametriHistory: [{ time: aiNow(), ...s.parametri, operatore: medicoLoggato?.nome || "Simulatore IA" }],
        esami: [],
        terapie: [],
        log: [],
        aiScenarioId: s.id,
        simulazioneIA: true,
        diagnosiNascosta: s.diagnosiNascosta,
        clinica: {
            allergie: s.anagrafica?.allergie || "",
            terapiaDomiciliare: (s.anagrafica?.farmaciDomiciliari || []).map(f => `${f.nome} ${f.dose} ${f.frequenza}`).join("; "),
            anamnesi: (s.anagrafica?.patologieRemote || []).join(", "),
            esameObiettivo: "",
            diagnosiDifferenziale: "",
            piano: "",
            decisione: "Osservazione",
            destinazione: "",
            followUp: ""
        }
    };
    ensurePaziente(p);
    pazienti.push(p);
    s.pazienteId = p.id;
    s.timeline.push({ time: aiNow(), fase: "PS", testo: "Paziente accettato in Pronto Soccorso e collegato alla cartella clinica." });
    aiAggiornaScenario(s);
    logAction(`Caso IA accettato in PS: ${p.nome} ${p.cognome}`);
    salva();
    pazienteSelezionato = p;
    if (options.navigate !== false) {
        pagina = "cartella";
        render();
    }
}

function aiScenarioDaCartella() {
    if (!pazienteSelezionato?.aiScenarioId) return null;
    return aiTrovaScenario(pazienteSelezionato.aiScenarioId);
}

function aiScenarioOperativo() {
    return aiScenarioDaCartella() || aiTrovaScenario();
}

async function aiInviaDomanda() {
    const s = aiScenarioOperativo();
    if (!s) return;
    const domanda = fieldValue("aiDomanda");
    if (!domanda) return;
    s.chat.push({ from: "operatore", time: aiNow(), text: domanda, operatore: medicoLoggato?.nome || "" });
    s.chat.push({ from: "paziente", time: aiNow(), text: "..." });
    aiAggiornaScenario(s);
    render();
    const risposta = await aiRispostaPazienteSmart(s, domanda);
    s.chat[s.chat.length - 1] = { from: "paziente", time: aiNow(), text: risposta, motore: s.aiRealeUltimoUso ? "IA reale" : "fallback locale" };
    s.timeline.push({ time: aiNow(), fase: "Intervista", testo: `Domanda operatore: ${domanda}` });
    s.score += aiScoreDomanda(domanda);
    aiAggiornaScenario(s);
    render();
}

function aiDomandePerRuolo() {
    const ruolo = medicoLoggato?.ruolo || "medico";
    if (ruolo === "soccorritore") return AI_SIM_DOMANDE.soccorritore;
    if (ruolo === "infermiere") return AI_SIM_DOMANDE.infermiere;
    return AI_SIM_DOMANDE.medico;
}

function aiCompitiPerRuolo() {
    const ruolo = medicoLoggato?.ruolo || "medico";
    if (ruolo === "soccorritore") return AI_SIM_COMPITI.soccorritore;
    if (ruolo === "infermiere") return AI_SIM_COMPITI.infermiere;
    return AI_SIM_COMPITI.medico;
}

function aiChiediPreimpostata(idDomanda) {
    const s = aiScenarioOperativo();
    if (!s) return;
    const parts = String(idDomanda || "").split(":");
    const ruolo = parts.length > 1 ? parts[0] : (medicoLoggato?.ruolo || "medico");
    const key = parts.length > 1 ? parts[1] : idDomanda;
    const domanda = (AI_SIM_DOMANDE[ruolo] || AI_SIM_DOMANDE.medico).find(d => d.id === key);
    if (!domanda) return;
    s.chat.push({ from: "operatore", time: aiNow(), text: domanda.domanda, operatore: medicoLoggato?.nome || "", tipo: domanda.label });
    s.chat.push({ from: "paziente", time: aiNow(), text: aiRispostaPaziente(s, domanda.domanda), motore: "simulatore offline" });
    s.timeline.push({ time: aiNow(), fase: "Intervista guidata", testo: `${medicoLoggato?.nome || "Operatore"}: ${domanda.label}` });
    s.score += aiScoreDomanda(domanda.domanda);
    aiAggiornaScenario(s);
    render();
}

function aiRegistraCompito(idCompito) {
    const s = aiScenarioOperativo();
    if (!s) return;
    const compito = [...AI_SIM_COMPITI.soccorritore, ...AI_SIM_COMPITI.infermiere, ...AI_SIM_COMPITI.medico].find(c => c.id === idCompito);
    if (!compito) return;
    if (!s.compitiSvolti) s.compitiSvolti = [];
    const ruolo = medicoLoggato?.ruolo || "operatore";
    s.compitiSvolti.unshift({
        id: id(),
        key: `${ruolo}:${idCompito}`,
        label: compito.label,
        effetto: compito.effetto,
        ruolo,
        operatore: medicoLoggato?.nome || "",
        time: aiNow()
    });
    s.timeline.push({ time: aiNow(), fase: `Compito ${ruolo}`, testo: compito.effetto });
    s.score += 2;
    const effetto = aiEffettoDaCompito(s, compito, ruolo);
    if (effetto) {
        aiRegistraEsitoClinico(s, effetto.titolo, effetto.descrizione, effetto.delta, `Compito ${ruolo}`);
    } else if (/parametri|monitor|sorveglianza|abcde/i.test(compito.label + compito.effetto)) {
        aiPropagaParametriAlPaziente(s, compito.label);
    }
    aiAggiornaScenario(s);
    render();
}

function aiEffettoDaCompito(s, compito, ruolo) {
    const text = `${compito.label} ${compito.effetto}`.toLowerCase();
    const dx = `${s.tipo || ""} ${s.diagnosiNascosta || ""}`.toLowerCase();
    if (/abcde|monitor/.test(text)) {
        return { titolo: "Stabilizzazione iniziale", descrizione: "Valutazione strutturata: peggioramenti intercettati prima, lieve stabilizzazione del quadro.", delta: { fc: -2, fr: -1, sat: 1, gcs: 0 } };
    }
    if (/preallerta|sbar|consegna/.test(text)) {
        s.score += 2;
        return { titolo: "Tempo-dipendenza migliorata", descrizione: "Passaggio informazioni efficace: il percorso successivo sara piu rapido.", delta: {} };
    }
    if (/triage/.test(text)) {
        return { titolo: "Priorita riconosciuta", descrizione: "Rischio evolutivo meglio inquadrato, utile per evitare ritardi.", delta: {} };
    }
    if (/parametri|dolore|sorveglianza/.test(text)) {
        return { titolo: "Rivalutazione infermieristica", descrizione: "Monitoraggio attivo: risposta clinica osservata e rischio ridotto.", delta: { fc: -2, fr: -1, dolore: -1 } };
    }
    if (/prelievi|ecg/.test(text)) {
        s.score += /stemi|nstemi|dolore toracico|ictus|sepsi|shock/.test(dx) ? 2 : 1;
        return { titolo: "Diagnostica anticipata", descrizione: "Esami chiave predisposti: migliorano tempestivita e debrief.", delta: {} };
    }
    if (/accesso venoso/.test(text)) {
        return { titolo: "Accesso venoso disponibile", descrizione: "Il paziente e pronto per terapia EV e prelievi rapidi.", delta: { sys: /shock|sepsi|emorrag/.test(dx) ? 3 : 0 } };
    }
    return null;
}

function aiRegistraEsitoClinico(s, titolo, descrizione, delta, source = "simulatore") {
    if (!s) return;
    if (!s.andamento) s.andamento = [];
    s.andamento.unshift({
        id: id(),
        time: aiNow(),
        titolo,
        descrizione,
        delta,
        source,
        operatore: medicoLoggato?.nome || ""
    });
    s.timeline.push({ time: aiNow(), fase: "Evoluzione clinica", testo: `${titolo}: ${descrizione}` });
    s.parametri = aiApplicaDeltaParametri(s.parametri, delta);
    s.severity = aiSeverityFromParams(s.parametri, s.severity);
    s.codice = aiCodiceBySeverity(s.severity);
    aiPropagaParametriAlPaziente(s, titolo);
    aiAggiornaScenario(s);
}

function aiScenarioLogText(s) {
    return [
        ...(s.chat || []).map(m => m.text),
        ...(s.compitiSvolti || []).map(c => `${c.label} ${c.effetto}`),
        ...(s.esami || []).map(e => `${e.nome} ${e.referto || ""}`),
        ...(s.terapie || []).map(t => `${t.azione} ${t.effetto}`),
        ...(s.eventiRegia || []).map(e => `${e.testo} ${e.effetto || ""}`),
        ...(s.timeline || []).map(t => `${t.fase} ${t.testo}`)
    ].join(" ").toLowerCase();
}

function aiObiettivoCompletato(s, obiettivo) {
    const logText = aiScenarioLogText(s);
    return (obiettivo.keywords || []).some(k => logText.includes(String(k).toLowerCase()));
}

function aiStatoObiettivi(s) {
    const minuti = Number(s.minutiSimulati || 0);
    return (s.obiettiviNascosti || []).map(o => {
        const done = aiObiettivoCompletato(s, o);
        const missed = !done && minuti >= Number(o.due || 0);
        return { ...o, done, missed };
    });
}

function aiEventoSoddisfatto(s, evento) {
    const logText = aiScenarioLogText(s);
    return (evento.required || []).some(k => logText.includes(String(k).toLowerCase()));
}

function aiRegistraErroreCritico(s, key, titolo, descrizione, delta = {}) {
    if (!s) return;
    if (!s.erroriRilevati) s.erroriRilevati = [];
    if (s.erroriRilevati.some(e => e.key === key)) return;
    s.erroriRilevati.unshift({
        id: id(),
        key,
        time: aiNow(),
        titolo,
        descrizione,
        operatore: medicoLoggato?.nome || ""
    });
    s.score = Math.max(0, Number(s.score || 0) - 3);
    aiRegistraEsitoClinico(s, titolo, descrizione, delta, "Errore critico");
}

function aiApplicaEventiTempo(s) {
    if (!s) return;
    if (!s.eventiTempoApplicati) s.eventiTempoApplicati = [];
    const minuti = Number(s.minutiSimulati || 0);
    (s.eventiTempo || []).forEach(evento => {
        if (s.eventiTempoApplicati.includes(evento.id)) return;
        if (minuti < Number(evento.minuto || 0)) return;
        if (aiEventoSoddisfatto(s, evento)) {
            s.eventiTempoApplicati.push(evento.id);
            s.score += evento.critical ? 2 : 1;
            return;
        }
        s.eventiTempoApplicati.push(evento.id);
        aiRegistraErroreCritico(s, `timer:${evento.id}`, evento.titolo, `${evento.descrizione} Scadenza: ${evento.minuto} minuti.`, evento.delta);
    });
}

function aiRegistraObiettiviScaduti(s) {
    if (!s) return;
    aiStatoObiettivi(s).filter(o => o.missed && o.critical).forEach(o => {
        aiRegistraErroreCritico(
            s,
            `objective:${o.id}`,
            "Obiettivo critico mancato",
            `${o.label} non risulta completato entro ${o.due} minuti.`,
            { fc: 3, fr: 1, dolore: 1 }
        );
    });
}

function aiApplicaDeltaParametri(parametri, delta = {}) {
    const current = parametri || {};
    const sys = parseSistolica(current.pa);
    const nextSys = Math.max(65, Math.min(210, sys + (delta.sys || 0)));
    return {
        ...current,
        fc: String(Math.max(35, Math.min(190, Number(current.fc || 80) + (delta.fc || 0)))),
        fr: String(Math.max(6, Math.min(48, Number(current.fr || 16) + (delta.fr || 0)))),
        sat: String(Math.max(60, Math.min(100, Number(current.sat || 96) + (delta.sat || 0)))),
        pa: `${nextSys}/${Math.max(35, Math.min(125, Math.round(nextSys * 0.58)))}`,
        temp: String(Math.max(34, Math.min(42, Number(current.temp || 36.8) + (delta.temp || 0))).toFixed(1)),
        gcs: String(Math.max(3, Math.min(15, Number(current.gcs || 15) + (delta.gcs || 0)))),
        dolore: String(Math.max(0, Math.min(10, Number(current.dolore || 0) + (delta.dolore || 0))))
    };
}

function aiSeverityFromParams(parametri, fallback = 2) {
    const sat = Number(parametri?.sat || 98);
    const fc = Number(parametri?.fc || 80);
    const fr = Number(parametri?.fr || 16);
    const gcs = Number(parametri?.gcs || 15);
    const sys = parseSistolica(parametri?.pa);
    if (sat < 88 || sys < 85 || gcs <= 10 || fc > 145 || fr > 36) return 4;
    if (sat < 92 || sys < 95 || gcs < 14 || fc > 120 || fr > 28) return 3;
    if (sat < 95 || fc > 100 || fr > 22 || Number(parametri?.dolore || 0) >= 7) return 2;
    return Math.max(1, Math.min(4, fallback > 2 ? fallback - 1 : fallback));
}

function aiEffettoDaFarmaco(s, farmaco, note = "") {
    const text = `${farmaco || ""} ${note || ""}`.toLowerCase();
    const dx = `${s.tipo || ""} ${s.diagnosiNascosta || ""}`.toLowerCase();
    const sys = parseSistolica(s.parametri?.pa);
    const isResp = /dispnea|polmonite|bpco|asma|pneumotorace|respiratoria|embolia/.test(dx);
    const isInfect = /sepsi|polmonite|appendicite|colecistite|perforazione|meningo/.test(dx);
    const isCardio = /stemi|nstemi|infarto|edema polmonare|scompenso|cardiogeno/.test(dx);
    const isShock = /shock|sepsi|emorragico|anafilassi/.test(dx) || sys < 95;
    if (/morfina|fentanyl|ketorolac|paracetamolo|analges/i.test(text)) {
        const respPenalty = /morfina|fentanyl/.test(text) && isResp ? -1 : 0;
        return { titolo: "Analgesia", descrizione: respPenalty ? "Dolore ridotto, ma lieve rischio di depressione respiratoria da rivalutare." : "Dolore in riduzione con parametri piu controllati.", delta: { dolore: -3, fc: -5, fr: respPenalty ? 1 : -1, sat: respPenalty ? -1 : 0 } };
    }
    if (/salbutamolo|ipratropio|aerosol|bronco/.test(text)) {
        return isResp
            ? { titolo: "Broncodilatazione", descrizione: "Dispnea e scambi respiratori in miglioramento.", delta: { sat: 4, fr: -4, fc: 4, dolore: -1 } }
            : { titolo: "Broncodilatatore non mirato", descrizione: "Nessun beneficio clinico rilevante; possibile tachicardia.", delta: { fc: 8 } };
    }
    if (/ceftriaxone|piperacillina|tazobactam|amoxicillina|antibiot/.test(text)) {
        return isInfect
            ? { titolo: "Antibiotico appropriato", descrizione: "Terapia coerente: la stabilizzazione e attesa nel tempo, non immediata.", delta: { temp: -0.2, fc: -3, sys: 3 } }
            : { titolo: "Antibiotico non prioritario", descrizione: "Nessun effetto immediato sul quadro simulato.", delta: {} };
    }
    if (/ringer|nacl|fluidi|soluzione fisiologica|bolo/.test(text)) {
        if (/edema polmonare|scompenso/.test(dx)) return { titolo: "Fluidi dannosi", descrizione: "Peggioramento della congestione respiratoria.", delta: { sat: -3, fr: 3, sys: 4 }, erroreCritico: true };
        return isShock
            ? { titolo: "Fluidi efficaci", descrizione: "Perfusione in miglioramento dopo bolo e rivalutazione.", delta: { sys: 12, fc: -8, gcs: 1 } }
            : { titolo: "Fluidi", descrizione: "Modesto beneficio emodinamico, rivalutare sovraccarico.", delta: { sys: 5, fc: -2 } };
    }
    if (/nitro|nitroglicerina/.test(text)) {
        return sys < 105
            ? { titolo: "Nitrato non tollerato", descrizione: "Calo pressorio simulato: rivalutare indicazione e parametri.", delta: { sys: -18, fc: 8, gcs: -1 }, erroreCritico: true }
            : { titolo: "Nitrato", descrizione: "Dolore toracico e pressione in lieve riduzione.", delta: { sys: -10, dolore: -2, fc: -2 } };
    }
    if (/asa|acetilsalicilico|antiaggregante/.test(text)) {
        return isCardio
            ? { titolo: "Antiaggregante corretto", descrizione: "Percorso cardiologico supportato; nessun effetto immediato sui parametri.", delta: { dolore: -1 } }
            : { titolo: "Antiaggregante", descrizione: "Terapia registrata, beneficio dipendente dal sospetto clinico.", delta: {} };
    }
    if (/furosemide/.test(text)) {
        return /edema polmonare|scompenso/.test(dx)
            ? { titolo: "Diuretico efficace", descrizione: "Congestione in miglioramento graduale.", delta: { sat: 2, fr: -2, sys: -4 } }
            : { titolo: "Diuretico non mirato", descrizione: "Possibile calo pressorio se non indicato.", delta: { sys: -6, fc: 3 } };
    }
    if (/adrenalina/.test(text)) {
        return /anafilassi|arresto/.test(dx)
            ? { titolo: "Adrenalina appropriata", descrizione: "Miglioramento rapido di perfusione e quadro critico.", delta: { sys: 18, sat: 5, gcs: 2, fc: 8 } }
            : { titolo: "Adrenalina rischiosa", descrizione: "Tachicardia/ipertensione simulate: rivalutare indicazione.", delta: { fc: 18, sys: 15 }, erroreCritico: true };
    }
    if (/noradrenalina/.test(text)) {
        return isShock
            ? { titolo: "Vasopressore efficace", descrizione: "Pressione in miglioramento con necessita di monitoraggio stretto.", delta: { sys: 20, gcs: 1 } }
            : { titolo: "Vasopressore non indicato", descrizione: "Aumento pressorio non necessario.", delta: { sys: 14, fc: -2 }, erroreCritico: true };
    }
    if (/glucosio/.test(text)) {
        return /ipoglicemia/.test(dx)
            ? { titolo: "Glucosio efficace", descrizione: "Coscienza in rapido miglioramento.", delta: { gcs: 4, fc: -6 } }
            : { titolo: "Glucosio", descrizione: "Nessun cambiamento significativo nel caso simulato.", delta: {} };
    }
    return { titolo: "Terapia registrata", descrizione: "Effetto clinico non specifico: parametri invariati, rivalutare.", delta: {} };
}

function aiApplicaFarmacoDaCartella(p, terapia, source = "Terapia") {
    if (!p?.aiScenarioId || !terapia) return;
    const s = aiTrovaScenario(p.aiScenarioId);
    if (!s) return;
    const effetto = aiEffettoDaFarmaco(s, `${terapia.farmaco || ""} ${terapia.dose || ""} ${terapia.via || ""}`, terapia.note || "");
    aiRegistraEsitoClinico(s, effetto.titolo, effetto.descrizione, effetto.delta, source);
    if (effetto.erroreCritico) {
        aiRegistraErroreCritico(s, `farmaco:${effetto.titolo}:${Date.now()}`, effetto.titolo, effetto.descrizione, {});
    }
    s.terapie.unshift({
        id: id(),
        time: aiNow(),
        azione: `${terapia.farmaco || ""} ${terapia.dose || ""} ${terapia.via || ""}`.trim(),
        effetto: effetto.descrizione,
        operatore: medicoLoggato?.nome || ""
    });
    aiAggiornaScenario(s);
}

function aiCompitoSvolto(s, idCompito) {
    const ruolo = medicoLoggato?.ruolo || "operatore";
    return (s.compitiSvolti || []).some(c => c.key === `${ruolo}:${idCompito}`);
}

function aiRispostaPaziente(s, domanda) {
    const q = domanda.toLowerCase();
    const incerto = s.personalita === "confuso" ? " Non sono sicuro al cento per cento." : "";
    const a = s.anagrafica || {};
    const farmaci = a.farmaciDomiciliari || [];
    if (/come ti chiami|nome|cognome|chi sei/.test(q)) return `Mi chiamo ${s.nome} ${s.cognome}.`;
    if (/nato|nascita|data di nascita|anni|eta|età/.test(q)) return `Sono nato/a il ${a.dataNascita || "non ricordo la data precisa"} a ${a.luogoNascita || "non ricordo bene"}. Ho ${s.eta} anni.`;
    if (/codice fiscale|cf|document/.test(q)) return a.codiceFiscale ? `Il codice fiscale e ${a.codiceFiscale}.` : "Non lo ricordo, dovrei guardare il documento.";
    if (/dove abiti|residenza|indirizzo|casa/.test(q)) return `Abito in ${a.indirizzo || "non ricordo l'indirizzo preciso"}, ${a.comuneResidenza || ""}.`;
    if (/telefono|contatto|familiare|parente|chiamare/.test(q)) return `Potete contattare ${a.contatto || "un familiare, ma non ricordo il numero"}. Il mio telefono e ${a.telefono || "non lo ricordo"}.`;
    if (/lavor|professione|mestiere/.test(q)) return `Sono ${a.professione || "non ricordo se sto ancora lavorando"}.`;
    if (/farmac|terapia|medicine|assume|prende|pastiglie/.test(q)) {
        if (!farmaci.length) return "Non assumo farmaci abitualmente, almeno non che io ricordi.";
        return `A casa prendo ${farmaci.map(f => `${f.nome} ${f.dose} (${f.frequenza})`).join(", ")}.${incerto}`;
    }
    if (/patologie|malattie|anamnesi|diabete|pressione|cuore|polmon/.test(q)) return `So di avere: ${(a.patologieRemote || ["nessuna patologia nota"]).join(", ")}.${incerto}`;
    if (/allerg/.test(q)) return a.allergie ? `Allergie: ${a.allergie}.` : "Non ho allergie note.";
    if (/ultimo pasto|mangiato|bere|bevuto/.test(q)) return `Ho mangiato ${a.ultimoPasto || "non ricordo bene quando"}.`;
    if (/diagnosi|che cos|cosa ho|infarto|ictus|embolia|appendicite|sepsi|dissezione/i.test(q)) {
        return aiRnd([
            "Non lo so, io posso dirle solo come mi sento.",
            "Non saprei darle una diagnosi. Le posso descrivere i sintomi.",
            "Non sono un medico, sento solo che qualcosa non va."
        ]);
    }
    if (/referto|tac|rx|esame|troponina|lattati|ecg/i.test(q)) {
        return "Non conosco i risultati degli esami. Posso rispondere su sintomi, storia, dolore, farmaci, allergie e dinamica.";
    }
    if (/dolore|male|sede|dove/.test(q)) return `Il dolore/problema lo sento soprattutto come ${s.sintomi[0]}. Direi intensita ${s.parametri.dolore}/10.${incerto}`;
    if (/iniz|quando|tempo|ora/.test(q)) return `E iniziato ${aiRnd(["circa mezz'ora fa", "da alcune ore", "ieri sera", "improvvisamente", "progressivamente"])}. Mi sembra ${s.severity >= 3 ? "in peggioramento" : "abbastanza stabile"}.`;
    if (/respiro|dispnea|fiato/.test(q)) return s.sintomi.includes("dispnea") || /dispnea|respiratoria|polmonite|bpco|asma/i.test(s.diagnosiNascosta) ? "Mi manca il fiato, peggiora se mi muovo o parlo molto." : "Il respiro mi sembra abbastanza normale.";
    if (/petto|torace|braccio|schiena/.test(q)) return /STEMI|NSTEMI|Dissezione|Embolia|Pericardite|toracico/i.test(s.diagnosiNascosta + s.tipo) ? "Sento fastidio al torace, a tratti si irradia. Non riesco a trovare una posizione che lo faccia passare." : "Non ho un vero dolore al petto.";
    if (/vomito|nausea|addome|pancia/.test(q)) return /Appendicite|Colecistite|Occlusione|Perforazione|Pancreatite|addome/i.test(s.diagnosiNascosta + s.tipo) ? "Ho nausea e dolore alla pancia, peggiora quando mi muovo o mi toccano." : "Un po' di nausea, ma non e il problema principale.";
    if (/parla|forza|braccio|gamba|testa|cefalea/.test(q)) return /Ictus|Emorragia|TIA|epilettica|Meningo/i.test(s.diagnosiNascosta) ? "Mi sento strano, faccio fatica con un lato del corpo o con le parole." : "Non mi sembra di avere perdita di forza.";
    return aiRnd([
        `Non so bene come rispondere, ma il problema che sento e soprattutto ${s.sintomi.join(", ")}.${incerto}`,
        "Non so spiegarlo bene, ma mi sento peggio del solito.",
        "Mi faccia una domanda piu precisa e provo a rispondere.",
        s.severity >= 3 ? "Mi sento davvero male, sto peggiorando." : "Mi sento stabile, ma il disturbo non passa."
    ]);
}

function aiChatKeydown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        aiInviaDomanda();
    }
}

function aiScoreDomanda(domanda) {
    return /allerg|farmac|dolore|iniz|respiro|petto|neurolog|coscienza|trauma|febbre|anamnesi/i.test(domanda) ? 1 : 0;
}

function aiRichiediEsame() {
    const s = aiScenarioOperativo();
    if (!s) return;
    const nome = fieldValue("aiEsame");
    const referto = aiGeneraReferto(s, nome);
    const exam = {
        id: id(),
        time: aiNow(),
        nome,
        stato: "Refertato",
        referto,
        operatore: medicoLoggato?.nome || ""
    };
    s.esami.unshift(exam);
    s.timeline.push({ time: aiNow(), fase: "Diagnostica", testo: `Richiesto e refertato: ${nome}.` });
    if (s.pazienteId) {
        const p = pazienti.find(px => px.id === s.pazienteId);
        if (p) {
            ensurePaziente(p);
            p.esami.push({ id: exam.id, time: exam.time, nome, stato: "Refertato", esito: referto, operatore: exam.operatore, refertoAutomatico: true });
            salva();
        }
    }
    if ((s.esamiAttesi || []).some(e => nome.toLowerCase().includes(e.split(" ")[0].toLowerCase()))) s.score += 2;
    aiAggiornaScenario(s);
    if (typeof playClinicalSound === "function") playClinicalSound(s.severity >= 4 ? "critical" : "referto");
    render();
}

function aiGeneraReferto(s, nome) {
    const dx = s.diagnosiNascosta;
    const sev = s.severity;
    if (/ecg/i.test(nome)) {
        if (/STEMI/i.test(dx)) return "ECG: ritmo sinusale tachicardico. Sopraslivellamento ST in sede anteriore con alterazioni reciproche. Quadro compatibile con STEMI, attivare percorso tempo-dipendente.";
        if (/NSTEMI/i.test(dx)) return "ECG: sottoslivellamento ST e alterazioni aspecifiche della ripolarizzazione. Necessario confronto seriato con troponina.";
        if (/embolia/i.test(dx)) return "ECG: tachicardia sinusale, possibile pattern di sovraccarico destro. Correlare con clinica e imaging.";
        return "ECG: ritmo sinusale. Non segni di ischemia acuta maggiore nel tracciato simulato.";
    }
    if (/troponina/i.test(nome)) return /STEMI|NSTEMI/i.test(dx) ? `Troponina aumentata, andamento compatibile con danno miocardico acuto. Valore simulato: ${sev * 450 + Math.floor(Math.random() * 600)} ng/L.` : "Troponina nei limiti o non significativamente dinamica.";
    if (/ega|latt/i.test(nome)) return sev >= 3 ? `EGA: ipossiemia/alterazione ventilatoria proporzionata al quadro, lattati ${Math.max(2.2, sev + Math.random()).toFixed(1)} mmol/L.` : "EGA: scambi conservati, lattati nei limiti.";
    if (/emocromo|pcr|pct/i.test(nome)) return /sepsi|Polmonite|Appendicite|Colecistite|Perforazione|Meningo/i.test(dx) ? "Ematochimici: leucocitosi neutrofila, PCR/PCT aumentate. Quadro compatibile con flogosi/infezione clinicamente significativa." : "Ematochimici: emocromo senza alterazioni maggiori, indici di flogosi assenti o modesti.";
    if (/rx torace/i.test(nome)) {
        if (/Polmonite/i.test(dx)) return "RX torace: addensamento parenchimale basale, compatibile con focolaio broncopneumonico.";
        if (/Pneumotorace|costale/i.test(dx)) return "RX torace: falda di pneumotorace omolaterale, da correlare con clinica e stabilita.";
        if (/Edema/i.test(dx)) return "RX torace: congestione ilo-perilare bilaterale con segni di edema interstiziale.";
        return "RX torace: non evidenza di addensamenti acuti maggiori.";
    }
    if (/tc.*encefalo|encefalo/i.test(nome)) {
        if (/Emorragia/i.test(dx)) return "TC encefalo: area iperdensa compatibile con sanguinamento intracranico acuto. Indicata gestione neurologica/neurochirurgica urgente.";
        if (/Ictus|TIA/i.test(dx)) return "TC encefalo: non sanguinamenti acuti. Possibili segni precoci ischemici, indicato completamento percorso ictus.";
        return "TC encefalo: non evidenza di lesioni acute maggiori.";
    }
    if (/tc.*addome|addome/i.test(nome)) {
        if (/Appendicite/i.test(dx)) return "TC addome: appendice aumentata di calibro con imbibizione del grasso pericecale. Quadro compatibile con appendicite acuta.";
        if (/Perforazione/i.test(dx)) return "TC addome: aria libera endoperitoneale e versamento, quadro compatibile con perforazione viscerale.";
        if (/Occlusione/i.test(dx)) return "TC addome: distensione delle anse con livelli idroaerei e punto di transizione.";
        return "Imaging addominale: non reperti chirurgici maggiori nel caso simulato.";
    }
    if (/tc.*torace|angio/i.test(nome)) {
        if (/Embolia/i.test(dx)) return "Angio-TC torace: difetti di riempimento arteriosi polmonari compatibili con embolia polmonare.";
        if (/Dissezione/i.test(dx)) return "Angio-TC torace: flap intimale aortico compatibile con dissezione. Attivare percorso urgente.";
        return "TC torace: non evidenza di embolia/dissezione nel caso simulato.";
    }
    if (/rx|frattura|distretto/i.test(nome)) {
        if (/Frattura/i.test(dx)) return `RX: reperto compatibile con ${dx.toLowerCase()}, con tumefazione dei tessuti molli. Indicata valutazione ortopedica.`;
        if (/Lussazione/i.test(dx)) return "RX: perdita dei rapporti articolari compatibile con lussazione. Non evidenti fratture associate maggiori.";
        return "RX: non evidenza di fratture scomposte nei segmenti esaminati.";
    }
    return `Referto simulato coerente con ${s.tipo}: quadro ${sev >= 3 ? "potenzialmente evolutivo, richiede rivalutazione ravvicinata" : "senza reperti maggiori immediati"}.`;
}

function aiRegistraAzione() {
    const s = aiScenarioOperativo();
    if (!s) return;
    const azione = fieldValue("aiAzione");
    const effetto = aiApplicaEffetto(s, azione);
    s.terapie.unshift({ id: id(), time: aiNow(), azione, effetto, operatore: medicoLoggato?.nome || "" });
    s.timeline.push({ time: aiNow(), fase: "Trattamento", testo: `${azione}: ${effetto}` });
    if (s.pazienteId) {
        const p = pazienti.find(px => px.id === s.pazienteId);
        if (p) {
            ensurePaziente(p);
            p.terapie.push({ id: id(), time: aiNow(), farmaco: azione, dose: "simulazione", via: "", frequenza: "azione clinica", note: effetto, operatore: medicoLoggato?.nome || "" });
            p.parametri = { ...s.parametri };
            p.parametriHistory.push({ time: aiNow(), ...s.parametri, operatore: "Simulatore IA" });
            salva();
        }
    }
    aiAggiornaScenario(s);
    render();
}

function aiApplicaEffetto(s, azione) {
    const farmacoLike = aiEffettoDaFarmaco(s, azione, "");
    if (farmacoLike.titolo !== "Terapia registrata") {
        s.parametri = aiApplicaDeltaParametri(s.parametri, farmacoLike.delta);
        s.severity = aiSeverityFromParams(s.parametri, s.severity);
        s.codice = aiCodiceBySeverity(s.severity);
        return farmacoLike.descrizione;
    }
    const a = azione.toLowerCase();
    const giusta =
        (/ossigeno|ventilazione/i.test(a) && /dispnea|Polmonite|BPCO|Asma|respiratoria|Embolia|Pneumotorace/i.test(s.tipo + s.diagnosiNascosta)) ||
        (/antibiotico/i.test(a) && /sepsi|Polmonite|Appendicite|Colecistite|Meningo/i.test(s.diagnosiNascosta)) ||
        (/antiaggregante|asa|coronaro|emodinamica/i.test(a) && /STEMI|NSTEMI/i.test(s.diagnosiNascosta)) ||
        (/fluidi|noradrenalina|shock/i.test(a) && /Shock|sepsi|emorragico|Anafilassi/i.test(s.tipo + s.diagnosiNascosta)) ||
        (/chirurg|sala operatoria/i.test(a) && /Appendicite|Perforazione|Occlusione|Frattura femore/i.test(s.diagnosiNascosta)) ||
        (/ictus|stroke|trombolisi|neurolog/i.test(a) && /Ictus|TIA/i.test(s.diagnosiNascosta));
    const delta = giusta ? -1 : (s.severity >= 3 ? 1 : 0);
    s.score += giusta ? 3 : 0;
    const fc = Math.max(45, Number(s.parametri.fc || 80) + (giusta ? -8 : 5));
    const fr = Math.max(10, Number(s.parametri.fr || 16) + (giusta ? -3 : 2));
    const sat = Math.min(100, Math.max(70, Number(s.parametri.sat || 96) + (giusta ? 3 : -1)));
    const sys = Math.max(70, parseSistolica(s.parametri.pa) + (giusta ? 5 : -4));
    s.parametri = { ...s.parametri, fc: String(fc), fr: String(fr), sat: String(sat), pa: `${sys}/${Math.round(sys * 0.58)}` };
    s.severity = Math.max(1, Math.min(4, s.severity + delta));
    s.codice = aiCodiceBySeverity(s.severity);
    return giusta ? "Risposta clinica favorevole con parametri in miglioramento." : "Risposta non risolutiva; il quadro richiede rivalutazione e possibile peggioramento.";
}

const aiOriginalAddTerapia = typeof addTerapia === "function" ? addTerapia : null;
if (aiOriginalAddTerapia) {
    addTerapia = function aiAddTerapiaWrapper() {
        const p = pazienteSelezionato;
        const beforeCount = p?.terapie?.length || 0;
        aiOriginalAddTerapia();
        const after = p?.terapie || [];
        if (p?.aiScenarioId && after.length > beforeCount) {
            aiApplicaFarmacoDaCartella(p, after[after.length - 1], "Farmaco cartella");
            salva();
            render();
        }
    };
}

const aiOriginalSomministraFarmacoCatalogo = typeof somministraFarmacoCatalogo === "function" ? somministraFarmacoCatalogo : null;
if (aiOriginalSomministraFarmacoCatalogo) {
    somministraFarmacoCatalogo = function aiSomministraFarmacoCatalogoWrapper() {
        const p = pazienteSelezionato;
        const beforeCount = p?.terapie?.length || 0;
        aiOriginalSomministraFarmacoCatalogo();
        const after = p?.terapie || [];
        if (p?.aiScenarioId && after.length > beforeCount) {
            aiApplicaFarmacoDaCartella(p, after[after.length - 1], "Farmaco catalogo");
            salva();
            render();
        }
    };
}

function aiChiudiCaso() {
    const s = aiTrovaScenario();
    if (!s) return;
    const evalInfo = aiValutaCaso(s);
    const score = evalInfo.score;
    const esito = score >= 16 ? "Gestione eccellente" : score >= 10 ? "Gestione adeguata" : score >= 6 ? "Gestione incompleta" : "Gestione critica";
    s.stato = "Chiuso";
    s.debrief = {
        time: aiNow(),
        esito,
        diagnosi: s.diagnosiNascosta,
        score,
        puntiForti: evalInfo.puntiForti,
        criticita: evalInfo.criticita,
        testo: `Diagnosi nascosta: ${s.diagnosiNascosta}. Red flags attese: ${s.redFlags.join(", ")}. Esami chiave: ${s.esamiAttesi.join(", ")}. Valutazione: ${esito}.`
    };
    s.timeline.push({ time: aiNow(), fase: "Chiusura", testo: s.debrief.testo });
    aiAggiornaScenario(s);
    logAction(`Chiuso caso IA ${s.nome} ${s.cognome}: ${esito}`);
    render();
}

function aiValutaCaso(s) {
    const logText = aiScenarioLogText(s);
    const esamiOk = (s.esamiAttesi || []).filter(e => logText.includes(e.split(" ")[0].toLowerCase()));
    const trattamentiOk = (s.trattamentiAttesi || []).filter(t => logText.includes(t.split(" ")[0].toLowerCase()));
    const redFlagsCitate = (s.redFlags || []).filter(r => logText.includes(r.split(" ")[0].toLowerCase()));
    const obiettivi = aiStatoObiettivi(s);
    const obiettiviOk = obiettivi.filter(o => o.done);
    const obiettiviMancati = obiettivi.filter(o => o.missed);
    const errori = (s.erroriCritici || []).filter(e => {
        const key = e.split(" ")[1] || e.split(" ")[0];
        return logText.includes(key.toLowerCase()) && /dimissione precoce|ritardo|non |ignorare/i.test(e);
    });
    const erroriReali = s.erroriRilevati || [];
    const score = s.score
        + Math.min(8, esamiOk.length * 2)
        + Math.min(8, trattamentiOk.length * 2)
        + Math.min(6, redFlagsCitate.length * 2)
        + Math.min(14, obiettiviOk.reduce((tot, o) => tot + Number(o.points || 0), 0))
        - Math.min(10, obiettiviMancati.filter(o => o.critical).length * 3)
        - Math.min(10, erroriReali.length * 3)
        - Math.min(6, errori.length * 2);
    return {
        score,
        puntiForti: [
            esamiOk.length ? `Esami coerenti richiesti: ${esamiOk.join(", ")}` : "Esami chiave non ancora evidenti.",
            trattamentiOk.length ? `Azioni coerenti: ${trattamentiOk.join(", ")}` : "Trattamenti attesi non ancora evidenti.",
            redFlagsCitate.length ? `Red flags intercettate: ${redFlagsCitate.join(", ")}` : "Red flags non documentate chiaramente.",
            obiettiviOk.length ? `Obiettivi simulativi completati: ${obiettiviOk.map(o => o.label).slice(0, 4).join(", ")}` : "Nessun obiettivo nascosto ancora completato."
        ],
        criticita: [
            ...obiettiviMancati.filter(o => o.critical).map(o => `Scaduto: ${o.label} entro ${o.due} min`),
            ...erroriReali.map(e => `${e.titolo}: ${e.descrizione}`),
            ...(errori.length ? errori : (s.erroriCritici || []).slice(0, 3))
        ].slice(0, 8)
    };
}

function aiSalvaRegia() {
    const s = aiTrovaScenario();
    if (!s || !hasPermission("all")) return;
    s.diagnosiNascosta = fieldValue("aiAdminDiagnosi") || s.diagnosiNascosta;
    s.redFlags = aiSplitLines("aiAdminRedFlags");
    s.obiettiviDidattici = aiSplitLines("aiAdminObiettivi");
    s.erroriCritici = aiSplitLines("aiAdminErrori");
    s.trattamentiAttesi = aiSplitLines("aiAdminTrattamenti");
    s.trattamentiDannosi = aiSplitLines("aiAdminDannosi");
    s.timeline.push({ time: aiNow(), fase: "Regia", testo: "Scheda scenario aggiornata dall'amministratore." });
    aiAggiornaScenario(s);
    logAction(`Regia scenario aggiornata: ${s.nome} ${s.cognome}`);
    render();
}

function aiSplitLines(idCampo) {
    return fieldValue(idCampo).split(/\n|;/).map(v => v.trim()).filter(Boolean);
}

function aiLanciaEventoRegia() {
    const s = aiTrovaScenario();
    if (!s || !hasPermission("all")) return;
    const testo = fieldValue("aiAdminEvento");
    if (!testo) return;
    const effetto = fieldValue("aiAdminEffetto") || "evento narrativo";
    s.eventiRegia.unshift({ time: aiNow(), testo, effetto, operatore: medicoLoggato?.nome || "" });
    s.timeline.push({ time: aiNow(), fase: "Evento regia", testo: `${testo}. Effetto: ${effetto}` });
    if (/peggior|ipotensione|desatur|incosc|shock|arresto/i.test(`${testo} ${effetto}`)) {
        s.severity = Math.min(4, s.severity + 1);
        s.parametri = aiParametriDeteriorati(s.parametri);
    }
    if (/miglior|stabile|risponde|dolore ridotto/i.test(`${testo} ${effetto}`)) {
        s.severity = Math.max(1, s.severity - 1);
        s.parametri = aiParametriMigliorati(s.parametri);
    }
    s.codice = aiCodiceBySeverity(s.severity);
    aiPropagaParametriAlPaziente(s, "Evento regia");
    aiAggiornaScenario(s);
    render();
}

function aiParametriDeteriorati(p) {
    const sys = Math.max(65, parseSistolica(p.pa) - 12);
    return {
        ...p,
        fc: String(Math.min(170, Number(p.fc || 90) + 14)),
        fr: String(Math.min(42, Number(p.fr || 18) + 5)),
        sat: String(Math.max(72, Number(p.sat || 96) - 4)),
        pa: `${sys}/${Math.max(40, Math.round(sys * 0.58))}`,
        gcs: String(Math.max(3, Number(p.gcs || 15) - 1))
    };
}

function aiParametriMigliorati(p) {
    const sys = Math.min(145, parseSistolica(p.pa) + 8);
    return {
        ...p,
        fc: String(Math.max(55, Number(p.fc || 90) - 10)),
        fr: String(Math.max(12, Number(p.fr || 18) - 3)),
        sat: String(Math.min(100, Number(p.sat || 96) + 3)),
        pa: `${sys}/${Math.max(45, Math.round(sys * 0.6))}`,
        gcs: String(Math.min(15, Number(p.gcs || 15) + 1))
    };
}

function aiPropagaParametriAlPaziente(s, operatore) {
    if (!s.pazienteId) return;
    const p = pazienti.find(px => px.id === s.pazienteId);
    if (!p) return;
    ensurePaziente(p);
    p.codice = s.codice;
    p.parametri = { ...s.parametri };
    p.parametriHistory.push({ time: aiNow(), ...s.parametri, operatore });
    salva();
}

function aiAvanzaTempo() {
    const s = aiScenarioOperativo();
    if (!s) return;
    const log = [
        ...(s.compitiSvolti || []).map(c => c.label + " " + c.effetto),
        ...(s.terapie || []).map(t => t.azione + " " + t.effetto),
        ...(s.esami || []).map(e => e.nome)
    ].join(" ").toLowerCase();
    const protetto = /monitor|abcde|parametri|sorveglianza|ossigeno|fluidi|antibiotico|antiaggregante|ecg|prelievi|analgesia/.test(log);
    const critico = s.severity >= 3;
    let delta;
    let titolo;
    let descrizione;
    if (critico && !protetto) {
        delta = { fc: 12, fr: 4, sat: -3, sys: -8, gcs: -1, dolore: 1 };
        titolo = "Peggioramento temporale";
        descrizione = "Sono passati 10 minuti senza interventi chiave: il quadro peggiora.";
        s.score = Math.max(0, s.score - 2);
    } else if (protetto && critico) {
        delta = { fc: -5, fr: -2, sat: 2, sys: 4, dolore: -1 };
        titolo = "Stabilizzazione temporale";
        descrizione = "Gli interventi e la sorveglianza stanno contenendo il peggioramento.";
        s.score += 1;
    } else {
        delta = { fc: -1, fr: 0, sat: 0, sys: 0, dolore: 0 };
        titolo = "Tempo osservazionale";
        descrizione = "Quadro sostanzialmente stabile alla rivalutazione.";
    }
    if (!s.minutiSimulati) s.minutiSimulati = 0;
    s.minutiSimulati += 10;
    aiRegistraEsitoClinico(s, titolo, `${descrizione} Tempo simulato: ${s.minutiSimulati} minuti.`, delta, "Tempo clinico");
    aiApplicaEventiTempo(s);
    aiRegistraObiettiviScaduti(s);
    render();
}

function aiToggleEsame() {
    const s = aiTrovaScenario();
    if (!s || !hasPermission("all")) return;
    s.modalitaEsame = !s.modalitaEsame;
    s.timeline.push({
        time: aiNow(),
        fase: "Modalita esame",
        testo: s.modalitaEsame ? "Modalita esame attivata: gli aiuti operativi vengono nascosti agli operatori." : "Modalita esame disattivata: gli aiuti operativi sono di nuovo visibili."
    });
    aiAggiornaScenario(s);
    render();
}

function aiResetScenario(idScenario) {
    const sims = aiSimLoad().filter(s => s.id !== idScenario);
    aiSimSave(sims);
    if (aiSimSelezionata === idScenario) aiSimSelezionata = sims[0]?.id || "";
    localStorage.setItem("aiSimSelezionata", aiSimSelezionata);
    render();
}

function aiScenarioCard(s) {
    return `
        <article class="ai-case-card ${s.id === aiSimSelezionata ? "active" : ""}" onclick="aiSeleziona('${escapeHtml(s.id)}')">
            <div>
                <b>${escapeHtml(s.nome)} ${escapeHtml(s.cognome)}</b>
                <span>${escapeHtml(s.tipo)} - ${escapeHtml(s.area)}</span>
            </div>
            <em class="triage-dot triage-${triageClass(s.codice)}">${escapeHtml(s.codice)}</em>
            <small>${escapeHtml(s.stato)} - ${escapeHtml(s.difficolta)}</small>
        </article>
    `;
}

function aiObjectiveClass(o) {
    if (o.done) return "done";
    if (o.missed) return o.critical ? "missed critical" : "missed";
    return o.critical ? "critical" : "";
}

function aiAdminObjectivesHTML(s) {
    const obiettivi = aiStatoObiettivi(s);
    return `
        <div class="ai-objective-panel">
            <div class="panel-title-row">
                <div>
                    <p class="eyebrow">Regia nascosta</p>
                    <h4>Obiettivi e timer clinico</h4>
                </div>
                <span class="mini-count">${escapeHtml(s.modalitaEsame ? "esame" : "training")}</span>
            </div>
            <div class="ai-objective-grid">
                ${obiettivi.map(o => `
                    <article class="ai-objective-card ${aiObjectiveClass(o)}">
                        <div>
                            <b>${escapeHtml(o.label)}</b>
                            <span>${escapeHtml(ruoloInfo(o.ruolo || "medico").label)} - entro ${escapeHtml(o.due)} min - ${escapeHtml(o.points)} pt</span>
                        </div>
                        <small>${o.done ? "Completato" : o.missed ? "Scaduto" : o.critical ? "Critico" : "In attesa"}</small>
                    </article>
                `).join("")}
            </div>
        </div>
    `;
}

function aiRoleObjectivePanelHTML(s) {
    return "";
}

function aiSimulatoreView(app) {
    const sims = aiSimLoad();
    const selected = aiTrovaScenario() || sims[0];
    if (selected && !aiSimSelezionata) aiSimSelezionata = selected.id;
    app.innerHTML = `
        <div class="page-header clean-header">
            <div>
                <p class="eyebrow">Area amministratore</p>
                <h2>Creazione casi clinici IA</h2>
            </div>
            <div class="header-actions">
                <span class="operator-chip">${escapeHtml(medicoLoggato.nome)} - ${escapeHtml(ruoloInfo(medicoLoggato.ruolo).label)}</span>
                <button onclick="aiGeneraCaso()">Genera caso</button>
            </div>
        </div>
        <section class="work-panel ai-backend-status">
            <div>
                <b>Motore simulazione offline</b>
                <span>Nessuna API, nessun costo, nessun Terminale: domande guidate, risposte locali, referti e debrief generati dal caso clinico.</span>
            </div>
        </section>
        <section class="work-panel ai-generator">
            <div class="panel-title-row">
                <h3>Generatore amministratore</h3>
                <span class="mini-count">crea paziente + cartella</span>
            </div>
            <div class="form-grid compact">
                <label>Area
                    <select id="aiArea">
                        <option>Qualsiasi</option>
                        ${AI_SIM_AREE.map(a => `<option>${escapeHtml(a)}</option>`).join("")}
                    </select>
                </label>
                <label>Difficolta
                    <select id="aiDifficolta">
                        <option value="facile">Facile</option>
                        <option value="media" selected>Media</option>
                        <option value="avanzata">Avanzata</option>
                        <option value="critica">Critica</option>
                    </select>
                </label>
                <label>Ingresso
                    <select id="aiIngresso">
                        <option>118</option>
                        <option>Triage PS</option>
                        <option>Reparto</option>
                        <option>Trasferimento</option>
                    </select>
                </label>
            </div>
        </section>
        <div class="ai-layout">
            <section class="work-panel ai-case-list">
                <div class="panel-title-row">
                    <h3>Casi attivi</h3>
                    <span class="mini-count">${sims.length}</span>
                </div>
                ${sims.length ? sims.map(aiScenarioCard).join("") : `<div class="empty-state">Nessun caso generato.</div>`}
            </section>
            ${selected ? aiScenarioAdminDetail(selected) : `<section class="work-panel"><div class="empty-state">Genera un caso per iniziare.</div></section>`}
        </div>
    `;
    ensureSessionBar();
    aggiornaSidebarPermessi();
}

function aiScenarioAdminDetail(s) {
    const p = s.pazienteId ? pazienti.find(px => px.id === s.pazienteId) : null;
    const evalInfo = aiValutaCaso(s);
    return `
        <section class="work-panel ai-case-detail">
            <div class="ai-patient-head">
                <div>
                    <p class="eyebrow">${escapeHtml(s.ingresso)} / ${escapeHtml(s.area)}</p>
                    <h3>${escapeHtml(s.nome)} ${escapeHtml(s.cognome)}, ${escapeHtml(s.eta)} anni</h3>
                    <span>${escapeHtml(s.tipo)} - codice ${escapeHtml(s.codice)} - ${escapeHtml(s.difficolta)}</span>
                </div>
                <div class="ai-head-actions">
                    <button onclick="aiToggleEsame()">${s.modalitaEsame ? "Termina esame" : "Avvia esame"}</button>
                    <button onclick="aiCreaPazienteDaScenario()">Apri cartella</button>
                    <button onclick="aiChiudiCaso()" ${s.stato === "Chiuso" ? "disabled" : ""}>Chiudi caso</button>
                    <button onclick="aiResetScenario('${escapeHtml(s.id)}')">Elimina</button>
                </div>
            </div>
            <div class="ai-admin-compact">
                <div><b>Cartella</b><span>${p ? `${escapeHtml(p.nome)} ${escapeHtml(p.cognome)} in ${escapeHtml(labelReparto(p.reparto))}` : "Non ancora collegata"}</span></div>
                <div><b>Percorso / tempo</b><span>${escapeHtml(s.percorso || "Percorso generale")} - ${escapeHtml(s.minutiSimulati || 0)} minuti simulati - ${s.modalitaEsame ? "modalita esame" : "training"}</span></div>
                <div><b>Diagnosi nascosta</b><span>${escapeHtml(s.diagnosiNascosta)}</span></div>
                <div><b>Differenziali</b><span>${escapeHtml((s.diagnosiDifferenziali || []).join(", "))}</span></div>
                <div><b>Red flags</b><span>${escapeHtml((s.redFlags || []).join(", "))}</span></div>
            </div>
            ${aiAdminObjectivesHTML(s)}
            <div class="ai-admin-tabs">
                <section class="ai-box">
                    <h4>Regia scenario</h4>
                    <label>Diagnosi nascosta<input id="aiAdminDiagnosi" value="${escapeHtml(s.diagnosiNascosta)}"></label>
                    <label>Red flags<textarea id="aiAdminRedFlags">${escapeHtml((s.redFlags || []).join("\n"))}</textarea></label>
                    <label>Obiettivi didattici<textarea id="aiAdminObiettivi">${escapeHtml((s.obiettiviDidattici || []).join("\n"))}</textarea></label>
                    <label>Errori critici<textarea id="aiAdminErrori">${escapeHtml((s.erroriCritici || []).join("\n"))}</textarea></label>
                    <label>Trattamenti attesi<textarea id="aiAdminTrattamenti">${escapeHtml((s.trattamentiAttesi || []).join("\n"))}</textarea></label>
                    <label>Trattamenti dannosi<textarea id="aiAdminDannosi">${escapeHtml((s.trattamentiDannosi || []).join("\n"))}</textarea></label>
                    <button onclick="aiSalvaRegia()">Salva regia</button>
                </section>
                <section class="ai-box">
                    <h4>Evento live</h4>
                    <textarea id="aiAdminEvento" placeholder="Esempio: il paziente peggiora, aumenta la dispnea, compare ipotensione..."></textarea>
                    <input id="aiAdminEffetto" placeholder="Effetto sui parametri o sul comportamento">
                    <button onclick="aiLanciaEventoRegia()">Lancia evento</button>
                    <h4>Valutazione in tempo reale</h4>
                    <div class="ai-score-box">
                        <b>Score ${escapeHtml(evalInfo.score)}</b>
                        ${evalInfo.puntiForti.map(v => `<span>${escapeHtml(v)}</span>`).join("")}
                    </div>
                    <div class="ai-score-box warning">
                        <b>Criticita attese</b>
                        ${evalInfo.criticita.map(v => `<span>${escapeHtml(v)}</span>`).join("")}
                    </div>
                </section>
            </div>
            <div class="ai-timeline admin-timeline">
                ${(s.timeline || []).slice().reverse().map(t => `<article><b>${escapeHtml(t.fase)}</b><small>${escapeHtml(t.time)}</small><p>${escapeHtml(t.testo)}</p></article>`).join("")}
            </div>
            ${s.debrief ? `<div class="ai-debrief"><b>${escapeHtml(s.debrief.esito)} - score ${escapeHtml(s.debrief.score || "")}</b><p>${escapeHtml(s.debrief.testo)}</p>${(s.debrief.puntiForti || []).map(v => `<span>${escapeHtml(v)}</span>`).join("")}</div>` : ""}
        </section>
    `;
}

function aiScenarioDetail(s) {
    return `
        <section class="work-panel ai-case-detail">
            <div class="ai-patient-head">
                <div>
                    <p class="eyebrow">${escapeHtml(s.ingresso)} / ${escapeHtml(s.area)}</p>
                    <h3>${escapeHtml(s.nome)} ${escapeHtml(s.cognome)}, ${escapeHtml(s.eta)} anni</h3>
                    <span>${escapeHtml(s.tipo)} - personalita ${escapeHtml(s.personalita)}</span>
                </div>
                <div class="ai-head-actions">
                    <span class="triage-dot triage-${triageClass(s.codice)}">${escapeHtml(s.codice)}</span>
                    <button onclick="aiCreaPazienteDaScenario()">Apri cartella PS</button>
                    <button onclick="aiChiudiCaso()" ${s.stato === "Chiuso" ? "disabled" : ""}>Chiudi caso</button>
                    <button onclick="aiResetScenario('${escapeHtml(s.id)}')">Elimina</button>
                </div>
            </div>
            <div class="ai-vitals">
                ${Object.entries(s.parametri).map(([k, v]) => `<div><span>${escapeHtml(k.toUpperCase())}</span><b>${escapeHtml(v)}</b></div>`).join("")}
            </div>
            <div class="ai-detail-grid">
                <div class="ai-box">
                    <h4>Intervista paziente</h4>
                    <div class="ai-chat">
                        ${(s.chat || []).map(m => `<p class="${m.from === "operatore" ? "operator" : "patient"}"><b>${m.from === "operatore" ? "Operatore" : "Paziente"}</b>${escapeHtml(m.text)}</p>`).join("")}
                    </div>
                    <textarea id="aiDomanda" placeholder="Fai una domanda al paziente: dolore, farmaci, allergie, dinamica, sintomi..."></textarea>
                    <button onclick="aiInviaDomanda()">Invia domanda</button>
                </div>
                <div class="ai-box">
                    <h4>Diagnostica coerente</h4>
                    <select id="aiEsame">
                        ${["ECG 12 derivazioni", "Emocromo + PCR/PCT", "Troponina seriata", "EGA con lattati", "Elettroliti e funzione renale", "RX torace", "RX distretto interessato", "TC encefalo", "Angio-TC torace", "TC addome con contrasto", "TC trauma total body", "Ecografia addome"].map(e => `<option>${escapeHtml(e)}</option>`).join("")}
                    </select>
                    <button onclick="aiRichiediEsame()">Richiedi e referta</button>
                    <div class="ai-results">
                        ${(s.esami || []).map(e => `<article><b>${escapeHtml(e.nome)}</b><small>${escapeHtml(e.time)}</small><p>${escapeHtml(e.referto)}</p></article>`).join("") || `<div class="empty-state">Nessun esame richiesto.</div>`}
                    </div>
                </div>
                <div class="ai-box">
                    <h4>Trattamento e rivalutazione</h4>
                    <select id="aiAzione">
                        ${["Ossigeno e monitoraggio", "Accesso venoso, fluidi e rivalutazione", "Antibiotico precoce", "ASA/antiaggregante e percorso cardiologico", "Attivazione emodinamica", "Analgesia titolata", "Broncodilatatore e steroide", "Noradrenalina per shock", "Attivazione stroke team", "Valutazione chirurgica urgente", "Sala operatoria", "Osservazione e rivalutazione"].map(a => `<option>${escapeHtml(a)}</option>`).join("")}
                    </select>
                    <button onclick="aiRegistraAzione()">Applica azione</button>
                    <div class="ai-results compact-list">
                        ${(s.terapie || []).map(t => `<article><b>${escapeHtml(t.azione)}</b><small>${escapeHtml(t.time)}</small><p>${escapeHtml(t.effetto)}</p></article>`).join("") || `<div class="empty-state">Nessun trattamento applicato.</div>`}
                    </div>
                </div>
                <div class="ai-box">
                    <h4>Timeline e debrief</h4>
                    <div class="ai-timeline">
                        ${(s.timeline || []).slice().reverse().map(t => `<article><b>${escapeHtml(t.fase)}</b><small>${escapeHtml(t.time)}</small><p>${escapeHtml(t.testo)}</p></article>`).join("")}
                    </div>
                    ${s.debrief ? `<div class="ai-debrief"><b>${escapeHtml(s.debrief.esito)}</b><p>${escapeHtml(s.debrief.testo)}</p></div>` : ""}
                </div>
            </div>
        </section>
    `;
}

function aiInstallSidebarButton() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar || document.getElementById("aiSimSidebarButton")) return;
    const ref = [...sidebar.querySelectorAll("button")].find(b => /Chirurgia/.test(b.textContent));
    const html = `<button id="aiSimSidebarButton" onclick="pagina='simulazione'; render()">Simulatore IA</button>`;
    if (ref) ref.insertAdjacentHTML("beforebegin", html);
    else sidebar.insertAdjacentHTML("beforeend", html);
}

const aiOriginalCanOpenPage = typeof canOpenPage === "function" ? canOpenPage : null;
if (aiOriginalCanOpenPage) {
    canOpenPage = function aiCanOpenPage(nomePagina) {
        if (nomePagina === "simulazione") {
            return !!medicoLoggato && hasPermission("all");
        }
        if (nomePagina === "prontoSoccorso") return !!medicoLoggato && hasPermission("patients:view");
        if (nomePagina === "intervento118") return false;
        return aiOriginalCanOpenPage(nomePagina);
    };
}

function aiCartellaPanelHTML(s) {
    return `
        <section id="aiPatientPanel" class="dedalus-panel span-2 ai-cartella-panel ai-cartella-slim">
            <div class="dedalus-panel-head">
                ${typeof iconImg === "function" ? iconImg("caduceus", "Andamento simulato") : ""}
                <div>
                    <h3>Andamento simulato</h3>
                    <p>Decorso clinico dinamico del caso, integrato nella cartella.</p>
                </div>
                <button onclick="aiAvanzaTempo()">Avanza 10 minuti</button>
            </div>
            <div class="ai-evolution-panel dedalus-evolution">
                <div>
                    <p>${escapeHtml(aiSintesiAndamento(s))}</p>
                </div>
                <div class="ai-evolution-list">
                    ${(s.andamento || []).slice(0, 4).map(e => `
                        <article>
                            <b>${escapeHtml(e.titolo)}</b>
                            <span>${escapeHtml(e.time)} - ${escapeHtml(e.descrizione)}</span>
                        </article>
                    `).join("") || `<div class="empty-state">Registra parametri, terapie o referti per vedere evolvere il caso.</div>`}
                </div>
            </div>
        </section>
    `;
}

function aiSintesiAndamento(s) {
    const p = s.parametri || {};
    const sys = parseSistolica(p.pa);
    const issues = [];
    if (Number(p.sat || 100) < 92) issues.push("ossigenazione critica");
    if (sys < 95) issues.push("pressione bassa");
    if (Number(p.fc || 80) > 120) issues.push("tachicardia");
    if (Number(p.fr || 16) > 28) issues.push("fatica respiratoria");
    if (Number(p.gcs || 15) < 14) issues.push("coscienza alterata");
    if (!issues.length) return "Quadro stabile o in miglioramento. Continua rivalutazione dopo ogni intervento.";
    return `Attenzione: ${issues.join(", ")}. Rivalutare parametri, terapia e priorita.`;
}

function aiEnhanceCartella() {
    if (pagina !== "cartella" || !pazienteSelezionato?.aiScenarioId) return;
    const grid = document.querySelector(".clinical-grid");
    if (!grid || document.getElementById("aiPatientPanel")) return;
    const s = aiScenarioDaCartella();
    if (!s) return;
    grid.insertAdjacentHTML("afterbegin", aiCartellaPanelHTML(s));
}

const aiOriginalRender = render;
render = function aiRender() {
    aiInstallSidebarButton();
    ripristinaSessione();
    if (pagina === "simulazione") {
        const app = document.getElementById("app");
        aggiornaSidebarPermessi();
        if (!medicoLoggato) {
            login(app);
            return;
        }
        if (!canOpenPage("simulazione")) {
            app.innerHTML = `<section class="work-panel access-denied"><p class="eyebrow">Accesso negato</p><h2>Simulatore non disponibile</h2></section>`;
            return;
        }
        aiSimulatoreView(app);
        return;
    }
    aiOriginalRender();
    aiEnhanceCartella();
    aiInstallSidebarButton();
    aggiornaSidebarPermessi();
};

/* Override finale workstation: caricato per ultimo, quindi resta attivo. */
const BANCA_FARMACI_PS = [
    { nome: "Paracetamolo", dose: "1 g", via: "EV/OS", note: "Dolore/febbre, valutare epatopatia." },
    { nome: "Ketorolac", dose: "30 mg", via: "EV/IM", note: "Dolore acuto, evitare in IRC/ulcera/anticoagulanti." },
    { nome: "Ibuprofene", dose: "600 mg", via: "OS", note: "Dolore/febbre, evitare in IRC, ulcera o anticoagulazione." },
    { nome: "Tramadolo", dose: "50-100 mg", via: "EV/OS", note: "Dolore moderato, attenzione nausea e sedazione." },
    { nome: "Morfina", dose: "2-4 mg titolabili", via: "EV", note: "Dolore severo, monitorare FR e sedazione." },
    { nome: "Fentanil", dose: "25-50 mcg titolabili", via: "EV", note: "Dolore severo/procedure, monitor respiratorio." },
    { nome: "Ondansetron", dose: "4 mg", via: "EV/OS", note: "Nausea/vomito, attenzione QT." },
    { nome: "Metoclopramide", dose: "10 mg", via: "EV/IM", note: "Nausea, evitare in sospetta ostruzione o extrapiramidale." },
    { nome: "Salbutamolo", dose: "2.5-5 mg", via: "Aerosol", note: "Broncospasmo, rivalutare FC e K." },
    { nome: "Ipratropio bromuro", dose: "0.5 mg", via: "Aerosol", note: "Broncospasmo/BPCO, spesso associato a salbutamolo." },
    { nome: "Metilprednisolone", dose: "40-80 mg", via: "EV", note: "Asma/BPCO/allergia secondo quadro." },
    { nome: "Idrocortisone", dose: "100-200 mg", via: "EV", note: "Anafilassi, shock, crisi surrenalica secondo indicazione." },
    { nome: "Adrenalina", dose: "0.5 mg IM", via: "IM", note: "Anafilassi; EV solo in setting monitorato/protocollo." },
    { nome: "Noradrenalina", dose: "titolare", via: "EV", note: "Shock con monitoraggio e accesso adeguato." },
    { nome: "Furosemide", dose: "20-40 mg", via: "EV", note: "Congestione, monitorare PA/diuresi/elettroliti." },
    { nome: "Nitroglicerina", dose: "secondo PA", via: "SL/EV", note: "Dolore toracico/edema polmonare se PA consente." },
    { nome: "Acido acetilsalicilico", dose: "250-300 mg", via: "OS", note: "Sospetta SCA se non controindicato." },
    { nome: "Clopidogrel", dose: "300-600 mg", via: "OS", note: "SCA secondo indicazione medica/protocollo." },
    { nome: "Eparina sodica", dose: "secondo peso/protocollo", via: "EV/SC", note: "Indicazione medica, controllare coagulazione." },
    { nome: "Enoxaparina", dose: "secondo peso/indicazione", via: "SC", note: "TEV/SCA secondo funzione renale e rischio emorragico." },
    { nome: "Amiodarone", dose: "300 mg", via: "EV", note: "Aritmie ventricolari/FA selezionata, monitor ECG." },
    { nome: "Atropina", dose: "0.5 mg ripetibile", via: "EV", note: "Bradicardia sintomatica secondo ACLS." },
    { nome: "Midazolam", dose: "1-2 mg titolabili", via: "EV/IN", note: "Sedazione/crisi convulsive, monitor respiratorio." },
    { nome: "Diazepam", dose: "5-10 mg", via: "EV/RET", note: "Crisi convulsive/agitazione selezionata." },
    { nome: "Naloxone", dose: "0.04-0.4 mg titolabili", via: "EV/IM/IN", note: "Depressione respiratoria da oppioidi." },
    { nome: "Glucosio 33%", dose: "20-40 ml", via: "EV", note: "Ipoglicemia severa, controllare glicemia seriale." },
    { nome: "Insulina rapida", dose: "secondo glicemia/K", via: "EV/SC", note: "Iperglicemia/chetoacidosi con protocollo." },
    { nome: "Ceftriaxone", dose: "2 g", via: "EV", note: "Infezione severa secondo indicazione e allergie." },
    { nome: "Piperacillina/tazobactam", dose: "4.5 g", via: "EV", note: "Sepsi/infezioni addominali o respiratorie selezionate." },
    { nome: "Vancomicina", dose: "secondo peso", via: "EV", note: "Infezioni severe Gram+; monitor livelli/funzione renale." }
];

[
    ["Analgesia", "Ossicodone", "5-10 mg", "OS", "Dolore moderato-severo, attenzione sedazione."],
    ["Analgesia", "Buprenorfina", "0.2-0.4 mg", "SL/TD", "Dolore, valutare oppioidi gia assunti."],
    ["Analgesia", "Diclofenac", "75 mg", "IM/OS", "Dolore infiammatorio, cautela gastro-renale."],
    ["Analgesia", "Metamizolo", "1 g", "EV/OS", "Dolore/febbre, verificare allergie e rischio ematologico."],
    ["Anestesia/Sedazione", "Propofol", "titolare", "EV", "Sedazione procedurale solo con monitoraggio avanzato."],
    ["Anestesia/Sedazione", "Ketamina", "0.5-1 mg/kg", "EV/IM", "Analgo-sedazione, utile in trauma; monitorare PA/psiche."],
    ["Anestesia/Sedazione", "Etomidate", "0.2-0.3 mg/kg", "EV", "Induzione, stabilita emodinamica relativa."],
    ["Anestesia/Sedazione", "Rocuronio", "1 mg/kg", "EV", "Curarizzazione per RSI, ventilazione obbligatoria."],
    ["Respiratorio", "Magnesio solfato", "2 g", "EV", "Asma severa/aritmie selezionate, monitor PA."],
    ["Respiratorio", "Ossigeno", "secondo target", "Maschera/NC", "Target SpO2 secondo quadro, BPCO con cautela."],
    ["Respiratorio", "Budensonide", "1-2 mg", "Aerosol", "Broncospasmo/laringite secondo indicazione."],
    ["Cardiologia", "Adenosina", "6-12 mg", "EV rapido", "TPSV, monitor ECG e accesso prossimale."],
    ["Cardiologia", "Metoprololo", "2.5-5 mg", "EV/OS", "Tachiaritmie/ischemia selezionata, cautela BPCO/scompenso."],
    ["Cardiologia", "Digossina", "0.25 mg", "EV/OS", "Controllo frequenza in FA selezionata."],
    ["Cardiologia", "Verapamil", "5 mg", "EV", "TPSV/controllo frequenza, evitare in WPW/scompenso."],
    ["Cardiologia", "Lidocaina", "1-1.5 mg/kg", "EV", "Aritmie ventricolari selezionate."],
    ["Cardiologia", "Ticagrelor", "180 mg", "OS", "SCA secondo percorso cardiologico."],
    ["Cardiologia", "Prasugrel", "60 mg", "OS", "SCA selezionata, attenzione stroke/eta/peso."],
    ["Cardiologia", "Tenecteplase", "secondo peso", "EV", "Fibrinolisi STEMI/ictus selezionati secondo protocollo."],
    ["Shock/Rianimazione", "Cristalloidi bilanciati", "250-1000 ml", "EV", "Espansione volemica titolata."],
    ["Shock/Rianimazione", "Ringer lattato", "500-1000 ml", "EV", "Fluidoterapia in trauma/sepsi selezionata."],
    ["Shock/Rianimazione", "Dopamina", "titolare", "EV", "Amina in setting monitorato."],
    ["Shock/Rianimazione", "Dobutamina", "titolare", "EV", "Supporto inotropo nello shock cardiogeno selezionato."],
    ["Shock/Rianimazione", "Vasopressina", "titolare", "EV", "Shock refrattario selezionato."],
    ["Neurologia", "Levetiracetam", "1-2 g", "EV/OS", "Crisi epilettiche/profilassi selezionata."],
    ["Neurologia", "Fenitoina", "15-20 mg/kg", "EV", "Stato epilettico, monitor ECG/PA."],
    ["Neurologia", "Mannitolo", "0.25-1 g/kg", "EV", "Ipertensione endocranica selezionata."],
    ["Neurologia", "Acido tranexamico", "1 g", "EV", "Emorragia/trauma entro indicazioni."],
    ["Metabolico", "Calcio gluconato", "10 ml 10%", "EV", "Iperkaliemia con alterazioni ECG/ipocalcemia."],
    ["Metabolico", "Bicarbonato sodico", "secondo EGA", "EV", "Acidosi severa/iperK selezionata."],
    ["Metabolico", "Potassio cloruro", "secondo K", "EV/OS", "Ipokaliemia, velocita controllata."],
    ["Metabolico", "Sodio cloruro ipertonico", "100 ml 3%", "EV", "Iponatriemia sintomatica/ICP selezionata."],
    ["Gastroenterologia", "Pantoprazolo", "40-80 mg", "EV/OS", "Emorragia digestiva/reflusso severo."],
    ["Gastroenterologia", "Octreotide", "50 mcg bolo + infusione", "EV", "Sospetta emorragia varicosa."],
    ["Gastroenterologia", "Lattulosio", "20-30 ml", "OS/RET", "Encefalopatia epatica selezionata."],
    ["Allergia", "Clorfenamina", "10 mg", "EV/IM", "Reazione allergica, associata a terapia causale."],
    ["Allergia", "Cetirizina", "10 mg", "OS", "Orticaria/reazione lieve."],
    ["Antibiotici", "Amoxicillina/clavulanato", "2.2 g", "EV", "Infezioni comunitarie selezionate."],
    ["Antibiotici", "Ampicillina/sulbactam", "3 g", "EV", "Infezioni respiratorie/addominali selezionate."],
    ["Antibiotici", "Meropenem", "1 g", "EV", "Sepsi/infezioni MDR secondo indicazione."],
    ["Antibiotici", "Gentamicina", "5-7 mg/kg", "EV", "Gram negativi/sepsi selezionata, monitor renale."],
    ["Antibiotici", "Azitromicina", "500 mg", "EV/OS", "Polmonite/atipici selezionati."],
    ["Antibiotici", "Levofloxacina", "500 mg", "EV/OS", "Respiratorio/urinario selezionato, attenzione QT."],
    ["Antibiotici", "Metronidazolo", "500 mg", "EV/OS", "Anaerobi/addome/pelvi."],
    ["Antibiotici", "Ciprofloxacina", "400 mg", "EV", "Urinario/addominale selezionato."],
    ["Anticoagulanti", "Warfarin", "secondo INR", "OS", "Anticoagulazione cronica, non avvio rapido PS."],
    ["Anticoagulanti", "Apixaban", "5 mg", "OS", "TEV/FA selezionata secondo funzione renale."],
    ["Anticoagulanti", "Rivaroxaban", "15-20 mg", "OS", "TEV/FA selezionata secondo indicazione."],
    ["Antidoti", "Flumazenil", "0.2 mg ripetibile", "EV", "Antagonista benzodiazepine, cautela convulsioni."],
    ["Antidoti", "Vitamina K", "5-10 mg", "EV/OS", "Reversione warfarin selezionata."],
    ["Antidoti", "Protamina", "secondo eparina", "EV", "Reversione eparina selezionata."],
    ["Ostetricia", "Ossitocina", "secondo protocollo", "EV/IM", "Emorragia post-partum/induzione in setting idoneo."],
    ["Ostetricia", "Solfato di magnesio", "4 g + infusione", "EV", "Eclampsia/pre-eclampsia severa."]
].forEach(([categoria, nome, dose, via, note]) => {
    if (!BANCA_FARMACI_PS.some(f => f.nome === nome)) BANCA_FARMACI_PS.push({ categoria, nome, dose, via, note });
});

const FARMACI_CATEGORIE_FALLBACK = [
    ["Paracetamolo", "Analgesia"], ["Ketorolac", "Analgesia"], ["Ibuprofene", "Analgesia"], ["Tramadolo", "Analgesia"], ["Morfina", "Analgesia"], ["Fentanil", "Analgesia"],
    ["Ondansetron", "Gastroenterologia"], ["Metoclopramide", "Gastroenterologia"],
    ["Salbutamolo", "Respiratorio"], ["Ipratropio bromuro", "Respiratorio"], ["Metilprednisolone", "Allergia/Respiratorio"], ["Idrocortisone", "Allergia/Respiratorio"], ["Adrenalina", "Shock/Rianimazione"], ["Noradrenalina", "Shock/Rianimazione"],
    ["Furosemide", "Cardiologia"], ["Nitroglicerina", "Cardiologia"], ["Acido acetilsalicilico", "Cardiologia"], ["Clopidogrel", "Cardiologia"], ["Eparina sodica", "Anticoagulanti"], ["Enoxaparina", "Anticoagulanti"],
    ["Amiodarone", "Cardiologia"], ["Atropina", "Cardiologia"], ["Midazolam", "Anestesia/Sedazione"], ["Diazepam", "Anestesia/Sedazione"], ["Naloxone", "Antidoti"], ["Glucosio 33%", "Metabolico"], ["Insulina rapida", "Metabolico"],
    ["Ceftriaxone", "Antibiotici"], ["Piperacillina/tazobactam", "Antibiotici"], ["Vancomicina", "Antibiotici"]
];
FARMACI_CATEGORIE_FALLBACK.forEach(([nome, categoria]) => {
    const f = BANCA_FARMACI_PS.find(x => x.nome === nome);
    if (f && !f.categoria) f.categoria = categoria;
});

const AREE_PS = {
    psAttesa: { nome: "Sala d'attesa", letti: 20, reparto: "ps" },
    psTriage: { nome: "Triage", letti: 4, reparto: "ps" },
    psOsservazione: { nome: "Osservazione breve", letti: 10, reparto: "ps" },
    psShock: { nome: "Shock room", letti: 2, reparto: "ps" },
    psMedicheria: { nome: "Medicheria", letti: 6, reparto: "ps" }
};

const SALE_OPERATORIE = [
    { id: "so1", nome: "Sala 1", stato: "Disponibile" },
    { id: "so2", nome: "Sala 2", stato: "Preparazione" },
    { id: "so3", nome: "Sala urgenze", stato: "Disponibile" },
    { id: "so4", nome: "Sala laparoscopia", stato: "Occupata" }
];

function isAdminOperativo() {
    return typeof hasPermission === "function" ? hasPermission("all") : medicoLoggato?.ruolo === "admin";
}

function saleOperatorieCorrenti() {
    let salvate = [];
    try {
        salvate = JSON.parse(localStorage.getItem("saleOperatorie") || "[]");
    } catch (error) {
        salvate = [];
    }
    return SALE_OPERATORIE.map(base => ({ ...base, ...(salvate.find(s => s.id === base.id) || {}) }));
}

function salvaSaleOperatorie(sale) {
    localStorage.setItem("saleOperatorie", JSON.stringify(sale));
    localStorage.setItem("hospitalSyncAt", String(Date.now()));
    syncCanale?.postMessage({ type: "sync", at: Date.now(), user: medicoLoggato?.nome || "" });
}

function pazientiCandidatiSalaOperatoria() {
    const chirurgia = pazienti.filter(p => ensurePaziente(p).reparto === "chirurgia");
    return chirurgia.length ? chirurgia : pazienti.filter(p => !p.archiviato);
}

function canEditClinicalData() {
    return isAdminOperativo() || (typeof hasPermission === "function" && hasPermission("patients:edit"));
}

function normalizzaAreePS() {
    let changed = false;
    pazienti.forEach(p => {
        ensurePaziente(p);
        if (p.reparto === "ps" && !p.areaPS) {
            p.areaPS = "psAttesa";
            changed = true;
        }
        if (p.areaPS === "psAttesa" && p.letto) {
            p.letto = null;
            changed = true;
        }
    });
    if (changed) localStorage.setItem("ps", JSON.stringify(pazienti));
}

function codiceVisibilePaziente(p) {
    return ensurePaziente(p).reparto === "ps";
}

function codiceDisplay(p) {
    return codiceVisibilePaziente(p) ? (p.codice || "n/d") : "ricovero";
}

function areaPSLabel(p) {
    return p.areaPS && AREE_PS[p.areaPS] ? AREE_PS[p.areaPS].nome : "Area PS non assegnata";
}

function multiOperatoreBadge() {
    return `<span class="sync-badge" title="Sincronizzazione locale fra schede browser">multi-operatore locale</span>`;
}

function variazioneParametriHTML(p) {
    const h = (p.parametriHistory || []).slice(-2);
    if (h.length < 2) return `<div class="empty-state">Registra almeno due rilevazioni per vedere le variazioni.</div>`;
    const prev = h[0], last = h[1];
    const items = [
        ["FC", prev.fc, last.fc, " bpm"],
        ["FR", prev.fr, last.fr, " /min"],
        ["SpO2", prev.sat, last.sat, " %"],
        ["Temp", prev.temp, last.temp, " C"],
        ["GCS", prev.gcs, last.gcs, ""],
        ["Dolore", prev.dolore, last.dolore, "/10"]
    ];
    return `<div class="vital-delta-grid">${items.map(([label, a, b, unit]) => {
        const na = Number(a), nb = Number(b);
        const delta = Number.isFinite(na) && Number.isFinite(nb) ? nb - na : null;
        const cls = delta === null || delta === 0 ? "stable" : delta > 0 ? "up" : "down";
        const sign = delta === null || delta === 0 ? "" : delta > 0 ? "+" : "";
        return `<div class="${cls}"><b>${label}</b><span>${escapeHtml(b || "-")}${unit}</span><small>${delta === null ? "n/d" : `${sign}${delta}`}</small></div>`;
    }).join("")}</div>`;
}

function bancaFarmaciHTML() {
    const categorie = [...new Set(BANCA_FARMACI_PS.map(f => f.categoria || "Altro"))].sort();
    return `
        <div class="drug-bank-tools">
            <input id="farmacoSearch" placeholder="Cerca farmaco, indicazione o nota" oninput="filtraBancaFarmaci()">
            <select id="farmacoCategoriaFiltro" onchange="filtraBancaFarmaci()">
                <option value="">Tutte le categorie</option>
                ${categorie.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("")}
            </select>
        </div>
        <div class="drug-bank" id="drugBankGrid">
            ${BANCA_FARMACI_PS.map(f => `
                <button data-drug-card data-category="${escapeHtml(f.categoria || "Altro")}" data-search="${escapeHtml(`${f.nome} ${f.dose} ${f.via} ${f.note} ${f.categoria || ""}`.toLowerCase())}" onclick="selezionaFarmacoBanca('${escapeHtml(f.nome)}', '${escapeHtml(f.dose)}', '${escapeHtml(f.via)}', '${escapeHtml(f.note)}')">
                    <em>${escapeHtml(f.categoria || "Altro")}</em>
                    <b>${escapeHtml(f.nome)}</b>
                    <span>${escapeHtml(f.dose)} - ${escapeHtml(f.via)}</span>
                    <small>${escapeHtml(f.note)}</small>
                </button>
            `).join("")}
        </div>
    `;
}

function farmacoOptionsHTML(selected = "") {
    const categorie = [...new Set(BANCA_FARMACI_PS.map(f => f.categoria || "Altro"))].sort();
    return categorie.map(categoria => `
        <optgroup label="${escapeHtml(categoria)}">
            ${BANCA_FARMACI_PS
                .filter(f => (f.categoria || "Altro") === categoria)
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .map(f => `<option value="${escapeHtml(f.nome)}" ${selected === f.nome ? "selected" : ""}>${escapeHtml(f.nome)} - ${escapeHtml(f.dose)}</option>`)
                .join("")}
        </optgroup>
    `).join("");
}

function filtraBancaFarmaci() {
    const q = fieldValue("farmacoSearch").toLowerCase();
    const cat = fieldValue("farmacoCategoriaFiltro");
    document.querySelectorAll("[data-drug-card]").forEach(card => {
        const okText = !q || (card.dataset.search || "").includes(q);
        const okCat = !cat || card.dataset.category === cat;
        card.style.display = okText && okCat ? "" : "none";
    });
}

function selezionaFarmacoBanca(nome, dose, via, note) {
    const nomeEl = document.getElementById("farmacoNome");
    const doseEl = document.getElementById("farmacoDose");
    const viaEl = document.getElementById("farmacoVia");
    const noteEl = document.getElementById("farmacoNote");
    if (nomeEl) nomeEl.value = nome;
    if (doseEl) doseEl.value = dose;
    if (viaEl) viaEl.value = via.split("/")[0] || via;
    if (noteEl) noteEl.value = note;
}

const DIAGNOSI_CATALOGO = {
    "Cardiologia": ["Sindrome coronarica acuta STEMI", "NSTEMI / angina instabile", "Scompenso cardiaco acuto", "Edema polmonare acuto", "Fibrillazione atriale ad alta risposta", "Flutter atriale", "TPSV", "Bradicardia sintomatica / BAV", "Pericardite acuta", "Miocardite", "Dissezione aortica", "Embolia polmonare", "Sincope cardiogena"],
    "Respiratorio": ["Polmonite comunitaria", "BPCO riacutizzata", "Asma acuto severo", "Pneumotorace", "Versamento pleurico", "Insufficienza respiratoria ipossiemica", "Insufficienza respiratoria ipercapnica", "Edema polmonare", "COVID/infezione virale respiratoria", "Aspirazione bronchiale"],
    "Chirurgia": ["Appendicite acuta", "Colecistite acuta", "Colangite", "Pancreatite acuta", "Occlusione intestinale", "Perforazione viscerale", "Diverticolite acuta", "Ernia incarcerata/strangolata", "Ischemia mesenterica", "Emorragia digestiva", "Trauma addominale", "Ascesso cutaneo/profondo", "Sepsi addominale"],
    "Medicina Interna": ["Sepsi", "Shock settico", "Disidratazione severa", "Insufficienza renale acuta", "Scompenso diabetico / chetoacidosi", "Stato iperosmolare", "Iponatriemia sintomatica", "Iperkaliemia", "Anemia severa", "Scompenso epatico", "Intossicazione farmacologica", "Febbre di origine da definire"],
    "Neurologia": ["Ictus ischemico", "Emorragia cerebrale", "TIA", "Crisi epilettica", "Stato epilettico", "Meningite / encefalite", "Cefalea primaria", "Emorragia subaracnoidea", "Delirium acuto", "Vertigine periferica", "Sindrome midollare", "Trauma cranico"],
    "Ortopedia": ["Frattura femore", "Frattura polso", "Frattura caviglia", "Frattura vertebrale", "Lussazione spalla", "Trauma distorsivo", "Lesione tendinea", "Ferita lacero-contusa", "Sindrome compartimentale", "Artrite settica", "Protesi dolorosa / mobilizzazione", "Trauma mano"],
    "Rianimazione": ["Shock indifferenziato", "Shock settico", "Shock cardiogeno", "Shock emorragico", "Anafilassi", "Arresto cardiaco rianimato", "Insufficienza respiratoria severa", "Politrauma", "Coma", "Acidosi metabolica severa", "Sepsi con lattati elevati", "Intossicazione grave"],
    "Urologia/Ginecologia": ["Colica renale", "Pielonefrite", "Ritenzione urinaria", "Torsione testicolare", "Gravidanza ectopica", "Minaccia d'aborto", "Malattia infiammatoria pelvica", "Emorragia uterina"],
    "Altro": ["Reazione allergica", "Anafilassi", "Dolore toracico non cardiaco", "Dolore addominale aspecifico", "Trauma minore", "Ansia / attacco di panico", "Diagnosi in osservazione", "Quadro da definire"]
};

const TRATTAMENTI_REPARTO = {
    chirurgia: ["Digiuno e idratazione EV", "Antibioticoterapia perioperatoria", "Analgesia multimodale", "Consenso informato chirurgico", "Valutazione anestesiologica", "Preparazione sala operatoria", "Laparoscopia esplorativa", "Appendicectomia", "Colecistectomia", "Laparotomia", "Drenaggio ascesso", "Emostasi chirurgica", "Medicazione avanzata", "Drenaggio e monitoraggio output", "Profilassi tromboembolica", "Nutrizione enterale/parenterale"],
    medicinaInterna: ["Fluidoterapia guidata", "Antibioticoterapia empirica", "Correzione elettrolitica", "Controllo glicemico", "Ossigenoterapia", "Diuretico EV", "Trasfusione emazie", "Emocolture e bundle sepsi", "Monitor diuresi", "Terapia antipertensiva", "Steroidoterapia sistemica", "Nutrizione e mobilizzazione precoce"],
    ortopedia: ["Immobilizzazione con tutore/gesso", "Riduzione lussazione", "Riduzione frattura", "Trazione trans-scheletrica", "Profilassi antibiotica ferite", "Sutura ferita", "Lavaggio chirurgico", "Valutazione neurovascolare seriale", "Controllo radiografico post-riduzione", "Programmazione osteosintesi", "Artrocentesi", "Terapia antalgica e ghiaccio/elevazione"],
    cardiologia: ["Monitor telemetrico", "Antiaggregazione", "Anticoagulazione", "Nitroderivati", "Diuretico EV", "Controllo frequenza", "Cardioversione elettrica", "Cardioversione farmacologica", "Ecocardiogramma bedside", "Percorso emodinamica", "Terapia antiaritmica", "CPAP/NIV per edema polmonare"],
    neurologia: ["Stroke protocol", "Trombolisi EV se indicata", "Trombectomia meccanica se indicata", "Controllo PA stroke", "Antiepilettico EV", "Profilassi aspirazione", "Monitor GCS/pupille", "TC/angio-TC urgente", "Valutazione disfagia", "Terapia antiedema", "Puntura lombare se indicata"],
    rianimazione: ["ABCDE avanzato", "Vie aeree avanzate", "Ventilazione non invasiva", "Intubazione orotracheale", "Ventilazione meccanica", "Accesso venoso centrale", "Linea arteriosa", "Vasopressori", "Sedazione/analgesia continua", "Bundle sepsi avanzato", "Trasfusione massiva", "Controllo temperatura", "Monitor lattati seriati"]
};

const PROTOCOLLI_DIAGNOSI = [
    { match: /appendicite|addome acuto|perforazione|diverticolite|colecistite|colangite|occlusione|ernia/i, esami: ["Emocromo con formula", "PCR, PCT, VES", "Profilo biochimico completo", "Coagulazione: PT, aPTT, INR, fibrinogeno, D-dimero", "Ecografia addome completo", "TAC addome e pelvi"], farmaci: ["Paracetamolo", "Morfina", "Piperacillina/tazobactam", "Metronidazolo"], trattamenti: ["Digiuno e idratazione EV", "Consenso informato chirurgico", "Valutazione anestesiologica", "Preparazione sala operatoria", "Laparoscopia esplorativa"] },
    { match: /STEMI|NSTEMI|sindrome coronarica|angina/i, esami: ["ECG 12 derivazioni", "Troponina, CK-MB, BNP", "Profilo biochimico completo", "Coagulazione: PT, aPTT, INR, fibrinogeno, D-dimero", "RX torace"], farmaci: ["Acido acetilsalicilico", "Clopidogrel", "Eparina sodica", "Nitroglicerina", "Morfina"], trattamenti: ["Monitor telemetrico", "Antiaggregazione", "Anticoagulazione", "Percorso emodinamica", "Ecocardiogramma bedside"] },
    { match: /scompenso|edema polmonare/i, esami: ["ECG 12 derivazioni", "Troponina, CK-MB, BNP", "EGA arteriosa", "RX torace", "Ecocardiogramma bedside"], farmaci: ["Furosemide", "Nitroglicerina", "Ossigeno"], trattamenti: ["Monitor telemetrico", "Diuretico EV", "CPAP/NIV per edema polmonare", "Ecocardiogramma bedside"] },
    { match: /ictus|TIA|emorragia cerebrale|stroke/i, esami: ["Glicemia capillare", "TAC cranio senza contrasto", "Angio-TAC cranio-collo", "Coagulazione: PT, aPTT, INR, fibrinogeno, D-dimero", "ECG 12 derivazioni"], farmaci: ["Tenecteplase", "Labetalolo", "Levetiracetam"], trattamenti: ["Stroke protocol", "TC/angio-TC urgente", "Trombolisi EV se indicata", "Trombectomia meccanica se indicata", "Valutazione disfagia"] },
    { match: /sepsi|shock settico|polmonite|pielonefrite/i, esami: ["Emocromo con formula", "PCR, PCT, VES", "EGA arteriosa", "Lattati", "Emocolture", "RX torace", "Esame urine e urinocoltura"], farmaci: ["Cristalloidi bilanciati", "Ceftriaxone", "Piperacillina/tazobactam", "Noradrenalina"], trattamenti: ["Emocolture e bundle sepsi", "Antibioticoterapia empirica", "Fluidoterapia guidata", "Monitor diuresi", "Monitor lattati seriati"] },
    { match: /BPCO|asma|insufficienza respiratoria|dispnea/i, esami: ["EGA arteriosa", "RX torace", "Emocromo con formula", "PCR, PCT, VES", "TAC torace"], farmaci: ["Salbutamolo", "Ipratropio bromuro", "Metilprednisolone", "Ossigeno", "Magnesio solfato"], trattamenti: ["Ossigenoterapia", "Ventilazione non invasiva", "Steroidoterapia sistemica", "Monitoraggio saturazione"] },
    { match: /frattura|lussazione|trauma|distorsivo|ferita/i, esami: ["RX distretto interessato", "RX torace", "TAC total body trauma", "Emocromo con formula", "Coagulazione: PT, aPTT, INR, fibrinogeno, D-dimero"], farmaci: ["Paracetamolo", "Ketorolac", "Morfina", "Ceftriaxone"], trattamenti: ["Immobilizzazione con tutore/gesso", "Riduzione frattura", "Riduzione lussazione", "Controllo radiografico post-riduzione", "Valutazione neurovascolare seriale"] }
];

function diagnosiOptionsHTML(selected = "") {
    return Object.entries(DIAGNOSI_CATALOGO).map(([categoria, diagnosi]) => `
        <optgroup label="${escapeHtml(categoria)}">
            ${diagnosi.map(d => `<option value="${escapeHtml(d)}" ${selected === d ? "selected" : ""}>${escapeHtml(d)}</option>`).join("")}
        </optgroup>
    `).join("");
}

function diagnosiPanelHTML(p) {
    return `
        <section class="dedalus-panel span-2 diagnosis-panel">
            <div class="dedalus-panel-head"><div><p class="eyebrow">Decisione clinica</p><h3>Diagnosi / ipotesi diagnostica</h3></div><button onclick="salvaDiagnosiPaziente()">Salva diagnosi</button></div>
            <div class="diagnosis-grid">
                <label>Diagnosi principale<select id="diagnosiPrincipale"><option value="">Seleziona diagnosi</option>${diagnosiOptionsHTML(p.diagnosiPrincipale || "")}</select></label>
                <label>Grado di certezza<select id="diagnosiCertezza"><option ${p.diagnosiCertezza === "Sospetta" ? "selected" : ""}>Sospetta</option><option ${p.diagnosiCertezza === "Probabile" ? "selected" : ""}>Probabile</option><option ${p.diagnosiCertezza === "Confermata" ? "selected" : ""}>Confermata</option><option ${p.diagnosiCertezza === "Esclusa" ? "selected" : ""}>Esclusa</option></select></label>
                <label>Diagnosi non presente<input id="diagnosiLibera" value="${escapeHtml(p.diagnosiLibera || "")}" placeholder="Scrivi solo se non presente nel catalogo"></label>
                <label>Priorita clinica<select id="diagnosiPriorita"><option>Bassa</option><option ${p.diagnosiPriorita === "Media" ? "selected" : ""}>Media</option><option ${p.diagnosiPriorita === "Alta" ? "selected" : ""}>Alta</option><option ${p.diagnosiPriorita === "Tempo-dipendente" ? "selected" : ""}>Tempo-dipendente</option></select></label>
            </div>
            <div class="diagnosis-current">${p.diagnosiPrincipale || p.diagnosiLibera ? `<b>${escapeHtml(p.diagnosiPrincipale || p.diagnosiLibera)}</b><span>${escapeHtml(p.diagnosiCertezza || "")} - ${escapeHtml(p.diagnosiPriorita || "")}</span>` : `<span>Nessuna diagnosi salvata.</span>`}</div>
        </section>
    `;
}

function salvaDiagnosiPaziente() {
    const p = pazienteSelezionato ? pazienti.find(x => x.id === pazienteSelezionato.id) || pazienteSelezionato : null;
    if (!p) return;
    p.diagnosiPrincipale = fieldValue("diagnosiPrincipale");
    p.diagnosiLibera = fieldValue("diagnosiLibera");
    p.diagnosiCertezza = fieldValue("diagnosiCertezza");
    p.diagnosiPriorita = fieldValue("diagnosiPriorita");
    const testo = `${p.diagnosiPrincipale || p.diagnosiLibera || "Diagnosi non indicata"} (${p.diagnosiCertezza || "n/d"}, priorita ${p.diagnosiPriorita || "n/d"})`;
    p.diarioClinico = p.diarioClinico || [];
    p.diarioClinico.push({ time: new Date().toLocaleString(), tipo: "Diagnosi", titolo: "Diagnosi aggiornata", testo, operatore: medicoLoggato?.nome || "" });
    logAction(`Diagnosi aggiornata per ${p.nome} ${p.cognome}: ${testo}`);
    pazienteSelezionato = p;
    salva();
    render();
}

function trattamentiSpecialisticiHTML(p) {
    const trattamenti = TRATTAMENTI_REPARTO[p.reparto] || TRATTAMENTI_REPARTO.medicinaInterna;
    return `
        <section class="dedalus-panel span-2 specialty-treatment-panel">
            <div class="dedalus-panel-head"><div><p class="eyebrow">Trattamenti specialistici</p><h3>${escapeHtml(labelReparto(p.reparto))}</h3></div><button onclick="registraTrattamentoSpecialistico()">Registra trattamento</button></div>
            <div class="specialty-treatment-grid">
                <label>Trattamento<select id="trattamentoSpecialistico">${trattamenti.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join("")}</select></label>
                <label>Esito / stato<select id="trattamentoEsito"><option>Eseguito</option><option>Programmato</option><option>In corso</option><option>Non indicato al momento</option><option>Da rivalutare</option></select></label>
                <label>Nota libera<input id="trattamentoNota" placeholder="Dettaglio se necessario"></label>
            </div>
            <div class="treatment-chip-list">${(p.trattamentiSpecialistici || []).slice(-8).reverse().map(t => `<span><b>${escapeHtml(t.trattamento)}</b><small>${escapeHtml(t.esito)} - ${escapeHtml(t.time)}</small></span>`).join("") || `<div class="empty-state">Nessun trattamento specialistico registrato.</div>`}</div>
        </section>
    `;
}

function registraTrattamentoSpecialistico() {
    const p = pazienteSelezionato ? pazienti.find(x => x.id === pazienteSelezionato.id) || pazienteSelezionato : null;
    if (!p) return;
    const trattamento = fieldValue("trattamentoSpecialistico");
    if (!trattamento) return;
    const item = { time: new Date().toLocaleString(), trattamento, esito: fieldValue("trattamentoEsito"), nota: fieldValue("trattamentoNota"), operatore: medicoLoggato?.nome || "" };
    p.trattamentiSpecialistici = p.trattamentiSpecialistici || [];
    p.trattamentiSpecialistici.push(item);
    p.diarioClinico = p.diarioClinico || [];
    p.diarioClinico.push({ time: item.time, tipo: "Trattamento", titolo: trattamento, testo: `${item.esito}. ${item.nota || ""}`, operatore: item.operatore });
    logAction(`Trattamento specialistico ${trattamento} per ${p.nome} ${p.cognome}`);
    pazienteSelezionato = p;
    salva();
    render();
}

function protocolloPaziente(p) {
    const text = `${p.diagnosiPrincipale || ""} ${p.diagnosiLibera || ""} ${p.motivo || ""}`;
    return PROTOCOLLI_DIAGNOSI.find(proto => proto.match.test(text)) || {
        esami: ["Emocromo con formula", "Profilo biochimico completo", "ECG 12 derivazioni", "EGA arteriosa"],
        farmaci: ["Paracetamolo", "Ondansetron", "Cristalloidi bilanciati"],
        trattamenti: ["Monitoraggio clinico", "Rivalutazione medica", "Osservazione e rivalutazione parametri"]
    };
}

function suggerimentiCliniciHTML(p) {
    const proto = protocolloPaziente(p);
    return `
        <section class="dedalus-panel span-2 smart-protocol-panel" id="cartella-protocollo">
            <div class="dedalus-panel-head">
                <div><p class="eyebrow">Percorso intelligente</p><h3>Suggerimenti collegati alla diagnosi</h3></div>
                <span class="mini-count">${escapeHtml(p.diagnosiPrincipale || p.diagnosiLibera || "diagnosi non selezionata")}</span>
            </div>
            <div class="protocol-grid">
                <div><b>Esami</b>${proto.esami.map(v => `<button onclick="registraSuggerimentoClinico('esame', '${escapeHtml(v)}')">${escapeHtml(v)}</button>`).join("")}</div>
                <div><b>Farmaci</b>${proto.farmaci.map(v => `<button onclick="registraSuggerimentoClinico('farmaco', '${escapeHtml(v)}')">${escapeHtml(v)}</button>`).join("")}</div>
                <div><b>Trattamenti</b>${proto.trattamenti.map(v => `<button onclick="registraSuggerimentoClinico('trattamento', '${escapeHtml(v)}')">${escapeHtml(v)}</button>`).join("")}</div>
            </div>
        </section>
    `;
}

function registraSuggerimentoClinico(tipo, valore) {
    const p = pazienteSelezionato ? pazienti.find(x => x.id === pazienteSelezionato.id) || pazienteSelezionato : null;
    if (!p || !valore) return;
    const now = new Date().toLocaleString();
    if (tipo === "esame") {
        const catalogo = trovaEsameCatalogo(valore);
        p.esami = p.esami || [];
        p.esami.push({
            id: id(),
            time: now,
            nome: valore,
            categoria: catalogo?.categoria || categoriaEsame(valore),
            urgenza: "Suggerito da percorso",
            richiedente: `Percorso ${p.diagnosiPrincipale || p.diagnosiLibera || "clinico"}`,
            note: "Richiesto da suggerimento clinico",
            stato: "Richiesto",
            refertoAutomatico: true,
            dueAt: Date.now() + numeroCasuale(60, 120) * 1000,
            operatore: medicoLoggato?.nome || ""
        });
        if (typeof pianificaControlloReferti === "function") pianificaControlloReferti();
    }
    if (tipo === "farmaco") {
        const f = BANCA_FARMACI_PS.find(x => x.nome === valore) || { nome: valore, dose: "", via: "", note: "" };
        p.terapie = p.terapie || [];
        const terapia = { id: id(), time: now, farmaco: f.nome, dose: f.dose, via: (f.via || "").split("/")[0], frequenza: "Suggerito da percorso", note: f.note, operatore: medicoLoggato?.nome || "" };
        p.terapie.push(terapia);
        applicaEffettoFarmacoParametri(p, terapia);
        notificaClinica("Terapia registrata", `${f.nome}: parametri aggiornati automaticamente.`, "info", `farmaco-${p.id}-${Date.now()}`, false);
    }
    if (tipo === "trattamento") {
        p.trattamentiSpecialistici = p.trattamentiSpecialistici || [];
        p.trattamentiSpecialistici.push({ time: now, trattamento: valore, esito: "Programmato", nota: "Suggerito da percorso clinico", operatore: medicoLoggato?.nome || "" });
        if (/sala|intubazione|vasopressori|trombolisi|emodinamica/i.test(valore)) {
            notificaClinica("Trattamento tempo-dipendente", valore, "warning", `tratt-${p.id}-${valore}-${Date.now()}`, false);
        }
    }
    p.diarioClinico = p.diarioClinico || [];
    p.diarioClinico.push({ time: now, tipo: "Percorso clinico", titolo: `${tipo}: ${valore}`, testo: "Registrato da suggerimento collegato alla diagnosi.", operatore: medicoLoggato?.nome || "" });
    logAction(`Suggerimento ${tipo} registrato per ${p.nome} ${p.cognome}: ${valore}`);
    pazienteSelezionato = p;
    salva();
    render();
}

function timelineClinicaHTML(p) {
    const eventiBase = timelineClinica(p);
    const extraDiario = (p.diario || []).map(d => ({
        time: d.time,
        tipo: d.tipo || "Nota",
        titolo: d.titolo || d.tipo || "Nota clinica",
        testo: d.testo || "",
        operatore: d.operatore || ""
    }));
    const extraTrattamenti = (p.trattamentiSpecialistici || []).map(t => ({
        time: t.time,
        tipo: "Trattamento",
        titolo: t.trattamento,
        testo: `${t.esito || ""}. ${t.nota || ""}`,
        operatore: t.operatore || ""
    }));
    const eventi = [...eventiBase, ...extraDiario, ...extraTrattamenti]
        .filter(e => e.titolo || e.testo || e.tipo)
        .sort((a, b) => (Date.parse(b.time || "") || 0) - (Date.parse(a.time || "") || 0));
    const groups = [
        { title: "Eventi recenti", items: eventi.slice(0, 8) },
        { title: "Terapia ed effetti", items: eventi.filter(e => /terapia|farmaco/i.test(`${e.tipo} ${e.titolo}`)).slice(0, 6) },
        { title: "Diagnosi e trattamenti", items: eventi.filter(e => /diagnosi|trattamento|sala operatoria|chirurg/i.test(`${e.tipo} ${e.titolo}`)).slice(0, 6) },
        { title: "Esami e referti", items: eventi.filter(e => /esame|referto|ecg/i.test(`${e.tipo} ${e.titolo}`)).slice(0, 6) }
    ];
    return `<div class="clinical-flow-grid">${groups.map(group => `
        <section class="clinical-flow-column">
            <h4>${escapeHtml(group.title)}</h4>
            ${group.items.length ? group.items.map(e => `
                <article class="flow-event ${escapeHtml((e.tipo || "evento").toLowerCase().replaceAll(" ", "-"))}">
                    <div><b>${escapeHtml(e.titolo || e.tipo || "Evento")}</b><span>${escapeHtml(e.time || "")}</span></div>
                    <p>${escapeHtml(e.testo || "")}</p>
                    ${e.operatore ? `<small>${escapeHtml(e.operatore)}</small>` : ""}
                </article>
            `).join("") : `<div class="empty-state compact-empty">Nessun dato.</div>`}
        </section>
    `).join("")}</div>`;
}

let notificheCliniche = [];
let notificheGiaEmesse = JSON.parse(localStorage.getItem("notificheGiaEmesse") || "[]");
let audioClinicoAbilitato = localStorage.getItem("audioClinicoAbilitato") === "true";
const completaRefertiScadutiBaseNotifiche = typeof completaRefertiScaduti === "function" ? completaRefertiScaduti : null;

function ensureNotificationHost() {
    let host = document.getElementById("notificationHost");
    if (!host) {
        host = document.createElement("div");
        host.id = "notificationHost";
        host.className = "notification-host";
        document.body.appendChild(host);
    }
    return host;
}

function suonoClinico(tipo = "info") {
    if (!audioClinicoAbilitato) return;
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const freq = tipo === "critical" ? 880 : tipo === "warning" ? 660 : 520;
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    } catch (error) {
        audioClinicoAbilitato = false;
    }
}

function abilitaAudioClinico() {
    audioClinicoAbilitato = true;
    localStorage.setItem("audioClinicoAbilitato", "true");
    suonoClinico("info");
    notificaClinica("Audio notifiche attivato", "Le notifiche sonore sono abilitate su questo browser.", "info", "audio-ok", false);
    render();
}

function notificaClinica(titolo, testo, tipo = "info", idNotifica = "", persistente = true) {
    const idN = idNotifica || `${tipo}-${titolo}-${testo}`;
    if (persistente && notificheGiaEmesse.includes(idN)) return;
    if (persistente) {
        notificheGiaEmesse.push(idN);
        notificheGiaEmesse = notificheGiaEmesse.slice(-80);
        localStorage.setItem("notificheGiaEmesse", JSON.stringify(notificheGiaEmesse));
    }
    notificheCliniche.unshift({ titolo, testo, tipo, time: new Date().toLocaleTimeString() });
    notificheCliniche = notificheCliniche.slice(0, 8);
    const host = ensureNotificationHost();
    const node = document.createElement("div");
    node.className = `clinical-toast ${tipo}`;
    node.innerHTML = `<b>${escapeHtml(titolo)}</b><span>${escapeHtml(testo)}</span>`;
    host.appendChild(node);
    suonoClinico(tipo);
    setTimeout(() => node.remove(), tipo === "critical" ? 7000 : 4200);
}

if (completaRefertiScadutiBaseNotifiche) {
    completaRefertiScaduti = function completaRefertiScadutiConNotifiche(mostraAvviso = false) {
        const completati = completaRefertiScadutiBaseNotifiche(mostraAvviso);
        if (completati) {
            notificaClinica("Referti pronti", `${completati} referto${completati > 1 ? "i" : ""} disponibile${completati > 1 ? "i" : ""} in cartella.`, "info", `referti-${Date.now()}`, false);
        }
        return completati;
    };
}

function valutaNotifichePS(ps) {
    ps.forEach(p => {
        if (p.codice === "Rosso") notificaClinica("Codice rosso in PS", `${p.cognome} ${p.nome} - ${p.motivo || "motivo non indicato"}`, "critical", `rosso-${p.id}-${p.codice}`);
        if (p.codice === "Arancione") notificaClinica("Alta priorita", `${p.cognome} ${p.nome} in ${areaPSLabel(p)}`, "warning", `arancio-${p.id}-${p.codice}`);
        const alerts = alertClinici(p).filter(a => a.livello === "critical");
        alerts.forEach(a => notificaClinica(a.titolo, `${p.cognome} ${p.nome}: ${a.testo}`, "critical", `alert-${p.id}-${a.titolo}-${a.testo}`));
    });
}

function iconForAreaPS(key) {
    const map = { psAttesa: "patientMale", psTriage: "thermometer", psOsservazione: "ivBag", psShock: "heart", psMedicheria: "syringe" };
    return map[key] || "caduceus";
}

function pazientePSCard(p) {
    const alerts = alertClinici(p);
    const critico = alerts.some(a => a.livello === "critical");
    return `
        <button class="ps-patient-card ${triageClass(p.codice)} ${critico ? "critical" : ""}" onclick="apri('${p.id}')">
            ${iconImg(patientIcon(p), "Paziente")}
            <span class="triage-mini ${triageClass(p.codice)}">${escapeHtml(p.codice || "")}</span>
            <b>${escapeHtml(p.cognome)} ${escapeHtml(p.nome)}</b>
            <small>${escapeHtml(p.motivo || "Motivo non indicato")}</small>
            <em>${escapeHtml(tempoPermanenza(p))}${alerts.length ? " - " + escapeHtml(alerts[0].titolo) : ""}</em>
        </button>
    `;
}

function prontoSoccorsoView(app) {
    normalizzaAreePS();
    const ps = pazienti.filter(p => ensurePaziente(p).reparto === "ps");
    const perArea = Object.keys(AREE_PS).map(key => [key, ps.filter(p => p.areaPS === key)]);
    const counts = ["Rosso", "Arancione", "Azzurro", "Verde", "Bianco"].reduce((acc, c) => ({ ...acc, [c]: ps.filter(p => p.codice === c).length }), {});
    const refertiAttesi = ps.reduce((tot, p) => tot + refertiPendenti(p), 0);
    const critici = ps.filter(p => p.codice === "Rosso" || alertClinici(p).some(a => a.livello === "critical")).length;
    valutaNotifichePS(ps);
    app.innerHTML = `
        <div class="ps-command-hero">
            <div>
                <p class="eyebrow">Pronto Soccorso</p>
                <h2>${iconImg("caduceus", "PS")} Centrale operativa PS</h2>
                <span>Vista live di aree, codici, referti, alert e pazienti in attesa.</span>
            </div>
            <div class="header-actions">
                ${multiOperatoreBadge()}
                <button onclick="abilitaAudioClinico()">${audioClinicoAbilitato ? "Audio attivo" : "Attiva audio"}</button>
                ${isAdminOperativo() ? `<button onclick="generaPazienteAdmin()">Genera paziente</button>` : ""}
                <button onclick="pagina='nuovo'; render()">Accetta paziente</button>
                <button onclick="pagina='ricoveri'; render()">Letti</button>
            </div>
        </div>
        <section class="ps-live-kpis">
            <button class="rosso" onclick="filtroTriage='Rosso'; pagina='ps'; render()"><b>${counts.Rosso}</b><span>Rossi</span></button>
            <button class="arancione" onclick="filtroTriage='Arancione'; pagina='ps'; render()"><b>${counts.Arancione}</b><span>Arancioni</span></button>
            <button class="azzurro" onclick="filtroTriage='Azzurro'; pagina='ps'; render()"><b>${counts.Azzurro}</b><span>Azzurri</span></button>
            <button class="verde" onclick="filtroTriage='Verde'; pagina='ps'; render()"><b>${counts.Verde}</b><span>Verdi</span></button>
            <button class="bianco" onclick="filtroTriage='Bianco'; pagina='ps'; render()"><b>${counts.Bianco}</b><span>Bianchi</span></button>
            <div><b>${critici}</b><span>Alert critici</span></div>
            <div><b>${refertiAttesi}</b><span>Referti attesi</span></div>
        </section>
        <section class="ps-modern-layout">
            <div class="ps-zone-board">
            ${perArea.map(([key, list]) => `
                <article class="ps-zone-card ${key}">
                    <div class="ps-zone-head">
                        ${iconImg(iconForAreaPS(key), AREE_PS[key].nome)}
                        <div><b>${escapeHtml(AREE_PS[key].nome)}</b><small>${key === "psAttesa" ? "non numerata" : "area monitorata"}</small></div>
                        <span>${list.length}/${AREE_PS[key].letti}</span>
                    </div>
                    <div class="ps-zone-list">
                        ${list.slice(0, 8).map(pazientePSCard).join("") || `<div class="empty-zone">Nessun paziente</div>`}
                    </div>
                </article>
            `).join("")}
            </div>
            <aside class="ps-notification-panel">
                <div class="dedalus-panel-head"><div><p class="eyebrow">Notifiche</p><h3>Eventi PS</h3></div></div>
                ${notificheCliniche.length ? notificheCliniche.map(n => `<div class="notification-line ${n.tipo}"><b>${escapeHtml(n.titolo)}</b><span>${escapeHtml(n.testo)}</span><small>${escapeHtml(n.time)}</small></div>`).join("") : `<div class="empty-state">Nessuna notifica recente.</div>`}
            </aside>
        </section>
    `;
}

function destinazioniLetti() {
    return {
        ...AREE_PS,
        ...Object.fromEntries(Object.entries(REPARTI_LETTI).map(([key, r]) => [key, { ...r, reparto: key }]))
    };
}

function destinazioneLettoLabel(key) {
    return destinazioniLetti()[key]?.nome || labelReparto(key);
}

function pazienteInPosto(destinazione, numero) {
    const key = `${destinazione}-${numero}`;
    return pazienti.find(p => ensurePaziente(p).letto?.key === key);
}

function ricoveriView(app) {
    normalizzaAreePS();
    const destinazioni = destinazioniLetti();
    if (!destinazioni[repartoRicoveroSelezionato]) repartoRicoveroSelezionato = "psAttesa";
    const corrente = destinazioni[repartoRicoveroSelezionato];
    const occupati = corrente.reparto === "ps" && repartoRicoveroSelezionato === "psAttesa"
        ? pazienti.filter(p => ensurePaziente(p).reparto === "ps" && p.areaPS === "psAttesa")
        : pazienti.filter(p => ensurePaziente(p).letto?.reparto === repartoRicoveroSelezionato);
    const isPS = corrente.reparto === "ps";

    app.innerHTML = `
        <div class="page-header dedalus-record-head">
            <div class="patient-identity">
                ${iconImg(isPS ? "caduceus" : "doctorMale", "Letti")}
                <div>
                    <p class="eyebrow">Gestione posti</p>
                    <h2>Letti, aree PS e reparti</h2>
                    <span>Il codice di priorita resta visibile solo nel Pronto Soccorso.</span>
                </div>
            </div>
            <div class="header-actions"><button onclick="pagina='prontoSoccorso'; render()">Pronto Soccorso</button><button onclick="pagina='ps'; render()">Lista</button></div>
        </div>
        <section class="dedalus-panel admission-overview">
            <div class="dedalus-panel-head">
                <div><p class="eyebrow">${isPS ? "Area PS" : "Reparto"}</p><h3>${escapeHtml(corrente.nome)}</h3></div>
                <div class="bed-kpis"><span><b>${occupati.length}</b> occupati</span><span><b>${Math.max(0, corrente.letti - occupati.length)}</b> liberi</span><span><b>${corrente.letti}</b> totali</span></div>
            </div>
            <div class="ward-tabs">
                ${Object.entries(destinazioni).map(([key, area]) => {
                    const n = area.reparto === "ps" && key === "psAttesa"
                        ? pazienti.filter(p => ensurePaziente(p).reparto === "ps" && p.areaPS === "psAttesa").length
                        : pazienti.filter(p => ensurePaziente(p).letto?.reparto === key).length;
                    return `<button class="${key === repartoRicoveroSelezionato ? "active" : ""}" onclick="setRepartoRicovero('${key}')"><span>${escapeHtml(area.nome)}</span><small>${n}/${area.letti}</small></button>`;
                }).join("")}
            </div>
        </section>
        <section class="admission-toolbar">
            <select id="ricoveroPaziente">
                ${pazienti.length ? pazienti.map(p => `<option value="${p.id}">${escapeHtml(p.nome)} ${escapeHtml(p.cognome)} - ${escapeHtml(p.reparto === "ps" ? p.codice || "" : labelReparto(p.reparto))}${p.letto ? " - " + escapeHtml(p.letto.label) : ""}</option>`).join("") : `<option value="">Nessun paziente attivo</option>`}
            </select>
            <input id="ricoveroNote" placeholder="${isPS ? "Area/attesa/box" : "Motivo ricovero / note reparto"}">
            <button onclick="pagina='nuovo'; render()">Nuovo paziente</button>
        </section>
        <div class="bed-board">
            <section class="ward-board">
                <div class="ward-board-head"><div><h3>${escapeHtml(corrente.nome)}</h3><span>${repartoRicoveroSelezionato === "psAttesa" ? "La sala d'attesa non ha posti numerati: i pazienti PS vengono inseriti automaticamente qui." : "Click su posto libero per assegnare il paziente selezionato."}</span></div></div>
                ${repartoRicoveroSelezionato === "psAttesa" ? `
                    <div class="waiting-list-board">
                        ${occupati.length ? occupati.map(p => `
                            <button class="waiting-patient ${triageClass(p.codice)}" onclick="apri('${p.id}')">
                                <span class="triage-mini ${triageClass(p.codice)}">${escapeHtml(p.codice || "")}</span>
                                <b>${escapeHtml(p.cognome)} ${escapeHtml(p.nome)}</b>
                                <small>${escapeHtml(p.motivo || "Motivo non indicato")}</small>
                            </button>
                        `).join("") : `<div class="empty-state">Nessun paziente in sala d'attesa.</div>`}
                    </div>
                ` : `<div class="bed-grid">
                    ${Array.from({ length: corrente.letti }, (_, idx) => {
                        const numero = idx + 1;
                        const occupante = pazienteInPosto(repartoRicoveroSelezionato, numero);
                        return `<button class="bed-card ${occupante ? "occupied" : "free"}" onclick="assegnaLetto('${repartoRicoveroSelezionato}', ${numero})">
                            <b>${isPS ? "Posto" : "Letto"} ${numero.toString().padStart(2, "0")}</b>
                            <span>${occupante ? `${escapeHtml(occupante.nome)} ${escapeHtml(occupante.cognome)}` : "Libero"}</span>
                            ${occupante && isPS ? `<small class="triage-mini ${triageClass(occupante.codice)}">${escapeHtml(occupante.codice)}</small>` : occupante ? `<small>Ricoverato</small>` : `<small>Disponibile</small>`}
                        </button>`;
                    }).join("")}
                </div>`}
            </section>
            <aside class="ward-board ward-list">
                <div class="ward-board-head"><div><h3>Occupazione</h3><span>${escapeHtml(corrente.nome)}</span></div></div>
                ${occupati.length ? `<table class="clinical-table"><thead><tr><th>${repartoRicoveroSelezionato === "psAttesa" ? "Area" : "Posto"}</th><th>Paziente</th><th>Stato</th><th>Ingresso</th></tr></thead><tbody>${
                    (repartoRicoveroSelezionato === "psAttesa" ? occupati : occupati.sort((a,b) => a.letto.numero - b.letto.numero)).map(p => `
                        <tr>
                            <td>${repartoRicoveroSelezionato === "psAttesa" ? "Sala d'attesa" : escapeHtml(p.letto.numero)}</td>
                            <td><b>${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</b><small>${escapeHtml(p.letto?.note || p.motivo || "")}</small></td>
                            <td>${isPS ? `<span class="triage-mini ${triageClass(p.codice)}">${escapeHtml(p.codice || "")}</span>` : `<span class="ward-status">Ricovero</span>`}</td>
                            <td>${escapeHtml(p.letto?.assegnatoIl || p.ingresso || "")}</td>
                        </tr>
                    `).join("")
                }</tbody></table>` : `<div class="empty-state">Nessun paziente assegnato.</div>`}
            </aside>
        </div>
    `;
}

function assegnaLetto(destinazione, numero) {
    const idP = fieldValue("ricoveroPaziente");
    const p = pazienti.find(x => x.id === idP);
    if (!p) return;
    const area = destinazioniLetti()[destinazione];
    if (!area) return;
    if (destinazione === "psAttesa") {
        p.reparto = "ps";
        p.areaPS = "psAttesa";
        p.letto = null;
        logAction(`Inserito ${p.nome} ${p.cognome} in sala d'attesa`);
        salva();
        render();
        return;
    }
    const occupante = pazienteInPosto(destinazione, numero);
    if (occupante && occupante.id !== p.id) return alert("Posto gia occupato. Scegli un posto libero.");
    p.reparto = area.reparto;
    p.areaPS = area.reparto === "ps" ? destinazione : "";
    if (area.reparto !== "ps") {
        p.codiceRepartoStorico = p.codice;
    }
    p.letto = {
        key: `${destinazione}-${numero}`,
        reparto: destinazione,
        numero,
        label: `${area.nome} ${numero}`,
        assegnatoIl: new Date().toLocaleString(),
        note: fieldValue("ricoveroNote")
    };
    logAction(`Assegnato ${p.nome} ${p.cognome} a ${p.letto.label}`);
    salva();
    render();
}

function setRepartoRicovero(reparto) {
    if (!destinazioniLetti()[reparto]) return;
    repartoRicoveroSelezionato = reparto;
    render();
}

function andamentoCompattoPaziente(p) {
    const h = p.parametriHistory || [];
    const last = h[h.length - 1] || p.parametri || {};
    const prev = h[h.length - 2] || {};
    const fcDelta = Number(last.fc) && Number(prev.fc) ? Number(last.fc) - Number(prev.fc) : 0;
    const satDelta = Number(last.sat) && Number(prev.sat) ? Number(last.sat) - Number(prev.sat) : 0;
    const alert = [];
    if (Number(last.sat) && Number(last.sat) < 92) alert.push("SpO2 bassa");
    if (Number(last.fc) && (Number(last.fc) > 120 || Number(last.fc) < 45)) alert.push("FC critica");
    if (String(last.pa || "").match(/^(\d+)/) && Number(String(last.pa).match(/^(\d+)/)[1]) < 90) alert.push("PA bassa");
    const ultimoEvento = timelineClinica(p)[0];
    return {
        last,
        trend: `${fcDelta ? `FC ${fcDelta > 0 ? "+" : ""}${fcDelta}` : "FC stabile"} | ${satDelta ? `SpO2 ${satDelta > 0 ? "+" : ""}${satDelta}` : "SpO2 stabile"}`,
        alert: alert.join(", ") || "stabile",
        ultimoEvento: ultimoEvento ? `${ultimoEvento.tipo}: ${ultimoEvento.titolo}` : "Nessun evento recente"
    };
}

function andamentoRepartoHTML(pazientiReparto) {
    return `
        <section class="dedalus-panel">
            <div class="dedalus-panel-head"><div><p class="eyebrow">Andamento</p><h3>Andamento clinico pazienti</h3></div></div>
            <div class="table-wrap">
                <table class="clinical-table ward-trend-table">
                    <thead><tr><th>Paziente</th><th>Ultimi parametri</th><th>Trend</th><th>Alert</th><th>Ultimo evento</th><th></th></tr></thead>
                    <tbody>${pazientiReparto.length ? pazientiReparto.map(p => {
                        const a = andamentoCompattoPaziente(p);
                        return `<tr>
                            <td><b>${escapeHtml(p.cognome)} ${escapeHtml(p.nome)}</b><small>${escapeHtml(p.letto?.label || "")}</small></td>
                            <td>FC ${escapeHtml(a.last.fc || "-")} | SpO2 ${escapeHtml(a.last.sat || "-")} | PA ${escapeHtml(a.last.pa || "-")} | T ${escapeHtml(a.last.temp || "-")}</td>
                            <td>${escapeHtml(a.trend)}</td>
                            <td><span class="${a.alert === "stabile" ? "ward-status" : "exam-status progress"}">${escapeHtml(a.alert)}</span></td>
                            <td>${escapeHtml(a.ultimoEvento)}</td>
                            <td><button onclick="apri('${p.id}')">Apri</button></td>
                        </tr>`;
                    }).join("") : `<tr><td colspan="6">Nessun paziente in reparto.</td></tr>`}</tbody>
                </table>
            </div>
        </section>
    `;
}

function repartoView(app, reparto, titolo) {
    const pazientiReparto = pazienti.filter(p => ensurePaziente(p).reparto === reparto);
    app.innerHTML = `
        <div class="page-header dedalus-record-head">
            <div><p class="eyebrow">Reparto</p><h2>${escapeHtml(titolo)}</h2><span>${pazientiReparto.length} pazienti ricoverati</span></div>
            <div class="header-actions"><button onclick="pagina='ricoveri'; render()">Letti</button><button onclick="pagina='ps'; render()">Lista</button></div>
        </div>
        ${reparto === "chirurgia" ? saleOperatorieHTML() : ""}
        <section class="dedalus-panel">
            <div class="dedalus-panel-head"><div><p class="eyebrow">Degenza</p><h3>Pazienti</h3></div></div>
            <div class="table-wrap">
                <table class="clinical-table patient-worklist">
                    <thead><tr><th>Letto</th><th>Paziente</th><th>Motivo</th><th>Referti</th><th>Azioni</th></tr></thead>
                    <tbody>${pazientiReparto.map(p => `<tr><td>${escapeHtml(p.letto?.label || "")}</td><td><b>${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</b><small>codice PS originario: ${escapeHtml(p.codiceRepartoStorico || p.codice || "")}</small></td><td>${escapeHtml(p.motivo || "")}</td><td>${refertiPendenti(p) || "ok"}</td><td><button onclick="apri('${p.id}')">Cartella</button></td></tr>`).join("") || `<tr><td colspan="5">Nessun paziente ricoverato.</td></tr>`}</tbody>
                </table>
            </div>
        </section>
        ${andamentoRepartoHTML(pazientiReparto)}
    `;
}

function saleOperatorieHTML() {
    const sale = saleOperatorieCorrenti();
    const candidati = pazientiCandidatiSalaOperatoria();
    return `
        <section class="dedalus-panel operating-board">
            <div class="dedalus-panel-head">
                <div><p class="eyebrow">Blocco operatorio</p><h3>Sale operatorie</h3></div>
                <span class="mini-count">${sale.filter(s => s.pazienteId).length}/${sale.length} occupate</span>
            </div>
            <div class="or-toolbar">
                <select id="salaPaziente">
                    ${candidati.length ? candidati.map(p => `<option value="${p.id}">${escapeHtml(p.cognome)} ${escapeHtml(p.nome)} - ${escapeHtml(p.letto?.label || statoPercorsoPaziente(p))}</option>`).join("") : `<option value="">Nessun paziente disponibile</option>`}
                </select>
                <select id="salaMotivo">
                    <option>Addome acuto / peritonismo</option>
                    <option>Appendicite acuta</option>
                    <option>Colecistite acuta</option>
                    <option>Occlusione intestinale</option>
                    <option>Ernia complicata</option>
                    <option>Trauma addominale</option>
                    <option>Emorragia / instabilita</option>
                    <option>Revisione ferita / drenaggio</option>
                </select>
                <select id="salaProcedura">
                    <option>Laparoscopia esplorativa</option>
                    <option>Appendicectomia laparoscopica</option>
                    <option>Colecistectomia laparoscopica</option>
                    <option>Laparotomia esplorativa</option>
                    <option>Riduzione ernia / plastica</option>
                    <option>Drenaggio ascesso</option>
                    <option>Controllo emostasi</option>
                    <option>Intervento da definire</option>
                </select>
                <select id="salaEquipe">
                    <option>Equipe chirurgica urgenza + anestesia</option>
                    <option>Equipe laparoscopica</option>
                    <option>Chirurgo reperibile + anestesista</option>
                    <option>Equipe trauma</option>
                    <option>Equipe programmata</option>
                </select>
            </div>
            <div class="or-grid">
                ${sale.map(s => {
                    const classe = String(s.stato || "Disponibile").toLowerCase().replaceAll(" ", "-");
                    return `<div class="${classe}">
                        <div class="or-room-head">
                            <b>${escapeHtml(s.nome)}</b>
                            <span>${escapeHtml(s.stato || "Disponibile")}</span>
                        </div>
                        <div class="or-room-body">
                            <strong>${escapeHtml(s.pazienteNome || "Nessun paziente assegnato")}</strong>
                            <small>${escapeHtml(s.motivo || "Motivo non indicato")}</small>
                            <small>${escapeHtml(s.procedura || "Procedura non programmata")}</small>
                            <small>${escapeHtml(s.orario ? "Programmato: " + s.orario : s.equipe || "")}</small>
                        </div>
                        <div class="or-actions">
                            <button onclick="programmaSalaOperatoria('${s.id}')">Programma</button>
                            <button onclick="cambiaStatoSalaOperatoria('${s.id}', 'In corso')">Inizia</button>
                            <button onclick="cambiaStatoSalaOperatoria('${s.id}', 'Conclusa')">Termina</button>
                            <button class="danger" onclick="liberaSalaOperatoria('${s.id}')">Libera</button>
                        </div>
                    </div>`;
                }).join("")}
            </div>
        </section>
    `;
}

function programmaSalaOperatoria(idSala) {
    const idP = fieldValue("salaPaziente");
    const p = pazienti.find(x => x.id === idP);
    if (!p) return alert("Seleziona un paziente da programmare.");
    const sale = saleOperatorieCorrenti();
    const sala = sale.find(s => s.id === idSala);
    if (!sala) return;
    const motivo = fieldValue("salaMotivo") || p.motivo || "Indicazione chirurgica da definire";
    const procedura = fieldValue("salaProcedura") || "Intervento da definire";
    sala.stato = "Programmato";
    sala.pazienteId = p.id;
    sala.pazienteNome = `${p.cognome || ""} ${p.nome || ""}`.trim();
    sala.motivo = motivo;
    sala.procedura = procedura;
    sala.equipe = fieldValue("salaEquipe");
    sala.orario = new Date().toLocaleString();
    sala.prenotatoDa = medicoLoggato?.nome || "Operatore";
    p.reparto = "chirurgia";
    p.codiceRepartoStorico = p.codiceRepartoStorico || p.codice || "";
    p.interventoProgrammato = { sala: sala.nome, motivo, procedura, ora: sala.orario, equipe: sala.equipe, prenotatoDa: sala.prenotatoDa, stato: "Programmato" };
    p.diario = p.diario || [];
    p.diarioClinico = p.diarioClinico || [];
    const notaProgrammazione = { time: new Date().toLocaleString(), tipo: "Programmazione chirurgica", testo: `${sala.nome}: ${motivo}. Procedura: ${procedura}. Prenotata da ${sala.prenotatoDa}. ${sala.equipe || ""}`, operatore: medicoLoggato?.nome || "" };
    p.diario.push(notaProgrammazione);
    p.diarioClinico.push(notaProgrammazione);
    logAction(`Programmato intervento in ${sala.nome} per ${p.nome} ${p.cognome}`);
    salvaSaleOperatorie(sale);
    salva();
    render();
}

function cambiaStatoSalaOperatoria(idSala, stato) {
    const sale = saleOperatorieCorrenti();
    const sala = sale.find(s => s.id === idSala);
    if (!sala) return;
    if (!sala.pazienteId && stato !== "Disponibile") return alert("Prima programma un paziente in sala.");
    sala.stato = stato;
    if (stato === "In corso") sala.inizio = new Date().toLocaleString();
    if (stato === "Conclusa") sala.fine = new Date().toLocaleString();
    const p = pazienti.find(x => x.id === sala.pazienteId);
    if (p) {
        p.diario = p.diario || [];
        p.diarioClinico = p.diarioClinico || [];
        if (p.interventoProgrammato && p.interventoProgrammato.sala === sala.nome) p.interventoProgrammato.stato = stato;
        const notaSala = { time: new Date().toLocaleString(), tipo: "Sala operatoria", testo: `${sala.nome}: ${stato}. ${sala.motivo || ""} ${sala.procedura || ""}`, operatore: medicoLoggato?.nome || "" };
        p.diario.push(notaSala);
        p.diarioClinico.push(notaSala);
        if (stato === "Conclusa") {
            p.interventiChirurgici = p.interventiChirurgici || [];
            p.interventiChirurgici.push({
                time: sala.fine,
                sala: sala.nome,
                motivo: sala.motivo || "",
                procedura: sala.procedura || "",
                equipe: sala.equipe || "",
                prenotatoDa: sala.prenotatoDa || "",
                conclusoDa: medicoLoggato?.nome || ""
            });
            p.interventoProgrammato = null;
        }
    }
    logAction(`${sala.nome}: stato ${stato}`);
    salvaSaleOperatorie(sale);
    salva();
    render();
}

function liberaSalaOperatoria(idSala) {
    const sale = saleOperatorieCorrenti();
    const sala = sale.find(s => s.id === idSala);
    if (!sala) return;
    sala.stato = "Disponibile";
    delete sala.pazienteId;
    delete sala.pazienteNome;
    delete sala.motivo;
    delete sala.procedura;
    delete sala.equipe;
    delete sala.orario;
    delete sala.inizio;
    delete sala.fine;
    logAction(`${sala.nome}: sala liberata`);
    salvaSaleOperatorie(sale);
    render();
}

function chirurgiaPazienteHTML(p) {
    const programmato = p.interventoProgrammato;
    const interventi = p.interventiChirurgici || [];
    if (!programmato && !interventi.length) return "";
    return `
        <section class="dedalus-panel span-2 surgery-history-panel">
            <div class="dedalus-panel-head"><div><p class="eyebrow">Chirurgia</p><h3>Interventi e sala operatoria</h3></div></div>
            ${programmato ? `<div class="surgery-current">
                <b>${escapeHtml(programmato.procedura || "Intervento programmato")}</b>
                <span>${escapeHtml(programmato.motivo || "")}</span>
                <small>${escapeHtml(programmato.sala || "")} - ${escapeHtml(programmato.stato || "Programmato")} - prenotato da ${escapeHtml(programmato.prenotatoDa || "")}</small>
            </div>` : ""}
            <div class="table-wrap">
                <table class="clinical-table">
                    <thead><tr><th>Data</th><th>Sala</th><th>Motivo</th><th>Procedura</th><th>Operatori</th></tr></thead>
                    <tbody>${interventi.length ? interventi.slice().reverse().map(i => `<tr><td>${escapeHtml(i.time || "")}</td><td>${escapeHtml(i.sala || "")}</td><td>${escapeHtml(i.motivo || "")}</td><td>${escapeHtml(i.procedura || "")}</td><td><small>Prenota: ${escapeHtml(i.prenotatoDa || "")}</small><small>Chiude: ${escapeHtml(i.conclusoDa || "")}</small></td></tr>`).join("") : `<tr><td colspan="5">Nessun intervento concluso.</td></tr>`}</tbody>
                </table>
            </div>
        </section>
    `;
}

function chirurgiaView(app) { repartoView(app, "chirurgia", "Chirurgia"); }
function medicinaInternaView(app) { repartoView(app, "medicinaInterna", "Medicina Interna"); }
function ortopediaView(app) { repartoView(app, "ortopedia", "Ortopedia e Traumatologia"); }
function cardiologiaView(app) { repartoView(app, "cardiologia", "Cardiologia / UTIC"); }
function neurologiaView(app) { repartoView(app, "neurologia", "Neurologia / Stroke Unit"); }
function rianimazioneView(app) { repartoView(app, "rianimazione", "Rianimazione / Terapia Intensiva"); }

const salvaBaseMultiOperatore = salva;
let syncInCorso = false;
const syncCanale = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("hospital-sync") : null;
let hospitalRemoteSyncEnabled = false;
let hospitalRemoteSyncReady = false;

function hospitalStatePayload() {
    return {
        pazienti,
        archivio,
        personale,
        logAzioni,
        interventi118,
        interventi118Archivio,
        intervento118Counter,
        ambulanze,
        saleOperatorie: typeof saleOperatorie === "function" ? saleOperatorie() : [],
        ruoliOspedale: ruoliConfig || null,
        updatedAt: new Date().toISOString()
    };
}

function applicaHospitalState(state) {
    if (!state || typeof state !== "object") return;
    syncInCorso = true;
    try {
        if (Array.isArray(state.pazienti)) pazienti = state.pazienti.map(ensurePaziente);
        if (Array.isArray(state.archivio)) archivio = state.archivio;
        if (Array.isArray(state.personale)) personale = state.personale;
        if (Array.isArray(state.logAzioni)) logAzioni = state.logAzioni;
        if (Array.isArray(state.interventi118)) interventi118 = state.interventi118;
        if (Array.isArray(state.interventi118Archivio)) interventi118Archivio = state.interventi118Archivio;
        if (Number.isFinite(Number(state.intervento118Counter))) intervento118Counter = Number(state.intervento118Counter);
        if (Array.isArray(state.ambulanze)) ambulanze = state.ambulanze;
        if (state.ruoliOspedale && typeof state.ruoliOspedale === "object") {
            ruoliConfig = state.ruoliOspedale;
            localStorage.setItem("ruoliOspedale", JSON.stringify(ruoliConfig));
        }
        if (Array.isArray(state.saleOperatorie)) localStorage.setItem("saleOperatorie", JSON.stringify(state.saleOperatorie));
        salvaBaseMultiOperatore();
        if (pazienteSelezionato) pazienteSelezionato = pazienti.find(p => p.id === pazienteSelezionato.id) || pazienteSelezionato;
    } finally {
        syncInCorso = false;
    }
}

async function hospitalRemoteLoad() {
    if (!/^https?:/.test(location.protocol)) return;
    try {
        const res = await fetch("/api/state", { cache: "no-store" });
        if (!res.ok) return;
        const state = await res.json();
        hospitalRemoteSyncEnabled = true;
        hospitalRemoteSyncReady = true;
        const remoteEmpty = !((state.pazienti || []).length || (state.archivio || []).length || (state.personale || []).length || (state.logAzioni || []).length);
        const localHasData = !!(pazienti.length || archivio.length || personale.length || logAzioni.length);
        if (remoteEmpty && localHasData) {
            await hospitalRemoteSave();
            return;
        }
        applicaHospitalState(state);
        render();
    } catch (error) {
        hospitalRemoteSyncEnabled = false;
    }
}

async function hospitalRemoteSave() {
    if (!hospitalRemoteSyncEnabled || syncInCorso) return;
    try {
        await fetch("/api/state", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(hospitalStatePayload())
        });
    } catch (error) {
        hospitalRemoteSyncEnabled = false;
    }
}

salva = function salvaMultiOperatore() {
    salvaBaseMultiOperatore();
    if (!syncInCorso) {
        localStorage.setItem("hospitalSyncAt", String(Date.now()));
        syncCanale?.postMessage({ type: "sync", at: Date.now(), user: medicoLoggato?.nome || "" });
        hospitalRemoteSave();
    }
};

function ricaricaDatiCondivisi() {
    syncInCorso = true;
    try {
        pazienti = JSON.parse(localStorage.getItem("ps") || "[]");
        archivio = JSON.parse(localStorage.getItem("archivio") || "[]");
        personale = JSON.parse(localStorage.getItem("personale") || "[]");
        pazienti.forEach(ensurePaziente);
        if (pazienteSelezionato) pazienteSelezionato = pazienti.find(p => p.id === pazienteSelezionato.id) || pazienteSelezionato;
        render();
    } finally {
        syncInCorso = false;
    }
}

window.addEventListener?.("storage", event => {
    if (["ps", "archivio", "hospitalSyncAt"].includes(event.key)) ricaricaDatiCondivisi();
});
syncCanale?.addEventListener("message", event => {
    if (event.data?.type === "sync") ricaricaDatiCondivisi();
});
hospitalRemoteLoad();

const renderBasePSFinale = render;
render = function renderFinalePS() {
    if (pagina === "intervento118") {
        pagina = "prontoSoccorso";
    }
    renderBasePSFinale();
};

let archivioDettaglioId = "";
let ricercaArchivio = "";

function setRicercaArchivio(value) {
    ricercaArchivio = value || "";
    archivioView(document.getElementById("app"));
}

function dettaglioArchivio(idArchivio) {
    archivioDettaglioId = idArchivio;
    archivioView(document.getElementById("app"));
}

function righeArchivio(items, emptyText) {
    return items && items.length ? items.map(item => `
        <tr>
            <td>${escapeHtml(item.time || item.richiestoIl || "")}</td>
            <td>${escapeHtml(item.tipo || item.nome || item.farmaco || "")}</td>
            <td>${escapeHtml(item.testo || item.esito || item.dose || item.note || item.stato || "")}</td>
        </tr>
    `).join("") : `<tr><td colspan="3">${escapeHtml(emptyText)}</td></tr>`;
}

function archivioView(app) {
    const query = ricercaArchivio.trim().toLowerCase();
    const listaArchivio = (archivio || []).filter(p => {
        if (!query) return true;
        return [p.nome, p.cognome, p.cf, p.motivo, p.dimissioneTipo, p.dimessoIl].some(v => String(v || "").toLowerCase().includes(query));
    });
    const selected = (archivio || []).find(p => p.id === archivioDettaglioId) || listaArchivio[0] || null;
    if (selected) archivioDettaglioId = selected.id;
    app.innerHTML = `
        <div class="page-header dedalus-record-head">
            <div>
                <p class="eyebrow">Archivio clinico</p>
                <h2>Pazienti dimessi e percorsi chiusi</h2>
                <span>${listaArchivio.length} schede trovate su ${(archivio || []).length}</span>
            </div>
            <div class="header-actions">
                <button onclick="pagina='ps'; render()">Lista pazienti</button>
            </div>
        </div>
        <section class="archive-layout">
            <aside class="dedalus-panel archive-list-panel">
                <div class="dedalus-panel-head"><div><p class="eyebrow">Ricerca</p><h3>Archivio</h3></div></div>
                <input value="${escapeHtml(ricercaArchivio)}" placeholder="Cerca nome, CF, motivo, data" oninput="setRicercaArchivio(this.value)">
                <div class="archive-list">
                    ${listaArchivio.length ? listaArchivio.map(p => `
                        <button class="${p.id === selected?.id ? "active" : ""}" onclick="dettaglioArchivio('${p.id}')">
                            <b>${escapeHtml(p.cognome)} ${escapeHtml(p.nome)}</b>
                            <span>${escapeHtml(p.motivo || "Motivo non indicato")}</span>
                            <small>${escapeHtml(p.dimessoIl || "Data chiusura non indicata")}</small>
                        </button>
                    `).join("") : `<div class="empty-state">Nessun paziente archiviato.</div>`}
                </div>
            </aside>
            <section class="dedalus-panel archive-detail-panel">
                ${selected ? `
                    <div class="dedalus-panel-head">
                        <div><p class="eyebrow">Scheda archiviata</p><h3>${escapeHtml(selected.cognome)} ${escapeHtml(selected.nome)}</h3></div>
                        <div class="header-actions">
                            <span class="ward-status">${escapeHtml(selected.dimissioneTipo || "Chiuso")}</span>
                            ${isAdminOperativo() ? `<button onclick="ripristinaDaArchivio('${selected.id}')">Ripristina attivo</button>` : ""}
                        </div>
                    </div>
                    <div class="archive-summary">
                        <div><b>CF</b><span>${escapeHtml(selected.cf || "Non indicato")}</span></div>
                        <div><b>Nascita</b><span>${escapeHtml(selected.nascita || "Non indicata")}</span></div>
                        <div><b>Dimesso il</b><span>${escapeHtml(selected.dimessoIl || "")}</span></div>
                        <div><b>Operatore</b><span>${escapeHtml(selected.dimessoDa || "")}</span></div>
                        <div class="span-2"><b>Motivo accesso</b><span>${escapeHtml(selected.motivo || "")}</span></div>
                        <div class="span-2"><b>Anamnesi</b><span>${escapeHtml(selected.anamnesi || selected.comorbidita || "")}</span></div>
                        <div><b>Allergie</b><span>${escapeHtml(selected.allergie || "")}</span></div>
                        <div><b>Terapia domiciliare</b><span>${escapeHtml(selected.terapiaDomiciliare || "")}</span></div>
                    </div>
                    <div class="archive-tables">
                        <section><h4>Referti</h4><table class="clinical-table"><thead><tr><th>Ora</th><th>Esame</th><th>Esito</th></tr></thead><tbody>${righeArchivio(selected.esami, "Nessun referto.")}</tbody></table></section>
                        <section><h4>Diario</h4><table class="clinical-table"><thead><tr><th>Ora</th><th>Tipo</th><th>Nota</th></tr></thead><tbody>${righeArchivio([...(selected.diario || []), ...(selected.visite || []), ...(selected.diarioClinico || [])], "Nessuna nota.")}</tbody></table></section>
                        <section><h4>Terapie</h4><table class="clinical-table"><thead><tr><th>Ora</th><th>Farmaco</th><th>Dettaglio</th></tr></thead><tbody>${righeArchivio([...(selected.terapia || []), ...(selected.terapie || [])], "Nessuna terapia.")}</tbody></table></section>
                    </div>
                ` : `<div class="empty-state">Archivio vuoto.</div>`}
            </section>
        </section>
    `;
}

function ripristinaDaArchivio(idArchivio) {
    if (!isAdminOperativo()) return alert("Solo l'amministratore puo ripristinare un paziente archiviato.");
    const idx = archivio.findIndex(p => p.id === idArchivio);
    if (idx === -1) return;
    const p = ensurePaziente({ ...archivio[idx] });
    delete p.dimessoIl;
    delete p.dimessoDa;
    delete p.dimissioneTipo;
    p.reparto = p.reparto || "ps";
    pazienti.push(p);
    archivio.splice(idx, 1);
    pazienteSelezionato = p;
    pagina = "cartella";
    logAction(`Ripristinato da archivio ${p.nome} ${p.cognome}`);
    salva();
    render();
}

function generaPazienteAdmin() {
    if (!isAdminOperativo()) return alert("Funzione disponibile solo per amministratore.");
    const nomi = ["Mario", "Giulia", "Lorenzo", "Anna", "Francesco", "Elena", "Davide", "Sara", "Paolo", "Marta"];
    const cognomi = ["Rossi", "Bianchi", "Conti", "Gori", "Ferrari", "Ricci", "Marini", "Romano", "Moretti", "Esposito"];
    const motivi = [
        "Dolore toracico oppressivo",
        "Dispnea ingravescente",
        "Dolore addominale acuto",
        "Trauma di arto inferiore",
        "Sincope con caduta a terra",
        "Febbre e stato confusionale",
        "Cefalea intensa a esordio improvviso",
        "Vomito incoercibile e disidratazione"
    ];
    const anamnesiPossibili = [
        "Ipertensione arteriosa in terapia. Pregressa colecistectomia. Autonomo nelle attivita quotidiane.",
        "Diabete mellito tipo 2, dislipidemia. Nessun ricovero recente riferito.",
        "BPCO lieve, ex fumatore. Episodi di bronchite ricorrente nei mesi invernali.",
        "Fibrillazione atriale parossistica. Pregresso accesso PS per cardiopalmo.",
        "Nessuna patologia cronica rilevante nota. Anamnesi chirurgica negativa.",
        "Insufficienza renale cronica lieve e ipertensione. Vive con familiare."
    ];
    const allergiePossibili = ["Nessuna allergia nota", "Penicillina", "FANS", "Mezzi di contrasto iodati", "Lattice", "Amoxicillina"];
    const terapiePossibili = [
        "Ramipril 5 mg 1 cp/die; Atorvastatina 20 mg la sera",
        "Metformina 1000 mg x2; Pantoprazolo 20 mg/die",
        "Apixaban 5 mg x2; Bisoprololo 2.5 mg/die",
        "Salbutamolo spray al bisogno; Tiotropio 1 inalazione/die",
        "Nessuna terapia domiciliare continuativa",
        "Amlodipina 5 mg/die; Furosemide 25 mg al mattino"
    ];
    const codici = ["Rosso", "Arancione", "Arancione", "Azzurro", "Verde", "Verde", "Bianco"];
    const nome = nomi[numeroCasuale(0, nomi.length - 1)];
    const cognome = cognomi[numeroCasuale(0, cognomi.length - 1)];
    const anno = numeroCasuale(1938, 2006);
    const codice = codici[numeroCasuale(0, codici.length - 1)];
    const motivo = motivi[numeroCasuale(0, motivi.length - 1)];
    const anamnesi = anamnesiPossibili[numeroCasuale(0, anamnesiPossibili.length - 1)];
    const allergie = allergiePossibili[numeroCasuale(0, allergiePossibili.length - 1)];
    const terapiaDomiciliare = terapiePossibili[numeroCasuale(0, terapiePossibili.length - 1)];
    const parametri = {
        fc: String(numeroCasuale(62, 118)),
        fr: String(numeroCasuale(12, 28)),
        sat: String(numeroCasuale(90, 99)),
        pa: `${numeroCasuale(105, 175)}/${numeroCasuale(60, 98)}`,
        temp: (numeroCasuale(360, 390) / 10).toFixed(1),
        gcs: String(numeroCasuale(13, 15)),
        dolore: String(numeroCasuale(0, 9))
    };
    const ingressoIso = new Date().toISOString();
    const p = ensurePaziente({
        id: id(),
        nome,
        cognome,
        nascita: `${String(numeroCasuale(1, 28)).padStart(2, "0")}/${String(numeroCasuale(1, 12)).padStart(2, "0")}/${anno}`,
        cf: `${cognome.slice(0, 3)}${nome.slice(0, 3)}${String(anno).slice(2)}X${numeroCasuale(100, 999)}`.toUpperCase(),
        codice,
        reparto: "ps",
        areaPS: codice === "Rosso" ? "psShock" : codice === "Arancione" ? "psOsservazione" : "psAttesa",
        motivo,
        parametri,
        arrivo: ingressoIso,
        createdAt: ingressoIso,
        ingresso: new Date().toLocaleString(),
        allergie,
        terapiaDomiciliare,
        anamnesi,
        comorbidita: anamnesi,
        familiarita: "Non documentata in fase di accettazione.",
        abitudini: "Da completare in colloquio clinico.",
        esami: [],
        terapia: [],
        diario: [{ time: new Date().toLocaleString(), tipo: "Accettazione", testo: `Paziente generato dall'amministratore. Motivo: ${motivo}.`, operatore: medicoLoggato?.nome || "Amministratore" }],
        parametriHistory: [{ time: new Date().toLocaleString(), ...parametri, operatore: medicoLoggato?.nome || "Amministratore" }]
    });
    pazienti.push(p);
    logAction(`Admin: generato paziente ${p.nome} ${p.cognome}`);
    pazienteSelezionato = p;
    pagina = "cartella";
    salva();
    render();
}

function eliminaPazienteAdmin(idP) {
    if (!isAdminOperativo()) return alert("Funzione disponibile solo per amministratore.");
    const p = pazienti.find(x => x.id === idP);
    if (!p) return;
    if (!confirm(`Eliminare definitivamente ${p.nome} ${p.cognome}?`)) return;
    pazienti = pazienti.filter(x => x.id !== idP);
    if (pazienteSelezionato?.id === idP) pazienteSelezionato = null;
    logAction(`Admin: eliminato paziente ${p.nome} ${p.cognome}`);
    salva();
    render();
}

function datiPazienteEditHTML(p) {
    const editable = canEditClinicalData();
    const disabled = editable ? "" : "disabled";
    return `
        <section class="dedalus-panel span-2 patient-edit-panel">
            <div class="dedalus-panel-head">
                <div><p class="eyebrow">Anagrafica e anamnesi</p><h3>Dati paziente</h3></div>
                ${editable ? `<button onclick="salvaDatiPazienteClinici()">Salva dati</button>` : `<span class="ward-status">Sola lettura</span>`}
            </div>
            <div class="patient-edit-grid">
                <label>Cognome<input id="editCognome" value="${escapeHtml(p.cognome || "")}" ${disabled}></label>
                <label>Nome<input id="editNome" value="${escapeHtml(p.nome || "")}" ${disabled}></label>
                <label>Data nascita<input id="editNascita" value="${escapeHtml(p.nascita || "")}" ${disabled}></label>
                <label>Codice fiscale<input id="editCf" value="${escapeHtml(p.cf || "")}" ${disabled}></label>
                <label>Codice priorita
                    <select id="editCodice" ${editable && codiceVisibilePaziente(p) ? "" : "disabled"}>
                        ${["Rosso", "Arancione", "Azzurro", "Verde", "Bianco"].map(c => `<option value="${c}" ${p.codice === c ? "selected" : ""}>${c}</option>`).join("")}
                    </select>
                </label>
                <label>Motivo accesso<input id="editMotivo" value="${escapeHtml(p.motivo || "")}" ${disabled}></label>
                <label class="span-2">Anamnesi<textarea id="editAnamnesi" ${disabled}>${escapeHtml(p.anamnesi || p.comorbidita || "")}</textarea></label>
                <label>Allergie<textarea id="editAllergie" ${disabled}>${escapeHtml(p.allergie || "")}</textarea></label>
                <label>Terapia domiciliare<textarea id="editTerapiaDomiciliare" ${disabled}>${escapeHtml(p.terapiaDomiciliare || "")}</textarea></label>
                <label class="span-2">Nota modifica / motivo cambio codice<textarea id="editNota" ${disabled}></textarea></label>
            </div>
        </section>
    `;
}

function salvaDatiPazienteClinici() {
    if (!canEditClinicalData()) return alert("Non hai il permesso di modificare i dati del paziente.");
    const p = pazienteSelezionato ? pazienti.find(x => x.id === pazienteSelezionato.id) || pazienteSelezionato : null;
    if (!p) return;
    const codicePrima = p.codice;
    p.cognome = fieldValue("editCognome");
    p.nome = fieldValue("editNome");
    p.nascita = fieldValue("editNascita");
    p.cf = fieldValue("editCf");
    p.motivo = fieldValue("editMotivo");
    p.anamnesi = fieldValue("editAnamnesi");
    p.comorbidita = p.anamnesi;
    p.allergie = fieldValue("editAllergie");
    p.terapiaDomiciliare = fieldValue("editTerapiaDomiciliare");
    if (codiceVisibilePaziente(p)) p.codice = fieldValue("editCodice") || p.codice;
    const nota = fieldValue("editNota");
    p.diario = p.diario || [];
    p.diario.push({
        time: new Date().toLocaleString(),
        tipo: codicePrima !== p.codice ? "Aggiornamento dati e priorita" : "Aggiornamento dati paziente",
        testo: `${codicePrima !== p.codice ? `Codice ${codicePrima || "n/d"} -> ${p.codice || "n/d"}. ` : ""}${nota || "Dati clinico-anagrafici aggiornati."}`,
        operatore: medicoLoggato?.nome || ""
    });
    logAction(`Aggiornati dati paziente ${p.nome} ${p.cognome}`);
    pazienteSelezionato = p;
    salva();
    render();
}

function clampNumber(value, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    return String(Math.max(min, Math.min(max, Math.round(n))));
}

function parsePA(pa) {
    const match = String(pa || "").match(/(\d+)\D+(\d+)/);
    return match ? { sys: Number(match[1]), dia: Number(match[2]) } : { sys: 120, dia: 75 };
}

function effettoFarmacoSimulato(farmaco) {
    const f = String(farmaco || "").toLowerCase();
    if (/salbutamolo/.test(f)) return { fc: 8, fr: -2, sat: 2, testo: "bronco-dilatazione con lieve tachicardia attesa" };
    if (/ipratropio/.test(f)) return { fr: -1, sat: 1, testo: "miglioramento respiratorio lieve" };
    if (/morfina|fentanil|tramadolo/.test(f)) return { fc: -5, fr: -2, sat: -1, dolore: -3, testo: "analgesia con possibile depressione respiratoria lieve" };
    if (/ketorolac|ibuprofene/.test(f)) return { dolore: -2, testo: "riduzione del dolore attesa" };
    if (/paracetamolo/.test(f)) return { temp: -0.4, dolore: -1, testo: "riduzione di febbre/dolore attesa" };
    if (/furosemide/.test(f)) return { sys: -8, dia: -4, sat: 1, testo: "riduzione congestione e pressione, monitorare diuresi" };
    if (/nitroglicerina/.test(f)) return { sys: -12, dia: -6, fc: 3, dolore: -1, testo: "vasodilatazione con calo pressorio atteso" };
    if (/adrenalina/.test(f)) return { fc: 20, sys: 18, dia: 8, sat: 2, testo: "risposta adrenergica con aumento FC/PA" };
    if (/noradrenalina/.test(f)) return { sys: 18, dia: 10, testo: "supporto vasopressorio con incremento pressorio" };
    if (/atropina/.test(f)) return { fc: 18, testo: "incremento della frequenza cardiaca" };
    if (/amiodarone|bisoprololo/.test(f)) return { fc: -12, testo: "riduzione della frequenza cardiaca/controllo ritmo" };
    if (/midazolam|diazepam/.test(f)) return { fr: -2, sat: -1, gcs: -1, testo: "sedazione con necessita di monitoraggio respiratorio" };
    if (/glucosio/.test(f)) return { gcs: 1, testo: "miglioramento neurologico se ipoglicemia" };
    if (/insulina/.test(f)) return { testo: "effetto metabolico: rivalutare glicemia e potassio" };
    if (/ceftriaxone|piperacillina|vancomicina/.test(f)) return { temp: -0.2, testo: "terapia antibiotica avviata, effetto clinico non immediato" };
    if (/ondansetron|metoclopramide/.test(f)) return { testo: "controllo nausea, parametri vitali sostanzialmente invariati" };
    return { testo: "terapia registrata, nessuna variazione automatica specifica" };
}

function applicaEffettoFarmacoParametri(p, terapia) {
    ensurePaziente(p);
    const effetto = effettoFarmacoSimulato(terapia.farmaco);
    const pa = parsePA(p.parametri?.pa);
    const temp = Number(p.parametri?.temp);
    const next = {
        fc: clampNumber(Number(p.parametri?.fc || 80) + (effetto.fc || 0), 35, 180),
        fr: clampNumber(Number(p.parametri?.fr || 16) + (effetto.fr || 0), 6, 45),
        sat: clampNumber(Number(p.parametri?.sat || 96) + (effetto.sat || 0), 70, 100),
        pa: `${clampNumber(pa.sys + (effetto.sys || 0), 60, 240)}/${clampNumber(pa.dia + (effetto.dia || 0), 35, 140)}`,
        temp: Number.isFinite(temp) ? (Math.max(34, Math.min(42, temp + (effetto.temp || 0))).toFixed(1)) : (effetto.temp ? (36.8 + effetto.temp).toFixed(1) : ""),
        gcs: clampNumber(Number(p.parametri?.gcs || 15) + (effetto.gcs || 0), 3, 15),
        dolore: clampNumber(Number(p.parametri?.dolore || 5) + (effetto.dolore || 0), 0, 10),
        time: new Date().toLocaleString(),
        operatore: medicoLoggato?.nome || "",
        origine: `Effetto terapia: ${terapia.farmaco}`,
        note: effetto.testo
    };
    p.parametri = { ...p.parametri, ...next };
    p.parametriHistory = p.parametriHistory || [];
    p.parametriHistory.push(next);
    p.diario = p.diario || [];
    p.diarioClinico = p.diarioClinico || [];
    const nota = { time: next.time, tipo: "Effetto terapia", testo: `${terapia.farmaco}: ${effetto.testo}. Parametri rivalutati automaticamente.`, operatore: medicoLoggato?.nome || "" };
    p.diario.push(nota);
    p.diarioClinico.push(nota);
    return effetto;
}

function precompilaFarmacoDaSelect() {
    const nome = fieldValue("farmacoNome");
    const f = BANCA_FARMACI_PS.find(x => x.nome === nome);
    if (!f) return;
    const doseEl = document.getElementById("farmacoDose");
    const viaEl = document.getElementById("farmacoVia");
    const noteEl = document.getElementById("farmacoNote");
    if (doseEl && !doseEl.value) doseEl.value = f.dose;
    if (viaEl) viaEl.value = (f.via.split("/")[0] || f.via);
    if (noteEl && !noteEl.value) noteEl.value = f.note;
}

addTerapia = function addTerapiaIntelligente() {
    const p = pazienteSelezionato;
    if (!p) return;
    const farmaco = fieldValue("farmacoNome");
    if (!farmaco) return alert("Seleziona almeno il farmaco.");
    p.terapie = p.terapie || [];
    const terapia = {
        id: id(),
        time: new Date().toLocaleString(),
        farmaco,
        dose: fieldValue("farmacoDose"),
        via: fieldValue("farmacoVia"),
        frequenza: fieldValue("farmacoFrequenza"),
        note: fieldValue("farmacoNote"),
        operatore: medicoLoggato?.nome || ""
    };
    p.terapie.push(terapia);
    const effetto = applicaEffettoFarmacoParametri(p, terapia);
    aiApplicaFarmacoDaCartella?.(p, terapia, "Terapia cartella");
    logAction(`Registrata terapia per ${p.nome} ${p.cognome}: ${farmaco}. Effetto: ${effetto.testo}`);
    salva();
    pazienteSelezionato = pazienti.find(x => x.id === p.id) || p;
    render();
};

function lista(app) {
    completaRefertiScaduti(false);
    const critici = pazienti.filter(p => ["Rosso", "Arancione"].includes(p.codice)).length;
    const ricoverati = pazienti.filter(p => ensurePaziente(p).letto).length;
    const referti = pazienti.reduce((tot, p) => tot + refertiPendenti(p), 0);
    app.innerHTML = `
        <div class="page-header dedalus-record-head">
            <div>
                <p class="eyebrow">Lista trasversale</p>
                <h2>Lista pazienti</h2>
                <span>Elenco generale: PS, reparti, ricoveri e archivio operativo.</span>
            </div>
            <div class="header-actions">
                ${multiOperatoreBadge()}
                ${isAdminOperativo() ? `<button onclick="generaPazienteAdmin()">Genera paziente</button>` : ""}
                <button onclick="pagina='prontoSoccorso'; render()">Pronto Soccorso</button>
                <button onclick="pagina='nuovo'; render()">Nuovo paziente</button>
                <button onclick="pagina='ricoveri'; render()">Ricoveri e letti</button>
            </div>
        </div>
        <section class="dedalus-kpi-row">
            <div><b>${pazienti.filter(p => ensurePaziente(p).reparto === "ps" && !p.letto).length}</b><span>In PS</span></div>
            <div><b>${ricoverati}</b><span>Ricoverati</span></div>
            <div><b>${critici}</b><span>Alta priorita</span></div>
            <div><b>${referti}</b><span>Referti attesi</span></div>
        </section>
        <section class="dedalus-panel ps-worklist">
            <div class="dedalus-panel-head">
                <div><p class="eyebrow">Worklist</p><h3>Pazienti attivi</h3></div>
                <div class="table-tools">
                    ${["Tutti", "Rosso", "Arancione", "Verde", "Bianco"].map(c => `<button onclick="filtroTriage='${c}'; render()">${c}</button>`).join("")}
                </div>
            </div>
            <div class="table-wrap">
                <table class="clinical-table patient-worklist">
                    <thead><tr><th>Codice</th><th>Paziente</th><th>Eta</th><th>Motivo</th><th>Destinazione</th><th>Referti</th><th>Tempo</th><th>Azioni</th></tr></thead>
                    <tbody>
                        ${pazienti
                            .filter(p => filtroTriage === "Tutti" || p.codice === filtroTriage)
                            .sort((a, b) => prioritaLista(a.codice) - prioritaLista(b.codice))
                            .map(p => `
                                <tr class="patient-row ${triageClass(p.codice)}">
                                    <td>${codiceVisibilePaziente(p) ? `<span class="triage-badge ${triageClass(p.codice)}">${escapeHtml(p.codice || "n/d")}</span>` : `<span class="ward-status">Ricovero</span>`}</td>
                                    <td><b>${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</b><small>${escapeHtml(p.cf || "CF non indicato")}</small></td>
                                    <td>${escapeHtml(etaPaziente(p.nascita))}</td>
                                    <td>${escapeHtml(p.motivo || "Non indicato")}</td>
                                    <td><b>${escapeHtml(statoPercorsoPaziente(p))}</b><small>${escapeHtml(p.reparto === "ps" ? areaPSLabel(p) : lettoLabel(p))}</small></td>
                                    <td>${refertiPendenti(p) ? `<span class="exam-status progress">${refertiPendenti(p)} in corso</span>` : `<span class="exam-status done">ok</span>`}</td>
                                    <td>${escapeHtml(tempoPermanenza(p))}</td>
                                    <td class="row-actions"><button onclick="apri('${p.id}')">Cartella</button>${isAdminOperativo() ? `<button class="danger" onclick="eliminaPazienteAdmin('${p.id}')">Elimina</button>` : ""}</td>
                                </tr>
                            `).join("") || `<tr><td colspan="8">Nessun paziente presente.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </section>
    `;
}

function cartella(app) {
    let p = ensurePaziente(pazienteSelezionato);
    if (!p) {
        pagina = "ps";
        render();
        return;
    }
    const refertiInCorso = refertiPendenti(p);
    const cartellaTabs = `
        <nav class="record-tabs-modern">
            <button onclick="document.getElementById('cartella-inquadramento')?.scrollIntoView({behavior:'smooth', block:'start'})">Inquadramento</button>
            <button onclick="document.getElementById('cartella-diagnosi')?.scrollIntoView({behavior:'smooth', block:'start'})">Diagnosi</button>
            <button onclick="document.getElementById('cartella-protocollo')?.scrollIntoView({behavior:'smooth', block:'start'})">Percorso</button>
            <button onclick="document.getElementById('cartella-parametri')?.scrollIntoView({behavior:'smooth', block:'start'})">Parametri</button>
            <button onclick="document.getElementById('cartella-terapia')?.scrollIntoView({behavior:'smooth', block:'start'})">Terapia</button>
            <button onclick="document.getElementById('cartella-sviluppo')?.scrollIntoView({behavior:'smooth', block:'start'})">Sviluppo</button>
            <button onclick="document.getElementById('cartella-referti')?.scrollIntoView({behavior:'smooth', block:'start'})">Referti</button>
        </nav>
    `;
    app.innerHTML = `
        <div class="page-header dedalus-record-head patient-record-header">
            <div class="patient-identity">
                ${iconImg(patientIcon(p), "Paziente")}
                <div>
                    <p class="eyebrow">Cartella clinica integrata</p>
                    <h2>${escapeHtml(p.cognome)} ${escapeHtml(p.nome)}</h2>
                    <span>${escapeHtml(p.cf || "CF non indicato")} | ${escapeHtml(etaPaziente(p.nascita))} | ${escapeHtml(statoPercorsoPaziente(p))} | ${escapeHtml(lettoLabel(p))}</span>
                </div>
            </div>
            <div class="header-actions">
                ${codiceVisibilePaziente(p) ? `<span class="triage-badge ${triageClass(p.codice)}">${escapeHtml(p.codice || "n/d")}</span>` : `<span class="ward-status">Ricovero</span>`}
                <button onclick="generaECG()">ECG</button>
                <button onclick="pagina='ricoveri'; render()">Letti</button>
                <button onclick="chiudiPercorsoPaziente()">Chiudi percorso</button>
                <button onclick="pagina='ps'; render()">Torna</button>
            </div>
        </div>
        ${ultimoAvvisoReferti ? `<div class="exam-alert">${escapeHtml(ultimoAvvisoReferti)}</div>` : ""}
        ${cartellaTabs}
        <section class="record-strip">
            <div><b>Motivo</b><span>${escapeHtml(p.motivo || "Non indicato")}</span></div>
            <div><b>Parametri</b><span>FC ${escapeHtml(p.parametri.fc || "-")} | SpO2 ${escapeHtml(p.parametri.sat || "-")} | PA ${escapeHtml(p.parametri.pa || "-")}</span></div>
            <div><b>Referti</b><span>${refertiInCorso ? `${refertiInCorso} in corso` : "nessuno in attesa"}</span></div>
            <div><b>Reparto</b><span>${escapeHtml(labelReparto(p.reparto))}${p.letto ? " | " + escapeHtml(p.letto.label) : ""}</span></div>
            <div><b>Destinazione</b><select id="repartoCartella" onchange="cambiaRepartoPaziente()"><option value="ps" ${p.reparto === "ps" ? "selected" : ""}>Pronto Soccorso</option>${Object.entries(REPARTI_LETTI).map(([key, r]) => `<option value="${key}" ${p.reparto === key ? "selected" : ""}>${escapeHtml(r.nome)}</option>`).join("")}</select></div>
        </section>
        <div class="record-grid">
            <section class="dedalus-panel span-2" id="cartella-inquadramento">
                <div class="dedalus-panel-head clear-head"><div><p class="eyebrow">Valutazione</p><h3>Inquadramento clinico</h3></div><span class="mini-count">${timelineClinica(p).length} eventi</span></div>
                <div class="clinical-focus-grid">
                    <div class="focus-main"><b>Problema principale</b><span>${escapeHtml(p.motivo || "Non indicato")}</span></div>
                    <div><b>Percorso</b><span>${escapeHtml(statoPercorsoPaziente(p))}</span></div>
                    <div><b>Area</b><span>${escapeHtml(p.reparto === "ps" ? areaPSLabel(p) : lettoLabel(p))}</span></div>
                    <div><b>Referti</b><span>${refertiInCorso ? `${refertiInCorso} in attesa` : "nessuno in attesa"}</span></div>
                </div>
                <div class="clinical-alerts">${alertCliniciHTML(p)}</div>
            </section>
            ${datiPazienteEditHTML(p)}
            <div id="cartella-diagnosi" class="span-2">${diagnosiPanelHTML(p)}</div>
            ${suggerimentiCliniciHTML(p)}
            <section class="dedalus-panel" id="cartella-parametri">
                <div class="dedalus-panel-head"><div><p class="eyebrow">Monitoraggio</p><h3>Parametri vitali</h3></div><button onclick="salvaParametri()">Registra</button></div>
                <div class="vitals-grid">
                    <label>FC<input id="fc" type="number" placeholder="bpm" value="${escapeHtml(p.parametri.fc || "")}"></label>
                    <label>FR<input id="fr" type="number" placeholder="/min" value="${escapeHtml(p.parametri.fr || "")}"></label>
                    <label>SpO2<input id="sat" type="number" placeholder="%" value="${escapeHtml(p.parametri.sat || "")}"></label>
                    <label>PA<input id="pa" placeholder="120/80" value="${escapeHtml(p.parametri.pa || "")}"></label>
                    <label>Temp<input id="temp" type="number" step="0.1" placeholder="C" value="${escapeHtml(p.parametri.temp || "")}"></label>
                    <label>GCS<input id="gcs" type="number" min="3" max="15" value="${escapeHtml(p.parametri.gcs || "")}"></label>
                    <label>Dolore<input id="dolore" type="number" min="0" max="10" value="${escapeHtml(p.parametri.dolore || "")}"></label>
                </div>
                ${variazioneParametriHTML(p)}
            </section>
            <section class="dedalus-panel">
                <div class="dedalus-panel-head"><div><p class="eyebrow">Richieste</p><h3>Diagnostica</h3></div><span class="mini-count">${refertiInCorso}</span></div>
                <select id="esameNome">${esamiCatalogoHTML()}</select><select id="esameUrgenza"><option>Routine PS</option><option>Urgente</option><option>Emergenza</option></select>
                <input id="esameRichiedente" placeholder="Quesito clinico"><textarea id="esameNote" placeholder="Note per diagnostica o laboratorio"></textarea>
                <div class="button-row"><button onclick="addEsami()">Richiedi</button><button onclick="controllaReferti()">Controlla</button></div>
            </section>
            <section class="dedalus-panel" id="cartella-terapia">
                <div class="dedalus-panel-head"><div><p class="eyebrow">Terapia</p><h3>Farmaci</h3></div></div>
                <select id="farmacoNome" onchange="precompilaFarmacoDaSelect()"><option value="">Seleziona farmaco</option>${farmacoOptionsHTML()}</select>
                <select id="farmacoDose"><option value="">Dose</option>${[...new Set(BANCA_FARMACI_PS.map(f => f.dose))].map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join("")}</select>
                <select id="farmacoVia"><option>EV</option><option>IM</option><option>OS</option><option>SC</option><option>Aerosol</option><option>SL</option><option>IN</option><option>Topica</option></select>
                <select id="farmacoFrequenza"><option>Somministrazione unica</option><option>Al bisogno</option><option>Ogni 6 ore</option><option>Ogni 8 ore</option><option>Ogni 12 ore</option><option>Infusione continua</option></select>
                <select id="farmacoNote"><option value="">Indicazione / note</option><option>Dolore</option><option>Febbre</option><option>Dispnea / broncospasmo</option><option>Dolore toracico</option><option>Shock / ipotensione</option><option>Nausea o vomito</option><option>Crisi convulsiva / agitazione</option><option>Sepsi / infezione</option><option>Secondo protocollo</option></select><button onclick="addTerapia()">Registra terapia</button>
                <h4>Banca farmaci PS</h4>
                ${bancaFarmaciHTML()}
            </section>
            <section class="dedalus-panel compact-note-panel">
                <div class="dedalus-panel-head"><div><p class="eyebrow">Diario</p><h3>Nota clinica</h3></div></div>
                <select id="diarioTipo"><option>Valutazione medica</option><option>Rivalutazione infermieristica</option><option>Consulenza</option><option>Decorso</option><option>Diagnosi</option></select>
                <textarea id="diarioTesto" placeholder="Valutazione, obiettivita, ipotesi, piano"></textarea><button onclick="addVisita()">Registra nota</button>
            </section>
            ${repartoSpecificoHTML(p)}
            ${trattamentiSpecialisticiHTML(p)}
            ${chirurgiaPazienteHTML(p)}
            ${p.aiScenarioId ? aiCartellaPanelHTML(aiScenarioDaCartella()) : ""}
            <section class="dedalus-panel span-2"><div class="dedalus-panel-head"><div><p class="eyebrow">Storico</p><h3>Parametri seriali</h3></div></div><div class="table-wrap"><table class="clinical-table"><thead><tr><th>Ora</th><th>FC</th><th>FR</th><th>SpO2</th><th>PA</th><th>Temp</th><th>GCS</th><th>Dolore</th></tr></thead><tbody>${formatParametriHistory(p) || `<tr><td colspan="8">Nessuna rilevazione.</td></tr>`}</tbody></table></div></section>
            <section class="dedalus-panel span-2" id="cartella-sviluppo"><div class="dedalus-panel-head"><div><p class="eyebrow">Timeline</p><h3>Sviluppo clinico e cambiamenti</h3></div></div><div class="clinical-timeline">${timelineClinicaHTML(p)}</div></section>
            <section class="dedalus-panel span-2" id="cartella-referti"><div class="dedalus-panel-head"><div><p class="eyebrow">Referti</p><h3>Esami richiesti</h3></div></div><div class="table-wrap"><table class="clinical-table"><thead><tr><th>Richiesto</th><th>Esame</th><th>Quesito</th><th>Stato</th><th>Urgenza</th><th>Referto</th></tr></thead><tbody>${formatEsami(p.esami) || `<tr><td colspan="6">Nessun esame.</td></tr>`}</tbody></table></div></section>
            <section class="dedalus-panel span-2"><div class="dedalus-panel-head"><div><p class="eyebrow">ECG</p><h3>Tracciato</h3></div><span class="mini-count">${(p.ecgHistory || []).length}</span></div><canvas id="ecgCanvas" class="ecg-canvas" width="960" height="260"></canvas></section>
        </div>
    `;
    disegnaUltimoECG();
    ultimoAvvisoReferti = "";
    aiEnhanceCartella();
}

function righePdf(items, mapper, empty = "Nessun dato registrato") {
    const rows = (items || []).map(mapper).filter(Boolean).join("");
    return rows || `<tr><td colspan="4">${escapeHtml(empty)}</td></tr>`;
}

function tabellaParametriPdf(p) {
    const rows = (p.parametriHistory || []).slice(-12).map(v => `
        <tr><td>${escapeHtml(v.time || "")}</td><td>FC ${escapeHtml(v.fc || "-")} | FR ${escapeHtml(v.fr || "-")} | SpO2 ${escapeHtml(v.sat || "-")}</td><td>PA ${escapeHtml(v.pa || "-")} | T ${escapeHtml(v.temp || "-")}</td><td>${escapeHtml(v.note || v.origine || "")}</td></tr>
    `).join("");
    return rows || `<tr><td colspan="4">Nessuna rilevazione seriale.</td></tr>`;
}

function stampaDimissione(p, operatore, dimessoIl) {
    const diagnosi = p.diagnosiPrincipale || p.diagnosiLibera || p.chirurgia?.diagnosi || p.medicinaInterna?.diagnosi || "Non indicata";
    const diario = [...(p.diarioClinico || []), ...(p.diario || []), ...(p.visite || [])]
        .sort((a, b) => (Date.parse(a.time || "") || 0) - (Date.parse(b.time || "") || 0));
    const ecg = p.ecgHistory || [];
    const interventi = p.interventiChirurgici || [];
    const trattamenti = p.trattamentiSpecialistici || [];
    const win = window.open("", "_blank");
    win.document.write(`
        <html>
        <head>
            <title>Lettera di dimissione - ${escapeHtml(p.cognome)} ${escapeHtml(p.nome)}</title>
            <style>
                body { margin: 0; padding: 24px; background: #eef2f6; color: #162334; font-family: Arial, sans-serif; }
                .doc { max-width: 980px; margin: 0 auto; background: #fff; border: 1px solid #aebdca; }
                .head { display: grid; grid-template-columns: 1fr auto; gap: 16px; padding: 22px 26px; border-bottom: 4px solid #0b5f86; }
                .brand { font-size: 22px; font-weight: 800; color: #07304d; }
                .meta { text-align: right; font-size: 12px; color: #526477; line-height: 1.5; }
                h1 { margin: 0; padding: 18px 26px 8px; font-size: 21px; color: #07304d; }
                h2 { margin: 18px 0 8px; font-size: 14px; color: #07304d; border-bottom: 1px solid #cad6e0; padding-bottom: 5px; }
                .content { padding: 0 26px 26px; }
                .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
                .field { border: 1px solid #c6d2dd; padding: 8px; min-height: 42px; }
                .field b { display: block; font-size: 11px; color: #526477; text-transform: uppercase; margin-bottom: 3px; }
                .span-2 { grid-column: span 2; } .span-4 { grid-column: 1 / -1; }
                table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 12px; }
                th, td { border: 1px solid #c6d2dd; padding: 6px; vertical-align: top; overflow-wrap: anywhere; }
                th { background: #eef5fb; color: #07304d; text-align: left; }
                .box { border: 1px solid #c6d2dd; padding: 8px; white-space: pre-wrap; min-height: 38px; font-size: 12px; }
                .sign { display: flex; justify-content: flex-end; margin-top: 34px; }
                .sign div { width: 310px; border-top: 1px solid #162334; padding-top: 7px; text-align: center; }
                @media print { body { background: #fff; padding: 0; } .doc { border: none; max-width: none; } }
            </style>
        </head>
        <body>
            <main class="doc">
                <header class="head">
                    <div><div class="brand">HOSPITAL 1 - CARTELLA CLINICA</div><div>Lettera di dimissione / chiusura percorso</div></div>
                    <div class="meta">Data chiusura: ${escapeHtml(dimessoIl)}<br>Operatore chiusura: ${escapeHtml(operatore)}<br>Documento generato elettronicamente</div>
                </header>
                <h1>Relazione clinica finale</h1>
                <section class="content">
                    <h2>Dati paziente</h2>
                    <div class="grid">
                        <div class="field"><b>Paziente</b>${escapeHtml(p.cognome)} ${escapeHtml(p.nome)}</div>
                        <div class="field"><b>Nascita</b>${escapeHtml(p.nascita || "")}</div>
                        <div class="field"><b>Codice fiscale</b>${escapeHtml(p.cf || "")}</div>
                        <div class="field"><b>Priorita PS</b>${escapeHtml(p.codiceRepartoStorico || p.codice || "")}</div>
                        <div class="field span-2"><b>Motivo accesso</b>${escapeHtml(p.motivo || "")}</div>
                        <div class="field"><b>Reparto</b>${escapeHtml(labelReparto(p.reparto))}</div>
                        <div class="field"><b>Letto/area</b>${escapeHtml(lettoLabel(p))}</div>
                        <div class="field span-2"><b>Anamnesi</b>${escapeHtml(p.anamnesi || p.comorbidita || "")}</div>
                        <div class="field"><b>Allergie</b>${escapeHtml(p.allergie || "")}</div>
                        <div class="field"><b>Terapia domiciliare</b>${escapeHtml(p.terapiaDomiciliare || "")}</div>
                    </div>

                    <h2>Diagnosi e decisione clinica</h2>
                    <div class="grid">
                        <div class="field span-2"><b>Diagnosi</b>${escapeHtml(diagnosi)}</div>
                        <div class="field"><b>Certezza</b>${escapeHtml(p.diagnosiCertezza || "")}</div>
                        <div class="field"><b>Priorita clinica</b>${escapeHtml(p.diagnosiPriorita || "")}</div>
                    </div>

                    <h2>Andamento parametri</h2>
                    <table><thead><tr><th>Ora</th><th>Respiratorio/cardiaco</th><th>PA/temperatura</th><th>Nota</th></tr></thead><tbody>${tabellaParametriPdf(p)}</tbody></table>

                    <h2>Referti ed esami</h2>
                    <table><thead><tr><th>Ora</th><th>Esame</th><th>Stato</th><th>Referto</th></tr></thead><tbody>${righePdf(p.esami, e => `<tr><td>${escapeHtml(e.time || "")}</td><td>${escapeHtml(e.nome || e.tipo || "")}</td><td>${escapeHtml(e.stato || "")}</td><td>${escapeHtml(e.esito || e.referto || e.richiedente || "")}</td></tr>`, "Nessun esame registrato")}</tbody></table>

                    <h2>Terapie</h2>
                    <table><thead><tr><th>Ora</th><th>Farmaco</th><th>Dose/via</th><th>Note</th></tr></thead><tbody>${righePdf(p.terapie, t => `<tr><td>${escapeHtml(t.time || "")}</td><td>${escapeHtml(t.farmaco || "")}</td><td>${escapeHtml(`${t.dose || ""} ${t.via || ""}`)}</td><td>${escapeHtml(`${t.frequenza || ""} ${t.note || ""}`)}</td></tr>`, "Nessuna terapia registrata")}</tbody></table>

                    <h2>Trattamenti specialistici e interventi</h2>
                    <table><thead><tr><th>Ora</th><th>Tipo</th><th>Stato</th><th>Dettaglio</th></tr></thead><tbody>
                        ${righePdf(trattamenti, t => `<tr><td>${escapeHtml(t.time || "")}</td><td>${escapeHtml(t.trattamento || "")}</td><td>${escapeHtml(t.esito || "")}</td><td>${escapeHtml(t.nota || "")}</td></tr>`, "")}
                        ${righePdf(interventi, i => `<tr><td>${escapeHtml(i.time || "")}</td><td>${escapeHtml(i.procedura || "Intervento")}</td><td>Concluso</td><td>${escapeHtml(`${i.sala || ""} - ${i.motivo || ""} - prenota ${i.prenotatoDa || ""} - chiude ${i.conclusoDa || ""}`)}</td></tr>`, "")}
                    </tbody></table>

                    <h2>ECG</h2>
                    <table><thead><tr><th>Ora</th><th>Ritmo</th><th>FC</th><th>Note</th></tr></thead><tbody>${righePdf(ecg, e => `<tr><td>${escapeHtml(e.time || "")}</td><td>${escapeHtml(e.ritmo || "")}</td><td>${escapeHtml(e.fc || "")}</td><td>Tracciato generato in cartella.</td></tr>`, "Nessun ECG registrato")}</tbody></table>

                    <h2>Decorso clinico</h2>
                    <table><thead><tr><th>Ora</th><th>Tipo</th><th>Evento</th><th>Operatore</th></tr></thead><tbody>${righePdf(diario, d => `<tr><td>${escapeHtml(d.time || "")}</td><td>${escapeHtml(d.tipo || "")}</td><td>${escapeHtml(d.testo || d.titolo || d.diagnosi || "")}</td><td>${escapeHtml(d.operatore || "")}</td></tr>`, "Decorso non documentato")}</tbody></table>

                    <h2>Indicazioni finali</h2>
                    <div class="box">Controllo clinico secondo indicazione medica. Rivalutazione urgente in caso di peggioramento, febbre persistente, dolore ingravescente, dispnea, sincope o comparsa di nuovi sintomi. Documento firmato dall'operatore che chiude il percorso.</div>
                    <div class="sign"><div>Firma operatore<br><b>${escapeHtml(operatore)}</b></div></div>
                </section>
            </main>
            <script>window.onload = () => window.print();</script>
        </body>
        </html>
    `);
    win.document.close();
}

dimetti = function dimettiFinaleProfessionale() {
    const index = pazienti.findIndex(x => x.id === pazienteSelezionato?.id);
    if (index === -1 || !pazienteSelezionato) return alert("Paziente non valido");
    const p = ensurePaziente(pazienti[index]);
    const operatore = medicoLoggato?.nome || "";
    const dimessoIl = new Date().toLocaleString();
    archivio.push({ ...p, dimessoIl, dimessoDa: operatore });
    logAction("Dimesso paziente " + p.nome + " " + p.cognome);
    pazienti.splice(index, 1);
    salva();
    pazienteSelezionato = null;
    pagina = "ps";
    render();
    stampaDimissione(p, operatore, dimessoIl);
};

const intervento118ListaViewWorkstationBase = typeof intervento118ListaView === "function" ? intervento118ListaView : null;
intervento118ListaView = function(app) {
    if (app) app.innerHTML = `<section class="dedalus-panel"><div class="empty-state">Modulo 118 temporaneamente disattivato.</div></section>`;
};

function chiusuraRepartiOptionsHTML(selected = "") {
    return Object.entries(REPARTI_LETTI || {}).map(([key, reparto]) => `
        <option value="${escapeHtml(key)}" ${selected === key ? "selected" : ""}>${escapeHtml(reparto.nome || key)}</option>
    `).join("");
}

function apriChiusuraPercorso() {
    const p = pazienteSelezionato ? ensurePaziente(pazienteSelezionato) : null;
    if (!p) return;
    document.getElementById("closureModal")?.remove();
    const referti = refertiPendenti(p);
    const defaultEsito = p.letto || (p.reparto && p.reparto !== "ps") ? "ricovero" : "dimissione";
    document.body.insertAdjacentHTML("beforeend", `
        <div id="closureModal" class="modal-backdrop closure-backdrop">
            <section class="closure-modal">
                <div class="closure-head">
                    <div>
                        <p class="eyebrow">Chiusura percorso</p>
                        <h2>${escapeHtml(p.cognome)} ${escapeHtml(p.nome)}</h2>
                        <span>${escapeHtml(p.cf || "CF non indicato")} - ${escapeHtml(etaPaziente(p.nascita))} - ${escapeHtml(statoPercorsoPaziente(p))}</span>
                    </div>
                    <button class="secondary-btn" onclick="chiudiChiusuraPercorso()">Chiudi</button>
                </div>
                <div class="closure-grid">
                    <label>Esito percorso
                        <select id="closureEsito" onchange="aggiornaChiusuraPercorsoUI()">
                            <option value="dimissione" ${defaultEsito === "dimissione" ? "selected" : ""}>Dimissione a domicilio</option>
                            <option value="dimissione-protetta">Dimissione protetta / controllo programmato</option>
                            <option value="ricovero" ${defaultEsito === "ricovero" ? "selected" : ""}>Ricovero in reparto</option>
                            <option value="trasferimento">Trasferimento ad altra struttura</option>
                            <option value="decesso">Decesso</option>
                            <option value="abbandono">Abbandono / allontanamento</option>
                        </select>
                    </label>
                    <label>Diagnosi finale
                        <select id="closureDiagnosi">
                            <option value="">Diagnosi non indicata</option>
                            ${diagnosiOptionsHTML(p.diagnosiPrincipale || "")}
                        </select>
                    </label>
                    <label id="closureRepartoBox">Reparto destinazione
                        <select id="closureReparto">${chiusuraRepartiOptionsHTML(p.reparto !== "ps" ? p.reparto : "medicinaInterna")}</select>
                    </label>
                    <label>Condizioni alla chiusura
                        <select id="closureCondizioni">
                            <option>Stabile</option>
                            <option>Stabile con indicazioni</option>
                            <option>Da monitorare</option>
                            <option>Critico / instabile</option>
                            <option>Non valutabile</option>
                        </select>
                    </label>
                    <label class="span-2">Terapia e indicazioni finali
                        <textarea id="closureIndicazioni" placeholder="Terapia domiciliare, controlli, warning signs, follow-up o indicazioni al reparto"></textarea>
                    </label>
                    <label class="span-2">Nota conclusiva
                        <textarea id="closureNota" placeholder="Sintesi del decorso, referti rilevanti, decisione condivisa, comunicazioni effettuate"></textarea>
                    </label>
                    <label class="closure-check"><input id="closureStampa" type="checkbox" checked> Genera documento PDF/print professionale</label>
                    <label class="closure-check ${referti ? "attention" : ""}"><input id="closureRefertiOk" type="checkbox" ${referti ? "" : "checked"}> ${referti ? `${referti} referti ancora in corso: chiudere comunque` : "Referti disponibili/nessun referto pendente"}</label>
                </div>
                <div class="closure-summary">
                    <div><b>Parametri</b><span>FC ${escapeHtml(p.parametri?.fc || "-")} - SpO2 ${escapeHtml(p.parametri?.sat || "-")} - PA ${escapeHtml(p.parametri?.pa || "-")}</span></div>
                    <div><b>Referti</b><span>${referti ? `${referti} in corso` : "nessuno in attesa"}</span></div>
                    <div><b>Operatore</b><span>${escapeHtml(medicoLoggato?.nome || "")}</span></div>
                </div>
                <div class="closure-actions">
                    <button class="secondary-btn" onclick="chiudiChiusuraPercorso()">Annulla</button>
                    <button onclick="confermaChiusuraPercorso()">Conferma chiusura</button>
                </div>
            </section>
        </div>
    `);
    aggiornaChiusuraPercorsoUI();
}

function aggiornaChiusuraPercorsoUI() {
    const esito = fieldValue("closureEsito");
    const repartoBox = document.getElementById("closureRepartoBox");
    if (repartoBox) repartoBox.style.display = esito === "ricovero" ? "" : "none";
}

function chiudiChiusuraPercorso() {
    document.getElementById("closureModal")?.remove();
}

function confermaChiusuraPercorso() {
    const index = pazienti.findIndex(x => x.id === pazienteSelezionato?.id);
    if (index === -1) return alert("Paziente non valido.");
    const p = ensurePaziente(pazienti[index]);
    const referti = refertiPendenti(p);
    if (referti && !document.getElementById("closureRefertiOk")?.checked) {
        alert("Sono presenti referti ancora in corso. Conferma esplicitamente la chiusura oppure attendi i referti.");
        return;
    }
    const esito = fieldValue("closureEsito") || "dimissione";
    const diagnosi = fieldValue("closureDiagnosi");
    const condizioni = fieldValue("closureCondizioni") || "Stabile";
    const indicazioni = fieldValue("closureIndicazioni");
    const notaFinale = fieldValue("closureNota");
    const operatore = medicoLoggato?.nome || "";
    const now = new Date().toLocaleString();
    const stampaDocumento = document.getElementById("closureStampa")?.checked;
    if (diagnosi) p.diagnosiPrincipale = diagnosi;
    p.condizioniChiusura = condizioni;
    p.indicazioniFinali = indicazioni;
    p.notaChiusura = notaFinale;
    p.diarioClinico = p.diarioClinico || [];

    if (esito === "ricovero") {
        const reparto = fieldValue("closureReparto") || "medicinaInterna";
        p.reparto = reparto;
        p.areaPS = "";
        p.dimissioneTipo = "";
        p.diarioClinico.push({
            time: now,
            tipo: "Chiusura percorso PS",
            titolo: "Ricovero in reparto",
            testo: `Paziente inviato a ${labelReparto(reparto)}. Condizioni: ${condizioni}. ${notaFinale || indicazioni || ""}`,
            operatore
        });
        logAction(`Chiusura PS con ricovero ${p.nome} ${p.cognome} -> ${labelReparto(reparto)}`);
        pazienteSelezionato = p;
        salva();
        chiudiChiusuraPercorso();
        pagina = "ricoveri";
        render();
        return;
    }

    const labelEsito = {
        "dimissione": "Dimissione a domicilio",
        "dimissione-protetta": "Dimissione protetta",
        "trasferimento": "Trasferimento ad altra struttura",
        "decesso": "Decesso",
        "abbandono": "Abbandono / allontanamento"
    }[esito] || esito;
    p.dimissioneTipo = labelEsito;
    p.dimessoIl = now;
    p.dimessoDa = operatore;
    p.diarioClinico.push({
        time: now,
        tipo: "Chiusura percorso",
        titolo: labelEsito,
        testo: `Diagnosi finale: ${diagnosi || "non indicata"}. Condizioni: ${condizioni}. ${indicazioni || ""} ${notaFinale || ""}`.trim(),
        operatore
    });
    const archiviato = { ...p, dimessoIl: now, dimessoDa: operatore, dimissioneTipo: labelEsito };
    archivio.push(archiviato);
    pazienti.splice(index, 1);
    logAction(`Chiuso percorso ${p.nome} ${p.cognome}: ${labelEsito}`);
    salva();
    chiudiChiusuraPercorso();
    pazienteSelezionato = null;
    pagina = "ps";
    render();
    if (stampaDocumento) stampaDimissione(archiviato, operatore, now);
}

chiudiPercorsoPaziente = apriChiusuraPercorso;

function contestoClinicoReferto(p, e) {
    return [
        p?.diagnosiPrincipale,
        p?.diagnosiLibera,
        p?.motivo,
        p?.anamnesi,
        p?.comorbidita,
        p?.ortopedia?.frattura,
        p?.ortopedia?.trauma,
        p?.chirurgia?.diagnosi,
        p?.medicinaInterna?.diagnosi,
        e?.nome,
        e?.tipo,
        e?.richiedente,
        e?.note
    ].filter(Boolean).join(" ").toLowerCase();
}

function scenarioReferto(p, e) {
    const c = contestoClinicoReferto(p, e);
    if (/stemi|sopraslivell|infarto.*st|sindrome coronarica acuta st/.test(c)) return "stemi";
    if (/nstemi|angina instabile|sindrome coronarica/.test(c)) return "nstemi";
    if (/frattura|lussazione|trauma|caduta|polso|mano|femore|caviglia|bacino|spalla|gomito|gamba|piede/.test(c)) return "frattura";
    if (/sepsi|shock settico|infezion|polmonite|pielonefrite|febbre|pcr|pct|emocolture|addensamento/.test(c)) return "infezione";
    if (/ictus|stroke|emorragia cerebrale|tia|deficit neurologico|afasia|emiparesi/.test(c)) return "stroke";
    if (/appendicite|colecistite|diverticolite|occlusione|perforazione|addome acuto|pancreatite|colangite/.test(c)) return "addome-acuto";
    if (/embolia polmonare|tep|dispnea.*dolore|d-dimero|angio-tac/.test(c)) return "embolia";
    if (/bpco|asma|insufficienza respiratoria|dispnea|broncospasmo/.test(c)) return "respiratorio";
    return "normale";
}

const refertoPerEsameBaseClinico = typeof refertoPerEsame === "function" ? refertoPerEsame : null;
refertoPerEsame = function refertoPerEsameCoerente(esame, p = pazienteSelezionato || {}) {
    const nome = nomeEsameReferto(esame).toLowerCase();
    const scenario = scenarioReferto(p, esame);
    if (/ecg/.test(nome)) {
        if (scenario === "stemi") return "Ritmo sinusale. Sopraslivellamento persistente del tratto ST in V2-V5 con alterazioni reciproche inferiori. Quadro elettrocardiografico compatibile con STEMI anteriore: attivare immediatamente percorso emodinamica.";
        if (scenario === "nstemi") return "Ritmo sinusale. Sottoslivellamento ST diffuso antero-laterale con inversione dell'onda T. Quadro compatibile con ischemia subendocardica/NSTEMI in correlazione con troponine seriati.";
    }
    if (/troponina|ck-mb|bnp/.test(nome)) {
        if (scenario === "stemi") return "Troponina I ad alta sensibilita marcatamente aumentata e coerente con danno miocardico acuto in quadro STEMI. Valore critico, richiede percorso tempo-dipendente.";
        if (scenario === "nstemi") return "Troponina I ad alta sensibilita aumentata con quadro compatibile con NSTEMI; necessario andamento seriato e valutazione cardiologica.";
    }
    if (/rx|tac|tc/.test(nome) && scenario === "frattura") {
        const distretto = nome.replace(/rx|tac|tc|senza contrasto|distretto interessato/g, "").trim() || "distretto esaminato";
        return `Nel ${distretto} si apprezza rima di frattura acuta con interruzione corticale e tumefazione dei tessuti molli peri-lesionali. Rapporti articolari complessivamente conservati salvo diversa indicazione clinica. Indicata immobilizzazione e valutazione ortopedica.`;
    }
    if (/emocromo|pcr|pct|ves|ega|lattat|emocolture|biochimico/.test(nome) && scenario === "infezione") {
        return "Leucocitosi neutrofila con PCR e procalcitonina aumentate; lattato mosso se quadro settico. Pattern laboratoristico compatibile con infezione batterica sistemica/sepsi da correlare a clinica e colture.";
    }
    if (/rx torace|tac torace|tc torace/.test(nome) && (scenario === "infezione" || scenario === "respiratorio")) {
        return "Addensamento parenchimale basale/perilare con rinforzo della trama bronco-vascolare. Non pneumotorace. Quadro compatibile con processo broncopneumonico/riacutizzazione respiratoria in correlazione con clinica.";
    }
    if (/cranio|encefalo|angio-tac cranio/.test(nome) && scenario === "stroke") {
        return "Non evidenza di emorragia intracranica acuta. Sfumata ipodensita cortico-sottocorticale nel territorio clinicamente sospetto, compatibile con ischemia recente se coerente con timing. Indicata valutazione stroke urgente.";
    }
    if (/addome|pelvi|eco/.test(nome) && scenario === "addome-acuto") {
        return "Reperti compatibili con quadro addominale acuto: ispessimento/infiltrazione flogistica nel distretto sospetto, modesto versamento reattivo e imbibizione del grasso periviscerale. Indicata valutazione chirurgica.";
    }
    if (/angio.*torace|embolia|d-dimero/.test(nome) && scenario === "embolia") {
        return "Difetti di riempimento endoluminali a carico di rami arteriosi polmonari segmentari/subsegmentari, quadro compatibile con embolia polmonare acuta. Correlare con stratificazione del rischio.";
    }
    return refertoPerEsameBaseClinico ? refertoPerEsameBaseClinico(esame, p) : "Non evidenza di reperti acuti maggiori.";
};

const righeLaboratorioBaseClinico = typeof righeLaboratorio === "function" ? righeLaboratorio : null;
righeLaboratorio = function righeLaboratorioCoerenti(e) {
    const p = globalThis.__refertoPazienteCorrente || pazienteSelezionato || {};
    const nome = nomeEsameReferto(e).toLowerCase();
    const scenario = scenarioReferto(p, e);
    if (/troponina|ck-mb|bnp/.test(nome) && ["stemi", "nstemi"].includes(scenario)) {
        const valore = scenario === "stemi" ? "1846" : "168";
        return {
            titolo: "TROPONINA I AD ALTA SENSIBILITA (hs-cTnI)",
            metodo: "Chemiluminescenza (CLIA)",
            righe: [["hs-cTnI", valore, "ng/L", "Uomini < 34,2 - Donne < 15,6"], ["CK-MB massa", scenario === "stemi" ? "42" : "9,8", "ng/mL", "< 5,0"], ["BNP", scenario === "stemi" ? "186" : "74", "pg/mL", "< 100"]],
            interpretazione: scenario === "stemi"
                ? "Marcato incremento degli enzimi miocardici, coerente con danno miocardico acuto in quadro ECG compatibile con STEMI."
                : "Incremento significativo della troponina, compatibile con danno miocardico acuto senza sopraslivellamento persistente del tratto ST."
        };
    }
    if (/emocromo|pcr|pct|ves|lattat|ega/.test(nome) && scenario === "infezione") {
        return {
            titolo: /ega|lattat/.test(nome) ? "EMOGASANALISI ARTERIOSA CON LATTATI" : "EMOCROMO E INDICI DI FLOGOSI",
            metodo: "Analisi automatizzata validata / co-ossimetria",
            righe: [["Leucociti", "18,6", "10^9/L", "4,0 - 10,0"], ["Neutrofili", "89", "%", "40 - 75"], ["PCR", "186", "mg/L", "< 5"], ["Procalcitonina", "4,8", "ng/mL", "< 0,10"], ["Lattato", "3,2", "mmol/L", "0,5 - 2,0"]],
            interpretazione: "Quadro laboratoristico compatibile con infezione batterica severa/sepsi. Necessaria correlazione con fonte infettiva, emocolture e risposta alla terapia."
        };
    }
    return righeLaboratorioBaseClinico ? righeLaboratorioBaseClinico(e) : {
        titolo: nomeEsameReferto(e).toUpperCase(),
        metodo: "Analisi automatizzata validata",
        righe: [["Parametro principale", "nei limiti", "", "range del laboratorio"]],
        interpretazione: refertoPerEsame(e, p)
    };
};

const refertoLaboratorioBaseClinico = typeof refertoLaboratorioStrutturato === "function" ? refertoLaboratorioStrutturato : null;
refertoLaboratorioStrutturato = function refertoLaboratorioConContesto(e, p) {
    globalThis.__refertoPazienteCorrente = p || {};
    try {
        return refertoLaboratorioBaseClinico ? refertoLaboratorioBaseClinico(e, p) : refertoPerEsame(e, p);
    } finally {
        globalThis.__refertoPazienteCorrente = null;
    }
};

const dettaglioImagingBaseClinico = typeof dettaglioImaging === "function" ? dettaglioImaging : null;
dettaglioImaging = function dettaglioImagingCoerente(e) {
    const p = pazienteSelezionato || {};
    const nome = nomeEsameReferto(e).toLowerCase();
    const scenario = scenarioReferto(p, e);
    if (scenario === "frattura" && /rx|tac|tc/.test(nome)) {
        return {
            tecnica: "Esame del distretto richiesto in proiezioni standard; eventuali ricostruzioni multiplanari se TC.",
            reperti: refertoPerEsame(e, p),
            conclusioni: "Frattura acuta del distretto esaminato. Indicata presa in carico ortopedica e immobilizzazione."
        };
    }
    if (scenario === "stemi" && /rx torace/.test(nome)) {
        return {
            tecnica: "Radiogramma del torace in urgenza.",
            reperti: "Ombra cardiaca nei limiti/al limite superiore. Non addensamenti focali. Non pneumotorace. Segni di congestione assenti o lievi.",
            conclusioni: "RX torace senza reperti alternativi al quadro cardiologico acuto; procedere secondo percorso STEMI."
        };
    }
    if ((scenario === "infezione" || scenario === "respiratorio") && /rx torace|tac torace|tc torace/.test(nome)) {
        return {
            tecnica: /rx/.test(nome) ? "Radiogramma del torace in due proiezioni se possibile." : "TC torace secondo protocollo clinico.",
            reperti: "Addensamento parenchimale basale con broncogramma aereo e rinforzo peribronchiale. Non pneumotorace. Possibile minimo versamento pleurico reattivo.",
            conclusioni: "Quadro compatibile con polmonite/riacutizzazione infettiva respiratoria."
        };
    }
    if (scenario === "stroke" && /cranio|encefalo/.test(nome)) {
        return {
            tecnica: "TC encefalo senza contrasto con ricostruzioni multiplanari; angio-TC se richiesta.",
            reperti: "Non emorragia intracranica acuta. Sfumata ipodensita cortico-sottocorticale nel territorio sospetto. Linea mediana in asse.",
            conclusioni: "Quadro compatibile con ischemia cerebrale recente se coerente con clinica e timing. Attivare percorso stroke."
        };
    }
    if (scenario === "addome-acuto" && /addome|pelvi|eco/.test(nome)) {
        return {
            tecnica: /eco/.test(nome) ? "Ecografia addome mirata al quesito clinico." : "TC addome-pelvi con mezzo di contrasto secondo protocollo.",
            reperti: "Ispessimento parietale e imbibizione flogistica del grasso periviscerale nel distretto clinicamente sospetto. Minimo versamento reattivo. Non pneumoperitoneo massivo.",
            conclusioni: "Reperti compatibili con addome acuto flogistico/chirurgico. Indicata valutazione chirurgica."
        };
    }
    if (scenario === "embolia" && /angio|torace/.test(nome)) {
        return {
            tecnica: "Angio-TC torace in fase arteriosa polmonare.",
            reperti: "Difetti di riempimento endoluminali segmentari/subsegmentari. Non segni certi di sovraccarico ventricolare destro nel solo esame morfologico.",
            conclusioni: "Embolia polmonare acuta. Correlare con parametri, biomarcatori e rischio clinico."
        };
    }
    return dettaglioImagingBaseClinico ? dettaglioImagingBaseClinico(e) : {
        tecnica: "Esame eseguito secondo protocollo.",
        reperti: refertoPerEsame(e, p),
        conclusioni: "Correlare con il quadro clinico."
    };
};

const refertoECGBaseClinico = typeof refertoECGStrutturato === "function" ? refertoECGStrutturato : null;
refertoECGStrutturato = function refertoECGCoerente(e, p) {
    const scenario = scenarioReferto(p, e);
    if (scenario === "stemi") {
        return `CARDIOLOGIA - ELETTROCARDIOGRAMMA 12 DERIVAZIONI

${bloccoAnagraficaReferto(p, e, "Data/Ora registrazione")}

Parametri automatici:
Frequenza ventricolare: 104 bpm
PR: 158 ms
QRS: 96 ms
QT/QTc: 348/458 ms

Descrizione:
Ritmo sinusale tachicardico. Sopraslivellamento persistente del tratto ST in V2-V5, con onde T iperacute anteriori e sottoslivellamento reciproco inferiore.

Conclusioni:
Quadro elettrocardiografico compatibile con STEMI anteriore. Attivare immediatamente percorso emodinamica/UTIC secondo protocollo.

Referto validato elettronicamente.`;
    }
    if (scenario === "nstemi") {
        return `CARDIOLOGIA - ELETTROCARDIOGRAMMA 12 DERIVAZIONI

${bloccoAnagraficaReferto(p, e, "Data/Ora registrazione")}

Descrizione:
Ritmo sinusale. Sottoslivellamento ST diffuso in sede antero-laterale con inversione dell'onda T. Non sopraslivellamento persistente del tratto ST.

Conclusioni:
Alterazioni ischemiche compatibili con SCA senza sopraslivellamento in correlazione con clinica e troponine.

Referto validato elettronicamente.`;
    }
    return refertoECGBaseClinico ? refertoECGBaseClinico(e, p) : refertoPerEsame(e, p);
};

const immagineRefertoBaseClinico = typeof immagineReferto === "function" ? immagineReferto : null;
immagineReferto = function immagineRefertoCoerente(e) {
    const nome = `${e.nome || ""} ${e.categoria || ""}`.toLowerCase();
    if (/ecg/.test(nome)) return DIAGNOSTIC_ASSETS.ecgFlutter;
    if (/rx mano|rx polso/.test(nome)) return "assets/icons/xray-hand.png";
    if (/rx torace/.test(nome)) return DIAGNOSTIC_ASSETS.rxTorace;
    if (/rx addome/.test(nome)) return DIAGNOSTIC_ASSETS.rxAddome;
    if (/(tac|tc).*cranio|encefalo/.test(nome)) return DIAGNOSTIC_ASSETS.tcCranio;
    if (/(tac|tc|angio).*torace/.test(nome)) return DIAGNOSTIC_ASSETS.tcTorace;
    if (/(tac|tc).*addome|pelvi/.test(nome)) return DIAGNOSTIC_ASSETS.tcAddomePelvi;
    return immagineRefertoBaseClinico ? immagineRefertoBaseClinico(e) : "";
};
