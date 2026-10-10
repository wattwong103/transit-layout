import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { explorerData } from "../src/data/explorer";
import outlines from "../src/data/station-building-outlines.json";
import entrances from "../public/evidence/entrance-references.json";
import crosswalk from "../public/evidence/building-crosswalk.json";
import { schematicExplorer, geographicExplorer, geographicToLocal, stationAlignment, alignmentControls, withCityIdentities, transformPoint } from "../src/lib/stationRegistration";
import { buildingParts, pointInPolygon } from "../src/lib/explorer";
import keio from "../public/evidence/keio-alignment.json";
import ginzaJr from "../public/evidence/ginza-jr-alignment.json";
import { alignKeio } from "../src/lib/keioAlignment";
import { inverseTransformPoint } from "../src/lib/stationRegistration";
import { measureFootprint,platformDetail,detailPlatforms } from "../src/lib/geometryDimensions";
import sizes from "../public/evidence/platform-size-check.json";
import { stationHeights, stationLevelHeight } from "../src/lib/stationHeights";
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

test("local platform corrections never become global fit controls or move unrelated station geometry", () => {
  for (const field of ["spaces", "connectors", "exits", "facilities"] as const) {
    for (const item of explorerData[field] ?? []) {
      if (item.id.includes("keio") || item.id === "markcity-avenue" || item.id.includes("ginza") || item.id.includes("jr") || item.id.startsWith("g-")) continue;
      assert.deepEqual(schematicExplorer[field]?.find(candidate=>candidate.id===item.id), item);
    }
  }
  assert.equal(alignmentControls.length, 3);
  assert.ok(Math.abs(stationAlignment.rmse - 25.700238) < 1e-6);
  assert.ok(Math.abs(stationAlignment.scale - 1.7885049373745536) < 1e-12);
  assert.equal(explorerData.entranceReferences, undefined);
  assert.ok(explorerData.buildings.every(b=>!b.parts && !b.outlineSource));
});

test("Ginza and JR preserve every public outer boundary and interior opening in both views",()=>{
  for(const record of ginzaJr.platforms) {
    for(const data of [schematicExplorer,geographicExplorer]) {
      const space=data.spaces.find(s=>s.id===record.spaceId)!;
      assert.equal(space.levelId,record.floor);
      const actual=[space.polygon,...space.openings!];
      assert.equal(actual.length,record.rings.length);
      record.rings.forEach((ring,r)=>{
        assert.equal(actual[r].length,ring.coordinates.length);
        ring.coordinates.forEach(([lon,lat],i)=>{
          const p=geographicToLocal(lon,lat);
          close(data===schematicExplorer?transformPoint(actual[r][i],stationAlignment):actual[r][i],[p[0],p[2]]);
        });
      });
      assert.match(space.positionNote!,/elevations remain unverified/);
    }
  }
  assert.equal(ginzaJr.license,"ODbL-1.0");
  assert.ok(statSync("public/evidence/ginza-jr-alignment.json").size<6000);
});

