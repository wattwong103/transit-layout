import { FloorRegion } from "@/types/station";

export const regionsB3: FloorRegion[] = [
  {
    id: "b3-hanzomon-platform",
    type: "platform_area",
    railwayLine: "metro_hanzomon",
    svgPath:
      "M 130 70 L 160 50 L 220 50 L 250 70 L 250 530 L 220 550 L 160 550 L 130 530 Z",
    label: "Hanzomon Line",
  },
  {
    id: "b3-dento-platform",
    type: "platform_area",
    railwayLine: "tokyu_den_en_toshi",
    svgPath:
      "M 950 70 L 980 50 L 1040 50 L 1070 70 L 1070 530 L 1040 550 L 980 550 L 950 530 Z",
    label: "Den-en-toshi Line",
  },
  {
    id: "b3-central-concourse",
    type: "concourse",
    svgPath:
      "M 260 210 L 940 210 L 940 390 L 640 390 L 640 460 L 500 460 L 500 390 L 260 390 Z",
    label: "Central Concourse",
  },
  {
    id: "b3-north-bridge",
    type: "concourse",
    svgPath:
      "M 260 80 L 940 80 L 940 200 L 260 200 Z",
    label: "North Passage",
  },
  {
    id: "b3-south-bridge",
    type: "concourse",
    svgPath:
      "M 260 400 L 490 400 L 490 470 L 640 470 L 640 400 L 940 400 L 940 540 L 260 540 Z",
    label: "South Passage",
  },
];
