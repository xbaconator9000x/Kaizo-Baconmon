const fs = require('fs'),
  vm = require('vm'),
  crypto = require('crypto'),
  assert = require('assert'),
  path = require('path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'public-output/Kaizo_Baconmon_Patcher.html'), 'utf8'),
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
  script + '\nglobalThis.M=CONFIG;globalThis.getPool=()=>LegacyCore.inflate(PAYLOAD);',
  ctx,
);
const api = ctx.BaconPublic,
  M = ctx.M,
  read = (p) => new Uint8Array(fs.readFileSync(path.join(root, p))),
  selected = M.groups.map((g) => g.id),
  h = (b) => crypto.createHash('sha256').update(b).digest('hex');
global.BinFile = require('../patch-work/BinFile.js');
const BPS = require('../patch-work/RomPatcher.format.bps.js');
function ips(src, p) {
  const out = src.slice();
  let i = 5;
  while (String.fromCharCode(...p.slice(i, i + 3)) !== 'EOF') {
    let a = (p[i] << 16) | (p[i + 1] << 8) | p[i + 2],
      n = (p[i + 3] << 8) | p[i + 4];
    i += 5;
    if (n) {
      out.set(p.slice(i, i + n), a);
      i += n;
    } else {
      n = (p[i] << 8) | p[i + 1];
      out.fill(p[i + 2], a, a + n);
      i += 3;
    }
  }
  return out;
}
function stat(r, id) {
  return r.report.features.find((x) => x.id === id).status;
}
async function main() {
  const pool = await ctx.getPool(),
    C = read('patch-inputs/Pokemon - Fire Red Version (U) (V1.1).gba'),
    F = ips(C, read('patch-inputs/Faster.FireRed.1.3.2(1).ips')),
    T = read('source/output/Kaizo_Baconmon_v0.9.4_BASE.gba'),
    U = read('source/output/Kaizo_Baconmon_v0.9.4_CURRENT_RUN_0006.gba'),
    results = [];
  async function run(name, source, choices = selected) {
    console.log('Checking', name);
    const before = h(source),
      r = await api.patchROM(source, choices, pool);
    assert.equal(h(source), before);
    results.push({
      name,
      features: r.report.features.map((x) => ({ id: x.id, status: x.status })),
      source_unchanged: true,
      output_sha256: h(r.rom),
    });
    return r;
  }
  const clean = await run('Clean US FireRed 1.1', C);
  assert(clean.report.features.every((x) => ['applied', 'existing'].includes(x.status)));
  fs.writeFileSync(path.join(root, 'public-patcher/clean.gba'), clean.rom);
  const faster = await run('Faster FireRed', F);
  assert.equal(stat(faster, 'core'), 'applied');
  const seed = F.slice();
  for (let i = 0; i < U.length; i++)
    if (T[i] !== U[i] && C[i] === F[i] && (i < 0x710000 || (i >= 0x800000 && i < 0xe00000)))
      seed[i] = U[i];
  seed[0x2547f4 + 5] = 123;
  seed[0x250c74 + 14] = 99;
  seed[0x180000] = 71;
  const randomized = await run('Randomized seed with unrelated dialogue edit', seed);
  assert.equal(stat(randomized, 'core'), 'applied');
  for (const [a, n] of [
    [0x2547f4, 412 * 28],
    [0x250c74, 355 * 12],
    [0x23eb38, 743 * 40],
    [0x25d824, 412 * 4],
    [0x252c38, 412 * 8],
  ])
    assert(Buffer.from(randomized.rom.slice(a, a + n)).equals(Buffer.from(seed.slice(a, a + n))));
  assert.equal(randomized.rom[0x180000], 71);
  assert(
    Buffer.from(randomized.rom.slice(0x800000, 0xe00000)).equals(
      Buffer.from(seed.slice(0x800000, 0xe00000)),
    ),
  );
  fs.writeFileSync(path.join(root, 'public-patcher/randomized.gba'), randomized.rom);
  const titleConflict = F.slice();
  titleConflict[0x78940] ^= 1;
  const a = await run('Conflicting title script', titleConflict);
  assert.equal(stat(a, 'title'), 'skipped');
  assert.equal(stat(a, 'core'), 'applied');
  for (const r of M.groups.find((g) => g.id === 'title').records)
    assert(
      Buffer.from(a.rom.slice(r.offset, r.offset + r.length)).equals(
        Buffer.from(titleConflict.slice(r.offset, r.offset + r.length)),
      ),
    );
  const occupied = F.slice();
  occupied[0x760100] = 0x12;
  const b = await run('Occupied Baconmon bank', occupied);
  assert.equal(stat(b, 'core'), 'skipped');
  assert.equal(stat(b, 'title'), 'applied');
  assert.equal(stat(b, 'tunnel'), 'applied');
  assert.equal(b.rom[0x760100], 0x12);
  for (const r of M.groups.find((g) => g.id === 'core').records)
    assert(
      Buffer.from(b.rom.slice(r.offset, r.offset + r.length)).equals(
        Buffer.from(occupied.slice(r.offset, r.offset + r.length)),
      ),
    );
  fs.writeFileSync(path.join(root, 'public-patcher/partial.gba'), b.rom);
  const hidden = F.slice();
  hidden[0x15d8c0] ^= 1;
  const d = await run('Conflicting hidden-item function', hidden);
  assert.equal(stat(d, 'hidden'), 'skipped');
  assert.equal(stat(d, 'core'), 'applied');
  assert.equal(d.rom[0x15d8c0], hidden[0x15d8c0]);
  const off = await run(
    'Title not selected',
    F,
    selected.filter((x) => x !== 'title'),
  );
  assert.equal(stat(off, 'title'), 'not_selected');
  assert.equal(stat(off, 'core'), 'applied');
  const current = await run('Existing Baconmon seed', U);
  assert.notEqual(stat(current, 'core'), 'skipped');
  assert.notEqual(stat(current, 'rival'), 'skipped');
  const repeat = await run('Reapply same selection', current.rom);
  assert.equal(repeat.report.changed, false);
  const expanded = new Uint8Array(0x2000000);
  expanded.set(seed);
  expanded.fill(0x5a, 0x1000000);
  const e = await run('32 MiB expanded ROM', expanded);
  assert.equal(stat(e, 'core'), 'applied');
  assert(Buffer.from(e.rom.slice(0x1000000)).equals(Buffer.from(expanded.slice(0x1000000))));
  const packaged = await api.patchROM(C, ['package'], pool);
  assert.equal(h(packaged.rom), h(clean.rom));
  const wrapped = new Uint8Array(C.length + 512);
  wrapped.fill(0xa5, 0, 512);
  wrapped.set(C, 512);
  const wrappedOut = await api.patchROM(wrapped, ['package'], pool);
  assert.equal(h(wrappedOut.rom.slice(512)), h(clean.rom));
  assert(wrappedOut.rom.slice(0, 512).every((x) => x === 0xa5));
  assert.equal(wrappedOut.report.source_sha256, h(wrapped));
  assert.equal(wrappedOut.report.output_sha256, h(wrappedOut.rom));
  assert.equal(wrappedOut.report.writes[0].offset, packaged.report.writes[0].offset + 512);
  for (const level of [1, 8, 100]) {
    const r = await api.patchROM(C, ['package'], pool, { rivalLevel: level, tutor: false });
    for (const id of [326, 327, 328]) {
      const p =
        new DataView(r.rom.buffer).getUint32(M.trainer_table + id * 40 + 36, true) - 0x8000000;
      assert.equal(r.rom[p + 2], level);
    }
    assert.equal(r.rom[0x3bc4e4], 1);
    assert.equal(r.rom[0x3bc4e8], F[0x3bc4e8]);
    const on = await api.patchROM(r.rom, ['package'], pool, { rivalLevel: 8, tutor: true });
    assert.notEqual(stat(on, 'core'), 'skipped');
    assert.equal(on.rom[0x3bc4e4], 2);
    assert.equal(h(on.rom), h(clean.rom));
  }
  for (const level of [0, 101, 1.5, NaN])
    await assert.rejects(
      () => api.patchROM(C, ['package'], pool, { rivalLevel: level }),
      /whole number/,
    );
  const rivalOnly = await api.patchROM(clean.rom, ['rival'], pool, { rivalLevel: 100 });
  assert.deepEqual(
    Array.from(
      rivalOnly.rom.slice(
        M.rival_normalizer.offset,
        M.rival_normalizer.offset + M.rival_normalizer.off.length,
      ),
    ),
    Array.from(M.rival_normalizer.off),
  );
  const wrong = C.slice();
  wrong[0xbc] = 0;
  const advisory = await api.patchROM(wrong, selected, pool);
  assert(advisory.report.warnings.some((w) => /differs/.test(w)));
  assert.equal(stat(advisory, 'core'), 'applied');
  const damaged = pool.slice();
  damaged[0] ^= 1;
  await assert.rejects(() => api.patchROM(C, selected, damaged), /damaged/);
  console.log('Checking BPS exports');
  for (const [src, dst] of [
    [C, clean.rom],
    [seed, randomized.rom],
    [U, current.rom],
  ]) {
    const patch = api.makeBPS(src, dst, 'Kaizo Baconmon'),
      undo = api.makeBPS(dst, src, 'Undo');
    for (const [input, p, expected] of [
      [src, patch, dst],
      [dst, undo, src],
    ]) {
      const parsed = BPS.fromFile(new BinFile(Uint8Array.from(p).buffer)),
        output = parsed.apply(new BinFile(Uint8Array.from(input).buffer), true);
      assert.equal(h(output._u8array), h(expected));
    }
  }
  const report = {
    tests: results,
    tutor_toggle_and_reenable_verified: true,
    rival_levels_1_8_100_verified: true,
    invalid_levels_rejected: true,
    package_includes_all_features: true,
    copier_header_preserved: true,
    header_revision_is_advisory: true,
    damaged_payload_rejected: true,
    bps_and_undo_independently_verified: true,
    randomized_tables_preserved: true,
    scope:
      'JavaScript from actual HTML, Node WebCrypto/DecompressionStream, independent Rom Patcher JS BPS implementation. Emulator tests reported separately. Browser rendering and Android hardware not tested.',
  };
  fs.writeFileSync(
    path.join(root, 'public-output/Compatibility_Tests.json'),
    JSON.stringify(report, null, 2),
  );
  console.log(
    'PASS',
    results.length,
    'compatibility cases, seed preservation, conflicts, idempotence, BPS and undo.',
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
