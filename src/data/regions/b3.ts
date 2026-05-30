import { FloorRegion } from "@/types/station";

export const regionsB3: FloorRegion[] = [
  // ── Track bed (north of Hanzomon platform) ──
  {
    id: "b3-hanzomon-trackbed-left",
    type: "track_bed",
    railwayLine: "metro_hanzomon",
    svgPath:
      "M 124 288 L 596 288 Q 600 288 600 291 L 600 292 Q 600 295 596 295 L 124 295 Q 120 295 120 292 L 120 291 Q 120 288 124 288 Z",
    label: "",
  },
  // ── Track bed (south of Hanzomon platform) ──
  {
    id: "b3-hanzomon-trackbed-right",
    type: "track_bed",
    railwayLine: "metro_hanzomon",
    svgPath:
      "M 124 383 L 596 383 Q 600 383 600 386 L 600 387 Q 600 390 596 390 L 124 390 Q 120 390 120 387 L 120 386 Q 120 383 124 383 Z",
    label: "",
  },
  {
    id: "b3-hanzomon-platform",
    type: "platform_area",
    railwayLine: "metro_hanzomon",
    // Beveled octagon: (120,310) (140,300) (580,300) (600,310) (600,370) (580,380) (140,380) (120,370)
    // Rounded with 8px radius at each vertex
    svgPath:
      "M 120 318 Q 120 310 127 306 L 133 302 Q 140 300 148 300 L 572 300 Q 580 300 587 304 L 593 308 Q 600 312 600 320 L 600 362 Q 600 370 593 374 L 587 378 Q 580 380 572 380 L 148 380 Q 140 380 133 376 L 127 372 Q 120 368 120 360 Z",
    label: "Hanzomon Line",
  },
  // ── Track bed (north of Den-en-toshi platform) ──
  {
    id: "b3-dento-trackbed-left",
    type: "track_bed",
    railwayLine: "tokyu_den_en_toshi",
    svgPath:
      "M 604 288 L 1076 288 Q 1080 288 1080 291 L 1080 292 Q 1080 295 1076 295 L 604 295 Q 600 295 600 292 L 600 291 Q 600 288 604 288 Z",
    label: "",
  },
  // ── Track bed (south of Den-en-toshi platform) ──
  {
    id: "b3-dento-trackbed-right",
    type: "track_bed",
    railwayLine: "tokyu_den_en_toshi",
    svgPath:
      "M 604 383 L 1076 383 Q 1080 383 1080 386 L 1080 387 Q 1080 390 1076 390 L 604 390 Q 600 390 600 387 L 600 386 Q 600 383 604 383 Z",
    label: "",
  },
  {
    id: "b3-dento-platform",
    type: "platform_area",
    railwayLine: "tokyu_den_en_toshi",
    // Beveled octagon: (600,310) (620,300) (1060,300) (1080,310) (1080,370) (1060,380) (620,380) (600,370)
    svgPath:
      "M 600 318 Q 600 310 607 306 L 613 302 Q 620 300 628 300 L 1052 300 Q 1060 300 1067 304 L 1073 308 Q 1080 312 1080 320 L 1080 362 Q 1080 370 1073 374 L 1067 378 Q 1060 380 1052 380 L 628 380 Q 620 380 613 376 L 607 372 Q 600 368 600 360 Z",
    label: "Den-en-toshi Line",
  },
  {
    id: "b3-central-concourse",
    type: "concourse",
    // Rect x 480–740, y 200–290, with L-notch at bottom toward escalators (~x 540–560 extends down)
    // Main rect plus small extension at bottom-right toward escalators
    // Shape: main box 480-740, 200-290 with notch extending down at x 540-650, y 290-310
    svgPath:
      "M 488 200 Q 480 200 480 208 L 480 282 Q 480 290 488 290 L 532 290 Q 540 290 540 298 L 540 302 Q 540 310 548 310 L 642 310 Q 650 310 650 302 L 650 298 Q 650 290 658 290 L 732 290 Q 740 290 740 282 L 740 208 Q 740 200 732 200 Z",
    label: "Central Concourse",
  },
  {
    id: "b3-north-bridge",
    type: "concourse",
    // Rect: x 260–940, y 120–195
    svgPath:
      "M 268 120 Q 260 120 260 128 L 260 187 Q 260 195 268 195 L 932 195 Q 940 195 940 187 L 940 128 Q 940 120 932 120 Z",
    label: "North Passage",
  },
  {
    id: "b3-south-bridge",
    type: "concourse",
    // U-shape: x 260–940, y 400–460, with notch (opening) at center-bottom x 480–640
    // Top edge full width, then drops down on sides but has notch cut out at bottom center
    svgPath:
      "M 268 400 Q 260 400 260 408 L 260 452 Q 260 460 268 460 L 472 460 Q 480 460 480 452 L 480 428 Q 480 420 488 420 L 632 420 Q 640 420 640 428 L 640 452 Q 640 460 648 460 L 932 460 Q 940 460 940 452 L 940 408 Q 940 400 932 400 Z",
    label: "South Passage",
  },
];
