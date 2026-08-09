import { context } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { targets, common } from './build.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contexts = [];
for (const t of targets) {
  const ctx = await context({ ...common, ...t, minify: false });
  await ctx.watch();
  contexts.push(ctx);
}
const { hosts, port } = await contexts[0].serve({ servedir: root, port: 5174 });
console.log(`static preview http://${hosts[0] ?? 'localhost'}:${port}`);
