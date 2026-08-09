const MAX = { name: 100, email: 200, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COOLDOWN_MS = 3 * 60 * 1000;
const WINDOW_MS = 60 * 60 * 1000;
const WINDOW_MAX = 3;
const BLOCK_MS = 24 * 60 * 60 * 1000;

function num(v, d) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : d;
}

function limits(env) {
  return {
    cooldown: num(env.RL_COOLDOWN_MS, COOLDOWN_MS),
    window: num(env.RL_WINDOW_MS, WINDOW_MS),
    max: num(env.RL_WINDOW_MAX, WINDOW_MAX),
    block: num(env.RL_BLOCK_MS, BLOCK_MS)
  };
}

async function ipKey(request) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  const hex = [].map.call(new Uint8Array(buf), function (b) {
    return b.toString(16).padStart(2, "0");
  }).join("");
  return "rl:" + hex.slice(0, 32);
}

function cacheReq(key) {
  return new Request("https://ratelimit.internal/" + encodeURIComponent(key));
}

async function readRec(env, key) {
  if (env.RATE_LIMIT) return (await env.RATE_LIMIT.get(key, "json")) || null;
  try {
    const hit = await caches.default.match(cacheReq(key));
    return hit ? await hit.json() : null;
  } catch (e) {
    return null;
  }
}

async function writeRec(env, key, rec, ttlSeconds) {
  const body = JSON.stringify(rec);
  if (env.RATE_LIMIT) {
    await env.RATE_LIMIT.put(key, body, { expirationTtl: ttlSeconds });
    return;
  }
  try {
    await caches.default.put(cacheReq(key), new Response(body, {
      headers: {
        "content-type": "application/json",
        "cache-control": "max-age=" + ttlSeconds
      }
    }));
  } catch (e) {
    console.error("rate limit store failed", String(e));
  }
}

async function checkLimit(env, key, now) {
  const L = limits(env);
  const ttl = Math.ceil(L.block / 1000) + 60;
  const rec = (await readRec(env, key)) || { hits: [], blockedUntil: 0 };

  if (rec.blockedUntil > now) {
    return { ok: false, retryAfter: Math.ceil((rec.blockedUntil - now) / 1000), reason: "blocked" };
  }

  const hits = (rec.hits || []).filter(function (t) { return now - t < L.window; });
  const last = hits.length ? Math.max.apply(null, hits) : 0;

  if (last && now - last < L.cooldown) {
    return { ok: false, retryAfter: Math.ceil((L.cooldown - (now - last)) / 1000), reason: "cooldown" };
  }

  if (hits.length >= L.max) {
    const blockedUntil = now + L.block;
    await writeRec(env, key, { hits: hits, blockedUntil: blockedUntil }, ttl);
    return { ok: false, retryAfter: Math.ceil(L.block / 1000), reason: "blocked" };
  }

  return { ok: true, hits: hits };
}

async function recordSend(env, key, hits, now) {
  const L = limits(env);
  await writeRec(env, key, { hits: (hits || []).concat([now]), blockedUntil: 0 }, Math.ceil(L.block / 1000) + 60);
}

