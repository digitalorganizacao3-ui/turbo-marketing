/* ================================================
   TURBO MARKETING — script.js
   - Header scroll behavior
   - Menu hambúrguer mobile
   - Smooth scroll
   - Intersection Observer (reveal + counters)
   - Contador numérico animado
   - Canvas: elemento geométrico animado no Hero
   - Validação de formulário
   ================================================ */

/* ——— HEADER SCROLL ——— */
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}, { passive: true });


/* ——— MENU HAMBÚRGUER ——— */
const hamburger = document.getElementById('hamburger');
const nav       = document.getElementById('nav');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  nav.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Fechar ao clicar em link
nav.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    nav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Fechar ao clicar fora
document.addEventListener('click', (e) => {
  if (!header.contains(e.target) && nav.classList.contains('open')) {
    hamburger.classList.remove('open');
    nav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});


/* ——— SMOOTH SCROLL para links de âncora ——— */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
    const top = target.getBoundingClientRect().top + window.pageYOffset - headerH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ——— INTERSECTION OBSERVER: Reveal animado ——— */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Pequeno delay escalonado para elementos no mesmo grupo
      const delay = (entry.target.dataset.delay || 0);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

// Adiciona delay escalonado a elementos irmãos
document.querySelectorAll('.reveal').forEach((el, index) => {
  // Agrupa por pai para escalonar irmãos
  const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
  const siblingIndex = siblings.indexOf(el);
  el.dataset.delay = siblingIndex * 100;
  revealObserver.observe(el);
});


/* ——— CONTADOR NUMÉRICO ANIMADO ——— */
function animateCounter(el) {
  const target  = parseInt(el.dataset.target, 10);
  const prefix  = el.dataset.prefix  || '';
  const suffix  = el.dataset.suffix  || '';
  const duration = 1800; // ms
  const start   = performance.now();

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = easeOutCubic(progress);
    const current  = Math.round(eased * target);
    el.textContent = `${prefix}${current}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = `${prefix}${target}${suffix}`;
    }
  }

  requestAnimationFrame(step);
}

// Observa a seção de stats para disparar os contadores uma única vez
const counters = document.querySelectorAll('.counter');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counters.forEach(c => counterObserver.observe(c));


/* ——— CANVAS: ELEMENTO GEOMÉTRICO ANIMADO (HERO) ——— */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles, lines;

  // Configuração
  const PARTICLE_COUNT = 55;
  const MAX_DIST       = 160;
  const BASE_SPEED     = 0.35;
  const COLORS         = ['#00C2FF', '#1560BD', '#4A9AFF', '#0B2A4A'];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    init();
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function init() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:   randomBetween(0, W),
      y:   randomBetween(0, H),
      vx:  randomBetween(-BASE_SPEED, BASE_SPEED),
      vy:  randomBetween(-BASE_SPEED, BASE_SPEED),
      r:   randomBetween(1.5, 3.5),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: randomBetween(0.4, 1),
    }));
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Linhas entre partículas próximas
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.35;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,194,255,${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Partículas
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${hexToRgb(p.color)},${p.opacity})`;
      ctx.fill();

      // Mover
      p.x += p.vx;
      p.y += p.vy;

      // Bounce nas bordas
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
  }

  let animId;
  function loop() {
    draw();
    animId = requestAnimationFrame(loop);
  }

  // Pausa quando fora da tela (performance)
  const heroSection = document.getElementById('hero');
  const visibilityObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      loop();
    } else {
      cancelAnimationFrame(animId);
    }
  }, { threshold: 0 });
  visibilityObserver.observe(heroSection);

  // Resize debounced
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  resize();
})();


/* ——— VALIDAÇÃO E SUBMIT DO FORMULÁRIO ——— */
const contactForm  = document.getElementById('contactForm');
const formSuccess  = document.getElementById('formSuccess');

if (contactForm) {
  // Máscara de WhatsApp
  const whatsappInput = document.getElementById('whatsapp');
  if (whatsappInput) {
    whatsappInput.addEventListener('input', function () {
      let v = this.value.replace(/\D/g, '').slice(0, 11);
      if (v.length >= 11) {
        v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      } else if (v.length >= 7) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
      } else if (v.length >= 3) {
        v = v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
      }
      this.value = v;
    });
  }

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    let valid = true;

    // Limpa erros anteriores
    contactForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    // Valida campos obrigatórios
    ['nome', 'empresa', 'whatsapp'].forEach(id => {
      const field = document.getElementById(id);
      if (!field.value.trim()) {
        field.classList.add('error');
        valid = false;
      }
    });

    if (!valid) {
      // Foca no primeiro campo com erro
      const firstError = contactForm.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    // Simula envio (substituir por fetch/API real)
    const submitBtn = contactForm.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Enviando...</span>';

    setTimeout(() => {
      contactForm.style.display  = 'none';
      formSuccess.classList.add('visible');
    }, 1200);
  });
}


/* ——— ACTIVE NAV LINK no scroll ——— */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));
