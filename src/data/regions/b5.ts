import { FloorRegion } from "@/types/station";

export const regionsB5: FloorRegion[] = [
  // ── Track bed (west of Fukutoshin platform) ──
  {
    id: "b5-fukutoshin-trackbed-left",
    type: "track_bed",
    railwayLine: "metro_fukutoshin",
    svgPath:
      "M 382 90 Q 385 90 385 94 L 385 516 Q 385 520 382 520 L 381 520 Q 378 520 378 516 L 378 94 Q 378 90 381 90 Z",
    label: "",
  },
  // ── Track bed (east of Fukutoshin platform) ──
  {
    id: "b5-fukutoshin-trackbed-right",
    type: "track_bed",
    railwayLine: "metro_fukutoshin",
    svgPath:
      "M 467 90 Q 470 90 470 94 L 470 516 Q 470 520 467 520 L 466 520 Q 463 520 463 516 L 463 94 Q 463 90 466 90 Z",
    label: "",
  },
  {
    id: "b5-fukutoshin-platform",
    type: "platform_area",
    railwayLine: "metro_fukutoshin",
    // Beveled octagon vertical island x 385–460, y 90–520
    // Corners beveled ~15px: top (395,90)→(450,90), right (460,100)→(460,510), bot (450,520)→(395,520), left (385,510)→(385,100)
    svgPath:
      "M 401 90 L 444 90 Q 452 90 456 94 L 458 96 Q 460 100 460 108 L 460 504 Q 460 512 456 516 L 454 518 Q 450 520 442 520 L 403 520 Q 395 520 391 516 L 389 514 Q 385 510 385 502 L 385 108 Q 385 100 389 96 L 391 94 Q 395 90 401 90 Z",
    label: "Fukutoshin Line",
  },
  // ── Track bed (west of Toyoko platform) ──
  {
    id: "b5-toyoko-trackbed-left",
    type: "track_bed",
    railwayLine: "tokyu_toyoko",
    svgPath:
      "M 472 90 Q 475 90 475 94 L 475 516 Q 475 520 472 520 L 471 520 Q 468 520 468 516 L 468 94 Q 468 90 471 90 Z",
    label: "",
  },
  // ── Track bed (east of Toyoko platform) ──
  {
    id: "b5-toyoko-trackbed-right",
    type: "track_bed",
    railwayLine: "tokyu_toyoko",
    svgPath:
      "M 557 90 Q 560 90 560 94 L 560 516 Q 560 520 557 520 L 556 520 Q 553 520 553 516 L 553 94 Q 553 90 556 90 Z",
    label: "",
  },
  {
    id: "b5-toyoko-platform",
    type: "platform_area",
    railwayLine: "tokyu_toyoko",
    // Beveled octagon vertical island x 475–550, y 90–520
    svgPath:
      "M 491 90 L 534 90 Q 542 90 546 94 L 548 96 Q 550 100 550 108 L 550 504 Q 550 512 546 516 L 544 518 Q 540 520 532 520 L 493 520 Q 485 520 481 516 L 479 514 Q 475 510 475 502 L 475 108 Q 475 100 479 96 L 481 94 Q 485 90 491 90 Z",
    label: "Toyoko Line",
  },
  {
    id: "b5-central-concourse",
    type: "concourse",
    // Rect: x 560–860, y 230–380
    svgPath:
      "M 568 230 Q 560 230 560 238 L 560 372 Q 560 380 568 380 L 852 380 Q 860 380 860 372 L 860 238 Q 860 230 852 230 Z",
    label: "Connecting Concourse",
  },
  {
    id: "b5-north-passage",
    type: "concourse",
    // Rect: x 380–860, y 60–220
    svgPath:
      "M 388 60 Q 380 60 380 68 L 380 212 Q 380 220 388 220 L 852 220 Q 860 220 860 212 L 860 68 Q 860 60 852 60 Z",
    label: "North Passage",
  },
  {
    id: "b5-south-passage",
    type: "concourse",
    // Rect: x 380–860, y 390–540
    svgPath:
      "M 388 390 Q 380 390 380 398 L 380 532 Q 380 540 388 540 L 852 540 Q 860 540 860 532 L 860 398 Q 860 390 852 390 Z",
    label: "South Passage",
  },
];
