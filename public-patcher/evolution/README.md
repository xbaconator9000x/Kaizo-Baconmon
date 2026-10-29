# Evolution services — native source integration

GPL-3.0-or-later. Opt-in integration for a separate `pret/pokefirered` source checkout. This directory does **not** yet provide a binary hook payload for the browser patcher.

Implemented behavior:

- Celadon's upstairs right-hand trade-counter attendant checks the lead Pokémon for an ordinary trade evolution. She offers help, and Yes starts the normal evolution scene. No leaves the Pokémon unchanged. Held evolution items are not required by this service and are not consumed. Other towns' shared cable-club scripts remain untouched.
- Metal Coat, King's Rock, Dragon Scale, Up-Grade, Deep Sea Tooth and Deep Sea Scale can be selected with Use from the Bag. The standard evolution-stone callback handles the animation and consumes one Bag item. Held-item effects are preserved. Ineligible Pokémon, eggs, fainted Pokémon, wrong items and Everstone are rejected. These items are intercepted before FireRed's smaller item-effect table, avoiding an out-of-bounds read.
- The left computer terminal in Oak's lab becomes an evolution clock. It offers Day, then Night, with a way to leave the setting unchanged. The setting persists in save variable `0x40F2`, unused in the pinned upstream source. It controls evolution conditions only; it does not change lighting or simulate a real-time clock. Friendship must still reach 220 and the Pokémon must level up. Selecting a time alone never starts evolution.
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

Still required before browser release:

1. Build a native binary payload using verified symbols and a clean FireRed Rev 1 fixture. Audit the existing Baconmon save-variable allocation before using `0x40F2`; upstream availability does not establish availability in the existing Baconmon engine.
2. Add guarded binary hooks for the resolver, item dispatch, scene checks and event scripts, preserving all unselected presets.
3. Run in-game checks for the lady's Yes/No flow, item animation and exactly-once consumption, retained held items, save/reload of the clock and day/night friendship level-ups.
4. Verify every source/script build with the target ARM toolchain and test other evolution conditions in the emulator. Host C execution and syntax checks do not validate GBA linking, dialogue layout or gameplay.
5. Add an accessible Beauty-raising service for Feebas; the resolver preserves its Beauty threshold but does not itself supply the missing FireRed contest mechanics.

The browser randomiser remains explicitly experimental and does not claim these native hooks are installed.
