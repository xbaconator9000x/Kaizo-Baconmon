#include "bacon_evolution_core.h"

unsigned short BaconEvoResolve(const struct BaconEvoBranch *branches,
    const struct BaconEvoState *s, const unsigned char *tiers)
{
    unsigned short target = 0;
    unsigned int i;
    if (s->species == 0 || s->species > 411 || s->egg || s->fainted ||
        (s->everstone && s->mode != 3)) return 0;
    if (s->tiered && (tiers[s->species] != 1 && tiers[s->species] != 2)) return 0;
    for (i = 0; i < 5; i++) {
        const struct BaconEvoBranch *b = &branches[i];
        unsigned char eligible = 0;
        if (!b->target || b->target > 411) continue;
        if (s->tiered && tiers[b->target] != tiers[s->species] + 1) continue;
        if (s->mode == 1) eligible = b->method == 5; /* pure trade only */
        else if (s->mode == 2 || s->mode == 3)
            eligible = (b->method == 7 || b->method == 6) && b->parameter == s->item;
        else if (s->mode == 0) switch (b->method) {
        case 1: eligible = s->friendship >= 220; break;
        case 2: eligible = s->friendship >= 220 && !s->night; break;
        case 3: eligible = s->friendship >= 220 && s->night; break;
        case 4: eligible = s->level >= b->parameter; break;
        case 8: eligible = s->level >= b->parameter && s->attack > s->defense; break;
        case 9: eligible = s->level >= b->parameter && s->attack == s->defense; break;
        case 10: eligible = s->level >= b->parameter && s->attack < s->defense; break;
        case 11: eligible = s->level >= b->parameter && ((s->personality >> 16) % 10) <= 4; break;
        case 12: eligible = s->level >= b->parameter && ((s->personality >> 16) % 10) > 4; break;
        case 13: eligible = s->level >= b->parameter; break; /* no extra-party branch */
        case 15: eligible = s->beauty >= b->parameter; break;
        }
        if (eligible) {
            target = b->target;
            if (s->mode == 2 || s->mode == 3) break;
        }
    }
    return target;
}
