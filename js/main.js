// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// Active nav link via IntersectionObserver
const sections = document.querySelectorAll('section[id]');
new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.querySelectorAll('a').forEach(a => a.classList.remove('active'));
    const active = navLinks.querySelector(`a[href="#${e.target.id}"]`);
    if (active) active.classList.add('active');
  });
}, { rootMargin: '-45% 0px -50% 0px' }).observe
  ? sections.forEach(s =>
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          navLinks.querySelectorAll('a').forEach(a => a.classList.remove('active'));
          const active = navLinks.querySelector(`a[href="#${e.target.id}"]`);
          if (active) active.classList.add('active');
        });
      }, { rootMargin: '-45% 0px -50% 0px' }).observe(s)
    )
  : null;

// Tab switching
document.querySelectorAll('.exp-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.target;
    document.querySelectorAll('.exp-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(target).classList.add('active');
  });
});

// Reveal on scroll (cards & timeline items)
const revealEls = document.querySelectorAll('.comp-card, .project-card, .timeline-item, .skill-group, .award-card');
new IntersectionObserver((entries, obs) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('revealed');
    obs.unobserve(e.target);
  });
}, { threshold: 0.12 }).observe
  ? revealEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
      new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          obs.unobserve(e.target);
        });
      }, { threshold: 0.12 }).observe(el);
    })
  : null;

// Contact form placeholder
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.textContent = '전송되었습니다 ✓';
  btn.disabled = true;
  btn.style.background = 'linear-gradient(135deg, #14b8a6, #0d9488)';
  setTimeout(() => {
    btn.textContent = '메시지 보내기';
    btn.disabled = false;
    btn.style.background = '';
    e.target.reset();
  }, 3000);
});
