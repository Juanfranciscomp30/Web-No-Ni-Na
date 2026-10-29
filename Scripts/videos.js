/* =========================================================
   Vídeos de premios: YouTube solo se carga al pulsar
   (la página va más rápida y no depende de otras librerías)
   ========================================================= */
document.querySelectorAll(".video-thumb[data-yt]").forEach(btn => {
    btn.addEventListener("click", () => {
        const id = btn.dataset.yt;
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
        iframe.title = btn.getAttribute("aria-label").replace(/^Reproducir:\s*/, "");
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.className = "video-frame";
        btn.replaceWith(iframe);
    });
});
