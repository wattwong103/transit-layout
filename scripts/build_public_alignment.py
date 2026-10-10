"""Build small, reproducible reference layers; never refit the station from these.

Inputs: the existing compact PLATEAU city and a pinned OSM API bounding-box extract.
OSM-derived records are distributed separately under ODbL, with attribution.
"""
import hashlib
import json
import math
import xml.etree.ElementTree as ET
from pathlib import Path
from shapely.geometry import Polygon
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parents[1]
OSM_URL = "https://api.openstreetmap.org/api/0.6/map?bbox=139.696,35.655,139.706,35.662"
CHECKED = "2026-10-10"
OSM_SHA256 = "0aa039074060ae099dc5aa2274226a2abc5ff03e57ce2fdec167e4d716025fa7"
CITY_SHA256 = "3394a1eea2d253a53782b5be952fbf30e50231e2a4b70847cbc3fb27b7dc83b9"
WAY_MATCHES = {
    "shibuya109": "55895868", "qfront": "136691386", "magnet": "116806281",
    "scramble-square": "617560918", "fukuras": "55588118",
}


def main():
    city_raw = (ROOT / "public/plateau/station-city.json").read_bytes()
    city = json.loads(city_raw)
    osm_raw = (ROOT / ".cache/shibuya-osm.xml").read_bytes()
    if hashlib.sha256(osm_raw).hexdigest() != OSM_SHA256 or hashlib.sha256(city_raw).hexdigest() != CITY_SHA256:
        raise ValueError("Source snapshot changed: review matches and dates before updating the pinned checksums.")
    root = ET.fromstring(osm_raw)
    nodes = {n.attrib["id"]: n for n in root.findall("node")}
    origin_lon, origin_lat, _ = city["originWgs84"]
    lo, la = map(math.radians, (origin_lon, origin_lat))

    def ecef(lon, lat):
        l, p = map(math.radians, (lon, lat))
        n = 6378137 / math.sqrt(1 - 6.6943799901413165e-3 * math.sin(p) ** 2)
        return n * math.cos(p) * math.cos(l), n * math.cos(p) * math.sin(l), n * (1 - 6.6943799901413165e-3) * math.sin(p)

    origin = ecef(origin_lon, origin_lat)

    def local(lon, lat):
        x, y, z = [v - origin[i] for i, v in enumerate(ecef(lon, lat))]
        return [-math.sin(lo) * x + math.cos(lo) * y,
                math.sin(la) * math.cos(lo) * x + math.sin(la) * math.sin(lo) * y - math.cos(la) * z]

    shapes = [(b, unary_union([Polygon(p[0], p[1:]) for p in b["parts"]])) for b in city["buildings"]]
    matches = []
    for ident, way_id in WAY_MATCHES.items():
        way = root.find(f"way[@id='{way_id}']")
        tags = {t.attrib["k"]: t.attrib["v"] for t in way.findall("tag")}
        p = Polygon([local(float(nodes[n.attrib["ref"]].attrib["lon"]), float(nodes[n.attrib["ref"]].attrib["lat"])) for n in way.findall("nd")])
        ranked = sorted([(p.intersection(g).area / p.union(g).area, b) for b, g in shapes if p.intersects(g)], key=lambda x: -x[0])
        score, b = ranked[0]
        runner_up = ranked[1][0] if len(ranked) > 1 else 0
        if score < .85 or runner_up > .05:
            raise ValueError(f"Ambiguous building match: {ident}")
        matches.append({"explorerId": ident, "featureId": b["id"], "osmWayId": way_id,
                        "name": tags["name"], "sourceUpdatedAt": way.attrib["timestamp"],
                        "overlapIoU": score, "runnerUpIoU": runner_up,
                        "method": "Named OSM outline matched to PLATEAU envelope by unique polygon overlap; not a surveyed identity check."})

    license_info = {"attribution": "© OpenStreetMap contributors", "license": "ODbL-1.0",
                    "licenseUrl": "https://opendatacommons.org/licenses/odbl/1-0/",
                    "copyrightUrl": "https://www.openstreetmap.org/copyright", "checkedOn": CHECKED,
                    "sourceUrl": OSM_URL, "sourceSha256": hashlib.sha256(osm_raw).hexdigest()}
    crosswalk = {**license_info, "matches": matches}
    (ROOT / "public/evidence/building-crosswalk.json").write_text(json.dumps(crosswalk, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    ids = {m["featureId"]: m["explorerId"] for m in matches}
    outlines = []
    for b in city["buildings"]:
        ident = b.get("explorerId") or ids.get(b["id"])
        if ident:
            outlines.append({"explorerId": ident, "featureId": b["id"], "parts": b["parts"], "base": b["base"], "top": b["top"],
                             "identity": "named-in-plateau" if b.get("explorerId") else "cross-source-match"})
    payload = {"attribution": city["attribution"], "sourceCitySha256": hashlib.sha256(city_raw).hexdigest(),
               "geometryKind": "projected-mesh-envelope", "identityCrosswalk": "/evidence/building-crosswalk.json", "buildings": outlines}
    (ROOT / "src/data/station-building-outlines.json").write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")

    entries, excluded = [], []
    accepted = {"A0", "A1", "A3", "A4", "A5a", "A5b", "A6a", "A6b", "A6c", "A7a", "A7b", "B1", "B2", "B3", "B4", "B7", "C1", "C2", "C3", "20a", "21"}
    for node in nodes.values():
        tags = {t.attrib["k"]: t.attrib["v"] for t in node.findall("tag")}
        if tags.get("railway") != "subway_entrance":
            continue
        ref = tags.get("ref", "")
        if ref not in accepted:
            excluded.append({"nodeId": node.attrib["id"], "ref": ref, "reason": "Missing or legacy reference; no automatic current-code assignment."})
            continue
        parent = ref[:-1] if ref[-1:] in ("a", "b", "c") and ref.startswith("A") else ref
        entries.append({"id": "osm-" + node.attrib["id"], "ref": ref, "group": parent,
                        "nodeId": node.attrib["id"], "version": int(node.attrib["version"]),
                        "longitude": float(node.attrib["lon"]), "latitude": float(node.attrib["lat"]),
                        "sourceUpdatedAt": node.attrib["timestamp"], "sourceLevel": tags.get("level"),
                        "sourceUrl": "https://www.openstreetmap.org/node/" + node.attrib["id"],
                        "match": "exit-group" if parent != ref else "equipment-reference" if ref in ("20a", "21") else "exit-code"})
    entries.sort(key=lambda e: e["ref"])
    record = {**license_info, "operatorReference": "https://www.tokyu.co.jp/railway/station_map/pdf/ty01-shibuya_2.pdf",
              "operatorPlanDate": "2026-08-21", "notes": "OSM coordinates are community map references, not surveyed checkpoints or proof of operation. Codes cross-referenced to the operator plan; suffix branches remain grouped. C2 is tagged level -2. All markers use the comparison plane, not a measured height. No station geometry is snapped to these points.",
              "entries": entries, "excluded": excluded, "missingExitCodes": ["A2", "A8", "A12", "B5", "B6"]}
    (ROOT / "public/evidence/entrance-references.json").write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"buildings": len(outlines), "entrances": len(entries), "excluded": len(excluded), "outlineBytes": (ROOT / "src/data/station-building-outlines.json").stat().st_size}))


if __name__ == "__main__":
    main()
