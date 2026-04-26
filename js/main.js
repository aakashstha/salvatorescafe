/**
 * Salvatore's Café — main.js
 *
 * 1.  Loading overlay
 * 2.  Navbar  (scroll effect + active-link tracking)
 * 3.  Mobile menu
 * 4.  Smooth scroll
 * 5.  Menu tabs
 * 6.  Scroll fade-in (IntersectionObserver)
 * 7.  Reservation form validation
 * 8.  Gallery lightbox
 * 9.  Newsletter form
 * 10. Scroll-to-top button
 * 11. Footer year
 */

'use strict';

/* ── 1. LOADING OVERLAY ──────────────────────────────────── */
(function initLoader() {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;

  const MIN_MS = 800;
  const start  = Date.now();

  window.addEventListener('load', () => {
    const wait = Math.max(0, MIN_MS - (Date.now() - start));
    setTimeout(() => {
      overlay.classList.add('hidden');
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    }, wait);
  });
})();


/* ── 2. NAVBAR ───────────────────────────────────────────── */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!navbar) return;

  const sections = Array.from(document.querySelectorAll('section[id]'));

  function update() {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    const midY = window.scrollY + window.innerHeight / 3;
    let current = sections[0];
    sections.forEach(s => { if (s.offsetTop <= midY) current = s; });

    navLinks.forEach(link => {
      link.classList.toggle('active',
        link.getAttribute('href').replace('#','') === current?.id);
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ── 3. MOBILE MENU ──────────────────────────────────────── */
(function initMobileMenu() {
  const btn     = document.getElementById('hamburger');
  const menu    = document.getElementById('mobile-menu');
  const links   = document.querySelectorAll('.mobile-link');
  if (!btn || !menu) return;

  const open  = () => {
    btn.classList.add('open'); menu.classList.add('open');
    btn.setAttribute('aria-expanded','true');
    menu.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    btn.classList.remove('open'); menu.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
    menu.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  };

  btn.addEventListener('click', () => btn.classList.contains('open') ? close() : open());
  links.forEach(l => l.addEventListener('click', close));
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) close();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();


/* ── 4. SMOOTH SCROLL ────────────────────────────────────── */
(function initSmoothScroll() {
  const navH = () => document.getElementById('navbar')?.offsetHeight ?? 0;

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id     = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH(), behavior: 'smooth' });
    });
  });
})();


/* ── 5. MENU TABS ────────────────────────────────────────── */
(function initMenuTabs() {
  const tabs   = document.querySelectorAll('.menu-tab');
  const panels = document.querySelectorAll('.menu-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected','true');

      const panel = document.getElementById(`tab-${tab.dataset.tab}`);
      if (!panel) return;
      panel.classList.add('active');

      // Re-trigger fade-in for cards in this panel
      const cards = panel.querySelectorAll('.fade-in-element');
      cards.forEach(c => c.classList.remove('visible'));
      requestAnimationFrame(() => requestAnimationFrame(() => observeElements(cards)));
    });
  });
})();


/* ── 6. SCROLL FADE-IN ───────────────────────────────────── */
function observeElements(els) {
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
}

(function initFadeIn() {
  observeElements(document.querySelectorAll('.fade-in-element:not(.hero-content)'));
})();


/* ── 7. RESERVATION FORM ─────────────────────────────────── */
(function initReservationForm() {
  const form    = document.getElementById('reservation-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  // Min date = today
  const dateEl = document.getElementById('res-date');
  if (dateEl) dateEl.min = new Date().toISOString().split('T')[0];

  const setError = (fieldId, errId, msg) => {
    const f = document.getElementById(fieldId);
    const e = document.getElementById(errId);
    if (!f || !e) return;
    if (msg) { f.classList.add('error'); e.textContent = msg; }
    else     { f.classList.remove('error'); e.textContent = ''; }
  };

  const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  function validate() {
    let ok = true;
    const name   = document.getElementById('res-name');
    const email  = document.getElementById('res-email');
    const date   = document.getElementById('res-date');
    const time   = document.getElementById('res-time');
    const guests = document.getElementById('res-guests');

    if (!name.value.trim() || name.value.trim().length < 2) {
      setError('res-name','error-name','Please enter your full name.'); ok = false;
    } else setError('res-name','error-name','');

    if (!validEmail(email.value)) {
      setError('res-email','error-email','Please enter a valid email.'); ok = false;
    } else setError('res-email','error-email','');

    if (!date.value) {
      setError('res-date','error-date','Please select a date.'); ok = false;
    } else {
      const chosen = new Date(date.value);
      const today  = new Date(); today.setHours(0,0,0,0);
      if (chosen < today) { setError('res-date','error-date','Date cannot be in the past.'); ok = false; }
      else setError('res-date','error-date','');
    }

    if (!time.value)   { setError('res-time','error-time','Please select a time.'); ok = false; }
    else               setError('res-time','error-time','');

    if (!guests.value) { setError('res-guests','error-guests','Please select guest count.'); ok = false; }
    else               setError('res-guests','error-guests','');

    return ok;
  }

  // Live-clear errors
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const err = document.getElementById(`error-${el.id.replace('res-','')}`);
      if (err) err.textContent = '';
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Confirm Booking';
      success.hidden = false;
      success.scrollIntoView({ behavior:'smooth', block:'nearest' });
      form.reset();
    }, 1400);
  });
})();


/* ── 8. GALLERY LIGHTBOX ─────────────────────────────────── */
(function initLightbox() {
  const grid     = document.querySelector('.gallery-grid');
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lightbox-img');
  const lbLabel  = document.getElementById('lightbox-label');
  const lbClose  = document.getElementById('lightbox-close');
  if (!grid || !lightbox) return;

  const open = (src, alt, label) => {
    lbImg.src = src; lbImg.alt = alt;
    if (lbLabel) lbLabel.textContent = label || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  };
  const close = () => {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    lbImg.src = '';
  };

  grid.querySelectorAll('.gallery-item').forEach(item => {
    const img   = item.querySelector('img');
    const label = item.dataset.label || img?.alt || '';

    // Make keyboard-focusable
    item.setAttribute('tabindex','0');
    item.setAttribute('role','button');

    item.addEventListener('click', () => {
      if (img) open(img.src, img.alt, label);
    });
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
    });
  });

  lbClose.addEventListener('click', close);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lightbox.hidden) close(); });
})();


/* ── 9. NEWSLETTER ───────────────────────────────────────── */
(function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  const msg  = document.getElementById('newsletter-msg');
  if (!form || !msg) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
      msg.textContent = 'Please enter a valid email.';
      msg.style.color = 'var(--error)';
      return;
    }
    const btn = form.querySelector('button');
    btn.disabled = true;
    setTimeout(() => {
      msg.textContent = 'Subscribed! Grazie ☕';
      msg.style.color = 'var(--success)';
      form.reset();
      btn.disabled = false;
    }, 800);
  });
})();


/* ── 10. SCROLL-TO-TOP ───────────────────────────────────── */
(function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;

  const toggle = () => { btn.hidden = window.scrollY < 420; };
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
})();


/* ── 11. FOOTER YEAR ─────────────────────────────────────── */
(function() {
  const el = document.getElementById('current-year');
  if (el) el.textContent = new Date().getFullYear();
})();
