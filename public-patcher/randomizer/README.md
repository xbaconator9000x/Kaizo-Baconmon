# Kaizo Babymon integration pack

This folder contains the portable pieces needed to add a Kaizo Babymon preset to an existing FireRed randomiser.

Babymon is not a replacement randomiser. It uses the existing randomiser for ordinary randomisation, then applies a deterministic adapter for the Babymon-specific parts:

1. Load the supplied UPR-ZX-compatible Kaizo settings.
2. Choose a Tier 1 starter from the manifest.
3. Generate the normal randomised seed.
4. Apply the seed-consistent Tier 1 -> Tier 2 -> Tier 3 evolution table.
5. Record the seed, settings and destination table.

Use Babymon_Integration_Pack.json as the machine-readable entry point. The existing portable planner and FireRed writer remain the reference implementation. A settings string by itself is insufficient because ordinary randomiser settings cannot encode Babymon's forced cross-family evolution destinations.

For another randomiser, keep the same manifest pools, deterministic planner output and evolution rules, then map National Dex IDs to that engine's internal species IDs. The provided FireRed writer is only for the original US FireRed Rev 1 table layout; expanded or relocated engines must supply their own validated writer.

The complete browser patcher remains available for users who want the full Kaizo Baconmon feature package. This pack is for randomiser developers who want to expose Babymon in their own tools.
