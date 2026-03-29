import { FloorRegion } from "@/types/station";

export const regionsF2: FloorRegion[] = [
  {
    id: "f2-yamanote-platform",
    type: "platform_area",
    railwayLine: "jr_yamanote",
    svgPath:
      "M 200 80 L 1000 80 L 1000 170 L 200 170 Z",
    label: "JR Yamanote Line Platforms 1/2",
  },
  {
    id: "f2-jr-central-concourse",
    type: "concourse",
    svgPath:
      "M 250 180 L 950 180 L 950 350 L 250 350 Z",
    label: "JR Central Concourse",
  },
  {
    id: "f2-saikyo-platform",
    type: "platform_area",
    railwayLine: "jr_saikyo",
    svgPath:
      "M 200 360 L 1000 360 L 1000 450 L 200 450 Z",
    label: "JR Saikyo / Shonan-Shinjuku Line Platforms 3/4",
  },
  {
    id: "f2-keio-inokashira-platform",
    type: "platform_area",
    railwayLine: "keio_inokashira",
    svgPath:
      "M 40 80 L 240 80 L 240 280 L 40 280 Z",
    label: "Keio Inokashira Line Platform (Mark City)",
  },
  {
    id: "f2-escalator-stairs-north",
    type: "concourse",
    svgPath:
      "M 400 30 L 800 30 L 800 70 L 400 70 Z",
    label: "Escalators / Stairs (to 3F)",
  },
  {
    id: "f2-escalator-stairs-south",
    type: "concourse",
    svgPath:
      "M 400 460 L 800 460 L 800 540 L 400 540 Z",
    label: "Escalators / Stairs (to 1F)",
  },
  {
    id: "f2-connection-hikarie",
    type: "concourse",
    svgPath:
      "M 960 180 L 1170 180 L 1170 340 L 960 340 Z",
    label: "Hikarie Connecting Passage",
  },
];
