# Kaizo Babymon

Kaizo Babymon is a separate challenge preset built on Ironmon VS+. It uses one permanent starter, two seed-consistent randomized evolutions and no pivoting.

## Core rules

- Choose left, middle or right before revealing the starter.
- The selected starter comes only from the Babymon Tier 1 pool.
- There are no starter rerolls or viability safeguards.
- The starter is the only legal runner for the entire attempt.
- If it faints, the attempt ends.
- Pivoting is never allowed.
- Existing Ironmon VS+ rules remain in force unless Babymon explicitly overrides them.
- Classic and Modern remain separate battle-mode choices.

## Evolution

Every runner follows:

`Tier 1 → Tier 2 → Tier 3`

Tier 1 evolves only to Tier 2. Tier 2 evolves only to Tier 3. Tier 3 cannot evolve again.

Destinations are selected by the seed, do not follow the original family, and do not guarantee higher BST, better stats, better typing, better abilities or better moves. The destination must not reroll when the player retries or triggers an evolution.

Evolution timing uses the current species' normal Generation III method. Level, stone, friendship, trade, held-item trade, branch, time, gender, personality and party-condition methods must be supported where applicable. The method and randomized destination are separate.

Held-item trade evolutions use the relevant item directly. Ordinary trade evolutions use the Celadon Pokémon Center trader.

## Tier classification

Tier 1 contains naturally unevolved Generation I–III Pokémon capable of evolving, except designated Tier 2 species.

Tier 2 contains naturally middle-stage Pokémon plus Scyther, Onix and Chansey.

Tier 3 contains every naturally final evolution from Generations I–III, plus standalone Generation III Pokémon with BST 450 or higher.

Legendary, Mythical, post-Generation III and unclassified Pokémon are excluded. Standalone Pokémon below BST 450 are excluded. Final evolutions remain eligible even when their BST is below 450.

The complete working pool and evolution-method table is maintained in the implementation issue/source data. It must be machine-validated against Generation III National Dex IDs, base stats, evolution data and duplicate/missing entries before release.

## Babymon overrides

Permitted:

- Self-healing and draining moves normally prohibited by Ironmon.
- Huge Power and Pure Power without the usual BST restriction.
- Ironmon VS+ conveniences.

Retained:

- One legal runner.
- Permadeath and no pivoting.
- Kaizo trainer and randomiser difficulty.
- Item, held-item, battle-item and progression restrictions.
- Restricted VS+ TM rules.
- No unrestricted TM teaching.

The Fuchsia Move Reminder accepts only an unused Gym Leader-awarded TM that is compatible with the current runner and pays for a legal forgotten move. The TM is consumed only after a successful relearn. Sketch-related exploits remain blocked.

## VS+ conveniences

Babymon inherits the poison-friendly Viridian Forest nurse, friendship controls, eligible field-HM conveniences, battle information and the automatic 33-point Ironmon VS scoring framework. Scores are recorded as Babymon runs and kept separate from other rulesets.

## Randomiser requirements

The Babymon preset must configure:

- Tier 1-only starter selection.
- Seed-consistent Tier 1 → Tier 2 → Tier 3 evolution destinations.
- Normal species-specific evolution triggers.
- No-pivot metadata and rules.
- Babymon move and ability allowances.
- VS+ conveniences and restricted TM rules.
- Celadon evolution-item access.
- Separate ruleset, battle mode, seed, evolution map and override metadata.

Existing Standard Ironmon, Ultimate Ironmon, Kaizo Ironmon, Ironmon VS, VS+, Survival and Nuzlocke presets must remain unchanged.

## Required validation

Before release, verify every pool entry, every evolution method, every tier transition, excluded Legendary/Mythical species, seed consistency, BST decreases, no side-effect party additions, Celadon trading, item access, Move Reminder payment, no-pivot behaviour and unchanged legacy presets.

Controlled tests must include:

- Caterpie → Kakuna → Dragonite
- Slowpoke → Scyther → Beedrill
