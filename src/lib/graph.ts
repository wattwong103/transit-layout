import { StationEdge } from "@/types/station";

export interface Graph {
  adjacency: Map<string, { to: string; edge: StationEdge }[]>;
}

export function buildGraph(edges: StationEdge[]): Graph {
  const adjacency = new Map<string, { to: string; edge: StationEdge }[]>();

  for (const edge of edges) {
    // Add forward direction
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    adjacency.get(edge.from)!.push({ to: edge.to, edge });

    // Add reverse direction for bidirectional edges
    if (edge.bidirectional) {
      if (!adjacency.has(edge.to)) adjacency.set(edge.to, []);
      adjacency.get(edge.to)!.push({ to: edge.from, edge });
    }
  }

  return { adjacency };
}
