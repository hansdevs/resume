import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';

const CMD = 'cat skills.json';
const HOST = 'hans@hansgamlien.dev';

const APPLE_PATH =
  'M17.05 12.54c-.03-3.03 2.47-4.48 2.58-4.55-1.41-2.06-3.6-2.35-4.38-2.38-1.86-.19-3.63 1.1-4.58 1.1-.94 0-2.4-1.08-3.94-1.05-2.03.03-3.9 1.18-4.94 3-2.11 3.65-.54 9.06 1.51 12.03 1 1.46 2.2 3.08 3.77 3.03 1.51-.06 2.08-.98 3.91-.98 1.82 0 2.34.98 3.94.95 1.63-.03 2.66-1.48 3.65-2.94 1.15-1.68 1.63-3.31 1.65-3.39-.04-.02-3.17-1.22-3.2-4.82zM14.11 4.6c.83-1 1.39-2.4 1.24-3.79-1.2.05-2.65.8-3.51 1.8-.77.89-1.44 2.31-1.26 3.68 1.34.1 2.7-.68 3.53-1.69z';

function CatEmblem({ kind }) {
  if (kind === 'apple') {
    return (
      <svg className="prow__em" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
        <path d={APPLE_PATH} />
      </svg>
    );
  }
  if (kind === 'usu') {
    return <img className="prow__em prow__em--img" src="images/usulogo.png" alt="" aria-hidden="true" />;
  }
  return null;
}

const RISE = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 210, damping: 26 } }
};

function prefersReduced() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function Counter({ to }) {
  const mv = useMotionValue(prefersReduced() ? to : 0);
  const shown = useTransform(mv, (v) => Math.round(v));
  useEffect(() => {
    if (prefersReduced()) return;
    const controls = animate(mv, to, { duration: 1.15, ease: [0.16, 1, 0.3, 1], delay: 0.45 });
    return () => controls.stop();
  }, [to]);
  return <motion.span className="hcell__n">{shown}</motion.span>;
}

const WMO = {
  0: 'clear', 1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast',
  45: 'fog', 48: 'rime fog',
  51: 'light drizzle', 53: 'drizzle', 55: 'heavy drizzle',
  56: 'freezing drizzle', 57: 'freezing drizzle',
  61: 'light rain', 63: 'rain', 65: 'heavy rain',
  66: 'freezing rain', 67: 'freezing rain',
  71: 'light snow', 73: 'snow', 75: 'heavy snow', 77: 'snow grains',
  80: 'rain showers', 81: 'rain showers', 82: 'heavy showers',
  85: 'snow showers', 86: 'snow showers',
  95: 'thunderstorm', 96: 'thunderstorm', 99: 'thunderstorm'
};

const WX_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=41.7355&longitude=-111.8344' +
  '&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FDenver';

