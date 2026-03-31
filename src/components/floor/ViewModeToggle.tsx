"use client";

import { useMapStore } from "@/store/useMapStore";

export default function ViewModeToggle() {
  const { viewMode, setViewMode } = useMapStore();

  return (
    <div className="flex bg-slate-700/60 rounded-lg p-0.5">
      <button
        onClick={() => setViewMode("floor")}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
          viewMode === "floor"
            ? "bg-blue-600 text-white"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        {/* Layers icon */}
        <svg className="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        Floor
      </button>
      <button
        onClick={() => setViewMode("overview")}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
          viewMode === "overview"
            ? "bg-blue-600 text-white"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        {/* 3D cube icon */}
        <svg className="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M3.27 6.96L12 12.01l8.73-5.05" />
          <path d="M12 22.08V12" />
        </svg>
        3D
      </button>
    </div>
  );
}
