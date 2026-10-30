/**
 * main.js — Portfolio Meeko
 * Phase 4: Interactivity & Behaviour
 *
 * Sections:
 *  1. DOM helpers
 *  2. Custom cursor
 *  3. Navigation (scroll-aware, active link, mobile drawer)
 *  4. Scroll-reveal (IntersectionObserver)
 *  5. Skill bar animation
 *  6. Counter animation
 *  7. FAQ accordion
 *  8. Works filter
 *  9. Contact form (client-side validation + feedback)
 * 10. Back-to-top button
 * 11. Footer year
 * 12. Init
 */

'use strict';

/* =====================================================
   1. DOM HELPERS
   ===================================================== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* =====================================================
   2. CUSTOM CURSOR (desktop only)
   ===================================================== */
function initCursor() {
  const cursor     = $('#cursor');
  const cursorRing = $('#cursorRing');
  if (!cursor || !cursorRing) return;

  // Only on pointer devices
  if (!window.matchMedia('(hover: hover)').matches) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Ring lags behind with lerp
  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateRing() {
    ringX = lerp(ringX, mouseX, 0.12);
    ringY = lerp(ringY, mouseY, 0.12);
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Grow ring on interactive elements
  const interactiveSelector = 'a, button, [role="button"], .tag, .card, .blog-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      cursorRing.style.width  = '60px';
      cursorRing.style.height = '60px';
      cursorRing.style.opacity = '0.8';
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      cursorRing.style.width  = '36px';
      cursorRing.style.height = '36px';
      cursorRing.style.opacity = '0.5';
    }
  });
}

/* =====================================================
   3. NAVIGATION
   ===================================================== */
function initNav() {
  const nav        = $('#nav');
  const hamburger  = $('#hamburger');
  const drawer     = $('#mobileDrawer');
  const navLinks   = $$('[data-nav]');
  const drawerLinks = $$('[data-drawer-link]');
  const sections   = $$('section[id], div[id="hero"]');

  // ---- Scroll-aware background ----
  function onScroll() {
    const scrolled = window.scrollY > 20;
    nav.classList.toggle('is-scrolled', scrolled);

    // ---- Active link highlight ----
    let current = '';
    sections.forEach((section) => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) current = section.id;
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('is-active', href === current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // ---- Mobile drawer toggle ----
  function openDrawer() {
    hamburger.classList.add('is-open');
    drawer.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    hamburger.classList.remove('is-open');
    drawer.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('is-open');
    isOpen ? closeDrawer() : openDrawer();
  });

  // Close on drawer link click
  drawerLinks.forEach((link) => link.addEventListener('click', closeDrawer));

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // Close when clicking outside drawer
  document.addEventListener('click', (e) => {
    if (
      drawer.classList.contains('is-open') &&
      !drawer.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeDrawer();
    }
  });
}

/* =====================================================
   4. SCROLL-REVEAL (IntersectionObserver)
   ===================================================== */
function initScrollReveal() {
  const revealEls  = $$('.reveal');
  const staggerEls = $$('.stagger');

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  revealEls.forEach((el) => io.observe(el));
  staggerEls.forEach((el) => io.observe(el));
}

/* =====================================================
   5. SKILL BAR ANIMATION
   ===================================================== */
function initSkillBars() {
  const bars = $$('.skill-bar__fill');
  if (!bars.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          const width = fill.dataset.width || 0;
          // Slight delay so reveal animation finishes first
          setTimeout(() => {
            fill.style.width = width + '%';
          }, 200);
          io.unobserve(fill);
        }
      });
    },
    { threshold: 0.5 }
  );

  bars.forEach((bar) => io.observe(bar));
}

/* =====================================================
   6. COUNTER ANIMATION
   ===================================================== */
function initCounters() {
  const counters = $$('.counter[data-target]');
  if (!counters.length) return;

  function animateCount(el) {
    const target  = parseInt(el.dataset.target, 10);
    const suffix  = el.textContent.replace(/\d/g, '');
    const duration = 1800; // ms
    const start   = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => io.observe(el));
}

