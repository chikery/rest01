/* ============================================================
   PALETTE & MODE SWITCHER  (가장 먼저 실행 — 깜빡임 방지)
   ============================================================ */
(function initTheme() {
  const html       = document.documentElement;
  const themeLink  = document.getElementById('themeLink');

  const THEMES = {
    royal:  { dark: '#070A1A', light: '#F0F5FF', primary: '#3D6FE8' },
    forest: { dark: '#060F09', light: '#F0FDF4', primary: '#34D399' },
    ember:  { dark: '#100707', light: '#FFF5F5', primary: '#F87171' },
    dusk:   { dark: '#08060F', light: '#FAF5FF', primary: '#A78BFA' },
    noir:   { dark: '#09090A', light: '#FFFBEB', primary: '#F59E0B' },
  };

  const savedTheme = localStorage.getItem('theme') || 'royal';
  const savedMode  = localStorage.getItem('mode')  || 'dark';

  function applyTheme(theme, mode) {
    html.dataset.theme = theme;
    html.dataset.mode  = mode;
    themeLink.href     = `css/themes/${theme}.css`;
    localStorage.setItem('theme', theme);
    localStorage.setItem('mode',  mode);

    // 팔레트 패널 active 상태 갱신
    document.querySelectorAll('.swatch').forEach(s =>
      s.classList.toggle('active', s.dataset.theme === theme)
    );
    document.getElementById('modeDark') .classList.toggle('active', mode === 'dark');
    document.getElementById('modeLight').classList.toggle('active', mode === 'light');

    // 캔버스 색상 갱신 이벤트
    document.dispatchEvent(new Event('themechanged'));
  }

  // 초기 적용
  applyTheme(savedTheme, savedMode);

  // 패널 열기/닫기
  const trigger = document.getElementById('paletteTrigger');
  const panel   = document.getElementById('palettePanel');
  trigger.addEventListener('click', e => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });
  document.addEventListener('click', () => panel.classList.remove('open'));
  panel.addEventListener('click', e => e.stopPropagation());

  // 모드 전환
  document.getElementById('modeDark') .addEventListener('click', () => applyTheme(html.dataset.theme, 'dark'));
  document.getElementById('modeLight').addEventListener('click', () => applyTheme(html.dataset.theme, 'light'));

  // 팔레트 전환
  document.querySelectorAll('.swatch').forEach(btn =>
    btn.addEventListener('click', () => applyTheme(btn.dataset.theme, html.dataset.mode))
  );
})();

/* ============================================================
   NAVBAR
   ============================================================ */
const navbar   = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
const sections  = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

sections.forEach(s =>
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.querySelectorAll('a').forEach(a => a.classList.remove('active'));
      const hit = navLinks.querySelector(`a[href="#${e.target.id}"]`);
      if (hit) hit.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' }).observe(s)
);

/* ============================================================
   SCROLL REVEAL
   ============================================================ */

document.querySelectorAll('.comp-card, .project-card, .timeline-item, .skill-group, .award-card')
  .forEach(el => {
    el.style.cssText += 'opacity:0;transform:translateY(22px);transition:opacity .55s ease,transform .55s ease';
    new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12 }).observe(el);
  });

/* ============================================================
   TABS
   ============================================================ */
document.querySelectorAll('.exp-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.exp-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.add('active');
  });
});

/* ============================================================
   CONTACT FORM
   ============================================================ */
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.textContent = '전송되었습니다 ✓';
  btn.disabled = true;
  btn.style.background = 'linear-gradient(135deg,#14b8a6,#0d9488)';
  setTimeout(() => {
    btn.textContent = '메시지 보내기';
    btn.disabled = false;
    btn.style.background = '';
    e.target.reset();
  }, 3000);
});

