# Kaizo Baconmon

**Ironmon, but tastier.**

Kaizo Baconmon is my own little take on Kaizo Ironmon, inspired mainly by Ironmon VS, with a few extra QoL changes I wanted for my runs.

I drew heavily from DrMaple's fantastic Faster FireRed 1.3.2 build. He has kindly given me permission to utilise and modify aspects of it for Baconmon.

The patcher lets you use the full **Core Baconmon Package**, or untick the bits you don't want. You can use the extras for ordinary Nuzlockes, Ironmon or your own rules.

## What's included?

- **Classic / Modern:** play with the original Gen 3 battle mechanics, or use the physical/special split and updated effects for the existing abilities. Pokemon, BSTs, learnsets and available abilities stay as they were. **Note: Fairy typing is intentionally omitted.**
- **Lab start:** still choose your gender, name and rival's name, then start in Oak's lab ready to pick your starter. Get one Master Ball and five Poke Balls early.
- **Rival level:** defaults to level 8 in the lab. You can choose anything from 1 to 100 in the patcher.
- **No HM friend needed:** use field HMs without teaching them. You still need the HM, badge and normal story requirements. Fly from the Town Map too.
- **Lit Rock Tunnel:** no Flash needed to see where you're going.
- **Move relearner:** sits opposite the Move Deleter in Fuchsia. Each remembered move costs one TM of your choice.
- **Friendship controls:** use Oak's lab machine to make your lead Pokemon like or hate you more.
- **Poison-friendly forest nurse:** she heals you even if you're poisoned.
- **Early encounter rotation:** early wild encounters rotate, inspired by Ironmon VS.
- **Hidden items:** chance-based hidden items appear at their normal refresh. This doesn't make farming them legal under the rules.
- **Move information:** press L while choosing an attack for its description. Physical, special and status symbols also appear in the move screens.
- **Nuz-guide:** an in-game key item with challenge guides, the full Baconmon rules, mode details, credits and a 33-point VS-style score log.
- **Baconmon title screen:** starring Grumpig, of course.

The guide explains the full Baconmon setup. If you change the options, agree on your rules before comparing runs with someone else.

## Why points?

I included the VS-style points because I find tracking progress and chasing a PB more fun than only counting a Champion win. Kaizo Ironmon can take dozens, hundreds or even thousands of attempts. Points give you smaller milestones to aim for, a way to see yourself improving, and something to compete over with friends—even when nobody wins the seed.

The in-game log tracks your current run. Keep a note of your PB to compare attempts.

## How to use it

You'll need your own FireRed 1.1 ROM. Open index.html in a current browser, choose your ROM and the features you want, then click **Check and apply**. Read the patch notes to see what worked and what was skipped.

The patcher makes a separate copy and leaves your original ROM and saves alone. The batch randomiser is a beta. Choose up to 100 ROMs per batch; large batches download in ZIP parts of up to 10 ROMs. Download each part before continuing. The randomiser needs an internet connection to load its Java runtime on first use.

[Full instructions](docs/Patcher_Guide.md)

The current version of the patcher is here:

https://xbaconator9000x.github.io/Kaizo-Baconmon/

## Beta testing

I'm new to romhack development and the Nuz-like scene generally, so feedback and guidance are very welcome! I'd especially like thoughts on the run rules and reports of anything that doesn't work properly.

Designed for maximum compatibility between ROMs. Changes that cannot be applied are skipped and listed in the output log. I can’t guarantee compatibility with any particular ROM. Designed for clean US FireRed 1.1 (Rev 1) or Faster FireRed 1.3.2; other modified ROMs may also work.

Desktop patching, upgrades, selected game features and browser seed generation have been tested. A full playthrough and seed generation on an actual Android device still need testing.

If something breaks, tell me what happened, how to reproduce it and include the patcher's detailed report. Please keep ROMs, saves and save states out of public issues.

## Credits

Developed by **xbaconator9000x**.

Thanks to DrMaple for Faster FireRed and permission to adapt it; iateyourpie for Ironmon; WaffleSmacker and the VS community for Ironmon VS; and UTDZac, besteon and contributors for the tracker reference data.

The browser randomiser uses UPR-ZX by Ajarmar and contributors, based on Dabomstew's randomiser, and CheerpJ by Leaning Technologies. Engine references come from pret/pokefirered. Testing uses mGBA and Rom Patcher JS, among other tools.

[Full credits and permissions](Credits_and_Permissions.md)

## Source

The patcher code, randomiser integration, tests and ROM patch data are included here and in the [source ZIP](Kaizo_Baconmon_Patcher_Source.zip). This isn't a full decompilation of the game. [Developer notes](docs/Developer_Notes.md) cover rebuilding and the test reports.

The new patcher code is MIT licensed. The randomiser integration is GPLv3. The original projects keep their own terms; their notices are included.

## Disclosure

I don't know how to code, so I've used AI-assisted tools to help with code, scripting, debugging, testing and some text and title-screen graphics. I directed the project and chose the features and rule changes.
