"""Coordinate and published-asset regressions; run after installing requirements-plateau."""
import hashlib
import importlib.util
import json
import struct
import tempfile
import unittest
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("plateau", ROOT / "scripts/import_plateau_reference.py")
plateau = importlib.util.module_from_spec(spec)
spec.loader.exec_module(plateau)


class PlateauReferenceTests(unittest.TestCase):
    def test_metric_axes_at_known_equatorial_origin(self):
        # EPSG:4978 at lon=lat=h=0 is (6378137, 0, 0).
        # ECEF Y is east; X is up; Z is north (negative display Z).
        points = np.array([[6378137, 10, 0], [6378147, 0, 0], [6378137, 0, 10]])
        np.testing.assert_allclose(plateau.local_coordinates(points, [0, 0, 0]),
                                   [[10, 0, 0], [0, 10, 0], [0, 0, -10]], atol=1e-8)

    def test_gltf_axis_conversion_preserves_scale_and_handedness(self):
        basis = plateau.yup_to_zup(np.eye(3))
        np.testing.assert_array_equal(basis[1], [0, 0, 1])
        np.testing.assert_allclose(basis @ basis.T, np.eye(3))
        self.assertAlmostEqual(np.linalg.det(basis), 1)

    def test_replace_tree_does_not_duplicate_parent_geometry(self):
        child = {"content": {"uri": "child.b3dm"}}
        tree = {"refine": "REPLACE", "content": {"uri": "parent.b3dm"}, "children": [child]}
        self.assertEqual(plateau.leaf_tiles(tree), [child])
        for bad in [{**tree, "refine": "ADD"}, {**tree, "transform": list(np.eye(4).flat)}]:
            with self.assertRaises(ValueError):
                plateau.leaf_tiles(bad)

    def test_changed_source_fails_before_writing(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "changed.zip"
            source.write_bytes(b"not the reviewed source")
            output = Path(directory) / "output"
            with self.assertRaisesRegex(ValueError, "checksum"):
                plateau.import_archive(source, output)
            self.assertFalse(output.exists())

    def test_published_model_matches_report_and_keeps_feature_provenance(self):
        report = json.loads((ROOT / "public/plateau/reference.json").read_text(encoding="utf-8"))
        raw = (ROOT / "public/plateau/shibuya-west-passage.glb").read_bytes()
        self.assertEqual(hashlib.sha256(raw).hexdigest(), report["modelSha256"])
        self.assertEqual(struct.unpack_from("<4sII", raw), (b"glTF", 2, len(raw)))
        length, kind = struct.unpack_from("<I4s", raw, 12)
        self.assertEqual(kind, b"JSON")
        gltf = json.loads(raw[20:20 + length])
        binary = raw[28 + length:]
        positions = []
        ids = []
        for node in gltf["nodes"]:
            self.assertTrue(node["extras"]["sourceTiles"])
            self.assertTrue(node["extras"]["attributes"])
            ids.append(node["extras"]["id"])
            accessor = gltf["accessors"][gltf["meshes"][node["mesh"]]["primitives"][0]["attributes"]["POSITION"]]
            view = gltf["bufferViews"][accessor["bufferView"]]
            start = view["byteOffset"]
            p = np.frombuffer(binary[start:start + view["byteLength"]], dtype="<f4").reshape(-1, 3)
            self.assertEqual(len(p), accessor["count"])
            self.assertEqual(len(p) % 3, 0)
            self.assertTrue(np.isfinite(p).all())
            positions.append(p)
        p = np.concatenate(positions)
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(len(ids), report["features"])
        self.assertEqual(len(p) // 3, report["triangles"])
        np.testing.assert_allclose(p.min(0), report["boundsMeters"]["min"], atol=1e-5)
        np.testing.assert_allclose(p.max(0), report["boundsMeters"]["max"], atol=1e-5)
        self.assertEqual(report["leafTiles"], len(report["tileChecks"]))
        self.assertTrue(all(c["verticesOutsideRegion"] == 0 for c in report["tileChecks"]))
        self.assertIsNone(report["registration"]["rmseMeters"])
        self.assertEqual(report["registration"]["controlPoints"], 0)


if __name__ == "__main__":
    unittest.main()
