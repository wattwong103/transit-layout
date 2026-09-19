# Shibuya geographic area

Checked 19 September 2026. The full source viewer is now at `/area/full`; the default `/area` is the [lightweight unified city and station view](lightweight-unified-view.md). The full viewer uses the Shibuya ward building dataset, extending well beyond the UC24-13 west-exit demonstration passage. This does not mean all of Tokyo or complete station interiors.

## Data acquired

The [official PLATEAU streaming catalog](https://docs.plateauview.mlit.go.jp/datasets/explorer/) exposes a 2025 Shibuya ward release, city code `13113`. Exact versioned URLs and the catalog snapshot hash are in [plateau-city.json](../../src/data/plateau-city.json). All content in the four selected tileset trees was downloaded, including parent LODs needed for streaming:

| Layer | Content tiles | Downloaded content bytes |
| --- | ---: | ---: |
| Buildings, textured LOD1/2 | 730 | 449,059,344 |
| Detailed roads, LOD3 | 97 | 23,819,460 |
| Bridges, LOD2 | 115 | 20,881,316 |
| Underground spaces, LOD4 | 122 | 15,734,860 |
| Total | 1,064 | 509,494,980 |

The [download manifest](city-download-manifest.json) preserves every content file's SHA-256, size and source URL, plus root tileset checksums and bounds. Files are cached under `.cache/plateau-city/2025/`. All 1,064 embedded glTF documents were inspected: none references external buffer or image dependencies. The browser streams the same versioned official URLs on demand, rather than packaging this cache in the static site. Terrain and basemap imagery are separate online services and are not mirrored.

The [building inventory](city-building-index-summary.json) deduplicates feature IDs from 528 finest building leaves: **41,809 buildings**, comprising 37,234 LOD1 and 4,575 LOD2 records. Thus the catalog's LOD2 label does not imply detailed roofs/textures for every building. Roads, bridges and underground data have their own coverage; their presence does not establish continuous station connectivity.

**Release year is not survey year.** 38,220 building records have survey attribute `2021`; 3,589 have source code `0001`, treated as unspecified. Neither the 2025 release nor GSI's live service URLs establish present-day redevelopment conditions. Photography can also differ in date from geometry.

## Geographic placement

Cesium renders native 3D Tiles in their published geographic coordinate frame, without a hand-fitted translation, rotation or scale. GSI [pale maps and seamless photography](https://maps.gsi.go.jp/development/ichiran.html) use the documented Web Mercator XYZ scheme. The viewer limits imagery to the Tokyo region and requests supported zoom levels 2–18. GSI attribution is visible in the scene.

[PLATEAU terrain](https://docs.plateauview.mlit.go.jp/datasets/terrain/) supplies ellipsoidal heights compatible with the geographic scene. Its provider attribution includes the underlying terrain sources. If terrain loading fails, the UI reports that height comparison is unavailable. Native model placement is not modified to make the ground appear to fit.

The independently decoded west-exit passage has local axes east/up/south and units of metres. Its origin is 139.7009682753108° E, 35.65740742675032° N, ellipsoidal height 0 m. Its vertices already contain absolute local vertical values. The scene uses that origin's east/north/up frame, Y-up conversion, `forwardAxis: X`, and scale 1. No floor-height offset or terrain clamping is applied. A regression check transforms every published GLB vertex back to longitude/latitude/ellipsoidal height and reproduces the source bounds to 1e-7 degrees and 1 mm. This checks coordinate preservation, not survey accuracy.

The existing passage is recolored cyan; underground city features are gold. Building selection is highlighted and opacity is adjustable. Fixed daylight improves visibility without changing geometry. The passage preset makes the terrain transparent, lowers building opacity and switches off roads/bridges that would otherwise obscure the passage. The independent layer controls can restore them. This does not infer access routes or connect disconnected source meshes.

## Building identities

[Reviewed landmark records](../../src/data/plateau-landmarks.json) retain exact source feature IDs, bounds, centroid attributes, survey attributes and source tile paths:

| Destination | Exact source name | Longitude | Latitude | Source measured height |
| --- | --- | ---: | ---: | ---: |
| Hikarie | 渋谷ヒカリエ | 139.703663 | 35.659084 | 173.6 m |
| Stream | 渋谷ストリーム | 139.703170 | 35.657213 | 171.3 m |
| Mark City | マークシティ | 139.698635 | 35.658261 | 98.0 m |

These are named building features, not surveyed entrance control points. The model may represent a multipart building or building group. Source `_zmin/_zmax` metadata is preserved in the index but is not used to translate meshes or relabel floors. Displayed measured heights are source attributes, not floor elevations.

The other five destinations in the original schematic have no reviewed feature match yet. The original eight building envelopes and station slabs remain schematic. The lightweight view now applies a provisional horizontal similarity fit using the three named building centres; its 25.7 m RMS mismatch is not a survey accuracy claim. To refine it, identify shared entrances/corners, document correspondence, use distributed control points and independent check points, and report residuals. Native PLATEAU geography and preservation checks do not establish present-day construction conditions.

## Reproduction

Use Node 22+ (CI uses 24). `npm ci`, then `npm run build` prepares local Cesium assets automatically. `npm run preview` serves the full-source export at `http://127.0.0.1:3000/transit-layout/area/full/`. Cesium is pinned to 1.145.0 and does not need an ion token. The lightweight `/area/` and original diagram use Three.js.

Python 3.11+ standard library is sufficient to acquire and index city tiles:

```powershell
python scripts/fetch_plateau_city.py
python scripts/index_plateau_buildings.py
```

The downloader reuses existing cache files and writes a fresh hash manifest; compare it with the recorded manifest before accepting a changed source revision. The indexer writes the ignored full inventory, the committed summary and the reviewed three landmark records. It requires exactly one source-name match for each reviewed landmark and fails if that assumption changes. The decoded west-exit asset has a separate pinned-archive workflow in the [verification report](v1-verification.md).

Source: MLIT Project PLATEAU. Native city geometry is streamed; coordinate metadata is extracted and the presentation is processed by this project. [PLATEAU attribution and terms](https://www.mlit.go.jp/plateau/site-policy/) apply. GSI map/photography credits remain visible. Runtime library notices are distributed with the local Cesium assets.

## Validation

Thirteen application tests and five Python coordinate/asset tests pass. The production export passes lint/type checking. All 1,064 cached content files and four root manifests were rechecked against their recorded hashes. Desktop browser checks cover the whole-ward view, north-up view, aerial photography, building opacity, named feature selection, terrain status and the passage preset. The narrow-screen layout has no horizontal overflow and temporary viewport changes were reset. No GSI tile errors remained after limiting requests to supported levels.

Coordinate preservation, unique landmark identities and source bounds are covered; this is not a certified survey or a complete as-built station verification.
