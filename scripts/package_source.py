"""Package the public source files, excluding generated output and this ZIP."""

from pathlib import Path
import subprocess
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ARCHIVE_NAME = "Kaizo_Baconmon_Patcher_Source.zip"


def package_source():
    listed = (
        subprocess.check_output(
            ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
            cwd=PROJECT_ROOT,
        )
        .decode()
        .split("\0")
    )
    paths = sorted(
        {
            name
            for name in listed
            if name and name != ARCHIVE_NAME and (PROJECT_ROOT / name).is_file()
        }
    )
    with ZipFile(PROJECT_ROOT / ARCHIVE_NAME, "w", ZIP_DEFLATED, compresslevel=9) as archive:
        for name in paths:
            entry = ZipInfo(name, (1980, 1, 1, 0, 0, 0))
            entry.compress_type = ZIP_DEFLATED
            entry.external_attr = 0o100644 << 16
            archive.writestr(entry, (PROJECT_ROOT / name).read_bytes())
    print(f"Packaged {len(paths)} public files in {ARCHIVE_NAME}.")


if __name__ == "__main__":
    package_source()
