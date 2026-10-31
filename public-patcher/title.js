/* Preset-specific static title. All checks run before the title feature writes. */
const BabymonTitle = {
  async preflight(rom, profile) {
    const m = BABYMON_TITLE;
    const hook = u32(rom, m.hook);
    if (hook !== m.original_hook && hook !== m.installed_hook)
      return { conflicts: [m.hook] };
    const installed = hook === m.installed_hook;
    const wanted = profile === 'babymon';
    if (!wanted && !installed) return { wanted, installed };
    if (!inside(rom, m.base, m.length)) return { conflicts: [m.base] };
    const region = rom.subarray(m.base, m.base + m.length);
    const matches = (await hash(region)) === m.sha256;
    if ((installed && !matches) || (!installed && !matches && !region.every(x => x === 255)))
      return { conflicts: [m.base] };
    const data = Uint8Array.from(atob(m.data), c => c.charCodeAt(0));
    if (data.length !== m.length || (await hash(data)) !== m.sha256)
      throw Error('The Babymon title asset is damaged. Download the patcher again.');
    return { wanted, installed, data };
  },
  apply(rom, state, report) {
    const m = BABYMON_TITLE;
    if (state.wanted && !state.installed) {
      rom.set(state.data, m.base);
      report.writes.push({ feature: 'title', offset: m.base, length: m.length });
    }
    if (state.wanted !== state.installed) {
      new DataView(rom.buffer, rom.byteOffset, rom.byteLength).setUint32(
        m.hook, state.wanted ? m.installed_hook : m.original_hook, true);
      report.writes.push({ feature: 'title', offset: m.hook, length: 4 });
    }
    return state.wanted ? 'babymon' : 'baconmon';
  },
};
