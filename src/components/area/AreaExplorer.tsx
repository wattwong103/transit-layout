"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type * as Cesium from "cesium";
import { loadCesium } from "@/lib/cesiumRuntime";
import { passagePlacement } from "@/lib/plateauGeoreference";
import sources from "@/data/plateau-city.json";
import landmarks from "@/data/plateau-landmarks.json";
import inventory from "../../../docs/spatial-recovery/city-building-index-summary.json";
import reference from "../../../public/plateau/reference.json";
import styles from "./area.module.css";

type Library = typeof Cesium;
type Selection = {
  featureId: string;
  name: string;
  longitude?: number;
  latitude?: number;
  measuredHeight?: number;
  surveyYear?: string;
};
type MapState = {
  library: Library;
  viewer: Cesium.Viewer;
  layers: Map<string, Cesium.Cesium3DTileset>;
  passage?: Cesium.Model;
};
const base = process.env.NODE_ENV === "production" ? "/transit-layout" : "";
const station = { longitude: 139.7016, latitude: 35.6588 };

function buildingStyle(
  C: Library,
  opacity: number,
  selection: Selection | null,
) {
  return new C.Cesium3DTileStyle({
    color: {
      conditions: [
        [
          `\${gml_id} === ${JSON.stringify(selection?.featureId ?? "")}`,
          `color('#e9b04c', ${opacity / 100})`,
        ],
        ["true", `color('white', ${opacity / 100})`],
      ],
    },
  });
}

function moveTo(
  map: MapState,
  longitude: number,
  latitude: number,
  range: number,
  plan: boolean,
) {
  const { library: C, viewer } = map;
  if (plan) viewer.camera.switchToOrthographicFrustum();
  else viewer.camera.switchToPerspectiveFrustum();
  viewer.scene.screenSpaceCameraController.enableTilt = !plan;
  viewer.scene.screenSpaceCameraController.enableLook = !plan;
  viewer.camera.flyToBoundingSphere(
    new C.BoundingSphere(C.Cartesian3.fromDegrees(longitude, latitude, 60), 60),
    {
      offset: new C.HeadingPitchRange(
        0,
        C.Math.toRadians(plan ? -90 : -42),
        range,
      ),
      duration: 0.7,
    },
  );
}

