/* Sistema finale: ruoli essenziali, permessi admin, lista pazienti pulita */

const RUOLI_BASE = {
    admin: {
        label: "Amministratore",
        descrizione: "Gestisce utenti, ruoli, permessi, log, archivio e configurazione.",
        permissions: ["all"]
    },
    medico: {
        label: "Medico",
        descrizione: "Gestisce cartelle, referti, terapie, reparti, dimissioni e priorita clinica.",
        permissions: ["dashboard", "patients:view", "patients:create", "patients:edit", "patients:priority", "patients:discharge", "archive:view", "wards:all:view"]
    },
    infermiere: {
        label: "Infermiere",
        descrizione: "Accetta pazienti, registra parametri, terapie e diario assistenziale.",
        permissions: ["dashboard", "patients:view", "patients:create", "patients:vitals", "patients:therapy", "wards:all:view"]
    },
    soccorritore: {
        label: "Soccorritore",
        descrizione: "Accetta pazienti e registra prime informazioni operative.",
        permissions: ["dashboard", "patients:view", "patients:create"]
    }
};

function loadRoleConfig() {
    try {
        const saved = JSON.parse(localStorage.getItem("ruoliOspedale") || "null");
        if (!saved || typeof saved !== "object") return JSON.parse(JSON.stringify(RUOLI_BASE));
        const cleaned = JSON.parse(JSON.stringify(RUOLI_BASE));
        Object.keys(cleaned).forEach(key => {
            if (saved[key]) cleaned[key] = { ...cleaned[key], ...saved[key] };
        });
        return cleaned;
    } catch (error) {
        return JSON.parse(JSON.stringify(RUOLI_BASE));
    }
}

let ruoliConfig = loadRoleConfig();

medici = [
    { username: "admin", password: "1234567890", nome: "Amministratore", ruolo: "admin", reparto: "Direzione", matricola: "ADM-001", attivo: true },
    { username: "medico", password: "medico", nome: "Medico PS", ruolo: "medico", reparto: "Pronto Soccorso", matricola: "MED-001", attivo: true },
    { username: "infermiere", password: "inf", nome: "Infermiere Triage", ruolo: "infermiere", reparto: "Pronto Soccorso", matricola: "INF-001", attivo: true },
    { username: "accettazione", password: "acc", nome: "Accettazione PS", ruolo: "soccorritore", reparto: "Pronto Soccorso", matricola: "ACC-001", attivo: true }
];

function ruoloInfo(ruolo) {
    return ruoliConfig[ruolo] || ruoliConfig.infermiere;
}

function normalizzaUtente(utente) {
    const ruolo = ruoliConfig[utente.ruolo] ? utente.ruolo : "infermiere";
    return {
        ...utente,
        ruolo,
        reparto: utente.reparto || "",
        matricola: utente.matricola || "",
        attivo: utente.attivo !== false
    };
}

function utentiOspedale() {
    return [...medici, ...(personale || [])].map(normalizzaUtente);
}

function hasPermission(permission) {
    if (!medicoLoggato) return false;
    if (["patients:edit", "patients:priority"].includes(permission) && ["medico", "infermiere"].includes(medicoLoggato.ruolo)) return true;
    const permissions = ruoloInfo(medicoLoggato.ruolo).permissions || [];
    return permissions.includes("all") || permissions.includes(permission);
}

function requirePermission(permission, message = "Permesso non disponibile per il tuo ruolo.") {
    if (hasPermission(permission)) return true;
    alert(message);
    return false;
}

function canOpenPage(nomePagina) {
    if (!medicoLoggato) return false;
    if (hasPermission("all")) return true;
    if (["ps", "cartella", "prontoSoccorso"].includes(nomePagina)) return hasPermission("patients:view");
    if (nomePagina === "nuovo") return hasPermission("patients:create");
    if (nomePagina === "archivio") return hasPermission("archive:view");
    if (nomePagina === "personale") return hasPermission("staff:view") || hasPermission("all");
    if (nomePagina === "ricoveri") return hasPermission("wards:all:view");
    if (["chirurgia", "medicinaInterna", "ortopedia", "cardiologia", "neurologia", "rianimazione"].includes(nomePagina)) return hasPermission("wards:all:view");
    return false;
}

