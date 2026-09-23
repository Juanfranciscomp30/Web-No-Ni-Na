/* =========================================================
   CONFIGURACIÓN DE LA CHARANGA NO NI NÁ
   Edita SOLO este archivo para cambiar datos de contacto,
   tipos de evento y productos de merchandising.
   ========================================================= */
const NONINA = {
    // --- CONTACTO ---------------------------------------
    // WhatsApp en formato internacional, sin "+" ni espacios (ej: 34612345678)
    whatsapp: "34600000000",
    telefonoVisible: "+34 600 00 00 00",
    email: "info@charanganonina.es",
    instagram: "https://instagram.com/charanganonina",
    tiktok: "https://tiktok.com/@charanganonina",
    zona: "Alhaurín el Grande · Málaga y provincia",

    // --- TIPOS DE EVENTO ---------------------------------
    // Aparecen como botones en el chatbot y en el formulario de contacto
    eventos: ["Boda", "Feria / Romería", "Fiesta de pueblo", "Despedida", "Cumpleaños", "Pasacalles / Cabalgata", "Evento de empresa"],

    // --- MERCHANDISING -----------------------------------
    // precio: null => se muestra "Consultar"
    merch: [
        { id: "camiseta", nombre: "Camiseta oficial",  desc: "Negra con el conejo neón. Tallas S–XXL.", precio: null, emoji: "👕", tag: "Top ventas" },
        { id: "sudadera", nombre: "Sudadera NoNiNá",   desc: "Para las noches de feria que refrescan.",  precio: null, emoji: "🧥", tag: "Nueva" },
        { id: "gorra",    nombre: "Gorra bordada",      desc: "Logo bordado, ajustable.",                 precio: null, emoji: "🧢", tag: "" },
        { id: "abanico",  nombre: "Abanico de feria",   desc: "Para aguantar el calor bailando.",         precio: null, emoji: "🪭", tag: "Verano" },
        { id: "pulsera",  nombre: "Pulsera de tela",    desc: "Rosa y azul, como el logo.",               precio: null, emoji: "🎗️", tag: "" },
        { id: "pack",     nombre: "Pack fan",           desc: "Camiseta + gorra + pulsera.",              precio: null, emoji: "🎁", tag: "Pack" }
    ]
};

// Helper para enlaces de WhatsApp con mensaje prellenado
function waLink(mensaje) {
    return `https://wa.me/${NONINA.whatsapp}?text=${encodeURIComponent(mensaje || "¡Hola No Ni Ná! 🎺")}`;
}
