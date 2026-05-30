"use client";

import { NodeType } from "@/types/station";

interface NodeGlyphProps {
  type: NodeType;
  x: number;
  y: number;
  color: string;
  size: number;
  isIsometric?: boolean;
}

export default function NodeGlyph({
  type,
  x,
  y,
  color,
  size,
  isIsometric,
}: NodeGlyphProps) {
  const scale = isIsometric ? 0.8 : 1;
  const s = size * scale;

  switch (type) {
    case "platform":
      return (
        <g>
          <rect
            x={x - s}
            y={y - s * 0.5}
            width={s * 2}
            height={s}
            rx={2}
            fill={color}
            stroke="#0f172a"
            strokeWidth={1}
            opacity={0.9}
          />
          <line
            x1={x - s * 0.5}
            y1={y}
            x2={x + s * 0.5}
            y2={y}
            stroke="#fff"
            strokeWidth={1.5}
            strokeOpacity={0.6}
          />
        </g>
      );

    case "ticket_gate":
      return (
        <g>
          <rect
            x={x - s * 0.8}
            y={y - s * 0.6}
            width={s * 1.6}
            height={s * 1.2}
            rx={2}
            fill={color}
            stroke="#0f172a"
            strokeWidth={1}
            opacity={0.9}
          />
          {/* Turnstile bars */}
          <line x1={x - s * 0.35} y1={y - s * 0.3} x2={x - s * 0.35} y2={y + s * 0.3} stroke="#0f172a" strokeWidth={1.2} />
          <line x1={x} y1={y - s * 0.3} x2={x} y2={y + s * 0.3} stroke="#0f172a" strokeWidth={1.2} />
          <line x1={x + s * 0.35} y1={y - s * 0.3} x2={x + s * 0.35} y2={y + s * 0.3} stroke="#0f172a" strokeWidth={1.2} />
        </g>
      );

    case "escalator":
      return (
        <g>
          {/* Stepped parallelogram */}
          <path
            d={`M ${x - s} ${y + s * 0.4} L ${x - s * 0.3} ${y + s * 0.4} L ${x - s * 0.3} ${y} L ${x + s * 0.3} ${y} L ${x + s * 0.3} ${y - s * 0.4} L ${x + s} ${y - s * 0.4} L ${x + s} ${y - s * 0.7} L ${x - s} ${y + s * 0.1} Z`}
            fill={color}
            stroke="#0f172a"
            strokeWidth={0.8}
            opacity={0.9}
          />
          {/* Direction chevron */}
          <path
            d={`M ${x - s * 0.15} ${y + s * 0.1} L ${x + s * 0.15} ${y - s * 0.2} L ${x + s * 0.45} ${y + s * 0.1}`}
            fill="none"
            stroke="#fff"
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.7}
          />
        </g>
      );

    case "stairs":
      return (
        <g>
          {/* Steps */}
          <path
            d={`M ${x - s} ${y + s * 0.5} L ${x - s * 0.33} ${y + s * 0.5} L ${x - s * 0.33} ${y} L ${x + s * 0.33} ${y} L ${x + s * 0.33} ${y - s * 0.5} L ${x + s} ${y - s * 0.5}`}
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
          />
        </g>
      );

    case "elevator":
      return (
        <g>
          <rect
            x={x - s * 0.8}
            y={y - s * 0.8}
            width={s * 1.6}
            height={s * 1.6}
            rx={2}
            fill={color}
            stroke="#0f172a"
            strokeWidth={1}
            opacity={0.9}
          />
          {/* Up/down triangles */}
          <path
            d={`M ${x} ${y - s * 0.45} L ${x - s * 0.25} ${y - s * 0.1} L ${x + s * 0.25} ${y - s * 0.1} Z`}
            fill="#fff"
            opacity={0.7}
          />
          <path
            d={`M ${x} ${y + s * 0.45} L ${x - s * 0.25} ${y + s * 0.1} L ${x + s * 0.25} ${y + s * 0.1} Z`}
            fill="#fff"
            opacity={0.7}
          />
        </g>
      );

    case "exit":
      return (
        <g>
          {/* Arrow pointing out */}
          <circle
            cx={x}
            cy={y}
            r={s}
            fill={color}
            stroke="#0f172a"
            strokeWidth={1}
            opacity={0.9}
          />
          <path
            d={`M ${x - s * 0.4} ${y} L ${x + s * 0.3} ${y} M ${x + s * 0.05} ${y - s * 0.3} L ${x + s * 0.35} ${y} L ${x + s * 0.05} ${y + s * 0.3}`}
            fill="none"
            stroke="#fff"
            strokeWidth={1.3}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
          />
        </g>
      );

    case "concourse":
    case "junction":
    default:
      return (
        <circle
          cx={x}
          cy={y}
          r={s * 0.5}
          fill={color}
          stroke="#0f172a"
          strokeWidth={0.8}
          opacity={0.6}
        />
      );
  }
}
