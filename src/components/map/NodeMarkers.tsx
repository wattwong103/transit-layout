"use client";

import { StationNode } from "@/types/station";
import { getLineColor } from "@/data/lines";
import { useMapStore } from "@/store/useMapStore";
import NodeGlyph from "@/components/svg/NodeGlyphs";

interface NodeMarkersProps {
  nodes: StationNode[];
}

const NODE_SIZES: Record<StationNode["type"], number> = {
  platform: 10,
  concourse: 6,
  ticket_gate: 8,
  escalator: 7,
  stairs: 7,
  elevator: 8,
  exit: 10,
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
              r={size + 8}
              fill="transparent"
            />

            {/* Selection ring */}
            {isSelected && (
              <circle
                cx={node.position.x}
                cy={node.position.y}
                r={size + 4}
                fill="none"
                stroke="#fff"
                strokeWidth={2}
                opacity={0.8}
              >
                <animate
                  attributeName="r"
                  values={`${size + 4};${size + 8};${size + 4}`}
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
              <g>
                <rect
                  x={node.position.x - 24}
                  y={node.position.y + size + 4}
                  width={48}
                  height={16}
                  rx={4}
                  fill="#eab308"
                  stroke="#0f172a"
                  strokeWidth={0.8}
                />
                <text
                  x={node.position.x}
                  y={node.position.y + size + 15}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize={9}
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
              <text
                x={node.position.x}
                y={node.position.y + size + 14}
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize={10}
                fontWeight={node.type === "platform" ? "bold" : "normal"}
                fontFamily="system-ui, sans-serif"
                pointerEvents="none"
                opacity={0.85}
              >
                {node.label}
              </text>
            )}

            {/* Accessibility badge */}
            {node.accessible && (
              <text
                x={node.position.x + size + 2}
                y={node.position.y - size + 2}
                fontSize={8}
                fill="#60a5fa"
                pointerEvents="none"
              >
                ♿
              </text>
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
