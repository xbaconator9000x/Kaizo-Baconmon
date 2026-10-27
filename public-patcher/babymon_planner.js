/* Babymon deterministic evolution planner. Not a ROM writer. */
(function(root) {
  'use strict';
  function plan(manifest, seed) {
    if (!Array.isArray(manifest) || manifest.length !== 386) throw Error('Expected all 386 National Dex entries.');
    const ids = new Set();
    const pools = {1:[],2:[],3:[]};
    for (const p of manifest) {
      if (!Number.isInteger(p.dex) || p.dex < 1 || p.dex > 386 || ids.has(p.dex)) throw Error('Invalid or duplicate dex ID.');
      ids.add(p.dex);
      if (![0,1,2,3].includes(p.tier)) throw Error('Invalid tier.');
      if (p.legendary && p.tier) throw Error('Legendary in eligible pool.');
      if (p.tier) pools[p.tier].push(p.dex);
      if ((p.tier === 1 || p.tier === 2) && (!Array.isArray(p.methods) || !p.methods.length)) throw Error('Missing evolution methods.');
    }
    for (const tier of [1,2,3]) {
      pools[tier].sort((a,b)=>a-b);
      if (!pools[tier].length) throw Error('Empty tier.');
    }
    if (typeof seed !== 'string' || !seed.length) throw Error('Seed must be a nonempty string.');
    // Domain-separated per-branch hashing: independent of manifest traversal order.
    function pick(key, pool) {
      let h = 2166136261;
      for (const c of seed + '\nBabymon-v1\n' + key) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
      return pool[h % pool.length];
    }
    const evolutions = [];
    for (const p of [...manifest].sort((a,b)=>a.dex-b.dex)) {
      if (p.tier !== 1 && p.tier !== 2) continue;
      p.methods.forEach((method,index) => {
        if (!method || typeof method.kind !== 'string') throw Error('Invalid method.');
        evolutions.push({from:p.dex, branch:index, method:{...method}, to:pick(p.dex+':'+index,pools[p.tier+1])});
      });
    }
    return {format:'Babymon evolution plan v1', seed, starters:[0,1,2].map(i=>pick('starter:'+i,pools[1])), evolutions};
  }
  const api = {plan};
  if (typeof module !== 'undefined') module.exports=api;
  root.BabymonPlanner=api;
})(globalThis);
