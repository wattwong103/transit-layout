"use client";

import { useState } from "react";
import NodeGlyph from "@/components/svg/NodeGlyphs";
import { NodeType } from "@/types/station";

const ITEMS: { type: NodeType; label: string; color: string }[] = [
  { type: "exit", label: "Exit", color: "#22c55e" },
  { type: "ticket_gate", label: "Ticket gate", color: "#eab308" },
  { type: "escalator", label: "Escalator", color: "#3b82f6" },
  { type: "stairs", label: "Stairs", color: "#60a5fa" },
  { type: "elevator", label: "Elevator", color: "#a78bfa" },
];

export default function MapLegend() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-700/80 shadow-lg overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:text-white"
        aria-expanded={expanded}
        title={expanded ? "Hide legend" : "Show legend"}
      >
        <span>Legend</span>
        <svg
          className={`w-3 h-3 text-slate-400 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {expanded && (
        <div className="px-2.5 pb-2.5 space-y-1.5">
          {ITEMS.map((item) => (
            <div
              key={item.type}
              className="flex items-center gap-2 text-[11px] text-slate-300"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" className="flex-shrink-0">
                <NodeGlyph
                  type={item.type}
                  x={8}
                  y={8}
                  color={item.color}
                  size={6}
                />
              </svg>
              {item.label}
            </div>
          ))}
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span className="w-4 flex justify-center">
              <span className="block w-3 h-0.5 rounded bg-yellow-400" />
            </span>
            Platform edge
          </div>
        </div>
      )}
    </div>
  );
}
