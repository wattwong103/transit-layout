# Platform size recheck and enlarged view — 11 October 2026

The public platform geometry has no detected drawing-unit/metre conversion error. Its local projected dimensions agree with an independent WGS84 geodesic area/perimeter calculation: the largest relative difference is below **0.06 parts per million**. This checks the coordinate conversion, not the positional accuracy of OpenStreetMap or the current operating platform limits.

The previous 19–22 m JR width figures were enclosing rectangle spans. Because the platforms curve, these spans are substantially larger than a cross-section through their centres. The new detail view distinguishes the two.

| Public outline | Overall length span | Overall width span | Centre cross-section | Mapped surface area |
| --- | ---: | ---: | ---: | ---: |
| Ginza | 107.0 m | 12.7 m | 12.5 m | 1,158 m² |
| JR Yamanote 1–2 | 216.8 m | 19.2 m | 12.6 m | 2,427 m² |
| JR Saikyo 3–4 | 305.0 m | 21.6 m | 11.0 m | 2,842 m² |
| Keio main | 116.8 m | 19.7 m | 10.3 m | 1,285 m² |
| Keio arrival | 117.2 m | 5.1 m | 3.1 m | 360 m² |

Lengths and width spans come from the minimum-area enclosing rectangle. The centre section is the outer-boundary intersection perpendicular to that rectangle's long axis at its midpoint; it is shown on the plan. It is not a minimum clear walking width or an average. Areas subtract the two mapped JR openings. Keio's inferred equipment cutouts are not part of the source polygon and are excluded from these measurements. Decimal display precision does not imply survey accuracy.

[Tokyo Metro's current-station announcement](https://www.tokyometro.jp/news/2019/203391.html), checked again on 11 October, describes an approximately **12 m** wide Ginza platform. That supports the scale of the mapped section, but does not certify the entire mapped boundary. [JR's 2023 engineering announcement](https://www.jreast.co.jp/press/2023/tokyo/20230808_to01.pdf) records a height change of up to **20 cm** during reconstruction; it does not provide the present absolute elevation. The model's provisional metre heights therefore remain unchanged and unverified. The 350 m figure in [JR's project overview](https://www.jreast.co.jp/esio/our-works/project02.html) is the Saikyo platform relocation distance, not a platform length.

## New detail view

`/detail/` is linked from both the original diagram and the unified map. It provides:

- **Enlarged 3D:** a camera framed around the chosen platform; optional gates and connections use the existing operator geometry. No coordinates or scale factors are altered. Estimated-height and exploded controls retain their existing meanings.
- **Measured plan:** equal metre scale on both axes, enclosing dimensions, centre cross-section, preserved source vertices/openings, a 10 m grid and a metre scale bar. The view is rotated along the platform to use the available screen width.
- **Zoom and inspection:** camera zoom in 3D; plan zoom with an along-platform slider to inspect either end; Fit geometry restores framing.
- **Five platform choices:** Ginza, the two JR islands, Keio main and arrival. The page loads no city archive, map tiles or destination meshes. It reuses the existing 3D renderer on demand.

The overview's eight buildings previously dictated camera bounds and made the platforms visually small. Detail framing excludes those buildings and distant floor-label anchors. Decorative unsourced posts are omitted from this inspection view. The slab renderer's decorative bevel has also been removed: it previously expanded outlines by 0.2 drawing units per side (about 0.36 m in the shared frame). Actual slabs now follow the plan boundaries exactly. Rail strokes, platform thickness, equipment dimensions and floor heights remain illustrative.

## Reproduction and validation

Run `.cache/plateau-venv/Scripts/python.exe scripts/check_platform_sizes.py` to regenerate [platform-size-check.json](../../public/evidence/platform-size-check.json). The independent check uses pyproj/Geod and Shapely, retains source hashes, and compares all five public outlines. The client-side measurement code is separately tested against this output, a rotated rectangle with a hole, and the existing diagram-to-metre conversion. Subset tests ensure the detail view neither changes source objects nor includes city geometry.

The existing [photo and measured-height checklist](photo-verification.md) still applies. No new source measurements justify changing the platform polygons or claiming verified equipment clearance.

Completed: **48 application tests passed** and the production build passed. The browser inspection covered all five platform measurements, 3D/plan switching, plan zoom and along-platform keyboard panning, gates/connections, estimated/exploded spacing and framing. The detail route is approximately **5.5 KB** of route code / **124 KB** first-load JavaScript before the lazily loaded existing 3D renderer. It introduces no new geometry archive or textures. No browser errors were reported during the inspection.
