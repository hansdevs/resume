(() => {
  "use strict";

  const data = window.PORTFOLIO || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  function renderExperience() {
    const mount = $("#experience-list");
    if (!mount) return;
    (data.experience || []).forEach((job) => {
      const now = job.current ? ' <span class="entry__now">· now</span>' : "";
      const bullets = (job.bullets || []).map((b) => `<li>${b}</li>`).join("");
      const logo = job.logo
        ? `<div class="entry__logo entry__logo--${job.logoMod || "default"}">
             <img src="${job.logo}" alt="${job.company} logo" loading="lazy" decoding="async">
           </div>`
        : "";
      mount.appendChild(
        el(
          "div",
          "entry" + (job.logo ? "" : " entry--nologo"),
          `${logo}
           <div class="entry__body">
             <div class="entry__head">
               <div class="entry__lead">
                 <div class="entry__role">${job.role}</div>
                 <div class="entry__org">${job.company} · ${job.location}</div>
               </div>
               <div class="entry__date">${job.date}${now}</div>
             </div>
             <ul class="entry__bullets">${bullets}</ul>
           </div>`
        )
      );
    });
  }

  function renderSkills() {
    const mount = $("#skills-list");
    if (!mount) return;
    (data.skills || []).forEach((cat) => {
      mount.appendChild(
        el(
          "div",
          "skill-row",
          `<div class="skill-row__label">${cat.label}</div>
           <div class="skill-row__items">${(cat.items || []).join(", ")}</div>`
        )
      );
    });
  }

  const STATUS = { building: "Building now", award: "Award", past: "Past" };

  function buildCard(p) {
    const status = p.badge || STATUS[p.status] || "";
    const links = (p.links || [])
      .map((l) => `<a href="${l.href}" target="_blank" rel="noopener">${l.label}</a>`)
      .join("");
    const card = el("article", "card" + (p.accent === "rust" ? " card--rust" : ""));
    card.dataset.status = p.status;
    card.dataset.slug = p.slug;
    card.innerHTML = `
      <div class="card__media"><img src="${p.img}" alt="${p.alt}" loading="lazy"></div>
      <div class="card__body">
        <div class="card__status">${status}</div>
        <h3 class="card__title">${p.name}</h3>
        <div class="card__org">${p.org}</div>
        <p class="card__desc">${p.blurb}</p>
        <div class="card__tags">${(p.tech || []).join(" · ")}</div>
        <div class="card__links">${links}</div>
      </div>`;
    return card;
  }

  function renderProjects() {
    const track = $("#project-track");
    const tabsEl = $("#project-tabs");
    const prev = $("#prev-project");
    const next = $("#next-project");
    if (!track || !tabsEl) return;

    const projects = data.projects || [];
    projects.forEach((p) => track.appendChild(buildCard(p)));

    const filters = [
      { key: "all", label: "All" },
      { key: "building", label: "Building now" },
      { key: "award", label: "Awards" },
      { key: "past", label: "Past" },
    ].filter((f) => f.key === "all" || projects.some((p) => p.status === f.key));

    filters.forEach((f, i) => {
      const btn = el("button", "tab", f.label);
      btn.type = "button";
      btn.setAttribute("aria-pressed", String(i === 0));
      btn.addEventListener("click", () => {
        $$(".tab", tabsEl).forEach((t) => t.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        $$(".card", track).forEach((c) => {
          c.classList.toggle("is-hidden", !(f.key === "all" || c.dataset.status === f.key));
        });
        track.scrollTo({ left: 0, behavior: "smooth" });
        requestAnimationFrame(updateArrows);
      });
      tabsEl.appendChild(btn);
    });

    function step() {
      const card = track.querySelector(".card:not(.is-hidden)");
      const gap = parseFloat(getComputedStyle(track).columnGap || "16") || 16;
      return card ? card.offsetWidth + gap : 300;
    }
    function updateArrows() {
      if (!prev || !next) return;
      const max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    }
    prev && prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next && next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    track.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    updateArrows();

    let down = false, startX = 0, startScroll = 0, moved = false;
    track.addEventListener("pointerdown", (e) => {
      if (e.target.closest("a")) return;
      down = true; moved = false;
      startX = e.clientX; startScroll = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; track.style.scrollSnapType = "none"; }
      track.scrollLeft = startScroll - dx;
    });
    const end = () => { down = false; track.style.scrollSnapType = ""; };
    track.addEventListener("pointerup", end);
    track.addEventListener("pointercancel", end);
    track.addEventListener("click", (e) => { if (moved) e.preventDefault(); }, true);
  }

  function initNav() {
    const links = $$(".nav__links a");
    const sections = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);
    if (!sections.length) return;
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 52;

    const onScroll = () => {
      const y = window.scrollY + navH + 40;
      let id = "";
      sections.forEach((s) => { if (y >= s.offsetTop) id = s.id; });
      links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + id));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function boot() {
    renderExperience();
    renderSkills();
    renderProjects();
    initNav();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
