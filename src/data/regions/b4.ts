import { FloorRegion } from "@/types/station";
import { rr } from "./path";

/**
 * B4 — Hikarie vertical shaft + west stub to B3, per Tokyu 平面図4.
 */
export const regionsB4: FloorRegion[] = [
  {
    id: "b4-concourse",
    type: "concourse",
    svgPath: rr(880, 48, 180, 800, 16),
    label: "B4 Hikarie Shaft",
  },
  {
    id: "b4-connection-down",
    type: "concourse",
    svgPath: rr(720, 300, 170, 80, 12),
    label: "← B3",
  },
];
