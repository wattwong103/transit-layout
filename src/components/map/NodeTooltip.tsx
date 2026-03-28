"use client";

import { StationNode } from "@/types/station";
import { getLineName, getLineColor } from "@/data/lines";
import { useMapStore } from "@/store/useMapStore";

interface NodeTooltipProps {
  node: StationNode | null;
}

const typeLabels: Record<StationNode["type"], string> = {
  platform: "Platform",
  concourse: "Concourse",
  ticket_gate: "Ticket Gate",
  escalator: "Escalator",
  stairs: "Stairs",
  elevator: "Elevator",
  exit: "Exit",
  junction: "Junction",
};

export default function NodeTooltip({ node }: NodeTooltipProps) {
  const { setSelectedNode, setRouteFrom, setRouteTo, routeFrom } = useMapStore();

  if (!node) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-2xl z-50 max-w-sm mx-auto">
      {/* Close button */}
      <button
        onClick={() => setSelectedNode(null)}
        className="absolute top-2 right-3 text-slate-400 hover:text-white text-lg"
      >
        ×
      </button>

      {/* Node type badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
          {typeLabels[node.type]}
        </span>
        <span className="text-xs text-slate-500">{node.floor}</span>
        {node.accessible && (
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-900 text-blue-300">
            ♿ Accessible
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="text-white font-semibold text-base mb-1">
        {node.exitName || node.label}
      </h3>

      {/* Railway line */}
      {node.railwayLine && (
        <div className="flex items-center gap-2 mb-3">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getLineColor(node.railwayLine) }}
          />
          <span className="text-sm text-slate-300">
            {getLineName(node.railwayLine)}
          </span>
        </div>
      )}

      {/* Route planning buttons */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => {
            setRouteFrom(node.id);
            setSelectedNode(null);
          }}
          className="flex-1 text-xs font-medium py-2 px-3 rounded-lg bg-green-700 hover:bg-green-600 text-white transition-colors"
        >
          Set as Start
        </button>
        <button
          onClick={() => {
            setRouteTo(node.id);
            setSelectedNode(null);
          }}
          className={`flex-1 text-xs font-medium py-2 px-3 rounded-lg transition-colors ${
            routeFrom
              ? "bg-blue-700 hover:bg-blue-600 text-white"
              : "bg-slate-700 text-slate-400 cursor-not-allowed"
          }`}
          disabled={!routeFrom}
        >
          Set as Destination
        </button>
      </div>
    </div>
  );
}
