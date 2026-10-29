#ifndef BACON_EVOLUTION_CORE_H
#define BACON_EVOLUTION_CORE_H
/* Portable Generation III evolution resolver. Values match pret/pokefirered. */
struct BaconEvoBranch { unsigned short method, parameter, target; };
struct BaconEvoState {
    unsigned short species, level, friendship, beauty, attack, defense, item;
    unsigned int personality;
    unsigned char mode, night, everstone, egg, fainted, tiered;
};
unsigned short BaconEvoResolve(const struct BaconEvoBranch *, const struct BaconEvoState *, const unsigned char *tiers);
#endif
