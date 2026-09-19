"""Extract building identities and geographic bounds from cached finest tiles."""
import json
import math
import struct
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def leaves(tile):
    if tile.get("children"):
        return [leaf for child in tile["children"] for leaf in leaves(child)]
    return [tile]


def batch_value(table, binary, key, index):
    value = table.get(key)
    if isinstance(value, list):
        return value[index]
    if isinstance(value, dict) and "byteOffset" in value:
        if value["type"] != "SCALAR":
            raise ValueError("Expected scalar metadata")
        format_ = {"DOUBLE": "d", "FLOAT": "f", "BYTE": "b", "UNSIGNED_BYTE": "B",
                   "SHORT": "h", "UNSIGNED_SHORT": "H", "INT": "i", "UNSIGNED_INT": "I"}[value["componentType"]]
        result = struct.unpack_from("<" + format_, binary, value["byteOffset"] + index * struct.calcsize(format_))[0]
        return result if math.isfinite(result) else None
    return None


def main():
    source = ROOT / ".cache/plateau-city/2025/buildings"
    tileset = json.loads((source / "tileset.json").read_text(encoding="utf-8"))
    features = {}
    source_tiles = leaves(tileset["root"])
    for tile in source_tiles:
        raw = (source / tile["content"]["uri"]).read_bytes()
        header = struct.unpack_from("<4s6I", raw)
        if header[:3] != (b"b3dm", 1, len(raw)):
            raise ValueError("Invalid building tile")
        start = 28 + header[3] + header[4]
        table = json.loads(raw[start:start + header[5]])
        binary = raw[start + header[5]:start + header[5] + header[6]]
        for index, ident in enumerate(table["gml_id"]):
            value = lambda key: batch_value(table, binary, key, index)
            feature = {"featureId": ident, "name": value("gml:name"), "longitude": value("_x"), "latitude": value("_y"),
                       "measuredHeight": value("bldg:measuredHeight"),
                       "bounds": [value(k) for k in ["_xmin", "_ymin", "_xmax", "_ymax", "_zmin", "_zmax"]],
                       "lod": value("_lod"), "surveyYear": value("uro:BuildingDetailAttribute_uro:surveyYear"),
                       "sourceTile": tile["content"]["uri"]}
            if ident not in features or (feature["lod"] or 0) > (features[ident]["lod"] or 0):
                features[ident] = feature
    records = list(features.values())
    (ROOT / ".cache/plateau-city/building-index.json").write_text(json.dumps(records, ensure_ascii=False), encoding="utf-8")
    terms = ["ヒカリエ", "スクランブル", "ストリーム", "フクラス", "マークシティ", "109", "QFRONT", "キューフロント", "MAGNET"]
    candidates = [f for f in records if any(term in unicodedata.normalize("NFKC", f["name"] or "").upper() for term in terms)]
    summary = {"sourceLeafTiles": len(source_tiles), "uniqueBuildings": len(records),
               "lodCounts": dict(sorted(Counter(str(f["lod"]) for f in records).items())),
               "surveyYearCounts": dict(sorted(Counter(str(f["surveyYear"]) for f in records).items())),
               "landmarkCandidates": candidates}
    (ROOT / "docs/spatial-recovery/city-building-index-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    # Explicit reviewed name correspondences; never infer unnamed destinations
    # from proximity, because redevelopment and multipart buildings overlap.
    names = [("渋谷ヒカリエ", "hikarie", "Hikarie"), ("渋谷ストリーム", "stream", "Stream"), ("マークシティ", "mark-city", "Mark City")]
    landmarks = []
    for name, explorer_id, label in names:
        matches = [feature for feature in records if feature["name"] == name]
        if len(matches) != 1:
            raise ValueError(f"Expected one exact source match for {name}, found {len(matches)}")
        landmarks.append({**matches[0], "explorerId": explorer_id, "label": label,
                          "matchEvidence": "Exact named feature in PLATEAU building metadata; source coordinates retained."})
    (ROOT / "src/data/plateau-landmarks.json").write_text(json.dumps(landmarks, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Indexed {len(records):,} buildings from {len(source_tiles)} leaves; matched {len(landmarks)} named landmarks.")


if __name__ == "__main__":
    main()
