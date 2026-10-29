"""Apply evolution services to a separate pret/pokefirered source checkout.

This is a decomp source integration, NOT a binary ROM installer. The browser
patcher must not claim these hooks are installed until a guarded native payload
has been built and tested against its supported ROM.
"""
import argparse
import json
from pathlib import Path
import re

HERE = Path(__file__).resolve().parent
ITEMS = 'MOON_STONE SUN_STONE FIRE_STONE THUNDER_STONE WATER_STONE LEAF_STONE METAL_COAT KINGS_ROCK DRAGON_SCALE UP_GRADE DEEP_SEA_TOOTH DEEP_SEA_SCALE'.split()


def install(root, tiered):
    updates = {}
    def read(path):
        return updates.get(path, (root/path).read_text())
    def replace(path, before, after):
        text = read(path)
        if text.count(before) != 1:
            raise ValueError(f'Expected one source anchor in {path}: {before[:60]}')
        updates[path] = text.replace(before, after, 1)
    for path in ['src/pokemon.c', 'src/party_menu.c']:
        replace(path, '#include "global.h"', '#include "global.h"\n#include "bacon_evolution.h"')
    text=read('src/pokemon.c')
    start=text.index('u16 GetEvolutionTargetSpecies(')
    end=text.index('\nstatic u16 HoennPokedexNumToSpecies',start)
    updates['src/pokemon.c']=text[:start]+'''u16 GetEvolutionTargetSpecies(struct Pokemon *mon, u8 type, u16 evolutionItem)
{
    return Bacon_GetEvolutionTarget(mon, type, evolutionItem);
}
'''+text[end:]
    # Intercept direct-use items before the bounded vanilla effect table is read.
    anchor='    // Skip using the item if it won\'t do anything\n    if (!IS_POKEMON_ITEM(item))'
    text=read('src/pokemon.c')
    if text.count(anchor)!=2:
        raise ValueError('Item-effect source anchors changed')
    snippets=['''    if (Bacon_IsDirectEvolutionItem(item))
    {
        u16 target = GetEvolutionTargetSpecies(mon, EVO_MODE_ITEM_USE, item);
        if (gMain.inBattle || target == SPECIES_NONE) return TRUE;
        BeginEvolutionScene(mon, target, FALSE, partyIndex);
        return FALSE;
    }
''','''    if (Bacon_IsDirectEvolutionItem(item))
        return gMain.inBattle || GetEvolutionTargetSpecies(mon, EVO_MODE_ITEM_USE, item) == SPECIES_NONE;
''']
    parts=text.split(anchor)
    updates['src/pokemon.c']=parts[0]+snippets[0]+anchor+parts[1]+snippets[1]+anchor+parts[2]
    # The generic stone callback consumes one item after launching the scene.
    replace('src/party_menu.c','    if (!IS_POKEMON_ITEM(item))\n        return ITEM_EFFECT_NONE;',
            '    if (Bacon_IsDirectEvolutionItem(item))\n        return ITEM_EFFECT_EVO_STONE;\n    if (!IS_POKEMON_ITEM(item))\n        return ITEM_EFFECT_NONE;')
    text=read('src/party_menu.c')
    start=text.index('static bool8 MonCanEvolve(void)\n{')
    end=text.index('\nu8 GetItemEffectType',start)
    updates['src/party_menu.c']=text[:start]+"""static bool8 MonCanEvolve(void)
{
    return GetEvolutionTargetSpecies(&gPlayerParty[gPartyMenu.slotId], EVO_MODE_ITEM_USE, gSpecialVar_ItemId) != SPECIES_NONE;
}
"""+text[end:]
    # Both normal and trade animations otherwise cancel all post-Kanto targets.
    path='src/evolution_scene.c'
    text=read(path)
    if text.count('if (!IsNationalPokedexEnabled()')!=2:
        raise ValueError('Evolution scene National Dex guards changed')
    updates[path]=text.replace('if (!IsNationalPokedexEnabled()', 'if (FALSE /* opt-in cross-generation evolution support */')
    # Avoid silently taking an allocated story variable.
    var_text=read('include/constants/vars.h')
    if '#define VAR_0x40F2                 0x40F2' not in var_text:
        raise ValueError('Day/night save variable is not reserved as expected')
    for path in list((root/'src').rglob('*.c')) + list((root/'data').rglob('*.inc')):
        if 'VAR_0x40F2' in path.read_text():
            raise ValueError('Day/night variable is already in use')
    manifest=json.loads((HERE.parent/'babymon_manifest.json').read_text())
    tiers=[0]*412
    for p in manifest: tiers[p['internal_id']]=p['tier']
    updates['include/bacon_evolution_tiers.h']=(
        '#define BACON_TIERED_EVOLUTIONS '+str(int(tiered))+'\n'
        'static const unsigned char sBaconEvolutionTiers[412] = {'+','.join(map(str,tiers))+'};\n')
    for name in ['bacon_evolution.c','bacon_evolution_core.c']:
        updates['src/'+name]=(HERE/name).read_text()
    for name in ['bacon_evolution.h','bacon_evolution_core.h']:
        updates['include/'+name]=(HERE/name).read_text()
    items=json.loads(read('src/data/items.json'))
    for item in items['items']:
        if item['itemId'] in ['ITEM_'+x for x in ITEMS]:
            item['price']=2100
            if item['itemId'] not in ['ITEM_'+x for x in ITEMS[:6]]:
                item['type']='ITEM_TYPE_PARTY_MENU'
                item['fieldUseFunc']='FieldUseFunc_EvoItem'
    updates['src/data/items.json']=json.dumps(items,indent=2)+'\n'
    path='data/maps/CeladonCity_DepartmentStore_4F/scripts.inc'
    text=read(path)
    start=text.index('CeladonCity_DepartmentStore_4F_Items::')
    end=text.index('\n\trelease', start)
    updates[path]=text[:start]+'CeladonCity_DepartmentStore_4F_Items::\n'+''.join('\t.2byte ITEM_'+x+'\n' for x in ['POKE_DOLL','RETRO_MAIL']+ITEMS)+ '\t.2byte ITEM_NONE'+text[end:]
    # Celadon only: the right-hand direct cable/trade counter. Do not replace shared scripts.
    path='data/maps/CeladonCity_PokemonCenter_2F/map.json'
    data=json.loads(read(path))
    matches=[o for o in data['object_events'] if o['script']=='Common_EventScript_DirectCornerAttendant']
    if len(matches)!=1: raise ValueError('Celadon trade-room attendant not found')
    matches[0]['script']='Bacon_TradeEvolutionLady'
    updates[path]=json.dumps(data,indent=2)+'\n'
    # Reuse the left lab computer terminal, preserving the adjacent original PC event.
    path='data/maps/PalletTown_ProfessorOaksLab/map.json'
    data=json.loads(read(path))
    matches=[o for o in data['bg_events'] if o['x']==2 and o['y']==1 and o['script']=='PalletTown_ProfessorOaksLab_EventScript_Computer']
    if len(matches)!=1: raise ValueError('Lab terminal event not found')
    matches[0]['script']='Bacon_LabTimeMachine'
    updates[path]=json.dumps(data,indent=2)+'\n'
    path='data/maps/CeladonCity_PokemonCenter_2F/scripts.inc'
    updates[path]=read(path)+'\n'+(HERE/'events.inc').read_text()
    replace('data/specials.inc','gSpecialsEnd::', ''.join('\tdef_special '+fn+'\n' for fn in ['Bacon_CheckTradeEvolution','Bacon_StartTradeEvolution','Bacon_SetDay','Bacon_SetNight'])+'gSpecialsEnd::')
    if tiered:
        path='src/data/pokemon/evolution.h'
        text=read(path).replace('EVO_LEVEL_NINJASK','EVO_LEVEL')
        text,n=re.subn(r'\{EVO_LEVEL_SHEDINJA,\s*20,\s*SPECIES_SHEDINJA\}', '{0, 0, SPECIES_NONE}',text)
        if n!=1: raise ValueError('Nincada extra-party branch not found')
        updates[path]=text
    # All anchor validation completes before any file is written.
    for path,text in updates.items():
        dest=root/path
        dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_text(text)
    return sorted(updates)

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source',type=Path)
    parser.add_argument('--tiered',action='store_true',help='Enforce Babymon tiers; otherwise use normal evolution destinations')
    args=parser.parse_args()
    print(json.dumps(install(args.source,args.tiered),indent=2))
