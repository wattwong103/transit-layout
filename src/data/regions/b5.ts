import { FloorRegion } from "@/types/station";

export const regionsB5: FloorRegion[] = [
  {
    id: "b5-fukutoshin-platform",
    type: "platform_area",
    railwayLine: "metro_fukutoshin",
    svgPath:
      "M 200 70 L 230 50 L 310 50 L 340 70 L 340 530 L 310 550 L 230 550 L 200 530 Z",
    label: "Fukutoshin Line",
  },
  {
    id: "b5-toyoko-platform",
    type: "platform_area",
    railwayLine: "tokyu_toyoko",
    svgPath:
      "M 860 70 L 890 50 L 970 50 L 1000 70 L 1000 530 L 970 550 L 890 550 L 860 530 Z",
    label: "Toyoko Line",
  },
  {
    id: "b5-central-concourse",
    type: "concourse",
    svgPath:
      "M 350 230 L 850 230 L 850 380 L 350 380 Z",
    label: "Connecting Concourse",
  },
  {
    id: "b5-north-passage",
    type: "concourse",
    svgPath:
      "M 350 60 L 850 60 L 850 220 L 350 220 Z",
    label: "North Passage",
  },
  {
    id: "b5-south-passage",
    type: "concourse",
    svgPath:
      "M 350 390 L 850 390 L 850 540 L 350 540 Z",
    label: "South Passage",
  },
];
