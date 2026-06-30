/* ============================================
   SYNAPSER STUDIO — JavaScript Clone
   ============================================ */

'use strict';

// ─── LOADER ────────────────────────────────────────────────────────────────
(function initLoader() {
  const loader = document.getElementById('loader');
  const bar = document.getElementById('loaderBar');
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 18 + 4;
    if (progress >= 100) {
      progress = 100;
      bar.style.width = '100%';
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        initHeroCanvas();
        initRevealAnimations();
      }, 500);
    } else {
      bar.style.width = progress + '%';
    }
  }, 80);

  document.body.style.overflow = 'hidden';
})();


// ─── CUSTOM CURSOR ─────────────────────────────────────────────────────────
document.addEventListener('mousemove', (e) => {
  document.body.style.setProperty('--cx', e.clientX + 'px');
  document.body.style.setProperty('--cy', e.clientY + 'px');
});


// ─── NAVIGATION ────────────────────────────────────────────────────────────
const pages = {
  homepage: document.getElementById('page-homepage'),
  manifesto: document.getElementById('page-manifesto'),
  archive: document.getElementById('page-archive'),
};

const navLinks = document.querySelectorAll('.nav-link');
let currentPage = 'homepage';

function switchPage(pageName) {
  if (pageName === currentPage) return;

  // hide all
  Object.values(pages).forEach(p => p.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active'));

  // show target
  if (pages[pageName]) {
    pages[pageName].classList.add('active');
  }

  // set active nav
  const activeLink = document.querySelector(`.nav-link[data-page="${pageName}"]`);
  if (activeLink) activeLink.classList.add('active');

  currentPage = pageName;

  // archive page body tweaks
  if (pageName === 'archive') {
    document.body.classList.add('archive-mode');
    initArchiveDrag();
  } else {
    document.body.classList.remove('archive-mode');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(initRevealAnimations, 100);
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    switchPage(link.dataset.page);
  });
});

document.getElementById('nav-home').addEventListener('click', () => switchPage('homepage'));


// ─── HERO CANVAS (Radiating Lines + Keywords) ──────────────────────────────
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const keywords = [
    { label: 'vision', ax: 0.12, ay: 0.12 },
    { label: 'technology', ax: 0.22, ay: 0.19 },
    { label: 'creative', ax: 0.88, ay: 0.14 },
    { label: 'experience', ax: 0.72, ay: 0.22 },
    { label: 'branding', ax: 0.82, ay: 0.26 },
    { label: 'lisbon', ax: 0.93, ay: 0.22 },
    { label: 'interface', ax: 0.95, ay: 0.30 },
    { label: 'motion', ax: 0.09, ay: 0.44 },
    { label: 'design', ax: 0.93, ay: 0.54 },
    { label: 'innovation', ax: 0.11, ay: 0.76 },
    { label: 'future', ax: 0.90, ay: 0.76 },
    { label: 'development', ax: 0.44, ay: 0.88 },
    { label: 'modern', ax: 0.52, ay: 0.92 },
    { label: 'art', ax: 0.84, ay: 0.88 },
    { label: 'three.js', ax: 0.92, ay: 0.93 },
    { label: 'craft', ax: 0.70, ay: 0.92 },
    { label: 'precision', ax: 0.09, ay: 0.93 },
    { label: 'digital', ax: 0.27, ay: 0.92 },
  ];

  let mouse = { x: 0.5, y: 0.5 };
  let animTarget = { x: 0.5, y: 0.5 };
  let animCurrent = { x: 0.5, y: 0.5 };
  let opacity = 0;
  let frameId;

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = e.clientY / window.innerHeight;
  });

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Animate keywords
  const kwStates = keywords.map(kw => ({
    ...kw,
    offsetX: (Math.random() - 0.5) * 20,
    offsetY: (Math.random() - 0.5) * 20,
    phase: Math.random() * Math.PI * 2,
    speed: 0.4 + Math.random() * 0.4,
  }));

  function draw(t) {
    frameId = requestAnimationFrame(draw);

    // Ease opacity in
    if (opacity < 1) opacity = Math.min(1, opacity + 0.01);

    // Lerp animation center toward mouse
    animTarget.x += (mouse.x - animTarget.x) * 0.06;
    animTarget.y += (mouse.y - animTarget.y) * 0.06;
    animCurrent.x += (animTarget.x - animCurrent.x) * 0.08;
    animCurrent.y += (animTarget.y - animCurrent.y) * 0.08;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = opacity * 0.85;

    const lineColor = 'rgba(58,56,53,0.18)';
    const textColor = 'rgba(58,56,53,0.72)';

    kwStates.forEach((kw, i) => {
      const t_phase = t * 0.0003 * kw.speed + kw.phase;
      const px = kw.ax * W + Math.sin(t_phase) * kw.offsetX;
      const py = kw.ay * H + Math.cos(t_phase * 0.7) * kw.offsetY;

      // Line from center to keyword
      const grad = ctx.createLinearGradient(cx, cy, px, py);
      grad.addColorStop(0, 'rgba(58,56,53,0.0)');
      grad.addColorStop(0.3, lineColor);
      grad.addColorStop(1, lineColor);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Keyword text
      ctx.font = `italic 300 13px 'Barlow', sans-serif`;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(kw.label, px, py);
    });

    ctx.globalAlpha = 1;
  }

  requestAnimationFrame((t) => draw(t));
}


