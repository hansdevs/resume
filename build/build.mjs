import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export const targets = [
  {
    entryPoints: [join(root, 'build/vendor-entry.mjs')],
    outfile: join(root, 'scripts/vendor.bundle.js')
  },
  {
    entryPoints: [join(root, 'build/gsap-entry.mjs')],
    outfile: join(root, 'scripts/gsap.bundle.js')
  },
  {
    entryPoints: [join(root, 'build/react-island.jsx')],
    outfile: join(root, 'scripts/react-island.bundle.js'),
    jsx: 'automatic'
  }
];

export const common = { bundle: true, format: 'iife', minify: true, logLevel: 'info' };

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const t of targets) await build({ ...common, ...t });
  console.log('all bundles built');
}
