import { FloorRegion } from "@/types/station";
import { rr } from "./path";

/**
 * B1 — two pieces, as on the Tokyu 平面図:
 * west ちかみち (A0–A8) and east Miyamasuzaka box (B2–B4).
 */
export const regionsB1: FloorRegion[] = [
  {
    id: "b1-west-passage",
    type: "concourse",
    svgPath: rr(40, 268, 200, 88, 12),
    label: "",
  },
  {
    id: "b1-commercial",
    type: "commercial",
    svgPath: rr(250, 255, 280, 50, 10),
    label: "Shibuya Chikamichi",
  },
  {
    id: "b1-central-concourse",
    type: "concourse",
    svgPath: rr(240, 300, 600, 90, 12),
    label: "B1 Concourse",
  },
  {
    id: "b1-east-passage",
    type: "concourse",
    svgPath: rr(860, 48, 220, 180, 14),
    label: "Miyamasuzaka B1",
  },
];
