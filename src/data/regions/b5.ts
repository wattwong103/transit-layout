import { FloorRegion } from "@/types/station";
import { capsuleV, rr } from "./path";

/**
 * B5 — two long north–south islands (Fukutoshin 5–6, Toyoko 3–4)
 * on the Hikarie/east side, per Tokyu 平面図4.
 */
export const regionsB5: FloorRegion[] = [
  {
    id: "b5-fukutoshin-trackbed-left",
    type: "track_bed",
    railwayLine: "metro_fukutoshin",
    svgPath: rr(1072, 50, 12, 800, 4),
    label: "",
  },
  {
    id: "b5-fukutoshin-platform",
    type: "platform_area",
    railwayLine: "metro_fukutoshin",
    svgPath: capsuleV(1088, 50, 70, 800),
    label: "Fukutoshin 5–6",
  },
  {
    id: "b5-fukutoshin-trackbed-right",
    type: "track_bed",
    railwayLine: "metro_fukutoshin",
    svgPath: rr(1160, 50, 12, 800, 4),
    label: "",
  },
  {
    id: "b5-toyoko-trackbed-left",
    type: "track_bed",
    railwayLine: "tokyu_toyoko",
    svgPath: rr(1212, 50, 12, 800, 4),
    label: "",
  },
  {
    id: "b5-toyoko-platform",
    type: "platform_area",
    railwayLine: "tokyu_toyoko",
    svgPath: capsuleV(1228, 50, 70, 800),
    label: "Toyoko 3–4",
  },
  {
    id: "b5-toyoko-trackbed-right",
    type: "track_bed",
    railwayLine: "tokyu_toyoko",
    svgPath: rr(1300, 50, 12, 800, 4),
    label: "",
  },
];
