# Baconmon / Babymon development beta

Open [the browser beta](https://xbaconator9000x.github.io/Kaizo-Baconmon/babymon-beta.html), or download `babymon-beta.html` and open it locally. The stable root patcher remains available separately.

Choose evolution support to enable the Celadon trade attendant, direct-use trade evolution items, evolution-item shop access and a manual Day/Night clock at the left lab computer. Select the Babymon batch profile for Tier 1 starters and deterministic Tier 1 → Tier 2 → Tier 3 destinations. Start a fresh run.

## Player-managed challenge rules

Choose your starter using your preferred method. For a rules-compliant Babymon attempt, choose before revealing it, keep the same runner and treat its faint as the end of the run. The patcher does not force blind selection, lock the party or install an automatic Attempt Over screen. This supersedes the mandatory guard in the earlier restriction beta.

## Testing and limits

The archived 30 October development report recorded targeted mGBA execution checks of evolution services and Slowpoke → Scyther → Beedrill with controlled fixtures. Those are historical checks, not new runtime verification of this published build. The attempt guard from that build has been removed from the published source and randomisation path.

Remaining work includes restricted Gym TM provenance and Move Reminder payment, Sketch restrictions, starting-move viability and healing/ability policy audit, separate scoring, natural playthrough coverage and Android testing. Do not interpret generation success as proof of a challenge-legal run. Day/Night is a manual evolution clock, not automatic real-time visual day/night.

## Publication checks (31 October 2026)

- JavaScript syntax passed.
- Embedded 386-species data passed 100-seed deterministic planner/writer checks on synthetic ROM fixtures: starters in Tier 1, destinations in the next tier, terminal Tier 3 tables, unchanged input, and no attempt-guard hook/payload writes.
- Batch sizes 1/10/11/20/100, multiple batches, ZIP parts, numbering, retries and limits passed for the beta and rebuilt stable page. Java generation is stubbed in this scheduling test.
- No new emulator playthrough or Android check was performed in this publication session.

## Rebuild

Run `python3 scripts/build_beta.py`. The beta source is preserved in `public-patcher/beta/page.html` and `public-patcher/beta/runtime.js`, independently of the stable page builder. The embedded native evolution payload and species data are included in the runtime source. No game ROM is distributed.
