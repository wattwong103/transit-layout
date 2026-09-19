# Final geometry and alignment check

> Historical review before the source-correction pass. For the current model and remaining inputs, see [Source corrections and remaining evidence](source-corrections.md). Counts and outstanding floor issues below describe the earlier snapshot; the linked machine-readable evidence and geometry reports now describe the corrected model.

Checked 19 September 2026 on `codex/shibuya-spatial-recovery`, against the v1.0.0 diagram and the derived PLATEAU assets.

**Result: internal geometry passes after two fixes. Real-world station accuracy does not yet pass.** The unified view is suitable for comparing the drawing with geographic references; it is not a verified reconstruction of the station.

## Fixes made during this pass

- Registered stair and lift openings were being recalculated using unscaled clearances and an unrotated lift axis. This displaced some corners by **4.524 m** compared with the transformed original drawing. All 24 openings now receive the same transformation as their surrounding slabs, rails and connectors.
- Exit A1's schematic anchor was one drawing unit outside its associated passage. It now sits on that passage boundary in both views. This repairs internal drawing consistency; it does not establish A1's surveyed location.
- Original and compact 3D renderers now use one plan-to-extrusion function, preserving east X, south Z and upward extrusion. Plan footprints, voids and cap areas are covered by regression checks.

## Checks and evidence

| Check | Result | Coverage |
| --- | --- | --- |
| Schematic validity | Pass | 31 slabs, 24 openings and 8 building polygons are valid in both original and registered coordinates. |
| Connector and exit anchors | Pass | All 46 connector endpoints touch or lie inside a slab on their declared floor; all 20 exit anchors touch or lie inside their associated passage. This is geometric support, not proof of a usable route. |
| Shared registration | Pass | Every polygon vertex, label anchor, rail point, connector endpoint/width, exit and opening receives the same similarity transform. Original data is not modified by registration. |
| Plan versus 3D geometry | Pass | All 31 station slabs and 8 building envelopes in both frames, plus all 3,123 compact city polygon parts, triangulate with matching plan cap area and axis bounds. Original 3D decorative bevels remain display details. |
| Geographic coordinate frame | Pass | 27 neighbourhood/height combinations agree with Cesium's independent WGS84 transform to better than 1e-7 m numerically. East/up/south axes and origin are consistent. Numerical agreement is not source survey accuracy. |
| Source passage placement | Pass | Every decoded GLB vertex reproduces its source geographic bounds under the Cesium placement; source scale is unchanged. No station-floor correspondence is inferred. |
| Compact city versus source meshes | Pass | Independently decoded 122 cached tiles containing 469,945 selected source triangles. All 3,101 building identities and source triangle counts match. Maximum envelope **bounds** difference: 0.2069 m; maximum base/top rounding difference: 0.004998 m. |
| Compact polygon validity | Pass | All 3,123 polygon parts are valid, including retained holes. Earlier extraction measured maximum exterior-boundary displacement of 0.2497 m; this is different from the bounds comparison above. |
| Source integrity | Pass | All 1,064 full-ward content tiles and four tileset roots match the acquisition hashes. The compact asset remains 645,153 bytes and matches its published SHA-256. |
| Browser | Pass | All eight floor filters exercised in original 2D, original 3D, unified north-up and unified 3D views. Hikarie selection/exit association, floor openings, residual guides and optional passage rendering checked visually. Standalone PLATEAU north-up view and 65% cutaway also checked. No browser errors observed. |
| Build and automated tests | Pass | Production static export, lint/type checks, 24 application tests and 7 Python tests. |

The lightweight view has no Cesium runtime script. Its additional source passage remains optional. A B2 north-up view with passage and residual guides reported 43 draw calls and 101,159 triangles at the inspected viewport. These are scene counters, not a memory or frame-rate benchmark. Existing Three.js deprecation warnings are separate from geometry failures.

The registered dataset includes all exit anchors, but the compact viewer does not yet render individual exit badges or destination association links. Those are visible in the original diagram. A data-level registration check should not be mistaken for complete feature coverage in every viewer.

## Real-world findings still preventing sign-off

| Finding | Evidence / consequence |
| --- | --- |
| Horizontal fit remains coarse | Three building-envelope centres give **25.70 m RMS** mismatch: Hikarie 26.0 m, Stream 31.7 m, Mark City 17.4 m. Leaving each control out gives 76.2 m, 62.5 m and 114.2 m respectively. There are zero independent surveyed checkpoints. |
| Hikarie floor/topology mismatch | [Tokyu's 21 August 2026 plan](https://www.tokyu.co.jp/railway/station_map/pdf/ty01-shibuya_2.pdf) places the Hikarie gate area at B3F, with a B2/B3 transition. The model's `b2-hikarie-concourse` remains B2. Its adjoining passages, exits and connectors need a coordinated correction; moving one slab alone would misrepresent the connections. |
| JR passage identity unresolved | [JR's 23 April 2024 diagram](https://www.jreast.co.jp/press/2024/tokyo/20240423_to03.pdf) places the Central Gate at 3F. The model has a “JR central passage” at 2F; its intended identity is not established. This older source does not constitute a complete current JR verification. |
| Keio level omitted | [Keio's station diagram](https://www.keio.co.jp/assets/pdf/global/routes/stations/shibuya/k55_shibuya.pdf) includes the Avenue Gate at 4F, absent from the current model. |
| Vertical alignment unknown | Floor spacing is illustrative. PLATEAU uses ellipsoid heights; the shared view subtracts 55 m for display. The GSI map is flattened, not terrain. Neither station floor heights nor facility-specific level correspondences have been surveyed. |
| Source coverage and age | Only three of eight destination identities are reviewed against PLATEAU. The 2025 city release mostly carries 2021 survey attributes. The limited west passage reflects December 2024. Current redevelopment, full station interiors, lift stopping ranges and operating restrictions are not verified. |

Tokyu and Keio PDFs were fetched again during this pass and their bytes match the [evidence snapshot](v1-evidence-snapshot.json). Their diagrams were visually rechecked. The supplied November 2025 illustration remains a schematic reference, not a metric control surface.

Next accuracy work should correct the evidenced floor/topology issues, then establish corresponding surveyed entrances/corners and independent check points. A locally warped drawing would conceal discrepancies without proving accuracy.

## Reproduce

With the already acquired PLATEAU cache and pinned Python dependencies:

```powershell
npm.cmd test
.cache/plateau-venv/Scripts/python.exe -m unittest discover -s tests -p 'test_*.py'
.cache/plateau-venv/Scripts/python.exe scripts/check_geometry_alignment.py
npm.cmd run build
```

The audit command checks both station frames with Shapely and independently decodes the compact city's cached source tiles. It writes [final-geometry-audit.json](final-geometry-audit.json). See also [registration controls and residuals](station-registration.json), [source review](v1-verification.md) and [lightweight processing notes](lightweight-unified-view.md).
