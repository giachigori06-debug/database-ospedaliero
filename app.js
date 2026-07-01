let pazienti = JSON.parse(localStorage.getItem("ps") || "[]");
let archivio = JSON.parse(localStorage.getItem("archivio") || "[]");
let personale = JSON.parse(localStorage.getItem("personale") || "[]");
let logAzioni = JSON.parse(localStorage.getItem("logAzioni") || "[]");
let interventi118 = JSON.parse(localStorage.getItem("interventi118") || "[]");
let interventi118Archivio = JSON.parse(localStorage.getItem("interventi118Archivio") || "[]");
let intervento118Selezionato = null;
let intervento118Counter = JSON.parse(localStorage.getItem("intervento118Counter") || "0");
let ambulanze = JSON.parse(localStorage.getItem("ambulanze") || `[
    { "id": "A1", "nome": "Ambulanza 1" },
    { "id": "A2", "nome": "Ambulanza 2" },
    { "id": "A3", "nome": "Ambulanza 3" }
]`);
if (!archivio) archivio = [];
let pagina = "ps";
let pazienteSelezionato = null;
let draggedIndex = null;
let filtroTriage = "Tutti";
let ricercaPazienti = "";
let filtro118 = "attivi";
let refertiTimer = null;
let ultimoAvvisoReferti = "";

const ESAMI_CATALOGO = [
    { categoria: "Ematochimici", nome: "Emocromo con formula", tempo: [60, 120] },
    { categoria: "Ematochimici", nome: "Profilo biochimico completo", tempo: [60, 120] },
    { categoria: "Ematochimici", nome: "Elettroliti, funzionalita renale", tempo: [60, 120] },
    { categoria: "Ematochimici", nome: "Troponina, CK-MB, BNP", tempo: [60, 120] },
    { categoria: "Ematochimici", nome: "PCR, PCT, VES", tempo: [60, 120] },
    { categoria: "Ematochimici", nome: "Coagulazione: PT, aPTT, INR, fibrinogeno, D-dimero", tempo: [60, 120] },
    { categoria: "Ematochimici", nome: "EGA arteriosa", tempo: [60, 90] },
    { categoria: "Ematochimici", nome: "Esame urine e urinocoltura", tempo: [60, 120] },
    { categoria: "RX", nome: "RX torace", tempo: [60, 120] },
    { categoria: "RX", nome: "RX addome diretto", tempo: [60, 120] },
    { categoria: "RX", nome: "RX cranio", tempo: [60, 120] },
    { categoria: "RX", nome: "RX rachide cervicale", tempo: [60, 120] },
    { categoria: "RX", nome: "RX rachide dorsale", tempo: [60, 120] },
    { categoria: "RX", nome: "RX rachide lombosacrale", tempo: [60, 120] },
    { categoria: "RX", nome: "RX bacino", tempo: [60, 120] },
    { categoria: "RX", nome: "RX spalla", tempo: [60, 120] },
    { categoria: "RX", nome: "RX omero", tempo: [60, 120] },
    { categoria: "RX", nome: "RX gomito", tempo: [60, 120] },
    { categoria: "RX", nome: "RX avambraccio", tempo: [60, 120] },
    { categoria: "RX", nome: "RX polso", tempo: [60, 120] },
    { categoria: "RX", nome: "RX mano", tempo: [60, 120] },
    { categoria: "RX", nome: "RX femore", tempo: [60, 120] },
    { categoria: "RX", nome: "RX ginocchio", tempo: [60, 120] },
    { categoria: "RX", nome: "RX gamba", tempo: [60, 120] },
    { categoria: "RX", nome: "RX caviglia", tempo: [60, 120] },
    { categoria: "RX", nome: "RX piede", tempo: [60, 120] },
    { categoria: "TAC", nome: "TAC cranio senza contrasto", tempo: [60, 120] },
    { categoria: "TAC", nome: "TAC massiccio facciale", tempo: [60, 120] },
    { categoria: "TAC", nome: "TAC rachide cervicale", tempo: [60, 120] },
    { categoria: "TAC", nome: "TAC torace", tempo: [60, 120] },
    { categoria: "TAC", nome: "Angio-TAC torace per embolia polmonare", tempo: [60, 120] },
    { categoria: "TAC", nome: "TAC addome e pelvi", tempo: [60, 120] },
    { categoria: "TAC", nome: "Angio-TAC aorta", tempo: [60, 120] },
    { categoria: "TAC", nome: "TAC total body trauma", tempo: [60, 120] },
    { categoria: "Ecografia", nome: "Ecografia addome completo", tempo: [60, 120] },
    { categoria: "Ecografia", nome: "Ecografia vie urinarie", tempo: [60, 120] },
    { categoria: "Ecografia", nome: "Ecografia testicolare", tempo: [60, 120] },
    { categoria: "Ecografia", nome: "Ecografia ostetrico-ginecologica", tempo: [60, 120] },
    { categoria: "Ecografia", nome: "Eco FAST trauma", tempo: [60, 90] },
    { categoria: "Ecografia", nome: "EcoColorDoppler venoso arti inferiori", tempo: [60, 120] },
    { categoria: "Cardiologia", nome: "ECG 12 derivazioni", tempo: [60, 90] },
    { categoria: "Cardiologia", nome: "Ecocardiogramma bedside", tempo: [60, 120] },
    { categoria: "Consulenza", nome: "Consulenza chirurgica", tempo: [60, 120] },
    { categoria: "Consulenza", nome: "Consulenza internistica", tempo: [60, 120] },
    { categoria: "Consulenza", nome: "Consulenza ortopedica", tempo: [60, 120] },
    { categoria: "Consulenza", nome: "Consulenza neurologica", tempo: [60, 120] },
    { categoria: "Consulenza", nome: "Consulenza cardiologica", tempo: [60, 120] }
];

function id() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function salva() {
    localStorage.setItem("ps", JSON.stringify(pazienti));
    localStorage.setItem("archivio", JSON.stringify(archivio));
    localStorage.setItem("personale", JSON.stringify(personale));
    localStorage.setItem("logAzioni", JSON.stringify(logAzioni));
    localStorage.setItem("interventi118", JSON.stringify(interventi118));
    localStorage.setItem("intervento118Counter", JSON.stringify(intervento118Counter));
    localStorage.setItem("ambulanze", JSON.stringify(ambulanze));
    localStorage.setItem("interventi118Archivio", JSON.stringify(interventi118Archivio));
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function fieldValue(idCampo) {
    return document.getElementById(idCampo)?.value.trim() || "";
}

function numeroCasuale(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function esamiCatalogoHTML(selected = "") {
    const categorie = [...new Set(ESAMI_CATALOGO.map(e => e.categoria))];
    return categorie.map(categoria => `
        <optgroup label="${escapeHtml(categoria)}">
            ${ESAMI_CATALOGO
                .filter(e => e.categoria === categoria)
                .map(e => `<option value="${escapeHtml(e.nome)}" ${selected === e.nome ? "selected" : ""}>${escapeHtml(e.nome)}</option>`)
                .join("")}
        </optgroup>
    `).join("");
}

function trovaEsameCatalogo(nome) {
    return ESAMI_CATALOGO.find(e => e.nome === nome) || ESAMI_CATALOGO[0];
}

function refertiPendenti(p) {
    return (p?.esami || []).filter(e => typeof e !== "string" && e.refertoAutomatico && e.stato !== "Refertato").length;
}

function tempoRefertoLabel(e) {
    if (!e || typeof e === "string" || e.stato === "Refertato") return "";
    const remaining = Math.max(0, Number(e.dueAt || 0) - Date.now());
    if (!remaining) return "in refertazione";
    const minuti = Math.ceil(remaining / 60000);
    return minuti <= 1 ? "meno di 1 min" : `${minuti} min`;
}

function categoriaEsame(nome, fallback = "") {
    const trovato = ESAMI_CATALOGO.find(e => e.nome === nome);
    return trovato?.categoria || fallback || "Esame";
}

function parseSistolica(pa) {
    const match = String(pa || "").match(/\d+/);
    return match ? Number(match[0]) : null;
}

function alertClinici(p) {
    const alerts = [];
    const parametri = p?.parametri || {};
    const fc = Number(parametri.fc || 0);
    const fr = Number(parametri.fr || 0);
    const spo2 = Number(parametri.sat || parametri.spo2 || 0);
    const temp = Number(parametri.temp || 0);
    const gcs = Number(parametri.gcs || 0);
    const dolore = Number(parametri.dolore || 0);
    const sistolica = parseSistolica(parametri.pa);

    if (p?.codice === "Rosso" || p?.codice === "Arancione") {
        alerts.push({ livello: p.codice === "Rosso" ? "critical" : "warning", titolo: `Triage ${p.codice}`, testo: "Priorita clinica elevata: rivalutazione frequente indicata." });
    }
    if (fc && (fc < 45 || fc > 130)) alerts.push({ livello: "critical", titolo: "Frequenza cardiaca critica", testo: `FC ${fc} bpm.` });
    else if (fc && (fc < 55 || fc > 110)) alerts.push({ livello: "warning", titolo: "Frequenza cardiaca alterata", testo: `FC ${fc} bpm.` });
    if (fr && (fr < 8 || fr > 30)) alerts.push({ livello: "critical", titolo: "Frequenza respiratoria critica", testo: `FR ${fr}/min.` });
    else if (fr && (fr < 10 || fr > 24)) alerts.push({ livello: "warning", titolo: "Frequenza respiratoria alterata", testo: `FR ${fr}/min.` });
    if (spo2 && spo2 < 90) alerts.push({ livello: "critical", titolo: "Desaturazione severa", testo: `SpO2 ${spo2}%.` });
    else if (spo2 && spo2 < 94) alerts.push({ livello: "warning", titolo: "Saturazione bassa", testo: `SpO2 ${spo2}%.` });
    if (sistolica && sistolica < 90) alerts.push({ livello: "critical", titolo: "Ipotensione", testo: `PA ${parametri.pa}.` });
    else if (sistolica && sistolica > 180) alerts.push({ livello: "warning", titolo: "Ipertensione severa", testo: `PA ${parametri.pa}.` });
    if (temp && temp >= 38.5) alerts.push({ livello: "warning", titolo: "Febbre", testo: `Temperatura ${temp} C.` });
    if (gcs && gcs < 13) alerts.push({ livello: "critical", titolo: "Stato neurologico alterato", testo: `GCS ${gcs}.` });
    if (dolore && dolore >= 8) alerts.push({ livello: "warning", titolo: "Dolore elevato", testo: `NRS ${dolore}/10.` });
    if (refertiPendenti(p)) alerts.push({ livello: "info", titolo: "Referti in attesa", testo: `${refertiPendenti(p)} richiesta/e diagnostiche ancora in corso.` });

    (p?.esami || []).forEach(e => {
        if (typeof e === "string" || e.stato !== "Refertato") return;
        const testo = String(e.esito || "").toLowerCase();
        if (/leucocitosi|pcr aumentata|troponina|d-dimero|embolia|fratture|emorragia|addome chirurgico|trombosi/.test(testo)) {
            alerts.push({ livello: "warning", titolo: `Referto da rivalutare: ${e.nome || e.tipo}`, testo: "Il referto contiene reperti potenzialmente rilevanti." });
        }
    });

    return alerts.slice(0, 8);
}

function alertCliniciHTML(p) {
    const alerts = alertClinici(p);
    if (!alerts.length) {
        return `<div class="clinical-alert ok"><b>Quadro stabile</b><span>Nessun alert automatico dai dati registrati.</span></div>`;
    }
    return alerts.map(a => `
        <div class="clinical-alert ${escapeHtml(a.livello)}">
            <b>${escapeHtml(a.titolo)}</b>
            <span>${escapeHtml(a.testo)}</span>
        </div>
    `).join("");
}

function timelineClinica(p) {
    const eventi = [];
    const paziente = p || {};

    if (paziente.creatoIl || paziente.time) {
        eventi.push({
            time: paziente.creatoIl || paziente.time,
            tipo: "Accesso",
            titolo: "Paziente preso in carico",
            testo: `${paziente.codice || "Codice non indicato"} - ${paziente.motivo || "Motivo non indicato"}`,
            operatore: paziente.operatore || ""
        });
    }

    (paziente.parametriHistory || []).forEach(v => eventi.push({
        time: v.time,
        tipo: "Parametri",
        titolo: "Parametri vitali registrati",
        testo: `FC ${v.fc || "-"} bpm, FR ${v.fr || "-"}, SpO2 ${v.sat || v.spo2 || "-"}%, PA ${v.pa || "-"}, T ${v.temp || "-"} C, GCS ${v.gcs || "-"}, dolore ${v.dolore || "-"}`,
        operatore: v.operatore || ""
    }));

    (paziente.esami || []).forEach(e => {
        if (typeof e === "string") {
            eventi.push({ time: "", tipo: "Esame", titolo: "Esame precedente", testo: e, operatore: "" });
            return;
        }
        eventi.push({
            time: e.time,
            tipo: "Esame",
            titolo: `${e.stato || "Richiesto"}: ${e.nome || e.tipo || "Esame"}`,
            testo: e.esito || e.richiedente || "In attesa di referto",
            operatore: e.operatore || e.refertatoDa || ""
        });
        if (e.refertatoIl && e.esito) {
            eventi.push({
                time: e.refertatoIl,
                tipo: "Referto",
                titolo: `Referto disponibile: ${e.nome || e.tipo || "Esame"}`,
                testo: e.esito,
                operatore: e.refertatoDa || "Diagnostica"
            });
        }
    });

    (paziente.terapie || []).forEach(t => eventi.push({
        time: t.time,
        tipo: "Terapia",
        titolo: t.farmaco ? `${t.farmaco} ${t.dose || ""}` : "Terapia registrata",
        testo: `${t.via || ""} ${t.frequenza || ""} ${t.note || ""}`.trim(),
        operatore: t.operatore || ""
    }));

    const diario = [
        ...(paziente.visite || []).map(v => typeof v === "string" ? { time: "", tipo: "Visita", testo: v, operatore: "" } : v),
        ...(paziente.diarioClinico || [])
    ];
    diario.forEach(d => eventi.push({
        time: d.time,
        tipo: d.tipo || "Nota",
        titolo: d.tipo || "Nota clinica",
        testo: d.testo || d.diagnosi || "",
        operatore: d.operatore || ""
    }));

    (paziente.ecgHistory || []).forEach(e => eventi.push({
        time: e.time,
        tipo: "ECG",
        titolo: e.ritmo || "ECG generato",
        testo: `FC ${e.fc || "-"} bpm`,
        operatore: e.operatore || ""
    }));

    return eventi.sort((a, b) => {
        const da = Date.parse(a.time || "") || 0;
        const db = Date.parse(b.time || "") || 0;
        return db - da;
    });
}

function timelineClinicaHTML(p) {
    const eventi = timelineClinica(p).slice(0, 18);
    if (!eventi.length) return `<div class="empty-state">Nessun evento clinico ancora registrato.</div>`;
    return eventi.map(e => `
        <article class="timeline-item">
            <div class="timeline-dot">${escapeHtml((e.tipo || "?").slice(0, 2).toUpperCase())}</div>
            <div>
                <div class="timeline-head">
                    <b>${escapeHtml(e.titolo || e.tipo || "Evento")}</b>
                    <span>${escapeHtml(e.time || "")}</span>
                </div>
                <p>${escapeHtml(e.testo || "")}</p>
                ${e.operatore ? `<small>${escapeHtml(e.operatore)}</small>` : ""}
            </div>
        </article>
    `).join("");
}

function refertoPerEsame(esame, p) {
    const nome = esame.nome || esame.tipo || "Esame";
    const quesito = (esame.richiedente || "").toLowerCase();
    const motivo = (p?.motivo || "").toLowerCase();
    const testo = `${quesito} ${motivo}`;
    const febbre = /febbre|sepsi|infett|tosse|dispnea|polmon/.test(testo);
    const doloreToracico = /torac|dispnea|cardio|sincope|infarto|dolore/.test(testo);
    const trauma = /trauma|cadut|fratt|distors|contus|incidente/.test(testo);
    const addome = /addom|appendic|colic|vomito|periton|colecist|renale/.test(testo);
    const neuro = /cefalea|ictus|deficit|confus|cranio|sincope|convuls/.test(testo);

    if (nome.includes("Emocromo")) {
        return febbre
            ? "Leucocitosi neutrofila moderata. Emoglobina e piastrine nei limiti. Quadro compatibile con risposta flogistica/infiammatoria, da correlare con clinica e indici di flogosi."
            : "Emocromo nei limiti per eta e sesso. Non anemia significativa, piastrine nella norma, formula leucocitaria senza deviazioni rilevanti.";
    }
    if (nome.includes("Profilo biochimico") || nome.includes("Elettroliti")) {
        return addome
            ? "Funzione renale conservata, elettroliti senza alterazioni critiche. Lieve incremento degli indici di citolisi/colestasi se clinicamente pertinente. Si consiglia correlazione con imaging addominale."
            : "Glicemia, creatinina, azotemia, sodio, potassio e funzionalita epatica senza alterazioni acute clinicamente rilevanti.";
    }
    if (nome.includes("Troponina")) {
        return doloreToracico
            ? "Troponina nei limiti al primo prelievo. ECG e clinica da rivalutare; indicato controllo seriato se dolore toracico recente o persistente."
            : "Marker cardiaci nei limiti. BNP non suggestivo per scompenso acuto nel contesto clinico attuale.";
    }
    if (nome.includes("PCR") || nome.includes("PCT")) {
        return febbre
            ? "PCR aumentata con PCT non francamente elevata. Reperto compatibile con flogosi; infezione batterica sistemica non dimostrata, da rivalutare secondo quadro clinico."
            : "Indici di flogosi nei limiti o solo lievemente mossi, senza elementi laboratoristici di infezione sistemica acuta.";
    }
    if (nome.includes("Coagulazione")) {
        return "PT, aPTT e INR nei limiti. D-dimero non aumentato in modo significativo per eta e contesto clinico. Fibrinogeno nei limiti.";
    }
    if (nome.includes("EGA")) {
        return doloreToracico || febbre
            ? "Scambi respiratori conservati con lieve alcalosi respiratoria compatibile con iperventilazione/dolore. Lattati nei limiti, non segni emogasanalitici di ipoperfusione."
            : "Equilibrio acido-base nei limiti, ossigenazione adeguata, lattati nella norma.";
    }
    if (nome.includes("urine")) {
        return addome
            ? "Esame urine con modesta leucocituria e nitriti negativi. Non macroematuria. Urinocoltura impostata se clinicamente indicata."
            : "Esame urine senza alterazioni significative: assenti nitriti, proteinuria non rilevante, sedimento non patologico.";
    }
    if (nome.startsWith("RX torace")) {
        return febbre || doloreToracico
            ? "Campi polmonari espansi. Non addensamenti flogistici focali evidenti, non versamento pleurico, non pneumotorace. Ombra cardiomediastinica nei limiti."
            : "Esame del torace nei limiti radiografici. Non evidenza di lesioni pleuro-polmonari acute.";
    }
    if (nome.startsWith("RX addome")) {
        return "Non livelli idroaerei patologici, non aria libera sottodiaframmatica. Coprostasi di grado lieve-moderato se compatibile con clinica.";
    }
    if (nome.startsWith("RX")) {
        return trauma
            ? `Non evidenza di fratture scomposte nei segmenti esaminati (${nome.replace("RX ", "")}). Rapporti articolari conservati. Tumefazione dei tessuti molli se clinicamente presente.`
            : `Esame radiografico di ${nome.replace("RX ", "")}: segmenti ossei in asse, rapporti articolari conservati, non lesioni traumatiche acute evidenti.`;
    }
    if (nome.includes("TAC cranio")) {
        return neuro || trauma
            ? "Non evidenza di emorragia endocranica acuta, effetto massa o fratture depresse della teca. Sistema ventricolare in asse. Quadro TAC nei limiti per urgenza."
            : "TAC cranio senza mezzo di contrasto: non lesioni emorragiche o ischemiche acute evidenti all'esame basale.";
    }
    if (nome.includes("TAC massiccio facciale")) {
        return trauma
            ? "Non fratture dislocate del massiccio facciale. Seni paranasali aerati, lieve imbibizione dei tessuti molli se compatibile con trauma."
            : "Strutture ossee del massiccio facciale integre. Non raccolte o alterazioni acute significative.";
    }
    if (nome.includes("rachide cervicale")) {
        return "Allineamento conservato. Non evidenza TAC di fratture acute o listesi traumatiche. Modeste alterazioni degenerative se eta-compatibili.";
    }
    if (nome.includes("Angio-TAC torace")) {
        return "Non difetti di riempimento nei rami arteriosi polmonari esplorabili. Non segni TAC di embolia polmonare acuta. Parenchima senza addensamenti focali significativi.";
    }
    if (nome.includes("TAC torace")) {
        return "Non pneumotorace, non versamento pleurico significativo. Non addensamenti parenchimali focali acuti. Grossi vasi e mediastino senza reperti urgenti evidenti.";
    }
    if (nome.includes("TAC addome")) {
        return addome
            ? "Non aria libera, non versamento libero significativo. Appendice non francamente ispessita se visualizzata. Non segni TAC di addome chirurgico acuto; correlare con clinica e laboratorio."
            : "TAC addome-pelvi senza reperti acuti maggiori. Organi parenchimatosi senza lesioni traumatiche o flogistiche evidenti in urgenza.";
    }
    if (nome.includes("aorta")) {
        return "Aorta toraco-addominale di calibro conservato, non segni di dissezione o rottura. Non ematoma periaortico.";
    }
    if (nome.includes("total body")) {
        return trauma
            ? "Non evidenza di lesioni traumatiche acute cranio-toraco-addominali maggiori. Non pneumotorace, non versamento libero, non fratture instabili evidenti."
            : "TAC total body senza reperti acuti maggiori nel contesto di urgenza.";
    }
    if (nome.includes("Eco FAST")) {
        return "FAST negativa: non versamento libero pericardico o addominale nei quadranti esplorati. Sliding pleurico bilateralmente conservato.";
    }
    if (nome.includes("addome completo")) {
        return addome
            ? "Fegato, colecisti, vie biliari, pancreas esplorabile, milza e reni senza reperti acuti maggiori. Non versamento libero. Meteorismo intestinale limitante in parte lo studio."
            : "Ecografia addome completo nei limiti dell'esplorabilita. Non raccolte, non dilatazione vie biliari, reni senza idronefrosi.";
    }
    if (nome.includes("vie urinarie")) {
        return "Reni in sede, non idronefrosi. Vescica con pareti regolari nei limiti di riempimento. Non evidenza ecografica di ostruzione urinaria acuta.";
    }
    if (nome.includes("testicolare")) {
        return "Didimi in sede con ecostruttura conservata e vascolarizzazione presente bilateralmente. Non segni di torsione testicolare all'esame Doppler.";
    }
    if (nome.includes("ostetrico")) {
        return "Valutazione ecografica ginecologica/ostetrica senza reperti acuti maggiori nel contesto di urgenza. Indicata valutazione specialistica se sintomatologia persistente.";
    }
    if (nome.includes("Doppler")) {
        return "Sistema venoso profondo esplorabile comprimibile e pervio. Non segni ecografici di trombosi venosa profonda nei distretti valutati.";
    }
    if (nome.includes("ECG")) {
        return "Ritmo sinusale. FC compatibile con parametri registrati. Non sopraslivellamenti ST persistenti, non blocchi di branca di nuova evidenza. Tracciato da correlare con clinica.";
    }
    if (nome.includes("Ecocardiogramma")) {
        return "Ventricolo sinistro con funzione sistolica globale conservata. Non versamento pericardico significativo. Non segni ecografici di instabilita emodinamica acuta.";
    }
    if (nome.includes("Consulenza")) {
        return "Paziente valutato. Al momento non indicazione a trattamento invasivo urgente. Si consiglia prosecuzione osservazione, terapia sintomatica e rivalutazione secondo evoluzione clinica.";
    }
    return "Referto completato: non evidenza di reperti acuti maggiori. Correlare sempre il dato strumentale con quadro clinico, parametri vitali e andamento osservazionale.";
}

function completaRefertiScaduti(mostraAvviso = false) {
    let completati = 0;
    const now = Date.now();
    pazienti.forEach(p => {
        ensurePaziente(p);
        (p.esami || []).forEach(e => {
            if (typeof e === "string" || !e.refertoAutomatico || e.stato === "Refertato") return;
            if (Number(e.dueAt || 0) > now) return;
            e.stato = "Refertato";
            e.refertatoIl = new Date().toLocaleString();
            e.refertatoDa = e.refertatoDa || "Diagnostica";
            e.esito = refertoPerEsame(e, p);
            completati += 1;
        });
    });
    if (completati) {
        logAction(`${completati} referti automatici completati`);
        salva();
        if (mostraAvviso) alert(`${completati} referti pronti in cartella.`);
    }
    pianificaControlloReferti();
    return completati;
}

function pianificaControlloReferti() {
    if (refertiTimer) clearTimeout(refertiTimer);
    const scadenze = [];
    pazienti.forEach(p => {
        (p.esami || []).forEach(e => {
            if (typeof e !== "string" && e.refertoAutomatico && e.stato !== "Refertato" && e.dueAt) {
                scadenze.push(Number(e.dueAt));
            }
        });
    });
    if (!scadenze.length) return;
    const prossimo = Math.max(1000, Math.min(...scadenze) - Date.now());
    refertiTimer = setTimeout(() => {
        const completati = completaRefertiScaduti(false);
        if (completati && pagina === "cartella") {
            ultimoAvvisoReferti = `${completati} referto${completati > 1 ? "i" : ""} pront${completati > 1 ? "i" : "o"}.`;
            render();
        }
    }, prossimo + 500);
}

function controllaReferti() {
    const completati = completaRefertiScaduti(true);
    if (!completati) alert("Nessun nuovo referto pronto in questo momento.");
    render();
}

function triageClass(codice) {
    return String(codice || "Bianco").toLowerCase();
}

function triageWeight(codice) {
    const weights = { Rosso: 1, Arancione: 2, Azzurro: 3, Verde: 4, Bianco: 5 };
    return weights[codice] || 6;
}

function labelReparto(reparto) {
    if (reparto === "chirurgia") return "Chirurgia";
    if (reparto === "medicinaInterna") return "Medicina Interna";
    return "Pronto Soccorso";
}

function repartoIcon(reparto) {
    if (reparto === "chirurgia") return "CH";
    if (reparto === "medicinaInterna") return "MI";
    return "📋";
}

function ensurePaziente(p) {
    if (!p) return p;

    if (!p.parametri) {
        p.parametri = { fc: "", fr: "", sat: "", pa: "" };
    }

    if (!p.esami) p.esami = [];
    p.esami = p.esami.map(e => {
        if (typeof e !== "string") {
            if (!e.nome) e.nome = e.tipo || "Esame";
            if (!e.categoria) e.categoria = categoriaEsame(e.nome, e.tipo);
            if (!e.stato) e.stato = e.esito ? "Refertato" : "Richiesto";
            return e;
        }
        return {
            id: id(),
            time: "",
            nome: "Nota esame precedente",
            tipo: "Storico",
            categoria: "Storico",
            richiedente: "",
            stato: "Refertato",
            esito: e,
            operatore: ""
        };
    });
    if (!p.terapie) p.terapie = [];
    if (!p.visite) p.visite = [];

    if (!p.parametriHistory) p.parametriHistory = [];
    if (!p.reparto) p.reparto = "ps";
    if (!p.diarioClinico) p.diarioClinico = [];
    if (!p.ecgHistory) p.ecgHistory = [];
    if (!p.chirurgia) {
        p.chirurgia = {
            diagnosi: "",
            procedura: "",
            rischioAnestesiologico: "",
            consenso: false,
            digiuno: "",
            profilassi: "",
            noteOperatorie: ""
        };
    }
    if (!p.medicinaInterna) {
        p.medicinaInterna = {
            anamnesi: "",
            diagnosi: "",
            comorbidita: "",
            terapiaCronica: "",
            piano: ""
        };
    }

    return p;
}

function logAction(azione) {
    logAzioni.push({
        user: medicoLoggato?.nome || "anonimo",
        ruolo: medicoLoggato?.ruolo || "none",
        azione,
        time: new Date().toLocaleString()
    });

    if (logAzioni.length > 200) logAzioni.shift();
}

/* =======================
   LOGIN MEDICI
======================= */

let medici = [
    { username: "admin", password: "1234567890", nome: "Amministratore", ruolo: "admin" }
];

let medicoLoggato = null;

/* =======================
   RENDER
======================= */
function render() {
    const app = document.getElementById("app");

    // BLOCCO ACCESSO LOGIN
    if (!medicoLoggato) {
        login(app);
        return;
    }

    completaRefertiScaduti(false);

    if (pagina === "ps") lista(app);
    if (pagina === "nuovo") nuovo(app);
    if (pagina === "cartella") cartella(app);
    if (pagina === "archivio") archivioView(app);
    if (pagina === "personale") personaleView(app);
    if (pagina === "intervento118") intervento118View(app);
    if (pagina === "chirurgia") chirurgiaView(app);
    if (pagina === "medicinaInterna") medicinaInternaView(app);
}

/* =======================
   LISTA PAZIENTI (DASHBOARD STYLE)
======================= */
function lista(app) {

    let html = `
    <h2>📋 Pazienti in Pronto Soccorso</h2>

    <div style="margin-bottom:10px;">
        <b>Medico:</b> ${medicoLoggato ? medicoLoggato.nome : ""}
        <button onclick="logout()" style="margin-left:10px;">Logout</button>
        ${medicoLoggato?.ruolo === "admin" ? `<button onclick="pagina='archivio'; render()" style="margin-left:10px;">Archivio</button>` : ``}
        ${medicoLoggato?.ruolo === "admin" ? `<button onclick="pagina='personale'; render()" style="margin-left:10px;">Personale</button>` : ``}
        ${medicoLoggato?.ruolo === "admin" ? `<button onclick="pagina='intervento118'; render()" style="margin-left:10px;">118 Interventi</button>` : ``}
    </div>

    <div style="display:flex; gap:15px; align-items:flex-start;">

        <!-- COLONNA SINISTRA -->
        <div style="flex:2;">

    `;

    // =======================
    // PAZIENTI LISTA
    // =======================
    pazienti.forEach((p, index) => {
        html += `
        <div class="paziente"
            draggable="true"
            ondragstart="dragStart(${index})"
            ondragover="event.preventDefault();"
            ondrop="drop(${index})"
            style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; padding:5px; border:1px solid #ccc; border-radius:4px;"
        >
            <div>
                <b>${p.nome} ${p.cognome}</b><br>
                Codice: ${p.codice}
            </div>
            <div>
                <button onclick="apri('${p.id}')">Apri Cartella</button>
                ${medicoLoggato?.ruolo === "admin" ? `
                <button onclick="event.stopPropagation(); eliminaPaziente('${p.id}')" style="margin-left:5px; background:red; color:white;">
                    Elimina
                </button>
                ` : ``}
            </div>
        </div>
        `;
    });

    // =======================
    // TRIAGE STATS
    // =======================
    let counts = { Rosso:0, Arancione:0, Azzurro:0, Verde:0, Bianco:0 };

    pazienti.forEach(p => {
        if (counts[p.codice] !== undefined) counts[p.codice]++;
    });

    html += `
        <hr>
        <h3>Triage</h3>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <div>🔴 Rossi: <b>${counts.Rosso}</b></div>
            <div>🟠 Arancioni: <b>${counts.Arancione}</b></div>
            <div>🔵 Azzurri: <b>${counts.Azzurro}</b></div>
            <div>🟢 Verdi: <b>${counts.Verde}</b></div>
            <div>⚪ Bianchi: <b>${counts.Bianco}</b></div>
        </div>

        <h3>Operatori in servizio</h3>
        <div style="display:flex; flex-wrap:wrap; gap:10px;">
    `;

    let operatori = [...(medici || []), ...(personale || [])];

    html += operatori.map(o => `
        <div style="border:1px solid #ddd; padding:6px; border-radius:4px;">
            <b>${o.nome}</b><br>
            <small>${o.ruolo || "n/d"}</small>
        </div>
    `).join("");

    html += `
        </div>

        <h3>🚑 Interventi 118</h3>
        <button onclick="creaIntervento118()">Nuovo intervento</button>
        <div style="margin-top:10px;">
    `;

    html += interventi118.map(i => `
        <div style="border:1px solid #ddd; padding:6px; margin:5px;">
            <b>#${i.numero}</b> - ${i.data}
            <br>${i.descrizione || ""}
        </div>
    `).join("");

    html += `
        </div>
        </div>

        <!-- COLONNA DESTRA (REPARTI LATERALI) -->
        <div style="flex:1;">

            <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
                <h3>Chirurgia</h3>
    `;

    pazienti.forEach(p => {
        html += `
            <div style="border-bottom:1px solid #eee; padding:4px;">
                <b>${p.nome} ${p.cognome}</b><br>
                <small>${p.codice}</small>
            </div>
        `;
    });

    html += `
            </div>

            <div style="border:1px solid #ccc; padding:10px;">
                <h3>Medicina Interna</h3>
    `;

    pazienti.forEach(p => {
        html += `
            <div style="border-bottom:1px solid #eee; padding:4px;">
                <b>${p.nome} ${p.cognome}</b><br>
                <small>${p.codice}</small>
            </div>
        `;
    });

    html += `
            </div>

        </div>
    </div>
    `;

    app.innerHTML = html;
}

function lista(app) {

    pazienti.forEach(ensurePaziente);

    const pazientiPS = pazienti.filter(p => p.reparto === "ps");
    const testoRicerca = ricercaPazienti.toLowerCase();
    const pazientiFiltrati = pazientiPS
        .filter(p => filtroTriage === "Tutti" || p.codice === filtroTriage)
        .filter(p => {
            const testo = `${p.nome} ${p.cognome} ${p.cf} ${p.motivo}`.toLowerCase();
            return testo.includes(testoRicerca);
        })
        .sort((a, b) => triageWeight(a.codice) - triageWeight(b.codice));

    const counts = { Rosso: 0, Arancione: 0, Azzurro: 0, Verde: 0, Bianco: 0 };
    pazientiPS.forEach(p => {
        if (counts[p.codice] !== undefined) counts[p.codice]++;
    });

    const reparti = {
        chirurgia: pazienti.filter(p => p.reparto === "chirurgia"),
        medicinaInterna: pazienti.filter(p => p.reparto === "medicinaInterna")
    };

    const operatori = [...(medici || []), ...(personale || [])];

    app.innerHTML = `
    <div class="page-header">
        <div>
            <p class="eyebrow">Area operativa</p>
            <h2>📋 Pronto Soccorso</h2>
        </div>
        <div class="header-actions">
            <span class="operator-chip">Medico: ${escapeHtml(medicoLoggato ? medicoLoggato.nome : "")}</span>
            <button onclick="logout()">Logout</button>
            ${medicoLoggato?.ruolo === "admin" ? `<button onclick="pagina='archivio'; render()">Archivio</button>` : ``}
            ${medicoLoggato?.ruolo === "admin" ? `<button onclick="pagina='personale'; render()">Gestione Personale</button>` : ``}
            ${medicoLoggato?.ruolo === "admin" ? `<button onclick="pagina='intervento118'; render()">118</button>` : ``}
        </div>
    </div>

    <section class="stats-grid">
        <button class="stat-card triage-rosso" onclick="setFiltroTriage('Rosso')"><span>Rossi</span><b>${counts.Rosso}</b></button>
        <button class="stat-card triage-arancione" onclick="setFiltroTriage('Arancione')"><span>Arancioni</span><b>${counts.Arancione}</b></button>
        <button class="stat-card triage-azzurro" onclick="setFiltroTriage('Azzurro')"><span>Azzurri</span><b>${counts.Azzurro}</b></button>
        <button class="stat-card triage-verde" onclick="setFiltroTriage('Verde')"><span>Verdi</span><b>${counts.Verde}</b></button>
        <button class="stat-card triage-bianco" onclick="setFiltroTriage('Bianco')"><span>Bianchi</span><b>${counts.Bianco}</b></button>
    </section>

    <div class="dashboard-grid">
        <section class="work-panel">
            <div class="panel-title-row">
                <h3>Pazienti in carico</h3>
                <button onclick="pagina='nuovo'; render()">Nuovo paziente</button>
            </div>
            <div class="filters-row">
                <input id="ricercaPazienti" placeholder="Cerca nome, codice fiscale o motivo" value="${escapeHtml(ricercaPazienti)}" oninput="setRicercaPazienti(this.value)">
                <select onchange="setFiltroTriage(this.value)">
                    ${["Tutti", "Rosso", "Arancione", "Azzurro", "Verde", "Bianco"].map(c => `
                        <option value="${c}" ${filtroTriage === c ? "selected" : ""}>${c}</option>
                    `).join("")}
                </select>
            </div>

            <div class="patient-list">
                ${pazientiFiltrati.length ? pazientiFiltrati.map(p => {
                    const index = pazienti.findIndex(x => x.id === p.id);
                    return `
                    <article class="paziente ${triageClass(p.codice)}"
                        draggable="true"
                        ondragstart="dragStart(${index})"
                        ondragover="event.preventDefault();"
                        ondrop="drop(${index})">
                        <div class="patient-main">
                            <span class="triage-badge ${triageClass(p.codice)}">${escapeHtml(p.codice)}</span>
                            <div>
                                <h4>${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</h4>
                                <p>${escapeHtml(p.motivo || "Motivo non indicato")}</p>
                                <small>${repartoIcon(p.reparto)} ${labelReparto(p.reparto)} ${p.cf ? " - CF " + escapeHtml(p.cf) : ""}</small>
                            </div>
                        </div>
                        <div class="patient-actions">
                            <button onclick="apri('${p.id}')">Apri</button>
                            ${medicoLoggato?.ruolo === "admin" ? `<button class="danger" onclick="event.stopPropagation(); eliminaPaziente('${p.id}')">Elimina</button>` : ``}
                        </div>
                    </article>`;
                }).join("") : `<div class="empty-state">Nessun paziente corrisponde ai filtri.</div>`}
            </div>
        </section>

        <aside class="side-stack">
            ${medicoLoggato?.ruolo === "admin" ? `
            <section class="work-panel admin-panel">
                <div class="panel-title-row">
                    <h3>Gestione Personale</h3>
                    <span class="mini-count">Admin</span>
                </div>
                <p style="margin-top:0; color:#555;">Crea username e password per medici, infermieri e amministratori.</p>
                <button onclick="pagina='personale'; render()" style="width:100%;">Apri gestione personale</button>
            </section>
            ` : ``}

            <section class="work-panel">
                <div class="panel-title-row">
                    <h3>Operatori</h3>
                    <span class="mini-count">${operatori.length}</span>
                </div>
                <div class="operator-list">
                    ${operatori.map(o => `
                        <div class="operator-card">
                            <b>${escapeHtml(o.nome)}</b>
                            <small>${escapeHtml(o.ruolo || "n/d")}</small>
                        </div>
                    `).join("")}
                </div>
            </section>

            <section class="work-panel">
                <div class="panel-title-row">
                    <h3>🚑 Interventi 118</h3>
                    <button onclick="creaIntervento118()">Nuovo</button>
                </div>
                <div class="compact-list">
                    ${interventi118.slice(0, 5).map(i => `
                        <button class="compact-item" onclick="intervento118Selezionato='${i.id}'; pagina='intervento118'; render()">
                            <b>#${escapeHtml(i.numero)} - ${escapeHtml(i.stato)}</b>
                            <span>${escapeHtml(i.indirizzo || i.descrizione || "Scheda senza dettagli")}</span>
                        </button>
                    `).join("") || `<div class="empty-state">Nessun intervento aperto.</div>`}
                </div>
            </section>

            <section class="work-panel">
                <div class="panel-title-row">
                    <h3>Chirurgia</h3>
                    <button onclick="pagina='chirurgia'; render()">Apri</button>
                </div>
                ${reparti.chirurgia.map(p => `
                    <button class="ward-row" onclick="apri('${p.id}')">
                        <b>${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</b>
                        <span>${escapeHtml(p.codice)}</span>
                    </button>
                `).join("") || `<div class="empty-state">Nessun paziente.</div>`}
            </section>

            <section class="work-panel">
                <div class="panel-title-row">
                    <h3>Medicina Interna</h3>
                    <button onclick="pagina='medicinaInterna'; render()">Apri</button>
                </div>
                ${reparti.medicinaInterna.map(p => `
                    <button class="ward-row" onclick="apri('${p.id}')">
                        <b>${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</b>
                        <span>${escapeHtml(p.codice)}</span>
                    </button>
                `).join("") || `<div class="empty-state">Nessun paziente.</div>`}
            </section>
        </aside>
    </div>
    `;
}

function setFiltroTriage(valore) {
    filtroTriage = valore;
    render();
}

function setRicercaPazienti(valore) {
    ricercaPazienti = valore;
    render();
    setTimeout(() => {
        const input = document.getElementById("ricercaPazienti");
        if (!input) return;
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }, 0);
}

/* =======================
   NUOVO PAZIENTE
======================= */
function nuovo(app) {

    app.innerHTML = `
        <div class="card">
            <h2>➕ Nuovo Paziente</h2>

            <input id="nome" placeholder="Nome"><br>
            <input id="cognome" placeholder="Cognome"><br>
            <input id="nascita" type="date" placeholder="Data nascita"><br>
            <input id="luogo" placeholder="Luogo nascita"><br>
            <input id="cf" placeholder="Codice fiscale"><br>

            <textarea id="motivo" placeholder="Motivo accesso"></textarea><br>

            <select id="codice">
                <option>Rosso</option>
                <option>Arancione</option>
                <option>Azzurro</option>
                <option>Verde</option>
                <option>Bianco</option>
            </select><br>

            <select id="reparto">
                <option value="ps">Pronto Soccorso</option>
                <option value="chirurgia">Chirurgia</option>
                <option value="medicinaInterna">Medicina Interna</option>
                <option value="ortopedia">Ortopedia</option>
                <option value="cardiologia">Cardiologia</option>
                <option value="neurologia">Neurologia</option>
                <option value="rianimazione">Rianimazione</option>
            </select><br>

            <button onclick="aggiungi()">Salva</button>
        </div>
    `;

}

/* =======================
   AGGIUNGI PAZIENTE
======================= */
function aggiungi() {

    let nome = fieldValue("nome");
    let cognome = fieldValue("cognome");
    let nascita = fieldValue("nascita");
    let luogo = fieldValue("luogo");
    let cf = fieldValue("cf");
    let motivo = fieldValue("motivo");
    let codice = fieldValue("codice");
    let reparto = fieldValue("reparto") || "ps";

    if (!nome || !cognome) {
        alert("Nome e cognome obbligatori");
        return;
    }

    pazienti.push(ensurePaziente({
        id: id(),
        nome,
        cognome,
        nascita,
        luogo,
        cf,
        motivo,
        codice,
        reparto,
        parametri: {
            fc: "",
            fr: "",
            sat: "",
            pa: ""
        },
        parametriHistory: [],
        esami: [],
        terapie: [],
        visite: []
    }));

    logAction("Creato paziente " + nome + " " + cognome);
    salva();
    pagina = "ps";
    render();
}

/* =======================
   APRI CARTELLA
======================= */
function apri(idP) {
    let p = pazienti.find(p => p.id === idP);

    if (!p) {
        alert("Paziente non trovato");
        return;
    }

    pazienteSelezionato = ensurePaziente(p);
    pagina = "cartella";
    render();
}

function eliminaPaziente(idP) {
    if (medicoLoggato?.ruolo !== "admin") {
        alert("Solo l'amministratore può eliminare le cartelle");
        return;
    }
    if (!confirm("Sei sicuro di voler eliminare questa cartella?")) return;
    let cleanId = String(idP).trim();
    let index = pazienti.findIndex(p => String(p.id).trim() === cleanId);
    if (index === -1) {
        alert("Paziente non trovato");
        return;
    }
    pazienti.splice(index, 1);
    logAction("Eliminato paziente " + cleanId);
    if (pazienteSelezionato && pazienteSelezionato.id === cleanId) {
        pazienteSelezionato = null;
        pagina = "ps";
    }
    salva();
    render();
}

/* =======================
   CARTELLA (STILE OSPEDALE)
======================= */
function cartella(app) {

    let p = ensurePaziente(pazienteSelezionato);

    app.innerHTML = `
        <div class="card">
            <h2>📁 Cartella Clinica</h2>

            <h3>${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</h3>

            <p><b>Motivo:</b> ${escapeHtml(p.motivo)}</p>
            <p><b>Codice:</b> ${escapeHtml(p.codice)}</p>
            <p><b>Reparto:</b> ${escapeHtml(labelReparto(p.reparto))}</p>

            <label>Sposta paziente</label>
            <select id="repartoCartella" onchange="cambiaRepartoPaziente()">
                <option value="ps" ${p.reparto === "ps" ? "selected" : ""}>Pronto Soccorso</option>
                <option value="chirurgia" ${p.reparto === "chirurgia" ? "selected" : ""}>Chirurgia</option>
                <option value="medicinaInterna" ${p.reparto === "medicinaInterna" ? "selected" : ""}>Medicina Interna</option>
            </select>

            <hr>

            <h4>Parametri vitali</h4>

            <div>
                <label>FC:</label>
                <input id="fc" value="${escapeHtml(p.parametri.fc || "")}">
            </div>

            <div>
                <label>FR:</label>
                <input id="fr" value="${escapeHtml(p.parametri.fr || "")}">
            </div>

            <div>
                <label>SpO2:</label>
                <input id="sat" value="${escapeHtml(p.parametri.sat || "")}">
            </div>

            <div>
                <label>PA:</label>
                <input id="pa" value="${escapeHtml(p.parametri.pa || "")}">
            </div>

            <button onclick="salvaParametri()">Salva parametri</button>

            <h4>📈 Storico parametri</h4>

            <pre style="max-height:200px; overflow:auto;">
${(p.parametriHistory || []).map(h =>
escapeHtml(`[${h.time}] FC:${h.fc} FR:${h.fr} SpO2:${h.sat} PA:${h.pa}`)
).join("\n")}
</pre>

            <h4>🔬 Esami</h4>
            <pre>${escapeHtml(p.esami.join(", "))}</pre>

            <h4>💊 Terapie</h4>
            <pre>${escapeHtml(p.terapie.join(", "))}</pre>

            <h4>🩺 Visite</h4>
            <pre>${escapeHtml(p.visite.join(", "))}</pre>

            <hr>

            <button onclick="addEsami()">Esami</button>
            <button onclick="addTerapia()">Terapia</button>
            <button onclick="addVisita()">Visita</button>
            <button onclick="dimetti()">Dimissione e PDF</button>
        </div>
    `;
}

/* =======================
   MODULI
======================= */
function addEsami() {
    let valore = prompt("Esame");
    valore = valore?.trim();
    if (!valore) return;
    pazienteSelezionato.esami.push(valore);
    salva();
    render();
}

function addTerapia() {
    let valore = prompt("Terapia");
    valore = valore?.trim();
    if (!valore) return;
    pazienteSelezionato.terapie.push(valore);
    salva();
    render();
}

function addVisita() {
    let valore = prompt("Diagnosi");
    valore = valore?.trim();
    if (!valore) return;
    pazienteSelezionato.visite.push(valore);
    salva();
    render();
}

function cambiaRepartoPaziente() {
    if (!pazienteSelezionato) return;

    let reparto = fieldValue("repartoCartella") || "ps";
    let p = pazienti.find(x => x.id === pazienteSelezionato.id);
    if (!p) return;

    p.reparto = reparto;
    pazienteSelezionato = p;
    logAction("Spostato paziente " + p.nome + " " + p.cognome + " in " + labelReparto(reparto));
    salva();
    render();
}

function dragStart(index) {
    draggedIndex = index;
}

function drop(index) {

    if (draggedIndex === null) return;

    let temp = pazienti[draggedIndex];
    pazienti.splice(draggedIndex, 1);
    pazienti.splice(index, 0, temp);

    draggedIndex = null;

    salva();
    render();
}

/* =======================
   STAMPA PDF MEDICA (PRINT REALE)
======================= */

function stampaPDF() {
    // deprecated
}

/* =======================
   DIMISSIONE + ARCHIVIO + PDF PROFESSIONALE
======================= */
function dimetti() {

    let index = pazienti.findIndex(x => x.id === pazienteSelezionato?.id);

    if (index === -1 || !pazienteSelezionato) {
        alert("Paziente non valido");
        return;
    }

    let p = pazienti[index];

    archivio.push({
        ...p,
        dimessoIl: new Date().toLocaleString(),
        dimessoDa: medicoLoggato?.nome || ""
    });
    logAction("Dimesso paziente " + p.nome + " " + p.cognome);
    pazienti.splice(index, 1);
    salva();

    pazienteSelezionato = null;
    pagina = "ps";
    render();

    let win = window.open("", "_blank");

    win.document.write(`
    <html>
    <head>
        <title>Lettera di Dimissione</title>
        <style>
            body {
                font-family: Georgia, serif;
                padding: 40px;
                color: #1a1a1a;
            }

            .header {
                text-align: center;
                border-bottom: 3px solid #000;
                margin-bottom: 25px;
                padding-bottom: 10px;
            }

            h1 {
                font-size: 24px;
                letter-spacing: 2px;
            }

            .section {
                margin-bottom: 15px;
            }

            .box {
                border: 1px solid #999;
                padding: 12px;
                margin-top: 6px;
                white-space: pre-wrap;
            }

            .label {
                font-weight: bold;
            }
        </style>
    </head>

    <body>

        <div class="header">
            <h1>OSPEDALE - LETTERA DI DIMISSIONE</h1>
            <p>Data: ${new Date().toLocaleString()}</p>
            <p>Dimesso da: ${medicoLoggato?.nome || ""}</p>
        </div>

        <div class="section">
            <span class="label">Paziente:</span> ${p.nome} ${p.cognome}
        </div>

        <div class="section">
            <span class="label">Codice fiscale:</span> ${p.cf}
        </div>

        <div class="section">
            <span class="label">Motivo accesso:</span>
            <div class="box">${p.motivo}</div>
        </div>

        <div class="section">
            <span class="label">Codice triage:</span> ${p.codice}</div>

        <div class="section">
            <span class="label">Parametri finali:</span>
            <div class="box">${JSON.stringify(p.parametri, null, 2)}</div>
        </div>

        <div class="section">
            <span class="label">Terapie:</span>
            <div class="box">${(p.terapie || []).join("\n")}</div>
        </div>

        <div class="section">
            <span class="label">Esami:</span>
            <div class="box">${(p.esami || []).join("\n")}</div>
        </div>

        <div class="section">
            <p style="margin-top:30px;">Firma medico: ______________________</p>
        </div>

        <script>
            window.onload = () => window.print();
        </script>

    </body>
    </html>
    `);

    win.document.close();
}

function archivioView(app) {

    if (medicoLoggato?.ruolo !== "admin") {
        alert("Accesso negato");
        pagina = "ps";
        render();
        return;
    }

    let html = `<h2>Archivio Pazienti Dimessi</h2>
    <button onclick="pagina='ps'; render()">Indietro</button>`;

    archivio.forEach(p => {
        html += `
            <div style="border:1px solid #ccc; padding:10px; margin:8px 0;">
                <b>${p.nome} ${p.cognome}</b><br>
                Dimesso il: ${p.dimessoIl || ""}
                <pre style="white-space:pre-wrap;">${p.motivo || ""}</pre>
            </div>
        `;
    });

    app.innerHTML = html;
}

/* =======================
   SALVA PARAMETRI
======================= */

function salvaParametri() {
    let p = pazienteSelezionato;
    if (!p) return;

    let newParams = {
        fc: document.getElementById("fc").value,
        fr: document.getElementById("fr").value,
        sat: document.getElementById("sat").value,
        pa: document.getElementById("pa").value,
        time: new Date().toLocaleString()
    };

    if (!p.parametriHistory) p.parametriHistory = [];

    p.parametri = {
        fc: newParams.fc,
        fr: newParams.fr,
        sat: newParams.sat,
        pa: newParams.pa
    };

    p.parametriHistory.push(newParams);
    logAction("Aggiornati parametri paziente " + p.nome + " " + p.cognome);
    salva();
    pazienteSelezionato = pazienti.find(x => x.id === pazienteSelezionato.id);
    render();
}

/* =======================
   LOGIN SYSTEM
======================= */

function login(app) {
    app.innerHTML = `
        <div class="card">
            <h2>🔐 Login Operatore</h2>

            <input id="user" placeholder="Username">
            <input id="pass" type="password" placeholder="Password">

            <button onclick="doLogin()">Accedi</button>
        </div>
    `;
}

function doLogin() {
    let u = document.getElementById("user").value.trim().toLowerCase();
    let p = document.getElementById("pass").value.trim();

    // cerca prima tra utenti di default e poi tra personale creato dall'admin
    let found =
        medici.find(m => m.username === u && m.password === p) ||
        personale.find(m => m.username === u && m.password === p);

    if (!found) {
        alert("Credenziali non valide");
        return;
    }

    medicoLoggato = found;

    // assicurati che abbia ruolo (fallback sicurezza)
    if (!medicoLoggato.ruolo) {
        medicoLoggato.ruolo = "infermiere";
    }

    pagina = "ps";
    render();
}

function logout() {
    medicoLoggato = null;
    pagina = "ps";
    render();
}
function personaleView(app) {

    if (medicoLoggato?.ruolo !== "admin") {
        alert("Accesso negato");
        pagina = "ps";
        render();
        return;
    }

    const utentiSistema = [...medici, ...personale];

    let html = `
        <div class="page-header">
            <div>
                <p class="eyebrow">Amministrazione</p>
                <h2>Gestione Personale</h2>
            </div>
            <div class="header-actions">
                <button onclick="pagina='ps'; render()">Torna al PS</button>
            </div>
        </div>

        <section class="work-panel">
            <div class="panel-title-row">
                <h3>Crea nuovo utente</h3>
                <span class="mini-count">Solo admin</span>
            </div>
            <div class="form-grid compact">
                <label>Nome operatore
                    <input id="nuovoNome" placeholder="Es. Mario Rossi">
                </label>
                <label>Username
                    <input id="nuovoUser" placeholder="Es. m.rossi">
                </label>
                <label>Password
                    <input id="nuovoPass" type="password" placeholder="Password di accesso">
                </label>
                <label>Ruolo
                    <select id="nuovoRuolo">
                        <option value="infermiere">Infermiere</option>
                        <option value="medico">Medico</option>
                        <option value="admin">Amministratore</option>
                    </select>
                </label>
            </div>
            <button onclick="aggiungiPersonale()">Crea credenziali</button>
        </section>

        <section class="work-panel" style="margin-top:15px;">
            <div class="panel-title-row">
                <h3>Staff registrato</h3>
                <span class="mini-count">${utentiSistema.length}</span>
            </div>
            <div class="operator-list">
                ${utentiSistema.map(p => `
                    <div class="operator-card">
                        <b>${escapeHtml(p.nome)}</b>
                        <small>${escapeHtml(p.ruolo || "n/d")} · username: ${escapeHtml(p.username)}</small>
                        ${p.username !== "admin" ? `
                            <button class="danger" onclick="eliminaPersonale('${escapeHtml(p.username)}')">Revoca accesso</button>
                        ` : `<small>Account principale non revocabile</small>`}
                    </div>
                `).join("")}
            </div>
        </section>

        <section class="work-panel" style="margin-top:15px;">
            <div class="panel-title-row"><h3>Log azioni</h3></div>
            <div style="max-height:220px; overflow:auto; border:1px solid #ccc; padding:8px; border-radius:8px;">
                ${(logAzioni || []).slice().reverse().map(l =>
                    `[${escapeHtml(l.time)}] ${escapeHtml(l.user)} (${escapeHtml(l.ruolo)}) → ${escapeHtml(l.azione)}`
                ).join("<br>") || "Nessuna azione registrata."}
            </div>
        </section>
    `;

    app.innerHTML = html;
}

function aggiungiPersonale() {

    if (medicoLoggato?.ruolo !== "admin") return;

    let username = fieldValue("nuovoUser").toLowerCase();
    let password = fieldValue("nuovoPass");
    let nome = fieldValue("nuovoNome");
    let ruolo = fieldValue("nuovoRuolo") || "infermiere";

    if (!username || !password || !nome) {
        alert("Compila tutti i campi");
        return;
    }

    if (password.length < 6) {
        alert("La password deve contenere almeno 6 caratteri");
        return;
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
        alert("Username consentito: lettere, numeri, punto, trattino e underscore");
        return;
    }

    if ([...medici, ...personale].some(p => p.username === username)) {
        alert("Username già esistente");
        return;
    }

    personale.push({
        username,
        password,
        nome,
        ruolo
    });

    logAction("Create credenziali per operatore: " + username + " (" + ruolo + ")");

    salva();
    render();
}

function eliminaPersonale(username) {

    if (medicoLoggato?.ruolo !== "admin") {
        alert("Accesso negato");
        return;
    }

    if (username === "admin") {
        alert("L'account amministratore principale non può essere revocato");
        return;
    }

    if (!confirm("Sei sicuro di voler revocare l'accesso a questo operatore?")) return;

    let index = personale.findIndex(p => p.username === username);

    if (index === -1) {
        alert("Operatore non trovato");
        return;
    }

    personale.splice(index, 1);

    logAction("Revocato accesso operatore: " + username);

    salva();
    render();
}

function creaIntervento118() {

    intervento118Counter += 1;

    let nuovo = {
        id: id(),
        numero: intervento118Counter,
        data: new Date().toLocaleString(),
        descrizione: "",
        indirizzo: "",
        priorita: "verde",
        stato: "aperto",
        ambulanceId: "",
        createdAt: new Date().toLocaleString(),
        dispatchedAt: "",
        arrivedAt: "",
        closedAt: "",
        mezzo: "",
        equipaggio: "",
        paziente: {
            cognomeNome: "",
            dataNascita: "",
            sesso: "",
            cf: "",
            residenza: "",
            accompagnatore: "",
            telefono: ""
        },
        scena: {
            luogo: "",
            tipologia: "",
            dinamica: ""
        },
        abcde: {
            a: "",
            b: "",
            c: "",
            d: "",
            e: ""
        },
        sample: {
            s: "",
            a: "",
            m: "",
            p: "",
            l: "",
            e: ""
        },
        vitali: {
            iniziale: "",
            itinere: "",
            finale: ""
        },
        trattamento: {
            ossigeno: "",
            presidi: "",
            accesso: "",
            farmaci: ""
        },
        destinazione: {
            esito: "",
            ospedale: "",
            codice: ""
        }
    };

    interventi118.push(nuovo);

    intervento118Selezionato = nuovo.id;

    logAction("Creato intervento 118 #" + nuovo.numero);

    salva();
    render();
}

function prioritaWeight(p) {
    if (p === "rosso") return 1;
    if (p === "giallo") return 2;
    if (p === "verde") return 3;
    if (p === "bianco") return 4;
    return 5;
}

function intervento118View(app) {

    // LISTA INTERVENTI
    if (!intervento118Selezionato) {

        let html = `
            <div class="card">
                <h2>🚑 Interventi 118</h2>

                <button onclick="creaIntervento118()">➕ Nuovo intervento</button>
                <button onclick="pagina='ps'; render()">Torna al PS</button>
        `;

        // STATISTICHE RAPIDE
        let stats = {
            rosso: 0,
            giallo: 0,
            verde: 0,
            bianco: 0,
            aperti: 0,
            chiusi: 0
        };

        interventi118.forEach(i => {
            stats[i.priorita] = (stats[i.priorita] || 0) + 1;
            if (i.stato === "chiuso") stats.chiusi++;
            else stats.aperti++;
        });

        html += `
<div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
    <div>🔴 ${stats.rosso}</div>
    <div>🟡 ${stats.giallo}</div>
    <div>🟢 ${stats.verde}</div>
    <div>⚪ ${stats.bianco}</div>
    <div>📂 Aperti: ${stats.aperti}</div>
    <div>✅ Chiusi: ${stats.chiusi}</div>
</div>

<hr>
                <h3 style="margin-top:15px;">Interventi aperti</h3>
        `;

        html += [...interventi118]
            .sort((a, b) => prioritaWeight(a.priorita) - prioritaWeight(b.priorita))
            .map(i => `
            <div style="border:1px solid #ddd; padding:10px; margin:6px; cursor:pointer; border-left:8px solid ${
                i.priorita === 'rosso' ? 'red' :
                i.priorita === 'giallo' ? 'gold' :
                i.priorita === 'verde' ? 'green' :
                '#e0e0e0'
            }"
                 onclick="openIntervento118('${i.id}')">
                <b>#${i.numero}</b> - ${i.stato}<br>
                <small>${i.data}</small><br>
                <span>${(i.indirizzo || 'Nessun indirizzo')}</span><br>
                <span>${(i.descrizione || '').slice(0, 60) || "Nessuna descrizione"}</span>
                <br><small>🚑 ${i.ambulanceId ? ("Assegnata: " + i.ambulanceId) : "Nessuna ambulanza"}</small>
                <br>
                <button onclick="event.stopPropagation(); chiudiIntervento('${i.id}')"
                    style="margin-top:8px; background:red; color:white; border:none; padding:5px; border-radius:4px;">
                    Chiudi intervento
                </button>
            </div>
        `).join("");

        html += `</div>`;

        app.innerHTML = html;
        return;
    }

    // SCHEDA INTERVENTO
    let i = interventi118.find(x => x.id === intervento118Selezionato);

    if (!i) {
        intervento118Selezionato = null;
        render();
        return;
    }

    app.innerHTML = `
<div class="card">
<h2>🚑 SCHEDA 118 #${i.numero}</h2>

<h3>1. Dati intervento</h3>
<p>Data apertura: ${i.data}</p>

<label>Mezzo di soccorso</label><br>
<select id="mezzo" style="width:100%">
    <option value="">-- Seleziona mezzo --</option>
    <option value="MSA" ${i.mezzo==="MSA"?'selected':''}>MSA</option>
    <option value="MSB" ${i.mezzo==="MSB"?'selected':''}>MSB</option>
    <option value="VLV" ${i.mezzo==="VLV"?'selected':''}>VLV</option>
</select><br><br>

<label>Equipaggio</label><br>
<input id="equipaggio" value="${i.equipaggio || ""}" style="width:100%"><br><br>

<h3>2. Paziente</h3>
<input id="paziente" placeholder="Cognome e Nome" value="${i.paziente?.cognomeNome || ""}" style="width:100%"><br><br>
<input id="nascita" placeholder="Data nascita" value="${i.paziente?.dataNascita || ""}"><br><br>
<select id="sesso">
    <option value="">-- Sesso --</option>
    <option value="M" ${i.paziente?.sesso==="M"?'selected':''}>M</option>
    <option value="F" ${i.paziente?.sesso==="F"?'selected':''}>F</option>
    <option value="Altro" ${i.paziente?.sesso==="Altro"?'selected':''}>Altro</option>
</select><br><br>
<input id="cf" placeholder="Codice fiscale" value="${i.paziente?.cf || ""}" style="width:100%"><br><br>

<h3>3. Scenario</h3>
<select id="luogo" style="width:100%">
    <option value="">-- Luogo evento --</option>
    <option value="Strada" ${i.scena?.luogo==="Strada"?'selected':''}>Strada/Suolo pubblico</option>
    <option value="Casa" ${i.scena?.luogo==="Casa"?'selected':''}>Casa</option>
    <option value="Lavoro" ${i.scena?.luogo==="Lavoro"?'selected':''}>Lavoro</option>
    <option value="Scuola" ${i.scena?.luogo==="Scuola"?'selected':''}>Scuola</option>
    <option value="Altro" ${i.scena?.luogo==="Altro"?'selected':''}>Altro</option>
</select><br><br>
<select id="tipologia" style="width:100%">
    <option value="">-- Tipologia --</option>
    <option value="Medica" ${i.scena?.tipologia==="Medica"?'selected':''}>Patologia medica</option>
    <option value="Trauma" ${i.scena?.tipologia==="Trauma"?'selected':''}>Trauma/Infortunio</option>
    <option value="Incidente" ${i.scena?.tipologia==="Incidente"?'selected':''}>Incidente stradale</option>
    <option value="Intossicazione" ${i.scena?.tipologia==="Intossicazione"?'selected':''}>Intossicazione</option>
</select><br><br>
<textarea id="dinamica" placeholder="Dinamica">${i.scena?.dinamica || ""}</textarea><br><br>

<h3>4. ABCDE</h3>
<select id="a">
    <option value="">A - Vie aeree</option>
    <option value="Pervie" ${i.abcde?.a==="Pervie"?'selected':''}>Pervie</option>
    <option value="Ostruite" ${i.abcde?.a==="Ostruite"?'selected':''}>Ostruite</option>
</select><br><br>
<select id="b">
    <option value="">B - Respiro</option>
    <option value="Eupnoico" ${i.abcde?.b==="Eupnoico"?'selected':''}>Eupnoico</option>
    <option value="Dispnoico" ${i.abcde?.b==="Dispnoico"?'selected':''}>Dispnoico</option>
    <option value="Apnea" ${i.abcde?.b==="Apnea"?'selected':''}>Apnea</option>
</select><br><br>
<select id="c">
    <option value="">C - Circolo</option>
    <option value="Ritmico" ${i.abcde?.c==="Ritmico"?'selected':''}>Ritmico</option>
    <option value="Aritmico" ${i.abcde?.c==="Aritmico"?'selected':''}>Aritmico</option>
    <option value="Debole" ${i.abcde?.c==="Debole"?'selected':''}>Debole</option>
</select><br><br>
<select id="d">
    <option value="">D - Neurologico</option>
    <option value="Normale" ${i.abcde?.d==="Normale"?'selected':''}>Normale</option>
    <option value="Alterato" ${i.abcde?.d==="Alterato"?'selected':''}>Alterato</option>
</select><br><br>
<select id="e">
    <option value="">E - Esposizione</option>
    <option value="Nessuna lesione" ${i.abcde?.e==="Nessuna lesione"?'selected':''}>Nessuna lesione</option>
    <option value="Lesioni presenti" ${i.abcde?.e==="Lesioni presenti"?'selected':''}>Lesioni presenti</option>
</select><br><br>

<h3>5. Parametri vitali</h3>

<label>FC (bpm)</label>
<input id="fc" type="number" value="${i.vitali?.fc || ""}"><br><br>

<label>FR (/min)</label>
<input id="fr" type="number" value="${i.vitali?.fr || ""}"><br><br>

<label>SpO2 (%)</label>
<input id="spo2" type="number" value="${i.vitali?.spo2 || ""}"><br><br>

<label>PA</label>
<input id="pa" value="${i.vitali?.pa || ""}"><br><br>

<h3>6. Trattamento</h3>

<label><input type="checkbox" id="t_ossigeno" ${i.trattamento?.ossigeno ? "checked" : ""}> Ossigeno</label><br>
<label><input type="checkbox" id="t_accesso" ${i.trattamento?.accesso ? "checked" : ""}> Accesso venoso</label><br>
<label><input type="checkbox" id="t_monitoraggio" ${i.trattamento?.monitoraggio ? "checked" : ""}> Monitoraggio</label><br>
<label><input type="checkbox" id="t_immobilizzazione" ${i.trattamento?.immobilizzazione ? "checked" : ""}> Immobilizzazione</label><br>
<label><input type="checkbox" id="t_analgesia" ${i.trattamento?.analgesia ? "checked" : ""}> Analgesia</label><br><br>

<textarea id="t_note" placeholder="Note trattamento" style="width:100%">${i.trattamento?.note || ""}</textarea><br><br>

<h3>7. Destinazione</h3>
<select id="esito">
    <option value="">-- Esito --</option>
    <option value="TRASPORTATO" ${i.destinazione?.esito==="TRASPORTATO"?'selected':''}>TRASPORTATO</option>
    <option value="DECEDUTO" ${i.destinazione?.esito==="DECEDUTO"?'selected':''}>DECEDUTO</option>
    <option value="TRATTATO SUL POSTO" ${i.destinazione?.esito==="TRATTATO SUL POSTO"?'selected':''}>TRATTATO SUL POSTO</option>
    <option value="RIFIUTA TRASPORTO" ${i.destinazione?.esito==="RIFIUTA TRASPORTO"?'selected':''}>RIFIUTA TRASPORTO</option>
</select><br><br>
<input id="ospedale" placeholder="Ospedale destinazione" value="${i.destinazione?.ospedale || ""}" style="width:100%"><br><br>
<select id="codiceDest">
    <option value="">-- Codice rientro --</option>
    <option value="NERO" ${i.destinazione?.codice==="NERO"?'selected':''}>NERO</option>
    <option value="ROSSO" ${i.destinazione?.codice==="ROSSO"?'selected':''}>ROSSO</option>
    <option value="GIALLO" ${i.destinazione?.codice==="GIALLO"?'selected':''}>GIALLO</option>
    <option value="VERDE" ${i.destinazione?.codice==="VERDE"?'selected':''}>VERDE</option>
    <option value="BIANCO" ${i.destinazione?.codice==="BIANCO"?'selected':''}>BIANCO</option>
</select><br><br>

<hr>

<button onclick="salvaIntervento118('${i.id}')">💾 Salva scheda</button>
<button onclick="intervento118Selezionato=null; render()">Indietro</button>
</div>
`;
}

function openIntervento118(id) {
    intervento118Selezionato = id;
    render();
}

function salvaIntervento118(idInt) {
    let i = interventi118.find(x => x.id === idInt);
    if (!i) return;

    i.mezzo = document.getElementById("mezzo").value;
    i.equipaggio = document.getElementById("equipaggio").value;

    i.paziente = {
        cognomeNome: document.getElementById("paziente").value,
        dataNascita: document.getElementById("nascita").value,
        sesso: document.getElementById("sesso").value,
        cf: document.getElementById("cf").value
    };

    i.scena = {
        luogo: document.getElementById("luogo").value,
        tipologia: document.getElementById("tipologia").value,
        dinamica: document.getElementById("dinamica").value
    };

    i.abcde = {
        a: document.getElementById("a").value,
        b: document.getElementById("b").value,
        c: document.getElementById("c").value,
        d: document.getElementById("d").value,
        e: document.getElementById("e").value
    };

    i.vitali = {
        fc: document.getElementById("fc").value,
        fr: document.getElementById("fr").value,
        spo2: document.getElementById("spo2").value,
        pa: document.getElementById("pa").value
    };

    i.trattamento = {
        ossigeno: document.getElementById("t_ossigeno").checked,
        accesso: document.getElementById("t_accesso").checked,
        monitoraggio: document.getElementById("t_monitoraggio").checked,
        immobilizzazione: document.getElementById("t_immobilizzazione").checked,
        analgesia: document.getElementById("t_analgesia").checked,
        note: document.getElementById("t_note").value
    };

    i.destinazione = {
        esito: document.getElementById("esito").value,
        ospedale: document.getElementById("ospedale").value,
        codice: document.getElementById("codiceDest").value
    };

    salva();
    render();
}

function startIntervento(id) {
    let i = interventi118.find(x => x.id === id);
    if (!i) return;

    i.stato = "in arrivo";
    i.dispatchedAt = new Date().toLocaleString();

    salva();
    render();
}

function arrivoIntervento(id) {
    let i = interventi118.find(x => x.id === id);
    if (!i) return;

    i.stato = "sul posto";
    i.arrivedAt = new Date().toLocaleString();

    salva();
    render();
}

function chiudiIntervento(id) {
    let i = interventi118.find(x => x.id === id);
    if (!i) return;

    i.stato = "chiuso";
    i.closedAt = new Date().toLocaleString();

    // sposta in archivio interventi
    interventi118Archivio.push({
        ...i,
        archivedAt: new Date().toLocaleString()
    });

    // rimuovi dalla lista attiva
    interventi118 = interventi118.filter(x => x.id !== id);

    salva();
    render();

    // =========================
    // GENERAZIONE PDF (PRINT HTML)
    // =========================
    let win = window.open("", "_blank");

    win.document.write(`
        <html>
        <head>
            <title>Intervento 118 #${i.numero}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                }
                h1 {
                    text-align: center;
                    border-bottom: 2px solid #000;
                    padding-bottom: 10px;
                }
                .box {
                    border: 1px solid #ccc;
                    padding: 10px;
                    margin-bottom: 10px;
                    white-space: pre-wrap;
                }
                .section {
                    margin-bottom: 15px;
                }
                .label {
                    font-weight: bold;
                }
            </style>
        </head>
        <body>

            <h1>SCHEDE INTERVENTO 118</h1>
            <p><b>Numero intervento:</b> #${i.numero}</p>
            <p><b>Data apertura:</b> ${i.data}</p>
            <p><b>Chiusura:</b> ${i.closedAt}</p>

            <div class="section">
                <span class="label">Mezzo:</span> ${i.mezzo || ""}
            </div>

            <div class="section">
                <span class="label">Equipaggio:</span>
                <div class="box">${i.equipaggio || ""}</div>
            </div>

            <div class="section">
                <span class="label">Paziente:</span>
                <div class="box">${i.paziente?.cognomeNome || ""}</div>
            </div>

            <div class="section">
                <span class="label">Scenario:</span>
                <div class="box">
Luogo: ${i.scena?.luogo || ""}
Tipologia: ${i.scena?.tipologia || ""}
Dinamica: ${i.scena?.dinamica || ""}
                </div>
            </div>

            <div class="section">
                <span class="label">ABCDE:</span>
                <div class="box">
A: ${i.abcde?.a || ""}
B: ${i.abcde?.b || ""}
C: ${i.abcde?.c || ""}
D: ${i.abcde?.d || ""}
E: ${i.abcde?.e || ""}
                </div>
            </div>

            <div class="section">
                <span class="label">Parametri vitali:</span>
                <div class="box">
FC: ${i.vitali?.fc || ""}
FR: ${i.vitali?.fr || ""}
SpO2: ${i.vitali?.spo2 || ""}
PA: ${i.vitali?.pa || ""}
                </div>
            </div>

            <div class="section">
                <span class="label">Trattamento:</span>
                <div class="box">
Ossigeno: ${i.trattamento?.ossigeno ? "SI" : "NO"}
Accesso venoso: ${i.trattamento?.accesso ? "SI" : "NO"}
Monitoraggio: ${i.trattamento?.monitoraggio ? "SI" : "NO"}
Immobilizzazione: ${i.trattamento?.immobilizzazione ? "SI" : "NO"}
Analgesia: ${i.trattamento?.analgesia ? "SI" : "NO"}

Note:
${i.trattamento?.note || ""}
                </div>
            </div>

            <div class="section">
                <span class="label">Esito:</span> ${i.destinazione?.esito || ""}
            </div>

            <div class="section">
                <span class="label">Ospedale:</span> ${i.destinazione?.ospedale || ""}
            </div>

            <div class="section">
                <span class="label">Codice rientro:</span> ${i.destinazione?.codice || ""}
            </div>

            <script>
                window.onload = () => window.print();
            </script>

        </body>
        </html>
    `);

    win.document.close();
}

function intervento118Card(i) {
    return `
        <article class="intervention-card ${escapeHtml(i.priorita || "verde")}" onclick="openIntervento118('${i.id}')">
            <div>
                <b>#${escapeHtml(i.numero)} - ${escapeHtml(i.stato || "aperto")}</b>
                <p>${escapeHtml(i.indirizzo || "Indirizzo non indicato")}</p>
                <small>${escapeHtml(i.descrizione || "Nessuna descrizione")} ${i.ambulanceId ? " - " + escapeHtml(i.ambulanceId) : ""}</small>
            </div>
            <div class="intervention-actions">
                <button onclick="event.stopPropagation(); cambiaStatoIntervento('${i.id}', 'in arrivo')">Partenza</button>
                <button onclick="event.stopPropagation(); cambiaStatoIntervento('${i.id}', 'sul posto')">Sul posto</button>
                <button class="danger" onclick="event.stopPropagation(); chiudiIntervento('${i.id}')">Chiudi</button>
            </div>
        </article>
    `;
}

/* =======================
   OVERRIDE FINALI REPARTI
======================= */

function repartoSpecificoHTML(p) {
    p = ensurePaziente(p);

    if (p.reparto === "chirurgia") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row"><h3>Modulo Chirurgia</h3><button onclick="salvaModuloReparto()">Salva modulo</button></div>
                <div class="form-grid compact">
                    <label>Diagnosi chirurgica<input id="chirDiagnosi" value="${escapeHtml(p.chirurgia.diagnosi || "")}"></label>
                    <label>Procedura prevista<input id="chirProcedura" value="${escapeHtml(p.chirurgia.procedura || "")}"></label>
                    <label>Rischio anestesiologico<input id="chirRischio" value="${escapeHtml(p.chirurgia.rischioAnestesiologico || "")}"></label>
                    <label>Digiuno<input id="chirDigiuno" value="${escapeHtml(p.chirurgia.digiuno || "")}"></label>
                    <label>Profilassi<input id="chirProfilassi" value="${escapeHtml(p.chirurgia.profilassi || "")}"></label>
                    <label class="check-row"><input id="chirConsenso" type="checkbox" ${p.chirurgia.consenso ? "checked" : ""}> Consenso informato acquisito</label>
                </div>
                <textarea id="chirNote" placeholder="Note pre/post operatorie">${escapeHtml(p.chirurgia.noteOperatorie || "")}</textarea>
            </section>
        `;
    }

    if (p.reparto === "medicinaInterna") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row"><h3>Modulo Medicina Interna</h3><button onclick="salvaModuloReparto()">Salva modulo</button></div>
                <div class="form-grid compact">
                    <label>Anamnesi<input id="miAnamnesi" value="${escapeHtml(p.medicinaInterna.anamnesi || "")}"></label>
                    <label>Diagnosi / problema attivo<input id="miDiagnosi" value="${escapeHtml(p.medicinaInterna.diagnosi || "")}"></label>
                    <label>Comorbidità<input id="miComorbidita" value="${escapeHtml(p.medicinaInterna.comorbidita || "")}"></label>
                    <label>Terapia cronica<input id="miTerapiaCronica" value="${escapeHtml(p.medicinaInterna.terapiaCronica || "")}"></label>
                </div>
                <textarea id="miPiano" placeholder="Piano diagnostico-terapeutico">${escapeHtml(p.medicinaInterna.piano || "")}</textarea>
            </section>
        `;
    }

    if (p.reparto === "ortopedia") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row"><h3>Modulo Ortopedia</h3><button onclick="salvaModuloReparto()">Salva modulo</button></div>
                <div class="form-grid compact">
                    <label>Distretto lesionato<input id="ortoDistretto" value="${escapeHtml(p.ortopedia.distretto || "")}"></label>
                    <label>Dinamica trauma<input id="ortoTrauma" value="${escapeHtml(p.ortopedia.trauma || "")}"></label>
                    <label>Frattura / lesione<input id="ortoFrattura" value="${escapeHtml(p.ortopedia.frattura || "")}"></label>
                    <label>Immobilizzazione<input id="ortoImmobilizzazione" value="${escapeHtml(p.ortopedia.immobilizzazione || "")}"></label>
                    <label>Carico<input id="ortoCarico" value="${escapeHtml(p.ortopedia.carico || "")}"></label>
                    <label>Follow-up<input id="ortoFollowUp" value="${escapeHtml(p.ortopedia.followUp || "")}"></label>
                </div>
                <textarea id="ortoIndicazione" placeholder="Indicazione: dimissione, gesso/tutore, riduzione, sala operatoria, ricovero">${escapeHtml(p.ortopedia.indicazione || "")}</textarea>
            </section>
        `;
    }

    if (p.reparto === "cardiologia") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row"><h3>Modulo Cardiologia / UTIC</h3><button onclick="salvaModuloReparto()">Salva modulo</button></div>
                <div class="form-grid compact">
                    <label>Dolore toracico<input id="cardioDolore" value="${escapeHtml(p.cardiologia.doloreToracico || "")}"></label>
                    <label>ECG<input id="cardioEcg" value="${escapeHtml(p.cardiologia.ecg || "")}"></label>
                    <label>Troponine seriali<input id="cardioTroponine" value="${escapeHtml(p.cardiologia.troponine || "")}"></label>
                    <label>Ritmo / aritmie<input id="cardioRitmo" value="${escapeHtml(p.cardiologia.ritmo || "")}"></label>
                    <label>Classe rischio<input id="cardioRischio" value="${escapeHtml(p.cardiologia.rischio || "")}"></label>
                    <label>Terapia acuta<input id="cardioTerapia" value="${escapeHtml(p.cardiologia.terapia || "")}"></label>
                </div>
                <textarea id="cardioPiano" placeholder="Piano: osservazione, coronarografia, UTIC, dimissione protetta">${escapeHtml(p.cardiologia.piano || "")}</textarea>
            </section>
        `;
    }

    if (p.reparto === "neurologia") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row"><h3>Modulo Neurologia / Stroke Unit</h3><button onclick="salvaModuloReparto()">Salva modulo</button></div>
                <div class="form-grid compact">
                    <label>Deficit neurologico<input id="neuroDeficit" value="${escapeHtml(p.neurologia.deficit || "")}"></label>
                    <label>NIHSS<input id="neuroNihss" type="number" min="0" value="${escapeHtml(p.neurologia.nihss || "")}"></label>
                    <label>Ora esordio / last seen well<input id="neuroOnset" value="${escapeHtml(p.neurologia.onset || "")}"></label>
                    <label>TAC / angio-TAC<input id="neuroTac" value="${escapeHtml(p.neurologia.tac || "")}"></label>
                    <label class="check-row"><input id="neuroTrombolisi" type="checkbox" ${p.neurologia.trombolisi ? "checked" : ""}> Trombolisi indicata/eseguita</label>
                    <label class="check-row"><input id="neuroTrombectomia" type="checkbox" ${p.neurologia.trombectomia ? "checked" : ""}> Trombectomia valutata</label>
                </div>
                <textarea id="neuroPiano" placeholder="Piano neurologico, monitoraggio, antiaggregazione/anticoagulazione, ricovero">${escapeHtml(p.neurologia.piano || "")}</textarea>
            </section>
        `;
    }

    if (p.reparto === "rianimazione") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row"><h3>Modulo Rianimazione / Terapia Intensiva</h3><button onclick="salvaModuloReparto()">Salva modulo</button></div>
                <div class="form-grid compact">
                    <label>Via aerea<input id="riaViaAerea" value="${escapeHtml(p.rianimazione.viaAerea || "")}"></label>
                    <label>Ventilazione<input id="riaVentilazione" value="${escapeHtml(p.rianimazione.ventilazione || "")}"></label>
                    <label>Accessi venosi / arteriosi<input id="riaAccessi" value="${escapeHtml(p.rianimazione.accessi || "")}"></label>
                    <label>Sedazione / analgesia<input id="riaSedazione" value="${escapeHtml(p.rianimazione.sedazione || "")}"></label>
                    <label>Vasopressori<input id="riaVasopressori" value="${escapeHtml(p.rianimazione.vasopressori || "")}"></label>
                    <label>Monitoraggio<input id="riaMonitoraggio" value="${escapeHtml(p.rianimazione.monitoraggio || "")}"></label>
                </div>
                <textarea id="riaPiano" placeholder="Piano intensivo, target emodinamici/respiratori, rivalutazione">${escapeHtml(p.rianimazione.piano || "")}</textarea>
            </section>
        `;
    }

    return "";
}

function salvaModuloReparto() {
    let p = pazienteSelezionato;
    if (!p) return;
    p = ensurePaziente(p);

    if (p.reparto === "chirurgia") {
        p.chirurgia = {
            diagnosi: fieldValue("chirDiagnosi"),
            procedura: fieldValue("chirProcedura"),
            rischioAnestesiologico: fieldValue("chirRischio"),
            consenso: document.getElementById("chirConsenso")?.checked || false,
            digiuno: fieldValue("chirDigiuno"),
            profilassi: fieldValue("chirProfilassi"),
            noteOperatorie: fieldValue("chirNote")
        };
    }
    if (p.reparto === "medicinaInterna") {
        p.medicinaInterna = {
            anamnesi: fieldValue("miAnamnesi"),
            diagnosi: fieldValue("miDiagnosi"),
            comorbidita: fieldValue("miComorbidita"),
            terapiaCronica: fieldValue("miTerapiaCronica"),
            piano: fieldValue("miPiano")
        };
    }
    if (p.reparto === "ortopedia") {
        p.ortopedia = {
            distretto: fieldValue("ortoDistretto"),
            trauma: fieldValue("ortoTrauma"),
            frattura: fieldValue("ortoFrattura"),
            immobilizzazione: fieldValue("ortoImmobilizzazione"),
            carico: fieldValue("ortoCarico"),
            followUp: fieldValue("ortoFollowUp"),
            indicazione: fieldValue("ortoIndicazione")
        };
    }
    if (p.reparto === "cardiologia") {
        p.cardiologia = {
            doloreToracico: fieldValue("cardioDolore"),
            ecg: fieldValue("cardioEcg"),
            troponine: fieldValue("cardioTroponine"),
            ritmo: fieldValue("cardioRitmo"),
            rischio: fieldValue("cardioRischio"),
            terapia: fieldValue("cardioTerapia"),
            piano: fieldValue("cardioPiano")
        };
    }
    if (p.reparto === "neurologia") {
        p.neurologia = {
            deficit: fieldValue("neuroDeficit"),
            nihss: fieldValue("neuroNihss"),
            onset: fieldValue("neuroOnset"),
            tac: fieldValue("neuroTac"),
            trombolisi: document.getElementById("neuroTrombolisi")?.checked || false,
            trombectomia: document.getElementById("neuroTrombectomia")?.checked || false,
            piano: fieldValue("neuroPiano")
        };
    }
    if (p.reparto === "rianimazione") {
        p.rianimazione = {
            viaAerea: fieldValue("riaViaAerea"),
            ventilazione: fieldValue("riaVentilazione"),
            accessi: fieldValue("riaAccessi"),
            sedazione: fieldValue("riaSedazione"),
            vasopressori: fieldValue("riaVasopressori"),
            monitoraggio: fieldValue("riaMonitoraggio"),
            piano: fieldValue("riaPiano")
        };
    }

    logAction("Aggiornato modulo " + labelReparto(p.reparto) + " per " + p.nome + " " + p.cognome);
    salva();
    render();
}

function repartoView(app, reparto, titolo) {
    const meta = repartoMeta(reparto);
    const pazientiReparto = pazienti.filter(p => ensurePaziente(p).reparto === reparto);
    const critici = pazientiReparto.filter(p => ["Rosso", "Arancione"].includes(p.codice)).length;
    const referti = pazientiReparto.reduce((tot, p) => tot + refertiPendenti(p), 0);

    app.innerHTML = `
        <div class="page-header">
            <div>
                <p class="eyebrow">Reparto</p>
                <h2>${escapeHtml(titolo || meta.icon + " " + meta.label)}</h2>
            </div>
            <div class="header-actions">
                <span class="mini-count">${pazientiReparto.length} pazienti</span>
                <button onclick="pagina='ps'; render()">Torna al PS</button>
            </div>
        </div>

        <section class="clinical-summary">
            <div><b>Pazienti</b><span>${pazientiReparto.length}</span></div>
            <div><b>Alta priorita</b><span>${critici}</span></div>
            <div><b>Referti in attesa</b><span>${referti}</span></div>
            <div><b>Funzione</b><span>${escapeHtml(descrizioneReparto(reparto))}</span></div>
        </section>

        <section class="work-panel">
            <div class="patient-list">
                ${pazientiReparto.length ? pazientiReparto.map(p => `
                    <article class="paziente ${triageClass(p.codice)}">
                        <div class="patient-main">
                            <span class="triage-badge ${triageClass(p.codice)}">${escapeHtml(p.codice)}</span>
                            <div>
                                <h4>${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</h4>
                                <p>${escapeHtml(p.motivo || "Motivo non indicato")}</p>
                                <small>${escapeHtml(repartoSintesi(p))}</small>
                            </div>
                        </div>
                        <div class="patient-actions">
                            <button onclick="apri('${p.id}')">Apri cartella</button>
                            <button onclick="spostaPaziente('${p.id}', 'ps')">Rimanda al PS</button>
                        </div>
                    </article>
                `).join("") : `<div class="empty-state">Nessun paziente assegnato a questo reparto.</div>`}
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

const renderBaseFinaleDedalus = render;
render = function() {
    renderBaseFinaleDedalus();
    setTimeout(applicaPuliziaInterfaccia, 0);
};

const renderBaseFinalePulizia = render;
render = function() {
    renderBaseFinalePulizia();
    setTimeout(applicaPuliziaInterfaccia, 0);
};

const ICONS = {
    patientMale: "assets/icons/patient-male.png",
    patientFemale: "assets/icons/patient-female.png",
    doctorMale: "assets/icons/doctor-male.png",
    doctorFemale: "assets/icons/doctor-female.png",
    syringe: "assets/icons/syringe.png",
    microscope: "assets/icons/microscope.png",
    thermometer: "assets/icons/thermometer.png",
    ivBag: "assets/icons/iv-bag.png",
    pill: "assets/icons/pill.png",
    xray: "assets/icons/xray-hand.png",
    ecg: "assets/icons/ecg.png",
    caduceus: "assets/icons/caduceus.png"
};

function iconImg(name, alt = "") {
    return `<img class="ui-icon" src="${ICONS[name]}" alt="${escapeHtml(alt)}">`;
}

function patientIcon(p) {
    const text = `${p.nome || ""} ${p.cognome || ""}`.toLowerCase();
    return text.endsWith("a") || text.includes(" maria") ? "patientFemale" : "patientMale";
}

function inquadramentoClinicoHTML(p) {
    const ultimoParametro = (p.parametriHistory || [])[p.parametriHistory.length - 1];
    const diagnosi = [
        p.motivo ? `Motivo di accesso: ${p.motivo}` : "",
        p.reparto ? `Area di presa in carico: ${labelReparto(p.reparto)}` : "",
        p.codice ? `Priorita triage: ${p.codice}` : "",
        ultimoParametro ? `Ultimi parametri: FC ${ultimoParametro.fc || "-"} bpm, PA ${ultimoParametro.pa || "-"}, SpO2 ${ultimoParametro.sat || "-"}%.` : "",
        refertiPendenti(p) ? `${refertiPendenti(p)} referti diagnostici in attesa.` : "Nessun referto diagnostico in attesa."
    ].filter(Boolean).join("\n");

    return `
        <section class="dedalus-panel span-2">
            <div class="dedalus-panel-head">
                ${iconImg("caduceus", "Inquadramento")}
                <div>
                    <h3>Inquadramento clinico</h3>
                    <p>Quadro sintetico, orientamento diagnostico e andamento simulato.</p>
                </div>
            </div>
            <div class="clinical-brief">${escapeHtml(diagnosi)}</div>
            <div class="clinical-alerts">${alertCliniciHTML(p)}</div>
            <div class="clinical-timeline compact">${timelineClinicaHTML(p)}</div>
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

    const refertiInAttesa = refertiPendenti(p);

    app.innerHTML = `
        <div class="dedalus-record">
            <div class="dedalus-record-head">
                <div class="patient-identity">
                    ${iconImg(patientIcon(p), "Paziente")}
                    <div>
                        <p class="eyebrow">Cartella clinica integrata</p>
                        <h2>${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</h2>
                        <span>${escapeHtml(p.cf || "CF non indicato")} · ${escapeHtml(labelReparto(p.reparto))}</span>
                    </div>
                </div>
                <div class="header-actions">
                    <span class="triage-badge ${triageClass(p.codice)}">${escapeHtml(p.codice)}</span>
                    <button onclick="generaECG()">${iconImg("ecg", "ECG")} ECG</button>
                    <button onclick="dimetti()">Dimissione e PDF</button>
                    <button onclick="pagina='ps'; render()">Torna</button>
                </div>
            </div>

            ${ultimoAvvisoReferti ? `<div class="exam-alert">${escapeHtml(ultimoAvvisoReferti)}</div>` : ""}

            <section class="dedalus-strip">
                <div><b>Motivo accesso</b><span>${escapeHtml(p.motivo || "Non indicato")}</span></div>
                <div><b>Referti in attesa</b><span>${refertiInAttesa}</span></div>
                <div><b>Eventi clinici</b><span>${timelineClinica(p).length}</span></div>
                <div>
                    <b>Reparto</b>
                    <select id="repartoCartella" onchange="cambiaRepartoPaziente()">
                        <option value="ps" ${p.reparto === "ps" ? "selected" : ""}>Pronto Soccorso</option>
                        <option value="chirurgia" ${p.reparto === "chirurgia" ? "selected" : ""}>Chirurgia</option>
                        <option value="medicinaInterna" ${p.reparto === "medicinaInterna" ? "selected" : ""}>Medicina Interna</option>
                        <option value="ortopedia" ${p.reparto === "ortopedia" ? "selected" : ""}>Ortopedia</option>
                        <option value="cardiologia" ${p.reparto === "cardiologia" ? "selected" : ""}>Cardiologia</option>
                        <option value="neurologia" ${p.reparto === "neurologia" ? "selected" : ""}>Neurologia</option>
                        <option value="rianimazione" ${p.reparto === "rianimazione" ? "selected" : ""}>Rianimazione</option>
                    </select>
                </div>
            </section>

            <div class="clinical-grid dedalus-grid">
                ${inquadramentoClinicoHTML(p)}

                <section class="dedalus-panel span-2">
                    <div class="dedalus-panel-head">
                        ${iconImg("thermometer", "Parametri")}
                        <div>
                            <h3>Parametri vitali</h3>
                            <p>Rilevazione rapida e storico infermieristico.</p>
                        </div>
                        <button onclick="salvaParametri()">Registra</button>
                    </div>
                    <div class="vitals-grid">
                        <label>FC<input id="fc" type="number" placeholder="bpm" value="${escapeHtml(p.parametri.fc || "")}"></label>
                        <label>FR<input id="fr" type="number" placeholder="/min" value="${escapeHtml(p.parametri.fr || "")}"></label>
                        <label>SpO2<input id="sat" type="number" placeholder="%" value="${escapeHtml(p.parametri.sat || "")}"></label>
                        <label>PA<input id="pa" placeholder="120/80" value="${escapeHtml(p.parametri.pa || "")}"></label>
                        <label>Temp.<input id="temp" type="number" step="0.1" placeholder="°C" value="${escapeHtml(p.parametri.temp || "")}"></label>
                        <label>GCS<input id="gcs" type="number" min="3" max="15" placeholder="3-15" value="${escapeHtml(p.parametri.gcs || "")}"></label>
                        <label>Dolore<input id="dolore" type="number" min="0" max="10" placeholder="0-10" value="${escapeHtml(p.parametri.dolore || "")}"></label>
                    </div>
                    <div class="table-wrap">
                        <table class="clinical-table">
                            <thead><tr><th>Ora</th><th>FC</th><th>FR</th><th>SpO2</th><th>PA</th><th>Temp</th><th>GCS</th><th>Dolore</th></tr></thead>
                            <tbody>${formatParametriHistory(p) || `<tr><td colspan="8">Nessuna rilevazione.</td></tr>`}</tbody>
                        </table>
                    </div>
                </section>

                <section class="dedalus-panel">
                    <div class="dedalus-panel-head">
                        ${iconImg("xray", "Diagnostica")}
                        <div>
                            <h3>Diagnostica</h3>
                            <p>Referti automatici in 1-2 minuti simulati.</p>
                        </div>
                    </div>
                    <select id="esameNome">${esamiCatalogoHTML()}</select>
                    <select id="esameUrgenza">
                        <option>Routine PS</option>
                        <option>Urgente</option>
                        <option>Emergenza</option>
                    </select>
                    <input id="esameRichiedente" placeholder="Quesito clinico / sospetto diagnostico">
                    <textarea id="esameNote" placeholder="Note per diagnostica o laboratorio"></textarea>
                    <div class="button-row">
                        <button onclick="addEsami()">Richiedi esame</button>
                        <button onclick="controllaReferti()">Controlla referti</button>
                    </div>
                </section>

                <section class="dedalus-panel">
                    <div class="dedalus-panel-head">
                        ${iconImg("pill", "Terapia")}
                        <div>
                            <h3>Terapia</h3>
                            <p>Farmaci, dose, via e note di risposta.</p>
                        </div>
                    </div>
                    <input id="farmacoNome" placeholder="Farmaco">
                    <input id="farmacoDose" placeholder="Dose">
                    <select id="farmacoVia"><option>EV</option><option>IM</option><option>OS</option><option>SC</option><option>Aerosol</option><option>Topica</option></select>
                    <input id="farmacoFrequenza" placeholder="Orario / frequenza">
                    <textarea id="farmacoNote" placeholder="Indicazioni, diluizione, risposta clinica"></textarea>
                    <button onclick="addTerapia()">Somministra / prescrivi</button>
                </section>

                <section class="dedalus-panel span-2">
                    <div class="dedalus-panel-head">
                        ${iconImg("doctorMale", "Diario")}
                        <div>
                            <h3>Diario e decisioni cliniche</h3>
                            <p>Valutazioni, rivalutazioni, consulenze e diagnosi.</p>
                        </div>
                    </div>
                    <select id="diarioTipo">
                        <option>Valutazione medica</option>
                        <option>Rivalutazione infermieristica</option>
                        <option>Consulenza</option>
                        <option>Decorso</option>
                        <option>Diagnosi</option>
                    </select>
                    <textarea id="diarioTesto" placeholder="Valutazione, obiettività, ipotesi diagnostica, piano"></textarea>
                    <button onclick="addVisita()">Registra nota</button>
                    <div class="notes-list">${formatDiarioClinico(p) || `<div class="empty-state">Nessuna nota clinica.</div>`}</div>
                </section>

                ${repartoSpecificoHTML(p)}

                <section class="dedalus-panel span-2">
                    <div class="dedalus-panel-head">
                        ${iconImg("ecg", "ECG")}
                        <div>
                            <h3>Tracciato ECG</h3>
                            <p>Generazione dimostrativa del tracciato.</p>
                        </div>
                        <span class="mini-count">${(p.ecgHistory || []).length}</span>
                    </div>
                    <canvas id="ecgCanvas" class="ecg-canvas" width="960" height="260"></canvas>
                    <div class="ecg-history">${(p.ecgHistory || []).slice().reverse().map(e => `<div><b>${escapeHtml(e.time)}</b><span>${escapeHtml(e.ritmo)} - FC ${escapeHtml(e.fc)} bpm</span></div>`).join("") || `<div class="empty-state">Premi ECG per generare un tracciato.</div>`}</div>
                </section>

                <section class="dedalus-panel span-2">
                    <div class="dedalus-panel-head">
                        ${iconImg("microscope", "Storico esami")}
                        <div>
                            <h3>Storico esami e referti</h3>
                            <p>Richieste diagnostiche, stato e referto conclusivo.</p>
                        </div>
                    </div>
                    <div class="table-wrap">
                        <table class="clinical-table">
                            <thead><tr><th>Richiesto</th><th>Esame</th><th>Quesito</th><th>Stato</th><th>Urgenza</th><th>Referto</th></tr></thead>
                            <tbody>${formatEsami(p.esami) || `<tr><td colspan="6">Nessun esame.</td></tr>`}</tbody>
                        </table>
                    </div>
                </section>

                <section class="dedalus-panel span-2">
                    <div class="dedalus-panel-head">
                        ${iconImg("ivBag", "Terapie")}
                        <div>
                            <h3>Terapie registrate</h3>
                            <p>Somministrazioni e prescrizioni.</p>
                        </div>
                    </div>
                    <div class="table-wrap">
                        <table class="clinical-table">
                            <thead><tr><th>Ora</th><th>Farmaco</th><th>Dose</th><th>Via</th><th>Frequenza</th><th>Note</th></tr></thead>
                            <tbody>${formatTerapie(p.terapie) || `<tr><td colspan="6">Nessuna terapia.</td></tr>`}</tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    `;

    disegnaUltimoECG();
    ultimoAvvisoReferti = "";
}

function applicaPuliziaInterfaccia() {
    document.querySelectorAll("section, article, div").forEach(node => {
        const testo = (node.textContent || "").toLowerCase();
        const titolo = node.querySelector("h2,h3,h4")?.textContent?.toLowerCase() || "";
        if (
            titolo.includes("compiti") ||
            titolo.includes("obiettivi") ||
            titolo.includes("obbiettivi") ||
            titolo.includes("intervista guidata") ||
            testo.includes("compiti amministratore") ||
            testo.includes("compiti dottore") ||
            testo.includes("compiti infermiere") ||
            testo.includes("compiti soccorritore")
        ) {
            node.classList.add("is-removed-panel");
        }
    });
}

const renderOriginaleDedalus = render;
render = function() {
    renderOriginaleDedalus();
    setTimeout(applicaPuliziaInterfaccia, 0);
};

/* =======================
   OVERRIDE FINALE 118 REALISTICO
======================= */

const CODICI_118 = ["rosso", "giallo", "verde", "bianco"];
const MEZZI_118 = ["MSB", "MSA", "Automedica", "Elisoccorso", "VLV"];
const LUOGHI_118 = ["Domicilio", "Strada/suolo pubblico", "Luogo di lavoro", "Scuola", "RSA", "Impianto sportivo", "Ambulatorio", "Altro"];
const TIPI_EVENTO_118 = ["Dolore toracico", "Dispnea", "Trauma", "Ictus sospetto", "Sincope", "Convulsione", "Intossicazione", "Anafilassi", "Agitazione", "Caduta anziano", "Arresto/ROSC", "Altro"];
const AZIONI_118 = [
    { id: "scena", label: "Scena sicura", note: "Scena valutata, DPI e rischio ambientale controllati." },
    { id: "abcde", label: "ABCDE", note: "Valutazione primaria ABCDE completata." },
    { id: "ossigeno", label: "Ossigeno", note: "Ossigenoterapia impostata e SpO2 rivalutata." },
    { id: "monitor", label: "Monitor", note: "Monitoraggio ECG/SpO2/PA applicato." },
    { id: "glicemia", label: "Glicemia", note: "Glicemia capillare rilevata." },
    { id: "ecg", label: "ECG 12 derivazioni", note: "ECG territoriale eseguito e allegato alla consegna." },
    { id: "accesso", label: "Accesso EV", note: "Accesso venoso periferico posizionato." },
    { id: "emostasi", label: "Emostasi", note: "Controllo emorragia/medicazione compressiva eseguito." },
    { id: "immobilizzazione", label: "Immobilizzazione", note: "Immobilizzazione/estricazione eseguita secondo dinamica." },
    { id: "preallerta", label: "Preallerta PS", note: "Preallerta trasmessa al Pronto Soccorso." }
];

function nuovoTempo118() {
    return {
        chiamata: new Date().toLocaleString(),
        dispatch: "",
        arrivoPosto: "",
        partenzaPosto: "",
        arrivoPs: ""
    };
}

function ensureIntervento118(i) {
    if (!i) return i;
    i.centrale = i.centrale || {
        chiamante: "",
        telefono: "",
        motivo: i.descrizione || "",
        note: "",
        codiceUscita: i.priorita || "verde"
    };
    i.tempi = i.tempi || nuovoTempo118();
    i.equipaggioDettaglio = i.equipaggioDettaglio || {
        capoEquipaggio: medicoLoggato?.nome || "",
        autista: "",
        soccorritore: "",
        sanitario: ""
    };
    i.paziente = i.paziente || {};
    i.scena = i.scena || {};
    i.abcde = i.abcde || {};
    i.sample = i.sample || {};
    i.vitali = i.vitali || {};
    i.parametriSeriali = Array.isArray(i.parametriSeriali) ? i.parametriSeriali : [];
    i.trattamento = i.trattamento || {};
    i.azioni = Array.isArray(i.azioni) ? i.azioni : [];
    i.destinazione = i.destinazione || {};
    i.sbar = i.sbar || { situazione: "", background: "", assessment: "", recommendation: "" };
    i.logs = Array.isArray(i.logs) ? i.logs : [];
    return i;
}

function creaIntervento118() {
    intervento118Counter += 1;
    const nuovo = ensureIntervento118({
        id: id(),
        numero: intervento118Counter,
        data: new Date().toLocaleString(),
        createdAt: new Date().toLocaleString(),
        stato: "chiamata",
        priorita: "verde",
        indirizzo: "",
        descrizione: "",
        ambulanceId: "",
        mezzo: "MSB",
        equipaggio: "",
        paziente: {},
        scena: {},
        abcde: {},
        sample: {},
        vitali: {},
        trattamento: {},
        destinazione: { esito: "TRASPORTATO", ospedale: "Pronto Soccorso", codice: "VERDE" }
    });
    nuovo.logs.push({ time: new Date().toLocaleString(), text: "Intervento creato da centrale 118." });
    interventi118.push(nuovo);
    intervento118Selezionato = nuovo.id;
    logAction("Creato intervento 118 #" + nuovo.numero);
    salva();
    render();
}

function stato118Label(stato) {
    return {
        chiamata: "Chiamata",
        dispatch: "In partenza",
        "sul posto": "Sul posto",
        trasporto: "Trasporto",
        "in ps": "In PS",
        chiuso: "Chiuso"
    }[stato] || stato || "Aperto";
}

function codice118ToTriage(codice) {
    const c = String(codice || "").toLowerCase();
    if (c.includes("rosso")) return "Rosso";
    if (c.includes("giallo")) return "Arancione";
    if (c.includes("verde")) return "Verde";
    return "Bianco";
}

function prioritaWeight(p) {
    if (p === "rosso") return 1;
    if (p === "giallo") return 2;
    if (p === "verde") return 3;
    if (p === "bianco") return 4;
    return 5;
}

function intervento118View(app) {
    interventi118 = interventi118.map(ensureIntervento118);
    interventi118Archivio = interventi118Archivio.map(ensureIntervento118);
    if (!intervento118Selezionato) {
        intervento118ListaView(app);
        return;
    }
    const i = ensureIntervento118(interventi118.find(x => x.id === intervento118Selezionato));
    if (!i) {
        intervento118Selezionato = null;
        render();
        return;
    }
    app.innerHTML = intervento118SchedaHTML(i);
}

function intervento118ListaView(app) {
    const stats = { rosso: 0, giallo: 0, verde: 0, bianco: 0 };
    interventi118.forEach(i => stats[i.priorita] = (stats[i.priorita] || 0) + 1);
    app.innerHTML = `
        <div class="page-header">
            <div>
                <p class="eyebrow">Centrale operativa e soccorso territoriale</p>
                <h2>Interventi 118</h2>
            </div>
            <div class="header-actions">
                <button onclick="creaIntervento118()">Nuovo intervento</button>
                <button onclick="pagina='ps'; render()">Torna al PS</button>
            </div>
        </div>
        <section class="stats-grid">
            ${CODICI_118.map(c => `<button class="stat-card triage-${c === "giallo" ? "arancione" : c}"><span>${c}</span><b>${stats[c] || 0}</b></button>`).join("")}
            <button class="stat-card"><span>Attivi</span><b>${interventi118.length}</b></button>
            <button class="stat-card"><span>Archivio</span><b>${interventi118Archivio.length}</b></button>
        </section>
        <div class="tabs-row">
            <button class="${filtro118 === "attivi" ? "active" : ""}" onclick="setFiltro118('attivi')">Attivi</button>
            <button class="${filtro118 === "archivio" ? "active" : ""}" onclick="setFiltro118('archivio')">Archivio</button>
        </div>
        <section class="work-panel">
            ${filtro118 === "archivio" ? intervento118ArchivioHTML() : `
                <div class="intervention-list emergency-list">
                    ${[...interventi118].sort((a, b) => prioritaWeight(a.priorita) - prioritaWeight(b.priorita)).map(intervento118Card).join("") || `<div class="empty-state">Nessun intervento attivo.</div>`}
                </div>
            `}
        </section>
    `;
}

function intervento118ArchivioHTML() {
    return `
        <div class="intervention-list emergency-list">
            ${interventi118Archivio.map(i => `
                <article class="intervention-card archived">
                    <div>
                        <b>#${escapeHtml(i.numero)} - ${escapeHtml(i.paziente?.cognomeNome || "Paziente non identificato")}</b>
                        <p>${escapeHtml(i.centrale?.motivo || i.descrizione || "Intervento 118")}</p>
                        <small>Chiuso da ${escapeHtml(i.closedBy || "")} - ${escapeHtml(i.closedAt || i.archivedAt || "")}</small>
                    </div>
                    <button onclick="stampaIntervento118('${i.id}', true)">PDF</button>
                </article>
            `).join("") || `<div class="empty-state">Archivio vuoto.</div>`}
        </div>
    `;
}

function intervento118Card(i) {
    i = ensureIntervento118(i);
    return `
        <article class="intervention-card emergency-card ${escapeHtml(i.priorita || "verde")}" onclick="openIntervento118('${i.id}')">
            <div class="emergency-card-main">
                <span class="triage-badge ${triageClass(codice118ToTriage(i.priorita))}">${escapeHtml(i.priorita || "verde")}</span>
                <div>
                    <b>#${escapeHtml(i.numero)} - ${escapeHtml(stato118Label(i.stato))}</b>
                    <p>${escapeHtml(i.centrale?.motivo || i.descrizione || "Motivo non indicato")}</p>
                    <small>${escapeHtml(i.indirizzo || "Luogo non indicato")} - ${escapeHtml(i.mezzo || "")} ${i.ambulanceId ? " - " + escapeHtml(i.ambulanceId) : ""}</small>
                </div>
            </div>
            <div class="intervention-actions">
                <button onclick="event.stopPropagation(); cambiaStatoIntervento('${i.id}', 'dispatch')">Partenza</button>
                <button onclick="event.stopPropagation(); cambiaStatoIntervento('${i.id}', 'sul posto')">Sul posto</button>
                <button onclick="event.stopPropagation(); cambiaStatoIntervento('${i.id}', 'trasporto')">Trasporto</button>
                <button class="danger" onclick="event.stopPropagation(); chiudiIntervento('${i.id}')">Chiudi</button>
            </div>
        </article>
    `;
}

function intervento118SchedaHTML(i) {
    const azioni = new Set(i.azioni.map(a => a.id));
    return `
        <div class="page-header">
            <div>
                <p class="eyebrow">Scheda preospedaliera</p>
                <h2>118 #${escapeHtml(i.numero)} - ${escapeHtml(stato118Label(i.stato))}</h2>
            </div>
            <div class="header-actions">
                <button onclick="salvaIntervento118('${i.id}')">Salva</button>
                <button onclick="convertiInterventoInPaziente('${i.id}')">Invia al PS</button>
                <button onclick="stampaIntervento118('${i.id}')">PDF</button>
                <button class="danger" onclick="chiudiIntervento('${i.id}')">Chiudi</button>
                <button onclick="intervento118Selezionato=null; render()">Indietro</button>
            </div>
        </div>
        <section class="emergency-timeline">
            ${[
                ["Chiamata", i.tempi.chiamata],
                ["Partenza", i.tempi.dispatch],
                ["Sul posto", i.tempi.arrivoPosto],
                ["Trasporto", i.tempi.partenzaPosto],
                ["Arrivo PS", i.tempi.arrivoPs]
            ].map(([label, value]) => `<div class="${value ? "done" : ""}"><b>${escapeHtml(label)}</b><span>${escapeHtml(value || "non registrato")}</span></div>`).join("")}
        </section>
        <div class="emergency-layout">
            <section class="work-panel emergency-section">
                <div class="panel-title-row"><h3>Centrale 118</h3><span class="mini-count">${escapeHtml(i.priorita || "verde")}</span></div>
                <div class="form-grid compact">
                    <label>Stato<select id="stato118">${["chiamata", "dispatch", "sul posto", "trasporto", "in ps"].map(s => `<option value="${s}" ${i.stato === s ? "selected" : ""}>${stato118Label(s)}</option>`).join("")}</select></label>
                    <label>Codice uscita<select id="priorita118">${CODICI_118.map(c => `<option value="${c}" ${i.priorita === c ? "selected" : ""}>${c}</option>`).join("")}</select></label>
                    <label>Mezzo<select id="mezzo">${MEZZI_118.map(m => `<option value="${m}" ${i.mezzo === m ? "selected" : ""}>${m}</option>`).join("")}</select></label>
                    <label>Ambulanza<select id="ambulanceId"><option value="">Nessuna</option>${ambulanze.map(a => `<option value="${escapeHtml(a.id)}" ${i.ambulanceId === a.id ? "selected" : ""}>${escapeHtml(a.nome)}</option>`).join("")}</select></label>
                    <label>Chiamante<input id="chiamante118" value="${escapeHtml(i.centrale.chiamante || "")}"></label>
                    <label>Telefono<input id="telefonoChiamante118" value="${escapeHtml(i.centrale.telefono || "")}"></label>
                    <label class="span-2">Indirizzo<input id="indirizzo118" value="${escapeHtml(i.indirizzo || "")}"></label>
                    <label class="span-2">Motivo chiamata<textarea id="motivo118">${escapeHtml(i.centrale.motivo || i.descrizione || "")}</textarea></label>
                    <label class="span-2">Note centrale<textarea id="noteCentrale118">${escapeHtml(i.centrale.note || "")}</textarea></label>
                </div>
            </section>
            <section class="work-panel emergency-section">
                <h3>Equipaggio e paziente</h3>
                <div class="form-grid compact">
                    <label>Capo equipaggio<input id="capoEquipaggio118" value="${escapeHtml(i.equipaggioDettaglio.capoEquipaggio || "")}"></label>
                    <label>Autista<input id="autista118" value="${escapeHtml(i.equipaggioDettaglio.autista || "")}"></label>
                    <label>Soccorritore<input id="soccorritore118" value="${escapeHtml(i.equipaggioDettaglio.soccorritore || "")}"></label>
                    <label>Sanitario<input id="sanitario118" value="${escapeHtml(i.equipaggioDettaglio.sanitario || "")}"></label>
                    <label class="span-2">Paziente<input id="paziente" value="${escapeHtml(i.paziente.cognomeNome || "")}" placeholder="Cognome Nome"></label>
                    <label>Data nascita<input id="nascita" type="date" value="${escapeHtml(i.paziente.dataNascita || "")}"></label>
                    <label>Sesso<select id="sesso">${["", "M", "F", "Altro"].map(s => `<option value="${s}" ${i.paziente.sesso === s ? "selected" : ""}>${s || "--"}</option>`).join("")}</select></label>
                    <label class="span-2">Codice fiscale<input id="cf" value="${escapeHtml(i.paziente.cf || "")}"></label>
                </div>
            </section>
            <section class="work-panel emergency-section">
                <h3>Scenario e valutazione</h3>
                <div class="form-grid compact">
                    <label>Luogo<select id="luogo">${LUOGHI_118.map(v => `<option value="${v}" ${i.scena.luogo === v ? "selected" : ""}>${v}</option>`).join("")}</select></label>
                    <label>Tipo evento<select id="tipologia">${TIPI_EVENTO_118.map(v => `<option value="${v}" ${i.scena.tipologia === v ? "selected" : ""}>${v}</option>`).join("")}</select></label>
                    <label class="span-2">Dinamica<textarea id="dinamica">${escapeHtml(i.scena.dinamica || "")}</textarea></label>
                </div>
                <div class="abcde-grid">
                    ${["a", "b", "c", "d", "e"].map(k => `
                        <label>${k.toUpperCase()}
                            <textarea id="${k}" placeholder="${escapeHtml({ a: "Vie aeree", b: "Respiro", c: "Circolo", d: "Neurologico", e: "Esposizione/lesioni" }[k])}">${escapeHtml(i.abcde[k] || "")}</textarea>
                        </label>
                    `).join("")}
                </div>
                <div class="form-grid compact">
                    <label>Sintomi<textarea id="sampleS">${escapeHtml(i.sample.s || "")}</textarea></label>
                    <label>Allergie<textarea id="sampleA">${escapeHtml(i.sample.a || "")}</textarea></label>
                    <label>Farmaci<textarea id="sampleM">${escapeHtml(i.sample.m || "")}</textarea></label>
                    <label>Patologie<textarea id="sampleP">${escapeHtml(i.sample.p || "")}</textarea></label>
                    <label>Ultimo pasto<input id="sampleL" value="${escapeHtml(i.sample.l || "")}"></label>
                    <label>Evento<textarea id="sampleE">${escapeHtml(i.sample.e || "")}</textarea></label>
                </div>
            </section>
            <section class="work-panel emergency-section">
                <div class="panel-title-row"><h3>Parametri seriali</h3><button onclick="aggiungiParametri118('${i.id}')">Aggiungi rilievo</button></div>
                <div class="vital-row">
                    <input id="fc" type="number" placeholder="FC" value="${escapeHtml(i.vitali.fc || "")}">
                    <input id="fr" type="number" placeholder="FR" value="${escapeHtml(i.vitali.fr || "")}">
                    <input id="spo2" type="number" placeholder="SpO2" value="${escapeHtml(i.vitali.spo2 || "")}">
                    <input id="pa" placeholder="PA" value="${escapeHtml(i.vitali.pa || "")}">
                    <input id="gcs118" type="number" placeholder="GCS" value="${escapeHtml(i.vitali.gcs || "")}">
                    <input id="dolore118" type="number" placeholder="NRS" value="${escapeHtml(i.vitali.dolore || "")}">
                    <input id="glicemia118" type="number" placeholder="Glicemia" value="${escapeHtml(i.vitali.glicemia || "")}">
                </div>
                <div class="serial-vitals">
                    ${(i.parametriSeriali || []).map(p => `<article><b>${escapeHtml(p.time)}</b><span>FC ${escapeHtml(p.fc || "-")} | FR ${escapeHtml(p.fr || "-")} | SpO2 ${escapeHtml(p.spo2 || "-")} | PA ${escapeHtml(p.pa || "-")} | GCS ${escapeHtml(p.gcs || "-")} | NRS ${escapeHtml(p.dolore || "-")}</span></article>`).join("") || `<div class="empty-state">Nessun rilievo seriale.</div>`}
                </div>
            </section>
            <section class="work-panel emergency-section">
                <h3>Azioni soccorritore</h3>
                <div class="prehospital-actions">
                    ${AZIONI_118.map(a => `<button class="${azioni.has(a.id) ? "done" : ""}" onclick="toggleAzione118('${i.id}', '${a.id}')"><b>${escapeHtml(a.label)}</b><span>${azioni.has(a.id) ? "eseguita" : "da fare"}</span></button>`).join("")}
                </div>
                <label>Note trattamento<textarea id="t_note">${escapeHtml(i.trattamento.note || "")}</textarea></label>
            </section>
            <section class="work-panel emergency-section">
                <h3>Destinazione e consegna SBAR</h3>
                <div class="form-grid compact">
                    <label>Esito<select id="esito">${["TRASPORTATO", "TRATTATO SUL POSTO", "RIFIUTA TRASPORTO", "DECEDUTO"].map(v => `<option value="${v}" ${i.destinazione.esito === v ? "selected" : ""}>${v}</option>`).join("")}</select></label>
                    <label>Codice rientro<select id="codiceDest">${["ROSSO", "GIALLO", "VERDE", "BIANCO", "NERO"].map(v => `<option value="${v}" ${i.destinazione.codice === v ? "selected" : ""}>${v}</option>`).join("")}</select></label>
                    <label class="span-2">Ospedale<input id="ospedale" value="${escapeHtml(i.destinazione.ospedale || "")}"></label>
                    <label>Situazione<textarea id="sbarS">${escapeHtml(i.sbar.situazione || "")}</textarea></label>
                    <label>Background<textarea id="sbarB">${escapeHtml(i.sbar.background || "")}</textarea></label>
                    <label>Assessment<textarea id="sbarA">${escapeHtml(i.sbar.assessment || "")}</textarea></label>
                    <label>Recommendation<textarea id="sbarR">${escapeHtml(i.sbar.recommendation || "")}</textarea></label>
                </div>
                <div class="mission-log">
                    ${(i.logs || []).slice().reverse().map(l => `<article><b>${escapeHtml(l.time)}</b><span>${escapeHtml(l.text)}</span></article>`).join("") || `<div class="empty-state">Nessun log missione.</div>`}
                </div>
            </section>
        </div>
    `;
}

function legacySalvaIntervento118Reparti(idInt, renderAfterSave = true) {
    const i = ensureIntervento118(interventi118.find(x => x.id === idInt));
    if (!i) return;
    const statoPrecedente = i.stato;
    i.stato = fieldValue("stato118") || i.stato || "chiamata";
    i.priorita = fieldValue("priorita118") || i.priorita || "verde";
    i.ambulanceId = fieldValue("ambulanceId") || "";
    i.indirizzo = fieldValue("indirizzo118") || "";
    i.descrizione = fieldValue("motivo118") || fieldValue("descrizione118") || i.descrizione || "";
    i.mezzo = fieldValue("mezzo") || i.mezzo || "MSB";
    i.centrale = {
        chiamante: fieldValue("chiamante118"),
        telefono: fieldValue("telefonoChiamante118"),
        motivo: fieldValue("motivo118") || i.descrizione || "",
        note: fieldValue("noteCentrale118"),
        codiceUscita: i.priorita
    };
    i.equipaggioDettaglio = {
        capoEquipaggio: fieldValue("capoEquipaggio118"),
        autista: fieldValue("autista118"),
        soccorritore: fieldValue("soccorritore118"),
        sanitario: fieldValue("sanitario118")
    };
    i.equipaggio = Object.values(i.equipaggioDettaglio).filter(Boolean).join(" - ");
    i.paziente = {
        cognomeNome: fieldValue("paziente"),
        dataNascita: fieldValue("nascita"),
        sesso: fieldValue("sesso"),
        cf: fieldValue("cf")
    };
    i.scena = { luogo: fieldValue("luogo"), tipologia: fieldValue("tipologia"), dinamica: fieldValue("dinamica") };
    i.abcde = { a: fieldValue("a"), b: fieldValue("b"), c: fieldValue("c"), d: fieldValue("d"), e: fieldValue("e") };
    i.sample = {
        s: fieldValue("sampleS"),
        a: fieldValue("sampleA"),
        m: fieldValue("sampleM"),
        p: fieldValue("sampleP"),
        l: fieldValue("sampleL"),
        e: fieldValue("sampleE")
    };
    i.vitali = {
        fc: fieldValue("fc"),
        fr: fieldValue("fr"),
        spo2: fieldValue("spo2"),
        pa: fieldValue("pa"),
        gcs: fieldValue("gcs118"),
        dolore: fieldValue("dolore118"),
        glicemia: fieldValue("glicemia118")
    };
    i.trattamento = { note: fieldValue("t_note") };
    i.destinazione = { esito: fieldValue("esito"), ospedale: fieldValue("ospedale"), codice: fieldValue("codiceDest") };
    i.sbar = {
        situazione: fieldValue("sbarS"),
        background: fieldValue("sbarB"),
        assessment: fieldValue("sbarA"),
        recommendation: fieldValue("sbarR")
    };
    if (statoPrecedente !== i.stato) registraTempoStato118(i, i.stato);
    i.logs.push({ time: new Date().toLocaleString(), text: "Scheda intervento salvata." });
    logAction("Salvata scheda intervento 118 #" + i.numero);
    salva();
    if (renderAfterSave) render();
}

function registraTempoStato118(i, stato) {
    i.tempi = i.tempi || nuovoTempo118();
    const now = new Date().toLocaleString();
    if (stato === "dispatch" && !i.tempi.dispatch) i.tempi.dispatch = now;
    if (stato === "sul posto" && !i.tempi.arrivoPosto) i.tempi.arrivoPosto = now;
    if (stato === "trasporto" && !i.tempi.partenzaPosto) i.tempi.partenzaPosto = now;
    if (stato === "in ps" && !i.tempi.arrivoPs) i.tempi.arrivoPs = now;
    i.logs.push({ time: now, text: "Stato aggiornato: " + stato118Label(stato) + "." });
}

function cambiaStatoIntervento(idInt, stato) {
    const i = ensureIntervento118(interventi118.find(x => x.id === idInt));
    if (!i) return;
    i.stato = stato;
    registraTempoStato118(i, stato);
    logAction("Aggiornato stato intervento 118 #" + i.numero + " a " + stato118Label(stato));
    salva();
    render();
}

function aggiungiParametri118(idInt) {
    salvaIntervento118(idInt, false);
    const i = ensureIntervento118(interventi118.find(x => x.id === idInt));
    if (!i) return;
    const rilievo = { id: id(), time: new Date().toLocaleString(), ...i.vitali };
    i.parametriSeriali.push(rilievo);
    i.logs.push({ time: rilievo.time, text: `Rilievo parametri: FC ${i.vitali.fc || "-"}, FR ${i.vitali.fr || "-"}, SpO2 ${i.vitali.spo2 || "-"}, PA ${i.vitali.pa || "-"}.` });
    salva();
    render();
}

function toggleAzione118(idInt, azioneId) {
    salvaIntervento118(idInt, false);
    const i = ensureIntervento118(interventi118.find(x => x.id === idInt));
    if (!i) return;
    const azione = AZIONI_118.find(a => a.id === azioneId);
    if (!azione) return;
    const index = i.azioni.findIndex(a => a.id === azioneId);
    if (index >= 0) {
        i.azioni.splice(index, 1);
        i.logs.push({ time: new Date().toLocaleString(), text: "Azione rimossa: " + azione.label + "." });
    } else {
        i.azioni.push({ id: azione.id, label: azione.label, note: azione.note, time: new Date().toLocaleString(), operatore: medicoLoggato?.nome || "" });
        i.logs.push({ time: new Date().toLocaleString(), text: azione.note });
        applicaEffettoAzione118(i, azione.id);
    }
    salva();
    render();
}

function applicaEffettoAzione118(i, azioneId) {
    const sat = Number(i.vitali?.spo2 || 0);
    const fc = Number(i.vitali?.fc || 0);
    const fr = Number(i.vitali?.fr || 0);
    const nrs = Number(i.vitali?.dolore || 0);
    if (azioneId === "ossigeno" && sat) i.vitali.spo2 = String(Math.min(100, sat + 3));
    if (azioneId === "ossigeno" && fr) i.vitali.fr = String(Math.max(8, fr - 2));
    if (azioneId === "monitor" && fc) i.logs.push({ time: new Date().toLocaleString(), text: "Monitoraggio attivo: rivalutazione continua richiesta durante trasporto." });
    if (azioneId === "analgesia" && nrs) i.vitali.dolore = String(Math.max(0, nrs - 2));
    if (azioneId === "preallerta") i.sbar.recommendation = i.sbar.recommendation || "Paziente in arrivo da 118, richiesta presa in carico rapida secondo codice di rientro.";
}

function convertiInterventoInPaziente(idInt) {
    salvaIntervento118(idInt, false);
    const i = ensureIntervento118(interventi118.find(x => x.id === idInt));
    if (!i) return;
    i.stato = "in ps";
    registraTempoStato118(i, "in ps");
    const nomeCompleto = (i.paziente?.cognomeNome || "").trim();
    const parti = nomeCompleto.split(" ").filter(Boolean);
    const cognome = parti.shift() || "Da identificare";
    const nome = parti.join(" ") || "Paziente";
    const nuovoPaziente = ensurePaziente({
        id: id(),
        nome,
        cognome,
        nascita: i.paziente?.dataNascita || "",
        luogo: "",
        cf: i.paziente?.cf || "",
        motivo: i.centrale?.motivo || i.descrizione || i.scena?.dinamica || "Trasporto 118",
        codice: codice118ToTriage(i.destinazione?.codice || i.priorita),
        reparto: "ps",
        parametri: { fc: i.vitali?.fc || "", fr: i.vitali?.fr || "", sat: i.vitali?.spo2 || "", pa: i.vitali?.pa || "", gcs: i.vitali?.gcs || "", dolore: i.vitali?.dolore || "" },
        parametriHistory: (i.parametriSeriali || []).map(p => ({ time: p.time, fc: p.fc, fr: p.fr, sat: p.spo2, pa: p.pa, gcs: p.gcs, dolore: p.dolore, operatore: "118" })),
        esami: [],
        terapie: (i.azioni || []).map(a => ({ id: id(), time: a.time, farmaco: a.label, dose: "", via: "118", note: a.note, operatore: a.operatore || "118" })),
        visite: [],
        diarioClinico: [{
            id: id(),
            time: new Date().toLocaleString(),
            tipo: "Ingresso da 118",
            testo: aiTestoConsegna118(i),
            operatore: medicoLoggato?.nome || ""
        }]
    });
    pazienti.push(nuovoPaziente);
    i.pazienteId = nuovoPaziente.id;
    i.logs.push({ time: new Date().toLocaleString(), text: "Paziente consegnato al Pronto Soccorso." });
    logAction("Creato paziente PS da intervento 118 #" + i.numero);
    salva();
    pagina = "ps";
    intervento118Selezionato = null;
    render();
}

function aiTestoConsegna118(i) {
    return [
        `Intervento 118 #${i.numero}.`,
        `Motivo: ${i.centrale?.motivo || i.descrizione || "non indicato"}.`,
        `Luogo/dinamica: ${i.scena?.luogo || ""} - ${i.scena?.dinamica || ""}.`,
        `ABCDE: A ${i.abcde?.a || "-"}, B ${i.abcde?.b || "-"}, C ${i.abcde?.c || "-"}, D ${i.abcde?.d || "-"}, E ${i.abcde?.e || "-"}.`,
        `Ultimi parametri: FC ${i.vitali?.fc || "-"}, FR ${i.vitali?.fr || "-"}, SpO2 ${i.vitali?.spo2 || "-"}, PA ${i.vitali?.pa || "-"}, GCS ${i.vitali?.gcs || "-"}, NRS ${i.vitali?.dolore || "-"}.`,
        `Azioni: ${(i.azioni || []).map(a => a.label).join(", ") || "nessuna azione registrata"}.`,
        `SBAR: S ${i.sbar?.situazione || "-"} | B ${i.sbar?.background || "-"} | A ${i.sbar?.assessment || "-"} | R ${i.sbar?.recommendation || "-"}.`
    ].join("\n");
}

function chiudiIntervento(idInt) {
    if (document.getElementById("stato118")) salvaIntervento118(idInt, false);
    const i = ensureIntervento118(interventi118.find(x => x.id === idInt));
    if (!i) return;
    i.stato = "chiuso";
    i.closedAt = new Date().toLocaleString();
    i.closedBy = medicoLoggato?.nome || "Operatore";
    i.logs.push({ time: i.closedAt, text: "Intervento chiuso da " + i.closedBy + "." });
    interventi118Archivio.push({ ...i, archivedAt: new Date().toLocaleString() });
    interventi118 = interventi118.filter(x => x.id !== idInt);
    intervento118Selezionato = null;
    logAction("Chiuso intervento 118 #" + i.numero + " da " + i.closedBy);
    salva();
    render();
    stampaIntervento118(i.id, true);
}

function stampaIntervento118(idInt, archived = false) {
    const elenco = archived ? interventi118Archivio : interventi118;
    const i = ensureIntervento118(elenco.find(x => x.id === idInt));
    if (!i) return;
    const operatoreChiusura = i.closedBy || medicoLoggato?.nome || "Operatore";
    const win = window.open("", "_blank");
    win.document.write(`
        <html>
        <head>
            <title>Scheda 118 #${escapeHtml(i.numero)}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 18px; color: #132235; }
                .doc { border: 1px solid #8fa1b5; padding: 18px; }
                .head { display: flex; justify-content: space-between; gap: 20px; border-bottom: 4px solid #b51d2a; padding-bottom: 10px; }
                .brand { color: #b51d2a; font-size: 22px; font-weight: 900; }
                .meta { text-align: right; font-size: 11px; color: #526477; }
                h1 { margin: 14px 0 8px; font-size: 18px; text-align: center; }
                h2 { margin: 13px 0 6px; font-size: 13px; color: #173b63; border-bottom: 1px solid #c9d4df; padding-bottom: 4px; }
                .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; font-size: 11px; }
                .box { border: 1px solid #c9d4df; min-height: 32px; padding: 7px; white-space: pre-wrap; font-size: 11px; }
                .abcde { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; }
                .abcde div { border: 1px solid #c9d4df; padding: 7px; min-height: 38px; font-size: 11px; }
                table { width: 100%; border-collapse: collapse; font-size: 11px; }
                th, td { border: 1px solid #c9d4df; padding: 5px; text-align: left; }
                .sign { display: flex; justify-content: space-between; gap: 18px; margin-top: 28px; }
                .sign div { flex: 1; border-top: 1px solid #132235; padding-top: 6px; text-align: center; font-size: 11px; }
                @media print { body { padding: 0; } .doc { border: none; } }
            </style>
        </head>
        <body>
            <div class="doc">
                <div class="head">
                    <div><div class="brand">118 - SCHEDA INTERVENTO</div><small>Verbale sanitario di soccorso extraospedaliero</small></div>
                    <div class="meta">Intervento #${escapeHtml(i.numero)}<br>Apertura: ${escapeHtml(i.data || "")}<br>Chiusura: ${escapeHtml(i.closedAt || "")}<br>Codice: ${escapeHtml(i.priorita || "")}</div>
                </div>
                <h1>Relazione intervento preospedaliero</h1>
                <h2>Tempi missione</h2>
                <div class="grid">
                    <div><b>Chiamata:</b> ${escapeHtml(i.tempi?.chiamata || "")}</div>
                    <div><b>Partenza:</b> ${escapeHtml(i.tempi?.dispatch || "")}</div>
                    <div><b>Arrivo posto:</b> ${escapeHtml(i.tempi?.arrivoPosto || "")}</div>
                    <div><b>Partenza posto:</b> ${escapeHtml(i.tempi?.partenzaPosto || "")}</div>
                    <div><b>Arrivo PS:</b> ${escapeHtml(i.tempi?.arrivoPs || "")}</div>
                    <div><b>Mezzo:</b> ${escapeHtml(i.mezzo || "")} ${escapeHtml(i.ambulanceId || "")}</div>
                </div>
                <h2>Centrale, paziente, scenario</h2>
                <div class="grid">
                    <div><b>Chiamante:</b> ${escapeHtml(i.centrale?.chiamante || "")}</div>
                    <div><b>Telefono:</b> ${escapeHtml(i.centrale?.telefono || "")}</div>
                    <div><b>Indirizzo:</b> ${escapeHtml(i.indirizzo || "")}</div>
                    <div><b>Paziente:</b> ${escapeHtml(i.paziente?.cognomeNome || "")}</div>
                    <div><b>Nascita:</b> ${escapeHtml(i.paziente?.dataNascita || "")}</div>
                    <div><b>CF:</b> ${escapeHtml(i.paziente?.cf || "")}</div>
                </div>
                <div class="box">Motivo chiamata: ${escapeHtml(i.centrale?.motivo || "")}
Note centrale: ${escapeHtml(i.centrale?.note || "")}
Luogo/tipo: ${escapeHtml(i.scena?.luogo || "")} - ${escapeHtml(i.scena?.tipologia || "")}
Dinamica: ${escapeHtml(i.scena?.dinamica || "")}</div>
                <h2>ABCDE</h2>
                <div class="abcde">
                    <div><b>A</b><br>${escapeHtml(i.abcde?.a || "")}</div>
                    <div><b>B</b><br>${escapeHtml(i.abcde?.b || "")}</div>
                    <div><b>C</b><br>${escapeHtml(i.abcde?.c || "")}</div>
                    <div><b>D</b><br>${escapeHtml(i.abcde?.d || "")}</div>
                    <div><b>E</b><br>${escapeHtml(i.abcde?.e || "")}</div>
                </div>
                <h2>Parametri</h2>
                <table><thead><tr><th>Ora</th><th>FC</th><th>FR</th><th>SpO2</th><th>PA</th><th>GCS</th><th>NRS</th><th>Glicemia</th></tr></thead><tbody>
                    ${(i.parametriSeriali?.length ? i.parametriSeriali : [{ time: "Ultimo", ...i.vitali }]).map(p => `<tr><td>${escapeHtml(p.time || "")}</td><td>${escapeHtml(p.fc || "")}</td><td>${escapeHtml(p.fr || "")}</td><td>${escapeHtml(p.spo2 || "")}</td><td>${escapeHtml(p.pa || "")}</td><td>${escapeHtml(p.gcs || "")}</td><td>${escapeHtml(p.dolore || "")}</td><td>${escapeHtml(p.glicemia || "")}</td></tr>`).join("")}
                </tbody></table>
                <h2>Trattamenti e consegna</h2>
                <div class="box">Azioni: ${(i.azioni || []).map(a => `${escapeHtml(a.label)} (${escapeHtml(a.time || "")})`).join(", ") || "nessuna"}

Note trattamento:
${escapeHtml(i.trattamento?.note || "")}

SBAR:
S - ${escapeHtml(i.sbar?.situazione || "")}
B - ${escapeHtml(i.sbar?.background || "")}
A - ${escapeHtml(i.sbar?.assessment || "")}
R - ${escapeHtml(i.sbar?.recommendation || "")}

Destinazione: ${escapeHtml(i.destinazione?.ospedale || "")} | Esito: ${escapeHtml(i.destinazione?.esito || "")} | Codice rientro: ${escapeHtml(i.destinazione?.codice || "")}</div>
                <div class="sign">
                    <div>Operatore che chiude<br><b>${escapeHtml(operatoreChiusura)}</b></div>
                    <div>Firma equipaggio</div>
                    <div>Firma ricevente</div>
                </div>
            </div>
            <script>window.onload = () => window.print();</script>
        </body>
        </html>
    `);
    win.document.close();
}

/* =======================
   OVERRIDE FINALE ACCESSI E ADMIN
======================= */

function login(app) {
    app.innerHTML = `
        <div class="login-shell">
            <section class="login-panel">
                <div>
                    <p class="eyebrow">Accesso sicuro</p>
                    <h1>Hospital Command</h1>
                    <p class="login-copy">Ogni operatore entra con un profilo dedicato. Ruolo e permessi definiscono cosa può vedere e modificare.</p>
                </div>
                <div class="login-form">
                    <label>Username<input id="user" autocomplete="username" placeholder="es. admin"></label>
                    <label>Password<input id="pass" type="password" autocomplete="current-password" placeholder="password"></label>
                    <button onclick="doLogin()">Accedi</button>
                </div>
                <div class="demo-access">
                    <b>Account rapidi</b>
                    <button onclick="quickLogin('admin','1234567890')">Admin</button>
                    <button onclick="quickLogin('medicops','ps')">Medico PS</button>
                    <button onclick="quickLogin('triage','triage')">Triage</button>
                    <button onclick="quickLogin('118','118')">118</button>
                </div>
            </section>
            <aside class="login-side">
                <h2>Ruoli ospedalieri</h2>
                ${Object.entries(RUOLI_OSPEDALE).map(([key, role]) => `
                    <div class="role-preview">
                        <b>${escapeHtml(role.label)}</b>
                        <span>${escapeHtml(role.descrizione)}</span>
                    </div>
                `).join("")}
            </aside>
        </div>
    `;
    setTimeout(() => document.getElementById("user")?.focus(), 0);
}

function quickLogin(username, password) {
    document.getElementById("user").value = username;
    document.getElementById("pass").value = password;
    doLogin();
}

function doLogin() {
    const username = fieldValue("user");
    const password = document.getElementById("pass")?.value || "";
    const found = utentiOspedale().find(u => u.username === username && u.password === password);
    if (!found || found.attivo === false) {
        alert("Credenziali non valide o utenza disattivata.");
        return;
    }
    medicoLoggato = normalizzaUtente(found);
    localStorage.setItem("sessioneOperatore", JSON.stringify({ username: medicoLoggato.username }));
    logAction("Accesso operatore");
    pagina = "ps";
    render();
}

function logout() {
    if (medicoLoggato) logAction("Logout operatore");
    medicoLoggato = null;
    localStorage.removeItem("sessioneOperatore");
    pagina = "ps";
    render();
}

function render() {
    ripristinaSessione();
    const app = document.getElementById("app");
    aggiornaSidebarPermessi();
    if (!medicoLoggato) {
        login(app);
        return;
    }
    completaRefertiScaduti(false);
    if (!canOpenPage(pagina)) {
        app.innerHTML = `
            <section class="work-panel access-denied">
                <p class="eyebrow">Accesso negato</p>
                <h2>Area non disponibile</h2>
                <p>Il profilo ${escapeHtml(ruoloInfo(medicoLoggato.ruolo).label)} non ha i permessi per questa sezione.</p>
                <button onclick="pagina='ps'; render()">Torna alla dashboard</button>
            </section>
        `;
        return;
    }
    if (pagina === "ps") lista(app);
    if (pagina === "nuovo") nuovo(app);
    if (pagina === "cartella") cartella(app);
    if (pagina === "archivio") archivioView(app);
    if (pagina === "personale") personaleView(app);
    if (pagina === "intervento118") intervento118View(app);
    if (pagina === "chirurgia") chirurgiaView(app);
    if (pagina === "medicinaInterna") medicinaInternaView(app);
    if (pagina === "ortopedia") ortopediaView(app);
    if (pagina === "cardiologia") cardiologiaView(app);
    if (pagina === "neurologia") neurologiaView(app);
    if (pagina === "rianimazione") rianimazioneView(app);
    aggiornaSidebarPermessi();
}

function personaleView(app) {
    if (!(hasPermission("staff:view") || hasPermission("staff:manage") || hasPermission("all"))) {
        alert("Accesso riservato all'amministrazione.");
        pagina = "ps";
        render();
        return;
    }
    const canManage = hasPermission("all");
    const utenti = utentiOspedale();
    app.innerHTML = `
        <div class="page-header">
            <div>
                <p class="eyebrow">Console amministratore</p>
                <h2>Gestione ospedale</h2>
            </div>
            <div class="header-actions">
                <span class="operator-chip">${escapeHtml(ruoloInfo(medicoLoggato.ruolo).label)}</span>
                <button onclick="pagina='ps'; render()">Dashboard</button>
            </div>
        </div>
        ${adminStatsHTML()}
        <div class="admin-grid">
            <section class="work-panel">
                <div class="panel-title-row">
                    <h3>Nuovo operatore</h3>
                    <span class="mini-count">${canManage ? "abilitato" : "sola lettura"}</span>
                </div>
                <input id="nuovoUser" placeholder="username" ${canManage ? "" : "disabled"}>
                <input id="nuovoPass" type="password" placeholder="password provvisoria" ${canManage ? "" : "disabled"}>
                <input id="nuovoNome" placeholder="nome e cognome" ${canManage ? "" : "disabled"}>
                <input id="nuovaMatricola" placeholder="matricola / ID operatore" ${canManage ? "" : "disabled"}>
                <select id="nuovoRuolo" ${canManage ? "" : "disabled"}>${ruoloOptionsHTML("medico_ps")}</select>
                <input id="nuovoReparto" placeholder="reparto / servizio" ${canManage ? "" : "disabled"}>
                <button onclick="aggiungiPersonale()" ${canManage ? "" : "disabled"}>Crea utenza</button>
            </section>
            <section class="work-panel">
                <div class="panel-title-row">
                    <h3>Matrice ruoli</h3>
                    <span class="mini-count">${Object.keys(RUOLI_OSPEDALE).length}</span>
                </div>
                <div class="role-matrix">
                    ${Object.entries(RUOLI_OSPEDALE).map(([key, role]) => `
                        <article>
                            <b>${escapeHtml(role.label)}</b>
                            <small>${escapeHtml(role.area)}</small>
                            <p>${escapeHtml(role.descrizione)}</p>
                            <span>${escapeHtml(role.permissions.includes("all") ? "tutti i permessi" : role.permissions.join(", "))}</span>
                        </article>
                    `).join("")}
                </div>
            </section>
        </div>
        <section class="work-panel">
            <div class="panel-title-row">
                <h3>Operatori</h3>
                <span class="mini-count">${utenti.length}</span>
            </div>
            <div class="staff-table">
                ${utenti.map(u => `
                    <article class="${u.attivo === false ? "disabled" : ""}">
                        <div>
                            <b>${escapeHtml(u.nome)}</b>
                            <small>${escapeHtml(u.username)} ${u.matricola ? "- " + escapeHtml(u.matricola) : ""}</small>
                        </div>
                        <span>${escapeHtml(ruoloInfo(u.ruolo).label)}</span>
                        <span>${escapeHtml(u.reparto || ruoloInfo(u.ruolo).area)}</span>
                        <span>${u.attivo === false ? "Disattivato" : "Attivo"}</span>
                        ${canManage && !DEFAULT_ACCOUNT_OSPEDALE.some(d => d.username === u.username)
                            ? `<button class="danger" onclick="eliminaPersonale('${escapeHtml(u.username)}')">Revoca</button>`
                            : `<button disabled>Protetto</button>`}
                    </article>
                `).join("")}
            </div>
        </section>
        <section class="work-panel">
            <div class="panel-title-row">
                <h3>Log e audit</h3>
                <span class="mini-count">${logAzioni.length}</span>
            </div>
            <div class="log-list audit-log">
                ${(logAzioni || []).slice().reverse().map(l =>
                    `<div>${escapeHtml(`[${l.time}] ${l.user} (${l.ruolo}) -> ${l.azione}`)}</div>`
                ).join("") || `<div class="empty-state">Nessun log disponibile.</div>`}
            </div>
        </section>
    `;
}

function aggiungiPersonale() {
    if (!requirePermission("all", "Solo l'amministratore di sistema può creare utenti.")) return;
    const username = fieldValue("nuovoUser");
    const password = document.getElementById("nuovoPass")?.value || "";
    const nome = fieldValue("nuovoNome");
    const ruolo = fieldValue("nuovoRuolo") || "oss";
    const reparto = fieldValue("nuovoReparto") || ruoloInfo(ruolo).area;
    const matricola = fieldValue("nuovaMatricola");
    if (!username || !password || !nome) {
        alert("Username, password e nome sono obbligatori.");
        return;
    }
    if (utentiOspedale().some(u => u.username === username)) {
        alert("Username già presente.");
        return;
    }
    personale.push(normalizzaUtente({ username, password, nome, ruolo, reparto, matricola, attivo: true }));
    logAction("Creato operatore " + username + " (" + ruoloInfo(ruolo).label + ")");
    salva();
    render();
}

function eliminaPersonale(username) {
    if (!requirePermission("all", "Solo l'amministratore di sistema può revocare utenti.")) return;
    if (DEFAULT_ACCOUNT_OSPEDALE.some(u => u.username === username)) {
        alert("Gli account di sistema non possono essere revocati.");
        return;
    }
    if (!confirm("Revocare l'accesso a " + username + "?")) return;
    personale = personale.filter(p => p.username !== username);
    logAction("Revocato accesso operatore " + username);
    salva();
    render();
}

function dimetti() {
    if (!(hasPermission("patients:discharge") || hasPermission("all"))) {
        alert("Dimissione riservata ai profili medici autorizzati.");
        return;
    }
    let index = pazienti.findIndex(x => x.id === pazienteSelezionato?.id);
    if (index === -1 || !pazienteSelezionato) {
        alert("Paziente non valido");
        return;
    }
    let p = ensurePaziente(pazienti[index]);
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
}

/* =======================
   ACCESSI, RUOLI E ADMIN V2
======================= */

const RUOLI_OSPEDALE = {
    admin: {
        label: "Amministratore di sistema",
        area: "Direzione",
        descrizione: "Gestione completa di utenti, reparti, archivio, 118 e configurazione.",
        permissions: ["all"]
    },
    direzione: {
        label: "Direzione sanitaria",
        area: "Direzione",
        descrizione: "Supervisione clinica, archivio, log e reparti. Non modifica gli amministratori.",
        permissions: ["dashboard", "patients:view", "patients:create", "patients:edit", "patients:delete", "archive:view", "118:view", "118:edit", "staff:view", "logs:view", "wards:all"]
    },
    medico_ps: {
        label: "Medico PS",
        area: "Pronto Soccorso",
        descrizione: "Gestisce pazienti PS, cartelle, esami, terapie, dimissioni e trasferimenti.",
        permissions: ["dashboard", "patients:view", "patients:create", "patients:edit", "patients:discharge", "118:view", "wards:ps", "wards:all:view"]
    },
    medico_reparto: {
        label: "Medico di reparto",
        area: "Reparti",
        descrizione: "Gestisce cartelle e moduli dei reparti assegnati.",
        permissions: ["dashboard", "patients:view", "patients:edit", "patients:discharge", "wards:all:view"]
    },
    infermiere_triage: {
        label: "Infermiere triage",
        area: "Pronto Soccorso",
        descrizione: "Accettazione, triage, parametri, note infermieristiche e richieste operative.",
        permissions: ["dashboard", "patients:view", "patients:create", "patients:vitals", "wards:ps"]
    },
    infermiere_reparto: {
        label: "Infermiere di reparto",
        area: "Reparti",
        descrizione: "Parametri, terapie registrate, diario infermieristico e monitoraggio.",
        permissions: ["dashboard", "patients:view", "patients:vitals", "patients:therapy", "wards:all:view"]
    },
    coordinatore: {
        label: "Coordinatore infermieristico",
        area: "Organizzazione",
        descrizione: "Supervisione reparti, carichi di lavoro, personale e log operativo.",
        permissions: ["dashboard", "patients:view", "staff:view", "logs:view", "wards:all:view"]
    },
    diagnostica: {
        label: "Radiologia / Laboratorio",
        area: "Diagnostica",
        descrizione: "Visione richieste diagnostiche e referti. Non modifica terapia o dimissioni.",
        permissions: ["dashboard", "patients:view", "diagnostics:view", "wards:all:view"]
    },
    operatore118: {
        label: "Operatore 118",
        area: "Emergenza territoriale",
        descrizione: "Gestione interventi 118 e invio paziente in PS.",
        permissions: ["dashboard", "118:view", "118:edit", "patients:create"]
    },
    oss: {
        label: "OSS",
        area: "Assistenza",
        descrizione: "Consultazione base e supporto operativo non prescrittivo.",
        permissions: ["dashboard", "patients:view"]
    }
};

const DEFAULT_ACCOUNT_OSPEDALE = [
    { username: "admin", password: "1234567890", nome: "Amministratore", ruolo: "admin", reparto: "Direzione", matricola: "ADM-001", attivo: true },
    { username: "direzione", password: "direzione", nome: "Direzione Sanitaria", ruolo: "direzione", reparto: "Direzione", matricola: "DIR-001", attivo: true },
    { username: "medicops", password: "ps", nome: "Medico PS", ruolo: "medico_ps", reparto: "Pronto Soccorso", matricola: "MED-PS", attivo: true },
    { username: "triage", password: "triage", nome: "Infermiere Triage", ruolo: "infermiere_triage", reparto: "Pronto Soccorso", matricola: "INF-TRI", attivo: true },
    { username: "118", password: "118", nome: "Operatore 118", ruolo: "operatore118", reparto: "118", matricola: "EMS-118", attivo: true }
];

medici = DEFAULT_ACCOUNT_OSPEDALE;

function ruoloInfo(ruolo) {
    return RUOLI_OSPEDALE[ruolo] || RUOLI_OSPEDALE.oss;
}

function hasPermission(permission) {
    if (!medicoLoggato) return false;
    const permissions = ruoloInfo(medicoLoggato.ruolo).permissions || [];
    return permissions.includes("all") || permissions.includes(permission);
}

function canOpenWard(reparto) {
    if (hasPermission("all") || hasPermission("wards:all") || hasPermission("wards:all:view")) return true;
    if (reparto === "ps" && hasPermission("wards:ps")) return true;
    return false;
}

function canOpenPage(nomePagina) {
    if (!medicoLoggato) return false;
    if (hasPermission("all")) return true;
    if (["ps", "cartella"].includes(nomePagina)) return hasPermission("patients:view") || hasPermission("dashboard");
    if (nomePagina === "nuovo") return hasPermission("patients:create");
    if (nomePagina === "archivio") return hasPermission("archive:view");
    if (nomePagina === "personale") return hasPermission("staff:view") || hasPermission("staff:manage");
    if (nomePagina === "intervento118") return hasPermission("118:view");
    if (["chirurgia", "medicinaInterna", "ortopedia", "cardiologia", "neurologia", "rianimazione"].includes(nomePagina)) return canOpenWard(nomePagina);
    return false;
}

function requirePermission(permission, message = "Permesso non disponibile per il tuo ruolo.") {
    if (hasPermission(permission)) return true;
    alert(message);
    return false;
}

function utentiOspedale() {
    const custom = (personale || []).map(p => normalizzaUtente(p));
    return [...DEFAULT_ACCOUNT_OSPEDALE, ...custom];
}

function normalizzaUtente(utente) {
    const ruolo = utente.ruolo && RUOLI_OSPEDALE[utente.ruolo] ? utente.ruolo : "oss";
    return {
        ...utente,
        ruolo,
        reparto: utente.reparto || ruoloInfo(ruolo).area,
        matricola: utente.matricola || "",
        attivo: utente.attivo !== false
    };
}

function ruoloOptionsHTML(selected = "medico_ps") {
    return Object.entries(RUOLI_OSPEDALE).map(([key, role]) => `
        <option value="${escapeHtml(key)}" ${selected === key ? "selected" : ""}>${escapeHtml(role.label)}</option>
    `).join("");
}

function aggiornaSidebarPermessi() {
    const userBox = document.getElementById("utenteLoggato");
    if (userBox) {
        userBox.innerHTML = medicoLoggato
            ? `<b>${escapeHtml(medicoLoggato.nome)}</b><span>${escapeHtml(ruoloInfo(medicoLoggato.ruolo).label)}</span>`
            : "Nessun operatore connesso";
    }

    document.querySelectorAll(".sidebar button").forEach(button => {
        const match = button.getAttribute("onclick")?.match(/pagina='([^']+)'/);
        if (!match) return;
        const target = match[1];
        button.style.display = !medicoLoggato || canOpenPage(target) ? "" : "none";
    });
}

function login(app) {
    app.innerHTML = `
        <div class="login-shell">
            <section class="login-panel">
                <div>
                    <p class="eyebrow">Accesso sicuro</p>
                    <h1>Hospital Command</h1>
                    <p class="login-copy">Accedi con un profilo operativo. I permessi cambiano in base al ruolo assegnato dall'amministratore.</p>
                </div>

                <div class="login-form">
                    <label>Username<input id="user" autocomplete="username" placeholder="es. admin"></label>
                    <label>Password<input id="pass" type="password" autocomplete="current-password" placeholder="password"></label>
                    <button onclick="doLogin()">Accedi</button>
                </div>

                <div class="demo-access">
                    <b>Account rapidi</b>
                    <button onclick="quickLogin('admin','1234567890')">Admin</button>
                    <button onclick="quickLogin('medicops','ps')">Medico PS</button>
                    <button onclick="quickLogin('triage','triage')">Triage</button>
                    <button onclick="quickLogin('118','118')">118</button>
                </div>
            </section>

            <aside class="login-side">
                <h2>Ruoli configurati</h2>
                ${Object.entries(RUOLI_OSPEDALE).map(([key, role]) => `
                    <div class="role-preview">
                        <b>${escapeHtml(role.label)}</b>
                        <span>${escapeHtml(role.descrizione)}</span>
                    </div>
                `).join("")}
            </aside>
        </div>
    `;
    setTimeout(() => document.getElementById("user")?.focus(), 0);
}

function quickLogin(username, password) {
    document.getElementById("user").value = username;
    document.getElementById("pass").value = password;
    doLogin();
}

function doLogin() {
    const username = fieldValue("user");
    const password = document.getElementById("pass")?.value || "";
    const found = utentiOspedale().find(u => u.username === username && u.password === password);

    if (!found || found.attivo === false) {
        alert("Credenziali non valide o utenza disattivata.");
        return;
    }

    medicoLoggato = normalizzaUtente(found);
    localStorage.setItem("sessioneOperatore", JSON.stringify({ username: medicoLoggato.username }));
    logAction("Accesso operatore");
    pagina = "ps";
    render();
}

function logout() {
    if (medicoLoggato) logAction("Logout operatore");
    medicoLoggato = null;
    localStorage.removeItem("sessioneOperatore");
    pagina = "ps";
    render();
}

function ripristinaSessione() {
    if (medicoLoggato) return;
    try {
        const sessione = JSON.parse(localStorage.getItem("sessioneOperatore") || "null");
        if (!sessione?.username) return;
        const found = utentiOspedale().find(u => u.username === sessione.username && u.attivo !== false);
        if (found) medicoLoggato = normalizzaUtente(found);
    } catch (error) {
        localStorage.removeItem("sessioneOperatore");
    }
}

function render() {
    ripristinaSessione();
    const app = document.getElementById("app");
    aggiornaSidebarPermessi();

    if (!medicoLoggato) {
        login(app);
        return;
    }

    completaRefertiScaduti(false);

    if (!canOpenPage(pagina)) {
        app.innerHTML = `
            <section class="work-panel access-denied">
                <p class="eyebrow">Accesso negato</p>
                <h2>Area non disponibile</h2>
                <p>Il profilo ${escapeHtml(ruoloInfo(medicoLoggato.ruolo).label)} non ha i permessi per questa sezione.</p>
                <button onclick="pagina='ps'; render()">Torna alla dashboard</button>
            </section>
        `;
        return;
    }

    if (pagina === "ps") lista(app);
    if (pagina === "nuovo") nuovo(app);
    if (pagina === "cartella") cartella(app);
    if (pagina === "archivio") archivioView(app);
    if (pagina === "personale") personaleView(app);
    if (pagina === "intervento118") intervento118View(app);
    if (pagina === "chirurgia") chirurgiaView(app);
    if (pagina === "medicinaInterna") medicinaInternaView(app);
    if (pagina === "ortopedia") ortopediaView(app);
    if (pagina === "cardiologia") cardiologiaView(app);
    if (pagina === "neurologia") neurologiaView(app);
    if (pagina === "rianimazione") rianimazioneView(app);
    aggiornaSidebarPermessi();
}

function adminStatsHTML() {
    const attivi = utentiOspedale().filter(u => u.attivo !== false).length;
    const ricoverati = pazienti.length;
    const dimessi = archivio.length;
    const referti = pazienti.reduce((tot, p) => tot + refertiPendenti(ensurePaziente(p)), 0);
    return `
        <section class="admin-stats">
            <div><b>${attivi}</b><span>Operatori attivi</span></div>
            <div><b>${ricoverati}</b><span>Pazienti in carico</span></div>
            <div><b>${dimessi}</b><span>Dimessi in archivio</span></div>
            <div><b>${referti}</b><span>Referti in attesa</span></div>
        </section>
    `;
}

function personaleView(app) {
    if (!(hasPermission("staff:view") || hasPermission("staff:manage"))) {
        alert("Accesso riservato all'amministrazione.");
        pagina = "ps";
        render();
        return;
    }

    const canManage = hasPermission("all");
    const utenti = utentiOspedale();

    app.innerHTML = `
        <div class="page-header">
            <div>
                <p class="eyebrow">Console amministratore</p>
                <h2>Gestione ospedale</h2>
            </div>
            <div class="header-actions">
                <span class="operator-chip">${escapeHtml(ruoloInfo(medicoLoggato.ruolo).label)}</span>
                <button onclick="pagina='ps'; render()">Dashboard</button>
            </div>
        </div>

        ${adminStatsHTML()}

        <div class="admin-grid">
            <section class="work-panel">
                <div class="panel-title-row">
                    <h3>Nuovo operatore</h3>
                    <span class="mini-count">${canManage ? "abilitato" : "sola lettura"}</span>
                </div>
                <input id="nuovoUser" placeholder="username" ${canManage ? "" : "disabled"}>
                <input id="nuovoPass" type="password" placeholder="password provvisoria" ${canManage ? "" : "disabled"}>
                <input id="nuovoNome" placeholder="nome e cognome" ${canManage ? "" : "disabled"}>
                <input id="nuovaMatricola" placeholder="matricola / ID operatore" ${canManage ? "" : "disabled"}>
                <select id="nuovoRuolo" ${canManage ? "" : "disabled"}>${ruoloOptionsHTML("medico_ps")}</select>
                <input id="nuovoReparto" placeholder="reparto / servizio" ${canManage ? "" : "disabled"}>
                <button onclick="aggiungiPersonale()" ${canManage ? "" : "disabled"}>Crea utenza</button>
            </section>

            <section class="work-panel">
                <div class="panel-title-row">
                    <h3>Matrice ruoli</h3>
                    <span class="mini-count">${Object.keys(RUOLI_OSPEDALE).length}</span>
                </div>
                <div class="role-matrix">
                    ${Object.entries(RUOLI_OSPEDALE).map(([key, role]) => `
                        <article>
                            <b>${escapeHtml(role.label)}</b>
                            <small>${escapeHtml(role.area)}</small>
                            <p>${escapeHtml(role.descrizione)}</p>
                            <span>${escapeHtml(role.permissions.includes("all") ? "tutti i permessi" : role.permissions.join(", "))}</span>
                        </article>
                    `).join("")}
                </div>
            </section>
        </div>

        <section class="work-panel">
            <div class="panel-title-row">
                <h3>Operatori</h3>
                <span class="mini-count">${utenti.length}</span>
            </div>
            <div class="staff-table">
                ${utenti.map(u => `
                    <article class="${u.attivo === false ? "disabled" : ""}">
                        <div>
                            <b>${escapeHtml(u.nome)}</b>
                            <small>${escapeHtml(u.username)} ${u.matricola ? "- " + escapeHtml(u.matricola) : ""}</small>
                        </div>
                        <span>${escapeHtml(ruoloInfo(u.ruolo).label)}</span>
                        <span>${escapeHtml(u.reparto || ruoloInfo(u.ruolo).area)}</span>
                        <span>${u.attivo === false ? "Disattivato" : "Attivo"}</span>
                        ${canManage && !DEFAULT_ACCOUNT_OSPEDALE.some(d => d.username === u.username)
                            ? `<button class="danger" onclick="eliminaPersonale('${escapeHtml(u.username)}')">Revoca</button>`
                            : `<button disabled>Protetto</button>`}
                    </article>
                `).join("")}
            </div>
        </section>

        <section class="work-panel">
            <div class="panel-title-row">
                <h3>Log e audit</h3>
                <span class="mini-count">${logAzioni.length}</span>
            </div>
            <div class="log-list audit-log">
                ${(logAzioni || []).slice().reverse().map(l =>
                    `<div>${escapeHtml(`[${l.time}] ${l.user} (${l.ruolo}) -> ${l.azione}`)}</div>`
                ).join("") || `<div class="empty-state">Nessun log disponibile.</div>`}
            </div>
        </section>
    `;
}

function aggiungiPersonale() {
    if (!requirePermission("all", "Solo l'amministratore di sistema può creare utenti.")) return;

    const username = fieldValue("nuovoUser");
    const password = document.getElementById("nuovoPass")?.value || "";
    const nome = fieldValue("nuovoNome");
    const ruolo = fieldValue("nuovoRuolo") || "oss";
    const reparto = fieldValue("nuovoReparto") || ruoloInfo(ruolo).area;
    const matricola = fieldValue("nuovaMatricola");

    if (!username || !password || !nome) {
        alert("Username, password e nome sono obbligatori.");
        return;
    }
    if (utentiOspedale().some(u => u.username === username)) {
        alert("Username già presente.");
        return;
    }

    personale.push(normalizzaUtente({ username, password, nome, ruolo, reparto, matricola, attivo: true }));
    logAction("Creato operatore " + username + " (" + ruoloInfo(ruolo).label + ")");
    salva();
    render();
}

function eliminaPersonale(username) {
    if (!requirePermission("all", "Solo l'amministratore di sistema può revocare utenti.")) return;
    if (DEFAULT_ACCOUNT_OSPEDALE.some(u => u.username === username)) {
        alert("Gli account di sistema non possono essere revocati.");
        return;
    }
    if (!confirm("Revocare l'accesso a " + username + "?")) return;
    personale = personale.filter(p => p.username !== username);
    logAction("Revocato accesso operatore " + username);
    salva();
    render();
}

function eliminaPaziente(idP) {
    if (!(hasPermission("patients:delete") || hasPermission("all"))) {
        alert("Eliminazione riservata ad amministratore o direzione sanitaria.");
        return;
    }
    if (!confirm("Sei sicuro di voler eliminare questa cartella?")) return;
    const cleanId = String(idP).trim();
    const index = pazienti.findIndex(p => String(p.id).trim() === cleanId);
    if (index === -1) {
        alert("Paziente non trovato");
        return;
    }
    pazienti.splice(index, 1);
    logAction("Eliminato paziente " + cleanId);
    if (pazienteSelezionato && pazienteSelezionato.id === cleanId) {
        pazienteSelezionato = null;
        pagina = "ps";
    }
    salva();
    render();
}

function dimetti() {
    if (!(hasPermission("patients:discharge") || hasPermission("all"))) {
        alert("Dimissione riservata ai profili medici autorizzati.");
        return;
    }
    let index = pazienti.findIndex(x => x.id === pazienteSelezionato?.id);
    if (index === -1 || !pazienteSelezionato) {
        alert("Paziente non valido");
        return;
    }

    let p = ensurePaziente(pazienti[index]);
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
}

/* =======================
   REPARTI V2
======================= */

const REPARTI_OSPEDALE = [
    { id: "ps", label: "Pronto Soccorso", icon: "📋" },
    { id: "chirurgia", label: "Chirurgia", icon: "CH" },
    { id: "medicinaInterna", label: "Medicina Interna", icon: "MI" },
    { id: "ortopedia", label: "Ortopedia", icon: "OR" },
    { id: "cardiologia", label: "Cardiologia", icon: "CA" },
    { id: "neurologia", label: "Neurologia", icon: "NE" },
    { id: "rianimazione", label: "Rianimazione", icon: "RI" }
];

function repartoMeta(reparto) {
    return REPARTI_OSPEDALE.find(r => r.id === reparto) || REPARTI_OSPEDALE[0];
}

function labelReparto(reparto) {
    return repartoMeta(reparto).label;
}

function repartoIcon(reparto) {
    return repartoMeta(reparto).icon;
}

function repartoOptionsHTML(selected) {
    return REPARTI_OSPEDALE.map(r => `
        <option value="${escapeHtml(r.id)}" ${selected === r.id ? "selected" : ""}>${escapeHtml(r.icon + " " + r.label)}</option>
    `).join("");
}

function ensurePaziente(p) {
    if (!p) return p;

    if (!p.parametri) p.parametri = { fc: "", fr: "", sat: "", pa: "" };
    if (!p.esami) p.esami = [];
    p.esami = p.esami.map(e => {
        if (typeof e !== "string") {
            if (!e.nome) e.nome = e.tipo || "Esame";
            if (!e.categoria) e.categoria = categoriaEsame(e.nome, e.tipo);
            if (!e.stato) e.stato = e.esito ? "Refertato" : "Richiesto";
            return e;
        }
        return {
            id: id(),
            time: "",
            nome: "Nota esame precedente",
            tipo: "Storico",
            categoria: "Storico",
            richiedente: "",
            stato: "Refertato",
            esito: e,
            operatore: ""
        };
    });
    if (!p.terapie) p.terapie = [];
    if (!p.visite) p.visite = [];
    if (!p.parametriHistory) p.parametriHistory = [];
    if (!p.reparto) p.reparto = "ps";
    if (!p.diarioClinico) p.diarioClinico = [];
    if (!p.ecgHistory) p.ecgHistory = [];

    if (!p.chirurgia) {
        p.chirurgia = { diagnosi: "", procedura: "", rischioAnestesiologico: "", consenso: false, digiuno: "", profilassi: "", noteOperatorie: "" };
    }
    if (!p.medicinaInterna) {
        p.medicinaInterna = { anamnesi: "", diagnosi: "", comorbidita: "", terapiaCronica: "", piano: "" };
    }
    if (!p.ortopedia) {
        p.ortopedia = { distretto: "", trauma: "", frattura: "", immobilizzazione: "", carico: "", indicazione: "", followUp: "" };
    }
    if (!p.cardiologia) {
        p.cardiologia = { doloreToracico: "", ecg: "", troponine: "", ritmo: "", rischio: "", terapia: "", piano: "" };
    }
    if (!p.neurologia) {
        p.neurologia = { deficit: "", nihss: "", onset: "", tac: "", trombolisi: false, trombectomia: false, piano: "" };
    }
    if (!p.rianimazione) {
        p.rianimazione = { viaAerea: "", ventilazione: "", accessi: "", sedazione: "", vasopressori: "", monitoraggio: "", piano: "" };
    }

    return p;
}

function render() {
    const app = document.getElementById("app");
    if (!medicoLoggato) {
        login(app);
        return;
    }

    completaRefertiScaduti(false);

    if (pagina === "ps") lista(app);
    if (pagina === "nuovo") nuovo(app);
    if (pagina === "cartella") cartella(app);
    if (pagina === "archivio") archivioView(app);
    if (pagina === "personale") personaleView(app);
    if (pagina === "intervento118") intervento118View(app);
    if (pagina === "chirurgia") chirurgiaView(app);
    if (pagina === "medicinaInterna") medicinaInternaView(app);
    if (pagina === "ortopedia") ortopediaView(app);
    if (pagina === "cardiologia") cardiologiaView(app);
    if (pagina === "neurologia") neurologiaView(app);
    if (pagina === "rianimazione") rianimazioneView(app);
}

function repartoSpecificoHTML(p) {
    p = ensurePaziente(p);

    if (p.reparto === "chirurgia") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row"><h3>Modulo Chirurgia</h3><button onclick="salvaModuloReparto()">Salva modulo</button></div>
                <div class="form-grid compact">
                    <label>Diagnosi chirurgica<input id="chirDiagnosi" value="${escapeHtml(p.chirurgia.diagnosi || "")}"></label>
                    <label>Procedura prevista<input id="chirProcedura" value="${escapeHtml(p.chirurgia.procedura || "")}"></label>
                    <label>Rischio anestesiologico<input id="chirRischio" value="${escapeHtml(p.chirurgia.rischioAnestesiologico || "")}"></label>
                    <label>Digiuno<input id="chirDigiuno" value="${escapeHtml(p.chirurgia.digiuno || "")}"></label>
                    <label>Profilassi<input id="chirProfilassi" value="${escapeHtml(p.chirurgia.profilassi || "")}"></label>
                    <label class="check-row"><input id="chirConsenso" type="checkbox" ${p.chirurgia.consenso ? "checked" : ""}> Consenso informato acquisito</label>
                </div>
                <textarea id="chirNote" placeholder="Note pre/post operatorie">${escapeHtml(p.chirurgia.noteOperatorie || "")}</textarea>
            </section>
        `;
    }

    if (p.reparto === "medicinaInterna") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row"><h3>Modulo Medicina Interna</h3><button onclick="salvaModuloReparto()">Salva modulo</button></div>
                <div class="form-grid compact">
                    <label>Anamnesi<input id="miAnamnesi" value="${escapeHtml(p.medicinaInterna.anamnesi || "")}"></label>
                    <label>Diagnosi / problema attivo<input id="miDiagnosi" value="${escapeHtml(p.medicinaInterna.diagnosi || "")}"></label>
                    <label>Comorbidità<input id="miComorbidita" value="${escapeHtml(p.medicinaInterna.comorbidita || "")}"></label>
                    <label>Terapia cronica<input id="miTerapiaCronica" value="${escapeHtml(p.medicinaInterna.terapiaCronica || "")}"></label>
                </div>
                <textarea id="miPiano" placeholder="Piano diagnostico-terapeutico">${escapeHtml(p.medicinaInterna.piano || "")}</textarea>
            </section>
        `;
    }

    if (p.reparto === "ortopedia") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row"><h3>Modulo Ortopedia</h3><button onclick="salvaModuloReparto()">Salva modulo</button></div>
                <div class="form-grid compact">
                    <label>Distretto lesionato<input id="ortoDistretto" value="${escapeHtml(p.ortopedia.distretto || "")}"></label>
                    <label>Dinamica trauma<input id="ortoTrauma" value="${escapeHtml(p.ortopedia.trauma || "")}"></label>
                    <label>Frattura / lesione<input id="ortoFrattura" value="${escapeHtml(p.ortopedia.frattura || "")}"></label>
                    <label>Immobilizzazione<input id="ortoImmobilizzazione" value="${escapeHtml(p.ortopedia.immobilizzazione || "")}"></label>
                    <label>Carico<input id="ortoCarico" value="${escapeHtml(p.ortopedia.carico || "")}"></label>
                    <label>Follow-up<input id="ortoFollowUp" value="${escapeHtml(p.ortopedia.followUp || "")}"></label>
                </div>
                <textarea id="ortoIndicazione" placeholder="Indicazione: dimissione, gesso/tutore, riduzione, sala operatoria, ricovero">${escapeHtml(p.ortopedia.indicazione || "")}</textarea>
            </section>
        `;
    }

    if (p.reparto === "cardiologia") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row"><h3>Modulo Cardiologia / UTIC</h3><button onclick="salvaModuloReparto()">Salva modulo</button></div>
                <div class="form-grid compact">
                    <label>Dolore toracico<input id="cardioDolore" value="${escapeHtml(p.cardiologia.doloreToracico || "")}"></label>
                    <label>ECG<input id="cardioEcg" value="${escapeHtml(p.cardiologia.ecg || "")}"></label>
                    <label>Troponine seriali<input id="cardioTroponine" value="${escapeHtml(p.cardiologia.troponine || "")}"></label>
                    <label>Ritmo / aritmie<input id="cardioRitmo" value="${escapeHtml(p.cardiologia.ritmo || "")}"></label>
                    <label>Classe rischio<input id="cardioRischio" value="${escapeHtml(p.cardiologia.rischio || "")}"></label>
                    <label>Terapia acuta<input id="cardioTerapia" value="${escapeHtml(p.cardiologia.terapia || "")}"></label>
                </div>
                <textarea id="cardioPiano" placeholder="Piano: osservazione, coronarografia, UTIC, dimissione protetta">${escapeHtml(p.cardiologia.piano || "")}</textarea>
            </section>
        `;
    }

    if (p.reparto === "neurologia") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row"><h3>Modulo Neurologia / Stroke Unit</h3><button onclick="salvaModuloReparto()">Salva modulo</button></div>
                <div class="form-grid compact">
                    <label>Deficit neurologico<input id="neuroDeficit" value="${escapeHtml(p.neurologia.deficit || "")}"></label>
                    <label>NIHSS<input id="neuroNihss" type="number" min="0" value="${escapeHtml(p.neurologia.nihss || "")}"></label>
                    <label>Ora esordio / last seen well<input id="neuroOnset" value="${escapeHtml(p.neurologia.onset || "")}"></label>
                    <label>TAC / angio-TAC<input id="neuroTac" value="${escapeHtml(p.neurologia.tac || "")}"></label>
                    <label class="check-row"><input id="neuroTrombolisi" type="checkbox" ${p.neurologia.trombolisi ? "checked" : ""}> Trombolisi indicata/eseguita</label>
                    <label class="check-row"><input id="neuroTrombectomia" type="checkbox" ${p.neurologia.trombectomia ? "checked" : ""}> Trombectomia valutata</label>
                </div>
                <textarea id="neuroPiano" placeholder="Piano neurologico, monitoraggio, antiaggregazione/anticoagulazione, ricovero">${escapeHtml(p.neurologia.piano || "")}</textarea>
            </section>
        `;
    }

    if (p.reparto === "rianimazione") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row"><h3>Modulo Rianimazione / Terapia Intensiva</h3><button onclick="salvaModuloReparto()">Salva modulo</button></div>
                <div class="form-grid compact">
                    <label>Via aerea<input id="riaViaAerea" value="${escapeHtml(p.rianimazione.viaAerea || "")}"></label>
                    <label>Ventilazione<input id="riaVentilazione" value="${escapeHtml(p.rianimazione.ventilazione || "")}"></label>
                    <label>Accessi venosi / arteriosi<input id="riaAccessi" value="${escapeHtml(p.rianimazione.accessi || "")}"></label>
                    <label>Sedazione / analgesia<input id="riaSedazione" value="${escapeHtml(p.rianimazione.sedazione || "")}"></label>
                    <label>Vasopressori<input id="riaVasopressori" value="${escapeHtml(p.rianimazione.vasopressori || "")}"></label>
                    <label>Monitoraggio<input id="riaMonitoraggio" value="${escapeHtml(p.rianimazione.monitoraggio || "")}"></label>
                </div>
                <textarea id="riaPiano" placeholder="Piano intensivo, target emodinamici/respiratori, rivalutazione">${escapeHtml(p.rianimazione.piano || "")}</textarea>
            </section>
        `;
    }

    return "";
}

function salvaModuloReparto() {
    let p = pazienteSelezionato;
    if (!p) return;
    p = ensurePaziente(p);

    if (p.reparto === "chirurgia") {
        p.chirurgia = {
            diagnosi: fieldValue("chirDiagnosi"),
            procedura: fieldValue("chirProcedura"),
            rischioAnestesiologico: fieldValue("chirRischio"),
            consenso: document.getElementById("chirConsenso")?.checked || false,
            digiuno: fieldValue("chirDigiuno"),
            profilassi: fieldValue("chirProfilassi"),
            noteOperatorie: fieldValue("chirNote")
        };
    }
    if (p.reparto === "medicinaInterna") {
        p.medicinaInterna = {
            anamnesi: fieldValue("miAnamnesi"),
            diagnosi: fieldValue("miDiagnosi"),
            comorbidita: fieldValue("miComorbidita"),
            terapiaCronica: fieldValue("miTerapiaCronica"),
            piano: fieldValue("miPiano")
        };
    }
    if (p.reparto === "ortopedia") {
        p.ortopedia = {
            distretto: fieldValue("ortoDistretto"),
            trauma: fieldValue("ortoTrauma"),
            frattura: fieldValue("ortoFrattura"),
            immobilizzazione: fieldValue("ortoImmobilizzazione"),
            carico: fieldValue("ortoCarico"),
            followUp: fieldValue("ortoFollowUp"),
            indicazione: fieldValue("ortoIndicazione")
        };
    }
    if (p.reparto === "cardiologia") {
        p.cardiologia = {
            doloreToracico: fieldValue("cardioDolore"),
            ecg: fieldValue("cardioEcg"),
            troponine: fieldValue("cardioTroponine"),
            ritmo: fieldValue("cardioRitmo"),
            rischio: fieldValue("cardioRischio"),
            terapia: fieldValue("cardioTerapia"),
            piano: fieldValue("cardioPiano")
        };
    }
    if (p.reparto === "neurologia") {
        p.neurologia = {
            deficit: fieldValue("neuroDeficit"),
            nihss: fieldValue("neuroNihss"),
            onset: fieldValue("neuroOnset"),
            tac: fieldValue("neuroTac"),
            trombolisi: document.getElementById("neuroTrombolisi")?.checked || false,
            trombectomia: document.getElementById("neuroTrombectomia")?.checked || false,
            piano: fieldValue("neuroPiano")
        };
    }
    if (p.reparto === "rianimazione") {
        p.rianimazione = {
            viaAerea: fieldValue("riaViaAerea"),
            ventilazione: fieldValue("riaVentilazione"),
            accessi: fieldValue("riaAccessi"),
            sedazione: fieldValue("riaSedazione"),
            vasopressori: fieldValue("riaVasopressori"),
            monitoraggio: fieldValue("riaMonitoraggio"),
            piano: fieldValue("riaPiano")
        };
    }

    logAction("Aggiornato modulo " + labelReparto(p.reparto) + " per " + p.nome + " " + p.cognome);
    salva();
    render();
}

function repartoView(app, reparto, titolo) {
    const meta = repartoMeta(reparto);
    const pazientiReparto = pazienti.filter(p => ensurePaziente(p).reparto === reparto);
    const critici = pazientiReparto.filter(p => ["Rosso", "Arancione"].includes(p.codice)).length;
    const referti = pazientiReparto.reduce((tot, p) => tot + refertiPendenti(p), 0);

    app.innerHTML = `
        <div class="page-header">
            <div>
                <p class="eyebrow">Reparto</p>
                <h2>${escapeHtml(titolo || meta.icon + " " + meta.label)}</h2>
            </div>
            <div class="header-actions">
                <span class="mini-count">${pazientiReparto.length} pazienti</span>
                <button onclick="pagina='ps'; render()">Torna al PS</button>
            </div>
        </div>

        <section class="clinical-summary">
            <div><b>Pazienti</b><span>${pazientiReparto.length}</span></div>
            <div><b>Alta priorita</b><span>${critici}</span></div>
            <div><b>Referti in attesa</b><span>${referti}</span></div>
            <div><b>Funzione</b><span>${escapeHtml(descrizioneReparto(reparto))}</span></div>
        </section>

        <section class="work-panel">
            <div class="patient-list">
                ${pazientiReparto.length ? pazientiReparto.map(p => `
                    <article class="paziente ${triageClass(p.codice)}">
                        <div class="patient-main">
                            <span class="triage-badge ${triageClass(p.codice)}">${escapeHtml(p.codice)}</span>
                            <div>
                                <h4>${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</h4>
                                <p>${escapeHtml(p.motivo || "Motivo non indicato")}</p>
                                <small>${escapeHtml(repartoSintesi(p))}</small>
                            </div>
                        </div>
                        <div class="patient-actions">
                            <button onclick="apri('${p.id}')">Apri cartella</button>
                            <button onclick="spostaPaziente('${p.id}', 'ps')">Rimanda al PS</button>
                        </div>
                    </article>
                `).join("") : `<div class="empty-state">Nessun paziente assegnato a questo reparto.</div>`}
            </div>
        </section>
    `;
}

function descrizioneReparto(reparto) {
    const descrizioni = {
        chirurgia: "urgenze addominali, sala operatoria, decorso chirurgico",
        medicinaInterna: "polipatologia, infezioni, scompensi, diagnosi complesse",
        ortopedia: "traumi, fratture, immobilizzazioni, indicazione chirurgica",
        cardiologia: "dolore toracico, aritmie, scompenso, UTIC",
        neurologia: "ictus, TIA, crisi epilettiche, deficit neurologici",
        rianimazione: "instabilita critica, ventilazione, monitoraggio avanzato"
    };
    return descrizioni[reparto] || "osservazione e trattamento";
}

function repartoSintesi(p) {
    p = ensurePaziente(p);
    if (p.reparto === "ortopedia") return p.ortopedia.frattura || p.ortopedia.distretto || "Modulo ortopedico da compilare";
    if (p.reparto === "cardiologia") return p.cardiologia.ecg || p.cardiologia.doloreToracico || "Monitoraggio cardiologico";
    if (p.reparto === "neurologia") return p.neurologia.deficit || (p.neurologia.nihss ? "NIHSS " + p.neurologia.nihss : "Valutazione neurologica");
    if (p.reparto === "rianimazione") return p.rianimazione.ventilazione || p.rianimazione.monitoraggio || "Monitoraggio intensivo";
    if (p.reparto === "chirurgia") return p.chirurgia.diagnosi || p.chirurgia.procedura || "Modulo chirurgico";
    if (p.reparto === "medicinaInterna") return p.medicinaInterna.diagnosi || p.medicinaInterna.piano || "Modulo internistico";
    return p.cf || "Cartella PS";
}

function chirurgiaView(app) { repartoView(app, "chirurgia", "Chirurgia"); }
function medicinaInternaView(app) { repartoView(app, "medicinaInterna", "Medicina Interna"); }
function ortopediaView(app) { repartoView(app, "ortopedia", "Ortopedia e Traumatologia"); }
function cardiologiaView(app) { repartoView(app, "cardiologia", "Cardiologia / UTIC"); }
function neurologiaView(app) { repartoView(app, "neurologia", "Neurologia / Stroke Unit"); }
function rianimazioneView(app) { repartoView(app, "rianimazione", "Rianimazione / Terapia Intensiva"); }

function legacySalvaIntervento118Finale(idInt, renderAfterSave = true) {
    let i = interventi118.find(x => x.id === idInt);
    if (!i) return;

    if (document.getElementById("stato118")) {
        i.stato = fieldValue("stato118") || i.stato || "aperto";
        i.priorita = fieldValue("priorita118") || i.priorita || "verde";
        i.ambulanceId = fieldValue("ambulanceId");
        i.indirizzo = fieldValue("indirizzo118");
        i.descrizione = fieldValue("descrizione118");
        i.mezzo = fieldValue("mezzo");
        i.equipaggio = fieldValue("equipaggio");
        i.paziente = {
            cognomeNome: fieldValue("paziente"),
            dataNascita: fieldValue("nascita"),
            sesso: fieldValue("sesso"),
            cf: fieldValue("cf")
        };
        i.scena = {
            luogo: fieldValue("luogo"),
            tipologia: fieldValue("tipologia"),
            dinamica: fieldValue("dinamica")
        };
        i.abcde = {
            a: fieldValue("a"),
            b: fieldValue("b"),
            c: fieldValue("c"),
            d: fieldValue("d"),
            e: fieldValue("e")
        };
        i.vitali = {
            fc: fieldValue("fc"),
            fr: fieldValue("fr"),
            spo2: fieldValue("spo2"),
            pa: fieldValue("pa")
        };
        i.trattamento = {
            ossigeno: document.getElementById("t_ossigeno")?.checked || false,
            accesso: document.getElementById("t_accesso")?.checked || false,
            monitoraggio: document.getElementById("t_monitoraggio")?.checked || false,
            immobilizzazione: document.getElementById("t_immobilizzazione")?.checked || false,
            analgesia: document.getElementById("t_analgesia")?.checked || false,
            note: fieldValue("t_note")
        };
        i.destinazione = {
            esito: fieldValue("esito"),
            ospedale: fieldValue("ospedale"),
            codice: fieldValue("codiceDest")
        };
    }

    logAction("Salvata scheda intervento 118 #" + i.numero);
    salva();
    if (renderAfterSave) render();
}

function legacyChiudiInterventoSecondario(idInt) {
    salvaIntervento118(idInt, false);
    let i = interventi118.find(x => x.id === idInt);
    if (!i) return;

    i.stato = "chiuso";
    i.closedAt = new Date().toLocaleString();
    i.closedBy = medicoLoggato?.nome || "Operatore";
    interventi118Archivio.push({
        ...i,
        archivedAt: new Date().toLocaleString()
    });
    interventi118 = interventi118.filter(x => x.id !== idInt);
    intervento118Selezionato = null;
    logAction("Chiuso intervento 118 #" + i.numero + " da " + i.closedBy);
    salva();
    render();
    stampaIntervento118(i.id, true);
}

function legacyStampaIntervento118Secondario(idInt, archived = false) {
    const elenco = archived ? interventi118Archivio : interventi118;
    let i = elenco.find(x => x.id === idInt);
    if (!i) return;

    const operatoreChiusura = i.closedBy || medicoLoggato?.nome || "Operatore";
    let win = window.open("", "_blank");
    win.document.write(`
        <html>
        <head>
            <title>Scheda 118 #${escapeHtml(i.numero)}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #132235; }
                .doc { border: 1px solid #8fa1b5; padding: 22px; }
                .head { display: flex; justify-content: space-between; gap: 24px; border-bottom: 4px solid #b51d2a; padding-bottom: 12px; }
                .brand { color: #b51d2a; font-size: 23px; font-weight: 900; }
                .meta { text-align: right; font-size: 12px; color: #526477; }
                h1 { margin: 18px 0 10px; font-size: 20px; text-align: center; }
                h2 { margin: 16px 0 7px; font-size: 14px; color: #173b63; border-bottom: 1px solid #c9d4df; padding-bottom: 4px; }
                .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 12px; }
                .box { border: 1px solid #c9d4df; min-height: 36px; padding: 8px; white-space: pre-wrap; font-size: 12px; }
                .abcde { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
                .abcde div { border: 1px solid #c9d4df; padding: 8px; min-height: 42px; }
                .sign { display: flex; justify-content: space-between; gap: 18px; margin-top: 34px; }
                .sign div { flex: 1; border-top: 1px solid #132235; padding-top: 6px; text-align: center; font-size: 12px; }
                @media print { body { padding: 0; } .doc { border: none; } }
            </style>
        </head>
        <body>
            <div class="doc">
                <div class="head">
                    <div><div class="brand">118 - SCHEDA INTERVENTO</div><small>Verbale sanitario di soccorso extraospedaliero</small></div>
                    <div class="meta">Intervento #${escapeHtml(i.numero)}<br>Apertura: ${escapeHtml(i.data || "")}<br>Chiusura: ${escapeHtml(i.closedAt || "")}<br>Stato finale: ${escapeHtml(i.stato || "")}</div>
                </div>
                <h1>Relazione intervento</h1>
                <h2>Dati missione</h2>
                <div class="grid">
                    <div><b>Priorità:</b> ${escapeHtml(i.priorita || "")}</div>
                    <div><b>Mezzo:</b> ${escapeHtml(i.mezzo || "")}</div>
                    <div><b>Ambulanza:</b> ${escapeHtml(i.ambulanceId || "")}</div>
                    <div><b>Partenza:</b> ${escapeHtml(i.dispatchedAt || "")}</div>
                    <div><b>Arrivo sul posto:</b> ${escapeHtml(i.arrivedAt || "")}</div>
                    <div><b>Equipaggio:</b> ${escapeHtml(i.equipaggio || "")}</div>
                </div>
                <h2>Paziente</h2>
                <div class="grid">
                    <div><b>Nominativo:</b> ${escapeHtml(i.paziente?.cognomeNome || "")}</div>
                    <div><b>Data nascita:</b> ${escapeHtml(i.paziente?.dataNascita || "")}</div>
                    <div><b>Sesso:</b> ${escapeHtml(i.paziente?.sesso || "")}</div>
                    <div><b>Codice fiscale:</b> ${escapeHtml(i.paziente?.cf || "")}</div>
                    <div><b>Indirizzo evento:</b> ${escapeHtml(i.indirizzo || "")}</div>
                    <div><b>Destinazione:</b> ${escapeHtml(i.destinazione?.ospedale || "")}</div>
                </div>
                <h2>Scenario e dinamica</h2>
                <div class="box">Luogo: ${escapeHtml(i.scena?.luogo || "")}
Tipologia: ${escapeHtml(i.scena?.tipologia || "")}
Descrizione: ${escapeHtml(i.descrizione || "")}
Dinamica: ${escapeHtml(i.scena?.dinamica || "")}</div>
                <h2>Valutazione ABCDE</h2>
                <div class="abcde">
                    <div><b>A</b><br>${escapeHtml(i.abcde?.a || "")}</div>
                    <div><b>B</b><br>${escapeHtml(i.abcde?.b || "")}</div>
                    <div><b>C</b><br>${escapeHtml(i.abcde?.c || "")}</div>
                    <div><b>D</b><br>${escapeHtml(i.abcde?.d || "")}</div>
                    <div><b>E</b><br>${escapeHtml(i.abcde?.e || "")}</div>
                </div>
                <h2>Parametri vitali</h2>
                <div class="grid">
                    <div><b>FC:</b> ${escapeHtml(i.vitali?.fc || "")} bpm</div>
                    <div><b>FR:</b> ${escapeHtml(i.vitali?.fr || "")} /min</div>
                    <div><b>SpO2:</b> ${escapeHtml(i.vitali?.spo2 || "")} %</div>
                    <div><b>PA:</b> ${escapeHtml(i.vitali?.pa || "")}</div>
                    <div><b>Codice rientro:</b> ${escapeHtml(i.destinazione?.codice || "")}</div>
                    <div><b>Esito:</b> ${escapeHtml(i.destinazione?.esito || "")}</div>
                </div>
                <h2>Trattamento</h2>
                <div class="box">Ossigeno: ${i.trattamento?.ossigeno ? "SI" : "NO"}
Accesso venoso: ${i.trattamento?.accesso ? "SI" : "NO"}
Monitoraggio: ${i.trattamento?.monitoraggio ? "SI" : "NO"}
Immobilizzazione: ${i.trattamento?.immobilizzazione ? "SI" : "NO"}
Analgesia: ${i.trattamento?.analgesia ? "SI" : "NO"}

Note trattamento:
${escapeHtml(i.trattamento?.note || "")}</div>
                <div class="sign">
                    <div>Operatore che chiude<br><b>${escapeHtml(operatoreChiusura)}</b></div>
                    <div>Firma equipaggio</div>
                    <div>Firma ricevente / struttura</div>
                </div>
            </div>
            <script>window.onload = () => window.print();</script>
        </body>
        </html>
    `);
    win.document.close();
}

function formatParametriHistory(p) {
    return (p.parametriHistory || []).slice().reverse().map(h => `
        <tr>
            <td>${escapeHtml(h.time || "")}</td>
            <td>${escapeHtml(h.fc || "")}</td>
            <td>${escapeHtml(h.fr || "")}</td>
            <td>${escapeHtml(h.sat || h.spo2 || "")}</td>
            <td>${escapeHtml(h.pa || "")}</td>
            <td>${escapeHtml(h.temp || "")}</td>
            <td>${escapeHtml(h.gcs || "")}</td>
            <td>${escapeHtml(h.dolore || "")}</td>
        </tr>
    `).join("");
}

function formatEsami(esami) {
    return (esami || []).slice().reverse().map(e => {
        if (typeof e === "string") return `<tr><td colspan="6">${escapeHtml(e)}</td></tr>`;
        const statoClass = e.stato === "Refertato" ? "done" : e.stato === "In corso" ? "progress" : "pending";
        const tempo = tempoRefertoLabel(e);
        return `
            <tr>
                <td>${escapeHtml(e.time || "")}</td>
                <td><b>${escapeHtml(e.nome || e.tipo || "")}</b><small>${escapeHtml(e.categoria || e.tipo || "")}</small></td>
                <td>${escapeHtml(e.richiedente || "")}</td>
                <td><span class="exam-status ${statoClass}">${escapeHtml(e.stato || "")}</span>${tempo ? `<small>${escapeHtml(tempo)}</small>` : ""}</td>
                <td>${escapeHtml(e.urgenza || "")}</td>
                <td><div class="exam-report">${escapeHtml(e.esito || "Referto non ancora disponibile.")}</div>${e.refertatoIl ? `<small>Refertato: ${escapeHtml(e.refertatoIl)} - ${escapeHtml(e.refertatoDa || "Diagnostica")}</small>` : ""}</td>
            </tr>
        `;
    }).join("");
}

function formatTerapie(terapie) {
    return (terapie || []).slice().reverse().map(t => {
        if (typeof t === "string") return `<tr><td colspan="6">${escapeHtml(t)}</td></tr>`;
        return `
            <tr>
                <td>${escapeHtml(t.time || "")}</td>
                <td>${escapeHtml(t.farmaco || "")}</td>
                <td>${escapeHtml(t.dose || "")}</td>
                <td>${escapeHtml(t.via || "")}</td>
                <td>${escapeHtml(t.frequenza || "")}</td>
                <td>${escapeHtml(t.note || "")}</td>
            </tr>
        `;
    }).join("");
}

function formatDiarioClinico(p) {
    const diario = [
        ...(p.visite || []).map(v => typeof v === "string" ? { time: "", tipo: "Visita", testo: v, operatore: "" } : v),
        ...(p.diarioClinico || [])
    ];

    return diario.slice().reverse().map(d => `
        <article class="clinical-note">
            <div><b>${escapeHtml(d.tipo || "Nota")}</b><span>${escapeHtml(d.time || "")}</span></div>
            <p>${escapeHtml(d.testo || d.diagnosi || "")}</p>
            <small>${escapeHtml(d.operatore || "")}</small>
        </article>
    `).join("");
}

function cartella(app) {
    let p = ensurePaziente(pazienteSelezionato);
    if (!p) {
        pagina = "ps";
        render();
        return;
    }

    app.innerHTML = `
        <div class="page-header dedalus-record-head">
            <div class="patient-identity">
                ${iconImg(patientIcon(p), "Paziente")}
                <div>
                <p class="eyebrow">Cartella clinica</p>
                <h2>${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</h2>
                    <span>${escapeHtml(p.cf || "CF non indicato")} · ${escapeHtml(labelReparto(p.reparto))}</span>
                </div>
            </div>
            <div class="header-actions">
                <span class="triage-badge ${triageClass(p.codice)}">${escapeHtml(p.codice)}</span>
                <button onclick="generaECG()">${iconImg("ecg", "ECG")} ECG</button>
                <button onclick="dimetti()">Dimissione e PDF</button>
                <button onclick="pagina='ps'; render()">Torna</button>
            </div>
        </div>

        ${ultimoAvvisoReferti ? `<div class="exam-alert">${escapeHtml(ultimoAvvisoReferti)}</div>` : ""}

        <section class="clinical-summary">
            <div><b>Motivo accesso</b><span>${escapeHtml(p.motivo || "Non indicato")}</span></div>
            <div><b>Reparto</b><span>${escapeHtml(labelReparto(p.reparto))}</span></div>
            <div><b>Codice fiscale</b><span>${escapeHtml(p.cf || "Non indicato")}</span></div>
            <div>
                <b>Sposta paziente</b>
                <select id="repartoCartella" onchange="cambiaRepartoPaziente()">
                    <option value="ps" ${p.reparto === "ps" ? "selected" : ""}>Pronto Soccorso</option>
                    <option value="chirurgia" ${p.reparto === "chirurgia" ? "selected" : ""}>Chirurgia</option>
                    <option value="medicinaInterna" ${p.reparto === "medicinaInterna" ? "selected" : ""}>Medicina Interna</option>
                    <option value="ortopedia" ${p.reparto === "ortopedia" ? "selected" : ""}>Ortopedia</option>
                    <option value="cardiologia" ${p.reparto === "cardiologia" ? "selected" : ""}>Cardiologia</option>
                    <option value="neurologia" ${p.reparto === "neurologia" ? "selected" : ""}>Neurologia</option>
                    <option value="rianimazione" ${p.reparto === "rianimazione" ? "selected" : ""}>Rianimazione</option>
                </select>
            </div>
        </section>

        <div class="clinical-grid">
            <section class="work-panel dedalus-panel span-2">
                <div class="panel-title-row dedalus-panel-head">
                    ${iconImg("caduceus", "Inquadramento")}
                    <div>
                    <h3>Inquadramento clinico</h3>
                    <p>Quadro sintetico, andamento simulato, alert e timeline.</p>
                    </div>
                    <span class="mini-count">${timelineClinica(p).length} eventi</span>
                </div>
                <div class="clinical-brief">${escapeHtml(`Motivo di accesso: ${p.motivo || "Non indicato"}
Reparto: ${labelReparto(p.reparto)}
Priorita triage: ${p.codice || "n/d"}
Referti in attesa: ${refertiPendenti(p)}`)}</div>
                <div class="clinical-alerts">${alertCliniciHTML(p)}</div>
                <div class="clinical-timeline compact">${timelineClinicaHTML(p)}</div>
            </section>

            <section class="work-panel dedalus-panel span-2">
                <div class="panel-title-row dedalus-panel-head">
                    ${iconImg("thermometer", "Parametri")}
                    <div>
                    <h3>Parametri vitali</h3>
                    <p>Rilevazione e storico parametri.</p>
                    </div>
                    <button onclick="salvaParametri()">Registra parametri</button>
                </div>
                <div class="vitals-grid">
                    <label>FC<input id="fc" type="number" placeholder="bpm" value="${escapeHtml(p.parametri.fc || "")}"></label>
                    <label>FR<input id="fr" type="number" placeholder="/min" value="${escapeHtml(p.parametri.fr || "")}"></label>
                    <label>SpO2<input id="sat" type="number" placeholder="%" value="${escapeHtml(p.parametri.sat || "")}"></label>
                    <label>PA<input id="pa" placeholder="120/80" value="${escapeHtml(p.parametri.pa || "")}"></label>
                    <label>Temp.<input id="temp" type="number" step="0.1" placeholder="°C" value="${escapeHtml(p.parametri.temp || "")}"></label>
                    <label>GCS<input id="gcs" type="number" min="3" max="15" placeholder="3-15" value="${escapeHtml(p.parametri.gcs || "")}"></label>
                    <label>Dolore<input id="dolore" type="number" min="0" max="10" placeholder="0-10" value="${escapeHtml(p.parametri.dolore || "")}"></label>
                </div>
                <div class="table-wrap">
                    <table class="clinical-table">
                        <thead><tr><th>Ora</th><th>FC</th><th>FR</th><th>SpO2</th><th>PA</th><th>Temp</th><th>GCS</th><th>Dolore</th></tr></thead>
                        <tbody>${formatParametriHistory(p) || `<tr><td colspan="8">Nessuna rilevazione.</td></tr>`}</tbody>
                    </table>
                </div>
            </section>

            <section class="work-panel dedalus-panel">
                <div class="panel-title-row dedalus-panel-head">
                    ${iconImg("xray", "Diagnostica")}
                    <div>
                    <h3>Diagnostica</h3>
                    <p>Referti automatici simulati in 1-2 minuti.</p>
                    </div>
                    <span class="mini-count">${refertiPendenti(p)} in corso</span>
                </div>
                <select id="esameNome">${esamiCatalogoHTML()}</select>
                <select id="esameUrgenza">
                    <option>Routine PS</option>
                    <option>Urgente</option>
                    <option>Emergenza</option>
                </select>
                <input id="esameRichiedente" placeholder="Quesito clinico / sospetto diagnostico">
                <textarea id="esameNote" placeholder="Note per diagnostica o laboratorio"></textarea>
                <div class="button-row">
                    <button onclick="addEsami()">Richiedi esame</button>
                    <button onclick="controllaReferti()">Controlla referti</button>
                </div>
            </section>

            <section class="work-panel dedalus-panel">
                <div class="dedalus-panel-head">
                    ${iconImg("pill", "Terapia")}
                    <div><h3>Terapia farmacologica</h3><p>Farmaco, dose, via e risposta clinica.</p></div>
                </div>
                <input id="farmacoNome" placeholder="Farmaco">
                <input id="farmacoDose" placeholder="Dose">
                <select id="farmacoVia">
                    <option>EV</option>
                    <option>IM</option>
                    <option>OS</option>
                    <option>SC</option>
                    <option>Aerosol</option>
                    <option>Topica</option>
                </select>
                <input id="farmacoFrequenza" placeholder="Orario / frequenza">
                <textarea id="farmacoNote" placeholder="Indicazioni, diluizione, risposta clinica"></textarea>
                <button onclick="addTerapia()">Somministra / prescrivi</button>
            </section>

            <section class="work-panel dedalus-panel span-2">
                <div class="dedalus-panel-head">
                    ${iconImg("doctorMale", "Diario")}
                    <div><h3>Diario clinico</h3><p>Valutazioni, diagnosi, decorso e decisioni.</p></div>
                </div>
                <select id="diarioTipo">
                    <option>Valutazione medica</option>
                    <option>Rivalutazione infermieristica</option>
                    <option>Consulenza</option>
                    <option>Decorso</option>
                    <option>Diagnosi</option>
                </select>
                <textarea id="diarioTesto" placeholder="Valutazione, obiettività, ipotesi diagnostica, piano"></textarea>
                <button onclick="addVisita()">Registra nota</button>
                <div class="notes-list">${formatDiarioClinico(p) || `<div class="empty-state">Nessuna nota clinica.</div>`}</div>
            </section>

            ${repartoSpecificoHTML(p)}

            <section class="work-panel span-2 is-removed-panel">
                <div class="panel-title-row">
                    <h3>Timeline clinica</h3>
                    <span class="mini-count">ultimi 18</span>
                </div>
                <div class="clinical-timeline">${timelineClinicaHTML(p)}</div>
            </section>

            <section class="work-panel dedalus-panel span-2">
                <div class="panel-title-row dedalus-panel-head">
                    ${iconImg("ecg", "ECG")}
                    <div>
                    <h3>Tracciato ECG</h3>
                    <p>Tracciato dimostrativo generato dalla cartella.</p>
                    </div>
                    <span class="mini-count">${(p.ecgHistory || []).length}</span>
                </div>
                <canvas id="ecgCanvas" class="ecg-canvas" width="960" height="260"></canvas>
                <div class="ecg-history">
                    ${(p.ecgHistory || []).slice().reverse().map(e => `
                        <div><b>${escapeHtml(e.time)}</b><span>${escapeHtml(e.ritmo)} - FC ${escapeHtml(e.fc)} bpm</span></div>
                    `).join("") || `<div class="empty-state">Premi ECG per generare un tracciato dimostrativo.</div>`}
                </div>
            </section>

            <section class="work-panel dedalus-panel span-2">
                <div class="dedalus-panel-head">
                    ${iconImg("microscope", "Referti")}
                    <div><h3>Storico esami e referti</h3><p>Richieste, stato, urgenza e referto.</p></div>
                </div>
                <div class="table-wrap">
                    <table class="clinical-table">
                        <thead><tr><th>Richiesto</th><th>Esame</th><th>Quesito</th><th>Stato</th><th>Urgenza</th><th>Referto</th></tr></thead>
                        <tbody>${formatEsami(p.esami) || `<tr><td colspan="6">Nessun esame.</td></tr>`}</tbody>
                    </table>
                </div>
            </section>

            <section class="work-panel dedalus-panel span-2">
                <div class="dedalus-panel-head">
                    ${iconImg("ivBag", "Terapie")}
                    <div><h3>Terapie registrate</h3><p>Somministrazioni e prescrizioni.</p></div>
                </div>
                <div class="table-wrap">
                    <table class="clinical-table">
                        <thead><tr><th>Ora</th><th>Farmaco</th><th>Dose</th><th>Via</th><th>Frequenza</th><th>Note</th></tr></thead>
                        <tbody>${formatTerapie(p.terapie) || `<tr><td colspan="6">Nessuna terapia.</td></tr>`}</tbody>
                    </table>
                </div>
            </section>
        </div>
    `;

    disegnaUltimoECG();
    ultimoAvvisoReferti = "";
}

function repartoSpecificoHTML(p) {
    if (p.reparto === "chirurgia") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row">
                    <h3>Modulo Chirurgia</h3>
                    <button onclick="salvaModuloReparto()">Salva modulo</button>
                </div>
                <div class="form-grid compact">
                    <label>Diagnosi chirurgica<input id="chirDiagnosi" value="${escapeHtml(p.chirurgia.diagnosi || "")}"></label>
                    <label>Procedura prevista<input id="chirProcedura" value="${escapeHtml(p.chirurgia.procedura || "")}"></label>
                    <label>Rischio anestesiologico<input id="chirRischio" value="${escapeHtml(p.chirurgia.rischioAnestesiologico || "")}"></label>
                    <label>Digiuno<input id="chirDigiuno" value="${escapeHtml(p.chirurgia.digiuno || "")}"></label>
                    <label>Profilassi<input id="chirProfilassi" value="${escapeHtml(p.chirurgia.profilassi || "")}"></label>
                    <label class="check-row"><input id="chirConsenso" type="checkbox" ${p.chirurgia.consenso ? "checked" : ""}> Consenso informato acquisito</label>
                </div>
                <textarea id="chirNote" placeholder="Note pre/post operatorie">${escapeHtml(p.chirurgia.noteOperatorie || "")}</textarea>
            </section>
        `;
    }

    if (p.reparto === "medicinaInterna") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row">
                    <h3>Modulo Medicina Interna</h3>
                    <button onclick="salvaModuloReparto()">Salva modulo</button>
                </div>
                <div class="form-grid compact">
                    <label>Anamnesi<input id="miAnamnesi" value="${escapeHtml(p.medicinaInterna.anamnesi || "")}"></label>
                    <label>Diagnosi / problema attivo<input id="miDiagnosi" value="${escapeHtml(p.medicinaInterna.diagnosi || "")}"></label>
                    <label>Comorbidità<input id="miComorbidita" value="${escapeHtml(p.medicinaInterna.comorbidita || "")}"></label>
                    <label>Terapia cronica<input id="miTerapiaCronica" value="${escapeHtml(p.medicinaInterna.terapiaCronica || "")}"></label>
                </div>
                <textarea id="miPiano" placeholder="Piano diagnostico-terapeutico">${escapeHtml(p.medicinaInterna.piano || "")}</textarea>
            </section>
        `;
    }

    return "";
}

function salvaParametri() {
    let p = pazienteSelezionato;
    if (!p) return;

    const newParams = {
        fc: fieldValue("fc"),
        fr: fieldValue("fr"),
        sat: fieldValue("sat"),
        pa: fieldValue("pa"),
        temp: fieldValue("temp"),
        gcs: fieldValue("gcs"),
        dolore: fieldValue("dolore"),
        time: new Date().toLocaleString(),
        operatore: medicoLoggato?.nome || ""
    };

    p.parametri = {
        fc: newParams.fc,
        fr: newParams.fr,
        sat: newParams.sat,
        pa: newParams.pa,
        temp: newParams.temp,
        gcs: newParams.gcs,
        dolore: newParams.dolore
    };
    p.parametriHistory.push(newParams);
    logAction("Registrati parametri paziente " + p.nome + " " + p.cognome);
    salva();
    render();
}

function addEsami() {
    let p = pazienteSelezionato;
    if (!p) return;

    const nome = fieldValue("esameNome");
    const richiedente = fieldValue("esameRichiedente");
    const note = fieldValue("esameNote");
    if (!nome && !richiedente) return;

    const catalogo = trovaEsameCatalogo(nome);
    const delaySeconds = numeroCasuale(catalogo.tempo[0], catalogo.tempo[1]);
    const requestedAt = Date.now();

    p.esami.push({
        id: id(),
        time: new Date().toLocaleString(),
        requestedAt,
        dueAt: requestedAt + delaySeconds * 1000,
        tipo: catalogo.categoria,
        categoria: catalogo.categoria,
        nome: catalogo.nome,
        richiedente,
        note,
        urgenza: fieldValue("esameUrgenza"),
        stato: "In corso",
        esito: "",
        refertoAutomatico: true,
        tempoStimatoSecondi: delaySeconds,
        operatore: medicoLoggato?.nome || ""
    });
    logAction(`Richiesto ${catalogo.nome} per ${p.nome} ${p.cognome}`);
    salva();
    pianificaControlloReferti();
    render();
}

function addTerapia() {
    let p = pazienteSelezionato;
    if (!p) return;

    const farmaco = fieldValue("farmacoNome");
    if (!farmaco) {
        alert("Inserisci almeno il farmaco");
        return;
    }

    p.terapie.push({
        id: id(),
        time: new Date().toLocaleString(),
        farmaco,
        dose: fieldValue("farmacoDose"),
        via: fieldValue("farmacoVia"),
        frequenza: fieldValue("farmacoFrequenza"),
        note: fieldValue("farmacoNote"),
        operatore: medicoLoggato?.nome || ""
    });
    logAction("Registrata terapia per " + p.nome + " " + p.cognome);
    salva();
    render();
}

function addVisita() {
    let p = pazienteSelezionato;
    if (!p) return;

    const testo = fieldValue("diarioTesto");
    if (!testo) return;

    p.diarioClinico.push({
        id: id(),
        time: new Date().toLocaleString(),
        tipo: fieldValue("diarioTipo"),
        testo,
        operatore: medicoLoggato?.nome || ""
    });
    logAction("Aggiunta nota clinica a " + p.nome + " " + p.cognome);
    salva();
    render();
}

function salvaModuloReparto() {
    let p = pazienteSelezionato;
    if (!p) return;

    if (p.reparto === "chirurgia") {
        p.chirurgia = {
            diagnosi: fieldValue("chirDiagnosi"),
            procedura: fieldValue("chirProcedura"),
            rischioAnestesiologico: fieldValue("chirRischio"),
            consenso: document.getElementById("chirConsenso")?.checked || false,
            digiuno: fieldValue("chirDigiuno"),
            profilassi: fieldValue("chirProfilassi"),
            noteOperatorie: fieldValue("chirNote")
        };
    }

    if (p.reparto === "medicinaInterna") {
        p.medicinaInterna = {
            anamnesi: fieldValue("miAnamnesi"),
            diagnosi: fieldValue("miDiagnosi"),
            comorbidita: fieldValue("miComorbidita"),
            terapiaCronica: fieldValue("miTerapiaCronica"),
            piano: fieldValue("miPiano")
        };
    }

    logAction("Aggiornato modulo reparto per " + p.nome + " " + p.cognome);
    salva();
    render();
}

function generaECG() {
    let p = pazienteSelezionato;
    if (!p) return;

    const fc = Number(p.parametri?.fc || 72);
    const ritmo = fc > 110 ? "Tachicardia sinusale" : fc < 55 ? "Bradicardia sinusale" : "Ritmo sinusale";
    p.ecgHistory.push({
        id: id(),
        time: new Date().toLocaleString(),
        fc: String(fc || 72),
        ritmo,
        operatore: medicoLoggato?.nome || ""
    });
    logAction("Generato ECG per " + p.nome + " " + p.cognome);
    salva();
    render();
}

function disegnaUltimoECG() {
    setTimeout(() => {
        const canvas = document.getElementById("ecgCanvas");
        const p = pazienteSelezionato;
        if (!canvas || !p) return;

        const ctx = canvas.getContext("2d");
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#fffafa";
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = "#ffd6d6";
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 12) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += 12) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        ctx.strokeStyle = "#f2a4a4";
        for (let x = 0; x < w; x += 60) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += 60) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        const ecgHistory = p.ecgHistory || [];
        const latestEcg = ecgHistory[ecgHistory.length - 1];
        const fc = Number(latestEcg?.fc || p.parametri?.fc || 72);
        const beatDistance = Math.max(70, Math.min(140, 6000 / (fc || 72)));
        const base = h / 2;

        function waveAt(t) {
            const beat = t % beatDistance;
            if (beat < 8) return -4 * Math.sin((beat / 8) * Math.PI);
            if (beat > 24 && beat < 30) return 18 * ((beat - 24) / 6);
            if (beat >= 30 && beat < 34) return -58 + (beat - 30) * 24;
            if (beat >= 34 && beat < 42) return 38 - (beat - 34) * 5;
            if (beat > 62 && beat < 94) return -12 * Math.sin(((beat - 62) / 32) * Math.PI);
            return Math.sin(t / 17) * 1.5;
        }

        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            const y = base + waveAt(x);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = "#111827";
        ctx.font = "14px Arial";
        const last = latestEcg;
        ctx.fillText(last ? `${last.ritmo} - FC ${last.fc} bpm` : "Nessun tracciato generato", 18, 24);
    }, 0);
}

function plainTextList(items, mapper) {
    return (items || []).map(item => typeof item === "string" ? item : mapper(item)).filter(Boolean).join("\n");
}

function dimetti() {
    let index = pazienti.findIndex(x => x.id === pazienteSelezionato?.id);
    if (index === -1 || !pazienteSelezionato) {
        alert("Paziente non valido");
        return;
    }

    let p = ensurePaziente(pazienti[index]);
    const operatore = medicoLoggato?.nome || "";
    const dimessoIl = new Date().toLocaleString();

    archivio.push({
        ...p,
        dimessoIl,
        dimessoDa: operatore
    });
    logAction("Dimesso paziente " + p.nome + " " + p.cognome);
    pazienti.splice(index, 1);
    salva();

    pazienteSelezionato = null;
    pagina = "ps";
    render();
    stampaDimissione(p, operatore, dimessoIl);
}

function stampaDimissione(p, operatore, dimessoIl) {
    const terapie = plainTextList(p.terapie, t => `${t.time || ""} - ${t.farmaco || ""} ${t.dose || ""} ${t.via || ""} ${t.frequenza || ""} ${t.note || ""}`);
    const esami = plainTextList(p.esami, e => `${e.time || ""} - ${e.nome || e.tipo || ""} - ${e.stato || ""} - ${e.esito || ""}`);
    const diario = plainTextList([...(p.visite || []), ...(p.diarioClinico || [])], d => `${d.time || ""} - ${d.tipo || "Nota"} - ${d.testo || d.diagnosi || ""}`);
    const repartoInfo = p.reparto === "chirurgia"
        ? `Diagnosi chirurgica: ${p.chirurgia?.diagnosi || ""}\nProcedura: ${p.chirurgia?.procedura || ""}\nNote: ${p.chirurgia?.noteOperatorie || ""}`
        : p.reparto === "medicinaInterna"
            ? `Diagnosi: ${p.medicinaInterna?.diagnosi || ""}\nComorbidità: ${p.medicinaInterna?.comorbidita || ""}\nPiano: ${p.medicinaInterna?.piano || ""}`
            : "";

    let win = window.open("", "_blank");
    win.document.write(`
        <html>
        <head>
            <title>Lettera di dimissione - ${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</title>
            <style>
                body { font-family: Arial, sans-serif; color: #17212f; margin: 0; padding: 28px; }
                .doc { border: 1px solid #9aa8b8; padding: 24px; }
                .head { display: flex; justify-content: space-between; border-bottom: 3px solid #173b63; padding-bottom: 14px; }
                .brand { font-size: 22px; font-weight: 800; color: #173b63; }
                .meta { text-align: right; font-size: 12px; color: #526477; }
                h1 { font-size: 20px; margin: 18px 0; text-align: center; }
                h2 { font-size: 14px; color: #173b63; border-bottom: 1px solid #cad4df; padding-bottom: 4px; }
                .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 18px; font-size: 13px; }
                .box { border: 1px solid #cad4df; min-height: 42px; padding: 9px; white-space: pre-wrap; font-size: 13px; }
                .sign { display: flex; justify-content: flex-end; margin-top: 38px; }
                .sign div { width: 280px; border-top: 1px solid #17212f; padding-top: 6px; text-align: center; }
                @media print { body { padding: 0; } .doc { border: none; } }
            </style>
        </head>
        <body>
            <div class="doc">
                <div class="head">
                    <div><div class="brand">OSPEDALE - PRONTO SOCCORSO</div><small>Lettera di dimissione / trasferimento</small></div>
                    <div class="meta">Data dimissione: ${escapeHtml(dimessoIl)}<br>Operatore: ${escapeHtml(operatore)}</div>
                </div>
                <h1>Relazione clinica di dimissione</h1>
                <h2>Dati paziente</h2>
                <div class="grid">
                    <div><b>Paziente:</b> ${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</div>
                    <div><b>Codice fiscale:</b> ${escapeHtml(p.cf || "")}</div>
                    <div><b>Codice triage:</b> ${escapeHtml(p.codice || "")}</div>
                    <div><b>Reparto:</b> ${escapeHtml(labelReparto(p.reparto))}</div>
                </div>
                <h2>Motivo di accesso</h2><div class="box">${escapeHtml(p.motivo || "")}</div>
                <h2>Decorso clinico</h2><div class="box">${escapeHtml(diario || "Non documentato")}</div>
                <h2>Parametri alla dimissione</h2><div class="box">FC: ${escapeHtml(p.parametri?.fc || "")} bpm
FR: ${escapeHtml(p.parametri?.fr || "")} /min
SpO2: ${escapeHtml(p.parametri?.sat || "")} %
PA: ${escapeHtml(p.parametri?.pa || "")}
Temp: ${escapeHtml(p.parametri?.temp || "")} °C
GCS: ${escapeHtml(p.parametri?.gcs || "")}</div>
                <h2>Esami eseguiti</h2><div class="box">${escapeHtml(esami || "Nessun esame registrato")}</div>
                <h2>Terapie somministrate / prescritte</h2><div class="box">${escapeHtml(terapie || "Nessuna terapia registrata")}</div>
                ${repartoInfo ? `<h2>Modulo reparto</h2><div class="box">${escapeHtml(repartoInfo)}</div>` : ""}
                <h2>Indicazioni finali</h2><div class="box">Controllo clinico secondo indicazione medica. Rivalutazione urgente in caso di peggioramento, febbre persistente, dolore ingravescente, dispnea, sincope o comparsa di nuovi sintomi.</div>
                <div class="sign"><div>Firma operatore<br><b>${escapeHtml(operatore)}</b></div></div>
            </div>
            <script>window.onload = () => window.print();</script>
        </body>
        </html>
    `);
    win.document.close();
}

function legacySalvaIntervento118Secondario(idInt, renderAfterSave = true) {
    let i = interventi118.find(x => x.id === idInt);
    if (!i) return;

    i.stato = fieldValue("stato118") || i.stato || "aperto";
    i.priorita = fieldValue("priorita118") || i.priorita || "verde";
    i.ambulanceId = fieldValue("ambulanceId") || i.ambulanceId || "";
    i.indirizzo = fieldValue("indirizzo118") || i.indirizzo || "";
    i.descrizione = fieldValue("descrizione118") || i.descrizione || "";
    i.mezzo = fieldValue("mezzo") || i.mezzo || "";
    i.equipaggio = fieldValue("equipaggio") || i.equipaggio || "";

    if (document.getElementById("paziente")) {
        i.paziente = {
            cognomeNome: fieldValue("paziente"),
            dataNascita: fieldValue("nascita"),
            sesso: fieldValue("sesso"),
            cf: fieldValue("cf")
        };

        i.scena = {
            luogo: fieldValue("luogo"),
            tipologia: fieldValue("tipologia"),
            dinamica: fieldValue("dinamica")
        };

        i.abcde = {
            a: fieldValue("a"),
            b: fieldValue("b"),
            c: fieldValue("c"),
            d: fieldValue("d"),
            e: fieldValue("e")
        };

        i.vitali = {
            fc: fieldValue("fc"),
            fr: fieldValue("fr"),
            spo2: fieldValue("spo2"),
            pa: fieldValue("pa")
        };

        i.trattamento = {
            ossigeno: document.getElementById("t_ossigeno")?.checked || false,
            accesso: document.getElementById("t_accesso")?.checked || false,
            monitoraggio: document.getElementById("t_monitoraggio")?.checked || false,
            immobilizzazione: document.getElementById("t_immobilizzazione")?.checked || false,
            analgesia: document.getElementById("t_analgesia")?.checked || false,
            note: fieldValue("t_note")
        };

        i.destinazione = {
            esito: fieldValue("esito"),
            ospedale: fieldValue("ospedale"),
            codice: fieldValue("codiceDest")
        };
    }

    logAction("Salvata scheda intervento 118 #" + i.numero);
    salva();
    if (renderAfterSave) render();
}

function legacyConvertiInterventoInPazienteFinale(idInt) {
    salvaIntervento118(idInt, false);
    let i = interventi118.find(x => x.id === idInt);
    if (!i) return;

    const nomeCompleto = (i.paziente?.cognomeNome || "").trim();
    const parti = nomeCompleto.split(" ").filter(Boolean);
    const cognome = parti.shift() || "Da identificare";
    const nome = parti.join(" ") || "Paziente";
    const codice = i.priorita === "rosso" ? "Rosso" : i.priorita === "giallo" ? "Arancione" : i.priorita === "verde" ? "Verde" : "Bianco";

    pazienti.push(ensurePaziente({
        id: id(),
        nome,
        cognome,
        nascita: i.paziente?.dataNascita || "",
        luogo: "",
        cf: i.paziente?.cf || "",
        motivo: i.descrizione || i.scena?.dinamica || "Trasporto 118",
        codice,
        reparto: "ps",
        parametri: {
            fc: i.vitali?.fc || "",
            fr: i.vitali?.fr || "",
            sat: i.vitali?.spo2 || "",
            pa: i.vitali?.pa || ""
        },
        parametriHistory: [],
        esami: [],
        terapie: [],
        visite: [],
        diarioClinico: [{
            id: id(),
            time: new Date().toLocaleString(),
            tipo: "Ingresso da 118",
            testo: `Paziente preso in carico da intervento 118 #${i.numero}. ${i.scena?.dinamica || ""}`,
            operatore: medicoLoggato?.nome || ""
        }]
    }));

    logAction("Creato paziente PS da intervento 118 #" + i.numero);
    salva();
    pagina = "ps";
    intervento118Selezionato = null;
    render();
}

function legacyChiudiInterventoFinale(idInt) {
    if (document.getElementById("stato118")) salvaIntervento118(idInt, false);
    let i = interventi118.find(x => x.id === idInt);
    if (!i) return;

    i.stato = "chiuso";
    i.closedAt = new Date().toLocaleString();
    i.closedBy = medicoLoggato?.nome || "Operatore";
    interventi118Archivio.push({
        ...i,
        archivedAt: new Date().toLocaleString()
    });
    interventi118 = interventi118.filter(x => x.id !== idInt);
    intervento118Selezionato = null;
    logAction("Chiuso intervento 118 #" + i.numero + " da " + i.closedBy);
    salva();
    render();
    stampaIntervento118(i.id, true);
}

function legacyStampaIntervento118Finale(idInt, archived = false) {
    const elenco = archived ? interventi118Archivio : interventi118;
    let i = elenco.find(x => x.id === idInt);
    if (!i) return;

    const operatoreChiusura = i.closedBy || medicoLoggato?.nome || "Operatore";
    let win = window.open("", "_blank");
    win.document.write(`
        <html>
        <head>
            <title>Scheda 118 #${escapeHtml(i.numero)}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #132235; }
                .doc { border: 1px solid #8fa1b5; padding: 22px; }
                .head { display: flex; justify-content: space-between; gap: 24px; border-bottom: 4px solid #b51d2a; padding-bottom: 12px; }
                .brand { color: #b51d2a; font-size: 23px; font-weight: 900; }
                .meta { text-align: right; font-size: 12px; color: #526477; }
                h1 { margin: 18px 0 10px; font-size: 20px; text-align: center; }
                h2 { margin: 16px 0 7px; font-size: 14px; color: #173b63; border-bottom: 1px solid #c9d4df; padding-bottom: 4px; }
                .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 12px; }
                .box { border: 1px solid #c9d4df; min-height: 36px; padding: 8px; white-space: pre-wrap; font-size: 12px; }
                .abcde { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
                .abcde div { border: 1px solid #c9d4df; padding: 8px; min-height: 42px; }
                .sign { display: flex; justify-content: space-between; gap: 18px; margin-top: 34px; }
                .sign div { flex: 1; border-top: 1px solid #132235; padding-top: 6px; text-align: center; font-size: 12px; }
                @media print { body { padding: 0; } .doc { border: none; } }
            </style>
        </head>
        <body>
            <div class="doc">
                <div class="head">
                    <div><div class="brand">118 - SCHEDA INTERVENTO</div><small>Verbale sanitario di soccorso extraospedaliero</small></div>
                    <div class="meta">
                        Intervento #${escapeHtml(i.numero)}<br>
                        Apertura: ${escapeHtml(i.data || "")}<br>
                        Chiusura: ${escapeHtml(i.closedAt || "")}<br>
                        Stato finale: ${escapeHtml(i.stato || "")}
                    </div>
                </div>
                <h1>Relazione intervento</h1>
                <h2>Dati missione</h2>
                <div class="grid">
                    <div><b>Priorità:</b> ${escapeHtml(i.priorita || "")}</div>
                    <div><b>Mezzo:</b> ${escapeHtml(i.mezzo || "")}</div>
                    <div><b>Ambulanza:</b> ${escapeHtml(i.ambulanceId || "")}</div>
                    <div><b>Partenza:</b> ${escapeHtml(i.dispatchedAt || "")}</div>
                    <div><b>Arrivo sul posto:</b> ${escapeHtml(i.arrivedAt || "")}</div>
                    <div><b>Equipaggio:</b> ${escapeHtml(i.equipaggio || "")}</div>
                </div>
                <h2>Paziente</h2>
                <div class="grid">
                    <div><b>Nominativo:</b> ${escapeHtml(i.paziente?.cognomeNome || "")}</div>
                    <div><b>Data nascita:</b> ${escapeHtml(i.paziente?.dataNascita || "")}</div>
                    <div><b>Sesso:</b> ${escapeHtml(i.paziente?.sesso || "")}</div>
                    <div><b>Codice fiscale:</b> ${escapeHtml(i.paziente?.cf || "")}</div>
                    <div><b>Indirizzo evento:</b> ${escapeHtml(i.indirizzo || "")}</div>
                    <div><b>Destinazione:</b> ${escapeHtml(i.destinazione?.ospedale || "")}</div>
                </div>
                <h2>Scenario e dinamica</h2>
                <div class="box">Luogo: ${escapeHtml(i.scena?.luogo || "")}
Tipologia: ${escapeHtml(i.scena?.tipologia || "")}
Descrizione: ${escapeHtml(i.descrizione || "")}
Dinamica: ${escapeHtml(i.scena?.dinamica || "")}</div>
                <h2>Valutazione ABCDE</h2>
                <div class="abcde">
                    <div><b>A</b><br>${escapeHtml(i.abcde?.a || "")}</div>
                    <div><b>B</b><br>${escapeHtml(i.abcde?.b || "")}</div>
                    <div><b>C</b><br>${escapeHtml(i.abcde?.c || "")}</div>
                    <div><b>D</b><br>${escapeHtml(i.abcde?.d || "")}</div>
                    <div><b>E</b><br>${escapeHtml(i.abcde?.e || "")}</div>
                </div>
                <h2>Parametri vitali</h2>
                <div class="grid">
                    <div><b>FC:</b> ${escapeHtml(i.vitali?.fc || "")} bpm</div>
                    <div><b>FR:</b> ${escapeHtml(i.vitali?.fr || "")} /min</div>
                    <div><b>SpO2:</b> ${escapeHtml(i.vitali?.spo2 || "")} %</div>
                    <div><b>PA:</b> ${escapeHtml(i.vitali?.pa || "")}</div>
                    <div><b>Codice rientro:</b> ${escapeHtml(i.destinazione?.codice || "")}</div>
                    <div><b>Esito:</b> ${escapeHtml(i.destinazione?.esito || "")}</div>
                </div>
                <h2>Trattamento</h2>
                <div class="box">Ossigeno: ${i.trattamento?.ossigeno ? "SI" : "NO"}
Accesso venoso: ${i.trattamento?.accesso ? "SI" : "NO"}
Monitoraggio: ${i.trattamento?.monitoraggio ? "SI" : "NO"}
Immobilizzazione: ${i.trattamento?.immobilizzazione ? "SI" : "NO"}
Analgesia: ${i.trattamento?.analgesia ? "SI" : "NO"}

Note trattamento:
${escapeHtml(i.trattamento?.note || "")}</div>
                <div class="sign">
                    <div>Operatore che chiude<br><b>${escapeHtml(operatoreChiusura)}</b></div>
                    <div>Firma equipaggio</div>
                    <div>Firma ricevente / struttura</div>
                </div>
            </div>
            <script>window.onload = () => window.print();</script>
        </body>
        </html>
    `);
    win.document.close();
}

function legacyIntervento118ViewFinale(app) {
    if (!intervento118Selezionato) {
        const stats = {
            rosso: 0,
            giallo: 0,
            verde: 0,
            bianco: 0,
            aperti: interventi118.length,
            archivio: interventi118Archivio.length
        };

        interventi118.forEach(i => {
            stats[i.priorita] = (stats[i.priorita] || 0) + 1;
        });

        app.innerHTML = `
            <div class="page-header">
                <div>
                    <p class="eyebrow">Emergenza territoriale</p>
                    <h2>🚑 Interventi 118</h2>
                </div>
                <div class="header-actions">
                    <button onclick="creaIntervento118()">Nuovo intervento</button>
                    <button onclick="pagina='ps'; render()">Torna al PS</button>
                </div>
            </div>

            <section class="stats-grid">
                <button class="stat-card triage-rosso"><span>Rossi</span><b>${stats.rosso}</b></button>
                <button class="stat-card triage-arancione"><span>Gialli</span><b>${stats.giallo}</b></button>
                <button class="stat-card triage-verde"><span>Verdi</span><b>${stats.verde}</b></button>
                <button class="stat-card triage-bianco"><span>Bianchi</span><b>${stats.bianco}</b></button>
                <button class="stat-card"><span>Archivio</span><b>${stats.archivio}</b></button>
            </section>

            <div class="tabs-row">
                <button class="${filtro118 === "attivi" ? "active" : ""}" onclick="setFiltro118('attivi')">Attivi</button>
                <button class="${filtro118 === "archivio" ? "active" : ""}" onclick="setFiltro118('archivio')">Archivio</button>
            </div>

            <section class="work-panel">
                ${filtro118 === "attivi" ? `
                    <div class="intervention-list">
                        ${[...interventi118]
                            .sort((a, b) => prioritaWeight(a.priorita) - prioritaWeight(b.priorita))
                            .map(intervento118Card)
                            .join("") || `<div class="empty-state">Nessun intervento attivo.</div>`}
                    </div>
                ` : `
                    <div class="intervention-list">
                        ${interventi118Archivio.map(i => `
                            <article class="intervention-card archived">
                                <div>
                                    <b>#${escapeHtml(i.numero)} - chiuso</b>
                                    <p>${escapeHtml(i.paziente?.cognomeNome || i.indirizzo || "Scheda archiviata")}</p>
                                    <small>Chiuso: ${escapeHtml(i.closedAt || i.archivedAt || "")}</small>
                                </div>
                                <button onclick="stampaIntervento118('${i.id}', true)">PDF</button>
                            </article>
                        `).join("") || `<div class="empty-state">Archivio vuoto.</div>`}
                    </div>
                `}
            </section>
        `;
        return;
    }

    let i = interventi118.find(x => x.id === intervento118Selezionato);
    if (!i) {
        intervento118Selezionato = null;
        render();
        return;
    }

    app.innerHTML = `
        <div class="page-header">
            <div>
                <p class="eyebrow">Scheda intervento</p>
                <h2>🚑 118 #${escapeHtml(i.numero)}</h2>
            </div>
            <div class="header-actions">
                <button onclick="salvaIntervento118('${i.id}')">Salva</button>
                <button onclick="convertiInterventoInPaziente('${i.id}')">Invia al PS</button>
                <button class="danger" onclick="chiudiIntervento('${i.id}')">Chiudi</button>
                <button onclick="intervento118Selezionato=null; render()">Indietro</button>
            </div>
        </div>

        <div class="form-grid">
            <section class="work-panel">
                <h3>Dati intervento</h3>
                <label>Stato</label>
                <select id="stato118">
                    ${["aperto", "in arrivo", "sul posto"].map(s => `<option value="${s}" ${i.stato === s ? "selected" : ""}>${s}</option>`).join("")}
                </select>
                <label>Priorita</label>
                <select id="priorita118">
                    ${["rosso", "giallo", "verde", "bianco"].map(p => `<option value="${p}" ${i.priorita === p ? "selected" : ""}>${p}</option>`).join("")}
                </select>
                <label>Ambulanza</label>
                <select id="ambulanceId">
                    <option value="">Nessuna ambulanza</option>
                    ${ambulanze.map(a => `<option value="${escapeHtml(a.id)}" ${i.ambulanceId === a.id ? "selected" : ""}>${escapeHtml(a.nome)}</option>`).join("")}
                </select>
                <label>Mezzo</label>
                <select id="mezzo">
                    ${["", "MSA", "MSB", "VLV"].map(m => `<option value="${m}" ${i.mezzo === m ? "selected" : ""}>${m || "-- Seleziona mezzo --"}</option>`).join("")}
                </select>
                <label>Indirizzo</label>
                <input id="indirizzo118" value="${escapeHtml(i.indirizzo || "")}">
                <label>Descrizione</label>
                <textarea id="descrizione118">${escapeHtml(i.descrizione || "")}</textarea>
                <label>Equipaggio</label>
                <input id="equipaggio" value="${escapeHtml(i.equipaggio || "")}">
            </section>

            <section class="work-panel">
                <h3>Paziente</h3>
                <input id="paziente" placeholder="Cognome e Nome" value="${escapeHtml(i.paziente?.cognomeNome || "")}">
                <input id="nascita" type="date" placeholder="Data nascita" value="${escapeHtml(i.paziente?.dataNascita || "")}">
                <select id="sesso">
                    ${["", "M", "F", "Altro"].map(s => `<option value="${s}" ${i.paziente?.sesso === s ? "selected" : ""}>${s || "-- Sesso --"}</option>`).join("")}
                </select>
                <input id="cf" placeholder="Codice fiscale" value="${escapeHtml(i.paziente?.cf || "")}">
            </section>

            <section class="work-panel">
                <h3>Scenario</h3>
                <select id="luogo">
                    ${["", "Strada", "Casa", "Lavoro", "Scuola", "Altro"].map(v => `<option value="${v}" ${i.scena?.luogo === v ? "selected" : ""}>${v || "-- Luogo evento --"}</option>`).join("")}
                </select>
                <select id="tipologia">
                    ${["", "Medica", "Trauma", "Incidente", "Intossicazione"].map(v => `<option value="${v}" ${i.scena?.tipologia === v ? "selected" : ""}>${v || "-- Tipologia --"}</option>`).join("")}
                </select>
                <textarea id="dinamica" placeholder="Dinamica">${escapeHtml(i.scena?.dinamica || "")}</textarea>
            </section>

            <section class="work-panel">
                <h3>ABCDE</h3>
                <select id="a">${["", "Pervie", "Ostruite"].map(v => `<option value="${v}" ${i.abcde?.a === v ? "selected" : ""}>${v || "A - Vie aeree"}</option>`).join("")}</select>
                <select id="b">${["", "Eupnoico", "Dispnoico", "Apnea"].map(v => `<option value="${v}" ${i.abcde?.b === v ? "selected" : ""}>${v || "B - Respiro"}</option>`).join("")}</select>
                <select id="c">${["", "Ritmico", "Aritmico", "Debole"].map(v => `<option value="${v}" ${i.abcde?.c === v ? "selected" : ""}>${v || "C - Circolo"}</option>`).join("")}</select>
                <select id="d">${["", "Normale", "Alterato"].map(v => `<option value="${v}" ${i.abcde?.d === v ? "selected" : ""}>${v || "D - Neurologico"}</option>`).join("")}</select>
                <select id="e">${["", "Nessuna lesione", "Lesioni presenti"].map(v => `<option value="${v}" ${i.abcde?.e === v ? "selected" : ""}>${v || "E - Esposizione"}</option>`).join("")}</select>
            </section>

            <section class="work-panel">
                <h3>Parametri vitali</h3>
                <input id="fc" type="number" placeholder="FC" value="${escapeHtml(i.vitali?.fc || "")}">
                <input id="fr" type="number" placeholder="FR" value="${escapeHtml(i.vitali?.fr || "")}">
                <input id="spo2" type="number" placeholder="SpO2" value="${escapeHtml(i.vitali?.spo2 || "")}">
                <input id="pa" placeholder="PA" value="${escapeHtml(i.vitali?.pa || "")}">
            </section>

            <section class="work-panel">
                <h3>Trattamento e destinazione</h3>
                <label class="check-row"><input type="checkbox" id="t_ossigeno" ${i.trattamento?.ossigeno ? "checked" : ""}> Ossigeno</label>
                <label class="check-row"><input type="checkbox" id="t_accesso" ${i.trattamento?.accesso ? "checked" : ""}> Accesso venoso</label>
                <label class="check-row"><input type="checkbox" id="t_monitoraggio" ${i.trattamento?.monitoraggio ? "checked" : ""}> Monitoraggio</label>
                <label class="check-row"><input type="checkbox" id="t_immobilizzazione" ${i.trattamento?.immobilizzazione ? "checked" : ""}> Immobilizzazione</label>
                <label class="check-row"><input type="checkbox" id="t_analgesia" ${i.trattamento?.analgesia ? "checked" : ""}> Analgesia</label>
                <textarea id="t_note" placeholder="Note trattamento">${escapeHtml(i.trattamento?.note || "")}</textarea>
                <select id="esito">
                    ${["", "TRASPORTATO", "DECEDUTO", "TRATTATO SUL POSTO", "RIFIUTA TRASPORTO"].map(v => `<option value="${v}" ${i.destinazione?.esito === v ? "selected" : ""}>${v || "-- Esito --"}</option>`).join("")}
                </select>
                <input id="ospedale" placeholder="Ospedale destinazione" value="${escapeHtml(i.destinazione?.ospedale || "")}">
                <select id="codiceDest">
                    ${["", "NERO", "ROSSO", "GIALLO", "VERDE", "BIANCO"].map(v => `<option value="${v}" ${i.destinazione?.codice === v ? "selected" : ""}>${v || "-- Codice rientro --"}</option>`).join("")}
                </select>
            </section>
        </div>
    `;
}

function setFiltro118(valore) {
    filtro118 = valore;
    render();
}

function legacyCambiaStatoInterventoFinale(idInt, stato) {
    let i = interventi118.find(x => x.id === idInt);
    if (!i) return;

    i.stato = stato;
    if (stato === "in arrivo" && !i.dispatchedAt) i.dispatchedAt = new Date().toLocaleString();
    if (stato === "sul posto" && !i.arrivedAt) i.arrivedAt = new Date().toLocaleString();
    logAction("Aggiornato stato intervento 118 #" + i.numero + " a " + stato);
    salva();
    render();
}

function legacySalvaIntervento118(idInt) {
    let i = interventi118.find(x => x.id === idInt);
    if (!i) return;

    i.stato = fieldValue("stato118") || "aperto";
    i.priorita = fieldValue("priorita118") || "verde";
    i.ambulanceId = fieldValue("ambulanceId");
    i.indirizzo = fieldValue("indirizzo118");
    i.descrizione = fieldValue("descrizione118");
    i.mezzo = fieldValue("mezzo");
    i.equipaggio = fieldValue("equipaggio");

    i.paziente = {
        cognomeNome: fieldValue("paziente"),
        dataNascita: fieldValue("nascita"),
        sesso: fieldValue("sesso"),
        cf: fieldValue("cf")
    };

    i.scena = {
        luogo: fieldValue("luogo"),
        tipologia: fieldValue("tipologia"),
        dinamica: fieldValue("dinamica")
    };

    i.abcde = {
        a: fieldValue("a"),
        b: fieldValue("b"),
        c: fieldValue("c"),
        d: fieldValue("d"),
        e: fieldValue("e")
    };

    i.vitali = {
        fc: fieldValue("fc"),
        fr: fieldValue("fr"),
        spo2: fieldValue("spo2"),
        pa: fieldValue("pa")
    };

    i.trattamento = {
        ossigeno: document.getElementById("t_ossigeno")?.checked || false,
        accesso: document.getElementById("t_accesso")?.checked || false,
        monitoraggio: document.getElementById("t_monitoraggio")?.checked || false,
        immobilizzazione: document.getElementById("t_immobilizzazione")?.checked || false,
        analgesia: document.getElementById("t_analgesia")?.checked || false,
        note: fieldValue("t_note")
    };

    i.destinazione = {
        esito: fieldValue("esito"),
        ospedale: fieldValue("ospedale"),
        codice: fieldValue("codiceDest")
    };

    logAction("Salvata scheda intervento 118 #" + i.numero);
    salva();
    render();
}

function legacyConvertiInterventoInPaziente(idInt) {
    salvaIntervento118(idInt);
    let i = interventi118.find(x => x.id === idInt);
    if (!i) return;

    const nomeCompleto = (i.paziente?.cognomeNome || "").trim();
    const parti = nomeCompleto.split(" ").filter(Boolean);
    const cognome = parti.shift() || "Da identificare";
    const nome = parti.join(" ") || "Paziente";
    const codice = i.priorita === "rosso" ? "Rosso" : i.priorita === "giallo" ? "Arancione" : i.priorita === "verde" ? "Verde" : "Bianco";

    pazienti.push(ensurePaziente({
        id: id(),
        nome,
        cognome,
        nascita: i.paziente?.dataNascita || "",
        luogo: "",
        cf: i.paziente?.cf || "",
        motivo: i.descrizione || i.scena?.dinamica || "Trasporto 118",
        codice,
        reparto: "ps",
        parametri: {
            fc: i.vitali?.fc || "",
            fr: i.vitali?.fr || "",
            sat: i.vitali?.spo2 || "",
            pa: i.vitali?.pa || ""
        },
        parametriHistory: [],
        esami: [],
        terapie: [],
        visite: [`Ingresso da intervento 118 #${i.numero}`]
    }));

    logAction("Creato paziente PS da intervento 118 #" + i.numero);
    salva();
    pagina = "ps";
    intervento118Selezionato = null;
    render();
}

function legacyChiudiIntervento(idInt) {
    let i = interventi118.find(x => x.id === idInt);
    if (!i) return;

    i.stato = "chiuso";
    i.closedAt = new Date().toLocaleString();
    interventi118Archivio.push({
        ...i,
        archivedAt: new Date().toLocaleString()
    });
    interventi118 = interventi118.filter(x => x.id !== idInt);
    intervento118Selezionato = null;
    logAction("Chiuso intervento 118 #" + i.numero);
    salva();
    render();
    stampaIntervento118(i.id, true);
}

function legacyStampaIntervento118(idInt, archived = false) {
    const elenco = archived ? interventi118Archivio : interventi118;
    let i = elenco.find(x => x.id === idInt);
    if (!i) return;

    let win = window.open("", "_blank");
    win.document.write(`
        <html>
        <head>
            <title>Intervento 118 #${escapeHtml(i.numero)}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 30px; color: #1a1a1a; }
                h1 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
                .box { border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; white-space: pre-wrap; }
                .section { margin-bottom: 15px; }
                .label { font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>SCHEDA INTERVENTO 118</h1>
            <p><b>Numero intervento:</b> #${escapeHtml(i.numero)}</p>
            <p><b>Data apertura:</b> ${escapeHtml(i.data)}</p>
            <p><b>Chiusura:</b> ${escapeHtml(i.closedAt || "")}</p>
            <div class="section"><span class="label">Mezzo:</span> ${escapeHtml(i.mezzo || "")}</div>
            <div class="section"><span class="label">Ambulanza:</span> ${escapeHtml(i.ambulanceId || "")}</div>
            <div class="section"><span class="label">Equipaggio:</span><div class="box">${escapeHtml(i.equipaggio || "")}</div></div>
            <div class="section"><span class="label">Paziente:</span><div class="box">${escapeHtml(i.paziente?.cognomeNome || "")}</div></div>
            <div class="section"><span class="label">Scenario:</span><div class="box">Luogo: ${escapeHtml(i.scena?.luogo || "")}
Tipologia: ${escapeHtml(i.scena?.tipologia || "")}
Dinamica: ${escapeHtml(i.scena?.dinamica || "")}</div></div>
            <div class="section"><span class="label">ABCDE:</span><div class="box">A: ${escapeHtml(i.abcde?.a || "")}
B: ${escapeHtml(i.abcde?.b || "")}
C: ${escapeHtml(i.abcde?.c || "")}
D: ${escapeHtml(i.abcde?.d || "")}
E: ${escapeHtml(i.abcde?.e || "")}</div></div>
            <div class="section"><span class="label">Parametri vitali:</span><div class="box">FC: ${escapeHtml(i.vitali?.fc || "")}
FR: ${escapeHtml(i.vitali?.fr || "")}
SpO2: ${escapeHtml(i.vitali?.spo2 || "")}
PA: ${escapeHtml(i.vitali?.pa || "")}</div></div>
            <div class="section"><span class="label">Trattamento:</span><div class="box">Ossigeno: ${i.trattamento?.ossigeno ? "SI" : "NO"}
Accesso venoso: ${i.trattamento?.accesso ? "SI" : "NO"}
Monitoraggio: ${i.trattamento?.monitoraggio ? "SI" : "NO"}
Immobilizzazione: ${i.trattamento?.immobilizzazione ? "SI" : "NO"}
Analgesia: ${i.trattamento?.analgesia ? "SI" : "NO"}

Note:
${escapeHtml(i.trattamento?.note || "")}</div></div>
            <div class="section"><span class="label">Esito:</span> ${escapeHtml(i.destinazione?.esito || "")}</div>
            <div class="section"><span class="label">Ospedale:</span> ${escapeHtml(i.destinazione?.ospedale || "")}</div>
            <div class="section"><span class="label">Codice rientro:</span> ${escapeHtml(i.destinazione?.codice || "")}</div>
            <script>window.onload = () => window.print();</script>
        </body>
        </html>
    `);
    win.document.close();
}

/* =======================
   CHIRURGIA VIEW
======================= */
function chirurgiaView(app) {

    let pazientiChirurgia = pazienti || [];

    let html = `
        <h2>Chirurgia</h2>
        <button onclick="pagina='ps'; render()">Torna al PS</button>

        <div style="margin-top:10px;">
    `;

    pazientiChirurgia.forEach(p => {
        html += `
            <div style="border:1px solid #ddd; padding:8px; margin:6px;">
                <b>${p.nome} ${p.cognome}</b><br>
                Codice: ${p.codice || ""}
            </div>
        `;
    });

    html += `</div>`;

    app.innerHTML = html;
}

/* =======================
   MEDICINA INTERNA VIEW
======================= */
function medicinaInternaView(app) {

    let pazientiMI = pazienti || [];

    let html = `
        <h2>Medicina Interna</h2>
        <button onclick="pagina='ps'; render()">Torna al PS</button>

        <div style="margin-top:10px;">
    `;

    pazientiMI.forEach(p => {
        html += `
            <div style="border:1px solid #ddd; padding:8px; margin:6px;">
                <b>${p.nome} ${p.cognome}</b><br>
                Codice: ${p.codice || ""}
            </div>
        `;
    });

    html += `</div>`;

    app.innerHTML = html;
}

function repartoView(app, reparto, titolo) {
    const pazientiReparto = pazienti.filter(p => ensurePaziente(p).reparto === reparto);

    app.innerHTML = `
        <div class="page-header">
            <div>
                <p class="eyebrow">Reparto</p>
                <h2>${titolo}</h2>
            </div>
            <div class="header-actions">
                <button onclick="pagina='ps'; render()">Torna al PS</button>
            </div>
        </div>

        <section class="work-panel">
            <div class="patient-list">
                ${pazientiReparto.length ? pazientiReparto.map(p => `
                    <article class="paziente ${triageClass(p.codice)}">
                        <div class="patient-main">
                            <span class="triage-badge ${triageClass(p.codice)}">${escapeHtml(p.codice)}</span>
                            <div>
                                <h4>${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</h4>
                                <p>${escapeHtml(p.motivo || "Motivo non indicato")}</p>
                                <small>${escapeHtml(p.cf || "Codice fiscale non indicato")}</small>
                            </div>
                        </div>
                        <div class="patient-actions">
                            <button onclick="apri('${p.id}')">Apri cartella</button>
                            <button onclick="spostaPaziente('${p.id}', 'ps')">Rimanda al PS</button>
                        </div>
                    </article>
                `).join("") : `<div class="empty-state">Nessun paziente assegnato a questo reparto.</div>`}
            </div>
        </section>
    `;
}

function chirurgiaView(app) {
    repartoView(app, "chirurgia", "Chirurgia");
}

function medicinaInternaView(app) {
    repartoView(app, "medicinaInterna", "Medicina Interna");
}

function spostaPaziente(idP, reparto) {
    let p = pazienti.find(x => x.id === idP);
    if (!p) return;

    p.reparto = reparto;
    pazienteSelezionato = p;
    logAction("Spostato paziente " + p.nome + " " + p.cognome + " in " + labelReparto(reparto));
    salva();
    render();
}

function archivioView(app) {

    if (medicoLoggato?.ruolo !== "admin") {
        alert("Accesso negato");
        pagina = "ps";
        render();
        return;
    }

    app.innerHTML = `
        <div class="page-header">
            <div>
                <p class="eyebrow">Storico clinico</p>
                <h2>Archivio Pazienti Dimessi</h2>
            </div>
            <div class="header-actions">
                <button onclick="pagina='ps'; render()">Indietro</button>
            </div>
        </div>

        <section class="work-panel">
            <div class="patient-list">
                ${archivio.length ? archivio.map(p => `
                    <article class="paziente ${triageClass(p.codice)}">
                        <div class="patient-main">
                            <span class="triage-badge ${triageClass(p.codice)}">${escapeHtml(p.codice || "n/d")}</span>
                            <div>
                                <h4>${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</h4>
                                <p>${escapeHtml(p.motivo || "Motivo non indicato")}</p>
                                <small>Dimesso il: ${escapeHtml(p.dimessoIl || "")} - Da: ${escapeHtml(p.dimessoDa || "")}</small>
                            </div>
                        </div>
                    </article>
                `).join("") : `<div class="empty-state">Archivio vuoto.</div>`}
            </div>
        </section>
    `;
}

function personaleView(app) {

    if (medicoLoggato?.ruolo !== "admin") {
        alert("Accesso negato");
        pagina = "ps";
        render();
        return;
    }

    app.innerHTML = `
        <div class="page-header">
            <div>
                <p class="eyebrow">Amministrazione</p>
                <h2>Gestione Personale</h2>
            </div>
            <div class="header-actions">
                <button onclick="pagina='ps'; render()">Indietro</button>
            </div>
        </div>

        <div class="form-grid">
            <section class="work-panel">
                <h3>Aggiungi personale</h3>
                <input id="nuovoUser" placeholder="username">
                <input id="nuovoPass" type="password" placeholder="password">
                <input id="nuovoNome" placeholder="nome">
                <select id="nuovoRuolo">
                    <option value="infermiere">Infermiere</option>
                    <option value="medico">Medico</option>
                    <option value="admin">Amministratore</option>
                </select>
                <button onclick="aggiungiPersonale()">Aggiungi</button>
            </section>

            <section class="work-panel">
                <div class="panel-title-row">
                    <h3>Staff attivo</h3>
                    <span class="mini-count">${personale.length}</span>
                </div>
                <div class="operator-list">
                    ${personale.map(p => `
                        <div class="operator-card">
                            <b>${escapeHtml(p.nome)}</b>
                            <small>${escapeHtml(p.ruolo)} - username: ${escapeHtml(p.username)}</small>
                            <button class="danger" onclick="eliminaPersonale('${escapeHtml(p.username)}')">Revoca accesso</button>
                        </div>
                    `).join("") || `<div class="empty-state">Nessun operatore aggiunto.</div>`}
                </div>
            </section>
        </div>

        <section class="work-panel">
            <div class="panel-title-row">
                <h3>Log azioni</h3>
                <span class="mini-count">${logAzioni.length}</span>
            </div>
            <div class="log-list">
                ${(logAzioni || []).map(l =>
                    `<div>${escapeHtml(`[${l.time}] ${l.user} (${l.ruolo}) -> ${l.azione}`)}</div>`
                ).join("") || `<div class="empty-state">Nessun log disponibile.</div>`}
            </div>
        </section>
    `;
}

/* =======================
   OVERRIDE FINALI REPARTI ATTIVI
======================= */

function repartoSpecificoHTML(p) {
    p = ensurePaziente(p);

    if (p.reparto === "chirurgia") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row"><h3>Modulo Chirurgia</h3><button onclick="salvaModuloReparto()">Salva modulo</button></div>
                <div class="form-grid compact">
                    <label>Diagnosi chirurgica<input id="chirDiagnosi" value="${escapeHtml(p.chirurgia.diagnosi || "")}"></label>
                    <label>Procedura prevista<input id="chirProcedura" value="${escapeHtml(p.chirurgia.procedura || "")}"></label>
                    <label>Rischio anestesiologico<input id="chirRischio" value="${escapeHtml(p.chirurgia.rischioAnestesiologico || "")}"></label>
                    <label>Digiuno<input id="chirDigiuno" value="${escapeHtml(p.chirurgia.digiuno || "")}"></label>
                    <label>Profilassi<input id="chirProfilassi" value="${escapeHtml(p.chirurgia.profilassi || "")}"></label>
                    <label class="check-row"><input id="chirConsenso" type="checkbox" ${p.chirurgia.consenso ? "checked" : ""}> Consenso informato acquisito</label>
                </div>
                <textarea id="chirNote" placeholder="Note pre/post operatorie">${escapeHtml(p.chirurgia.noteOperatorie || "")}</textarea>
            </section>
        `;
    }

    if (p.reparto === "medicinaInterna") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row"><h3>Modulo Medicina Interna</h3><button onclick="salvaModuloReparto()">Salva modulo</button></div>
                <div class="form-grid compact">
                    <label>Anamnesi<input id="miAnamnesi" value="${escapeHtml(p.medicinaInterna.anamnesi || "")}"></label>
                    <label>Diagnosi / problema attivo<input id="miDiagnosi" value="${escapeHtml(p.medicinaInterna.diagnosi || "")}"></label>
                    <label>Comorbidità<input id="miComorbidita" value="${escapeHtml(p.medicinaInterna.comorbidita || "")}"></label>
                    <label>Terapia cronica<input id="miTerapiaCronica" value="${escapeHtml(p.medicinaInterna.terapiaCronica || "")}"></label>
                </div>
                <textarea id="miPiano" placeholder="Piano diagnostico-terapeutico">${escapeHtml(p.medicinaInterna.piano || "")}</textarea>
            </section>
        `;
    }

    if (p.reparto === "ortopedia") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row"><h3>Modulo Ortopedia</h3><button onclick="salvaModuloReparto()">Salva modulo</button></div>
                <div class="form-grid compact">
                    <label>Distretto lesionato<input id="ortoDistretto" value="${escapeHtml(p.ortopedia.distretto || "")}"></label>
                    <label>Dinamica trauma<input id="ortoTrauma" value="${escapeHtml(p.ortopedia.trauma || "")}"></label>
                    <label>Frattura / lesione<input id="ortoFrattura" value="${escapeHtml(p.ortopedia.frattura || "")}"></label>
                    <label>Immobilizzazione<input id="ortoImmobilizzazione" value="${escapeHtml(p.ortopedia.immobilizzazione || "")}"></label>
                    <label>Carico<input id="ortoCarico" value="${escapeHtml(p.ortopedia.carico || "")}"></label>
                    <label>Follow-up<input id="ortoFollowUp" value="${escapeHtml(p.ortopedia.followUp || "")}"></label>
                </div>
                <textarea id="ortoIndicazione" placeholder="Indicazione: dimissione, gesso/tutore, riduzione, sala operatoria, ricovero">${escapeHtml(p.ortopedia.indicazione || "")}</textarea>
            </section>
        `;
    }

    if (p.reparto === "cardiologia") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row"><h3>Modulo Cardiologia / UTIC</h3><button onclick="salvaModuloReparto()">Salva modulo</button></div>
                <div class="form-grid compact">
                    <label>Dolore toracico<input id="cardioDolore" value="${escapeHtml(p.cardiologia.doloreToracico || "")}"></label>
                    <label>ECG<input id="cardioEcg" value="${escapeHtml(p.cardiologia.ecg || "")}"></label>
                    <label>Troponine seriali<input id="cardioTroponine" value="${escapeHtml(p.cardiologia.troponine || "")}"></label>
                    <label>Ritmo / aritmie<input id="cardioRitmo" value="${escapeHtml(p.cardiologia.ritmo || "")}"></label>
                    <label>Classe rischio<input id="cardioRischio" value="${escapeHtml(p.cardiologia.rischio || "")}"></label>
                    <label>Terapia acuta<input id="cardioTerapia" value="${escapeHtml(p.cardiologia.terapia || "")}"></label>
                </div>
                <textarea id="cardioPiano" placeholder="Piano: osservazione, coronarografia, UTIC, dimissione protetta">${escapeHtml(p.cardiologia.piano || "")}</textarea>
            </section>
        `;
    }

    if (p.reparto === "neurologia") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row"><h3>Modulo Neurologia / Stroke Unit</h3><button onclick="salvaModuloReparto()">Salva modulo</button></div>
                <div class="form-grid compact">
                    <label>Deficit neurologico<input id="neuroDeficit" value="${escapeHtml(p.neurologia.deficit || "")}"></label>
                    <label>NIHSS<input id="neuroNihss" type="number" min="0" value="${escapeHtml(p.neurologia.nihss || "")}"></label>
                    <label>Ora esordio / last seen well<input id="neuroOnset" value="${escapeHtml(p.neurologia.onset || "")}"></label>
                    <label>TAC / angio-TAC<input id="neuroTac" value="${escapeHtml(p.neurologia.tac || "")}"></label>
                    <label class="check-row"><input id="neuroTrombolisi" type="checkbox" ${p.neurologia.trombolisi ? "checked" : ""}> Trombolisi indicata/eseguita</label>
                    <label class="check-row"><input id="neuroTrombectomia" type="checkbox" ${p.neurologia.trombectomia ? "checked" : ""}> Trombectomia valutata</label>
                </div>
                <textarea id="neuroPiano" placeholder="Piano neurologico, monitoraggio, antiaggregazione/anticoagulazione, ricovero">${escapeHtml(p.neurologia.piano || "")}</textarea>
            </section>
        `;
    }

    if (p.reparto === "rianimazione") {
        return `
            <section class="work-panel span-2">
                <div class="panel-title-row"><h3>Modulo Rianimazione / Terapia Intensiva</h3><button onclick="salvaModuloReparto()">Salva modulo</button></div>
                <div class="form-grid compact">
                    <label>Via aerea<input id="riaViaAerea" value="${escapeHtml(p.rianimazione.viaAerea || "")}"></label>
                    <label>Ventilazione<input id="riaVentilazione" value="${escapeHtml(p.rianimazione.ventilazione || "")}"></label>
                    <label>Accessi venosi / arteriosi<input id="riaAccessi" value="${escapeHtml(p.rianimazione.accessi || "")}"></label>
                    <label>Sedazione / analgesia<input id="riaSedazione" value="${escapeHtml(p.rianimazione.sedazione || "")}"></label>
                    <label>Vasopressori<input id="riaVasopressori" value="${escapeHtml(p.rianimazione.vasopressori || "")}"></label>
                    <label>Monitoraggio<input id="riaMonitoraggio" value="${escapeHtml(p.rianimazione.monitoraggio || "")}"></label>
                </div>
                <textarea id="riaPiano" placeholder="Piano intensivo, target emodinamici/respiratori, rivalutazione">${escapeHtml(p.rianimazione.piano || "")}</textarea>
            </section>
        `;
    }

    return "";
}

function salvaModuloReparto() {
    let p = pazienteSelezionato;
    if (!p) return;
    p = ensurePaziente(p);

    if (p.reparto === "chirurgia") {
        p.chirurgia = {
            diagnosi: fieldValue("chirDiagnosi"),
            procedura: fieldValue("chirProcedura"),
            rischioAnestesiologico: fieldValue("chirRischio"),
            consenso: document.getElementById("chirConsenso")?.checked || false,
            digiuno: fieldValue("chirDigiuno"),
            profilassi: fieldValue("chirProfilassi"),
            noteOperatorie: fieldValue("chirNote")
        };
    }
    if (p.reparto === "medicinaInterna") {
        p.medicinaInterna = {
            anamnesi: fieldValue("miAnamnesi"),
            diagnosi: fieldValue("miDiagnosi"),
            comorbidita: fieldValue("miComorbidita"),
            terapiaCronica: fieldValue("miTerapiaCronica"),
            piano: fieldValue("miPiano")
        };
    }
    if (p.reparto === "ortopedia") {
        p.ortopedia = {
            distretto: fieldValue("ortoDistretto"),
            trauma: fieldValue("ortoTrauma"),
            frattura: fieldValue("ortoFrattura"),
            immobilizzazione: fieldValue("ortoImmobilizzazione"),
            carico: fieldValue("ortoCarico"),
            followUp: fieldValue("ortoFollowUp"),
            indicazione: fieldValue("ortoIndicazione")
        };
    }
    if (p.reparto === "cardiologia") {
        p.cardiologia = {
            doloreToracico: fieldValue("cardioDolore"),
            ecg: fieldValue("cardioEcg"),
            troponine: fieldValue("cardioTroponine"),
            ritmo: fieldValue("cardioRitmo"),
            rischio: fieldValue("cardioRischio"),
            terapia: fieldValue("cardioTerapia"),
            piano: fieldValue("cardioPiano")
        };
    }
    if (p.reparto === "neurologia") {
        p.neurologia = {
            deficit: fieldValue("neuroDeficit"),
            nihss: fieldValue("neuroNihss"),
            onset: fieldValue("neuroOnset"),
            tac: fieldValue("neuroTac"),
            trombolisi: document.getElementById("neuroTrombolisi")?.checked || false,
            trombectomia: document.getElementById("neuroTrombectomia")?.checked || false,
            piano: fieldValue("neuroPiano")
        };
    }
    if (p.reparto === "rianimazione") {
        p.rianimazione = {
            viaAerea: fieldValue("riaViaAerea"),
            ventilazione: fieldValue("riaVentilazione"),
            accessi: fieldValue("riaAccessi"),
            sedazione: fieldValue("riaSedazione"),
            vasopressori: fieldValue("riaVasopressori"),
            monitoraggio: fieldValue("riaMonitoraggio"),
            piano: fieldValue("riaPiano")
        };
    }

    logAction("Aggiornato modulo " + labelReparto(p.reparto) + " per " + p.nome + " " + p.cognome);
    salva();
    render();
}

function repartoView(app, reparto, titolo) {
    const meta = repartoMeta(reparto);
    const pazientiReparto = pazienti.filter(p => ensurePaziente(p).reparto === reparto);
    const critici = pazientiReparto.filter(p => ["Rosso", "Arancione"].includes(p.codice)).length;
    const referti = pazientiReparto.reduce((tot, p) => tot + refertiPendenti(p), 0);

    app.innerHTML = `
        <div class="page-header">
            <div>
                <p class="eyebrow">Reparto</p>
                <h2>${escapeHtml(titolo || meta.icon + " " + meta.label)}</h2>
            </div>
            <div class="header-actions">
                <span class="mini-count">${pazientiReparto.length} pazienti</span>
                <button onclick="pagina='ps'; render()">Torna al PS</button>
            </div>
        </div>

        <section class="clinical-summary">
            <div><b>Pazienti</b><span>${pazientiReparto.length}</span></div>
            <div><b>Alta priorita</b><span>${critici}</span></div>
            <div><b>Referti in attesa</b><span>${referti}</span></div>
            <div><b>Funzione</b><span>${escapeHtml(descrizioneReparto(reparto))}</span></div>
        </section>

        <section class="work-panel">
            <div class="patient-list">
                ${pazientiReparto.length ? pazientiReparto.map(p => `
                    <article class="paziente ${triageClass(p.codice)}">
                        <div class="patient-main">
                            <span class="triage-badge ${triageClass(p.codice)}">${escapeHtml(p.codice)}</span>
                            <div>
                                <h4>${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</h4>
                                <p>${escapeHtml(p.motivo || "Motivo non indicato")}</p>
                                <small>${escapeHtml(repartoSintesi(p))}</small>
                            </div>
                        </div>
                        <div class="patient-actions">
                            <button onclick="apri('${p.id}')">Apri cartella</button>
                            <button onclick="spostaPaziente('${p.id}', 'ps')">Rimanda al PS</button>
                        </div>
                    </article>
                `).join("") : `<div class="empty-state">Nessun paziente assegnato a questo reparto.</div>`}
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

const renderBaseUltimoDedalus = render;
render = function() {
    renderBaseUltimoDedalus();
    setTimeout(applicaPuliziaInterfaccia, 0);
};

if (typeof ICONS !== "undefined") {
    ICONS.skull = "assets/icons/skull.png";
    ICONS.heart = "assets/icons/heart.png";
    ICONS.brain = "assets/icons/brain.png";
}

[
    { categoria: "RX", nome: "RX clavicola", tempo: [60, 120] },
    { categoria: "RX", nome: "RX coste", tempo: [60, 120] },
    { categoria: "RX", nome: "RX anca", tempo: [60, 120] },
    { categoria: "RX", nome: "RX tibia e perone", tempo: [60, 120] },
    { categoria: "RX", nome: "RX calcagno", tempo: [60, 120] },
    { categoria: "TAC", nome: "TAC encefalo con contrasto", tempo: [60, 120] },
    { categoria: "TAC", nome: "TAC collo", tempo: [60, 120] },
    { categoria: "TAC", nome: "TAC arti inferiori", tempo: [60, 120] },
    { categoria: "TAC", nome: "TAC arti superiori", tempo: [60, 120] },
    { categoria: "Ematochimici", nome: "Troponina I ad alta sensibilita", tempo: [60, 120] },
    { categoria: "Ematochimici", nome: "Beta-hCG", tempo: [60, 120] },
    { categoria: "Ematochimici", nome: "Amilasi e lipasi", tempo: [60, 120] },
    { categoria: "Ematochimici", nome: "Lattati", tempo: [60, 90] }
].forEach(esame => {
    if (!ESAMI_CATALOGO.some(e => e.nome === esame.nome)) ESAMI_CATALOGO.push(esame);
});

const REPARTI_LETTI = {
    chirurgia: { nome: "Chirurgia", letti: 12 },
    medicinaInterna: { nome: "Medicina Interna", letti: 18 },
    ortopedia: { nome: "Ortopedia", letti: 10 },
    cardiologia: { nome: "Cardiologia", letti: 8 },
    neurologia: { nome: "Neurologia", letti: 8 },
    rianimazione: { nome: "Rianimazione", letti: 6 }
};
var repartoRicoveroSelezionato = repartoRicoveroSelezionato || "medicinaInterna";

function labelReparto(reparto) {
    return REPARTI_LETTI[reparto]?.nome || (reparto === "ps" ? "Pronto Soccorso" : "Pronto Soccorso");
}

function repartoIcon(reparto) {
    const map = {
        chirurgia: "caduceus",
        medicinaInterna: "doctorMale",
        ortopedia: "skull",
        cardiologia: "heart",
        neurologia: "brain",
        rianimazione: "ivBag",
        ps: "caduceus"
    };
    return typeof iconImg === "function" ? iconImg(map[reparto] || "caduceus", labelReparto(reparto)) : "";
}

function lettoKey(reparto, numero) {
    return `${reparto}-${numero}`;
}

function pazienteInLetto(reparto, numero) {
    const key = lettoKey(reparto, numero);
    return pazienti.find(p => ensurePaziente(p).letto?.key === key);
}

function ricoveriView(app) {
    const reparti = Object.entries(REPARTI_LETTI);
    if (!REPARTI_LETTI[repartoRicoveroSelezionato]) repartoRicoveroSelezionato = reparti[0]?.[0] || "medicinaInterna";
    const repartoCorrente = REPARTI_LETTI[repartoRicoveroSelezionato];
    const pazientiInReparto = pazienti.filter(p => ensurePaziente(p).reparto === repartoRicoveroSelezionato && p.letto);
    const postiOccupati = pazientiInReparto.length;
    const postiLiberi = Math.max(0, repartoCorrente.letti - postiOccupati);

    app.innerHTML = `
        <div class="page-header dedalus-record-head">
            <div class="patient-identity">
                ${iconImg("caduceus", "Ricoveri")}
                <div>
                    <p class="eyebrow">Gestione degenze</p>
                    <h2>Ricoveri e posti letto</h2>
                    <span>Assegna il paziente al reparto e al letto disponibile.</span>
                </div>
            </div>
            <div class="header-actions">
                <button onclick="pagina='ps'; render()">Torna alla lista</button>
            </div>
        </div>

        <section class="dedalus-panel admission-overview">
            <div class="dedalus-panel-head">
                <div>
                    <p class="eyebrow">Quadro letti</p>
                    <h3>${escapeHtml(repartoCorrente.nome)}</h3>
                </div>
                <div class="bed-kpis">
                    <span><b>${postiOccupati}</b> occupati</span>
                    <span><b>${postiLiberi}</b> liberi</span>
                    <span><b>${repartoCorrente.letti}</b> totali</span>
                </div>
            </div>
            <div class="ward-tabs">
                ${reparti.map(([key, r]) => {
                    const occupati = pazienti.filter(p => ensurePaziente(p).reparto === key && p.letto).length;
                    return `<button class="${key === repartoRicoveroSelezionato ? "active" : ""}" onclick="setRepartoRicovero('${key}')">${repartoIcon(key)}<span>${escapeHtml(r.nome)}</span><small>${occupati}/${r.letti}</small></button>`;
                }).join("")}
            </div>
        </section>

        <section class="admission-toolbar">
            <select id="ricoveroPaziente">
                ${pazienti.length ? pazienti.map(p => `<option value="${p.id}">${escapeHtml(p.nome)} ${escapeHtml(p.cognome)} - ${escapeHtml(p.codice || "")}${p.letto ? " - " + escapeHtml(p.letto.label) : " - in PS"}</option>`).join("") : `<option value="">Nessun paziente attivo</option>`}
            </select>
            <input id="ricoveroNote" placeholder="Motivo ricovero / note reparto">
            <button onclick="pagina='nuovo'; render()">Nuovo paziente</button>
        </section>

        <div class="bed-board">
            <section class="ward-board">
                <div class="ward-board-head">
                    ${repartoIcon(repartoRicoveroSelezionato)}
                    <div>
                        <h3>${escapeHtml(repartoCorrente.nome)}</h3>
                        <span>Click su un letto libero per ricoverare il paziente selezionato.</span>
                    </div>
                </div>
                <div class="bed-grid">
                    ${Array.from({ length: repartoCorrente.letti }, (_, idx) => {
                        const numero = idx + 1;
                        const occupante = pazienteInLetto(repartoRicoveroSelezionato, numero);
                        return `
                            <button class="bed-card ${occupante ? "occupied" : "free"}" onclick="assegnaLetto('${repartoRicoveroSelezionato}', ${numero})">
                                <b>${numero.toString().padStart(2, "0")}</b>
                                <span>${occupante ? `${escapeHtml(occupante.nome)} ${escapeHtml(occupante.cognome)}` : "Libero"}</span>
                                ${occupante ? `<small class="triage-mini ${triageClass(occupante.codice)}">${escapeHtml(occupante.codice)}</small>` : `<small>Disponibile</small>`}
                            </button>
                        `;
                    }).join("")}
                </div>
            </section>
            <aside class="ward-board ward-list">
                <div class="ward-board-head">
                    ${repartoIcon(repartoRicoveroSelezionato)}
                    <div>
                        <h3>Pazienti ricoverati</h3>
                        <span>${escapeHtml(repartoCorrente.nome)}</span>
                    </div>
                </div>
                ${pazientiInReparto.length ? `
                    <table class="clinical-table">
                        <thead><tr><th>Letto</th><th>Paziente</th><th>Codice</th><th>Ingresso</th></tr></thead>
                        <tbody>
                            ${pazientiInReparto.sort((a, b) => a.letto.numero - b.letto.numero).map(p => `
                                <tr>
                                    <td>${escapeHtml(p.letto?.numero || "")}</td>
                                    <td><b>${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</b><small>${escapeHtml(p.letto?.note || "")}</small></td>
                                    <td><span class="triage-mini ${triageClass(p.codice)}">${escapeHtml(p.codice || "")}</span></td>
                                    <td>${escapeHtml(p.letto?.assegnatoIl || "")}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                ` : `<div class="empty-state">Nessun paziente ricoverato in questo reparto.</div>`}
            </aside>
        </div>
    `;
}

function assegnaLetto(reparto, numero) {
    const idP = fieldValue("ricoveroPaziente");
    const p = pazienti.find(x => x.id === idP);
    if (!p) return;

    const occupante = pazienteInLetto(reparto, numero);
    if (occupante && occupante.id !== p.id) {
        alert("Letto gia occupato. Scegli un letto libero.");
        return;
    }

    p.reparto = reparto;
    p.letto = {
        key: lettoKey(reparto, numero),
        reparto,
        numero,
        label: `${labelReparto(reparto)} ${numero}`,
        assegnatoIl: new Date().toLocaleString(),
        note: fieldValue("ricoveroNote")
    };
    logAction("Assegnato " + p.nome + " " + p.cognome + " al letto " + p.letto.label);
    salva();
    render();
}

function setRepartoRicovero(reparto) {
    if (!REPARTI_LETTI[reparto]) return;
    repartoRicoveroSelezionato = reparto;
    render();
}

const DIAGNOSTIC_ASSETS = {
    ecgFlutter: "assets/diagnostics/ecg-atlas-flutter.png",
    ecgWpw: "assets/diagnostics/ecg-atlas-wpw.png",
    rxTorace: "assets/diagnostics/rx-torace.png",
    rxAddome: "assets/diagnostics/rx-addome.png",
    tcCranio: "assets/diagnostics/tc-cranio.png",
    rmEncefalo: "assets/diagnostics/rm-encefalo.png",
    tcTorace: "assets/diagnostics/tc-torace.png",
    tcAddomePelvi: "assets/diagnostics/tc-addome-pelvi.png"
};
const REFERTI_VERSIONE = "handbook-2026-07-01";

function nomeEsameReferto(e) {
    return e.nome || e.tipo || "Esame";
}

function bloccoAnagraficaReferto(p, e, labelTempo = "Data/Ora esame") {
    return `Paziente: ${p.nome} ${p.cognome}
Data di nascita: ${p.nascita || "non indicata"}
Codice triage: ${p.codice || "non indicato"}
${labelTempo}: ${e.time || ""}
Data/Ora referto: ${e.refertatoIl || ""}`;
}

function righeLaboratorio(e) {
    const nome = nomeEsameReferto(e).toLowerCase();
    if (nome.includes("troponina")) {
        return {
            titolo: "TROPONINA I AD ALTA SENSIBILITA (hs-cTnI)",
            metodo: "Chemiluminescenza (CLIA)",
            righe: [
                ["hs-cTnI", "7,4", "ng/L", "Uomini < 34,2 - Donne < 15,6"]
            ],
            interpretazione: "Valore nei limiti di riferimento. In assenza di incremento significativo nei dosaggi seriati e in correlazione con il quadro clinico, il risultato non e indicativo di danno miocardico acuto."
        };
    }
    if (nome.includes("emocromo")) {
        return {
            titolo: "EMOCROMO CON FORMULA LEUCOCITARIA",
            metodo: "Contatore ematologico automatizzato con formula differenziale",
            righe: [
                ["Leucociti", "7,8", "10^9/L", "4,0 - 10,0"],
                ["Neutrofili", "62", "%", "40 - 75"],
                ["Linfociti", "27", "%", "20 - 45"],
                ["Eritrociti", "4,72", "10^12/L", "4,20 - 5,70"],
                ["Emoglobina", "14,1", "g/dL", "12,0 - 17,5"],
                ["Ematocrito", "42,4", "%", "36 - 52"],
                ["Piastrine", "246", "10^9/L", "150 - 400"]
            ],
            interpretazione: "Quadro emocromocitometrico nei limiti. Non segni laboratoristici di anemia, piastrinopenia o leucocitosi significativa."
        };
    }
    if (nome.includes("coagulazione")) {
        return {
            titolo: "ASSETTO COAGULATIVO",
            metodo: "Coagulometria ottica e immunoturbidimetria",
            righe: [
                ["PT ratio", "1,01", "ratio", "0,85 - 1,20"],
                ["INR", "1,02", "", "0,80 - 1,20"],
                ["aPTT", "29", "sec", "24 - 36"],
                ["Fibrinogeno", "318", "mg/dL", "200 - 400"],
                ["D-dimero", "310", "ng/mL FEU", "< 500"]
            ],
            interpretazione: "Parametri coagulativi globalmente conservati. D-dimero non aumentato nel campione refertato; interpretare sempre in base alla probabilita clinica pre-test."
        };
    }
    if (nome.includes("ega")) {
        return {
            titolo: "EMOGASANALISI ARTERIOSA",
            metodo: "Elettrodi selettivi e co-ossimetria",
            righe: [
                ["pH", "7,43", "", "7,35 - 7,45"],
                ["pCO2", "36", "mmHg", "35 - 45"],
                ["pO2", "86", "mmHg", "80 - 100"],
                ["HCO3-", "24,1", "mmol/L", "22 - 26"],
                ["BE", "-0,2", "mmol/L", "-2 / +2"],
                ["Lattato", "1,1", "mmol/L", "0,5 - 2,0"]
            ],
            interpretazione: "Equilibrio acido-base conservato. Ossigenazione compatibile con il quadro clinico e con eventuale supporto in atto."
        };
    }
    if (nome.includes("biochimico") || nome.includes("renale") || nome.includes("elettroliti")) {
        return {
            titolo: "PROFILO BIOCHIMICO ED ELETTROLITICO",
            metodo: "Chimica clinica automatizzata",
            righe: [
                ["Glucosio", "96", "mg/dL", "70 - 110"],
                ["Creatinina", "0,92", "mg/dL", "0,60 - 1,20"],
                ["eGFR", "86", "mL/min/1,73m2", "> 60"],
                ["Sodio", "139", "mmol/L", "135 - 145"],
                ["Potassio", "4,1", "mmol/L", "3,5 - 5,1"],
                ["AST", "24", "U/L", "< 40"],
                ["ALT", "27", "U/L", "< 41"],
                ["Bilirubina totale", "0,8", "mg/dL", "0,2 - 1,2"]
            ],
            interpretazione: "Funzione renale, assetto elettrolitico e indici epatici senza alterazioni significative nel campione analizzato."
        };
    }
    if (nome.includes("pcr") || nome.includes("pct") || nome.includes("ves")) {
        return {
            titolo: "INDICI DI FLOGOSI",
            metodo: "Immunoturbidimetria / chemiluminescenza",
            righe: [
                ["PCR", "4,6", "mg/L", "< 5"],
                ["Procalcitonina", "0,04", "ng/mL", "< 0,10"],
                ["VES", "12", "mm/h", "< 20"]
            ],
            interpretazione: "Indici di flogosi nei limiti o solo minimamente mossi. Non emergono elementi laboratoristici suggestivi per sepsi nel campione refertato."
        };
    }
    return {
        titolo: nomeEsameReferto(e).toUpperCase(),
        metodo: "Analisi automatizzata validata",
        righe: [
            ["Parametro principale", "nei limiti", "", "range del laboratorio"],
            ["Controllo qualita", "valido", "", "campione idoneo"]
        ],
        interpretazione: refertoPerEsame(e, pazienteSelezionato || {})
    };
}

function tabellaLaboratorioTesto(righe) {
    return righe.map(([analita, valore, unita, range]) => {
        const unitaTxt = unita ? ` ${unita}` : "";
        return `${analita}: ${valore}${unitaTxt}    Valori riferimento: ${range}`;
    }).join("\n");
}

function refertoLaboratorioStrutturato(e, p) {
    const dati = righeLaboratorio(e);
    return `LABORATORIO ANALISI CLINICHE

${bloccoAnagraficaReferto(p, e, "Data/Ora prelievo")}

----------------------------------------

${dati.titolo}

${tabellaLaboratorioTesto(dati.righe)}

Metodo: ${dati.metodo}

----------------------------------------

Interpretazione:
${dati.interpretazione}

Referto validato elettronicamente.`;
}

function dettaglioImaging(e) {
    const nome = nomeEsameReferto(e).toLowerCase();
    if (nome.includes("rx torace")) {
        return {
            tecnica: "Radiogramma del torace in proiezione postero-anteriore e latero-laterale, compatibilmente con le condizioni cliniche.",
            reperti: "Campi polmonari bilateralmente espansi. Non addensamenti parenchimali focali evidenti. Ombra cardio-mediastinica nei limiti per morfologia e dimensioni. Seni costo-frenici liberi. Non segni radiografici di pneumotorace.",
            conclusioni: "Non evidenza di lesioni pleuro-parenchimali acute radiograficamente apprezzabili."
        };
    }
    if (nome.includes("addome")) {
        return {
            tecnica: "Radiogramma diretto dell'addome in ortostatismo/supino secondo disponibilita clinica.",
            reperti: "Distribuzione del meteorismo intestinale senza livelli idroaerei patologici evidenti. Non falce aerea sottodiaframmatica nelle proiezioni acquisite. Coprostasi di grado lieve-moderato.",
            conclusioni: "Non segni radiografici diretti di occlusione intestinale franca o perforazione."
        };
    }
    if (nome.includes("cranio") || nome.includes("encefalo") || nome.includes("massiccio")) {
        return {
            tecnica: "Studio TC/RM del distretto cranio-encefalico con ricostruzioni multiplanari secondo protocollo di urgenza.",
            reperti: "Linea mediana in asse. Sistema ventricolare nei limiti per eta. Non evidenza di raccolte ematiche extra-assiali acute o effetto massa significativo. Strutture ossee valutabili senza rime di frattura scomposta nelle sezioni disponibili.",
            conclusioni: "Non evidenza di reperti intracranici acuti maggiori nelle immagini acquisite."
        };
    }
    if (nome.includes("angio") && nome.includes("torace")) {
        return {
            tecnica: "Angio-TC torace con acquisizione in fase arteriosa polmonare e ricostruzioni multiplanari.",
            reperti: "Opacizzazione diagnostica del circolo arterioso polmonare. Non difetti di riempimento nei rami principali, lobari e segmentari. Non versamento pleurico significativo. Aorta toracica di calibro conservato nel tratto esplorato.",
            conclusioni: "Esame negativo per embolia polmonare centrale o segmentaria."
        };
    }
    if (nome.includes("tac") || nome.includes("tc")) {
        return {
            tecnica: "Acquisizione TC multidetettore con ricostruzioni multiplanari; mezzo di contrasto secondo quesito clinico e protocollo.",
            reperti: "Non evidenza di raccolte fluide acute, pneumoperitoneo o lesioni traumatiche maggiori nel distretto esplorato. Organi parenchimatosi valutabili senza alterazioni focali acute evidenti.",
            conclusioni: "Quadro TC senza reperti acuti maggiori nel distretto esaminato."
        };
    }
    if (nome.includes("eco")) {
        return {
            tecnica: "Esame ecografico bedside con sonda convex/lineare secondo distretto e quesito clinico.",
            reperti: "Non versamento libero patologico nelle scansioni esplorate. Organi valutabili senza dilatazioni o raccolte evidenti. Reperto nei limiti dell'esame al letto del paziente.",
            conclusioni: "Esame ecografico senza rilievi acuti maggiori."
        };
    }
    return {
        tecnica: "Esame eseguito secondo protocollo del distretto richiesto.",
        reperti: refertoPerEsame(e, pazienteSelezionato || {}),
        conclusioni: "Correlare il reperto con quadro clinico, parametri vitali e andamento."
    };
}

function immagineReferto(e) {
    const nome = `${e.nome || ""} ${e.categoria || ""}`.toLowerCase();
    if (nome.includes("ecg")) return DIAGNOSTIC_ASSETS.ecgFlutter;
    if (nome.includes("rx torace")) return DIAGNOSTIC_ASSETS.rxTorace;
    if (nome.includes("rx addome")) return DIAGNOSTIC_ASSETS.rxAddome;
    if ((nome.includes("tac") || nome.includes("tc")) && nome.includes("cranio")) return DIAGNOSTIC_ASSETS.tcCranio;
    if ((nome.includes("tac") || nome.includes("tc") || nome.includes("angio")) && nome.includes("torace")) return DIAGNOSTIC_ASSETS.tcTorace;
    if ((nome.includes("tac") || nome.includes("tc")) && (nome.includes("addome") || nome.includes("pelvi"))) return DIAGNOSTIC_ASSETS.tcAddomePelvi;
    return "";
}

function refertoImagingStrutturato(e, p) {
    const nome = nomeEsameReferto(e);
    const categoria = e.categoria || categoriaEsame(nome);
    const dettaglio = dettaglioImaging(e);
    return `${categoria.toUpperCase()} - REFERTO RADIOLOGICO

${bloccoAnagraficaReferto(p, e, "Data/Ora richiesta")}

Quesito clinico:
${e.note || e.richiedente || "Quesito non specificato in richiesta."}

Tecnica:
${dettaglio.tecnica}

Reperti:
${dettaglio.reperti}

Conclusioni:
${dettaglio.conclusioni}

Referto validato elettronicamente.`;
}

function refertoECGStrutturato(e, p) {
    return `CARDIOLOGIA - ELETTROCARDIOGRAMMA 12 DERIVAZIONI

${bloccoAnagraficaReferto(p, e, "Data/Ora registrazione")}

Parametri automatici:
Frequenza ventricolare: 96 bpm
PR: 156 ms
QRS: 94 ms
QT/QTc: 356/449 ms
Asse elettrico: nei limiti
Velocita carta: 25 mm/sec
Taratura: 10 mm/mV

Descrizione:
Ritmo sinusale a frequenza ventricolare nei limiti alti. Conduzione atrio-ventricolare conservata. QRS stretto. Non sopraslivellamenti persistenti del tratto ST nelle derivazioni esplorate. Alterazioni aspecifiche della ripolarizzazione da correlare con clinica ed eventuali enzimi miocardici seriati.

Conclusioni:
ECG senza criteri elettrocardiografici certi per sindrome coronarica acuta con sopraslivellamento persistente del tratto ST nel tracciato refertato.

Referto validato elettronicamente.`;
}

function creaDocumentoReferto(e, p) {
    const categoria = e.categoria || categoriaEsame(e.nome || e.tipo);
    const nome = nomeEsameReferto(e);
    if (/ECG/i.test(nome)) {
        return {
            versione: REFERTI_VERSIONE,
            tipo: "ECG",
            testo: refertoECGStrutturato(e, p),
            immagine: immagineReferto(e)
        };
    }
    if (categoria === "Ematochimici" || (categoria === "Cardiologia" && !/Ecocardio/i.test(nome))) {
        return {
            versione: REFERTI_VERSIONE,
            tipo: "Laboratorio",
            testo: refertoLaboratorioStrutturato(e, p),
            immagine: ""
        };
    }
    return {
        versione: REFERTI_VERSIONE,
        tipo: categoria,
        testo: refertoImagingStrutturato(e, p),
        immagine: immagineReferto(e)
    };
}

function completaRefertiScaduti(mostraAvviso = false) {
    let completati = 0;
    const now = Date.now();
    pazienti.forEach(p => {
        ensurePaziente(p);
        (p.esami || []).forEach(e => {
            if (typeof e === "string" || !e.refertoAutomatico || e.stato === "Refertato") return;
            if (Number(e.dueAt || 0) > now) return;
            e.stato = "Refertato";
            e.refertatoIl = new Date().toLocaleString();
            e.refertatoDa = e.refertatoDa || "Diagnostica / Laboratorio";
            e.referto = creaDocumentoReferto(e, p);
            e.esito = e.referto.testo;
            e.immagine = e.referto.immagine;
            completati += 1;
        });
    });
    if (completati) {
        logAction(`${completati} referti automatici completati`);
        salva();
        if (mostraAvviso) alert(`${completati} referti pronti in cartella.`);
    }
    pianificaControlloReferti();
    return completati;
}

function formatEsami(esami) {
    return (esami || []).slice().reverse().map(e => {
        if (typeof e === "string") return `<tr><td colspan="6">${escapeHtml(e)}</td></tr>`;
        const statoClass = e.stato === "Refertato" ? "done" : e.stato === "In corso" ? "progress" : "pending";
        const tempo = tempoRefertoLabel(e);
        const refButton = e.stato === "Refertato"
            ? `<button class="small-action" onclick="visualizzaRefertoEsame('${pazienteSelezionato?.id || ""}', '${e.id}')">Apri referto</button>`
            : `<div class="exam-report">Referto non ancora disponibile.</div>`;
        return `
            <tr>
                <td>${escapeHtml(e.time || "")}</td>
                <td><b>${escapeHtml(e.nome || e.tipo || "")}</b><small>${escapeHtml(e.categoria || e.tipo || "")}</small></td>
                <td>${escapeHtml(e.richiedente || "")}</td>
                <td><span class="exam-status ${statoClass}">${escapeHtml(e.stato || "")}</span>${tempo ? `<small>${escapeHtml(tempo)}</small>` : ""}</td>
                <td>${escapeHtml(e.urgenza || "")}</td>
                <td>${refButton}${e.refertatoIl ? `<small>Refertato: ${escapeHtml(e.refertatoIl)} - ${escapeHtml(e.refertatoDa || "Diagnostica")}</small>` : ""}</td>
            </tr>
        `;
    }).join("");
}

function trovaPazienteOvunque(idP) {
    return pazienti.find(p => p.id === idP) || archivio.find(p => p.id === idP);
}

function visualizzaRefertoEsame(idP, idE) {
    const p = trovaPazienteOvunque(idP) || pazienteSelezionato;
    if (!p) return;
    const e = (p.esami || []).find(x => typeof x !== "string" && x.id === idE);
    if (!e || e.stato !== "Refertato") return;
    if (!e.referto || e.referto.versione !== REFERTI_VERSIONE) {
        e.referto = creaDocumentoReferto(e, p);
        e.esito = e.referto.testo;
        e.immagine = e.referto.immagine;
        salva();
    }

    const immagine = e.referto.immagine || e.immagine || "";
    const win = window.open("", "_blank");
    win.document.write(`
        <html>
        <head>
            <title>Referto - ${escapeHtml(e.nome || e.tipo || "")}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 26px; color: #17212f; background: #f5f6f1; }
                .report { max-width: 920px; margin: auto; background: #fff; border: 1px solid #9aa8b8; padding: 24px; }
                .head { display: flex; justify-content: space-between; border-bottom: 3px solid #005c88; padding-bottom: 12px; margin-bottom: 18px; }
                .brand { font-size: 20px; font-weight: 800; color: #005c88; }
                pre { white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; }
                .image-box { border: 1px solid #c5d0da; background: #111; padding: 10px; text-align: center; margin: 14px 0; }
                .image-box img { max-width: 780px; width: 100%; height: auto; }
                @media print { body { background: #fff; padding: 0; } .report { border: none; } }
            </style>
        </head>
        <body>
            <article class="report">
                <div class="head">
                    <div><div class="brand">${escapeHtml(e.referto.tipo || "Referto")}</div><small>Referto validato elettronicamente</small></div>
                    <div>${escapeHtml(e.refertatoIl || "")}</div>
                </div>
                ${immagine ? `<div class="image-box"><img src="${escapeHtml(immagine)}" alt="Immagine diagnostica"></div>` : ""}
                <pre>${escapeHtml(e.referto.testo || e.esito || "")}</pre>
            </article>
        </body>
        </html>
    `);
    win.document.close();
}

function refertiPerDimissioneHTML(p) {
    return (p.esami || [])
        .filter(e => typeof e !== "string" && e.stato === "Refertato")
        .map(e => {
            if (!e.referto || e.referto.versione !== REFERTI_VERSIONE) {
                e.referto = creaDocumentoReferto(e, p);
                e.esito = e.referto.testo;
                e.immagine = e.referto.immagine;
            }
            const immagine = e.referto.immagine || e.immagine || "";
            return `<h3>${escapeHtml(e.nome || e.tipo || "Referto")}</h3>${immagine ? `<div class="image-box"><img src="${escapeHtml(immagine)}" alt=""></div>` : ""}<div class="box">${escapeHtml(e.referto.testo || e.esito || "")}</div>`;
        }).join("") || `<div class="box">Nessun referto validato allegato.</div>`;
}

function stampaDimissione(p, operatore, dimessoIl) {
    const terapie = plainTextList(p.terapie, t => `${t.time || ""} - ${t.farmaco || ""} ${t.dose || ""} ${t.via || ""} ${t.frequenza || ""} ${t.note || ""}`);
    const diario = plainTextList([...(p.visite || []), ...(p.diarioClinico || [])], d => `${d.time || ""} - ${d.tipo || "Nota"} - ${d.testo || d.diagnosi || ""}`);
    const ecg = plainTextList(p.ecgHistory || [], e => `${e.time || ""} - ${e.ritmo || "ECG"} - FC ${e.fc || ""} bpm`);
    const win = window.open("", "_blank");
    win.document.write(`
        <html>
        <head>
            <title>Lettera di dimissione - ${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</title>
            <style>
                body { font-family: Arial, sans-serif; color: #17212f; margin: 0; padding: 28px; }
                .doc { border: 1px solid #9aa8b8; padding: 24px; }
                .head { display: flex; justify-content: space-between; border-bottom: 3px solid #173b63; padding-bottom: 14px; }
                .brand { font-size: 22px; font-weight: 800; color: #173b63; }
                .meta { text-align: right; font-size: 12px; color: #526477; }
                h1 { font-size: 20px; margin: 18px 0; text-align: center; }
                h2 { font-size: 14px; color: #173b63; border-bottom: 1px solid #cad4df; padding-bottom: 4px; page-break-after: avoid; }
                h3 { font-size: 13px; color: #173b63; margin-bottom: 6px; }
                .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 18px; font-size: 13px; }
                .box { border: 1px solid #cad4df; min-height: 42px; padding: 9px; white-space: pre-wrap; font-size: 13px; margin-bottom: 8px; }
                .image-box { border: 1px solid #cad4df; background: #111; text-align: center; padding: 8px; margin-bottom: 8px; }
                .image-box img { max-width: 620px; width: 100%; }
                .sign { display: flex; justify-content: flex-end; margin-top: 38px; }
                .sign div { width: 280px; border-top: 1px solid #17212f; padding-top: 6px; text-align: center; }
                @media print { body { padding: 0; } .doc { border: none; } }
            </style>
        </head>
        <body>
            <div class="doc">
                <div class="head">
                    <div><div class="brand">OSPEDALE - PRONTO SOCCORSO</div><small>Lettera di dimissione con referti allegati</small></div>
                    <div class="meta">Data dimissione: ${escapeHtml(dimessoIl)}<br>Operatore: ${escapeHtml(operatore)}</div>
                </div>
                <h1>Relazione clinica di dimissione</h1>
                <h2>Dati paziente</h2>
                <div class="grid">
                    <div><b>Paziente:</b> ${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</div>
                    <div><b>Codice fiscale:</b> ${escapeHtml(p.cf || "")}</div>
                    <div><b>Codice triage:</b> ${escapeHtml(p.codice || "")}</div>
                    <div><b>Reparto/letto:</b> ${escapeHtml(labelReparto(p.reparto))}${p.letto ? " - " + escapeHtml(p.letto.label) : ""}</div>
                </div>
                <h2>Motivo di accesso</h2><div class="box">${escapeHtml(p.motivo || "")}</div>
                <h2>Decorso clinico</h2><div class="box">${escapeHtml(diario || "Non documentato")}</div>
                <h2>Parametri alla dimissione</h2><div class="box">FC: ${escapeHtml(p.parametri?.fc || "")} bpm
FR: ${escapeHtml(p.parametri?.fr || "")} /min
SpO2: ${escapeHtml(p.parametri?.sat || "")} %
PA: ${escapeHtml(p.parametri?.pa || "")}
Temp: ${escapeHtml(p.parametri?.temp || "")} °C
GCS: ${escapeHtml(p.parametri?.gcs || "")}</div>
                <h2>ECG registrati</h2><div class="box">${escapeHtml(ecg || "Nessun ECG registrato")}</div>
                <h2>Terapie somministrate / prescritte</h2><div class="box">${escapeHtml(terapie || "Nessuna terapia registrata")}</div>
                <h2>Referti allegati</h2>${refertiPerDimissioneHTML(p)}
                <h2>Indicazioni finali</h2><div class="box">Controllo clinico secondo indicazione medica. Rivalutazione urgente in caso di peggioramento, febbre persistente, dolore ingravescente, dispnea, sincope o comparsa di nuovi sintomi.</div>
                <div class="sign"><div>Firma operatore<br><b>${escapeHtml(operatore)}</b></div></div>
            </div>
            <script>window.onload = () => window.print();</script>
        </body>
        </html>
    `);
    win.document.close();
}

const renderBaseRicoveriReferti = render;
render = function() {
    if (pagina === "ricoveri") {
        ricoveriView(document.getElementById("app"));
        if (typeof applicaPuliziaInterfaccia === "function") setTimeout(applicaPuliziaInterfaccia, 0);
        return;
    }
    renderBaseRicoveriReferti();
};

const canOpenPageBaseRicoveri = typeof canOpenPage === "function" ? canOpenPage : null;
if (canOpenPageBaseRicoveri) {
    canOpenPage = function(nomePagina) {
        if (nomePagina === "ricoveri") return true;
        return canOpenPageBaseRicoveri(nomePagina);
    };
}

function chirurgiaView(app) { repartoView(app, "chirurgia", "Chirurgia"); }
function medicinaInternaView(app) { repartoView(app, "medicinaInterna", "Medicina Interna"); }
function ortopediaView(app) { repartoView(app, "ortopedia", "Ortopedia e Traumatologia"); }
function cardiologiaView(app) { repartoView(app, "cardiologia", "Cardiologia / UTIC"); }
function neurologiaView(app) { repartoView(app, "neurologia", "Neurologia / Stroke Unit"); }
function rianimazioneView(app) { repartoView(app, "rianimazione", "Rianimazione / Terapia Intensiva"); }

/* =======================
   WORKSTATION DEDALUS - OVERRIDE OPERATIVI FINALI
======================= */

function parseDataClinica(value) {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const raw = String(value).trim();
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), Number(iso[4] || 0), Number(iso[5] || 0), Number(iso[6] || 0));
    const ita = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,?\s+(\d{1,2})[:.](\d{2})(?::(\d{2}))?)?/);
    if (ita) return new Date(Number(ita[3]), Number(ita[2]) - 1, Number(ita[1]), Number(ita[4] || 0), Number(ita[5] || 0), Number(ita[6] || 0));
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function etaPaziente(nascita) {
    const d = parseDataClinica(nascita);
    if (!d) return "";
    if (Number.isNaN(d.getTime())) return "";
    const today = new Date();
    let eta = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) eta -= 1;
    return eta >= 0 ? `${eta} anni` : "";
}

function tempoPermanenza(p) {
    const startDate = parseDataClinica(p.arrivo || p.ingresso || p.createdAt || p.dataIngresso);
    const start = startDate ? startDate.getTime() : Date.now();
    if (!start || Number.isNaN(start)) return "0 min";
    const mins = Math.max(0, Math.floor((Date.now() - start) / 60000));
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function lettoLabel(p) {
    if (p.letto?.label) return p.letto.label;
    return labelReparto(p.reparto || "ps");
}

function statoPercorsoPaziente(p) {
    if (p.dimissioneTipo) return p.dimissioneTipo;
    if (p.letto) return "Ricoverato";
    if (p.reparto && p.reparto !== "ps") return "Assegnato reparto";
    return "In PS";
}

function pazientiPSAttivi() {
    return pazienti.filter(p => ensurePaziente(p).reparto === "ps" && !p.letto);
}

function lista(app) {
    completaRefertiScaduti(false);
    const attiviPS = pazientiPSAttivi();
    const ricoverati = pazienti.filter(p => ensurePaziente(p).letto);
    const inReparto = pazienti.filter(p => ensurePaziente(p).reparto !== "ps" && !p.letto);
    const critici = pazienti.filter(p => ["Rosso", "Arancione"].includes(p.codice)).length;
    const referti = pazienti.reduce((tot, p) => tot + refertiPendenti(p), 0);

    app.innerHTML = `
        <div class="page-header dedalus-record-head">
            <div>
                <p class="eyebrow">Pronto Soccorso</p>
                <h2>Lista pazienti</h2>
                <span>Vista operativa, triage, diagnostica e destinazione.</span>
            </div>
            <div class="header-actions">
                <button onclick="pagina='nuovo'; render()">Nuovo paziente</button>
                <button onclick="pagina='ricoveri'; render()">Ricoveri e letti</button>
                ${hasPermission("118:view") ? `<button onclick="pagina='intervento118'; render()">Centrale 118</button>` : ""}
            </div>
        </div>

        <section class="dedalus-kpi-row">
            <div><b>${attiviPS.length}</b><span>In PS</span></div>
            <div><b>${ricoverati.length}</b><span>Ricoverati</span></div>
            <div><b>${inReparto.length}</b><span>Assegnati</span></div>
            <div><b>${critici}</b><span>Alta priorita</span></div>
            <div><b>${referti}</b><span>Referti attesi</span></div>
        </section>

        <section class="dedalus-panel ps-worklist">
            <div class="dedalus-panel-head">
                <div>
                    <p class="eyebrow">Worklist PS</p>
                    <h3>Pazienti attivi</h3>
                </div>
                <div class="table-tools">
                    <button onclick="filtroTriage='Tutti'; render()">Tutti</button>
                    <button onclick="filtroTriage='Rosso'; render()">Rosso</button>
                    <button onclick="filtroTriage='Arancione'; render()">Arancione</button>
                    <button onclick="filtroTriage='Verde'; render()">Verde</button>
                    <button onclick="filtroTriage='Bianco'; render()">Bianco</button>
                </div>
            </div>
            <div class="table-wrap">
                <table class="clinical-table patient-worklist">
                    <thead>
                        <tr>
                            <th>Codice</th>
                            <th>Paziente</th>
                            <th>Eta</th>
                            <th>Motivo accesso</th>
                            <th>Destinazione</th>
                            <th>Referti</th>
                            <th>Tempo</th>
                            <th>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pazienti
                            .filter(p => filtroTriage === "Tutti" || p.codice === filtroTriage)
                            .sort((a, b) => prioritaLista(a.codice) - prioritaLista(b.codice))
                            .map(p => `
                                <tr class="patient-row ${triageClass(p.codice)}">
                                    <td><span class="triage-badge ${triageClass(p.codice)}">${escapeHtml(p.codice || "n/d")}</span></td>
                                    <td><b>${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</b><small>${escapeHtml(p.cf || "CF non indicato")}</small></td>
                                    <td>${escapeHtml(etaPaziente(p.nascita))}</td>
                                    <td>${escapeHtml(p.motivo || "Non indicato")}</td>
                                    <td><b>${escapeHtml(statoPercorsoPaziente(p))}</b><small>${escapeHtml(lettoLabel(p))}</small></td>
                                    <td>${refertiPendenti(p) ? `<span class="exam-status progress">${refertiPendenti(p)} in corso</span>` : `<span class="exam-status done">ok</span>`}</td>
                                    <td>${escapeHtml(tempoPermanenza(p))}</td>
                                    <td class="row-actions"><button onclick="apri('${p.id}')">Cartella</button></td>
                                </tr>
                            `).join("") || `<tr><td colspan="8">Nessun paziente presente.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </section>
    `;
}

function prioritaLista(codice) {
    const c = String(codice || "").toLowerCase();
    if (c.includes("rosso")) return 1;
    if (c.includes("arancione")) return 2;
    if (c.includes("azzurro")) return 3;
    if (c.includes("verde")) return 4;
    if (c.includes("bianco")) return 5;
    return 6;
}

function cartella(app) {
    let p = ensurePaziente(pazienteSelezionato);
    if (!p) {
        pagina = "ps";
        render();
        return;
    }
    const percorso = statoPercorsoPaziente(p);
    const refertiInCorso = refertiPendenti(p);

    app.innerHTML = `
        <div class="page-header dedalus-record-head patient-record-header">
            <div class="patient-identity">
                ${iconImg(patientIcon(p), "Paziente")}
                <div>
                    <p class="eyebrow">Cartella clinica integrata</p>
                    <h2>${escapeHtml(p.cognome)} ${escapeHtml(p.nome)}</h2>
                    <span>${escapeHtml(p.cf || "CF non indicato")} | ${escapeHtml(etaPaziente(p.nascita))} | ${escapeHtml(percorso)} | ${escapeHtml(lettoLabel(p))}</span>
                </div>
            </div>
            <div class="header-actions">
                <span class="triage-badge ${triageClass(p.codice)}">${escapeHtml(p.codice || "n/d")}</span>
                <button onclick="generaECG()">ECG</button>
                <button onclick="pagina='ricoveri'; render()">Letti</button>
                <button onclick="chiudiPercorsoPaziente()">Chiudi percorso</button>
                <button onclick="pagina='ps'; render()">Torna</button>
            </div>
        </div>

        ${ultimoAvvisoReferti ? `<div class="exam-alert">${escapeHtml(ultimoAvvisoReferti)}</div>` : ""}

        <section class="record-strip">
            <div><b>Motivo</b><span>${escapeHtml(p.motivo || "Non indicato")}</span></div>
            <div><b>Parametri</b><span>FC ${escapeHtml(p.parametri.fc || "-")} | SpO2 ${escapeHtml(p.parametri.sat || "-")} | PA ${escapeHtml(p.parametri.pa || "-")}</span></div>
            <div><b>Referti</b><span>${refertiInCorso ? `${refertiInCorso} in corso` : "nessuno in attesa"}</span></div>
            <div><b>Reparto</b><span>${escapeHtml(labelReparto(p.reparto))}${p.letto ? " | " + escapeHtml(p.letto.label) : ""}</span></div>
            <div>
                <b>Destinazione</b>
                <select id="repartoCartella" onchange="cambiaRepartoPaziente()">
                    <option value="ps" ${p.reparto === "ps" ? "selected" : ""}>Pronto Soccorso</option>
                    ${Object.entries(REPARTI_LETTI).map(([key, r]) => `<option value="${key}" ${p.reparto === key ? "selected" : ""}>${escapeHtml(r.nome)}</option>`).join("")}
                </select>
            </div>
        </section>

        <div class="record-grid">
            <section class="dedalus-panel span-2">
                <div class="dedalus-panel-head">
                    <div><p class="eyebrow">Valutazione</p><h3>Inquadramento clinico</h3></div>
                    <span class="mini-count">${timelineClinica(p).length} eventi</span>
                </div>
                <div class="clinical-brief">${escapeHtml(`Motivo: ${p.motivo || "Non indicato"}
Priorita: ${p.codice || "n/d"}
Percorso: ${percorso}
Referti in attesa: ${refertiInCorso}`)}</div>
                <div class="clinical-alerts">${alertCliniciHTML(p)}</div>
                <div class="clinical-timeline compact">${timelineClinicaHTML(p)}</div>
            </section>

            <section class="dedalus-panel">
                <div class="dedalus-panel-head">
                    <div><p class="eyebrow">Monitoraggio</p><h3>Parametri vitali</h3></div>
                    <button onclick="salvaParametri()">Registra</button>
                </div>
                <div class="vitals-grid">
                    <label>FC<input id="fc" type="number" placeholder="bpm" value="${escapeHtml(p.parametri.fc || "")}"></label>
                    <label>FR<input id="fr" type="number" placeholder="/min" value="${escapeHtml(p.parametri.fr || "")}"></label>
                    <label>SpO2<input id="sat" type="number" placeholder="%" value="${escapeHtml(p.parametri.sat || "")}"></label>
                    <label>PA<input id="pa" placeholder="120/80" value="${escapeHtml(p.parametri.pa || "")}"></label>
                    <label>Temp<input id="temp" type="number" step="0.1" placeholder="C" value="${escapeHtml(p.parametri.temp || "")}"></label>
                    <label>GCS<input id="gcs" type="number" min="3" max="15" value="${escapeHtml(p.parametri.gcs || "")}"></label>
                    <label>Dolore<input id="dolore" type="number" min="0" max="10" value="${escapeHtml(p.parametri.dolore || "")}"></label>
                </div>
            </section>

            <section class="dedalus-panel">
                <div class="dedalus-panel-head">
                    <div><p class="eyebrow">Richieste</p><h3>Diagnostica</h3></div>
                    <span class="mini-count">${refertiInCorso}</span>
                </div>
                <select id="esameNome">${esamiCatalogoHTML()}</select>
                <select id="esameUrgenza"><option>Routine PS</option><option>Urgente</option><option>Emergenza</option></select>
                <input id="esameRichiedente" placeholder="Quesito clinico">
                <textarea id="esameNote" placeholder="Note per diagnostica o laboratorio"></textarea>
                <div class="button-row"><button onclick="addEsami()">Richiedi</button><button onclick="controllaReferti()">Controlla</button></div>
            </section>

            <section class="dedalus-panel">
                <div class="dedalus-panel-head"><div><p class="eyebrow">Terapia</p><h3>Farmaci</h3></div></div>
                <input id="farmacoNome" placeholder="Farmaco">
                <input id="farmacoDose" placeholder="Dose">
                <select id="farmacoVia"><option>EV</option><option>IM</option><option>OS</option><option>SC</option><option>Aerosol</option><option>Topica</option></select>
                <input id="farmacoFrequenza" placeholder="Orario / frequenza">
                <textarea id="farmacoNote" placeholder="Note"></textarea>
                <button onclick="addTerapia()">Registra terapia</button>
            </section>

            <section class="dedalus-panel">
                <div class="dedalus-panel-head"><div><p class="eyebrow">Diario</p><h3>Nota clinica</h3></div></div>
                <select id="diarioTipo"><option>Valutazione medica</option><option>Rivalutazione infermieristica</option><option>Consulenza</option><option>Decorso</option><option>Diagnosi</option></select>
                <textarea id="diarioTesto" placeholder="Valutazione, obiettivita, ipotesi, piano"></textarea>
                <button onclick="addVisita()">Registra nota</button>
            </section>

            ${repartoSpecificoHTML(p)}

            <section class="dedalus-panel span-2">
                <div class="dedalus-panel-head"><div><p class="eyebrow">Storico</p><h3>Parametri seriali</h3></div></div>
                <div class="table-wrap"><table class="clinical-table"><thead><tr><th>Ora</th><th>FC</th><th>FR</th><th>SpO2</th><th>PA</th><th>Temp</th><th>GCS</th><th>Dolore</th></tr></thead><tbody>${formatParametriHistory(p) || `<tr><td colspan="8">Nessuna rilevazione.</td></tr>`}</tbody></table></div>
            </section>

            <section class="dedalus-panel span-2">
                <div class="dedalus-panel-head"><div><p class="eyebrow">Referti</p><h3>Esami richiesti</h3></div></div>
                <div class="table-wrap"><table class="clinical-table"><thead><tr><th>Richiesto</th><th>Esame</th><th>Quesito</th><th>Stato</th><th>Urgenza</th><th>Referto</th></tr></thead><tbody>${formatEsami(p.esami) || `<tr><td colspan="6">Nessun esame.</td></tr>`}</tbody></table></div>
            </section>

            <section class="dedalus-panel span-2">
                <div class="dedalus-panel-head"><div><p class="eyebrow">Decorso</p><h3>Diario e terapie</h3></div></div>
                <div class="record-two-col">
                    <div class="notes-list">${formatDiarioClinico(p) || `<div class="empty-state">Nessuna nota clinica.</div>`}</div>
                    <div class="table-wrap"><table class="clinical-table"><thead><tr><th>Ora</th><th>Farmaco</th><th>Dose</th><th>Via</th><th>Note</th></tr></thead><tbody>${formatTerapieCompatta(p.terapie) || `<tr><td colspan="5">Nessuna terapia.</td></tr>`}</tbody></table></div>
                </div>
            </section>

            <section class="dedalus-panel span-2">
                <div class="dedalus-panel-head"><div><p class="eyebrow">ECG</p><h3>Tracciato</h3></div><span class="mini-count">${(p.ecgHistory || []).length}</span></div>
                <canvas id="ecgCanvas" class="ecg-canvas" width="960" height="260"></canvas>
            </section>
        </div>
    `;
    disegnaUltimoECG();
    ultimoAvvisoReferti = "";
}

function formatTerapieCompatta(terapie) {
    return (terapie || []).slice().reverse().map(t => `
        <tr><td>${escapeHtml(t.time || "")}</td><td>${escapeHtml(t.farmaco || "")}</td><td>${escapeHtml(t.dose || "")}</td><td>${escapeHtml(t.via || "")}</td><td>${escapeHtml(t.note || "")}</td></tr>
    `).join("");
}

function chiudiPercorsoPaziente() {
    const p = pazienteSelezionato;
    if (!p) return;
    const tipo = prompt("Tipo chiusura: dimissione, ricovero, trasferimento, decesso", p.letto ? "ricovero" : "dimissione");
    if (!tipo) return;
    p.dimissioneTipo = tipo;
    if (tipo.toLowerCase().includes("ricovero")) {
        salva();
        pagina = "ricoveri";
        render();
        return;
    }
    dimetti();
}

function creaChiamataCentrale118() {
    if (!hasPermission("all")) return alert("Solo l'amministratore puo creare chiamate dalla centrale.");
    intervento118Counter += 1;
    const priorita = fieldValue("centraleCodice") || "verde";
    const nuovo = ensureIntervento118({
        id: id(),
        numero: intervento118Counter,
        data: new Date().toLocaleString(),
        stato: "chiamata",
        priorita,
        mezzo: fieldValue("centraleMezzo") || "MSB",
        ambulanceId: fieldValue("centraleAmbulanza"),
        indirizzo: fieldValue("centraleIndirizzo"),
        centrale: {
            chiamante: fieldValue("centraleChiamante"),
            telefono: fieldValue("centraleTelefono"),
            motivo: fieldValue("centraleMotivo"),
            note: fieldValue("centraleNote")
        },
        paziente: {
            cognomeNome: fieldValue("centralePaziente"),
            dataNascita: fieldValue("centraleNascita"),
            cf: "",
            sesso: ""
        },
        scena: {
            luogo: fieldValue("centraleLuogo") || "Domicilio",
            tipologia: fieldValue("centraleTipo") || "Medico",
            dinamica: fieldValue("centraleMotivo")
        },
        tempi: { chiamata: new Date().toLocaleString() },
        logs: [{ time: new Date().toLocaleString(), text: "Chiamata creata da centrale operativa." }]
    });
    interventi118.push(nuovo);
    logAction("Creata chiamata centrale 118 #" + nuovo.numero);
    salva();
    intervento118Selezionato = nuovo.id;
    render();
}

function centrale118AdminHTML() {
    if (!hasPermission("all")) return "";
    return `
        <section class="dedalus-panel centrale-118-panel">
            <div class="dedalus-panel-head">
                <div><p class="eyebrow">Centrale operativa</p><h3>Nuova chiamata 118</h3></div>
                <button onclick="creaChiamataCentrale118()">Crea intervento</button>
            </div>
            <div class="central-dispatch-grid">
                <label>Codice<select id="centraleCodice">${CODICI_118.map(c => `<option value="${c}">${c}</option>`).join("")}</select></label>
                <label>Mezzo<select id="centraleMezzo">${MEZZI_118.map(m => `<option value="${m}">${m}</option>`).join("")}</select></label>
                <label>Ambulanza<select id="centraleAmbulanza"><option value="">Da assegnare</option>${ambulanze.map(a => `<option value="${escapeHtml(a.id)}">${escapeHtml(a.nome)}</option>`).join("")}</select></label>
                <label>Chiamante<input id="centraleChiamante" placeholder="Nome chiamante"></label>
                <label>Telefono<input id="centraleTelefono" placeholder="Numero"></label>
                <label>Paziente<input id="centralePaziente" placeholder="Cognome Nome / ignoto"></label>
                <label>Data nascita<input id="centraleNascita" type="date"></label>
                <label>Luogo<select id="centraleLuogo">${LUOGHI_118.map(v => `<option value="${v}">${v}</option>`).join("")}</select></label>
                <label>Evento<select id="centraleTipo">${TIPI_EVENTO_118.map(v => `<option value="${v}">${v}</option>`).join("")}</select></label>
                <label class="span-2">Indirizzo<input id="centraleIndirizzo" placeholder="Comune, via, civico, piano"></label>
                <label class="span-2">Motivo chiamata<textarea id="centraleMotivo" placeholder="Sintesi della chiamata"></textarea></label>
                <label class="span-2">Note centrale<textarea id="centraleNote" placeholder="Istruzioni, accesso, rischi, callback"></textarea></label>
            </div>
        </section>
    `;
}

const intervento118ListaViewDedalusBase = intervento118ListaView;
intervento118ListaView = function(app) {
    intervento118ListaViewDedalusBase(app);
    const panel = document.querySelector(".stats-grid");
    if (panel) panel.insertAdjacentHTML("afterend", centrale118AdminHTML());
};
