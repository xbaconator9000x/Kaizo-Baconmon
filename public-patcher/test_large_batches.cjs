const fs = require('fs'),
  path = require('path'),
  vm = require('vm'),
  crypto = require('crypto'),
  assert = require('assert');
const root = path.resolve(__dirname, '..'),
  html = fs.readFileSync(path.join(root, 'public-output/Kaizo_Baconmon_Patcher.html'), 'utf8');
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
function setup(size, count = 1, failAt = 0) {
  const nodes = {},
    files = new Map(),
    blobs = new Map(),
    calls = [];
  let n = 0,
    failed = false,
    maxLive = 0;
  for (const m of html.matchAll(/\bid="([^"]+)"/g))
    nodes[m[1]] = {
      value: '',
      checked: false,
      disabled: false,
      files: [],
      children: [],
      addEventListener() {},
      replaceChildren(...x) {
        this.children = x;
      },
      appendChild(x) {
        this.children.push(x);
      },
    };
  Object.assign(nodes['batch-size'], { value: String(size) });
  nodes['batch-count'].value = String(count);
  nodes['batch-preset'].value = 'Kaizo';
  nodes.rivalLevel.value = '8';
  nodes.file.files = [{ name: 'Test.gba', arrayBuffer: async () => new Uint8Array(32).buffer }];
  const bridge = {
    async generateSafe(input, out, settings, seed) {
      calls.push(seed);
      if (!failed && failAt === calls.length) {
        failed = true;
        return 'ERROR:Test retry';
      }
      files.set(out, new TextEncoder().encode('Synthetic test output ' + seed));
      files.set(out + '.log', new TextEncoder().encode('Test log ' + seed));
      return 'OK:test';
    },
    async remove(p) {
      files.delete(p);
    },
  };
  const document = {
    getElementById: (id) => nodes[id],
    querySelectorAll: (q) =>
      q === 'input,select,textarea,#batch-new-seed' ? Object.values(nodes) : [],
    createElement: () => ({}),
    head: {
      appendChild(s) {
        queueMicrotask(() => s.onload());
      },
    },
  };
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
    document,
    setTimeout,
    cheerpjInit: async () => {},
    cheerpjRunLibrary: async () => ({ BaconBridge: bridge }),
    cheerpOSAddStringFile: (p, b) => files.set(p, b),
    cjFileBlob: async (p) => new Blob([files.get(p)]),
    URL: {
      createObjectURL(b) {
        const k = 'blob:' + n++;
        blobs.set(k, b);
        maxLive = Math.max(maxLive, blobs.size);
        return k;
      },
      revokeObjectURL: (k) => blobs.delete(k),
    },
  });
  vm.runInContext(script, ctx);
  nodes['batch-seed'].value = '42';
  return { ctx, nodes, blobs, calls, maxLive: () => maxLive };
}
async function readPart(t) {
  const link = t.nodes['batch-download'].children[0];
  assert(link, t.nodes['batch-status'].textContent);
  const b = Buffer.from(await t.blobs.get(link.href).arrayBuffer()),
    entries = {};
  let i = 0;
  while (b.readUInt32LE(i) === 0x04034b50) {
    assert.equal(b.readUInt16LE(i + 8), 0);
    const n = b.readUInt32LE(i + 18),
      nameLen = b.readUInt16LE(i + 26),
      extra = b.readUInt16LE(i + 28),
      start = i + 30 + nameLen + extra;
    entries[b.subarray(i + 30, i + 30 + nameLen).toString()] = b.subarray(start, start + n);
    i = start + n;
  }
  const m = JSON.parse(entries['Seeds_and_settings.json']);
  assert.equal(Object.keys(entries).filter((n) => n.endsWith('.gba')).length, m.runs.length);
  assert(m.runs.length <= 10);
  return m;
}
(async () => {
  const checks = [];
  assert(html.includes('Batch randomiser · beta'));
  assert(/id="batch-size"[^>]*max="100"/.test(html));
  for (const [size, count] of [
    [1, 1],
    [10, 1],
    [11, 1],
    [20, 2],
    [100, 2],
  ]) {
    const t = setup(size, count),
      runs = [],
      parts = [];
    for (let j = 0; j < Math.ceil(size / 10) * count; j++) {
      await t.nodes['batch-generate'].onclick();
      const m = await readPart(t);
      parts.push({ batch: m.batch, part: m.part, first: m.first_rom, last: m.last_rom });
      runs.push(...m.runs);
      assert.equal(m.roms_per_batch, size);
      assert.equal(m.parts, Math.ceil(size / 10));
      assert.equal(m.first_rom, (m.part - 1) * 10 + 1);
      assert.equal(m.last_rom, Math.min(size, m.part * 10));
    }
    assert.equal(runs.length, size * count);
    assert.equal(t.calls.length, size * count);
    assert.equal(t.maxLive(), 1);
    assert.equal(t.nodes['batch-generate'].disabled, false);
    for (let i = 0; i < runs.length; i++) {
      assert(runs[i].file.endsWith('_' + String(i + 1).padStart(4, '0') + '.gba'));
      assert.equal(runs[i].seed, await t.ctx.BaconBatch.batchSeed('42', i + 1));
    }
    checks.push({
      size,
      batches: count,
      roms: runs.length,
      zip_parts: parts.length,
      parts,
      seeds_and_numbering: 'passed',
      max_live_downloads: t.maxLive(),
    });
  }
  for (const [size, count] of [
    [0, 1],
    [101, 1],
    [1.5, 1],
    [10, 101],
  ]) {
    const t = setup(size, count);
    await t.nodes['batch-generate'].onclick();
    assert.match(t.nodes['batch-status'].textContent, /1–100/);
    assert.equal(t.calls.length, 0);
    assert.equal(t.nodes['batch-generate'].disabled, false);
  }
  const retry = setup(10, 1, 3);
  await retry.nodes['batch-generate'].onclick();
  assert.match(retry.nodes['batch-status'].textContent, /Test retry/);
  await retry.nodes['batch-generate'].onclick();
  const m = await readPart(retry);
  assert.equal(m.first_rom, 1);
  assert.equal(m.runs.length, 10);
  assert.equal(m.runs[0].seed, await retry.ctx.BaconBatch.batchSeed('42', 1));
  fs.writeFileSync(
    path.join(root, 'public-output/Batch_Size_Tests.json'),
    JSON.stringify(
      {
        checks,
        invalid_sizes_and_counts_rejected: true,
        failed_part_retry_keeps_seed_sequence: true,
        beta_label_present: true,
        scope:
          'Actual HTML handlers, ZIP writer, seed derivation and part manifests. Java engine stubbed with synthetic bytes for 1/10/11/20/100-ROM scheduling tests; real browser generation checked separately.',
      },
      null,
      2,
    ),
  );
  console.log(
    'PASS batch sizes 1/10/11/20/100, multiple batches, ZIP parts, seeds, numbering, retry and limits.',
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
