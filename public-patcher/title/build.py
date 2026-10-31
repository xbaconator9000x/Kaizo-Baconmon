"""Build the indexed FRLG Babymon title asset and guarded import payload.

Requires Pillow and keystone-engine. No ROM bytes are distributed.
"""
from pathlib import Path
import base64
import hashlib
import json
import struct
from PIL import Image
from keystone import Ks, KS_ARCH_ARM, KS_MODE_THUMB

ROOT = Path(__file__).resolve().parent
BASE = 0xB10000
image = Image.open(ROOT / 'babymon-source.png').convert('RGB')
image = image.resize((240, 160), Image.Resampling.LANCZOS)
image = image.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
palette = image.getpalette()
# Quantize channels to the GBA's exact five-bit palette before previewing.
colors = [(palette[i] >> 3, palette[i+1] >> 3, palette[i+2] >> 3) for i in range(0, 768, 3)]
image.putpalette([v * 255 // 31 for rgb in colors for v in rgb])
image.save(ROOT / 'babymon-240x160.png')
pal = b''.join(struct.pack('<H', r | g << 5 | b << 10) for r, g, b in colors)
source = (ROOT / 'babymon.s').read_text()
# Keystone supports the literal pool, but not GNU syntax declarations/comments.
import re
assembly = re.sub(r'/\*.*?\*/', '', source, flags=re.S)
assembly = '\n'.join(line for line in assembly.splitlines() if not line.startswith(('.syntax', '.thumb')))
code = bytes(Ks(KS_ARCH_ARM, KS_MODE_THUMB).asm(assembly, addr=0x08000000 + BASE)[0])
assert len(code) <= 0x400
payload = bytearray(b'\xff' * 0x10000)
payload[:len(code)] = code
payload[0x400:0x600] = pal
payload[0x600:0x600+38400] = image.tobytes()
meta = {'format':'Baconmon indexed title v1', 'base':BASE, 'length':len(payload),
        'hook':0x78B24, 'original_hook':0x08078BC9, 'installed_hook':0x08000000+BASE+1,
        'sha256':hashlib.sha256(payload).hexdigest(), 'data':base64.b64encode(payload).decode()}
(ROOT / 'babymon.json').write_text(json.dumps(meta, separators=(',', ':')) + '\n')
(ROOT / 'babymon.pal').write_bytes(pal)
(ROOT / 'babymon.8bpp').write_bytes(image.tobytes())
print('Built 240x160, 256 colors,', len(code), 'bytes of title code')
