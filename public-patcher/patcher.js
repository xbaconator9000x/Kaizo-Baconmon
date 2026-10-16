const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
const inside=(b,a,n)=>Number.isSafeInteger(a)&&Number.isSafeInteger(n)&&a>=0&&n>=0&&a+n<=b.length;
const u32=(b,a)=>inside(b,a,4)?new DataView(b.buffer,b.byteOffset,b.byteLength).getUint32(a,true):null;
const u16=(b,a)=>inside(b,a,2)?new DataView(b.buffer,b.byteOffset,b.byteLength).getUint16(a,true):null;
const hash=bytes=>LegacyCore.hash(bytes);
function dataAt(pool,id){const [a,n]=CONFIG.pool[id];return pool.subarray(a,a+n);}
function hasFaster(b){return u32(b,0x55080)===0x08f00001&&u32(b,0x6a418)===0x08f00201;}
function hasSupport(b){return u32(b,0x2d4f48)===0x08747a00&&u32(b,0x2d4f18)===0x0872ff40;}
async function engineOK(b){const e=CONFIG.engine,d=Uint8Array.from(b.subarray(e.start,e.end));for(const [a,z]of e.mask)if(z>e.start)d.fill(0,Math.max(a,e.start)-e.start,z-e.start);return e.accepted.includes(await hash(d));}
async function layoutInfo(b){let matched=0;for(const a of CONFIG.layout.anchors)if(inside(b,a.offset,a.length)&&await hash(b.subarray(a.offset,a.offset+a.length))===a.sha256)matched++;return {matched,total:CONFIG.layout.anchors.length,verified:matched>=CONFIG.layout.minimum_matches};}
async function guardOK(b,g,checkStates=true){
 const base=g.guard_offset??g.offset,n=g.guard_length??g.length;if(!inside(b,base,n))return false;
 const d=Uint8Array.from(b.subarray(base,base+n));
 for(const id of g.toggle_states||[]){const t=CONFIG.switches[id];if((checkStates||t.shared_required)&&(!inside(b,t.offset,t.length)||!t.accepted.includes(await hash(b.subarray(t.offset,t.offset+t.length)))))return false;}
 for(const at of [...(g.mask||[]),...(g.toggle_mask||[])])d[at]=0;
 if(g.gift_mask?.length&&b[0xff01e3]===0x44){if(!inside(b,0xff01e4,4)||u16(b,0xff01e4)<1||u16(b,0xff01e4)>511||u16(b,0xff01e6)<1||u16(b,0xff01e6)>999)return false;for(const at of g.gift_mask)d[at]=0;}
 return g.accepted.includes(await hash(d));
}
async function patchROM(source,enabled,pool,options={}){
 const rivalLevel=options.rivalLevel??8;
 if(!Number.isInteger(rivalLevel)||rivalLevel<1||rivalLevel>100)throw Error('Lab rival level must be a whole number from 1 to 100.');
 const codeAt=at=>String.fromCharCode(...source.slice(at+0xac,at+0xb0));
 const headerAt=at=>inside(source,at,0xc0)&&source[at+0xb2]===0x96&&eq(source.slice(at+4,at+20),CONFIG.layout.logo);
 if(inside(source,512,0xc0)&&((headerAt(512)&&!headerAt(0))||(codeAt(512)==='BPRE'&&codeAt(0)!=='BPRE'))){
  const result=await patchROM(source.slice(512),enabled,pool,options),rom=Uint8Array.from(source);rom.set(result.rom,512);
  result.report.source_sha256=await hash(source);result.report.output_sha256=await hash(rom);
  for(const write of result.report.writes)write.offset+=512;
  for(const row of result.report.features)if(row.conflicts)row.conflicts=row.conflicts.map(a=>a+512);
  result.report.input.size=source.length;result.report.input.copier_header_bytes=512;
  result.report.warnings.push('The 512-byte copier header was preserved. Report offsets include it.');
  return {rom,report:result.report};
 }
 if(!source.length)throw Error('The selected file is empty. Choose a ROM file.');
 if(source[0]===0x50&&source[1]===0x4b&&source[2]===3&&source[3]===4)throw Error('Extract the ZIP and choose the ROM inside it.');
 if(eq(Array.from(source.slice(0,8)),[137,80,78,71,13,10,26,10]))throw Error('This is an image or save state. Choose the ROM file.');
 if(await hash(pool)!==CONFIG.pool_sha256)throw Error('The patch data is damaged. Download the patcher again.');
 const out=Uint8Array.from(source),selected=new Set(enabled.includes('package')?CONFIG.groups.map(g=>g.id):enabled),report={project:'Kaizo Baconmon',patcher:'1.11',source_sha256:await hash(source),output_sha256:null,features:[],writes:[],warnings:[]};
 const legacy=enabled.includes('package')||enabled.includes('core'),featureOptions=Object.fromEntries(CONFIG.core_features.map(f=>[f.id,options.features?options.features[f.id]===true:(legacy||enabled.includes(f.id))]));
 if(options.tutor===false)featureOptions.relearner=false;
 if(Object.values(featureOptions).some(Boolean)||selected.has('text')){selected.add('core');}
 const marker=CONFIG.switches.find(t=>t.feature==='modern'&&t.length===4&&t.off.join(',')==='0,32,112,71');
 if(options.features&&marker&&(eq(source.slice(marker.offset,marker.offset+4),Uint8Array.from(marker.on))||eq(source.slice(marker.offset,marker.offset+4),Uint8Array.from(marker.off))))selected.add('core');
 if(selected.has('core')||selected.has('nurse'))selected.add('support');
 const engine=await engineOK(source),layout=await layoutInfo(source);let core=false,support=false;
 report.input={game_code:codeAt(0),revision:source[0xbc]??null,size:source.length,layout_verified:layout.verified,layout_matches:layout.matched,layout_checks:layout.total,known_engine:engine};
 if(codeAt(0)!=='BPRE'||source[0xbc]!==1||!engine||!layout.verified)report.warnings.push('This ROM differs from the usual FireRed 1.1 layout or engine. Some changes may not work. Each selected feature was checked separately; check the patch notes/changelog below to confirm what was applied or skipped.');
 if(source.length<0x1000000||source.length>0x2000000)report.warnings.push('This ROM has an unusual size. Only complete, matching patch locations can be changed; the file size is preserved.');
 for(const group of CONFIG.groups){
  const row={id:group.id,name:group.id==='rival'?'Lab rival level':group.name,detail:group.detail,status:'not_selected',reason:'Not selected.'};report.features.push(row);
  const disableFaster=group.id==='faster'&&!selected.has('faster')&&hasFaster(out)&&(options.features!==undefined||enabled.includes('core')||enabled.includes('support'));
  if(!selected.has(group.id)&&!disableFaster)continue;
  if(group.id==='support'&&hasSupport(out)){support=true;row.status='existing';row.reason='Existing asset relocations kept.';continue;}
  if(group.id==='faster'&&selected.has('faster')&&hasFaster(out)){row.status='existing';row.reason='Existing Faster FireRed features kept.';continue;}
  if(group.requires_layout&&!layout.verified){row.status='skipped';row.reason='The required FireRed layout could not be verified from the code. No writes were made for this feature.';continue;}
  if(group.needs_support&&!support){row.status='skipped';row.reason='Required map or script support could not be installed.';continue;}
  if(group.needs_core&&!core){row.status='skipped';row.reason='Needs the Baconmon rules and tools, which were not installed.';continue;}
  if(group.id==='rival'){
   const normalizer=CONFIG.rival_normalizer,hook=out.slice(normalizer.offset,normalizer.offset+normalizer.off.length);
   if(!eq(hook,Uint8Array.from(normalizer.on))&&!eq(hook,Uint8Array.from(normalizer.off))){row.status='skipped';row.reason='The rival party creation hook differs. Levels were left alone.';continue;}
   const changes=[];let problem=null;
   for(const id of [326,327,328]){
    const at=CONFIG.trainer_table+id*40,p=u32(out,at+36)-0x08000000;
    if(out[at+32]!==1||p<0||p+8>out.length||out[p+2]<1||out[p+2]>100){problem='The rival party layout is different. Rival levels were left alone.';break;}
    if(out[p+2]!==rivalLevel)changes.push([p+2,out.slice(p+2,p+3)]);
   }
   if(problem){row.status='skipped';row.reason=problem;continue;}
   for(const [at,before]of changes){out[at]=rivalLevel;report.writes.push({feature:group.id,offset:at,before:Array.from(before),after:[rivalLevel]});}
   row.status=changes.length?'applied':'existing';row.detail='Set the three lab rival parties to level '+rivalLevel+' without changing their species or moves.';row.reason=changes.length?'Lab rival parties set to level '+rivalLevel+'.':'Lab rival parties are already level '+rivalLevel+'.';continue;
  }
  const failed=[];
  // Preflight the entire feature before making any of its writes.
  for(const g of group.guards)if(!await guardOK(out,g,group.id!=='core'))failed.push(g.offset);
  for(const r of group.records){
   if(r.text_pointer_site!==undefined){const pointer=u32(out,r.text_pointer_site);if(pointer===null||pointer<0x08000000||!inside(out,pointer-0x08000000,1))failed.push(r.text_pointer_site);}
   if(!(group.id==='core'&&r.activation_owner)&&!await guardOK(out,r,group.id!=='core'))failed.push(r.offset);
  }
  if(failed.length){row.status='skipped';row.reason='A script, hook or required space is already changed. The whole feature was left alone.';row.conflicts=[...new Set(failed)];continue;}
  let count=0;
  const preserve=hasFaster(out)||hasSupport(source);
  for(const r of group.records){
   if(group.id==='core'&&r.activation_owner)continue;
   const replacement=dataAt(pool,disableFaster?r.off_data:r.data).slice();
   if(preserve)for(const at of r.preserve||[])replacement[at]=out[r.offset+at];
   if(disableFaster)for(const t of CONFIG.switches)for(let i=Math.max(r.offset,t.offset);i<Math.min(r.offset+r.length,t.offset+t.length);i++)replacement[i-r.offset]=out[i];
   if(group.id==='core')for(const t of CONFIG.switches)for(let i=Math.max(r.offset,t.offset);i<Math.min(r.offset+r.length,t.offset+t.length);i++)replacement[i-r.offset]=out[i];
   const before=out.slice(r.offset,r.offset+r.length);
   if(eq(before,replacement))continue;
   out.set(replacement,r.offset);count++;report.writes.push({feature:group.id,offset:r.offset,length:r.length});
  }
  row.status=count?'applied':'existing';row.reason=count?'Applied.':'Already present.';row.write_count=count;
  if(disableFaster){row.reason='Optional Faster FireRed changes disabled.';if(!selected.has('core'))for(const t of CONFIG.switches)if(group.records.some(r=>r.offset<t.offset+t.length&&r.offset+r.length>t.offset)){out.set(Uint8Array.from(t.off),t.offset);report.writes.push({feature:'faster',offset:t.offset,length:t.length});}}
  if(group.id==='support')support=true;
  if(group.id==='core')core=true;
 }
 if(core||report.features.some(r=>r.id==='rival'&&['applied','existing'].includes(r.status))){
  const rivalApplied=report.features.some(r=>r.id==='rival'&&['applied','existing'].includes(r.status));
  const n=CONFIG.rival_normalizer,before=out.slice(n.offset,n.offset+n.off.length),bytes=Uint8Array.from(rivalApplied&&rivalLevel===8&&(core||eq(before,Uint8Array.from(n.on)))?n.on:n.off);
  if(eq(before,Uint8Array.from(n.on))||eq(before,Uint8Array.from(n.off))){if(!eq(before,bytes)){out.set(bytes,n.offset);report.writes.push({feature:'rival_runtime',offset:n.offset,before:Array.from(before),after:Array.from(bytes)});}}
  else report.warnings.push('The rival runtime hook differs; a custom rival level cannot be guaranteed.');
 }
 for(const f of CONFIG.core_features){
  const on=featureOptions[f.id],row={id:f.id,name:f.name,detail:f.detail,enabled:on,status:'not_selected',reason:'Not selected.'};report.features.push(row);
  if(!core){if(on){row.status='skipped';row.reason='The shared support could not be installed.';}continue;}
  const states=CONFIG.switches.filter(t=>t.feature===f.id),failed=[];
  for(const t of states)if(!inside(source,t.offset,t.length)||!t.accepted.includes(await hash(source.subarray(t.offset,t.offset+t.length))))failed.push(t.offset);
  for(const r of CONFIG.groups.find(g=>g.id==='core').records.filter(r=>r.activation_owner===f.id))if(!await guardOK(source,r,false))failed.push(r.offset);
  if(failed.length){
   row.status=on?'skipped':'not_selected';row.reason=on?'A hook or script for this feature differs. It was left unchanged; other matching features can still be applied.':'Not selected. Existing custom hooks were left unchanged.';row.conflicts=[...new Set(failed)];
   // Newly installed category helpers must remain callable if Modern was
   // skipped. Preserve an existing helper, otherwise use Classic categories.
   if(f.id==='modern')for(const t of states)if(t.shared_required&&t.length===4&&eq(t.off,[0,32,112,71])&&source.slice(t.offset,t.offset+4).every(x=>x===255)){out.set(Uint8Array.from(t.off),t.offset);report.writes.push({feature:'core',offset:t.offset,length:4});}
   continue;
  }
  let changed=false;
  for(const t of states){
   const bytes=Uint8Array.from(on?t.on:t.off),before=out.slice(t.offset,t.offset+t.length);
   if(!eq(source.slice(t.offset,t.offset+t.length),bytes))changed=true;
   if(!eq(before,bytes)){out.set(bytes,t.offset);report.writes.push({feature:f.id,offset:t.offset,length:t.length,enabled:on});}
  }
  row.status=changed?'applied':'existing';row.reason=on?'Enabled.':'Disabled.';
 }
 if(core&&CONFIG.core_features.some(f=>!featureOptions[f.id]))report.warnings.push('Custom feature selection: the Nuz-guide describes the standard full package. Feature changes are tested for new runs; keep an existing run on its matching ROM.');

 report.output_sha256=await hash(out);report.changed=report.output_sha256!==report.source_sha256;
 if(report.features.some(r=>r.status==='skipped'))report.warnings.push('This is a partial patch. Only the features marked Applied or Already present are included. The Nuz-guide describes the full Baconmon rules and features.');
 report.warnings.push('Keep your original ROM and save. Continue from a normal in-game save, not an old save state.');
 return {rom:out,report};
}
let CRC_TABLE;
function crc32(b){if(!CRC_TABLE){CRC_TABLE=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);CRC_TABLE[n]=c;}}let c=0xffffffff;for(let i=0;i<b.length;i++)c=(c>>>8)^CRC_TABLE[(c^b[i])&255];return(c^0xffffffff)>>>0;}
function makeBPS(source,target,metadata){
 const meta=new TextEncoder().encode(metadata),out=new Uint8Array(target.length*2+meta.length+128);let pos=0;
 const put=b=>{out.set(b,pos);pos+=b.length;};const number=n=>{while(true){let v=n%128;n=Math.floor(n/128);if(!n){out[pos++]=v|128;return;}out[pos++]=v;n--;}};const word=n=>{out[pos++]=n&255;out[pos++]=(n>>>8)&255;out[pos++]=(n>>>16)&255;out[pos++]=n>>>24;};
 put([66,80,83,49]);number(source.length);number(target.length);number(meta.length);put(meta);
 let i=0;while(i<target.length){const same=i<source.length&&source[i]===target[i];let z=i+1;if(same){while(z<target.length&&z<source.length&&source[z]===target[z])z++;number((z-i-1)*4);}else{while(z<target.length){if(z<source.length&&source[z]===target[z]&&z+8<=target.length&&eq(source.subarray(z,z+8),target.subarray(z,z+8)))break;z++;}number((z-i-1)*4+1);put(target.subarray(i,z));}i=z;}
 word(crc32(source));word(crc32(target));word(crc32(out.subarray(0,pos)));return out.slice(0,pos);
}
function patchNotes(report,file){
 const title='Kaizo Baconmon — Patch notes';let text=title+'\nDeveloped by xbaconator9000x\n\nInput: '+file+'\n\n';
 if(report.warnings?.length)text+='NOTICES\n'+report.warnings.map(w=>'- '+w).join('\n')+'\n\n';
 for(const [status,label]of [['applied','APPLIED'],['existing','ALREADY PRESENT'],['skipped','SKIPPED'],['not_selected','NOT SELECTED']]){
  const rows=report.features.filter(r=>r.status===status);if(!rows.length)continue;text+=label+'\n';for(const r of rows)text+='- '+r.name+': '+r.reason+'\n'+(['applied','existing'].includes(status)?'  '+r.detail+'\n':'');text+='\n';
 }
 text+='Original SHA-256: '+report.source_sha256+'\nPatched SHA-256: '+report.output_sha256+'\n\nThe undo patch restores this exact original file. It does not change your save.\n';return text;
}
globalThis.BaconPublic={patchROM,makeBPS,patchNotes,hash};
if(typeof document!=='undefined'){
 const button=document.getElementById('run'),status=document.getElementById('status'),downloads=document.getElementById('downloads'),reportBox=document.getElementById('report');let urls=[];
 function link(data,name,label,type='application/octet-stream'){const url=URL.createObjectURL(new Blob([data],{type}));urls.push(url);const a=document.createElement('a');a.href=url;a.download=name;a.textContent=label;downloads.appendChild(a);}
 const packageBox=document.getElementById('package'),levelBox=document.getElementById('rivalLevel');
 const optionIds=CONFIG.groups.filter(g=>!['core','support'].includes(g.id)).map(g=>g.id).concat(CONFIG.core_features.map(f=>f.id));
 const featureBoxes=()=>optionIds.map(id=>document.getElementById(id==='relearner'?'tutor':'feature-'+id));
 if(packageBox){
  function sync(changed){
   const box=id=>document.getElementById(id==='relearner'?'tutor':'feature-'+id);
   levelBox.disabled=!box('rival').checked;
   const states=featureBoxes().map(e=>e.checked);packageBox.checked=states.every(Boolean);packageBox.indeterminate=states.some(Boolean)&&!packageBox.checked;
  }
  packageBox.onchange=()=>{for(const box of featureBoxes())box.checked=packageBox.checked;sync();};
  for(const box of featureBoxes())box.onchange=()=>sync(box.value);
  sync();
 }
 button.onclick=async()=>{
  const file=document.getElementById('file').files[0];if(!file){status.textContent='Choose a ROM first.';return;}
  const selected=Array.from(document.querySelectorAll('input.feature:checked'),e=>e.value);if(!selected.length){status.textContent='Choose at least one feature.';return;}
  button.disabled=true;downloads.replaceChildren();for(const u of urls)URL.revokeObjectURL(u);urls=[];reportBox.hidden=true;status.textContent='Checking ROM…';await new Promise(r=>setTimeout(r,30));
  try{
   const source=new Uint8Array(await file.arrayBuffer()),pool=await LegacyCore.inflate(PAYLOAD),{rom,report}=await patchROM(source,selected,pool,{features:Object.fromEntries(CONFIG.core_features.map(f=>[f.id,selected.includes(f.id)])),rivalLevel:Number(document.getElementById('rivalLevel').value)});
   const stem=file.name.replace(/\.(gba|agb|bin|rom)$/i,'')+'_Baconmon',notes=patchNotes(report,file.name);
   if(report.changed){link(rom,stem+'.gba','Patched ROM');link(makeBPS(source,rom,'Kaizo Baconmon'),stem+'.bps','BPS patch');link(makeBPS(rom,source,'Undo Kaizo Baconmon patch'),stem+'_Undo.bps','Undo patch');}
   link(notes,stem+'_Patch_Notes.txt','Patch notes','text/plain');link(JSON.stringify(report,null,2),stem+'_Report.json','Detailed report','application/json');reportBox.textContent=notes;reportBox.hidden=false;
   status.textContent=report.changed?(report.features.some(r=>r.status==='skipped')?'Done. Some features were skipped; see the notes.':'Done. Your patched copy is ready.'):'No changes made. See the notes.';
  }catch(e){status.textContent=e.message;}finally{button.disabled=false;}
 };
}
