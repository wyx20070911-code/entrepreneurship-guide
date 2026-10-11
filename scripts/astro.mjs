import { spawnSync } from 'node:child_process';

// npm consumes the separator; some pnpm versions forward it to the script.
const args = process.argv.slice(2).filter(arg => arg !== '--');
const review = args.includes('--review');
const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', ...args.filter(arg => arg !== '--review')], {
  stdio: 'inherit', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', ...(review ? { INCLUDE_DRAFTS: '1' } : {}) }
});
if (result.error) console.error(result.error);
process.exit(result.status ?? 1);
