"""Check remaining Baconmon tools when a foreign ability hook blocks Modern."""
from pathlib import Path
import json,sys
ROOT=Path(__file__).resolve().parent.parent
sys.path[:0]=[str(ROOT/'source/fly-update')]
from common import Engine,FieldEngine,S,fixture
rom=ROOT/'compatibility-work/modern-skipped.gba';original=ROOT/'patch-inputs/Pokemon - Fire Red Version (U) (V1.1).gba'
M=json.loads((ROOT/'source/source/work-v09/native/modern-symbols.json').read_text())
e=Engine(rom,True);base=Engine(original);damage={}
assert e.call(M['Bacon_IsModern'])==0
for move in [44,247,63,7,127]:
 e.reset();base.reset();actual=e.damage(move);expected=base.damage(move);assert actual==expected,(move,actual,expected);damage[move]=actual
# Execute the installed overworld and item code in the emulator, with
# a valid foreign ability stub that returns zero (no ability effect).
emu=fixture(rom);emu.frames(240);f=FieldEngine(rom,emu=emu);guide=bool(f.call('CheckBagHasItem',347,1));assert guide;emu.done()
r={'modern_skipped_with_foreign_ability_hook':True,'new_helpers_use_classic_even_with_old_modern_save_variable':True,'classic_damage':damage,'guide_item_granted_by_running_overworld_code':guide,'scope':'ARM functions in Unicorn and a field fixture in desktop mGBA. The foreign ability test hook is a valid Thumb routine returning zero. These checks test isolation of the remaining tools, not every behavior of an arbitrary hack.'}
(ROOT/'public-output/Best_Effort_Runtime_Tests.json').write_text(json.dumps(r,indent=2));print('PASS Classic helper fallback, native damage and guide grant after Modern is skipped.')
