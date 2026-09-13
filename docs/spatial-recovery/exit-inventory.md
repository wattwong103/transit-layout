# Initial exit inventory

Inventory review date: 2026-09-12. **Status: incomplete and unreconciled.** Existing records are schematic and do not establish current sign text, access, location, aliases, or counts. None has independently verified inside/outside endpoints. Do not use five existing records as the expected-exit denominator.

| Existing ID | Floor label | Existing label | Existing code | Evidence |
| --- | --- | --- | --- | --- |
| `central_exit` | 3F | Central Exit | A8 | `src/data/nodes.ts:30` |
| `south_gate` | 2F | South Gate | South | `src/data/nodes.ts:138` |
| `new_south_exit` | 2F | New South Exit | New South | `src/data/nodes.ts:147` |
| `hachiko_exit` | 1F | Hachiko Exit | Hachiko | `src/data/nodes.ts:232` |
| `miyamasuzaka_exit` | 1F | Miyamasuzaka Exit | A7 | `src/data/nodes.ts:241` |

Candidate sign groups visible in the [Tokyu operator PDF](https://www.tokyu.co.jp/railway/station_map/pdf/ty01-shibuya_2.pdf) include A0–A8, A12, B1–B7 and C1–C3. This is a partial extraction for reconciliation, not a complete inventory of doors, sub-exits, elevator exits or current open routes. The document includes both 2026-08-21 and older section dates. Do not equate `central_exit`/A8 or `miyamasuzaka_exit`/A7 to a current operator sign without verifying the association.

The [Keio floor guide](https://www.keio.co.jp/train/station/station_map/pdf/in01_shibuya_floor_map.pdf) supplies Central, West and Avenue exit labels and includes 1F, 2F and 4F. These have not been matched to prototype records or to the proposed broader boundary. JR exits and all facility/public-space entrances require their own inventories.

For the next pass, assign stable exit IDs separately from display codes. Record source section/date, current sign text, aliases, facility, level, inside/outside endpoints, open/closed/unknown state, and evidence. Reconcile duplicates only from evidence; a shared label does not establish a shared doorway. Preserve replacement mappings for renamed/retired/split records before attaching photos.
