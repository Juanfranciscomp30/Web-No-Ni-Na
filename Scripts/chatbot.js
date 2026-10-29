/* =========================================================
   NoNiBot — asistente que lleva al cliente DIRECTO a WhatsApp
   Recoge 4 datos rápidos (evento, fecha, lugar, nombre) y abre
   WhatsApp con el mensaje ya escrito. Depende de config.js.
   ========================================================= */

// Preguntas frecuentes: se usan en la sección FAQ de la página y en el chat.
// En el chat, TODAS las respuestas terminan empujando a WhatsApp.
const FAQS = [
    {
        id: "precio",
        q: "¿Cuánto cuesta contratar la charanga?",
        a: "Cada fiesta es distinta: depende del tipo de evento, las horas y el sitio. Escríbenos por WhatsApp y te damos precio cerrado, rápido y sin compromiso.",
        keys: ["precio", "cuesta", "cuanto", "presupuesto", "tarifa", "coste", "cobrais", "vale", "dinero", "euros"]
    },
    {
        id: "dispo",
        q: "¿Tenéis disponibilidad para mi fecha?",
        a: "En temporada de ferias y bodas las fechas vuelan 🔥. Mándanos el día por WhatsApp y te decimos al momento si está libre.",
        keys: ["disponib", "fecha", "libre", "dia", "cuando", "agenda", "hueco"]
    },
    {
        id: "duracion",
        q: "¿Cuánto tiempo tocáis?",
        a: "Lo que necesites: desde una sorpresa de 30–60 minutos hasta pasacalles de varias horas. Lo ajustamos a tu fiesta.",
        keys: ["tiempo", "duracion", "horas", "hora", "dura", "rato"]
    },
    {
        id: "musicos",
        q: "¿Cuántos músicos sois?",
        a: "Nos adaptamos al evento: formación reducida para algo íntimo o la charanga al completo para que retumbe la calle.",
        keys: ["musicos", "cuantos sois", "componentes", "miembros", "grupo", "instrumentos", "formacion"]
    },
    {
        id: "repertorio",
        q: "¿Qué canciones tocáis?",
        a: "Pasodobles, clásicos de feria, pop español, reguetón, rumbas, éxitos del verano… y si tienes una canción especial, la preparamos.",
        keys: ["cancion", "canciones", "repertorio", "tocais", "musica", "tema", "temas", "estilo", "pasodoble"]
    },
    {
        id: "zona",
        q: "¿Hasta dónde os desplazáis?",
        a: "Somos de Málaga y tocamos en toda la provincia y la Costa del Sol. También salimos fuera: hemos tocado en Granada y en Burgos. Dinos dónde es y te damos precio con el desplazamiento incluido.",
        keys: ["zona", "donde", "desplaz", "viaj", "lejos", "provincia", "pueblo", "sitio", "malaga", "alhaurin", "kilometro"]
    },
    {
        id: "reserva",
        q: "¿Cómo reservo la fecha?",
        a: "Súper fácil: nos escribes por WhatsApp, te pasamos el presupuesto y, cuando lo confirmes, la fecha queda guardada para ti.",
        keys: ["reserv", "contratar", "contrato", "senal", "confirmar", "apalabrar", "bloquear"]
    },
    {
        id: "pago",
        q: "¿Cómo se paga?",
        a: "Normalmente una señal al reservar y el resto el día del evento. Transferencia, Bizum o efectivo.",
        keys: ["pago", "pagar", "bizum", "transferencia", "efectivo", "tarjeta", "factura"]
    },
    {
        id: "sorpresa",
        q: "¿Podéis dar una sorpresa?",
        a: "¡Es nuestra especialidad! Nos coordinamos contigo por WhatsApp para aparecer en el momento justo sin que nadie se entere.",
        keys: ["sorpresa", "sorprender", "despedida", "cumple", "cumpleanos", "aniversario"]
    },
    {
        id: "premios",
        q: "¿Habéis ganado algún premio?",
        a: "¡Unos cuantos! 🏆 Mejor Charanga y Mejor Percusión 2025 en el Festival Nacional de Charangas de Poza de la Sal (Burgos), y Primer Premio en el VI Festival de Charangas Villa de Padul 2026. En 2026 volvimos a Poza como charanga invitada. Tienes los vídeos en la sección de Premios.",
        keys: ["premio", "premios", "ganado", "ganador", "concurso", "festival", "campeon", "mejor charanga", "poza", "padul", "trofeo", "logro"]
    }
];

