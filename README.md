# Kaizo Baconmon

**Ironmon, but tastier.**

[Open the browser patcher](https://xbaconator9000x.github.io/Kaizo-Baconmon/)

Kaizo Baconmon is a modular FireRed patcher for building the kind of run you actually want to play.

I wanted the pressure and replayability of Ironmon, the progress tracking and competition of Ironmon VS, and a few quality-of-life features that make the game more practical—especially on a phone. The result is a patcher that lets you use the complete package, or choose only the changes that fit your own rules.

Alongside the modular patcher, Kaizo Baconmon includes two custom rulesets:

- **Ironmon VS+** — my personal variation on Ironmon VS, built around progress tracking, milestones and practical Baconmon conveniences.
- **Kaizo Babymon** — an original, higher-difficulty challenge built around one permanent starter, no pivoting and two randomised tiered evolutions.

Kaizo Babymon is also available as a selectable core randomiser preset—not a beta.

## What the patcher does

Use the [browser patcher](https://xbaconator9000x.github.io/Kaizo-Baconmon/) with a clean US FireRed 1.1 (Rev 1) ROM or Faster FireRed 1.3.2 ROM.

Choose a complete preset or select individual features:

- Classic or Modern battle mechanics.
- Ironmon VS-style run support and a built-in milestone/score log.
- Configurable rival level and Oak's lab start.
- Faster FireRed-derived conveniences.
- Field HMs without needing an HM friend, while HM, badge and story requirements remain.
- Town Map Fly and a lit Rock Tunnel.
- Happiness controls in Oak's lab.
- A poison-healing Viridian nurse.
- Fuchsia Move Reminder support.
- Early encounter rotation.
- Nuz-guide with challenge information and rules.
- Move details and physical/special/status icons.
- Optional title-screen artwork matched to the selected preset.
- Batch randomisation, including the dedicated Babymon setup.

The patcher is designed for compatibility. Changes that cannot be applied are skipped and listed in the output report. No particular modified ROM is guaranteed to work. Keep your original ROM and saves backed up, and use a fresh save when changing the setup.

## Ironmon VS+

[Read the full Ironmon VS+ settings, reset instructions and limitations](docs/Run_Settings_Guide.md#ironmon-vs).

Ironmon VS+ is my personal variation on Ironmon VS.

I chose it because Ironmon VS adds something I enjoy beyond simply reaching the Champion—milestones, points, personal-best chasing and a way to compare progress with friends even when a seed ends early. VS+ keeps that spirit while adding practical Baconmon conveniences.

The intended foundation is still a serious Ironmon-style run:

- One runner and a fresh attempt.
- Permadeath and no pivoting, according to the agreed rules.
- Kaizo trainer settings and the selected Classic or Modern battle mode.
- VS-style milestones and scoring.
- The player decides whether a particular optional convenience is legal for their run.

The score log records progress; it does not automatically certify that a run followed every rule. Blind starter selection, no pivoting, permadeath, TM legality and similar restrictions remain player-managed. Read the full settings before comparing results with another player.

## Kaizo Babymon

[Read the full Kaizo Babymon ruleset](docs/Kaizo_Babymon_Spec.md).

Kaizo Babymon is designed as the next tier of challenge above ordinary Kaizo Ironmon. It is built around a deliberately unstable progression:

- One permanent starter.
- No pivoting.
- A randomised unevolved Tier 1 starter.
- Two seed-consistent randomised evolutions.
- Tier 1 evolves into Tier 2, then Tier 2 into Tier 3.
- Tier 3 is the end of the run's evolution path.
- Evolution destinations are not family-locked, so a run can move through completely different species.
- Normal evolution triggers still matter: levels, stones, friendship, trade-style services, held items and other supported Gen III conditions.
- The dedicated randomiser settings keep the starter pool and evolution destinations inside the correct tiers.

That combination is meant to make every run a long-term problem rather than a search for one perfect early Pokémon. You have to commit to the starter, plan around an uncertain future, and deal with the possibility that an evolution changes your role completely. There are no guarantees that the next form will be stronger, safer or even convenient.

Babymon restrictions are a ruleset for players to follow, not a claim that the software can police every loophole automatically. The patcher supplies the tools, randomisation and documentation.

### Babymon randomisation

Babymon batch generation uses the existing **Universal Pokémon Randomizer ZX 4.6.0** engine with a Baconmon adapter and a deterministic tiered evolution pass. It is not a novel replacement randomiser.

The adapter supplies the parts ordinary UPR settings cannot express by themselves: the Tier 1 starter pool, Tier 1 → Tier 2 → Tier 3 destinations, normal evolution methods and a reproducible seed. Developers can reuse the [Babymon integration guide](public-patcher/randomizer/README.md), [integration manifest](public-patcher/randomizer/Babymon_Integration_Pack.json) and [randomiser integration notes](docs/Randomiser_Integration.md) in their own tools.

## Examples of custom runs

The patcher is modular, so you do not need to adopt either full ruleset.

- Run your own self-tracked VS challenge with the score log and milestones.
- Play Kaizo Ironmon with field-HM and Fly conveniences.
- Make a randomised Nuzlocke with Classic or Modern mechanics.
- Use the Faster FireRed conveniences without using the VS scoring.
- Build a personal challenge with encounter randomisation, the Nuz-guide and selected quality-of-life features.
- Run Ironmon VS+ or Babymon with only the features your group has agreed are legal.

Optional features can change the difficulty or legality of a run. If you change the options, agree on the rules before comparing results.

## Quick start

1. Bring your own clean US FireRed 1.1 (Rev 1) or Faster FireRed 1.3.2 ROM.
2. Open the [browser patcher](https://xbaconator9000x.github.io/Kaizo-Baconmon/).
3. Select a preset or choose individual features.
4. Use **Check and apply**, then read the output report for skipped or conflicting changes.
5. Download the patched copy and start a fresh run.

For batch randomisation, select the matching randomiser preset. Babymon selection enables the full Babymon feature package and its dedicated randomiser settings.

See the [full patcher guide](docs/Patcher_Guide.md) and [run settings guide](docs/Run_Settings_Guide.md) for detailed instructions and limitations.

## Feedback

This is a personal project and I am still improving it. I would particularly like feedback on:

- Rules that are unclear or easy to exploit.
- Babymon evolution edge cases.
- Classic/Modern behaviour that does not match the selected mode.
- Randomiser results, tracker data or patcher reports that look wrong.
- Compatibility problems on real hardware or emulators.
- Features that make a run better or worse without being obvious.

When reporting a problem, include the ROM base, selected preset, seed, patcher report and steps to reproduce it. Please do not upload ROMs, saves or save states to public issues.

## Credits

Developed by **xbaconator9000x**.

- **DrMaple** — Faster FireRed 1.3.2 and permission to adapt aspects of it.
- **iateyourpie** — Ironmon and the wider Ironmon community.
- **WaffleSmacker and the Ironmon VS community** — VS ideas, rules and inspiration.
- **UTDZac, besteon and contributors** — tracker reference data.
- **UPR-ZX by Ajarmar and contributors**, based on Dabomstew's Universal Pokémon Randomizer.
- **CheerpJ by Leaning Technologies**, plus the pret/pokefirered and mGBA projects used as references and testing tools.

See [full credits and permissions](Credits_and_Permissions.md).

## Source and reuse

The patcher code, randomiser integration, tests and ROM patch data are included in this repository. This is not a complete game ROM or a full decompilation.

You are welcome to reuse my original Baconmon contributions in a non-commercial project. Credit **Kaizo Baconmon by xbaconator9000x** and keep the [reuse licence](LICENSE.txt) with the material. That permission only covers rights I hold in my own contributions; Pokémon, FireRed and other creators' work remain subject to their own rights and licences.

[GitHub repository](https://github.com/xbaconator9000x/Kaizo-Baconmon/)
