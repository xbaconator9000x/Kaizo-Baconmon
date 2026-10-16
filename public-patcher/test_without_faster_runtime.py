from pathlib import Path
import json,sys
R=Path(__file__).resolve().parent;ROOT=R.parent
sys.path[:0]=[str(ROOT/'source/source/work-v09'),str(ROOT/'source/source/work-v07/recovered/tests/fixtures')]
from test_native import Engine,S
M=json.loads((R/'manifest.json').read_text());results={}
classic=Engine(R/'guide_without_faster.gba',False);stale=Engine(R/'guide_without_faster.gba',True)
for move in [44,247,63,7,127]:
 classic.reset();stale.reset();a=classic.damage(move);b=stale.damage(move);assert a==b,(move,a,b)
results['modern_disabled']='Classic damage with either old mode value; all five sample moves agree.'
e=Engine(R/'modern_without_faster.gba',True);e.reset();a=e.damage(44);e.mode=False;e.reset();b=e.damage(44);assert a>b*3,(a,b)
results['modern_without_other_extras']='Physical/special split works when Modern is the only core feature.'
for file in ['lab_without_faster.gba','guide_without_faster.gba']:
 e=Engine(R/file);e.call('WarpToPlayersRoom');at=S['sWarpDestination'];data=list(e.u.mem_read(at,8));results[file+'_warp']=data
 assert data[:2]==([4,3] if file=='lab_without_faster.gba' else [4,1]),(file,data)
# With the HM shortcuts off, the original party checks are executed.
for file,expected in [('hms_without_faster.gba',1),('guide_without_faster.gba',0)]:
 e=Engine(R/file);e.call('CreateMon',S['gPlayerParty'],6,50,31,1,0x12345678,0,0);e.b('gPlayerPartyCount',1)
 e.call('SetBagPocketsPointers');e.call('SetMonMoveSlot',S['gPlayerParty'],33,0);e.call('AddBagItem',341,1);e.call('FlagSet',0x824)
 value=e.call('PartyHasMonWithSurf');assert bool(value)==bool(expected),(file,value)
results['hm_toggle']='Surf accepted from HM/badge without teaching when on; original party-move requirement restored when off.'
(ROOT/'public-output/Faster_Separation_Runtime_Tests.json').write_text(json.dumps({'checks':results,'scope':'Actual ARM ROM functions in Unicorn. Field UI checks and Android hardware are separate.'},indent=2));print('PASS independent Modern, lab warp and HM runtime functions.')
