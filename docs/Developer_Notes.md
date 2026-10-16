# Developer notes

This repository contains the browser patcher, patch manifests, randomiser integration and verification reports. It is not a full FireRed decompilation. No playable ROM, APK or save is included.

## Repository layout

| Path | Contents |
| --- | --- |
| index.html | Self-contained patcher served by GitHub Pages. |
| public-patcher/ | Page builder, patch application code, embedded manifests and verification scripts. |
| public-patcher/randomizer/ | UPR-ZX 4.6.0, its corresponding source, presets and the Java adapter. |
| patch-work/ | Byte, hash and BPS utilities used for independent patch checks. |
| reports/ | Recorded compatibility, browser and desktop emulator results. |
| notices/ and public-patcher/notices/ | Third-party licence notices. |
| Kaizo_Baconmon_Patcher_Source.zip | A packaged copy of the public files, excluding the ZIP itself. |

## Build the HTML page

Python 3 and the checked-in files are sufficient to rebuild the page:

```sh
python3 public-patcher/build_page.py
```

The output is public-output/Kaizo_Baconmon_Patcher.html. Copy it to index.html to update the hosted page. The builder embeds the current manifest, payload, JavaScript, presets, JARs, help text and licence notices; it does not need a ROM.

To rebuild the Java adapter with a Java 17+ JDK:

```sh
python3 public-patcher/randomizer/build_bridge.py
python3 public-patcher/build_page.py
```

The adapter targets Java 8 bytecode. The UPR-ZX engine is retained unmodified, with its exact corresponding v4.6.0 source archive.

## Patch manifests and ROM inputs

The checked-in manifest.json and payload.txt are the inputs for the page build. Regenerating compatibility signatures with build_manifest.py requires the original development inputs and helpers, which are not all included in this public package: clean US FireRed 1.1, the Faster FireRed patch, the audited Baconmon reference builds, symbol metadata, native build helpers and earlier fixtures.

The ROM-dependent scripts retain their expected project-relative paths. They are supplied for inspection and development with those inputs; a clean checkout alone cannot run the complete native test suite or recreate all ROM signatures.

Feature application uses local hook, script and allocation guards. Matching features apply independently where possible; conflicts are reported as skipped. The patcher preserves unrelated seed data, expanded ROM bytes and detected copier headers. A matching byte layout does not guarantee that every feature of another hack will work at runtime.

Shared support installs code and scripts without enabling unticked gameplay entry points. Changing the feature combination is intended for fresh runs. The patcher does not migrate or remove old save data.

## Browser randomiser

The beta randomiser uses unmodified UPR-ZX 4.6.0 through BaconBridge and CheerpJ 4.3. CheerpJ loads from the vendor on first use; patching itself remains offline.

Each generated ROM starts from the same patched base. The root seed, per-ROM seeds, selected options, engine, settings and hashes identify reproducible output. Selected rival levels are checked again after randomisation.

Batches accept 1–100 ROMs, defaulting to 10, and 1–100 batches. ZIP parts contain up to 10 ROMs. Part boundaries preserve numbering and seed order, and only the latest ZIP link is retained in memory. Spoiler logs are packaged separately.

## Verification

[Recorded reports](../reports/README.md) describe the scope of each check. Historical reports are not a claim that every test was rerun for the current documentation update.

- Compatibility and export checks cover independent feature selection, guards, preserved seed data, BPS output and undo round trips.
- Desktop mGBA checks cover selected game behavior, guide navigation, normal Save/Continue, field helpers and the lab status repair in both modes.
- Real desktop browser generation covered two 10-ROM batches and an 11-ROM batch split into 10+1. Equal seeds matched across batch and part boundaries.
- The 100-ROM scheduling, numbering and retry checks used a stub engine. An actual 100-ROM batch and a complete campaign playthrough are outside those results.
- Automated desktop reports do not establish physical Android installation, layout, touch or controller coverage. Manual device results are separate from those checks.

Verification scripts are in public-patcher/. JavaScript checks use Node.js; browser checks also require Playwright. Native and field checks need the earlier ROM fixtures and emulator/native harness. Generated output is written to public-output/ and randomizer-work/.

The lab status repair is implemented in status_refresh.py and status_refresh.s. It replaces the Oak/tutorial controller's empty status-icon handler, redraws on the normal status-update command and completes the command through the Oak controller. It also removes the earlier action-menu workaround. It does not change Pokémon data or the save format.

## Downloads and saves

The patcher can export a separate ROM, patch notes, an exact-input BPS patch, an undo patch and a detailed report. Undo restores the ROM, not save progress. Preserve normal battery saves and their matching ROM filenames when changing versions; old emulator states are not a save-migration mechanism.

The source ZIP contains the same public files as the repository, excluding generated working directories and the ZIP itself. Rebuild the page before repackaging it.

[User guide](Patcher_Guide.md) · [Credits and permissions](../Credits_and_Permissions.md) · [Development disclosure](../README.md#disclosure)
