# Using the Baconmon patcher

## Patch a ROM

1. Open index.html in a current browser.
2. Choose your ROM. FireRed 1.1 is the tested base.
3. Leave Core Baconmon Package selected for the standard setup, or untick the features you don't want. The lab rival defaults to level 8; you can choose a whole number from 1 to 100.
4. Click Check and apply.
5. Read the patch notes. They list what was applied, already installed, skipped or left unticked.
6. Download the new ROM. Keep the notes and your original files.

The patcher works on a copy. It doesn't change your saves. Save normally before changing ROMs, keep a backup, and continue from your normal in-game save rather than an old save state.

You can try a different modified ROM. Matching features are applied and conflicting changes are skipped. Some hacks may have no matching features at all. Read the notes before playing; matching checks don't guarantee every part of another hack will work.

## Randomise a new run

Patch a fresh, unrandomised FireRed 1.1 copy first. Keep that patched copy as your base for new seeds. Don't randomise an active run again.

Open Batch randomiser (beta), choose a preset and adjust the batch seed if you want. You can choose 1–100 ROMs per batch and 1–100 batches. Large batches download in ZIP parts of up to 10 ROMs. Download each part before continuing; this keeps the browser from holding the entire batch in memory at once.

The Kaizo, Standard and Ultimate presets use UTDZac's published FireRed settings. Encounters only changes wild species. Custom accepts a compatible settings string. Choose settings for the challenge you're actually playing.

Each batch includes numbered ROMs, seeds, settings and patch notes. Spoiler logs are in a separate folder for after the run. Keep the same base, options, engine, settings and seed if you want to reproduce the output.

The browser randomiser loads CheerpJ from its vendor on first use, so it needs an internet connection. Generation then runs in your browser. It has been tested on desktop Chromium; performance on an actual Android device still needs testing.

You can also use [UPR-ZX on PC](https://github.com/Ajarmar/universal-pokemon-randomizer-zx/releases) or [UPR-Android](https://github.com/champred/UPR-Android/releases). Use the matching [official FireRed Ironmon settings](https://gist.github.com/UTDZac/a147c497424dfbd537d8c4b0c22b5621) and follow the linked projects' instructions. The patcher has more setup help in its dropdowns.

If you choose a custom rival level, check it after randomisation. Later randomisation can change a custom level; patch the finished seed with your chosen value if needed. The default level-8 setting has its own correction during play.

## Rules and progress

I included the VS-style points because I find tracking progress and chasing a PB more fun than only counting a Champion win. Kaizo Ironmon can take dozens, hundreds or even thousands of attempts. Points give you smaller milestones to aim for, a way to see yourself improving, and something to compete over with friends—even when nobody wins the seed.

The in-game log tracks the current run. Keep a note of your PB to compare attempts.

The full Baconmon rules are in the patcher's dropdowns and the in-game Nuz-guide. The guide also explains other challenge types, Classic and Modern, credits and the score log.

Baconmon's VS-style maximum is 33 points. Dungeon bonuses require every required trainer in one visit, without leaving unfinished or using a Pokemon Center-equivalent heal. The Silph bed and ship healer don't become legal just because you can use them.

The log helps track progress; it can't prove that every catch, move or item was legal. The guide describes the full package even if you've switched some extras off.

Classic keeps Gen 3 battle mechanics. Modern adds the move-based physical/special split and updates the existing abilities described in the guide. **Note: Fairy typing is intentionally omitted.**

## Downloads and backups

When the patcher changes something, it offers the new ROM, patch notes, a BPS patch, an undo patch and a detailed report. The BPS and undo files are for those exact ROM versions. Undo restores the ROM, not your save progress.

If nothing matches, you still get the notes and report. Your original is left alone.

[Credits and permissions](../Credits_and_Permissions.md) · [Developer notes](Developer_Notes.md)
