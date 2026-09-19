"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const base = process.env.NODE_ENV === "production" ? "/transit-layout" : "";

function SourceScene({
  plan,
  cut,
  onStatus,
}: {
  plan: boolean;
  cut: number;
  onStatus: (status: string) => void;
}) {
  const { camera, gl, scene, size, invalidate } = useThree();
  const control = useRef<OrbitControls | null>(null);
  const model = useRef<THREE.Group | null>(null);
  const height = useRef(12);
  const clipping = useRef(new THREE.Plane(new THREE.Vector3(0, -1, 0), 6));
  const currentCut = useRef(cut);
  currentCut.current = cut;

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = false;
    controls.minDistance = 15;
    controls.maxDistance = 300;
    const changed = () => invalidate();
    controls.addEventListener("change", changed);
    control.current = controls;
    gl.localClippingEnabled = true;
    gl.domElement.setAttribute("role", "img");
    gl.domElement.setAttribute(
      "aria-label",
      "PLATEAU geometry of Shibuya west-exit underground passage. Drag to rotate, scroll to zoom.",
    );
    return () => {
      controls.removeEventListener("change", changed);
      controls.dispose();
      control.current = null;
    };
  }, [camera, gl, invalidate]);

  useEffect(() => {
    camera.up.set(0, plan ? 0 : 1, plan ? -1 : 0);
    camera.position.set(
      ...((plan ? [0, 120, 0] : [75, 70, 85]) as [number, number, number]),
    );
    camera.position.multiplyScalar(
      1 / Math.min(1, size.width / Math.max(1, size.height)),
    );
    camera.lookAt(0, 0, 0);
    if (control.current) {
      control.current.target.set(0, 0, 0);
      control.current.enableRotate = !plan;
      control.current.update();
    }
    invalidate();
  }, [camera, plan, size.width, size.height, invalidate]);

  useEffect(() => {
    clipping.current.constant = height.current * (cut / 100 - 0.5) + 0.01;
    model.current?.traverse((object) => {
      if (object.userData.type === "bldg:Room") object.visible = cut === 100;
    });
    invalidate();
  }, [cut, invalidate]);

  useEffect(() => {
    let disposed = false;
    const release = (root: THREE.Group) =>
      root.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
    const loader = new GLTFLoader();
    onStatus("Loading PLATEAU reference…");
    loader.load(
      `${base}/plateau/shibuya-west-passage.glb`,
      ({ scene: root }) => {
        if (disposed) {
          release(root);
          return;
        }
        const bounds = new THREE.Box3().setFromObject(root);
        const center = bounds.getCenter(new THREE.Vector3());
        height.current = bounds.max.y - bounds.min.y;
        clipping.current.constant =
          height.current * (currentCut.current / 100 - 0.5) + 0.01;
        // Only a display translation: source coordinates and metric scale are retained.
        root.position.sub(center);
        root.traverse((object) => {
          if (object.userData.type === "bldg:Room")
            object.visible = currentCut.current === 100;
          if (object instanceof THREE.Mesh) {
            object.geometry.computeVertexNormals();
            const materials = Array.isArray(object.material)
              ? object.material
              : [object.material];
            materials.forEach((material) => {
              material.clippingPlanes = [clipping.current];
              material.clipShadows = true;
            });
          }
        });
        model.current = root;
        scene.add(root);
        onStatus("");
        invalidate();
      },
      undefined,
      () => {
        if (!disposed)
          onStatus(
            "The reference could not load. The source report is available below.",
          );
      },
    );
    return () => {
      disposed = true;
      if (model.current) {
        scene.remove(model.current);
        release(model.current);
        model.current = null;
      }
    };
  }, [scene, invalidate, onStatus]);

  return (
    <>
      <color attach="background" args={["#f3f3ed"]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[40, 80, 30]} intensity={1.8} />
      <directionalLight position={[-40, 20, -30]} intensity={0.6} />
      <gridHelper
        args={[100, 10, "#b7c3bc", "#dce0d8"]}
        position={[0, -6.1, 0]}
      />
    </>
  );
}

export default function PlateauViewer() {
  const [plan, setPlan] = useState(false);
  const [cut, setCut] = useState(100);
  const [status, setStatus] = useState("Loading PLATEAU reference…");
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b border-[#dce0d8] bg-white/60 px-5 py-3 text-sm">
        <button
          className="rounded border px-3 py-2"
          aria-pressed={!plan}
          onClick={() => setPlan(false)}
        >
          3D view
        </button>
        <button
          className="rounded border px-3 py-2"
          aria-pressed={plan}
          onClick={() => setPlan(true)}
        >
          North-up plan
        </button>
        <label className="flex flex-wrap items-center gap-2">
          Reveal interior
          <input
            aria-label="Height of cutaway"
            type="range"
            min="5"
            max="100"
            value={cut}
            onChange={(event) => setCut(Number(event.target.value))}
          />
          <span className="w-24">
            {cut === 100 ? "Full model" : `Cut at ${cut}%`}
          </span>
        </label>
      </div>
      <div className="relative h-[470px] sm:h-[570px]">
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          camera={{ fov: 42, near: 0.1, far: 1000 }}
          fallback={
            <p className="p-8">
              3D is unavailable on this device. Read the source report below.
            </p>
          }
        >
          <SourceScene plan={plan} cut={cut} onStatus={setStatus} />
        </Canvas>
        {status && (
          <p
            role="status"
            className="absolute left-4 top-4 max-w-sm rounded bg-white p-3 text-sm"
          >
            {status}
          </p>
        )}
        <p className="pointer-events-none absolute bottom-4 left-4 rounded bg-white/90 px-3 py-2 text-xs">
          10 m grid ·{" "}
          {plan ? "North ↑ · East →" : "Drag to rotate · Scroll to zoom"}
          <br />
          Grid is a scale reference, not ground level.
          {cut < 100 && (
            <>
              <br />
              Room envelopes hidden in cutaway.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
