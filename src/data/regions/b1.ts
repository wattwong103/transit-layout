import { FloorRegion } from "@/types/station";

export const regionsB1: FloorRegion[] = [
  {
    id: "b1-central-concourse",
    type: "concourse",
    // L-shape: main rect (380,150)→(760,430), bottom notch (480,430)→(640,490)
    svgPath:
      "M 388 150 L 752 150 Q 760 150 760 158 L 760 422 Q 760 430 752 430 L 648 430 Q 640 430 640 438 L 640 482 Q 640 490 632 490 L 488 490 Q 480 490 480 482 L 480 438 Q 480 430 472 430 L 388 430 Q 380 430 380 422 L 380 158 Q 380 150 388 150 Z",
    label: "Central Concourse",
  },
  {
    id: "b1-west-passage",
    type: "concourse",
    // Simple rect (60,240)→(270,370)
    svgPath:
      "M 68 240 L 262 240 Q 270 240 270 248 L 270 362 Q 270 370 262 370 L 68 370 Q 60 370 60 362 L 60 248 Q 60 240 68 240 Z",
    label: "West Passage (Hachiko)",
  },
  {
    id: "b1-east-passage",
    type: "concourse",
    // Simple rect (930,240)→(1140,370)
    svgPath:
      "M 938 240 L 1132 240 Q 1140 240 1140 248 L 1140 362 Q 1140 370 1132 370 L 938 370 Q 930 370 930 362 L 930 248 Q 930 240 938 240 Z",
    label: "East Passage (Hikarie)",
  },
  {
    id: "b1-commercial",
    type: "commercial",
    // Simple rect (340,40)→(860,140)
    svgPath:
      "M 348 40 L 852 40 Q 860 40 860 48 L 860 132 Q 860 140 852 140 L 348 140 Q 340 140 340 132 L 340 48 Q 340 40 348 40 Z",
    label: "Shibuya Chikamichi (Shops)",
  },
  {
    id: "b1-connection-down",
    type: "concourse",
    // Simple rect (460,510)→(660,570)
    svgPath:
      "M 468 510 L 652 510 Q 660 510 660 518 L 660 562 Q 660 570 652 570 L 468 570 Q 460 570 460 562 L 460 518 Q 460 510 468 510 Z",
    label: "↓B2",
  },
];
