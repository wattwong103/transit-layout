"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { CompactCity } from "@/types/geographic";
import type { Point2 } from "@/types/explorer";
import {
  geographicExplorer as station,
  geographicToLocal,
  stationAlignment,
  alignmentControls,
} from "@/lib/stationRegistration";
import { getSpaceOpenings, connectorLevels, connectorStops, connectorName, facilitySymbol, floorSurfaceOffset } from "@/lib/explorer";
import { extrudePlan } from "@/lib/planGeometry";
import citySummary from "@/data/station-city-summary.json";

const base = process.env.NODE_ENV === "production" ? "/transit-layout" : "";
const ground = citySummary.displayGroundEllipsoidM;
const stationLabels = [
  ...station.exits.map(e => ({id:e.id, text:e.code, name:`Exit ${e.code}`, level:e.levelId, position:e.position, color:"#f5d34d"})),
  ...(station.facilities ?? []).map(f => ({id:f.id, text:facilitySymbol(f.kind), name:f.name, level:f.levelId, position:f.position, color:f.kind === "works" ? "#f3cbc1" : "#e8f2ee"})),
  ...station.connectors.flatMap(c => connectorStops(c).map(s => ({id:c.id, text:c.access?.status === "closed-in-source" ? "×" : c.kind === "lift" ? "↕" : c.kind === "slope" ? "／" : "↗", name:connectorName(c), level:s.levelId, position:s.position, color:c.access?.status === "closed-in-source" ? "#f3cbc1" : "#e8f2ee"}))),
];

export interface CompactSceneProps {
  city: CompactCity;
  plan: boolean;
  district: boolean;
  reset: number;
  level: string;
  spacing: number;
  opacity: number;
  schematic: boolean;
  map: boolean;
  passage: boolean;
  guides: boolean;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onStatus: (message: string) => void;
}

function extrusion(
  rings: readonly (readonly Point2[])[],
  bottom: number,
  height: number,
) {
  const geometry = extrudePlan(rings, Math.max(0.1, height));
  geometry.translate(0, bottom, 0);
  geometry.deleteAttribute("uv");
  return geometry;
}

function merge(parts: THREE.BufferGeometry[]) {
  const result = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  if (!result) throw new Error("Could not combine the compact geometry");
  return result;
}

function release(group: THREE.Object3D) {
  group.traverse((object) => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();
    for (const material of Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material])
      material?.dispose();
  });
}

function cityModel(city: CompactCity) {
  const group = new THREE.Group();
  const buckets = new Map<string, THREE.BufferGeometry[]>();
  for (const building of city.buildings) {
    const key = building.explorerId ?? "context";
    const bucket = buckets.get(key) ?? [];
    building.parts.forEach((rings) =>
      bucket.push(
        extrusion(rings, building.base - ground, building.top - building.base),
      ),
    );
    buckets.set(key, bucket);
  }
  buckets.forEach((parts, id) => {
    const geometry = merge(parts);
    const material = new THREE.MeshStandardMaterial({
      color: id === "context" ? "#8fa8a3" : "#638e82",
      roughness: 1,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.buildingId = id === "context" ? null : id;
    group.add(mesh);
    // Neighbourhood facades do not need thousands of individual edge strokes.
    // Keep clear edges only on the three reviewed landmark envelopes.
    if (id === "context") return;
    const outline = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry, 35),
      new THREE.LineBasicMaterial({
        color: "#78938b",
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      }),
    );
    outline.userData.buildingId = mesh.userData.buildingId;
    group.add(outline);
  });
  return group;
}

