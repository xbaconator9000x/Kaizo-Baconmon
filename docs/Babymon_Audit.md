# Babymon integrity audit

Babymon uses a deterministic tiered evolution plan. Every generated edge must move exactly one tier upward, and the ROM table, reverse index, tracker data, and spoiler output must all be derived from that same plan.

The screenshot regression (`Hoppip -> Bulbasaur`) violates that invariant: Bulbasaur is a tier-1 species and cannot be an evolution destination. The planner now validates every forward and reverse edge, and `test_babymon_integrity.cjs` keeps an explicit regression guard for that pair. A clean FireRed ROM is still required to run the end-to-end ROM/table test (`npm run test:babymon-batch`).

## Move-category contract

| Move | Classic | Modern |
| --- | --- | --- |
| Sacred Fire | Special | Physical |
| Bite | Special | Physical |
| Shadow Ball | Physical | Special |
| Hyper Beam | Special | Special |
| Hidden Power | Special | Special |

The selected ruleset must be applied consistently to the ROM move table, in-game move data, tracker display, damage calculation, and spoilers. Modern Sacred Fire being physical is correct under this contract; it is a defect if the selected profile is Classic or if another consumer reports a different category.

Run the static audit with:

```sh
npm run test:babymon-integrity
```
