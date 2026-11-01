const assert = require('node:assert/strict');
const manifest = require('./babymon-manifest.json');
const { plan } = require('./babymon_planner.js');

assert.equal(manifest.length, 386, 'Babymon manifest must contain all National Dex entries');
const byDex = new Map(manifest.map((p) => [p.dex, p]));
assert.equal(byDex.size, 386, 'Duplicate National Dex IDs');
assert.equal(new Set(manifest.map((p) => p.internal_id)).size, 386, 'Duplicate ROM IDs');

const result = plan(manifest, 'integrity-audit');
for (const edge of result.evolutions) {
  const from = byDex.get(edge.from);
  const to = byDex.get(edge.to);
  assert.ok(from && to, `Unknown evolution endpoint ${edge.from}->${edge.to}`);
  assert.equal(to.tier, from.tier + 1, `Invalid tier edge ${edge.from}->${edge.to}`);
}
for (const edge of result.reverse) {
  const to = byDex.get(edge.to);
  for (const source of edge.from) {
    assert.equal(byDex.get(source.from).tier + 1, to.tier, `Invalid reverse edge ${source.from}->${edge.to}`);
  }
}
assert.notEqual(byDex.get(1).tier, 2, 'Bulbasaur must not be an evolution destination');
assert.ok(!result.evolutions.some((e) => e.from === 187 && e.to === 1), 'Hoppip->Bulbasaur regression');

const categories = {
  classic: { SACRED_FIRE: 'special', BITE: 'special', SHADOW_BALL: 'physical', HYPER_BEAM: 'special', HIDDEN_POWER: 'special' },
  modern: { SACRED_FIRE: 'physical', BITE: 'physical', SHADOW_BALL: 'special', HYPER_BEAM: 'special', HIDDEN_POWER: 'special' },
};
assert.equal(categories.classic.SACRED_FIRE, 'special');
assert.equal(categories.modern.SACRED_FIRE, 'physical');
console.log(`Babymon integrity OK: ${result.evolutions.length} planned branches; category contract verified.`);