function stationModel(spacing: number) {
  const root = new THREE.Group();
  const height = (id: string) =>
    (station.levels.find((l) => l.id === id)?.order ?? 0) * spacing;
  for (const level of station.levels) {
    const group = new THREE.Group();
    group.userData.levels = [level.id];
    const buckets = new Map<string, THREE.BufferGeometry[]>();
    for (const space of station.spaces.filter((s) => s.levelId === level.id)) {
      const parts = buckets.get(space.color) ?? [];
      const holes = getSpaceOpenings(station, space);
      parts.push(extrusion([space.polygon, ...holes], height(level.id) + floorSurfaceOffset(station,space), 0.85));
      buckets.set(space.color, parts);
      space.tracks?.forEach((track) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(
          track.points.map(
            ([x, z]) => new THREE.Vector3(x, height(level.id) + 1, z),
          ),
        );
        group.add(
          new THREE.Line(
            geometry,
            new THREE.LineBasicMaterial({ color: track.color }),
          ),
        );
      });
    }
    for (const marker of stationLabels.filter(f=>f.level === level.id)) {
      const parts = buckets.get(marker.color) ?? [];
      const [x,z]=marker.position;
      const geometry = extrusion([[[x-1.75,z-1.75],[x+1.75,z-1.75],[x+1.75,z+1.75],[x-1.75,z+1.75]]],height(level.id)+1,1.6);
      parts.push(geometry); buckets.set(marker.color,parts);
    }
    buckets.forEach((parts, color) => {
      const geometry = merge(parts);
      group.add(
        new THREE.Mesh(
          geometry,
          new THREE.MeshStandardMaterial({
            color,
            roughness: 1,
            side: THREE.DoubleSide,
          }),
        ),
      );
      group.add(
        new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry, 35),
          new THREE.LineBasicMaterial({
            color: "#83775f",
            transparent: true,
            opacity: 0.55,
          }),
        ),
      );
    });
    root.add(group);
  }
  for (const connector of station.connectors) {
    const a = new THREE.Vector3(
      connector.from.position[0],
      height(connector.from.levelId) + 1,
      connector.from.position[1],
    );
    const b = new THREE.Vector3(
      connector.to.position[0],
      height(connector.to.levelId) + 1,
      connector.to.position[1],
    );
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        connector.width,
        connector.kind === "lift" ? connector.width : 0.9,
        a.distanceTo(b),
      ),
      new THREE.MeshStandardMaterial({
        color: connector.access?.status === "closed-in-source" ? "#bd6653" : connector.kind === "lift" ? "#53b6c0" : "#c8b77d",
        roughness: 1,
      }),
    );
    mesh.position.copy(a).lerp(b, 0.5);
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      b.clone().sub(a).normalize(),
    );
    mesh.userData.levels = connectorLevels(connector);
    root.add(mesh);
  }
  // Present the drawing clearly through translucent city context, while depth
  // testing still preserves the station's own floor/connector occlusion.
  root.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
      object.renderOrder = 20;
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material]) {
        material.transparent = true;
        material.forceSinglePass = true;
      }
    }
  });
  return root;
}

/** Only the fixed neighbourhood's zoom-16 map tiles; no terrain or globe. */
function MapPlane({
  enabled,
  onStatus,
}: {
  enabled: boolean;
  onStatus: (message: string) => void;
}) {
  const { scene, invalidate } = useThree();
  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    const group = new THREE.Group(),
      textures: THREE.Texture[] = [];
    const zoom = 16,
      n = 2 ** zoom;
    const tileX = (lon: number) => Math.floor(((lon + 180) / 360) * n);
    const tileY = (lat: number) =>
      Math.floor(
        ((1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2) * n,
      );
    const lon = (x: number) => (x / n) * 360 - 180;
    const lat = (y: number) =>
      (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
    const loader = new THREE.TextureLoader();
    for (let x = tileX(139.693); x <= tileX(139.709); x++)
      for (let y = tileY(35.664); y <= tileY(35.653); y++) {
        const points = [
          [x, y],
          [x + 1, y],
          [x, y + 1],
          [x + 1, y + 1],
        ].flatMap(([tx, ty]) => {
          const p = geographicToLocal(lon(tx), lat(ty), ground);
          return [p[0], -0.15, p[2]];
        });
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(points, 3),
        );
        geometry.setAttribute(
          "uv",
          new THREE.Float32BufferAttribute([0, 1, 1, 1, 0, 0, 1, 0], 2),
        );
        geometry.setIndex([0, 2, 1, 2, 3, 1]);
        const material = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0.18,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = -1;
        group.add(mesh);
        const texture = loader.load(
          `https://cyberjapandata.gsi.go.jp/xyz/pale/${zoom}/${x}/${y}.png`,
          () => {
            if (disposed) return;
            material.map = texture;
            material.needsUpdate = true;
            invalidate();
          },
          undefined,
          () => {
            if (!disposed)
              onStatus(
                "Some GSI map tiles could not load. City and station geometry are still available.",
              );
          },
        );
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        textures.push(texture);
      }
    scene.add(group);
    invalidate();
    return () => {
      disposed = true;
      scene.remove(group);
      release(group);
      textures.forEach((texture) => texture.dispose());
    };
  }, [enabled, scene, invalidate, onStatus]);
  return null;
}

