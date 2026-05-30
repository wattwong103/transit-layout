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
  const s = isIsometric ? size * 0.7 : size;

  switch (type) {
    case "platform":
      return (
        <g>
          <rect
            x={x - s * 1.2}
            y={y - s * 0.5}
            width={s * 2.4}
            height={s}
            rx={s * 0.25}
            fill={color}
            stroke="#0d1117"
            strokeWidth={1.5}
            opacity={0.9}
          />
          <line
            x1={x - s * 0.6}
            y1={y}
            x2={x + s * 0.6}
            y2={y}
            stroke="#fff"
            strokeWidth={2}
            strokeOpacity={0.5}
            strokeLinecap="round"
          />
        </g>
      );

    case "ticket_gate":
      return (
        <g>
          <rect
            x={x - s}
            y={y - s * 0.7}
            width={s * 2}
            height={s * 1.4}
            rx={s * 0.2}
            fill={color}
            stroke="#0d1117"
            strokeWidth={1.5}
            opacity={0.9}
          />
          {/* Turnstile bars with gap */}
          <line x1={x - s * 0.5} y1={y - s * 0.4} x2={x - s * 0.5} y2={y + s * 0.4} stroke="#0d1117" strokeWidth={2} strokeLinecap="round" />
          <line x1={x + s * 0.5} y1={y - s * 0.4} x2={x + s * 0.5} y2={y + s * 0.4} stroke="#0d1117" strokeWidth={2} strokeLinecap="round" />
          {/* Gap indicator */}
          <line x1={x - s * 0.2} y1={y} x2={x + s * 0.2} y2={y} stroke="#fff" strokeWidth={1.5} strokeOpacity={0.6} strokeLinecap="round" />
        </g>
      );

    case "escalator":
      return (
        <g>
          {/* Background rounded rect */}
          <rect
            x={x - s}
            y={y - s}
            width={s * 2}
            height={s * 2}
            rx={s * 0.25}
            fill={color}
            stroke="#0d1117"
            strokeWidth={1.5}
            opacity={0.9}
          />
          {/* Diagonal steps */}
          <path
            d={`M ${x - s * 0.6} ${y + s * 0.5} L ${x - s * 0.2} ${y + s * 0.5} L ${x - s * 0.2} ${y + s * 0.1} L ${x + s * 0.2} ${y + s * 0.1} L ${x + s * 0.2} ${y - s * 0.3} L ${x + s * 0.6} ${y - s * 0.3}`}
            fill="none"
            stroke="#fff"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
          {/* Person figure */}
          <circle cx={x + s * 0.15} cy={y - s * 0.55} r={s * 0.15} fill="#fff" opacity={0.8} />
          <line x1={x + s * 0.15} y1={y - s * 0.4} x2={x + s * 0.15} y2={y - s * 0.1} stroke="#fff" strokeWidth={1.5} opacity={0.8} />
        </g>
      );

    case "stairs":
      return (
        <g>
          <rect
            x={x - s}
            y={y - s}
            width={s * 2}
            height={s * 2}
            rx={s * 0.25}
            fill={color}
            stroke="#0d1117"
            strokeWidth={1.5}
            opacity={0.9}
          />
          {/* Right-angle steps */}
          <path
            d={`M ${x - s * 0.6} ${y + s * 0.6} L ${x - s * 0.25} ${y + s * 0.6} L ${x - s * 0.25} ${y + s * 0.2} L ${x + s * 0.1} ${y + s * 0.2} L ${x + s * 0.1} ${y - s * 0.2} L ${x + s * 0.45} ${y - s * 0.2} L ${x + s * 0.45} ${y - s * 0.6}`}
            fill="none"
            stroke="#fff"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
        </g>
      );

    case "elevator":
      return (
        <g>
          <rect
            x={x - s}
            y={y - s}
            width={s * 2}
            height={s * 2}
            rx={s * 0.25}
            fill={color}
            stroke="#0d1117"
            strokeWidth={1.5}
            opacity={0.9}
          />
          {/* Up arrow */}
          <path
            d={`M ${x - s * 0.3} ${y - s * 0.1} L ${x} ${y - s * 0.55} L ${x + s * 0.3} ${y - s * 0.1}`}
            fill="none"
            stroke="#fff"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
          {/* Down arrow */}
          <path
            d={`M ${x - s * 0.3} ${y + s * 0.1} L ${x} ${y + s * 0.55} L ${x + s * 0.3} ${y + s * 0.1}`}
            fill="none"
            stroke="#fff"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
        </g>
      );

    case "exit":
      return (
        <g>
          {/* Green rounded rect background */}
          <rect
            x={x - s * 1.1}
            y={y - s * 0.8}
            width={s * 2.2}
            height={s * 1.6}
            rx={s * 0.25}
            fill={color}
            stroke="#0d1117"
            strokeWidth={1.5}
            opacity={0.9}
          />
          {/* Running person silhouette */}
          <circle cx={x - s * 0.25} cy={y - s * 0.4} r={s * 0.15} fill="#fff" opacity={0.9} />
          <path
            d={`M ${x - s * 0.25} ${y - s * 0.25} L ${x - s * 0.25} ${y + s * 0.1} M ${x - s * 0.55} ${y + s * 0.05} L ${x - s * 0.25} ${y - s * 0.05} L ${x} ${y + s * 0.05} M ${x - s * 0.45} ${y + s * 0.4} L ${x - s * 0.25} ${y + s * 0.1} L ${x - s * 0.05} ${y + s * 0.4}`}
            fill="none"
            stroke="#fff"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
          />
          {/* Arrow pointing out */}
          <path
            d={`M ${x + s * 0.2} ${y} L ${x + s * 0.65} ${y} M ${x + s * 0.45} ${y - s * 0.2} L ${x + s * 0.65} ${y} L ${x + s * 0.45} ${y + s * 0.2}`}
            fill="none"
            stroke="#fff"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
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
          stroke="#0d1117"
          strokeWidth={0.8}
          opacity={0.5}
        />
      );
  }
}
