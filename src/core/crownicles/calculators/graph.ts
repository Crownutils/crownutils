import type { CrowniclesMapLink } from '../data/map.js';

/** A weighted neighbour in a map adjacency list. */
export interface Neighbour {
  to: number;
  weight: number;
}

/**
 * Builds an undirected adjacency list from bidirectional map links: every link
 * is added in both directions, weighted by its trip duration.
 */
export function buildAdjacency(
  edges: readonly CrowniclesMapLink[],
): Map<number, Neighbour[]> {
  const adjacency = new Map<number, Neighbour[]>();
  const link = (from: number, to: number, weight: number): void => {
    const neighbours = adjacency.get(from) ?? [];
    neighbours.push({ to, weight });
    adjacency.set(from, neighbours);
  };
  for (const edge of edges) {
    link(edge.startMap, edge.endMap, edge.tripDurationMin);
    link(edge.endMap, edge.startMap, edge.tripDurationMin);
  }
  return adjacency;
}
