import { FloorRegion } from "@/types/station";

export const regionsF3: FloorRegion[] = [
  {
    id: "f3-ginza-trackbed-north",
    type: "track_bed",
    railwayLine: "metro_ginza",
    svgPath:
      "M 380 145 Q 380 140 385 140 L 875 140 Q 880 140 880 145 L 880 150 Q 880 155 875 155 L 385 155 Q 380 155 380 150 Z",
    label: "",
  },
  {
    id: "f3-ginza-platform",
    type: "platform_area",
    railwayLine: "metro_ginza",
    svgPath:
      "M 380 183 Q 380 175 387 171 L 403 164 Q 410 160 418 160 L 842 160 Q 850 160 857 164 L 873 171 Q 880 175 880 183 L 880 227 Q 880 235 873 239 L 857 246 Q 850 250 842 250 L 418 250 Q 410 250 403 246 L 387 239 Q 380 235 380 227 Z",
    label: "Ginza Line Platform",
  },
  {
    id: "f3-ginza-trackbed-south",
    type: "track_bed",
    railwayLine: "metro_ginza",
    svgPath:
      "M 380 260 Q 380 255 385 255 L 875 255 Q 880 255 880 260 L 880 265 Q 880 270 875 270 L 385 270 Q 380 270 380 265 Z",
    label: "",
  },
  {
    id: "f3-ginza-concourse",
    type: "concourse",
    svgPath:
      "M 420 273 Q 420 265 428 265 L 832 265 Q 840 265 840 273 L 840 372 Q 840 380 832 380 L 708 380 Q 700 380 700 388 L 700 422 Q 700 430 692 430 L 568 430 Q 560 430 560 422 L 560 388 Q 560 380 552 380 L 428 380 Q 420 380 420 372 Z",
    label: "Ginza Line Concourse",
  },
  {
    id: "f3-central-exit",
    type: "concourse",
    svgPath:
      "M 498 68 Q 500 60 508 60 L 722 60 Q 730 60 736 66 L 744 74 Q 750 80 750 88 L 750 142 Q 750 150 742 150 L 508 150 Q 500 150 494 144 L 486 136 Q 480 130 482 122 Z",
    label: "Central Exit",
  },
  {
    id: "f3-escalator-west",
    type: "concourse",
    svgPath:
      "M 400 448 Q 400 440 408 440 L 542 440 Q 550 440 550 448 L 550 502 Q 550 510 542 510 L 408 510 Q 400 510 400 502 Z",
    label: "Escalators ↓2F",
  },
  {
    id: "f3-escalator-east",
    type: "concourse",
    svgPath:
      "M 710 448 Q 710 440 718 440 L 852 440 Q 860 440 860 448 L 860 502 Q 860 510 852 510 L 718 510 Q 710 510 710 502 Z",
    label: "Stairs ↓2F",
  },
];
