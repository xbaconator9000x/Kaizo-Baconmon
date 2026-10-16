from pathlib import Path
import sys,json,zlib,struct
sys.path.insert(0,'source/fly-update')
from common import Emu,FieldEngine,S,tasks
checks={}
base=Path('public-patcher/all_without_faster.gba');boot=Emu(base);boot.frames(500);boot.press(8);boot.frames(200)
for i in range(100):boot.press(1);boot.frames(40)
boot.save('public-patcher/no-fresh.state');boot.done()
for name in ['guide','friendship']:
 rom=Path('public-patcher')/(name+'_without_faster.gba');e=Emu(rom);state=bytearray(Path('public-patcher/no-fresh.state').read_bytes());struct.pack_into('<I',state,8,zlib.crc32(rom.read_bytes()));Path('public-patcher/fresh-check.state').write_bytes(state);e.load('public-patcher/fresh-check.state');f=FieldEngine(rom,emu=e)
 if name=='guide':
  f.call('RemoveBagItem',347,99);f.sync(e);e.frames(120);f=FieldEngine(rom,emu=e);assert f.call('CheckBagHasItem',347,1)
 else:
  f.call('SetWarpDestination',4,3,255,1,6);f.call('DoWarp');f.sync(e);e.frames(240);e.press(64);e.press(1);e.frames(100)
  print('tasks',tasks(e));assert any(int(a,16)==S['Task_MultichoiceMenu_HandleInput'] for _,a in tasks(e))
 checks[name]='Passed without Faster speed/start hooks, using a fresh matching save-state fixture.';e.done()
Path('public-output/Faster_Separation_Field_Tests.json').write_text(json.dumps({'checks':checks,'scope':'Desktop mGBA with fresh vanilla-speed fixture. Earlier Faster save-state fixture cannot be reused across main-loop implementations. No Android hardware test.'},indent=2));print('PASS field checks without Faster.')
