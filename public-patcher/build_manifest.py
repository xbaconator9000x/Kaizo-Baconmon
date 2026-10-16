from pathlib import Path
import json, struct, zlib, base64, hashlib, sys

R = Path(__file__).parent
ROOT = R.parent
O = ROOT / "source/output"
sys.path.insert(0, str(ROOT / "intro-patcher"))
from build_patches import ips

C = (ROOT / "patch-inputs/Pokemon - Fire Red Version (U) (V1.1).gba").read_bytes()
F = ips(C, (ROOT / "patch-inputs/Faster.FireRed.1.3.2(1).ips").read_bytes())
T = (O / "Kaizo_Baconmon_v0.9.4_BASE.gba").read_bytes()
S = json.loads((ROOT / "source/source/work-v09/native/original-symbols.json").read_text())
original_target = T
documented_profiles = []
text_edits = json.loads((R / "rom_text_cleanup.json").read_text())
for edit in text_edits:
    if edit["article"] == "modern_split":
        documented_profiles.append(T)
    a = edit["offset"]
    T = T[:a] + bytes.fromhex(edit["after"]) + T[a + edit["length"] :]
previous_target = bytearray(T)
for edit in text_edits:
    for previous in edit.get("previous_after", []):
        a = edit["offset"]
        old = bytes.fromhex(previous)
        assert len(old) == edit["length"]
        documented_profiles.append(T[:a] + old + T[a + edit["length"] :])
        previous_target[a : a + edit["length"]] = old
if previous_target != T:
    documented_profiles.append(bytes(previous_target))
profiles = [C, F, original_target, T] + documented_profiles
for version in ["0.8.8", "0.9.0", "0.9.2", "0.9.3"]:
    for variant in ["BASE", "Run001", "CURRENT_RUN_0006"]:
        b = (O / f"Kaizo_Baconmon_v0.8.8_{variant}.gba").read_bytes()
        if version != "0.8.8":
            b = ips(b, (O / f"Kaizo_Baconmon_v{version}_UPGRADE_FROM_v0.8.8.ips").read_bytes())
        profiles.append(b)
profiles += [
    (O / f"Kaizo_Baconmon_v0.9.4_{v}.gba").read_bytes() for v in ["Run001", "CURRENT_RUN_0006"]
]
# Known mixed layouts with the optional Faster changes disabled. Keep the
# Baconmon bytes where it replaced a Faster byte; restore the original speed
# and dialogue surroundings elsewhere. These are local guard variants only.
fast_bytes = [
    a
    for a in range(0x700000)
    if C[a] != F[a]
    and not (0x2B7000 <= a < 0x2D0000 or 0x2D4D00 <= a < 0x2D5000 or 0x3AE3B0 <= a < 0x3AE3C8)
]
for p in [original_target, T] + documented_profiles:
    d = bytearray(p)
    for a in fast_bytes:
        if d[a] == F[a]:
            d[a] = C[a]
    profiles.append(bytes(d))


def ranges(bits):
    out = []
    i = 0
    while i < len(bits):
        if not bits[i]:
            i += 1
            continue
        a = i
        while i < len(bits) and bits[i]:
            i += 1
        out.append((a, i))
    return out


groups = {
    k: dict(id=k, name=name, detail=detail, records=[], guards=[])
    for k, name, detail in [
        (
            "support",
            "Map and script support",
            "Required asset relocations and shared data for the selected features.",
        ),
        (
            "faster",
            "Faster FireRed extras",
            "Optional speed and field tweaks; separate from lab start and the forest nurse.",
        ),
        (
            "core",
            "Shared Baconmon support",
            "Support for the selected Baconmon features. Gameplay switches are applied independently.",
        ),
        (
            "title",
            "Baconmon title screen",
            "Grumpig, Kaizo Baconmon and the FireRed title graphics.",
        ),
        ("tunnel", "Lit Rock Tunnel", "Light both Rock Tunnel floors."),
        (
            "hidden",
            "Guaranteed hidden items",
            "Remove the chance check from renewable hidden-item spawns.",
        ),
        (
            "nurse",
            "Poison-friendly forest nurse",
            "Allow the Viridian Forest nurse to heal a poisoned party.",
        ),
        ("text", "Baconmon dialogue", "The lab e-mail and the other custom dialogue."),
        (
            "rival",
            "Level 8 lab rival",
            "Set the three lab rival parties to level 8 without changing their species or moves.",
        ),
    ]
}


def classify(a):
    if 0x780100 <= a < 0x782200:
        return "core"  # retained older assets, unused by current title
    if (
        0x7A0000 <= a < 0x7B0000
        or 0x7D0000 <= a < 0x7E0000
        or 0x78AA8 <= a < 0x78AD4
        or 0x78FA4 <= a < 0x78FA8
        or 0x79204 <= a < 0x7920C
        or 0x796D4 <= a < 0x796DC
        or 0xEAD5E8 <= a < 0xEAD608
    ):
        return "title"
    if a in [0x34FB75, 0x34FB91]:
        return "tunnel"
    if 0x15D8F0 <= a < 0x15D8F4 or 0x15D900 <= a < 0x15D904 or 0x15D910 <= a < 0x15D914:
        return "hidden"
    if 0x755386 <= a < 0x75538B:
        return "nurse"
    if a in [0x23B862, 0x23B86A, 0x23B872]:
        return "rival"
    if 0x18EB6C <= a < 0x18EC70:
        return "text"
    return "core"


