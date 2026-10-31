/* Real mGBA WebAssembly boot check; supply the compatible mgbawasm shim. */
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const [romPath,modulePath,outDir]=process.argv.slice(2);
if(!outDir)throw Error('Usage: node test_title_runtime.cjs INPUT.gba MGBA_MODULE.cjs OUTPUT_DIR');
(async()=>{
 const m=await require(path.resolve(modulePath))({print:()=>{},printErr:console.error});
 m._mgbawasm_init();m._mgbawasm_set_log_level(1);
 const rom=fs.readFileSync(romPath),p=m._malloc(rom.length);m.HEAPU8.set(rom,p);
 assert.equal(m._mgbawasm_load(p,rom.length,0,0,0,0,1),1);
 const aud=m._malloc(16384);
 function frames(n,keys=0){m._mgbawasm_set_keys(keys);for(let i=0;i<n;i++){m._mgbawasm_run_frame();m._mgbawasm_read_audio(aud,4096);}}
 function pixels(){const p=m._mgbawasm_video_ptr(),rgb=Buffer.alloc(38400*3);for(let i=0;i<38400;i++)for(let c=0;c<3;c++)rgb[i*3+c]=m.HEAPU8[p+i*4+c];return rgb;}
 function shot(name,rgb){fs.writeFileSync(path.join(outDir,name+'.ppm'),Buffer.concat([Buffer.from('P6\n240 160\n255\n'),rgb]));}
 frames(500);frames(1,8);frames(400);
 fs.mkdirSync(outDir,{recursive:true});const title=pixels();shot('babymon-title',title);
 const indices=fs.readFileSync(path.join(__dirname,'title/babymon.8bpp'));
 const palette=fs.readFileSync(path.join(__dirname,'title/babymon.pal'));
 let mismatches=0;
 for(let i=0;i<38400;i++){const color=palette.readUInt16LE(indices[i]*2);for(let c=0;c<3;c++)if((title[i*3+c]>>3)!==((color>>(c*5))&31))mismatches++;}
 assert.equal(mismatches,0,'every rendered title pixel matches the imported GBA image');
 // The static title remains correct as native task/animation timers progress.
 frames(60);assert.deepEqual(pixels(),title,'stable title over time');
 frames(1,8);frames(500);const next=pixels();shot('after-start',next);
 let changed=0;for(let i=0;i<title.length;i++)if(title[i]!==next[i])changed++;
 assert(changed>38400,'Start leaves the title and enters the native opening/menu flow');
 const crypto=require('crypto');
 const result={runtime:'mGBA wasm',rom_sha256:crypto.createHash('sha256').update(rom).digest('hex'),title_pixel_mismatches:mismatches,stable_title:true,start_transition:true};
 fs.writeFileSync(path.join(outDir,'runtime-check.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
