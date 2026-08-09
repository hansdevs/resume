(function () {
  var P = window.PORTFOLIO;
  if (!P) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var YEARS = P.projects.map(function (p) { return p.year; });
  var YMAX = Math.max.apply(null, YEARS);
  var YMIN = Math.min.apply(null, YEARS);

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function link(href, label, cls) {
    var a = el("a", cls, label);
    a.href = href;
    if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
    return a;
  }

  function mount(id) { return document.getElementById(id); }

  var NS = "http://www.w3.org/2000/svg";
  var ICONS = {
    github: ["M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.2 11.19.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.38-1.34-1.75-1.34-1.75-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.58-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.12-.3-.54-1.52.12-3.16 0 0 1.01-.32 3.3 1.21a11.6 11.6 0 0 1 3-.4c1.02 0 2.05.13 3 .4 2.28-1.53 3.29-1.21 3.29-1.21.66 1.64.24 2.86.12 3.16.77.83 1.23 1.88 1.23 3.17 0 4.53-2.81 5.53-5.49 5.82.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .31.21.68.83.56A12.02 12.02 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z"],
    linkedin: ["M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"]
  };
  var COFFEE = ["M3 8.5h13.5v5.8a5.2 5.2 0 0 1-5.2 5.2H8.2A5.2 5.2 0 0 1 3 14.3V8.5z", "M16.5 9.6h2.1a2.7 2.7 0 0 1 0 5.4h-2.1", "M6.6 2.6v2.4", "M10.2 2v3", "M13.8 2.6v2.4"];

  function icon(paths, cls, stroke) {
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("aria-hidden", "true");
    s.setAttribute("class", cls);
    if (stroke) {
      s.setAttribute("fill", "none");
      s.setAttribute("stroke", "currentColor");
      s.setAttribute("stroke-width", "1.5");
      s.setAttribute("stroke-linecap", "round");
      s.setAttribute("stroke-linejoin", "round");
    } else {
      s.setAttribute("fill", "currentColor");
    }
    paths.forEach(function (d) {
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      s.appendChild(p);
    });
    return s;
  }

  function iconLink(href, name, label) {
    var a = el("a", "sicon");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    a.setAttribute("aria-label", label);
    a.appendChild(icon(ICONS[name], "sicon__svg", false));
    return a;
  }

  function keyOf(label) {
    return label.toLowerCase().replace(/ & /g, "_").replace(/ /g, "_");
  }

  function renderSummary() {
    mount("summary-text").textContent = P.profile.summary;

    var f = P.profile.freelance;
    var box = mount("avail");
    if (f && f.open) {
      box.append(el("p", "avail__head", f.line), el("p", "avail__body", f.detail));
      var cta = el("a", "avail__cta", "contact me");
      cta.href = "#contact";
      box.appendChild(cta);
    }

    var host = mount("skills-list");
    host.appendChild(el("span", "json__p json__brace", "{"));
    P.skills.forEach(function (g, gi) {
      var row = el("div", "json__row");
      row.append(el("span", "json__k", '"' + keyOf(g.label) + '"'), el("span", "json__p", ": ["));
      var vals = el("span", "json__vals");
      g.items.forEach(function (it, i) {
        var item = el("span", "json__item");
        item.append(el("span", "json__s", '"' + it + '"'));
        if (i < g.items.length - 1) item.append(el("span", "json__p", ","));
        vals.appendChild(item);
      });
      row.appendChild(vals);
      row.appendChild(el("span", "json__p", gi < P.skills.length - 1 ? "]," : "]"));
      host.appendChild(row);
    });
    host.appendChild(el("span", "json__p json__brace", "}"));
  }

  function renderRig() {
    var rig = P.rig;
    var host = mount("rig-panels");
    if (!rig || !host) return;

    rig.machines.forEach(function (m) {
      var fig = el("figure", "rig__panel");
      var art = el("pre", "art");
      art.setAttribute("aria-hidden", "true");
      var raw = (window.PIXEL_ART && window.PIXEL_ART[m.art]) || "";
      art.innerHTML = raw
        .split("\n")
        .map(function (l) { return '<span class="artln">' + (l || " ") + "</span>"; })
        .join("");
      var cap = el("figcaption", "rig__cap");
      cap.append(
        el("div", "rig__os", m.os),
        el("div", "rig__name", m.name),
        el("p", "rig__note", m.note)
      );
      fig.append(art, cap);
      host.appendChild(fig);
    });
  }

  function renderExperience() {
    var host = mount("experience-list");
    P.experience.forEach(function (e) {
      var row = el("article", "entry" + (e.logo ? "" : " entry--nologo"));
      if (e.logo) {
        var lg = el("div", "entry__logo" + (e.logoMod ? " entry__logo--" + e.logoMod : ""));
        var im = document.createElement("img");
        im.src = e.logo; im.alt = e.company; im.loading = "lazy";
        lg.appendChild(im);
        row.appendChild(lg);
      }
      var body = el("div", "entry__body");
      var head = el("div", "entry__head");
      var left = el("div");
      left.appendChild(el("div", "entry__role", e.role));
      var org = el("div", "entry__org");
      org.appendChild(e.url ? link(e.url, e.company, "entry__link") : document.createTextNode(e.company));
      left.appendChild(org);
      head.appendChild(left);
      head.appendChild(el("div", "entry__date" + (e.current ? " entry__now" : ""), e.date));
      body.appendChild(head);
      var ul = el("ul", "entry__bullets");
      (e.bullets || []).forEach(function (b) { ul.appendChild(el("li", null, b)); });
      body.appendChild(ul);
      row.appendChild(body);
      host.appendChild(row);
    });
  }

  function renderContact() {
    var copy = mount("contact-text");
    copy.textContent = "Have a project in mind?";
    copy.insertAdjacentElement("afterend", el("p", "mail__sub",
      "I am open to full-time software engineering roles, freelance work, and interesting engineering problems. Every message lands straight in my inbox."));
    mount("contact-links").append(link(P.profile.links.resume, "resume"));

    var gh = mount("gh-cta");
    if (gh) {
      var a = el("a", "ghcta__link");
      a.href = P.profile.links.github;
      a.target = "_blank";
      a.rel = "noopener";
      a.append(icon(ICONS.github, "ghcta__svg", false), el("span", null, "View GitHub"));
      gh.appendChild(a);
    }

    var social = mount("foot-social");
    if (social) {
      social.append(
        iconLink(P.profile.links.github, "github", "GitHub"),
        iconLink(P.profile.links.linkedin, "linkedin", "LinkedIn")
      );
    }
  }

  function smoothScroll() {
    if (reduced || !window.Lenis || !window.gsap) return;
    var lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9 });
    if (window.ScrollTrigger) lenis.on("scroll", window.ScrollTrigger.update);
    window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    window.gsap.ticker.lagSmoothing(0);
    window.HG = window.HG || {};
    window.HG.lenis = lenis;

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (ev) {
        var target = document.querySelector(a.getAttribute("href"));
        if (!target) return;
        ev.preventDefault();
        lenis.scrollTo(target, { offset: -60 });
      });
    });
  }

  function reveals() {
    if (reduced || !window.gsap || !window.ScrollTrigger) return;
    var gsap = window.gsap;

    document.querySelectorAll(".section").forEach(function (s) {
      var kids = s.querySelectorAll(".section__title, .lede, .avail, .skill, .entry, .prj__hint, .mail__form");
      if (!kids.length) return;
      gsap.from(kids, {
        y: 18, opacity: 0, duration: 0.5, ease: "power2.out", stagger: 0.05,
        scrollTrigger: { trigger: s, start: "top 80%" }
      });
    });
  }

  function scrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav__links a"));
    var secs = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
    function update() {
      var y = window.scrollY + 90;
      var active = -1;
      secs.forEach(function (s, i) { if (s && s.offsetTop <= y) active = i; });
      links.forEach(function (a, i) { a.classList.toggle("active", i === active); });
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function artFlicker() {
    var arts = Array.prototype.slice.call(document.querySelectorAll(".art"));
    if (!arts.length) return;

    if (!reduced && window.gsap && window.ScrollTrigger) {
      arts.forEach(function (art) {
        window.gsap.from(art, {
          opacity: 0,
          duration: 0.5,
          ease: "power1.out",
          scrollTrigger: { trigger: art, start: "top 90%" }
        });
      });
    }
    if (reduced) return;

    arts.forEach(function (art) {
      var runs = Array.prototype.slice
        .call(art.querySelectorAll(".a1, .a2, .a3"))
        .filter(function (s) { return /[01]/.test(s.textContent); });
      if (!runs.length) return;

      var timer = null;

      function flip() {
        for (var n = 0; n < 7; n++) {
          var s = runs[(Math.random() * runs.length) | 0];
          var t = s.textContent;
          var idx = -1;
          for (var tries = 0; tries < 8; tries++) {
            var k = (Math.random() * t.length) | 0;
            if (t.charAt(k) === "0" || t.charAt(k) === "1") { idx = k; break; }
          }
          if (idx < 0) continue;
          s.textContent = t.slice(0, idx) + (t.charAt(idx) === "0" ? "1" : "0") + t.slice(idx + 1);
        }
      }

      function start() { if (!timer) timer = setInterval(flip, 95); }
      function stop() { if (timer) { clearInterval(timer); timer = null; } }

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) start();
          else stop();
        }, { threshold: 0.04 }).observe(art);
      } else {
        start();
      }
    });
  }

  renderSummary();
  renderRig();
  renderExperience();
  renderContact();
  smoothScroll();
  reveals();
  scrollSpy();
  artFlicker();
})();