test("JR and Ginza keep operator floor assignments and connect their corrected public approaches",()=>{
  const floors={"gate-jr-central":"3F","gate-jr-new-south":"3F","gate-jr-south":"1F","gate-jr-hachiko":"1F",
    "gate-ginza-scramble":"3F","gate-ginza-meiji":"2F"};
  for(const data of [schematicExplorer,geographicExplorer]) {
    for(const [id,floor] of Object.entries(floors)) {
      const gate=data.facilities!.find(f=>f.id===id)!;
      assert.equal(gate.levelId,floor);
      assert.match(gate.positionNote!,/inferred/);
    }
    for(const connector of data.connectors.filter(c=>c.id.startsWith("jr-"))) {
      for(const stop of connector.stops??[connector.from,connector.to]) {
        assert.ok(data.spaces.some(s=>(s.id.startsWith("jr-")||s.id==="ground-jr")&&s.levelId===stop.levelId&&pointInPolygon(stop.position,s.polygon)),connector.id);
      }
    }
    const approach=data.spaces.find(s=>s.id==="keio-transfer")!;
    const stairs=data.connectors.find(c=>c.id==="keio-jr-central-stairs")!;
    assert.ok(pointInPolygon(stairs.from.position,approach.polygon));
    assert.ok(pointInPolygon(stairs.to.position,data.spaces.find(s=>s.id==="jr-central-public")!.polygon));
    assert.equal(approach.evidence!.certainty,"inferred");
    assert.equal(data.spaces.find(s=>s.id==="ginza-jr-bridge")!.evidence!.certainty,"inferred");
  }
  const correctedKeio=alignKeio(explorerData,geographicToLocal,inverseTransformPoint);
  for(const space of correctedKeio.spaces.filter(s=>(s.id.startsWith("keio-")&&s.id!=="keio-transfer")||s.id==="markcity-avenue")) {
    assert.deepEqual(schematicExplorer.spaces.find(s=>s.id===space.id),space,"JR correction must preserve Keio");
  }
  const west=geographicExplorer.spaces.find(s=>s.id==="jr-west-platform")!;
  const east=geographicExplorer.spaces.find(s=>s.id==="jr-east-platform")!;
  assert.ok(Math.max(...east.polygon.map(p=>p[1]))>Math.max(...west.polygon.map(p=>p[1]))+50,"Saikyo retains its southern extension");
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

test("both Keio platforms preserve public coordinates exactly and all gate areas stay inside Mark City in plan",()=>{
  const mark=outlines.buildings.find(b=>b.explorerId==="mark-city")!.parts[0][0] as [number,number][];
  for (const record of keio.platforms) {
    const space=geographicExplorer.spaces.find(s=>s.id===record.spaceId)!;
    assert.equal(space.levelId,"2F");
    assert.equal(space.polygon.length,record.coordinates.length);
    record.coordinates.forEach(([lon,lat],i)=>{
      const p=geographicToLocal(lon,lat);
      close(space.polygon[i],[p[0],p[2]]);
    });
  }
  for (const id of ["keio-platform","keio-arrival-platform","keio-central-gate","keio-west-gate","keio-avenue-gate","keio-central-surface","markcity-avenue"]) {
    const space=geographicExplorer.spaces.find(s=>s.id===id)!;
    for (let i=0;i<space.polygon.length;i++) {
      const p=space.polygon[i],q=space.polygon[(i+1)%space.polygon.length];
      // Sample entire edges as well as vertices against the concave envelope.
      for(let j=0;j<=20;j++) assert.ok(pointInPolygon([p[0]+(q[0]-p[0])*j/20,p[1]+(q[1]-p[1])*j/20],mark),id);
    }
  }
  assert.equal(keio.license,"ODbL-1.0");
  assert.ok(statSync("public/evidence/keio-alignment.json").size<5000);
});

test("Keio corrections are shared by both views and retain confirmed floors, inferred positions and source closures",()=>{
  for (const source of schematicExplorer.spaces.filter(s=>s.id.startsWith("keio-") || s.id==="markcity-avenue")) {
    const target=geographicExplorer.spaces.find(s=>s.id===source.id)!;
    source.polygon.forEach((p,i)=>close(transformPoint(p,stationAlignment),target.polygon[i]));
    assert.ok(source.positionNote);
  }
  for (const data of [schematicExplorer,geographicExplorer]) {
    for (const [id,floor] of [["west","1F"],["central","2F"],["avenue","4F"]]) {
      const gate=data.facilities!.find(f=>f.id===`gate-keio-${id}`)!;
      assert.equal(gate.levelId,floor);
      assert.match(gate.positionNote!,/inferred/);
    }
    for(const letter of ["C","D"]) assert.equal(data.connectors.find(c=>c.id===`keio-stair-${letter}`)!.access!.status,"closed-in-source");
    assert.deepEqual(data.connectors.find(c=>c.id==="keio-central-lift")!.stops!.map(s=>s.levelId),["1F","2F","4F"]);
  }
});

test("realistic heights agree in both coordinate frames, ignore explosion spacing and remain explicitly unverified",()=>{
  for(const [id,profile] of Object.entries(stationHeights)) {
    assert.equal(profile.status,"unverified");
    for(const spacing of [4,18,34]) {
      const diagram=stationLevelHeight(id,"realistic",spacing,stationAlignment.scale);
      const map=stationLevelHeight(id,"realistic",spacing);
      assert.ok(Math.abs(diagram*stationAlignment.scale-map)<1e-10);
      assert.equal(map,profile.meters);
      assert.equal(stationLevelHeight(id,"exploded",spacing),profile.order*spacing);
    }
  }
  assert.equal(stationLevelHeight("2F","realistic",18),5);
  assert.equal(stationLevelHeight("4F","realistic",18),15);
  assert.notEqual(stationLevelHeight("2F","exploded",18),5);
});

test("footprint dimensions use a rotated enclosure and preserve holes and independent centre widths",()=>{
  const rotate=([x,y]:readonly number[])=>[x*Math.cos(.6)-y*Math.sin(.6)+40,x*Math.sin(.6)+y*Math.cos(.6)-80] as const;
  const outer=[[0,0],[100,0],[100,12],[0,12]].map(rotate),hole=[[10,2],[20,2],[20,5],[10,5]].map(rotate);
  const result=measureFootprint(outer,[hole]);
  assert.ok(Math.abs(result.length-100)<1e-8);
  assert.ok(Math.abs(result.width-12)<1e-8);
  assert.ok(Math.abs(result.centreWidth-12)<1e-8);
  assert.ok(Math.abs(result.area-1170)<1e-8);
  outer.forEach(p=>close(result.restore(result.project(p)),p));
  assert.throws(()=>measureFootprint([[0,0],[1,1],[2,2]]),/Degenerate/);
});

test("all five displayed platform sizes match independent pyproj and Shapely checks without double scaling",()=>{
  for(const source of sizes.sources) assert.equal(createHash("sha256").update(readFileSync(source.path,"utf8").replace(/\r\n/g,"\n")).digest("hex"),source.sha256);
  assert.equal(sizes.platforms.length,5);
  for(const reference of sizes.platforms) {
    const geo=geographicExplorer.spaces.find(s=>s.id===reference.spaceId)!;
    const diagram=schematicExplorer.spaces.find(s=>s.id===reference.spaceId)!;
    const holes=reference.spaceId.startsWith("jr-")?geo.openings:[];
    const measured=measureFootprint(geo.polygon,holes);
    for(const [actual,expected] of [[measured.length,reference.lengthM],[measured.width,reference.widthSpanM],
      [measured.centreWidth,reference.centreSectionM],[measured.area,reference.areaM2]]) assert.ok(Math.abs(actual-expected)<.00001,reference.spaceId);
    assert.ok(Math.abs(measureFootprint(diagram.polygon).length*stationAlignment.scale-measured.length)<1e-8);
    assert.ok(reference.areaDifferencePpm<1&&reference.perimeterDifferencePpm<1);
  }
});

test("the detail view only filters the canonical geometry and never rescales or loads the city",()=>{
  const before=JSON.stringify(schematicExplorer);
  for(const platform of detailPlatforms) for(const access of [false,true]) {
    const detail=platformDetail(schematicExplorer,platform.id,access);
    assert.equal(detail.buildings.length,0);
    assert.equal(detail.exits.length,0);
    assert.equal(detail.entranceReferences!.length,0);
    assert.ok(detail.spaces.some(s=>s.id===platform.id));
    if(!access) {assert.equal(detail.spaces.length,1);assert.equal(detail.connectors.length,0);}
    detail.spaces.forEach(s=>assert.equal(s,schematicExplorer.spaces.find(original=>original.id===s.id)));
    detail.connectors.forEach(c=>assert.equal(c,schematicExplorer.connectors.find(original=>original.id===c.id)));
  }
  assert.equal(JSON.stringify(schematicExplorer),before);
});
