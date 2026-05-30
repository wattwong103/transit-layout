import { FloorRegion } from "@/types/station";

export const regionsB3: FloorRegion[] = [
  // ── Track bed (left of Hanzomon platform) ──
  {
    id: "b3-hanzomon-trackbed-left",
    type: "track_bed",
    railwayLine: "metro_hanzomon",
    svgPath:
      "M 110 55 Q 110 50 115 50 L 120 50 Q 125 50 125 55 L 125 545 Q 125 550 120 550 L 115 550 Q 110 550 110 545 Z",
    label: "",
  },
  // ── Track bed (right of Hanzomon platform) ──
  {
    id: "b3-hanzomon-trackbed-right",
    type: "track_bed",
    railwayLine: "metro_hanzomon",
    svgPath:
      "M 255 55 Q 255 50 260 50 L 265 50 Q 270 50 270 55 L 270 545 Q 270 550 265 550 L 260 550 Q 255 550 255 545 Z",
    label: "",
  },
  {
    id: "b3-hanzomon-platform",
    type: "platform_area",
    railwayLine: "metro_hanzomon",
    // Original octagon: (130,70) (160,50) (220,50) (250,70) (250,530) (220,550) (160,550) (130,530)
    // Rounded with 8px radius at each vertex
    svgPath:
      "M 130 78 Q 130 70 137 66 L 153 54 Q 160 50 168 50 L 212 50 Q 220 50 227 54 L 243 66 Q 250 70 250 78 L 250 522 Q 250 530 243 534 L 227 546 Q 220 550 212 550 L 168 550 Q 160 550 153 546 L 137 534 Q 130 530 130 522 Z",
    label: "Hanzomon Line",
  },
  // ── Track bed (left of Den-en-toshi platform) ──
  {
    id: "b3-dento-trackbed-left",
    type: "track_bed",
    railwayLine: "tokyu_den_en_toshi",
    svgPath:
      "M 930 55 Q 930 50 935 50 L 940 50 Q 945 50 945 55 L 945 545 Q 945 550 940 550 L 935 550 Q 930 550 930 545 Z",
    label: "",
  },
  // ── Track bed (right of Den-en-toshi platform) ──
  {
    id: "b3-dento-trackbed-right",
    type: "track_bed",
    railwayLine: "tokyu_den_en_toshi",
    svgPath:
      "M 1075 55 Q 1075 50 1080 50 L 1085 50 Q 1090 50 1090 55 L 1090 545 Q 1090 550 1085 550 L 1080 550 Q 1075 550 1075 545 Z",
    label: "",
  },
  {
    id: "b3-dento-platform",
    type: "platform_area",
    railwayLine: "tokyu_den_en_toshi",
    // Original octagon: (950,70) (980,50) (1040,50) (1070,70) (1070,530) (1040,550) (980,550) (950,530)
    svgPath:
      "M 950 78 Q 950 70 957 66 L 973 54 Q 980 50 988 50 L 1032 50 Q 1040 50 1047 54 L 1063 66 Q 1070 70 1070 78 L 1070 522 Q 1070 530 1063 534 L 1047 546 Q 1040 550 1032 550 L 988 550 Q 980 550 973 546 L 957 534 Q 950 530 950 522 Z",
    label: "Den-en-toshi Line",
  },
  {
    id: "b3-central-concourse",
    type: "concourse",
    // Original: M 260 210 L 940 210 L 940 390 L 640 390 L 640 460 L 500 460 L 500 390 L 260 390 Z
    svgPath:
      "M 260 218 Q 260 210 268 210 L 932 210 Q 940 210 940 218 L 940 382 Q 940 390 932 390 L 648 390 Q 640 390 640 398 L 640 452 Q 640 460 632 460 L 508 460 Q 500 460 500 452 L 500 398 Q 500 390 492 390 L 268 390 Q 260 390 260 382 Z",
    label: "Central Concourse",
  },
  {
    id: "b3-north-bridge",
    type: "concourse",
    // Original: M 260 80 L 940 80 L 940 200 L 260 200 Z
    svgPath:
      "M 260 88 Q 260 80 268 80 L 932 80 Q 940 80 940 88 L 940 192 Q 940 200 932 200 L 268 200 Q 260 200 260 192 Z",
    label: "North Passage",
  },
  {
    id: "b3-south-bridge",
    type: "concourse",
    // Original: M 260 400 L 490 400 L 490 470 L 640 470 L 640 400 L 940 400 L 940 540 L 260 540 Z
    // U-shape: goes right along top, drops into notch, comes back up, continues right, then down and across bottom
    svgPath:
      "M 260 408 Q 260 400 268 400 L 482 400 Q 490 400 490 408 L 490 462 Q 490 470 498 470 L 632 470 Q 640 470 640 462 L 640 408 Q 640 400 648 400 L 932 400 Q 940 400 940 408 L 940 532 Q 940 540 932 540 L 268 540 Q 260 540 260 532 Z",
    label: "South Passage",
  },
];
