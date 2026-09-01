"use client";

import { useMapStore } from "@/store/useMapStore";

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;

export default function ZoomControls() {
  const transform = useMapStore((s) => s.floorTransform);
  const setTransform = useMapStore((s) => s.setTransform);
  const resetTransform = useMapStore((s) => s.resetTransform);

  const zoomBy = (factor: number) => {
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, transform.scale * factor));
    setTransform({ ...transform, scale: next }, "floor");
  };

  return (
    <div className="flex flex-col bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-700/80 shadow-lg overflow-hidden">
      <button
        onClick={() => zoomBy(1.25)}
        className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/80 text-lg leading-none"
        title="Zoom in"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        onClick={() => zoomBy(0.8)}
        className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/80 text-lg leading-none border-t border-slate-700"
        title="Zoom out"
        aria-label="Zoom out"
      >
        −
      </button>
      <button
        onClick={() => resetTransform()}
        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/80 border-t border-slate-700"
        title="Reset view"
        aria-label="Reset view"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 12a9 9 0 1 0 9-9" strokeLinecap="round" />
          <path d="M3 4v8h8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
