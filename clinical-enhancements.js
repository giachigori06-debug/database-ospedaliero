/* Migliorie cliniche finali: farmaci, decisione, notifiche e suoni */

const FARMACI_CATALOGO = [
    { categoria: "Analgesia", nome: "Paracetamolo", dose: "1 g", via: "EV/OS", note: "dolore lieve-moderato o febbre" },
    { categoria: "Analgesia", nome: "Ketorolac", dose: "30 mg", via: "EV/IM", note: "evitare in IRC, sanguinamento, ulcera" },
    { categoria: "Analgesia", nome: "Morfina", dose: "2-4 mg titolabili", via: "EV", note: "monitorare FR, PA, sedazione" },
    { categoria: "Analgesia", nome: "Fentanyl", dose: "25-50 mcg", via: "EV/IN", note: "dolore severo, titolare" },
    { categoria: "Antiemetici", nome: "Ondansetron", dose: "4 mg", via: "EV/OS", note: "nausea/vomito" },
    { categoria: "Antiemetici", nome: "Metoclopramide", dose: "10 mg", via: "EV/IM", note: "attenzione a effetti extrapiramidali" },
    { categoria: "Antibiotici", nome: "Ceftriaxone", dose: "2 g", via: "EV", note: "sepsi, polmonite, infezioni severe" },
    { categoria: "Antibiotici", nome: "Amoxicillina/Clavulanato", dose: "2.2 g", via: "EV", note: "infezioni respiratorie/addominali selezionate" },
    { categoria: "Antibiotici", nome: "Piperacillina/Tazobactam", dose: "4.5 g", via: "EV", note: "sepsi/addome complicato" },
    { categoria: "Cardio", nome: "Acido acetilsalicilico", dose: "250-300 mg", via: "OS", note: "sospetta SCA se non controindicato" },
    { categoria: "Cardio", nome: "Nitroglicerina", dose: "0.4 mg", via: "SL", note: "dolore toracico, se PA adeguata" },
    { categoria: "Cardio", nome: "Furosemide", dose: "20-40 mg", via: "EV", note: "congestione/scompenso" },
    { categoria: "Cardio", nome: "Amiodarone", dose: "300 mg", via: "EV", note: "aritmie selezionate, monitoraggio" },
    { categoria: "Respiratorio", nome: "Salbutamolo", dose: "2.5-5 mg", via: "Aerosol", note: "broncospasmo" },
    { categoria: "Respiratorio", nome: "Ipratropio", dose: "0.5 mg", via: "Aerosol", note: "BPCO/asma severa" },
    { categoria: "Respiratorio", nome: "Metilprednisolone", dose: "40-80 mg", via: "EV", note: "asma/BPCO, allergia" },
    { categoria: "Neurologia", nome: "Diazepam", dose: "5-10 mg", via: "EV/RET", note: "crisi convulsiva" },
    { categoria: "Neurologia", nome: "Levetiracetam", dose: "1-2 g", via: "EV", note: "crisi/terapia antiepilettica" },
    { categoria: "Emergenza", nome: "Adrenalina", dose: "1 mg", via: "EV", note: "ALS; oppure 0.5 mg IM in anafilassi" },
    { categoria: "Emergenza", nome: "Noradrenalina", dose: "0.05-0.5 mcg/kg/min", via: "EV", note: "shock, preferibile CVC/monitoraggio" },
    { categoria: "Metabolico", nome: "Glucosio 33%", dose: "20-30 ml", via: "EV", note: "ipoglicemia severa" },
    { categoria: "Metabolico", nome: "Insulina rapida", dose: "secondo schema", via: "SC/EV", note: "iperglicemia, monitorare K e glicemia" },
    { categoria: "Fluidi", nome: "Ringer lattato", dose: "500 ml", via: "EV", note: "bolo rivalutabile" },
    { categoria: "Fluidi", nome: "NaCl 0.9%", dose: "500 ml", via: "EV", note: "bolo/infusione, rivalutare" }
];

function ensureClinicalData(p) {
    if (!p.clinica) {
        p.clinica = {
            allergie: "",
            terapiaDomiciliare: "",
            anamnesi: "",
            esameObiettivo: "",
            diagnosiDifferenziale: "",
            piano: "",
            decisione: "Osservazione",
            destinazione: "",
            followUp: ""
        };
    }
    return p.clinica;
}

