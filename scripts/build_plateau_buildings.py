"""Extract eight source building meshes from the pinned PLATEAU cache.

Preserve source triangles and metric coordinates; remove textures and metadata
unrelated to the selected buildings. No roof reconstruction or decimation.
"""
import hashlib
import json
import struct
from collections import defaultdict
from pathlib import Path

import numpy as np
from import_plateau_reference import decode_tile, local_coordinates

ROOT = Path(__file__).resolve().parents[1]


def write_buildings_glb(path, features, attribution):
    binary = bytearray()
    gltf = {"asset": {"version": "2.0", "generator": "transit-layout PLATEAU building extractor", "copyright": attribution},
            "scene": 0, "scenes": [{"nodes": []}], "nodes": [], "meshes": [], "bufferViews": [], "accessors": [],
            "materials": [{"name": "Untextured PLATEAU", "doubleSided": True,
                           "pbrMetallicRoughness": {"baseColorFactor": [.65, .74, .70, 1], "metallicFactor": 0, "roughnessFactor": .85}}]}

    def accessor(array, kind, component, target, bounds=False):
        binary.extend(b"\0" * (-len(binary) % 4))
        view = len(gltf["bufferViews"])
        gltf["bufferViews"].append({"buffer": 0, "byteOffset": len(binary), "byteLength": array.nbytes, "target": target})
        binary.extend(array.tobytes())
        value = {"bufferView": view, "componentType": component, "count": len(array), "type": kind}
        if bounds:
            value.update(min=array.min(axis=0).tolist(), max=array.max(axis=0).tolist())
        gltf["accessors"].append(value)
        return len(gltf["accessors"]) - 1

    for feature in features:
        # Merge only byte-identical positions after float32 conversion. Preserve
        # triangle order and winding; shader flat normals retain hard roof edges.
        vertices, indices = np.unique(feature["triangles"].astype("<f4").reshape(-1, 3), axis=0, return_inverse=True)
        small = len(vertices) <= 65535
        position = accessor(vertices, "VEC3", 5126, 34962, True)
        index = accessor(indices.astype("<u2" if small else "<u4"), "SCALAR", 5123 if small else 5125, 34963)
        i = len(gltf["nodes"])
        gltf["nodes"].append({"mesh": i, "name": feature["explorerId"], "extras": {
            "explorerId": feature["explorerId"], "featureId": feature["featureId"]}})
        gltf["meshes"].append({"name": feature["explorerId"], "primitives": [{
            "attributes": {"POSITION": position}, "indices": index, "material": 0, "mode": 4}]})
        gltf["scenes"][0]["nodes"].append(i)
    binary.extend(b"\0" * (-len(binary) % 4))
    gltf["buffers"] = [{"byteLength": len(binary)}]
    encoded = json.dumps(gltf, separators=(",", ":")).encode()
    encoded += b" " * (-len(encoded) % 4)
    path.write_bytes(struct.pack("<4sII", b"glTF", 2, 28 + len(encoded) + len(binary))
                     + struct.pack("<I4s", len(encoded), b"JSON") + encoded
                     + struct.pack("<I4s", len(binary), b"BIN\0") + binary)


def main():
    outlines = json.loads((ROOT / "src/data/station-building-outlines.json").read_text(encoding="utf-8"))
    manifest = json.loads((ROOT / "docs/spatial-recovery/lightweight-city-manifest.json").read_text(encoding="utf-8"))
    if hashlib.sha256((ROOT / "public/plateau/station-city.json").read_bytes()).hexdigest() != outlines["sourceCitySha256"]:
        raise ValueError("Shared outline source changed")
    selected = {b["featureId"]: b for b in outlines["buildings"]}
    source_features = {f["id"]: f for f in manifest["features"] if f["id"] in selected}
    if set(source_features) != set(selected):
        raise ValueError("Missing source tile references")
    names = sorted({name for f in source_features.values() for name in f["sourceTiles"]})
    fragments = defaultdict(list)
    for name in names:
        raw = (ROOT / ".cache/plateau-city/2025/buildings" / name).read_bytes()
        if hashlib.sha256(raw).hexdigest() != manifest["sourceTileHashes"][name]:
            raise ValueError(f"Pinned source tile changed: {name}")
        for ecef, faces, ids, batch in decode_tile(raw):
            local = local_coordinates(ecef)
            for batch_id in np.unique(ids):
                ident = batch["gml_id"][batch_id]
                if ident in selected:
                    fragments[ident].append(local[faces[ids == batch_id]])
    features, checks = [], []
    for ident, match in sorted(selected.items()):
        triangles = np.concatenate(fragments[ident])
        if len(triangles) != source_features[ident]["sourceTriangles"] or not np.isfinite(triangles).all():
            raise ValueError(f"Incomplete building: {ident}")
        features.append({"explorerId": match["explorerId"], "featureId": ident, "triangles": triangles})
        checks.append({"explorerId": match["explorerId"], "featureId": ident, "identity": match["identity"],
                       "triangles": len(triangles), "bounds": {"min": triangles.min(axis=(0, 1)).tolist(), "max": triangles.max(axis=(0, 1)).tolist()},
                       "sourceTiles": source_features[ident]["sourceTiles"]})
    attribution = "Derived from MLIT Project PLATEAU, Shibuya ward 2025 release. Source building triangles retained; textures removed and materials replaced by transit-layout. Five building identity matches use the separate crosswalk credited to OpenStreetMap contributors (ODbL 1.0)."
    output = ROOT / "public/plateau/station-buildings.glb"
    write_buildings_glb(output, features, attribution)
    encoded = output.read_bytes()
    if len(encoded) > 500_000:
        raise ValueError("Selected building meshes exceed the 500 KB optional download budget")
    summary = {"buildings": len(features), "triangles": sum(c["triangles"] for c in checks), "bytes": len(encoded),
               "sha256": hashlib.sha256(encoded).hexdigest(), "originWgs84": manifest["originWgs84"],
               "displayGroundEllipsoidM": manifest["displayGroundEllipsoidM"], "sourceYear": manifest["sourceYear"],
               "surveyYearNote": manifest["surveyYearNote"], "asset": "/plateau/station-buildings.glb"}
    (ROOT / "src/data/plateau-buildings-summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    report = {**summary, "attribution": attribution, "licenseUrl": "https://www.mlit.go.jp/plateau/site-policy/",
              "identityCrosswalk": "../evidence/building-crosswalk.json", "identityLicenseUrl": "https://www.openstreetmap.org/copyright",
              "sourceUrl": manifest["sourceUrl"], "sourceTileHashes": {name: manifest["sourceTileHashes"][name] for name in names},
              "axes": "X east, Y up, Z south; metres at the shared WGS84 origin; ellipsoidal height, not station floors",
              "processing": "Finest REPLACE leaves from pinned compact-city sources. Decode Draco, Y-up to Z-up plus RTC ECEF, local east/up/south. Retain all source triangles; deduplicate equal float32 positions; omit textures and replace materials. Display subtracts the shared 55 m plane; the original diagram applies the inverse station similarity with uniform vertical scale.",
              "features": checks}
    (ROOT / "public/plateau/station-buildings.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary))


if __name__ == "__main__":
    main()
