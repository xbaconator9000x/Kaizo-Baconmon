/* GPL-3.0-or-later. FireRed Rev 1 writer; layout follows UPR-ZX 4.6.0.
 * Deliberately separate from gameplay enforcement. Never certifies a legal run.
 */
(function(root) {
  'use strict';
  const EVOLUTIONS = 0x2597c4, STARTERS = 0x169c2d;
  const starterSlots = [[0,0],[5,1],[515,1],[520,2],[461,2],[466,0]];
  function view(rom) {
    if (!(rom instanceof Uint8Array) || rom.length < 0x1000000 ||
        String.fromCharCode(...rom.slice(0xac,0xb0)) !== 'BPRE' || rom[0xbc] !== 1)
      throw Error('Babymon requires an unheadered US FireRed Rev 1 layout.');
    return new DataView(rom.buffer,rom.byteOffset,rom.byteLength);
  }
  function validateManifest(manifest) {
    // Planner validates dex IDs, tiers and pools as well.
    root.BabymonPlanner.plan(manifest,'layout-validation');
    const internal = new Set();
    for (const p of manifest) {
      if (!Number.isInteger(p.internal_id) || p.internal_id < 1 || p.internal_id > 411 || internal.has(p.internal_id))
        throw Error('Invalid internal species mapping.');
      internal.add(p.internal_id);
      if (p.methods.length > 5) throw Error('Too many evolution branches.');
      for (const m of p.methods) {
        if (!Number.isInteger(m.code) || m.code < 1 || m.code > 15 || m.code === 13 || m.code === 14 ||
            !Number.isInteger(m.parameter) || m.parameter < 0 || m.parameter > 65535)
          throw Error('Invalid evolution encoding.');
      }
    }
  }
  function validateSource(rom,manifest) {
    validateManifest(manifest);
    const v=view(rom);
    for(const p of manifest) {
      for(let i=0;i<5;i++) {
        const off=EVOLUTIONS+p.internal_id*40+i*8,m=p.source_methods[i];
        if(v.getUint16(off,true)!==(m?.code||0) || v.getUint16(off+2,true)!==(m?.parameter||0) ||
           v.getUint16(off+4,true)!==(m?.destination||0))
          throw Error('Babymon cannot verify the original evolution table layout.');
      }
    }
    for(const [off,index] of starterSlots)
      if(v.getUint16(STARTERS+off,true)!==[1,4,7][index])
        throw Error('Babymon cannot verify the original starter script layout.');
    return true;
  }
  function apply(rom,manifest,seed) {
    validateManifest(manifest);
    view(rom);
    const plan = root.BabymonPlanner.plan(manifest,seed), byDex = new Map(manifest.map(p=>[p.dex,p]));
    // Stage all writes in a copy. Failure never partially mutates the input.
    const output = rom.slice(), v = view(output);
    for (const p of manifest) output.fill(0,EVOLUTIONS+p.internal_id*40,EVOLUTIONS+p.internal_id*40+40);
    for (const e of plan.evolutions) {
      const offset = EVOLUTIONS+byDex.get(e.from).internal_id*40+e.branch*8;
      v.setUint16(offset,e.method.code,true);
      v.setUint16(offset+2,e.method.parameter,true);
      v.setUint16(offset+4,byDex.get(e.to).internal_id,true);
    }
    for (const [offset,index] of starterSlots) v.setUint16(STARTERS+offset,byDex.get(plan.starters[index]).internal_id,true);
    return {rom:output,plan,validation_status:'experimental: gameplay enforcement pending'};
  }
  const api={apply,validateSource,EVOLUTIONS,STARTERS,starterSlots};
  if(typeof module!=='undefined') { root.BabymonPlanner=require('./babymon_planner.js'); module.exports=api; }
  root.BabymonROM=api;
})(globalThis);
