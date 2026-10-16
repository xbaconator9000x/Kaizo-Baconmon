const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto'),path=require('path');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'public-output/Kaizo_Baconmon_Patcher.html'),'utf8'),ctx=vm.createContext({crypto:crypto.webcrypto,DecompressionStream,Response,Blob,atob,Uint8Array,Uint32Array,DataView,Array,TextEncoder,Error,Math});
vm.runInContext(html.match(/<script>([\s\S]*)<\/script>/)[1]+';globalThis.M=CONFIG;globalThis.pool=()=>LegacyCore.inflate(PAYLOAD);',ctx);
(async()=>{
 const pool=await ctx.pool(),input=fs.readFileSync(process.argv[2]||path.join(root,'patch-inputs/Pokemon - Fire Red Version (U) (V1.1).gba')),r=await ctx.BaconPublic.patchROM(input,['status'],pool);
 assert.equal(r.report.features.find(f=>f.id==='status').status,'applied');
 const differences=[];for(let i=0;i<input.length;i++)if(input[i]!==r.rom[i]){assert((i>=0xeab68&&i<0xeab74)||(i>=0x7f0000&&i<0x7f0100));differences.push(i);}
 assert(differences.length>0);const second=await ctx.BaconPublic.patchROM(r.rom,['status'],pool);assert.deepEqual(second.rom,r.rom);
 for(const at of [0x49950,0x7f0080]){const conflict=Uint8Array.from(input);conflict[at]^=1;const skip=await ctx.BaconPublic.patchROM(conflict,['status'],pool);assert.equal(skip.report.features.find(f=>f.id==='status').status,'skipped');assert.deepEqual(skip.rom,conflict);}
 if(process.argv[3])fs.writeFileSync(process.argv[3],r.rom);
 console.log('PASS status refresh: guarded status-only patch, reapply and conflicts.');
})().catch(e=>{console.error(e);process.exit(1)});
