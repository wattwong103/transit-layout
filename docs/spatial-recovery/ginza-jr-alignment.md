# Ginza and JR alignment — 11 October 2026

Local follow-up to v1.3 and the Keio correction. Both viewers now use the same public platform boundaries. This is not a survey or a new release. Keio's corrected platforms and gate areas, the original global fit, and the existing city/mesh assets are preserved.

The subsequent [size recheck and enlarged detail view](platform-size-detail.md) distinguishes overall footprint spans from centre-section widths and adds a dedicated inspection page. The platform coordinates remain unchanged.

## Evidence and supported corrections

Public sources were checked on 10 October 2026. [Tokyo Metro's station page](https://www.tokyometro.jp/station/shibuya/index.html) links its full station diagram; the reviewed cached image is dated August 2025. [JR East's station page](https://www.jreast.co.jp/estation/stations/808.html) links the current floor diagram; the reviewed cached image is dated June 2026. The current pages reference those image URLs, but a fresh byte-for-byte image comparison was not possible because direct image requests returned 403. Those drawings establish floor relationships and equipment identity, not metre coordinates.

Additional official checks:

- [Tokyo Metro's 2019 opening announcement](https://www.tokyometro.jp/news/images_h/metroNews20191028_105.pdf): the replacement Ginza station opened on 3 January 2020 above Meiji-dori, with an approximately 12 m wide platform. The old pre-relocation station's quoted heights are not applied to the current station.
- [JR's platform reconstruction announcement](https://www.jreast.co.jp/press/2022/tokyo/20221018_to02.pdf): the January 2023 Yamanote platform consolidation changes the relevance of older building geometry.
- [JR's New South relocation announcement](https://www.jreast.co.jp/press/2024/tokyo/20240423_to03.pdf): the current 3F gate opened on 21 July 2024; the former gate closed. The current model refers to the new gate.

| Feature | Confirmed operator floor | Display height above assumed 1F |
| --- | --- | --- |
| Ginza platform / Scramble Square gate | 3F | +10 m, unverified |
| Ginza Meiji-dori gate | 2F | +5 m, unverified |
| JR Yamanote 1–2 / Saikyo 3–4 platforms | 2F | +5 m, unverified |
| JR Central / current New South gates | 3F | +10 m, unverified |
| JR South / Hachiko gates | 1F | 0 m, unverified datum |

The confirmed floor labels were already correct; they are retained. Both Realistic and Exploded modes show these labels. Realistic still uses the shared provisional 5 m floor interval and the existing 55 m ellipsoidal comparison plane as its assumed 1F. Neither the operator plans nor the PLATEAU roofs establish station elevations. Equal floor names at different operators do not establish equal heights.

## Horizontal geometry

The public extract preserves coordinates, source versions, update dates, API hashes and licence in [ginza-jr-alignment.json](../../public/evidence/ginza-jr-alignment.json):

- [Ginza way 759134298](https://www.openstreetmap.org/way/759134298), version 9, updated 13 November 2024.
- [Yamanote relation 18546084](https://www.openstreetmap.org/relation/18546084), version 1, updated 13 January 2025, including its mapped interior opening.
- [Saikyo relation 18546085](https://www.openstreetmap.org/relation/18546085), version 1, updated 13 January 2025, including its mapped interior opening.

The full API responses fetched on 10 October match the coordinates in the existing local OSM snapshot. These are community map records, not operator survey plans. The renderer preserves the complete outer and inner rings, without smoothing or filling the JR openings.

The former Ginza polygon had a 297 × 34 m bounding rectangle; the public outline is approximately 107 × 12.7 m, consistent with Metro's approximately 12 m width. The Yamanote and Saikyo outlines now follow the curved railway alignment and preserve Saikyo's longer southern extension. Their approximate bounding rectangles are 217 × 19 m and 305 × 22 m. These numbers describe polygon extents, not usable operating platform lengths or constant widths.

The three original fit controls remain frozen (25.7 m RMS mismatch). Corrected platform outlines are projected into the PLATEAU east/south frame and inversely mapped into the diagram. Gates, stairs, lifts and amenities move within local platform frames, retaining their source floors and status. JR uses one longitudinal frame across both islands so corresponding concourses remain abreast. These interior placements remain **inferred**, not public-coordinate observations. Track strokes follow platform edges with an illustrative offset; track centres are not surveyed.

The Ginza–JR and Keio–JR public approaches now meet the corrected station areas. Their straight placeholder shapes, widths, intermediate levels and vertical transitions remain unverified; they express adjacency and must not be treated as validated walking routes. Source opening polygons do not establish individual equipment identities or a complete opening inventory.

## PLATEAU comparison

The independent pyproj/Shapely plan check is recorded in [ginza-jr-plateau-check.json](../../public/evidence/ginza-jr-plateau-check.json). It compares each platform polygon, with holes, to the union of all intersecting projected city envelopes, avoiding double counting.

| Public platform | Area covered by projected PLATEAU envelopes |
| --- | --- |
| Ginza | 87.52% |
| Yamanote | 85.59% |
| Saikyo | 75.26% |

These percentages are **context overlap, not accuracy scores**. The 2025 city release mostly uses 2021 surveys, predating JR's 2023 platform consolidation and 2024 gate relocation. Platform ends and open areas need not be covered by roofs. Roof envelopes can also overhang platforms at unrelated heights. The model does not force present platform shapes into older roof coverage, infer station elevations from roof heights, or assign new building identities from overlap alone.

## Evidence still needed

- Ginza: gate and floor signs at Scramble Square and Meiji-dori; paid and outside-gate lift stop panels; both landings of the Hikarie and JR approaches.
- JR: the current New South gate/public passage and its platform connections; Central, South and Hachiko gate context; numbered platform panoramas; lifts A–F with stop panels; stair/escalator landings and mapped openings near the New South end.
- Dated photos should include wide context, signed floor and viewing direction where known. They can resolve equipment identity, local relationships and current access.
- Measured heights require dimensioned sections or measured floor levels tied to a declared vertical datum and current revision. Photos alone cannot calibrate metre elevations or sloping street levels.

See the consolidated [photo checklist](photo-verification.md).

## Reproduction and validation

1. Save the three API `/full` responses at the paths listed in `scripts/build_ginza_jr_reference.py`; retain the recorded hashes for the reviewed snapshot.
2. Run `python scripts/build_ginza_jr_reference.py` to regenerate the 4,060-byte public extract.
3. Run `.cache/plateau-venv/Scripts/python.exe scripts/check_ginza_jr_plateau.py` for the independent plan comparison (pyproj and Shapely).
4. Run `npm test` and `npm run build`, then inspect both local viewers in plan and 3D.

Completed: **45 application tests passed**, including exact outer/inner ring preservation in both frames, operator floor assignments, JR connector support, shared approach landings, preservation of Keio geometry, unchanged global fit controls, mesh triangulation and height-mode unit consistency. The production build passed. Both viewers were inspected at 2F and 3F, with Realistic/Exploded switching and the shared plan display; no browser errors were reported.

The public platform extract is **4,060 bytes**; the offline PLATEAU comparison is **1,931 bytes**. The city remains **645,153 bytes** and optional destination meshes **218,308 bytes**. No new city streaming, textures or heavy assets were added. At the inspected Ginza 3F realistic view the diagram rendered **28,221 triangles / 153 draw calls**; at JR 2F the unified city view rendered **94,545 triangles / 86 draw calls**. Rendering counts are not device-independent frame-rate guarantees.
