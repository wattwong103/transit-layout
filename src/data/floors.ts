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
    label: "3F — Ginza Line / Central Exit",
    elevation: 3,
    svgViewBox: "450 0 420 230",
    regions: regionsF3,
  },
  {
    floor: "2F",
    label: "2F — JR Platforms / Keio Inokashira",
    elevation: 2,
    svgViewBox: "30 30 720 460",
    regions: regionsF2,
  },
  {
    floor: "1F",
    label: "1F — Ground Level / Main Exits",
    elevation: 1,
    svgViewBox: "20 20 680 420",
    regions: regionsF1,
  },
  {
    floor: "B1",
    label: "B1 — Underground Concourse",
    elevation: -1,
    svgViewBox: "20 30 1100 400",
    regions: regionsB1,
  },
  {
    floor: "B2",
    label: "B2 — Hanzomon / Den-en-toshi Concourse",
    elevation: -2,
    svgViewBox: "20 20 1100 860",
    regions: regionsB2,
  },
  {
    floor: "B3",
    label: "B3 — Hanzomon / Den-en-toshi Platforms",
    elevation: -3,
    svgViewBox: "20 250 1040 180",
    regions: regionsB3,
  },
  {
    floor: "B4",
    label: "B4 — Fukutoshin / Toyoko Concourse",
    elevation: -4,
    svgViewBox: "700 20 420 850",
    regions: regionsB4,
  },
  {
    floor: "B5",
    label: "B5 — Fukutoshin / Toyoko Platforms",
    elevation: -5,
    svgViewBox: "1040 20 310 860",
    regions: regionsB5,
  },
];

export function getFloorPlan(floorId: string): FloorPlan | undefined {
  return floors.find((f) => f.floor === floorId);
}