function ruoloOptionsHTML(selected = "medico") {
    return Object.entries(ruoliConfig).map(([key, role]) => `
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
        const target = button.getAttribute("onclick")?.match(/pagina='([^']+)'/)?.[1];
        if (!target) return;
        button.style.display = !medicoLoggato || canOpenPage(target) ? "" : "none";
    });
}

function ripristinaSessione() {
    if (medicoLoggato) return;
    try {
        const sessione = JSON.parse(localStorage.getItem("sessioneOperatore") || "null");
        const found = sessione?.username ? utentiOspedale().find(u => u.username === sessione.username && u.attivo !== false) : null;
        if (found) medicoLoggato = normalizzaUtente(found);
    } catch (error) {
        localStorage.removeItem("sessioneOperatore");
    }
}

function login(app) {
    app.innerHTML = `
        <div class="login-shell clean-login">
            <section class="login-panel modern-login-panel">
                <div class="login-card-header">
                    <div class="login-brandline">
                        <img class="login-logo" src="assets/icons/hospital-db-logo.png" alt="">
                        <div>
                            <p class="eyebrow">Accesso operatori</p>
                            <h1>Database Ospedaliero</h1>
                            <span>Ambiente clinico operativo</span>
                        </div>
                    </div>
                    <div class="login-feature-grid">
                        <div><img src="assets/icons/patient-boy.png" alt=""><b>Pazienti</b><span>Triage, cartella e andamento</span></div>
                        <div><img src="assets/icons/microscope.png" alt=""><b>Diagnostica</b><span>Laboratorio, RX, TC ed ECG</span></div>
                        <div><img src="assets/icons/iv-bag.png" alt=""><b>Reparti</b><span>Letti, terapie e procedure</span></div>
                    </div>
                </div>
                <div class="login-form">
                    <div class="login-form-head">
                        <img src="assets/icons/doctor-cross.png" alt="">
                        <div>
                            <h2>Identificazione</h2>
                            <span>Ruoli e permessi vengono applicati dopo l'accesso.</span>
                        </div>
                    </div>
                    <label>Username<input id="user" autocomplete="username" placeholder="username"></label>
                    <label>Password<input id="pass" type="password" autocomplete="current-password" placeholder="password"></label>
                    <button onclick="doLogin()"><img class="button-icon" src="assets/icons/doctor-cross.png" alt=""> <span>Accedi al portale</span></button>
                </div>
            </section>
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
        document.body.classList.add("logged-out");
        document.body.classList.remove("logged-in");
        login(app);
        return;
    }
    document.body.classList.add("logged-in");
    document.body.classList.remove("logged-out");
    completaRefertiScaduti(false);
    if (!canOpenPage(pagina)) {
        app.innerHTML = `
            <section class="work-panel access-denied">
                <p class="eyebrow">Accesso negato</p>
                <h2>Area non disponibile</h2>
                <p>Il profilo ${escapeHtml(ruoloInfo(medicoLoggato.ruolo).label)} non ha i permessi necessari.</p>
                <button onclick="pagina='ps'; render()">Torna alla lista pazienti</button>
            </section>
        `;
        return;
    }
    if (pagina === "prontoSoccorso") prontoSoccorsoView(app);
    if (pagina === "ps") lista(app);
    if (pagina === "nuovo") nuovo(app);
    if (pagina === "cartella") cartella(app);
    if (pagina === "archivio") archivioView(app);
    if (pagina === "personale") personaleView(app);
    if (pagina === "ricoveri") ricoveriView(app);
    if (pagina === "chirurgia") chirurgiaView(app);
    if (pagina === "medicinaInterna") medicinaInternaView(app);
    if (pagina === "ortopedia") ortopediaView(app);
    if (pagina === "cardiologia") cardiologiaView(app);
    if (pagina === "neurologia") neurologiaView(app);
    if (pagina === "rianimazione") rianimazioneView(app);
    enhanceCurrentView();
    ensureSessionBar();
    aggiornaSidebarPermessi();
}

