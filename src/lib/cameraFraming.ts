import * as THREE from "three";

/** Bounds of visible renderables only; hidden floors must not push a focus view away. */
export function visibleGeometryCorners(roots: readonly THREE.Object3D[]) {
  const points: THREE.Vector3[] = [];
  for (const root of roots) {
    root.updateWorldMatrix(true, true);
    root.traverseVisible((object) => {
      const geometry = (object as THREE.Mesh).geometry;
      if (!geometry) return;
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      if (!box || box.isEmpty()) return;
      for (const x of [box.min.x, box.max.x])
        for (const y of [box.min.y, box.max.y])
          for (const z of [box.min.z, box.max.z])
            points.push(new THREE.Vector3(x, y, z).applyMatrix4(object.matrixWorld));
    });
  }
  return points;
}

/** Keep the current viewing angle while centring a visible model with a screen-space gutter. */
export function fitOrthographicCamera(
  camera: THREE.OrthographicCamera,
  points: readonly THREE.Vector3[],
  width: number,
  height: number,
  padding = { x: 80, y: 100 },
) {
  if (!points.length || width <= 0 || height <= 0) return null;
  camera.updateMatrixWorld();
  const axes = [0, 1, 2].map((axis) =>
    new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, axis),
  );
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const point of points) {
    axes.forEach((axis, i) => {
      const value = point.dot(axis);
      min[i] = Math.min(min[i], value);
      max[i] = Math.max(max[i], value);
    });
  }
  if (![...min, ...max].every(Number.isFinite)) return null;
  const target = new THREE.Vector3();
  axes.forEach((axis, i) => target.addScaledVector(axis, (min[i] + max[i]) / 2));
  const unitsPerPixel = Math.max(
    (max[0] - min[0]) / Math.max(width - padding.x * 2, width * 0.5),
    (max[1] - min[1]) / Math.max(height - padding.y * 2, height * 0.5),
    0.02,
  );
  const distance = Math.max(1000, max[2] - min[2] + 100);
  camera.position.copy(target).addScaledVector(axes[2], distance);
  camera.left = -unitsPerPixel * width / 2;
  camera.right = -camera.left;
  camera.top = unitsPerPixel * height / 2;
  camera.bottom = -camera.top;
  camera.zoom = 1;
  camera.near = 0.1;
  camera.far = distance * 2;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  return target;
}
