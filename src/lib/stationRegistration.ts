import { explorerData } from "../data/explorer";
import landmarks from "../data/plateau-landmarks.json";
import reference from "../../public/plateau/reference.json";
import type { ExplorerDataset, Point2 } from "../types/explorer";
import { getSpaceOpenings } from "./explorer";

export interface AlignmentControl {
  id: string;
  diagram: Point2;
  target: Point2;
}
export interface Similarity {
  a: number;
  b: number;
  tx: number;
  tz: number;
  scale: number;
  rmse: number;
  residuals: { id: string; distance: number; fitted: Point2; target: Point2 }[];
}

function ecef(longitude: number, latitude: number, height: number): number[] {
  const lon = (longitude * Math.PI) / 180,
    lat = (latitude * Math.PI) / 180;
  const e2 = 6.6943799901413165e-3;
  const n = 6378137 / Math.sqrt(1 - e2 * Math.sin(lat) ** 2);
  return [
    (n + height) * Math.cos(lat) * Math.cos(lon),
    (n + height) * Math.cos(lat) * Math.sin(lon),
    (n * (1 - e2) + height) * Math.sin(lat),
  ];
}

/** WGS84 to the same E/U/S frame as the decoded PLATEAU passage. */
export function geographicToLocal(
  longitude: number,
  latitude: number,
  height = 0,
  origin: readonly number[] = reference.originWgs84,
): [number, number, number] {
  if (
    ![longitude, latitude, height, ...origin].every(Number.isFinite) ||
    origin.length !== 3
  )
    throw new Error("Invalid geographic coordinate");
  const center = ecef(origin[0], origin[1], origin[2]);
  const d = ecef(longitude, latitude, height).map(
    (value, i) => value - center[i],
  );
  const lon = (origin[0] * Math.PI) / 180,
    lat = (origin[1] * Math.PI) / 180;
  return [
    -Math.sin(lon) * d[0] + Math.cos(lon) * d[1],
    Math.cos(lat) * Math.cos(lon) * d[0] +
      Math.cos(lat) * Math.sin(lon) * d[1] +
      Math.sin(lat) * d[2],
    Math.sin(lat) * Math.cos(lon) * d[0] +
      Math.sin(lat) * Math.sin(lon) * d[1] -
      Math.cos(lat) * d[2],
  ];
}

export function transformPoint(p: Point2, fit: Similarity): Point2 {
  return [
    fit.a * p[0] - fit.b * p[1] + fit.tx,
    fit.b * p[0] + fit.a * p[1] + fit.tz,
  ];
}

/** Least-squares translation + rotation + uniform scale; no shear or warping. */
export function fitSimilarity(controls: AlignmentControl[]): Similarity {
  if (
    controls.length < 2 ||
    controls.some((c) => ![...c.diagram, ...c.target].every(Number.isFinite))
  )
    throw new Error("At least two finite controls are required");
  const mean = (key: "diagram" | "target", axis: number) =>
    controls.reduce((sum, c) => sum + c[key][axis], 0) / controls.length;
  const sx = mean("diagram", 0),
    sz = mean("diagram", 1),
    tx = mean("target", 0),
    tz = mean("target", 1);
  let denominator = 0,
    dot = 0,
    cross = 0;
  controls.forEach((c) => {
    const x = c.diagram[0] - sx,
      z = c.diagram[1] - sz,
      u = c.target[0] - tx,
      v = c.target[1] - tz;
    denominator += x * x + z * z;
    dot += x * u + z * v;
    cross += x * v - z * u;
  });
  if (denominator < 1e-8)
    throw new Error("Controls must have distinct diagram positions");
  const a = dot / denominator,
    b = cross / denominator;
  const scale = Math.hypot(a, b);
  if (scale < 1e-8) throw new Error("Alignment scale is degenerate");
  const fit: Similarity = {
    a,
    b,
    tx: tx - a * sx + b * sz,
    tz: tz - b * sx - a * sz,
    scale,
    rmse: 0,
    residuals: [],
  };
  fit.residuals = controls.map((c) => {
    const fitted = transformPoint(c.diagram, fit);
    return {
      id: c.id,
      fitted,
      target: c.target,
      distance: Math.hypot(fitted[0] - c.target[0], fitted[1] - c.target[1]),
    };
  });
  fit.rmse = Math.sqrt(
    fit.residuals.reduce((sum, c) => sum + c.distance ** 2, 0) /
      controls.length,
  );
  return fit;
}

export const alignmentControls: AlignmentControl[] = landmarks.map(
  (landmark) => {
    const building = explorerData.buildings.find(
      (b) => b.id === landmark.explorerId,
    )!;
    // Correspondence is the building envelope centre, not its entrance or label.
    const xs = building.polygon.map((p) => p[0]),
      zs = building.polygon.map((p) => p[1]);
    const local = geographicToLocal(landmark.longitude, landmark.latitude);
    return {
      id: landmark.explorerId,
      diagram: [
        (Math.min(...xs) + Math.max(...xs)) / 2,
        (Math.min(...zs) + Math.max(...zs)) / 2,
      ],
      target: [local[0], local[2]],
    };
  },
);
export const stationAlignment = fitSimilarity(alignmentControls);

/** Shared registered geometry for plan and 3D; the source drawing is immutable. */
export function registerExplorer(
  data: ExplorerDataset,
  fit = stationAlignment,
): ExplorerDataset {
  const point = (p: Point2) => transformPoint(p, fit);
  return {
    ...data,
    spaces: data.spaces.map((s) => ({
      ...s,
      polygon: s.polygon.map(point),
      labelPosition: point(s.labelPosition),
      // Derive in the source frame so clearances and lift orientation receive
      // exactly the same scale and rotation as the surrounding slab.
      openings: getSpaceOpenings(data, s).map((ring) => ring.map(point)),
      tracks: s.tracks?.map((t) => ({ ...t, points: t.points.map(point) })),
    })),
    connectors: data.connectors.map((c) => ({
      ...c,
      width: c.width * fit.scale,
      from: { ...c.from, position: point(c.from.position) },
      to: { ...c.to, position: point(c.to.position) },
      ...(c.stops ? { stops: c.stops.map((stop) => ({ ...stop, position: point(stop.position) })) } : {}),
    })),
    exits: data.exits.map((e) => ({ ...e, position: point(e.position) })),
    ...(data.facilities ? { facilities: data.facilities.map((f) => ({ ...f, position: point(f.position) })) } : {}),
    buildings: data.buildings.map((b) => ({
      ...b,
      polygon: b.polygon.map(point),
      labelPosition: point(b.labelPosition),
    })),
  };
}
export const geographicExplorer = registerExplorer(explorerData);
