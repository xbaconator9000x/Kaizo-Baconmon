# Evolution services — optional native patcher support

GPL-3.0-or-later. Opt-in integration for a separate `pret/pokefirered` source checkout. The browser patcher now embeds `binary_payload.json` and exposes an optional **Evolution support (beta)** checkbox. It applies the native runtime, item routing, map events and shop changes to compatible US Rev 1 images. The existing source installer remains available for decomp builds.

Implemented behavior:

- Celadon's upstairs right-hand trade-counter attendant checks the lead Pokémon for an ordinary trade evolution. She offers help, and Yes starts the normal evolution scene. No leaves the Pokémon unchanged. Held evolution items are not required by this service and are not consumed. Other towns' shared cable-club scripts remain untouched.
- Metal Coat, King's Rock, Dragon Scale, Up-Grade, Deep Sea Tooth and Deep Sea Scale can be selected with Use from the Bag. The standard evolution-stone callback handles the animation and consumes one Bag item. Held-item effects are preserved. Ineligible Pokémon, eggs, fainted Pokémon, wrong items and Everstone are rejected. The binary patch relocates and extends FireRed’s item-effect table and widens its three item bounds checks; the source installer instead intercepts these items before the original table. Both routes avoid an out-of-bounds read.
- The left computer terminal in Oak's lab becomes an evolution clock. It offers Day, then Night, with a way to leave the setting unchanged. The setting persists in save variable `0x40D0`, unused in the pinned upstream source. It controls evolution conditions only; it does not change lighting or simulate a real-time clock. Friendship must still reach 220 and the Pokémon must level up. Selecting a time alone never starts evolution.
- Normal evolution mode retains Eevee's Espeon/Umbreon destinations. In Babymon mode the same day/night conditions select seed-assigned next-tier destinations; neither Eevee nor its branches bypass the three-tier rules.
- Celadon Department Store 4F stocks all six stones and all six trade-evolution items at 2,100 each, alongside its original doll/mail stock. Naturally found copies use the same handlers.
- The opt-in source integration removes the National Dex checks in both animation paths and the stone menu that otherwise block non-Kanto evolutions. Tiered mode rejects destinations outside the next tier and removes Nincada's extra-party evolution path.

Run against a **separate source checkout**, not the authoritative unmodified reference:

```sh
python3 public-patcher/evolution/install_source.py PATH_TO_SOURCE --tiered
```

Omit `--tiered` for normal evolution destinations. This changes only the chosen checkout; it does not modify any other patcher preset. The source installer validates its anchors before writing and rejects a duplicate installation.

Validation:

```sh
python3 public-patcher/evolution/test_evolution.py PATH_TO_UNMODIFIED_POKEFIRERED
```

Tests compile and execute the portable C resolver, exercise all 183 manifest evolution-method branches, and check day/night friendship, item mismatches, pure-trade separation, tier boundaries and invalid runners. They also install the integration into a temporary source copy, inspect map/shop/item/script changes and syntax-check the native adapter against the actual upstream headers.

## Binary build and validation

`build_binary.py REFERENCE_ROM POKEFIRERED_SOURCE` uses Zig’s ARM7TDMI Thumb compiler and Keystone to produce patch data only. It reserves `0xB00000–0xB0FFFF`, and the browser verifies original hook bytes and free space before changing anything. Save variable `0x40D0` replaces the previously proposed `0x40F2`, which was found in use by the existing Baconmon engine.

`test_binary.py REFERENCE_ROM` executes the actual compiled Thumb runtime in Unicorn, instrumenting the game’s Pokémon-data and scene-start APIs. All 183 evolution-method branches pass, along with day/night friendship, Everstone rejection and the trade scene’s return callback. The full page patcher is tested against the supplied Rev 1 Baconmon build for successful installation, repeat application and conflicting-hook rejection.

A real UPR-ZX Kaizo seed was generated through the rebuilt Java bridge with evolution support enabled. Its native reservation was byte-for-byte preserved, and trade, trade-item and day/night methods remained intact. The bridge disables UPR’s impossible/easier/timed evolution conversions when this option is used, retaining the preset’s randomized destinations.

This is a beta for playtesting. Full in-game animation, dialogue, item consumption and save/reload validation remains outstanding. No claim of a completed playthrough is made. Beauty access for Feebas and the separate Babymon gameplay restrictions also remain outstanding.
