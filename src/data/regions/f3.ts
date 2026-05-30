import { FloorRegion } from "@/types/station";

export const regionsF3: FloorRegion[] = [
  {
    id: "f3-ginza-trackbed-north",
    type: "track_bed",
    railwayLine: "metro_ginza",
    svgPath:
      "M 563 138 L 1087 138 Q 1090 138 1090 141 L 1090 142 Q 1090 145 1087 145 L 563 145 Q 560 145 560 142 L 560 141 Q 560 138 563 138 Z",
    label: "",
  },
  {
    id: "f3-ginza-platform",
    type: "platform_area",
    railwayLine: "metro_ginza",
    svgPath:
      "M 568 150 Q 560 150 560 158 L 560 222 Q 560 230 568 230 L 1082 230 Q 1090 230 1090 222 L 1090 158 Q 1090 150 1082 150 Z",
    label: "Ginza Line Platform",
  },
  {
    id: "f3-ginza-trackbed-south",
    type: "track_bed",
    railwayLine: "metro_ginza",
    svgPath:
      "M 563 235 L 1087 235 Q 1090 235 1090 238 L 1090 239 Q 1090 242 1087 242 L 563 242 Q 560 242 560 239 L 560 238 Q 560 235 563 235 Z",
    label: "",
  },
  {
    id: "f3-ginza-concourse",
    type: "concourse",
    svgPath:
      "M 568 250 L 852 250 Q 860 250 860 258 L 860 352 Q 860 360 852 360 L 708 360 Q 700 360 700 368 L 700 372 Q 700 380 692 380 L 608 380 Q 600 380 600 372 L 600 368 Q 600 360 592 360 L 568 360 Q 560 360 560 352 L 560 258 Q 560 250 568 250 Z",
    label: "Ginza Line Concourse",
  },
  {
    id: "f3-central-exit",
    type: "concourse",
    svgPath:
      "M 568 70 L 692 70 Q 700 70 700 78 L 700 132 Q 700 140 692 140 L 568 140 Q 560 140 560 132 L 560 78 Q 560 70 568 70 Z",
    label: "Central Exit",
  },
  {
    id: "f3-escalator-west",
    type: "concourse",
    svgPath:
      "M 518 380 L 592 380 Q 600 380 600 388 L 600 432 Q 600 440 592 440 L 518 440 Q 510 440 510 432 L 510 388 Q 510 380 518 380 Z",
    label: "Escalators ↓2F",
  },
  {
    id: "f3-escalator-east",
    type: "concourse",
    svgPath:
      "M 708 380 L 792 380 Q 800 380 800 388 L 800 432 Q 800 440 792 440 L 708 440 Q 700 440 700 432 L 700 388 Q 700 380 708 380 Z",
    label: "Stairs ↓2F",
  },
];
