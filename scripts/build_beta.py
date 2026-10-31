"""Rebuild the standalone development beta from its preserved source."""
from pathlib import Path
root = Path(__file__).resolve().parents[1]
source = root / "public-patcher" / "beta"
title = root / "public-patcher"
title_script = "const BABYMON_TITLE=" + (title / "title/babymon.json").read_text() + ";\n" + (title / "title.js").read_text()
page = (source / "page.html").read_text().replace("__BETA_RUNTIME__", title_script + "\n" + (source / "runtime.js").read_text())
(root / "babymon-beta.html").write_text(page)
print("Built babymon-beta.html")
