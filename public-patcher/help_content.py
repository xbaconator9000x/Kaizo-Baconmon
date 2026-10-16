"""Render the patcher help and the existing in-game rule articles."""

from html import escape
import json
from pathlib import Path
from string import Template

SOURCE_DIRECTORY = Path(__file__).resolve().parent
ARTICLES = json.loads((SOURCE_DIRECTORY / "guide_content.json").read_text())
ARTICLE_GROUPS = {
    "mode_articles": [
        "bacon_changes",
        "classic",
        "modern_split",
        "modern_a",
        "modern_b",
        "modern_c",
        "modern_limits",
    ],
    "rule_articles": [
        "bacon_goal",
        "bacon_setup",
        "bacon_selection",
        "bacon_catches",
        "bacon_clauses",
        "bacon_moves",
        "bacon_items",
        "bacon_healing",
        "bacon_progress",
        "bacon_helpers",
        "bacon_travel",
    ],
}


def article(key):
    content = ARTICLES[key]
    paragraphs = "".join(
        "<p>" + escape(paragraph).replace("\n", "<br>") + "</p>"
        for paragraph in content["text"].split("\n\n")
    )
    return f"<details><summary>{escape(content['title'])}</summary>{paragraphs}</details>"


def help_html():
    template = Template((SOURCE_DIRECTORY / "help_template.html").read_text())
    sections = {
        name: "".join(article(key) for key in keys) for name, keys in ARTICLE_GROUPS.items()
    }
    return template.substitute(sections)
