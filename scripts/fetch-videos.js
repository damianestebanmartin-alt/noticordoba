// fetch-videos.js
// Trae los ultimos videos de los canales de YouTube listados en
// data/canales-video.json y arma data/videos.json para el widget de la home.
// Usa la YouTube Data API v3 (playlistItems sobre la lista de "subidos" de
// cada canal: cuesta 1 unidad de cuota por canal). Necesita la variable de
// entorno YOUTUBE_API_KEY (secreto del repo en GitHub Actions). Si no hay
// clave o falla la consulta, se deja data/videos.json como estaba.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CANALES_PATH = path.join(__dirname, "..", "data", "canales-video.json");
const SALIDA_PATH = path.join(__dirname, "..", "data", "videos.json");
const VIDEOS_POR_CANAL = 2;
const MAX_VIDEOS = 8;

async function videosDeCanal(canal, apiKey) {
  try {
    const playlistId = "UU" + canal.channelId.slice(2);
    const url =
      "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=" +
      VIDEOS_POR_CANAL +
      "&playlistId=" +
      encodeURIComponent(playlistId) +
      "&key=" +
      encodeURIComponent(apiKey);
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      console.warn(`[video: ${canal.nombre}] la API respondio ${res.status}, se salta.`);
      return [];
    }
    const data = await res.json();
    return (data.items || [])
    .map((it) => {
      const sn = it.snippet || {};
      const videoId = sn.resourceId && sn.resourceId.videoId;
      const thumbs = sn.thumbnails || {};
      const miniatura =
        (thumbs.high && thumbs.high.url) ||
        (thumbs.medium && thumbs.medium.url) ||
        (thumbs.default && thumbs.default.url) ||
        null;
      return {
        videoId,
        titulo: sn.title || "",
        link: "https://www.youtube.com/watch?v=" + videoId,
        miniatura,
        canal: canal.nombre,
        categoria: canal.categoria || "",
        fecha: sn.publishedAt || new Date().toISOString(),
      };
    })
    .filter((v) => v.videoId && v.miniatura && v.titulo !== "Private video" && v.titulo !== "Deleted video");
  } catch (err) {
    console.warn(`[video: ${canal.nombre}] error: ${err.message}`);
    return [];
  }
}

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn("No hay YOUTUBE_API_KEY configurada: se deja data/videos.json como estaba.");
    return;
  }
  let canales = [];
  try {
    canales = JSON.parse(await readFile(CANALES_PATH, "utf-8")).canales || [];
  } catch {
    console.warn("No se pudo leer data/canales-video.json.");
    return;
  }
  const resultados = await Promise.all(canales.map((c) => videosDeCanal(c, apiKey)));
  const videos = resultados
  .flat()
  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  .slice(0, MAX_VIDEOS);
  if (videos.length === 0) {
    console.warn("No se pudo traer ningun video: se deja data/videos.json como estaba.");
    return;
  }
  await writeFile(
    SALIDA_PATH,
    JSON.stringify({ actualizado: new Date().toISOString(), videos }, null, 2),
    "utf-8"
    );
  console.log(`Listo: ${videos.length} videos de ${canales.length} canales.`);
}

main().catch((err) => {
  console.error("Error en fetch-videos:", err);
  process.exit(0); // los videos son accesorios: no tumbar el workflow de noticias
});
