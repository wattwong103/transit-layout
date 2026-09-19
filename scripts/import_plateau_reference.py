"""Decode the pinned UC24-13 Shibuya passage into a metric, attributed GLB.

This intentionally supports this archive's flat nodes, CESIUM_RTC centers and
REPLACE tree only. Unsupported source layouts fail rather than losing transforms.
It does not register the hand-drawn explorer or infer floors/routes.
"""

import argparse
import hashlib
import json
import math
import struct
from collections import Counter
from pathlib import Path
from zipfile import ZipFile

import DracoPy
import numpy as np
from pyproj import Transformer

SOURCE_URL = "https://assets.cms.plateau.reearth.io/assets/ae/508f8a-0e19-4be2-bdcc-a21483d44575/uc24-13_shibuyaku_chikagai.zip"
SHA256 = "59d54794dd17c6b258ea171a561d3a94b201ab356a9583a51fe1c3cfe23327fc"
CATALOG = "https://www.geospatial.jp/ckan/dataset/plateau-uc24-13"
ORIGIN = [139.7009682753108, 35.65740742675032, 0.0]


def local_coordinates(ecef, origin=ORIGIN):
    """ECEF meters to east/up/south meters; height origin is ellipsoidal zero."""
    lon, lat = np.radians(origin[:2])
    center = np.array(Transformer.from_crs(4979, 4978, always_xy=True).transform(*origin))
    rotation = np.array([
        [-math.sin(lon), math.cos(lon), 0],
        [math.cos(lat) * math.cos(lon), math.cos(lat) * math.sin(lon), math.sin(lat)],
        [math.sin(lat) * math.cos(lon), math.sin(lat) * math.sin(lon), -math.cos(lat)],
    ])
    return (ecef - center) @ rotation.T


def yup_to_zup(points):
    return points[:, [0, 2, 1]] * np.array([1, -1, 1])


def leaf_tiles(tile):
    if "transform" in tile or tile.get("refine", "REPLACE") != "REPLACE":
        raise ValueError("Unsupported tile transform or refinement")
    if tile.get("children"):
        return [leaf for child in tile["children"] for leaf in leaf_tiles(child)]
    if "content" not in tile:
        raise ValueError("Leaf has no content")
    return [tile]


def decode_tile(raw):
    magic, version, size, ftj, ftb, btj, btb = struct.unpack_from("<4s6I", raw)
    if (magic, version, size) != (b"b3dm", 1, len(raw)):
        raise ValueError("Invalid b3dm header")
    feature = json.loads(raw[28:28 + ftj])
    if set(feature) != {"BATCH_LENGTH"}:
        raise ValueError("Unexpected feature table (including RTC_CENTER)")
    offset = 28 + ftj + ftb
    batch = json.loads(raw[offset:offset + btj])
    if any(len(batch[key]) != feature["BATCH_LENGTH"] for key in ["gml_id", "feature_type", "attributes"]):
        raise ValueError("Inconsistent batch metadata")
    offset += btj + btb
    if struct.unpack_from("<4s2I", raw, offset) != (b"glTF", 2, len(raw) - offset):
        raise ValueError("Invalid GLB header")
    length, kind = struct.unpack_from("<I4s", raw, offset + 12)
    if kind != b"JSON":
        raise ValueError("Missing GLB JSON")
    gltf = json.loads(raw[offset + 20:offset + 20 + length])
    binary_offset = offset + 20 + length
    binary_length, kind = struct.unpack_from("<I4s", raw, binary_offset)
    if kind != b"BIN\0" or binary_offset + 8 + binary_length != len(raw):
        raise ValueError("Invalid GLB binary")
    binary = raw[binary_offset + 8:]
    nodes = gltf["nodes"]
    if (gltf["scenes"][gltf.get("scene", 0)]["nodes"] != list(range(len(nodes)))
            or any(set(n) - {"mesh", "name"} for n in nodes)):
        raise ValueError("Unsupported node hierarchy or transform")
    rtc = np.array(gltf["extensions"]["CESIUM_RTC"]["center"], dtype=np.float64)
    for node in nodes:
        for primitive in gltf["meshes"][node["mesh"]]["primitives"]:
            if primitive.get("mode", 4) != 4:
                raise ValueError("Only triangles are supported")
            extension = primitive["extensions"]["KHR_draco_mesh_compression"]
            view = gltf["bufferViews"][extension["bufferView"]]
            if view["buffer"] != 0:
                raise ValueError("External buffer is unsupported")
            start = view.get("byteOffset", 0)
            mesh = DracoPy.decode(binary[start:start + view["byteLength"]])
            attrs = {a["unique_id"]: a["data"] for a in mesh.attributes}
            positions = attrs[extension["attributes"]["POSITION"]].astype(np.float64)
            ids = attrs[extension["attributes"]["_BATCHID"]].reshape(-1)
            if np.any(ids != ids.astype(int)) or np.any(ids < 0) or np.any(ids >= feature["BATCH_LENGTH"]):
                raise ValueError("Invalid batch IDs")
            triangle_ids = ids[mesh.faces]
            if not np.all(triangle_ids == triangle_ids[:, :1]):
                raise ValueError("Triangle crosses feature boundaries")
            # glTF Y-up -> 3D Tiles Z-up, then application-specific ECEF RTC.
            ecef = yup_to_zup(positions) + rtc
            yield ecef, mesh.faces, triangle_ids[:, 0].astype(int), batch


