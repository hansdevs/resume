(() => {
  "use strict";

  const USER = "hansdevs";
  const KEY = "hg_gh_v2";
  const TTL = 60 * 60 * 1000;
  const CELL = 13;

  const section = document.getElementById("github");
  const mount = document.getElementById("github-mount");

  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

  const relTime = (iso) => {
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (days <= 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 31) return days + " days ago";
    const months = Math.round(days / 30.44);
    return months <= 1 ? "a month ago" : months + " months ago";
  };

  async function fetchJSON(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  }

  async function loadFresh() {
    const since = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10);
    const searchURL = "https://api.github.com/search/commits?q=" +
      encodeURIComponent("author:" + USER + " author-date:>=" + since) + "&per_page=1";
    const [user, repos, contrib, search] = await Promise.all([
      fetchJSON("https://api.github.com/users/" + USER).catch(() => null),
      fetchJSON("https://api.github.com/users/" + USER + "/repos?per_page=100&sort=pushed").catch(() => null),
      fetchJSON("https://github-contributions-api.jogruber.de/v4/" + USER + "?y=last").catch(() => null),
      fetchJSON(searchURL).catch(() => null),
    ]);
    if (!user && !repos && !contrib) return null;
    const pubCommits = search && typeof search.total_count === "number" ? search.total_count : null;
    return { user, repos, contrib, pubCommits };
  }

  let pending = null;
  function load() {
    if (pending) return pending;
    pending = (async () => {
      try {
        const raw = sessionStorage.getItem(KEY);
        if (raw) {
          const c = JSON.parse(raw);
          if (c && Date.now() - c.t < TTL && c.data) return c.data;
        }
      } catch (_) {}
      const data = await loadFresh();
      if (data) { try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), data })); } catch (_) {} }
      return data;
    })();
    return pending;
  }
  window.HG_GITHUB = { load, user: USER };

  function topLanguages(repos, n) {
    const counts = {};
    repos.forEach((r) => { if (!r.fork && r.language) counts[r.language] = (counts[r.language] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n);
  }

  const level = (d) => {
    if (typeof d.level === "number") return Math.max(0, Math.min(4, d.level));
    return d.count > 0 ? Math.min(4, 1 + Math.floor(Math.log2(d.count))) : 0;
  };

  function buildGrid(days, width) {
    const weeksFit = Math.max(8, Math.floor((width + 3) / CELL));
    const last = new Date(days[days.length - 1].date + "T12:00:00");
    const tail = last.getDay() + 1;
    const need = Math.min(days.length, (weeksFit - 1) * 7 + tail);
    const slice = days.slice(-need);
    const grid = el("div", "gh-cal__grid");
    grid.setAttribute("aria-hidden", "true");
    const first = new Date(slice[0].date + "T12:00:00");
    for (let i = 0; i < first.getDay(); i++) grid.appendChild(el("span", "gh-cal__d gh-cal__d--x"));
    slice.forEach((d) => {
      const lv = level(d);
      const cell = el("span", "gh-cal__d" + (lv ? " gh-cal__d--" + lv : ""));
      cell.title = d.count + (d.count === 1 ? " contribution on " : " contributions on ") + d.date;
      grid.appendChild(cell);
    });
    return grid;
  }

  let daysCache = null;
  let calWrap = null;
  function renderCal() {
    if (!daysCache || !calWrap) return;
    const w = calWrap.clientWidth || (mount && mount.clientWidth) || 640;
    const grid = buildGrid(daysCache, w);
    calWrap.innerHTML = "";
    calWrap.appendChild(grid);
  }

  function render(data) {
    const user = data.user;
    const repos = data.repos;
    const contrib = data.contrib;
    const days = contrib && Array.isArray(contrib.contributions) && contrib.contributions.length ? contrib.contributions : null;

    const total = days ? days.reduce((a, d) => a + d.count, 0) : 0;

    if (days) {
      const head = el("div", "gh-head");
      head.appendChild(el("p", "gh-head__stat", "<strong>" + total.toLocaleString("en-US") + "</strong> contributions in the last year"));
      const a = el("a", "gh-head__link", "@" + USER);
      a.href = "https://github.com/" + USER;
      a.target = "_blank";
      a.rel = "noopener";
      head.appendChild(a);
      mount.appendChild(head);
      calWrap = el("div", "gh-cal");
      mount.appendChild(calWrap);
      daysCache = days;
    }

    const split = [];
    if (days && typeof data.pubCommits === "number" && data.pubCommits <= total) {
      const priv = total - data.pubCommits;
      if (priv > 0) {
        const privShown = priv >= 100 ? Math.round(priv / 10) * 10 : priv;
        split.push("about " + privShown.toLocaleString("en-US") + " contributions in private repos");
      }
      split.push(data.pubCommits.toLocaleString("en-US") + " commits in public repos");
    }

    const facts = [];
    if (user && user.public_repos != null) facts.push(user.public_repos + " public repos");
    if (days) facts.push(days.reduce((a, d) => a + (d.count > 0 ? 1 : 0), 0) + " active days this year");
    if (user && user.created_at) facts.push("on GitHub since " + new Date(user.created_at).getFullYear());

    if (split.length) {
      mount.appendChild(el("p", "gh-meta", esc(split.join(" · "))));
      if (facts.length) mount.appendChild(el("p", "gh-meta gh-meta--sub", esc(facts.join(" · "))));
    } else if (facts.length) {
      mount.appendChild(el("p", "gh-meta", esc(facts.join(" · "))));
    }

    if (repos && repos.length) {
      const langs = topLanguages(repos, 5);
      if (langs.length) {
        const langWrap = el("div", "gh-langs");
        const bar = el("div", "gh-langs__bar");
        langs.forEach(([name, count], i) => {
          const seg = el("span", "gh-langs__seg gh-langs__seg--" + i);
          seg.style.flexGrow = String(count);
          seg.title = name;
          bar.appendChild(seg);
        });
        langWrap.appendChild(bar);
        langWrap.appendChild(el("p", "gh-langs__labels", langs.map(([name]) => esc(name)).join(" · ")));
        mount.appendChild(langWrap);
      }
      const recent = repos.filter((r) => !r.fork).slice(0, 3);
      if (recent.length) {
        const list = el("div", "gh-repos");
        recent.forEach((r) => {
          const row = el("div", "gh-repos__row");
          const name = el("a", "gh-repos__name", esc(r.name));
          name.href = r.html_url;
          name.target = "_blank";
          name.rel = "noopener";
          row.appendChild(name);
          row.appendChild(el("span", "gh-repos__lang", esc(r.language || "")));
          row.appendChild(el("span", "gh-repos__time", "pushed " + relTime(r.pushed_at)));
          list.appendChild(row);
        });
        mount.appendChild(list);
      }
    }

    if (mount.children.length) {
      section.hidden = false;
      renderCal();
    }
  }

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderCal, 150);
  });

  if (section && mount) {
    load().then((d) => { if (d) render(d); }).catch(() => {});
  }
})();
