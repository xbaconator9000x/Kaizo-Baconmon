# Kaizo Baconmon patcher

Developed by xbaconator9000x.

Open the HTML file in a current browser. Choose your ROM, then press **Check and apply**. Everything runs locally. The original file and saves are left alone.

## ROM patcher

Choose a GBA ROM to run the selected feature checks. Unfamiliar titles, headers, revision numbers and unrelated engine edits produce a notice instead of stopping the attempt. Matching changes are applied; conflicting scripts, hooks or occupied space are skipped and listed in the patch notes/changelog. The features are built around FireRed 1.1, so a different layout may have few matching changes or none. Selecting a ROM does not guarantee every feature will work on it.

**Core Baconmon Package** selects all gameplay options. Individual checkboxes control Classic/Modern, lab start and early balls, early encounter rotation, field HMs/Town Map Fly, friendship services, Nuz-guide/scoring, battle descriptions/category icons, and the Fuchsia TM relearner. Rival level is separate and accepts whole numbers from 1 to 100, defaulting to 8. Title graphics, Rock Tunnel, renewable hidden items, the forest nurse and custom dialogue also have their own choices.

Shared support relocates graphics away from injected code and installs required scripts when needed, but unchecked gameplay features have their entry points disabled. For example, Modern without the lab start still offers the mode choice when you enter Oak’s lab; turning Modern off restores Gen 3 battle hooks and removes the prompt. Turning the lab start off restores the original introduction and bedroom start. Nuz-guide off removes its grant and monitoring hooks; friendship off removes the machine’s events and disables the added friendship service. The relearner off setting restores the original house/tutor arrangement.

Shared support needs matching code, structures and available space. The broad engine fingerprint is advisory; a change elsewhere does not block a matching feature. Each gameplay switch checks its own hooks before activation. A conflicting hook skips that switch while other matching switches can be applied. Occupied shared code space can still block the features that need it. Changing feature combinations is tested for fresh runs. Keep an active run on its matching ROM and keep backups; no save migration or removal of old save data is performed. Independent title/lighting/item options left unticked leave existing modifications alone. The guide describes the standard full package even when extras are disabled.

Custom rival levels bypass the automatic level-8 correction. Apply them after randomization. The default level-8 correction remains in place with the default setting.

Expandable help covers the project, rules summary, full Baconmon rules, mode changes, Nuz-guide, scoring, and PC/Android randomization, with links to the original references. Android generation and automatic rerolling have not been tested on hardware. The separate batch beta can now randomize ROMs in the browser.

Randomized Pokemon, moves, learnsets, trainer species and other unrelated data are preserved. The lab rival's level and early ball gift are deliberate changes. Expanded 32 MB files are accepted without cutting off their extra data. Space used by another modification is not treated as empty space.

Matching scripts are not a guarantee that every ROM hack will work. Engine replacements, changed layouts or conflicting scripts can stop a feature from being installed. Read the notes before starting a run. A partial patch includes only the features marked Applied or Already present; the in-game Nuz-guide describes the full Baconmon rules and features.

Downloads produced by the patcher:

- **Patched ROM:** a separate copy of your ROM, when anything changed.
- **Patch notes/changelog:** notices and a list of changes applied, already present, skipped or not selected.
- **BPS patch:** repeats those exact changes on the exact input ROM.
- **Undo patch:** restores that exact original ROM from the patched copy.
- **Detailed report:** hashes, checks and changed locations for troubleshooting.

Save normally in-game and close the emulator before switching ROMs. Keep the original ROM and battery save. Copy or import the battery save as needed to match the new ROM filename. Continue from the normal in-game save, not an old save state. Undo patches restore ROM files, not save progress.

For a new run, you can patch first and then randomize the result. If you patch an existing randomized seed, the patcher keeps that seed's data except for the changes listed in its notes.

## Testing and source

The accompanying reports distinguish JavaScript compatibility checks, exported-file checks and desktop emulator checks. Desktop Chromium batch generation has been tested. Physical Android generation, touch and memory limits have not been tested.

The source ZIP contains the patcher code, embedded patch manifests, tests and notices. HTML files can be rebuilt from those manifests without distributing a full ROM. Regenerating the compatibility signatures needs the original reference inputs.

Credits: Faster FireRed by DrMaple; Ironmon by iateyourpie; Ironmon VS / WaffleSmacker and the VS community; Ironmon Tracker reference data by UTDZac, besteon and contributors; mGBA; pret/pokefirered as the engine reference. BPS export checks use Marc Robledo's Rom Patcher JS.