const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const esc = s => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const Chat = (() => {
    const panel = document.getElementById("chat-panel");
    const toggle = document.getElementById("chat-toggle");
    const nudge = document.getElementById("chat-nudge");
    const body = document.getElementById("chat-body");
    const quick = document.getElementById("chat-quick");
    const form = document.getElementById("chat-form");
    const input = document.getElementById("chat-text");

    let started = false;
    let lead = null;      // datos que va dando el cliente
    let step = null;      // paso actual del flujo: evento | fecha | lugar | nombre

    // ---------- Pintar mensajes ----------
    function add(html, who = "bot") {
        const div = document.createElement("div");
        div.className = `msg ${who}`;
        div.innerHTML = html;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
        return div;
    }
    function addUser(text) { add("", "user").textContent = text; }
    function botSay(html, delay = 600) {
        return new Promise(res => {
            const t = add("<span></span><span></span><span></span>", "bot");
            t.classList.add("typing");
            setTimeout(() => {
                t.classList.remove("typing");
                t.innerHTML = html;
                t.style.animation = "none"; void t.offsetWidth; t.style.animation = "";
                body.scrollTop = body.scrollHeight;
                res();
            }, delay);
        });
    }
    function setQuick(options) {
        quick.innerHTML = "";
        options.forEach(o => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "quick" + (o.cls ? " " + o.cls : "");
            b.textContent = o.label;
            b.addEventListener("click", () => { if (!o.silent) addUser(o.label); o.action(); });
            quick.appendChild(b);
        });
        quick.scrollLeft = 0;
    }
    function setPlaceholder(t) { input.placeholder = t || "Escribe aquí…"; }

    const waButton = (msg, label = "Abrir WhatsApp") =>
        `<a class="msg-btn" href="${waLink(msg)}" target="_blank" rel="noopener" data-wa>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
            ${label}</a>`;

    // ---------- Menú principal: todo lleva a contratar / WhatsApp ----------
    function mainMenu() {
        step = null;
        setPlaceholder("Escribe tu pregunta…");
        setQuick([
            { label: "🎉 Quiero contratar la charanga", cls: "pink", action: startLead },
            { label: "💬 Ir directo a WhatsApp", cls: "wa", action: directWhatsApp },
            { label: "💰 Precio", action: () => answer("precio") },
            { label: "📅 ¿Tenéis mi fecha?", action: () => answer("dispo") },
            { label: "🏆 Premios", action: () => answer("premios") },
            { label: "🥳 Sorpresas", action: () => answer("sorpresa") },
            { label: "🎺 Repertorio", action: () => answer("repertorio") }
        ]);
    }

    async function answer(id) {
        const f = FAQS.find(x => x.id === id);
        await botSay(`${f.a}<br>${waButton(`¡Hola No Ni Ná! 🎺 Tengo una pregunta: ${f.q}`, "Preguntar por WhatsApp")}`);
        setQuick([
            { label: "🎉 Quiero contratar", cls: "pink", action: startLead },
            { label: "❓ Otra pregunta", action: async () => { await botSay("¡Dispara! Escríbela o elige una 👇", 350); mainMenu(); } }
        ]);
    }

    async function directWhatsApp() {
        await botSay(`¡Vamos! Te atendemos en persona 👇${waButton("¡Hola No Ni Ná! 🎺 Vengo de la web y quiero información para mi evento.")}`, 400);
        mainMenu();
    }

    // ---------- Flujo de contratación (4 pasos) ----------
    async function startLead() {
        lead = {};
        step = "evento";
        await botSay("¡Qué bien! 🥳 Te hago <strong>4 preguntas rapidísimas</strong> y te paso con la charanga por WhatsApp con todo ya escrito.<br><br>¿Qué celebras?");
        setPlaceholder("O escribe el tipo de evento…");
        setQuick([
            ...NONINA.eventos.map(e => ({ label: e, action: () => next(e) })),
            { label: "Otro", action: () => { setPlaceholder("¿Qué celebras?"); input.focus(); } }
        ]);
    }

    async function next(value) {
        if (step === "evento") {
            lead.evento = value;
            step = "fecha";
            await botSay(`¡${esc(value)}, nos encanta! 🎺 ¿Para cuándo es?`);
            setPlaceholder("Ej: 14 de junio, o 'en verano'");
            setQuick([
                { label: "📅 Elegir día exacto", action: pickDate, silent: true },
                { label: "Este mes", action: () => next("este mes") },
                { label: "Próximos 3 meses", action: () => next("en los próximos 3 meses") },
                { label: "Aún no lo sé", action: () => next("aún sin fecha cerrada") }
            ]);
        } else if (step === "fecha") {
            lead.fecha = value;
            step = "lugar";
            await botSay("¿Y dónde será la fiesta? 📍 <small>(pueblo o ciudad)</small>");
            setPlaceholder("Ej: Marbella, Antequera, Málaga…");
            setQuick([
                { label: "Málaga capital", action: () => next("Málaga capital") },
                { label: "Costa del Sol", action: () => next("Costa del Sol") },
                { label: "Provincia de Málaga", action: () => { setPlaceholder("¿Qué pueblo?"); input.focus(); } },
                { label: "Fuera de Málaga", action: () => { setPlaceholder("¿Dónde es?"); input.focus(); } }
            ]);
            input.focus({ preventScroll: true });
        } else if (step === "lugar") {
            lead.lugar = value;
            step = "nombre";
            await botSay("¡Última! ¿Cómo te llamas? 😊");
            setPlaceholder("Tu nombre");
            setQuick([]);
            input.focus({ preventScroll: true });
        } else if (step === "nombre") {
            lead.nombre = value;
            step = null;
            finishLead();
        }
    }

    function pickDate() {
        // Selector de fecha nativo dentro del chat
        const d = add(`<input type="date" class="chat-date" min="${new Date().toISOString().split("T")[0]}">`, "user");
        const inp = d.querySelector("input");
        inp.focus();
        try { inp.showPicker && inp.showPicker(); } catch (e) { /* algunos navegadores no lo permiten */ }
        inp.addEventListener("change", () => {
            const txt = new Date(inp.value + "T12:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
            d.textContent = txt;
            next(txt);
        }, { once: true });
    }

    async function finishLead() {
        const msg = [
            `¡Hola No Ni Ná! 🎺 Soy ${lead.nombre} y quiero contratar la charanga:`,
            "",
            `🎉 Evento: ${lead.evento}`,
            `📅 Fecha: ${lead.fecha}`,
            `📍 Lugar: ${lead.lugar}`,
            "",
            "¿Tenéis disponibilidad y me pasáis presupuesto?"
        ].join("\n");

        await botSay(`¡Perfecto, <strong>${esc(lead.nombre)}</strong>! Esto es lo que le mando a la charanga:
            <div class="lead-card">
                <div>🎉 ${esc(lead.evento)}</div>
                <div>📅 ${esc(lead.fecha)}</div>
                <div>📍 ${esc(lead.lugar)}</div>
            </div>`, 700);
        await botSay(`Pulsa el botón, dale a <strong>enviar</strong> en WhatsApp y te respondemos con disponibilidad y precio 🔥
            ${waButton(msg, "Enviar a la charanga")}
            <small class="d-block mt-2 text-secondary">Sin compromiso · las fechas de temporada vuelan</small>`, 600);
        if (typeof window.fireConfetti === "function") window.fireConfetti(panel);
        setPlaceholder("Escribe tu pregunta…");
        setQuick([
            { label: "✏️ Cambiar datos", action: startLead },
            { label: "❓ Tengo otra duda", action: async () => { await botSay("¡Claro! Pregúntame 👇", 350); mainMenu(); } }
        ]);
    }

    // ---------- Texto libre ----------
    function findFaq(text) {
        const t = norm(text);
        let best = null, score = 0;
        FAQS.forEach(f => {
            const s = f.keys.reduce((acc, k) => acc + (t.includes(norm(k)) ? k.length : 0), 0);
            if (s > score) { score = s; best = f; }
        });
        return best;
    }
    async function handleText(text) {
        // Si estamos en el flujo de contratación, lo escrito es la respuesta al paso actual
        if (step) return next(text);

        const t = norm(text);
        if (/(contratar|reservar|quiero la charanga|quiero contrat|me interesa)/.test(t)) return startLead();
        if (/^(hola|buenas|hey|ey|holi|saludos)/.test(t)) {
            await botSay("¡Holaaa! 👋 ¿Tienes una fiesta a la vista? Te paso con la charanga en un momento.");
            return mainMenu();
        }
        if (/(whats|wasap|guasap|humano|persona|llamar|telefono|hablar)/.test(t)) return directWhatsApp();
        if (/(gracias|genial|perfecto|vale|ok)\b/.test(t) && t.length < 25) {
            await botSay("¡A ti! 🎺 Cuando quieras, nos escribes por WhatsApp.");
            return mainMenu();
        }
        const f = findFaq(text);
        if (f) return answer(f.id);
        await botSay(`¡Buena pregunta! Eso te lo responde mejor la charanga en persona 😉${waButton("¡Hola No Ni Ná! 🎺 Tengo una pregunta: " + text, "Preguntar por WhatsApp")}`);
        mainMenu();
    }

    // ---------- Abrir / cerrar ----------
    async function open(mode) {
        hideNudge();
        panel.classList.add("open");
        panel.setAttribute("aria-hidden", "false");
        toggle.classList.add("seen", "hidden");
        toggle.setAttribute("aria-expanded", "true");
        if (!started) {
            started = true;
            await botSay("¡Hola! Soy <strong>NoNiBot</strong> 🐰🎺 de la charanga ganadora de <strong>Mejor Charanga 2025</strong> 🏆", 450);
            if (mode === "contratar") return startLead();
            await botSay("¿Tienes una boda, feria, despedida o fiesta? Te pongo <strong>directo en WhatsApp con la charanga</strong> en menos de un minuto.", 600);
            mainMenu();
        } else if (mode === "contratar" && !step) {
            startLead();
        }
        if (!isTouchDevice) setTimeout(() => input.focus({ preventScroll: true }), 350);
    }
    function close() {
        panel.classList.remove("open");
        panel.setAttribute("aria-hidden", "true");
        toggle.classList.remove("hidden");
        toggle.setAttribute("aria-expanded", "false");
    }

    // ---------- Globito de aviso para captar la atención ----------
    const isTouchDevice = window.matchMedia("(hover: none)").matches;
    function hideNudge() { nudge && nudge.classList.remove("show"); }
    function showNudge() {
        if (!nudge || panel.classList.contains("open")) return;
        try { if (sessionStorage.getItem("nonina-nudge")) return; sessionStorage.setItem("nonina-nudge", "1"); } catch (e) { /* sin storage: se muestra igual */ }
        nudge.classList.add("show");
    }
    setTimeout(showNudge, 7000);
    if (nudge) {
        nudge.querySelector(".nudge-text").addEventListener("click", () => open("contratar"));
        nudge.querySelector(".nudge-close").addEventListener("click", e => { e.stopPropagation(); hideNudge(); });
    }

    // ---------- Eventos ----------
    toggle.addEventListener("click", () => open());
    document.getElementById("chat-close").addEventListener("click", close);
    document.getElementById("chat-wa").href = waLink("¡Hola No Ni Ná! 🎺 Vengo de la web y quiero información para mi evento.");
    document.addEventListener("keydown", e => { if (e.key === "Escape" && panel.classList.contains("open")) close(); });
    document.querySelectorAll("[data-open-chat]").forEach(el =>
        el.addEventListener("click", () => open(el.dataset.openChat))
    );
    form.addEventListener("submit", e => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        addUser(text);
        input.value = "";
        handleText(text);
    });

    return { open, close };
})();

// ---------- Sección FAQ de la página (acordeón) ----------
(() => {
    const list = document.getElementById("faq-list");
    if (!list) return;
    FAQS.forEach(f => {
        const item = document.createElement("div");
        item.className = "faq-item";
        item.innerHTML = `
            <button class="faq-q" aria-expanded="false"><span>${f.q}</span><span class="plus">+</span></button>
            <div class="faq-a"><p>${f.a} <a class="faq-wa" target="_blank" rel="noopener" href="${waLink(`¡Hola No Ni Ná! 🎺 ${f.q}`)}">Pregúntanos por WhatsApp →</a></p></div>`;
        const btn = item.querySelector(".faq-q");
        const ans = item.querySelector(".faq-a");
        btn.addEventListener("click", () => {
            const isOpen = item.classList.toggle("open");
            btn.setAttribute("aria-expanded", isOpen);
            ans.style.maxHeight = isOpen ? ans.scrollHeight + "px" : 0;
        });
        list.appendChild(item);
    });
})();
