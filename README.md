# Web Charanga No Ni Ná

Web de la Charanga No Ni Ná (Málaga): premios, vídeos, servicios, FAQ, chatbot y contacto por WhatsApp.

## Estructura
- `index.html` — la página (en la raíz, como necesita cualquier hosting)
- `CSS/style.css` — estilos
- `Scripts/config.js` — **datos de contacto** (WhatsApp, email, redes). Edita aquí.
- `Scripts/chatbot.js` — NoNiBot y preguntas frecuentes
- `Scripts/videos.js` — vídeos de premios (YouTube se carga al pulsar)
- `Scripts/script.js` — animaciones y formulario
- `robots.txt`, `sitemap.xml`, `site.webmanifest` — para Google
- `HTML/index.html` — solo redirige a la raíz (enlaces antiguos)

## Antes de publicar
1. Revisa que el email e Instagram/TikTok sean los reales en `Scripts/config.js`.
2. Si el dominio no es `www.charanganonina.es`, reemplaza esa dirección en `index.html`, `robots.txt` y `sitemap.xml`.
3. Al publicar: da de alta la web en Google Search Console y envía `sitemap.xml`.
