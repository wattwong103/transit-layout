"use client";

import { StationNode } from "@/types/station";
import { useMapStore } from "@/store/useMapStore";

interface RouteBannerProps {
  fromNode: StationNode | null | undefined;
  toNode: StationNode | null | undefined;
}

export default function RouteBanner({ fromNode, toNode }: RouteBannerProps) {
  const { setRouteFrom, setRouteTo, setActiveRoute } = useMapStore();

  if (!fromNode && !toNode) return null;

  return (
    <div className="flex-shrink-0 px-4 py-2 bg-slate-800/80 border-b border-slate-700 flex items-center gap-3 text-sm">
      {/* From */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
        <span className="text-slate-300 truncate">
          {fromNode ? fromNode.exitName || fromNode.label : "Select start..."}
        </span>
      </div>

      <span className="text-slate-500 flex-shrink-0">→</span>

      {/* To */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
        <span className="text-slate-300 truncate">
          {toNode ? toNode.exitName || toNode.label : "Select destination..."}
        </span>
      </div>

      {/* Clear button */}
      <button
        onClick={() => {
          setRouteFrom(null);
          setRouteTo(null);
          setActiveRoute(null);
        }}
        className="ml-auto flex-shrink-0 text-xs text-slate-500 hover:text-slate-300 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
      >
        Clear
      </button>
    </div>
  );
}
