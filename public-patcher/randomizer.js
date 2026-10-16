/* GPL-3.0: browser adapter for UPR-ZX. Patcher components retain their MIT licence. */
function batchSeed(root,index){return hash(new TextEncoder().encode('Baconmon batch v1\n'+root+'\n'+index)).then(h=>parseInt(h.slice(0,13),16).toString());}
function storedZip(entries){
 const parts=[],central=[];let offset=0;
 function header(n){return new Uint8Array(n);}
 for(const {name,data} of entries){const filename=new TextEncoder().encode(name),bytes=typeof data==='string'?new TextEncoder().encode(data):data,crc=crc32(bytes),h=header(30),v=new DataView(h.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(12,0x21,true);v.setUint32(14,crc,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,filename.length,true);parts.push(h,filename,bytes);
  const c=header(46),w=new DataView(c.buffer);w.setUint32(0,0x02014b50,true);w.setUint16(4,20,true);w.setUint16(6,20,true);w.setUint16(8,0x800,true);w.setUint16(14,0x21,true);w.setUint32(16,crc,true);w.setUint32(20,bytes.length,true);w.setUint32(24,bytes.length,true);w.setUint16(28,filename.length,true);w.setUint32(42,offset,true);central.push(c,filename);offset+=30+filename.length+bytes.length;
 }
 const size=central.reduce((n,x)=>n+x.length,0),end=header(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,entries.length,true);v.setUint16(10,entries.length,true);v.setUint32(12,size,true);v.setUint32(16,offset,true);return new Blob([...parts,...central,end],{type:'application/zip'});
}
if(typeof document!=='undefined'&&document.getElementById('batch-generate')){
 const el=id=>document.getElementById(id),button=el('batch-generate'),status=el('batch-status');let bridgePromise,session=null,downloadURL=null,busy=false,locked=[];
 function newSeed(){const words=crypto.getRandomValues(new Uint32Array(2));el('batch-seed').value=((BigInt(words[0])<<20n)|BigInt(words[1]&0xfffff)).toString();}
 newSeed();el('batch-new-seed').onclick=newSeed;
 el('batch-preset').onchange=()=>{el('batch-settings').value=BATCH_PRESETS[el('batch-preset').value]||'';el('batch-settings').readOnly=el('batch-preset').value!=='Custom';};el('batch-preset').onchange();
 function reset(){if(!busy){session=null;button.textContent='Generate first batch';}}
 for(const id of ['file','batch-seed','batch-size','batch-count','batch-preset','batch-settings','rivalLevel'])el(id).addEventListener('change',reset);
 for(const input of document.querySelectorAll('input.feature,#package'))input.addEventListener('change',reset);
 async function loadBridge(){
  if(!bridgePromise)bridgePromise=(async()=>{
   status.textContent='Loading the randomiser. First use can take a little while…';
   await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cjrtnc.leaningtech.com/4.3/loader.js';script.onload=resolve;script.onerror=()=>reject(Error('Could not load the Java runtime. Check your connection.'));document.head.appendChild(script);});
   await cheerpjInit({version:8,status:'none',javaProperties:['java.awt.headless=true']});
   const decode=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));cheerpOSAddStringFile('/str/PokeRandoZX.jar',decode(ENGINE_JAR));cheerpOSAddStringFile('/str/BaconBridge.jar',decode(BRIDGE_JAR));
   const lib=await cheerpjRunLibrary('/str/PokeRandoZX.jar:/str/BaconBridge.jar');return await lib.BaconBridge;
  })().catch(e=>{bridgePromise=null;throw e;});
  return bridgePromise;
 }
 button.onclick=async()=>{
  if(busy)return;busy=true;button.disabled=true;el('run').disabled=true;locked=Array.from(document.querySelectorAll('input,select,textarea,#batch-new-seed')).map(x=>[x,x.disabled]);for(const [x]of locked)x.disabled=true;
  try{
   if(!session){
    const file=el('file').files[0];if(!file)throw Error('Choose an unrandomized US FireRed 1.1 ROM above.');
    const root=el('batch-seed').value.trim(),size=Number(el('batch-size').value),count=Number(el('batch-count').value),settings=el('batch-settings').value.trim();
    if(!/^\d+$/.test(root)||!Number.isSafeInteger(Number(root))||Number(root)<0)throw Error('Use a whole-number seed between 0 and 9007199254740991.');
    if(!Number.isInteger(size)||size<1||size>100||!Number.isInteger(count)||count<1||count>100)throw Error('Choose 1–100 ROMs per batch and 1–100 batches.');
    if(!settings.startsWith('321')||settings.length<40)throw Error('Choose a preset or paste a compatible 321 settings string.');
    const selected=Array.from(document.querySelectorAll('input.feature:checked'),x=>x.value),options={features:Object.fromEntries(CONFIG.core_features.map(f=>[f.id,selected.includes(f.id)])),rivalLevel:Number(el('rivalLevel').value)};
    const source=new Uint8Array(await file.arrayBuffer()),pool=await LegacyCore.inflate(PAYLOAD);status.textContent='Checking the selected patches…';
    let base=source,report=null;
    if(selected.length){const result=await patchROM(source,selected,pool,options);base=result.rom;report=result.report;if(report.features.some(f=>f.status==='skipped'))throw Error('Some selected patches conflict. Use Check and apply above to read the notes before generating seeds.');}
    // Copier headers are accepted by the patcher; the Java randomizer requires the GBA image itself.
    if(base.length%0x1000000===512)throw Error('Remove the 512-byte copier header before batch randomisation. Ordinary patching still supports it.');
    session={root,size,count,settings,selected,options,base,pool,report,index:0,offset:0,base_sha256:await hash(base),input_sha256:await hash(source)};
   }
   const s=session,bridge=await loadBridge(),entries=[],runs=[],batch=s.index+1,start=s.offset,end=Math.min(s.size,start+10),part=Math.floor(start/10)+1,parts=Math.ceil(s.size/10);cheerpOSAddStringFile('/str/bacon-input.gba',s.base);
   if(downloadURL){URL.revokeObjectURL(downloadURL);downloadURL=null;el('batch-download').replaceChildren();}
   for(let i=start;i<end;i++){
    const index=s.index*s.size+i+1,seed=await batchSeed(s.root,index),name='Baconmon_'+s.root+'_'+String(index).padStart(4,'0'),path='/files/bacon-output.gba';status.textContent='Batch '+batch+'/'+s.count+' · generating ROM '+(i+1)+'/'+s.size+'…';
    const result=await bridge.generateSafe('/str/bacon-input.gba',path,s.settings,seed);if(!result.startsWith('OK:'))throw Error(result.replace(/^ERROR:/,''));
    let rom=new Uint8Array(await (await cjFileBlob(path)).arrayBuffer());
    if(s.selected.includes('rival')){const r=await patchROM(rom,['rival'],s.pool,{rivalLevel:s.options.rivalLevel});if(r.report.features.find(f=>f.id==='rival').status==='skipped')throw Error('The generated rival party could not be checked. No batch was released.');rom=r.rom;}
    entries.push({name:name+'.gba',data:rom});runs.push({file:name+'.gba',seed,sha256:await hash(rom),randomizer_check:result.slice(3)});
    // Spoiler logs are kept in a clearly named folder, never shown during generation.
    entries.push({name:'Spoilers_after_run/'+name+'.log',data:new Uint8Array(await (await cjFileBlob(path+'.log')).arrayBuffer())});await bridge.remove(path);await bridge.remove(path+'.log');
   }
   const manifest={format:'Baconmon batch v1',engine:'UPR-ZX 4.6.0',root_seed:s.root,batch,batches:s.count,roms_per_batch:s.size,part,parts,first_rom:start+1,last_rom:end,settings:s.settings,input_sha256:s.input_sha256,patched_base_sha256:s.base_sha256,features:s.selected,rival_level:s.options.rivalLevel,runs};
   entries.push({name:'Seeds_and_settings.json',data:JSON.stringify(manifest,null,2)});entries.push({name:'Patch_notes.txt',data:s.report?patchNotes(s.report,'Batch base'):'No Baconmon patches selected. Randomization only.'});
   const zip=storedZip(entries);downloadURL=URL.createObjectURL(zip);const link=document.createElement('a');link.href=downloadURL;link.download='Baconmon_'+s.root+'_batch_'+String(batch).padStart(3,'0')+(parts>1?'_part_'+String(part).padStart(3,'0'):'')+'.zip';link.textContent='Download batch '+batch+(parts>1?' · part '+part+'/'+parts:'')+' ZIP';el('batch-download').replaceChildren(link);s.offset=end;
   if(s.offset===s.size){s.index++;s.offset=0;status.textContent='Batch '+batch+' ready.'+(parts>1?' All '+s.size+' ROMs generated across '+parts+' ZIP parts.':'')+' Download it before generating the next batch.';button.textContent=s.index<s.count?'Generate next batch':'Start again';if(s.index===s.count)session=null;}
   else{status.textContent='Batch '+batch+' · part '+part+'/'+parts+' ready. Download it before continuing. '+end+'/'+s.size+' ROMs generated.';button.textContent='Generate next ZIP part';}
  }catch(e){status.textContent=e.message||String(e);}finally{for(const [x,disabled]of locked)x.disabled=disabled;locked=[];busy=false;button.disabled=false;el('run').disabled=false;}
 };
 globalThis.BaconBatch={batchSeed,storedZip,loadBridge};
}
