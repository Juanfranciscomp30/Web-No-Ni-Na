/* =========================================================
   CHARANGA NO NI NÁ — efectos y lógica de la página
   ========================================================= */
gsap.registerPlugin(ScrollTrigger);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none)").matches;

/* ---------- Datos de contacto desde config.js ---------- */
(() => {
    const set = (id, prop, val) => { const el = document.getElementById(id); if (el) el[prop] = val; };
    set("contact-wa", "href", waLink());
    set("fab-wa", "href", waLink());
    set("contact-tel", "href", `tel:+${NONINA.whatsapp}`);
    set("tel-text", "textContent", NONINA.telefonoVisible);
    set("contact-mail", "href", `mailto:${NONINA.email}`);
    set("mail-text", "textContent", NONINA.email);
    set("contact-ig", "href", NONINA.instagram);
    set("contact-tt", "href", NONINA.tiktok);
    set("zona-text", "textContent", NONINA.zona);
    set("footer-zona", "textContent", NONINA.zona);
    set("year", "textContent", new Date().getFullYear());

    // Tipos de evento del formulario = los del chatbot
    const sel = document.getElementById("f-evento");
    NONINA.eventos.forEach(e => sel.add(new Option(e, e)));
    sel.add(new Option("Otro", "Otro"));

    // Fecha mínima = hoy
    document.getElementById("f-fecha").min = new Date().toISOString().split("T")[0];
})();

/* ---------- Merchandising ---------- */
(() => {
    const grid = document.getElementById("merch-grid");
    NONINA.merch.forEach(p => {
        const precio = p.precio ? `${p.precio} €` : "Consultar";
        const col = document.createElement("div");
        col.className = "col-sm-6 col-lg-4 reveal";
        col.innerHTML = `
            <article class="card-neon tilt merch-card">
                <div class="merch-visual">
                    ${p.tag ? `<span class="merch-tag">${p.tag}</span>` : ""}
                    <span class="emoji">${p.emoji}</span>
                    <img src="../Images/LogoNoNiNa.jpg" alt="">
                </div>
                <h3>${p.nombre}</h3>
                <p>${p.desc}</p>
                <div class="merch-price">${precio}</div>
                <a class="btn btn-neon-blue" target="_blank" rel="noopener"
                   href="${waLink(`¡Hola No Ni Ná! Me interesa el merch: ${p.nombre}. ¿Precio y tallas disponibles?`)}">🛒 Lo quiero</a>
            </article>`;
        grid.appendChild(col);
    });
})();

/* ---------- Entrada del hero ---------- */
(() => {
    // Partimos el título en letras para animarlas
    document.querySelectorAll(".hero-title .word").forEach(w => {
        const txt = w.textContent;
        w.textContent = "";
        [...txt].forEach(ch => {
            const s = document.createElement("span");
            s.className = "char";
            s.innerHTML = ch === " " ? "&nbsp;" : ch;
            w.appendChild(s);
        });
    });
    if (reduceMotion) return;

    const tl = gsap.timeline({ defaults: { ease: "back.out(1.7)" } });
    tl.from(".hero-logo", { scale: 0, rotate: -180, duration: 1 })
      .from(".hero-title .char", { y: 80, opacity: 0, rotate: () => gsap.utils.random(-30, 30), stagger: 0.04, duration: 0.7 }, "-=0.5")
      .from(".hero-sub", { y: 20, opacity: 0, duration: 0.6 }, "-=0.3")
      .from(".equalizer", { scaleY: 0, opacity: 0, duration: 0.5 }, "-=0.3")
      .from(".hero-ctas .btn", { scale: 0.5, opacity: 0, stagger: 0.12, duration: 0.5 }, "-=0.2")
      .from(".navbar", { y: -80, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.2);

    // Las letras del título saltan al pasar el ratón
    document.querySelectorAll(".hero-title .char").forEach(c => {
        c.addEventListener("mouseenter", () => {
            gsap.fromTo(c, { y: 0 }, { y: -20, rotate: gsap.utils.random(-15, 15), duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" });
        });
    });
})();

/* ---------- Revelado al hacer scroll ---------- */
if (!reduceMotion) {
    gsap.utils.toArray(".reveal").forEach(el => {
        gsap.from(el, {
            y: 50, opacity: 0, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" }
        });
    });
    gsap.from(".chip", {
        scale: 0, opacity: 0, stagger: 0.05, duration: 0.4, ease: "back.out(2)",
        scrollTrigger: { trigger: ".chips", start: "top 85%" }
    });
    gsap.from(".step-num", {
        scale: 0, rotate: 360, stagger: 0.2, duration: 0.7, ease: "back.out(1.7)",
        scrollTrigger: { trigger: ".steps", start: "top 85%" }
    });
}

/* ---------- Barra de progreso + navbar compacta + link activo ---------- */
(() => {
    const bar = document.querySelector(".scroll-progress");
    const nav = document.querySelector(".navbar");
    const links = [...document.querySelectorAll(".nav-link[href^='#']")];
    const sections = links.map(l => document.querySelector(l.getAttribute("href"))).filter(Boolean);
    const onScroll = () => {
        const h = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
        nav.classList.toggle("scrolled", scrollY > 50);
        let current = sections[0];
        sections.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * 0.4) current = s; });
        links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + current.id));
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Cerrar el menú móvil al pulsar un enlace
    const collapse = document.getElementById("navbarNav");
    links.forEach(l => l.addEventListener("click", () => {
        if (collapse.classList.contains("show")) bootstrap.Collapse.getOrCreateInstance(collapse).hide();
    }));
})();

