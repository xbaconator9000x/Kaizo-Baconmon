# Kaizo Babymon

Kaizo Babymon is a separate challenge preset built on Ironmon VS+. It uses one permanent starter, two seed-consistent randomized evolutions and no pivoting.

**One starter. Two randomized evolutions. No pivots. No guarantees.**

[Play the development beta](https://xbaconator9000x.github.io/Kaizo-Baconmon/babymon-beta.html) · [Current implementation and checks](Babymon_Beta.md)

This document defines the challenge rules. The beta supplies tools to play them and does not certify a legal run. Blind starter selection, no pivoting and permadeath are player-managed: the game does not force a blind choice, prevent party changes or automatically end an attempt. You may use the tools for custom or casual play too; record any departures when comparing challenge results.

## Core rules

- Choose left, middle or right before revealing the starter.
- The selected starter comes only from the Babymon Tier 1 pool.
- No starter rerolls or viability guarantees are allowed by the rules. Removal of the randomiser's starting-move viability safeguard remains an implementation task.
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

For trade-with-held-item evolutions, use the relevant item directly like a stone; it is consumed on a successful evolution. Ordinary trade evolutions, such as Haunter, use the Celadon Pokémon Center trade-room lady. The destination still comes from the next Babymon tier, rather than the original evolution family.

Evolution stones and trade evolution items are available from Celadon Department Store, including Moon Stone, Metal Coat, King’s Rock, Up-Grade, DeepSeaTooth and DeepSeaScale. Buying these evolution items is an explicit exception to the usual purchase restrictions. The left lab computer provides a manual Day/Night evolution clock; automatic real-time lighting is not included.

Nincada must not add Shedinja as a second party member. Tier 3 never evolves further. Examples of valid randomized chains are Caterpie → Kakuna → Dragonite and Slowpoke → Scyther → Beedrill; these illustrate destinations, not universal level-up triggers.

## Tier classification

Tier 1 contains naturally unevolved Generation I–III Pokémon capable of evolving, except designated Tier 2 species.

Tier 2 contains naturally middle-stage Pokémon plus Scyther, Onix and Chansey.

Tier 3 contains every naturally final evolution from Generations I–III, plus standalone non-evolving Pokémon from Generations I–III with Generation III BST 450 or higher.

Legendary, Mythical, post-Generation III and unclassified Pokémon are excluded. Standalone Pokémon below BST 450 are excluded. Final evolutions remain eligible even when their BST is below 450.

Tangela is excluded. Butterfree and Beedrill are Tier 3 despite their lower BST; Porygon is Tier 1 and Porygon2 is Tier 3.

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

Under the challenge rules, teach only eligible Gym Leader-awarded TMs. The Fuchsia Move Reminder must use an unused Gym Leader-awarded TM compatible with the current runner to pay for a legal forgotten move; consume the TM only after a successful relearn. Sketch-related exploits are prohibited.

Automatic TM provenance, compatibility, legal-choice and successful-payment checks, plus the Sketch audit, remain unfinished in the beta. Players must observe these restrictions themselves; the existing relearner accepting a TM does not prove it was eligible.

## VS+ conveniences

Babymon inherits the poison-friendly Viridian Forest nurse, friendship controls, eligible field-HM conveniences, battle information and the automatic 33-point Ironmon VS scoring framework. Babymon results must be kept separate from other rulesets, with Classic/Modern and seed/settings recorded. Automatic separate in-game Babymon scoring is still pending; beta batch metadata marks outputs as experimental and score-ineligible.

## Current beta status

The published beta includes Tier 1 starters, seed-consistent tier destinations and native evolution services. The mandatory attempt guard from the earlier restriction beta has been removed. Full playthrough and Android verification remain pending.

The healing/draining and Huge Power/Pure Power allowances above are the agreed rules. The randomiser policy audit, starting-move safeguard removal, restricted TM handling and separate in-game scoring remain implementation work. See [beta status](Babymon_Beta.md) for the scope of completed tests.

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

Before release, verify every pool entry, every evolution method, every tier transition, excluded Legendary/Mythical species, seed consistency, BST decreases, no side-effect party additions, Celadon trading, item access, Move Reminder payment, no-pivot documentation, absence of forced blind selection/automatic run-ending, and unchanged legacy presets.

Controlled tests must include:

- Caterpie → Kakuna → Dragonite
- Slowpoke → Scyther → Beedrill
