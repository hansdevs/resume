(() => {
  "use strict";

  const P = window.PORTFOLIO || {};
  const prof = P.profile || {};
  const EMAIL = prof.email || "hansgamlien@gmail.com";
  const RESUME_URL = (prof.links && prof.links.resume) || "Hans_Gamlien_Resume.pdf";

  const term = document.getElementById("term");
  const out = document.getElementById("term-out");
  const input = document.getElementById("term-input");
  if (!term || !out || !input) return;

  const COARSE = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const scroll = () => { out.scrollTop = out.scrollHeight; };

  const PROMPT = '<span class="tp">hans ~ </span><span class="ta">% </span>';
  const addLine = (html, cls) => { const d = el("div", "t-line" + (cls ? " " + cls : ""), html); out.appendChild(d); scroll(); return d; };
  const note = (html) => addLine('<span class="tdim">' + html + "</span>");
  const clearOut = () => { out.innerHTML = ""; };

  let mode = "shell";
  let game = null;
  const histArr = [];
  let histIdx = 0;

  const STORE_KEY = "hg_term_v1";
  function trimOut() { while (out.children.length > 200) out.removeChild(out.firstChild); }
  function saveState() {
    try {
      trimOut();
      localStorage.setItem(STORE_KEY, JSON.stringify({ html: out.innerHTML, hist: histArr.slice(-100) }));
    } catch (_) {}
  }
  function restoreState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s && typeof s.html === "string") out.innerHTML = s.html;
      if (s && Array.isArray(s.hist)) { for (let i = 0; i < s.hist.length; i++) histArr.push(s.hist[i]); histIdx = histArr.length; }
      scroll();
    } catch (_) {}
  }

  const FILES = {
    "about.txt": [
      "Hans Gamlien — Full-Stack & React Engineer",
      "CS @ Utah State University · Cum Laude · Dec 2026",
      "I build production web apps, and the occasional compiler.",
    ],
    "contact.txt": [
      "email:    " + EMAIL,
      "github:   github.com/hansdevs",
      "linkedin: linkedin.com/in/hans-gamlien",
      "location: Logan, Utah · US Citizen",
    ],
  };
  FILES["about_hans.txt"] = FILES["about.txt"];

  function jumpTo(id) {
    const sec = document.getElementById(id);
    if (!sec) return note(id + ": section not found");
    note("scrolling to " + id);
    sec.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  const ACTIONS = {
    "experience.txt": () => jumpTo("experience"),
    "projects.txt": () => jumpTo("projects"),
    "skills.txt": () => jumpTo("skills"),
    "resume.txt": () => { note("opening résumé in a new tab…"); window.open(RESUME_URL, "_blank", "noopener"); },
  };

  const FILE_LIST = ["about.txt", "experience.txt", "projects.txt", "skills.txt", "contact.txt", "resume.txt", "snake.js"];

  function viewOrAct(name) {
    if (ACTIONS[name]) { ACTIONS[name](); return true; }
    if (FILES[name]) { FILES[name].forEach((l) => addLine(esc(l), "tw")); return true; }
    return false;
  }

  function runCommand(raw) {
    if (!raw) return;
    if (/snake\.js/i.test(raw)) return startGame();
    const parts = raw.split(/\s+/);
    const name = parts.shift().toLowerCase();

    if (name === "ls" || name === "dir") {
      addLine('<span class="ta">' + FILE_LIST.join("  ") + "</span>");
      return;
    }

    if (name === "cat" || name === "open" || name === "view" || name === "less") {
      const f = (parts[0] || "").toLowerCase();
      if (!f) return note("usage: open &lt;file&gt; — try <span class='ta'>ls</span>");
      if (!viewOrAct(f)) note(name + ": " + esc(parts[0] || "") + ": no such file — try <span class='ta'>ls</span>");
      return;
    }
    if (viewOrAct(name)) return;
    if (name === "clear" || name === "cls") return clearOut();
    note("zsh: command not found: " + esc(name) + " — try <span class='ta'>ls</span>");
  }

  function onGameKey(e) {
    if (mode !== "game" || !game) return;
    game.key(e);
  }
  function startGame() {
    if (typeof window.createSnake !== "function") return note("snake: not loaded");
    mode = "game";
    game = window.createSnake({ render: gameRender, onExit: gameExit, coarse: COARSE });
    window.addEventListener("keydown", onGameKey, true);
    input.blur();
  }
  function gameRender(html, state) {
    out.innerHTML = html;
    if (state && state.dead) {
      const back = out.querySelector('[data-game="back"]');
      const again = out.querySelector('[data-game="again"]');
      if (back) back.onclick = () => { if (game) game.back(); };
      if (again) again.onclick = () => { if (game) game.again(); };
    }
    scroll();
  }
  function gameExit(echo) {
    window.removeEventListener("keydown", onGameKey, true);
    if (game) game.stop();
    game = null; mode = "shell";
    clearOut();
    if (echo) note(esc(echo));
    input.value = "";
    if (!COARSE) input.focus({ preventScroll: true });
    saveState();
  }

  input.addEventListener("keydown", (e) => {
    if (mode === "game") return;
    if (e.key === "Enter") {
      e.preventDefault();
      const v = input.value;
      const line = el("div", "t-line", PROMPT);
      const c = el("span", "ta");
      c.textContent = v;
      line.appendChild(c);
      out.appendChild(line);
      input.value = "";
      if (v.trim()) histArr.push(v);
      histIdx = histArr.length;
      runCommand(v.trim());
      scroll();
      if (mode === "shell") saveState();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = histArr[histIdx] || ""; }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx < histArr.length) { histIdx++; input.value = histArr[histIdx] || ""; }
    }
  });

  term.addEventListener("mousedown", (e) => {
    if (e.target.closest("a, button")) return;
    if (window.getSelection().toString()) return;
    if (mode === "game") return;
    if (e.target !== input) input.focus({ preventScroll: true });
  });

  let tx = null, ty = null;
  term.addEventListener("touchstart", (e) => {
    if (mode !== "game") return;
    const t = e.touches[0]; tx = t.clientX; ty = t.clientY;
  }, { passive: true });
  term.addEventListener("touchmove", (e) => {
    if (mode !== "game" || tx == null || !game) return;
    const t = e.touches[0], dx = t.clientX - tx, dy = t.clientY - ty;
    if (Math.abs(dx) < 22 && Math.abs(dy) < 22) return;
    e.preventDefault();
    game.swipe(dx, dy);
    tx = t.clientX; ty = t.clientY;
  }, { passive: false });
  term.addEventListener("touchend", () => { tx = ty = null; }, { passive: true });

  restoreState();
})();
