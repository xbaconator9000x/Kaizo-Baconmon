"""Execute the compiled Thumb payload in Unicorn, with engine APIs instrumented."""
from pathlib import Path
import json,struct,sys
from unicorn import Uc,UC_ARCH_ARM,UC_MODE_THUMB,UC_HOOK_CODE
from unicorn.arm_const import *
HERE=Path(__file__).resolve().parent
p=json.loads((HERE/'binary_payload.json').read_text())
rom=bytearray(Path(sys.argv[1]).read_bytes())
for r in p['records']:
    if 'segments' in r:
        data=bytearray([r['after_fill']])*r['length']
        for offset,hexdata in r['segments']:data[offset:offset+len(bytes.fromhex(hexdata))]=bytes.fromhex(hexdata)
    else:data=bytes.fromhex(r['after'])
    rom[r['offset']:r['offset']+len(data)]=data
u=Uc(UC_ARCH_ARM,UC_MODE_THUMB);u.mem_map(0x08000000,0x1000000);u.mem_write(0x08000000,bytes(rom));u.mem_map(0x02000000,0x40000);u.mem_map(0x03000000,0x10000)
u.mem_write(0x03005008,struct.pack('<I',0x02038000))
fields={};started=[];hold=0
STOP=0x08000100

def return_value(value):
    u.reg_write(UC_ARM_REG_R0,value)
    lr=u.reg_read(UC_ARM_REG_LR)
    u.reg_write(UC_ARM_REG_PC,lr)

def hook(uc,address,size,data):
    if address==STOP:uc.emu_stop()
    elif address==0x0803fbfc:return_value(fields.get(uc.reg_read(UC_ARM_REG_R1),0))
    elif address==0x0809a938:return_value(hold)
    elif address==0x080cddbc:
        started.append(tuple(uc.reg_read(r) for r in [UC_ARM_REG_R0,UC_ARM_REG_R1,UC_ARM_REG_R2,UC_ARM_REG_R3]));return_value(0)
u.hook_add(UC_HOOK_CODE,hook)
def call(name='BaconBinaryResolve',mode=0,item=0):
    u.reg_write(UC_ARM_REG_SP,0x03007f00);u.reg_write(UC_ARM_REG_LR,STOP|1)
    u.reg_write(UC_ARM_REG_R0,0x02024284);u.reg_write(UC_ARM_REG_R1,mode);u.reg_write(UC_ARM_REG_R2,item)
    address=p['symbols'][name]
    u.emu_start(address,STOP+2,count=20000)
    assert u.reg_read(UC_ARM_REG_PC)==STOP,'Native payload did not return normally'
    return u.reg_read(UC_ARM_REG_R0)
fields.update({11:133,56:50,32:220,23:170,59:50,60:50,0:0,45:0,57:100,12:0})
assert call()==196
u.mem_write(0x020391a0,struct.pack('<H',1));assert call()==197
fields[32]=219;assert call()==0
fields.update({11:93,32:220});call('BaconBinaryCheckTrade');assert struct.unpack('<H',u.mem_read(0x020370d0,2))[0]==1
call('BaconBinaryStartTrade');assert started[-1]==(0x02024284,94,0,0)
assert struct.unpack('<I',u.mem_read(0x0300537c,4))[0]==0x080568f5
fields[57]=0;before=len(started);call('BaconBinaryStartTrade');assert len(started)==before
fields[57]=100
manifest=json.loads((HERE.parent/'babymon_manifest.json').read_text())
u.mem_write(0x08b0fff0,struct.pack('<I',1));checks=0
for species in manifest:
    if species['tier'] not in [1,2]:continue
    target=next(x['internal_id'] for x in manifest if x['tier']==species['tier']+1)
    fields.update({11:species['internal_id'],56:100,32:255,23:255,59:10,60:10,0:0,45:0,57:100,12:0})
    for m in species['methods']:
        code=m['code'];fields[59]=11 if code==8 else 10;fields[60]=11 if code==10 else 10;fields[0]=5<<16 if code==12 else 0
        u.mem_write(0x020391a0,struct.pack('<H',int(code==3)))
        off=0x082597c4+species['internal_id']*40
        u.mem_write(off,struct.pack('<HHHH',code,m['parameter'],target,0)+bytes(32))
        mode=1 if code==5 else 2 if code in [6,7] else 0
        assert call(mode=mode,item=m['parameter'])==target,(species['name'],m)
        checks+=1
hold=38;assert call(mode=mode,item=m['parameter'])==0
print(f'Compiled Thumb payload passed {checks} branch executions, day/night friendship and trade scene callback checks.')
