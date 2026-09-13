# Shibuya spatial recovery audit

Reviewed 2026-09-12 against baseline `be47f97`. The supplied roadmap is sound in prioritizing source evidence before redraws. Keep the existing viewer and replace unsupported data incrementally. Its shared SVG records are sufficient for a 2.5D pilot; a renderer rewrite is not justified by this audit.

This release completes the immediate audit/source feasibility package and repairs specific display defects. It does not complete the later metric model, editor or coverage phases.

## Prototype evidence

Paths below refer to the baseline; changed behavior is described in the repair column.

| Part | Decision | Evidence and implication |
| --- | --- | --- |
| Geometry/data | Replace unsupported coordinates incrementally | `src/data/regions/path.ts:1` declares a 1400×900 drawing; primitives in `f1.ts:12` and `b5.ts:20` use authored coordinates. No geographic reference, scale, measured elevations or registration controls exist. Comments such as “OSM/Google” are not reproducible provenance. |
| Shared renderer | Keep | `src/app/page.tsx:6` imports the same nodes/edges for both views; `src/data/floors.ts` supplies shared region IDs and paths. Individual records can be replaced without rewriting the app. |
| Display elevations | Repair in the metric-data phase | `src/lib/isometric.ts:19` duplicates the floor elevation table. The 1F=1/B1=-1 convention makes that gap twice other adjacent gaps. These are display indices, not physical heights. No facility-specific levels exist. |
| Route geometry | Repair now | `src/lib/route-formatter.ts:106` merges walkway instructions by replacing endpoints; both route renderers use those merged endpoints, dropping intermediate turns. Preserve path node IDs separately from instructions. |
| Elevator display | Repair now | `src/components/overview/IsometricColumns.tsx:26` reuses the upper landing's XY for both ends. Edge e86 connects `(400,344)` to `(970,448)` and e108 connects `(360,345)` to `(1123,450)`. Draw the recorded connection faithfully and identify it as schematic; measured landing alignment remains unknown. |
| Floor background | Repair now | `src/components/map/FloorMap.tsx:36` discards viewBox origin. B5 is `1040 20 310 860`, so its background hit target at `(0,0)` lies outside the view. Use all four viewBox values. |
| Selection | Keep node IDs; extend later | `NodeMarkers.tsx:24` selects individual nodes. Isometric glyphs disable pointer events in `IsometricFloorSlab.tsx`; only floors are selectable there. `useMapStore.ts:38` clears node selection on a floor change and stores whole records. Cross-view space selection is not implemented. |
| Graph | Keep core; validate evidence before routing claims | 86 nodes, 113 edges, 44 regions and 8 floors. No duplicate node/edge IDs or missing edge endpoints found. The full graph is connected. This proves internal consistency only. |
| Accessibility/time | Replace unsupported assertions through evidence | Accessible-only graph has four components: 47 underground nodes, 18 on 2F, 13 on 1F, 8 on 3F. Upper-level accessible paths are absent from the dataset. e106–e108 give B1→deeper-floor elevator shortcuts identical 90-second weights. These are unverified assumptions, not evidence that real routes are unavailable or that elevators serve those stops. |
| Region geometry | Repair when importing | SVG parsers in `isometric.ts` and `RegionLayer.tsx` handle a limited positive-number M/L/Q subset. Irregular polygons, holes, signed coordinates and imported path commands need a canonical geometry adapter; copying arbitrary SVG into these parsers is unsafe. |
| Editing/media/persistence | Add | No upload, thumbnail, media records, edit history or persistence implementation exists under `src`. Static imports and plain Zustand state reset on reload. There is no existing media workflow to preserve or test. |

The isometric projection creates display coordinates without mutating the source XY values. No double-applied transform was found in the inspected legacy rendering path. There are no camera poses to test. The overview currently omits `outside` regions, so it is not yet a complete indoor-to-outdoor sample.

## Source feasibility and pilot decision

