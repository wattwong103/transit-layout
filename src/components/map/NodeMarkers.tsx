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
                {(() => {
                  const text = node.exitCode || node.exitName || node.label;
                  const w = Math.max(40, text.length * 6.6 + 14);
                  const y = node.position.y + size + 6;
                  return (
                    <>
                      <rect
                        x={node.position.x - w / 2}
                        y={y}
                        width={w}
                        height={18}
                        rx={9}
                        fill="#FFD700"
                        stroke="#0d1117"
                        strokeWidth={1}
                      />
                      <text
                        x={node.position.x}
                        y={y + 13}
                        textAnchor="middle"
                        fill="#0d1117"
                        fontSize={10}
                        fontWeight="bold"
                        fontFamily="system-ui, sans-serif"
                        pointerEvents="none"
                      >
                        {text}
                      </text>
                    </>
                  );
                })()}
              </g>
            )}

            {/* Platform / ticket-gate names live on the region layer to avoid collisions */}

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