/* =====================================================
   7. FAQ ACCORDION
   ===================================================== */
function initAccordions() {
  const triggers = $$('.accordion__trigger');

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item    = trigger.closest('.accordion__item');
      const isOpen  = item.classList.contains('is-open');
      const panel   = item.querySelector('.accordion__panel');

      // Close all siblings in same accordion
      const accordion = trigger.closest('.accordion');
      $$('.accordion__item', accordion).forEach((sibling) => {
        if (sibling !== item && sibling.classList.contains('is-open')) {
          sibling.classList.remove('is-open');
          sibling.querySelector('.accordion__trigger')
                 .setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle clicked
      item.classList.toggle('is-open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

/* =====================================================
   8. WORKS FILTER
   ===================================================== */
function initWorksFilter() {
  const filterBtns = $$('[data-filter]');
  const cards      = $$('#worksGrid .card');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filter = btn.dataset.filter;

      cards.forEach((card) => {
        const category = card.dataset.category || 'all';
        const show = filter === 'all' || category === filter;

        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        if (show) {
          card.style.opacity   = '1';
          card.style.transform = 'scale(1)';
          card.style.display   = '';
        } else {
          card.style.opacity   = '0';
          card.style.transform = 'scale(0.96)';
          setTimeout(() => {
            if (btn.dataset.filter !== 'all' && card.dataset.category !== btn.dataset.filter) {
              card.style.display = 'none';
            }
          }, 300);
        }
      });
    });
  });
}

/* =====================================================
   9. CONTACT FORM
   ===================================================== */
function initContactForm() {
  const form      = $('#contactForm');
  const submitBtn = $('#submitBtn');
  if (!form) return;

  function showFieldError(input, msg) {
    input.style.borderColor = '#ef4444';
    let err = input.nextElementSibling;
    if (!err || !err.classList.contains('field-error')) {
      err = document.createElement('p');
      err.className = 'field-error';
      err.style.cssText = 'color:#ef4444;font-size:0.75rem;margin-top:0.25rem;';
      input.insertAdjacentElement('afterend', err);
    }
    err.textContent = msg;
  }

  function clearFieldError(input) {
    input.style.borderColor = '';
    const err = input.nextElementSibling;
    if (err && err.classList.contains('field-error')) err.remove();
  }

  function validateForm() {
    let valid = true;
    const name    = $('#name');
    const email   = $('#email');
    const message = $('#message');

    if (!name.value.trim()) {
      showFieldError(name, 'Please enter your name.');
      valid = false;
    } else { clearFieldError(name); }

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email.value.trim())) {
      showFieldError(email, 'Please enter a valid email address.');
      valid = false;
    } else { clearFieldError(email); }

    if (message.value.trim().length < 20) {
      showFieldError(message, 'Message must be at least 20 characters.');
      valid = false;
    } else { clearFieldError(message); }

    return valid;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    submitBtn.textContent = 'Sending…';
    submitBtn.disabled    = true;

    // Simulate network delay (replace with real fetch to your endpoint)
    await new Promise((res) => setTimeout(res, 1500));

    submitBtn.textContent = '✓ Message Sent!';
    submitBtn.style.background = '#4caf50';
    form.reset();

    setTimeout(() => {
      submitBtn.textContent    = 'Send Message ✦';
      submitBtn.style.background = '';
      submitBtn.disabled       = false;
    }, 4000);
  });

  // Live inline validation on blur
  $$('.form-input, .form-textarea', form).forEach((input) => {
    input.addEventListener('blur', () => {
      if (input.value.trim()) clearFieldError(input);
    });
  });
}

/* =====================================================
   10. BACK TO TOP
   ===================================================== */
function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =====================================================
   11. FOOTER YEAR
   ===================================================== */
function initYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
}

/* =====================================================
   12. INIT — run after DOM ready
   ===================================================== */
function init() {
  initCursor();
  initNav();
  initScrollReveal();
  initSkillBars();
  initCounters();
  initAccordions();
  initWorksFilter();
  initContactForm();
  initBackToTop();
  initYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

