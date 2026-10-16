const fs=require('fs'),vm=require('vm'),crypto=require('crypto'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'public-output/Kaizo_Baconmon_Patcher.html'),'utf8'),script=html.match(/<script>([\s\S]*)<\/script>/)[1];
const ctx=vm.createContext({crypto:crypto.webcrypto,DecompressionStream,Response,Blob,atob,Uint8Array,Uint32Array,DataView,Array,TextEncoder,Error,Math,console});vm.runInContext(script+'\nglobalThis.M=CONFIG;globalThis.P=PAYLOAD;',ctx);
const core=ctx.BaconPublic,read=p=>fs.readFileSync(path.join(root,p));
async function main(){const pool=await ctx.LegacyCore?.inflate?.(ctx.P)||await vm.runInContext('LegacyCore.inflate(PAYLOAD)',ctx);const selected=ctx.M.groups.map(g=>g.id),results=[];
for(const [name,p]of [['clean','patch-inputs/Pokemon - Fire Red Version (U) (V1.1).gba'],['current','source/output/Kaizo_Baconmon_v0.9.4_CURRENT_RUN_0006.gba']]){
 const source=read(p),r=await core.patchROM(source,selected,pool);results.push({name,features:r.report.features.map(x=>[x.id,x.status,x.reason,x.conflicts?.slice(0,4)])});fs.writeFileSync(path.join(root,'public-patcher/'+name+'.gba'),r.rom);
}
console.log(JSON.stringify(results,null,2));fs.writeFileSync(path.join(root,'public-patcher/initial-tests.json'),JSON.stringify(results,null,2));}
main().catch(e=>{console.error(e);process.exit(1)});
