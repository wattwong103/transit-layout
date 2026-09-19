"""Check the geometric validity of the actual compact city, not just its JSON."""
import json
import sys
import unittest
from pathlib import Path

import numpy as np
from shapely.geometry import Polygon

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from build_lightweight_city import simplify_envelope


class LightweightCityTests(unittest.TestCase):
    def test_envelope_keeps_concave_plan_shape_instead_of_its_bounding_box(self):
        # Two adjacent rectangles make an L-shaped source roof, area 75 m2.
        xz = np.array([[[0, 0], [10, 0], [10, 5]], [[0, 0], [10, 5], [0, 5]],
                       [[0, 5], [5, 5], [5, 10]], [[0, 5], [5, 10], [0, 10]]])
        triangles = np.stack([xz[:, :, 0], np.full((4, 3), 55), xz[:, :, 1]], axis=2)
        parts, error, area = simplify_envelope(triangles)
        self.assertEqual(len(parts), 1)
        polygon = Polygon(parts[0][0], parts[0][1:])
        self.assertTrue(polygon.is_valid)
        self.assertAlmostEqual(polygon.area, 75)
        self.assertAlmostEqual(area, 75)
        self.assertLess(error, .01)

    def test_published_envelopes_are_valid_with_holes_preserved(self):
        city = json.loads((ROOT / "public/plateau/station-city.json").read_text())
        for building in city["buildings"]:
            self.assertGreater(building["top"], building["base"])
            for rings in building["parts"]:
                polygon = Polygon(rings[0], rings[1:])
                self.assertTrue(polygon.is_valid, building["id"])
                self.assertGreater(polygon.area, 0)
        report = json.loads((ROOT / "docs/spatial-recovery/lightweight-city-manifest.json").read_text())
        self.assertLess(report["maxOuterBoundaryDeviationM"], .3)
        self.assertEqual(len(report["features"]), len(city["buildings"]))


if __name__ == "__main__":
    unittest.main()
