const fs = require('fs'),
  vm = require('vm'),
  crypto = require('crypto'),
  assert = require('assert'),
  path = require('path');
const root = path.resolve(__dirname, '..'),
  html = fs.readFileSync(path.join(root, 'public-output/Kaizo_Baconmon_Patcher.html'), 'utf8'),
  script = html.match(/<script>([\s\S]*)<\/script>/)[1];
const ctx = vm.createContext({
  crypto: crypto.webcrypto,
  DecompressionStream,
  Response,
  Blob,
  atob,
  Uint8Array,
  Uint32Array,
  DataView,
  Array,
  TextEncoder,
  Error,
  Math,
});
vm.runInContext(
  script + '\nglobalThis.M=CONFIG;globalThis.pool=()=>LegacyCore.inflate(PAYLOAD);',
  ctx,
);
const M = ctx.M,
  api = ctx.BaconPublic,
  h = (b) => crypto.createHash('sha256').update(b).digest('hex'),
  C = new Uint8Array(
    fs.readFileSync(path.join(root, 'patch-inputs/Pokemon - Fire Red Version (U) (V1.1).gba')),
  ),
  all = M.groups.map((g) => g.id),
  features = Object.fromEntries(M.core_features.map((f) => [f.id, true]));
(async () => {
  const pool = await ctx.pool(),
    base = await api.patchROM(C, all, pool),
    checks = [];
  for (const a of M.switches)
    for (const b of M.switches)
      if (a !== b && a.feature !== b.feature)
        assert(
          a.offset + a.length <= b.offset || b.offset + b.length <= a.offset,
          'Overlapping feature entry points',
        );
  for (const f of M.core_features) {
    for (const only of [false, true]) {
      const flags = Object.fromEntries(
        M.core_features.map((x) => [x.id, only ? x.id === f.id : x.id !== f.id]),
      );
      const r = await api.patchROM(C, all, pool, { features: flags });
      assert(
        !r.report.features.some((x) => x.status === 'skipped'),
        JSON.stringify(r.report.features),
      );
      for (const s of M.switches)
        assert.deepEqual(
          Array.from(r.rom.slice(s.offset, s.offset + s.length)),
          flags[s.feature] ? Array.from(s.on) : Array.from(s.off),
        );
      fs.writeFileSync(
        path.join(root, 'public-patcher', f.id + (only ? '_only' : '_off') + '.gba'),
        r.rom,
      );
      const again = await api.patchROM(r.rom, all, pool, { features: flags });
      assert(!again.report.changed, 'Reapply ' + f.id);
      const restore = await api.patchROM(r.rom, all, pool);
      assert.equal(h(restore.rom), h(base.rom), 'Re-enable ' + f.id);
      checks.push({
        feature: f.id,
        configuration: only ? 'only this core feature' : 'all except this core feature',
        activation_bytes_checked: true,
        reapplication_unchanged: true,
        reenabling_restores_full_build: true,
      });
      console.log('PASS', f.id, only ? 'only' : 'off');
    }
  }
  const flags = Object.fromEntries(M.core_features.map((f) => [f.id, false])),
    off = await api.patchROM(C, all, pool, { features: flags });
  fs.writeFileSync(path.join(root, 'public-patcher/all_core_off.gba'), off.rom);
  for (const s of M.switches)
    assert.deepEqual(Array.from(off.rom.slice(s.offset, s.offset + s.length)), Array.from(s.off));
  fs.writeFileSync(
    path.join(root, 'public-output/Independent_Feature_Tests.json'),
    JSON.stringify(
      {
        checks,
        all_off_checked: true,
        entry_points_do_not_overlap: true,
        scope:
          'ROM patching, complete entry-point bytes, reapplication and re-enabling. Runtime and emulator checks are separate.',
      },
      null,
      2,
    ),
  );
  console.log('PASS independent feature combinations.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
