import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { ExplorerDataset, Point2 } from "@/types/explorer";
import { getSpaceOpenings, connectorLevels, connectorStops, connectorName, floorSurfaceOffset } from "@/lib/explorer";
import { extrudePlan } from "@/lib/planGeometry";

export type LabelRecord = {
  id: string | null;
  text: string;
  position: THREE.Vector3;
  kind: "floor" | "exit" | "platform" | "space" | "building" | "connector";
  color: string;
  levels: string[];
  element?: HTMLButtonElement;
  leader?: HTMLDivElement;
};
export type Model = {
  group: THREE.Group;
  labels: LabelRecord[];
  details: THREE.Group[];
  objects: number;
};
export function disposeModel(model: Model) {
  model.group.traverse((object) => {
    const renderable = object as THREE.Mesh;
    renderable.geometry?.dispose();
    const materials = Array.isArray(renderable.material)
      ? renderable.material
      : [renderable.material];
    materials.forEach((material) => material?.dispose());
  });
  model.group.removeFromParent();
}

/** Batch opaque detail and outlines without mixing selectable feature IDs. */
function batchLayer(layer: THREE.Group) {
  layer.updateWorldMatrix(true, true);
  const inverse = layer.matrixWorld.clone().invert();
  const buckets = new Map<
    string,
    {
      geometries: THREE.BufferGeometry[];
      material: THREE.Material;
      line: boolean;
      cast: boolean;
      receive: boolean;
    }
  >();
  const originals: (THREE.Mesh | THREE.LineSegments)[] = [];
  const visit = (object: THREE.Object3D) => {
    if (object !== layer && object.type === "Group") return;
    if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
      const mat = object.material;
      if (!Array.isArray(mat)) {
        const line = object instanceof THREE.LineSegments;
        const colored = mat as THREE.MeshStandardMaterial;
        const key = `${line ? "edge" : "mesh"}:${colored.color?.getHexString()}:${mat.opacity}:${mat.side}`;
        let geometry = object.geometry.clone();
        if (geometry.index) {
          const indexed = geometry;
          geometry = geometry.toNonIndexed();
          indexed.dispose();
        }
        geometry.applyMatrix4(inverse.clone().multiply(object.matrixWorld));
        if (!line && !geometry.attributes.uv)
          geometry.setAttribute(
            "uv",
            new THREE.Float32BufferAttribute(
              new Float32Array(geometry.attributes.position.count * 2),
              2,
            ),
          );
        let bucket = buckets.get(key);
        if (!bucket) {
          const material = mat.clone();
          material.userData = {
            ...mat.userData,
            baseColor: mat.userData.baseColor?.clone(),
          };
          bucket = {
            geometries: [],
            material,
            line,
            cast: false,
            receive: false,
          };
          buckets.set(key, bucket);
        }
        bucket.geometries.push(geometry);
        bucket.cast ||= object.castShadow;
        bucket.receive ||= object.receiveShadow;
        originals.push(object);
      }
    }
    [...object.children].forEach(visit);
  };
  visit(layer);
  for (const original of originals) {
    original.removeFromParent();
    original.geometry.dispose();
    if (!Array.isArray(original.material)) original.material.dispose();
  }
  for (const bucket of Array.from(buckets.values())) {
    const geometry = mergeGeometries(bucket.geometries);
    bucket.geometries.forEach((item) => item.dispose());
    if (!geometry) {
      bucket.material.dispose();
      continue;
    }
    const object = bucket.line
      ? new THREE.LineSegments(geometry, bucket.material)
      : new THREE.Mesh(geometry, bucket.material);
    if (!bucket.line) object.userData.selectId = layer.userData.id;
    object.castShadow = bucket.cast;
    object.receiveShadow = bucket.receive;
    layer.add(object);
  }
}

