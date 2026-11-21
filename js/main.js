const WHATSAPP_NUMBER = '593999806465';
const THEME_KEY = 'drcode_theme';

const SERVICE_LABELS = {
  landing: 'Landing page',
  web: 'Web corporativa',
  catalogo: 'Catálogo WhatsApp',
  tarjeta: 'Tarjeta digital',
  menu: 'Menú digital',
  estudios: 'Web de estudios',
  finanzas: 'Finanzas personales',
  gestion: 'Gestión profesional',
  dashboard: 'Dashboard con datos vivos',
  chatbot: 'Chatbot WhatsApp',
  automatizaciones: 'Automatizaciones',
  otro: 'Otro'
};

const CAROUSEL_ICONS = {
  pause: '<svg viewBox="0 0 320 512" aria-hidden="true" focusable="false"><path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>',
  play: '<svg viewBox="0 0 384 512" aria-hidden="true" focusable="false"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>'
};

/* ---------------------------------------------------------------------------
   Tema claro / oscuro
   --------------------------------------------------------------------------- */

const THEME_ICONS = {
  sun: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
};

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch (e) {
    return null;
  }
}

function getPreferredTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.querySelector('.theme-toggle-float');
  if (!btn) return;
  const isDark = theme === 'dark';
  btn.innerHTML = isDark ? THEME_ICONS.sun : THEME_ICONS.moon;
  btn.setAttribute('aria-pressed', String(isDark));
  btn.setAttribute('aria-label', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
  btn.setAttribute('title', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
}

function initThemeToggle() {
  const attr = document.documentElement.getAttribute('data-theme');
  const current = attr === 'dark' || attr === 'light' ? attr : getPreferredTheme();

  if (!document.querySelector('.theme-toggle-float')) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle-float';
    btn.innerHTML = THEME_ICONS.moon;
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        /* almacenamiento no disponible: el tema dura la sesión */
      }
      applyTheme(next);
    });
    document.body.appendChild(btn);
  }

  applyTheme(current);

  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      if (!getStoredTheme()) applyTheme(e.matches ? 'dark' : 'light');
    };
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);
    }
  }
}

/* ---------------------------------------------------------------------------
   WhatsApp flotante
   --------------------------------------------------------------------------- */

function injectWhatsAppFloat() {
  if (document.querySelector('.whatsapp-float')) return;

  const el = document.createElement('a');
  el.className = 'whatsapp-float';
  el.href = `https://wa.me/${WHATSAPP_NUMBER}`;
  el.target = '_blank';
  el.rel = 'noopener';
  el.setAttribute('aria-label', 'Contactar por WhatsApp');
  el.innerHTML = `<svg viewBox="0 0 448 512" aria-hidden="true" focusable="false">
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
  </svg>`;
  document.body.appendChild(el);
}

function initFloatLift() {
  const footer = document.querySelector('footer');
  const floats = [
    document.querySelector('.whatsapp-float'),
    document.querySelector('.theme-toggle-float')
  ].filter(Boolean);

  if (!footer || !floats.length) return;

  let overFooter = false;

  // Los flotantes se detienen por encima del borde superior del footer,
  // en cualquier viewport (el alto del footer varía entre desktop y móvil).
  const applyLift = () => {
    const bottom = overFooter ? `${footer.offsetHeight + 16}px` : '';
    floats.forEach(el => {
      el.classList.toggle('float-above', overFooter);
      el.style.bottom = bottom;
    });
  };

  const observer = new IntersectionObserver(([entry]) => {
    overFooter = entry.isIntersecting;
    applyLift();
  }, { rootMargin: '0px 0px 48px 0px' });

  observer.observe(footer);

  window.addEventListener('resize', () => {
    if (overFooter) applyLift();
  });
}

/* ---------------------------------------------------------------------------
   Navegación
   --------------------------------------------------------------------------- */

function initNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  if (!hamburger || !navMenu) return;

  const setOpen = (open) => {
    navMenu.classList.toggle('active', open);
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
  };

  hamburger.addEventListener('click', () => {
    setOpen(!navMenu.classList.contains('active'));
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      setOpen(false);
      hamburger.focus();
    }
  });
}

