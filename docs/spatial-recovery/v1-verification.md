# v1.0 source verification and PLATEAU reference

> Historical review before the source-correction pass. For the current model and remaining inputs, see [Source corrections and remaining evidence](source-corrections.md). Counts and outstanding floor issues below describe the earlier snapshot; the linked machine-readable evidence and geometry reports now describe the corrected model.

Follow-on: the [public-source cross-check](public-source-crosscheck.md) supersedes the earlier JR/Metro image-download limitation and the statement about missing Tokyu exit codes. It reviews every current model feature against an expanded, dated source register.
Reviewed 19 September 2026 against release `v1.0.0` / `3f4f5c4` on `codex/shibuya-spatial-recovery`.

## Assessment

The release is a good interactive schematic, with shared 2D/3D shapes, legible destination associations and functioning floor controls. It is **not yet a geographically verified station model**. The main platform levels agree with the operator plans, but a concourse floor mismatch and incomplete topology need attention before further decorative detail. Passing software tests does not establish real-world accuracy.

## Source comparisons

| Subject | Finding | Evidence and consequence |
| --- | --- | --- |
| Underground platforms | Supported at a broad level | [Tokyu's station diagram and plans](https://www.tokyu.co.jp/railway/station_map/pdf/ty01-shibuya_2.pdf), printed 21 August 2026: Hanzomon/Den-en-toshi at B3; Toyoko/Fukutoshin at B5, with B4 concourse. Does not verify the drawn widths or positions. |
| Hikarie gate area | **Floor correction needed** | The same PDF's combined B2F/B3F plan explicitly labels the Hikarie gates area B3F and shows the transition from B2F. `b2-hikarie-concourse` in v1.0 is B2. Review the connected B5/B6/C-side passages and stairs together; simply moving one slab would create misleading connections. |
| B5 → Hikarie | Supported association | [Hikarie access](https://www.hikarie.jp/access/index.php) identifies exit B5. This is an exit code, not floor B5. Facility floor labels for elevated connections must be kept distinct from station labels. |
| B6 → Scramble Square | Supported association | [Facility access guide](https://www.shibuya-scramble-square.com/sky/access/) names B6 as the underground entrance. Does not verify an interior path or the geometry used in v1.0. |
| C2 → Stream | Supported association, incomplete coverage | [Stream access](https://shibuyastream.jp/access/) confirms C2 and also the JR New South Exit connection. The latter is not a distinct mapped connection in v1.0. |
| Keio / Mark City | Incomplete | [Keio's own station diagram](https://www.keio.co.jp/assets/pdf/global/routes/stations/shibuya/k55_shibuya.pdf) shows platforms/Central Gate on 2F, West Gate on 1F and Avenue Gate on 4F. The current schema ends at 3F. A5 remains a direction toward Mark City, not proof of a direct indoor A5 link. |
| JR central passage | Identity unresolved | [JR's 23 April 2024 diagram](https://www.jreast.co.jp/press/2024/tokyo/20240423_to03.pdf) locates the Central Gate on 3F. `jr-central-concourse` is labelled “JR central passage” on 2F. Establish whether it represents a transfer passage or the gated concourse before changing it. The current JR map image returned HTTP 403 to the downloader, so this is a review item rather than a claim of a complete 2026 JR audit. |
| Selected exits and connectors | Incomplete | Only 20 exits are modelled. Tokyu's larger plan contains further exit groups, lift stopping ranges, slopes and operating restrictions. Current lift/stair placements are illustrative. No accessible-route or live-closure verification was performed. |
| Building envelopes and dimensions | Unverified | All eight envelopes and their display heights remain hand-drawn. The underground PLATEAU resource does not verify those buildings. |

The attached November 2025 illustration is useful for presentation and comparison, but it is older than Tokyu's retrieved August 2026 plan. Treat printed document dates separately from retrieval dates. Tokyu's embedded exit-direction guide has its own 30 August 2024 date. The [Keio entire-station diagram](https://www.keio.co.jp/assets/pdf/global/routes/stations/shibuya/ksb02_shibuya.pdf) contains older gate labels; its availability at an official URL is not sufficient proof of freshness. The [Tokyo Metro map page](https://www.tokyometro.jp/station/shibuya/yardmap/index_print.html) was located, but its map image also returned HTTP 403 to the local downloader. Neither failed image retrieval is counted as a completed current-diagram verification.

The original destination checks for A2, A5, A6 and A12 remain in [explorer-sources.md](explorer-sources.md). They were not all independently rechecked in this pass.

## What PLATEAU now contributes

The [UC24-13 catalog](https://www.geospatial.jp/ckan/dataset/plateau-uc24-13), resource `8e5c37d1-4749-416d-988a-4d15f0fb926c`, describes a west-exit underground passage model based on facility CIM data and visual inspection reflecting **December 2024**. This is a limited demonstration dataset. The wider integrated project area must not be mistaken for this ZIP's coverage. See the [project description](https://www.mlit.go.jp/plateau/use-case/uc24-13/).

The new `/verification` page renders actual decoded source triangles, with a north-up plan, a 10 m reference grid, cutaway control, downloadable model, source links and the findings above. Cutaway mode hides source Room envelopes so they do not obscure the semantic surfaces. The grid is not surveyed ground. Original station geometry is unchanged by this verification pass.

| Check | Result |
| --- | --- |
| Download SHA-256 | `59d54794dd17c6b258ea171a561d3a94b201ab356a9583a51fe1c3cfe23327fc` |
| Selected source tiles | 40 finest leaves from the 59-tile REPLACE tree; parent meshes excluded |
| Decoded content | 342 feature IDs, 4 Room IDs, 24,903 triangles |
| Local coordinate extent | 60.976 m east–west × 63.244 m north–south × 11.704 m vertical |
| Coordinate check | All decoded vertices fall within their leaf's geographic bounds, allowing 1e-7 degrees horizontally and 0.05 m vertically for encoding noise |
| Alignment to the v1.0 drawing | **None established:** zero control points; no RMSE claimed |

The earlier metadata report counted 343 IDs across all LODs. The decoded finest-leaf set has 342; those are different inventories. Repeated feature fragments from separate leaf tiles are retained and grouped under their source ID; parent LODs are not duplicated. The source root height bound is slightly smaller than one descendant's bound, so validation uses the corresponding leaf region, not a fabricated root accuracy value. The tileset's `geometricError` controls rendering refinement; it is not a survey error estimate.

Coordinate processing follows [3D Tiles b3dm transform order](https://github.com/CesiumGS/3d-tiles/tree/main/specification/TileFormats/Batched3DModel) and the source's [CESIUM_RTC convention](https://github.com/KhronosGroup/glTF/tree/main/extensions/1.0/Vendor/CESIUM_RTC): decode Draco; rotate glTF Y-up to tile Z-up; add the ECEF RTC center; transform into local east/up/south metres. The importer rejects unsupported node/tile transforms and changed archive hashes. Its fixed origin is longitude 139.7009682753108°, latitude 35.65740742675032°, ellipsoidal height 0 m. Vertical values are **not** orthometric/sea-level heights or named floors. Mesh vertices are never scaled to match the drawing.

Outputs:

- [Derived model](../../public/plateau/shibuya-west-passage.glb), with original feature IDs, source tile references and attributes in node extras.
- [Machine-readable coordinate report](../../public/plateau/reference.json), including hashes, geographic bounds, per-tile checks and explicit unregistered status.
- [Evidence snapshot manifest](v1-evidence-snapshot.json), recording source URLs, printed dates, retrieval date and hashes for downloaded evidence.

The derived model is processed and recolored by this project. Source: MLIT Project PLATEAU UC24-13. The [PLATEAU site policy](https://www.mlit.go.jp/plateau/site-policy/) supplies attribution and modification requirements under PDL 1.0 / CC BY 4.0-compatible terms. Operator PDFs and source ZIPs are kept in ignored local cache, not bundled with the application.

## Reproduce

The committed derived model runs without Python or external model requests. Python is needed only to rebuild or audit the asset. With Python 3.11 on Windows:

```powershell
python -m venv .cache/plateau-venv
.cache/plateau-venv/Scripts/python.exe -m pip install -r scripts/requirements-plateau.txt
New-Item -ItemType Directory -Force .cache/verification
$plateauSource = 'https://assets.cms.plateau.reearth.io/assets/ae/508f8a-0e19-4be2-bdcc-a21483d44575/uc24-13_shibuyaku_chikagai.zip'
Invoke-WebRequest -Uri $plateauSource -OutFile .cache/verification/shibuya.zip
.cache/plateau-venv/Scripts/python.exe scripts/import_plateau_reference.py .cache/verification/shibuya.zip
.cache/plateau-venv/Scripts/python.exe -m unittest discover -s tests -p test_plateau_import.py
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

Open `http://127.0.0.1:3000/transit-layout/verification`. The importer supports the pinned archive's layout deliberately; a new source revision requires review, not a bypass of the checksum check.

## Follow-on alignment

The [lightweight unified view](lightweight-unified-view.md) now applies a provisional horizontal fit to three named PLATEAU building centres. It records 25.7 m RMS mismatch and exposes its residuals. This is a draft registration, not surveyed entrance accuracy; the original import report's zero-control state describes that earlier asset import. Source floor and topology findings above remain unresolved.

## Work needed before claiming geographic fidelity

1. Correct the B2/B3 Hikarie concourse transition and connected topology; resolve JR passage identity and add the omitted Keio level. Keep facility-specific floor labels separate from elevations.
2. Identify at least three well-distributed, non-collinear matching entrances/corners for the west-passage pilot, plus independent held-out check points. Record feature IDs, source coordinates, correspondence evidence, dates and residuals. Do not stretch the schematic until it looks aligned.
3. **City reference now available:** the follow-on [geographic area view](geographic-area.md) uses the newer 2025 Shibuya ward release, with 41,809 source buildings. Hikarie, Stream and Mark City have exact named-feature matches and support the provisional fit described above. The other five schematic destinations still need reviewed identities. Original hand-drawn envelopes remain unchanged in the original diagram; the compact geographic view renders simplified source envelopes. Audit survey dates and post-survey redevelopment separately.
4. Produce a discrepancy table for horizontal position, elevation, footprint and connectivity. Unknown correspondence remains unknown. Once checks pass, render the verified geometry and derive an exploded presentation from it.

Validation for this change: five coordinate/asset tests and the eleven existing application tests pass; production export passes lint and type checks. Browser checks cover loading the source mesh, the cutaway slider, north-up view and responsive presentation. This validates the implementation, not complete station accuracy.
