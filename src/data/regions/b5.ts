import { FloorRegion } from "@/types/station";

export const regionsB5: FloorRegion[] = [
  // ── Track bed (left of Fukutoshin platform) ──
  {
    id: "b5-fukutoshin-trackbed-left",
    type: "track_bed",
    railwayLine: "metro_fukutoshin",
    svgPath:
      "M 180 55 Q 180 50 185 50 L 190 50 Q 195 50 195 55 L 195 545 Q 195 550 190 550 L 185 550 Q 180 550 180 545 Z",
    label: "",
  },
  // ── Track bed (right of Fukutoshin platform) ──
  {
    id: "b5-fukutoshin-trackbed-right",
    type: "track_bed",
    railwayLine: "metro_fukutoshin",
    svgPath:
      "M 345 55 Q 345 50 350 50 L 355 50 Q 360 50 360 55 L 360 545 Q 360 550 355 550 L 350 550 Q 345 550 345 545 Z",
    label: "",
  },
  {
    id: "b5-fukutoshin-platform",
    type: "platform_area",
    railwayLine: "metro_fukutoshin",
    // Original octagon: (200,70) (230,50) (310,50) (340,70) (340,530) (310,550) (230,550) (200,530)
    svgPath:
      "M 200 78 Q 200 70 207 66 L 223 54 Q 230 50 238 50 L 302 50 Q 310 50 317 54 L 333 66 Q 340 70 340 78 L 340 522 Q 340 530 333 534 L 317 546 Q 310 550 302 550 L 238 550 Q 230 550 223 546 L 207 534 Q 200 530 200 522 Z",
    label: "Fukutoshin Line",
  },
  // ── Track bed (left of Toyoko platform) ──
  {
    id: "b5-toyoko-trackbed-left",
    type: "track_bed",
    railwayLine: "tokyu_toyoko",
    svgPath:
      "M 840 55 Q 840 50 845 50 L 850 50 Q 855 50 855 55 L 855 545 Q 855 550 850 550 L 845 550 Q 840 550 840 545 Z",
    label: "",
  },
  // ── Track bed (right of Toyoko platform) ──
  {
    id: "b5-toyoko-trackbed-right",
    type: "track_bed",
    railwayLine: "tokyu_toyoko",
    svgPath:
      "M 1005 55 Q 1005 50 1010 50 L 1015 50 Q 1020 50 1020 55 L 1020 545 Q 1020 550 1015 550 L 1010 550 Q 1005 550 1005 545 Z",
    label: "",
  },
  {
    id: "b5-toyoko-platform",
    type: "platform_area",
    railwayLine: "tokyu_toyoko",
    // Original octagon: (860,70) (890,50) (970,50) (1000,70) (1000,530) (970,550) (890,550) (860,530)
    svgPath:
      "M 860 78 Q 860 70 867 66 L 883 54 Q 890 50 898 50 L 962 50 Q 970 50 977 54 L 993 66 Q 1000 70 1000 78 L 1000 522 Q 1000 530 993 534 L 977 546 Q 970 550 962 550 L 898 550 Q 890 550 883 546 L 867 534 Q 860 530 860 522 Z",
    label: "Toyoko Line",
  },
  {
    id: "b5-central-concourse",
    type: "concourse",
    // Original: M 350 230 L 850 230 L 850 380 L 350 380 Z
    svgPath:
      "M 350 238 Q 350 230 358 230 L 842 230 Q 850 230 850 238 L 850 372 Q 850 380 842 380 L 358 380 Q 350 380 350 372 Z",
    label: "Connecting Concourse",
  },
  {
    id: "b5-north-passage",
    type: "concourse",
    // Original: M 350 60 L 850 60 L 850 220 L 350 220 Z
    svgPath:
      "M 350 68 Q 350 60 358 60 L 842 60 Q 850 60 850 68 L 850 212 Q 850 220 842 220 L 358 220 Q 350 220 350 212 Z",
    label: "North Passage",
  },
  {
    id: "b5-south-passage",
    type: "concourse",
    // Original: M 350 390 L 850 390 L 850 540 L 350 540 Z
    svgPath:
      "M 350 398 Q 350 390 358 390 L 842 390 Q 850 390 850 398 L 850 532 Q 850 540 842 540 L 358 540 Q 350 540 350 532 Z",
    label: "South Passage",
  },
];
