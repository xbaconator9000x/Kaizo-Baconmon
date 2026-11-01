# Kaizo Babymon core patcher notes

[Open Kaizo Babymon](https://xbaconator9000x.github.io/Kaizo-Baconmon/). The former beta URL is retained only as a compatibility link and delivers this same core patcher. There is no separate beta workflow.

Select Babymon in either menu to select the full feature package and dedicated batch randomisation. The original Baconmon challenge is named **Ironmon VS+**; the ROM remains Kaizo Baconmon.

[Randomiser configuration and reusable integration](Randomiser_Integration.md) · [Challenge rules](Kaizo_Babymon_Spec.md) · [Batch checks](../reports/babymon-batches/README.md)

Blind starter selection, no pivoting, permadeath and Gym TM legality are player-managed. The game does not lock parties or automatically end attempts. The existing score log uses VS-style scoring. Separate Babymon scoring and automatic TM provenance/payment checks are not supplied. Day/Night is a manual evolution clock.

Build with `npm run build`. Canonical sources are `public-patcher/runtime.js` and `public-patcher/release/page.html`; both URLs use the same generated page. No game ROM is distributed.
