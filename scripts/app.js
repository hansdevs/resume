(() => {
  "use strict";

  console.log("%c▶ app.js v18 loaded", "background:#e67e22;color:#fff;padding:2px 6px;border-radius:4px");
  document.querySelectorAll(".invisible-spacer").forEach((el) => el.remove());
  const sliderContainer = document.querySelector(".slider-container");
  const sliderTrack = document.querySelector(".slider-track");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dots = Array.from(document.querySelectorAll(".pagination-dot"));
  const topNavLinks = Array.from(document.querySelectorAll(".main-nav .nav-link"));
  const footerLinks = Array.from(document.querySelectorAll("footer .footer-links a[data-slide]"));
  const heroCTAs = Array.from(document.querySelectorAll(".hero .cta-button[data-slide]"));
  const stickyNav = document.querySelector(".sticky-nav");
  const heroArrow = document.querySelector(".scroll-indicator");
  const paginationUI = document.querySelector(".pagination");
  let current = 0;
  let fadeT;
  let hRAF;
  const px = (v) => parseFloat(getComputedStyle(v).paddingTop) + parseFloat(getComputedStyle(v).paddingBottom);
  const getSlideHeight = (s) => s.scrollHeight - px(s);
  const syncHeight = () => {
    cancelAnimationFrame(hRAF);
    hRAF = requestAnimationFrame(() => {
      if (!sliderContainer) return;
      sliderContainer.style.height = `${getSlideHeight(slides[current])}px`;
    });
  };
  const RO = new ResizeObserver(syncHeight);
  const MO = new MutationObserver(syncHeight);
  const watchSlide = () => {
    RO.disconnect();
    MO.disconnect();
    const s = slides[current];
    RO.observe(s);
    MO.observe(s, { childList: true, subtree: true, attributes: true });
    s.querySelectorAll("img").forEach((img) => !img.complete && img.addEventListener("load", syncHeight, { once: true }));
    syncHeight();
  };
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const sliderTop = () => sliderContainer.offsetTop;
  const navH = () => (stickyNav ? stickyNav.offsetHeight : 0);
  const inView = () => window.scrollY >= sliderTop() - navH() - 2;
  const scrollToSlider = (force = false) => {
    if (force || !inView()) {
      window.scrollTo({ top: sliderTop() - navH(), behavior: "smooth" });
    }
  };
  const animateBars = () => {
    if (current !== 1) return;
    document.querySelectorAll(".skill-level").forEach((bar) => {
      const w = bar.dataset.level || bar.style.width;
      bar.dataset.level = w;
      bar.style.width = "0";
      requestAnimationFrame(() => (bar.style.width = w));
    });
  };
  const go = (idx) => {
    current = clamp(idx, 0, slides.length - 1);
    sliderTrack.style.transition = "transform .55s ease";
    sliderTrack.style.transform = `translateX(-${current * 33.3333}%)`;
    slides[current].scrollTop = 0;
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
    topNavLinks.concat(footerLinks).forEach((l) => l.classList.toggle("active", +l.dataset.slide === current));
    animateBars();
    watchSlide();
  };
  const bind = (el) => el.addEventListener("click", (e) => {
    e.preventDefault();
    go(+el.dataset.slide);
    scrollToSlider(el.closest(".hero"));
  });
  [...topNavLinks, ...footerLinks, ...heroCTAs].forEach(bind);
  dots.forEach((d, i) => d.addEventListener("click", (e) => {
    e.preventDefault();
    go(i);
    scrollToSlider();
  }));
  heroArrow && heroArrow.addEventListener("click", () => stickyNav && window.scrollTo({ top: stickyNav.offsetTop, behavior: "smooth" }));
  window.addEventListener("scroll", () => {
    if (!stickyNav) return;
    const scrolled = window.scrollY > 100;
    heroArrow && (heroArrow.style.opacity = scrolled ? "0" : "1");
    stickyNav.classList.toggle("nav-scrolled", scrolled);
  });
  let dragging = false;
  let horizDrag = false;
  let decided = false;
  let touchStartX = 0;
  let touchStartY = 0;
  const DECISION_THRESHOLD = 8;
  const thresh = () => window.innerWidth * 0.15;
  const startTouch = (x, y) => {
    dragging = true;
    decided = false;
    horizDrag = false;
    touchStartX = x;
    touchStartY = y;
    sliderTrack.style.transition = "none";
  };
  const moveTouch = (x, y) => {
    if (!dragging) return;
    const dx = x - touchStartX;
    const dy = y - touchStartY;
    if (!decided) {
      if (Math.abs(dx) < DECISION_THRESHOLD && Math.abs(dy) < DECISION_THRESHOLD) return;
      horizDrag = Math.abs(dx) > Math.abs(dy);
      decided = true;
    }
    if (!horizDrag) {
      dragging = false;
      return;
    }
    const pct = -current * 33.3333 - (dx / window.innerWidth) * 33.3333;
    if (pct <= 0 && pct >= -66.6666) sliderTrack.style.transform = `translateX(${pct}%)`;
  };
  const endTouch = (x) => {
    if (!dragging || !horizDrag) {
      dragging = false;
      return;
    }
    dragging = false;
    sliderTrack.style.transition = "transform .55s ease";
    const diff = touchStartX - x;
    if (diff > thresh()) go(current + 1);
    else if (diff < -thresh()) go(current - 1);
    else go(current);
  };
  sliderTrack.addEventListener("touchstart", (e) => startTouch(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  sliderTrack.addEventListener("touchmove", (e) => {
    moveTouch(e.touches[0].clientX, e.touches[0].clientY);
    if (horizDrag) e.preventDefault();
  }, { passive: false });
  sliderTrack.addEventListener("touchend", (e) => endTouch(e.changedTouches[0].clientX));
  sliderTrack.addEventListener("mousedown", (e) => startTouch(e.clientX, e.clientY));
  window.addEventListener("mousemove", (e) => moveTouch(e.clientX, e.clientY));
  window.addEventListener("mouseup", (e) => endTouch(e.clientX));
  slides.forEach((s) => s.addEventListener("scroll", () => {
    paginationUI.classList.add("fade-out");
    clearTimeout(fadeT);
    fadeT = setTimeout(() => paginationUI.classList.remove("fade-out"), 1200);
  }));
  const snakeBtn = document.getElementById("hidden-start-btn");
  const snakeWrap = document.getElementById("snake-game-wrapper");
  if (snakeBtn && snakeWrap) {
    snakeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      snakeWrap.style.display = snakeWrap.style.display === "block" ? "none" : "block";
      requestAnimationFrame(() => requestAnimationFrame(syncHeight));
    });
  }
  window.addEventListener("resize", syncHeight);
  go(0);
  
  //(anti-scraper protection)
  window.revealEmail = function() {
    const revealBtn = document.getElementById("reveal-email-btn");
    const emailLink = document.getElementById("email-link");
    if (revealBtn && emailLink) {
      revealBtn.style.display = "none";
      emailLink.style.display = "inline-block";
    }
  };
})();