def write_glb(path, features):
    binary = bytearray()
    gltf = {"asset": {"version": "2.0", "generator": "transit-layout PLATEAU reference importer",
                      "copyright": "Derived from MLIT Project PLATEAU UC24-13. Modified by transit-layout; PDL 1.0 / CC BY 4.0 compatible."},
            "scene": 0, "scenes": [{"nodes": []}], "nodes": [], "meshes": [],
            "bufferViews": [], "accessors": [], "materials": [], "buffers": []}
    colors = {"FloorSurface": [0.23, 0.53, 0.48, 1], "GroundSurface": [0.23, 0.53, 0.48, 1],
              "WallSurface": [0.77, 0.79, 0.74, 1], "InteriorWallSurface": [0.77, 0.79, 0.74, 1],
              "CeilingSurface": [0.84, 0.81, 0.71, 1], "RoofSurface": [0.84, 0.81, 0.71, 1]}
    types = sorted({f["type"] for f in features})
    for kind in types:
        gltf["materials"].append({"name": kind, "doubleSided": True, "pbrMetallicRoughness": {
            "baseColorFactor": colors.get(kind.split(":")[-1], [0.60, 0.68, 0.67, 1]), "metallicFactor": 0, "roughnessFactor": 0.9}})
    for f in features:
        positions = np.concatenate(f.pop("parts")).astype("<f4")
        view_index = len(gltf["bufferViews"])
        gltf["bufferViews"].append({"buffer": 0, "byteOffset": len(binary), "byteLength": positions.nbytes, "target": 34962})
        binary.extend(positions.tobytes())
        gltf["accessors"].append({"bufferView": view_index, "componentType": 5126, "count": len(positions),
                                  "type": "VEC3", "min": positions.min(0).tolist(), "max": positions.max(0).tolist()})
        index = len(gltf["meshes"])
        gltf["meshes"].append({"name": f["id"], "primitives": [{"attributes": {"POSITION": index}, "mode": 4,
                                                                    "material": types.index(f["type"])}]})
        gltf["nodes"].append({"mesh": index, "name": f["id"], "extras": f})
        gltf["scenes"][0]["nodes"].append(index)
    gltf["buffers"].append({"byteLength": len(binary)})
    encoded = json.dumps(gltf, separators=(",", ":")).encode()
    encoded += b" " * (-len(encoded) % 4)
    path.write_bytes(struct.pack("<4sII", b"glTF", 2, 28 + len(encoded) + len(binary))
                     + struct.pack("<I4s", len(encoded), b"JSON") + encoded
                     + struct.pack("<I4s", len(binary), b"BIN\0") + binary)