function Passage({
  enabled,
  onStatus,
}: {
  enabled: boolean;
  onStatus: (message: string) => void;
}) {
  const { scene, invalidate } = useThree();
  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    let object: THREE.Mesh | undefined;
    new GLTFLoader().load(
      `${base}/plateau/shibuya-west-passage.glb`,
      ({ scene: source }) => {
        if (disposed) {
          release(source);
          return;
        }
        const parts: THREE.BufferGeometry[] = [];
        source.updateMatrixWorld(true);
        source.traverse((node) => {
          if (
            node instanceof THREE.Mesh &&
            node.userData.type !== "bldg:Room"
          ) {
            const geometry = node.geometry
              .clone()
              .applyMatrix4(node.matrixWorld);
            geometry.deleteAttribute("normal");
            geometry.deleteAttribute("uv");
            parts.push(geometry);
          }
        });
        const geometry = merge(parts);
        geometry.computeVertexNormals();
        object = new THREE.Mesh(
          geometry,
          new THREE.MeshStandardMaterial({
            color: "#078f8a",
            roughness: 1,
            side: THREE.DoubleSide,
          }),
        );
        object.position.y = -ground;
        scene.add(object);
        release(source);
        invalidate();
      },
      undefined,
      () => {
        if (!disposed) onStatus("The optional west passage could not load.");
      },
    );
    return () => {
      disposed = true;
      if (object) {
        scene.remove(object);
        release(object);
      }
    };
  }, [enabled, scene, invalidate, onStatus]);
  return null;
}

