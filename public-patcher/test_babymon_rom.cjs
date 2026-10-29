const assert=require('node:assert/strict');
const manifest=require('./babymon_manifest.json');
const {plan}=require('./babymon_planner.js');
const {apply,validateSource,EVOLUTIONS,STARTERS,starterSlots}=require('./babymon_rom.js');
const byName=Object.fromEntries(manifest.map(p=>[p.name,p]));
assert.equal(manifest.length,386);
assert.equal(new Set(manifest.map(p=>p.dex)).size,386);
assert.deepEqual([1,2,3,0].map(t=>manifest.filter(p=>p.tier===t).length),[126,46,161,53]);
for(const name of ['SCYTHER','ONIX','CHANSEY']) assert.equal(byName[name].tier,2);
for(const name of ['BUTTERFREE','BEEDRILL','SHEDINJA','MAGMAR','SHUCKLE']) assert.equal(byName[name].tier,3);
for(const name of ['TANGELA','MEWTWO','UNOWN','DITTO']) assert.equal(byName[name].tier,0);
assert.equal(byName.CHARMANDER.tier,1); // Missing from the handwritten working list.
assert.equal(byName.NINCADA.methods.length,1);
assert.equal(byName.NINCADA.methods[0].code,4);
assert.equal(byName.SCYTHER.methods[0].code,7);
assert.equal(byName.SCYTHER.methods[0].parameter,199);
const base=new Uint8Array(0x1000000);base.set(Buffer.from('BPRE'),0xac);base[0xbc]=1;
// Layout validation uses complete original evolution records before UPR runs.
const source=base.slice(),sv=new DataView(source.buffer);
for(const p of manifest) for(const [i,m] of p.source_methods.entries()) {
  const off=EVOLUTIONS+p.internal_id*40+i*8;
  sv.setUint16(off,m.code,true);sv.setUint16(off+2,m.parameter,true);sv.setUint16(off+4,m.destination,true);
}
for(const [off,index] of starterSlots) sv.setUint16(STARTERS+off,[1,4,7][index],true);
assert(validateSource(source,manifest));
const corrupt=source.slice();corrupt[EVOLUTIONS+40]^=1;
assert.throws(()=>validateSource(corrupt,manifest));
assert.throws(()=>validateSource(base,manifest));
const original=base.slice();
let decreased=false;
for(let i=0;i<100;i++) {
  const {rom,plan:p}=apply(base,manifest,String(i));
  assert.deepEqual(p,plan([...manifest].reverse(),String(i)));
  assert.deepEqual(rom,apply(base,manifest,String(i)).rom);
  const v=new DataView(rom.buffer);
  for(const e of p.evolutions) {
    const from=manifest[e.from-1],to=manifest[e.to-1];
    assert.equal(to.tier,from.tier+1);assert(!to.legendary);
    const off=EVOLUTIONS+from.internal_id*40+e.branch*8;
    assert.equal(v.getUint16(off,true),e.method.code);
    assert.equal(v.getUint16(off+2,true),e.method.parameter);
    assert.equal(v.getUint16(off+4,true),to.internal_id);
    if(from.bst>to.bst)decreased=true;
  }
  for(const p of manifest.filter(p=>p.tier===0||p.tier===3))
    assert(rom.slice(EVOLUTIONS+p.internal_id*40,EVOLUTIONS+p.internal_id*40+40).every(x=>x===0));
  for(const [off,index] of starterSlots) {
    assert.equal(manifest[p.starters[index]-1].tier,1);
    assert.equal(v.getUint16(STARTERS+off,true),manifest[p.starters[index]-1].internal_id);
  }
}
for(const [seed,from,mid,to,level] of [['88262',10,14,149,7],['6759',79,123,15,37]]) {
  const p=apply(base,manifest,seed).plan;
  const first=p.evolutions.find(e=>e.from===from&&e.branch===0);
  const second=p.evolutions.find(e=>e.from===mid&&e.branch===0);
  assert.equal(first.to,mid);assert.equal(second.to,to);assert.equal(first.method.parameter,level);
  if(mid===14){assert.equal(second.method.code,4);assert.equal(second.method.parameter,10);}
  else {assert.equal(second.method.code,7);assert.equal(second.method.parameter,199);}
}
assert(decreased);assert.deepEqual(base,original);
assert.throws(()=>apply(new Uint8Array(512),manifest,'1'));
const bad=base.slice();bad[0xbc]=0;assert.throws(()=>apply(bad,manifest,'1'));
console.log('386-species manifest and 100-seed binary writer checks passed; synthetic ROM, not gameplay validation.');
