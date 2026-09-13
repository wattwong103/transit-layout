# transit-layout

An interactive Shibuya station and neighborhood atlas. The homepage now uses a rotatable WebGL model and a matching SVG floor plan, with shared geometry and selection IDs.

Version 1.0.0 is the first official release of this schematic explorer. See the [release notes](CHANGELOG.md).

- **3D model:** orthographic reference view, shaped slabs, platforms, vertical connectors, adjustable floor separation and floor isolation.
- **2D plan:** the same polygons and connector openings, with pan, zoom and readable exit badges.
- **Station / Buildings / Both:** switch from station interiors to eight schematic surrounding building envelopes.
- **Exit connections:** select a building or exit to inspect documented associations. Solid links mean direct building connections; dashed links mean an exit toward a destination. The diagram includes 20 selected exits, not complete station coverage.

All shape coordinates, building envelopes, elevations and connector placements remain **schematic**. Source-backed destination relationships do not establish measured geometry or turn-by-turn routes. Building interiors, accessible routes and current closures are not mapped.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. On Windows PowerShell with script execution restricted, use `npm.cmd`.

```sh
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The production build exports a static site under `out/` with the `/transit-layout` base path. Tests compile to the ignored `.test-dist/` directory. React 18 uses React Three Fiber v8; the 3D component loads on demand.

The active scene is maintained in `src/data/explorer.ts`, with its schema in `src/types/explorer.ts`. Destination associations carry source URLs and dates independently of the renderer. [Explorer design and verification](docs/spatial-recovery/explorer-rebuild.md) and [destination source notes](docs/spatial-recovery/explorer-sources.md) explain the current scope.

The [spatial recovery audit](docs/spatial-recovery/audit.md) records the original prototype findings and public geometry inspection. A measured station model, complete coverage, editing, media uploads and persistence remain later work from the recovery plan. Legacy SVG rendering and routing components are retained for comparison and regression tests, and are no longer the homepage.

The [source register](docs/spatial-recovery/source-register.json) records the earlier public geometry investigation. Downloaded models and railway PDFs are not bundled. `scripts/inspect_plateau_archive.py` reproduces the model archive inspection with Python 3 and no third-party packages.

To inspect the production export locally, run `npm run build` followed by `npm run preview`. The preview serves only on `127.0.0.1:3000/transit-layout/`, matching the production base path.

The 14 September 2026 handoff passed 11 tests and the production build, with desktop and mobile viewport checks. [Production screenshots and remaining scope](docs/spatial-recovery/explorer-rebuild.md#production-handoff-14-september-2026) are saved with the repository.
