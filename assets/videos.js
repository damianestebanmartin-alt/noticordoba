// videos.js
// Widget "Videos": muestra los videos mas recientes de los canales de YouTube
// configurados en data/canales-video.json (los arma scripts/fetch-videos.js y
// los guarda en data/videos.json). Si ese archivo no existe o esta vacio, no
// muestra nada y la pagina queda igual que antes.
(function () {
  const css = `
  .videos-seccion { margin: 40px 0 0; }
  .videos-grilla { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
  @media (max-width: 900px) { .videos-grilla { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 520px) { .videos-grilla { grid-template-columns: 1fr; } }
  .video-card { display: block; text-decoration: none; color: inherit; background: #fff; border: 1px solid var(--gris-borde); overflow: hidden; }
  .video-thumb { position: relative; aspect-ratio: 16/9; background: #000; }
  .video-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .video-play { position: absolute; top: 50%; left: 50%; width: 46px; height: 46px; margin: -23px 0 0 -23px; border-radius: 50%; background: rgba(229,36,27,0.92); }
  .video-play::before { content: ""; position: absolute; top: 13px; left: 18px; border-style: solid; border-width: 10px 0 10px 16px; border-color: transparent transparent transparent #fff; }
  .video-info { padding: 10px 12px 12px; }
  .video-titulo { font-weight: 800; font-size: 14px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .video-canal { margin-top: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--rojo); }
  `;

 function esc(t) {
   return String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
 }

 async function iniciar() {
   try {
     const res = await fetch("data/videos.json?v=" + Date.now());
     if (!res.ok) return;
     const datos = await res.json();
     const videos = (datos && datos.videos) || [];
     if (videos.length === 0) return;

   const estilo = document.createElement("style");
     estilo.textContent = css;
     document.head.appendChild(estilo);

   const seccion = document.createElement("section");
     seccion.className = "videos-seccion";
     seccion.innerHTML =
       '<h2 class="titulo-seccion">Videos</h2><div class="videos-grilla">' +
       videos
     .map(
       (v) =>
         '<a class="video-card" href="' + esc(v.link) + '" target="_blank" rel="noopener">' +
         '<div class="video-thumb"><img src="' + esc(v.miniatura) + '" alt="" loading="lazy"><span class="video-play"></span></div>' +
         '<div class="video-info"><div class="video-titulo">' + esc(v.titulo) + '</div>' +
         '<div class="video-canal">' + esc(v.canal) + '</div></div></a>'
       )
     .join("") +
       "</div>";
     seccion.querySelectorAll("img").forEach((img) =>
       img.addEventListener("error", () => img.closest(".video-card").remove())
                                             );
     document.querySelector("main").appendChild(seccion);
   } catch (err) {
     console.warn("No se pudo cargar el widget de videos:", err);
   }
 }

 iniciar();
})();
