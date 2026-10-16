"""Exercise status-update commands through the actual lab/Oak controller.
Usage: script.py ORIGINAL_ROM FIXED_ROM LAB_MENU_STATE OUTPUT_DIRECTORY
The fixture must be a real lab rival battle at action selection, flags & 0x10.
"""

from pathlib import Path
import sys, json, struct, zlib, hashlib

ROOT = Path(__file__).resolve().parent.parent
sys.path[:0] = [str(ROOT / "source/menu-update"), str(ROOT / "source/fly-update")]
from common import S, FieldEngine
from emu import Emu

original, fixed, state, out = map(Path, sys.argv[1:])
out.mkdir(exist_ok=True, parents=True)
checks = []


def tile(e):
    hb = e.read8(S["gHealthboxSpriteIds"])
    num = e.read16(S["gSprites"] + 68 * hb + 4) & 1023
    a = 0x6010000 + (num + 26) * 32
    return bytes(e.read8(a + i) for i in range(96))


for patched, rom in [(False, original), (True, fixed)]:
    for mode in [0xBC00, 0xBC01]:
        e = Emu(rom)
        raw = bytearray(state.read_bytes())
        struct.pack_into("<I", raw, 8, zlib.crc32(rom.read_bytes()))
        p = out / "runtime.state"
        p.write_bytes(raw)
        e.load(p)
        assert e.read32(S["gBattleTypeFlags"]) & 0x10, "Not the special first-battle controller"
        sb = e.read32(S["gSaveBlock1Ptr"])
        e.write16(sb + 0x11FE, mode)
        for name, value in [
            ("paralysis", 64),
            ("poison", 8),
            ("toxic", 128),
            ("sleep", 3),
            ("burn", 16),
            ("freeze", 32),
            ("cured", 0),
        ]:
            e.write32(S["gPlayerParty"] + 80, value)
            e.write32(S["gBattleMons"] + 76, value)
            before = tile(e)
            f = FieldEngine(rom, emu=e)
            f.b("gActiveBattler", 0)
            f.call("BtlController_EmitStatusIconUpdate", 0, value, 0)
            f.call("MarkBattlerForControllerExec", 0)
            f.w(S["gBattlerControllerFuncs"], S["OakOldManBufferRunCommand"])
            f.sync(e)
            e.frames(60)
            after = tile(e)
            assert not e.read32(S["gBattleControllerExecFlags"]) & 1, "Command failed to complete"
            assert (
                e.read32(S["gPlayerParty"] + 80) == value
                and e.read32(S["gBattleMons"] + 76) == value
            ), "Status changed"
            changed = before != after
            assert changed == (patched and name != "toxic"), (patched, mode, name, changed)
            checks.append(
                dict(
                    patched=patched,
                    mode="Modern" if mode == 0xBC01 else "Classic",
                    status=name,
                    icon_updated=changed,
                    command_completed=True,
                    status_unchanged=True,
                )
            )
            if name == "paralysis" and mode == 0xBC01:
                e.shot(out / ("Lab_Status_After.png" if patched else "Lab_Status_Before.png"))
        e.done()
(out / "runtime-results.json").write_text(json.dumps(checks, indent=2))
print(
    "PASS actual lab controller: original ignores status icons; fixed updates all statuses and cures in both modes."
)
