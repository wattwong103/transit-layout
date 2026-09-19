# Changelog

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
