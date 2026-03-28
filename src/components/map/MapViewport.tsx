"use client";

import React, { useRef, useCallback } from "react";
import { useGesture } from "@use-gesture/react";
import { useMapStore } from "@/store/useMapStore";

interface MapViewportProps {
  children: React.ReactNode;
  viewBox: string;
}

export default function MapViewport({ children, viewBox }: MapViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { transform, setTransform } = useMapStore();

  const clampScale = useCallback((s: number) => Math.min(Math.max(s, 0.5), 4), []);

  useGesture(
    {
      onDrag: ({ delta: [dx, dy], event }) => {
        event.preventDefault();
        setTransform({
          x: transform.x + dx,
          y: transform.y + dy,
          scale: transform.scale,
        });
      },
      onPinch: ({ offset: [s], event }) => {
        event.preventDefault();
        setTransform({
          x: transform.x,
          y: transform.y,
          scale: clampScale(s),
        });
      },
      onWheel: ({ delta: [, dy], event }) => {
        event.preventDefault();
        const newScale = clampScale(transform.scale - dy * 0.002);
        setTransform({
          x: transform.x,
          y: transform.y,
          scale: newScale,
        });
      },
    },
    {
      target: containerRef,
      drag: { filterTaps: true },
      pinch: { scaleBounds: { min: 0.5, max: 4 } },
      eventOptions: { passive: false },
    }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden touch-none bg-slate-900 cursor-grab active:cursor-grabbing"
    >
      <svg
        viewBox={viewBox}
        className="w-full h-full"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </svg>
    </div>
  );
}
