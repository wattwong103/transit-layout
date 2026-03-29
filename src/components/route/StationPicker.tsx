"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { StationNode } from "@/types/station";
import { getLineColor } from "@/data/lines";

interface StationPickerProps {
  label: string;
  nodes: StationNode[];
  selectedNodeId: string | null;
  onSelect: (nodeId: string) => void;
  color: string;
}

type Category = "exit" | "platform" | "ticket_gate" | "other";

const categoryLabels: Record<Category, string> = {
  exit: "Exits",
  platform: "Platforms",
  ticket_gate: "Ticket Gates",
  other: "Other Locations",
};

const categoryOrder: Category[] = ["exit", "platform", "ticket_gate", "other"];

export default function StationPicker({
  label,
  nodes,
  selectedNodeId,
  onSelect,
  color,
}: StationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Pickable nodes (platforms, exits, ticket gates, concourses)
  const pickableNodes = useMemo(() => {
    return nodes.filter(
      (n) =>
        n.type === "platform" ||
        n.type === "exit" ||
        n.type === "ticket_gate" ||
        n.type === "concourse"
    );
  }, [nodes]);

  // Filter by search
  const filtered = useMemo(() => {
    if (!search) return pickableNodes;
    const q = search.toLowerCase();
    return pickableNodes.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        (n.exitName && n.exitName.toLowerCase().includes(q))
    );
  }, [pickableNodes, search]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<Category, StationNode[]>();
    for (const node of filtered) {
      const cat: Category =
        node.type === "exit"
          ? "exit"
          : node.type === "platform"
          ? "platform"
          : node.type === "ticket_gate"
          ? "ticket_gate"
          : "other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(node);
    }
    return map;
  }, [filtered]);

  return (
    <div ref={dropdownRef} className="relative flex-1 min-w-0">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 border border-slate-600 text-left transition-colors"
      >
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm text-slate-200 truncate">
          {selectedNode
            ? selectedNode.exitName || selectedNode.label
            : label}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 ml-auto flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-hidden flex flex-col">
          {/* Search input */}
          <div className="p-2 border-b border-slate-700">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-slate-700 border border-slate-600 rounded-md text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="overflow-y-auto flex-1">
            {categoryOrder.map((cat) => {
              const items = grouped.get(cat);
              if (!items || items.length === 0) return null;

              return (
                <div key={cat}>
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-800/80 sticky top-0">
                    {categoryLabels[cat]}
                  </div>
                  {items.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => {
                        onSelect(node.id);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700 transition-colors ${
                        node.id === selectedNodeId
                          ? "bg-slate-700/80 text-white"
                          : "text-slate-300"
                      }`}
                    >
                      {node.railwayLine && (
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getLineColor(node.railwayLine) }}
                        />
                      )}
                      <span className="truncate">
                        {node.exitName || node.label}
                      </span>
                      <span className="ml-auto text-[10px] text-slate-500 flex-shrink-0">
                        {node.floor}
                      </span>
                    </button>
                  ))}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-sm text-slate-500 text-center">
                No results
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
