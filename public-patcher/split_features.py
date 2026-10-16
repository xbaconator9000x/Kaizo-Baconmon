"""Independent activation switches over the shared, guarded support code.

Only verified entry points are changed. Unused shared code stays inert.
"""

import json, hashlib
from pathlib import Path

R = Path(__file__).parent
ROOT = R.parent
FEATURES = [
    (
        "modern",
        "Classic / Modern",
        "Choose Classic or Modern in Oak’s lab. Off keeps Gen 3 battle mechanics and removes the mode prompt. Note: Fairy typing is intentionally omitted.",
    ),
    (
        "lab",
        "Lab start and early balls",
        "Choose player details, start ready in Oak’s lab, and receive the early Master Ball and five Poké Balls. Off uses the original opening and bedroom start.",
    ),
    ("rotation", "Early encounter rotation", "Use the Ironmon VS early encounter rotation."),
    (
        "hms",
        "Field HMs and Town Map Fly",
        "Use HMs without teaching them, with the usual HM, badge and story prerequisites. Fly from the Town Map.",
    ),
    (
        "friendship",
        "Friendship machine and helpers",
        "Use the lab machine to raise or lower friendship. Helpers point to the machine. Off disables the added friendship services.",
    ),
    (
        "guide",
        "Nuz-guide and score log",
        "Give the guide key item and record progress, dungeon visits and full heals. Off installs neither the item nor its monitoring hooks.",
    ),
    (
        "battleinfo",
        "Battle move descriptions and category icons",
        "Press L at move selection for descriptions, and show move categories on the summary screen.",
    ),
    (
        "relearner",
        "Fuchsia move relearner",
        "Add the TM-paid relearner opposite the move deleter. Off leaves the original house and Two Island tutor arrangement.",
    ),
]


