import type { Point2 } from "./explorer";

export interface CityBuilding {
  id: string;
  /** Polygons, each containing an outer ring followed by hole rings. */
  parts: Point2[][][];
  base: number;
  top: number;
  explorerId?: string;
  label?: string;
}
export interface CompactCity {
  version: number;
  originWgs84: number[];
  displayGroundEllipsoidM: number;
  areaMeters: number[];
  buildings: CityBuilding[];
}