def import_archive(archive_path, output_dir):
    digest = hashlib.sha256(archive_path.read_bytes()).hexdigest()
    if digest != SHA256:
        raise ValueError("Archive checksum changed; inspect the new source before importing")
    features = {}
    all_positions = []
    geographic = []
    checks = []
    transformer = Transformer.from_crs(4978, 4979, always_xy=True)
    with ZipFile(archive_path) as archive:
        tileset = json.loads(archive.read("tileset.json"))
        if tileset["asset"].get("gltfUpAxis", "Y") != "Y":
            raise ValueError("Unsupported glTF axis")
        leaves = leaf_tiles(tileset["root"])
        for tile in leaves:
            name = tile["content"]["uri"]
            region = tile["boundingVolume"]["region"]
            lower = np.array([math.degrees(region[0]), math.degrees(region[1]), region[4]])
            upper = np.array([math.degrees(region[2]), math.degrees(region[3]), region[5]])
            outside = 0
            for ecef, faces, ids, batch in decode_tile(archive.read(name)):
                geo = np.array(transformer.transform(*ecef.T)).T
                # 1e-7 degrees (~1 cm), 5 cm height tolerance for encoding noise.
                outside += int(np.count_nonzero(np.any((geo < lower - [1e-7, 1e-7, .05]) | (geo > upper + [1e-7, 1e-7, .05]), axis=1)))
                local = local_coordinates(ecef)
                geographic.append(geo)
                all_positions.append(local)
                for batch_id in np.unique(ids):
                    key = batch["gml_id"][batch_id]
                    metadata = {"id": key, "type": batch["feature_type"][batch_id], "attributes": batch["attributes"][batch_id]}
                    if key not in features:
                        features[key] = {**metadata, "parts": [], "sourceTiles": []}
                    elif any(features[key][k] != metadata[k] for k in metadata):
                        raise ValueError("Conflicting feature metadata")
                    features[key]["parts"].append(local[faces[ids == batch_id]].reshape(-1, 3))
                    if name not in features[key]["sourceTiles"]:
                        features[key]["sourceTiles"].append(name)
            checks.append({"tile": name, "verticesOutsideRegion": outside})
        if any(c["verticesOutsideRegion"] for c in checks):
            raise ValueError("Decoded vertices exceed source bounds; coordinate validation failed")
    positions = np.concatenate(all_positions)
    geo = np.concatenate(geographic)
    room_ids = sorted({a["gml:id"] for f in features.values() for a in [f["attributes"], *f["attributes"].get("ancestors", [])] if a.get("feature_type") == "bldg:Room"})
    triangles = sum(len(part) // 3 for f in features.values() for part in f["parts"])
    report = {"title": "Shibuya west-exit underground passage", "sourceUrl": SOURCE_URL, "catalogUrl": CATALOG,
              "sourceSha256": digest, "resourceId": "8e5c37d1-4749-416d-988a-4d15f0fb926c", "sourceSurvey": "2024-12",
              "checkedOn": "2026-09-19", "originWgs84": ORIGIN, "axes": "X east, Y up, Z south; meters",
              "heightDatum": "WGS84 ellipsoidal; not floor elevation or sea-level height",
              "leafTiles": len(leaves), "features": len(features), "triangles": triangles,
              "featureTypes": dict(sorted(Counter(f["type"] for f in features.values()).items())), "roomIds": room_ids,
              "boundsMeters": {"min": positions.min(0).tolist(), "max": positions.max(0).tolist()},
              "extentMeters": (positions.max(0) - positions.min(0)).tolist(),
              "boundsWgs84": {"min": geo.min(0).tolist(), "max": geo.max(0).tolist()}, "tileChecks": checks,
              "registration": {"status": "unregistered", "explorerVersion": "v1.0.0", "controlPoints": 0, "rmseMeters": None},
              "processing": "Finest REPLACE leaves only; Draco decoded; Y-up converted to Z-up before RTC ECEF translation; ECEF converted to local east/up/south. Source feature IDs retained; source colors replaced. Parent LOD meshes omitted. No geometry smoothing, rescaling, or floor assignment.",
              "attribution": "Derived from MLIT Project PLATEAU UC24-13 (Shibuya west-exit underground passage). Processed and recolored by transit-layout.",
              "licenseUrl": "https://www.mlit.go.jp/plateau/site-policy/"}
    output_dir.mkdir(parents=True, exist_ok=True)
    write_glb(output_dir / "shibuya-west-passage.glb", [features[k] for k in sorted(features)])
    report["modelSha256"] = hashlib.sha256((output_dir / "shibuya-west-passage.glb").read_bytes()).hexdigest()
    (output_dir / "reference.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    parser.add_argument("--output", type=Path, default=Path("public/plateau"))
    args = parser.parse_args()
    result = import_archive(args.archive, args.output)
    print(json.dumps({k: result[k] for k in ["leafTiles", "features", "triangles", "extentMeters", "registration"]}, indent=2))