function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('a.nav-link[href^="#"]'));
  const sections = links
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if (!sections.length) return;

  const setActive = (id) => {
    links.forEach(link => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(section => observer.observe(section));
}

/* ---------------------------------------------------------------------------
   Detalles de servicios
   --------------------------------------------------------------------------- */

function initServiceToggles() {
  const toggles = document.querySelectorAll('.term-toggle');
  if (!toggles.length) return;

  toggles.forEach(toggle => {
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));
    const sign = toggle.querySelector('span');
    const service = toggle.dataset.service || 'este servicio';
    if (!panel || !sign) return;

    toggle.addEventListener('click', () => {
      const willOpen = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(willOpen));
      toggle.setAttribute('aria-label', `${willOpen ? 'Ocultar' : 'Ver'} detalles de ${service}`);
      sign.textContent = willOpen ? '-' : '+';
      panel.hidden = !willOpen;
    });
  });
}

/* ---------------------------------------------------------------------------
   Visor de capturas de demostraciones ("Vista previa")
   --------------------------------------------------------------------------- */

function initWorkDemos() {
  const buttons = Array.from(document.querySelectorAll('.work-demo'));
  const modal = document.getElementById('workModal');
  if (!buttons.length || !modal) return;

  const dialog = modal.querySelector('.work-modal-dialog');
  const backdrop = modal.querySelector('.work-modal-backdrop');
  const closeBtn = modal.querySelector('.work-modal-close');
  const imgPc = modal.querySelector('.work-modal-img--pc');
  const imgMovil = modal.querySelector('.work-modal-img--movil');

  let opener = null;

  const focusables = () =>
    Array.from(dialog.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])'));

  const open = button => {
    const title = button.dataset.title || 'Proyecto';
    imgPc.src = button.dataset.shotPc;
    imgPc.alt = `${title} en escritorio`;
    imgMovil.src = button.dataset.shotMovil;
    imgMovil.alt = `${title} en móvil`;
    dialog.setAttribute('aria-label', `Vista previa: ${title}`);
    opener = button;
    button.setAttribute('aria-expanded', 'true');
    modal.hidden = false;
    document.body.classList.add('work-modal-open');
    closeBtn.focus();
  };

  const close = () => {
    modal.hidden = true;
    document.body.classList.remove('work-modal-open');
    imgPc.removeAttribute('src');
    imgMovil.removeAttribute('src');
    if (opener) {
      opener.setAttribute('aria-expanded', 'false');
      opener.focus();
      opener = null;
    }
  };

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-expanded') === 'true') close();
      else open(button);
    });
  });

  backdrop.addEventListener('click', close);
  closeBtn.addEventListener('click', close);

  document.addEventListener('keydown', event => {
    if (modal.hidden) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== 'Tab') return;
    const list = focusables();
    if (!list.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = list[0];
    const last = list[list.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

/* ---------------------------------------------------------------------------
   Carrusel de skills
   --------------------------------------------------------------------------- */

function initSkillsCarousel() {
  const container = document.getElementById('skills-carousel');
  if (!container) return;

  const skills = [
    { name: 'HTML5', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg', desc: 'Estructura semántica y contenido web accesible' },
    { name: 'CSS3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg', desc: 'Estilos modernos, animaciones y diseño responsivo' },
    { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg', desc: 'Interactividad dinámica y lógica del lado del cliente' },
    { name: 'OpenCode', icon: 'assets/skills/opencode.svg', desc: 'Agente de IA open source para desarrollo asistido' },
    { name: 'Warp', icon: 'https://cdn.simpleicons.org/warp/01A4FF', desc: 'Terminal moderna con productividad aumentada' },
    { name: 'Obsidian', icon: 'https://cdn.simpleicons.org/obsidian/7C3AED', desc: 'Gestión de conocimiento y notas interconectadas' },
    { name: 'Hostinger', icon: 'https://cdn.simpleicons.org/hostinger/673DE6', desc: 'Hosting web rápido y panel de control intuitivo' },
    { name: 'GitHub', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg', desc: 'Control de versiones y colaboración en equipo' }
  ];

  let slidesHTML = '';
  skills.forEach((s, i) => {
    slidesHTML += `
      <div class="carousel-slide${i === 0 ? ' active' : ''}" aria-hidden="${i === 0 ? 'false' : 'true'}">
        <div class="carousel-content">
          <img class="carousel-logo" src="${s.icon}" alt="${s.name}"${i > 1 ? ' loading="lazy"' : ''}>
          <span class="carousel-name">${s.name}</span>
          <p class="carousel-desc">${s.desc}</p>
        </div>
      </div>`;
  });

  container.innerHTML = slidesHTML;

  const dotsHTML = skills
    .map((s, i) =>
      `<button type="button" class="carousel-dot${i === 0 ? ' active' : ''}" aria-label="Ir a ${s.name}" aria-pressed="${i === 0 ? 'true' : 'false'}"></button>`)
    .join('');
  container.insertAdjacentHTML('beforeend',
    `<div class="carousel-dots" role="group" aria-label="Seleccionar skill">${dotsHTML}</div>`);

  const slides = container.querySelectorAll('.carousel-slide');
  const dots = container.querySelectorAll('.carousel-dot');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let interval = null;
  // Con movimiento reducido el carrusel arranca detenido; el botón permite verlo.
  let paused = reduceMotion.matches;
  let hovering = false;
  let visible = true;

  function goTo(index) {
    if (index === current) return;
    slides[current].classList.remove('active');
    slides[current].setAttribute('aria-hidden', 'true');
    slides[index].classList.add('active');
    slides[index].setAttribute('aria-hidden', 'false');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-pressed', 'false');
    dots[index].classList.add('active');
    dots[index].setAttribute('aria-pressed', 'true');
    current = index;
  }

  function next() {
    goTo((current + 1) % slides.length);
  }

  function start() {
    stop();
    interval = setInterval(next, 3000);
  }

  function stop() {
    clearInterval(interval);
    interval = null;
  }

  // Control de pausa visible (WCAG 2.2.2): el autoplay puede detenerse sin hover,
  // importante en táctil donde no existe hover.
  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'carousel-toggle';
  container.querySelector('.carousel-dots').prepend(toggleBtn);

  function updateToggle() {
    const running = !paused && !hovering;
    toggleBtn.innerHTML = running ? CAROUSEL_ICONS.pause : CAROUSEL_ICONS.play;
    toggleBtn.setAttribute('aria-label', running ? 'Pausar carrusel' : 'Reproducir carrusel');
    toggleBtn.setAttribute('aria-pressed', String(running));
  }

  // Única fuente de verdad: respeta pausa manual, hover/focus, pestaña oculta
  // y que la sección esté a la vista (no gasta CPU fuera de pantalla).
  function sync() {
    if (paused || hovering || document.hidden || !visible) stop();
    else start();
    updateToggle();
  }

  toggleBtn.addEventListener('click', () => {
    paused = !paused;
    // Un "play" explícito gana sobre el hover/focus actual (el puntero suele
    // seguir sobre el carrusel al hacer clic); se recupera al salir y volver.
    if (!paused) hovering = false;
    sync();
  });

  container.addEventListener('mouseenter', () => {
    hovering = true;
    sync();
  });
  container.addEventListener('mouseleave', () => {
    hovering = false;
    sync();
  });
  container.addEventListener('focusin', (e) => {
    if (e.target === toggleBtn) return;
    hovering = true;
    sync();
  });
  container.addEventListener('focusout', (e) => {
    if (!container.contains(e.relatedTarget)) {
      hovering = false;
      sync();
    }
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goTo(index);
      sync();
    });
  });

  document.addEventListener('visibilitychange', sync);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: 0.15 }).observe(container);
  }

  if (typeof reduceMotion.addEventListener === 'function') {
    reduceMotion.addEventListener('change', () => {
      paused = reduceMotion.matches;
      // Un cambio del sistema manda sobre el hover vigente.
      if (!paused) hovering = false;
      sync();
    });
  }

  sync();
}

/* ---------------------------------------------------------------------------
   Validación y envío del formulario
   --------------------------------------------------------------------------- */

/* Mensajes de validación en español. Los campos sin entrada propia caen en
   un texto genérico; el navegador ya marca qué restricción falló. */
const FIELD_MESSAGES = {
  name: 'Escribe tu nombre para poder responderte.',
  email: 'Escribe un correo válido, por ejemplo tu@email.com.',
  phone: 'Usa solo números y los símbolos + - ( ).'
};

function fieldErrorMessage(field) {
  const { validity } = field;
  if (validity.valueMissing) {
    return FIELD_MESSAGES[field.id] || 'Completa este campo.';
  }
  if (validity.typeMismatch || validity.patternMismatch) {
    return FIELD_MESSAGES[field.id] || 'Revisa el formato de este campo.';
  }
  if (validity.tooLong || validity.tooShort) {
    return FIELD_MESSAGES[field.id] || 'Revisa la longitud de este campo.';
  }
  return 'Revisa este campo antes de continuar.';
}

function clearFieldError(group) {
  group.classList.remove('has-error');
  const err = group.querySelector('.field-error');
  if (err) err.remove();
  const field = group.querySelector('input, select, textarea');
  if (field) {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  }
}

function handleFieldError(e) {
  e.preventDefault();
  const field = e.target;
  const group = field.closest('.form-group');
  if (!group) return;
  group.classList.add('has-error');

  let err = group.querySelector('.field-error');
  if (!err) {
    err = document.createElement('span');
    err.className = 'field-error';
    err.setAttribute('role', 'alert');
    group.appendChild(err);
  }

  const errorId = `${field.id || 'campo'}-error`;
  err.id = errorId;
  err.textContent = fieldErrorMessage(field);
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', errorId);
}

function handleFieldBlur(e) {
  const field = e.target;
  if (field.checkValidity()) {
    const group = field.closest('.form-group');
    if (group) clearFieldError(group);
  }
}

function handleFieldInput(e) {
  const field = e.target;
  const group = field.closest('.form-group');
  if (!group) return;
  if (group.classList.contains('has-error') && field.checkValidity()) {
    clearFieldError(group);
  }
}

function bindFieldValidation(form) {
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('invalid', handleFieldError);
    field.addEventListener('blur', handleFieldBlur);
    field.addEventListener('input', handleFieldInput);
  });
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalHTML = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Abriendo WhatsApp...';
    }

    const value = (name) => {
      const field = form.elements[name];
      return field ? field.value.trim() : '';
    };

    const service = value('service');
    const serviceText = SERVICE_LABELS[service] || service || 'No especificado';

    const message = [
      '*Nueva Solicitud - {Dr.Code}*',
      '',
      `*Nombre:* ${value('name')}`,
      `*Email:* ${value('email')}`,
      `*Teléfono:* ${value('phone')}`,
      `*Servicio:* ${serviceText}`,
      `*Mensaje:* ${value('message')}`
    ].join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    // Si el navegador bloquea el popup, window.open devuelve null: abrimos en
    // la misma pestaña para no perder la solicitud.
    const win = window.open(url, '_blank');
    if (win) {
      win.opener = null;
    } else {
      showToast('Tu navegador bloqueó la ventana emergente; abriendo WhatsApp aquí...');
      window.location.href = url;
      return;
    }
    showToast('Abriendo WhatsApp con tu solicitud...');

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    }
  });

  bindFieldValidation(form);
}

/* ---------------------------------------------------------------------------
   Toast
   --------------------------------------------------------------------------- */

function showToast(text) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = text;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 4000);
}

/* ---------------------------------------------------------------------------
   Arranque
   --------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  injectWhatsAppFloat();
  initFloatLift();
  initNavigation();
  initScrollSpy();
  initServiceToggles();
  initWorkDemos();
  initSkillsCarousel();
  initContactForm();

  const year = document.getElementById('footerYear');
  if (year) year.textContent = String(new Date().getFullYear());
});
