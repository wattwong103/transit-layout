# Lightweight unified city and station

19 September 2026. The default `/area` now combines the registered station drawing with a compact local PLATEAU city. The earlier streamed globe is retained at `/area/full`, reached only through an explicit link with prefetch disabled.

## Resource choices

The 509,494,980 bytes acquired previously are the complete local audit cache, not the amount downloaded on every visit. Nonetheless, the earlier viewer started four streamed tilesets plus terrain and used a separate 6 MB Cesium JavaScript runtime. That is unnecessary for the station comparison.

| Default view | Implementation |
| --- | --- |
| City geography | 3,101 buildings selected by centre within a 1,300 × 1,200 m local area |
| Geometry payload | **645,153 bytes uncompressed**; 252,970 bytes in a gzip measurement |
| Compression caveat | Transfer compression depends on hosting; the local preview currently serves uncompressed files |
| Buildings | Projected source mesh envelopes extruded from source minimum to maximum height; no textures or facade/roof details |
| Map | Twelve zoom-16 GSI pale map tiles for a fixed neighbourhood; may be disabled |
| Rendering | Existing Three.js/React Three Fiber stack; renders on demand; pixel ratio capped at 1.25; no shadows or globe/terrain stream |
| Geometry batching | Context buildings merged into one mesh; three named landmarks kept separately selectable; floor slabs grouped by floor and material |
| Detailed passage | Original 1.2 MB source-derived GLB fetched only when selected; displayed as one merged mesh without Room envelopes |
| Full ward | Optional source viewer; no automatic prefetch or Cesium initialization from `/area` |

The size comparison reduces coverage and detail; it is not a claim that the full 509 MB dataset was compressed losslessly to 645 KB. Background map tiles and application JavaScript are additional to the city geometry payload. The original full cache remains available for auditing and future extraction.

## Geometry processing

[`build_lightweight_city.py`](../../scripts/build_lightweight_city.py) reads the pinned local finest building tiles, decodes Draco, applies the published glTF/RTC coordinate transforms and groups triangles by source feature ID. It combines projected triangles into envelopes, repairs topology, simplifies at 0.25 m and quantizes to centimetres with validity preservation. It retains multipart polygons and courtyard holes, while invalid microscopic cracks may collapse during repair. Tiny disconnected parts under 0.1 m² are omitted. This is a **plan envelope**, not an assertion of the surveyed ground footprint.

The [manifest](lightweight-city-manifest.json) records source tile hashes and per-building source counts, areas and exterior-boundary displacement. The maximum measured exterior displacement is **0.2497 m** relative to the projected, snapped source envelope. This does not include the original source's survey error, quantify vertical/roof simplification, or claim equivalent accuracy for interior holes. All 3,101 exported building polygon sets pass geometric validity checks. A payload regression rejects city geometry over 1 MB.

Minimum and maximum elevations come from decoded geometry. Each envelope has a flat top at that maximum, so a tower and podium can become a single taller mass. Source names, geographic positions and feature IDs are preserved for the three reviewed landmarks. The source release is 2025, mostly with 2021 building survey attributes.

## Shared coordinates and alignment

[`stationRegistration.ts`](../../src/lib/stationRegistration.ts) is the single transformation used by the combined 3D and north-up views. Both render the same polygons, rails, openings and connectors derived from the original station dataset. Exit anchors also receive this transformation in the registered dataset, but the compact viewer does not yet display individual exit badges or their association links. Those remain available in the original diagram. Registration does not overwrite the original coordinates.

The geographic frame matches the decoded west-exit passage: longitude **139.7009682753108° E**, latitude **35.65740742675032° N**, ellipsoid height **0 m**, with X east, Y up, Z south. Displaying the scene subtracts 55 m from source Y. That is an origin shift, not terrain clamping or a source geometry correction. The GSI map is a flat plan-reference plane; it is not an elevation surface. Station levels are still illustrative offsets from that plane, controlled by the floor-spacing slider.

The horizontal fit uses centres of the original Hikarie, Stream and Mark City envelope bounds against their named PLATEAU centre attributes. It solves translation, rotation and uniform scale, preserving angles and proportions rather than shearing or locally warping the drawing. Scale is approximately **1.7885 metres per original drawing unit**. The transformed drawing and actual source buildings are shown together; the old schematic building envelopes are not rendered over their source counterparts.

| Approximate control | Residual after three-control fit | Error when this control is left out |
| --- | ---: | ---: |
| Hikarie | 26.0 m | 76.2 m |
| Stream | 31.7 m | 62.5 m |
| Mark City | 17.4 m | 114.2 m |

**The fit is provisional.** RMS residual is **25.70 m**, but these are envelope centres, not surveyed entrance/corner correspondences. The leave-one-out result shows sensitivity to the controls and is not an independent survey check. There are zero independent surveyed checkpoints. No precise entrance position, accessible path or station floor elevation is certified by this fit. The existing Hikarie B2/B3 and other topology issues remain listed in the source review.

The [machine-readable registration](station-registration.json) preserves the coefficients, controls, source feature IDs, residuals and sensitivity checks. The UI displays the fit mismatch and can show the three residual segments.

## Reproduction and validation

After the full acquisition/index workflow, use the pinned Python dependencies:

```powershell
.cache/plateau-venv/Scripts/python.exe -m pip install -r scripts/requirements-plateau.txt
.cache/plateau-venv/Scripts/python.exe scripts/build_lightweight_city.py
.cache/plateau-venv/Scripts/python.exe -m unittest discover -s tests -p 'test_*.py'
npm.cmd test
node scripts/report-station-alignment.mjs
npm.cmd run build
npm.cmd run preview
```

The [final geometry check](final-geometry-check.md) expands validation to 24 application tests and seven Python tests. It fixes the registration of derived openings and checks every station entity, mesh cap and compact city polygon. Tests also cover known synthetic similarity transforms, independent geographic axes, unchanged original data, nonzero real residuals and the city size/hash budget. Static routes use directory indexes (`trailingSlash`) so `/area/full/` can coexist with `/area/` on static hosting.

Browser checks cover 3D and plan switching, B2 isolation, plan panning, landmark selection, residual guides, spacing changes and optional passage loading, with no browser errors observed. The narrow-screen view has no horizontal overflow and keeps the model in frame. Example scene counters were about 77,500 triangles for all levels, and 49 draw calls / 101,171 triangles for a B2 view with the detailed passage and guides enabled. Counters vary by viewport and enabled layers; they are not total browser memory or a frame-rate benchmark. Full source acquisition provenance and map/PLATEAU attribution remain in the [source coverage report](geographic-area.md).
