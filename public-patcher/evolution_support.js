/* GPL-3.0-or-later. Optional guarded native evolution integration. */
(function(root) {
  'use strict';
  const P=EVOLUTION_NATIVE, decode=s=>Uint8Array.from(s.match(/../g)||[],x=>parseInt(x,16));
  const records=P.records.map(r=>{
    if(!r.segments)return {...r,before:decode(r.before),after:decode(r.after)};
    const before=new Uint8Array(r.length).fill(r.before_fill),after=new Uint8Array(r.length).fill(r.after_fill);
    for(const [offset,data] of r.segments)after.set(decode(data),offset);
    return {...r,before,after};
  });
  const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
  function installedRecord(rom,r) {
    const bytes=rom.slice(r.offset,r.offset+r.after.length);
    if(r.offset===P.base)bytes.set(r.after.slice(0xfff0,0xfff4),0xfff0);
    return same(bytes,r.after);
  }
  function normalize(bytes,base,rom) {
    for(const r of records) {
      if(r.offset+r.after.length<=base || r.offset>=base+bytes.length || !installedRecord(rom,r))continue;
      const start=Math.max(base,r.offset),end=Math.min(base+bytes.length,r.offset+r.before.length);
      bytes.set(r.before.slice(start-r.offset,end-r.offset),start-base);
    }
  }
  function apply(source,{tiered=false}={}) {
    if(source.length<0x1000000 || String.fromCharCode(...source.slice(0xac,0xb0))!=='BPRE'||source[0xbc]!==1)
      throw Error('Evolution support requires an unheadered US FireRed Rev 1 ROM.');
    const rom=source.slice(),v=new DataView(rom.buffer,rom.byteOffset,rom.byteLength),writes=[];
    const inside=(a,n)=>Number.isInteger(a)&&a>=0&&a+n<=rom.length;
    const pointer=a=>{if(!inside(a,4))throw Error('Evolution map pointer is outside the ROM.');const p=v.getUint32(a,true)-0x08000000;if(!inside(p,4))throw Error('Evolution map layout is not supported.');return p;};
    function write(offset,data) {
      if(!inside(offset,data.length))throw Error('Evolution write is outside the ROM.');
      if(!same(rom.slice(offset,offset+data.length),data)){rom.set(data,offset);writes.push({feature:'evolution',offset,length:data.length});}
    }
    const word=n=>{const b=new Uint8Array(4);new DataView(b.buffer).setUint32(0,n,true);return b;};
    const half=n=>Uint8Array.of(n&255,n>>>8);
    for(const r of records) {
      if(!same(rom.slice(r.offset,r.offset+r.before.length),r.before)&&!installedRecord(rom,r))
        throw Error('Evolution hook differs at 0x'+r.offset.toString(16)+'. No evolution changes were applied.');
    }
    // Locate the same map bank root used by UPR, then follow actual event pointers.
    const prefix=decode('80180068890b091808687047');let found=-1;
    for(let i=0;i<0x100000-prefix.length;i++)if(same(rom.slice(i,i+prefix.length),prefix)){found=i;break;}
    if(found<0)throw Error('Evolution support cannot locate the map banks.');
    const banks=pointer(found+12);
    function mapEvents([bank,map]){const maps=pointer(banks+bank*4);const header=pointer(maps+map*4);return pointer(header+4);}
    const lab=mapEvents(P.maps.lab),bg=pointer(lab+16),trade=mapEvents(P.maps.trade),objects=pointer(trade+4);
    let labSlot=-1,tradeSlot=-1;
    for(let i=0;i<rom[lab+3];i++){const a=bg+i*12;if(v.getUint16(a,true)===2&&v.getUint16(a+2,true)===1)labSlot=a+8;}
    for(let i=0;i<rom[trade];i++){const a=objects+i*24;if(v.getUint16(a+4,true)===10&&v.getUint16(a+6,true)===2)tradeSlot=a+16;}
    if(labSlot<0||tradeSlot<0)throw Error('The lab terminal or Celadon trade attendant could not be verified.');
    for(const [a,expected,replacement] of [[labSlot,0x08169ee0,P.scripts.clock],[tradeSlot,0x081a8d7a,P.scripts.trade],[P.shop_pointer_offset,P.shop_original,0x08000000+P.base+0xa000]])
      if(![expected,replacement].includes(v.getUint32(a,true)))throw Error('An evolution service script was modified; its changes were preserved.');
    const items=pointer(0x1c8),itemChanges=[];
    for(const item of [...P.stones,...P.trade_items]) {
      const a=items+item*44;
      if(!inside(a,44)||v.getUint16(a+14,true)!==item)throw Error('Evolution item table does not match.');
      itemChanges.push([a+16,half(2100)]);
      if(P.trade_items.includes(item)){itemChanges.push([a+27,Uint8Array.of(1)],[a+28,word(P.item_field_handler)]);}
    }
    // Every guard above succeeds before returning any mutated image.
    for(const r of records){if(r.offset===P.base&&installedRecord(rom,r))continue;write(r.offset,r.after);}
    write(labSlot,word(P.scripts.clock));write(tradeSlot,word(P.scripts.trade));
    write(P.shop_pointer_offset,word(0x08000000+P.base+0xa000));
    for(const [a,d] of itemChanges)write(a,d);
    write(P.base+0xfff0,word(tiered?1:0));
    return {rom,writes,time_variable:P.time_variable,tiered};
  }
  const api={apply,normalize};root.EvolutionSupport=api;
  if(typeof module!=='undefined')module.exports=api;
  if(typeof patchROM==='function') {
    const original=patchROM;
    patchROM=async function(source,enabled,pool,options={}) {
      const wanted=enabled.includes('evolution');
      const result=await original(source,enabled.filter(id=>id!=='evolution'),pool,options);
      let row=result.report.features.find(x=>x.id==='evolution');
      if(!row){row={id:'evolution',name:'Evolution support (beta)',detail:'Celadon trade help, direct-use evolution items and a lab Day/Night clock.'};result.report.features.push(row);}
      row.status='not_selected';row.reason='Not selected.';
      if(!wanted && installedRecord(source,records[0])) {
        row.status='existing';row.reason='Previously installed evolution support was retained. Use its Undo BPS patch to remove it.';
      }
      if(wanted) {
        try {
          const header=result.report.input.copier_header_bytes||0;
          const r=apply(result.rom.slice(header),{tiered:options.ruleset==='babymon'});
          result.rom.set(r.rom,header);result.report.writes.push(...r.writes.map(x=>({...x,offset:x.offset+header})));
          row.status=r.writes.length?'applied':'existing';row.reason='Native evolution services installed. Day is the default; use the left lab computer to change it.';
          result.report.evolution={native:'v1',time_variable:r.time_variable,tiered:r.tiered,validation:'beta: native execution checked; full playthrough pending'};
          result.report.output_sha256=await hash(result.rom);result.report.changed=result.report.output_sha256!==result.report.source_sha256;
        }catch(e){row.status='skipped';row.reason=e.message;}
      }
      return result;
    };
    root.BaconPublic.patchROM=patchROM;
  }
})(globalThis);
