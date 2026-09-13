"""Inspect metadata in the public Shibuya 3D Tiles ZIP without extracting it.

Usage: python scripts/inspect_plateau_archive.py archive.zip --output report.json
This does not decode Draco geometry, assign floors, or validate spatial accuracy.
"""

import argparse
import hashlib
import json
import math
import struct
from collections import Counter
from pathlib import Path
from zipfile import ZipFile


def inspect_archive(path):
    with ZipFile(path) as archive:
        names = archive.namelist()
        tileset = json.loads(archive.read("tileset.json"))
        tiles = []

        def visit(tile):
            tiles.append(tile)
            for child in tile.get("children", []):
                visit(child)

        visit(tileset["root"])
        references = {t["content"]["uri"] for t in tiles if "content" in t}
        missing = sorted(references - set(names))
        if missing:
            raise ValueError(f"Missing tile payloads: {missing}")

        feature_ids = set()
        room_ids = set()
        building_ids = set()
        feature_types = {}
        meshcodes = set()
        attribute_keys = set()
        extensions = set()
        generators = set()
        rtc_centers = set()
        total_batch_entries = 0
        for name in sorted(references):
            raw = archive.read(name)
            if len(raw) < 28:
                raise ValueError(f"Truncated b3dm header: {name}")
            magic, version, size, ftj, ftb, btj, btb = struct.unpack_from("<4s6I", raw)
            if magic != b"b3dm" or version != 1 or size != len(raw):
                raise ValueError(f"Unexpected b3dm header: {name}")
            glb_offset = 28 + ftj + ftb + btj + btb
            if glb_offset + 20 > len(raw):
                raise ValueError(f"Truncated b3dm tables: {name}")
            feature = json.loads(raw[28:28 + ftj])
            batch_offset = 28 + ftj + ftb
            batch = json.loads(raw[batch_offset:batch_offset + btj])
            ids = batch.get("gml_id", [])
            types = batch.get("feature_type", [])
            attributes = batch.get("attributes", [])
            if not (len(ids) == len(types) == len(attributes) == feature["BATCH_LENGTH"]):
                raise ValueError(f"Batch metadata lengths disagree: {name}")
            total_batch_entries += len(ids)
            for feature_id, feature_type, attrs in zip(ids, types, attributes):
                feature_ids.add(feature_id)
                previous = feature_types.setdefault(feature_id, feature_type)
                if previous != feature_type:
                    raise ValueError(f"Conflicting feature types: {feature_id}")
                meshcodes.add(attrs.get("meshcode", ""))
                attribute_keys.update(attrs)
                for entry in [attrs, *attrs.get("ancestors", [])]:
                    if entry.get("feature_type") == "bldg:Room":
                        room_ids.add(entry["gml:id"])
                    if entry.get("feature_type") == "bldg:Building":
                        building_ids.add(entry["gml:id"])
            glb_magic, glb_version, glb_size = struct.unpack_from("<4s2I", raw, glb_offset)
            if glb_magic != b"glTF" or glb_version != 2 or glb_size != len(raw) - glb_offset:
                raise ValueError(f"Unexpected GLB header: {name}")
            json_size, chunk_type = struct.unpack_from("<I4s", raw, glb_offset + 12)
            if chunk_type != b"JSON" or glb_offset + 20 + json_size > len(raw):
                raise ValueError(f"Invalid GLB JSON chunk: {name}")
            gltf = json.loads(raw[glb_offset + 20:glb_offset + 20 + json_size])
            extensions.update(gltf.get("extensionsUsed", []))
            generators.add(gltf["asset"].get("generator", ""))
            rtc = gltf.get("extensions", {}).get("CESIUM_RTC", {}).get("center")
            if rtc:
                rtc_centers.add(tuple(rtc))

        regions = [t["boundingVolume"]["region"] for t in tiles]
        union = [min(r[0] for r in regions), min(r[1] for r in regions),
                 max(r[2] for r in regions), max(r[3] for r in regions),
                 min(r[4] for r in regions), max(r[5] for r in regions)]
        return {
            "sourceId": "plateau-uc24-13-shibuya-west",
            "archiveSha256": hashlib.sha256(path.read_bytes()).hexdigest(),
            "archiveBytes": path.stat().st_size,
            "uncompressedBytes": sum(i.file_size for i in archive.infolist()),
            "tilesetVersion": tileset["asset"]["version"],
            "tileCount": len(tiles),
            "leafTileCount": sum(not t.get("children") for t in tiles),
            "b3dmCount": len(references),
            "missingReferences": missing,
            "citygmlFiles": [n for n in names if n.lower().endswith(".gml")],
            "licenseFiles": [n for n in names if any(s in n.lower() for s in ("license", "readme", "terms"))],
            "rootRegionRadiansAndEllipsoidMetres": tileset["root"]["boundingVolume"]["region"],
            "allTileBoundsDegreesAndEllipsoidMetres": [*[math.degrees(v) for v in union[:4]], *union[4:]],
            "rootGeometricError": tileset["root"]["geometricError"],
            "geometricErrorMeaning": "Tile refinement threshold, not survey or registration accuracy.",
            "totalBatchEntriesAcrossRefinementLevels": total_batch_entries,
            "uniqueFeatureCount": len(feature_ids),
            "uniqueFeatureTypes": dict(sorted(Counter(feature_types.values()).items())),
            "roomIds": sorted(room_ids),
            "buildingIds": sorted(building_ids),
            "sourceMeshcodes": sorted(meshcodes),
            "attributeKeys": sorted(attribute_keys),
            "gltfExtensions": sorted(extensions),
            "gltfGenerators": sorted(generators),
            "rtcCenterCount": len(rtc_centers),
            "sampleRtcCenter": sorted(rtc_centers)[0] if rtc_centers else None,
            "scope": "Metadata/header inspection only; meshes not decoded or registered to the prototype.",
        }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    result = json.dumps(inspect_archive(args.archive), ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.write_text(result, encoding="utf-8")
    else:
        print(result, end="")
