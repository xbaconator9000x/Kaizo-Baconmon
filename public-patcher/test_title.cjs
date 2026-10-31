/* Tests the actual standalone public pages against a user-supplied ROM. */
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const romPath=process.argv[2];if(!romPath)throw Error('Usage: node test_title.cjs INPUT.gba OUTPUT_DIR');
const source=new Uint8Array(fs.readFileSync(romPath)),outDir=process.argv[3];
const results=[];
(async()=>{for(const page of ['index.html','babymon-beta.html']) {
 const html=fs.readFileSync(path.join(__dirname,'..',page),'utf8');
 const script=html.match(/<script>([\s\S]*)<\/script>/)[1];
 const ctx=vm.createContext({Uint8Array,Uint32Array,DataView,TextEncoder,TextDecoder,crypto:require('crypto').webcrypto,atob,Blob,Response,DecompressionStream,console});
 vm.runInContext(script+'\nglobalThis.asset=BABYMON_TITLE;globalThis.payload=PAYLOAD;',ctx);
 const core=ctx.BaconPublic,pool=await vm.runInContext('LegacyCore.inflate(PAYLOAD)',ctx),m=ctx.asset;
 const apply=(rom,profile,features=['title'])=>core.patchROM(rom,features,pool,{profile});
 const baby=await apply(source,'babymon');assert.equal(baby.report.title_variant,'babymon');
 assert.equal(new DataView(baby.rom.buffer).getUint32(m.hook,true),m.installed_hook);
 assert.equal(await core.hash(baby.rom.subarray(m.base,m.base+m.length)),m.sha256);
 assert.equal(await core.hash(source),baby.report.source_sha256,'input is immutable');
 const same=await apply(baby.rom,'babymon');assert.deepEqual(same.rom,baby.rom,'reapply idempotent');assert.equal(same.report.features.find(x=>x.id==='title').status,'existing');
 const normal=await apply(source,'baconmon');assert.equal(normal.report.title_variant,'baconmon');
 const back=await apply(baby.rom,'baconmon');assert.equal(new DataView(back.rom.buffer).getUint32(m.hook,true),m.original_hook);
 const disabled=await apply(source,'babymon',[]);assert.deepEqual(disabled.rom,source,'title toggle off');
 const disabledExisting=await apply(baby.rom,'baconmon',[]);assert.deepEqual(disabledExisting.rom,baby.rom,'unselected leaves existing title alone');
 for(const address of [m.base,m.hook,0x7a0000]) {
  const foreign=source.slice();foreign[address]^=0x55;
  const r=await apply(foreign,'babymon');assert.equal(r.report.features.find(x=>x.id==='title').status,'skipped');assert.deepEqual(r.rom,foreign,'conflict is atomic');
 }
 const corrupt=baby.rom.slice();corrupt[m.base+0x600]^=1;
 assert.deepEqual((await apply(corrupt,'babymon')).rom,corrupt,'damaged installed asset is protected');
 const header=new Uint8Array(source.length+512);header.fill(0x55,0,512);header.set(source,512);
 const headered=await apply(header,'babymon');assert.deepEqual(headered.rom.subarray(0,512),header.subarray(0,512));assert.equal(new DataView(headered.rom.buffer).getUint32(m.hook+512,true),m.installed_hook);
 if(outDir){fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(path.join(outDir,page.replace('.html','')+'-babymon.gba'),baby.rom);fs.writeFileSync(path.join(outDir,page.replace('.html','')+'-baconmon.gba'),normal.rom);}
 results.push({page,checks:13,title_variant:baby.report.title_variant,output_sha256:baby.report.output_sha256});
}console.log(JSON.stringify(results,null,2));if(outDir)fs.writeFileSync(path.join(outDir,'title-checks.json'),JSON.stringify(results,null,2));})().catch(e=>{console.error(e);process.exit(1)});
