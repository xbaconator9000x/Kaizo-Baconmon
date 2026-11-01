# Babymon randomiser integration

Kaizo Babymon is a core preset of the modular patcher. Ironmon VS+ is the original Baconmon challenge. Kaizo Baconmon remains the ROM/toolkit name.

## Existing engine, custom configuration

The browser batch tool embeds the existing, unmodified **Universal Pokémon Randomizer ZX 4.6.0** engine. It runs the Kaizo battle settings through a Java adapter that chooses Tier 1 starters, preserves evolution methods. The JavaScript adapter then writes the deterministic Babymon starter/evolution plan into each generated ROM. Batch seeds and engine settings are recorded with every download.

This is an adapter around an existing engine, not a new general-purpose randomiser. A UPR settings string alone cannot describe Tier 1 → Tier 2 → Tier 3 evolution destinations. Importing the base settings alone produces an ordinary Kaizo randomisation, not Babymon.

## Reuse in another randomiser

- [UPR-ZX 4.6.0 base settings](../public-patcher/randomizer/Babymon_UPR_ZX_4.6.0_settings.txt): the existing Kaizo battle-settings string. Apply the Babymon overrides below as well.
- [Species, tiers and evolution methods](../public-patcher/babymon-manifest.json): all 386 National Dex entries, eligibility, ROM IDs, normal methods and tier destinations.
- [Portable deterministic planner](../public-patcher/babymon_planner.js): `plan(manifest, seedString)` returns three starters and every evolution branch. No browser, Java or ROM dependency.
- [FireRed Rev 1 writer](../public-patcher/babymon_rom.js): `apply(romBytes, manifest, seedString)` returns a new ROM and the same plan. This adapter is specifically for the original US FireRed Rev 1 layout; another engine must validate its output layout before using it. Do not apply it to expanded or relocated ROM tables.
- [Browser Java adapter](../public-patcher/randomizer/BabymonBridge.jar): the exact adapter used by the core patcher, alongside the existing `PokeRandoZX.jar`. This is supplied for the current integration; the portable planner and tier manifest are the engine-independent interface.

Export a reference plan:

```sh
node scripts/babymon_plan.cjs 12345 plan.json
```

For a different engine, feed `plan.starters` into its starter selection **before** randomising starter-dependent content such as rival teams. Preserve current-species normal evolution triggers, then replace each branch destination using `plan.evolutions`. Disable every Tier 3 evolution and all excluded-species branches. Do not merely overwrite the three starter species after generating a seed: starter-dependent data may then be inconsistent.

Use National Dex IDs from the plan. Map them to your engine's own species IDs; Gen III internal IDs differ from National Dex IDs. The planner's domain-separated hash, sorted pools and seed string are the reference for matching browser destinations. Other engine random data need not match UPR-ZX.

Babymon permits self-healing/draining moves and Huge/Pure Power. Keep the normal Kaizo battle difficulty, with player-managed no pivots, blind starter selection, permadeath and Gym TM legality. The included engine's starting-move handling is documented separately in the challenge specification; this release does not claim every policy is enforced automatically.

## Evolution services

Generated ROMs also need the core patcher's native evolution support: Celadon trade attendant for pure trades, direct-use consumed trade items, Celadon evolution-item stock and the manual lab Day/Night evolution clock. Tier plans alone do not install these services. Another engine/ROM must supply equivalent functionality, or use the core patcher before randomisation and preserve its guarded code/script ranges.

The clock controls evolution conditions; it does not supply automatic real-time lighting. The game does not automatically end an attempt or prevent party changes. The score log remains VS-style; separate Babymon scoring and automatic Gym TM eligibility checks are not supplied.

The former `babymon-beta.html` URL is a compatibility copy of the same core patcher. There is no separate Babymon beta workflow.
