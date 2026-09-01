import { FloorRegion } from "@/types/station";
import { capsuleH, rr } from "./path";

/**
 * B3 — one long island (Hanzomon / Den-en-toshi through service),
 * on the west–east arm, per Tokyu 平面図3.
 */
export const regionsB3: FloorRegion[] = [
  {
    id: "b3-hanzomon-trackbed-left",
    type: "track_bed",
    railwayLine: "metro_hanzomon",
    svgPath: rr(50, 302, 820, 12, 4),
    label: "",
  },
  {
    id: "b3-hanzomon-platform",
    type: "platform_area",
    railwayLine: "metro_hanzomon",
    svgPath: capsuleH(50, 316, 400, 56),
    label: "Hanzomon Line",
  },
  {
    id: "b3-dento-platform",
    type: "platform_area",
    railwayLine: "tokyu_den_en_toshi",
    svgPath: capsuleH(460, 316, 410, 56),
    label: "Den-en-toshi Line",
  },
  {
    id: "b3-hanzomon-trackbed-right",
    type: "track_bed",
    railwayLine: "metro_hanzomon",
    svgPath: rr(50, 374, 820, 12, 4),
    label: "",
  },
  {
    id: "b3-central-concourse",
    type: "concourse",
    svgPath: rr(860, 300, 160, 90, 12),
    label: "Transfer",
  },
];
