import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { explorerData } from "../src/data/explorer";
import review from "../public/evidence/public-source-review.json";

test("the public-source review covers this exact model and resolves every cited source", () => {
  const features = [...explorerData.spaces, ...explorerData.exits, ...explorerData.connectors, ...explorerData.buildings, ...(explorerData.facilities ?? [])];
  assert.deepEqual(review.features.map((item) => item.id).sort(), features.map((item) => item.id).sort());
  assert.equal(new Set(review.features.map((item) => item.id)).size, features.length);
  assert.equal(
    createHash("sha256").update(JSON.stringify(explorerData)).digest("hex"),
    review.modelSha256,
    "Model changed: review affected evidence entries and update the evidence fingerprint; do not silently reuse an old audit.",
  );
  const sources = new Set(review.sources.map((item) => item.id));
  assert.equal(sources.size, review.sources.length);
  for (const item of [...review.features, ...review.findings, ...review.equipment, ...review.restrictions]) {
    assert.ok(item.sourceIds.length, `Missing evidence for ${item.id}`);
    for (const id of item.sourceIds) assert.ok(sources.has(id), `${item.id} cites unknown source ${id}`);
  }
  for (const feature of features) if ("evidence" in feature && feature.evidence) assert.ok(sources.has(feature.evidence.sourceId), feature.id);
  const featureIds=new Set(features.map(f=>f.id));
  for(const finding of review.findings) for(const id of finding.featureIds) assert.ok(featureIds.has(id),`Stale finding: ${id}`);
  for(const asset of review.equipment) if(asset.modelFeatureId) assert.ok(featureIds.has(asset.modelFeatureId),`Stale equipment: ${asset.id}`);
  assert.equal(review.coverage.facilities, explorerData.facilities?.length);
  for (const source of review.sources) assert.equal(new URL(source.url).protocol, "https:");
  for (const kind of ["space", "connector", "exit", "building"] as const)
    assert.equal(review.coverage[`${kind}s`], review.features.filter((item) => item.kind === kind).length);
  assert.deepEqual(review.coverage.matchedExitCodes.slice().sort(), explorerData.exits.map((item) => item.code).sort());
});
