"use client";

import { StationNode } from "@/types/station";
import { getLineColor } from "@/data/lines";
import { useMapStore } from "@/store/useMapStore";
import NodeGlyph from "@/components/svg/NodeGlyphs";
import { FILTER_SOFT_SHADOW } from "@/components/svg/MapDefs";

interface NodeMarkersProps {
  nodes: StationNode[];
}

const NODE_SIZES: Record<StationNode["type"], number> = {
  platform: 14,
  concourse: 6,
  ticket_gate: 12,
  escalator: 12,
  stairs: 12,
  elevator: 12,
  exit: 14,
  junction: 4,
};

export default function NodeMarkers({ nodes }: NodeMarkersProps) {
  const { selectedNode, setSelectedNode } = useMapStore();

  return (
    <g className="node-markers">
      {nodes.map((node) => {
        const size = NODE_SIZES[node.type];
        const isSelected = selectedNode?.id === node.id;
        const color = node.railwayLine
          ? getLineColor(node.railwayLine)
          : getNodeColor(node.type);

        if (node.type === "junction") return null;

        return (
          <g
            key={node.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNode(isSelected ? null : node);
            }}
            className="cursor-pointer"
          >
            {/* Hit area */}
            <circle
              cx={node.position.x}
              cy={node.position.y}
              r={size + 10}
              fill="transparent"
            />

            {/* Selection ring */}
            {isSelected && (
              <circle
                cx={node.position.x}
                cy={node.position.y}
                r={size + 6}
                fill="none"
                stroke="#fff"
                strokeWidth={2.5}
                opacity={0.8}
              >
                <animate
                  attributeName="r"
                  values={`${size + 6};${size + 10};${size + 6}`}
                  dur="1.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.8;0.3;0.8"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            )}

            {/* Glyph icon */}
            <NodeGlyph
              type={node.type}
              x={node.position.x}
              y={node.position.y}
              color={color}
              size={size}
            />

            {/* Exit badge */}
            {node.type === "exit" && (
              <g filter={`url(#${FILTER_SOFT_SHADOW})`}>
                <rect
                  x={node.position.x - 28}
                  y={node.position.y + size + 6}
                  width={56}
                  height={20}
                  rx={10}
                  fill="#FFD700"
                  stroke="#0d1117"
                  strokeWidth={1}
                />
                <text
                  x={node.position.x}
                  y={node.position.y + size + 19}
                  textAnchor="middle"
                  fill="#0d1117"
                  fontSize={11}
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                  pointerEvents="none"
                >
                  {node.exitCode || node.exitName || node.label}
                </text>
              </g>
            )}

            {/* Label for platforms and ticket gates */}
            {(node.type === "platform" || node.type === "ticket_gate") && (
              <g pointerEvents="none">
                {(() => {
                  const label = node.label;
                  const estW = label.length * 5 + 12;
                  const lx = node.position.x;
                  const ly = node.position.y + size + 16;
                  return (
                    <>
                      <rect
                        x={lx - estW / 2}
                        y={ly - 8}
                        width={estW}
                        height={16}
                        rx={8}
                        fill="#0d1117"
                        fillOpacity={0.7}
                      />
                      <text
                        x={lx}
                        y={ly + 4}
                        textAnchor="middle"
                        fill="#e2e8f0"
                        fontSize={10}
                        fontWeight={node.type === "platform" ? "bold" : "normal"}
                        fontFamily="system-ui, sans-serif"
                        opacity={0.9}
                      >
                        {label}
                      </text>
                    </>
                  );
                })()}
              </g>
            )}

            {/* Accessibility badge */}
            {node.accessible && (
              <g pointerEvents="none">
                <circle
                  cx={node.position.x + size + 4}
                  cy={node.position.y - size}
                  r={6}
                  fill="#2563eb"
                  stroke="#0d1117"
                  strokeWidth={1}
                />
                <text
                  x={node.position.x + size + 4}
                  y={node.position.y - size + 3.5}
                  fontSize={7}
                  fill="#fff"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  ♿
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

function getNodeColor(type: StationNode["type"]): string {
  switch (type) {
    case "exit":
      return "#22c55e";
    case "ticket_gate":
      return "#eab308";
    case "escalator":
      return "#3b82f6";
    case "stairs":
      return "#60a5fa";
    case "elevator":
      return "#a78bfa";
    case "concourse":
      return "#475569";
    default:
      return "#64748b";
  }
}
