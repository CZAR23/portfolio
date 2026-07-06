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
        initWavesCanvas();
        initHeroCanvas();
        initGlassSurface();
        initRevealAnimations();
        initFeaturedWork();
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

  // Update footer navigation button text & target
  const footerBtn = document.getElementById('footerNavBtn');
  if (footerBtn) {
    const contentEl = footerBtn.querySelector('.glass-surface__content');
    if (pageName === 'archive') {
      if (contentEl) {
        contentEl.innerHTML = 'HOMEPAGE'.split('').map(char => '<span>' + char + '</span>').join('');
      }
      footerBtn.dataset.page = 'homepage';
      footerBtn.setAttribute('data-page', 'homepage');
    } else {
      if (contentEl) {
        contentEl.innerHTML = 'ARCHIVE'.split('').map(char => '<span>' + char + '</span>').join('');
      }
      footerBtn.dataset.page = 'archive';
      footerBtn.setAttribute('data-page', 'archive');
    }
  }

  // archive page body tweaks
  if (pageName === 'archive') {
    document.body.classList.add('archive-mode');
    initArchiveDrag();
  } else {
    document.body.classList.remove('archive-mode');
  }

  // Update header responsive colors
  updateHeaderTheme();

  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(initRevealAnimations, 100);
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    switchPage(link.dataset.page);
  });
});

const navHome = document.getElementById('nav-home');
if (navHome) {
  navHome.addEventListener('click', () => switchPage('homepage'));
}


