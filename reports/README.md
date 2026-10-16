# Verification reports

These JSON files retain the recorded results of patcher, browser, native and desktop emulator checks. Read each file's scope and limitations alongside its results. Reports from earlier checks are retained for reference; they are not a statement that the full suite was rerun for a documentation change.

| Reports | Coverage |
| --- | --- |
| Compatibility_Tests, Best_Effort_Compatibility_Tests | Input handling, guarded feature application and seed-data preservation. |
| Download_Tests | Exported files, patch notes and download behavior. |
| Selection_Tests, Independent_*, Faster_Separation_* | Feature switches and shared-support behavior. |
| Rival_Runtime_Tests | Lab rival level handling. |
| ROM_Emulator_Tests | Guide navigation, field helpers, normal saves and selected desktop game behavior. |
| Status_Refresh_Tests | Lab status-icon reproduction and repair. |
| Mode_Documentation_Checks, Credit_Text_Checks | In-game text layout and bounded text changes. |
| Randomiser_Tests, Batch_Browser_Tests | Recorded real browser generation and deterministic output. |
| Batch_Size_Tests | Stubbed large-batch scheduling, numbering, validation and retries. |

Capture filenames in ROM_Emulator_Tests identify images from the recorded run; those images are not included. Original machine paths have been omitted.

Desktop and stubbed checks do not establish a complete campaign playthrough, actual 100-ROM performance or physical Android device coverage. The verification scripts and their external input requirements are described in [Developer notes](../docs/Developer_Notes.md).