/* ============================================================
   HERO — PARTICLE NETWORK CANVAS
   ============================================================ */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  const ctx    = canvas.getContext('2d');

  // CSS 변수에서 색상 읽기
  function getColors() {
    const s = getComputedStyle(document.documentElement);
    return {
      dot:  `rgba(${s.getPropertyValue('--clr-event-rgb').trim()}, 0.65)`,
      linkBase: s.getPropertyValue('--clr-primary-rgb').trim(),
    };
  }
  let colors = getColors();
  document.addEventListener('themechanged', () => {
    // 테마 CSS 파일이 로드된 후 읽도록 약간 지연
    setTimeout(() => { colors = getColors(); }, 80);
  });

  const PARTICLE_COUNT = 72;
  const LINK_DIST      = 140;
  const SPEED          = 0.45;

  let W, H, mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // mouse tracking (subtle parallax on particles)
  const hero = document.getElementById('home');
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }, { passive: true });
  hero.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  // create particles
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x:  Math.random() * W,
    y:  Math.random() * H,
    vx: (Math.random() - .5) * SPEED,
    vy: (Math.random() - .5) * SPEED,
    r:  Math.random() * 1.8 + .8,
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // update & draw dots
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      // subtle mouse repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 90) {
        p.x += (dx / dist) * 1.2;
        p.y += (dy / dist) * 1.2;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = colors.dot;
      ctx.fill();
    }

    // draw links
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.35;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${colors.linkBase},${alpha})`;
          ctx.lineWidth = .8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ============================================================
   HERO — TYPEWRITER
   ============================================================ */
(function initTypewriter() {
  const el     = document.getElementById('typingText');
  const lines  = [
    '비즈니스와 마케팅적 시각으로\n사용자 경험을 최적화하여 개발하는 AI 엔지니어입니다.',
  ];
  const BOLD_KEYWORD = 'AI 엔지니어';

  let charIdx = 0;
  const full  = lines[0];

  // Start after a short delay so it feels intentional
  setTimeout(function type() {
    charIdx++;
    const slice = full.slice(0, charIdx);

    // render with bold keyword
    const safe = slice
      .replace(/\n/g, '<br/>')
      .replace(BOLD_KEYWORD, `<strong>${BOLD_KEYWORD}</strong>`);
    el.innerHTML = safe;

    if (charIdx < full.length) setTimeout(type, 38);
  }, 700);
})();

/* ============================================================
   HERO — STATS COUNTER
   ============================================================ */
(function initCounters() {
  const statEls = document.querySelectorAll('.stat-num[data-target]');

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start    = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const val  = Math.round(ease * target);
      el.textContent = prefix + val + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // trigger when stats block enters viewport
  const statsBlock = document.querySelector('.hero-stats');
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      statEls.forEach(el => animateCounter(el));
      obs.unobserve(e.target);
    });
  }, { threshold: 0.8 }).observe(statsBlock);
})();

/* ============================================================
   HERO — PHOTO PARALLAX (mouse tilt)
   ============================================================ */
(function initParallax() {
  const wrap  = document.querySelector('.hero-photo-wrap');
  const glow1 = document.querySelector('.glow-1');
  const glow2 = document.querySelector('.glow-2');
  const hero  = document.getElementById('home');

  hero.addEventListener('mousemove', e => {
    const r  = hero.getBoundingClientRect();
    const cx = r.width  / 2;
    const cy = r.height / 2;
    const dx = (e.clientX - r.left - cx) / cx;  // -1 ~ 1
    const dy = (e.clientY - r.top  - cy) / cy;

    wrap.style.transform  = `translate(${dx * 8}px, ${dy * 6}px)`;
    glow1.style.transform = `translate(${dx * -18}px, ${dy * -12}px)`;
    glow2.style.transform = `translate(${dx *  12}px, ${dy *  10}px)`;
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    wrap.style.transform  = '';
    glow1.style.transform = '';
    glow2.style.transform = '';
  });

  // smooth transition
  [wrap, glow1, glow2].forEach(el =>
    el.style.transition = 'transform .25s ease'
  );
})();
