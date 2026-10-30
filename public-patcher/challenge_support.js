/* GPL-3.0-or-later. Babymon-only saved runner identity and terminal attempt guard. */
(function(root){
 'use strict';
 const P=CHALLENGE_NATIVE,decode=s=>Uint8Array.from(s.match(/../g)||[],x=>parseInt(x,16));
 const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 function apply(source){
  if(source.length<0x1000000||String.fromCharCode(...source.slice(0xac,0xb0))!=='BPRE'||source[0xbc]!==1)throw Error('Babymon restrictions require US FireRed Rev 1.');
  if(new DataView(source.buffer,source.byteOffset,source.byteLength).getUint32(0xB0FFF0,true)!==1)throw Error('Babymon evolution configuration is missing.');
  for(const g of P.guards)if(!same(source.slice(g.offset,g.offset+g.before.length/2),decode(g.before)))throw Error('Babymon native dependency differs at 0x'+g.offset.toString(16));
  const code=decode(P.code),installed=source.slice(P.base,P.base+code.length);
  if(!installed.every(x=>x===255)&&!same(installed,code))throw Error('Babymon restriction reservation is occupied.');
  for(const r of P.records){const b=source.slice(r.offset,r.offset+r.before.length/2);if(!same(b,decode(r.before))&&!same(b,decode(r.after)))throw Error('Babymon restriction hook differs at 0x'+r.offset.toString(16));}
  const rom=source.slice(),writes=[];
  for(const [offset,data] of [[P.base,code],...P.records.map(r=>[r.offset,decode(r.after)])])if(!same(rom.slice(offset,offset+data.length),data)){rom.set(data,offset);writes.push({feature:'babymon_restrictions',offset,length:data.length});}
  return {rom,writes,version:1};
 }
 root.ChallengeSupport={apply};
 if(typeof module!=='undefined')module.exports=root.ChallengeSupport;
})(globalThis);
