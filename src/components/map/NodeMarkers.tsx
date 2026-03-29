"use client";

import { StationNode } from "@/types/station";
import { getLineColor } from "@/data/lines";
import { useMapStore } from "@/store/useMapStore";

interface NodeMarkersProps {
  nodes: StationNode[];
}

const nodeIcons: Record<StationNode["type"], { symbol: string; size: number }> = {
  platform: { symbol: "🚉", size: 10 },
  concourse: { symbol: "", size: 6 },
  ticket_gate: { symbol: "🎫", size: 8 },
  escalator: { symbol: "△", size: 7 },
  stairs: { symbol: "▤", size: 7 },
  elevator: { symbol: "▣", size: 8 },
  exit: { symbol: "🚪", size: 10 },
  junction: { symbol: "", size: 4 },
};

export default function NodeMarkers({ nodes }: NodeMarkersProps) {
  const { selectedNode, setSelectedNode } = useMapStore();

  return (
    <g className="node-markers">
      {nodes.map((node) => {
        const { size } = nodeIcons[node.type];
        const isSelected = selectedNode?.id === node.id;
        const color = node.railwayLine
          ? getLineColor(node.railwayLine)
          : getNodeColor(node.type);

        // Skip junction nodes visually (they're just graph connectors)
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
            {/* Hit area (larger invisible circle for easier tapping) */}
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
            {/* Main marker */}
            <circle
              cx={node.position.x}
              cy={node.position.y}
              r={size}
              fill={color}
              stroke={isSelected ? "#fff" : "#1e293b"}
              strokeWidth={isSelected ? 2 : 1.5}
              opacity={0.9}
            />
            {/* Label for important nodes */}
            {(node.type === "platform" ||
              node.type === "exit" ||
              node.type === "ticket_gate") && (
              <text
                x={node.position.x}
                y={node.position.y + size + 14}
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize={10}
                fontWeight={node.type === "exit" ? "bold" : "normal"}
                fontFamily="system-ui, sans-serif"
                pointerEvents="none"
              >
                {node.exitName || node.label}
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
      return "#60a5fa";
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