function Weather() {
  const [wx, setWx] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch(WX_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d || !d.current) return;
        setWx({
          f: Math.round(d.current.temperature_2m),
          text: WMO[d.current.weather_code] || 'weather unknown'
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!wx) return null;
  return (
    <motion.span className="wx" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <span className="wx__t">{wx.f}°F</span>
      <span className="wx__d">{wx.text}</span>
    </motion.span>
  );
}

function Hero() {
  const D = window.PORTFOLIO || {};
  const p = D.profile || {};
  const years = (D.projects || []).map((x) => x.year);
  const span = years.length ? Math.max(...years) - Math.min(...years) + 1 : 0;

  const side = [p.role, p.education && p.education.school, p.education && ('Graduating ' + p.education.expected)].filter(Boolean);
  const stats = [
    { n: (D.projects || []).length, l: 'projects' },
    { n: (D.experience || []).length, l: 'roles' },
    { n: span, l: 'years shipping' }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="shown"
      variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.075, delayChildren: 0.08 } } }}
    >
      <div className="hero__band">
        <div className="doc hero__row">
          <div className="hero__left">
            <motion.p className="hero__hi" variants={RISE}>Hi, I&rsquo;m</motion.p>
            <motion.h1 className="hero__name" variants={RISE}>{p.name || 'Hans Gamlien'}</motion.h1>
            <motion.p className="hero__pitch" variants={RISE}>{p.tagline}</motion.p>
            <motion.p className="hero__stack" variants={RISE}>{p.stack}</motion.p>
            <motion.div className="hero__cta" variants={RISE}>
              <a className="btn btn--solid" href="#projects">View projects</a>
              <a className="btn" href={p.links && p.links.resume} target="_blank" rel="noopener">Resume</a>
            </motion.div>
          </div>
          <div className="hero__side">
            {side.map((t, i) => (
              <motion.div className={'hero__sideln' + (i === 0 ? ' is-lead' : '')} key={t} variants={RISE}>
                <span className="gt">&gt;</span>
                {t}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div className="doc hmeta" variants={RISE}>
        <span className="hmeta__loc">{p.location}</span>
        <Weather />
        <span className="hmeta__ok">open to work</span>
      </motion.div>
    </motion.div>
  );
}

function Projects() {
  const all = (window.PORTFOLIO && window.PORTFOLIO.projects) || [];
  const years = [];
  all.forEach((p) => { if (years.indexOf(p.year) === -1) years.push(p.year); });
  years.sort((a, b) => b - a);

  const [filter, setFilter] = useState('all');
  const [active, setActive] = useState(0);

  const match = (p) =>
    filter === 'all' ? true
      : filter === 'current' ? p.active === true
      : filter === 'past' ? p.active !== true
      : String(p.year) === filter;

  const list = all.filter(match);
  const sel = list[Math.min(active, Math.max(0, list.length - 1))];
  const chips = ['all', 'current', 'past'].concat(years.map(String));

  return (
    <div className="prj">
      <div className="filters">
        {chips.map((f) => (
          <button
            key={f}
            type="button"
            className={'filt' + (f === filter ? ' is-on' : '')}
            onClick={() => { setFilter(f); setActive(0); }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="prj__grid">
        <ol className="prj__list">
          {list.map((p, i) => (
            <li key={p.slug}>
              <button
                type="button"
                className={'prow' + (i === active ? ' is-on' : '')}
                onClick={() => setActive(i)}
              >
                <span className="prow__n">{String(i + 1).padStart(2, '0')}</span>
                <span className="prow__name">{p.name}</span>
                <span className="prow__cat">
                  {p.catIcon ? <CatEmblem kind={p.catIcon} /> : null}
                  {p.category}
                </span>
                <span className="prow__yr">{p.year}</span>
              </button>
            </li>
          ))}
        </ol>

        <aside className="prj__view">
          <AnimatePresence mode="wait">
            {sel ? (
              <motion.div
                key={sel.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                {sel.img ? (
                  <div className={'pv__media' + (sel.logoArt ? ' pv__media--logo' : ' pv__media--shot')}>
                    <img src={sel.img} alt={sel.alt || sel.name} loading="lazy" />
                  </div>
                ) : (
                  <div className="pv__media pv__media--none">
                    <span>{sel.slug}/ &mdash; no render yet</span>
                  </div>
                )}
                <h3 className="pv__title">{sel.name}</h3>
                <div className="pv__meta">
                  <span>{sel.org}</span>
                  <span>{sel.date}</span>
                </div>
                <p className="pv__desc">{sel.blurb}</p>
                <div className="pv__tags">{(sel.tech || []).join('  ')}</div>
                <div className="pv__links">
                  {(sel.links || []).map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener">{l.label}</a>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}

function Prompt({ children }) {
  return (
    <div className="tl">
      <span className="tl__u">{HOST}</span>
      <span className="tl__c">:</span>
      <span className="tl__p">~</span>
      <span className="tl__s">$</span>
      <span className="tl__x">{children}</span>
    </div>
  );
}

function keyOf(label) {
  return label.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_');
}

const LINE = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.12, ease: 'linear' } }
};

function Skills() {
  const groups = (window.PORTFOLIO && window.PORTFOLIO.skills) || [];
  const reduced =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ref = useRef(null);
  const [phase, setPhase] = useState(reduced ? 'done' : 'idle');
  const [typed, setTyped] = useState(reduced ? CMD.length : 0);

  useEffect(() => {
    if (reduced || phase !== 'idle') return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPhase('typing');
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [phase, reduced]);

  useEffect(() => {
    if (phase !== 'typing') return;
    if (typed >= CMD.length) {
      const t = setTimeout(() => setPhase('output'), 340);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTyped((n) => n + 1), 42);
    return () => clearTimeout(t);
  }, [phase, typed]);

  const running = phase === 'output' || phase === 'done';

  return (
    <div className="tw" ref={ref}>
      <Prompt>
        {CMD.slice(0, typed)}
        {phase === 'typing' ? <span className="tl__cur" /> : null}
      </Prompt>

      <motion.div
        className="tout"
        initial="hidden"
        animate={running ? 'shown' : 'hidden'}
        variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.06 } } }}
        onAnimationComplete={() => phase === 'output' && setPhase('done')}
      >
      <motion.span className="json__p json__brace" variants={LINE}>{'{'}</motion.span>
      {groups.map((g, gi) => (
        <motion.div className="json__row" key={g.label} variants={LINE}>
          <span className="json__k">"{keyOf(g.label)}"</span>
          <span className="json__p">: [</span>
          <span className="json__vals">
            {g.items.map((it, i) => (
              <span className="json__item" key={it}>
                <span className="json__s">"{it}"</span>
                {i < g.items.length - 1 ? <span className="json__p">,</span> : null}
              </span>
            ))}
          </span>
          <span className="json__p">{gi < groups.length - 1 ? '],' : ']'}</span>
        </motion.div>
      ))}
        <motion.span className="json__p json__brace" variants={LINE}>{'}'}</motion.span>
      </motion.div>

      {phase === 'done' ? (
        <Prompt>
          <span className="tl__cur" />
        </Prompt>
      ) : null}
    </div>
  );
}

const ENDPOINT = () =>
  (window.PORTFOLIO && window.PORTFOLIO.profile && window.PORTFOLIO.profile.contactEndpoint) || '/api/contact';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '', company: '' });
  const [state, setState] = useState('idle');
  const [note, setNote] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const ready = form.name.trim() && form.email.trim() && form.message.trim();

  async function submit(e) {
    e.preventDefault();
    if (!ready || state === 'sending') return;
    setState('sending');
    setNote('');
    try {
      const res = await fetch(ENDPOINT(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status);
      setState('sent');
      setForm({ name: '', email: '', message: '', company: '' });
    } catch (err) {
      setState('error');
      setNote(String(err.message || err));
    }
  }

  return (
    <motion.form
      className="mf"
      onSubmit={submit}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: 'spring', stiffness: 200, damping: 26 }}
    >
      <div className="mf__row">
        <label className="mf__field">
          <span className="mf__label">name</span>
          <input className="mf__input" value={form.name} onChange={set('name')} autoComplete="name" required />
        </label>
        <label className="mf__field">
          <span className="mf__label">email</span>
          <input className="mf__input" type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
        </label>
      </div>

      <label className="mf__field">
        <span className="mf__label">message</span>
        <textarea className="mf__input mf__input--area" rows={5} value={form.message} onChange={set('message')} required />
      </label>

      <div className="mf__hp" aria-hidden="true">
        <label>
          company
          <input tabIndex={-1} autoComplete="off" value={form.company} onChange={set('company')} />
        </label>
      </div>

      <div className="mf__foot">
        <motion.button
          className="mf__send"
          type="submit"
          disabled={!ready || state === 'sending'}
          whileHover={ready ? { y: -2 } : undefined}
          whileTap={ready ? { y: 0, scale: 0.98 } : undefined}
          transition={{ type: 'spring', stiffness: 420, damping: 20 }}
        >
          {state === 'sending' ? 'sending' : 'send message'}
        </motion.button>

        <AnimatePresence mode="wait">
          {state === 'sent' && (
            <motion.span
              className="mf__msg mf__msg--ok"
              key="ok"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              sent. thanks.
            </motion.span>
          )}
          {state === 'error' && (
            <motion.span
              className="mf__msg mf__msg--err"
              key="err"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              {note}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.form>
  );
}

const ISLANDS = {
  hero: Hero,
  projects: Projects,
  skills: Skills,
  contact: Contact
};

document.querySelectorAll('[data-react-island]').forEach((el) => {
  const Island = ISLANDS[el.dataset.reactIsland];
  if (Island) createRoot(el).render(<Island />);
});
