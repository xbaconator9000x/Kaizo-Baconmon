# Preset title validation

Validated the generated `index.html` and `babymon-beta.html` against the supplied US FireRed Rev 1 Baconmon input. Tests cover preset selection, switching an already patched ROM back to Baconmon, idempotent reapplication, disabled titles, conflicting callbacks/data/legacy graphics, corrupted installed assets, preserved input bytes, and 512-byte copier headers.

The actual UPR-ZX 4.6.0 Java bridge randomized a generated Babymon-title ROM with the Kaizo settings and seed `31415926`. Its output retained the complete checked image/code reservation and callback. mGBA then booted that randomized output: all 38,400 rendered pixels matched the imported GBA palette image, the screen remained stable, and Start entered the native new-game flow. See `runtime-check.json`, `patcher-checks.json`, and the accompanying screenshots. `baconmon-title.png` confirms that the other profile retains the original Baconmon artwork.

Reproduction:

```sh
npm run build
node public-patcher/test_title.cjs INPUT.gba TEMP_OUTPUT
node public-patcher/test_title_runtime.cjs RANDOMIZED_OUTPUT.gba MGBA_SHIM.cjs TEMP_EVIDENCE
```

The mGBA test requires the `mgbawasm_*` shim ABI shown by its named calls. Supply a local mGBA build; no ROMs or emulator binaries are included here. These tests validate title installation and boot behavior. They do not certify the unfinished Babymon challenge rules or all evolution methods.
