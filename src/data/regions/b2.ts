import { FloorRegion } from "@/types/station";
import { lPath, rr } from "./path";

/**
 * B2 — the station's L: west–east Hachiko/Dogenzaka arm +
 * north–south Miyamasuzaka/Hikarie shaft. Matches Tokyu 平面図2.
 */
export const regionsB2: FloorRegion[] = [
  {
    id: "b2-concourse",
    type: "concourse",
    svgPath: lPath(40, 278, 820, 138, 860, 40, 220, 820, 14),
    label: "B2 Concourse",
  },
  {
    id: "b2-ticket-gate",
    type: "concourse",
    svgPath: rr(200, 292, 520, 36, 8),
    label: "Hachiko / Dogenzaka Gates",
  },
  {
    id: "b2-east-corridor",
    type: "concourse",
    svgPath: rr(888, 200, 164, 36, 8),
    label: "Miyamasuzaka Gates",
  },
];
