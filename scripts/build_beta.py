"""Rebuild the standalone development beta from its preserved source."""
from pathlib import Path
root = Path(__file__).resolve().parents[1]
source = root / "public-patcher" / "beta"
page = (source / "page.html").read_text().replace("__BETA_RUNTIME__", (source / "runtime.js").read_text())
(root / "babymon-beta.html").write_text(page)
print("Built babymon-beta.html")
