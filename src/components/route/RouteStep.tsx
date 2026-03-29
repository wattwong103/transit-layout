"use client";

import { RouteStep as RouteStepType } from "@/types/station";

interface RouteStepProps {
  step: RouteStepType;
  index: number;
  isLast: boolean;
  onTap: () => void;
}

const edgeIcons: Record<string, string> = {
  walkway: "→",
  escalator: "△",
  stairs: "▤",
  elevator: "▣",
  passage: "⊞",
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec > 0 ? `${min}m ${sec}s` : `${min}m`;
}

export default function RouteStep({ step, index, isLast, onTap }: RouteStepProps) {
  return (
    <button
      onClick={onTap}
      className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-slate-700/50 transition-colors text-left"
    >
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
            index === 0
              ? "bg-green-600 text-white"
              : isLast
              ? "bg-red-600 text-white"
              : "bg-slate-600 text-slate-300"
          }`}
        >
          {index + 1}
        </div>
        {!isLast && <div className="w-0.5 h-full min-h-[20px] bg-slate-700 mt-1" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200">{step.instruction}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-slate-500">
            {edgeIcons[step.edgeType]} {step.edgeType}
          </span>
          <span className="text-[10px] text-slate-500">
            ~{formatDuration(step.duration)}
          </span>
          {step.floorChange && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300">
              {step.floorChange.from} → {step.floorChange.to}
            </span>
          )}
        </div>
      </div>

      {/* Floor badge */}
      <span className="flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
        {step.floor}
      </span>
    </button>
  );
}
