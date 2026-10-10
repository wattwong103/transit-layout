# Photo verification — remaining evidence

Status for **v1.4.0: pending user-supplied photos**. The user will provide photographs later. This evidence work is deferred from v1.1.0; the clearer v1.4 presentation retains the documented uncertainty. No photos are needed to build or use this release.

The v1.4 destination lines are visual associations between a schematic exit and the nearest PLATEAU outer envelope. Their endpoints are not accepted doorway coordinates, and a straight solid line does not establish an indoor walking route. Flat outlines in Exploded are a presentation choice; Realistic remains the height comparison. Neither view replaces the photos and measured sections below.

## V1.4 handoff — 11 October 2026

The final diagram, unified-map and source-geometry checks are recorded in [V1.4 validation](v1.4-validation.md). The release does not depend on photos arriving now. When available, prioritise entrance signs with wide street/building context; Keio, Ginza and JR gate/floor signs; lift stop panels; and both landings of uncertain stairs/escalators. Include the capture date and paid/unpaid side. The detailed locations below remain open; no field observation or live access condition was inferred from a successful software check.

Measured floor elevations, doorway coordinates and passage widths remain a separate request for dimensioned plans or survey controls. Photos can establish identities and relationships but cannot alone resolve the provisional 25.7 m global fit or calibrate the vertical datum.

## Completed before photos — 10 October 2026

All eight destination outlines and optional source building meshes are now shared between the diagram and PLATEAU map. Three identities are named in PLATEAU; five have strong, unique matches to named public building polygons. Twenty-one public entrance references are placed at their map coordinates, separate from schematic landings. See the [public alignment record](pre-photo-alignment.md) and [V1.3 source checks](v1.3-validation.md) and [V1.4 final checks](v1.4-validation.md) for dates, match evidence and limits. The station's original 25.7 m RMS fit remains provisional. The PLATEAU 2025 release largely uses 2021 surveys: roof detail and source heights do not establish present construction, current access or station floor elevations.

The most useful next entrance photos are:

- **A2, A8, A12, B5, B6:** code/sign plus a wide view of its building corner or street junction. No accepted current-code coordinate was available in the selected public extract.
- **A5a/b, A6a/b/c, A7a/b:** each branch sign and its approach, to distinguish branches currently grouped under one schematic exit.
- **C2:** floor sign and the full approach/transition. The public map node is tagged level −2; its physical relation to the entrance needs confirmation.
- **B1 and C3:** entrance sign, street context and passage sequence. These show large reference-to-landing separations; photos can clarify whether the compared points describe different approaches.

Legacy public map codes 8/15 and unnamed nodes are not automatically assigned current codes. Current signage should establish their identity first.

## Requested views

The [Ginza/JR correction, 11 October 2026](ginza-jr-alignment.md) now uses public-map platform boundaries and retains both mapped JR openings in both viewers. Operator plans confirm **Ginza platforms 3F / Meiji-dori gate 2F**, and **JR platforms 2F / Central and New South gates 3F / South and Hachiko gates 1F**. Heights remain estimates. PLATEAU is older than JR's 2023 platform merge and 2024 New South gate relocation; roof overlap is a context check, not evidence of current interiors.

For Ginza, please photograph the Scramble Square and Meiji-dori gate signs with floor labels, the paid lift stop panel, the outside-gate ground lift panel, and both ends of the Hikarie/JR connecting approaches. For JR, prioritise the **current New South gate and its public passage**, Central gate, South/Hachiko gates, platform numbers 1–4 with views along each island, and lifts **A–F** with stop panels and nearby signs. Include wide views of stair/escalator landings and the platform openings near the New South end; the public-map openings do not identify individual equipment banks.

Photos can establish these identities and relationships. To replace the provisional **1F = 0 m, 2F = +5 m, 3F = +10 m** display elevations, we still need dimensioned sections or measured levels tied to an identified datum, including each operator's street/building reference. Equal floor names do not prove equal physical elevations. Intermediate levels, widths and the exact geometry of the Keio–JR and Ginza–JR approaches remain inferred.

The subsequent [Keio/Mark City alignment correction](keio-mark-city-alignment.md) fixes platform plan placement and adds Realistic / Exploded views. Its 1F / 2F / 4F floor labels are confirmed, but the displayed 0 / +5 / +15 m elevations are assumptions. Please include wide views and signed levels at all three gates, the Central lift stop panel, and the 4F Avenue approach toward Dogenzaka. Measured sections or floor elevations are still required to calibrate those heights.

| Priority | Area | Useful evidence | What it resolves |
| --- | --- | --- | --- |
| 1 | Keio West gate | Dated overview, lift entrance and stop panel, works/closure notices, stairs C/D and alternative stairs E/F | Actual commissioning and access state after the planned September 2026 works. |
| 1 | SHIBUYA109 lift | Lift entrance with surrounding exit signage, full stop panel and opening-hours sign | The remaining unmapped building lift and its stopping floors. |
| 1 | Tokyu public lifts | Entrance identification and stop panels for 1, 20a, 22 and its adjacent shaft, 23 and its adjacent shaft, 31 and 32 | Intermediate stops missing from published range endpoints, and which adjacent symbol represents which physical shaft. |
| 1 | Hikarie / B6 / C3 | A sequence showing the gate name, floor sign and adjoining slope, stairs or public passage in context | Facility floor correspondence, C3 transition and the public approaches around the B3 gates. |
| 2 | Unidentified stair and escalator banks | Both landings, nearby gate/platform/exit names, direction arrows and any operating-hours notice | Individual bank identity, endpoints, number of units and time-dependent direction. |
| 2 | Ginza Hikarie-side approach | Gate name and level signs, connecting passage and lifts/stairs, with views showing which side of the gate they serve | The incomplete Hikarie approach and station-versus-building floor naming. |
| 2 | Gates and amenities | Named gate with adjacent paid/unpaid signage; amenity sign plus a wider contextual view | Continuous access boundaries and the remaining amenity inventory. |
| 2 | Building/entrance alignment | Each named entrance and a wider view of its building corner or street junction | Confirm the five inferred building identities and their actual entrance approaches; check overhangs versus ground-contact edges. Photos alone do not establish survey coordinates. |

For each group, retain the original filename and record the capture date/time, operator, gate or exit name, signed floor, viewing direction if known and a short description. A close view of a sign plus a wider contextual view is more useful than an isolated equipment photograph. Keep reported observations separate from assumptions.

## How later evidence will be applied

1. Match the visible signs and surroundings to the source record and model feature. Do not identify equipment solely by proximity.
2. Record the observation date and any conflict with the published diagram. A photo of an operating lift is a dated observation, not a permanent availability guarantee.
3. Update only the established identity, stop list, access condition or floor relationship; retain unresolved fields explicitly.
4. Re-run source coverage, landing support, shared-coordinate and display checks for changed features. Refresh the evidence fingerprint only after reviewing those changes.

The [evidence register](../../public/evidence/public-source-review.json) carries the current feature IDs, source dates and gaps. The [source-correction report](source-corrections.md) explains the implemented topology.

## Separate requirement for measured alignment

The current 25.7 m RMS figure measures the drawing's fit to three building centres, not entrance accuracy. To replace schematic geometry, provide a current dimensioned CAD/BIM or survey plan with its units, coordinate system, vertical datum and revision date. Identify well-distributed entrance/corner control points and separate check points; record corresponding floor elevations. Ordinary photographs can establish identities and relationships, but do not by themselves supply those measurements.
