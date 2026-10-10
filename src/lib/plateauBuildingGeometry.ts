import { Matrix4, type BufferGeometry } from "three";
import { stationAlignment } from "./stationRegistration";
import summary from "../data/plateau-buildings-summary.json";

export type PlateauBuildingMeshes = ReadonlyMap<string, BufferGeometry>;

/** Shared metric mesh, displayed relative to the existing comparison plane.
 * Diagram scale is uniform in all three axes; floor separation never scales buildings.
 */
export function plateauBuildingMatrix(frame: "diagram" | "map"): Matrix4 {
  const ground = summary.displayGroundEllipsoidM;
  if (frame === "map") return new Matrix4().makeTranslation(0, -ground, 0);
  const {a,b,tx,tz,scale} = stationAlignment;
  const d = a*a+b*b;
  return new Matrix4().set(
    a/d, 0, b/d, (-a*tx-b*tz)/d,
    0, 1/scale, 0, -ground/scale,
    -b/d, 0, a/d, (b*tx-a*tz)/d,
    0, 0, 0, 1,
  );
}

/** The caller owns/disposes this copy; the downloaded source cache is immutable. */
export function plateauBuildingGeometry(source: BufferGeometry, frame: "diagram" | "map") {
  const geometry = source.clone().applyMatrix4(plateauBuildingMatrix(frame));
  geometry.computeBoundingBox();
  return geometry;
}
