import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as C from "cesium";
import { extrudePlan } from "../src/lib/planGeometry";
import { getSpaceOpenings, pointInPolygon, connectorStops } from "../src/lib/explorer";
import { explorerData } from "../src/data/explorer";
import { geographicExplorer, geographicToLocal } from "../src/lib/stationRegistration";
import summary from "../src/data/station-city-summary.json";
import type { Point2 } from "../src/types/explorer";
import type { CompactCity } from "../src/types/geographic";

function area(ring: readonly Point2[]) {
  return Math.abs(ring.reduce((sum, p, i) => {
    const q = ring[(i + 1) % ring.length];
    return sum + p[0] * q[1] - q[0] * p[1];
  }, 0)) / 2;
}

function checkExtrusion(id: string, rings: Point2[][], depth: number) {
  const geometry = extrudePlan(rings, depth);
  try {
    const p = geometry.getAttribute("position"), normals = geometry.getAttribute("normal");
    let topArea = 0;
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < p.count; i++) {
      [p.getX(i), p.getY(i), p.getZ(i)].forEach((v, a) => {
        assert.ok(Number.isFinite(v), `${id}: finite mesh`);
        min[a] = Math.min(min[a], v);
        max[a] = Math.max(max[a], v);
      });
    }
    for (let i = 0; i < p.count; i += 3) {
      if (normals.getY(i) < 0.99) continue;
      const triangle = [0, 1, 2].map((k) => [p.getX(i + k), p.getZ(i + k)] as Point2);
      topArea += area(triangle);
    }
    const expected = area(rings[0]) - rings.slice(1).reduce((sum, ring) => sum + area(ring), 0);
    assert.ok(expected > 0, `${id}: positive polygon area`);
    assert.ok(Math.abs(topArea - expected) < Math.max(0.002, expected * 1e-5),
      `${id}: mesh cap area ${topArea} vs plan ${expected}`);
    const xs = rings[0].map((p) => p[0]), zs = rings[0].map((p) => p[1]);
    const bounds = [[Math.min(...xs), 0, Math.min(...zs)], [Math.max(...xs), depth, Math.max(...zs)]];
    [min, max].forEach((end, i) => end.forEach((value, axis) => {
      assert.ok(Math.abs(value - bounds[i][axis]) < 0.0001, `${id}: axis ${axis} reflected or shifted`);
    }));
  } finally { geometry.dispose(); }
}

test("all original and registered floor slabs, voids and buildings extrude without plan reflection or missing area", () => {
  for (const data of [explorerData, geographicExplorer]) {
    for (const space of data.spaces)
      checkExtrusion(space.id, [space.polygon, ...getSpaceOpenings(data, space)], 1.35);
    for (const building of data.buildings)
      checkExtrusion(building.id, [building.polygon], building.displayHeight);
  }
});

test("every compact PLATEAU envelope triangulates with its concavities and holes intact", () => {
  const city = JSON.parse(readFileSync("public/plateau/station-city.json", "utf8")) as CompactCity;
  for (const building of city.buildings)
    for (const rings of building.parts)
      checkExtrusion(building.id, rings, building.top - building.base);
});

test("every recorded connector stop lands within a station slab on its declared floor in both frames", () => {
  for (const data of [explorerData, geographicExplorer])
    for (const connector of data.connectors)
      for (const endpoint of connectorStops(connector))
        assert.ok(data.spaces.some((s) => s.levelId === endpoint.levelId && pointInPolygon(endpoint.position, s.polygon)),
          `${connector.id}: unsupported endpoint on ${endpoint.levelId}`);
});

test("all exit anchors touch or lie inside their associated passage, including boundary points", () => {
  for (const data of [explorerData, geographicExplorer]) {
    for (const exit of data.exits) {
      const polygon = data.spaces.find((s) => s.id === exit.spaceId)!.polygon;
      const onBoundary = polygon.some((a, i) => {
        const b = polygon[(i + 1) % polygon.length];
        const dx = b[0] - a[0], dz = b[1] - a[1];
        const t = Math.max(0, Math.min(1, ((exit.position[0] - a[0]) * dx + (exit.position[1] - a[1]) * dz) / (dx * dx + dz * dz)));
        return Math.hypot(exit.position[0] - a[0] - t * dx, exit.position[1] - a[1] - t * dz) < 1e-8;
      });
      assert.ok(onBoundary || pointInPolygon(exit.position, polygon), `${exit.id}: detached from ${exit.spaceId}`);
    }
  }
});

test("map and building coordinates agree with Cesium's independent WGS84 transform across the neighbourhood", () => {
  const [lon, lat, h] = summary.originWgs84;
  const inverse = C.Matrix4.inverseTransformation(
    C.Transforms.eastNorthUpToFixedFrame(C.Cartesian3.fromDegrees(lon, lat, h)), new C.Matrix4(),
  );
  for (const longitude of [139.693, lon, 139.709])
    for (const latitude of [35.653, lat, 35.664])
      for (const height of [0, 55, 230]) {
        const enu = C.Matrix4.multiplyByPoint(inverse, C.Cartesian3.fromDegrees(longitude, latitude, height), new C.Cartesian3());
        const actual = geographicToLocal(longitude, latitude, height);
        const expected = [enu.x, enu.z, -enu.y];
        actual.forEach((v, i) => assert.ok(Math.abs(v - expected[i]) < 1e-7));
      }
});