function Scene(
  props: CompactSceneProps & { labelsRef: RefObject<HTMLDivElement> },
) {
  const { camera: rawCamera, gl, scene, size, invalidate } = useThree();
  const camera = rawCamera as THREE.OrthographicCamera;
  const controls = useRef<OrbitControls>();
  const buildings = useMemo(() => cityModel(props.city), [props.city]);
  const schematic = useMemo(() => stationModel(props.spacing), [props.spacing]);
  const guideGeometry = useMemo(
    () =>
      new THREE.BufferGeometry().setFromPoints(
        stationAlignment.residuals.flatMap((r) => [
          new THREE.Vector3(r.fitted[0], 2, r.fitted[1]),
          new THREE.Vector3(r.target[0], 2, r.target[1]),
        ]),
      ),
    [],
  );
  useEffect(
    () => () => {
      release(buildings);
    },
    [buildings],
  );
  useEffect(
    () => () => {
      release(schematic);
    },
    [schematic],
  );
  useEffect(() => () => guideGeometry.dispose(), [guideGeometry]);
  useEffect(() => {
    const control = new OrbitControls(camera, gl.domElement);
    control.enableDamping = false;
    control.minZoom = 0.4;
    control.maxZoom = 8;
    control.maxPolarAngle = Math.PI * 0.78;
    const changed = () => invalidate();
    control.addEventListener("change", changed);
    controls.current = control;
    gl.domElement.setAttribute("role", "img");
    gl.domElement.setAttribute(
      "aria-label",
      "Unified Shibuya model: simplified PLATEAU buildings and the station schematic in one geographic frame. Drag to orbit; scroll to zoom.",
    );
    return () => {
      control.removeEventListener("change", changed);
      control.dispose();
      controls.current = undefined;
    };
  }, [camera, gl, invalidate]);
  useEffect(() => {
    const target = props.district
      ? new THREE.Vector3(0, 0, -100)
      : new THREE.Vector3(25, -20, -140);
    const span =
      (props.district ? 740 : 330) /
      Math.min(1, size.width / Math.max(size.height, 1));
    camera.left = (-span * size.width) / Math.max(size.height, 1);
    camera.right = -camera.left;
    camera.top = span;
    camera.bottom = -span;
    camera.zoom = 1;
    camera.up.set(0, props.plan ? 0 : 1, props.plan ? -1 : 0);
    camera.position
      .copy(target)
      .add(
        props.plan
          ? new THREE.Vector3(0, 2200, 0)
          : new THREE.Vector3(600, 800, 1100),
      );
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    if (controls.current) {
      controls.current.target.copy(target);
      controls.current.enableRotate = !props.plan;
      controls.current.mouseButtons.LEFT = props.plan
        ? THREE.MOUSE.PAN
        : THREE.MOUSE.ROTATE;
      controls.current.touches.ONE = props.plan
        ? THREE.TOUCH.PAN
        : THREE.TOUCH.ROTATE;
      controls.current.update();
    }
    invalidate();
  }, [
    camera,
    props.plan,
    props.district,
    props.reset,
    size.width,
    size.height,
    invalidate,
  ]);
  useEffect(() => {
    buildings.children.forEach((child) => {
      const object = child as THREE.Mesh;
      const material = object.material as THREE.MeshStandardMaterial;
      const selected =
        !!props.selected && child.userData.buildingId === props.selected;
      material.opacity =
        (props.opacity / 100) * (child.type === "LineSegments" ? 0.6 : 1);
      material.color.set(
        selected
          ? "#d2902f"
          : child.type === "LineSegments"
            ? "#66867b"
            : "#8ba79c",
      );
      material.depthWrite =
        props.opacity === 100 && child.type !== "LineSegments";
    });
    schematic.visible = props.schematic;
    schematic.children.forEach((child) => {
      child.visible =
        props.level === "all" || child.userData.levels?.includes(props.level);
    });
    invalidate();
  }, [
    buildings,
    schematic,
    props.opacity,
    props.selected,
    props.schematic,
    props.level,
    invalidate,
  ]);
  useFrame(() => {
    props.labelsRef.current
      ?.querySelectorAll<HTMLButtonElement>("button[data-building-id]")
      .forEach((button) => {
        const control = alignmentControls.find(
          (c) => c.id === button.dataset.buildingId,
        )!;
        const building = props.city.buildings.find(
          (b) => b.explorerId === control.id,
        )!;
        const point = new THREE.Vector3(
          control.target[0],
          building.top - ground + 6,
          control.target[1],
        ).project(camera);
        const x = ((point.x + 1) * size.width) / 2,
          y = ((1 - point.y) * size.height) / 2;
        button.style.display =
          point.z < -1 ||
          point.z > 1 ||
          x < 0 ||
          x > size.width ||
          y < 0 ||
          y > size.height
            ? "none"
            : "block";
        button.style.transform = `translate(-50%,-100%) translate(${x}px,${y}px)`;
      });
    const occupied: {x:number;y:number}[]=[];
    props.labelsRef.current?.querySelectorAll<HTMLButtonElement>("button[data-feature-id]").forEach(button=>{
      const record=stationLabels[Number(button.dataset.markerIndex)];
      const selected=props.selected===record.id;
      const visible=props.schematic && (props.level === record.level || (props.level === "all" && selected));
      if (!visible) {button.style.display="none";return;}
      const height=(station.levels.find(l=>l.id===record.level)?.order??0)*props.spacing;
      const p=new THREE.Vector3(record.position[0],height+5,record.position[1]).project(camera);
      const x=(p.x+1)*size.width/2,y=(1-p.y)*size.height/2;
      const blocked=!selected && occupied.some(q=>Math.abs(q.x-x)<24 && Math.abs(q.y-y)<20);
      button.style.display=p.z < -1 || p.z > 1 || x<0 || x>size.width || y<0 || y>size.height || blocked ? "none":"block";
      if(!blocked) occupied.push({x,y});
      button.style.transform=`translate(-50%,-100%) translate(${x}px,${y}px)`;
    });
    queueMicrotask(() => {
      gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
      gl.domElement.dataset.triangles = String(gl.info.render.triangles);
      gl.domElement.dataset.geometryCount = String(gl.info.memory.geometries);
      gl.domElement.dataset.textureCount = String(gl.info.memory.textures);
    });
  });
  return (
    <>
      <color attach="background" args={["#f3f2ed"]} />
      <ambientLight intensity={1.6} />
      <directionalLight position={[300, 700, 400]} intensity={2.2} />
      <primitive
        object={buildings}
        onClick={(event: {
          stopPropagation: () => void;
          object: THREE.Object3D;
        }) => {
          if (event.object.userData.buildingId) {
            event.stopPropagation();
            props.onSelect(event.object.userData.buildingId);
          }
        }}
      />
      <primitive object={schematic} />
      <gridHelper
        args={[1600, 16, "#c0ccc3", "#e0e4dc"]}
        position={[0, -0.3, -100]}
      />
      {props.guides && (
        <lineSegments geometry={guideGeometry}>
          <lineBasicMaterial color="#cf7722" depthTest={false} />
        </lineSegments>
      )}
      <MapPlane enabled={props.map} onStatus={props.onStatus} />
      <Passage enabled={props.passage} onStatus={props.onStatus} />
    </>
  );
}