// ─── HERO WAVES CANVAS (Glowing Gold Ribbons) ──────────────────────────────
function initWavesCanvas() {
  const canvas = document.getElementById('wavesCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let frameId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // 5 layered ribbons: each is a glowing sine curve with its own height, amplitude, frequency, and drift speed
  const ribbons = [
    {
      yBase: 0.50, // Center line (percentage of canvas height)
      amp: 45,     // Amplitude
      freq1: 0.0012,
      freq2: 0.0028,
      speed1: 0.0012,
      speed2: 0.0008,
      phase1: Math.random() * Math.PI * 2,
      phase2: Math.random() * Math.PI * 2,
      lineWidth: 2.2,
      stroke: 'rgba(235, 195, 110, 0.45)', // Warm gold
      glowColor: 'rgba(235, 180, 80, 0.55)',
      glowBlur: 18
    },
    {
      yBase: 0.47,
      amp: 65,
      freq1: 0.0008,
      freq2: 0.0018,
      speed1: -0.0007,
      speed2: 0.0005,
      phase1: Math.random() * Math.PI * 2,
      phase2: Math.random() * Math.PI * 2,
      lineWidth: 1.8,
      stroke: 'rgba(212, 175, 55, 0.35)',
      glowColor: 'rgba(212, 175, 55, 0.45)',
      glowBlur: 25
    },
    {
      yBase: 0.53,
      amp: 35,
      freq1: 0.0018,
      freq2: 0.0035,
      speed1: 0.0018,
      speed2: -0.0012,
      phase1: Math.random() * Math.PI * 2,
      phase2: Math.random() * Math.PI * 2,
      lineWidth: 1.5,
      stroke: 'rgba(255, 215, 0, 0.4)',
      glowColor: 'rgba(255, 200, 0, 0.5)',
      glowBlur: 12
    },
    {
      yBase: 0.44,
      amp: 80,
      freq1: 0.0006,
      freq2: 0.0013,
      speed1: -0.0004,
      speed2: -0.0006,
      phase1: Math.random() * Math.PI * 2,
      phase2: Math.random() * Math.PI * 2,
      lineWidth: 2.6,
      stroke: 'rgba(197, 160, 89, 0.28)',
      glowColor: 'rgba(197, 160, 89, 0.35)',
      glowBlur: 30
    },
    {
      yBase: 0.56,
      amp: 25,
      freq1: 0.0025,
      freq2: 0.005,
      speed1: 0.0025,
      speed2: 0.0018,
      phase1: Math.random() * Math.PI * 2,
      phase2: Math.random() * Math.PI * 2,
      lineWidth: 1.2,
      stroke: 'rgba(240, 200, 120, 0.45)',
      glowColor: 'rgba(240, 190, 90, 0.55)',
      glowBlur: 10
    }
  ];

  function draw() {
    frameId = requestAnimationFrame(draw);

    // Cheap performance early exit when not on homepage
    if (currentPage !== 'homepage') return;

    const W = canvas.width;
    const H = canvas.height;
    const isMobile = window.innerWidth <= 900;

    ctx.clearRect(0, 0, W, H);

    ribbons.forEach(ribbon => {
      // Independent phase updates for dynamic drifting
      ribbon.phase1 += ribbon.speed1;
      ribbon.phase2 += ribbon.speed2;

      const baseline = isMobile ? W * ribbon.yBase : H * ribbon.yBase;
      const currentAmp = isMobile ? ribbon.amp * 0.6 : ribbon.amp;

      ctx.beginPath();
      if (isMobile) {
        // Vertical waves: iterate y from 0 to H
        for (let y = 0; y <= H; y += 3) {
          const envelope = Math.sin((y / H) * Math.PI);
          const xOffset = (
            Math.sin(y * ribbon.freq1 + ribbon.phase1) * currentAmp +
            Math.cos(y * ribbon.freq2 + ribbon.phase2) * (currentAmp * 0.4)
          ) * envelope;

          if (y === 0) {
            ctx.moveTo(baseline + xOffset, y);
          } else {
            ctx.lineTo(baseline + xOffset, y);
          }
        }
      } else {
        // Horizontal waves: iterate x from 0 to W
        for (let x = 0; x <= W; x += 3) {
          const envelope = Math.sin((x / W) * Math.PI);
          const yOffset = (
            Math.sin(x * ribbon.freq1 + ribbon.phase1) * currentAmp +
            Math.cos(x * ribbon.freq2 + ribbon.phase2) * (currentAmp * 0.4)
          ) * envelope;

          if (x === 0) {
            ctx.moveTo(x, baseline + yOffset);
          } else {
            ctx.lineTo(x, baseline + yOffset);
          }
        }
      }

      ctx.shadowColor = ribbon.glowColor;
      ctx.shadowBlur = ribbon.glowBlur;
      ctx.strokeStyle = ribbon.stroke;
      ctx.lineWidth = ribbon.lineWidth * 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Pass 2: Sharp inner core
      ctx.shadowBlur = ribbon.glowBlur * 0.4;
      ctx.strokeStyle = 'rgba(255, 240, 210, 0.85)';
      ctx.lineWidth = ribbon.lineWidth * 0.65;
      ctx.stroke();
    });

    // Reset shadow states
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  draw();
}


// ─── GLASS SURFACE COMPONENT (Vanilla Implementation of React Bits) ────────
function initGlassSurface() {
  const container = document.getElementById('footerNavBtn');
  if (!container) return;

  const feImage = document.getElementById('glass-fe-image-footer');
  const redChannel = document.getElementById('glass-red-footer');
  const greenChannel = document.getElementById('glass-green-footer');
  const blueChannel = document.getElementById('glass-blue-footer');
  const gaussianBlur = document.getElementById('glass-blur-footer');

  // Config parameters mirroring React Bits component
  const borderRadius = 25;
  const borderWidth = 0.07;
  const brightness = 50;
  const opacity = 0.93;
  const blur = 11;
  const displace = 0.7; // output blur (stdDeviation)
  const distortionScale = -180;
  const redOffset = 0;
  const greenOffset = 10;
  const blueOffset = 20;
  const xChannel = 'R';
  const yChannel = 'G';
  const mixBlendMode = 'difference';

  const filterId = 'glass-filter-footer';
  const redGradId = 'red-grad-footer';
  const blueGradId = 'blue-grad-footer';

  function generateDisplacementMap() {
    const rect = container.getBoundingClientRect();
    const actualWidth = rect.width || 140;
    const actualHeight = rect.height || 50;
    const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);

    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
      </svg>
    `;

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  }

  function updateDisplacementMap() {
    if (feImage) {
      feImage.setAttribute('href', generateDisplacementMap());
    }
  }

  // Set initial scales and channels
  if (redChannel) {
    redChannel.setAttribute('scale', (distortionScale + redOffset).toString());
    redChannel.setAttribute('xChannelSelector', xChannel);
    redChannel.setAttribute('yChannelSelector', yChannel);
  }
  if (greenChannel) {
    greenChannel.setAttribute('scale', (distortionScale + greenOffset).toString());
    greenChannel.setAttribute('xChannelSelector', xChannel);
    greenChannel.setAttribute('yChannelSelector', yChannel);
  }
  if (blueChannel) {
    blueChannel.setAttribute('scale', (distortionScale + blueOffset).toString());
    blueChannel.setAttribute('xChannelSelector', xChannel);
    blueChannel.setAttribute('yChannelSelector', yChannel);
  }
  if (gaussianBlur) {
    gaussianBlur.setAttribute('stdDeviation', displace.toString());
  }

  updateDisplacementMap();

  // ResizeObserver for dynamic adjustment
  try {
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(updateDisplacementMap, 0);
    });
    resizeObserver.observe(container);
  } catch (e) {
    window.addEventListener('resize', updateDisplacementMap);
  }

  // SVG support detection
  function checkSvgSupport() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return false;
    }

    const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);

    if (isWebkit || isFirefox) {
      return false;
    }

    const div = document.createElement('div');
    div.style.backdropFilter = `url(#${filterId})`;
    return div.style.backdropFilter !== '';
  }

  const svgSupported = checkSvgSupport();
  container.classList.add(svgSupported ? 'glass-surface--svg' : 'glass-surface--fallback');
}


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

    // Cheap performance early exit when not on homepage
    if (currentPage !== 'homepage') return;

    // Ease opacity in
    if (opacity < 1) opacity = Math.min(1, opacity + 0.01);

    // Lerp animation center toward mouse
    animTarget.x += (mouse.x - animTarget.x) * 0.06;
    animTarget.y += (mouse.y - animTarget.y) * 0.06;
    animCurrent.x += (animTarget.x - animCurrent.x) * 0.08;
    animCurrent.y += (animTarget.y - animCurrent.y) * 0.08;

    const W = canvas.width;
    const H = canvas.height;

    // Draw relative to custom cursor coordinates
    const curX = animCurrent.x * W;
    const curY = animCurrent.y * H;

    ctx.clearRect(0, 0, W, H);

    kwStates.forEach((kw, i) => {
      const t_phase = t * 0.0003 * kw.speed + kw.phase;
      const px = kw.ax * W + Math.sin(t_phase) * kw.offsetX;
      const py = kw.ay * H + Math.cos(t_phase * 0.7) * kw.offsetY;

      // Distance from cursor to keyword
      const dx = px - curX;
      const dy = py - curY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Proximity reveal factor: 1 when close, fading out to 0 at 350px away
      const maxDistance = 350;
      const proximity = Math.max(0, 1 - dist / maxDistance);

      // Keyword dynamic opacity: very faint when far, bright when close
      const kwOpacity = 0.05 + proximity * 0.7; // goes from 0.05 to 0.75

      // Line radiating from custom cursor to keyword
      if (proximity > 0) {
        const lineOpacity = proximity * 0.22;
        const grad = ctx.createLinearGradient(curX, curY, px, py);
        grad.addColorStop(0, 'rgba(200, 194, 174, 0.0)');
        grad.addColorStop(0.3, `rgba(200, 194, 174, ${lineOpacity * 0.4})`);
        grad.addColorStop(1, `rgba(200, 194, 174, ${lineOpacity})`);

        ctx.beginPath();
        ctx.moveTo(curX, curY);
        ctx.lineTo(px, py);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Keyword text (ghost text)
      ctx.save();
      ctx.font = `italic 300 13px 'Barlow', sans-serif`;

      // Glow keywords when cursor is in proximity
      if (proximity > 0.4) {
        ctx.shadowColor = 'rgba(200, 194, 174, 0.6)';
        ctx.shadowBlur = 8;
      }

      ctx.fillStyle = `rgba(200, 194, 174, ${kwOpacity * opacity})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(kw.label, px, py);
      ctx.restore();
    });
  }

  requestAnimationFrame((t) => draw(t));
}


// ─── WORKS DRAG SCROLL ─────────────────────────────────────────────────────
let worksHasDragged = false;
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
    worksHasDragged = false;
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
    if (Math.abs(x - startX) > 5) {
      worksHasDragged = true;
    }
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
  if (!btn) return;
  let isEN = false;
  btn.addEventListener('click', () => {
    isEN = !isEN;
    btn.textContent = isEN ? 'EN' : 'PT';
  });
})();


// ─── SOUND TOGGLE ──────────────────────────────────────────────────────────
(function initSound() {
  const btn = document.getElementById('soundToggle');
  if (!btn) return;
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


// ─── WORK DATA MAP FOR FEATURED SECTION ────────────────────────────────────
const featuredWorksData = {
  1: {
    title: "MONKEYS STUDIO",
    category: "Branding, Interface Design",
    tags: "Brand Identity, UI/UX, Design System",
    description: "A comprehensive digital branding and interface design project for Monkeys Studio, focusing on a minimal, bold aesthetic and a seamless user experience.",
    images: ["pc.png", "Fspider.png", "roboki.png"]
  },
  2: {
    title: "REPULSOR",
    category: "Motion, 3D",
    tags: "3D Motion, Physics Simulation, WebGL",
    description: "Repulsor explores advanced 3D motion dynamics and real-time physics simulation inside a glass-morphic virtual environment.",
    images: ["ring2.png", "ring1.png", "ring.png"]
  },
  3: {
    title: "WIFTY",
    category: "Game Development",
    tags: "UNITY, GAME DESIGN, LEVEL DESIGN",
    description: "WIFTY is a 2D pixel-art puzzle platformer inspired by classic games like Super Mario, but with a stronger focus on strategic gameplay and challenging level design. Players must navigate through handcrafted levels filled with dangerous enemies, deadly traps, hidden paths, and environmental puzzles to reach the exit. The game introduces a unique position-swapping ability, allowing players to instantly swap places with enemies to solve puzzles, escape hazards, and discover creative ways to progress. Combined with key-and-door mechanics, precise platforming, and increasingly complex challenges, WIFTY delivers an engaging experience that rewards both quick reflexes and smart thinking.",
    images: ["ring1.png", "download.mp4", "wifty2.png"]
  },
  4: {
    title: "MOURATO",
    category: "Furniture Design & Creative Direction",
    tags: "Photography, Branding, E-Commerce",
    description: "Visual identity and high-end art direction for Mourato, a premium furniture design studio celebrating organic shapes and natural materials.",
    images: ["sofa3.png", "ring2.png", "pc main.png"]
  },
  5: {
    title: "EK STUDIO",
    category: "Architecture & Spatial Design Atelier",
    tags: "Interface Design, Development, Custom Layouts",
    description: "A minimal, grid-based portfolio showcasing experimental architecture projects, using a tailored layout engine and smooth state transitions.",
    images: ["roboki.png", "ring.png", "sofa3.png"]
  }
};

function updateFeaturedSection(index) {
  const data = featuredWorksData[index];
  if (!data) return;

  const section = document.getElementById('featuredWork');
  if (!section) return;

  const categoryEl = section.querySelector('.feat-category');
  const tagsEl = section.querySelector('.feat-tags');
  const titleEl = section.querySelector('.featured-title');
  const descEl = section.querySelector('.featured-description');

  const animElements = [categoryEl, tagsEl, titleEl, descEl];

  animElements.forEach(el => {
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(15px)';
      el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    }
  });

  const oldImgWrappers = section.querySelectorAll('.feat-img-wrapper');
  oldImgWrappers.forEach((wrap, i) => {
    wrap.style.opacity = '0';
    wrap.style.transform = 'translateY(25px)';
    wrap.style.transition = `opacity 0.4s ease ${i * 0.08}s, transform 0.4s ease ${i * 0.08}s`;
  });

  setTimeout(() => {
    if (categoryEl) categoryEl.textContent = data.category;
    if (tagsEl) tagsEl.textContent = data.tags;
    if (titleEl) titleEl.textContent = data.title;
    if (descEl) descEl.textContent = data.description;

    const imagesContainer = section.querySelector('.featured-images');
    if (imagesContainer) {
      imagesContainer.innerHTML = '';
      data.images.forEach((src, i) => {
        const wrap = document.createElement('div');
        wrap.className = 'feat-img-wrapper';
        wrap.style.opacity = '0';
        wrap.style.transform = 'translateY(25px)';
        wrap.style.transition = `opacity 0.4s ease ${i * 0.08}s, transform 0.4s ease ${i * 0.08}s`;

        const isVideo = src.toLowerCase().endsWith('.mp4');
        if (isVideo) {
          wrap.innerHTML = `<video class="feat-img" src="${src}" autoplay loop muted playsinline></video>`;
        } else {
          wrap.innerHTML = `<img class="feat-img" src="${src}" alt="Feature ${i + 1}" />`;
        }
        imagesContainer.appendChild(wrap);
      });
    }

    animElements.forEach((el, i) => {
      if (el) {
        el.style.transition = `opacity 0.4s ease ${i * 0.05}s, transform 0.4s ease ${i * 0.05}s`;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });

    const newImgWrappers = section.querySelectorAll('.feat-img-wrapper');
    newImgWrappers.forEach((wrap, i) => {
      wrap.offsetHeight; // trigger reflow
      wrap.style.transition = `opacity 0.4s ease ${0.2 + i * 0.08}s, transform 0.4s ease ${0.2 + i * 0.08}s`;
      wrap.style.opacity = '1';
      wrap.style.transform = 'translateY(0)';
    });
  }, 300);
}

// ─── WORK ITEM CLICK ───────────────────────────────────────────────────────
document.querySelectorAll('.work-item').forEach((item, index) => {
  const thumbEl = item.querySelector('.work-thumb');
  let itemIndex = index + 1;

  if (thumbEl) {
    for (let i = 1; i <= 5; i++) {
      if (thumbEl.classList.contains(`work-thumb-${i}`)) {
        itemIndex = i;
        break;
      }
    }
  }

  item.addEventListener('click', () => {
    if (worksHasDragged) return;

    document.querySelectorAll('.work-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    updateFeaturedSection(itemIndex);
  });
});

// ─── INITIALIZE ACTIVE FEATURED WORK ───────────────────────────────────────
function initFeaturedWork() {
  const activeItem = document.querySelector('.work-item.active');
  if (activeItem) {
    const thumbEl = activeItem.querySelector('.work-thumb');
    let itemIndex = 3; // fallback default to ROTA DO NEVEIRO
    if (thumbEl) {
      for (let i = 1; i <= 5; i++) {
        if (thumbEl.classList.contains(`work-thumb-${i}`)) {
          itemIndex = i;
          break;
        }
      }
    }
    updateFeaturedSection(itemIndex);
  }
}


// ─── HEADER THEME & SCROLL BEHAVIOR ────────────────────────────────────────
function updateHeaderTheme() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const y = window.scrollY;
  // Hero section is 100vh. The header height is 64px.
  // The header has exited the hero section if scrollY >= viewportHeight - 64
  const isOverHero = (currentPage === 'homepage') && (y < window.innerHeight - 64);

  if (isOverHero) {
    header.classList.add('theme-dark');
  } else {
    header.classList.remove('theme-dark');
  }

  // Handle background blur and color
  if (y > 80) {
    header.style.backdropFilter = 'blur(16px)';
    header.style.webkitBackdropFilter = 'blur(16px)';
    if (isOverHero) {
      // Over hero, keep transparent to let hero background design breathe
      header.style.background = 'transparent';
      header.style.borderBottom = 'none';
      header.style.boxShadow = 'none';
    } else {
      // Past hero (over light background) or on other pages
      header.style.background = 'rgba(200, 194, 174, 0.4)';
      header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.25)';
      header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.03)';
    }
  } else {
    header.style.backdropFilter = '';
    header.style.webkitBackdropFilter = '';
    header.style.background = 'transparent';
    header.style.borderBottom = 'none';
    header.style.boxShadow = 'none';
  }
}

(function initHeaderScroll() {
  window.addEventListener('scroll', updateHeaderTheme);
  window.addEventListener('resize', updateHeaderTheme);
  updateHeaderTheme(); // Initial call
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
