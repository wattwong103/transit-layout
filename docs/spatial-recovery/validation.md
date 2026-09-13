# First work package validation

Historical validation for the initial audit and display repairs. The later viewer rebuild was completed and checked in the production browser on 14 September 2026; see [current explorer verification and screenshots](explorer-rebuild.md#production-handoff-14-september-2026). The browser limitation below applies to this earlier checkpoint, not to the final explorer.

Environment: Windows, Node 24.14.1, installed Next.js 14.2.35, Python 3.11.9. Baseline `be47f97`; update branch `codex/shibuya-spatial-recovery`. Validation date: 2026-09-12.

| Check | Result |
| --- | --- |
| Baseline lint / TypeScript | Passed before changes |
| Public archive inspection | All 59 referenced b3dm payloads found; headers, batch-array lengths and glTF JSON checked; report saved with SHA-256 |
| Source register | Seven unique source IDs; required source/date/authority fields present; unknown values explicit |
| Pilot GeoJSON | Closed five-position ring with correct Polygon nesting; source reference resolves |
| Initial app smoke check | Dev server returned HTTP 200; initial page, floor controls and route picker loaded; Hachiko Exit → Tokyu Toyoko Line Platform produced a five-step route |
| Repair regression tests | Six tests passed after the arrival-label fix, including merged bends, directed/reverse traversal, floor re-entry, arrival/departure indicators and immutable endpoint projection |
| Lint / TypeScript / production export | Passed after the fix; static export generated successfully (home first-load JS: 152 kB reported by Next.js) |
| Final exported HTML | Contains the schematic status and stack label |
| Source geometry preservation | `git diff --exit-code -- src/data` passed: original source records unchanged |
| Independent review | Source package approved. Code spec and quality approved after fixing the incoming-floor indicator; scoped re-review found no new regression. |

The browser smoke check was performed during implementation. Further Computer Use was stopped by its URL-verification guard, so there is no final screenshot or completed desktop/mobile visual acceptance pass. A transient hot-reload error during replacement of RoutePath resolved after the new file was written. The development server was stopped before the production build to avoid concurrent writes to `.next`.

Commands: `npm.cmd test`, `npm.cmd run lint`, `npm.cmd exec tsc -- --noEmit`, `npm.cmd run build`, and `git diff --check`. The build emitted an outdated Browserslist database notice; it did not fail compilation or export. No new runtime dependency was added. The existing deployment configuration targets Node 20; the local checks used Node 24 and do not constitute a separate Node 20 execution test.

There has been no field verification, mesh decoding, source registration, independent checkpoint measurement, measured vertical alignment, phone performance testing, complete exit reconciliation, upload durability or editing/publishing test. These are outstanding phases, not passing acceptance checks.
