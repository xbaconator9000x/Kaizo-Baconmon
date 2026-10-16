# Kaizo Baconmon

**Ironmon, but tastier.**

Kaizo Baconmon is my own little take on Kaizo Ironmon, inspired mainly by Ironmon VS, with a few extra QoL changes I wanted for my runs.

I drew heavily from DrMaple's fantastic Faster FireRed 1.3.2 build. He has kindly given me permission to utilise and modify aspects of it for Baconmon.

The patcher lets you use the full **Core Baconmon Package**, or untick the bits you don't want. You can use the extras for ordinary Nuzlockes, Ironmon or your own rules.

## Classic vs Modern

Same Pokemon, levels, stats and moves in each comparison. Only the mode changes. These are controlled emulator battles; the end frames pause so you can read the result.

### Shadow Ball: Attack or Sp. Atk?

![Gengar uses Shadow Ball against the same Banette in Classic and Modern. Banette survives in Classic and faints in Modern.](docs/media/classic-modern-shadow-ball.gif)

Shadow Ball is physical in Classic and special in Modern. Gengar gets a lot more out of that Sp. Atk stat.

### Sturdy gets an upgrade

![A full-health Geodude takes Water Gun in both modes. It faints in Classic and hangs on with 1 HP using Sturdy in Modern.](docs/media/classic-modern-sturdy.gif)

Same hit, different outcome. Modern Sturdy saves a full-health Geodude from a knockout. Classic Sturdy only blocks one-hit KO moves.

## A few extras

| Happiness machine | Nuz-guide | Move details: press L |
| --- | --- | --- |
| <img src="docs/media/happiness-machine.png" alt="Oak's lab happiness machine with Maximise, Plummet and Cancel options" width="260"> | <img src="docs/media/nuz-guide.png" alt="The open Nuz-guide with its challenge, score and information sections" width="260"> | <img src="docs/media/battle-move-details.png" alt="The in-battle Shadow Ball details panel with category, type, power, accuracy and description" width="260"> |
| Make your lead Pokemon like or hate you more. | Rules, challenge guides and your score log. | Check a move without leaving the battle. |

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

The current patcher is **Release build 1.0**:

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

The patcher software keeps its existing MIT/GPLv3 terms. The original projects keep their own terms too; their notices are included.

## Reusing my changes

You're welcome to use my original Baconmon ROM changes in your own non-commercial project. Credit **Kaizo Baconmon by xbaconator9000x** and keep the [reuse licence](LICENSE.txt) with the material. No notification or separate approval is required. Just playing privately doesn't require a credit or message.

I'd love to see what you make, and I ask that you use the work respectfully. [A note on reuse](Reuse_Statement.md) explains those personal requests; they aren't extra licence conditions.

That permission only covers rights I hold in my own contributions. Pokémon and the original game content belong to their respective rights holders. Other creators' work needs its own permission; DrMaple's permission for Baconmon doesn't automatically extend to another project. This isn't permission to distribute complete game ROMs, and it doesn't withdraw permissions already granted under other licences.

## Disclosure

I am not the best coder, and so I accessed external tools and advice to help with development. In some cases this included AI-assisted tools that helped with general guidance, coding, scripting, debugging, testing, and some text/title-screen graphics. The patcher itself was entirely created using ChatGPT with my directed input. AI useage was otherwise minimal and was not used when reasonably avoidable. I am hesitant to support the use of AI tools in any creative project. Without such tools in this case, I am not sure I would have ever figured out how to implement this project. All creative input was contributed by myself and the aforementioned sources.
