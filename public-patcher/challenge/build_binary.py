"""Compile guarded Babymon callback hook; emits patch bytes, never a game ROM."""
from pathlib import Path
import subprocess,tempfile,struct,json,sys,re
from PIL import Image,ImageFont,ImageDraw
HERE=Path(__file__).resolve().parent
BASE=0xB10000
r=Path(sys.argv[1]).read_bytes()
assert r[0xac:0xb0]==b'BPRE' and r[0xbc]==1
assert set(r[BASE:BASE+65536])=={255},'Reservation occupied'
# Monospaced legible 5x9 glyphs embedded as source data, no runtime font dependency.
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',9)
rows=[]
for c in range(32,127):
 im=Image.new('1',(5,9));ImageDraw.Draw(im).text((-0.3,-1),chr(c),font=f,fill=1)
 rows.append([sum((1<<x) for x in range(5) if im.getpixel((x,y))) for y in range(9)])
(HERE/'font.h').write_text('static const unsigned char font[95][9]='+str(rows).replace('[','{').replace(']','}')+';\n')
with tempfile.TemporaryDirectory() as tmp:
 t=Path(tmp);(t/'link.ld').write_text('SECTIONS { . = 0x08B10000; .text : { *(.text*) *(.rodata*) } /DISCARD/ : { *(.ARM.exidx*) *(.ARM.extab*) *(.comment*) *(.note*) } }')
 elf=t/'native.elf'
 subprocess.run([sys.executable,'-m','ziglang','cc','-target','thumb-freestanding-eabi','-mcpu=arm7tdmi','-Os','-g','-ffreestanding','-fno-builtin','-nostdlib','-Wl,-T,'+str(t/'link.ld'),'-Wl,-e,BaconChallengeCallbacks',str(HERE/'runtime.c'),'-o',str(elf)],check=True)
 b=elf.read_bytes();shoff=struct.unpack_from('<I',b,32)[0];size,count=struct.unpack_from('<HH',b,46)
 sections=[struct.unpack_from('<10I',b,shoff+i*size) for i in range(count)];s=next(s for s in sections if s[3]==0x08B10000);code=b[s[4]:s[4]+s[5]]
 symbols={name:int(addr,16) for addr,name in re.findall(r'^\s*\d+:\s+([0-9a-fA-F]+)\s+\d+\s+FUNC\s+GLOBAL.*?\s+(Bacon\w+)$',subprocess.check_output(['readelf','-sW',str(elf)],text=True),re.M)}
assert r[0x524:0x52c].hex()=='10b5f4f033fe0028',r[0x524:0x52c].hex()
patch={'format':'Babymon attempt guard v1','base':BASE,'code':code.hex(),'symbols':symbols,'records':[{'offset':0x524,'before':r[0x524:0x52c].hex(),'after':(bytes.fromhex('004b1847')+struct.pack('<I',symbols['BaconChallengeCallbacks'])).hex()}],'guards':[{'offset':a,'before':r[a:a+24].hex()} for a in [0x3FBFC,0xDA378,0xF5190,0x13B8E8]],'save_variables':['0x40D1','0x40D2','0x40D3','0x40D4','0x40D5','0x40D6']}
(HERE/'binary_payload.json').write_text(json.dumps(patch,separators=(',',':'))+'\n');print('Compiled',len(code),'bytes',symbols)
