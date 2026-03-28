import { FloorRegion } from "@/types/station";

export const regionsB5: FloorRegion[] = [
  {
    id: "b5-platform-fukutoshin",
    type: "platform_area",
    railwayLine: "metro_fukutoshin",
    svgPath:
      "M 250 40 L 310 40 L 310 540 L 250 540 Z",
    label: "Fukutoshin Line Platform 1/2",
  },
  {
    id: "b5-platform-toyoko",
    type: "platform_area",
    railwayLine: "tokyu_toyoko",
    svgPath:
      "M 890 40 L 950 40 L 950 540 L 890 540 Z",
    label: "Toyoko Line Platform 3/4",
  },
  {
    id: "b5-concourse-center",
    type: "concourse",
    svgPath:
      "M 310 230 L 890 230 L 890 350 L 310 350 Z",
    label: "Connecting Concourse",
  },
  {
    id: "b5-concourse-north",
    type: "concourse",
    svgPath:
      "M 310 40 L 500 40 L 500 100 L 700 100 L 700 40 L 890 40 L 890 100 L 310 100 Z",
    label: "North Passage",
  },
  {
    id: "b5-concourse-south",
    type: "concourse",
    svgPath:
      "M 310 490 L 500 490 L 500 540 L 700 540 L 700 490 L 890 490 L 890 540 L 310 540 Z",
    label: "South Passage",
  },
];
