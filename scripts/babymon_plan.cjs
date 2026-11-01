/* Export a deterministic Babymon plan for integration with an existing engine. */
const fs = require('fs'), path = require('path');
const planner = require('../public-patcher/babymon_planner.js');
const manifest = require('../public-patcher/babymon-manifest.json');
const [seed, output] = process.argv.slice(2);
if (!seed || !/^\d+$/.test(seed) || !Number.isSafeInteger(Number(seed))) {
  throw Error('Usage: node scripts/babymon_plan.cjs SEED [NEW_OUTPUT.json]');
}
const data = JSON.stringify(planner.plan(manifest, seed), null, 2) + '\n';
if (output) fs.writeFileSync(output, data, {flag:'wx'}); else process.stdout.write(data);