// ─── WORKS DRAG SCROLL ─────────────────────────────────────────────────────
(function initWorksDrag() {
  const wrapper = document.querySelector('.works-track-wrapper');
  if (!wrapper) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  wrapper.addEventListener('mousedown', (e) => {
    isDown = true;
    wrapper.classList.add('grabbing');
    startX = e.pageX - wrapper.offsetLeft;
    scrollLeft = wrapper.scrollLeft;
  });
  wrapper.addEventListener('mouseleave', () => {
    isDown = false;
    wrapper.classList.remove('grabbing');
  });
  wrapper.addEventListener('mouseup', () => {
    isDown = false;
    wrapper.classList.remove('grabbing');
  });
  wrapper.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - wrapper.offsetLeft;
    const walk = (x - startX) * 1.5;
    wrapper.scrollLeft = scrollLeft - walk;
  });
})();


// ─── FAQ ACCORDION ─────────────────────────────────────────────────────────
(function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

      // Open clicked if was closed
      if (!isOpen) item.classList.add('open');
    });
  });
})();


// ─── LANGUAGE TOGGLE ───────────────────────────────────────────────────────
(function initLang() {
  const btn = document.getElementById('langToggle');
  let isEN = false;
  btn.addEventListener('click', () => {
    isEN = !isEN;
    btn.textContent = isEN ? 'EN' : 'PT';
  });
})();


// ─── SOUND TOGGLE ──────────────────────────────────────────────────────────
(function initSound() {
  const btn = document.getElementById('soundToggle');
  const wave1 = btn.querySelector('.sound-wave-1');
  const wave2 = btn.querySelector('.sound-wave-2');
  let muted = false;

  btn.addEventListener('click', () => {
    muted = !muted;
    wave1.style.opacity = muted ? '0.2' : '1';
    wave2.style.opacity = muted ? '0.2' : '1';
  });
})();


// ─── SCROLL REVEAL ─────────────────────────────────────────────────────────
function initRevealAnimations() {
  // Add reveal class to key elements
  const targets = document.querySelectorAll(
    '.service-item, .pricing-card, .faq-item, .work-item, .manifesto-block'
  );
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i * 0.06) + 's';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}


// ─── ARCHIVE DRAG ──────────────────────────────────────────────────────────
function initArchiveDrag() {
  const wrapper = document.getElementById('archiveCanvas');
  const inner = document.getElementById('archiveCanvasInner');
  if (!wrapper || !inner) return;

  let isDown = false;
  let startX, startY, transX = 0, transY = 0, lastX, lastY;

  wrapper.addEventListener('mousedown', (e) => {
    isDown = true;
    wrapper.classList.add('grabbing');
    startX = e.clientX - transX;
    startY = e.clientY - transY;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    isDown = false;
    wrapper.classList.remove('grabbing');
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    transX = e.clientX - startX;
    transY = e.clientY - startY;
    inner.style.transform = `translate(${transX}px, ${transY}px)`;
  });

  // Touch support
  wrapper.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startX = t.clientX - transX;
    startY = t.clientY - transY;
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    transX = t.clientX - startX;
    transY = t.clientY - startY;
    inner.style.transform = `translate(${transX}px, ${transY}px)`;
  }, { passive: true });
}


// ─── ARCHIVE VIEW TOGGLE ───────────────────────────────────────────────────
(function initArchiveToggle() {
  const gridBtn = document.getElementById('archiveGrid');
  const listBtn = document.getElementById('archiveList');
  const canvasWrapper = document.getElementById('archiveCanvas');
  const listView = document.getElementById('archiveListView');
  const hintEl = document.querySelector('.archive-header-hint');

  if (!gridBtn || !listBtn) return;

  gridBtn.addEventListener('click', () => {
    gridBtn.classList.add('active');
    listBtn.classList.remove('active');
    if (canvasWrapper) canvasWrapper.style.display = '';
    if (listView) listView.style.display = 'none';
    if (hintEl) hintEl.style.display = '';
  });

  listBtn.addEventListener('click', () => {
    listBtn.classList.add('active');
    gridBtn.classList.remove('active');
    if (canvasWrapper) canvasWrapper.style.display = 'none';
    if (listView) listView.style.display = 'block';
    if (hintEl) hintEl.style.display = 'none';
  });
})();


// ─── SERVICE ITEM HOVER FX ─────────────────────────────────────────────────
document.querySelectorAll('.service-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    item.style.transition = 'all 0.25s ease';
  });
});


// ─── WORK ITEM CLICK ───────────────────────────────────────────────────────
document.querySelectorAll('.work-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.work-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    const title = item.dataset.title;
    const el = document.querySelector('.featured-title');
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      setTimeout(() => {
        el.textContent = title;
        el.style.transition = 'opacity 0.4s, transform 0.4s';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 200);
    }
  });
});


// ─── HEADER SCROLL BEHAVIOR ────────────────────────────────────────────────
(function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 80) {
      header.style.backdropFilter = 'blur(16px)';
      header.style.webkitBackdropFilter = 'blur(16px)';
      header.style.background = 'rgba(200, 194, 174, 0.4)';
      header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.25)';
      header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.03)';
    } else {
      header.style.backdropFilter = '';
      header.style.webkitBackdropFilter = '';
      header.style.background = 'transparent';
      header.style.borderBottom = 'none';
      header.style.boxShadow = 'none';
    }
  });
})();


// ─── PARALLAX HERO TITLE ───────────────────────────────────────────────────
(function initParallax() {
  const heroTitle = document.getElementById('heroTitle');
  if (!heroTitle) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (currentPage !== 'homepage') return;
    heroTitle.style.transform = `translateY(${y * 0.3}px)`;
    heroTitle.style.opacity = Math.max(0, 0.22 - y / 600);
  });
})();
