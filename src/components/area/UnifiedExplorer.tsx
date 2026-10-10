"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  geographicExplorer,
  stationAlignment,
  withCityIdentities,
} from "@/lib/stationRegistration";
import summary from "@/data/station-city-summary.json";
import type { CompactCity } from "@/types/geographic";
import styles from "./area.module.css";
import { getSelection, connectorName, connectorLevels } from "@/lib/explorer";
import FeatureDetails from "../explorer/FeatureDetails";
import EntranceDetails from "../explorer/EntranceDetails";
import PlateauBuildingControl from "../explorer/PlateauBuildingControl";
import { usePlateauBuildings } from "../explorer/usePlateauBuildings";
import HeightModeControl from "../explorer/HeightModeControl";
import type { HeightMode } from "@/lib/stationHeights";

const Viewer = dynamic(() => import("./CompactScene"), {
  ssr: false,
  loading: () => <p className={styles.message}>Preparing the shared model…</p>,
});
const base = process.env.NODE_ENV === "production" ? "/transit-layout" : "";

export default function UnifiedExplorer() {
  const [city, setCity] = useState<CompactCity | null>(null);
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState(false);
  const [district, setDistrict] = useState(false);
  const [context, setContext] = useState<"footprints" | "buildings">("footprints");
  const [zoomStep, setZoomStep] = useState(0);
  const [reset, setReset] = useState(0);
  const [level, setLevel] = useState("all");
  const [spacing, setSpacing] = useState(18);
  const [heightMode,setHeightMode]=useState<HeightMode>("realistic");
  const [opacity, setOpacity] = useState(45);
  const [schematic, setSchematic] = useState(true);
  const [map, setMap] = useState(true);
  const [passage, setPassage] = useState(false);
  const [guides, setGuides] = useState(false);
  const [entrances, setEntrances] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const footprints = plan || context === "footprints";
  const [detailedBuildings,setDetailedBuildings] = useState(false);
  const plateau = usePlateauBuildings(detailedBuildings && !footprints);
  const activeLevel = geographicExplorer.levels.find(item => item.id === level);

  function focusLevel(next: string) {
    setLevel(next);
    setSchematic(true);
    setDistrict(false);
  }

  function switchPlan(next: boolean) {
    setPlan(next);
    if (next) focusLevel(level === "all" ? "1F" : level);
  }
  useEffect(() => {
    const abort = new AbortController();
    fetch(`${base}/plateau/station-city.json`, { signal: abort.signal })
      .then((response) => {
        if (!response.ok) throw new Error("City data is unavailable");
        return response.json();
      })
      .then(value=>setCity(withCityIdentities(value)))
      .catch((error) => {
        if (error.name !== "AbortError")
          setStatus(
            "The compact city could not load. Reload this page to retry.",
          );
      });
    return () => abort.abort();
  }, []);
  const place = geographicExplorer.buildings.find((item) => item.id === selected);
  const residual = stationAlignment.residuals.find(
    (item) => item.id === selected,
  );
  const selection = getSelection(geographicExplorer,selected);
  const feature=selection.exit ?? selection.facility ?? selection.connector ?? selection.space;
  const features=[...geographicExplorer.exits.map(e=>({id:e.id,name:`Exit ${e.code}`,level:e.levelId})),
    ...geographicExplorer.connectors.map(c=>({id:c.id,name:connectorName(c),level:connectorLevels(c)[0]})),
    ...(geographicExplorer.facilities??[]).map(f=>({id:f.id,name:f.name,level:f.levelId}))];
  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>SHIBUYA / CITY + STATION · v1.4</span>
          <h1>One place. One shared view.</h1>
        </div>
        <nav>
          <Link href="/detail" prefetch={false}>Geometry detail</Link>
          <Link href="/" prefetch={false}>
            Original diagram
          </Link>
          <Link href="/verification" prefetch={false}>
            Source review
          </Link>
        </nav>
      </header>
      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <p className={styles.intro}>
            Explore the station with PLATEAU building outlines, then switch
            to the city’s 3D envelopes or compare one floor against the map.
          </p>
          <div className={styles.metric}>
            <strong>{Math.round(summary.bytes / 1000)} KB</strong>
            <span>
              city geometry · {summary.buildings.toLocaleString("en-US")}{" "}
              buildings
              <br />
              1.3 × 1.2 km around the station
              <br />
              2025 release · surveys mostly 2021
            </span>
          </div>
          <div className={styles.buttonRow}>
            <button aria-pressed={!plan} onClick={() => switchPlan(false)}>
              3D together
            </button>
            <button aria-pressed={plan} onClick={() => switchPlan(true)}>
              North-up plan
            </button>
          </div>
          <div className={styles.buttonRow}>
            <button
              onClick={() => {
                setDistrict(false);
                setContext("footprints");
                setOpacity(45);
                setReset((value) => value + 1);
              }}
            >
              Station focus
            </button>
            <button
              onClick={() => {
                setPlan(false);
                setDistrict(true);
                setContext("buildings");
                setOpacity(100);
                setReset((value) => value + 1);
              }}
            >
              Neighbourhood
            </button>
          </div>
          <h2>Station levels</h2>
          <div className={styles.levels} aria-label="Station level filter">
            {[{ id: "all", label: "All" }, ...geographicExplorer.levels].map(
              (item) => (
                <button
                  key={item.id}
                  aria-pressed={level === item.id}
                  disabled={plan && item.id === "all"}
                  onClick={() => {
                    focusLevel(item.id);
                  }}
                >
                  {item.label}
                </button>
              ),
            )}
          </div>
          {plan && <p className={styles.hint}>One floor at a time keeps the plan readable.</p>}
          <HeightModeControl mode={heightMode} onChange={setHeightMode} onFocus={station=>{
            setPlan(false);setDistrict(false);setSchematic(true);setHeightMode("realistic");
            setLevel(station==="ginza"?"3F":"2F");setContext("buildings");setDetailedBuildings(true);setOpacity(25);
            setSelected(station==="jr"?"jr-west-platform":`${station}-platform`);setReset(value=>value+1);
          }}/>
          {heightMode === "exploded" && <>
          <label className={styles.range}>
            Illustrative floor spacing <span>{spacing}</span>
            <input
              aria-label="Illustrative floor spacing"
              type="range"
              min="4"
              max="24"
              value={spacing}
              disabled={plan}
              onChange={(e) => setSpacing(Number(e.target.value))}
            />
          </label>
          <p className={styles.hint}>
            Station floor elevations are not surveyed. Spacing separates the
            drawing for readability.
          </p>
          </>}
          <h2>Compare layers</h2>
          <div className={styles.buttonRow} aria-label="City context style">
            <button aria-pressed={footprints} onClick={() => setContext("footprints")}>Outlines</button>
            <button aria-pressed={!footprints} disabled={plan} onClick={() => setContext("buildings")}>3D buildings</button>
          </div>
          <p className={styles.hint}>
            {footprints ? "Building outlines shown on the map plane. Switch to 3D buildings to see source heights." : "Source building heights. Reduce opacity to see the station through the city."}
          </p>
          <PlateauBuildingControl enabled={detailedBuildings} onChange={enabled=>{
            setDetailedBuildings(enabled);
            if(enabled) {setPlan(false);setContext("buildings");}
          }} status={plateau.status} onRetry={plateau.retry}/>
          {detailedBuildings && footprints && <p className={styles.hint}>Source meshes are used in 3D buildings mode. Plan outlines stay flat.</p>}
          <label className={styles.layer}>
            <span>
              <input
                type="checkbox"
                checked={schematic}
                onChange={(e) => setSchematic(e.target.checked)}
              />
              Aligned station drawing
            </span>
          </label>
          <label className={styles.layer}>
            <span>
              <input
                type="checkbox"
                checked={map}
                onChange={(e) => {
                  setStatus("");
                  setMap(e.target.checked);
                }}
              />
              GSI map background
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
              onChange={(e) => setOpacity(Number(e.target.value))}
            />
          </label>
          <label className={styles.layer}>
            <span>
              <input
                type="checkbox"
                checked={passage}
                onChange={(e) => setPassage(e.target.checked)}
              />
              Detailed west passage
            </span>
          </label>
          <p className={styles.hint}>
            The optional passage loads another 1.2 MB.
          </p>
          <h2>Station features</h2>
          <label className={styles.layer}><span><input type="checkbox" checked={entrances} onChange={e=>setEntrances(e.target.checked)}/>Mapped entrance references</span></label>
          <p className={styles.hint}>Blue circles use public map coordinates on a flat comparison plane. Choose a floor or exit to compare them with its schematic landing. Dashed lines compare positions; they are not routes.</p>
          <label className={styles.hint}>Inspect a lift, gate or exit
            <select aria-label="Inspect station feature" value={features.some(f=>f.id===selected)?selected!:""}
              className="my-2 w-full rounded border p-2 text-xs" onChange={event=>{
                const item=features.find(f=>f.id===event.target.value);
                setSelected(item?.id??null); if(item) focusLevel(item.level);
              }}>
              <option value="">Choose a station feature…</option>
              {features.map(f=><option key={f.id} value={f.id}>{f.name} · {f.level}</option>)}
            </select>
          </label>
          {feature && <section className={styles.selection} aria-label="Selected station feature">
            <h2>{"from" in feature ? connectorName(feature) : feature.name}</h2>
            <FeatureDetails feature={feature}/>
            <EntranceDetails data={geographicExplorer} targetId={selected}/>
            <Link href="/verification#public-review" prefetch={false}>Source evidence ↗</Link>
          </section>}
          <h2>Shared building outlines</h2>
          <div className={styles.places}>
            {geographicExplorer.buildings.map((item) => (
              <button
                aria-pressed={selected === item.id}
                key={item.id}
                onClick={() =>
                  setSelected(selected === item.id ? null : item.id)
                }
              >
                <span>{item.shortName}</span>
                <small>
                  {item.outlineSource?.identity === "named-in-plateau" ? "Named PLATEAU feature" : "Public map match"}
                </small>
              </button>
            ))}
          </div>
          {place && (
            <section
              className={styles.selection}
              aria-label="Selected building alignment"
            >
              <h2>{place.shortName}</h2>
              <p>
                {plateau.meshes ? "The same source PLATEAU mesh is available in both views, with roof shapes and source heights." : "The same PLATEAU outline appears in the diagram and city view. Projected mesh envelope; ground-contact footprint unverified."}
              </p>
              <p>
                {residual ? `The original schematic centre was ${residual.distance.toFixed(1)} m from the source centre. Keio, Ginza and JR platforms now use public-map outlines. Their gates and equipment follow local, inferred positions; remaining station interiors retain the original fit.` : "Building identity is inferred from a unique 88–96% overlap with a named OpenStreetMap outline. It was not added as a station-fit control."}
              </p>
              <code>{place.outlineSource?.featureId}</code>
              <a href={`${base}/evidence/building-crosswalk.json`} target="_blank" rel="noreferrer">Match evidence ↗</a>
            </section>
          )}
          <div className={styles.alignment}>
            <strong>Draft horizontal alignment</strong>
            <p>
              {stationAlignment.rmse.toFixed(1)} m RMS mismatch across three
              original building centres. Keio, Ginza and JR platforms use public-map outlines; gates and stairs remain approximate. Remaining station interiors keep this draft fit.
            </p>
          </div>
          <label className={styles.layer}>
            <span>
              <input
                type="checkbox"
                checked={guides}
                onChange={(e) => setGuides(e.target.checked)}
              />
              Show original fit differences
            </span>
          </label>
          <details className={styles.notes}>
            <summary>What is shared, and what is approximate?</summary>
            <p>
              The plan and 3D view use the same registered station coordinates.
              One rotation, translation and uniform scale fits the original
              drawing to three named PLATEAU building centres. Keio, Ginza and JR are locally
              corrected using five public-map platform outlines, including the two mapped JR openings. Their gate and equipment positions remain inferred. PLATEAU predates JR’s recent reconstruction; roof overlap does not verify present interiors.
            </p>
            <p>
              Most city buildings are simplified plan envelopes with flat roofs. The optional PLATEAU 3D layer preserves source triangles, roof shapes and heights for the eight destinations, without textures. Both layers use the same geographic frame and are shared with the original diagram. Three identities are named in PLATEAU; five are cross-source matches. The original station fit remains frozen.
            </p>
            <p>
              Building centres are approximate controls, not entrance survey
              points. The fit is provisional; there are no independent surveyed
              checkpoints. Operator floor and equipment corrections are shared
              with the diagram; measured entrance alignment is still needed.
            </p>
            <p>
              Leaving one building out of the fit gives 63–114 m of mismatch at
              that building. Three centres are not enough to establish reliable
              entrance alignment.
            </p>
            <p>
              The map is a flat plan reference, not terrain. Station floor
              heights are unverified estimates in Realistic and exaggerated in Exploded. The optional passage retains its
              measured source position and ellipsoidal height.
            </p>
            <p>
              The complete source archive stays local. This view loads the
              compact city once, without continuous city or terrain streaming.
              It renders when something changes.
            </p>
          </details>
          <Link href="/area/full" prefetch={false} className={styles.fullLink}>
            Full ward source viewer · uses more data ↗
          </Link>
        </aside>
        <section
          className={styles.map}
          aria-label="Unified city and station model"
        >
          <div className={styles.canvas}>
            {city && (
              <Viewer
                city={city}
                buildingMeshes={plateau.meshes}
                plan={plan}
                district={district}
                footprints={footprints}
                zoomStep={zoomStep}
                reset={reset}
                level={level}
                spacing={spacing}
                heightMode={heightMode}
                opacity={opacity}
                schematic={schematic}
                map={map}
                passage={passage}
                entrances={entrances}
                guides={guides}
                selected={selected}
                onSelect={setSelected}
                onStatus={setStatus}
              />
            )}
          </div>
          {!city && !status && (
            <p className={styles.message}>Loading compact city geometry…</p>
          )}
          {status && (
            <p className={styles.warning} role="status">
              {status}
            </p>
          )}
          <div className={styles.mapCaption}>
            <strong>{plan ? "NORTH-UP PLAN" : "CITY + STATION"} · {level === "all" ? "ALL LEVELS" : level}</strong>
            <span>{activeLevel?.description ?? (heightMode === "realistic" ? "Station · estimated heights" : "Exploded station diagram")}</span>
            <span>{plan ? "Plan positions · elevations not shown" : heightMode === "realistic" ? "Realistic · heights unverified" : "Exploded · exaggerated spacing"}</span>
            <span>
              Draft alignment · {stationAlignment.rmse.toFixed(1)} m fit
              mismatch
            </span>
          </div>
          <div className={styles.mapTools} aria-label="Map controls">
            <button aria-label="Zoom in" onClick={() => setZoomStep(value => value + 1)}>+</button>
            <button aria-label="Zoom out" onClick={() => setZoomStep(value => value - 1)}>−</button>
            <button aria-label="Reset map view" onClick={() => setReset(value => value + 1)}>↺</button>
          </div>
          <div className={styles.mobileToolbar} aria-label="Quick map controls">
            <button aria-label={plan ? "Show 3D map" : "Show north-up map"} onClick={() => switchPlan(!plan)}>
              {plan ? "3D view" : "North-up"}
            </button>
            <select aria-label="Visible station level" value={level} onChange={event => {
              focusLevel(event.target.value);
            }}>
              <option value="all" disabled={plan}>All levels</option>
              {geographicExplorer.levels.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </div>
          <div className={styles.mapLegend}>
            <span><i className={styles.stationKey} />Station</span>
            <span><i className={styles.cityKey} />PLATEAU {footprints ? "outlines" : "buildings"}</span>
            {entrances && <span style={{color:"#285580"}}>○ Mapped entry</span>}
            {plan && <span className={styles.north}>↑ N</span>}
          </div>
          <p className={styles.help}>
            100 m grid · Drag to {plan ? "pan" : "orbit"} · Scroll to zoom
            <br />
            Station heights and connections remain schematic.
          </p>
          <p className={styles.credit}>
            Derived from{" "}
            <a
              href="https://docs.plateauview.mlit.go.jp/datasets/explorer/"
              target="_blank"
              rel="noreferrer"
            >
              MLIT PLATEAU
            </a>{" "}
            · simplified by transit-layout
            {" · "}<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors · ODbL</a>
            {map && (
              <>
                {" "}
                ·{" "}
                <a
                  href="https://maps.gsi.go.jp/development/ichiran.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  国土地理院 / GSI Tiles
                </a>
              </>
            )}
          </p>
        </section>
      </div>
    </main>
  );
}
