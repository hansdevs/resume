// Dev server with rebuild on save: npm run dev, then open localhost:5173.
// Each bundle gets its own watch context; the first one also serves the
// repo root, and the others write into scripts/ inside that served tree.
import { context } from 'esbuild';
import { targets, common } from './build.mjs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const contexts = [];
for (const t of targets) {
  const ctx = await context({ ...common, ...t, minify: false });
  await ctx.watch();
  contexts.push(ctx);
}
const { hosts, port } = await contexts[0].serve({ servedir: root, port: 5173 });
console.log(`serving http://${hosts[0] ?? 'localhost'}:${port}`);
