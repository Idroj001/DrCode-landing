# AGENTS.md

Landing de una sola página para {Dr.Code}. Header/footer inline en `index.html`; todo el comportamiento en `js/main.js` + `js/canvas.js` (canvas matrix).

> **Estándares de diseño y tipografía generales: ver el `AGENTS.md` del workspace root (`Proyectos/`).** Aquí solo el cableado crítico del repo.

## Flujo de trabajo

- Tests: `cd landing && npm test` (Playwright en `127.0.0.1:4174`, `workers: 1`). Primera vez: `npm install` + `npx playwright install chromium`.
- Deploy: GitHub Pages desde la raíz de `main` → https://idroj001.github.io/DrCode-landing/ (repo remoto `Idroj001/DrCode-landing`).
- Enlaces entre sitios absolutos a las URLs de GitHub Pages; nunca relativos. Salidas de este sitio: footer social → catalogo-drcode; CTA "Agendar" → wa.me. `web` y `catalogo` enlazan hacia aquí como "Landing" en su nav.
- Servicios: solo botón "Solicitar" (abre el formulario pre-seleccionado). No tiene enlaces "Ver demo" — los demos de `web` que tienen repos reales apuntan directamente a ellos.

## Acoplamientos que se rompen fácil

- WhatsApp `593999806465` está duplicado: `href` del CTA "Agendar" en `index.html` y `WHATSAPP_NUMBER` en `js/main.js`. Cambia los dos.
- `initFloatLift()` fija `bottom` **inline** (`footer.offsetHeight + 16px`) a ambos flotantes cuando el footer entra en viewport, en cualquier tamaño de pantalla. Los tests de `smoke.spec.mjs` verifican la geometría (botones fuera del footer). No volver a un `translateY` fijo en CSS: el alto del footer varía entre desktop y móvil.
- Carrusel de skills (`#skills-carousel`, generado por `initSkillsCarousel()`): 8 slides, `setInterval` de **3000ms**, puntos `.carousel-dot` clicables sincronizados con el slide activo, pausa en hover/focus/pestaña oculta. `tests/skills.spec.mjs` verifica todo esto con `page.clock`.
- Footer móvil: `.footer-inner` es fila (`space-between`) con `.social-links { order: 2 }` y `.footer-copy { order: 3; width: 100% }` — logo/íconos a la misma altura y copy centrado debajo. Test de alineación en `smoke.spec.mjs`.
- Servicios: **1 columna compacta** en todo `≤600px` (`aspect-ratio 16/9` en preview, desc `0.9rem`); 2 columnas solo entre 601–900px; 3 en desktop.