v = json.loads((O / "Kaizo_Baconmon_v0.9.4_Validation.json").read_text())["BASE"]
textsites = set()
for d in v["dialogue"]:
    for a in d["pointer_sites"]:
        textsites.update(range(a, a + 4))
variable = set([0x402290, 0x754B38, 0x754B44, 0x754C48])
gift = set(range(0xFF01E4, 0xFF01E8))
pool = []
index = {}


def blob(b):
    key = hashlib.sha256(b).digest()
    if key not in index:
        index[key] = len(pool)
        pool.append(b)
    return index[key]


def rec(a, b, after, group, existing=False):
    # Sixteen-byte context blocks detect neighbouring edits, not just the few changed bytes.
    ga = max(0, a - 16)
    gb = min(len(T), b + 16)
    # The chosen profile must agree on the entire block. Arbitrary combinations are not accepted.
    seen = []
    for p in profiles:
        d = bytearray(p[ga:gb])
        for at in variable | (gift if p[0xFF01E3] == 0x44 else set()):
            if ga <= at < gb:
                d[at - ga] = 0
        h = hashlib.sha256(d).hexdigest()
        if h not in seen:
            seen.append(h)
    groups[group]["records"].append(
        dict(
            offset=a,
            length=b - a,
            data=blob(after),
            guard_offset=ga,
            guard_length=gb - ga,
            accepted=seen,
            mask=[at - ga for at in variable if ga <= at < gb],
            gift_mask=[at - ga for at in gift if ga <= at < gb],
            preserve=[at - a for at in variable if a <= at < b],
        )
    )


def stage_kind(a, stage):
    if stage == "faster":
        if 0x3AE3B0 <= a < 0x3AE3C8:
            return "nurse"
        if a >= 0x700000 or 0x2B7000 <= a < 0x2D0000 or 0x2D4D00 <= a < 0x2D5000:
            return "support"
        return "faster"
    return "text" if a in textsites else classify(a)


def add_diff(before, after, stage):
    # Match complete runs with equal surrounding bytes; retain all unrelated input bytes.
    i = 0
    while i < len(after):
        if before[i] == after[i]:
            i += 1
            continue
        a = i
        kind = stage_kind(i, stage)
        i += 1
        while i < len(after) and (before[i] != after[i] or before[i : i + 8] != after[i : i + 8]):
            nxt = stage_kind(i, stage)
            if nxt != kind:
                break
            i += 1
        # Never copy the retired title bank over a randomizer's expanded learnsets.
        if 0x800000 <= a < 0x810000:
            continue
        if kind == "rival":
            continue  # resolved through the actual trainer party pointers at runtime
        rec(a, i, after[a:i], kind)


add_diff(C, F, "faster")
add_diff(F, T, None)
# Clear the complete edited text slot on upgrades, including padding that is
# already empty in a clean base. Otherwise an older, longer string can remain
# after the new terminator even though the visible text has been replaced.
for edit in text_edits:
    if not edit.get("clear_allocation"):
        continue
    a = edit["offset"]
    b = a + edit["length"]
    fragments = []
    for kind, g in groups.items():
        kept = []
        for r in g["records"]:
            lo = r["offset"]
            hi = lo + r["length"]
            if hi <= a or lo >= b:
                kept.append(r)
                continue
            if lo < a:
                fragments.append((kind, lo, a))
            if hi > b:
                fragments.append((kind, b, hi))
        g["records"] = kept
    for kind, lo, hi in fragments:
        rec(lo, hi, T[lo:hi], kind)
    rec(a, b, T[a:b], classify(a))
pointer_sites = {a for d in v["dialogue"] for a in d["pointer_sites"]}
for r in groups["text"]["records"]:
    sites = [a for a in pointer_sites if a <= r["offset"] < a + 4]
    if sites:
        r["text_pointer_site"] = sites[0]
from status_refresh import configure as configure_status

status_span = configure_status(groups, blob, C, F, T)
for r in groups["faster"]["records"]:
    r["off_data"] = blob(C[r["offset"] : r["offset"] + r["length"]])


# Wider function/structure checks for independently applicable features.
def guard(group, a, b, variants=None):
    ps = variants or profiles
    masked = [at - a for at in variable if a <= at < b]
    gift_mask = [at - a for at in gift if a <= at < b]
    accepted = set()
    for p in ps:
        data = bytearray(p[a:b])
        for at in masked + (gift_mask if p[0xFF01E3] == 0x44 else []):
            data[at] = 0
        accepted.add(hashlib.sha256(data).hexdigest())
    groups[group]["guards"].append(
        dict(offset=a, length=b - a, mask=masked, gift_mask=gift_mask, accepted=sorted(accepted))
    )


