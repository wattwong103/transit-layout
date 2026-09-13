# Reference-style station and district explorer

User request (2026-09-12): replace both unsatisfactory views with a rotatable 3D model opening at the supplied exploded isometric diagram's angle, and allow switching between station and surrounding buildings to understand exit destinations. The user explicitly chose rotatable 3D with a reference-style preset.

## Design

A large light-background canvas replaces the cramped split screen. 3D uses actual Three.js geometry, orthographic projection, orbit/pan/zoom and a reset preset. Irregular concourses, narrow branching passages, colored platform strips and stepped connectors form the station; there are no full rectangular floor plates. A separation slider adjusts display offsets only. A top-down SVG floor plan uses the same polygons and IDs. A sidebar contains the three context modes, floor isolation, building and exit selection, and source-linked destination details.

Buildings are muted extruded context envelopes. Station mode hides them, Buildings mode shows envelopes and exit destination links, Both shows the combined view. Selecting an exit highlights its building association; selecting a building reveals linked exits. Direct building links and exits pointing toward a destination have distinct labels and line styles. Coordinates, envelope heights and connector placement are explicitly schematic. The attached November 2025 illustration is the visual reference; current operator maps support destination labels, without upgrading schematic shapes to measured geometry.

## Interfaces and work

Shared contract: `src/types/explorer.ts`. No legacy source IDs are silently reinterpreted; the new scene has its own stable IDs. Legacy rendering and routing code stays available for reference/tests, while the home page uses the new explorer.

| Work | Owner | Shared contract check |
| --- | --- | --- |
| Source association review | Research agent | Supplies cited direct/toward relationships; does not edit source files |
| 3D renderer | Renderer agent | Consumes ExplorerViewProps; owns only new 3D component/helpers |
| Scene data, 2D, controls and integration | Root | Produces ExplorerDataset and same selection ID for both views |
| Review and browser validation | Review agent + root | Check actual toggles, linked destinations, isolation, source honesty, disposal and resize |

## Progress

- Design and interaction direction approved by user.
- Shared dataset, React Three Fiber renderer, matching 2D plan and homepage integration complete.
- Station / Buildings / Both controls, selection, source details and responsive layout complete.
- Regression checks, production export and desktop/mobile browser verification complete on 14 September 2026.
- Viewer work package complete. Measured geometry, complete station coverage and editing/media/persistence remain separate roadmap work.

## Implemented refinement and validation (12 September 2026)

The homepage uses React Three Fiber 8.18 with React 18. Its orthographic WebGL canvas owns rendering, resize and demand scheduling. Canonical shape records drive beveled slabs and openings in both views. Stairs have treads, landings and rails; escalators add side panels; lifts have blue shafts and landing doors. Platforms add tactile edge strips, with illustrative gates and columns revealed on zoom. All such details are diagram decorations, not a survey or verified navigation network.

Geometry construction is limited to data and floor-separation changes. Selection, context and floor changes reuse meshes and buffers; materials and visibility update in place. Static mesh parts and outlines are batched within each selectable feature. The observed full-station frame dropped from 1,307 to 272 draw calls after batching. Mobile building mode used 57 draw calls. These are browser rendering counters, not measured phone frame-rate guarantees. Shadows use 512px maps in narrow canvases and 1024px on desktop; rendering is demand-driven.

Browser checks on the integrated development page:

- Desktop at 1280 × 720 and responsive viewport at 390 × 844.
- Actual orbit gesture changed projected labels without selecting a feature; Reference view restored the preset.
- Keyboard selection of B5 preserved focus on its label. Geometry revision remained 1 across selection.
- B5 highlighted Hikarie with a direct source-linked association. A5/Mark City remained directional.
- Buildings mode hid station slabs; selecting a building retained the chosen Buildings context.
- Floor isolation removed off-floor exits in both views. Selection persisted across 3D/2D changes.
- Mobile Explore drawer, context controls, selection summary and 2D plan were exercised.
- Ten tests passed, covering source/ID integrity, association filtering, floor/context invariants, upper-floor/intermediate-shaft openings and the six prior route-display regressions.
- TypeScript and ESLint passed. Independent review found no remaining actionable blockers after connector-selection, focus, floor-filter and context-framing fixes; batching was re-reviewed separately.

Production build and static-export browser checks are recorded below. Visual acceptance remains a user judgment against the reference; this update is a working schematic atlas, not the completed measured station dataset from the recovery plan.

## Paused at user request

12 September 2026: production build completed successfully after the final renderer changes. All working changes remain uncommitted on `codex/shibuya-spatial-recovery`. The development server was stopped before the build.

At this checkpoint the remaining work was the production-export smoke check, saved screenshots and visual review against the user's reference. The user resumed this work on 14 September; the completed checks follow.

## Production handoff (14 September 2026)

The exported homepage at `http://127.0.0.1:3000/transit-layout/` renders the new WebGL explorer. The production preview uses the same base path as GitHub Pages. Run `npm.cmd run build` followed by `npm.cmd run preview` to reproduce it.

Final refinements preserve exit badges above building envelopes, keep the selected destination association visible in Buildings mode, and separate colliding floor labels with small leaders. In the 2D plan, building names move clear of exit badges at desktop and mobile scales. Shadows use the supported Three.js PCF mode. CI now runs the regression suite before building.

| Check | Result |
| --- | --- |
| `npm.cmd test` | 11 passed: six legacy route regressions and five explorer data, selection, openings and label-layout checks |
| `npm.cmd run build` | Passed compilation, ESLint, TypeScript and static export; reported home first-load JS is 100 kB, excluding the lazy 3D chunk |
| Production context and selection | Station, Buildings and Both rendered; Mark City exposed A5 as a directional association; Hikarie exposed B5 as a direct connection |
| Keyboard and allocation | Activating Exit B5 retained focus and geometry revision 1 |
| Camera interaction | A pointer drag rotated the projected model without changing selection; Reference view restored the previous preset label position |
| Floor isolation and shared state | Off-floor exits disappeared; B5 selection survived switching to the B2 floor plan and choosing another floor |
| Responsive browser | 1280 × 720 desktop and 390 × 844 mobile; Explore/Close drawer, source details, plan controls and separated floor labels checked |
| Visual evidence | Saved production screenshots linked below |

The browser checks are desktop-hosted responsive tests, not physical-phone frame-rate measurements. The build reports an outdated Browserslist database notice. React Three Fiber v8 also triggers Three.js's upstream `Clock` deprecation warning; it did not prevent rendering or interaction. No application runtime errors were observed during the checked production interactions.

Saved previews:

- [Station and Hikarie](previews/station-and-hikarie.png)
- [Buildings and Mark City](previews/buildings-mark-city.png)
- [B2 floor plan](previews/floor-plan-b2.png)
- [Mobile station and Hikarie](previews/mobile-station-and-hikarie.png)
- [Mobile floor plan](previews/mobile-floor-plan.png)

At the initial handoff, changes were saved on `codex/shibuya-spatial-recovery` without a commit, push or deployment. The supplied illustration guides the composition; the current 20 selected exits, eight building envelopes, connector details and floor shapes remain schematic and incomplete. The viewer rebuild and validation are complete; the entire spatial-recovery roadmap is not.

## Version 1.0 acceptance (14 September 2026)

The user accepted the current appearance as good enough for this release and explicitly requested pushing it as the official version 1.0. The package version and release designation are `1.0.0`, with Git tag `v1.0.0`. [Release notes](../../CHANGELOG.md) describe the delivered scope and remaining limitations.