function ensureSessionBar() {
    const app = document.getElementById("app");
    if (!app || document.getElementById("sessionBar")) return;
    app.insertAdjacentHTML("afterbegin", `
        <div id="sessionBar" class="session-bar">
            <div>
                <b>${escapeHtml(medicoLoggato.nome)}</b>
                <span>${escapeHtml(ruoloInfo(medicoLoggato.ruolo).label)}</span>
            </div>
            <button onclick="logout()">Logout</button>
        </div>
    `);
}

function lista(app) {
    pazienti.forEach(ensurePaziente);
    const pazientiPS = pazienti.filter(p => p.reparto === "ps");
    const testoRicerca = ricercaPazienti.toLowerCase();
    const pazientiFiltrati = pazientiPS
        .filter(p => filtroTriage === "Tutti" || p.codice === filtroTriage)
        .filter(p => `${p.nome} ${p.cognome} ${p.cf} ${p.motivo}`.toLowerCase().includes(testoRicerca))
        .sort((a, b) => triageWeight(a.codice) - triageWeight(b.codice));
    const counts = { Rosso: 0, Arancione: 0, Azzurro: 0, Verde: 0, Bianco: 0 };
    pazientiPS.forEach(p => { if (counts[p.codice] !== undefined) counts[p.codice]++; });
    const referti = pazientiPS.reduce((tot, p) => tot + refertiPendenti(p), 0);

    app.innerHTML = `
        <div class="page-header clean-header">
            <div>
                <p class="eyebrow">Pronto Soccorso</p>
                <h2>Lista pazienti</h2>
            </div>
            <div class="header-actions">
                <span class="operator-chip">${escapeHtml(medicoLoggato.nome)} - ${escapeHtml(ruoloInfo(medicoLoggato.ruolo).label)}</span>
                ${hasPermission("patients:create") ? `<button onclick="pagina='nuovo'; render()">Nuovo paziente</button>` : ""}
                ${hasPermission("all") ? `<button onclick="pagina='personale'; render()">Gestione personale</button>` : ""}
                <button onclick="logout()">Logout</button>
            </div>
        </div>
        <section class="stats-grid">
            ${["Rosso", "Arancione", "Azzurro", "Verde", "Bianco"].map(c => `
                <button class="stat-card triage-${triageClass(c)}" onclick="setFiltroTriage('${c}')"><span>${c}</span><b>${counts[c]}</b></button>
            `).join("")}
        </section>
        <section class="work-panel patient-board">
            <div class="panel-title-row">
                <h3>Pazienti in PS</h3>
                <span class="mini-count">${pazientiFiltrati.length} visibili</span>
                <span class="mini-count">${referti} referti in attesa</span>
            </div>
            <div class="filters-row">
                <input id="ricercaPazienti" placeholder="Cerca paziente, CF o motivo" value="${escapeHtml(ricercaPazienti)}" oninput="setRicercaPazienti(this.value)">
                <select onchange="setFiltroTriage(this.value)">
                    ${["Tutti", "Rosso", "Arancione", "Azzurro", "Verde", "Bianco"].map(c => `<option value="${c}" ${filtroTriage === c ? "selected" : ""}>${c}</option>`).join("")}
                </select>
            </div>
            <div class="patient-list clean-patient-list">
                ${pazientiFiltrati.map(p => `
                    <article class="paziente ${triageClass(p.codice)}">
                        <div class="patient-main">
                            <span class="triage-badge ${triageClass(p.codice)}">${escapeHtml(p.codice)}</span>
                            <div>
                                <h4>${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</h4>
                                <p>${escapeHtml(p.motivo || "Motivo non indicato")}</p>
                                <small>${escapeHtml(p.cf || "CF non indicato")} - ${refertiPendenti(p)} referti in attesa</small>
                            </div>
                        </div>
                        <div class="patient-actions">
                            <button onclick="apri('${p.id}')">Apri</button>
                            ${hasPermission("patients:priority") ? `<button onclick="apri('${p.id}'); setTimeout(() => document.getElementById('codicePrioritaSelect')?.focus(), 50)">Priorita</button>` : ""}
                            ${hasPermission("all") ? `<button class="danger" onclick="event.stopPropagation(); eliminaPaziente('${p.id}')">Elimina</button>` : ""}
                        </div>
                    </article>
                `).join("") || `<div class="empty-state">Nessun paziente corrisponde ai filtri.</div>`}
            </div>
        </section>
    `;
}

function enhanceCurrentView() {
    if (pagina !== "cartella" || !pazienteSelezionato) return;
    const summary = document.querySelector(".clinical-summary");
    if (!summary || document.getElementById("priorityPanel")) return;
    summary.insertAdjacentHTML("afterend", `
        <section id="priorityPanel" class="work-panel priority-panel">
            <div class="panel-title-row">
                <h3>Priorita clinica</h3>
                <span class="triage-badge ${triageClass(pazienteSelezionato.codice)}">${escapeHtml(pazienteSelezionato.codice)}</span>
            </div>
            <select id="codicePrioritaSelect" ${hasPermission("patients:priority") ? "" : "disabled"}>
                ${["Rosso", "Arancione", "Azzurro", "Verde", "Bianco"].map(c => `<option value="${c}" ${pazienteSelezionato.codice === c ? "selected" : ""}>${c}</option>`).join("")}
            </select>
            <textarea id="motivoCambioCodice" placeholder="Motivo del cambio codice priorita" ${hasPermission("patients:priority") ? "" : "disabled"}></textarea>
            <button onclick="cambiaCodicePriorita()" ${hasPermission("patients:priority") ? "" : "disabled"}>Aggiorna codice</button>
        </section>
    `);
}

function cambiaCodicePriorita() {
    if (!requirePermission("patients:priority", "Non hai il permesso di modificare il codice priorita.")) return;
    const nuovoCodice = fieldValue("codicePrioritaSelect");
    const motivo = fieldValue("motivoCambioCodice") || "Motivo non specificato";
    const p = pazienti.find(x => x.id === pazienteSelezionato?.id);
    if (!p || !nuovoCodice || p.codice === nuovoCodice) return;
    const precedente = p.codice;
    p.codice = nuovoCodice;
    pazienteSelezionato = p;
    logAction(`Cambio codice priorita ${p.nome} ${p.cognome}: ${precedente} -> ${nuovoCodice}. Motivo: ${motivo}`);
    salva();
    render();
}

function gravitaClinica(esame, p) {
    const testo = `${esame?.richiedente || ""} ${p?.motivo || ""}`.toLowerCase();
    let score = 0;
    if (p?.codice === "Rosso") score += 3;
    if (p?.codice === "Arancione") score += 2;
    if (/shock|stemi|infarto|ictus|sepsi|coma|politrauma|emorrag|dispnea|dolore toracico/.test(testo)) score += 2;
    if (/dolore|febbre|trauma|sincope|addome/.test(testo)) score += 1;
    score += numeroCasuale(0, 2);
    return score >= 5 ? "grave" : score >= 3 ? "moderata" : "lieve";
}

function refertoPerEsame(esame, p) {
    const nome = esame.nome || esame.tipo || "Esame";
    const gravita = gravitaClinica(esame, p);
    if (nome.includes("ECG")) {
        if (gravita === "grave") return "Tachicardia sinusale con sottoslivellamento ST diffuso e alterazioni aspecifiche della ripolarizzazione. Quadro da rivalutare urgentemente con clinica e troponine seriali.";
        if (gravita === "moderata") return "Ritmo sinusale. Alterazioni minori della ripolarizzazione antero-laterale, non sopraslivellamento ST. Controllo seriato consigliato.";
        return "Ritmo sinusale. Non alterazioni ischemiche acute evidenti, conduzione nei limiti.";
    }
    if (nome.includes("Troponina")) {
        if (gravita === "grave") return "Troponina significativamente aumentata con andamento compatibile con danno miocardico acuto. Indicata valutazione cardiologica urgente.";
        if (gravita === "moderata") return "Troponina lievemente aumentata/borderline. Necessario controllo seriato e correlazione con ECG e sintomi.";
        return "Troponina nei limiti al prelievo attuale.";
    }
    if (nome.includes("TAC cranio")) {
        if (gravita === "grave") return "Ipodensita cortico-sottocorticale sospetta per evento ischemico recente. Non emorragia. Indicata valutazione neurologica/stroke.";
        if (gravita === "moderata") return "Non emorragia acuta. Minimi segni vascolari cronici; quadro da correlare con clinica neurologica.";
        return "Non evidenza di emorragia endocranica o lesioni acute all'esame basale.";
    }
    if (nome.startsWith("RX")) {
        if (gravita === "grave") return `Esame ${nome}: evidenza di frattura composta/scomposta nel distretto esaminato con tumefazione dei tessuti molli. Indicata valutazione ortopedica.`;
        if (gravita === "moderata") return `Esame ${nome}: non fratture scomposte, possibile infrazione/lesione minore da correlare con dolore puntiforme.`;
        return `Esame ${nome}: non evidenza di lesioni ossee acute. Rapporti articolari conservati.`;
    }
    if (nome.includes("Emocromo") || nome.includes("PCR") || nome.includes("PCT")) {
        if (gravita === "grave") return "Leucocitosi neutrofila marcata con PCR/PCT aumentate. Quadro compatibile con infezione sistemica importante; rivalutazione clinica urgente.";
        if (gravita === "moderata") return "Indici di flogosi aumentati in modo moderato. Utile correlazione con quadro clinico e follow-up laboratoristico.";
        return "Esami ematochimici senza alterazioni acute clinicamente rilevanti.";
    }
    if (nome.includes("Consulenza")) {
        if (gravita === "grave") return "Valutazione specialistica: quadro clinico impegnativo, indicato ricovero/monitoraggio stretto e completamento diagnostico urgente.";
        if (gravita === "moderata") return "Valutazione specialistica: indicata osservazione e rivalutazione dopo terapia/esami seriati.";
        return "Valutazione specialistica: non indicazioni a trattamento urgente, possibile dimissione protetta se quadro stabile.";
    }
    if (gravita === "grave") return "Referto con reperti acuti potenzialmente rilevanti. Indicata rivalutazione medica urgente.";
    if (gravita === "moderata") return "Reperti lievi-moderati da correlare con clinica e andamento osservazionale.";
    return "Non evidenza di reperti acuti maggiori.";
}

function generaECG() {
    const p = pazienteSelezionato;
    if (!p) return;
    const gravita = gravitaClinica({ nome: "ECG", richiedente: p.motivo }, p);
    const fcBase = Number(p.parametri?.fc || 72);
    const ritmo = gravita === "grave"
        ? "Tachicardia con alterazioni ST-T"
        : gravita === "moderata"
            ? "Ritmo sinusale con alterazioni aspecifiche"
            : fcBase > 110 ? "Tachicardia sinusale" : fcBase < 55 ? "Bradicardia sinusale" : "Ritmo sinusale";
    p.ecgHistory.push({
        id: id(),
        time: new Date().toLocaleString(),
        fc: String(fcBase || (gravita === "grave" ? 128 : 72)),
        ritmo,
        gravita,
        referto: refertoPerEsame({ nome: "ECG", richiedente: p.motivo }, p),
        operatore: medicoLoggato?.nome || ""
    });
    logAction("Generato ECG " + gravita + " per " + p.nome + " " + p.cognome);
    salva();
    render();
}

function adminStatsHTML() {
    const referti = pazienti.reduce((tot, p) => tot + refertiPendenti(ensurePaziente(p)), 0);
    return `<section class="admin-stats">
        <div><b>${utentiOspedale().length}</b><span>Operatori</span></div>
        <div><b>${pazienti.length}</b><span>Pazienti</span></div>
        <div><b>${archivio.length}</b><span>Archivio</span></div>
        <div><b>${referti}</b><span>Referti attesi</span></div>
    </section>`;
}

function personaleView(app) {
    if (!hasPermission("all")) {
        alert("Solo l'amministratore può gestire ruoli e permessi.");
        pagina = "ps";
        render();
        return;
    }
    const utenti = utentiOspedale();
    app.innerHTML = `
        <div class="page-header">
            <div><p class="eyebrow">Amministrazione</p><h2>Gestione personale, profili e password</h2></div>
            <div class="header-actions"><button onclick="pagina='ps'; render()">Torna</button></div>
        </div>
        ${adminStatsHTML()}
        <div class="admin-grid">
            <section class="work-panel">
                <div class="panel-title-row">
                    <h3>Crea profilo</h3>
                    <span class="mini-count">username + password</span>
                </div>
                <label>Username<input id="nuovoUser" placeholder="es. mrossi"></label>
                <label>Password provvisoria<input id="nuovoPass" type="password" placeholder="password"></label>
                <label>Nome e cognome<input id="nuovoNome" placeholder="Mario Rossi"></label>
                <label>Matricola<input id="nuovaMatricola" placeholder="MED-024"></label>
                <label>Ruolo<select id="nuovoRuolo">${ruoloOptionsHTML("medico")}</select></label>
                <label>Reparto / servizio<input id="nuovoReparto" placeholder="Pronto Soccorso"></label>
                <button onclick="aggiungiPersonale()">Crea operatore</button>
            </section>
            <section class="work-panel">
                <div class="panel-title-row">
                    <h3>Permessi ruoli</h3>
                    <span class="mini-count">modificabili</span>
                </div>
                <div class="role-matrix">
                    ${Object.entries(ruoliConfig).map(([key, role]) => `
                        <article>
                            <b>${escapeHtml(role.label)}</b>
                            <p>${escapeHtml(role.descrizione)}</p>
                            <textarea id="perm_${escapeHtml(key)}">${escapeHtml(role.permissions.join(", "))}</textarea>
                            <button onclick="salvaPermessiRuolo('${escapeHtml(key)}')">Salva permessi</button>
                        </article>
                    `).join("")}
                </div>
            </section>
        </div>
        <section class="work-panel">
            <div class="panel-title-row">
                <h3>Personale registrato</h3>
                <span class="mini-count">${utenti.length}</span>
            </div>
            <div class="staff-table">
                ${utenti.map(u => `<article>
                    <div><b>${escapeHtml(u.nome)}</b><small>${escapeHtml(u.username)} ${u.matricola ? "- " + escapeHtml(u.matricola) : ""}</small></div>
                    <span>${escapeHtml(ruoloInfo(u.ruolo).label)}</span>
                    <span>${escapeHtml(u.reparto || "")}</span>
                    <span>${u.attivo === false ? "Disattivo" : "Attivo"}</span>
                    ${medici.some(m => m.username === u.username) ? `<button disabled>Protetto</button>` : `<button class="danger" onclick="eliminaPersonale('${escapeHtml(u.username)}')">Revoca</button>`}
                </article>`).join("")}
            </div>
        </section>
        <section class="work-panel"><h3>Log</h3><div class="log-list audit-log">${(logAzioni || []).slice().reverse().map(l => `<div>${escapeHtml(`[${l.time}] ${l.user} (${l.ruolo}) -> ${l.azione}`)}</div>`).join("")}</div></section>
    `;
}

function salvaPermessiRuolo(ruolo) {
    if (!hasPermission("all")) return;
    const value = fieldValue("perm_" + ruolo);
    ruoliConfig[ruolo].permissions = value.split(",").map(p => p.trim()).filter(Boolean);
    localStorage.setItem("ruoliOspedale", JSON.stringify(ruoliConfig));
    logAction("Aggiornati permessi ruolo " + ruoloInfo(ruolo).label);
    render();
}

function aggiungiPersonale() {
    if (!requirePermission("all", "Solo l'amministratore può creare utenti.")) return;
    const username = fieldValue("nuovoUser");
    const password = document.getElementById("nuovoPass")?.value || "";
    const nome = fieldValue("nuovoNome");
    const ruolo = fieldValue("nuovoRuolo") || "infermiere";
    if (!username || !password || !nome) return alert("Username, password e nome sono obbligatori.");
    if (utentiOspedale().some(u => u.username === username)) return alert("Username già presente.");
    personale.push(normalizzaUtente({ username, password, nome, ruolo, reparto: fieldValue("nuovoReparto"), matricola: fieldValue("nuovaMatricola"), attivo: true }));
    logAction("Creato operatore " + username);
    salva();
    render();
}

function eliminaPersonale(username) {
    if (!requirePermission("all", "Solo l'amministratore può revocare utenti.")) return;
    if (medici.some(u => u.username === username)) return alert("Gli account demo sono protetti.");
    if (!confirm("Revocare l'accesso a " + username + "?")) return;
    personale = personale.filter(p => p.username !== username);
    logAction("Revocato accesso operatore " + username);
    salva();
    render();
}
