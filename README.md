# transit-layout

An interactive Shibuya station and neighborhood atlas. The homepage now uses a rotatable WebGL model and a matching SVG floor plan, with shared geometry and selection IDs.

Version **1.4.0** opens with an exploded diagram inspired by the operator reference: cream floor plates, colored platforms, compact blue floor callouts, yellow exit badges and visible destination associations. Buildings use flat shared PLATEAU outlines in this diagram; switch to Realistic to compare source building heights. **Expand diagram**, zoom buttons and floor isolation provide closer views. See the [release notes](CHANGELOG.md) and [v1.4 validation record](docs/spatial-recovery/v1.4-validation.md).

Keio, Ginza and JR platform boundaries now follow attributed public-map geometry, with confirmed operator floor labels and explicitly estimated heights. The [geometry detail view](docs/spatial-recovery/platform-size-detail.md) adds an enlarged 3D view and a metric plan with dimensions. The [Keio](docs/spatial-recovery/keio-mark-city-alignment.md) and [Ginza/JR](docs/spatial-recovery/ginza-jr-alignment.md) records explain the local corrections, source dates and limits.

All eight PLATEAU destination outlines are shared across both views, with 21 attributed public entrance references at map coordinates. The city file remains 645 KB; the shared outline subset is 3.7 KB. See the [pre-photo alignment record](docs/spatial-recovery/pre-photo-alignment.md) and [remaining photo checklist](docs/spatial-recovery/photo-verification.md). Station interiors remain schematic, with the original 25.7 m RMS fit retained.

Enable **PLATEAU 3D buildings** in Buildings/Both mode or the unified map to load the eight source meshes, including their roof shapes, setbacks and source heights. This optional 218 KB file preserves 17,237 triangles without textures. Flat plans and the lightweight default remain available. [Source mesh details and checks](docs/spatial-recovery/plateau-3d-buildings.md).

- **3D model:** orthographic reference view, shaped slabs, platforms, vertical connectors, adjustable floor separation and floor isolation.
- **2D plan:** the same polygons and connector openings, with pan, zoom and readable exit badges.
- **Station / Buildings / Both:** switch from station interiors to eight shared PLATEAU outlines. Simple diagram building heights are illustrative; the optional source meshes retain PLATEAU proportions and heights.
- **Exit connections:** Both mode shows eight documented associations by default. Select a building or exit to isolate its links, or turn off All connections for a quieter overview. Solid links mean direct building connections; dashed links mean an exit toward a destination. Endpoints touch the nearest outer building envelope for legibility; they are not verified doors or walking paths. The diagram includes 20 selected exits, not complete station coverage.

Station interiors, elevations and connector placements remain **schematic**. Building plan outlines retain PLATEAU source coordinates; blue public entrance references retain OSM coordinates, separate from schematic landings. Source-backed destination relationships do not establish measured geometry or turn-by-turn routes. Building interiors and complete accessible routes are not mapped. Published closures, hours and explicit lift stops are represented with their source limits; live operating status is unverified.

```sh
npm ci
npm run dev
```

Use Node.js 22 or newer (CI uses Node 24). Open `http://localhost:3000`. On Windows PowerShell with script execution restricted, use `npm.cmd`.