for a, b in [(0x78928, 0x78BB0), (0x78DB8, 0x78FD8), (0x791D4, 0x792DC), (0x7965C, 0x79744)]:
    guard("title", a, b)
guard("hidden", 0x15D8B0, 0x15D950)
for a in [0x34FB60, 0x34FB7C]:
    guard("tunnel", a, a + 28)
guard("nurse", 0x75537C, 0x7553D0)
# Engine identity allows data randomization and edits to other field scripts, but rejects
# unrecognised battle-engine replacements. Title and hidden-item functions are independent.
mask = bytearray(0x15D800)
for a in range(0xC0, len(mask)):
    if C[a] != F[a] or F[a] != T[a]:
        mask[a] = 1
for a, b in status_span:
    mask[a:b] = bytes([1]) * (b - a)
for a, b in [
    (0x78928, 0x78BB0),
    (0x78DB8, 0x78FD8),
    (0x791D4, 0x792DC),
    (0x7965C, 0x79744),
    (0x15D8B0, 0x15D950),
]:
    mask[a : min(b, len(mask))] = bytes([1]) * max(0, min(b, len(mask)) - a)


def engine(p):
    d = bytearray(p[0xC0 : len(mask)])
    for a, b in ranges(mask):
        if b > 0xC0:
            d[max(a, 0xC0) - 0xC0 : b - 0xC0] = bytes(b - max(a, 0xC0))
    return hashlib.sha256(d).hexdigest()


engine_guard = dict(
    start=0xC0, end=len(mask), mask=ranges(mask), accepted=sorted(set(engine(p) for p in profiles))
)
for k in ["faster", "core"]:
    groups[k]["engine"] = True
groups["core"]["needs_support"] = True
groups["text"]["needs_core"] = True
groups["nurse"]["needs_support"] = True
# Any injected bank must be a matching known layout, not merely partly empty.
# Record guards include surrounding data; the full banks catch occupied equal-byte gaps.
for group in ["core", "title"]:
    spans = sorted(
        (r["offset"], r["offset"] + r["length"])
        for r in groups[group]["records"]
        if 0x710000 <= r["offset"] < 0x800000
    )
    # Only guard used blocks. A mod elsewhere in free space does not block this feature.
    covered = sorted(set(a // 256 * 256 for a, b in spans for a in range(a, b, 256)))
    for a in covered:
        guard(group, a, a + 256)
offsets = []
payload = bytearray()
for b in pool:
    offsets.append([len(payload), len(b)])
    payload += b
manifest = dict(
    version="1.0",
    target="Kaizo Baconmon",
    groups=list(groups.values()),
    pool=offsets,
    pool_sha256=hashlib.sha256(payload).hexdigest(),
    engine=engine_guard,
    trainer_table=S["gTrainers"] - 0x8000000,
    seed_protection="Existing Pokemon, learnsets, trainer species, encounters and item data are retained except the explicitly listed feature writes.",
    baseline_sha256=hashlib.sha256(C).hexdigest(),
)
manifest["tutor_event"] = {"offset": 0x3BC4E4, "bytes": list(T[0x3BC4E4:0x3BC4EC])}
validation = json.loads((O / "Kaizo_Baconmon_v0.9.4_Validation.json").read_text())["BASE"]
h = next(h for h in validation["hooks"] if h["name"] == "CreateNPCTrainerParty")
at = h["address"] - 0x8000000
manifest["rival_normalizer"] = {
    "offset": at,
    "off": list(bytes.fromhex(h["original"])),
    "on": list(T[at : at + h["length"]]),
}
from split_features import configure

configure(manifest, C, F, T, profiles)
# Header names/revisions are advisory. Verify the underlying layout using
# independent functions, then keep all patch-site and allocation checks.
anchors = []
for name in [
    "GetMonData2",
    "CreateMon",
    "GetBattlerSide",
    "FlagGet",
    "ScriptContext_SetupScript",
    "LoadPalette",
]:
    a = (S[name] & ~1) - 0x8000000
    n = 48
    assert C[a : a + n] == F[a : a + n] == T[a : a + n]
    anchors.append(
        dict(name=name, offset=a, length=n, sha256=hashlib.sha256(C[a : a + n]).hexdigest())
    )
manifest["layout"] = {"anchors": anchors, "minimum_matches": 3, "logo": list(C[4:20])}
for g in manifest["groups"]:
    g["requires_layout"] = g["id"] in [
        "support",
        "faster",
        "core",
        "nurse",
        "text",
        "rival",
        "status",
    ]
(R / "manifest.json").write_text(json.dumps(manifest, separators=(",", ":")))
(R / "payload.txt").write_text(base64.b64encode(zlib.compress(payload, 9)).decode())
print({k: len(v["records"]) for k, v in groups.items()}, "payload", len(payload))
