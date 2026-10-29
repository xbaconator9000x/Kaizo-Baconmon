"""Run the actual portable C resolver plus source-integration checks."""
import ctypes as C
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
from install_source import install

HERE=Path(__file__).resolve().parent
class Branch(C.Structure):
    _fields_=[(x,C.c_ushort) for x in ['method','parameter','target']]
class State(C.Structure):
    _fields_=[(x,C.c_ushort) for x in ['species','level','friendship','beauty','attack','defense','item']]+[('personality',C.c_uint)]+[(x,C.c_ubyte) for x in ['mode','night','everstone','egg','fainted','tiered']]

with tempfile.TemporaryDirectory() as temp:
    temp=Path(temp)
    libpath=temp/'evolution.so'
    subprocess.run(['gcc','-std=c99','-Wall','-Wextra','-Werror','-shared','-fPIC',str(HERE/'bacon_evolution_core.c'),'-o',str(libpath)],check=True)
    fn=C.CDLL(str(libpath)).BaconEvoResolve
    fn.argtypes=[C.POINTER(Branch),C.POINTER(State),C.POINTER(C.c_ubyte)]
    fn.restype=C.c_ushort
    manifest=json.loads((HERE.parent/'babymon_manifest.json').read_text())
    tiers=(C.c_ubyte*412)()
    names={p['name']:p for p in manifest}
    for p in manifest: tiers[p['internal_id']]=p['tier']
    def resolve(branches,**kw):
        state=State(species=133,level=50,friendship=220,beauty=170,attack=50,defense=50,**kw)
        return fn((Branch*5)(*[Branch(*b) for b in branches]),C.byref(state),tiers)
    # Normal Eevee destinations, same friendship threshold on both clock settings.
    eevee=[(2,0,196),(3,0,197)]
    assert resolve(eevee,mode=0,night=0)==196
    assert resolve(eevee,mode=0,night=1)==197
    for night in [0,1]:
        st=State(species=133,level=50,friendship=219,mode=0,night=night)
        assert fn((Branch*5)(Branch(2,0,196),Branch(3,0,197)),C.byref(st),tiers)==0
    assert resolve([(5,0,94)],mode=1)==94
    assert resolve([(5,0,94)],mode=2,item=199)==0
    for item in [187,192,193,194,199,221]:
        assert resolve([(6,item,94)],mode=1)==0
        assert resolve([(6,item,94)],mode=2,item=item)==94
        assert resolve([(7,item,94)],mode=2,item=item)==94
        assert resolve([(7,item,94)],mode=2,item=item+1)==0
    for flag in ['egg','fainted','everstone']:
        assert resolve([(5,0,94)],mode=1,**{flag:1})==0
    assert resolve([(7,199,94)],mode=3,item=199,everstone=1)==94
    # Every encoded branch can resolve with a valid representative condition.
    checks=0
    for p in manifest:
        if p['tier'] not in [1,2]: continue
        target=next(x['internal_id'] for x in manifest if x['tier']==p['tier']+1)
        for m in p['methods']:
            state=State(species=p['internal_id'],level=100,friendship=255,beauty=255,attack=10,defense=10,tiered=1)
            code=m['code'];state.item=m['parameter']
            state.mode=1 if code==5 else 2 if code in [6,7] else 0
            if code==3:state.night=1
            if code==8:state.attack=11
            if code==10:state.defense=11
            if code==12:state.personality=5<<16
            branch=(Branch*5)(Branch(code,m['parameter'],target))
            assert fn(branch,C.byref(state),tiers)==target,(p['name'],m)
            bad=next(x['internal_id'] for x in manifest if x['tier']==p['tier'])
            branch[0].target=bad
            assert fn(branch,C.byref(state),tiers)==0
            checks+=1
    assert resolve([(14,20,292)],mode=0)==0
    if len(sys.argv)>1:
        checkout=Path(sys.argv[1]).resolve()
        dst=temp/'source'
        shutil.copytree(checkout,dst,ignore=shutil.ignore_patterns('.git','build'))
        paths=install(dst,True)
        lady=json.loads((dst/'data/maps/CeladonCity_PokemonCenter_2F/map.json').read_text())
        assert next(o for o in lady['object_events'] if o['x']==10)['script']=='Bacon_TradeEvolutionLady'
        assert next(o for o in lady['object_events'] if o['x']==6)['script']=='Common_EventScript_UnionRoomAttendant'
        events=(dst/'data/maps/CeladonCity_PokemonCenter_2F/scripts.inc').read_text()
        assert events.index('MSGBOX_YESNO')<events.index('specialvar VAR_RESULT, Bacon_StartTradeEvolution')
        assert 'compare VAR_RESULT, FALSE\n\tgoto_if_eq Bacon_TradeEvolutionDone\n\twaitstate' in events
        assert 'Bacon_LabTimeMachine' in (dst/'data/maps/PalletTown_ProfessorOaksLab/map.json').read_text()
        evo=(dst/'src/data/pokemon/evolution.h').read_text()
        assert 'EVO_LEVEL_NINJASK' not in evo and 'EVO_LEVEL_SHEDINJA' not in evo
        items=json.loads((dst/'src/data/items.json').read_text())['items']
        metal=next(x for x in items if x['itemId']=='ITEM_METAL_COAT')
        assert metal['fieldUseFunc']=='FieldUseFunc_EvoItem'
        assert metal['holdEffect']=='HOLD_EFFECT_STEEL_POWER'
        for file in ['src/bacon_evolution.c','src/bacon_evolution_core.c']:
            subprocess.run(['gcc','-std=c99','-fsyntax-only','-I',str(dst/'include'),'-I',str(dst/'gflib'),str(dst/file)],check=True)
        # Reapplication fails before writing, rather than duplicating events/specials.
        before=(dst/'data/specials.inc').read_bytes()
        try: install(dst,True)
        except ValueError: pass
        else: raise AssertionError('Duplicate source installation accepted')
        assert before==(dst/'data/specials.inc').read_bytes()
        print('Source installation, item routing, event consent, isolation, and adapter syntax checks passed.')
    print(f'Native C resolver passed: {checks} species-method branches, tiers, trade/items, day/night, friendship, and rejection checks.')
