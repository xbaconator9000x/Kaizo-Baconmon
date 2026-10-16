"""Rebuild the GPLv3 browser adapter with a Java 17+ JDK."""
from pathlib import Path
import subprocess,tempfile,zipfile
R=Path(__file__).resolve().parent
with tempfile.TemporaryDirectory() as temp:
 subprocess.run(['java','com.sun.tools.javac.Main','--release','8','-cp',str(R/'PokeRandoZX.jar'),'-d',temp,str(R/'BaconBridge.java')],check=True)
 with zipfile.ZipFile(R/'BaconBridge.jar','w',zipfile.ZIP_DEFLATED) as z:
  for p in sorted(Path(temp).rglob('*.class')):
   info=zipfile.ZipInfo(str(p.relative_to(temp)).replace('\\','/'),(1980,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;z.writestr(info,p.read_bytes())
print('BaconBridge.jar rebuilt. Run build_page.py to embed it.')
