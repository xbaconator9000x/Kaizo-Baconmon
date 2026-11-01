"""Build the self-contained patcher from its source files and templates."""

import base64
from html import escape
import json
from pathlib import Path
from string import Template

from help_content import help_html

SOURCE_DIRECTORY = Path(__file__).resolve().parent
PROJECT_DIRECTORY = SOURCE_DIRECTORY.parent
OUTPUT_DIRECTORY = SOURCE_DIRECTORY.parent / "public-output"


def embedded_script(manifest):
    randomiser_directory = SOURCE_DIRECTORY / "randomizer"
    presets = json.loads((randomiser_directory / "presets.json").read_text())
    engine = base64.b64encode((randomiser_directory / "PokeRandoZX.jar").read_bytes()).decode()
    bridge = base64.b64encode((randomiser_directory / "BaconBridge.jar").read_bytes()).decode()
    return "\n".join(
        [
            "const CONFIG=" + json.dumps(manifest, separators=(",", ":")) + ";",
            "const PAYLOAD=" + json.dumps((SOURCE_DIRECTORY / "payload.txt").read_text()) + ";",
            (SOURCE_DIRECTORY / "shared.js").read_text(),
            "const BABYMON_TITLE=" + (SOURCE_DIRECTORY / "title/babymon.json").read_text() + ";",
            (SOURCE_DIRECTORY / "title.js").read_text(),
            (SOURCE_DIRECTORY / "patcher.js").read_text(),
            "const BATCH_PRESETS=" + json.dumps(presets) + ";",
            "const ENGINE_JAR=" + json.dumps(engine) + ";",
            "const BRIDGE_JAR=" + json.dumps(bridge) + ";",
            (SOURCE_DIRECTORY / "randomizer.js").read_text(),
        ]
    )


def feature_choices(manifest):
    labels = {
        group["id"]: (group["name"], group["detail"])
        for group in manifest["groups"]
        if group["id"] not in ["core", "support"]
    }
    labels["title"] = ("Preset title screen", "Babymon uses Magby, Elekid and Cleffa; other presets use the Baconmon title.")
    labels["faster"] = (
        "Faster FireRed extras",
        "Optional speed and field tweaks from Faster FireRed. Separate from the lab-start switch and the forest nurse.",
    )
    labels["rival"] = (
        "Adjust lab rival level",
        "Set the three lab starter parties to the level below, keeping their species and moves.",
    )
    sections = [
        '<label><input id="package" type="checkbox" checked> '
        "<strong>Core Baconmon Package</strong>"
        "<small>Use the full setup, or untick the bits you don’t want.</small></label>",
        '<p class="small">Start a fresh run when changing the setup.</p>',
    ]
    features = [(key, *value) for key, value in labels.items()]
    features += [
        (feature["id"], feature["name"], feature["detail"]) for feature in manifest["core_features"]
    ]
    for feature_id, title, description in features:
        element_id = "tutor" if feature_id == "relearner" else "feature-" + feature_id
        sections.append(
            f'<label><input class="feature" type="checkbox" id="{element_id}" '
            f'value="{feature_id}" checked> <strong>{escape(title)}</strong>'
            f"<small>{escape(description)}</small></label>"
        )
    sections.append(
        '<label>Lab rival level <input id="rivalLevel" type="number" min="1" max="100" '
        'step="1" value="8"><small>Whole numbers from 1–100. Default: 8. '
        "Used when Adjust lab rival level is ticked. Apply custom levels after randomisation."
        "</small></label>"
    )
    return "\n".join(sections)


def licence_notices():
    notices = [
        ("Patcher components — MIT", PROJECT_DIRECTORY / "PATCHER_LICENSE.txt"),
        ("Ironmon VS — MIT", "notices/Ironmon_VS_MIT.txt"),
        ("Ironmon Tracker — MIT", "notices/Ironmon_Tracker_MIT.txt"),
        ("Rom Patcher JS — MIT", "notices/Rom_Patcher_JS_MIT.txt"),
        ("Randomiser code — GPLv3", "randomizer/LICENSE-GPL-3.0.txt"),
    ]
    sections = ["<details><summary>Code licence notices</summary>"]
    for title, path in notices:
        text = escape((SOURCE_DIRECTORY / path).read_text())
        sections.append(f"<details><summary>{escape(title)}</summary><pre>{text}</pre></details>")
    sections.append("</details>")
    return "\n".join(sections)


def build_page():
    import runpy
    runpy.run_path(str(PROJECT_DIRECTORY / "scripts/build_release.py"), run_name="__main__")
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    output = OUTPUT_DIRECTORY / "Kaizo_Baconmon_Patcher.html"
    output.write_bytes((PROJECT_DIRECTORY / "index.html").read_bytes())
    print(f"Built {output.name} ({output.stat().st_size} bytes).")


if __name__ == "__main__":
    build_page()
