"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMapStore } from "@/store/useMapStore";
import { stationNodes } from "@/data/nodes";
import { stationEdges } from "@/data/edges";
import { buildGraph } from "@/lib/graph";
import { findShortestPath } from "@/lib/pathfinding";
import { formatRoute } from "@/lib/route-formatter";
import StationPicker from "./StationPicker";

const graph = buildGraph(stationEdges);
const nodesById = new Map(stationNodes.map((n) => [n.id, n]));

export default function RoutePlanner() {
  const {
    routeFrom,
    routeTo,
    setRouteFrom,
    setRouteTo,
    setActiveRoute,
    accessibleOnly,
    toggleAccessibleOnly,
    setCurrentFloor,
    resetTransform,
  } = useMapStore();

  const [error, setError] = useState<string | null>(null);
  const lastPlanned = useRef<string>("");

  const plan = useCallback(
    (from: string, to: string, accessible: boolean) => {
      const key = `${from}|${to}|${accessible}`;
      if (lastPlanned.current === key) return;
      lastPlanned.current = key;

      if (from === to) {
        setActiveRoute(null);
        setError(null);
        return;
      }

      const path = findShortestPath(graph, from, to, { accessibleOnly: accessible });
      if (!path) {
        setActiveRoute(null);
        setError("No route found");
        return;
      }

      setError(null);
      setActiveRoute(formatRoute(path, nodesById));

      const startNode = nodesById.get(from);
      if (startNode) {
        setCurrentFloor(startNode.floor);
        resetTransform();
      }
    },
    [setActiveRoute, setCurrentFloor, resetTransform]
  );

  useEffect(() => {
    if (!routeFrom || !routeTo) {
      lastPlanned.current = "";
      if (!routeFrom && !routeTo) setError(null);
      return;
    }
    plan(routeFrom, routeTo, accessibleOnly);
  }, [routeFrom, routeTo, accessibleOnly, plan]);

  const handleSwap = useCallback(() => {
    const from = routeFrom;
    const to = routeTo;
    lastPlanned.current = "";
    setRouteFrom(to);
    setRouteTo(from);
  }, [routeFrom, routeTo, setRouteFrom, setRouteTo]);

  const handleClear = useCallback(() => {
    lastPlanned.current = "";
    setRouteFrom(null);
    setRouteTo(null);
    setActiveRoute(null);
    setError(null);
  }, [setRouteFrom, setRouteTo, setActiveRoute]);

  const hasSelection = !!(routeFrom || routeTo);

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-700/80 shadow-lg p-2 space-y-1.5">
      <div className="flex items-stretch gap-1.5">
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <StationPicker
            label="From"
            nodes={stationNodes}
            selectedNodeId={routeFrom}
            onSelect={setRouteFrom}
            color="#22c55e"
          />
          <StationPicker
            label="To"
            nodes={stationNodes}
            selectedNodeId={routeTo}
            onSelect={setRouteTo}
            color="#ef4444"
          />
        </div>

        <div className="flex flex-col justify-between py-0.5">
          <button
            onClick={handleSwap}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Swap start and destination"
            aria-label="Swap start and destination"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>

          <button
            onClick={toggleAccessibleOnly}
            className={`p-1.5 rounded-lg text-sm transition-colors ${
              accessibleOnly
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
            title="Accessible routes only (elevators)"
            aria-pressed={accessibleOnly}
            aria-label="Accessible routes only"
          >
            ♿
          </button>

          {hasSelection ? (
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors text-xs font-medium"
              title="Clear route"
            >
              ✕
            </button>
          ) : (
            <span className="p-1.5 w-7" />
          )}
        </div>
      </div>

      {error && (
        <p className="px-1 text-[11px] text-red-400">{error}</p>
      )}
    </div>
  );
}
