import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  fitSimilarity,
  transformPoint,
  geographicToLocal,
  alignmentControls,
  stationAlignment,
  registerExplorer,
} from "../src/lib/stationRegistration";
import { explorerData } from "../src/data/explorer";
import summary from "../src/data/station-city-summary.json";
import type { CompactCity } from "../src/types/geographic";
import { getSpaceOpenings } from "../src/lib/explorer";

test("similarity registration recovers a known rotation, uniform scale and translation", () => {
  const controls = [
    [0, 0],
    [20, 0],
    [4, 13],
    [-6, 8],
  ].map(([x, z], i) => ({
    id: String(i),
    diagram: [x, z] as const,
    target: [1.2 * x - 0.7 * z + 42, 0.7 * x + 1.2 * z - 31] as const,
  }));
  const fit = fitSimilarity(controls);
  assert.ok(Math.abs(fit.a - 1.2) < 1e-12);
  assert.ok(Math.abs(fit.b - 0.7) < 1e-12);
  assert.ok(fit.rmse < 1e-12);
  const check = transformPoint([9, -5], fit);
  assert.ok(Math.hypot(check[0] - 56.3, check[1] + 30.7) < 1e-10);
  assert.throws(() => fitSimilarity([controls[0], controls[0]]), /distinct/);
  assert.throws(
    () => fitSimilarity([{ id: "bad", diagram: [NaN, 0], target: [0, 0] }]),
    /finite/,
  );
});

test("local geographic axes preserve east/up/south and the source origin", () => {
  const origin = summary.originWgs84;
  const local = geographicToLocal(origin[0], origin[1], origin[2]);
  local.forEach((v) => assert.ok(Math.abs(v) < 1e-8));
  const up = geographicToLocal(origin[0], origin[1], 10);
  assert.ok(Math.abs(up[1] - 10) < 1e-8);
  assert.ok(geographicToLocal(origin[0] + 0.001, origin[1])[0] > 90);
  assert.ok(geographicToLocal(origin[0], origin[1] + 0.001)[2] < -110);
});

test("all station elements share one transform while the original drawing remains immutable", () => {
  const original = JSON.stringify(explorerData);
  const aligned = registerExplorer(explorerData);
  assert.equal(JSON.stringify(explorerData), original);
  const point = (p: readonly [number, number]) => transformPoint(p, stationAlignment);
  for (const [i, source] of Array.from(explorerData.spaces.entries())) {
    const target = aligned.spaces[i];
    assert.equal(target.id, source.id);
    assert.deepEqual(target.polygon, source.polygon.map(point));
    assert.deepEqual(target.labelPosition, point(source.labelPosition));
    assert.deepEqual(target.tracks, source.tracks?.map((t) => ({ ...t, points: t.points.map(point) })));
  }
  for (const [i, source] of Array.from(explorerData.buildings.entries())) {
    assert.equal(aligned.buildings[i].id, source.id);
    assert.deepEqual(aligned.buildings[i].polygon, source.polygon.map(point));
    assert.deepEqual(aligned.buildings[i].labelPosition, point(source.labelPosition));
  }
  for (const [i, source] of Array.from(explorerData.exits.entries())) {
    assert.deepEqual(aligned.exits[i], { ...source, position: point(source.position) });
  }
  for (const [i, source] of Array.from(explorerData.connectors.entries())) {
    assert.deepEqual(aligned.connectors[i], {
      ...source,
      ...(source.stops ? { stops: source.stops.map(s=>({...s, position:point(s.position)})) } : {}),
      width: source.width * stationAlignment.scale,
      from: { ...source.from, position: point(source.from.position) },
      to: { ...source.to, position: point(source.to.position) },
    });
  }
  (explorerData.facilities ?? []).forEach((source,i)=>assert.deepEqual(aligned.facilities![i], {...source, position:point(source.position)}));
  assert.deepEqual(
    aligned.spaces.map((s) => s.levelId),
    explorerData.spaces.map((s) => s.levelId),
  );
});

test("every stair and lift opening retains its scale, rotation and position after registration", () => {
  // A large rotation catches axis-aligned lift holes being regenerated in the new frame.
  const rotated = { ...stationAlignment, a: 0, b: 2.5, scale: 2.5, tx: 140, tz: -60 };
  for (const fit of [stationAlignment, rotated]) {
    const aligned = registerExplorer(explorerData, fit);
    let count = 0;
    for (const [i, source] of Array.from(explorerData.spaces.entries())) {
      const holes = getSpaceOpenings(explorerData, source);
      count += holes.length;
      assert.deepEqual(
        getSpaceOpenings(aligned, aligned.spaces[i]),
        holes.map((ring) => ring.map((p) => transformPoint(p, fit))),
        source.id,
      );
    }
    assert.ok(count > 0, "Derived openings must exist in both frames");
  }
});

test("the real control fit exposes its residual instead of claiming a perfect match", () => {
  assert.equal(alignmentControls.length, 3);
  assert.ok(stationAlignment.rmse > 20 && stationAlignment.rmse < 35);
  assert.ok(stationAlignment.residuals.every((r) => r.distance > 10));
  const left = transformPoint([0, 0], stationAlignment),
    right = transformPoint([100, 0], stationAlignment);
  assert.ok(
    Math.abs(
      Math.hypot(left[0] - right[0], left[1] - right[1]) -
        100 * stationAlignment.scale,
    ) < 1e-10,
  );
});

test("the default city stays below its payload budget and retains source building identities", () => {
  const raw = readFileSync("public/plateau/station-city.json");
  assert.ok(
    raw.length < 1_000_000,
    "Default city geometry must stay below 1 MB uncompressed",
  );
  assert.equal(raw.length, summary.bytes);
  assert.equal(createHash("sha256").update(raw).digest("hex"), summary.sha256);
  const city = JSON.parse(raw.toString()) as CompactCity;
  assert.equal(city.buildings.length, summary.buildings);
  assert.equal(
    new Set(city.buildings.map((b) => b.id)).size,
    city.buildings.length,
  );
  assert.deepEqual(
    city.buildings
      .filter((b) => b.explorerId)
      .map((b) => b.explorerId)
      .sort(),
    ["hikarie", "mark-city", "stream"],
  );
  for (const b of city.buildings) {
    assert.ok(b.top > b.base && Number.isFinite(b.top));
    assert.ok(
      b.parts.length > 0 &&
        b.parts.every((p) =>
          p.every(
            (ring) =>
              ring.length >= 3 &&
              ring.every(
                (point) => point.length === 2 && point.every(Number.isFinite),
              ),
          ),
        ),
    );
  }
});
