# Source corrections and remaining evidence — 19 September 2026

The current branch incorporates the floor, gate, exit and lift corrections supported by the reviewed operator diagrams. The model is more complete and internally consistent, but its station shapes and elevations remain schematic. **Geographic accuracy is still unverified: 25.7 m RMS building-centre mismatch and no independent surveyed checkpoints.**

## Applied to all views

The original 2D plan, original 3D diagram and compact PLATEAU view consume one corrected dataset. The current model contains nine levels, 59 spaces, 64 vertical connections, 20 exit codes, eight destination buildings and 35 facility markers. Of those markers, 15 are gates, 19 are amenities and one is a construction site.

| Correction | Current behavior |
| --- | --- |
| Hikarie | Gate area and B5 interface on B3, separate Miyamasuzaka B2 area, connecting slope, revised public passages and B4 banks. |
| Exit floors | A12 on B2; exit B1 approached from B3, with 20a/20b lifts; B5 on B3; B7 on its separate B1 landing. C1/C2/C3 have separate branches; C3 floor correspondence remains provisional. |
| JR | Central and New South gates on 3F; South and Hachiko on 1F; platforms on 2F. Lifts A–F have explicit recorded stops. |
| Keio | West 1F, Central 2F and Avenue 4F; separate arrival-only platform; Central outside-gate lift; lettered stairs A–F. C/D are marked closed in the source. The new West lift is a works marker, not an operating connection. |
| Ginza | Separate Meiji-dori paid lift and Scramble Square outside-gate ground lift, with their gate areas distinguished. Complete Hikarie-side approach correspondence remains unresolved. |
| Stop filtering | A shaft passing through a floor does not imply a stop. Lift 21 is absent from B1. Tokyu C/D appear on B2/B4/B5; E/F on B3/B4/B5. Incomplete source ranges show only recorded endpoints. |
| Access conditions | Published hours, direction notes, paid-area descriptions, closure state and source uncertainty appear in selection details. Anonymous banks remain explicitly unmatched. Continuous paid/unpaid boundaries are not reconstructed. |
| Inspection | Search the **Access** tab in the diagram or choose a **Station feature** in the city view. Gates, toilets, baby care, AEDs, lockers, tickets and information have selectable schematic markers. |

Sources: [Tokyu plan, 21 August 2026](https://www.tokyu.co.jp/railway/station_map/pdf/ty01-shibuya_2.pdf), [JR plan, June 2026](https://www.jreast.co.jp/estation/stations/img/floormap/0808_1f-3f.png), [Keio floor plan, end-March 2026](https://www.keio.co.jp/train/station/station_map/pdf/in01_shibuya_floor_map.pdf), [Keio closure overlay](https://www.keio.co.jp/train/station/station_map/pdf/in01_shibuya.pdf), [Keio works notice](https://www.keio.co.jp/news/update/announce/announce2025/pdf/0807_shibuya.pdf), [Metro diagram](https://www.tokyometro.jp/station/yardmap_img/figure_yardmap_shibuya_all.jpg) and [Metro accessibility relationships](https://www.tokyometro.jp/station/shibuya/accessibility/index.html). The [current evidence register](../../public/evidence/public-source-review.json) preserves all 22 reference entries, source dates and recorded limitations.

## What still needs input

Photo verification is deferred until after v1.1.0, when the user supplies photos. See the [photo verification checklist](photo-verification.md) for the planned capture and review pass.

No approval is needed for the implemented corrections. The remaining blockers to a measured reconstruction are evidence gaps:

1. **A current dimensioned plan or survey.** CAD, BIM or a measured PDF covering the station, with units, north direction, coordinate system and revision date. Entrance/corner coordinates and floor elevations must identify the same physical points in both sources. A useful initial horizontal set is three well-distributed control points plus at least two separate check points; the whole complex needs broader coverage. Floor heights must identify their vertical datum. A named floor does not establish a common elevation across adjoining buildings.
2. **Dated equipment and access evidence.** An operator asset schedule or site photographs showing lift stop panels, the identity and directions of anonymous stair/escalator banks, gate boundaries, and whether Keio West works have actually opened. The published end-September 2026 date is planned, not proof of commissioning.

The full gap list also includes the 109 lift's stopping floors, incomplete amenity/tactile-guidance coverage and five destination buildings without reviewed PLATEAU identities. Public building metadata was searched, but proximity alone is insufficient to assert an identity. These unresolved items remain explicit in the application; no geographic coordinates, stop lists or live opening states were invented to close the audit.

## Validation

- 28 application tests pass, including operator floor assertions, explicit stop filtering, closure preservation, model/source coverage, shared registration and mesh triangulation.
- The geometry audit checks both coordinate frames: 59 valid slabs, 65 openings, 20 attached exits, 135 supported connector stops and 35 supported facilities in each frame.
- The compact city is unchanged: 3,101 buildings / 3,123 polygon parts / 645,153 bytes. Independently decoded 122 source tiles still match, with maximum envelope-bounds difference 0.2069 m and height rounding difference 0.0050 m. These figures describe city simplification, not station accuracy.
- Production build passes. Browser checks cover B4 lift stops, lift 21's B1 exclusion, Keio Avenue hours, closed stairs, selected facility details, and shared features in the north-up and 3D city views. No browser errors were observed.
- The combined 3D view was observed at 176 draw calls and 81,444 triangles with the bounded map background enabled. Rendering remains on demand. Source PDFs and the approximately 509 MB source cache are not added to the default city download.

See [machine-readable geometry results](final-geometry-audit.json). Small display-only surface offsets suppress flicker at overlapping schematic passage joins; they are not surveyed floor heights. Internal geometry checks do not certify reachable, step-free or currently open routes.
