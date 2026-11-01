"""Build the public page with the canonical profile-aware randomizer runtime."""
from pathlib import Path
root = Path(__file__).resolve().parents[1]
source = root / 'public-patcher/release'
title = root / 'public-patcher'
title_script = 'const BABYMON_TITLE=' + (title / 'title/babymon.json').read_text() + ';\n' + (title / 'title.js').read_text()
page = (source / 'page.html').read_text().replace('__RELEASE_RUNTIME__', title_script + '\n' + (title / 'runtime.js').read_text())
(root / 'index.html').write_text(page)
print('Built index.html')
