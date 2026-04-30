import { FloorRegion } from "@/types/station";

export const regionsF2: FloorRegion[] = [
  {
    id: "f2-yamanote-platform",
    type: "platform_area",
    railwayLine: "jr_yamanote",
    svgPath:
      "M 280 95 L 310 80 L 890 80 L 920 95 L 920 155 L 890 170 L 310 170 L 280 155 Z",
    label: "JR Yamanote Line Platforms 1–2",
  },
  {
    id: "f2-jr-concourse",
    type: "concourse",
    svgPath:
      "M 300 185 L 900 185 L 900 370 L 300 370 Z",
    label: "JR Central Concourse",
  },
  {
    id: "f2-saikyo-platform",
    type: "platform_area",
    railwayLine: "jr_saikyo",
    svgPath:
      "M 280 385 L 310 370 L 890 370 L 920 385 L 920 445 L 890 460 L 310 460 L 280 445 Z",
    label: "JR Saikyo / Shonan-Shinjuku Platforms 3–4",
  },
  {
    id: "f2-keio-inokashira",
    type: "platform_area",
    railwayLine: "keio_inokashira",
    svgPath:
      "M 40 170 L 220 170 L 240 190 L 240 360 L 220 380 L 40 380 Z",
    label: "Keio Inokashira Line",
  },
  {
    id: "f2-new-south-exit",
    type: "concourse",
    svgPath:
      "M 750 470 L 960 470 L 980 490 L 980 550 L 750 550 Z",
    label: "New South Exit",
  },
  {
    id: "f2-hikarie-passage",
    type: "concourse",
    svgPath:
      "M 930 220 L 1150 220 L 1150 340 L 930 340 Z",
    label: "Hikarie Passage",
  },
  {
    id: "f2-escalator-up",
    type: "concourse",
    svgPath:
      "M 380 30 L 530 30 L 530 70 L 380 70 Z",
    label: "↑3F",
  },
  {
    id: "f2-escalator-down",
    type: "concourse",
    svgPath:
      "M 380 470 L 530 470 L 530 530 L 380 530 Z",
    label: "↓1F",
  },
];
