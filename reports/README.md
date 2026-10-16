# Test reports

These files record the patcher, browser and desktop emulator checks. Each report explains what it tested and its limits. Older results are kept for reference; they don't mean the whole suite was rerun for every later edit.

| Reports                                              | What they check                                                      |
| ---------------------------------------------------- | -------------------------------------------------------------------- |
| Compatibility_Tests, Best_Effort_Compatibility_Tests | Input handling, feature checks and preserved seed data.              |
| Download_Tests                                       | Downloads, patch notes and exported files.                           |
| Selection*Tests, Independent*_, Faster*Separation*_  | Feature switches and shared support.                                 |
| Rival_Runtime_Tests                                  | Lab rival levels.                                                    |
| ROM_Emulator_Tests                                   | Guide menus, field helpers, normal saves and selected game features. |
| Status_Refresh_Tests                                 | The missing lab status icons and their fix.                          |
| Mode_Documentation_Checks, Credit_Text_Checks        | In-game text layout and the text changes made.                       |
| Randomiser_Tests, Batch_Browser_Tests                | Browser generation and matching-seed results.                        |
| Batch_Size_Tests                                     | Scheduling, numbering, limits and retries with a stub engine.        |

Screenshot names in ROM_Emulator_Tests refer to captures from that test run. The images aren't included, and the original machine paths have been removed.

The desktop and stubbed checks don't cover a full playthrough, real 100-ROM performance or physical Android testing. [Developer notes](../docs/Developer_Notes.md) explain how to run the scripts and which extra inputs they need.
