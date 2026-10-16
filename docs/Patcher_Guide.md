# Using the Baconmon patcher

## Patch a ROM

1. Open index.html in a current browser.
2. Choose your ROM. US FireRed 1.1 is the tested base.
3. Leave Core Baconmon Package ticked for the full setup, or untick the bits you don't want. The lab rival defaults to level 8; you can choose any whole number from 1 to 100.
4. Click Check and apply.
5. Read the patch notes to see what worked, what was already there and what was skipped.
6. Download your patched ROM and keep the original.

The patcher makes a separate copy and leaves your saves alone. Save normally before changing ROMs, keep a backup, and continue from the in-game save. An old save state can put you back into the previous version's code.

You can try other modified ROMs. Matching changes are applied and conflicts are skipped. Some hacks may have nothing that matches. I can't guarantee compatibility with a particular hack, so read the output log before playing.

## Make new seeds

Patch a fresh, unrandomised FireRed 1.1 copy first. Keep that as your base for new runs. Don't randomise a run you're already playing.

Open Batch randomiser (beta), choose your preset and set the batch seed if you want. You can make 1–100 ROMs per batch and 1–100 batches. Larger batches download in ZIP parts of up to 10 ROMs. Download each part before continuing so the browser doesn't have to hold the whole batch at once.

Kaizo, Standard and Ultimate use UTDZac's published FireRed settings. Encounters only changes wild species. Custom lets you paste a compatible settings string. Pick the settings for the challenge you're playing.

Each ZIP includes numbered ROMs, seeds, settings and patch notes. Spoiler logs are kept in a separate folder for after the run. To reproduce the results, keep the same base ROM, options, engine, settings and seed.

The randomiser loads CheerpJ the first time, so you'll need internet. Generation then runs in your browser. It has worked in desktop Chrome and Android Chrome testing; Android is slower.

You can also use [UPR-ZX on PC](https://github.com/Ajarmar/universal-pokemon-randomizer-zx/releases) or [UPR-Android](https://github.com/champred/UPR-Android/releases), with the matching [FireRed Ironmon settings](https://gist.github.com/UTDZac/a147c497424dfbd537d8c4b0c22b5621). There's more setup help in the patcher's dropdowns.

If you choose a custom rival level, check it after randomisation. Later randomisation can change it; patch the finished seed with your chosen level if needed. The default level-8 option has its own correction during play.

## Rules and points

I included the VS-style points because I find tracking progress and chasing a PB more fun than only counting a Champion win. Kaizo Ironmon can take dozens, hundreds or even thousands of attempts. Points give you smaller milestones to aim for, a way to see yourself improving, and something to compete over with friends—even when nobody wins the seed.

The in-game log keeps the current run's score. Keep a note of your PB to compare attempts.

The full Baconmon rules are in the patcher's dropdowns and the Nuz-guide key item. The guide also covers other challenges, Classic and Modern, credits and scoring.

The maximum score is 33. Dungeon bonuses need every required trainer in one visit, without leaving unfinished or using a Pokémon Center-equivalent heal. The Silph bed and ship healer are still banned.

The log can't check every catch, move or item. You still need to follow the rules. The guide explains the full package, including any extras you've unticked.

Classic keeps Gen 3 battle mechanics. Modern adds the move-based physical/special split and updates the existing abilities listed in the guide. Fairy typing is intentionally omitted.

## Downloads and backups

When something changes, you can download the patched ROM, patch notes, a BPS patch, an undo patch and a detailed report. The BPS and undo patches work with those exact ROM versions. Undo restores the ROM file; it doesn't undo save progress.

If nothing matches, you'll still get the notes and report. Your original stays as it was.

## Reusing Baconmon changes

You're welcome to use my original ROM changes in your own project under the [reuse licence](../LICENSE.txt): no sale or monetisation, credit xbaconator9000x, notify me before sharing it, and don't use the work to degrade, discriminate against or intentionally harm anyone. Just playing privately doesn't require a credit or message. This only covers my contributions; the patcher software and other creators' work keep their own terms.

[Credits and permissions](../Credits_and_Permissions.md) · [Developer notes](Developer_Notes.md)
