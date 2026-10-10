"""Test the indexed export independently of the downloaded source cache."""
import json
import struct
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np
from shapely.geometry import Polygon
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from build_plateau_buildings import write_buildings_glb


class PlateauBuildingTests(unittest.TestCase):
    def test_shipped_meshes_match_shared_plan_envelopes_and_heights(self):
        """Compare the actual GLB to the separately derived simplified city outlines."""
        root = Path(__file__).resolve().parents[1]
        raw = (root / "public/plateau/station-buildings.glb").read_bytes()
        length = struct.unpack_from("<I", raw, 12)[0]
        model = json.loads(raw[20:20 + length])
        binary = raw[28 + length:]
        outlines = json.loads((root / "src/data/station-building-outlines.json").read_text(encoding="utf-8"))

        def accessor(index, width):
            a = model["accessors"][index]
            view = model["bufferViews"][a["bufferView"]]
            dtype = {5126: "<f4", 5123: "<u2", 5125: "<u4"}[a["componentType"]]
            offset = view.get("byteOffset", 0) + a.get("byteOffset", 0)
            return np.frombuffer(binary, dtype=dtype, count=a["count"] * width, offset=offset).reshape(-1, width)

        for node in model["nodes"]:
            with self.subTest(building=node["extras"]["explorerId"]):
                outline = next(b for b in outlines["buildings"] if b["featureId"] == node["extras"]["featureId"])
                primitive = model["meshes"][node["mesh"]]["primitives"][0]
                positions = accessor(primitive["attributes"]["POSITION"], 3)
                indices = accessor(primitive["indices"], 1).reshape(-1, 3)
                faces = [Polygon(t[:, [0, 2]]) for t in positions[indices]]
                projection = unary_union([p for p in faces if p.is_valid and p.area > 1e-8])
                plan = unary_union([Polygon(part[0], part[1:]) for part in outline["parts"]])
                # 0.25 m simplification plus centimetre quantization/float32 allowance.
                self.assertLess(projection.difference(plan.buffer(.27)).area, .001)
                self.assertLess(plan.difference(projection.buffer(.27)).area, .001)
                self.assertAlmostEqual(float(positions[:, 1].min()), outline["base"], delta=.006)
                self.assertAlmostEqual(float(positions[:, 1].max()), outline["top"], delta=.006)

    def test_indexed_export_preserves_triangle_order_winding_and_source_coordinates(self):
        triangles = np.array([[[1, 56, 2], [3, 58, 2], [1, 56, 4]],
                              [[1, 56, 4], [3, 58, 2], [3, 58, 4]]], dtype=np.float64)
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "buildings.glb"
            feature = {"explorerId": "fixture", "featureId": "source-id", "triangles": triangles}
            write_buildings_glb(path, [feature], "PLATEAU fixture")
            raw = path.read_bytes()
            length = struct.unpack_from("<I", raw, 12)[0]
            model = json.loads(raw[20:20 + length])
            binary = raw[28 + length:]

            def accessor(index, dtype, shape):
                a = model["accessors"][index]
                view = model["bufferViews"][a["bufferView"]]
                self.assertEqual(view["byteOffset"] % 4, 0)
                return np.frombuffer(binary[view["byteOffset"]:view["byteOffset"] + view["byteLength"]], dtype=dtype).reshape(shape)

            primitive = model["meshes"][0]["primitives"][0]
            positions = accessor(primitive["attributes"]["POSITION"], "<f4", (-1, 3))
            indices = accessor(primitive["indices"], "<u2", (-1, 3))
            self.assertEqual(len(positions), 4)
            np.testing.assert_array_equal(positions[indices], triangles.astype("<f4"))
            self.assertEqual(model["nodes"][0]["extras"]["featureId"], "source-id")
            write_buildings_glb(path, [feature], "PLATEAU fixture")
            self.assertEqual(raw, path.read_bytes())


if __name__ == "__main__":
    unittest.main()
