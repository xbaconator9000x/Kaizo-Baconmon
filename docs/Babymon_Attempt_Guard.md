# Babymon attempt guard (development beta)

The Babymon profile now requires evolution support and installs a native attempt guard. The guard is inactive unless the ROM's Babymon configuration is enabled. Other profiles retain their previous output.

## Enforced in this batch

- Bind the first single starter received in Oak's lab using its personality and original trainer ID.
- Keep the same identity across species changes, level-ups, friendship and both randomised evolutions.
- A faint ends the attempt. Healing afterwards does not clear the terminal state.
- Replacing/removing the runner, or adding a second party member, ends the attempt. This is a strict attempt-validation rule, not a menu-action blocker: catching, receiving or withdrawing another Pokémon can invalidate the attempt. Field HM conveniences do not require a helper Pokémon.
- Persist the terminal state using the game's normal cartridge save routine. Continue cannot revive the attempt. The result screen returns to the title, where New Game remains available.
- Refuse installation if native dependencies, hook bytes, revision or the payload reservation differ. Recheck the guard after Java randomisation, before releasing a batch ROM.

The six saved variables 0x40D1–0x40D6 contain version magic, state, personality and original trainer ID. 0x40D0 remains the evolution clock. No species ID is used as runner identity. The native payload occupies the beginning of the verified free 0xB10000 reservation; evolution occupies 0xB00000. The callback dispatcher reproduces the existing help/save-error gates and invokes the original callbacks.

## Validation on 30 October 2026

Actual mGBA runtime checks passed for replacement with another valid personality, extra party member, missing party, faint, attempted HP restoration, inactive normal-mode behavior and species changes with preserved identity. A controlled Slowpoke genuinely evolved into Scyther and then Beedrill through the normal item menus while the guard remained active. A real cartridge-save export and fresh-boot Continue reproduced the failed-attempt screen. Return to title preserved New Game access.

The exact built standalone patcher's patchROM API installed this guard on the supplied US Rev 1 Baconmon image. The normal-profile output SHA-256 remained `043381d6e9630b230497744390c86fccbed16922ab72d1b997e45ae878042663`. The Java engine is real in ROM randomisation checks; the large-batch ZIP test uses an explicit synthetic native fixture and a Java stub.

Runtime tests use controlled RAM party/item/HP fixtures and a pre-starter laboratory state. These are targeted checks, not a full natural playthrough, an Android test or proof that every combat faint path has been exercised. A naturally played battle faint is still required before release.

## Still pending

- Blind starter commitment before revealing species.
- Prefer blocking prohibited acquisition/party menu actions before they invalidate an attempt; provide precise in-game notices.
- Restricted TM acquisition provenance, current-runner compatibility and legal Move Reminder choices, successful-relearn payment, Sketch restrictions.
- Audit and remove UPR's starting-move viability safeguard for Babymon only; verify healing/draining moves and unrestricted Huge Power/Pure Power.
- Separate in-game scoring/run metadata and Classic/Modern classification. Experimental batch outputs remain score-ineligible.
- Native battle faint/whiteout edge cases, battle animations, transfers/daycare/link/PC flows, save errors, full playthrough and Android emulator regressions.

The live root index is unchanged. Do not promote this branch as a completed challenge release.
