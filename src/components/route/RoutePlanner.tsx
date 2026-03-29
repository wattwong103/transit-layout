"use client";

import { useCallback } from "react";
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

  const handlePlanRoute = useCallback(() => {
    if (!routeFrom || !routeTo) return;

    const path = findShortestPath(graph, routeFrom, routeTo, {
      accessibleOnly,
    });

    if (!path) {
      setActiveRoute(null);
      return;
    }

    const route = formatRoute(path, nodesById);
    setActiveRoute(route);

    // Navigate to the starting floor
    const startNode = nodesById.get(routeFrom);
    if (startNode) {
      setCurrentFloor(startNode.floor);
      resetTransform();
    }
  }, [routeFrom, routeTo, accessibleOnly, setActiveRoute, setCurrentFloor, resetTransform]);

  const handleSwap = useCallback(() => {
    const from = routeFrom;
    const to = routeTo;
    setRouteFrom(to);
    setRouteTo(from);
    setActiveRoute(null);
  }, [routeFrom, routeTo, setRouteFrom, setRouteTo, setActiveRoute]);

  const handleClear = useCallback(() => {
    setRouteFrom(null);
    setRouteTo(null);
    setActiveRoute(null);
  }, [setRouteFrom, setRouteTo, setActiveRoute]);

  return (
    <div className="flex-shrink-0 px-3 py-3 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 space-y-2">
      {/* From / To pickers */}
      <div className="flex items-center gap-2">
        <StationPicker
          label="From (start)"
          nodes={stationNodes}
          selectedNodeId={routeFrom}
          onSelect={setRouteFrom}
          color="#22c55e"
        />

        {/* Swap button */}
        <button
          onClick={handleSwap}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Swap"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>

        <StationPicker
          label="To (destination)"
          nodes={stationNodes}
          selectedNodeId={routeTo}
          onSelect={setRouteTo}
          color="#ef4444"
        />
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2">
        {/* Accessible toggle */}
        <button
          onClick={toggleAccessibleOnly}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            accessibleOnly
              ? "bg-blue-600 text-white"
              : "bg-slate-700/60 text-slate-400 hover:text-slate-200"
          }`}
          title="Accessible routes only (elevators)"
        >
          <span>♿</span>
          <span className="hidden sm:inline">Accessible</span>
        </button>

        {/* Plan route button */}
        <button
          onClick={handlePlanRoute}
          disabled={!routeFrom || !routeTo}
          className={`flex-1 py-1.5 px-4 rounded-lg text-sm font-semibold transition-colors ${
            routeFrom && routeTo
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-slate-700 text-slate-500 cursor-not-allowed"
          }`}
        >
          Find Route
        </button>

        {/* Clear button */}
        {(routeFrom || routeTo) && (
          <button
            onClick={handleClear}
            className="px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
