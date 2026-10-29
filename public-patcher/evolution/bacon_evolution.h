#ifndef BACON_EVOLUTION_H
#define BACON_EVOLUTION_H
#include "global.h"
#include "pokemon.h"
#define VAR_BACON_TIME 0x40D0
bool8 Bacon_IsDirectEvolutionItem(u16 item);
u16 Bacon_GetEvolutionTarget(struct Pokemon *mon, u8 mode, u16 item);
u16 Bacon_CheckTradeEvolution(void);
u16 Bacon_StartTradeEvolution(void);
void Bacon_SetDay(void);
void Bacon_SetNight(void);
#endif
