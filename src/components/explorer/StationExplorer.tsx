"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { explorerData as data } from "@/data/explorer";
import { getSelection, connectorName, connectorLevels } from "@/lib/explorer";
import type { ContextMode, ExplorerLevelId } from "@/types/explorer";
import Explorer2D from "./Explorer2D";
import FeatureDetails from "./FeatureDetails";

const Explorer3D = dynamic(() => import("./Explorer3D"), {
  ssr: false,
  loading: () => (
    <div className="scene-loading">
      <span />
      Preparing the station model…
    </div>
  ),
});
function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="m13 13 4 4" />
    </svg>
  );
}
function CubeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m10 2 7 4v8l-7 4-7-4V6l7-4ZM3 6l7 4 7-4M10 10v8" />
    </svg>
  );
}

export default function StationExplorer() {
  const [view, setView] = useState<"3d" | "2d">("3d");
  const [contextMode, setContextMode] = useState<ContextMode>("station");
  const [activeLevel, setActiveLevel] = useState<ExplorerLevelId | "all">(
    "all",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [separation, setSeparation] = useState(22);
  const [showLabels, setShowLabels] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [query, setQuery] = useState("");
  const [listTab, setListTab] = useState<"places" | "exits" | "access">("places");
  const [panelOpen, setPanelOpen] = useState(false);
  const selection = getSelection(data, selectedId);
  const level = data.levels.find((item) => item.id === activeLevel);
  const search = query.trim().toLowerCase();
  const buildings = data.buildings.filter((item) =>
    `${item.name} ${data.exits
      .filter((exit) =>
        exit.destinations.some(
          (destination) => destination.buildingId === item.id,
        ),
      )
      .map((exit) => exit.code)
      .join(" ")}`
      .toLowerCase()
      .includes(search),
  );
  const exits = data.exits.filter((item) =>
    `${item.code} ${item.name}`.toLowerCase().includes(search),
  );
  const accessItems = [
    ...data.connectors.map(c => ({id:c.id, name:connectorName(c), detail:`${c.kind} · ${connectorLevels(c).join(" / ")}${c.access?.status === "closed-in-source" ? " · closed in source" : ""}`})),
    ...(data.facilities ?? []).map(f => ({id:f.id, name:f.name, detail:`${f.kind} · ${f.levelId}`})),
  ].filter(item => `${item.name} ${item.detail}`.toLowerCase().includes(search));
  const selectedFeature = selection.connector ?? selection.facility ?? selection.exit ?? selection.space;

  function select(id: string | null) {
    setSelectedId(id);
    if (id) setPanelOpen(false);
    if (!id) return;
    const next = getSelection(data, id);
    if (next.building) {
      setContextMode((mode) => (mode === "station" ? "both" : mode));
      if (view === "2d") setActiveLevel(next.exits[0]?.levelId ?? "B1");
      else setActiveLevel("all");
    } else if (next.exit) {
      if (next.exit.destinations.length)
        setContextMode((mode) => (mode === "station" ? "both" : mode));
      if (activeLevel !== "all" || view === "2d")
        setActiveLevel(next.exit.levelId);
    } else if (next.space || next.connector || next.facility) {
      if (contextMode === "buildings") setContextMode("both");
      if (activeLevel !== "all" || view === "2d") {
        const floors = next.connector ? connectorLevels(next.connector) : [next.facility?.levelId ?? next.space!.levelId];
        if (!floors.includes(activeLevel as ExplorerLevelId)) setActiveLevel(floors[0]);
      }
    }
  }
  function switchView(next: "3d" | "2d") {
    setView(next);
    if (next === "2d" && activeLevel === "all")
      setActiveLevel(
        selection.exit?.levelId ??
          selection.facility?.levelId ??
          selection.space?.levelId ??
          selection.connector?.from.levelId ??
          selection.exits[0]?.levelId ??
          "B2",
      );
  }
  const viewProps = {
    data,
    contextMode,
    activeLevel,
    selectedId,
    onSelect: select,
    separation,
    showLabels,
    resetKey,
  };

  return (
    <main className="explorer-shell">
      <header className="explorer-header">
        <a
          className="explorer-brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            setSelectedId(null);
            setActiveLevel("all");
            setView("3d");
            setContextMode("station");
            setSeparation(22);
            setResetKey((value) => value + 1);
          }}
          aria-label="Shibuya explorer home"
        >
          <span className="brand-symbol">
            <span />
            <span />
            <span />
          </span>
          <div>
            <strong>
              SHIBUYA<span className="brand-japanese"> 渋谷</span>
            </strong>
            <small>STATION & NEIGHBORHOOD</small>
          </div>
        </a>
        <div className="view-switch" aria-label="Map view">
          <button aria-pressed={view === "3d"} onClick={() => switchView("3d")}>
            <CubeIcon />
            3D model
          </button>
          <button aria-pressed={view === "2d"} onClick={() => switchView("2d")}>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 3h14v14H3zM3 9h8v8M11 3v6h6" />
            </svg>
            2D plan
          </button>
        </div>
        <span className="header-caption">An inside-out view of the city.</span>
        <button
          className="mobile-explore"
          aria-expanded={panelOpen}
          onClick={() => setPanelOpen(!panelOpen)}
        >
          {panelOpen ? "Close" : "Explore"}
        </button>
      </header>
      <div className="explorer-workspace">
        <aside
          className={`explorer-sidebar ${panelOpen ? "is-open" : ""}`}
          aria-label="Explore station and places"
        >
          <div className="sidebar-intro">
            <span className="eyebrow">FIND YOUR CONNECTION</span>
            <h1>
              Inside the station.
              <br />
              <span>Out into Shibuya.</span>
            </h1>
            <p>Explore the levels, then follow an exit to the neighborhood.</p>
            <Link href="/area" prefetch={false} className="mt-3 block text-xs underline underline-offset-4">
              Unified city + station · lightweight PLATEAU ↗
            </Link>
            <Link href="/verification" prefetch={false} className="mt-3 inline-block text-xs underline underline-offset-4">
              Sources & real-world reference ↗
            </Link>
          </div>
          <div className="context-control">
            <span className="control-label">Show on map</span>
            <div className="context-switch" aria-label="Map context">
              {(["station", "buildings", "both"] as ContextMode[]).map(
                (mode) => (
                  <button
                    key={mode}
                    aria-pressed={contextMode === mode}
                    onClick={() => setContextMode(mode)}
                  >
                    {mode === "station"
                      ? "Station"
                      : mode === "buildings"
                        ? "Buildings"
                        : "Both"}
                  </button>
                ),
              )}
            </div>
          </div>
          {selectedId && (
            <section
              className="selection-card"
              aria-label="Selection details"
              aria-live="polite"
            >
              <button
                className="selection-close"
                onClick={() => select(null)}
                aria-label="Clear selection"
              >
                ×
              </button>
              <span className="eyebrow">
                {selection.exit
                  ? `EXIT ${selection.exit.code} · ${selection.exit.levelId}`
                  : selection.building
                    ? "NEIGHBORHOOD"
                    : selection.connector
                      ? "BETWEEN LEVELS"
                      : `${selection.facility?.levelId ?? selection.space?.levelId ?? ""} · STATION`}
              </span>
              <h2>
                {selection.exit?.name ??
                  selection.building?.name ??
                  selection.facility?.name ??
                  selection.space?.name ??
                  (selection.connector &&
                    connectorName(selection.connector))}
              </h2>
              <Link href="/verification#public-review" prefetch={false} className="mb-3 inline-block text-xs underline underline-offset-4">
                Check floors, equipment & source evidence ↗
              </Link>
              {selectedFeature && <FeatureDetails feature={selectedFeature} />}
              {selection.building && <p>{selection.building.description}</p>}
              {selection.space && (
                <>
                  <p>
                    Isolate {selection.space.levelId} to explore this part of
                    the station.
                  </p>
                  <button
                    className="text-button"
                    onClick={() => setActiveLevel(selection.space!.levelId)}
                  >
                    Show {selection.space.levelId} only <span>↗</span>
                  </button>
                </>
              )}
              {selection.connections.map((link) => (
                <div
                  key={`${link.exit.id}-${link.buildingId}`}
                  className="connection-detail"
                >
                  <button
                    className="connection-title"
                    onClick={() =>
                      select(
                        selection.building ? link.exit.id : link.buildingId,
                      )
                    }
                  >
                    <span className="exit-chip">{link.exit.code}</span>
                    <span>{link.building.shortName}</span>
                    <span>↗</span>
                  </button>
                  <span className={`connection-type ${link.relationship}`}>
                    {link.relationship === "direct"
                      ? "Direct building connection"
                      : "Exit toward destination"}
                  </span>
                  <p>{link.note}</p>
                  <a
                    href={link.exit.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View source ↗
                  </a>
                  <small>{link.exit.sourceDate}</small>
                </div>
              ))}
              {selection.exit && selection.connections.length === 0 && (
                <>
                  <p>
                    This exit is shown in the station diagram. A building
                    connection has not been mapped here.
                  </p>
                  <a
                    href={selection.exit.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Operator diagram ↗
                  </a>
                </>
              )}
              {selection.building && (
                <a
                  className="building-source"
                  href={selection.building.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Building access source ↗
                </a>
              )}
            </section>
          )}
          <label className="explorer-search">
            <SearchIcon />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a place, exit or lift…"
              aria-label="Find a place, exit or lift"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search">
                ×
              </button>
            )}
          </label>
          <div className="list-tabs" aria-label="Browse places, exits or access">
            <button
              aria-pressed={listTab === "places"}
              onClick={() => setListTab("places")}
            >
              Places <span>{buildings.length}</span>
            </button>
            <button
              aria-pressed={listTab === "exits"}
              onClick={() => setListTab("exits")}
            >
              Exits <span>{exits.length}</span>
            </button>
            <button aria-pressed={listTab === "access"} onClick={() => setListTab("access")}>
              Access <span>{accessItems.length}</span>
            </button>
          </div>
          <div className="place-list">
            {listTab === "places"
              ? buildings.map((building, index) => {
                  const links = data.exits.flatMap((exit) =>
                    exit.destinations
                      .filter((link) => link.buildingId === building.id)
                      .map((link) => ({
                        code: exit.code,
                        relationship: link.relationship,
                      })),
                  );
                  return (
                    <button
                      key={building.id}
                      className={`place-row ${selectedId === building.id ? "selected" : ""}`}
                      onClick={() => select(building.id)}
                      aria-pressed={selectedId === building.id}
                    >
                      <span className="place-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="place-info">
                        <strong>{building.shortName}</strong>
                        <small>
                          {links
                            .map(
                              (link) =>
                                `${link.code} · ${link.relationship === "direct" ? "direct connection" : "toward building"}`,
                            )
                            .join(", ")}
                        </small>
                      </span>
                      <span className="row-arrow">↗</span>
                    </button>
                  );
                })
              : listTab === "access" ? accessItems.map(item => (
                <button key={item.id} className={`place-row ${selectedId === item.id ? "selected" : ""}`}
                  onClick={() => select(item.id)} aria-pressed={selectedId === item.id}>
                  <span className="place-info"><strong>{item.name}</strong><small>{item.detail}</small></span>
                  <span className="row-arrow">↗</span>
                </button>
              )) : exits.map((exit) => (
                  <button
                    key={exit.id}
                    className={`place-row ${selectedId === exit.id ? "selected" : ""}`}
                    onClick={() => select(exit.id)}
                    aria-pressed={selectedId === exit.id}
                  >
                    <span className="exit-chip">{exit.code}</span>
                    <span className="place-info">
                      <strong>{exit.name}</strong>
                      <small>
                        {exit.levelId} ·{" "}
                        {exit.destinations.length
                          ? "Destination mapped"
                          : "Exit location"}
                      </small>
                    </span>
                    <span className="row-arrow">↗</span>
                  </button>
                ))}
            {(listTab === "places" ? buildings : listTab === "access" ? accessItems : exits).length === 0 && (
              <p className="empty-results">
                No {listTab} match “{query}”. Try the{" "}
                {listTab === "places" ? "Exits" : "Places"} tab.
              </p>
            )}
          </div>
          <details className="map-notes">
            <summary>
              About this diagram <span>↗</span>
            </summary>
            <p>
              Station shapes, stairs, building envelopes and spacing are
              illustrative. They share one schematic layout across 2D and 3D.
            </p>
            <p>
              Exit destinations are linked to operator and building sources.
              Lines show associations, not turn-by-turn paths. Building
              interiors and complete accessible routes are not mapped. Published
              closures and hours appear with the affected feature.
            </p>
            <p>
              Updated from operator plans reviewed 19 September 2026. Positions
              remain schematic; floor labels are not measured elevations.
            </p>
          </details>
        </aside>
        <section className="map-stage" aria-label="Interactive Shibuya map">
          <div className="map-heading">
            <span className="eyebrow">
              {view === "3d" ? "EXPLODED STATION ATLAS" : "STATION FLOOR PLAN"}
            </span>
            <h2>
              {activeLevel === "all"
                ? contextMode === "buildings"
                  ? "Around Shibuya Station."
                  : `${data.levels.length} levels. One station.`
                : `${activeLevel} · ${level?.description}`}
            </h2>
            <p>
              {contextMode === "station"
                ? "Platforms, passages & vertical connections"
                : contextMode === "buildings"
                  ? "Surrounding buildings & station exits"
                  : "Station & neighborhood connections"}
            </p>
          </div>
          {selectedId && (
            <button
              className="mobile-selection"
              onClick={() => setPanelOpen(true)}
            >
              {selection.exit
                ? `${selection.exit.code} · ${selection.exit.name}`
                : (selection.building?.shortName ??
                  selection.space?.name ??
                  selection.facility?.name ??
                  selection.connector?.kind)}
              <span>Details ↗</span>
            </button>
          )}
          {view === "3d" ? (
            <Explorer3D {...viewProps} />
          ) : (
            <Explorer2D {...viewProps} />
          )}
          <div className="map-top-actions">
            <button
              className="reset-view"
              onClick={() => {
                setResetKey((value) => value + 1);
                if (view === "3d") {
                  setActiveLevel("all");
                  setSeparation(22);
                }
              }}
            >
              <span>⟲</span>
              {view === "3d" ? "Reference view" : "Reset plan"}
            </button>
          </div>
          <div className="floor-rail" aria-label="Floor filter">
            <span>LEVEL</span>
            {view === "3d" && (
              <button
                aria-pressed={activeLevel === "all"}
                onClick={() => setActiveLevel("all")}
              >
                All
              </button>
            )}
            {data.levels.map((item) => (
              <button
                key={item.id}
                title={item.description}
                aria-label={`Show ${item.label}`}
                aria-pressed={activeLevel === item.id}
                onClick={() => setActiveLevel(item.id)}
                className={item.id === "1F" ? "ground-floor" : ""}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="map-bottom-controls">
            <div className="scene-options">
              {view === "3d" && (
                <label className="separation-control">
                  <span>Level spacing</span>
                  <input
                    aria-label="Level spacing"
                    type="range"
                    min="10"
                    max="34"
                    value={separation}
                    onChange={(event) =>
                      setSeparation(Number(event.target.value))
                    }
                  />
                  <span className="spacing-symbol">↕</span>
                </label>
              )}
              <label className="labels-control">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(event) => setShowLabels(event.target.checked)}
                />
                <span>Labels</span>
              </label>
            </div>
            <div className="map-legend">
              <span>
                <i className="legend-platform" />
                Platform
              </span>
              <span>
                <i className="legend-lift" />
                Lift
              </span>
              <span>
                <i className="legend-exit" />
                Exit
              </span>
              {contextMode !== "station" && (
                <>
                  <span>
                    <i className="legend-direct" />
                    Direct
                  </span>
                  <span>
                    <i className="legend-toward" />
                    Toward
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="map-orientation" aria-hidden="true">
            <svg viewBox="0 0 28 36">
              <path d="M14 12 8 28l6-4 6 4Z" fill="#263f44" />
              <text
                x="14"
                y="8"
                textAnchor="middle"
                fontSize="8"
                fill="#263f44"
              >
                {view === "2d" ? "N" : "3D"}
              </text>
            </svg>
          </div>
          <div className="map-footer">
            <span>
              <i />
              Schematic geometry · source-linked destinations
            </span>
            <span>
              {view === "3d"
                ? "Drag to orbit · scroll to zoom · right-drag to pan"
                : "Drag to pan · scroll to zoom"}
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
