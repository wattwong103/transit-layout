# Public-source cross-check — 19 September 2026

> Historical review before the source-correction pass. For the current model and remaining inputs, see [Source corrections and remaining evidence](source-corrections.md). Counts and outstanding floor issues below describe the earlier snapshot; the linked machine-readable evidence and geometry reports now describe the corrected model.

The model remains a useful schematic, but **does not yet pass a real-world station alignment check**. Every current feature has been reviewed: 31 spaces, 23 connectors, 20 exit badges and eight buildings. The [evidence register](../../public/evidence/public-source-review.json) records each result, source dates, hashes for captured files, 33 source-side equipment records and unresolved correspondence. The application presents this register at `/verification#public-review`.

This is a review of the identified public sources, not a claim to have exhausted every public document or inventoried every physical station asset. The 22 references include freshly inspected diagrams, public pages, existing geographic-source audits and explicitly identified evidence retained from the earlier review. The large PDFs and historic pedestrian GeoJSON remain in ignored local cache; the browser receives an approximately 75 KB evidence register only when requested and no additional city geometry.

## Findings that affect the model

| Area | Source comparison | Result |
| --- | --- | --- |
| Main platform floors | JR platforms 2F, Ginza 3F, Hanzomon/Den-en-toshi B3, Toyoko/Fukutoshin B5 | Broad floor relationships supported. Dimensions and elevations remain illustrative. |
| B5 platform numbering | Tokyu plan’s western island is 5–6, eastern island 3–4 | **Corrected** in the shared dataset. Both 2D and 3D inherit the change. |
| Hikarie gate area | Tokyu separates B2 from Hikarie gates on B3 with a slope | **Conflict:** current gate slab and B5 link are B2. Rebuild the connected area together; a floor-label-only edit would preserve false connections. |
| Exit A12 | MAGNET approach appears on B2 | **Conflict:** badge is attached to a B1 branch. |
| Exit B1 | B3 approach and lifts 20a/20b | **Conflict:** model attaches it to B1. Exit code B1 does not mean basement 1. |
| Exit B5 | Hikarie interface on B3 | **Conflict:** model attaches it to B2. |
| Exit B7 | Separate B1 landing near east underground plaza | **Conflict:** model attaches it directly to a B2 link. |
| JR gates | June 2026 map: Central/New South 3F; Hachiko/South 1F | **Incomplete:** one generic 1F concourse and an unresolved 2F “central passage” cannot represent these areas. |
| JR lifts | A–F are identifiable across the official floor panels | **Missing:** no JR lift is present in the current schematic. |
| Keio | West 1F, Central/platforms 2F, Avenue 4F; distinct arrival-only platform | **Incomplete:** no 4F, West-gate area, separate arrival-only platform or Keio vertical connections. |
| Gate and facility access | Paid/unpaid boundaries, opening hours, directional equipment, amenities | **Missing from the model schema:** geometry alone cannot express current usable routes. |