```sh
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The production build exports a static site under `out/` with the `/transit-layout` base path. Tests compile to the ignored `.test-dist/` directory. React 18 uses React Three Fiber v8; the 3D component loads on demand.

The active scene is maintained in `src/data/explorer.ts` with source corrections in `src/data/sourceCorrections.ts`, with its schema in `src/types/explorer.ts`. Destination associations carry source URLs and dates independently of the renderer. [Explorer design and verification](docs/spatial-recovery/explorer-rebuild.md) and [destination source notes](docs/spatial-recovery/explorer-sources.md) explain the current scope.

The [spatial recovery audit](docs/spatial-recovery/audit.md) records the original prototype findings and public geometry inspection. A measured station model, complete coverage, editing, media uploads and persistence remain later work from the recovery plan. Legacy SVG rendering and routing components are retained for comparison and regression tests, and are no longer the homepage.

The [source register](docs/spatial-recovery/source-register.json) records the earlier public geometry investigation. Source archives and railway PDFs are not bundled. `scripts/inspect_plateau_archive.py` reproduces the metadata inspection with Python 3 and no third-party packages.

The **Sources & real-world reference** page (`/verification`) adds a decoded, attributed PLATEAU model of the west-exit underground passage, with a metric grid and cutaway. The [v1.0 verification report](docs/spatial-recovery/v1-verification.md) records operator-map findings, known floor/topology gaps, source dates, coordinate checks and reproducible import instructions. The derived GLB is bundled in `public/plateau`; its geographic frame is shared by the new draft station registration, while precise surveyed alignment remains unverified.

The **Unified city + station** page (`/area`) is the lightweight geographic view: 3,101 simplified PLATEAU building envelopes around the station in a 645 KB geometry file, a bounded GSI map background and the station drawing in a common local metric frame. 3D and north-up plan views use the same coordinates. A uniform horizontal fit to Hikarie, Stream and Mark City has **25.7 m RMS building-centre mismatch**; it is provisional, with no surveyed entrance checkpoints. Station floor elevations remain illustrative. The detailed west-exit passage loads only when enabled. [Lightweight model and draft alignment](docs/spatial-recovery/lightweight-unified-view.md) records sizes, processing, controls, residuals and limits.

The **Full ward source viewer** (`/area/full`) retains the 41,809-building dataset, textured source layers, aerial photography and terrain for optional inspection. The complete four selected layers have an ignored local audit cache of approximately 509.5 MB; this was never a single mandatory page download. The full viewer streams official tiles and uses more resources. Its Cesium runtime is not loaded by the lightweight view. `predev` and `prebuild` package the optional runtime locally under ignored `public/cesium`, with no ion account or token required. [Full source coverage](docs/spatial-recovery/geographic-area.md) records dates and provenance.

To inspect the production export locally, run `npm run build` followed by `npm run preview`. The preview serves only on `127.0.0.1:3000/transit-layout/`, matching the production base path.

The 14 September 2026 handoff passed 11 tests and the production build, with desktop and mobile viewport checks. [Production screenshots and remaining scope](docs/spatial-recovery/explorer-rebuild.md#production-handoff-14-september-2026) are saved with the repository.

The [source corrections and remaining evidence](docs/spatial-recovery/source-corrections.md) describe the current branch: nine levels, 59 spaces, 64 connectors, 20 exit codes and 35 gates/amenities/works markers. Hikarie and exit floor issues are corrected, JR gate areas and lifts A–F are present, and Keio includes West 1F and Avenue 4F. Thirty-one source-identified lifts and lettered stairs are linked to schematic features. Use the **Access** tab or the city view's **Station features** selector to inspect stops and published conditions.

The `/verification` page exposes the current feature-by-feature evidence register, including the remaining measured and on-site evidence needed. The published v1.3 suite contained 40 application and nine Python tests, covering source meshes, shared outlines, entrance references, registration, floor support and camera framing. The v1.1 full operator-source audit remains the station baseline. Later Keio, Ginza and JR corrections change their local geometry while the global registration fit remains unchanged. Building and public entrance references were added on 10 October 2026. Internal consistency passes; precise geographic alignment, full equipment coverage and current operations remain unverified. Earlier [geometry](docs/spatial-recovery/final-geometry-check.md) and [public-source](docs/spatial-recovery/public-source-crosscheck.md) reports are retained as historical snapshots.

Photo verification remains pending in v1.4.0. The user will provide photos later; the [photo verification checklist](docs/spatial-recovery/photo-verification.md) records the requested views, evidence fields and acceptance criteria. Surveyed geometry and live access conditions remain unverified.

The [v1.2 validation record](docs/spatial-recovery/v1.2-validation.md) covers the presentation changes. Station focus defaults to flat PLATEAU footprints; Neighbourhood shows source-height building envelopes. North-up comparison displays one floor at a time. Mobile users can change floors and views directly on the map.