/** Builds once per data/spacing change. Selection only mutates visibility/materials. */
export function buildModel(data: ExplorerDataset, separation: number): Model {
  const group = new THREE.Group();
  const labels: LabelRecord[] = [];
  const details: THREE.Group[] = [];
  let parent = group;
  const y = (id: string) =>
    (data.levels.find((level) => level.id === id)?.order ?? 0) * separation;
  const at = (p: Point2, height: number) =>
    new THREE.Vector3(p[0], height, p[1]);
  const entity = (id: string, category: string, levels: string[]) => {
    parent = new THREE.Group();
    parent.userData = { id, category, levels };
    group.add(parent);
    return parent;
  };
  const material = (color: string, opacity = 1) => {
    const result = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.84,
      metalness: 0.03,
      transparent: opacity < 1,
      opacity,
      depthWrite: opacity === 1,
    });
    result.userData.baseColor = new THREE.Color(color);
    result.userData.baseOpacity = opacity;
    return result;
  };
  const edges = (mesh: THREE.Mesh, color = "#736f65", opacity = 0.68) => {
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
    });
    mat.userData.baseColor = new THREE.Color(color);
    mat.userData.baseOpacity = opacity;
    const outline = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry, 32),
      mat,
    );
    mesh.add(outline);
  };
  const mesh = (
    geometry: THREE.BufferGeometry,
    color: string,
    opacity = 1,
    outline = true,
  ) => {
    const result = new THREE.Mesh(geometry, material(color, opacity));
    result.userData.selectId = parent.userData.id;
    result.castShadow = opacity === 1;
    result.receiveShadow = opacity === 1;
    if (outline) edges(result);
    parent.add(result);
    return result;
  };
  const slab = (
    polygon: Point2[],
    height: number,
    depth: number,
    color: string,
    holes: Point2[][] = [],
    opacity = 1,
  ) => {
    const geometry = extrudePlan([polygon, ...holes], depth, opacity === 1);
    const result = mesh(geometry, color, opacity);
    result.position.y = height;
    return result;
  };
  const box = (
    position: THREE.Vector3,
    width: number,
    height: number,
    depth: number,
    color: string,
    angle = 0,
    opacity = 1,
    outline = true,
  ) => {
    const result = mesh(
      new THREE.BoxGeometry(width, height, depth),
      color,
      opacity,
      outline,
    );
    result.position.copy(position);
    result.rotation.y = angle;
    result.castShadow = false;
    return result;
  };
  const beam = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    width: number,
    depth: number,
    color: string,
    opacity = 1,
    outline = false,
  ) => {
    const delta = b.clone().sub(a);
    const result = mesh(
      new THREE.BoxGeometry(width, Math.max(delta.length(), 0.1), depth),
      color,
      opacity,
      outline,
    );
    result.position.copy(a).add(b).multiplyScalar(0.5);
    result.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      delta.normalize(),
    );
    result.castShadow = false;
    return result;
  };
  for (const space of data.spaces) {
    const spaceGroup = entity(space.id, "station", [space.levelId]);
    const height = y(space.levelId);
    slab(
      space.polygon,
      height + floorSurfaceOffset(data,space),
      space.kind === "platform" ? 2.2 : 1.35,
      space.color,
      getSpaceOpenings(data, space),
    );
    for (const track of space.tracks ?? [])
      for (let i = 1; i < track.points.length; i++) {
        beam(
          at(track.points[i - 1], height + 2.7),
          at(track.points[i], height + 2.7),
          1,
          0.95,
          track.color,
        );
      }
    const trackColor = space.tracks?.[0]?.color;
    labels.push({
      id: space.id,
      text: space.name,
      kind: space.kind === "platform" ? "platform" : "space",
      position: at(space.labelPosition, height + 4.5),
      levels: [space.levelId],
      color: trackColor
        ? `#${new THREE.Color(trackColor).lerp(new THREE.Color("#26313d"), 0.2).getHexString()}`
        : "#625e55",
    });
    if (space.kind === "platform") {
      // A restrained tactile strip just inside each long platform edge.
      const center = space.polygon
        .reduce(
          (p, v) => p.add(new THREE.Vector2(v[0], v[1])),
          new THREE.Vector2(),
        )
        .divideScalar(space.polygon.length);
      for (let i = 0; i < space.polygon.length; i++) {
        const a = new THREE.Vector2(...space.polygon[i]);
        const b = new THREE.Vector2(
          ...space.polygon[(i + 1) % space.polygon.length],
        );
        if (a.distanceTo(b) < 55) continue;
        const toward = center
          .clone()
          .sub(a.clone().add(b).multiplyScalar(0.5))
          .normalize()
          .multiplyScalar(1.25);
        a.add(toward);
        b.add(toward);
        beam(
          new THREE.Vector3(a.x, height + 2.5, a.y),
          new THREE.Vector3(b.x, height + 2.5, b.y),
          0.6,
          0.45,
          "#d7bd68",
        );
      }
    }
    if (space.kind === "platform" || space.kind === "concourse") {
      const detail = new THREE.Group();
      detail.name = "zoom-details";
      spaceGroup.add(detail);
      const previous = parent;
      parent = detail;
      parent.userData.id = space.id;
      for (const offset of [-5, 5]) {
        box(
          at(
            [space.labelPosition[0] + offset, space.labelPosition[1]],
            height + 5,
          ),
          0.7,
          7,
          0.7,
          "#ccc9c0",
          0,
          1,
          false,
        );
      }
      parent = previous;
      detail.visible = false;
      details.push(detail);
    }
  }
  for (const connector of data.connectors) {
    entity(connector.id, "station", connectorLevels(connector));
    const a = at(connector.from.position, y(connector.from.levelId) + 2);
    const b = at(connector.to.position, y(connector.to.levelId) + 2);
    const width = connector.width;
    const closed = connector.access?.status === "closed-in-source";
    labels.push({
      id: connector.id,
      text: `${connectorName(connector)}${closed ? " · closed in source" : ""}`,
      kind: "connector",
      position: a.clone().lerp(b, 0.5),
      levels: connectorLevels(connector),
      color: "#4c6470",
    });
    if (connector.kind === "lift") {
      beam(a, b, width, width, "#76d6e8", 0.55, true);
      for (const stop of connectorStops(connector)) {
        const endpoint = at(stop.position, y(stop.levelId) + 2);
        box(
          endpoint.clone().add(new THREE.Vector3(0, 0.45, 0)),
          width + 1,
          0.9,
          width + 1,
          "#b5e8ec",
        );
        // Paired door leaves on the front of both recorded landings.
        for (const side of [-1, 1])
          box(
            endpoint
              .clone()
              .add(
                new THREE.Vector3(side * width * 0.19, 2.3, width / 2 + 0.1),
              ),
            width * 0.36,
            3.8,
            0.18,
            "#b8d5d8",
            0,
            1,
            false,
          );
        beam(
          endpoint.clone().add(new THREE.Vector3(0, 0.5, width / 2 + 0.22)),
          endpoint.clone().add(new THREE.Vector3(0, 4.2, width / 2 + 0.22)),
          0.15,
          0.15,
          "#518e9b",
        );
      }
    } else if (connector.kind === "slope") {
      const ramp = mesh(new THREE.BoxGeometry(width, .6, a.distanceTo(b)), "#e4dfbd");
      ramp.position.copy(a).lerp(b, .5);
      ramp.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), b.clone().sub(a).normalize());
    } else {
      const horizontal = new THREE.Vector3(b.x - a.x, 0, b.z - a.z);
      const distance = horizontal.length();
      const count = Math.max(7, Math.ceil(Math.abs(b.y - a.y) / 1.6));
      const angle = Math.atan2(horizontal.x, horizontal.z);
      const stepDepth = Math.max(distance / count + 0.2, 0.6);
      // One indexed tread mesh and one edge pass per flight, not per step.
      const treads: THREE.BufferGeometry[] = [];
      for (let i = 0; i < count; i++) {
        const center = a.clone().lerp(b, (i + 0.5) / count);
        const tread = new THREE.BoxGeometry(
          width,
          Math.abs(b.y - a.y) / count + 0.25,
          stepDepth,
        );
        tread.rotateY(angle);
        tread.translate(center.x, center.y, center.z);
        treads.push(tread);
      }
      const merged = mergeGeometries(treads);
      treads.forEach((tread) => tread.dispose());
      if (merged)
        mesh(merged, closed ? "#b8a19a" : connector.kind === "escalator" ? "#c7c7b1" : "#e2ddcd");
      if (closed) for (const endpoint of [a,b]) {
        beam(endpoint.clone().add(new THREE.Vector3(-width/2, 1, -.1)), endpoint.clone().add(new THREE.Vector3(width/2, 4, .1)), .6, .6, "#bc4b35");
        beam(endpoint.clone().add(new THREE.Vector3(width/2, 1, -.1)), endpoint.clone().add(new THREE.Vector3(-width/2, 4, .1)), .6, .6, "#bc4b35");
      }
      for (const endpoint of [a, b])
        box(
          endpoint.clone(),
          width + 0.3,
          0.7,
          Math.min(width, 3),
          "#e4dfd0",
          angle,
        );
      const normal = new THREE.Vector3(horizontal.z, 0, -horizontal.x)
        .normalize()
        .multiplyScalar(width / 2);
      for (const side of [-1, 1]) {
        const lateral = normal.clone().multiplyScalar(side);
        const offset = lateral.clone().add(new THREE.Vector3(0, 2, 0));
        beam(
          a.clone().add(offset),
          b.clone().add(offset),
          0.42,
          0.42,
          "#657276",
        );
        if (connector.kind === "escalator") {
          // Continuous glass side panel in the actual sloping plane.
          const a0 = a.clone().add(lateral),
            b0 = b.clone().add(lateral);
          const vertices = [
            a0,
            b0,
            b0.clone().add(new THREE.Vector3(0, 2, 0)),
            a0.clone().add(new THREE.Vector3(0, 2, 0)),
          ];
          const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
          geometry.setIndex([0, 1, 2, 0, 2, 3]);
          geometry.computeVertexNormals();
          const panel = mesh(geometry, "#aac5c4", 0.48, false);
          (panel.material as THREE.MeshStandardMaterial).side =
            THREE.DoubleSide;
        }
      }
    }
  }
  for (const f of data.facilities ?? []) {
    entity(f.id, "station", [f.levelId]);
    const height = y(f.levelId) + 3;
    const color = f.kind === "works" ? "#bc4b35" : f.kind === "gate" ? "#51857b" : "#f8f6ed";
    if (f.kind === "gate") for (const offset of [-2,0,2])
      box(at([f.position[0]+offset, f.position[1]], height), .8, 2.5, 2.5, color);
    else box(at(f.position,height), 2.5, 2.8, 1.2, color);
    labels.push({ id:f.id, text:f.name, kind:"connector", position:at(f.position,height+4), levels:[f.levelId], color:"#355859" });
  }
  for (const building of data.buildings) {
    entity(building.id, "building", []);
    slab(building.polygon, 0, building.displayHeight, building.color, [], 0.12);
    labels.push({
      id: building.id,
      text: building.shortName,
      kind: "building",
      position: at(building.labelPosition, building.displayHeight + 4),
      levels: [],
      color: "#6c7776",
    });
  }
  for (const exit of data.exits) {
    entity(exit.id, "exit", [exit.levelId]);
    box(at(exit.position, y(exit.levelId) + 3), 4, 2.3, 4, "#eace63");
    labels.push({
      id: exit.id,
      text: exit.code,
      kind: "exit",
      position: at(exit.position, y(exit.levelId) + 7),
      levels: [exit.levelId],
      color: "#594710",
    });
    for (const destination of exit.destinations) {
      const building = data.buildings.find(
        (candidate) => candidate.id === destination.buildingId,
      );
      if (!building) continue;
      const link = new THREE.Group();
      link.userData = {
        category: "link",
        exitId: exit.id,
        buildingId: building.id,
        levels: [exit.levelId],
      };
      const start = at(exit.position, y(exit.levelId) + 4);
      const points = [
        start,
        new THREE.Vector3(start.x, 1.5, start.z),
        at(building.labelPosition, 1.5),
      ];
      const mat =
        destination.relationship === "toward"
          ? new THREE.LineDashedMaterial({
              color: "#098d99",
              dashSize: 4,
              gapSize: 2,
              depthTest: false,
              transparent: true,
            })
          : new THREE.LineBasicMaterial({
              color: "#098d99",
              depthTest: false,
              transparent: true,
            });
      const path = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        mat,
      );
      path.computeLineDistances();
      path.renderOrder = 10;
      link.add(path);
      group.add(link);
      link.visible = false;
    }
  }
  for (const level of data.levels) {
    const spaces = data.spaces.filter((space) => space.levelId === level.id);
    if (!spaces.length) continue;
    const points = spaces.flatMap((space) => space.polygon);
    labels.push({
      id: null,
      text: level.id,
      kind: "floor",
      position: new THREE.Vector3(
        Math.min(...points.map((p) => p[0])) - 9,
        y(level.id),
        Math.max(...points.map((p) => p[1])) + 3,
      ),
      levels: [level.id],
      color: "#385977",
    });
  }
  for (const feature of group.children)
    if (feature.userData.category !== "link")
      batchLayer(feature as THREE.Group);
  details.forEach(batchLayer);
  let objects = 0;
  group.traverse(() => objects++);
  return { group, labels, details, objects };
}