Sources: [Tokyu’s 21 August 2026 plan](https://www.tokyu.co.jp/railway/station_map/pdf/ty01-shibuya_2.pdf), [JR’s June 2026 floor plan](https://www.jreast.co.jp/estation/stations/img/floormap/0808_1f-3f.png), [Metro’s August 2025 diagram](https://www.tokyometro.jp/station/yardmap_img/figure_yardmap_shibuya_all.jpg), [Keio’s end-March 2026 floor plan](https://www.keio.co.jp/train/station/station_map/pdf/in01_shibuya_floor_map.pdf). Original diagram boundaries are schematic, so these sources do not provide permission to treat a pixel-derived outline as a surveyed footprint.

The 20 codes **A0–A8, A12, B1–B7 and C1–C3 match the reviewed Tokyu plan**. This corrects the earlier verification report’s unsupported statement that the plan included additional exit groups. One code can have several approaches and multiple physical doors. JR/Keio gates are a separate inventory; the current badges are not a complete entrance database.

## Equipment, amenities and operating conditions

All 23 current schematic connectors have individual review entries. **Zero have a confirmed one-to-one equipment correspondence.** A matching floor range is insufficient to assign an official lift ID to a drawn shaft. Neither proximity nor a plausible-looking route is treated as evidence.

The 33 source-side records contain six JR lifts, 17 lift symbols from the Tokyu plan, two Ginza lift-route relationships, an existing lift by Keio Central, the planned Keio West lift and six lettered Keio stairs. They have no fabricated coordinates or assigned schematic IDs. The inventory is deliberately marked incomplete: it does not yet enumerate every escalator bank or amenity, and is not a deduplicated count of all physical equipment across the station complex.

- JR’s lettered lifts permit floor-panel matching. A/F appear at 1F, 2F and 3F; B/C at 1F and 2F; D/E at 2F and 3F. These are source observations, not modelled shafts. [JR floor plan](https://www.jreast.co.jp/estation/stations/img/floormap/0808_1f-3f.png).
- Keio’s Avenue gate has published hours of 07:30–22:00. Its West-gate works replace stairs with a lift and are scheduled from 25 August 2025 to the end of September 2026. At the review date, a completed opening has **not** been established. The closure overlay must be read alongside the newer floor plan. [Keio works notice](https://www.keio.co.jp/news/update/announce/announce2025/pdf/0807_shibuya.pdf), [isometric map](https://www.keio.co.jp/train/station/station_map/pdf/in01_shibuya.pdf).
- Tokyu’s plans include lift stop restrictions, hours crossing midnight, escalator direction exceptions and a closed lounge whose toilet remains available. The register records examples without promoting them to a live route engine. Range endpoints do not imply all intermediate stops. [Tokyu plan](https://www.tokyu.co.jp/railway/station_map/pdf/ty01-shibuya_2.pdf).
- Accessible toilets, baby-care facilities, AEDs, lockers and ticket facilities appear in the plans. Their source presence is recorded as missing model coverage; exact individual amenity locations have not been digitised.

## Date conflicts and source precedence

| Source | Date actually established | Use |
| --- | --- | --- |
| Tokyu plan | 21 August 2026; exit-direction inset 30 August 2024 | Current reviewed underground layout, while preserving the older inset date. |
| JR map | June 2026 | Replaces the earlier image-access limitation. Downloaded successfully from the rendered official page after direct HTTP 403. |
| Metro map | August 2025 | Older isometric cross-check. User’s English illustration says November 2025. |
| Metro accessibility page | No publication date established; uses legacy numbers such as 13a and 15 | Equipment relationships only; no automatic mapping to current exit codes. |
| Keio | End-March 2026 floor plan; separate works notice through September 2026, planned | Treat revision and construction-completion dates separately. |
| City guide map | Title 2025, footer issued February 2026 | District context at 1:10,000. Raster PDF without a `/VP` geospatial transform. |
| City barrier-free implementation plan | March 2026 cover; station section explicitly status at end-January 2024 | Historic implementation evidence; not current operational status. |
| Walkable City infrastructure booklet | November 2024 | Distinguish current routes from completion illustrations, including FY2027-and-later proposals. |
| MLIT pedestrian network | Shibuya south updated 1 March 2020; district dataset December 2017 | Historical geographic context; not verified current station routes. |
| PLATEAU | City release 2025, named control buildings surveyed 2021; passage source December 2024 | Source geometry with explicit age and coverage, not current operating conditions. |

Read [Metro accessibility](https://www.tokyometro.jp/station/shibuya/accessibility/index.html), [the city’s barrier-free plan](https://files.city.shibuya.tokyo.jp/assets/12995aba8b194961be709ba879857f70/f3cc2ca1df1d4458a4d6f90743bf1aa6/R7_barrier_free_koso.pdf), [city guide map](https://www.city.shibuya.tokyo.jp/shisetsu/annaizu/maps/annaizu.html) and [infrastructure booklet](https://files.city.shibuya.tokyo.jp/assets/12995aba8b194961be709ba879857f70/ec34a04613e2431887e9d824225c7bda/kiban_book.pdf) with these date distinctions. The city’s public accessibility-map guide also distinguishes official facility information from wheelchair-user contributions. I opened the linked map, searched Hikarie, displayed lifts and inspected one priority-lift record: it is a WheeLog contribution last updated 8 February 2019. Its public coordinates are retained in the register as a historical sample, with no assigned current operator equipment ID and no acceptance as a surveyed control. Individual records were not exhaustively reviewed.

## Geographic alignment

The [MLIT public network](https://www.geospatial.jp/ckan/dataset/0401) adds 1,641 historical nodes and 1,823 links, downloaded and hashed. Node properties contain coordinates and coded floor/link attributes, but no current station exit or lift identifiers. Raw classification codes are not metres, survey heights or equipment counts. No correspondence was accepted merely because a node was near a drawn exit.

Consequently the shared PLATEAU registration remains unchanged: three named building-centre controls, **25.7 m fit RMS**, zero independent surveyed entrance checkpoints and illustrative station elevations. Hikarie, Stream and Mark City have reviewed PLATEAU identities; the other five named destinations still need matching. The simplified city retains its existing approximately 645 KB size.

The city infrastructure drawings help explain how the district connects across levels. They include planned geometry, and the city’s 1:10,000 map cannot establish exact lift or entrance positions. Neither source justifies stretching the schematic to make its overlay appear correct. See [the registration record](station-registration.json) and [geometry audit](final-geometry-check.md) for the distinction between numerical consistency and real-world accuracy.

## Implementation and verification

The evidence register is a static data artifact used by the server-rendered verification page, with per-feature results, dated source links, source equipment and access restrictions. The original explorer links selections to the review. Both diagram renderers and the geographic view receive corrected platform names from the same dataset; no geographic coordinates were changed during this source review.

`tests/evidence.test.ts` checks exact feature coverage, references, counts and a fingerprint of the reviewed model. Any subsequent model change invalidates the audit until affected evidence is reviewed and the fingerprint is deliberately updated. Do not refresh that fingerprint automatically to conceal a stale audit.

Next geometry work is concrete: reconstruct the Hikarie B2/B3 transition; separate the four conflicting exit landings; resolve JR gate-level identity and connections; add Keio’s omitted levels; then match individual equipment, entrance coordinates and held-out geographic checks. These are outstanding modelling tasks, not completed verification claims.

Validation: 25 automated application tests passed, including complete feature coverage and an exact model fingerprint; the production export passed compilation, lint and type checks. Existing geometry tests verify both original and registered render geometry. This validates the update, not the unresolved real-world connections above.

Browser verification passed: all 20 exit entries render, the four landing conflicts are visible, the source-equipment disclosure shows the six JR lifts, and both 2D and 3D display the corrected B5 platform labels. The review and explorer report no browser errors. The original overview was restored.