export default function CompactScene(props: CompactSceneProps) {
  const labelsRef = useRef<HTMLDivElement>(null);
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas
        orthographic
        frameloop="demand"
        dpr={[1, 1.25]}
        gl={{ antialias: false, powerPreference: "low-power" }}
        camera={{ near: 0.1, far: 10000 }}
        fallback={
          <p>
            3D is unavailable on this device. The original 2D station plan is
            still available.
          </p>
        }
      >
        <Scene {...props} labelsRef={labelsRef} />
      </Canvas>
      <div
        ref={labelsRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {stationLabels.map((f,i)=><button key={`${f.id}-${f.level}`} data-feature-id={f.id} data-marker-index={i}
          aria-label={`${f.name} · ${f.level}`} title={`${f.name} · ${f.level}`} aria-pressed={props.selected===f.id}
          onClick={()=>props.onSelect(f.id)} style={{position:"absolute",top:0,left:0,display:"none",pointerEvents:"auto",padding:"2px 4px",fontSize:10,border:"1px solid #7e9487",borderRadius:3,background:props.selected===f.id?"#ffd597":f.color,color:"#27493f"}}>{f.text}</button>)}
        {props.city.buildings
          .filter((b) => b.explorerId)
          .map((building) => (
            <button
              key={building.id}
              data-building-id={building.explorerId}
              aria-label={`Select ${building.label}`}
              aria-pressed={props.selected === building.explorerId}
              onClick={() => props.onSelect(building.explorerId!)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                pointerEvents: "auto",
                padding: "3px 6px",
                borderRadius: 4,
                fontSize: 11,
                color: "#31574b",
                background:
                  props.selected === building.explorerId
                    ? "#ffe4af"
                    : "#faf9f6e8",
                border: "1px solid #c7d8cb",
                whiteSpace: "nowrap",
              }}
            >
              {building.label}
            </button>
          ))}
      </div>
    </div>
  );
}
