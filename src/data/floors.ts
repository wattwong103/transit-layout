import { FloorPlan } from "@/types/station";
import { regionsB5 } from "./regions/b5";
import { regionsB4 } from "./regions/b4";
import { regionsB3 } from "./regions/b3";
import { regionsB2 } from "./regions/b2";
import { regionsB1 } from "./regions/b1";
import { regionsF1 } from "./regions/f1";
import { regionsF2 } from "./regions/f2";
import { regionsF3 } from "./regions/f3";

export const floors: FloorPlan[] = [
  {
    floor: "3F",
    label: "3F — JR Platforms (Yamanote, Saikyo)",
    elevation: 3,
    svgViewBox: "0 0 1200 600",
    regions: regionsF3,
  },
  {
    floor: "2F",
    label: "2F — JR Concourse / Keio Inokashira",
    elevation: 2,
    svgViewBox: "0 0 1200 600",
    regions: regionsF2,
  },
  {
    floor: "1F",
    label: "1F — Ground Level / Main Exits",
    elevation: 1,
    svgViewBox: "0 0 1200 600",
    regions: regionsF1,
  },
  {
    floor: "B1",
    label: "B1 — Underground Concourse",
    elevation: -1,
    svgViewBox: "0 0 1200 600",
    regions: regionsB1,
  },
  {
    floor: "B2",
    label: "B2 — Ginza Line / Hanzomon Concourse",
    elevation: -2,
    svgViewBox: "0 0 1200 600",
    regions: regionsB2,
  },
  {
    floor: "B3",
    label: "B3 — Hanzomon / Den-en-toshi Platforms",
    elevation: -3,
    svgViewBox: "0 0 1200 600",
    regions: regionsB3,
  },
  {
    floor: "B4",
    label: "B4 — Fukutoshin / Toyoko Concourse",
    elevation: -4,
    svgViewBox: "0 0 1200 600",
    regions: regionsB4,
  },
  {
    floor: "B5",
    label: "B5 — Fukutoshin / Toyoko Platforms",
    elevation: -5,
    svgViewBox: "0 0 1200 600",
    regions: regionsB5,
  },
];

export function getFloorPlan(floorId: string): FloorPlan | undefined {
  return floors.find((f) => f.floor === floorId);
}
