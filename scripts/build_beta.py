"""Keep the former beta URL compatible with the core patcher."""
from pathlib import Path
r = Path(__file__).resolve().parents[1]
(r / 'babymon-beta.html').write_bytes((r / 'index.html').read_bytes())
print('Updated legacy URL with the core patcher')
