// videos.js
// Columna "Videos" (cuarta columna, a la derecha de las notas): muestra los
// videos mas recientes de los canales de YouTube configurados en
// data/canales-video.json (los arma scripts/fetch-videos.js y los guarda en
// data/videos.json). Si ese archivo no existe o esta vacio, no cambia nada y
// la pagina queda igual que antes.
(function () {
  const css = `
  .layout-cols { display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 1fr); gap: 18px; align-items: start; }
  .layout-cols .grilla { grid-template-columns: repeat(3, 1fr); }
  .videos-col { display: flex; flex-direction: column; gap: 14px; }
  .videos-col .titulo-seccion { margin-bottom: 4px; }
  @media (max-width: 900px) {
  .layout-cols { grid-template-columns: 1fr; }
  .layout-cols .grilla { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 520px) {
  .layout-cols .grilla { grid-template-columns: 1fr; }
  }
  .video-card { display: block; text-decoration: none; color: inherit; background: #fff; border: 1px solid var(--gris-borde); overflow: hidden; }
  .video-thumb { position: relative; aspect-ratio: 16/9; background: #000; }
  .video-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .video-play { position: absolute; top: 50%; left: 50%; width: 42px; height: 42px; margin: -21px 0 0 -21px; border-radius: 50%; background: rgba(229,36,27,0.92); }
  .video-play::before { content: ""; position: absolute; top: 12px; left: 16px; border-style: solid; border-width: 9px 0 9px 14px; border-color: transparent transparent transparent #fff; }
  .video-info { padding: 9px 11px 11px; }
  .video-titulo { font-weight: 800; font-size: 13px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .video-canal { margin-top: 5px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--rojo); }
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

   const main = document.querySelector("main");
     const titulo = document.getElementById("titulo-seccion");
     const grilla = document.getElementById("grilla");
     if (!main || !titulo || !grilla) return;

   const estilo = document.createElement("style");
     estilo.textContent = css;
     document.head.appendChild(estilo);

   // Armamos dos columnas: las notas a la izquierda (3 de 4) y los videos a la derecha (1 de 4).
   const layout = document.createElement("div");
     layout.className = "layout-cols";
     const colNotas = document.createElement("div");
     main.insertBefore(layout, titulo);
     colNotas.appendChild(titulo);
     colNotas.appendChild(grilla);

   const colVideos = document.createElement("aside");
     colVideos.className = "videos-col";
     colVideos.innerHTML =
       '<h2 class="titulo-seccion">Videos</h2>' +
       videos
     .map(
       (v) =>
         '<a class="video-card" href="' + esc(v.link) + '" target="_blank" rel="noopener">' +
         '<div class="video-thumb"><img src="' + esc(v.miniatura) + '" alt="" loading="lazy"><span class="video-play"></span></div>' +
         '<div class="video-info"><div class="video-titulo">' + esc(v.titulo) + '</div>' +
         '<div class="video-canal">' + esc(v.canal) + '</div></div></a>'
       )
     .join("");
     colVideos.querySelectorAll("img").forEach((img) =>
       img.addEventListener("error", () => img.closest(".video-card").remove())
                                               );

   layout.appendChild(colNotas);
     layout.appendChild(colVideos);
   } catch (err) {
     console.warn("No se pudo cargar el widget de videos:", err);
   }
 }

 iniciar();
})();
