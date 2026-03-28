import { FloorRegion } from "@/types/station";

export const regionsB3: FloorRegion[] = [
  {
    id: "b3-platform-hanzomon",
    type: "platform_area",
    railwayLine: "metro_hanzomon",
    svgPath:
      "M 150 50 L 210 50 L 210 530 L 150 530 Z",
    label: "Hanzomon Line Platform 1/2",
  },
  {
    id: "b3-platform-den-en-toshi",
    type: "platform_area",
    railwayLine: "tokyu_den_en_toshi",
    svgPath:
      "M 990 50 L 1050 50 L 1050 530 L 990 530 Z",
    label: "Den-en-toshi Line Platform 3/4",
  },
  {
    id: "b3-concourse-central",
    type: "concourse",
    svgPath:
      "M 210 200 L 990 200 L 990 380 L 210 380 Z",
    label: "Central Concourse",
  },
  {
    id: "b3-concourse-north-link",
    type: "concourse",
    svgPath:
      "M 210 50 L 450 50 L 450 120 L 750 120 L 750 50 L 990 50 L 990 120 L 210 120 Z",
    label: "North Connecting Passage",
  },
  {
    id: "b3-concourse-south-link",
    type: "concourse",
    svgPath:
      "M 210 460 L 450 460 L 450 530 L 750 530 L 750 460 L 990 460 L 990 530 L 210 530 Z",
    label: "South Connecting Passage",
  },
];
