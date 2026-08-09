import { context } from 'esbuild';
import { spawn } from 'node:child_process';
import { targets, common } from './build.mjs';

const PORT = process.env.PORT || 5173;
const STATE = '/tmp/hg-wrangler-state';

for (const t of targets) {
  const ctx = await context({ ...common, ...t, minify: false });
  await ctx.watch();
}
console.log('esbuild watching bundles');

const wrangler = spawn(
  'npx',
  ['wrangler', 'dev', '--port', String(PORT), '--persist-to', STATE],
  { stdio: 'inherit' }
);

const bye = () => {
  wrangler.kill('SIGTERM');
  process.exit(0);
};
process.on('SIGINT', bye);
process.on('SIGTERM', bye);
wrangler.on('exit', (code) => process.exit(code ?? 0));
