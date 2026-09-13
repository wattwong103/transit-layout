"use client";

import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { ExplorerViewProps } from "@/types/explorer";
import { getSelection } from "@/lib/explorer";
import {
  buildModel,
  disposeModel,
  type Model,
  type LabelRecord,
} from "./explorerScene";

const fallback = (
  <div
    role="status"
    className="absolute inset-0 z-20 flex items-center justify-center bg-[#faf9f6] p-8 text-center text-sm text-slate-600"
  >
    3D is unavailable. Switch to 2D plan.
  </div>
);
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? fallback : this.props.children;
  }
}
type SceneProps = ExplorerViewProps & {
  hostRef: RefObject<HTMLDivElement>;
  overlayRef: RefObject<HTMLDivElement>;
  onUnavailable: () => void;
};

function ArchitecturalScene(props: SceneProps) {
  const {
    data,
    separation,
    contextMode,
    activeLevel,
    selectedId,
    showLabels,
    resetKey,
    hostRef,
    overlayRef,
  } = props;
  const { gl, camera: baseCamera, scene, size, invalidate } = useThree();
  const camera = baseCamera as THREE.OrthographicCamera;
  const modelRef = useRef<Model | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const current = useRef(props);
  current.current = props;
  const revision = useRef(0);
  const firstFit = useRef(true);
  const carriedFocus = useRef<string | undefined>();

  // R3F owns the WebGL context, resize, rendering, shadows, and demand scheduling.
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = false;
    controls.minZoom = 0.45;
    controls.maxZoom = 6;
    controls.minPolarAngle = 0.15;
    controls.maxPolarAngle = Math.PI * 0.8;
    controls.rotateSpeed = 0.7;
    controls.zoomSpeed = 0.9;
    controls.screenSpacePanning = true;
    const changed = () => invalidate();
    controls.addEventListener("change", changed);
    controlsRef.current = controls;
    gl.domElement.setAttribute(
      "aria-label",
      "Rotatable schematic of Shibuya station and buildings. Drag to rotate, right-drag to pan, scroll to zoom.",
    );
    gl.domElement.setAttribute("role", "img");
    let start: { x: number; y: number; id: number } | null = null;
    let dragged = false;
    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) {
        dragged = true;
        return;
      }
      start = { x: event.clientX, y: event.clientY, id: event.pointerId };
      dragged = false;
    };
    const move = (event: PointerEvent) => {
      if (
        start &&
        Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5
      )
        dragged = true;
    };
    const cancel = () => {
      start = null;
    };
    const up = (event: PointerEvent) => {
      if (!start || start.id !== event.pointerId || dragged) {
        start = null;
        return;
      }
      start = null;
      const bounds = gl.domElement.getBoundingClientRect();
      const ray = new THREE.Raycaster();
      ray.setFromCamera(
        new THREE.Vector2(
          (2 * (event.clientX - bounds.left)) / bounds.width - 1,
          1 - (2 * (event.clientY - bounds.top)) / bounds.height,
        ),
        camera,
      );
      const hit = ray
        .intersectObjects(modelRef.current?.group.children ?? [], true)
        .find(({ object }) => {
          if (!object.userData.selectId) return false;
          let ancestor: THREE.Object3D | null = object;
          while (ancestor) {
            if (!ancestor.visible) return false;
            ancestor = ancestor.parent;
          }
          return true;
        });
      current.current.onSelect(
        hit ? String(hit.object.userData.selectId) : null,
      );
    };
    const lost = (event: Event) => {
      event.preventDefault();
      current.current.onUnavailable();
    };
    gl.domElement.addEventListener("pointerdown", down);
    gl.domElement.addEventListener("pointermove", move);
    gl.domElement.addEventListener("pointerup", up);
    gl.domElement.addEventListener("pointercancel", cancel);
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => {
      controls.removeEventListener("change", changed);
      controls.dispose();
      controlsRef.current = null;
      gl.domElement.removeEventListener("pointerdown", down);
      gl.domElement.removeEventListener("pointermove", move);
      gl.domElement.removeEventListener("pointerup", up);
      gl.domElement.removeEventListener("pointercancel", cancel);
      gl.domElement.removeEventListener("webglcontextlost", lost);
    };
  }, [camera, gl, invalidate]);

  // Only source geometry or display separation can allocate a new model.
  useEffect(() => {
    const model = buildModel(data, separation);
    modelRef.current = model;
    scene.add(model.group);
    revision.current++;
    const host = hostRef.current;
    if (host) {
      host.dataset.geometryRevision = String(revision.current);
      host.dataset.objectCount = String(model.objects);
    }
    const overlay = overlayRef.current;
    const focusId = overlay?.contains(document.activeElement)
      ? (document.activeElement as HTMLElement).dataset.featureId
      : carriedFocus.current;
    carriedFocus.current = undefined;
    if (overlay) {
      overlay.replaceChildren();
      for (const label of model.labels) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label.text;
        button.style.cssText = `position:absolute;left:0;top:0;white-space:nowrap;max-width:185px;overflow:hidden;text-overflow:ellipsis;font-family:inherit;font-size:${label.kind === "floor" ? 15 : label.kind === "exit" ? 10 : 11}px;line-height:1.3;font-weight:${label.kind === "floor" || label.kind === "exit" ? 750 : 600};padding:${label.kind === "exit" ? "2px 4px" : "2px 5px"};border-radius:3px;border:1px solid transparent;pointer-events:${label.id ? "auto" : "none"};cursor:${label.id ? "pointer" : "default"};`;
        if (label.id) {
          button.dataset.featureId = label.id;
          button.setAttribute(
            "aria-label",
            `${label.kind === "exit" ? "Exit " : ""}${label.text}`,
          );
          button.addEventListener("click", () =>
            current.current.onSelect(label.id),
          );
        } else {
          button.tabIndex = -1;
          button.setAttribute("role", "presentation");
        }
        label.element = button;
        button.style.zIndex = "1";
        const leader = document.createElement("div");
        leader.setAttribute("aria-hidden", "true");
        leader.style.cssText =
          "display:none;position:absolute;left:0;top:0;height:1px;background:#248c91;transform-origin:0 50%;pointer-events:none;";
        label.leader = leader;
        overlay.appendChild(leader);
        overlay.appendChild(button);
      }
      if (focusId)
        model.labels
          .find((label) => label.id === focusId)
          ?.element?.focus({ preventScroll: true });
    }
    invalidate();
    return () => {
      if (overlay?.contains(document.activeElement))
        carriedFocus.current = (
          document.activeElement as HTMLElement
        ).dataset.featureId;
      disposeModel(model);
      if (modelRef.current === model) modelRef.current = null;
      overlay?.replaceChildren();
    };
  }, [data, separation, scene, invalidate, hostRef, overlayRef]);

  // Selection preserves meshes, buffers, labels, and keyboard focus.
  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;
    const selection = getSelection(data, selectedId);
    for (const entity of model.group.children) {
      const meta = entity.userData;
      const matches =
        activeLevel === "all" || meta.levels?.includes(activeLevel);
      entity.visible =
        meta.category === "building"
          ? contextMode !== "station"
          : meta.category === "link"
            ? contextMode !== "station" &&
              matches &&
              (selectedId === meta.exitId || selectedId === meta.buildingId)
            : matches &&
              (meta.category === "exit" || contextMode !== "buildings");
      if (meta.category === "link") continue;
      const highlighted = selection.highlightedIds.has(meta.id);
      entity.traverse((object) => {
        const material = (object as THREE.Mesh).material;
        if (!material) return;
        for (const mat of Array.isArray(material) ? material : [material]) {
          const colored = mat as THREE.MeshStandardMaterial;
          if (!mat.userData.baseColor || !colored.color) continue;
          colored.color.copy(mat.userData.baseColor);
          if (highlighted && object.type === "LineSegments")
            colored.color.set("#087f91");
          else if (selectedId && !highlighted)
            colored.color.lerp(new THREE.Color("#d5d6d1"), 0.32);
          if (meta.category === "building") {
            const solidEnvelope =
              contextMode === "buildings" && object.type === "Mesh";
            mat.opacity = solidEnvelope
              ? highlighted
                ? 0.95
                : 0.8
              : highlighted
                ? 0.45
                : mat.userData.baseOpacity;
            mat.depthWrite = solidEnvelope;
          }
        }
      });
    }
    for (const label of model.labels) {
      if (!label.element) continue;
      const highlighted = label.id && selection.highlightedIds.has(label.id);
      label.element.style.color = highlighted ? "#087786" : label.color;
      label.element.style.background =
        label.kind === "exit"
          ? "#ffe17b"
          : highlighted
            ? "#e8fbfa"
            : "rgba(250,249,246,.88)";
      label.element.style.borderColor = highlighted
        ? "#008e9c"
        : label.kind === "exit"
          ? "#cfb643"
          : "transparent";
      if (label.id)
        label.element.setAttribute(
          "aria-pressed",
          String(label.id === selectedId),
        );
    }
    invalidate();
  }, [
    data,
    separation,
    contextMode,
    activeLevel,
    selectedId,
    showLabels,
    invalidate,
  ]);

  const fitRef = useRef<(reset: boolean) => void>(() => {});
  fitRef.current = (reset) => {
    const model = modelRef.current;
    const controls = controlsRef.current;
    if (!model || !controls || !size.width || !size.height) return;
    if (reset || firstFit.current) {
      camera.position.set(160, 210, 390);
      controls.target.set(0, -25, 0);
      camera.lookAt(controls.target);
      firstFit.current = false;
    }
    camera.updateMatrixWorld();
    model.group.updateMatrixWorld(true);
    const right = new THREE.Vector3().setFromMatrixColumn(
      camera.matrixWorld,
      0,
    );
    const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    const forward = new THREE.Vector3().setFromMatrixColumn(
      camera.matrixWorld,
      2,
    );
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    const add = (point: THREE.Vector3) => {
      const x = point.dot(right),
        y = point.dot(up);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    };
    const point = new THREE.Vector3();
    for (const entity of model.group.children) {
      const category = entity.userData.category;
      if (
        category === "link" ||
        (category === "building" && contextMode === "station") ||
        (category === "station" && contextMode === "buildings")
      )
        continue;
      entity.traverse((object) => {
        const position = (object as THREE.Mesh).geometry?.attributes.position;
        if (!position) return;
        for (let index = 0; index < position.count; index++)
          add(
            point
              .fromBufferAttribute(position, index)
              .applyMatrix4(object.matrixWorld),
          );
      });
    }
    for (const label of model.labels)
      if (label.kind === "floor" && contextMode !== "buildings")
        add(label.position);
    if (!Number.isFinite(minX)) return;
    const center = right
      .clone()
      .multiplyScalar((minX + maxX) / 2)
      .addScaledVector(up, (minY + maxY) / 2);
    controls.target.copy(center);
    camera.position.copy(center).addScaledVector(forward, 600);
    const unitsPerPixel = Math.max(
      (maxX - minX) / Math.max(size.width - 42, 1),
      (maxY - minY) / Math.max(size.height - 40, 1),
    );
    camera.left = (-unitsPerPixel * size.width) / 2;
    camera.right = -camera.left;
    camera.top = (unitsPerPixel * size.height) / 2;
    camera.bottom = -camera.top;
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    controls.update();
    invalidate();
  };
  useEffect(() => {
    fitRef.current(false);
  }, [data, separation, contextMode, size.width, size.height]);
  useEffect(() => {
    fitRef.current(true);
  }, [resetKey]);

  useFrame(() => {
    const model = modelRef.current;
    if (!model) return;
    for (const detail of model.details) detail.visible = camera.zoom > 1.7;
    const { selectedId, showLabels, contextMode, activeLevel } =
      current.current;
    const selection = getSelection(current.current.data, selectedId);
    const priority = (label: LabelRecord) =>
      (label.id !== null && label.id === selectedId) ||
      label.element === document.activeElement
        ? 120
        : label.id && selection.highlightedIds.has(label.id)
          ? 119
          : label.kind === "building" && contextMode === "buildings"
            ? 110
            : label.kind === "floor"
              ? 100
              : label.kind === "exit"
                ? 70
                : label.kind === "platform"
                  ? 60
                  : 30;
    const occupied: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    }[] = [];
    const projected = new THREE.Vector3();
    for (const label of [...model.labels].sort(
      (a, b) => priority(b) - priority(a),
    )) {
      const button = label.element;
      if (!button) continue;
      const selected =
        (label.id !== null && label.id === selectedId) ||
        button === document.activeElement;
      const highlighted = !!label.id && selection.highlightedIds.has(label.id);
      const matches =
        activeLevel === "all" || label.levels.includes(activeLevel);
      const modeMatches =
        label.kind === "building"
          ? contextMode !== "station"
          : label.kind === "exit" || contextMode !== "buildings";
      const densityHidden =
        !selected &&
        !highlighted &&
        ((label.kind === "space" && camera.zoom < 1.55) ||
          label.kind === "connector");
      const enabled =
        modeMatches &&
        (label.kind === "building" || matches) &&
        (showLabels || label.kind === "exit" || selected) &&
        !densityHidden;
      if (!enabled) {
        button.style.display = "none";
        if (label.leader) label.leader.style.display = "none";
        continue;
      }
      projected.copy(label.position).project(camera);
      const x = ((projected.x + 1) * size.width) / 2,
        y = ((1 - projected.y) * size.height) / 2;
      button.style.display = "block";
      const w = button.offsetWidth,
        h = button.offsetHeight;
      const boxAt = (cx: number, cy: number) => ({
        left: cx - w / 2 - 3,
        right: cx + w / 2 + 3,
        top: cy - h / 2 - 3,
        bottom: cy + h / 2 + 3,
      });
      let labelX = x,
        labelY = y,
        bounds = boxAt(x, y);
      const collides = (candidate: typeof bounds) =>
        occupied.some(
          (b) =>
            candidate.left < b.right &&
            candidate.right > b.left &&
            candidate.top < b.bottom &&
            candidate.bottom > b.top,
        );
      if ((highlighted || label.kind === "floor") && collides(bounds)) {
        for (const [dx, dy] of [
          [0, -24],
          [0, 24],
          [-w - 8, 0],
          [w + 8, 0],
          [0, -48],
          [0, 48],
        ]) {
          const candidate = boxAt(x + dx, y + dy);
          if (
            !collides(candidate) &&
            candidate.left >= 0 &&
            candidate.right <= size.width &&
            candidate.top >= 0 &&
            candidate.bottom <= size.height
          ) {
            labelX = x + dx;
            labelY = y + dy;
            bounds = candidate;
            break;
          }
        }
      }
      const overlaps = collides(bounds);
      const outside =
        projected.z < -1 ||
        projected.z > 1 ||
        x < 0 ||
        x > size.width ||
        y < 0 ||
        y > size.height;
      const hide =
        outside ||
        (!selected && !highlighted && label.kind !== "floor" && overlaps);
      button.style.display = hide ? "none" : "block";
      if (label.leader) {
        const dx = labelX - x,
          dy = labelY - y;
        label.leader.style.display = !hide && (dx || dy) ? "block" : "none";
        label.leader.style.width = `${Math.hypot(dx, dy)}px`;
        label.leader.style.transform = `translate(${x}px,${y}px) rotate(${Math.atan2(dy, dx)}rad)`;
      }
      if (!hide) {
        button.style.transform = `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`;
        occupied.push(bounds);
      }
    }
    // Read after R3F's render without scheduling another frame or React update.
    queueMicrotask(() => {
      const host = hostRef.current;
      if (host) {
        host.dataset.drawCalls = String(gl.info.render.calls);
        host.dataset.triangles = String(gl.info.render.triangles);
        host.dataset.geometryCount = String(gl.info.memory.geometries);
      }
    });
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <hemisphereLight args={["#fff9ec", "#bec6ce", 0.75]} />
      <directionalLight
        position={[-110, 240, 170]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={size.width < 600 ? 512 : 1024}
        shadow-mapSize-height={size.width < 600 ? 512 : 1024}
        shadow-camera-left={-240}
        shadow-camera-right={240}
        shadow-camera-top={240}
        shadow-camera-bottom={-240}
        shadow-camera-near={1}
        shadow-camera-far={750}
        shadow-bias={-0.0006}
        shadow-normalBias={0.65}
        shadow-radius={3}
      />
    </>
  );
}

export default function Explorer3D(props: ExplorerViewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  // A stable manual camera lets our fit own the frustum and survives selection renders.
  const camera = useMemo(
    () =>
      Object.assign(
        new THREE.OrthographicCamera(-250, 250, 250, -250, 0.1, 2400),
        { manual: true },
      ),
    [],
  );
  return (
    <div
      ref={hostRef}
      className="explorer-3d-canvas"
      data-testid="explorer-3d"
      data-renderer="react-three-fiber"
      data-geometry-revision="0"
      data-object-count="0"
      data-draw-calls="0"
    >
      {unavailable ? (
        fallback
      ) : (
        <SceneBoundary>
          <Canvas
            orthographic
            frameloop="demand"
            dpr={[1, 1.75]}
            shadows={{ type: THREE.PCFShadowMap }}
            camera={camera}
            gl={{
              antialias: true,
              alpha: false,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1,
            }}
            fallback={fallback}
            onCreated={({ gl }) => gl.setClearColor("#faf9f6")}
          >
            <ArchitecturalScene
              {...props}
              hostRef={hostRef}
              overlayRef={overlayRef}
              onUnavailable={() => setUnavailable(true)}
            />
          </Canvas>
        </SceneBoundary>
      )}
      <div
        ref={overlayRef}
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