def configure(m, C, F, T, profiles):
    S = json.loads((ROOT / "source/source/work-v09/native/original-symbols.json").read_text())
    M = json.loads((ROOT / "source/source/work-v09/native/modern-symbols.json").read_text())
    v = json.loads((ROOT / "source/output/Kaizo_Baconmon_v0.9.4_Validation.json").read_text())[
        "BASE"
    ]
    states = []

    def state(feature, a, n, off=None):
        if off is None:
            off = F[a : a + n]
        assert len(off) == n
        known = list(
            dict.fromkeys(
                [C[a : a + n].hex(), F[a : a + n].hex(), T[a : a + n].hex(), bytes(off).hex()]
            )
        )
        states.append(
            dict(
                feature=feature,
                offset=a,
                length=n,
                on=list(T[a : a + n]),
                off=list(off),
                shared_required=0x710000 <= a < 0x800000,
                accepted=[hashlib.sha256(bytes.fromhex(x)).hexdigest() for x in known],
            )
        )

    # All modern dispatch functions, including the text/ability compatibility hooks.
    for name in M:
        if name.startswith("Dispatch_"):
            fn = name[len("Dispatch_") :]
            a = (S[fn] & ~1) - 0x8000000
            n = next(
                r["length"]
                for g in m["groups"]
                if g["id"] == "core"
                for r in g["records"]
                if r["offset"] == a
            )
            state("modern", a, n)
    for fn in ["SetWildMonHeldItem", "BattleStringExpandPlaceholders"]:
        state("modern", (S[fn] & ~1) - 0x8000000, 12)
    # Force category helpers to report Classic even if an old save contains the Modern variable.
    a = (M["Bacon_IsModern"] & ~1) - 0x8000000
    state("modern", a, 4, bytes.fromhex("00207047"))
    # Oak's frame script owns the mode prompt; it works with either opening.
    state("modern", 0x169000, 4, C[0x169000:0x169004])
    for a, n in [
        (0x54968, 24),
        (0x54A14, 10),
        (0x54B80, 4),
        (0x12EF04, 4),
        (0x12F8F4, 4),
        (0x16905B, 1),
    ]:
        state("lab", a, n, C[a : a + n])
    # Rotation changes the encounter picker and its caller, not the randomized encounter tables.
    for a, n in [(0x8087C, 4), (0x82B60, 4)]:
        state("rotation", a, n)
    for a, n in [
        (0x5C850, 8),
        (0x6C0CC, 4),
        (0xA1CC6, 4),
        (0xA1CF2, 4),
        (0xC525E, 4),
        (0xC526E, 4),
        (0x1326B6, 4),
    ]:
        state("hms", a, n)
    events = S["PalletTown_ProfessorOaksLab_MapEvents"] - 0x8000000
    for a, n in [(events + 3, 1), (events + 16, 4)]:
        state("friendship", a, n, C[a : a + n])
    for fn, n in [
        ("ViridianCity_EventScript_DreamEaterTutor", 5),
        ("PalletTown_ProfessorOaksLab_EventScript_Aide3", 5),
    ]:
        a = S[fn] - 0x8000000
        state("friendship", a, n, C[a : a + n])
    # The Faster foundation also has a friendship event. End it when the service is off.
    state("friendship", 0x71B4C0, 14, b"\x02" + T[0x71B4C1:0x71B4CE])
    for h in v["hooks"]:
        if h["name"] == "CreateNPCTrainerParty":
            continue
        a = h["address"] - 0x8000000
        state("guide", a, 8, F[a : a + 8])
    a = S["gItems"] - 0x8000000 + 347 * 44
    state("guide", a, 44, F[a : a + 44])
    a = S["sItemIconTable"] - 0x8000000 + 347 * 8
    state("guide", a, 8, F[a : a + 8])
    for fn, n in [
        ("HandleInputChooseMove", 12),
        ("RunHelpSystemCallback", 12),
        ("PokeSum_DrawMoveTypeIcons", 12),
        ("PokeSum_PrintSelectedMoveStats", 12),
    ]:
        state("battleinfo", (S[fn] & ~1) - 0x8000000, n)
    for a, n in [(0x3BC4E4, 8), (0x3BE690, 1)]:
        state("relearner", a, n, F[a : a + n])
    # Keep exact feature guards, but mask other independently selectable entry points.
    # Every masked entry point is separately checked against known complete byte strings.
    for g in m["groups"]:
        for guard in g["records"] + g["guards"]:
            a = guard.get("guard_offset", guard["offset"])
            n = guard.get("guard_length", guard["length"])
            z = a + n
            relevant = [
                i for i, s in enumerate(states) if s["offset"] < z and s["offset"] + s["length"] > a
            ]
            mask = sorted(
                {
                    at - a
                    for i in relevant
                    for at in range(
                        max(a, states[i]["offset"]),
                        min(z, states[i]["offset"] + states[i]["length"]),
                    )
                }
            )
            if not mask:
                continue
            guard["toggle_states"] = relevant
            guard["toggle_mask"] = mask
            hashes = set()
            for p in profiles:
                d = bytearray(p[a:z])
                for i in mask + guard.get("mask", []):
                    d[i] = 0
                if p[0xFF01E3] == 0x44:
                    for i in guard.get("gift_mask", []):
                        d[i] = 0
                hashes.add(hashlib.sha256(d).hexdigest())
            guard["accepted"] = sorted(hashes)
    # Keep activation writes out of the shared stage. A conflicting selected
    # feature can then be skipped without blocking other independent switches.
    core = next(g for g in m["groups"] if g["id"] == "core")
    for r in core["records"]:
        a = r["offset"]
        z = a + r["length"]
        owners = {s["feature"] for s in states if s["offset"] < z and s["offset"] + s["length"] > a}
        if owners and all(
            any(s["offset"] <= at < s["offset"] + s["length"] for s in states) for at in range(a, z)
        ):
            assert len(owners) == 1, (hex(a), owners)
            r["activation_owner"] = next(iter(owners))
        if a == m["rival_normalizer"]["offset"]:
            r["activation_owner"] = "rival"
    m["core_features"] = [dict(id=k, name=name, detail=detail) for k, name, detail in FEATURES]
    m["switches"] = states
    return m
