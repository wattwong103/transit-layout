import * as THREE from "three";
import type { Point2 } from "../types/explorer";

/** Shared plan-to-3D convention: preserve east X and south Z, extrude upward. */
export function extrudePlan(
  rings: readonly (readonly Point2[])[],
  depth: number,
  bevel = false,
) {
  const shape = new THREE.Shape(
    rings[0].map(([x, z]) => new THREE.Vector2(x, -z)),
  );
  shape.closePath();
  for (const ring of rings.slice(1)) {
    const hole = new THREE.Path(
      ring.map(([x, z]) => new THREE.Vector2(x, -z)),
    );
    hole.closePath();
    shape.holes.push(hole);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel,
    bevelSize: 0.2,
    bevelThickness: 0.25,
    bevelSegments: 1,
    steps: 1,
    curveSegments: 1,
  });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}
