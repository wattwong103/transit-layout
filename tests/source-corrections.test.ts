import test from "node:test";
import assert from "node:assert/strict";
import { explorerData as d } from "../src/data/explorer";
import { connectorLevels, getVisibleFeatures } from "../src/lib/explorer";

test("operator floor corrections preserve the difference between exit codes and floors",()=>{
  for(const [code,floor] of [["A12","B2"],["B1","B3"],["B5","B3"],["B7","B1"]])
    assert.equal(d.exits.find(e=>e.code===code)?.levelId,floor,code);
  assert.equal(d.spaces.find(s=>s.id==="hikarie-gates-b3")?.levelId,"B3");
  assert.equal(d.connectors.find(c=>c.id==="miyamasuzaka-hikarie-slope")?.kind,"slope");
  for(const [id,floor] of [["jr-central","3F"],["jr-new-south","3F"],["jr-south","1F"],["jr-hachiko","1F"],["keio-central","2F"],["keio-west","1F"],["keio-avenue","4F"]])
    assert.equal(d.facilities?.find(f=>f.id===`gate-${id}`)?.levelId,floor,id);
});

test("lift landings are explicit: shafts do not imply stops at intermediate floors",()=>{
  const visible=(level:Parameters<typeof getVisibleFeatures>[2],id:string)=>getVisibleFeatures(d,"station",level).connectors.some(c=>c.id===id);
  assert.equal(visible("B1","tokyu-lift-21"),false);
  assert.equal(visible("B2","tokyu-lift-21"),true);
  for(const id of ["C","D"]) {
    assert.equal(visible("B4",`tokyu-lift-${id}`),true);
    assert.equal(visible("B3",`tokyu-lift-${id}`),false);
  }
  for(const id of ["E","F"]) assert.equal(visible("B3",`tokyu-lift-${id}`),true);
  for(const id of ["A","F"]) assert.deepEqual(connectorLevels(d.connectors.find(c=>c.id===`jr-lift-${id}`)!),["1F","2F","3F"]);
  assert.equal(d.connectors.filter(c=>c.id.startsWith("jr-lift-")).length,6);
  assert.equal(visible("3F","keio-central-lift"),false);
  assert.equal(visible("4F","keio-central-lift"),true);
  assert.equal(d.connectors.find(c=>c.id==="tokyu-lift-22-upper")?.stopsComplete,false);
});

test("dated closures, overnight hours and provisional source matches cannot become implicit open routes",()=>{
  for(const id of ["C","D"]) assert.equal(d.connectors.find(c=>c.id===`keio-stair-${id}`)?.access?.status,"closed-in-source");
  assert.equal(d.facilities?.find(f=>f.id==="keio-west-works")?.access.status,"planned");
  assert.equal(d.connectors.some(c=>c.id==="keio-west-new-lift"),false);
  assert.equal(d.facilities?.find(f=>f.id==="gate-keio-avenue")?.access.hours,"07:30–22:00");
  assert.match(d.exits.find(e=>e.code==="A0")!.access!.hours!,/next day/);
  assert.equal(d.exits.find(e=>e.code==="C3")?.evidence?.certainty,"inferred");
  for(const c of d.connectors) {
    assert.ok(c.evidence && c.access, c.id);
    if(c.evidence.certainty==="inferred") assert.equal(c.access.status,"unconfirmed",c.id);
    if(c.kind==="lift") assert.ok(c.stops && typeof c.stopsComplete === "boolean",c.id);
  }
});
