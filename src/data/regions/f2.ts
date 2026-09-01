import { FloorRegion } from "@/types/station";
import { capsuleV, rr } from "./path";

/**
 * 2F — OSM/Google: JR Yamanote + Saikyo run N–S through the station.
 * Keio Inokashira is west of JR; Hikarie passage is east.
 */
export const regionsF2: FloorRegion[] = [
  {
    id: "f2-keio-trackbed-left",
    type: "track_bed",
    railwayLine: "keio_inokashira",
    svgPath: rr(48, 70, 12, 280, 4),
    label: "",
  },
  {
    id: "f2-keio-inokashira",
    type: "platform_area",
    railwayLine: "keio_inokashira",
    svgPath: capsuleV(62, 70, 64, 280),
    label: "Keio Inokashira",
  },
  {
    id: "f2-keio-trackbed-right",
    type: "track_bed",
    railwayLine: "keio_inokashira",
    svgPath: rr(128, 70, 12, 280, 4),
    label: "",
  },
  {
    id: "f2-tamagawa-corridor",
    type: "concourse",
    svgPath: rr(148, 170, 70, 80, 10),
    label: "Tamagawa Gate",
  },
  {
    id: "f2-yamanote-trackbed-north",
    type: "track_bed",
    railwayLine: "jr_yamanote",
    svgPath: rr(268, 50, 12, 360, 4),
    label: "",
  },
  {
    id: "f2-yamanote-platform",
    type: "platform_area",
    railwayLine: "jr_yamanote",
    svgPath: capsuleV(282, 50, 70, 360),
    label: "JR Yamanote 1–2",
  },
  {
    id: "f2-yamanote-trackbed-south",
    type: "track_bed",
    railwayLine: "jr_yamanote",
    svgPath: rr(354, 50, 12, 360, 4),
    label: "",
  },
  {
    id: "f2-jr-concourse",
    type: "concourse",
    svgPath: rr(370, 110, 70, 240, 12),
    label: "JR Central Concourse",
  },
  {
    id: "f2-saikyo-trackbed-north",
    type: "track_bed",
    railwayLine: "jr_saikyo",
    svgPath: rr(444, 50, 12, 360, 4),
    label: "",
  },
  {
    id: "f2-saikyo-platform",
    type: "platform_area",
    railwayLine: "jr_saikyo",
    svgPath: capsuleV(458, 50, 70, 360),
    label: "JR Saikyo / Shonan-Shinjuku 3–4",
  },
  {
    id: "f2-saikyo-trackbed-south",
    type: "track_bed",
    railwayLine: "jr_saikyo",
    svgPath: rr(530, 50, 12, 360, 4),
    label: "",
  },
  {
    id: "f2-south-gate",
    type: "concourse",
    svgPath: rr(360, 420, 160, 50, 10),
    label: "",
  },
  {
    id: "f2-new-south-exit",
    type: "concourse",
    svgPath: rr(148, 360, 110, 50, 10),
    label: "",
  },
  {
    id: "f2-hikarie-passage",
    type: "concourse",
    svgPath: rr(560, 140, 160, 90, 12),
    label: "Hikarie Passage",
  },
];
