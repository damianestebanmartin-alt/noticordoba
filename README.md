# NotiCBA v2 — simple y sin CMS

Sitio estático que se actualiza solo, todos los días, sin panel de admin,
sin base de datos, sin PHP corriendo. Eso es justamente lo que lo hace
más seguro que la versión anterior en Drupal: no hay nada que un bot
pueda escanear ni explotar.

## Cómo funciona

1. `scripts/fetch-news.js` lee los feeds RSS listados en `data/feeds.json`.
2. Arma el top 3 (las notas más recientes) y un historial rotativo de
   hasta 30 notas, guardando todo en `data/data.json`.
3. Cada nota se clasifica automáticamente en una de 5 categorías
   (Política, Economía, Policiales, Sociedad, Deportes), usando primero
   el `<category>` del propio RSS si lo trae, y si no, buscando palabras
   clave en el título. Si no encuentra nada, usa la categoría por
   defecto que le asignaste a esa fuente en `feeds.json`.
4. `index.html` es la página pública: lee `data/data.json` y
   `data/banner.json` y los muestra. El menú de arriba (Política,
   Economía, etc.) filtra en el navegador, sin recargar la página ni
   pegarle de nuevo al servidor. No tiene backend propio.
5. Un workflow de GitHub Actions (`.github/workflows/update-news.yml`)
   corre el script todos los días a las 9am y comitea el `data.json`
   actualizado. Netlify redespliega solo con cada commit.

### Si la clasificación se equivoca en algún portal

El diccionario de palabras clave es un punto de partida razonable, pero
no es perfecto — un título ambiguo puede caer en la categoría por
defecto (Sociedad). Si ves que una fuente entera clasifica mal, lo más
fácil es sumarle una fuente específica en `feeds.json` apuntando al RSS
de esa sección del portal (como hice con "La Voz Deportes", "La Voz
Política", etc.), en vez de depender solo de las palabras clave.

## Puesta en marcha (una sola vez)

1. Subí esta carpeta a un repo de GitHub (puede ser privado).
2. En Netlify: "Add new site" → "Import from Git" → elegí el repo.
   Build command: dejalo vacío. Publish directory: `/` (la raíz).
3. En GitHub, andá a Settings → Actions → General → "Workflow permissions"
   y marcá "Read and write permissions" (así el bot puede comitear el
   `data.json` actualizado).
4. Listo. El workflow corre solo todos los días.

## Cosas para revisar antes de lanzarlo

- **Las URLs de `data/feeds.json` son un punto de partida, no verificadas.**
  No pude probarlas en vivo desde acá. Antes de lanzar, abrí cada una en
  el navegador: si ves XML con `<item>` adentro, sirve. Si no, buscá el
  RSS real del portal (muchos lo tienen en el pie de página, o
  agregando `/feed` o `/rss` a la URL) o cambiá esa fuente por otra
  que sí tenga RSS activo.
- Podés correr el bot a mano en cualquier momento con:
  `node scripts/fetch-news.js` (necesita Node 18 o superior).
- Para cambiar el banner del mes, editá `data/banner.json` con la
  imagen y el link nuevo. Si ponés 2 banners, rotan solos cada 8 segundos.
- Para sumar o sacar portales, editá `data/feeds.json`. No hace falta
  tocar el código.

## Por qué es más seguro que antes

- No hay login público, ni panel `/admin`, ni base de datos: nada que
  fuerza bruta o un escaneo de vulnerabilidades pueda aprovechar.
- No republica notas completas: solo título, una imagen de referencia
  y el link directo al portal original.
- No depende de que vos actualices un CMS cada tanto — no hay CMS.
