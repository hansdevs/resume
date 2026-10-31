import { writeFileSync } from 'node:fs';

const GLYPHS = '01';
const ACCENT_EVERY = 23;
const TEETH = 8;

function hash(x, y) {
  let h = (x * 374761393 + y * 668265263) ^ 0x5f356495;
  h = (h ^ (h >>> 13)) * 1274126177;
  return Math.abs(h ^ (h >>> 16));
}

function ell(px, py, cx, cy, rx, ry) {
  const dx = (px - cx) / rx;
  const dy = (py - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

function rotEll(px, py, cx, cy, rx, ry, ang) {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const dx = px - cx;
  const dy = py - cy;
  const X = dx * c + dy * s;
  const Y = -dx * s + dy * c;
  return (X / rx) * (X / rx) + (Y / ry) * (Y / ry) <= 1;
}

function gear(x, y) {
  const dx = x - 0.5;
  const dy = y - 0.5;
  const r = Math.hypot(dx, dy) * 2;
  if (r < 0.33 || r > 1) return 0;
  const step = 360 / TEETH;
  const a = (Math.atan2(dy, dx) * 180) / Math.PI - step / 2;
  const phase = ((a % step) + step) % step;
  const t = Math.min(phase, step - phase);
  const half = 14.4 - 5.4 * Math.max(0, (r - 0.75) / 0.25);
  if (r > 0.75 && t > half) return 0;
  return ell(x, y, 0.34, 0.34, 0.11, 0.11) ? 2 : 1;
}

function apple(x, y) {
  const lobeL = ell(x, y, 0.365, 0.615, 0.315, 0.365);
  const lobeR = ell(x, y, 0.635, 0.615, 0.315, 0.365);
  const cleft = ell(x, y, 0.5, 0.185, 0.125, 0.135);
  const bite = ell(x, y, 1.0, 0.46, 0.17, 0.185);
  const leaf = rotEll(x, y, 0.6, 0.115, 0.15, 0.052, -0.62);

  if (leaf) return 2;
  const body = (lobeL || lobeR) && !cleft && !bite;
  if (!body) return 0;
  if (ell(x, y, 0.33, 0.5, 0.115, 0.145)) return 2;
  return 1;
}

function render(fn, cols, rows) {
  const lines = [];
  for (let r = 0; r < rows; r++) {
    let out = '';
    let run = '';
    let runTone = -1;
    for (let c = 0; c < cols; c++) {
      const x = (c + 0.5) / cols;
      const y = (r + 0.5) / rows;
      let tone = fn(x, y);
      const h = hash(c, r);
      if (tone === 1 && h % ACCENT_EVERY === 0) tone = 3;
      const ch = tone === 0 ? ' ' : GLYPHS[h % GLYPHS.length];
      if (tone !== runTone) {
        if (run) out += runTone === 0 ? run : `<span class="a${runTone}">${run}</span>`;
        run = '';
        runTone = tone;
      }
      run += ch;
    }
    if (run) out += runTone === 0 ? run : `<span class="a${runTone}">${run}</span>`;
    lines.push(out.replace(/\s+$/, ''));
  }
  return lines.join('\n');
}

const art = {
  framework: render(gear, 26, 16),
  apple: render(apple, 22, 16)
};

writeFileSync(new URL('../scripts/pixel-art.js', import.meta.url), 'window.PIXEL_ART = ' + JSON.stringify(art, null, 2) + ';\n');
console.log('wrote scripts/pixel-art.js');

if (process.argv.includes('--preview')) {
  const strip = (s) => s.replace(/<[^>]+>/g, '');
  console.log(strip(art.framework));
  console.log();
  console.log(strip(art.apple));
}
