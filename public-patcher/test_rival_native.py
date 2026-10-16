"""Run actual trainer party creation and read the resulting Pokémon's level."""
import sys,json,struct
from pathlib import Path
R=Path(__file__).resolve().parent;ROOT=R.parent
sys.path.insert(0,str(ROOT/'source/source/work-v07/recovered/tests/fixtures'))
from uc_helpers import Native
S=json.loads((ROOT/'source/source/work-v09/native/original-symbols.json').read_text());results=[]
for filename,expected in [('rival-1.gba',1),('clean.gba',8),('rival-100.gba',100)]:
 for modern in [False,True]:
  e=Native(R/filename)
  def w(a,v):e.u.mem_write(S.get(a,a) if isinstance(a,str) else a,struct.pack('<I',v))
  w('gBattleTypeFlags',8);w('gSaveBlock1Ptr',0x02000000);w('gSaveBlock2Ptr',0x02004000)
  e.u.mem_write(0x020011fe,struct.pack('<H',0xbc01 if modern else 0xbc00))
  for trainer in [326,327,328]:
   # Simulate a randomizer boosting the default's stored level; native protection must still produce 8.
   if expected==8:
    p=e.r32(S['gTrainers']+trainer*40+36);e.u.mem_write(p+2,b'\x0c')
   count=e.call(S['CreateNPCTrainerParty'],S['gEnemyParty'],trainer)
   level=e.call(S['GetMonData2'],S['gEnemyParty'],56,0)
   assert count==1 and level==expected,(filename,modern,trainer,count,level)
   results.append(dict(level=level,modern=modern,trainer=trainer))
(ROOT/'public-output/Rival_Runtime_Tests.json').write_text(json.dumps({'checks':results,'scope':'Unicorn ARM executes the ROM trainer-party creation and Pokémon data functions. Default 8 also tested with stored level raised to 12. No Android hardware test.'},indent=2))
print('PASS: actual rival party creation at levels 1, 8 and 100, all starters, both modes; default randomizer protection retained.')
