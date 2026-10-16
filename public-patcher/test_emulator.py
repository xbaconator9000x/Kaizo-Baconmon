from pathlib import Path

R = Path(__file__).resolve().parent
ROOT = R.parent
original = ROOT / "source/intro-update/test_rom_ui.py"
s = original.read_text().replace(
    "ROM=O/'Kaizo_Baconmon_v0.9.4_BASE.gba'",
    "ROM=Path(" + repr(str(R / "emulator-input.gba")) + ")",
)
s = s.replace("D=R/'screens'", "D=Path(" + repr(str(R / "screens")) + ")").replace(
    "F=R/'fixtures'", "F=Path(" + repr(str(R / "fixtures")) + ")"
)
s = s.replace(
    "(O/'Kaizo_Baconmon_v0.9.4_UI_Tests.json')",
    "Path(" + repr(str(ROOT / "public-output/ROM_Emulator_Tests.json")) + ")",
)
exec(compile(s, str(original), "exec"), {"__file__": str(original), "__name__": "__main__"})
