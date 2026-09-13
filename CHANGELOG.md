# Changelog

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
