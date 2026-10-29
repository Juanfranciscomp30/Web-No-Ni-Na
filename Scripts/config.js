/* =========================================================
   CONFIGURACIÓN DE LA CHARANGA NO NI NÁ
   Edita SOLO este archivo para cambiar datos de contacto
   y tipos de evento.
   ========================================================= */
const NONINA = {
    // --- CONTACTO ---------------------------------------
    // Número real de la charanga
    // WhatsApp en formato internacional, sin "+" ni espacios (ej: 34612345678)
    whatsapp: "34613045630",
    telefonoVisible: "+34 613 04 56 30",
    email: "info@charanganonina.es",
    instagram: "https://instagram.com/charanganonina",
    tiktok: "https://tiktok.com/@charanganonina",
    zona: "Málaga y provincia",

    // --- TIPOS DE EVENTO ---------------------------------
    // Aparecen como botones en el chatbot y en el formulario de contacto
    eventos: ["Boda", "Feria / Romería", "Fiesta de pueblo", "Despedida", "Cumpleaños", "Pasacalles / Cabalgata", "Evento de empresa"]
};

// Helper para enlaces de WhatsApp con mensaje prellenado
function waLink(mensaje) {
    return `https://wa.me/${NONINA.whatsapp}?text=${encodeURIComponent(mensaje || "¡Hola No Ni Ná! 🎺")}`;
}
