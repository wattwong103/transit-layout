import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { explorerData } from "../src/data/explorer";
import outlines from "../src/data/station-building-outlines.json";
import entrances from "../public/evidence/entrance-references.json";
import crosswalk from "../public/evidence/building-crosswalk.json";
import { schematicExplorer, geographicExplorer, geographicToLocal, stationAlignment, alignmentControls, withCityIdentities, transformPoint } from "../src/lib/stationRegistration";
import { buildingParts } from "../src/lib/explorer";
import type { CompactCity } from "../src/types/geographic";

const cityBytes = readFileSync("public/plateau/station-city.json");
const city = JSON.parse(cityBytes.toString()) as CompactCity;
const close = (a: readonly number[], b: readonly number[]) => {
  assert.equal(a.length, b.length);
  a.forEach((value, i) => assert.ok(Math.abs(value - b[i]) < 1e-8, `${value} vs ${b[i]}`));
};

test("all eight destination outlines preserve every source part and hole in both presentation frames", () => {
  assert.equal(outlines.buildings.length, 8);
  assert.equal(new Set(outlines.buildings.map(b=>b.featureId)).size, 8);
  assert.equal(createHash("sha256").update(cityBytes).digest("hex"), outlines.sourceCitySha256);
  for (const b of outlines.buildings) {
    const source = city.buildings.find(item=>item.id===b.featureId)!;
    assert.deepEqual(b.parts, source.parts);
    for (const data of [schematicExplorer, geographicExplorer]) {
      const building = data.buildings.find(item=>item.id===b.explorerId)!;
      const parts = buildingParts(building);
      assert.equal(parts.length, source.parts.length);
      parts.forEach((part, p)=> {
        assert.equal(part.length, source.parts[p].length);
        part.forEach((ring, r)=> {
          assert.equal(ring.length, source.parts[p][r].length);
          ring.forEach((point, i)=>close(data === schematicExplorer ? transformPoint(point, stationAlignment) : point, source.parts[p][r][i]));
        });
      });
    }
  }
});

test("reference outlines never move station landings or become circular fit controls", () => {
  for (const field of ["spaces", "connectors", "exits", "facilities"] as const)
    assert.deepEqual(schematicExplorer[field], explorerData[field]);
  assert.equal(alignmentControls.length, 3);
  assert.ok(Math.abs(stationAlignment.rmse - 25.700238) < 1e-6);
  assert.ok(Math.abs(stationAlignment.scale - 1.7885049373745536) < 1e-12);
  assert.equal(explorerData.entranceReferences, undefined);
  assert.ok(explorerData.buildings.every(b=>!b.parts && !b.outlineSource));
});

test("public entrance positions retain WGS84 coordinates, source levels and conservative identity matches", () => {
  assert.equal(entrances.entries.length, 21);
  assert.equal(new Set(entrances.entries.map(e=>e.id)).size, 21);
  for (const e of entrances.entries) {
    const ref = geographicExplorer.entranceReferences!.find(r=>r.id===e.id)!;
    const p = geographicToLocal(e.longitude, e.latitude);
    close(ref.position, [p[0], p[2]]);
    const exit = explorerData.exits.find(x=>x.id===ref.targetId);
    const connector = explorerData.connectors.find(c=>c.id===ref.targetId);
    assert.ok(exit || connector);
    assert.equal(exit?.code ?? connector?.equipmentId, e.group);
    assert.equal(ref.sourceLevel, e.sourceLevel);
    assert.equal(ref.sourceUrl, `https://www.openstreetmap.org/node/${e.nodeId}`);
    assert.ok(Number.isFinite(Date.parse(ref.sourceUpdatedAt)));
  }
  assert.equal(geographicExplorer.entranceReferences!.find(r=>r.ref==="C2")!.sourceLevel, "-2");
  assert.equal(entrances.entries.filter(e=>e.match==="exit-group").length, 7);
  assert.equal(entrances.excluded.length, 5);
  assert.ok(entrances.excluded.every(e=>!entrances.entries.some(r=>r.nodeId===e.nodeId)));
  assert.deepEqual(entrances.missingExitCodes, ["A2", "A8", "A12", "B5", "B6"]);
});

test("city identities are uniquely evidenced without changing source geometry or claiming five new controls", () => {
  const baseline = JSON.stringify(city);
  const labelled = withCityIdentities(city);
  assert.equal(JSON.stringify(city), baseline);
  assert.equal(labelled.buildings.filter(b=>b.explorerId).length, 8);
  assert.equal(crosswalk.matches.length, 5);
  for (const match of crosswalk.matches) {
    assert.ok(match.overlapIoU >= .85 && match.runnerUpIoU < .05);
    assert.ok(!alignmentControls.some(c=>c.id===match.explorerId));
    const feature = labelled.buildings.find(b=>b.id===match.featureId)!;
    assert.equal(feature.explorerId, match.explorerId);
    assert.deepEqual(feature.parts, city.buildings.find(b=>b.id===match.featureId)!.parts);
  }
  assert.equal(entrances.license, "ODbL-1.0");
  assert.equal(crosswalk.license, "ODbL-1.0");
  assert.equal(entrances.sourceSha256, crosswalk.sourceSha256);
});

test("shared reference data stays small and preserves the existing compact city asset", () => {
  assert.equal(cityBytes.length, 645153);
  assert.equal(createHash("sha256").update(cityBytes).digest("hex"), "3394a1eea2d253a53782b5be952fbf30e50231e2a4b70847cbc3fb27b7dc83b9");
  assert.ok(statSync("src/data/station-building-outlines.json").size < 5000);
  assert.ok(statSync("public/evidence/entrance-references.json").size < 12000);
  assert.ok(statSync("public/evidence/building-crosswalk.json").size < 5000);
});
