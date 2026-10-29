"""Build Babymon classifications from pret/pokefirered Gen III source files.

Usage: python build_babymon_manifest.py PATH_TO_POKEFIRERED
Writes JSON to stdout; never uses randomized ROM stats for classification.
"""
import json
import re
import sys
from pathlib import Path

LEGENDS = set("ARTICUNO ZAPDOS MOLTRES MEWTWO MEW RAIKOU ENTEI SUICUNE LUGIA HO_OH CELEBI REGIROCK REGICE REGISTEEL LATIAS LATIOS KYOGRE GROUDON RAYQUAZA JIRACHI DEOXYS".split())
EXCEPTIONS = {"SCYTHER", "ONIX", "CHANSEY"}

def build(dex_text, stats_text, evolution_text):
    names = re.findall(r"NATIONAL_DEX_([A-Z0-9_]+)\s*,", dex_text.split("enum {", 1)[1].split("};", 1)[0])
    names = [n for n in names if n != "NONE" and not n.startswith("OLD_UNOWN_")]
    if len(names) != 386:
        raise ValueError("Incomplete National Dex enum")
    stats = {}
    for name, body in re.findall(r"\[SPECIES_([A-Z0-9_]+)\]\s*=\s*(.*?)(?=\n\s*\[SPECIES_|\n};)", stats_text, re.S):
        values = [re.search(r"\."+field+r"\s*=\s*(\d+)", body) for field in ("baseHP","baseAttack","baseDefense","baseSpeed","baseSpAttack","baseSpDefense")]
        if all(values):
            stats[name] = sum(int(v.group(1)) for v in values)
    edges = {}
    for name, body in re.findall(r"\[SPECIES_([A-Z0-9_]+)\]\s*=\s*(.*?)(?=\n\s*\[SPECIES_|\n};)", evolution_text, re.S):
        edges[name] = [dict(kind=k, value=v.strip(), original_destination=d) for k,v,d in re.findall(r"\{(EVO_[A-Z0-9_]+),\s*([^,]+),\s*SPECIES_([A-Z0-9_]+)\}", body)]
    incoming = {m["original_destination"] for methods in edges.values() for m in methods}
    result = []
    for dex,name in enumerate(names,1):
        if name not in stats:
            raise ValueError("Missing base stats: "+name)
        methods = edges.get(name, [])
        tier = 0 if name in LEGENDS else (2 if name in EXCEPTIONS or (methods and name in incoming) else 1 if methods else 3 if name in incoming or stats[name]>=450 else 0)
        # Remove the extra-party branch, retain Nincada's single level evolution.
        active = [dict(m) for m in methods if m["kind"] != "EVO_LEVEL_SHEDINJA"] if tier in (1,2) else []
        for m in active:
            if m["kind"] == "EVO_TRADE_ITEM":
                m["original_kind"] = m["kind"]
                m["kind"] = "EVO_ITEM"
                m["adaptation"] = "direct-use trade item; ROM item handler required"
        # Ninjask's special method would still create a second party member.
        for m in active:
            if m["kind"] == "EVO_LEVEL_NINJASK":
                m["original_kind"] = m["kind"]
                m["kind"] = "EVO_LEVEL"
        result.append(dict(dex=dex,name=name,bst=stats[name],tier=tier,legendary=name in LEGENDS,methods=active))
    if len({p["dex"] for p in result}) != 386 or any(p["tier"] in (1,2) and not p["methods"] for p in result):
        raise ValueError("Invalid classification")
    return result

def build_from_source(root):
    result = build((root/"include/constants/pokedex.h").read_text(), (root/"src/data/pokemon/species_info.h").read_text(), (root/"src/data/pokemon/evolution.h").read_text())
    constants = {}
    for filename in ("species.h", "pokemon.h", "items.h"):
        text = (root/"include/constants"/filename).read_text()
        constants.update({k:int(v, 0) for k,v in re.findall(r"^#define\s+([A-Z0-9_]+)\s+(0x[0-9A-Fa-f]+|[0-9]+)\b", text, re.M)})
    original_edges = {}
    for name, body in re.findall(r"\[SPECIES_([A-Z0-9_]+)\]\s*=\s*(.*?)(?=\n\s*\[SPECIES_|\n};)", (root/"src/data/pokemon/evolution.h").read_text(), re.S):
        original_edges[name] = [dict(code=constants[k], parameter=constants[v.strip()] if v.strip() in constants else int(v), destination=constants["SPECIES_"+d]) for k,v,d in re.findall(r"\{(EVO_[A-Z0-9_]+),\s*([^,]+),\s*SPECIES_([A-Z0-9_]+)\}", body)]
    for p in result:
        p["source_methods"] = original_edges.get(p["name"], [])
        p["internal_id"] = constants["SPECIES_"+p["name"]]
        for m in p["methods"]:
            m["code"] = constants[m["kind"]]
            m["parameter"] = constants[m["value"]] if m["value"] in constants else int(m["value"])
    return result

if __name__ == "__main__":
    root = Path(sys.argv[1])
    result = build_from_source(root)
    print(json.dumps(result, indent=2))