function farmaciOptionsHTML(selected = "") {
    const categorie = [...new Set(FARMACI_CATALOGO.map(f => f.categoria))];
    return categorie.map(cat => `
        <optgroup label="${escapeHtml(cat)}">
            ${FARMACI_CATALOGO.filter(f => f.categoria === cat).map(f => `<option value="${escapeHtml(f.nome)}" ${selected === f.nome ? "selected" : ""}>${escapeHtml(f.nome)} - ${escapeHtml(f.dose)} ${escapeHtml(f.via)}</option>`).join("")}
        </optgroup>
    `).join("");
}

function selectedFarmaco() {
    const nome = fieldValue("farmacoCatalogo");
    return FARMACI_CATALOGO.find(f => f.nome === nome) || FARMACI_CATALOGO[0];
}

function updateFarmacoPreview() {
    const f = selectedFarmaco();
    const box = document.getElementById("farmacoPreview");
    if (!box || !f) return;
    box.innerHTML = `<b>${escapeHtml(f.nome)}</b><span>${escapeHtml(f.categoria)} - ${escapeHtml(f.dose)} - ${escapeHtml(f.via)}</span><small>${escapeHtml(f.note)}</small>`;
}

function somministraFarmacoCatalogo() {
    const p = pazienteSelezionato;
    if (!p) return;
    if (!(hasPermission("patients:therapy") || hasPermission("patients:edit") || hasPermission("all"))) {
        alert("Non hai il permesso di registrare terapie.");
        return;
    }
    ensurePaziente(p);
    const f = selectedFarmaco();
    const dose = fieldValue("farmacoDoseSmart") || f.dose;
    const via = fieldValue("farmacoViaSmart") || f.via;
    const note = fieldValue("farmacoNoteSmart") || f.note;
    p.terapie.push({
        id: id(),
        time: new Date().toLocaleString(),
        farmaco: f.nome,
        dose,
        via,
        frequenza: fieldValue("farmacoFreqSmart") || "dose singola/rivalutare",
        note,
        operatore: medicoLoggato?.nome || ""
    });
    logAction(`Registrato farmaco da catalogo per ${p.nome} ${p.cognome}: ${f.nome} ${dose} ${via}`);
    playClinicalSound("therapy");
    salva();
    render();
}

function salvaSintesiClinica() {
    const p = pazienteSelezionato;
    if (!p) return;
    if (!(hasPermission("patients:edit") || hasPermission("all"))) {
        alert("Non hai il permesso di modificare la sintesi clinica.");
        return;
    }
    const c = ensureClinicalData(p);
    c.allergie = fieldValue("clinAllergie");
    c.terapiaDomiciliare = fieldValue("clinTerapiaDomiciliare");
    c.anamnesi = fieldValue("clinAnamnesi");
    c.esameObiettivo = fieldValue("clinEO");
    c.diagnosiDifferenziale = fieldValue("clinDD");
    c.piano = fieldValue("clinPiano");
    c.decisione = fieldValue("clinDecisione");
    c.destinazione = fieldValue("clinDestinazione");
    c.followUp = fieldValue("clinFollowUp");
    logAction(`Aggiornata sintesi clinica per ${p.nome} ${p.cognome}: ${c.decisione}`);
    salva();
    render();
}

function criticalityScore(p) {
    const par = p.parametri || {};
    let score = 0;
    if (p.codice === "Rosso") score += 4;
    if (p.codice === "Arancione") score += 2;
    const spo2 = Number(par.sat || par.spo2 || 0);
    const fc = Number(par.fc || 0);
    const gcs = Number(par.gcs || 0);
    const sys = parseSistolica(par.pa);
    if (spo2 && spo2 < 92) score += 2;
    if (fc && (fc > 120 || fc < 45)) score += 2;
    if (gcs && gcs < 14) score += 2;
    if (sys && sys < 95) score += 2;
    (p.esami || []).forEach(e => {
        const t = String(e.esito || "").toLowerCase();
        if (/urgente|aumentata|frattura|ischemico|troponina|sepsi|shock|grave/.test(t)) score += 1;
    });
    return score;
}

