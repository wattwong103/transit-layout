"use client";

import { useEffect, useRef, useState } from "react";
import type { ExplorerViewProps, Point2 } from "@/types/explorer";
import {
  getSelection,
  getVisibleFeatures,
  getSpaceOpenings,
  placeBuildingLabels,
  connectorStops,
  connectorLevels,
  connectorName,
  facilitySymbol,
} from "@/lib/explorer";

const polygonPoints = (points: Point2[]) =>
  points.map((point) => point.join(",")).join(" ");
const polygonPath = (points: Point2[]) =>
  `M${points.map((point) => point.join(",")).join("L")}Z`;
const initialView = { x: -185, y: -140, width: 370, height: 290 };

export default function Explorer2D({
  data,
  contextMode,
  activeLevel,
  selectedId,
  onSelect,
  showLabels,
  resetKey,
}: ExplorerViewProps) {
  const svg = useRef<SVGSVGElement>(null);
  const [view, setView] = useState(initialView);
  const [size, setSize] = useState({ width: 800, height: 450 });
  const drag = useRef<{
    x: number;
    y: number;
    scale: number;
    view: typeof initialView;
    moved: boolean;
  } | null>(null);
  const visible = getVisibleFeatures(data, contextMode, activeLevel);
  const selection = getSelection(data, selectedId);
  const visibleExits = new Set(visible.exits.map((item) => item.id));
  const scale =
    Math.min(size.width / view.width, size.height / view.height) || 1;
  const buildingLabels = placeBuildingLabels(
    visible.buildings,
    visible.exits,
    scale,
  );
  const occupied: { x: number; y: number }[] = [];
  const labeledExits = new Set(
    [...visible.exits]
      .sort(
        (a, b) =>
          Number(selection.highlightedIds.has(b.id)) -
            Number(selection.highlightedIds.has(a.id)) ||
          b.destinations.length - a.destinations.length,
      )
      .filter((exit) => {
        const x = exit.position[0] * scale,
          y = exit.position[1] * scale;
        if (
          !selection.highlightedIds.has(exit.id) &&
          occupied.some(
            (other) => Math.abs(other.x - x) < 29 && Math.abs(other.y - y) < 22,
          )
        )
          return false;
        occupied.push({ x, y });
        return true;
      })
      .map((exit) => exit.id),
  );
  useEffect(() => {
    if (!svg.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(svg.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const features = getVisibleFeatures(data, contextMode, activeLevel);
    const points = [
      ...features.spaces.flatMap((space) => space.polygon),
      ...features.buildings.flatMap((building) => building.polygon),
      ...features.exits.map((exit) => exit.position),
    ];
    if (!points.length) {
      setView(initialView);
      return;
    }
    const xs = points.map((point) => point[0]),
      ys = points.map((point) => point[1]);
    const x = Math.min(...xs) - 23,
      y = Math.min(...ys) - 23;
    setView({
      x,
      y,
      width: Math.max(...xs) - x + 23,
      height: Math.max(...ys) - y + 23,
    });
  }, [data, contextMode, activeLevel, resetKey]);

  function zoom(factor: number) {
    setView((previous) => {
      const width = Math.max(90, Math.min(740, previous.width * factor));
      const height = (width * previous.height) / previous.width;
      return {
        x: previous.x + (previous.width - width) / 2,
        y: previous.y + (previous.height - height) / 2,
        width,
        height,
      };
    });
  }
  const interactive = (id: string, name: string) => ({
    role: "button",
    tabIndex: 0,
    "aria-label": name,
    onClick: (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!drag.current?.moved) onSelect(id);
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect(id);
      }
    },
  });

  return (
    <div className="plan-view">
      <svg
        ref={svg}
        className="plan-svg"
        viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
        aria-label={`Shibuya ${activeLevel} schematic floor plan`}
        onWheel={(event) => zoom(event.deltaY > 0 ? 1.1 : 0.9)}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            scale: svg.current?.getScreenCTM()?.a || 1,
            view,
            moved: false,
          };
        }}
        onPointerMove={(event) => {
          const state = drag.current;
          if (!state || event.buttons !== 1) return;
          const dx = event.clientX - state.x,
            dy = event.clientY - state.y;
          if (Math.abs(dx) + Math.abs(dy) > 4) state.moved = true;
          if (state.moved) {
            svg.current?.setPointerCapture(event.pointerId);
            setView({
              ...state.view,
              x: state.view.x - dx / state.scale,
              y: state.view.y - dy / state.scale,
            });
          }
        }}
        onPointerUp={(event) => {
          if (svg.current?.hasPointerCapture(event.pointerId))
            svg.current.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <defs>
          <pattern
            id="plan-dots"
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.45" fill="#dddcd5" />
          </pattern>
          <filter id="plan-shadow" x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow
              dx="0"
              dy="1.5"
              stdDeviation="1.2"
              floodColor="#172b36"
              floodOpacity=".09"
            />
          </filter>
        </defs>
        <rect
          x="-2000"
          y="-2000"
          width="4000"
          height="4000"
          fill="url(#plan-dots)"
          onClick={() => {
            if (!drag.current?.moved) onSelect(null);
          }}
        />
        {contextMode !== "station" && (
          <g
            fill="none"
            stroke="#e5e1d8"
            strokeWidth="8"
            strokeLinejoin="round"
          >
            <path d="M -182,-61 L -56,-61 L 31,-80 L 171,-99 M -57,-129 L -57,-61 L -40,8 L -37,136 M 32,-125 L 32,90 L 64,144" />
          </g>
        )}
        {visible.buildings.map((building) => (
          <g
            key={building.id}
            {...interactive(building.id, building.name)}
            className="plan-target"
          >
            <polygon
              points={polygonPoints(building.polygon)}
              fill={building.color}
              fillOpacity={
                selection.highlightedIds.has(building.id) ? 0.85 : 0.38
              }
              stroke={
                selection.highlightedIds.has(building.id)
                  ? "#17716b"
                  : "#b9bdb7"
              }
              strokeWidth={
                selection.highlightedIds.has(building.id) ? 1.3 : 0.55
              }
              filter="url(#plan-shadow)"
            />
            {showLabels && (
              <text
                x={buildingLabels.get(building.id)![0]}
                y={buildingLabels.get(building.id)![1]}
                className="plan-building-label"
                style={{ fontSize: `${10 / scale}px` }}
              >
                {building.shortName}
              </text>
            )}
          </g>
        ))}
        {visible.spaces.map((space) => (
          <g
            key={space.id}
            {...interactive(space.id, `${space.name}, ${space.levelId}`)}
            className="plan-target"
          >
            <path
              d={[space.polygon, ...getSpaceOpenings(data, space)]
                .map(polygonPath)
                .join(" ")}
              fillRule="evenodd"
              fill={space.color}
              stroke={
                selection.highlightedIds.has(space.id) ? "#17716b" : "#8d8b7f"
              }
              strokeWidth={selection.highlightedIds.has(space.id) ? 1.4 : 0.55}
              filter="url(#plan-shadow)"
            />
            {space.tracks?.map((track, index) => (
              <polyline
                key={index}
                points={polygonPoints(track.points)}
                fill="none"
                stroke={track.color}
                strokeWidth="1.4"
              />
            ))}
            {showLabels &&
              (space.kind === "platform" ||
                space.kind === "concourse" ||
                space.kind === "plaza") && (
                <text
                  x={space.labelPosition[0]}
                  y={space.labelPosition[1]}
                  className="plan-space-label"
                  style={{ fontSize: `${Math.max(10 / scale, 3)}px` }}
                  transform={
                    space.line === "JY" ||
                    space.line === "JA" ||
                    space.line === "F" ||
                    space.line === "TY"
                      ? `rotate(-90 ${space.labelPosition[0]} ${space.labelPosition[1]})`
                      : undefined
                  }
                >
                  {space.name}
                </text>
              )}
          </g>
        ))}
        {visible.connectors.map((connector) => {
          const endpoint = connectorStops(connector).find(s => s.levelId === activeLevel) ?? connector.from;
          const closed = connector.access?.status === "closed-in-source";
          return (
            <g
              key={connector.id}
              transform={`translate(${endpoint.position.join(" ")})`}
              className="plan-connector plan-target"
              {...interactive(
                connector.id,
                `${connectorName(connector)} · ${connectorLevels(connector).join(", ")}${closed ? " · Closed in source" : ""}`,
              )}
            >
              {selectedId === connector.id && (
                <circle
                  r="5"
                  fill="#15746d"
                  fillOpacity=".12"
                  stroke="#15746d"
                  strokeWidth=".5"
                />
              )}
              <title>
                {connectorName(connector)} · {connectorLevels(connector).join(", ")}; schematic position
              </title>
              <rect
                x="-2.5"
                y="-3.5"
                width="5"
                height="7"
                rx=".5"
                fill={closed ? "#e4d9d5" : connector.kind === "lift" ? "#a6e4ee" : "#faf4d6"}
                stroke={connector.kind === "lift" ? "#228eaa" : "#9c926d"}
                strokeWidth=".5"
              />
              {connector.kind === "lift" ? (
                <path
                  d="M-1.2,1.5 V-1.5 M-2,-.5 L-1.2,-1.5 L-.4,-.5 M.5,1 V-1 M0,.4 L.5,1 L1,.4"
                  stroke="#228eaa"
                  fill="none"
                  strokeWidth=".5"
                />
              ) : connector.kind === "slope" ? (
                <path d="M-2,2 L2,-2" stroke="#777455" strokeWidth=".7" />
              ) : (
                [-2, -0.5, 1, 2.5].map((y) => (
                  <path
                    key={y}
                    d={`M-2,${y} H2`}
                    stroke="#9c926d"
                    strokeWidth=".4"
                  />
                ))
              )}
              {closed && <path d="M-3,-4 L3,4 M3,-4 L-3,4" stroke="#b64530" strokeWidth="1" />}
            </g>
          );
        })}
        {visible.facilities.map(f => (
          <g key={f.id} transform={`translate(${f.position.join(" ")})`} className="plan-target"
            {...interactive(f.id, `${f.name}, ${f.levelId}`)}>
            <title>{f.name} · schematic position</title>
            <rect x={-8 / scale} y={-7 / scale} width={16 / scale} height={14 / scale} rx={2 / scale}
              fill={selectedId === f.id ? "#c7ece5" : "#fffefa"} stroke={f.kind === "works" ? "#b64530" : "#4b7674"} strokeWidth={.7 / scale} />
            <text textAnchor="middle" dominantBaseline="central" fontSize={8 / scale} fill="#355859">{facilitySymbol(f.kind)}</text>
          </g>
        ))}
        {contextMode !== "station" &&
          selection.connections
            .filter((link) => visibleExits.has(link.exit.id))
            .map((link) => (
              <path
                key={`${link.exit.id}-${link.buildingId}`}
                d={`M${link.exit.position.join(",")} L${link.building.labelPosition.join(",")}`}
                stroke="#15746d"
                strokeWidth="1.5"
                strokeDasharray={
                  link.relationship === "toward" ? "3 2" : undefined
                }
                fill="none"
              />
            ))}
        {visible.exits.map((exit) => (
          <g
            key={exit.id}
            transform={`translate(${exit.position.join(" ")})`}
            {...interactive(exit.id, `Exit ${exit.code}, ${exit.name}`)}
            className="plan-target plan-exit"
          >
            {selection.highlightedIds.has(exit.id) && (
              <circle
                r="7.5"
                fill="#15746d"
                fillOpacity=".12"
                stroke="#15746d"
                strokeWidth=".55"
              />
            )}
            {labeledExits.has(exit.id) ? (
              <>
                <rect
                  x={-12 / scale}
                  y={-9 / scale}
                  width={24 / scale}
                  height={18 / scale}
                  rx={2 / scale}
                  fill="#f5d34d"
                  stroke={
                    selection.highlightedIds.has(exit.id)
                      ? "#15746d"
                      : "#bd9c21"
                  }
                  strokeWidth={0.7 / scale}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={10 / scale}
                  fontWeight="750"
                  fill="#25302d"
                >
                  {exit.code}
                </text>
              </>
            ) : (
              <circle
                r={3.5 / scale}
                fill="#f5d34d"
                stroke="#bd9c21"
                strokeWidth={0.7 / scale}
              />
            )}
          </g>
        ))}
      </svg>
      <div className="plan-zoom" aria-label="Plan zoom controls">
        <button onClick={() => zoom(0.8)} aria-label="Zoom in">
          +
        </button>
        <button onClick={() => zoom(1.25)} aria-label="Zoom out">
          −
        </button>
      </div>
    </div>
  );
}
