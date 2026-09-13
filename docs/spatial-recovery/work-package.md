# Spatial recovery: first work package

Plan reviewed: `C:/Users/north/Desktop/shibuya-spatial-recovery-plan.md`.
Audit date: 2026-09-12. Baseline: `be47f97dc3f2ec884756717a104adcc8d6924847`.

The attached plan is a proposed roadmap. This work package executes its immediate prototype audit and source feasibility check, then repairs verified viewer defects. A complete metric station, reconciled exit inventory, photo editor, and publishing system depend on subsequent evidence and implementation.

This document records the initial bounded work package. The user's later request to replace both views superseded the original layout/renderer constraints below. The [explorer rebuild and production handoff](explorer-rebuild.md) records that completed extension as of 14 September 2026; the original source investigation and route regressions remain applicable.

## Decisions

- Retain Next.js, SVG floor/isometric views, stable record IDs and the explicit graph.
- Treat existing coordinates, elevations, route durations and connections as unverified schematic content. Never relabel the legacy drawing as metric.
- Inspect the public west-exit passage archive before choosing a pilot or converter.
- Record unknown dates, controls, elevations and reuse terms explicitly; do not fill them with guesses.

## Task 1: audit and sources

Produce an evidence-backed keep/repair/replace matrix, a source register, candidate coverage and exit inventories, archive inspection evidence, a pilot decision and an explicit gap list. The inventory is incomplete and cannot supply a complete-coverage percentage. Preserve source coordinates and source IDs; do not import geometry into the schematic map without registration.

## Task 2: repair verified display defects

Implement only these bounded changes, preserving the public UI layout and all source data:

1. Preserve the complete sequence of route node IDs in the Route record, independently of human-readable merged instructions. Both 2D and isometric route paths must consume that sequence so consecutive walkway bends survive formatting. Floor transitions and direction arrows must still work. Keep merged instructions readable.
2. Use the actual minX and minY from the floor viewBox for its background and deselection hit target.
3. Elevator overview rendering must use both actual endpoint XY values. For displaced endpoints, draw an explicitly schematic connection joining those positions; do not draw a vertical shaft at only one endpoint or imply it is measured geometry. Preserve aligned-shaft rendering where endpoints align.
4. Display a concise, always-visible schematic status: shapes, heights and routes are unverified. Call the overview a schematic stack, not an assembled metric 3D model. Do not add guessed geometry, elevators, accessibility routes, dimensions or closure statuses.
5. Add focused regression tests for route bends, directed/reverse traversal, different-floor segment filtering, and non-mutating endpoint projection. Use the installed TypeScript compiler and Node built-ins if practical; avoid additional runtime libraries. Expose a repeatable test command. Run lint, TypeScript and these tests. Do not broaden into media/editor work.

## Task 3: review and validation

Independently review the resulting work against the scope above. Run a production build and inspect the app in a browser if available. Record limitations instead of claiming field validation or phone performance from desktop checks.

## Progress

- Baseline lint and TypeScript: pass.
- Audit: complete; see `audit.md` and `exit-inventory.md`.
- Source feasibility: complete for the first work package; west-exit archive headers and metadata inspected, source register and provisional envelope recorded. Mesh decoding and registration remain subsequent work.
- Display repairs: complete; six regression tests, lint and TypeScript pass after the arrival-label fix.
- Final review: source package approved; code spec and quality approved after distinguishing incoming and outgoing floor labels.
- Initial production build: static export passed with the schematic status and stack label. The replacement explorer subsequently passed its production and responsive browser checks; see `explorer-rebuild.md` for current evidence.
- Initial delivery: changes remained uncommitted on `codex/shibuya-spatial-recovery`; no source geometry was imported. The subsequent explorer rebuild was accepted for official version 1.0; see `explorer-rebuild.md` for the release scope.
