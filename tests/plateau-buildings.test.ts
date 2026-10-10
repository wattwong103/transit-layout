import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";
import { plateauBuildingMatrix, plateauBuildingGeometry } from "../src/lib/plateauBuildingGeometry";
import { stationAlignment, transformPoint } from "../src/lib/stationRegistration";
import summary from "../src/data/plateau-buildings-summary.json";
import report from "../public/plateau/station-buildings.json";
import outlines from "../src/data/station-building-outlines.json";

const bytes = readFileSync("public/plateau/station-buildings.glb");
const jsonSize = bytes.readUInt32LE(12);
const gltf = JSON.parse(bytes.subarray(20,20+jsonSize).toString());
const binaryStart = 28+jsonSize;
function values(index:number): number[] {
  const a=gltf.accessors[index], v=gltf.bufferViews[a.bufferView];
  const step=a.componentType===5123 ? 2 : 4, width=a.type==="VEC3" ? 3 : 1;
  const start=binaryStart+(v.byteOffset??0)+(a.byteOffset??0);
  return Array.from({length:a.count*width},(_,i)=>a.componentType===5126 ? bytes.readFloatLE(start+i*step) : step===2 ? bytes.readUInt16LE(start+i*step) : bytes.readUInt32LE(start+i*step));
}

test("optional GLB contains exactly eight attributed source meshes and all published source triangles",()=>{
  assert.equal(bytes.toString("ascii",0,4),"glTF");
  assert.equal(bytes.readUInt32LE(4),2);
  assert.equal(bytes.readUInt32LE(8),bytes.length);
  assert.equal(bytes.length,summary.bytes);
  assert.ok(bytes.length<500000);
  assert.equal(createHash("sha256").update(bytes).digest("hex"),summary.sha256);
  assert.equal(gltf.nodes.length,8);
  assert.equal(gltf.meshes.length,8);
  assert.equal(gltf.images,undefined);
  assert.equal(gltf.textures,undefined);
  assert.match(gltf.asset.copyright,/MLIT Project PLATEAU.*2025/);
  let triangles=0;
  for(const node of gltf.nodes) {
    const feature=report.features.find(f=>f.explorerId===node.extras.explorerId)!;
    assert.ok(feature);
    assert.equal(node.extras.featureId,feature.featureId);
    assert.equal(outlines.buildings.find(b=>b.explorerId===feature.explorerId)!.featureId,feature.featureId);
    assert.equal(node.matrix,undefined);
    const primitive=gltf.meshes[node.mesh].primitives[0];
    const positions=values(primitive.attributes.POSITION), indices=values(primitive.indices);
    assert.ok(positions.every(Number.isFinite));
    assert.ok(indices.every(i=>i>=0 && i<positions.length/3));
    assert.equal(indices.length,feature.triangles*3);
    triangles+=indices.length/3;
    for(let axis=0;axis<3;axis++) {
      const v=positions.filter((_,i)=>i%3===axis);
      assert.ok(Math.abs(Math.min(...v)-feature.bounds.min[axis])<.001);
      assert.ok(Math.abs(Math.max(...v)-feature.bounds.max[axis])<.001);
    }
  }
  assert.equal(triangles,17237);
  assert.equal(triangles,summary.triangles);
});

test("source vertices occupy identical horizontal coordinates and heights in diagram and map frames",()=>{
  const diagram=plateauBuildingMatrix("diagram"), map=plateauBuildingMatrix("map");
  assert.ok(diagram.determinant()>0);
  for(const mesh of gltf.meshes) {
    const positions=values(mesh.primitives[0].attributes.POSITION);
    for(let i=0;i<positions.length;i+=3) {
      const source=new Vector3(...positions.slice(i,i+3) as [number,number,number]);
      const d=source.clone().applyMatrix4(diagram), m=source.clone().applyMatrix4(map);
      const restored=transformPoint([d.x,d.z],stationAlignment);
      assert.ok(Math.abs(restored[0]-m.x)<1e-8 && Math.abs(restored[1]-m.z)<1e-8);
      assert.ok(Math.abs(d.y*stationAlignment.scale-m.y)<1e-8);
      assert.ok(Math.abs(m.y-(source.y-summary.displayGroundEllipsoidM))<1e-8);
    }
  }
  const sizes=new Vector3().setFromMatrixScale(diagram);
  assert.ok(Math.abs(sizes.x-sizes.y)<1e-12 && Math.abs(sizes.y-sizes.z)<1e-12);
});

test("render transformations return disposable copies without altering cached geometry",()=>{
  const source=new BufferGeometry().setAttribute("position",new Float32BufferAttribute([0,55,0,10,75,0,0,55,10],3));
  const before=Array.from(source.getAttribute("position").array);
  const d=plateauBuildingGeometry(source,"diagram"), m=plateauBuildingGeometry(source,"map");
  assert.deepEqual(Array.from(source.getAttribute("position").array),before);
  assert.notEqual(d,source);
  assert.notEqual(d,m);
  assert.ok(Math.abs(m.boundingBox!.max.y-20)<1e-8);
  assert.ok(Math.abs(d.boundingBox!.max.y-20/stationAlignment.scale)<1e-6);
  d.dispose();m.dispose();source.dispose();
});
