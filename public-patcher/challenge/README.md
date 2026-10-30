# Babymon attempt guard

GPL-3.0-or-later. Target: US FireRed Rev 1 with the verified Baconmon engine.

`runtime.c` implements the Babymon-only frame dispatcher, persistent starter identity and terminal attempt state. `build_binary.py reference.gba` compiles it with ziglang and emits guarded patch bytes only. `font.h` is checked-in source data; rebuilding it requires Pillow and DejaVu Sans Mono. The font's upstream license is in `FONT_LICENSE.txt`.

Installation and behavior: [attempt guard documentation](../../docs/Babymon_Attempt_Guard.md).

Run `node public-patcher/test_challenge_support.cjs` for installation checks. The native installation guards deliberately reject modified dependencies rather than guessing offsets. Compile and test against a user-supplied ROM; do not commit game images or save data.
