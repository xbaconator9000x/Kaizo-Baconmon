const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const p=require('./challenge/binary_payload.json');
const context=vm.createContext({CHALLENGE_NATIVE:p,Uint8Array,DataView});
vm.runInContext(fs.readFileSync(__dirname+'/challenge_support.js','utf8'),context);
const source=new Uint8Array(0x1000000).fill(255);source.set(Buffer.from('BPRE'),0xac);source[0xbc]=1;
new DataView(source.buffer).setUint32(0xB0FFF0,1,true);
for(const x of [...p.records,...p.guards])source.set(Buffer.from(x.before,'hex'),x.offset);
const original=source.slice(),apply=context.ChallengeSupport.apply;
const patched=apply(source);assert.deepEqual(source,original);assert(patched.writes.length===2);assert.equal(apply(patched.rom).writes.length,0);
for(const offset of [p.base,p.records[0].offset,p.guards[0].offset]){const bad=source.slice();bad[offset]^=1;assert.throws(()=>apply(bad));}
const missing=source.slice();missing[0xB0FFF0]=0;assert.throws(()=>apply(missing));
const rev0=source.slice();rev0[0xbc]=0;assert.throws(()=>apply(rev0));
console.log('PASS challenge installation, idempotence, native guards, configuration, immutable input and revision rejection. Synthetic fixture; not gameplay validation.');
