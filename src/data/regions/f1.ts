import { FloorRegion } from "@/types/station";
import { rr } from "./path";

/**
 * 1F ground — OSM/Google: Hachiko + scramble west of the N–S JR spine,
 * Miyamasuzaka / Hikarie east.
 */
export const regionsF1: FloorRegion[] = [
  {
    id: "f1-hachiko-corridor",
    type: "concourse",
    svgPath: rr(40, 160, 200, 160, 14),
    label: "",
  },
  {
    id: "f1-jr-ticket-gate",
    type: "concourse",
    svgPath: rr(260, 80, 200, 300, 14),
    label: "JR Ticket Gate Area",
  },
  {
    id: "f1-miyamasuzaka-corridor",
    type: "concourse",
    svgPath: rr(480, 120, 180, 180, 14),
    label: "",
  },
  {
    id: "f1-scramble-sq",
    type: "commercial",
    svgPath: rr(40, 40, 160, 100, 12),
    label: "Scramble Square",
  },
  {
    id: "f1-bus-terminal",
    type: "outside",
    svgPath: rr(40, 340, 180, 70, 12),
    label: "Bus Terminal (West)",
  },
];