function enhanceClinicalUI() {
    if (pagina !== "cartella" || !pazienteSelezionato) return;
    const p = ensurePaziente(pazienteSelezionato);
    const c = ensureClinicalData(p);
    const grid = document.querySelector(".clinical-grid");
    if (!grid || document.getElementById("clinicalEnhancements")) return;
    const score = criticalityScore(p);
    const rischio = score >= 6 ? "alto" : score >= 3 ? "intermedio" : "basso";
    grid.insertAdjacentHTML("afterbegin", `
        <section id="clinicalEnhancements" class="work-panel span-2 clinical-command ${rischio}">
            <div class="panel-title-row">
                <h3>Inquadramento clinico</h3>
                <span class="risk-chip ${rischio}">Rischio ${rischio}</span>
                <button onclick="salvaSintesiClinica()">Salva sintesi</button>
            </div>
            <div class="form-grid compact">
                <label>Allergie<input id="clinAllergie" value="${escapeHtml(c.allergie)}" placeholder="NKDA / allergie note"></label>
                <label>Terapia domiciliare<input id="clinTerapiaDomiciliare" value="${escapeHtml(c.terapiaDomiciliare)}" placeholder="farmaci abituali"></label>
                <label>Decisione clinica<select id="clinDecisione">
                    ${["Osservazione", "Dimissione", "Ricovero", "Trasferimento", "Sala operatoria", "Terapia intensiva"].map(v => `<option ${c.decisione === v ? "selected" : ""}>${v}</option>`).join("")}
                </select></label>
                <label>Destinazione<input id="clinDestinazione" value="${escapeHtml(c.destinazione)}" placeholder="reparto, ambulatorio, domicilio"></label>
            </div>
            <div class="clinical-notes-grid">
                <textarea id="clinAnamnesi" placeholder="Anamnesi mirata">${escapeHtml(c.anamnesi)}</textarea>
                <textarea id="clinEO" placeholder="Esame obiettivo per apparati">${escapeHtml(c.esameObiettivo)}</textarea>
                <textarea id="clinDD" placeholder="Diagnosi differenziale / problemi attivi">${escapeHtml(c.diagnosiDifferenziale)}</textarea>
                <textarea id="clinPiano" placeholder="Piano clinico e rivalutazioni">${escapeHtml(c.piano)}</textarea>
                <textarea id="clinFollowUp" placeholder="Follow-up / indicazioni finali">${escapeHtml(c.followUp)}</textarea>
            </div>
        </section>
    `);

    const therapySection = [...document.querySelectorAll(".work-panel h3")].find(h => h.textContent.includes("Terapia farmacologica"))?.closest(".work-panel");
    if (therapySection && !document.getElementById("smartTherapy")) {
        therapySection.insertAdjacentHTML("afterbegin", `
            <div id="smartTherapy" class="smart-therapy">
                <div class="panel-title-row">
                    <h3>Farmaci da catalogo</h3>
                    <span class="mini-count">pronto uso</span>
                </div>
                <select id="farmacoCatalogo" onchange="updateFarmacoPreview()">${farmaciOptionsHTML()}</select>
                <div id="farmacoPreview" class="drug-preview"></div>
                <div class="form-grid compact">
                    <label>Dose<input id="farmacoDoseSmart" placeholder="usa dose standard o modifica"></label>
                    <label>Via<input id="farmacoViaSmart" placeholder="EV/OS/IM/SC/Aerosol"></label>
                    <label>Frequenza<input id="farmacoFreqSmart" placeholder="dose singola, ogni 8h, infusione..."></label>
                </div>
                <textarea id="farmacoNoteSmart" placeholder="note cliniche, risposta, controindicazioni"></textarea>
                <button onclick="somministraFarmacoCatalogo()">Registra farmaco</button>
            </div>
        `);
        updateFarmacoPreview();
    }
}

function playClinicalSound(kind = "info") {
    try {
        const audio = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        const freq = kind === "critical" ? 880 : kind === "referto" ? 660 : 520;
        osc.frequency.value = freq;
        osc.type = kind === "critical" ? "square" : "sine";
        gain.gain.setValueAtTime(0.0001, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, audio.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start();
        osc.stop(audio.currentTime + 0.24);
    } catch (error) {
        // Audio non disponibile: nessun blocco operativo.
    }
}

const originalRenderForClinical = render;
render = function enhancedRender() {
    originalRenderForClinical();
    enhanceClinicalUI();
};

const originalCompletaRefertiScaduti = completaRefertiScaduti;
completaRefertiScaduti = function enhancedCompletaRefertiScaduti(mostraAvviso = false) {
    const completati = originalCompletaRefertiScaduti(mostraAvviso);
    if (completati) playClinicalSound("referto");
    return completati;
};

const originalCambiaCodicePriorita = typeof cambiaCodicePriorita === "function" ? cambiaCodicePriorita : null;
if (originalCambiaCodicePriorita) {
    cambiaCodicePriorita = function enhancedCambiaCodicePriorita() {
        const prima = pazienteSelezionato?.codice;
        originalCambiaCodicePriorita();
        const dopo = pazienteSelezionato?.codice;
        if (prima && dopo && prima !== dopo) playClinicalSound(dopo === "Rosso" || dopo === "Arancione" ? "critical" : "info");
    };
}
