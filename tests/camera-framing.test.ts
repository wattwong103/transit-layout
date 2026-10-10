import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { fitOrthographicCamera, visibleGeometryCorners } from "../src/lib/cameraFraming";
import { explorerData } from "../src/data/explorer";
import { geographicExplorer } from "../src/lib/stationRegistration";

test("a hidden floor or hidden detail cannot displace the focused model", () => {
  const root = new THREE.Group();
  const visible = new THREE.Mesh(new THREE.BoxGeometry(20, 2, 40));
  visible.position.set(100, -40, 200);
  root.add(visible);
  const hidden = new THREE.Group();
  hidden.visible = false;
  const outlier = new THREE.Mesh(new THREE.BoxGeometry(5000, 5000, 5000));
  outlier.position.set(-10000, 2000, 9000);
  hidden.add(outlier);
  root.add(hidden);
  root.position.x = 12;
  const points = visibleGeometryCorners([root]);
  const bounds = new THREE.Box3().setFromPoints(points);
  assert.deepEqual(bounds.min.toArray(), [102, -41, 180]);
  assert.deepEqual(bounds.max.toArray(), [122, -39, 220]);
  visible.geometry.dispose();
  outlier.geometry.dispose();
});

test("every station floor stays centred and inside the frame at desktop and phone sizes", () => {
  for (const data of [explorerData, geographicExplorer]) {
    for (const level of data.levels) {
      const points = data.spaces.filter(s => s.levelId === level.id)
        .flatMap(s => s.polygon.map(([x, z]) => new THREE.Vector3(x, level.order * 22, z)));
      for (const [width, height] of [[900, 420], [340, 380]]) {
        const camera = new THREE.OrthographicCamera();
        camera.position.set(700, 550, 950);
        camera.lookAt(0, 0, 0);
        const rotation = camera.quaternion.clone();
        camera.zoom = 4;
        const target = fitOrthographicCamera(camera, points, width, height, { x: 22, y: 20 });
        assert.ok(target, level.id);
        assert.ok(camera.quaternion.angleTo(rotation) < 1e-6, "framing preserves orbit angle");
        assert.equal(camera.zoom, 1);
        const projected = points.map(point => point.clone().project(camera));
        assert.ok(projected.every(p => Math.abs(p.x) < 1 && Math.abs(p.y) < 1 && Math.abs(p.z) < 1));
        const xs = projected.map(p => p.x), ys = projected.map(p => p.y);
        assert.ok(Math.abs(Math.min(...xs) + Math.max(...xs)) < 1e-6, "horizontal centre");
        assert.ok(Math.abs(Math.min(...ys) + Math.max(...ys)) < 1e-6, "vertical centre");
        assert.ok(Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) > 1.5,
          `${level.id}: floor must use the available drawing space`);
      }
    }
  }
});

test("an empty frame leaves the current camera intact", () => {
  const camera = new THREE.OrthographicCamera();
  camera.position.set(4, 5, 6);
  camera.zoom = 2;
  assert.equal(fitOrthographicCamera(camera, [], 900, 500), null);
  assert.deepEqual(camera.position.toArray(), [4, 5, 6]);
  assert.equal(camera.zoom, 2);
});