New Baconmon patcher components are MIT licensed. UPR-ZX, the Java adapter and randomiser integration are GPLv3; the combined program code is distributed under GPLv3 with the component notices retained. These code licences do not license all embedded ROM patch data. The unmodified UPR-ZX engine and its exact corresponding v4.6.0 source archive are included. CheerpJ is loaded from its vendor CDN under the Community License and is not redistributed in this download. No full ROM or personal save is included in the source ZIP.

See [Credits and reuse permissions](Credits_and_Permissions.md) for the checked upstream terms and developer contact links. DrMaple granted permission via Discord on 16 October 2026 to utilise and modify aspects of Faster FireRed 1.3.2 for Baconmon, and asked for a GitHub link when ready. The permission record is retained privately; it is not a new blanket licence for Faster FireRed. The browser page and source include the VS, tracker, randomiser and patch-tool code notices.

Patcher developed with guided assistance from AI tools (I don’t know how to code).

## Batch randomiser beta

Choose an unrandomized US FireRed 1.1 ROM, adjust the patch options, then open Batch randomiser. A root seed is generated when the page opens and can be replaced. Select Kaizo, Standard or Ultimate using the published FireRed settings, Encounters only for wild-species randomization, or Custom for a compatible 321-format settings string.

Choose 1–100 ROMs per batch and 1–100 batches. Each ZIP holds up to 10 ROMs; download each part before continuing. Parts preserve the original seed sequence and numbering across the complete batch. The page keeps only the latest ZIP link to limit memory use. Each ZIP contains numbered ROMs, a seed/settings manifest, patch notes and clearly separated spoiler logs. Never read the spoiler logs during a blind run.

The engine is pinned to unmodified UPR-ZX 4.6.0. Each ROM starts from the same patched base, rather than randomizing the previous output. Selected rival-level changes are checked again after randomization. A reproducible run needs the same base ROM, feature choices, engine, settings and root seed. The manifest records hashes and per-ROM seeds. Original ROMs and saves are not edited.

Patching remains offline. Randomization loads CheerpJ 4.3 from Leaning Technologies on first use and needs a connection. Generation then runs locally in the browser. Desktop Chromium has generated a real downloadable ZIP. Android performance and automatic rerolling are not tested.

Credits: UPR-ZX by Ajarmar, darkeye, cleartonic and contributors, based on Dabomstew’s Universal Pokémon Randomizer. Official FireRed Ironmon settings by UTDZac and contributors. Browser Java runtime: CheerpJ by Leaning Technologies.

## Battle status icons

The Battle status display option fixes FireRed’s empty status-icon handler in the Oak/tutorial controller used by the lab rival battle. It draws the icon as soon as the normal status-update command arrives, including paralysis, poison, bad poison, sleep, burn, freeze and cures. It preserves the Oak controller’s command-completion routine and waits for battle sound effects like the normal player controller.

The bug and correction were reproduced in the actual lab controller in desktop mGBA, in Classic and Modern. A controlled Sandstorm → Glare battle also reproduced the missing icon in the original and the visible icon in the fixed ROM. Android hardware confirmation remains outstanding. No save format or Pokémon data changes.

**Note:** Fairy typing is intentionally omitted. Modern mode retains the Gen 3 type roster.

## Compatibility checks

The patcher works on a separate copy and preserves the input size, any detected 512-byte copier header and unrelated data. It can produce a partial patch. If nothing matches, it makes no changes and still provides the notes and detailed report. An empty file, ZIP archive, image/save-state file, invalid rival level or damaged patch payload produces a specific input error.

There is no automatic port between game engines. The code-layout checks and local guards remain in place so an unmatched script is skipped rather than overwritten. Runtime compatibility with every ROM hack cannot be established from matching bytes alone. The batch randomiser is separate and still uses compatible, unrandomized FireRed inputs.

## Patcher beta update

The batch randomiser accepts 1–100 ROMs per batch, defaulting to 10. Larger batches download in ZIP parts of up to 10 ROMs. Download each part before continuing. Splitting the downloads keeps memory use down and doesn't change seed numbering or the generated ROMs.

Desktop Chromium generated and downloaded two 10-ROM batches and one 11-ROM batch in 10+1 parts. The same seeds produced identical ROMs across batch and ZIP-part boundaries. The 100-ROM scheduling, numbering and retry checks use a stubbed engine; an actual 100-ROM run and Android hardware still need testing. See Batch_Size_Tests.json and Batch_Browser_Tests.json.

The compatibility blurb is shorter, and the project explains why VS-style points were included: personal progress, chasing PBs and competing with friends. The game itself is unchanged by this patcher update.

## Hosting

The website bundle can be hosted on GitHub Pages. Extract its contents to a public repository and enable Pages from the chosen branch and folder. Keep index.html, the source ZIP and this document's linked permissions file together. Patching and seed generation stay in the visitor's browser.
