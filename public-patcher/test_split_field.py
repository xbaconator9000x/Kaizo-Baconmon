from pathlib import Path
import sys,json
R=Path(__file__).resolve().parent;ROOT=R.parent
sys.path.insert(0,str(ROOT/'source/fly-update'))
from common import fixture,FieldEngine,S,tasks
results={}
for name in ['guide_only','guide_off','friendship_only','friendship_off']:
 rom=R/(name+'.gba');e=fixture(rom,mode=0xbc00);f=FieldEngine(rom,emu=e)
 if name.startswith('guide'):
  f.call('RemoveBagItem',347,99);f.sync(e);e.frames(240);f=FieldEngine(rom,emu=e)
  got=bool(f.call('CheckBagHasItem',347,1));assert got==(name=='guide_only'),(name,got);results[name]={'guide_granted_after_field_ticks':got}
 else:
  f.call('SetWarpDestination',4,3,255,1,6);f.call('DoWarp');f.sync(e);e.frames(240)
  # Face upward towards the machine and interact.
  e.press(64);e.press(1);e.frames(100)
  active=any(int(a,16)==S['Task_MultichoiceMenu_HandleInput'] for _,a in tasks(e))
  # The friendship script begins with a message before its menu.
  if not active:
   for i in range(3):e.press(1);e.frames(100)
   active=any(int(a,16)==S['Task_MultichoiceMenu_HandleInput'] for _,a in tasks(e))
  assert active==(name=='friendship_only'),(name,active,tasks(e));results[name]={'machine_menu_opened':active}
 e.done()
(ROOT/'public-output/Independent_Field_Tests.json').write_text(json.dumps({'checks':results,'scope':'Desktop mGBA using a controlled field fixture. No Android hardware test.'},indent=2));print('PASS guide item grant and friendship machine on/off in mGBA.')