function humanWait(seconds) {
  if (seconds >= 3600) return Math.round(seconds / 3600) + " hours";
  if (seconds >= 60) return Math.ceil(seconds / 60) + " minutes";
  return seconds + " seconds";
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

function clean(v, limit) {
  return typeof v === "string" ? v.trim().slice(0, limit) : "";
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function send(env, payload) {
  return fetch((env.RESEND_BASE || "https://api.resend.com") + "/emails", {
    method: "POST",
    headers: {
      authorization: "Bearer " + env.RESEND_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

const SANS = "-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";

function shell(opts) {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#000000;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#000000;">
<tr><td align="center" style="padding:36px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background-color:#0b0b0b;border:1px solid #242427;">
<tr><td style="height:3px;line-height:3px;font-size:0;background-color:${opts.accent};">&nbsp;</td></tr>
<tr><td style="padding:32px 34px 0;">
<div style="font-family:${MONO};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${opts.accent};">${escapeHtml(opts.kicker)}</div>
</td></tr>
<tr><td style="padding:14px 34px 0;">
<h1 style="margin:0;font-family:${SANS};font-size:25px;line-height:1.25;font-weight:600;letter-spacing:-0.02em;color:#f2f2f2;">${escapeHtml(opts.heading)}</h1>
</td></tr>
<tr><td style="padding:18px 34px 0;font-family:${SANS};font-size:15px;line-height:1.62;color:#c9c9c9;">
${opts.body}
</td></tr>
${opts.signature === false ? `<tr><td style="padding:0 34px 30px;">&nbsp;</td></tr>` : `<tr><td style="padding:28px 34px 0;"><div style="height:1px;line-height:1px;font-size:0;background-color:#242427;">&nbsp;</div></td></tr>
<tr><td style="padding:20px 34px 34px;">
<div style="font-family:${SANS};font-size:14px;font-weight:600;color:#f2f2f2;">Hans Gamlien</div>
<div style="font-family:${MONO};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#5a5a5a;padding-top:4px;">Full-Stack Engineer</div>
<div style="padding-top:12px;"><a href="https://hansgamlien.dev" style="font-family:${MONO};font-size:12px;color:${opts.accent};text-decoration:none;border-bottom:1px solid ${opts.accent};padding-bottom:1px;">hansgamlien.dev</a></div>
</td></tr>`}
</table>
<div style="font-family:${MONO};font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#3d3d42;padding-top:18px;">Sent from hansgamlien.dev</div>
</td></tr>
</table>
</body></html>`;
}

function quoteBlock(message) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;"><tr>
<td style="border-left:2px solid #242427;padding:2px 0 2px 16px;font-family:${MONO};font-size:13px;line-height:1.6;color:#9a9a9a;white-space:pre-wrap;">${escapeHtml(message)}</td>
</tr></table>`;
}

function CONFIRM_TEXT(name, message) {
  return (
    "Hi " + name + ",\n\n" +
    "Thank you for contacting me. I usually reply within 24 to 48 hours.\n\n" +
    "This is an automated message to confirm your email was received.\n\n" +
    "What you sent:\n" + message + "\n\n" +
    "Hans Gamlien\nFull-Stack Engineer\nhansgamlien.dev"
  );
}

function CONFIRM_HTML(name, message) {
  return shell({
    title: "Thanks for reaching out",
    preheader: "Got your message. I usually reply within 24 to 48 hours.",
    accent: "#5fc16a",
    kicker: "Message received",
    heading: "Thanks for reaching out, " + name.split(" ")[0] + ".",
    body:
      "<p style=\"margin:0;\">I usually reply within 24 to 48 hours.</p>" +
      "<p style=\"margin:14px 0 0;color:#7d7d7d;font-size:14px;\">This is an automated message confirming your email was received.</p>" +
      "<div style=\"font-family:" + MONO + ";font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#5a5a5a;padding-top:26px;\">What you sent</div>" +
      quoteBlock(message)
  });
}

function NOTIFY_TEXT(name, email, message) {
  return (
    name + " <" + email + ">\n" +
    "Sent from hansgamlien.dev\n\n" +
    message
  );
}

function NOTIFY_HTML(name, email, message) {
  return shell({
    title: "Portfolio inquiry from " + name,
    preheader: name + ": " + message.slice(0, 90),
    accent: "#4d97f0",
    kicker: "New inquiry",
    heading: name,
    signature: false,
    body:
      "<p style=\"margin:0;\"><a href=\"mailto:" + escapeHtml(email) + "\" style=\"font-family:" + MONO + ";font-size:13px;color:#4d97f0;text-decoration:none;\">" + escapeHtml(email) + "</a></p>" +
      quoteBlock(message)
  });
}

async function handleContact(request, env) {
  if (request.method !== "POST") return json({ error: "method not allowed" }, 405);

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "invalid json" }, 400);
  }

  if (clean(body.company, 80)) return json({ ok: true }, 200);

  const name = clean(body.name, MAX.name);
  const email = clean(body.email, MAX.email);
  const message = clean(body.message, MAX.message);

  if (!name || !email || !message) return json({ error: "all fields are required" }, 400);
  if (!EMAIL_RE.test(email)) return json({ error: "that email address looks wrong" }, 400);

  if (!env.RESEND_API_KEY) return json({ error: "mail is not configured yet" }, 503);

  const to = env.CONTACT_TO;
  if (!to) return json({ error: "mail is not configured yet" }, 503);
  const from = env.CONTACT_FROM || "Portfolio <contact@hansgamlien.dev>";

  const now = Date.now();
  const key = await ipKey(request);
  const limit = await checkLimit(env, key, now);
  if (!limit.ok) {
    const msg =
      limit.reason === "cooldown"
        ? "just sent one, give it " + humanWait(limit.retryAfter)
        : "too many messages, try again in " + humanWait(limit.retryAfter);
    return new Response(JSON.stringify({ error: msg, retryAfter: limit.retryAfter }), {
      status: 429,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "retry-after": String(limit.retryAfter)
      }
    });
  }

  const text = NOTIFY_TEXT(name, email, message);
  const html = NOTIFY_HTML(name, email, message);

  let res;
  try {
    res = await send(env, {
      from: from,
      to: [to],
      reply_to: email,
      subject: "Portfolio inquiry from " + name,
      text: text,
      html: html
    });
  } catch (e) {
    return json({ error: "could not reach the mail service" }, 502);
  }

  if (!res.ok) {
    const detail = await res.text().catch(function () { return ""; });
    console.error("notification failed", res.status, detail);
    return json({ error: "the mail service rejected that" }, 502);
  }

  await recordSend(env, key, limit.hits, now);

  try {
    const ack = await send(env, {
      from: from,
      to: [email],
      reply_to: to,
      subject: "Thanks for reaching out",
      text: CONFIRM_TEXT(name, message),
      html: CONFIRM_HTML(name, message)
    });
    if (!ack.ok) {
      console.error("confirmation failed", ack.status, await ack.text().catch(function () { return ""; }));
    }
  } catch (e) {
    console.error("confirmation threw", String(e));
  }

  return json({ ok: true }, 200);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") return handleContact(request, env);
    if (url.pathname.startsWith("/api/")) return json({ error: "not found" }, 404);

    return env.ASSETS.fetch(request);
  }
};
