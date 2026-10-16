# Working on the patcher

This repo has the browser patcher, its patch data, the randomiser integration and the test reports. You can rebuild the HTML page from these files. Rebuilding the ROM patches needs the original development inputs as well.

## Where things live

| Path                                 | What's in it                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| index.html                           | The complete patcher used by GitHub Pages.                                   |
| public-patcher/                      | The patching code, page builder, HTML templates, CSS and tests.              |
| public-patcher/randomizer/           | UPR-ZX 4.6.0, its source, presets and the Java adapter.                      |
| patch-work/                          | The byte, hash and BPS tools used to check patch exports.                    |
| reports/                             | Results from the recorded browser, compatibility and desktop emulator tests. |
| notices/ and public-patcher/notices/ | The original licence notices.                                                |
| scripts/package_source.py            | Rebuilds the public source ZIP.                                              |

The source ZIP is a copy of the public files. It contains no playable ROM, APK or save.

## Build the page

From the repo folder, run:

```sh
python3 public-patcher/build_page.py
```

This only needs Python 3 and the files already in the repo. It writes public-output/Kaizo_Baconmon_Patcher.html. Copy that to index.html when updating the website.

The builder puts the scripts, patch data, presets, Java files, help and licence notices into one HTML file. The layout and wording are in page_template.html, help_template.html and batch_template.html. The stylesheet is patcher.css.

The in-game rule articles come from guide_content.json. The patch signatures and payload are generated data, so they keep their existing compact format.

## Keep the formatting consistent

The first-party JavaScript, HTML and CSS use Prettier. Python uses Black. Install the pinned development tools with:

```sh
npm ci
python3 -m pip install -r requirements-dev.txt
```

Use npm run format to apply the formatting, or npm run format:check to check it. The original third-party source and licence files keep their upstream formatting.

## Java adapter

To rebuild BaconBridge with a Java 17+ JDK:

```sh
python3 public-patcher/randomizer/build_bridge.py
python3 public-patcher/build_page.py
```

The adapter targets Java 8. The UPR-ZX 4.6.0 engine is unmodified, and its matching source archive is included.

## ROM patch data

The page build uses the existing manifest.json and payload.txt. Regenerating those with build_manifest.py needs the original ROMs, Faster FireRed patch, audited Baconmon builds, symbol files, native helpers and earlier test fixtures. Those inputs aren't all in this public package.

The patcher checks each feature's hooks, scripts and required space. Matching features can be applied; conflicting ones are skipped and listed in the notes. Unrelated seed data, expanded ROM bytes and detected copier headers are preserved. Matching checks still can't guarantee that every part of another hack will work in-game.

The shared support only enables the features selected. Change the setup for a fresh run; the patcher doesn't migrate or remove old save data.

## Randomiser

The beta uses UPR-ZX 4.6.0 through BaconBridge and CheerpJ 4.3. CheerpJ loads from its vendor the first time, so randomisation needs internet. Patching works offline.

Every new ROM starts from the same patched base. The same base, options, engine, settings and root seed should produce the same outputs. The manifest records those details, hashes and each ROM's seed. Selected rival levels are checked again after randomisation.

Choose 1–100 ROMs per batch and 1–100 batches. The default is 10 ROMs. ZIP parts hold up to 10 ROMs, with numbering and seed order kept across parts. Only the latest download link is kept in memory. Spoiler logs stay in their own folder.

## Tests

[The reports folder](../reports/README.md) explains what was checked. Each report records a particular test run; an older report doesn't mean that test was rerun for every later edit.

The desktop checks cover patch selection, preserved data, BPS and undo exports, selected game features, guide navigation and normal Save/Continue. Browser generation covered two 10-ROM batches and an 11-ROM batch split into 10+1. Matching seeds gave matching ROMs across those boundaries.

The 100-ROM scheduling and retry tests use a stub engine. They don't measure a real 100-ROM batch. A full playthrough and physical Android layout, touch and controller checks are outside those desktop reports.

Tests are in public-patcher/. JavaScript tests use Node.js, and browser tests also need Playwright. The native tests need the earlier ROM fixtures and emulator harness. Test output goes to public-output/ and randomizer-work/.

Run the batch scheduling checks with:

```sh
npm run build
npm run test:batch
```

The lab status fix is in status_refresh.py and status_refresh.s. It redraws status icons through the Oak/tutorial controller and removes the earlier action-menu workaround. It doesn't change Pokémon data or the save format.

## Reusing the ROM changes

The [reuse licence](../LICENSE.txt) covers my original ROM changes. The patcher and randomiser software keep their existing MIT/GPLv3 terms. Don't apply the custom non-commercial conditions to that software or third-party material. See [credits and permissions](../Credits_and_Permissions.md) before reusing anything in another project.

## Package an update

Rebuild the page, copy it to index.html, then run:

```sh
python3 scripts/package_source.py
```

This packs the public files into Kaizo_Baconmon_Patcher_Source.zip, leaving out generated working folders and the ZIP itself.

[User guide](Patcher_Guide.md) · [Credits and permissions](../Credits_and_Permissions.md) · [Development disclosure](../README.md#disclosure)
