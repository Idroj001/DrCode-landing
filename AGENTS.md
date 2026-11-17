# AGENTS.md

Landing de una sola página para {Dr.Code}. Header/footer inline en `index.html`; todo el comportamiento en `js/main.js` + `js/canvas.js` (canvas matrix).

> **Estándares de diseño y tipografía generales: ver el `AGENTS.md` del workspace root (`Proyectos/`).** Aquí solo el cableado crítico del repo.

## Flujo de trabajo

- Tests: `cd landing && npm test` (Playwright en `127.0.0.1:4174`, `workers: 1`). Primera vez: `npm install` + `npx playwright install chromium`.
- Deploy: GitHub Pages desde la raíz de `main` → https://idroj001.github.io/DrCode-landing/ (repo remoto `Idroj001/DrCode-landing`).
- Enlaces entre sitios absolutos a las URLs de GitHub Pages; nunca relativos. Salidas de este sitio: footer social → catalogo-drcode; CTA "Agendar" → wa.me. `web` y `catalogo` enlazan hacia aquí como "Landing" en su nav.
- Servicios: solo botón "Solicitar" (abre el formulario pre-seleccionado). No tiene enlaces "Ver demo" — los demos de `web` que tienen repos reales apuntan directamente a ellos.

## Acoplamientos que se rompen fácil

- Sin Font Awesome: todos los íconos (servicios, why-cards, botón submit, social, tema) son SVG inline con `fill="currentColor"`. No re-agregar el CDN de FA; para un ícono nuevo copia el path de `fontawesome-free/svgs` y usa el patrón `<svg viewBox aria-hidden focusable><path fill="currentColor"/></svg>`.
- Formulario: solo `name` es obligatorio; `phone` tiene `pattern="[0-9+\-\s()]{7,20}"` (el test lo llena con `0999999999`). El submit usa `window.open(url, '_blank')` + fallback `location.href` si devuelve `null` — el stub de `window.open` en `tests/support/fixtures.mjs` debe devolver un objeto truthy, nunca `null`.
- Carrusel de skills (`#skills-carousel`, generado por `initSkillsCarousel()`): 8 slides, `setInterval` de **3000ms**, puntos `.carousel-dot` clicables sincronizados con el slide activo, pausa en hover/focus/pestaña oculta **y botón `.carousel-toggle` de pausa/play** (un "play" explícito anula el hover vigente: ver `toggleBtn.addEventListener('click')`). `tests/skills.spec.mjs` verifica todo esto con `page.clock`.
- Sección `#proyectos`: 3 `.project-card` con enlaces absolutos a `web-drcode`, `catalogo-drcode` y `tarjeta-drcode`. Reutiliza `.service-preview`/`.service-body` y sus media queries (`services-grid` y `projects-grid` van siempre juntas en los breakpoints). El test cuenta 9 `.service-preview img` (6 servicios + 3 proyectos).
- OG image: `assets/og-image.png` (1200×630) referenciada con URL absoluta en `og:`/`twitter:` y JSON-LD; regenerar con `node scripts/make-og.mjs` si cambia la marca. No volver a `og:image` SVG (WhatsApp/Facebook no lo renderizan).
- Canvas matrix limitado a 30fps (24 en <768px) vía acumulador de tiempo en `canvas.js`; `draw(timestamp)` reagenda rAF al inicio y retorna antes del `interval`.
- WhatsApp `593999806465` está duplicado: `href` del CTA "Agendar" en `index.html` y `WHATSAPP_NUMBER` en `js/main.js`. Cambia los dos.
- `initFloatLift()` fija `bottom` **inline** (`footer.offsetHeight + 16px`) a ambos flotantes cuando el footer entra en viewport, en cualquier tamaño de pantalla. Los tests de `smoke.spec.mjs` verifican la geometría (botones fuera del footer). No volver a un `translateY` fijo en CSS: el alto del footer varía entre desktop y móvil.
- Footer móvil: `.footer-inner` es fila (`space-between`) con `.social-links { order: 2 }` y `.footer-copy { order: 3; width: 100% }` — logo/íconos a la misma altura y copy centrado debajo. Test de alineación en `smoke.spec.mjs`.
- Servicios: **1 columna compacta** en todo `≤600px` (`aspect-ratio 16/9` en preview, desc `0.9rem`); 2 columnas solo entre 601–900px; 3 en desktop.
