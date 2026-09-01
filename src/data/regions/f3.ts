import { FloorRegion } from "@/types/station";
import { capsuleH, rr } from "./path";

/**
 * 3F Ginza Line — OSM: E–W platform on the east side of JR (level 3).
 */
export const regionsF3: FloorRegion[] = [
  {
    id: "f3-ginza-trackbed-north",
    type: "track_bed",
    railwayLine: "metro_ginza",
    svgPath: rr(480, 48, 360, 12, 4),
    label: "",
  },
  {
    id: "f3-ginza-platform",
    type: "platform_area",
    railwayLine: "metro_ginza",
    svgPath: capsuleH(480, 62, 360, 56),
    label: "Ginza Line",
  },
  {
    id: "f3-ginza-trackbed-south",
    type: "track_bed",
    railwayLine: "metro_ginza",
    svgPath: rr(480, 120, 360, 12, 4),
    label: "",
  },
  {
    id: "f3-ginza-concourse",
    type: "concourse",
    svgPath: rr(520, 136, 280, 64, 12),
    label: "Ginza Concourse",
  },
  {
    id: "f3-central-exit",
    type: "concourse",
    svgPath: rr(560, 16, 180, 28, 10),
    label: "",
  },
];
