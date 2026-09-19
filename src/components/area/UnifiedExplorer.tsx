"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  geographicExplorer,
  stationAlignment,
} from "@/lib/stationRegistration";
import summary from "@/data/station-city-summary.json";
import landmarks from "@/data/plateau-landmarks.json";
import type { CompactCity } from "@/types/geographic";
import styles from "./area.module.css";
import { getSelection, connectorName, connectorLevels } from "@/lib/explorer";
import FeatureDetails from "../explorer/FeatureDetails";

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
  const [reset, setReset] = useState(0);
  const [level, setLevel] = useState("all");
  const [spacing, setSpacing] = useState(12);
  const [opacity, setOpacity] = useState(22);
  const [schematic, setSchematic] = useState(true);
  const [map, setMap] = useState(true);
  const [passage, setPassage] = useState(false);
  const [guides, setGuides] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    fetch(`${base}/plateau/station-city.json`, { signal: abort.signal })
      .then((response) => {
        if (!response.ok) throw new Error("City data is unavailable");
        return response.json();
      })
      .then(setCity)
      .catch((error) => {
        if (error.name !== "AbortError")
          setStatus(
            "The compact city could not load. Reload this page to retry.",
          );
      });
    return () => abort.abort();
  }, []);
  const place = landmarks.find((item) => item.explorerId === selected);
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
          <span className={styles.eyebrow}>SHIBUYA / CITY + STATION</span>
          <h1>One place. One shared view.</h1>
        </div>
        <nav>
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
            The station drawing placed among simplified PLATEAU buildings.
            Switch to a plan to compare their positions.
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
            <button aria-pressed={!plan} onClick={() => setPlan(false)}>
              3D together
            </button>
            <button aria-pressed={plan} onClick={() => setPlan(true)}>
              North-up plan
            </button>
          </div>
          <div className={styles.buttonRow}>
            <button
              onClick={() => {
                setDistrict(false);
                setReset((value) => value + 1);
              }}
            >
              Station focus
            </button>
            <button
              onClick={() => {
                setDistrict(true);
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
                  onClick={() => {
                    setLevel(item.id);
                    setSchematic(true);
                  }}
                >
                  {item.label}
                </button>
              ),
            )}
          </div>
          <label className={styles.range}>
            Illustrative floor spacing <span>{spacing}</span>
            <input
              aria-label="Illustrative floor spacing"
              type="range"
              min="4"
              max="24"
              value={spacing}
              onChange={(e) => setSpacing(Number(e.target.value))}
            />
          </label>
          <p className={styles.hint}>
            Station floor elevations are not surveyed. Spacing separates the
            drawing for readability.
          </p>
          <h2>Compare layers</h2>
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
          <label className={styles.hint}>Inspect a lift, gate or exit
            <select aria-label="Inspect station feature" value={features.some(f=>f.id===selected)?selected!:""}
              className="my-2 w-full rounded border p-2 text-xs" onChange={event=>{
                const item=features.find(f=>f.id===event.target.value);
                setSelected(item?.id??null); if(item){setLevel(item.level);setSchematic(true);}
              }}>
              <option value="">Choose a station feature…</option>
              {features.map(f=><option key={f.id} value={f.id}>{f.name} · {f.level}</option>)}
            </select>
          </label>
          {feature && <section className={styles.selection} aria-label="Selected station feature">
            <h2>{"from" in feature ? connectorName(feature) : feature.name}</h2>
            <FeatureDetails feature={feature}/>
            <Link href="/verification#public-review" prefetch={false}>Source evidence ↗</Link>
          </section>}
          <h2>Three building anchors</h2>
          <div className={styles.places}>
            {landmarks.map((item) => (
              <button
                aria-pressed={selected === item.explorerId}
                key={item.featureId}
                onClick={() =>
                  setSelected(
                    selected === item.explorerId ? null : item.explorerId,
                  )
                }
              >
                <span>{item.label}</span>
                <small>
                  {stationAlignment.residuals
                    .find((r) => r.id === item.explorerId)!
                    .distance.toFixed(1)}{" "}
                  m mismatch
                </small>
              </button>
            ))}
          </div>
          {place && (
            <section
              className={styles.selection}
              aria-label="Selected building alignment"
            >
              <h2>{place.label}</h2>
              <p>
                PLATEAU: {place.latitude.toFixed(6)}° N,{" "}
                {place.longitude.toFixed(6)}° E
              </p>
              <p>
                Drawing centre is {residual?.distance.toFixed(1)} m from the
                source centre after fitting.
              </p>
              <code>{place.featureId}</code>
            </section>
          )}
          <div className={styles.alignment}>
            <strong>Draft horizontal alignment</strong>
            <p>
              {stationAlignment.rmse.toFixed(1)} m RMS mismatch across three
              building centres. Entrances and individual station spaces remain
              approximate.
            </p>
          </div>
          <label className={styles.layer}>
            <span>
              <input
                type="checkbox"
                checked={guides}
                onChange={(e) => setGuides(e.target.checked)}
              />
              Show alignment differences
            </span>
          </label>
          <details className={styles.notes}>
            <summary>What is shared, and what is approximate?</summary>
            <p>
              The plan and 3D view use the same registered station coordinates.
              One rotation, translation and uniform scale fits the original
              drawing to three named PLATEAU building centres. The drawing is
              not warped to force an exact match.
            </p>
            <p>
              City buildings retain their source positions and heights,
              simplified into plan envelopes with flat roofs. Their facades and
              detailed roof shapes are omitted. The three source buildings
              replace the corresponding schematic envelopes in this view.
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
              heights are illustrative. The optional passage retains its
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
                plan={plan}
                district={district}
                reset={reset}
                level={level}
                spacing={spacing}
                opacity={opacity}
                schematic={schematic}
                map={map}
                passage={passage}
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
            <strong>{plan ? "SHARED NORTH-UP PLAN" : "CITY + STATION"}</strong>
            <span>
              Draft alignment · {stationAlignment.rmse.toFixed(1)} m fit
              mismatch
            </span>
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
