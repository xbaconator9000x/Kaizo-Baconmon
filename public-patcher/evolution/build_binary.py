"""Build optional FireRed Rev 1 hooks from the supplied reference ROM.

Requires ziglang, keystone-engine. Emits patch data only, never a ROM.
"""
from pathlib import Path
import json,struct,re,subprocess,tempfile,sys,hashlib
from keystone import Ks,KS_ARCH_ARM,KS_MODE_THUMB
HERE=Path(__file__).resolve().parent
BASE=0xB00000
TRADE_ITEMS=[187,192,193,199,201,218]
STONES=[93,94,95,96,97,98]

def build(rom,source):
    b=Path(rom).read_bytes()
    if b[0xac:0xb0]!=b'BPRE' or b[0xbc]!=1:raise ValueError('US Rev 1 required')
    if set(b[BASE:BASE+65536])!={255}:raise ValueError('Native reservation is occupied')
    records=[]
    def write(off,data):
        before=b[off:off+len(data)]
        if len(before)!=len(data):raise ValueError('Out of range')
        records.append(dict(offset=off,before=before.hex(),after=data.hex()))
    with tempfile.TemporaryDirectory() as t:
        t=Path(t);(t/'link.ld').write_text('SECTIONS { . = 0x08B00000; .text : { *(.text*) *(.rodata*) } /DISCARD/ : { *(.ARM.exidx*) *(.ARM.extab*) *(.comment*) *(.note*) } }')
        elf=t/'native.elf'
        subprocess.run([sys.executable,'-m','ziglang','cc','-target','thumb-freestanding-eabi','-mcpu=arm7tdmi','-Os','-g','-ffreestanding','-fno-builtin','-nostdlib','-Wl,-T,'+str(t/'link.ld'),'-Wl,--no-gc-sections','-Wl,-e,BaconBinaryResolve',str(HERE/'binary_runtime.c'),str(HERE/'bacon_evolution_core.c'),'-o',str(elf)],check=True)
        raw=elf.read_bytes();shoff=struct.unpack_from('<I',raw,32)[0];shsize,shnum=struct.unpack_from('<HH',raw,46)
        sections=[struct.unpack_from('<10I',raw,shoff+i*shsize) for i in range(shnum)]
        text=next(s for s in sections if s[3]==0x08B00000)
        code=raw[text[4]:text[4]+text[5]]
        symbols={name:int(addr,16) for addr,name in re.findall(r'^\s*\d+:\s+([0-9a-fA-F]+)\s+\d+\s+FUNC\s+GLOBAL.*?\s+(Bacon\w+)$',subprocess.check_output(['readelf','-sW',str(elf)],text=True),re.M)}
    block=bytearray(65536);block[:len(code)]=code
    manifest=json.loads((HERE.parent/'babymon_manifest.json').read_text())
    for p in manifest:block[0xfc00+p['internal_id']]=p['tier']
    # Relocated, extended item-effect pointer table. Unused entries remain null.
    effects=struct.unpack_from('<I',b,0x42e50)[0]-0x8000000
    block[0x8000:0x8000+166*4]=b[effects:effects+166*4]
    moon=struct.unpack_from('<I',b,effects+(94-13)*4)[0]
    for item in TRADE_ITEMS:struct.pack_into('<I',block,0x8000+(item-13)*4,moon)
    # Script assembler: all pointers resolve inside this reserved block.
    table={}
    for line in (Path(source)/'charmap.txt').read_text().splitlines():
        match=re.match(r"'(.+)'\s*=\s*([0-9A-Fa-f]{2})\s*$",line)
        if match:table[match[1]]=int(match[2],16)
    def text(s):
        return bytes(0xfe if c=='\n' else table[c] for c in s)+b'\xff'
    script=bytearray();labels={};fixups=[]
    def label(n):labels[n]=0x08000000+BASE+0x9000+len(script)
    def emit(*values):script.extend(values)
    def pointer(n):fixups.append((len(script),n));script.extend(b'\0'*4)
    def msg(n):emit(0x0f,0);pointer(n);emit(0x09,5)
    def cmp(value):emit(0x21,0x0d,0x80,value,0)
    def eq(n):emit(6,1);pointer(n)
    def call(addr):emit(0x23);script.extend(struct.pack('<I',addr))
    label('trade');emit(0x6a,0x5a);call(symbols['BaconBinaryCheckTrade']);cmp(0);eq('none');msg('offer');cmp(0);eq('done');emit(0x68);call(symbols['BaconBinaryStartTrade']);cmp(0);eq('done');emit(0x27)
    label('done');emit(0x6c,2)
    label('none');emit(0x0f,0);pointer('no_evo');emit(9,4,0x6c,2)
    label('clock');emit(0x69);msg('day');cmp(0);eq('ask_night');emit(0x16,0xd0,0x40,0,0);emit(0x0f,0);pointer('day_set');emit(9,4,0x6b,2)
    label('ask_night');msg('night');cmp(0);eq('clock_done');emit(0x16,0xd0,0x40,1,0);emit(0x0f,0);pointer('night_set');emit(9,4)
    label('clock_done');emit(0x6b,2)
    for name,value in {
        'offer':'I can help your trade POKéMON\nevolve! Shall I help?',
        'no_evo':'Your lead POKéMON does not need\nmy help to evolve right now.',
        'day':'Evolution clock: set DAY?\nFriendship is still required.',
        'night':'Set NIGHT instead? Choose NO\nto leave the clock unchanged.',
        'day_set':'The evolution clock is now DAY.',
        'night_set':'The evolution clock is now NIGHT.',
    }.items():label(name);script.extend(text(value))
    for off,name in fixups:struct.pack_into('<I',script,off,labels[name])
    block[0x9000:0x9000+len(script)]=script
    stock=[80,132]+STONES+TRADE_ITEMS+[0]
    block[0xa000:0xa000+len(stock)*2]=struct.pack('<'+'H'*len(stock),*stock)
    block[0xffe0:0xffe8]=b'BACONEV1'
    write(BASE,block)
    hook=bytes(Ks(KS_ARCH_ARM,KS_MODE_THUMB).asm('ldr r3, [pc, #0]; bx r3',addr=0x8042ed8)[0])+struct.pack('<I',symbols['BaconBinaryResolve'])
    write(0x42ed8,hook)
    for off in [0x41540,0x4251c,0x126cee]:
        old=struct.unpack_from('<H',b,off)[0]
        if old&0xff!=0xa5:raise ValueError(f'Item bound changed at {off:x}')
        write(off,struct.pack('<H',(old&0xff00)|0xd0))
    refs=[]
    oldptr=struct.pack('<I',0x08000000+effects)
    for off in range(0,0x160000,2):
        if b[off:off+4]==oldptr:refs.append(off);write(off,struct.pack('<I',0x08000000+BASE+0x8000))
    if len(refs)!=8:raise ValueError('Unexpected item-effect reference count')
    for off in [0xce918,0xcf574,0x126c9e]:write(off,bytes.fromhex('0120c046'))
    records[0]={'offset':BASE,'length':65536,'before_fill':255,'after_fill':0,'segments':[
        [0,code.hex()],[0x8000,block[0x8000:0x8000+209*4].hex()],
        [0x9000,script.hex()],[0xa000,block[0xa000:0xa000+len(stock)*2].hex()],
        [0xfc00,block[0xfc00:0xfc00+412].hex()],[0xffe0,block[0xffe0:0xffe8].hex()]]}
    result={'format' :'Bacon evolution native v1','reference_sha256':hashlib.sha256(b).hexdigest(),'base':BASE,'length':65536,'time_variable':0x40d0,'records':records,'symbols':symbols,'scripts':labels,'trade_items':TRADE_ITEMS,'stones':STONES,'item_field_handler':struct.unpack_from('<I',b,0x3db098+94*44+28)[0],'maps':{'lab':[4,3],'trade':[10,13]},'shop_pointer_offset':0x16bc99,'shop_original':0x0816bca8}
    (HERE/'binary_payload.json').write_text(json.dumps(result,separators=(',',':'))+'\n')
    print('Built native payload:',len(code),'code bytes;',len(records),'guarded records')
    return result
if __name__=='__main__':build(sys.argv[1],sys.argv[2])
