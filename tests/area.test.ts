import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as C from "cesium";
import { passagePlacement } from "../src/lib/plateauGeoreference";
import reference from "../public/plateau/reference.json";
import landmarks from "../src/data/plateau-landmarks.json";

test("geographic scene placement reproduces the decoded source bounds without a fitted offset", () => {
  const placement = passagePlacement(C, reference.originWgs84);
  assert.equal(placement.upAxis, C.Axis.Y);
  assert.equal(placement.forwardAxis, C.Axis.X);
  assert.equal(placement.scale, 1);
  const raw = readFileSync("public/plateau/shibuya-west-passage.glb");
  const length = raw.readUInt32LE(12);
  const gltf = JSON.parse(raw.subarray(20, 20 + length).toString());
  const start = 28 + length;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const view of gltf.bufferViews) {
    for (
      let offset = start + view.byteOffset;
      offset < start + view.byteOffset + view.byteLength;
      offset += 12
    ) {
      // Cesium's documented Y-up -> Z-up conversion, with no forward rotation.
      const local = new C.Cartesian3(
        raw.readFloatLE(offset),
        -raw.readFloatLE(offset + 8),
        raw.readFloatLE(offset + 4),
      );
      const world = C.Matrix4.multiplyByPoint(
        placement.modelMatrix,
        local,
        new C.Cartesian3(),
      );
      const p = C.Cartographic.fromCartesian(world);
      const geographic = [
        C.Math.toDegrees(p.longitude),
        C.Math.toDegrees(p.latitude),
        p.height,
      ];
      geographic.forEach((value, axis) => {
        min[axis] = Math.min(min[axis], value);
        max[axis] = Math.max(max[axis], value);
      });
    }
  }
  [min, max].forEach((bounds, end) =>
    bounds.forEach((value, axis) => {
      const expected = (
        end ? reference.boundsWgs84.max : reference.boundsWgs84.min
      )[axis];
      assert.ok(
        Math.abs(value - expected) < (axis === 2 ? 0.001 : 1e-7),
        `axis ${axis}: ${value} vs ${expected}`,
      );
    }),
  );
});

test("matched landmarks retain valid source IDs and geographic bounds", () => {
  assert.equal(
    new Set(landmarks.map((place) => place.featureId)).size,
    landmarks.length,
  );
  assert.equal(
    new Set(landmarks.map((place) => place.explorerId)).size,
    landmarks.length,
  );
  for (const place of landmarks) {
    assert.ok(place.name && place.matchEvidence && place.sourceTile);
    assert.ok(
      place.longitude >= place.bounds[0] && place.longitude <= place.bounds[2],
    );
    assert.ok(
      place.latitude >= place.bounds[1] && place.latitude <= place.bounds[3],
    );
    assert.ok(place.longitude > 139.65 && place.longitude < 139.73);
    assert.ok(place.latitude > 35.63 && place.latitude < 35.7);
  }
});