/* ---------- Parallax de fondo + brillo que sigue al ratón ---------- */
if (!reduceMotion && !isTouch) {
    const glow = document.querySelector(".cursor-glow");
    const bg = document.querySelector(".bg-layer");
    const gx = gsap.quickTo(glow, "left", { duration: 0.6, ease: "power3" });
    const gy = gsap.quickTo(glow, "top", { duration: 0.6, ease: "power3" });
    const bx = gsap.quickTo(bg, "x", { duration: 1, ease: "power2" });
    const by = gsap.quickTo(bg, "y", { duration: 1, ease: "power2" });
    addEventListener("mousemove", e => {
        gx(e.clientX); gy(e.clientY);
        bx((e.clientX / innerWidth - 0.5) * -30);
        by((e.clientY / innerHeight - 0.5) * -30);
    });
}

/* ---------- Tarjetas con inclinación 3D + foco de luz ---------- */
if (!reduceMotion && !isTouch) {
    document.addEventListener("mousemove", e => {
        const card = e.target.closest(".tilt");
        if (!card) return;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", `${px * 100}%`);
        card.style.setProperty("--my", `${py * 100}%`);
        gsap.to(card, { rotateY: (px - 0.5) * 14, rotateX: (0.5 - py) * 14, transformPerspective: 800, duration: 0.4 });
    });
    document.addEventListener("mouseout", e => {
        const card = e.target.closest(".tilt");
        if (card && !card.contains(e.relatedTarget)) gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
    });

    /* Botones magnéticos */
    document.querySelectorAll(".magnetic").forEach(btn => {
        btn.addEventListener("mousemove", e => {
            const r = btn.getBoundingClientRect();
            gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4, scale: 1.06, duration: 0.3 });
        });
        btn.addEventListener("mouseleave", () => gsap.to(btn, { x: 0, y: 0, scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" }));
    });
}

/* ---------- Confeti ---------- */
window.fireConfetti = function (origin) {
    if (reduceMotion) return;
    const r = (origin || document.body).getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + Math.min(r.height / 2, innerHeight / 2);
    const colors = ["#ff00ff", "#00d4ff", "#ffffff", "#ff66ff", "#66e5ff"];
    for (let i = 0; i < 70; i++) {
        const c = document.createElement("div");
        c.className = "confetti";
        c.style.background = colors[i % colors.length];
        c.style.boxShadow = `0 0 6px ${colors[i % colors.length]}`;
        document.body.appendChild(c);
        const angle = Math.random() * Math.PI * 2;
        const dist = 120 + Math.random() * 260;
        gsap.set(c, { x: cx, y: cy, rotate: Math.random() * 360 });
        gsap.to(c, {
            x: cx + Math.cos(angle) * dist,
            y: cy + Math.sin(angle) * dist - 80,
            rotate: "+=" + (Math.random() * 720 - 360),
            duration: 0.9 + Math.random() * 0.5, ease: "power3.out"
        });
        gsap.to(c, { y: "+=" + (200 + Math.random() * 200), opacity: 0, delay: 0.8, duration: 1.2, ease: "power1.in", onComplete: () => c.remove() });
    }
};

/* Botón principal: confeti + saltar a contacto */
document.getElementById("cta-btn").addEventListener("click", e => {
    fireConfetti(e.currentTarget);
    setTimeout(() => document.getElementById("contacto").scrollIntoView({ behavior: "smooth" }), 450);
});

/* ---------- Notas musicales flotando (canvas) ---------- */
(() => {
    if (reduceMotion) return;
    const canvas = document.getElementById("notes-canvas");
    const ctx = canvas.getContext("2d");
    const symbols = ["♪", "♫", "♬", "♩", "🎺", "🥁"];
    let W, H, notes = [];
    const count = () => Math.round(Math.min(28, innerWidth / 50));

    function resize() {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        W = innerWidth; H = innerHeight;
        canvas.width = W * dpr; canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(initial) {
        return {
            x: Math.random() * W,
            y: initial ? Math.random() * H : H + 40,
            s: 14 + Math.random() * 22,
            v: 0.3 + Math.random() * 0.8,
            a: Math.random() * Math.PI * 2,
            sym: symbols[Math.random() < 0.85 ? Math.floor(Math.random() * 4) : 4 + Math.floor(Math.random() * 2)],
            c: Math.random() < 0.5 ? "#ff00ff" : "#00d4ff",
            o: 0.15 + Math.random() * 0.35
        };
    }
    function loop() {
        ctx.clearRect(0, 0, W, H);
        notes.forEach((n, i) => {
            n.y -= n.v; n.a += 0.02;
            const x = n.x + Math.sin(n.a) * 20;
            ctx.globalAlpha = n.o;
            ctx.font = `${n.s}px sans-serif`;
            ctx.fillStyle = n.c;
            ctx.shadowColor = n.c; ctx.shadowBlur = 12;
            ctx.fillText(n.sym, x, n.y);
            if (n.y < -40) notes[i] = spawn(false);
        });
        requestAnimationFrame(loop);
    }
    resize();
    notes = Array.from({ length: count() }, () => spawn(true));
    addEventListener("resize", () => { resize(); notes.length = count(); for (let i = 0; i < count(); i++) notes[i] = notes[i] || spawn(true); });
    loop();
})();

/* ---------- Formulario de contacto ---------- */
(() => {
    const form = document.getElementById("contact-form");
    const fb = document.getElementById("form-feedback");
    const $ = id => document.getElementById(id);
    const required = ["f-nombre", "f-tel", "f-evento", "f-fecha", "f-lugar"];

    function validate() {
        let ok = true;
        required.forEach(id => {
            const el = $(id);
            const valid = el.value.trim() !== "" && (id !== "f-tel" || /^[+\d\s()-]{9,}$/.test(el.value.trim()));
            el.classList.toggle("is-invalid", !valid);
            if (!valid) ok = false;
        });
        const priv = $("f-privacidad");
        priv.classList.toggle("is-invalid", !priv.checked);
        if (!priv.checked) ok = false;
        return ok;
    }
    function buildMessage() {
        const fecha = $("f-fecha").value ? new Date($("f-fecha").value + "T12:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";
        return [
            "¡Hola No Ni Ná! 🎺 Quiero pedir presupuesto:",
            "",
            `👤 Nombre: ${$("f-nombre").value.trim()}`,
            `📞 Teléfono: ${$("f-tel").value.trim()}`,
            `🎉 Evento: ${$("f-evento").value}`,
            `📅 Fecha: ${fecha}`,
            `📍 Localidad: ${$("f-lugar").value.trim()}`,
            $("f-horas").value ? `⏱️ Duración: ${$("f-horas").value}` : "",
            $("f-msg").value.trim() ? `\n💬 ${$("f-msg").value.trim()}` : ""
        ].filter(Boolean).join("\n");
    }
    function feedback(text, type) { fb.textContent = text; fb.className = "form-feedback " + type; }

    form.addEventListener("input", e => e.target.classList.remove("is-invalid"));
    form.addEventListener("submit", e => {
        e.preventDefault();
        if (!validate()) return feedback("Revisa los campos marcados en rojo 👆", "err");
        window.open(waLink(buildMessage()), "_blank", "noopener");
        feedback("¡Genial! Se ha abierto WhatsApp con tu mensaje listo para enviar 🎉", "ok");
        fireConfetti(form);
    });
    $("send-mail").addEventListener("click", () => {
        if (!validate()) return feedback("Revisa los campos marcados en rojo 👆", "err");
        const subject = `Presupuesto ${$("f-evento").value} - ${$("f-nombre").value.trim()}`;
        location.href = `mailto:${NONINA.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildMessage())}`;
        feedback("Abriendo tu correo con el mensaje preparado ✉️", "ok");
    });
})();
