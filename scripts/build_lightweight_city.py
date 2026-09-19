"""Derive a bounded, texture-free city envelope from the pinned PLATEAU cache.

Run fetch_plateau_city.py and index_plateau_buildings.py first. Original source
meshes remain in the audit cache. This output is a simplified plan envelope,
not a surveyed ground footprint or a reconstruction of roof/facade details.
"""
import gzip
import hashlib
import json
import math
from collections import defaultdict
from pathlib import Path

import numpy as np
from shapely.geometry import Polygon, MultiLineString
from shapely import set_precision, union_all, make_valid

from import_plateau_reference import ORIGIN, decode_tile, leaf_tiles, local_coordinates

ROOT = Path(__file__).resolve().parents[1]
AREA = [-650, -700, 650, 500]  # east/south metres at the published passage origin
GROUND = 55.0  # display reference plane only; station floor elevations unknown


def simplify_envelope(triangles):
    projected = np.round(triangles[:, :, [0, 2]], 2)
    polygons = [p for p in (Polygon(t) for t in projected) if p.is_valid and p.area > .02]
    if not polygons:
        raise ValueError("Building has no projectable triangle area")
    exact = make_valid(union_all(polygons, grid_size=.01))
    # Quantize with topology preservation: plain rounding can collapse narrow
    # holes onto the outer boundary and produce invalid rings for triangulation.
    simplified = set_precision(make_valid(exact.simplify(.25, preserve_topology=True)), .01, mode="valid_output")
    def polygon_parts(geometry):
        if geometry.geom_type == "Polygon":
            return [geometry]
        return [part for child in getattr(geometry, "geoms", []) for part in polygon_parts(child)]
    parts = polygon_parts(simplified)
    rings = []
    for part in parts:
        if part.geom_type != "Polygon" or part.area < .1:
            continue
        rings.append([[[round(x, 2), round(z, 2)] for x, z in ring.coords[:-1]]
                      for ring in [part.exterior, *part.interiors]])
    if not rings:
        raise ValueError("Simplification removed the building")
    # Measure exterior displacement separately from tiny interior cracks that
    # validity repair collapses. Courtyard rings remain in the exported shapes.
    before = MultiLineString([p.exterior.coords for p in polygon_parts(exact) if p.area >= .1])
    after = MultiLineString([p[0] + [p[0][0]] for p in rings])
    return rings, float(before.hausdorff_distance(after)), float(exact.area)


def main():
    index = json.loads((ROOT / ".cache/plateau-city/building-index.json").read_text(encoding="utf-8"))
    # Bounding metadata chooses candidates only. Output coordinates come from
    # decoded geometry, never from bounding boxes or measuredHeight attributes.
    radius_lat, radius_lon = .009, .010
    selected = {f["featureId"]: f for f in index
                if abs(f["longitude"] - ORIGIN[0]) < radius_lon and abs(f["latitude"] - ORIGIN[1]) < radius_lat}
    source = ROOT / ".cache/plateau-city/2025/buildings"
    tileset = json.loads((source / "tileset.json").read_text(encoding="utf-8"))
    fragments = defaultdict(list)
    source_tiles = defaultdict(set)
    hashes = {}
    for tile in leaf_tiles(tileset["root"]):
        region = tile["boundingVolume"]["region"]
        if (math.degrees(region[2]) < ORIGIN[0] - radius_lon or math.degrees(region[0]) > ORIGIN[0] + radius_lon
                or math.degrees(region[3]) < ORIGIN[1] - radius_lat or math.degrees(region[1]) > ORIGIN[1] + radius_lat):
            continue
        name = tile["content"]["uri"]
        raw = (source / name).read_bytes()
        hashes[name] = hashlib.sha256(raw).hexdigest()
        for ecef, faces, ids, batch in decode_tile(raw):
            local = local_coordinates(ecef)
            for batch_id in np.unique(ids):
                ident = batch["gml_id"][batch_id]
                if ident in selected:
                    fragments[ident].append(local[faces[ids == batch_id]])
                    source_tiles[ident].add(name)
    named = {m["featureId"]: m for m in json.loads((ROOT / "src/data/plateau-landmarks.json").read_text(encoding="utf-8"))}
    buildings, errors = [], []
    max_deviation = 0
    source_triangles = 0
    for ident, parts in sorted(fragments.items()):
        triangles = np.concatenate(parts)
        low, high = triangles.min(axis=(0, 1)), triangles.max(axis=(0, 1))
        center = (low + high) / 2
        if not (AREA[0] <= center[0] <= AREA[2] and AREA[1] <= center[2] <= AREA[3]):
            continue
        rings, deviation, area = simplify_envelope(triangles)
        max_deviation = max(max_deviation, deviation)
        source_triangles += len(triangles)
        row = {"id": ident, "parts": rings, "base": round(float(low[1]), 2), "top": round(float(high[1]), 2)}
        if ident in named:
            row["explorerId"] = named[ident]["explorerId"]
            row["label"] = named[ident]["label"]
        buildings.append(row)
        errors.append({"id": ident, "sourceTiles": sorted(source_tiles[ident]), "sourceTriangles": len(triangles),
                       "sourcePlanAreaM2": round(area, 3), "outerBoundaryDeviationM": round(deviation, 4)})
    if {b.get("explorerId") for b in buildings if b.get("explorerId")} != {m["explorerId"] for m in named.values()}:
        raise ValueError("A reviewed landmark was lost during extraction")
    attribution = "Derived from MLIT Project PLATEAU, Shibuya ward 2025 release. Plan envelopes simplified and extruded by transit-layout; roof and facade detail omitted."
    payload = {"version": 1, "attribution": attribution, "licenseUrl": "https://www.mlit.go.jp/plateau/site-policy/",
               "originWgs84": ORIGIN, "displayGroundEllipsoidM": GROUND, "areaMeters": AREA,
               "axes": "east/up/south metres", "buildings": buildings}
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode()
    if len(encoded) > 1_000_000:
        raise ValueError("The default city payload exceeds the 1 MB budget")
    output = ROOT / "public/plateau/station-city.json"
    output.write_bytes(encoded)
    summary = {"buildings": len(buildings), "bytes": len(encoded), "gzipBytes": len(gzip.compress(encoded, mtime=0)),
               "sha256": hashlib.sha256(encoded).hexdigest(), "sourceTriangles": source_triangles,
               "maxOuterBoundaryDeviationM": max_deviation, "areaMeters": AREA, "originWgs84": ORIGIN,
               "displayGroundEllipsoidM": GROUND, "sourceYear": 2025, "surveyYearNote": "Mostly 2021; not current construction",
               "processing": "Projected source mesh envelope, simplified 0.25 m; base/top from decoded source; uniform-height extrusion; no textures or facade/roof details.",
               "sourceUrl": json.loads((ROOT / "src/data/plateau-city.json").read_text())["layers"][0]["url"]}
    (ROOT / "src/data/station-city-summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    report = {**summary, "sourceTileHashes": hashes, "features": errors}
    (ROOT / "docs/spatial-recovery/lightweight-city-manifest.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
