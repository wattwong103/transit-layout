# Changelog

## 1.3.0 — 2026-10-10

This release unifies the destination buildings across the diagram and geographic map, adds optional source PLATEAU geometry, and makes public entrance references available for alignment comparison before photos.

- Add optional source PLATEAU meshes for the eight destination buildings in both 3D views. Preserve all 17,237 source triangles, roof shapes and heights in a 218 KB download without textures. Solid/translucent display, lazy loading, fallback and source attribution are included. See the [mesh validation record](docs/spatial-recovery/plateau-3d-buildings.md).
- Share all eight PLATEAU destination outlines, including multipart shapes and holes, between the diagram, SVG plan and unified map. Five previously unresolved building identities now have documented, unique public-map matches.
- Add 21 attributed public entrance references at their geographic coordinates, with selected comparison lines, source dates/floor tags and branch-match limits. Schematic landings remain distinct; unverified connecting routes are not invented.
- Keep the 645,153-byte city asset unchanged. The shared outline subset is 3,652 bytes; entrance evidence and the identity crosswalk add 12,345 bytes of source data. Retain on-demand rendering and optional heavy layers.
- Document missing entrance references, branch and floor questions, and the photos/plans still required. Preserve the original 25.7 m RMS station fit and the baseline operator evidence.

All 49 automated tests pass (40 application and nine Python tests), including an independent comparison of the shipped 3D meshes against the separately derived plan envelopes and source heights. See the [final alignment and performance checks](docs/spatial-recovery/v1.3-validation.md), [public alignment record](docs/spatial-recovery/pre-photo-alignment.md) and [photo checklist](docs/spatial-recovery/photo-verification.md). These checks validate rendering and internal consistency; current construction, complete equipment coverage and surveyed station alignment remain unverified.

## 1.2.0 — 2026-10-10

This release makes selected station floors larger and easier to inspect, and provides a clearer lightweight map comparison.

### Changes

- Reframe the 3D diagram and unified map around visible floors. Hidden floors no longer determine the view; switching floors preserves the orbit angle.
- Add a flat PLATEAU footprint view for station focus, preserving source coordinates, concave outlines and holes. The Neighbourhood preset shows opaque source-height buildings; the station preset restores a quieter footprint context.
- Show one level at a time in north-up comparison, starting at 1F when switching from the all-level overview. The active floor and its description stay visible on the map.
- Add zoom/reset controls, an explicit station/city legend, stronger edge smoothing and direct mobile floor/view controls.
- Retain the 645,153-byte city file and render only on changes. Footprint mode reduces the default scene's triangle count without adding a second city download.

### Verification and scope

All 39 automated tests passed (32 application and seven Python tests), along with the production build and desktop/mobile browser checks. The default unified scene renders 21,493 triangles versus 81,444 in v1.1, about 74% fewer; the city download remains 645 KB. See the [v1.2 validation record](docs/spatial-recovery/v1.2-validation.md).

This is a presentation update. Station coordinates, lift stops, source building heights and the provisional 25.7 m RMS registration fit are unchanged. Public sources were last reviewed on 19 September 2026; current operation and the deferred [photo verification](docs/spatial-recovery/photo-verification.md) remain unconfirmed.

## 1.1.0 — 2026-09-19

This release places the station diagram alongside lightweight PLATEAU city geometry and applies the floor, gate and equipment corrections supported by operator sources.

### Features and corrections

- Added a shared geographic view with 3,101 simplified buildings in a 645 KB city file, a GSI map background and matching north-up/3D views. The detailed west passage and full ward viewer remain optional.
- Corrected the Hikarie B3 concourse and slope, A12/B1/B5/B7 landing floors, B5 platform numbering, JR gate levels, and Keio West 1F / Avenue 4F areas.
- Represented 31 source-identified lifts and lettered stairs, with explicit lift stops or documented range endpoints. Lift 21 does not gain a B1 stop merely because its shaft passes that floor.
- Added 15 named gates, 19 amenity markers and a Keio West works marker. Published hours, closure states and direction notes appear in feature details.
- Added an Access list, shared city-view feature selection and a review of all 186 current features against 22 source references.
- Fixed transformed connector openings, the detached A1 anchor, plan-to-3D axis consistency and coplanar flicker at overlapping passage joins.

### Verification and scope

All 35 automated tests passed (28 application tests and seven Python geometry/import tests), along with the production build and browser checks of the 3D diagram, 2D plan, unified city views and source review. The source-asset audit covers both station coordinate frames and every compact city envelope. The large source archives remain outside the repository and default browser download. See the [release validation record](docs/spatial-recovery/v1.1-validation.md).

Station geometry and elevations remain schematic. The draft fit has 25.7 m RMS building-centre mismatch, with no independent surveyed entrance checkpoints. Some equipment identities, complete access boundaries and five building matches remain unresolved. Published source conditions do not establish live operation or complete accessible routes.

**Photo verification is pending after v1.1.0.** The required views, unresolved equipment and acceptance criteria are recorded in the [photo verification checklist](docs/spatial-recovery/photo-verification.md). Measured plans or survey coordinates are still needed for precise placement.

## 1.0.0 — 2026-09-14

The first official release replaces the previous SVG overview with an interactive Shibuya station and neighborhood explorer.

### Features

- Rotatable React Three Fiber 3D model with an orthographic reference preset, adjustable floor separation and floor isolation.
- Shaped floor slabs, connector openings, stairs, escalators, blue lift shafts and platform details.
- A matching 2D floor plan with shared geometry, selection, pan and zoom.
- Station, Buildings and Both modes covering eight schematic levels, eight building envelopes and 20 selected exits.
- Source-linked destination details, with distinct direct connections and directional exit associations.
- Responsive Explore and Details controls, keyboard selection and collision-aware labels.
- Reused and batched 3D geometry to reduce rendering work during selection.

### Repairs and verification

- Preserved legacy route bends, traversal direction, floor-transition labels and displaced lift endpoints.
- Added source investigation notes, reproducible archive inspection and saved production previews.
- Added 11 regression tests and enabled them in the deployment workflow.
- Passed production compilation, lint and TypeScript checks, plus desktop and mobile viewport browser checks.

### Scope

Geometry, elevations and connector placement remain schematic. Exit associations are not validated walking routes. Complete station coverage, measured geometry, building interiors, accessibility/closure mapping and editing/media/persistence remain future work.
