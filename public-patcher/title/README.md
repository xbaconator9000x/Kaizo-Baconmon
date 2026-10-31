# Babymon title assets

The Babymon profile uses Magby, Elekid and Cleffa in a Kanto countryside scene. Other profiles retain the Baconmon title. The title checkbox controls installation; changing a profile does not alter an existing ROM unless the title feature is selected and the patch is applied again.

- `babymon-source.png`: original artwork.
- `babymon-240x160.png`: indexed preview at native screen resolution.
- `babymon.8bpp`: 38,400 row-major palette indices, for GBA bitmap mode 4.
- `babymon.pal`: 256 little-endian BGR555 colors (512 bytes).
- `babymon.s`: Thumb VBlank wrapper, preserving native title input, tasks, audio and menu transitions.
- `babymon.json`: checked installation payload; this is embedded into the standalone patchers.

Run `npm run build:title`, then `npm run build`. The conversion requires Pillow and keystone-engine; normal page builds use the checked-in generated assets. The preview palette is reduced to five-bit channels. This is a static bitmap title, not a 4bpp tile/map asset.

The installer requires the known US FireRed Rev 1 title callback and checks the entire 64 KiB reservation at ROM offset `0xB10000`. Conflicting hooks, occupied space, or altered installed payloads cause the entire title feature to be skipped and reported. It never expands or truncates the ROM. A 512-byte copier header is preserved. The reservation is immediately after, and does not overlap, the beta evolution support reservation at `0xB00000`.

The native VBlank callback continues OAM, palette and copy housekeeping. The wrapper displays the image only while the native title main callback is active, disables the old title scanline effect, and returns control to the original menu transition. The framebuffer is copied once while blanked; subsequent frames update only the small palette and display registers. A marker in unused bitmap VRAM tracks that first copy; no save or game-state RAM is allocated.

Test both published pages with `node public-patcher/test_title.cjs /path/to/input.gba /path/to/temporary-output`. ROMs are local test inputs and are not part of the source package. Browser batch adapters pass the selected profile to the same patch engine before randomisation.
