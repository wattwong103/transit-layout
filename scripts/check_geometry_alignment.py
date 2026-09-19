"""Read-only geometry audit; requires `npm test` and the local PLATEAU cache.

Writes only the audit report. Source tiles and published models are untouched.
This checks coordinate consistency, not surveyed accuracy of the station.
"""
import hashlib
import json
import subprocess
from collections import defaultdict
from pathlib import Path

import numpy as np
from shapely.geometry import Point, Polygon

from import_plateau_reference import decode_tile, local_coordinates

ROOT = Path(__file__).resolve().parents[1]


def audit_station():
    # Use the same compiled data tested by npm, with all derived voids included.
    program = """
      const {explorerData}=require('./.test-dist/src/data/explorer.js');
      const {geographicExplorer,stationAlignment}=require('./.test-dist/src/lib/stationRegistration.js');
      const {getSpaceOpenings}=require('./.test-dist/src/lib/explorer.js');
      console.log(JSON.stringify({fit:stationAlignment,data:[explorerData,geographicExplorer].map(d=>({
        ...d,spaces:d.spaces.map(s=>({...s,openings:getSpaceOpenings(d,s)}))
      }))}));
    """
    compiled = json.loads(subprocess.check_output(["node", "-e", program], cwd=ROOT, text=True))
    results = []
    for frame, data in zip(["drawing", "registered"], compiled["data"]):
        spaces = {s["id"]: s for s in data["spaces"]}
        for space in spaces.values():
            polygon = Polygon(space["polygon"], space["openings"])
            assert polygon.is_valid and polygon.area > 0, space["id"]
        for building in data["buildings"]:
            assert Polygon(building["polygon"]).is_valid, building["id"]
        for exit_ in data["exits"]:
            space = spaces[exit_["spaceId"]]
            assert space["levelId"] == exit_["levelId"], exit_["id"]
            assert Point(exit_["position"]).distance(Polygon(space["polygon"])) < 1e-8, exit_["id"]
        for connector in data["connectors"]:
            for endpoint in connector.get("stops", [connector["from"], connector["to"]]):
                assert any(s["levelId"] == endpoint["levelId"] and
                           Point(endpoint["position"]).distance(Polygon(s["polygon"])) < 1e-8
                           for s in spaces.values()), connector["id"]
        for facility in data.get("facilities", []):
            space = spaces[facility["spaceId"]]
            assert space["levelId"] == facility["levelId"], facility["id"]
            assert Point(facility["position"]).distance(Polygon(space["polygon"])) < 1e-8, facility["id"]
        results.append({"frame": frame, "validSlabs": len(spaces),
                        "validOpenings": sum(len(s["openings"]) for s in spaces.values()),
                        "validBuildingPolygons": len(data["buildings"]),
                        "attachedExitAnchors": len(data["exits"]),
                        "supportedConnectorStops": sum(len(c.get("stops", [c["from"], c["to"]])) for c in data["connectors"]),
                        "supportedFacilities": len(data.get("facilities", []))})
    return results, compiled["fit"]["rmse"]


def audit_city():
    report = json.loads((ROOT / "docs/spatial-recovery/lightweight-city-manifest.json").read_text())
    raw_city = (ROOT / "public/plateau/station-city.json").read_bytes()
    assert hashlib.sha256(raw_city).hexdigest() == report["sha256"]
    city = json.loads(raw_city)
    by_id = {b["id"]: b for b in city["buildings"]}
    bounds = {}
    counts = defaultdict(int)
    for name, expected in report["sourceTileHashes"].items():
        raw = (ROOT / ".cache/plateau-city/2025/buildings" / name).read_bytes()
        assert hashlib.sha256(raw).hexdigest() == expected, name
        for ecef, faces, ids, batch in decode_tile(raw):
            points = local_coordinates(ecef)
            for batch_id in np.unique(ids):
                ident = batch["gml_id"][batch_id]
                if ident not in by_id:
                    continue
                triangles = points[faces[ids == batch_id]]
                low, high = triangles.min(axis=(0, 1)), triangles.max(axis=(0, 1))
                if ident in bounds:
                    low, high = np.minimum(low, bounds[ident][0]), np.maximum(high, bounds[ident][1])
                bounds[ident] = (low, high)
                counts[ident] += len(triangles)
    assert len(bounds) == len(by_id)
    vertical_error = horizontal_bounds_error = 0
    polygon_parts = 0
    for ident, building in by_id.items():
        low, high = bounds[ident]
        vertical_error = max(vertical_error, abs(building["base"] - low[1]), abs(building["top"] - high[1]))
        points = np.array([p for part in building["parts"] for ring in part for p in ring])
        horizontal_bounds_error = max(horizontal_bounds_error, float(np.max(np.maximum(
            abs(points.min(0) - low[[0, 2]]), abs(points.max(0) - high[[0, 2]])))))
        for part in building["parts"]:
            polygon = Polygon(part[0], part[1:])
            assert polygon.is_valid and polygon.area > 0, ident
            polygon_parts += 1
    for feature in report["features"]:
        assert counts[feature["id"]] == feature["sourceTriangles"], feature["id"]
    assert vertical_error <= .00501, "Unexpected elevation change"
    assert horizontal_bounds_error <= .3, "Unexpected envelope displacement"
    return {"checkedSourceTiles": len(report["sourceTileHashes"]), "checkedBuildings": len(bounds),
            "validPolygonParts": polygon_parts, "decodedSourceTriangles": sum(counts.values()),
            "maxVerticalQuantizationM": float(vertical_error),
            "maxEnvelopeBoundsDifferenceM": horizontal_bounds_error,
            "sourceHashesMatch": True, "payloadBytes": len(raw_city), "payloadSha256": report["sha256"]}


if __name__ == "__main__":
    station, rms = audit_station()
    result = {"station": station, "city": audit_city(), "stationFitRmsM": rms,
              "interpretation": "Internal geometry checks pass. Station geographic accuracy is provisional; no independent surveyed checkpoints or floor elevations are established."}
    target = ROOT / "docs/spatial-recovery/final-geometry-audit.json"
    target.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))