The [MLIT project description](https://www.mlit.go.jp/plateau/use-case/uc24-13/) confirms an integrated Shibuya model used public data and borrowed facility plans. Public availability of all borrowed station/building data is not established.

The [west-exit resource](https://www.geospatial.jp/ckan/dataset/plateau-uc24-13/resource/8e5c37d1-4749-416d-988a-4d15f0fb926c) was retrieved through its public CKAN API and its ZIP inspected. It contains 59 b3dm tiles, 343 unique feature IDs, four room IDs, and one building ID. There are 40 leaf tiles, with repeated features at different refinement levels. The source meshcode is `Sakura Underground.gml`; the GML itself is absent. Geometry is Draco-compressed glTF with CESIUM_RTC positioning. Preserve these IDs and transforms when decoding. Header/metadata checks do not verify the decoded geometry.

The archive's combined tile bounds are approximately **139.700632–139.701305° E, 35.657122–35.657692° N**. Use this bounded source area as the **provisional geometry pilot**, pending map reconciliation. Do not equate it with the entire west concourse or Hachiko area. It does not yet satisfy the requested two-level indoor/commercial/outdoor/boarding-point journey.

Source reference date is December 2024 according to the catalog; publication metadata is May 2025. These differ from the 2026 operator diagrams. Preserve date conflicts. The archive has ellipsoid height bounds, not verified floor elevations relative to Tokyo Peil. Its root maximum height is lower than a child's maximum; a converter must inspect all tile bounds. The 56.92 root `geometricError` is a refinement parameter, not a survey error. Coordinate interpretation follows the [OGC 3D Tiles 1.0 specification](https://docs.ogc.org/cs/18-053r2/18-053r2.html).

The catalog links the [PLATEAU site policy](https://www.mlit.go.jp/plateau/site-policy/), which currently identifies PDL1.0 unless separately stated and requires source attribution and a modification notice. No separate license file was present in the ZIP. Operator PDFs are linked as references and are not bundled.

Full field-by-field dates, reuse information and property authority are in [source-register.json](source-register.json); measured archive facts and checksum are in [plateau-inspection.json](plateau-inspection.json). Reproduce the latter after downloading the registered ZIP:

```powershell
python scripts/inspect_plateau_archive.py path/to/uc24-13_shibuyaku_chikagai.zip --output report.json
```

## Coverage and remaining evidence

The pilot boundary is explicit in [pilot-coverage.geojson](pilot-coverage.geojson). It is the union of tile bounding regions, not a measured public-space boundary. Full station coverage is proposed to encompass JR, Tokyu/Metro, Keio/Mark City, Hikarie, Scramble Square, Fukuras, Stream, Hachiko/west/east plazas and their connecting public passages and boarding points. A geographic polygon and owner-by-floor public-area inventory for this broader scope are still required.

| Facility or area | Current prototype | Available evidence | Next action |
| --- | --- | --- | --- |
| West-exit/Sakura underground passage | No reconciled mapping to region IDs | Downloaded 2024 source geometry with room IDs | Decode a leaf tile, resolve room/level semantics, check on geographic basemap and operator plan |
| Tokyu/Metro | Schematic B1–B5 | Operator diagram dated 2026-08-21; some PDF sections carry older dates | Reconcile exits, landings and closures per dated section; obtain metric controls |
| JR | Schematic 1F–3F | No current detailed source acquired | Inventory current JR plans and public floors |
| Keio/Mark City | Partial 2F schematic | Keio PDF describes 1F, 2F and 4F | Add facility-scoped level inventory; verify date and entrances before geometry |
| Hikarie/Scramble Square/Fukuras/Stream and retail neighbors | Some labels/rectangles only | No metric facility source acquired | Acquire facility floor guides and sections; list public connections |
| Plazas and outdoor passages | Few schematic regions | Source model's outer surfaces, not a verified outdoor route | Reconcile public-space plans and observations |
| Bus boarding points | “Bus Terminal (West)” region, zero boarding-point records | Toei boarding-guide candidate | Inventory physical stops for all operators; no route or position inferred from terminal label |

Initial exit records and differences from operator references are in [exit-inventory.md](exit-inventory.md). The denominator is unknown: no complete-exit percentage is supportable. The same applies to geometry and connection coverage; four room IDs do not mean four verified public spaces. Photo coverage has no defined target inventory and no uploaded media.

Next implementation requires: a canonical metric polygon schema with holes and original-coordinate transforms; facility-specific level IDs with unknown elevations permitted; independent checkpoints held out of alignment; source-linked portals and landings; and dated access/closure records. Only then integrate one verified sample into both views. Detailed 3D decoration follows shape and connectivity review.

Potential source holders include MLIT Tokyo National Highway Office, the railway operators and the listed facility managers. No one has been contacted. Field observations should resolve pilot entrance sign text, served landings, indoor/commercial boundary crossings, stairs/ramps/elevators, closures and the actual boarding-point approach. Until then, no current route, measured accuracy or complete-coverage claim is made.
