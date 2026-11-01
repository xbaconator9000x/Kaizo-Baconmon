# Babymon batch randomisation repair

The main public page previously offered a Babymon run profile but still used the ordinary Java randomiser entry point. The dedicated Tier 1 starter bridge and per-seed tiered evolution writer existed only in `babymon-beta.html`. Title-art validation alone did not establish Babymon ruleset generation.

The main page, standalone download and beta now use one canonical profile-aware runtime. A named Babymon randomiser preset selects the Babymon run profile; the Kaizo battle settings string remains the basis, while the dedicated bridge supplies valid starters and the postprocessor writes the tiered evolution tables. Evolution services required for those tables are installed before generation. Changing the profile invalidates the current batch session.

`test_babymon_batch.cjs` executes the real generated HTML batch button handler using a small DOM adapter. It replaces browser-Java transport with local Java execution of the exact embedded engine and bridge JARs; randomisation, patching, evolution planning, ROM writes and ZIP generation are real. This is not an Android/CheerpJ performance test.

For **each** public page, two batches containing two ROMs were generated. The test inspects the actual downloadable ZIPs, all starter-script references and every species/branch in the ROM evolution table. It verifies Tier 1 starters, every destination in the next tier, no Tier 3 evolution, the exact planned methods and destinations, four distinct outputs, and matching seed/checksum manifests. Ordinary `generateSafe` is rejected by the adapter so accidental fallback fails the test. The existing title selection/protection checks also pass.

Run:

```sh
npm run build
node public-patcher/test_babymon_batch.cjs INPUT.gba TEMP_OUTPUT
```

Requires local Java 17 with source-file launching support. ROMs, seeds' spoiler logs and JAR test copies remain in the temporary output directory and are not distributed here. This validates batch configuration and generated tables, not every evolution's in-game trigger or the entire challenge ruleset.

## Core preset overhaul (1 November 2026)

Babymon is the default core preset; the original Baconmon run is labelled Ironmon VS+. Both URLs deliver the same build. The real-Java batch check was rerun for eight ROMs, including full-package selection, reselecting Babymon after customising features, and leaving Babymon for another randomiser. All tier, manifest and title-selection checks passed. Portable tier data and planner are documented in `docs/Randomiser_Integration.md`. This does not claim a new Android or full playthrough test.
