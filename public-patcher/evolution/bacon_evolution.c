#include "global.h"
#include "pokemon.h"
#include "item.h"
#include "event_data.h"
#include "evolution_scene.h"
#include "overworld.h"
#include "constants/items.h"
#include "constants/hold_effects.h"
#include "constants/pokemon.h"
#include "bacon_evolution.h"
#include "bacon_evolution_core.h"
#include "bacon_evolution_tiers.h"

extern const struct Evolution gEvolutionTable[][EVOS_PER_MON];

bool8 Bacon_IsDirectEvolutionItem(u16 item)
{
    return item == ITEM_METAL_COAT || item == ITEM_KINGS_ROCK ||
        item == ITEM_DRAGON_SCALE || item == ITEM_UP_GRADE ||
        item == ITEM_DEEP_SEA_TOOTH || item == ITEM_DEEP_SEA_SCALE;
}

u16 Bacon_GetEvolutionTarget(struct Pokemon *mon, u8 mode, u16 item)
{
    struct BaconEvoState state = {0};
    struct BaconEvoBranch branches[5];
    unsigned int i;
    u16 heldItem = GetMonData(mon, MON_DATA_HELD_ITEM, NULL);
    state.species = GetMonData(mon, MON_DATA_SPECIES, NULL);
    if (state.species == 0 || state.species > 411) return SPECIES_NONE;
    state.level = GetMonData(mon, MON_DATA_LEVEL, NULL);
    state.friendship = GetMonData(mon, MON_DATA_FRIENDSHIP, NULL);
    state.beauty = GetMonData(mon, MON_DATA_BEAUTY, NULL);
    state.attack = GetMonData(mon, MON_DATA_ATK, NULL);
    state.defense = GetMonData(mon, MON_DATA_DEF, NULL);
    state.personality = GetMonData(mon, MON_DATA_PERSONALITY, NULL);
    state.egg = GetMonData(mon, MON_DATA_IS_EGG, NULL);
    state.fainted = GetMonData(mon, MON_DATA_HP, NULL) == 0;
    state.item = item;
    state.mode = mode;
    state.night = VarGet(VAR_BACON_TIME) == 1;
    state.everstone = (heldItem == ITEM_ENIGMA_BERRY ? gSaveBlock1Ptr->enigmaBerry.holdEffect : ItemId_GetHoldEffect(heldItem)) == HOLD_EFFECT_PREVENT_EVOLVE;
    state.tiered = BACON_TIERED_EVOLUTIONS;
    for (i=0; i<5; i++) {
        branches[i].method = gEvolutionTable[state.species][i].method;
        branches[i].parameter = gEvolutionTable[state.species][i].param;
        branches[i].target = gEvolutionTable[state.species][i].targetSpecies;
    }
    return BaconEvoResolve(branches, &state, sBaconEvolutionTiers);
}

u16 Bacon_CheckTradeEvolution(void)
{
    if (gPlayerPartyCount == 0) return SPECIES_NONE;
    return Bacon_GetEvolutionTarget(&gPlayerParty[0], EVO_MODE_TRADE, ITEM_NONE);
}

u16 Bacon_StartTradeEvolution(void)
{
    u16 target = Bacon_CheckTradeEvolution();
    /* Recheck after consent. Never consume an item or simulate an actual trade. */
    if (target == SPECIES_NONE) return FALSE;
    gCB2_AfterEvolution = CB2_ReturnToFieldContinueScriptPlayMapMusic;
    BeginEvolutionScene(&gPlayerParty[0], target, FALSE, 0);
    return TRUE;
}
void Bacon_SetDay(void) { VarSet(VAR_BACON_TIME, 0); }
void Bacon_SetNight(void) { VarSet(VAR_BACON_TIME, 1); }