export default function AreaExplorer() {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapState>();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<Record<string, string>>({});
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    buildings: true,
    roads: true,
    bridges: true,
    underground: true,
  });
  const [opacity, setOpacity] = useState(100);
  const [photo, setPhoto] = useState(false);
  const [plan, setPlan] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const latest = useRef({ enabled, opacity, reveal, selection });
  latest.current = { enabled, opacity, reveal, selection };

  useEffect(() => {
    let cancelled = false;
    let viewer: Cesium.Viewer | undefined;
    let handler: Cesium.ScreenSpaceEventHandler | undefined;
    const update = (key: string, value: string) => {
      if (!cancelled) setStatus((old) => ({ ...old, [key]: value }));
    };
    async function start() {
      const C = await loadCesium();
      if (cancelled || !container.current) return;
      C.Ion.defaultAccessToken = "";
      viewer = new C.Viewer(container.current, {
        baseLayer: false,
        baseLayerPicker: false,
        geocoder: false,
        animation: false,
        timeline: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        homeButton: false,
        fullscreenButton: false,
        infoBox: false,
        selectionIndicator: false,
        requestRenderMode: true,
        maximumRenderTimeChange: Infinity,
        skyBox: false,
        skyAtmosphere: false,
        shadows: false,
      });
      const scene = viewer.scene;
      scene.backgroundColor = C.Color.fromCssColorString("#e5e9e4");
      scene.globe.baseColor = C.Color.fromCssColorString("#d9e0d5");
      scene.globe.depthTestAgainstTerrain = true;
      scene.globe.enableLighting = false;
      // Fixed daylight makes the source textures readable regardless of local time.
      const lightFrame = C.Transforms.eastNorthUpToFixedFrame(
        C.Cartesian3.fromDegrees(station.longitude, station.latitude),
      );
      const lightDirection = C.Matrix4.multiplyByPointAsVector(
        lightFrame,
        new C.Cartesian3(0.4, 0.3, -1),
        new C.Cartesian3(),
      );
      scene.light = new C.DirectionalLight({
        direction: C.Cartesian3.normalize(lightDirection, lightDirection),
        intensity: 2,
      });
      scene.screenSpaceCameraController.minimumZoomDistance = 15;
      scene.screenSpaceCameraController.maximumZoomDistance = 22000;
      scene.screenSpaceCameraController.enableCollisionDetection = false;
      scene.renderError.addEventListener(() => {
        if (!cancelled)
          setError("The map could not render a source tile. Reload to retry.");
      });
      scene.canvas.setAttribute(
        "aria-label",
        "Geographic map of Shibuya with PLATEAU buildings, roads and underground spaces. Drag to pan, scroll to zoom, Ctrl-drag to tilt. Click a building for its source details.",
      );
      scene.canvas.setAttribute("role", "img");
      const map: MapState = { library: C, viewer, layers: new Map() };
      mapRef.current = map;
      viewer.camera.setView({
        destination: C.Cartesian3.fromDegrees(
          station.longitude,
          station.latitude - 0.009,
          950,
        ),
        orientation: { heading: 0, pitch: C.Math.toRadians(-42), roll: 0 },
      });
      setReady(true);
      update("terrain", "Loading");
      const terrain = C.CesiumTerrainProvider.fromUrl(sources.terrainUrl, {
        requestVertexNormals: true,
      })
        .then((provider) => {
          if (cancelled || !viewer || viewer.isDestroyed()) return;
          viewer.terrainProvider = provider;
          update("terrain", "Ready");
          scene.requestRender();
        })
        .catch(() =>
          update("terrain", "Unavailable — height comparison disabled"),
        );

      const layerLoads = sources.layers.map(async (source) => {
        update(source.id, "Loading");
        try {
          const tileset = await C.Cesium3DTileset.fromUrl(source.url, {
            maximumScreenSpaceError: 8,
            cacheBytes: 160 * 1024 * 1024,
            maximumCacheOverflowBytes: 80 * 1024 * 1024,
            showCreditsOnScreen: true,
          });
          if (cancelled || !viewer || viewer.isDestroyed()) {
            tileset.destroy();
            return;
          }
          tileset.show = latest.current.enabled[source.id];
          if (source.id === "buildings")
            tileset.style = buildingStyle(
              C,
              latest.current.opacity,
              latest.current.selection,
            );
          if (source.id === "underground")
            tileset.style = new C.Cesium3DTileStyle({
              color: "color('#c99a36')",
            });
          tileset.tileFailed.addEventListener(() =>
            update(source.id, "Some tiles unavailable"),
          );
          tileset.initialTilesLoaded.addEventListener(() =>
            update(source.id, "Ready"),
          );
          map.layers.set(source.id, tileset);
          scene.primitives.add(tileset);
          update(source.id, "Source ready");
          scene.requestRender();
        } catch {
          update(source.id, "Unavailable");
        }
      });

      const passage = C.Model.fromGltfAsync({
        url: `${base}/plateau/shibuya-west-passage.glb`,
        ...passagePlacement(C, reference.originWgs84),
        color: C.Color.fromCssColorString("#19c0b4"),
        colorBlendMode: C.ColorBlendMode.REPLACE,
        id: "west-passage",
        credit:
          "Derived from MLIT PLATEAU UC24-13; processed by transit-layout.",
        showCreditsOnScreen: true,
      })
        .then((model) => {
          if (cancelled || !viewer || viewer.isDestroyed()) {
            model.destroy();
            return;
          }
          map.passage = model;
          model.show = latest.current.enabled.underground;
          scene.primitives.add(model);
          update("passage", "Ready");
          scene.requestRender();
        })
        .catch(() => update("passage", "Unavailable"));

      for (const place of landmarks) {
        viewer.entities.add({
          id: `landmark-${place.explorerId}`,
          name: place.label,
          position: C.Cartesian3.fromDegrees(place.longitude, place.latitude),
          point: {
            pixelSize: 6,
            color: C.Color.fromCssColorString("#226e65"),
            outlineColor: C.Color.WHITE,
            outlineWidth: 2,
            heightReference: C.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Infinity,
          },
          label: {
            text: place.label,
            font: "13px sans-serif",
            fillColor: C.Color.fromCssColorString("#173b35"),
            showBackground: true,
            backgroundColor: C.Color.WHITE.withAlpha(0.9),
            pixelOffset: new C.Cartesian2(0, -20),
            heightReference: C.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Infinity,
            distanceDisplayCondition: new C.DistanceDisplayCondition(0, 4000),
          },
        });
      }
      viewer.entities.add({
        id: "passage-marker",
        name: "West-exit passage",
        position: C.Cartesian3.fromDegrees(
          reference.originWgs84[0],
          reference.originWgs84[1],
        ),
        point: {
          pixelSize: 8,
          color: C.Color.fromCssColorString("#19c0b4"),
          outlineWidth: 2,
          outlineColor: C.Color.WHITE,
          heightReference: C.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Infinity,
        },
        label: {
          text: "West-exit passage",
          font: "12px sans-serif",
          showBackground: true,
          backgroundColor: C.Color.fromCssColorString("#164e49"),
          pixelOffset: new C.Cartesian2(0, -20),
          heightReference: C.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Infinity,
          distanceDisplayCondition: new C.DistanceDisplayCondition(0, 2500),
        },
      });
      handler = new C.ScreenSpaceEventHandler(scene.canvas);
      handler.setInputAction((event: { position: Cesium.Cartesian2 }) => {
        const picked = scene.pick(event.position);
        if (picked instanceof C.Cesium3DTileFeature) {
          const numeric = (key: string) => {
            const value = picked.getProperty(key);
            return typeof value === "number" && Number.isFinite(value)
              ? value
              : undefined;
          };
          setSelection({
            featureId: String(picked.getProperty("gml_id") ?? "Unknown ID"),
            name: String(
              picked.getProperty("gml:name") || "Unnamed source feature",
            ),
            longitude: numeric("_x"),
            latitude: numeric("_y"),
            measuredHeight: numeric("bldg:measuredHeight"),
            surveyYear: String(
              picked.getProperty(
                "uro:BuildingDetailAttribute_uro:surveyYear",
              ) || "Unknown",
            ),
          });
        } else if (picked?.id instanceof C.Entity) {
          const place = landmarks.find(
            (item) => `landmark-${item.explorerId}` === picked.id.id,
          );
          if (place) setSelection(place);
        } else setSelection(null);
      }, C.ScreenSpaceEventType.LEFT_CLICK);
      await Promise.allSettled([terrain, ...layerLoads, passage]);
    }
    start().catch(() => {
      if (!cancelled)
        setError(
          "The geographic viewer could not start. Check your connection and reload.",
        );
    });
    return () => {
      cancelled = true;
      if (handler && !handler.isDestroyed()) handler.destroy();
      if (viewer && !viewer.isDestroyed()) viewer.destroy();
      mapRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const C = map.library;
    map.viewer.imageryLayers.removeAll();
    setStatus((old) => ({ ...old, basemap: "" }));
    // GSI does not serve levels 0–1. Limit the imagery to the Tokyo region so
    // the minimum-level tiles fit Cesium's initial imagery coverage constraint.
    const imagery = new C.UrlTemplateImageryProvider({
      url: photo ? sources.photoUrl : sources.mapUrl,
      minimumLevel: 2,
      maximumLevel: 18,
      rectangle: C.Rectangle.fromDegrees(139.3, 35.3, 140.1, 36),
      credit: new C.Credit(
        `<a href="${sources.mapAttributionUrl}" target="_blank">国土地理院 / GSI Tiles</a>`,
        true,
      ),
    });
    const removeErrorListener = imagery.errorEvent.addEventListener(
      (failure) => {
        console.warn("GSI imagery tile unavailable", failure.message);
        setStatus((old) => ({ ...old, basemap: "Some map tiles unavailable" }));
      },
    );
    map.viewer.imageryLayers.addImageryProvider(imagery);
    map.viewer.scene.requestRender();
    return removeErrorListener;
  }, [photo, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.layers.forEach((layer, id) => {
      layer.show = enabled[id];
    });
    if (map.passage) map.passage.show = enabled.underground;
    const buildings = map.layers.get("buildings");
    if (buildings)
      buildings.style = buildingStyle(map.library, opacity, selection);
    map.viewer.scene.globe.translucency.enabled = reveal;
    map.viewer.scene.globe.translucency.frontFaceAlpha = 0.25;
    map.viewer.scene.globe.translucency.backFaceAlpha = 0.25;
    map.viewer.scene.requestRender();
  }, [enabled, opacity, reveal, selection, ready]);

  function focus(
    place: { longitude: number; latitude: number },
    range = 600,
    nextPlan = plan,
  ) {
    if (mapRef.current)
      moveTo(mapRef.current, place.longitude, place.latitude, range, nextPlan);
  }

  return (
    <main className={styles.shell}>
      <link rel="stylesheet" href={`${base}/cesium/Widgets/widgets.css`} />
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>SHIBUYA / GEOGRAPHIC CONTEXT</span>
          <h1>The station in its city.</h1>
        </div>
        <nav>
          <Link href="/area" prefetch={false}>
            Light city + station
          </Link>
          <Link href="/">Station diagram ↗</Link>
        </nav>
      </header>
      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <p className={styles.intro}>
            Real building geometry, roads and terrain. Explore the wider area,
            then bring the underground passage into view.
          </p>
          <div className={styles.metric}>
            <strong>{inventory.uniqueBuildings.toLocaleString("en-US")}</strong>
            <span>
              buildings in the source inventory
              <br />
              Shibuya ward · 2025 release
              <br />
              Survey attributes: mostly 2021
            </span>
          </div>
          <div className={styles.buttonRow}>
            <button disabled={!ready} onClick={() => focus(station, 1400)}>
              Station area
            </button>
            <button
              disabled={!ready}
              onClick={() =>
                focus({ longitude: 139.692586, latitude: 35.666681 }, 11000)
              }
            >
              Whole ward
            </button>
          </div>
          <div className={styles.buttonRow}>
            <button
              disabled={!ready}
              aria-pressed={!plan}
              onClick={() => {
                setPlan(false);
                focus(station, 1400, false);
              }}
            >
              3D context
            </button>
            <button
              disabled={!ready}
              aria-pressed={plan}
              onClick={() => {
                setPlan(true);
                focus(station, 1400, true);
              }}
            >
              North-up plan
            </button>
          </div>
          <h2>Map layers</h2>
          {sources.layers.map((layer) => (
            <label className={styles.layer} key={layer.id}>
              <span>
                <input
                  type="checkbox"
                  checked={enabled[layer.id]}
                  onChange={(event) =>
                    setEnabled((old) => ({
                      ...old,
                      [layer.id]: event.target.checked,
                    }))
                  }
                />
                {layer.label}
              </span>
              <small>{status[layer.id] ?? "Waiting"}</small>
            </label>
          ))}
          <label className={styles.layer}>
            <span>
              <input
                type="checkbox"
                checked={photo}
                onChange={(event) => setPhoto(event.target.checked)}
              />
              Aerial photography
            </span>
          </label>
          <label className={styles.range}>
            Building opacity <span>{opacity}%</span>
            <input
              aria-label="Building opacity"
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(event) => setOpacity(Number(event.target.value))}
            />
          </label>
          <label className={styles.layer}>
            <span>
              <input
                type="checkbox"
                checked={reveal}
                onChange={(event) => setReveal(event.target.checked)}
              />
              Transparent ground
            </span>
          </label>
          <button
            className={styles.passageButton}
            disabled={!ready}
            onClick={() => {
              setReveal(true);
              setOpacity(25);
              setSelection(null);
              setEnabled((old) => ({
                ...old,
                roads: false,
                bridges: false,
                underground: true,
              }));
              focus(
                {
                  longitude: reference.originWgs84[0],
                  latitude: reference.originWgs84[1],
                },
                320,
              );
            }}
          >
            Focus west-exit passage ↗
          </button>
          <h2>Matched building names</h2>
          <p className={styles.hint}>
            These three places have matching names and coordinates in the
            PLATEAU source.
          </p>
          <div className={styles.places}>
            {landmarks.map((place) => (
              <button
                key={place.featureId}
                disabled={!ready}
                onClick={() => {
                  setSelection(place);
                  focus(place);
                }}
              >
                <span>{place.label}</span>
                <small>{place.measuredHeight} m · source height</small>
              </button>
            ))}
          </div>
          {selection && (
            <section
              className={styles.selection}
              aria-label="Selected source feature"
            >
              <button
                aria-label="Clear source selection"
                onClick={() => setSelection(null)}
              >
                ×
              </button>
              <h2>{selection.name}</h2>
              {selection.measuredHeight != null && (
                <p>Source height: {selection.measuredHeight.toFixed(1)} m</p>
              )}
              {selection.longitude != null && selection.latitude != null && (
                <p>
                  {selection.latitude.toFixed(6)}° N,{" "}
                  {selection.longitude.toFixed(6)}° E
                </p>
              )}
              <p>
                Survey attribute:{" "}
                {selection.surveyYear === "0001"
                  ? "Unspecified source code"
                  : (selection.surveyYear ?? "Unknown")}
              </p>
              <code>{selection.featureId}</code>
            </section>
          )}
          <details className={styles.notes}>
            <summary>Sources & alignment</summary>
            <p>
              Buildings and other city layers retain their published geographic
              positions and scale. The decoded west-exit passage uses its
              original geographic origin.
            </p>
            <p>
              The 2025 release contains mostly 2021 building survey attributes.
              It is not a complete record of today’s redevelopment. Roads and
              underground layers have more limited coverage than buildings.
            </p>
            <p>
              Terrain: {status.terrain ?? "Waiting"}. The terrain service
              supplies ellipsoidal heights, matching the geographic 3D scene.
            </p>
            <p>
              The lightweight city view includes a provisional horizontal fit of
              the station diagram. Surveyed entrance alignment and station floor
              elevations remain unverified.
            </p>
            <a
              href="https://docs.plateauview.mlit.go.jp/datasets/explorer/"
              target="_blank"
              rel="noreferrer"
            >
              PLATEAU catalog ↗
            </a>
            <a
              href={sources.terrainDocumentation}
              target="_blank"
              rel="noreferrer"
            >
              Terrain & heights ↗
            </a>
            <a
              href={sources.mapAttributionUrl}
              target="_blank"
              rel="noreferrer"
            >
              GSI maps & photography ↗
            </a>
            <a href={sources.licenseUrl} target="_blank" rel="noreferrer">
              PLATEAU attribution & terms ↗
            </a>
          </details>
        </aside>
        <section className={styles.map} aria-label="Geographic area viewer">
          <div ref={container} className={styles.canvas} />
          {!ready && !error && (
            <div className={styles.message} role="status">
              Preparing the geographic map…
            </div>
          )}
          {error && (
            <div className={styles.message} role="alert">
              {error}
              <button onClick={() => window.location.reload()}>
                Reload map
              </button>
            </div>
          )}
          {(status.terrain?.startsWith("Unavailable") || status.basemap) && (
            <div className={styles.warning} role="status">
              {status.basemap || status.terrain}
            </div>
          )}
          <div className={styles.mapCaption}>
            <strong>{plan ? "NORTH-UP PLAN" : "REAL-WORLD CONTEXT"}</strong>
            <span>
              PLATEAU · GSI map ·{" "}
              {reveal
                ? "Ground made transparent"
                : "Original geographic positions"}
            </span>
          </div>
          <p className={styles.help}>
            Drag to pan · Scroll to zoom · Ctrl-drag to tilt
            <br />
            Select a building to inspect its source.
          </p>
        </section>
      </div>
    </main>
  );
}
