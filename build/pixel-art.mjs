import { writeFileSync } from 'node:fs';

const GLYPHS = '01';
const ACCENT_EVERY = 23;

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

function penguin(x, y) {
  const body = ell(x, y, 0.5, 0.63, 0.33, 0.35);
  const head = ell(x, y, 0.5, 0.235, 0.235, 0.215);
  const flipL = ell(x, y, 0.16, 0.63, 0.1, 0.22);
  const flipR = ell(x, y, 0.84, 0.63, 0.1, 0.22);
  const footL = ell(x, y, 0.33, 0.965, 0.16, 0.05);
  const footR = ell(x, y, 0.67, 0.965, 0.16, 0.05);
  const belly = ell(x, y, 0.5, 0.66, 0.225, 0.28);
  const faceL = ell(x, y, 0.42, 0.25, 0.105, 0.125);
  const faceR = ell(x, y, 0.58, 0.25, 0.105, 0.125);
  const eyeL = ell(x, y, 0.435, 0.225, 0.035, 0.045);
  const eyeR = ell(x, y, 0.565, 0.225, 0.035, 0.045);
  const beak = ell(x, y, 0.5, 0.33, 0.075, 0.045);

  if (footL || footR) return 3;
  if (beak) return 3;
  if (eyeL || eyeR) return 1;
  if (faceL || faceR) return 2;
  if (belly) return 2;
  if (body || head || flipL || flipR) return 1;
  return 0;
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
  penguin: render(penguin, 46, 34),
  apple: render(apple, 40, 34)
};

const body =
  'window.PIXEL_ART = ' +
  JSON.stringify(art, null, 2) +
  ';\n';

writeFileSync(new URL('../scripts/pixel-art.js', import.meta.url), body);
console.log('wrote scripts/pixel-art.js');

if (process.argv.includes('--preview')) {
  const strip = (s) => s.replace(/<[^>]+>/g, '');
  console.log(strip(art.penguin));
  console.log();
  console.log(strip(art.apple));
}
