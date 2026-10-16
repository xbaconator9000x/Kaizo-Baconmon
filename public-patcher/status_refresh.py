"""Independent, guarded FireRed 1.1 lab battle status-icon repair.

Replaces the empty Oak/tutorial status handler with the normal status redraw
followed by the Oak controller completion routine.
No status, party, battle rules, randomizer tables or save data are changed.
Build dependency: keystone-engine (Thumb assembler).
"""
from pathlib import Path
import json,struct,hashlib
R=Path(__file__).resolve().parent;ROOT=R.parent
BASE=0x087f0000;HOOK=0x32be8

def legacy_build(clean):
 from keystone import Ks,KS_ARCH_ARM,KS_MODE_THUMB
 S=json.loads((ROOT/'source/source/work-v09/native/original-symbols.json').read_text())
 # First twelve original bytes include two PC-relative loads. Relocate those
 # loads explicitly, then return to the untouched function at +12.
 assert clean[HOOK:HOOK+12].hex()=='10b514491448007880004018'
 r1=struct.unpack_from('<I',clean,HOOK+0x54)[0]
 r0=struct.unpack_from('<I',clean,HOOK+0x58)[0]
 asm=f'''
 push {{r4,r5,r6,lr}}
 ldr r0, ={S['gBattlersCount']:#x}
 ldrb r5, [r0]
 cmp r5, #4
 bhi done
 movs r4, #0
 ldr r6, ={S['gHealthboxSpriteIds']:#x}
 loop:
 cmp r4, r5
 bhs done
 ldr r0, ={S['gAbsentBattlerFlags']:#x}
 ldrb r0, [r0]
 movs r1, #1
 lsls r1, r4
 tst r0, r1
 bne next
 ldrb r0, [r6,r4]
 cmp r0, #64
 bhs next
 ldr r3, ={S['UpdateStatusIconInHealthbox']|1:#x}
 bl call_r3
 next:
 adds r4, #1
 b loop
 done:
 pop {{r4,r5,r6}}
 pop {{r3}}
 mov lr, r3
 b original
 call_r3:
 bx r3
 .align 2
 original:
 push {{r4,lr}}
 ldr r1, ={r1:#x}
 ldr r0, ={r0:#x}
 ldrb r0, [r0]
 lsls r0, #2
 adds r0, r0, r1
 ldr r3, ={0x08000000+HOOK+12+1:#x}
 bx r3
 .ltorg
 '''
 code=bytes(Ks(KS_ARCH_ARM,KS_MODE_THUMB).asm(asm,addr=BASE)[0])
 assert len(code)<=256
 hook=bytes.fromhex('014b1847c046c046')+struct.pack('<I',BASE|1)
 return code,hook,asm

def build(clean):
 from keystone import Ks,KS_ARCH_ARM,KS_MODE_THUMB
 S=json.loads((ROOT/'source/source/work-v09/native/original-symbols.json').read_text())
 asm=f"""
 push {{r4,lr}}
 ldr r4, ={S['gActiveBattler']:#x}
 ldrb r0, [r4]
 ldr r3, ={S['IsBattleSEPlaying']|1:#x}
 bl call_r3
 lsls r0, #24
 cmp r0, #0
 bne done
 ldrb r0, [r4]
 ldr r1, ={S['gHealthboxSpriteIds']:#x}
 ldrb r0, [r1,r0]
 ldr r3, ={S['UpdateStatusIconInHealthbox']|1:#x}
 bl call_r3
 ldr r3, ={S['OakOldManBufferExecCompleted']|1:#x}
 bl call_r3
 done:
 pop {{r4}}
 pop {{r0}}
 bx r0
 call_r3:
 bx r3
 .ltorg
 """
 code=bytes(Ks(KS_ARCH_ARM,KS_MODE_THUMB).asm(asm,addr=BASE)[0])
 hook=bytes.fromhex('014b1847c046c046')+struct.pack('<I',BASE|1)
 assert len(code)<=256
 return code,hook,asm

OAK_HOOK=0xeab68

def configure(groups,blob,C,F,T):
 code,hook,asm=build(C);oldcode,oldhook,_=legacy_build(C)
 (R/'status_refresh.s').write_text(asm.strip()+'\n')
 g=dict(id='status',name='Battle status display',detail='Fix missing status icons in the lab rival battle, including paralysis, poison, burn, sleep and freeze.',records=[],guards=[])
 def record(a,after,n=None,legacy=None):
  n=n or len(after);after=after.ljust(n,b'\xff');before=C[a:a+n]
  assert F[a:a+n]==before and T[a:a+n]==before
  accepted=[before,after]+([legacy.ljust(n,b'\xff')] if legacy is not None else [])
  g['records'].append(dict(offset=a,length=n,data=blob(after),guard_offset=a,guard_length=n,accepted=sorted(set(hashlib.sha256(x).hexdigest() for x in accepted)),mask=[],preserve=[]))
 # Remove the earlier ordinary-controller safeguard when upgrading that build.
 record(HOOK,C[HOOK:HOOK+12],legacy=oldhook)
 record(OAK_HOOK,hook)
 record(BASE-0x08000000,code,256,legacy=oldcode)
 for a,b in [(HOOK+12,HOOK+0x64),(0x49948,0x49bf8)]:
  assert C[a:b]==F[a:b]==T[a:b]
  g['guards'].append(dict(offset=a,length=b-a,accepted=[hashlib.sha256(C[a:b]).hexdigest()]))
 groups['status']=g
 return [(HOOK,HOOK+12),(OAK_HOOK,OAK_HOOK+12)]

if __name__=='__main__':
 c=(ROOT/'patch-inputs/Pokemon - Fire Red Version (U) (V1.1).gba').read_bytes()
 code,hook,asm=build(c);print(len(code),hook.hex());(R/'status_refresh.s').write_text(asm.strip()+'\n')
