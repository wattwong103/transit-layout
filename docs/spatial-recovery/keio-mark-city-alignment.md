# Keio inside Mark City — 10 October 2026

This correction follows the v1.3 review. It does not constitute a new release or a surveyed station model.

Follow-up on 11 October: [Ginza and JR alignment](ginza-jr-alignment.md) preserves the Keio platforms and gate areas, corrects the JR endpoint of the shared approach, and extends the height controls to those operators. The original account below describes the first Keio correction.

## Horizontal alignment

Both presentation views use the same local Keio correction. The main platform and arrival-only platform preserve the WGS84 polygons from OpenStreetMap ways **1349961222** and **1349961223**, projected into the existing PLATEAU frame. The source snapshot, versions, update dates, attribution and coordinates are recorded in [keio-alignment.json](../../public/evidence/keio-alignment.json). The small extract is reproducible with `python scripts/build_keio_reference.py`; it adds no city streaming or large assets.

The main and arrival platforms previously overlapped only 48.71% and 42.01% of Mark City's projected PLATEAU envelope. Both corrected outlines lie fully inside that envelope in plan. This is containment within the mesh's projection, not proof of interior walls, ground-contact boundaries or floor elevations.

Keio's gate areas, stairs, facilities and Central lift follow a local tapered platform frame. These positions remain **inferred** from the operator plan and the mapped platforms. The West gate's provisional area is kept inside the building envelope; it is not a surveyed room boundary. Connector stops, holes and facilities move together. The public approach to JR is redrawn only at the Keio end, preserving the original JR landing and marking the path as inferred. Other stations retain the frozen original fit; Keio is not added as a circular fit control.

Confirmed floor assignments from [Keio's March 2026 floor plan](https://www.keio.co.jp/train/station/station_map/pdf/in01_shibuya_floor_map.pdf): West gate **1F**, platforms and Central gate **2F**, Avenue gate **4F**. [Mark City's section, brochure pages 5–6](https://www.s-markcity.co.jp/office/pdf/office.pdf?up=20240311), places Keio below the Avenue and shows the rising ground toward Dogenzaka. Neither source supplies usable surveyed floor elevations.

## Realistic and exploded views

Both viewers have explicit Realistic and Exploded controls, and a Keio/Mark City shortcut. Both modes share horizontal coordinates and feature identities.

- **Realistic:** compact **estimated**, unverified heights in the building frame. All station levels use a provisional 5 m interval. Floor surface positions agree between the diagram's drawing units and the unified map's metres. Buildings retain their source heights; station detail is compacted as well as its floor gaps.
- **Exploded:** adjustable illustrative spacing; it must not be interpreted as physical building placement. The slider is shown only in this mode. Returning to Realistic ignores that slider's value.

| Keio feature | Confirmed floor | Assumed display elevation above assumed 1F | Verification |
| --- | --- | --- | --- |
| West gate | 1F | 0 m | Datum unverified |
| Main and arrival platforms; Central gate | 2F | +5 m | Elevation unverified |
| Avenue gate | 4F | +15 m | Elevation unverified |

These numbers are layout assumptions, **not measurements extracted from the drawings**. The common 1F zero coincides with the existing 55 m ellipsoidal comparison plane, which has not been established as Mark City's actual 1F. The map remains flat; sloping street heights and operator-specific floor elevations need calibration. Every level is explicitly marked unverified in `stationHeights.ts`; the UI explains these assumptions in both views. Selecting one floor does not change its vertical datum.

## Evidence still needed

- Dated wide views of West, Central and Avenue gates, their signed floors, adjoining stairs/lifts and building entrances.
- A sequence along the 4F Avenue toward Dogenzaka showing changes in street and floor level.
- Central external lift stop panels and the platform/arrival-platform connections.
- Confirmation of West lift commissioning and stairs C/D closure status. Existing source closure flags are preserved.
- For measured height alignment: dimensioned sections or measured floor elevations tied to an identified vertical datum. Photographs alone cannot establish metre elevations or the PLATEAU datum relationship.

## Validation

Regression checks cover exact public platform coordinates, plan containment of Keio platform/gate areas within Mark City, both-view coordinate parity, connector support, retained gate floors and closure flags, unchanged global fit controls, realistic-height unit conversion and independence from exploded spacing. The existing 645 KB city and 218 KB building assets are unchanged.

Completed: **43 application tests passed**, production build passed, and the rebuilt preview was inspected in both viewers. Realistic/Exploded switching, 2F plan display, West gate 1F and Avenue gate 4F were checked. No browser errors were reported. The Keio source extract is **1,625 bytes**. At the inspected 2F realistic view, the diagram rendered 25,941 triangles / 225 draw calls and the full unified city view 94,105 triangles / 86 draw calls. These are rendering counts, not device-independent frame-rate guarantees.
