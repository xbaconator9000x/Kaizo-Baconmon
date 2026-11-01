/* Execute the published page's real batch click handler and Java engine.
 * DOM and browser-Java transport are adapted for Node; no ROM writer is mocked.
 */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),cp=require('child_process');
const [input,outDir]=process.argv.slice(2);if(!outDir)throw Error('Usage: node test_babymon_batch.cjs INPUT.gba OUTPUT_DIR');
const root=path.resolve(__dirname,'..');fs.mkdirSync(outDir,{recursive:true});
const javaSource=`import java.nio.file.*;class InvokeBabymon { public static void main(String[] a) throws Exception { System.out.println(BaconBridge.generateBabymonSafe(a[0],a[1],Files.readString(Path.of(a[2])),a[3],Integer.parseInt(a[4]),Integer.parseInt(a[5]),Integer.parseInt(a[6]))); } }`;
fs.writeFileSync(path.join(outDir,'InvokeBabymon.java'),javaSource);
(async()=>{const results=[];for(const pageName of ['index.html','babymon-beta.html']){
 const html=fs.readFileSync(path.join(root,pageName),'utf8'),nodes={},features=[],files=new Map(),blobs=new Map();let bridgeCalls=0;
 for(const m of html.matchAll(/<(input|select|button|div|pre|p|textarea)[^>]*\bid="([^"]+)"[^>]*>/g)){
  const tag=m[0],id=m[2];let value=tag.match(/\bvalue="([^"]*)"/)?.[1]||'';
  if(m[1]==='select'){const rest=html.slice(m.index+tag.length);const opt=rest.match(/<option(?:\s+value="([^"]*)")?[^>]*>([^<]*)/);value=opt?.[1]||opt?.[2]||'';}
  const node={value,checked:/\schecked\b/.test(tag),disabled:false,children:[],files:[],textContent:'',addEventListener(){},replaceChildren(...x){this.children=x;},appendChild(x){this.children.push(x);}};
  nodes[id]=node;if(/class="feature"/.test(tag))features.push(node);
 }
 const document={getElementById:id=>nodes[id]||null,createElement:()=>({}),head:{appendChild:s=>s.onload()},querySelectorAll:s=>s==='input.feature:checked'?features.filter(x=>x.checked):s.includes('input.feature')?[...features,nodes.package]:Object.values(nodes)};
 const work=path.resolve(outDir,pageName.replace('.html',''));fs.mkdirSync(work,{recursive:true});
 const ctx=vm.createContext({document,Uint8Array,Uint32Array,DataView,TextEncoder,TextDecoder,crypto:require('crypto').webcrypto,Blob,Response,DecompressionStream,atob,setTimeout,console,URL:{createObjectURL:b=>{const id='blob:'+blobs.size;blobs.set(id,b);return id;},revokeObjectURL(){}},
  cheerpjInit:async()=>{},cheerpOSAddStringFile:(p,b)=>files.set(p,Buffer.from(b)),
  cheerpjRunLibrary:async()=>{fs.writeFileSync(path.join(work,'engine.jar'),files.get('/str/PokeRandoZX.jar'));fs.writeFileSync(path.join(work,'bridge.jar'),files.get('/str/BaconBridge.jar'));return {BaconBridge:{
   generateBabymonSafe:async(src,dst,settings,seed,...picks)=>{bridgeCalls++;fs.writeFileSync(path.join(work,'base.gba'),files.get(src));fs.writeFileSync(path.join(work,'settings.txt'),settings);
    const target=path.join(work,'output-'+seed+'.gba');const result=cp.execFileSync('java',['--class-path',path.join(work,'engine.jar')+':'+path.join(work,'bridge.jar'),path.resolve(outDir,'InvokeBabymon.java'),path.join(work,'base.gba'),target,path.join(work,'settings.txt'),seed,...picks.map(String)],{encoding:'utf8'}).trim();
    if(result.startsWith('OK:')){files.set(dst,fs.readFileSync(target));files.set(dst+'.log',fs.readFileSync(target+'.log'));}return result;},
   generateSafe:()=>{throw Error('Babymon incorrectly called ordinary Kaizo generation');},remove:async p=>files.delete(p)}};},
  cjFileBlob:async p=>new Blob([files.get(p)])});
 vm.runInContext(html.match(/<script>([\s\S]*)<\/script>/)[1]+'\nglobalThis.MANIFEST=BABYMON_MANIFEST;globalThis.ROMAPI=BabymonROM;',ctx);
 nodes.file.files=[{name:'Input.gba',arrayBuffer:async()=>Uint8Array.from(fs.readFileSync(input)).buffer}];
 // Selecting the named randomiser preset must also select the Babymon profile.
 nodes['batch-preset'].value='Babymon';nodes['batch-preset'].onchange();assert.equal(nodes['run-profile'].value,'babymon');
 assert(features.every(f=>f.checked),'Babymon selects every feature in the full package');
 nodes['batch-preset'].value='Kaizo';nodes['batch-preset'].onchange();assert.equal(nodes['run-profile'].value,'custom');
 features[0].checked=false;nodes['batch-preset'].value='Babymon';nodes['batch-preset'].onchange();assert(features.every(f=>f.checked),'reselecting Babymon restores the full package');
 nodes['batch-seed'].value='12345';nodes['batch-size'].value='2';nodes['batch-count'].value='2';
 const outputs=[];
 for(let batch=1;batch<=2;batch++){
  await nodes['batch-generate'].onclick();assert(nodes['batch-status'].textContent.startsWith('Batch '+batch+' ready.'),nodes['batch-status'].textContent);
  const link=nodes['batch-download'].children[0];assert(link,'ZIP download exists');const zip=Buffer.from(await blobs.get(link.href).arrayBuffer());fs.writeFileSync(path.join(work,'batch-'+batch+'.zip'),zip);
  // ZIP entries are stored; inspect the exact downloadable ROM bytes.
  let at=0,manifest=null;while(zip.readUInt32LE(at)===0x04034b50){const size=zip.readUInt32LE(at+18),nl=zip.readUInt16LE(at+26),el=zip.readUInt16LE(at+28),name=zip.subarray(at+30,at+30+nl).toString(),data=zip.subarray(at+30+nl+el,at+30+nl+el+size);
   if(name.endsWith('.gba')){outputs.push(Buffer.from(data));fs.writeFileSync(path.join(work,name),data);}
   if(name==='Seeds_and_settings.json')manifest=JSON.parse(data);at+=30+nl+el+size;}
  assert.equal(manifest.ruleset,'babymon');assert.equal(manifest.runs.length,2);
  for(const run of manifest.runs){const bytes=outputs.find(b=>require('crypto').createHash('sha256').update(b).digest('hex')===run.sha256);assert(bytes);const plan=ctx.BabymonPlanner.plan(ctx.MANIFEST,run.seed),byDex=new Map(ctx.MANIFEST.map(p=>[p.dex,p])),byId=new Map(ctx.MANIFEST.map(p=>[p.internal_id,p]));
   for(const [off,index]of ctx.ROMAPI.starterSlots){const id=bytes.readUInt16LE(ctx.ROMAPI.STARTERS+off);assert.equal(id,byDex.get(plan.starters[index]).internal_id);assert.equal(byId.get(id).tier,1);}
   for(const mon of ctx.MANIFEST)for(let branch=0;branch<5;branch++){const a=ctx.ROMAPI.EVOLUTIONS+mon.internal_id*40+branch*8,method=bytes.readUInt16LE(a),dest=bytes.readUInt16LE(a+4),expected=plan.evolutions.find(e=>e.from===mon.dex&&e.branch===branch);if(expected){assert.equal(method,expected.method.code);assert.equal(bytes.readUInt16LE(a+2),expected.method.parameter);assert.equal(dest,byDex.get(expected.to).internal_id);assert.equal(byId.get(dest).tier,mon.tier+1);}else assert.equal(method,0);}
  }
 }
 assert.equal(bridgeCalls,4);assert.equal(new Set(outputs.map(b=>require('crypto').createHash('sha256').update(b).digest('hex'))).size,4);
 results.push({page:pageName,batches:2,roms:4,real_java_calls:bridgeCalls,all_starters_tier1:true,all_evolutions_follow_next_tier:true,tier3_has_no_evolution:true,download_manifests_match:true});
}
fs.writeFileSync(path.join(outDir,'batch-checks.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));})().catch(e=>{console.error(e);process.exit(1)});
